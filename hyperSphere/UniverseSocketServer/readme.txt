Deploying to IIS
Stop UniverseSocketServer site in IIS.
Go to Visual Sudio and open UniverseSocketServer project.
Publishing: Do not copy files manually from bin/Debug.
	Go to Solution Explorer then Right-click the UniverseSocketServer folder or UniverseSocketServer/UniverseSocketServer.csproj file and choice Publish > Folder.
	This generates the required UniverseSocketServer/bin/Release/net8.0/publish/web.config file.
		Note: Sometimes Publish menu item is not available.
			Please right-click the UniverseSocketServer folder or UniverseSocketServer/UniverseSocketServer.csproj file and choice Open in Terminal menu item.
			Developer PowerShell window opens. Type dotnet publish -c Release or dotnet publish -c Debug
Web.config Check: Ensure the generated file contains hostingModel="inprocess". This is required for stable WebSocket connections in IIS.
Permissions: Configuring File System Permissions for IIS.
Start UniverseSocketServer site in IIS again.

Read D:\My documents\MyProjects\webgl\three.js\GitHub\universe\main\hyperSphere\HUniverseEngine.md  for details.
