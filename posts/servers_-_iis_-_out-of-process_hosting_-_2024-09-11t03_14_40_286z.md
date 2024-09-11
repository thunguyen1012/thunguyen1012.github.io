---
title: Servers - IIS - Out-of-process hosting
published: true
date: 2024-09-11 03:14:40
tags: Summary, AspNetCore
description: Because ASP.NET Core apps run in a process separate from the IIS worker process, the ASP.NET Core Module handles process management. The module starts the process for the ASP.NET Core app when the first request arrives and restarts the app if it shuts down or crashes. This is essentially the same behavior as seen with apps that run in-process that are managed by the Windows Process Activation Service (WAS).
image:
---

## In this article

The ASP.NET Core Module handles process management for the ASP.NET Core app.

The following diagram illustrates the relationship between IIS, the ASP.NET Core Module, and an app hosted out-of-process:



![ASP.NET Core Module in the out-of-process hosting scenario!](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/index/_static/ancm-outofprocess.png?view=aspnetcore-8.0 "ASP.NET Core Module in the out-of-process hosting scenario")

- Requests arrive from the web to the kernel-mode HTTP.sys driver.

- The driver routes the requests to IIS on the website's configured port. The configured port is usually 80 (HTTP) or 443 (HTTPS).

- The module forwards the requests to Kestrel on a random port for the app. The random port isn't 80 or 443.

The ASP.NET Core Module specifies the port via an environment variable at startup. The UseIISIntegration extension configures the server to listen on http://localhost:{PORT}. Additional checks are performed, and requests that don't originate from the module are rejected. The module doesn't support HTTPS forwarding. Requests are forwarded over HTTP even if received by IIS over HTTPS.

After Kestrel picks up the request from the module, the request is forwarded into the ASP.NET Core middleware pipeline. The middleware pipeline handles the request and passes it on as an ```HttpContext``` instance to the app's logic. Middleware added by IIS Integration updates the scheme, remote IP, and pathbase to account for forwarding the request to Kestrel. The app's response is passed back to IIS, which forwards it back to the HTTP client that initiated the request.

For ASP.NET Core Module configuration guidance, see ASP.NET Core Module (ANCM) for IIS.

For more information on hosting, see Host in ASP.NET Core.

## Application configuration

### Enable the IISIntegration components

When building a host in ```CreateHostBuilder``` (Program.cs), call ```CreateDefaultBuilder``` to enable IIS integration:

```csharp
public static IHostBuilder CreateHostBuilder(string[] args) =>
    Host.CreateDefaultBuilder(args)
        ...
```

For more information on ```CreateDefaultBuilder```, see .NET Generic Host in ASP.NET Core.

Out-of-process hosting model

To configure IIS options, include a service configuration for IISOptions in ConfigureServices. The following example prevents the app from populating ```HttpContext.Connection.ClientCertificate```:

```csharp
services.Configure<IISOptions>(options => 
{
    options.ForwardClientCertificate = false;
});
```

<table><thead>
<tr>
<th>Option</th>
<th style="text-align: center;">Default</th>
<th>Setting</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>AutomaticAuthentication</code></td>
<td style="text-align: center;"><code>true</code></td>
<td>If <code>true</code>, <a href="#enable-the-iisintegration-components" data-linktype="self-bookmark">IIS Integration Middleware</a> sets the <code>HttpContext.User</code> authenticated by <a href="../../security/authentication/windowsauth?view=aspnetcore-8.0" data-linktype="relative-path">Windows Authentication</a>. If <code>false</code>, the middleware only provides an identity for <code>HttpContext.User</code> and responds to challenges when explicitly requested by the <code>AuthenticationScheme</code>. Windows Authentication must be enabled in IIS for <code>AutomaticAuthentication</code> to function. For more information, see the <a href="../../security/authentication/windowsauth?view=aspnetcore-8.0" data-linktype="relative-path">Windows Authentication</a> topic.</td>
</tr>
<tr>
<td><code>AuthenticationDisplayName</code></td>
<td style="text-align: center;"><code>null</code></td>
<td>Sets the display name shown to users on login pages.</td>
</tr>
<tr>
<td><code>ForwardClientCertificate</code></td>
<td style="text-align: center;"><code>true</code></td>
<td>If <code>true</code> and the <code>MS-ASPNETCORE-CLIENTCERT</code> request header is present, the <code>HttpContext.Connection.ClientCertificate</code> is populated.</td>
</tr>
</tbody></table>

### Proxy server and load balancer scenarios

The IIS Integration Middleware and the ASP.NET Core Module are configured to forward the:

- Scheme (HTTP/HTTPS).

- Remote IP address where the request originated.

The IIS Integration Middleware configures Forwarded Headers Middleware.

This guide shows how to use ASP.NET Core to work with proxy servers and loads.

### Out-of-process hosting model

To configure an app for out-of-process hosting, set the value of the `<AspNetCoreHostingModel>` property to ```OutOfProcess``` in the project file (.csproj):

```xml
<PropertyGroup>
  <AspNetCoreHostingModel>OutOfProcess</AspNetCoreHostingModel>
</PropertyGroup>
```

In-process hosting is set with ```InProcess```, which is the default value.

The value of <AspNetCoreHostingModel> is case insensitive, so ```inprocess``` and ```outofprocess``` are valid values.

Kestrel server is used instead of IIS HTTP Server (IISHttpServer).

For out-of-process, ```CreateDefaultBuilder``` calls UseIISIntegration to:

- Configure the port and base path the server should listen on when running behind the ASP.NET Core Module.

- Configure the host to capture startup errors.

### Process name

 ```Process.GetCurrentProcess().ProcessName reports w3wp/iisexpress (in-process)``` or ```dotnet (out-of-process)```.

Many native modules, such as Windows Authentication, remain active. To learn more about IIS modules active with the ASP.NET Core Module, see IIS modules with ASP.NET Core.

The ASP.NET Core Module can also:

- Set environment variables for the worker process.

- Log stdout output to file storage for troubleshooting startup issues.

- Forward Windows authentication tokens.

Ref: [Out-of-process hosting with IIS and ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/out-of-process-hosting?view=aspnetcore-8.0)