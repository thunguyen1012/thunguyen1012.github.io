---
title: Security and Identity - Enable Cross-Origin Requests (CORS)
published: true
date: 2024-09-23 04:46:45
tags: Summary, AspNetCore
description: 
image:
---

## In this article

 - Is a W3C standard that allows a server to relax the same-origin policy.

 - Is not a security feature, CORS relaxes security. An API is not safer by allowing CORS. For more information, see How CORS works.

 - Allows a server to explicitly allow some cross-origin requests while rejecting others.

 - Is safer and more flexible than earlier techniques, such as JSONP.

## Same origin

 - ```https://example.com/foo.html```

 - ```https://example.com/bar.html```

 - ```https://example.net```: Different domain

 - ```https://contoso.example.com/foo.html```: Different subdomain

 - ```http://example.com/foo.html```: Different scheme

 - ```https://example.com:9000/foo.html```: Different port

## Enable CORS

 - In middleware using a named policy or default policy.

 - Using endpoint routing.

 - With the [EnableCors] attribute.

> Warning
UseCors must be called in the correct order. For more information, see Middleware order. For example, ```UseCors``` must be called before ```UseResponseCaching``` when using ```UseResponseCaching```.

## CORS with named policy and middleware

```csharp
var  MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy  =>
                      {
                          policy.WithOrigins("http://example.com",
                                              "http://www.contoso.com");
                      });
});

// services.AddResponseCaching();

builder.Services.AddControllers();

var app = builder.Build();
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseCors(MyAllowSpecificOrigins);

app.UseAuthorization();

app.MapControllers();

app.Run();
```

 - Sets the policy name to ```_myAllowSpecificOrigins```. The policy name is arbitrary.

 - Calls the ```UseCors``` extension method and specifies the  ```_myAllowSpecificOrigins``` CORS policy. ```UseCors``` adds the CORS middleware. The call to ```UseCors``` must be placed after ```UseRouting```, but before ```UseAuthorization```. For more information, see Middleware order.

 - Calls AddCors with a lambda expression. The lambda takes a CorsPolicyBuilder object. Configuration options, such as ```WithOrigins```, are described later in this article.

 - Enables the ```_myAllowSpecificOrigins``` CORS policy for all controller endpoints. See endpoint routing to apply a CORS policy to specific endpoints.

 - When using Response Caching Middleware, call ```UseCors``` before ```UseResponseCaching```.

```csharp
var  MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy  =>
                      {
                          policy.WithOrigins("http://example.com",
                                              "http://www.contoso.com");
                      });
});

// services.AddResponseCaching();

builder.Services.AddControllers();

var app = builder.Build();
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseCors(MyAllowSpecificOrigins);

app.UseAuthorization();

app.MapControllers();

app.Run();
```

```csharp
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy(MyAllowSpecificOrigins,
                          policy =>
                          {
                              policy.WithOrigins("http://example.com",
                                                  "http://www.contoso.com")
                                                  .AllowAnyHeader()
                                                  .AllowAnyMethod();
                          });
});

builder.Services.AddControllers();

var app = builder.Build();
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseCors(MyAllowSpecificOrigins);

app.UseAuthorization();

app.MapControllers();

app.Run();
```

## ```UseCors``` and ```UseStaticFiles``` order

### CORS with default policy and middleware

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        policy =>
        {
            policy.WithOrigins("http://example.com",
                                "http://www.contoso.com");
        });
});

builder.Services.AddControllers();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.Run();
```

## Enable Cors with endpoint routing

```csharp
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                          policy.WithOrigins("http://example.com",
                                              "http://www.contoso.com");
                      });
});

builder.Services.AddControllers();
builder.Services.AddRazorPages();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseCors();

app.UseAuthorization();

app.UseEndpoints(endpoints =>
{
    endpoints.MapGet("/echo",
        context => context.Response.WriteAsync("echo"))
        .RequireCors(MyAllowSpecificOrigins);

    endpoints.MapControllers()
             .RequireCors(MyAllowSpecificOrigins);

    endpoints.MapGet("/echo2",
        context => context.Response.WriteAsync("echo2"));

    endpoints.MapRazorPages();
});

app.Run();
```

 - ```app.UseCors``` enables the CORS middleware. Because a default policy hasn't been configured, ```app.UseCors```() alone doesn't enable CORS.

 - The ```/echo``` and controller endpoints allow cross-origin requests using the specified policy.

 - The ```/echo2``` and Razor Pages endpoints do not allow cross-origin requests because no default policy was specified.

## Enable CORS with attributes

 - [EnableCors] specifies the default policy.

 - [EnableCors("{Policy String}")] specifies a named policy.

 - Razor Page ```PageModel```

 - Controller

 - Controller action method

```csharp
[Route("api/[controller]")]
[ApiController]
public class WidgetController : ControllerBase
{
    // GET api/values
    [EnableCors("AnotherPolicy")]
    [HttpGet]
    public ActionResult<IEnumerable<string>> Get()
    {
        return new string[] { "green widget", "red widget" };
    }

    // GET api/values/5
    [EnableCors("Policy1")]
    [HttpGet("{id}")]
    public ActionResult<string> Get(int id)
    {
        return id switch
        {
            1 => "green widget",
            2 => "red widget",
            _ => NotFound(),
        };
    }
}
```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("Policy1",
        policy =>
        {
            policy.WithOrigins("http://example.com",
                                "http://www.contoso.com");
        });

    options.AddPolicy("AnotherPolicy",
        policy =>
        {
            policy.WithOrigins("http://www.contoso.com")
                                .AllowAnyHeader()
                                .AllowAnyMethod();
        });
});

builder.Services.AddControllers();

var app = builder.Build();

app.UseHttpsRedirection();

app.UseRouting();

app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.Run();
```

 - Use [EnableCors("MyPolicy")] with a named policy.

 - Don't define a default policy.

 - Don't use endpoint routing.

### Disable CORS

```csharp
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: "MyPolicy",
        policy =>
        {
            policy.WithOrigins("http://example.com",
                                "http://www.contoso.com")
                    .WithMethods("PUT", "DELETE", "GET");
        });
});

builder.Services.AddControllers();
builder.Services.AddRazorPages();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseCors();

app.UseAuthorization();

app.UseEndpoints(endpoints => {
    endpoints.MapControllers();
    endpoints.MapRazorPages();
});

app.Run();
```

```csharp
[EnableCors("MyPolicy")]
[Route("api/[controller]")]
[ApiController]
public class ValuesController : ControllerBase
{
    // GET api/values
    [HttpGet]
    public IActionResult Get() =>
        ControllerContext.MyDisplayRouteInfo();

    // GET api/values/5
    [HttpGet("{id}")]
    public IActionResult Get(int id) =>
        ControllerContext.MyDisplayRouteInfo(id);

    // PUT api/values/5
    [HttpPut("{id}")]
    public IActionResult Put(int id) =>
        ControllerContext.MyDisplayRouteInfo(id);


    // GET: api/values/GetValues2
    [DisableCors]
    [HttpGet("{action}")]
    public IActionResult GetValues2() =>
        ControllerContext.MyDisplayRouteInfo();

}
```

 - Doesn't enable CORS with endpoint routing.

 - Doesn't define a default CORS policy.

 - Uses [EnableCors("MyPolicy")] to enable the "MyPolicy" CORS policy for the controller.

 - Disables CORS for the ```GetValues2``` method.

## CORS policy options

 - Set the allowed origins

 - Set the allowed HTTP methods

 - Set the allowed request headers

 - Set the exposed response headers

 - Credentials in cross-origin requests

 - Set the preflight expiration time

## Set the allowed origins

> Note
Specifying ```AllowAnyOrigin``` and ```AllowCredentials``` is an insecure configuration and can result in cross-site request forgery. The CORS service returns an invalid CORS response when an app is configured with both methods.

```csharp
var MyAllowSpecificOrigins = "_MyAllowSubdomainPolicy";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy =>
        {
            policy.WithOrigins("https://*.example.com")
                .SetIsOriginAllowedToAllowWildcardSubdomains();
        });
});

builder.Services.AddControllers();

var app = builder.Build();
```

### Set the allowed HTTP methods

 - Allows any HTTP method:

 - Affects preflight requests and the ```Access-Control-Allow-Methods``` header. For more information, see the Preflight requests section.

### Set the allowed request headers

```csharp
using Microsoft.Net.Http.Headers;

var MyAllowSpecificOrigins = "_MyAllowSubdomainPolicy";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
       policy =>
       {
           policy.WithOrigins("http://example.com")
                  .WithHeaders(HeaderNames.ContentType, "x-custom-header");
       });
});

builder.Services.AddControllers();

var app = builder.Build();
```

```csharp
var MyAllowSpecificOrigins = "_MyAllowSubdomainPolicy";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy =>
        {
            policy.WithOrigins("https://*.example.com")
                   .AllowAnyHeader();
        });
});

builder.Services.AddControllers();

var app = builder.Build();
```

```csharp
app.UseCors(policy => policy.WithHeaders(HeaderNames.CacheControl));
```

### Set the exposed response headers

 - ```Cache-Control```

 - ```Content-Language```

 - ```Content-Type```

 - ```Expires```

 - ```Last-Modified```

 - ```Pragma```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("MyExposeResponseHeadersPolicy",
        policy =>
        {
            policy.WithOrigins("https://*.example.com")
                   .WithExposedHeaders("x-custom-header");
        });
});

builder.Services.AddControllers();

var app = builder.Build();
```

### Credentials in cross-origin requests

```javascript
var xhr = new XMLHttpRequest();
xhr.open('get', 'https://www.example.com/api/test');
xhr.withCredentials = true;
```

```javascript
$.ajax({
  type: 'get',
  url: 'https://www.example.com/api/test',
  xhrFields: {
    withCredentials: true
  }
});
```

```javascript
fetch('https://www.example.com/api/test', {
    credentials: 'include'
});
```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("MyMyAllowCredentialsPolicy",
        policy =>
        {
            policy.WithOrigins("http://example.com")
                   .AllowCredentials();
        });
});

builder.Services.AddControllers();

var app = builder.Build();
```

## Preflight requests

 - The request method is GET, HEAD, or POST.

 - The app doesn't set request headers other than ```Accept```, ```Accept-Language```, ```Content-Language```, ```Content-Type```, or ```Last-Event-ID```.

 - The ```Content-Type``` header, if set, has one of the following values:

   - ```application/x-www-form-urlencoded```

   - ```multipart/form-data```

   - ```text/plain```

> Note
This article contains URLs created by deploying the sample code to two Azure web sites, ```https://cors3.azurewebsites.net``` and ```https://cors.azurewebsites.net```.

 - Access-Control-Request-Method: The HTTP method that will be used for the actual request.

 - ```Access-Control-Request-Headers```: A list of request headers that the app sets on the actual request. As stated earlier, this doesn't include headers that the browser sets, such as ```User-Agent```.

 - Firefox: Cross-Origin Request Blocked: The Same ```Origin``` Policy disallows reading the remote resource at ```https://cors1.azurewebsites.net/api/TodoItems1/MyDelete2/5```. (Reason: CORS request did not succeed). Learn More

 - Chromium based: Access to fetch at 'https://cors1.azurewebsites.net/api/TodoItems1/MyDelete2/5' from origin 'https://cors3.azurewebsites.net' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.

```csharp
using Microsoft.Net.Http.Headers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("MyAllowHeadersPolicy",
        policy =>
        {
        policy.WithOrigins("http://example.com")
                   .WithHeaders(HeaderNames.ContentType, "x-custom-header");
        });
});

builder.Services.AddControllers();

var app = builder.Build();
```

```csharp
using Microsoft.Net.Http.Headers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("MyAllowAllHeadersPolicy",
        policy =>
        {
            policy.WithOrigins("https://*.example.com")
                   .AllowAnyHeader();
        });
});

builder.Services.AddControllers();

var app = builder.Build();
```

 - Headers are set to anything other than "*"

 - ```AllowAnyHeader``` is called:
Include at least ```Accept```, ```Content-Type```, and ```Origin```, plus any custom headers that you want to support.

### Automatic preflight request code

 - Globally by calling ```app.UseCors``` in  ```Program.cs```.

 - Using the [EnableCors] attribute.

### [HttpOptions] attribute for preflight requests

```csharp
[Route("api/[controller]")]
[ApiController]
public class TodoItems2Controller : ControllerBase
{
    // OPTIONS: api/TodoItems2/5
    [HttpOptions("{id}")]
    public IActionResult PreflightRoute(int id)
    {
        return NoContent();
    }

    // OPTIONS: api/TodoItems2 
    [HttpOptions]
    public IActionResult PreflightRoute()
    {
        return NoContent();
    }

    [HttpPut("{id}")]
    public IActionResult PutTodoItem(int id)
    {
        if (id < 1)
        {
            return BadRequest();
        }

        return ControllerContext.MyDisplayRouteInfo(id);
    }
```

### Set the preflight expiration time

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("MySetPreflightExpirationPolicy",
        policy =>
        {
            policy.WithOrigins("http://example.com")
                   .SetPreflightMaxAge(TimeSpan.FromSeconds(2520));
        });
});

builder.Services.AddControllers();

var app = builder.Build();
```

## Enable CORS on an endpoint

## How CORS works

 - CORS is not a security feature. CORS is a W3C standard that allows a server to relax the same-origin policy.

   - For example, a malicious actor could use Cross-Site Scripting (XSS) against your site and execute a cross-site request to their CORS enabled site to steal information.

 - An API isn't safer by allowing CORS.

   - It's up to the client (browser) to enforce CORS. The server executes the request and returns the response, it's the client that returns an error and blocks the response. For example, any of the following tools will display the server response:

     - Fiddler

     - .NET HttpClient

     - A web browser by entering the URL in the address bar.

 - It's a way for a server to allow browsers to execute a cross-origin XHR or Fetch API request that otherwise would be forbidden.

   - Browsers without CORS can't do cross-origin requests. Before CORS, JSONP was used to circumvent this restriction. JSONP doesn't use XHR, it uses the <script> tag to receive the response. Scripts are allowed to be loaded cross-origin.

 - Provides the domain of the site that's making the request.

 - Is required and must be different from the host.

### HTTP redirection to HTTPS causes ```ERR_INVALID_REDIRECT on the CORS preflight request```

## CORS in IIS

## Test CORS

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: "MyPolicy",
        policy =>
        {
            policy.WithOrigins("http://example.com",
                    "http://www.contoso.com",
                    "https://cors1.azurewebsites.net",
                    "https://cors3.azurewebsites.net",
                    "https://localhost:44398",
                    "https://localhost:5001")
                .WithMethods("PUT", "DELETE", "GET");
        });
});

builder.Services.AddControllers();
builder.Services.AddRazorPages();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseCors();

app.UseAuthorization();

app.MapControllers();
app.MapRazorPages();

app.Run();
```

> Warning
WithOrigins("https://localhost:<port>"); should only be used for testing a sample app similar to the download sample code.

```csharp
[EnableCors("MyPolicy")]
[Route("api/[controller]")]
[ApiController]
public class ValuesController : ControllerBase
{
    // GET api/values
    [HttpGet]
    public IActionResult Get() =>
        ControllerContext.MyDisplayRouteInfo();

    // GET api/values/5
    [HttpGet("{id}")]
    public IActionResult Get(int id) =>
        ControllerContext.MyDisplayRouteInfo(id);

    // PUT api/values/5
    [HttpPut("{id}")]
    public IActionResult Put(int id) =>
        ControllerContext.MyDisplayRouteInfo(id);


    // GET: api/values/GetValues2
    [DisableCors]
    [HttpGet("{action}")]
    public IActionResult GetValues2() =>
        ControllerContext.MyDisplayRouteInfo();

}
```

 - Run the sample with ```dotnet run``` using the default URL of ```https://localhost:5001```.

 - Run the sample from Visual Studio with the port set to 44398 for a URL of ```https://localhost:44398```.

 - Select the Values button and review the headers in the Network tab.

 - Select the PUT test button. See Display ```OPTIONS``` requests for instructions on displaying the ```OPTIONS``` request. The PUT test creates two requests, an ```OPTIONS``` preflight request and the PUT request.

 - Select the ```GetValues2``` [DisableCors] button to trigger a failed CORS request. As mentioned in the document, the response returns 200 success, but the CORS request is not made. Select the Console tab to see the CORS error. Depending on the browser, an error similar to the following is displayed:
Access to fetch at 'https://cors1.azurewebsites.net/api/values/GetValues2' from origin 'https://cors3.azurewebsites.net' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.

 - There's no need for CORS Middleware to process the request.

 - CORS headers aren't returned in the response.

```bash
curl -X OPTIONS https://cors3.azurewebsites.net/api/TodoItems2/5 -i
```

### Test CORS with [EnableCors] attribute and ```RequireCors``` method

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: "MyPolicy",
        policy =>
        {
            policy.WithOrigins("http://example.com",
                    "http://www.contoso.com",
                    "https://cors1.azurewebsites.net",
                    "https://cors3.azurewebsites.net",
                    "https://localhost:44398",
                    "https://localhost:5001")
                .WithMethods("PUT", "DELETE", "GET");
        });
});

builder.Services.AddControllers();
builder.Services.AddRazorPages();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseCors();

app.UseAuthorization();

app.UseEndpoints(endpoints =>
{
    endpoints.MapGet("/echo",
        context => context.Response.WriteAsync("echo"))
        .RequireCors("MyPolicy");

    endpoints.MapControllers();
    endpoints.MapRazorPages();
});

app.Run();
```

```csharp
[Route("api/[controller]")]
[ApiController]
public class TodoItems1Controller : ControllerBase 
{
    // PUT: api/TodoItems1/5
    [HttpPut("{id}")]
    public IActionResult PutTodoItem(int id) {
        if (id < 1) {
            return Content($"ID = {id}");
        }

        return ControllerContext.MyDisplayRouteInfo(id);
    }

    // Delete: api/TodoItems1/5
    [HttpDelete("{id}")]
    public IActionResult MyDelete(int id) =>
        ControllerContext.MyDisplayRouteInfo(id);

    // GET: api/TodoItems1
    [HttpGet]
    public IActionResult GetTodoItems() =>
        ControllerContext.MyDisplayRouteInfo();

    [EnableCors("MyPolicy")]
    [HttpGet("{action}")]
    public IActionResult GetTodoItems2() =>
        ControllerContext.MyDisplayRouteInfo();

    // Delete: api/TodoItems1/MyDelete2/5
    [EnableCors("MyPolicy")]
    [HttpDelete("{action}/{id}")]
    public IActionResult MyDelete2(int id) =>
        ControllerContext.MyDisplayRouteInfo(id);
}
```

```javascript
headers: {
      "Content-Type": "x-custom-header"
 },
```

```csharp
[Route("api/[controller]")]
[ApiController]
public class TodoItems2Controller : ControllerBase
{
    // OPTIONS: api/TodoItems2/5
    [HttpOptions("{id}")]
    public IActionResult PreflightRoute(int id)
    {
        return NoContent();
    }

    // OPTIONS: api/TodoItems2 
    [HttpOptions]
    public IActionResult PreflightRoute()
    {
        return NoContent();
    }

    [HttpPut("{id}")]
    public IActionResult PutTodoItem(int id)
    {
        if (id < 1)
        {
            return BadRequest();
        }

        return ControllerContext.MyDisplayRouteInfo(id);
    }

    // [EnableCors] // Not needed as OPTIONS path provided.
    [HttpDelete("{id}")]
    public IActionResult MyDelete(int id) =>
        ControllerContext.MyDisplayRouteInfo(id);

    // [EnableCors] //  Warning ASP0023 Route '{id}' conflicts with another action route.
    //                  An HTTP request that matches multiple routes results in an ambiguous
    //                  match error.
    [EnableCors("MyPolicy")] // Required for this path.
    [HttpGet]
    public IActionResult GetTodoItems() =>
        ControllerContext.MyDisplayRouteInfo();

    [HttpGet("{action}")]
    public IActionResult GetTodoItems2() =>
        ControllerContext.MyDisplayRouteInfo();

    [EnableCors("MyPolicy")]  // Required for this path.
    [HttpDelete("{action}/{id}")]
    public IActionResult MyDelete2(int id) =>
        ControllerContext.MyDisplayRouteInfo(id);
}
```

## Additional resources

 - Cross-Origin Resource Sharing (CORS)

 - IIS CORS module Configuration Reference

Ref: [Enable Cross-Origin Requests (CORS) in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-8.0)