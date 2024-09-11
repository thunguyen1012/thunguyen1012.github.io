---
title: Servers - IIS - IIS support in Visual Studio
published: true
date: 2024-09-11 03:27:48
tags: Summary, AspNetCore
description:
image:
---

## In this article

## Prerequisites

 - Visual Studio for Windows

 - ASP.NET and web development workload

 - .NET Core cross-platform development workload

 - X.509 security certificate (for HTTPS support)

## Enable IIS

 - In Windows, navigate to Control Panel > Programs > Programs and Features > Turn Windows features on or off (left side of the screen).

 - Select the Internet Information Services checkbox. Select OK.

## Configure IIS

 - Host name: Typically, the Default Web Site is used with a Host name of ```localhost```. However, any valid IIS website with a unique host name works.

 - Site Binding

   - For apps that require HTTPS, create a binding to port 443 with a certificate. Typically, the IIS Express ```Development``` Certificate is used, but any valid certificate works.

   - For apps that use HTTP, confirm the existence of a binding to port 80 or create a binding to port 80 for a new site.

   - Use a single binding for either HTTP or HTTPS. Binding to both HTTP and HTTPS ports simultaneously isn't supported.

## Configure the project

### HTTPS redirection

### IIS launch profile

 - Right-click the project in Solution Explorer. Select Properties. Open the Debug tab.

 - For Profile, select the New button. Name the profile "IIS" in the popup window. Select OK to create the profile.

 - For the Launch setting, select IIS from the list.

 - Select the checkbox for Launch browser and provide the endpoint URL.
When the app requires HTTPS, use an HTTPS endpoint (https://). For HTTP, use an HTTP (http://) endpoint.
Provide the same host name and port as the IIS configuration specified earlier uses, typically ```localhost```.
Provide the name of the app at the end of the URL.
For example, ```https://localhost/WebApplication1``` (HTTPS) or ```http://localhost/WebApplication1``` (HTTP) are valid endpoint URLs.

 - In the Environment variables section, select the Add button. Provide an environment variable with a Name of ```ASPNETCORE_ENVIRONMENT``` and a Value of ```Development```.

 - In the Web Server Settings area, set the App URL to the same value used for the Launch browser endpoint URL.

 - For the Hosting Model setting in Visual Studio 2019 or later, select Default to use the hosting model used by the project. If the project sets the <AspNetCoreHostingModel> property in its project file, the value of the property (InProcess or ```OutOfProcess```) is used. If the property isn't present, the default hosting model of the app is used, which is in-process. If the app requires an explicit hosting model setting different from the app's normal hosting model, set the Hosting Model to either ```In Process``` or ```Out Of Process``` as needed.

 - Save the profile.

```json
{
  "iisSettings": {
    "windowsAuthentication": false,
    "anonymousAuthentication": true,
    "iis": {
      "applicationUrl": "https://localhost/WebApplication1",
      "sslPort": 0
    }
  },
  "profiles": {
    "IIS": {
      "commandName": "IIS",
      "launchBrowser": true,
      "launchUrl": "https://localhost/WebApplication1",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

## Run the project

 - Confirm that the build configuration drop-down list is set to Debug.

 - Set the Start Debugging button to the IIS profile and select the button to start the app.

> Note
Debugging a Release build configuration with Just My Code and compiler optimizations results in a degraded experience. For example, break points aren't hit.

## Additional resources

 - Getting Started with the IIS Manager in IIS

 - Enforce HTTPS in ASP.NET Core

Ref: [Development-time IIS support in Visual Studio for ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/development-time-iis-support?view=aspnetcore-8.0)