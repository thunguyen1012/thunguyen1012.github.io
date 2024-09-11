---
title: Servers - IIS - In-process hosting
published: true
date: 2024-09-11 03:14:32
tags: Summary, AspNetCore
description: 
image:
---

## In this article

![ASP.NET Core Module in the in-process hosting scenario!](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/index/_static/ancm-inprocess.png?view=aspnetcore-8.0 "ASP.NET Core Module in the in-process hosting scenario")

## Enable in-process hosting

```xml
<PropertyGroup>
  <AspNetCoreHostingModel>InProcess</AspNetCoreHostingModel>
</PropertyGroup>
```

## General architecture

 - A request arrives from the web to the kernel-mode HTTP.sys driver.

 - The driver routes the native request to IIS on the website's configured port, usually 80 (HTTP) or 443 (HTTPS).

 - The ASP.NET Core Module receives the native request and passes it to IIS HTTP Server (IISHttpServer). IIS HTTP Server is an in-process server implementation for IIS that converts the request from native to managed.

 - The request is sent to the ASP.NET Core middleware pipeline.

 - The middleware pipeline handles the request and passes it on as an ```HttpContext``` instance to the app's logic.

 - The app's response is passed back to IIS through IIS HTTP Server.

 - IIS sends the response to the client that initiated the request.

## Application configuration

```csharp
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Server.IIS;
using Microsoft.EntityFrameworkCore;
using RPauth.Data;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.Configure<IISServerOptions>(options =>
{
    options.AutomaticAuthentication = false;
});

builder.Services.AddTransient<IClaimsTransformation, MyClaimsTransformation>();
builder.Services.AddAuthentication(IISServerDefaults.AuthenticationScheme);

builder.Services.AddRazorPages();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapRazorPages();

app.Run();
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
<td>If <code>true</code>, IIS Server sets the <code>HttpContext.User</code> authenticated by <a href="../../security/authentication/windowsauth?view=aspnetcore-8.0" data-linktype="relative-path">Windows Authentication</a>. If <code>false</code>, the server only provides an identity for <code>HttpContext.User</code> and responds to challenges when explicitly requested by the <code>AuthenticationScheme</code>. Windows Authentication must be enabled in IIS for <code>AutomaticAuthentication</code> to function. For more information, see <a href="../../security/authentication/windowsauth?view=aspnetcore-8.0" data-linktype="relative-path">Windows Authentication</a>.</td>
</tr>
<tr>
<td><code>AuthenticationDisplayName</code></td>
<td style="text-align: center;"><code>null</code></td>
<td>Sets the display name shown to users on login pages.</td>
</tr>
<tr>
<td><code>AllowSynchronousIO</code></td>
<td style="text-align: center;"><code>false</code></td>
<td>Whether synchronous I/O is allowed for the <code>HttpContext.Request</code> and the <code>HttpContext.Response</code>.</td>
</tr>
<tr>
<td><code>MaxRequestBodySize</code></td>
<td style="text-align: center;"><code>30000000</code></td>
<td>Gets or sets the max request body size for the <code>HttpRequest</code>. Note that IIS itself has the limit <code>maxAllowedContentLength</code> which will be processed before the <code>MaxRequestBodySize</code> set in the <code>IISServerOptions</code>. Changing the <code>MaxRequestBodySize</code> won't affect the <code>maxAllowedContentLength</code>. To increase <code>maxAllowedContentLength</code>, add an entry in the <code>web.config</code> to set <code>maxAllowedContentLength</code> to a higher value. For more details, see <a href="/en-us/iis/configuration/system.webServer/security/requestFiltering/requestLimits/#configuration" data-linktype="absolute-path">Configuration</a>.</td>
</tr>
</tbody></table>

## Differences between in-process and out-of-process hosting

 - IIS HTTP Server (IISHttpServer) is used instead of Kestrel server. For in-process, ```CreateDefaultBuilder``` calls UseIIS to:

   - Register the ```IISHttpServer```.

   - Configure the port and base path the server should listen on when running behind the ASP.NET Core Module.

   - Configure the host to capture startup errors.

 - The ```requestTimeout``` attribute doesn't apply to in-process hosting.

 - Sharing an app pool among apps isn't supported. Use one app pool per app.

 - The architecture (bitness) of the app and installed runtime (x64 or x86) must match the architecture of the app pool. For example, apps published for 32-bit (x86) must have 32-bit enabled for their IIS Application Pools. For more information, see the Create the IIS site section.

 - Client disconnects are detected. The ```HttpContext.RequestAborted``` cancellation token is cancelled when the client disconnects.

 - When hosting in-process, `AuthenticateAsync` isn't called internally to initialize a user. Therefore, an `IClaimsTransformation` implementation used to transform claims after every authentication isn't activated by default. When transforming claims with an `IClaimsTransformation` implementation, call `AddAuthentication` to add authentication services:

```csharp
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Server.IIS;
using Microsoft.EntityFrameworkCore;
using RPauth.Data;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.Configure<IISServerOptions>(options =>
{
    options.AutomaticAuthentication = false;
});

builder.Services.AddTransient<IClaimsTransformation, MyClaimsTransformation>();
builder.Services.AddAuthentication(IISServerDefaults.AuthenticationScheme);

builder.Services.AddRazorPages();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapRazorPages();

app.Run();
```

 - Web Package (single-file) deployments aren't supported.

## Get timing information

Ref: [In-process hosting with IIS and ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/in-process-hosting?view=aspnetcore-8.0)