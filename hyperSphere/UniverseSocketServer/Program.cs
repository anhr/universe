using System.Net.Sockets;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Enable WebSocket middleware
var webSocketOptions = new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromMinutes(2)
};
app.UseWebSockets(webSocketOptions);

// List to track active connections (Client and Engine)
var connections = new List<WebSocket>();

// Статические переменные для хранения активных сокетов
WebSocket? mainPageSocket = null;
WebSocket? gpuEngineSocket = null;

app.Map("/ws", async (HttpContext context) => {
    if (context.WebSockets.IsWebSocketRequest)
    {
        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();

        // Читаем тип клиента (можно передать через query string: /ws?type=main)
        var clientType = context.Request.Query["type"];

        if (clientType == "main")
        {
            if (mainPageSocket != null && mainPageSocket.State == WebSocketState.Open)
            {
                await webSocket.CloseAsync((WebSocketCloseStatus)4001, "Main Page already connected", CancellationToken.None);
                return;
            }
            mainPageSocket = webSocket;

            // Проверяем готовность Engine
            if (gpuEngineSocket == null || gpuEngineSocket.State != WebSocketState.Open)
            {
                await SendStatus(webSocket, 2, "");//Waiting for Hypersphere Universe Engine...
            }
            else
            {
                await SendStatus(webSocket, 1, "Ready to work.");
            }
        }
        else if (clientType == "gpu")
        {
            if (gpuEngineSocket != null && gpuEngineSocket.State == WebSocketState.Open)
            {
                await webSocket.CloseAsync((WebSocketCloseStatus)4001, "Hypersphere Universe Engine already connected", CancellationToken.None);
                return;
            }
            gpuEngineSocket = webSocket;

            // Уведомляем главную страницу, что Engine подключен
            if (mainPageSocket != null && mainPageSocket.State == WebSocketState.Open)
            {
                await SendStatus(mainPageSocket, 1, "Ready to work.");
            }
        }

        connections.Add(webSocket);

        var buffer = new byte[1024 * 4]; // 4KB buffer
        try
        {
            while (webSocket.State == WebSocketState.Open)
            {
                // Receive data (Binary or Text)
                var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                if (result.MessageType == WebSocketMessageType.Close)
                {
                    break;
                }

                // Broadcast received data to all OTHER connected clients
                var message = new ArraySegment<byte>(buffer, 0, result.Count);
                foreach (var client in connections.Where(c => c != webSocket && c.State == WebSocketState.Open))
                {
                    await client.SendAsync(message, result.MessageType, result.EndOfMessage, CancellationToken.None);
                }
            }
        }
        finally
        {
            connections.Remove(webSocket);
            if (webSocket == mainPageSocket)
            {
                mainPageSocket = null;
                if (gpuEngineSocket != null && gpuEngineSocket.State == WebSocketState.Open)
                {
                    //Уведомляем Hupersphere Universe Engine что главная страница отключена. Это позволяет остановить вычисления
                    var data = JsonSerializer.Serialize(new { type = "MAIN_DISCONNECTED" });
                    await gpuEngineSocket.SendAsync(new ArraySegment<byte>(Encoding.UTF8.GetBytes(data)), WebSocketMessageType.Text, true, CancellationToken.None);
                }
            }
            if (webSocket == gpuEngineSocket)
            {
                gpuEngineSocket = null;
                if (mainPageSocket != null) await SendStatus(mainPageSocket, 0, "Engine disconnected. Waiting...");
            }
        }
    }
    else
    {
        context.Response.StatusCode = StatusCodes.Status400BadRequest;
    }
});
async Task SendStatus(WebSocket socket, int code, string message)
{
    //code description
    //0    error
    //1    Ready to work.
    //2    Waiting for Hypersphere Universe Engine...
    if (socket.State == WebSocketState.Open)
    {
        var data = JsonSerializer.Serialize(new { type = "STATUS", code, message = $"Connection established. {message}" });
        var buffer = Encoding.UTF8.GetBytes(data);
        await socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
    }
}

app.Run();