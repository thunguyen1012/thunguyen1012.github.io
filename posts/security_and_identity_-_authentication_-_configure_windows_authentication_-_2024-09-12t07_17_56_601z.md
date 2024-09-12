---
title: Security and Identity - Authentication - Configure Windows authentication
published: true
date: 2024-09-12 07:17:56
tags: Summary, AspNetCore
description:
image:
---

## In this article

> Note
Windows Authentication isn't supported with ```HTTP/2```. Authentication challenges can be sent on ```HTTP/2``` responses, but the client must downgrade to ```HTTP/1.1``` before authenticating.

## Proxy and load balancer scenarios

 - Handles the authentication.

 - Passes the user authentication information to the app (for example, in a request header), which acts on the authentication information.

## IIS/IIS Express

```csharp
using Microsoft.AspNetCore.Authentication.Negotiate;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(NegotiateDefaults.AuthenticationScheme)
   .AddNegotiate();

builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = options.DefaultPolicy;
});
builder.Services.AddRazorPages();

var app = builder.Build();
if (!app.Environment.IsDevelopment())
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

### Launch settings (debugger)

  - Visual Studio

  - .NET CLI

   - In Solution Explorer, right click the project and select Properties.

   - Select the Debug > General tab and select Open debug launch profiles UI.

   - Clear the checkbox for Enable Anonymous Authentication.

   - Select the checkbox for Enable Windows Authentication.

```json
"iisSettings": {
    "windowsAuthentication": true,
    "anonymousAuthentication": false,
    "iisExpress": {
        "applicationUrl": "http://localhost:52171/",
        "sslPort": 44308
    }
}
```

```dotnetcli
dotnet new webapp --auth Windows
```

```json
"iisSettings": {
    "windowsAuthentication": true,
    "anonymousAuthentication": false,
    "iisExpress": {
        "applicationUrl": "http://localhost:52171/",
        "sslPort": 44308
    }
}
```

### IIS

 - Provide a local web.config file that activates Windows Authentication on the server when the app is deployed.

 - Use the IIS Manager to configure the web.config file of an ASP.NET Core app that has already been deployed to the server.

 - Before publishing and deploying the project, add the following web.config file to the project root:
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <location path="." inheritInChildApplications="false">
    <system.webServer>
      <security>
        <authentication>
          <anonymousAuthentication enabled="false" />
          <windowsAuthentication enabled="true" />
        </authentication>
      </security>
    </system.webServer>
  </location>
</configuration>
```

When the project is published by the .NET Core SDK (without the `<IsTransformWebConfigDisabled>` property set to ```true``` in the project file), the published web.config file includes the `<location><system.webServer><security><authentication>` section. For more information on the `<IsTransformWebConfigDisabled>` property, see Host ASP.NET Core on Windows with IIS.

 - After publishing and deploying the project, perform server-side configuration with the IIS Manager:

In IIS Manager, select the IIS site under the Sites node of the Connections sidebar.
Double-click Authentication in the IIS area.
Select Anonymous Authentication. Select Disable in the Actions sidebar.
Select Windows Authentication. Select Enable in the Actions sidebar.

When these actions are taken, IIS Manager modifies the app's web.config file. A `<system.webServer><security><authentication>` node is added with updated settings for ```anonymousAuthentication``` and ```windowsAuthentication```:

```xml
<system.webServer>
  <security>
    <authentication>
      <anonymousAuthentication enabled="false" />
      <windowsAuthentication enabled="true" />
    </authentication>
  </security>
</system.webServer>
```

The `<system.webServer>` section added to the web.config file by IIS Manager is outside of the app's `<location>` section added by the .NET Core SDK when the app is published. Because the section is added outside of the `<location>` node, the settings are inherited by any sub-apps to the current app. To prevent inheritance, move the added `<security>` section inside of the `<location><system.webServer>` section that the .NET Core SDK provided.
When IIS Manager is used to add the IIS configuration, it only affects the app's web.config file on the server. A subsequent deployment of the app may overwrite the settings on the server if the server's copy of web.config is replaced by the project's web.config file. Use either of the following approaches to manage the settings:

   - In IIS Manager, select the IIS site under the Sites node of the Connections sidebar.

   - Double-click Authentication in the IIS area.

   - Select Anonymous Authentication. Select Disable in the Actions sidebar.

   - Select Windows Authentication. Select Enable in the Actions sidebar.

   - Use IIS Manager to reset the settings in the web.config file after the file is overwritten on deployment.

   - Add a web.config file to the app locally with the settings.

## Kestrel

> Warning
Credentials can be persisted across requests on a connection. ```Negotiate``` authentication must not be used with proxies unless the proxy maintains a 1:1 connection affinity (a persistent connection) with Kestrel.

> Note
The ```Negotiate``` handler detects if the underlying server supports Windows Authentication natively and if it is enabled. If the server supports Windows Authentication but it is disabled, an error is thrown asking you to enable the server implementation. When Windows Authentication is enabled in the server, the ```Negotiate``` handler transparently forwards authentication requests to it.

```csharp
using Microsoft.AspNetCore.Authentication.Negotiate;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(NegotiateDefaults.AuthenticationScheme)
   .AddNegotiate();

builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = options.DefaultPolicy;
});
builder.Services.AddRazorPages();

var app = builder.Build();
if (!app.Environment.IsDevelopment())
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

 - AddAuthentication

 - AddNegotiate

 - UseAuthentication

### Kerberos authentication and role-based access control (RBAC)

```csharp
using Microsoft.AspNetCore.Authentication.Negotiate;
using System.Runtime.InteropServices;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(NegotiateDefaults.AuthenticationScheme)
    .AddNegotiate(options =>
    {
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
        {
            options.EnableLdap("contoso.com");
        }
    });
```

```csharp
using Microsoft.AspNetCore.Authentication.Negotiate;
using System.Runtime.InteropServices;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(NegotiateDefaults.AuthenticationScheme)
        .AddNegotiate(options =>
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
            {
                options.EnableLdap(settings =>
                {
                    settings.Domain = "contoso.com";
                    settings.MachineAccountName = "machineName";
                    settings.MachineAccountPassword =
                                      builder.Configuration["Password"];
                });
            }
        });

builder.Services.AddRazorPages();
```

### Windows environment configuration

#### Kerberos vs ```NTLM```

```csharp
using Microsoft.AspNetCore.Authentication.Negotiate;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(NegotiateDefaults.AuthenticationScheme)
   .AddNegotiate();

builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = options.DefaultPolicy;
});
builder.Services.AddRazorPages();

var app = builder.Build();
```

### Linux and macOS environment configuration

> Note
When following the guidance in the Connect Azure Data Studio to your SQL Server using Windows authentication - Kerberos article, replace ```python-software-properties``` with ```python3-software-properties``` if needed.

 - On the domain controller, add new web service SPNs to the machine account:

   - ```setspn -S HTTP/mywebservice.mydomain.com mymachine```

   - ```setspn -S HTTP/mywebservice@MYDOMAIN.COM mymachine```

 - Use ktpass to generate a keytab file:

   - ```ktpass -princ HTTP/mywebservice.mydomain.com@MYDOMAIN.COM -pass myKeyTabFilePassword -mapuser MYDOMAIN\mymachine$ -pType KRB5_NT_PRINCIPAL -out c:\temp\mymachine.HTTP.keytab -crypto AES256-SHA1```

   - Some fields must be specified in uppercase as indicated.

 - Copy the keytab file to the Linux or macOS machine.

 - Select the keytab file via an environment variable: ```export KRB5_KTNAME=/tmp/mymachine.HTTP.keytab```

 - Invoke ```klist``` to show the SPNs currently available for use.

> Note
A keytab file contains domain access credentials and must be protected accordingly.

## ```HTTP```.sys

```csharp
using Microsoft.AspNetCore.Server.HttpSys;
using System.Runtime.InteropServices;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(HttpSysDefaults.AuthenticationScheme);

if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
{
    builder.WebHost.UseHttpSys(options =>
        {
            options.Authentication.Schemes =
                AuthenticationSchemes.NTLM |
                AuthenticationSchemes.Negotiate;
            options.Authentication.AllowAnonymous = false;
        });
}
```

> Note
HTTP.sys delegates to Kernel Mode authentication with the Kerberos authentication protocol. User Mode authentication isn't supported with Kerberos and HTTP.sys. The machine account must be used to decrypt the Kerberos token/ticket that's obtained from Active Directory and forwarded by the client to the server to authenticate the user. Register the Service Principal Name (SPN) for the host, not the user of the app.

> Note
HTTP.sys isn't supported on Nano Server version 1709 or later. To use Windows Authentication and HTTP.sys with Nano Server, use a Server Core (microsoft/windowsservercore) container (see ```https://hub.docker.com/_/microsoft-windows-servercore```). For more information on Server Core, see What is the Server Core installation option in Windows Server?.

## Authorize users

### Disallow anonymous access

### Allow anonymous access

> Note
By default, users who lack authorization to access a page are presented with an empty HTTP 403 response. The StatusCodePages Middleware can be configured to provide users with a better "Access Denied" experience.

## Impersonation

```csharp
app.Run(async (context) =>
{
    try
    {
        var user = (WindowsIdentity)context.User.Identity!;

        await context.Response
            .WriteAsync($"User: {user.Name}\tState: {user.ImpersonationLevel}\n");

        await WindowsIdentity.RunImpersonatedAsync(user.AccessToken, async () =>
        {
            var impersonatedUser = WindowsIdentity.GetCurrent();
            var message =
                $"User: {impersonatedUser.Name}\t" +
                $"State: {impersonatedUser.ImpersonationLevel}";

            var bytes = Encoding.UTF8.GetBytes(message);
            await context.Response.Body.WriteAsync(bytes, 0, bytes.Length);
        });
    }
    catch (Exception e)
    {
        await context.Response.WriteAsync(e.ToString());
    }
});
```

## Claims transformations

## Additional resources

 - dotnet publish

 - Host ASP.NET Core on Windows with IIS

 - ASP.NET Core Module (ANCM) for IIS

 - Visual Studio publish profiles (.pubxml) for ASP.NET Core app deployment

Ref: [Configure Windows Authentication in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/windowsauth?view=aspnetcore-8.0)