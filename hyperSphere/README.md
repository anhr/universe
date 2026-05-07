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
    *   Download the [**Hosting Bundle**](#guide-installing-and-verifying-net-core-hosting-bundle) for that specific version.
    *   **Verification**: Open **IIS Manager**, select your Server, and open **Modules**. Ensure **AspNetCoreModuleV2** is present.

### 3. Deploying to IIS
*   Go to Visual Sudio and open [UniverseSocketServer](UniverseSocketServer/UniverseSocketServer.csproj) project.
*   **Publishing**: Do not copy files manually from `bin/Debug`. Go to **Solution Explorer** then Right-click the **UniverseSocketServer > Publish > Folder**. This generates the required `UniverseSocketServer/bin/Release/net8.0/publish/web.config` file.
*   **Web.config Check**: Ensure the generated file contains `hostingModel="inprocess"`. This is required for stable WebSocket connections in IIS.
*   **Permissions**: [Granting `UniverseSocketServer' Folder Permissions](#2-granting-universesocketserver-folder-permissions).

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
Use this code on your web page to start receiving hypersphere data:

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

---

## Guide: Installing and Verifying .NET Core Hosting Bundle


This is a crucial part of the setup. If the **Hosting Bundle** is missing or mismatched, IIS will simply return a **500.19 Error** because it doesn't know how to talk to .NET.

Here is the professional guide in English for your documentation.

The **.NET Core Hosting Bundle** is a collection of components required to run ASP.NET Core applications (like your **Hypersphere Universe Engine**) behind IIS. It includes the .NET Runtime and the **ASP.NET Core Module (ANCM)**.

### 1. When to Install the Hosting Bundle?
You must install or update the Hosting Bundle in the following scenarios:
* **Fresh Setup**: When setting up a new Windows Server or Windows 11 machine for IIS hosting.
* **Version Upgrade**: If you upgrade your project (e.g., moving from **.NET 6** to **.NET 8**).
* **HTTP Error 500.19**: If your website fails to start and logs indicate that the "AspNetCoreModuleV2" is missing.

---

### 2. How to Identify the Required Version
Before downloading, you must check which version of .NET your project uses:
1.  Open your project in **Visual Studio**.
2.  Right-click your project name and select **Edit Project File**.
3.  Look for the `<TargetFramework>` tag:
    * `<TargetFramework>net8.0</TargetFramework>` $\rightarrow$ You need **Hosting Bundle 8.0**.
    * `<TargetFramework>net6.0</TargetFramework>` $\rightarrow$ You need **Hosting Bundle 6.0**.

---

### 3. Installation Steps
1.  **Download**: Go to the [official .NET download page](https://dotnet.microsoft.com/download/dotnet). 
2.  **Select Version**: Click on the version that matches your project (e.g., .NET 8.0).
3.  **Find the Bundle**: Look for the **Windows** column and find the link labeled **Hosting Bundle**.
4.  **Run Installer**: Execute the `.exe` file on the server machine.
5.  **Restart IIS**: This is mandatory to register the new module. Open **PowerShell as Administrator** and run:
    ```powershell
    iisreset
    ```

---

### 4. Verification (How to check if it's working)
After installation, you should verify that IIS has successfully loaded the module.

#### **Method A: Check IIS Modules**
1.  Open **IIS Manager** (`inetmgr`).
2.  Click on your **Server Name** in the left connections tree.
3.  In the center pane, double-click on **Modules**.
4.  Look for **AspNetCoreModuleV2**. If it is in the list, the installation was successful.

#### **Method B: Check Installed Programs**
1.  Go to **Control Panel > Programs and Features**.
2.  Search for **Microsoft .NET Core [Version] - Windows Server Hosting**.

---

### 5. Troubleshooting: "The Module is installed but it still fails"
If **AspNetCoreModuleV2** is present but you still get errors:
* **Architecture Mismatch**: Ensure you installed the "Hosting Bundle" which includes both x86 and x64 components.
* **App Pool Settings**: Ensure your **Application Pool** for the site is set to **No Managed Code**.
* **Repair**: If you installed .NET *before* enabling the IIS role in Windows Features, the module might not register correctly. Run the Hosting Bundle installer again and select **Repair**.

---

> **Peer Note:** Always remember that the version on the server must be **equal to or higher** than the version used to compile your project. You can have multiple Hosting Bundles (6.0, 7.0, and 8.0) installed side-by-side without any issues.


Setting up file system permissions is often the "hidden" reason why a perfectly coded site fails to load with a **403 Forbidden** or **500.19** error. When running under IIS, the "user" trying to read your files isn't you—it's a special virtual identity created for your Application Pool.

Here is a detailed, professional guide on how to configure these permissions correctly.

---

## Guide: Configuring File System Permissions for IIS

To allow IIS to host your **Hypersphere Universe Engine**, you must grant the Application Pool identity permission to access the physical folder where your published files reside.

### 1. Identify your Application Pool Identity
Before granting permissions, you need to know the exact name of the identity:
1.  Open **IIS Manager**.
2.  Click on **Application Pools** in the left-hand connections tree.
3.  Note the **UniverseSocketServer** of the pool assigned to your website.

### 2. Granting UniverseSocketServer Folder Permissions
Follow these steps to grant the necessary access:

1.  **Open Folder Properties**: Navigate to the `UniverseSocketServer` folder where you published your project. Right-click the folder and select **Edit Permissions...**.
2.  **Security Tab**: Go to the **Security** tab and click the **Edit...** button.
3.  **Add New User**: Click **Add...**.
4.  **Enter Identity Name**: 
    * Ensure the **From this location** field is set to your **local computer name** (not a network domain).
    * In the text box, type: `IIS AppPool\UniverseSocketServer`.
5.  **Check Names**: Click the **Check Names** button. 
    * *Note: The name will not be underlined like a normal user, but it should be accepted if typed correctly.*
6.  **Assign Rights**: Click **OK**. In the permissions list, ensure the following are checked:
    * **Read & execute**
    * **List folder contents**
    * **Read**
7.  **Apply**: Click **OK** on all windows.

### 3. Why this is necessary
By default, Windows folders are private to the user who created them. When IIS attempts to run your `web.config` or load your `.dll` files:
* It uses the **Application Pool Identity**.
* Without **Read & Execute** rights, IIS cannot start the process, resulting in an **Access Denied** error.
* The **Execute** right is specifically required for ASP.NET Core because IIS needs to launch the `dotnet` process to run your server logic.

### 4. Verification
To verify the permissions are working:
1.  Go to **IIS Manager**.
2.  Select your **UniverseSocketServer**.
3.  On the right-side **Actions** pane, click **Basic Settings...**.
4.  Click the **Test Settings...** button.
5.  If you see a green checkmark for **Authentication** and **Authorization**, IIS can successfully access the path.

---

> **Expert Tip:** Avoid the temptation to grant permissions to "Everyone." While it might solve the connection issue, it creates a significant security risk. Always use the specific `IIS AppPool\Name` identity to maintain a secure, isolated environment for your 4D engine.