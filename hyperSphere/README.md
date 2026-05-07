# Hypersphere Universe Engine

When you click the ► player button located in the lower left corner of the canvas, you start an iterative process of calculating the coordinates of points in the universe over time. You have two iteration options:

1. CPU calculations. These calculations take a long time.
2. GPU calculations. These calculations are performed tens of times faster than on the CPU.

Below is a guide on how to use the GPU for iteration.

## Technical Guide: Enabling High-Performance GPU for Google Chrome

If you notice that your WebGPU computations are running slower in Google Chrome compared to other browsers, it is likely because Windows is running Chrome on the integrated (Power Saving) GPU instead of your dedicated (High Performance) Graphics Card.

Follow these steps to force Google Chrome to use your high-performance GPU:

Step 1: Open Graphics Settings
Press the Windows Key on your keyboard or click the Start icon.

Type "Graphics settings" in the search bar and press Enter.

This will open the System > Display > Graphics menu.

Step 2: Locate or Add Google Chrome
Scroll down to the "Custom options for apps" section.

Look for Google Chrome in the list.

If Chrome is NOT in the list:

Click the "Browse" button under "Add an app".

Navigate to the following path (copy and paste this into the address bar of the file picker):
C:\Program Files\Google\Chrome\Application\

Select chrome.exe and click Add.

Step 3: Set High Performance Preference
Once Google Chrome appears in the list, click on it once to expand the options.

Click the "Options" button.

A "Graphics preference" window will pop up. Select "High performance" (this should list your dedicated GPU, e.g., NVIDIA or AMD).

Click "Save".

Step 4: Restart Chrome
Close all open Google Chrome windows.

Relaunch the browser for the changes to take effect.

You can verify the active GPU by typing chrome://gpu in the address bar and looking for the "GL_RENDERER" field.

---

## Complete Guide: Setting Up WebSocket Server for Hypersphere Universe Engine

This guide ensures a successful connection between your Hypersphere Universe frontend and the C# backend using **ASP.NET Core** and **IIS**.

### 1. System Requirements & Environment Setup
To host an ASP.NET Core Web API with WebSockets, you must prepare the Windows environment.

*   **Enable IIS and Development Features**:
    1.  Press `Win + R`, type `optionalfeatures`, and press **Enter**.
    2.  Navigate to: **Internet Information Services** > **World Wide Web Services** > **Application Development Features**.
    3.  **CRITICAL**: Check **WebSocket Protocol**.
    4.  **CRITICAL**: Check **.NET Extensibility 4.8** (or the latest version) and **ASP.NET 4.8**. This ensures IIS can interface with modern web frameworks.
*   **Install .NET Core Hosting Bundle (Includes ASP.NET Core Runtime)**:
    *   This is the "bridge" between IIS and your code.
    *   Identify your project version (e.g., **.NET 8.0**) in the [UniverseSocketServer.csproj](UniverseSocketServer/UniverseSocketServer.csproj) file.
    *   Download the **Hosting Bundle** for that specific version.
    *   **Verification**: Open **IIS Manager**, select your Server, and open **Modules**. Ensure **AspNetCoreModuleV2** is present.

---

### 2. Server-Side Implementation (Program.cs)
The order of middleware is essential for routing `/ws` correctly.

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// 1. Enable WebSockets first
app.UseWebSockets(); 

// 2. Map the route
app.Map("/ws", async (context) => {
    if (context.WebSockets.IsWebSocketRequest) {
        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        await HandleCommunication(webSocket); // Your 4D logic here
    } else {
        context.Response.StatusCode = StatusCodes.Status400BadRequest;
    }
});

app.Run();
```

---

### 3. Deploying to IIS
*   **Publishing**: Do not copy files manually from `bin/Debug`. Use **Right-click Project > Publish > Folder**. This generates the required `web.config` file.
*   **Web.config Check**: Ensure the generated file contains `hostingModel="inprocess"`. This is required for stable WebSocket connections in IIS.
*   **Permissions**: Grant **Read & Execute** rights for the site folder to the `IIS AppPool\YourPoolName` user.

---

### 4. Debugging & Verification
*   **The 500.19 Error**: If you see this in your logs (`C:\inetpub\logs\LogFiles\W3SVC2`), your `web.config` is invalid or the **Hosting Bundle** is missing/mismatched.
*   **Step-by-Step Debugging**: 
    1.  In Visual Studio, set a **Breakpoint** on `app.Map("/ws", ...)`.
    2.  Change the Debug profile to **Project Name** (Console Mode) instead of IIS Express.
    3.  Press **F5**. If the console says `Now listening on: http://localhost:5000`, the server is alive.
*   **Manual Test**: Use `curl.exe` in PowerShell:
    `curl.exe -i -N -H "Upgrade: websocket" -H "Connection: Upgrade" http://localhost:5000/ws`.

---

### 5. Client-Side Connection
Use this code on your main web page to start receiving hypersphere data:

```javascript
const serverAddress = 'ws://localhost:5000/ws'; // Port must match IIS Binding
const socket = new WebSocket(serverAddress);

// Important: 4D coordinates are sent as binary data
socket.binaryType = 'arraybuffer';

socket.onopen = () => console.log("averageUniverse: Connection established.");
socket.onmessage = (event) => {
    // Logic to update your 3-sphere visualization
};
socket.onerror = (e) => console.error("Connection failed. Check IIS status or Hosting Bundle.");
```

---

### Summary Checklist:
1.  **Windows Features**: WebSocket Protocol and .NET Extensibility enabled.
2.  **Hosting Bundle**: Installed and verified in IIS Modules.
3.  **Port**: 5000 is open and not blocked by other apps.
4.  **Route**: `/ws` is consistent in both C# and JS.
