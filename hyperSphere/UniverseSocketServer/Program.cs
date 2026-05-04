using System.Net.WebSockets;

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

app.Map("/ws", async (HttpContext context) => {
    if (context.WebSockets.IsWebSocketRequest)
    {
        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
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
        }
    }
    else
    {
        context.Response.StatusCode = StatusCodes.Status400BadRequest;
    }
});

app.Run();