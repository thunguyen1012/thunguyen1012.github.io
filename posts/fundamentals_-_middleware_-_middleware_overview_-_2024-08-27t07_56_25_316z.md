---
title: Fundamentals - Middleware - Middleware overview
published: true
date: 2024-08-27 07:56:25
tags: Summary, AspNetCore
description: 
image:
---

## In this article

 - Chooses whether to pass the request to the ```next``` component in the pipeline.

 - Can perform work before and after the ```next``` component in the pipeline.

## Middleware code analysis

## Create a middleware pipeline with ```WebApplication```

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.Run(async context =>
{
    await context.Response.WriteAsync("Hello world!");
});

app.Run();
```

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.Use(async (context, next) =>
{
    // Do work that can write to the Response.
    await next.Invoke();
    // Do logging or other work that doesn't write to the Response.
});

app.Run(async context =>
{
    await context.Response.WriteAsync("Hello from 2nd delegate.");
});

app.Run();
```

### Short-circuiting the request pipeline

> Warning
Don't call ```next.Invoke``` during or after the response has been sent to the client. After an HttpResponse has started, changes result in an exception. For example, setting headers and a status code throw an exception after the response starts. Writing to the response body after calling ```next```:

May cause a protocol violation, such as writing more than the stated ```Content-Length```.
May corrupt the body format, such as writing an HTML footer to a CSS file.

HasStarted is a useful hint to indicate if headers have been sent or the body has been written to.

  - May cause a protocol violation, such as writing more than the stated ```Content-Length```.

  - May corrupt the body format, such as writing an HTML footer to a CSS file.

### ```Run``` delegates

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.Use(async (context, next) =>
{
    // Do work that can write to the Response.
    await next.Invoke();
    // Do logging or other work that doesn't write to the Response.
});

app.Run(async context =>
{
    await context.Response.WriteAsync("Hello from 2nd delegate.");
});

app.Run();
```

### Prefer app.Use overload that requires passing the context to ```next```

 - Requires passing the context to ```next```.

 - Saves two internal per-request allocations that are required when using the other overload.

## Middleware order

```csharp
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WebMiddleware.Data;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<ApplicationDbContext>();
builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

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
// app.UseCookiePolicy();

app.UseRouting();
// app.UseRateLimiter();
// app.UseRequestLocalization();
// app.UseCors();

app.UseAuthentication();
app.UseAuthorization();
// app.UseSession();
// app.UseResponseCompression();
// app.UseResponseCaching();

app.MapRazorPages();
app.MapDefaultControllerRoute();

app.Run();
```

 - Middleware that is not added when creating a new web app with individual users accounts is commented out.

 - Not every middleware appears in this exact order, but many do. For example:

   - ```UseCors```, ```UseAuthentication```, and ```UseAuthorization``` must appear in the order shown.

   - ```UseCors``` currently must appear before ```UseResponseCaching```. This requirement is explained in GitHub issue dotnet/aspnetcore #23218.

   - ```UseRequestLocalization``` must appear before any middleware that might check the request culture, for example, `app.UseStaticFiles()`.

   - ```UseRateLimiter``` must be called after ```UseRouting``` when rate limiting endpoint specific APIs are used. For example, if the `[EnableRateLimiting]` attribute is used, ```UseRateLimiter``` must be called after ```UseRouting```. When calling only global limiters, ```UseRateLimiter``` can be called before ```UseRouting```.

```csharp
app.UseResponseCaching();
app.UseResponseCompression();
```

```csharp
app.UseResponseCaching();
app.UseResponseCompression();
app.UseStaticFiles();
```

 - Exception/error handling

   - When the app runs in the Development environment:

     - Developer Exception Page Middleware (UseDeveloperExceptionPage) reports app runtime errors.

     - Database Error Page Middleware (UseDatabaseErrorPage) reports database runtime errors.

   - When the app runs in the Production environment:

     - Exception Handler Middleware (UseExceptionHandler) catches exceptions thrown in the following middlewares.

     - HTTP Strict Transport Security Protocol (HSTS) Middleware (UseHsts) adds the ```Strict-Transport-Security``` header.

 - HTTPS Redirection Middleware (UseHttpsRedirection) redirects HTTP requests to HTTPS.

 - Static File Middleware (UseStaticFiles) returns static files and short-circuits further request processing.

 - Cookie Policy Middleware (UseCookiePolicy) conforms the app to the EU General Data Protection Regulation (GDPR) regulations.

 - Routing Middleware (UseRouting) to route requests.

 - Authentication Middleware (UseAuthentication) attempts to authenticate the user before they're allowed access to ```secure``` resources.

 - Authorization Middleware (UseAuthorization) authorizes a user to access ```secure``` resources.

 - Session Middleware (UseSession) establishes and maintains session state. If the app uses session state, call Session Middleware after Cookie Policy Middleware and before MVC Middleware.

 - Endpoint Routing Middleware (UseEndpoints with MapRazorPages) to add Razor Pages endpoints to the request pipeline.

```csharp
if (env.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseDatabaseErrorPage();
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCookiePolicy();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseSession();
app.MapRazorPages();
```

```csharp
// Static files aren't compressed by Static File Middleware.
app.UseStaticFiles();

app.UseRouting();

app.UseResponseCompression();

app.MapRazorPages();
```

## ```UseCors``` and ```UseStaticFiles``` order

### Forwarded Headers Middleware order

## Branch the middleware pipeline

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.Map("/map1", HandleMapTest1);

app.Map("/map2", HandleMapTest2);

app.Run(async context =>
{
    await context.Response.WriteAsync("Hello from non-Map delegate.");
});

app.Run();

static void HandleMapTest1(IApplicationBuilder app)
{
    app.Run(async context =>
    {
        await context.Response.WriteAsync("Map Test 1");
    });
}

static void HandleMapTest2(IApplicationBuilder app)
{
    app.Run(async context =>
    {
        await context.Response.WriteAsync("Map Test 2");
    });
}
```

<table><thead>
<tr>
<th>Request</th>
<th>Response</th>
</tr>
</thead>
<tbody>
<tr>
<td>localhost:1234</td>
<td>Hello from non-Map delegate.</td>
</tr>
<tr>
<td>localhost:1234/map1</td>
<td>Map Test 1</td>
</tr>
<tr>
<td>localhost:1234/map2</td>
<td>Map Test 2</td>
</tr>
<tr>
<td>localhost:1234/map3</td>
<td>Hello from non-Map delegate.</td>
</tr>
</tbody></table>

```csharp
app.Map("/level1", level1App => {
    level1App.Map("/level2a", level2AApp => {
        // "/level1/level2a" processing
    });
    level1App.Map("/level2b", level2BApp => {
        // "/level1/level2b" processing
    });
});
```

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.Map("/map1/seg1", HandleMultiSeg);

app.Run(async context =>
{
    await context.Response.WriteAsync("Hello from non-Map delegate.");
});

app.Run();

static void HandleMultiSeg(IApplicationBuilder app)
{
    app.Run(async context =>
    {
        await context.Response.WriteAsync("Map Test 1");
    });
}
```

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapWhen(context => context.Request.Query.ContainsKey("branch"), HandleBranch);

app.Run(async context =>
{
    await context.Response.WriteAsync("Hello from non-Map delegate.");
});

app.Run();

static void HandleBranch(IApplicationBuilder app)
{
    app.Run(async context =>
    {
        var branchVer = context.Request.Query["branch"];
        await context.Response.WriteAsync($"Branch used = {branchVer}");
    });
}
```

<table><thead>
<tr>
<th>Request</th>
<th>Response</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>localhost:1234</code></td>
<td><code>Hello from non-Map delegate.</code></td>
</tr>
<tr>
<td><code>localhost:1234/?branch=main</code></td>
<td><code>Branch used = main</code></td>
</tr>
</tbody></table>

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseWhen(context => context.Request.Query.ContainsKey("branch"),
    appBuilder => HandleBranchAndRejoin(appBuilder));

app.Run(async context =>
{
    await context.Response.WriteAsync("Hello from non-Map delegate.");
});

app.Run();

void HandleBranchAndRejoin(IApplicationBuilder app)
{
    var logger = app.ApplicationServices.GetRequiredService<ILogger<Program>>(); 

    app.Use(async (context, next) =>
    {
        var branchVer = context.Request.Query["branch"];
        logger.LogInformation("Branch used = {branchVer}", branchVer);

        // Do work that doesn't write to the Response.
        await next();
        // Do other work that doesn't write to the Response.
    });
}
```

## Built-in middleware

<table><thead>
<tr>
<th>Middleware</th>
<th>Description</th>
<th>Order</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="../../security/authentication/identity?view=aspnetcore-8.0" data-linktype="relative-path">Authentication</a></td>
<td>Provides authentication support.</td>
<td>Before <code>HttpContext.User</code> is needed. Terminal for OAuth callbacks.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.builder.authorizationappbuilderextensions.useauthorization" data-linktype="absolute-path">Authorization</a></td>
<td>Provides authorization support.</td>
<td>Immediately after the Authentication Middleware.</td>
</tr>
<tr>
<td><a href="../../security/gdpr?view=aspnetcore-8.0" data-linktype="relative-path">Cookie Policy</a></td>
<td>Tracks consent from users for storing personal information and enforces minimum standards for cookie fields, such as <code>secure</code> and <code>SameSite</code>.</td>
<td>Before middleware that issues cookies. Examples: Authentication, Session, MVC (TempData).</td>
</tr>
<tr>
<td><a href="../../security/cors?view=aspnetcore-8.0" data-linktype="relative-path">CORS</a></td>
<td>Configures Cross-Origin Resource Sharing.</td>
<td>Before components that use CORS. <code>UseCors</code> currently must go before <code>UseResponseCaching</code> due to <a href="https://github.com/dotnet/aspnetcore/issues/23218" data-linktype="external">this bug</a>.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.diagnostics.developerexceptionpagemiddleware" data-linktype="absolute-path">DeveloperExceptionPage</a></td>
<td>Generates a page with error information that is intended for use only in the Development environment.</td>
<td>Before components that generate errors. The project templates automatically register this middleware as the first middleware in the pipeline when the environment is Development.</td>
</tr>
<tr>
<td><a href="../error-handling?view=aspnetcore-8.0" data-linktype="relative-path">Diagnostics</a></td>
<td>Several separate middlewares that provide a developer exception page, exception handling, status code pages, and the default web page for new apps.</td>
<td>Before components that generate errors. Terminal for exceptions or serving the default web page for new apps.</td>
</tr>
<tr>
<td><a href="../../host-and-deploy/proxy-load-balancer?view=aspnetcore-8.0" data-linktype="relative-path">Forwarded Headers</a></td>
<td>Forwards proxied headers onto the current request.</td>
<td>Before components that consume the updated fields. Examples: scheme, host, client IP, method.</td>
</tr>
<tr>
<td><a href="../../host-and-deploy/health-checks?view=aspnetcore-8.0" data-linktype="relative-path">Health Check</a></td>
<td>Checks the health of an ASP.NET Core app and its dependencies, such as checking database availability.</td>
<td>Terminal if a request matches a health check endpoint.</td>
</tr>
<tr>
<td><a href="../http-requests?view=aspnetcore-8.0#header-propagation-middleware" data-linktype="relative-path">Header Propagation</a></td>
<td>Propagates HTTP headers from the incoming request to the outgoing HTTP Client requests.</td>
<td></td>
</tr>
<tr>
<td><a href="../http-logging/?view=aspnetcore-8.0" data-linktype="relative-path">HTTP Logging</a></td>
<td>Logs HTTP Requests and Responses.</td>
<td>At the beginning of the middleware pipeline.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.builder.httpmethodoverrideextensions" data-linktype="absolute-path">HTTP Method Override</a></td>
<td>Allows an incoming POST request to override the method.</td>
<td>Before components that consume the updated method.</td>
</tr>
<tr>
<td><a href="../../security/enforcing-ssl?view=aspnetcore-8.0#require-https" data-linktype="relative-path">HTTPS Redirection</a></td>
<td>Redirect all HTTP requests to HTTPS.</td>
<td>Before components that consume the URL.</td>
</tr>
<tr>
<td><a href="../../security/enforcing-ssl?view=aspnetcore-8.0#http-strict-transport-security-protocol-hsts" data-linktype="relative-path">HTTP Strict Transport Security (HSTS)</a></td>
<td>Security enhancement middleware that adds a special response header.</td>
<td>Before responses are sent and after components that modify requests. Examples: Forwarded Headers, URL Rewriting.</td>
</tr>
<tr>
<td><a href="../../mvc/overview?view=aspnetcore-8.0" data-linktype="relative-path">MVC</a></td>
<td>Processes requests with MVC/Razor Pages.</td>
<td>Terminal if a request matches a route.</td>
</tr>
<tr>
<td><a href="../owin?view=aspnetcore-8.0" data-linktype="relative-path">OWIN</a></td>
<td>Interop with OWIN-based apps, servers, and middleware.</td>
<td>Terminal if the OWIN Middleware fully processes the request.</td>
</tr>
<tr>
<td><a href="../../performance/caching/output?view=aspnetcore-8.0" data-linktype="relative-path">Output Caching</a></td>
<td>Provides support for caching responses based on configuration.</td>
<td>Before components that require caching. <code>UseRouting</code> must come before <code>UseOutputCaching</code>. <code>UseCORS</code> must come before <code>UseOutputCaching</code>.</td>
</tr>
<tr>
<td><a href="../../performance/caching/middleware?view=aspnetcore-8.0" data-linktype="relative-path">Response Caching</a></td>
<td>Provides support for caching responses. This requires client participation to work. ```Use``` output caching for complete server control.</td>
<td>Before components that require caching. <code>UseCORS</code> must come before <code>UseResponseCaching</code>. Is typically not beneficial for UI apps such as Razor Pages because browsers generally set request headers that prevent caching. <a href="../../performance/caching/output?view=aspnetcore-8.0" data-linktype="relative-path">Output caching</a> benefits UI apps.</td>
</tr>
<tr>
<td><a href="request-decompression?view=aspnetcore-8.0" data-linktype="relative-path">Request Decompression</a></td>
<td>Provides support for decompressing requests.</td>
<td>Before components that read the request body.</td>
</tr>
<tr>
<td><a href="../../performance/response-compression?view=aspnetcore-8.0" data-linktype="relative-path">Response Compression</a></td>
<td>Provides support for compressing responses.</td>
<td>Before components that require compression.</td>
</tr>
<tr>
<td><a href="../localization?view=aspnetcore-8.0" data-linktype="relative-path">Request Localization</a></td>
<td>Provides localization support.</td>
<td>Before localization sensitive components. Must appear after Routing Middleware when using <a href="/en-us/dotnet/api/microsoft.aspnetcore.localization.routing.routedatarequestcultureprovider" class="no-loc" data-linktype="absolute-path">RouteDataRequestCultureProvider</a>.</td>
</tr>
<tr>
<td><a href="../../performance/timeouts?view=aspnetcore-8.0" data-linktype="relative-path">Request Timeouts</a></td>
<td>Provides support for configuring request timeouts, global and per endpoint.</td>
<td><code>UseRequestTimeouts</code> must come after <code>UseExceptionHandler</code>, <code>UseDeveloperExceptionPage</code>, and <code>UseRouting</code>.</td>
</tr>
<tr>
<td><a href="../routing?view=aspnetcore-8.0" data-linktype="relative-path">Endpoint Routing</a></td>
<td>Defines and constrains request routes.</td>
<td>Terminal for matching routes.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.builder.spaapplicationbuilderextensions.usespa" data-linktype="absolute-path">SPA</a></td>
<td>Handles all requests from this point in the middleware chain by returning the default page for the Single Page Application (SPA)</td>
<td>Late in the chain, so that other middleware for serving static files, MVC actions, etc., takes precedence.</td>
</tr>
<tr>
<td><a href="../app-state?view=aspnetcore-8.0" data-linktype="relative-path">Session</a></td>
<td>Provides support for managing user sessions.</td>
<td>Before components that require Session.</td>
</tr>
<tr>
<td><a href="../static-files?view=aspnetcore-8.0" data-linktype="relative-path">Static Files</a></td>
<td>Provides support for serving static files and directory browsing.</td>
<td>Terminal if a request matches a file.</td>
</tr>
<tr>
<td><a href="../url-rewriting?view=aspnetcore-8.0" data-linktype="relative-path">URL Rewrite</a></td>
<td>Provides support for rewriting URLs and redirecting requests.</td>
<td>Before components that consume the URL.</td>
</tr>
<tr>
<td><a href="../w3c-logger/?view=aspnetcore-8.0" data-linktype="relative-path">W3CLogging</a></td>
<td>Generates server access logs in the <a href="https://www.w3.org/TR/WD-logfile.html" data-linktype="external">W3C Extended Log File Format</a>.</td>
<td>At the beginning of the middleware pipeline.</td>
</tr>
<tr>
<td><a href="../websockets?view=aspnetcore-8.0" data-linktype="relative-path">WebSockets</a></td>
<td>Enables the WebSockets protocol.</td>
<td>Before components that are required to accept WebSocket requests.</td>
</tr>
</tbody></table>

## Additional resources

 - Lifetime and registration options contains a complete sample of middleware with scoped, transient, and singleton lifetime services.

 - Write custom ASP.NET Core middleware

 - Test ASP.NET Core middleware

 - Configure gRPC-Web in ASP.NET Core

 - Migrate HTTP handlers and modules to ASP.NET Core middleware

 - App startup in ASP.NET Core

 - Request Features in ASP.NET Core

 - Factory-based middleware activation in ASP.NET Core

 - Middleware activation with a third-party container in ASP.NET Core

Ref: [ASP.NET Core Middleware](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/?view=aspnetcore-8.0)