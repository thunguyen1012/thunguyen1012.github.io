---
title: Servers - IIS - Errors reference
published: true
date: 2024-09-11 03:28:00
tags: Summary, AspNetCore
description: 
image:
---

## In this article

 - Browser behavior such as status code and error message.

 - Application Event Log entries

   - Azure App Service: See Troubleshoot ASP.NET Core on Azure App Service and IIS.

   - IIS

Select Start on the Windows menu, type Event Viewer, and press Enter.
After the Event Viewer opens, expand Windows Logs > Application in the sidebar.

     - Select Start on the Windows menu, type Event Viewer, and press Enter.

     - After the Event Viewer opens, expand Windows Logs > Application in the sidebar.

 - ASP.NET Core Module stdout and debug log entries

   - Azure App Service: See Troubleshoot ASP.NET Core on Azure App Service and IIS.

   - IIS: Follow the instructions in the Log creation and redirection and Enhanced diagnostic logs sections of the ASP.NET Core Module topic.

> Important
ASP.NET Core preview releases with Azure App Service
ASP.NET Core preview releases aren't deployed to Azure App Service by default. To host an app that uses an ASP.NET Core preview release, see Deploy ASP.NET Core preview release to Azure App Service.

## OS upgrade removed the 32-bit ASP.NET Core Module

## Missing site extension, 32-bit (x86) and 64-bit (x64) site extensions installed, or wrong process bitness set

 - Browser: HTTP Error 500.0 - ANCM In-Process Handler Load Failure

 - Application Log: Invoking hostfxr to find the inprocess request handler failed without finding any native dependencies. Could not find inprocess request handler. Captured output from invoking hostfxr: It was not possible to find any compatible framework version. The specified framework 'Microsoft.AspNetCore.App', version '{VERSION}-preview-*' was not found. Failed to start application '/LM/W3SVC/1416782824/ROOT', ErrorCode '0x8000ffff'.

 - ASP.NET Core Module stdout Log: It was not possible to find any compatible framework version. The specified framework 'Microsoft.AspNetCore.App', version '{VERSION}-preview-*' was not found.

 - ASP.NET Core Module Debug Log: Invoking hostfxr to find the inprocess request handler failed without finding any native dependencies. This most likely means the app is misconfigured, please check the versions of Microsoft.NetCore.App and Microsoft.AspNetCore.App that are targeted by the application and are installed on the machine. Failed HRESULT returned: 0x8000ffff. Could not find inprocess request handler. It was not possible to find any compatible framework version. The specified framework 'Microsoft.AspNetCore.App', version '{VERSION}-preview-*' was not found.

 - If running the app on a preview runtime, install either the 32-bit (x86) or 64-bit (x64) site extension that matches the bitness of the app and the app's runtime version. Don't install both extensions or multiple runtime versions of the extension.

Restart the app. Wait several seconds for the app to restart.

   - ASP.NET Core {RUNTIME VERSION} (x86) Runtime

   - ASP.NET Core {RUNTIME VERSION} (x64) Runtime

 - If running the app on a preview runtime and both the 32-bit (x86) and 64-bit (x64) site extensions are installed, uninstall the site extension that doesn't match the bitness of the app. After removing the site extension, restart the app. Wait several seconds for the app to restart.

 - If running the app on a preview runtime and the site extension's bitness matches that of the app, confirm that the preview site extension's runtime version matches the app's runtime version.

 - Confirm that the app's Platform in Application Settings matches the bitness of the app.

## An x86 app is deployed but the app pool isn't enabled for 32-bit apps

 - Browser: HTTP Error 500.30 - ANCM In-Process Start Failure

 - Application Log: Application '/LM/W3SVC/5/ROOT' with physical root '{PATH}' hit unexpected managed exception, exception code = '0xe0434352'. Please check the stderr logs for more information. Application '/LM/W3SVC/5/ROOT' with physical root '{PATH}' failed to load clr and managed application. CLR worker thread exited prematurely

 - ASP.NET Core Module stdout Log: The log file is created but empty.

 - ASP.NET Core Module Debug Log: Failed HRESULT returned: 0x8007023e

## Platform conflicts with RID

 - Browser: HTTP Error 502.5 - Process Failure

 - Application Log: Application 'MACHINE/WEBROOT/APPHOST/{ASSEMBLY}' with physical root 'C:{PATH}' failed to start process with commandline '"C:{PATH}{ASSEMBLY}.{exe|dll}" ', ErrorCode = '0x80004005 : ff.

 - ASP.NET Core Module stdout Log: Unhandled Exception: ```System.BadImageFormatException```: Could not load file or assembly '{ASSEMBLY}.dll'. An attempt was made to load a program with an incorrect format.

 - Confirm that the app runs locally on Kestrel. A process failure might be the result of a problem within the app. For more information, see Troubleshoot ASP.NET Core on Azure App Service and IIS.

 - If this exception occurs for an Azure Apps deployment when upgrading an app and deploying newer assemblies, manually delete all files from the prior deployment. Lingering incompatible assemblies can result in a ```System.BadImageFormatException``` exception when deploying an upgraded app.

## URI endpoint wrong or stopped website

 - Browser: ERR_CONNECTION_REFUSED --OR-- Unable to connect

 - Application Log: No entry

 - ASP.NET Core Module stdout Log: The log file isn't created.

 - ASP.NET Core Module Debug Log: The log file isn't created.

 - Confirm the correct URI endpoint for the app is in use. Check the bindings.

 - Confirm that the IIS website isn't in the Stopped state.

## CoreWebEngine or W3SVC server features disabled

## Incorrect website physical path or app missing

 - Browser: 403 Forbidden - Access is denied --OR-- 403.14 Forbidden - The Web server is configured to not list the contents of this directory.

 - Application Log: No entry

 - ASP.NET Core Module stdout Log: The log file isn't created.

 - ASP.NET Core Module Debug Log: The log file isn't created.

## Incorrect role, ASP.NET Core Module not installed, or incorrect permissions

 - Browser: 500.19 Internal Server Error - The requested page cannot be accessed because the related configuration data for the page is invalid. --OR-- This page can't be displayed

 - Application Log: No entry

 - ASP.NET Core Module stdout Log: The log file isn't created.

 - ASP.NET Core Module Debug Log: The log file isn't created.

 - Confirm that the proper role is enabled. See IIS Configuration.

 - Open Programs & Features or Apps & features and confirm that Windows Server Hosting is installed. If Windows Server Hosting isn't present in the list of installed programs, download and install the .NET Core Hosting Bundle.
Current .NET Core Hosting Bundle installer (direct download)
For more information, see Install the .NET Core Hosting Bundle.

 - Make sure that the Application Pool > Process Model > Identity is set to ApplicationPoolIdentity or the custom identity has the correct permissions to access the app's deployment folder.

 - If you uninstalled the ASP.NET Core Hosting Bundle and installed an earlier version of the hosting bundle, the applicationHost.config file doesn't include a section for the ASP.NET Core Module. Open applicationHost.config at %windir%/System32/inetsrv/config and find the <configuration><configSections><sectionGroup name="system.webServer"> section group. If the section for the ASP.NET Core Module is missing from the section group, add the section element:
<section name="aspNetCore" overrideModeDefault="Allow" />

Alternatively, install the latest version of the ASP.NET Core Hosting Bundle. The latest version is backwards-compatible with supported ASP.NET Core apps.

```xml
<section name="aspNetCore" overrideModeDefault="Allow" />
```

## Incorrect processPath, missing PATH variable, Hosting Bundle not installed, system/IIS not restarted, VC++ Redistributable not installed, or ```dotnet```.exe access violation

 - Browser: HTTP Error 500.0 - ANCM In-Process Handler Load Failure

 - Application Log: Application 'MACHINE/WEBROOT/APPHOST/{ASSEMBLY}' with physical root 'C:{PATH}' failed to start process with commandline '"{...}" ', ErrorCode = '0x80070002 : 0. Application '{PATH}' wasn't able to start. Executable was not found at '{PATH}'. Failed to start application '/LM/W3SVC/2/ROOT', ErrorCode '0x8007023e'.

 - ASP.NET Core Module stdout Log: The log file isn't created.

 - ASP.NET Core Module Debug Log: Event Log: 'Application '{PATH}' wasn't able to start. Executable was not found at '{PATH}'. Failed HRESULT returned: 0x8007023e

 - Confirm that the app runs locally on Kestrel. A process failure might be the result of a problem within the app. For more information, see Troubleshoot ASP.NET Core on Azure App Service and IIS.

 - Check the processPath attribute on the <aspNetCore> element in web.config to confirm that it's ```dotnet``` for a framework-dependent deployment (FDD) or ```.\{ASSEMBLY}.exe``` for a self-contained deployment (SCD).

 - For an FDD, ```dotnet```.exe might not be accessible via the PATH settings. Confirm that C:\Program Files\dotnet\ exists in the System PATH settings.

 - For an FDD, ```dotnet```.exe might not be accessible for the user identity of the app pool. Confirm that the app pool user identity has access to the C:\Program Files\dotnet directory. Confirm that there are no deny rules configured for the app pool user identity on the C:\Program Files\dotnet and app directories.

 - An FDD may have been deployed and .NET Core installed without restarting IIS. Either restart the server or restart IIS by executing net stop was /y followed by net start w3svc from a command prompt.

 - An FDD may have been deployed without installing the .NET Core runtime on the hosting system. If the .NET Core runtime hasn't been installed, run the .NET Core Hosting Bundle installer on the system.
Current .NET Core Hosting Bundle installer (direct download)
For more information, see Install the .NET Core Hosting Bundle.
If a specific runtime is required, download the runtime from the .NET Downloads page and install it on the system. Complete the installation by restarting the system or restarting IIS by executing net stop was /y followed by net start w3svc from a command prompt.

## Incorrect arguments of <aspNetCore> element

 - Browser: HTTP Error 500.0 - ANCM In-Process Handler Load Failure

 - Application Log: Invoking hostfxr to find the inprocess request handler failed without finding any native dependencies. This most likely means the app is misconfigured, please check the versions of Microsoft.NetCore.App and Microsoft.AspNetCore.App that are targeted by the application and are installed on the machine. Could not find inprocess request handler. Captured output from invoking hostfxr: Did you mean to run ```dotnet``` SDK commands? Please install ```dotnet``` SDK from: https://go.microsoft.com/fwlink/?LinkID=798306&clcid=0x409 Failed to start application '/LM/W3SVC/3/ROOT', ErrorCode '0x8000ffff'.

 - ASP.NET Core Module stdout Log: Did you mean to run ```dotnet``` SDK commands? Please install ```dotnet``` SDK from: https://go.microsoft.com/fwlink/?LinkID=798306&clcid=0x409

 - ASP.NET Core Module Debug Log: Invoking hostfxr to find the inprocess request handler failed without finding any native dependencies. This most likely means the app is misconfigured, please check the versions of Microsoft.NetCore.App and Microsoft.AspNetCore.App that are targeted by the application and are installed on the machine. Failed HRESULT returned: 0x8000ffff Could not find inprocess request handler. Captured output from invoking hostfxr: Did you mean to run ```dotnet``` SDK commands? Please install ```dotnet``` SDK from: https://go.microsoft.com/fwlink/?LinkID=798306&clcid=0x409 Failed HRESULT returned: 0x8000ffff

 - Confirm that the app runs locally on Kestrel. A process failure might be the result of a problem within the app. For more information, see Troubleshoot ASP.NET Core on Azure App Service and IIS.

 - Examine the arguments attribute on the <aspNetCore> element in web.config to confirm that it's either (a) ```.\{ASSEMBLY}.dll``` for a framework-dependent deployment (FDD); or (b) not present, an empty string (arguments=""), or a list of the app's arguments (arguments="{ARGUMENT_1}, {ARGUMENT_2}, ... {ARGUMENT_X}") for a self-contained deployment (SCD).

## Missing .NET Core shared framework

 - Browser: HTTP Error 500.0 - ANCM In-Process Handler Load Failure

 - Application Log: Invoking hostfxr to find the inprocess request handler failed without finding any native dependencies. This most likely means the app is misconfigured, please check the versions of Microsoft.NetCore.App and Microsoft.AspNetCore.App that are targeted by the application and are installed on the machine. Could not find inprocess request handler. Captured output from invoking hostfxr: It was not possible to find any compatible framework version. The specified framework 'Microsoft.AspNetCore.App', version '{VERSION}' was not found.

 - ASP.NET Core Module stdout Log: It was not possible to find any compatible framework version. The specified framework 'Microsoft.AspNetCore.App', version '{VERSION}' was not found.

 - ASP.NET Core Module Debug Log: Failed HRESULT returned: 0x8000ffff

## Stopped Application Pool

 - Browser: 503 Service Unavailable

 - Application Log: No entry

 - ASP.NET Core Module stdout Log: The log file isn't created.

 - ASP.NET Core Module Debug Log: The log file isn't created.

## Sub-application includes a <handlers> section

 - Browser: HTTP Error 500.19 - Internal Server Error

 - Application Log: No entry

 - ASP.NET Core Module stdout Log: The root app's log file is created and shows normal operation. The sub-app's log file isn't created.

 - ASP.NET Core Module Debug Log: The root app's log file is created and shows normal operation. The sub-app's log file isn't created.

## stdout log path incorrect

 - Browser: The app responds normally.

 - Application Log: Could not start stdout redirection in C:\Program Files\IIS\Asp.Net Core Module\V2\aspnetcorev2.dll. Exception message: HRESULT 0x80070005 returned at {PATH}\aspnetcoremodulev2\commonlib\fileoutputmanager.cpp:84. Could not stop stdout redirection in C:\Program Files\IIS\Asp.Net Core Module\V2\aspnetcorev2.dll. Exception message: HRESULT 0x80070002 returned at {PATH}. Could not start stdout redirection in {PATH}\aspnetcorev2_inprocess.dll.

 - ASP.NET Core Module stdout Log: The log file isn't created.

 - ASP.NET Core Module debug Log: Could not start stdout redirection in C:\Program Files\IIS\Asp.Net Core Module\V2\aspnetcorev2.dll. Exception message: HRESULT 0x80070005 returned at {PATH}\aspnetcoremodulev2\commonlib\fileoutputmanager.cpp:84. Could not stop stdout redirection in C:\Program Files\IIS\Asp.Net Core Module\V2\aspnetcorev2.dll. Exception message: HRESULT 0x80070002 returned at {PATH}. Could not start stdout redirection in {PATH}\aspnetcorev2_inprocess.dll.

 - The ```stdoutLogFile``` path specified in the <aspNetCore> element of web.config doesn't exist. For more information, see ASP.NET Core Module: Log creation and redirection.

 - The app pool user doesn't have write access to the stdout log path.

## Application configuration general issue

 - Browser: HTTP Error 500.0 - ANCM In-Process Handler Load Failure --OR-- HTTP Error 500.30 - ANCM In-Process Start Failure

 - Application Log: Variable

 - ASP.NET Core Module stdout Log: The log file is created but empty or created with normal entries until the point of the app failing.

 - ASP.NET Core Module Debug Log: Variable

 - Troubleshoot ASP.NET Core on Azure App Service and IIS

 - Troubleshoot and debug ASP.NET Core projects

Ref: [Common error troubleshooting for Azure App Service and IIS with ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/azure-iis-errors-reference?view=aspnetcore-8.0)