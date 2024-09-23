---
title: Security and Identity - IP safelist
published: true
date: 2024-09-23 04:46:52
tags: Summary, AspNetCore
description:
image:
---

## In this article

This article shows three ways to implement an IP address safelist (also known as an allow list) in an ASP.NET Core app. An accompanying sample app demonstrates all three approaches. You can use:

- Middleware to check the remote IP address of every request.

- MVC action filters to check the remote IP address of requests for specific controllers or action methods.

- Razor Pages filters to check the remote IP address of requests for Razor pages.

In each case, a string containing approved client IP addresses is stored in an app setting. The middleware or filter:

- Parses the string into an array.

- Checks if the remote IP address exists in the array.

Access is allowed if the array contains the IP address. Otherwise, an HTTP 403 Forbidden status code is returned.

View or download sample code (how to download)

## IP address safelist

In the sample app, the IP address safelist is:

- Defined by the ```AdminSafeList``` property in the ```appsettings.json``` file.

- A semicolon-delimited string that may contain both Internet Protocol version 4 (IPv4) and Internet Protocol version 6 (IPv6) addresses.

```json
{
  "AdminSafeList": "127.0.0.1;192.168.1.5;::1",
  "Logging": {
```

In the preceding example, the IPv4 addresses of ```127.0.0.1``` and ```192.168.1.5``` and the IPv6 loopback address of ```::1``` (compressed format for ```0:0:0:0:0:0:0:1```) are allowed.

## Middleware

The ```Startup.Configure``` method adds the custom ```AdminSafeListMiddleware``` middleware type to the app's request pipeline. The safelist is retrieved with the .NET Core configuration provider and is passed as a constructor parameter.

```csharp
app.UseMiddleware<AdminSafeListMiddleware>(Configuration["AdminSafeList"]);
```

This method searches for a remote IP address in a string.

```csharp
public class AdminSafeListMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<AdminSafeListMiddleware> _logger;
    private readonly byte[][] _safelist;

    public AdminSafeListMiddleware(
        RequestDelegate next,
        ILogger<AdminSafeListMiddleware> logger,
        string safelist)
    {
        var ips = safelist.Split(';');
        _safelist = new byte[ips.Length][];
        for (var i = 0; i < ips.Length; i++)
        {
            _safelist[i] = IPAddress.Parse(ips[i]).GetAddressBytes();
        }

        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        if (context.Request.Method != HttpMethod.Get.Method)
        {
            var remoteIp = context.Connection.RemoteIpAddress;
            _logger.LogDebug("Request from Remote IP address: {RemoteIp}", remoteIp);

            var bytes = remoteIp.GetAddressBytes();
            var badIp = true;
            foreach (var address in _safelist)
            {
                if (address.SequenceEqual(bytes))
                {
                    badIp = false;
                    break;
                }
            }

            if (badIp)
            {
                _logger.LogWarning(
                    "Forbidden Request from Remote IP address: {RemoteIp}", remoteIp);
                context.Response.StatusCode = (int) HttpStatusCode.Forbidden;
                return;
            }
        }

        await _next.Invoke(context);
    }
}
```

## Action filter

If you want safelist-driven access control for specific MVC controllers or action methods, use an action filter. For example:

```csharp
public class ClientIpCheckActionFilter : ActionFilterAttribute
{
    private readonly ILogger _logger;
    private readonly string _safelist;

    public ClientIpCheckActionFilter(string safelist, ILogger logger)
    {
        _safelist = safelist;
        _logger = logger;
    }

    public override void OnActionExecuting(ActionExecutingContext context)
    {
        var remoteIp = context.HttpContext.Connection.RemoteIpAddress;
        _logger.LogDebug("Remote IpAddress: {RemoteIp}", remoteIp);
        var ip = _safelist.Split(';');
        var badIp = true;
        
        if (remoteIp.IsIPv4MappedToIPv6)
        {
            remoteIp = remoteIp.MapToIPv4();
        }
        
        foreach (var address in ip)
        {
            var testIp = IPAddress.Parse(address);
            
            if (testIp.Equals(remoteIp))
            {
                badIp = false;
                break;
            }
        }

        if (badIp)
        {
            _logger.LogWarning("Forbidden Request from IP: {RemoteIp}", remoteIp);
            context.Result = new StatusCodeResult(StatusCodes.Status403Forbidden);
            return;
        }

        base.OnActionExecuting(context);
    }
}
```

In ```Startup.ConfigureServices```, add the action filter to the MVC filters collection. In the following example, a ```ClientIpCheckActionFilter``` action filter is added. A safelist and a console logger instance are passed as constructor parameters.

```csharp
services.AddScoped<ClientIpCheckActionFilter>(container =>
{
    var loggerFactory = container.GetRequiredService<ILoggerFactory>();
    var logger = loggerFactory.CreateLogger<ClientIpCheckActionFilter>();

    return new ClientIpCheckActionFilter(
        Configuration["AdminSafeList"], logger);
});
```

The action filter can then be applied to a controller or action method with the [ServiceFilter] attribute:

```csharp
[ServiceFilter(typeof(ClientIpCheckActionFilter))]
[HttpGet]
public IEnumerable<string> Get()
```

In the sample app, the action filter is applied to the controller's ```Get``` action method. When you test the app by sending:

- An HTTP GET request, the [ServiceFilter] attribute validates the client IP address. If access is allowed to the ```Get``` action method, a variation of the following console output is produced by the action filter and action method:
dbug: ClientIpSafelistComponents.Filters.ClientIpCheckActionFilter[0]
      Remote IpAddress: ```::1```
dbug: ClientIpAspNetCore.Controllers.ValuesController[0]
      successful HTTP GET

- An HTTP request verb other than GET, the ```AdminSafeListMiddleware``` middleware validates the client IP address.

## Razor Pages filter

If you want safelist-driven access control for a Razor Pages app, use a Razor Pages filter. For example:

```csharp
public class ClientIpCheckPageFilter : IPageFilter
{
    private readonly ILogger _logger;
    private readonly IPAddress[] _safelist;

    public ClientIpCheckPageFilter(
        string safelist,
        ILogger logger)
    {
        var ips = safelist.Split(';');
        _safelist = new IPAddress[ips.Length];
        for (var i = 0; i < ips.Length; i++)
        {
            _safelist[i] = IPAddress.Parse(ips[i]);
        }

        _logger = logger;
    }

    public void OnPageHandlerExecuting(PageHandlerExecutingContext context)
    {
        var remoteIp = context.HttpContext.Connection.RemoteIpAddress;
        if (remoteIp.IsIPv4MappedToIPv6)
        {
            remoteIp = remoteIp.MapToIPv4();
        }
        _logger.LogDebug(
            "Remote IpAddress: {RemoteIp}", remoteIp);

        var badIp = true;
        foreach (var testIp in _safelist)
        {
            if (testIp.Equals(remoteIp))
            {
                badIp = false;
                break;
            }
        }

        if (badIp)
        {
            _logger.LogWarning(
                "Forbidden Request from Remote IP address: {RemoteIp}", remoteIp);
            context.Result = new StatusCodeResult(StatusCodes.Status403Forbidden);
            return;
        }
    }

    public void OnPageHandlerExecuted(PageHandlerExecutedContext context)
    {
    }

    public void OnPageHandlerSelected(PageHandlerSelectedContext context)
    {
    }
}
```

In ```Startup.ConfigureServices```, enable the Razor Pages filter by adding it to the MVC filters collection. In the following example, a ```ClientIpCheckPageFilter``` Razor Pages filter is added. A safelist and a console logger instance are passed as constructor parameters.

```csharp
services.AddRazorPages()
    .AddMvcOptions(options =>
    {
        var logger = LoggerFactory.Create(builder => builder.AddConsole())
                        .CreateLogger<ClientIpCheckPageFilter>();
        var filter = new ClientIpCheckPageFilter(
            Configuration["AdminSafeList"], logger);
        
        options.Filters.Add(filter);
    });
```

When the sample app's Index Razor page is requested, the Razor Pages filter validates the client IP address. The filter produces a variation of the following console output:

## Additional resources

- ASP.NET Core Middleware

- Action filters

- Filter methods for Razor Pages in ASP.NET Core

Ref: [Client IP safelist for ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/ip-safelist?view=aspnetcore-8.0)