---
title: Fundamentals - Routing
published: true
date: 2024-09-05 04:44:01
tags: Summary, AspNetCore
description: By Ryan Nowak, Kirk Larkin, and Rick Anderson
image:
---

## In this article

 - Controllers

 - Razor Pages

 - SignalR

 - gRPC Services

 - ```Endpoint```-enabled middleware such as Health Checks.

 - Delegates and lambdas registered with routing.

 - For controllers, see Routing to ```controller``` actions in ASP.NET Core.

 - For Razor Pages conventions, see Razor Pages route and app conventions in ASP.NET Core.

## Routing basics

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
```

 - When an HTTP ```GET``` request is sent to the root URL /:

   - The request delegate executes.

   - Hello World! is written to the HTTP response.

 - If the request method is not ```GET``` or the root URL is not /, no route matches and an HTTP ```404``` is returned.

 - ```UseRouting``` adds route matching to the middleware pipeline. This middleware looks at the set of endpoints defined in the app, and selects the best match based on the request.

 - ```UseEndpoints``` adds endpoint execution to the middleware pipeline. It runs the delegate associated with the selected endpoint.

```csharp
app.Use(async (context, next) =>
{
    // ...
    await next(context);
});

app.UseRouting();

app.MapGet("/", () => "Hello World!");
```

 - The call to ```app.Use``` registers a custom middleware that runs at the start of the pipeline.

 - The call to ```UseRouting``` configures the route matching middleware to run after the custom middleware.

 - The endpoint registered with ```MapGet``` runs at the end of the pipeline.

### Endpoints

 - Selected, by matching the URL and HTTP method.

 - Executed, by running the delegate.

 - MapRazorPages for Razor Pages

 - MapControllers for controllers

 - MapHub<THub> for SignalR

 - MapGrpcService<TService> for gRPC

```csharp
app.MapGet("/hello/{name:alpha}", (string name) => $"Hello {name}!");
```

 - A URL like ```/hello/Docs```

 - Any URL path that begins with ```/hello```/ followed by a sequence of alphabetic characters. ```:alpha``` applies a route constraint that matches only alphabetic characters. Route constraints are explained later in this article.

 - Is bound to the name parameter.

 - Is captured and stored in ```HttpRequest.RouteValues```.

```csharp
app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/healthz").RequireAuthorization();
app.MapGet("/", () => "Hello World!");
```

 - The authorization middleware can be used with routing.

 - Endpoints can be used to configure authorization behavior.

 - See which endpoint was selected by ```UseRouting```.

 - Apply an authorization policy before ```UseEndpoints``` dispatches to the endpoint.

### ```Endpoint``` metadata

 - The metadata can be processed by routing-aware middleware.

 - The metadata can be of any ```.```NET type.

## Routing concepts

### ASP.NET Core endpoint definition

 - Executable: Has a RequestDelegate.

 - Extensible: Has a Metadata collection.

 - Selectable: Optionally, has routing information.

 - Enumerable: The collection of endpoints can be listed by retrieving the ```EndpointDataSource``` from DI.

```csharp
app.Use(async (context, next) =>
{
    var currentEndpoint = context.GetEndpoint();

    if (currentEndpoint is null)
    {
        await next(context);
        return;
    }

    Console.WriteLine($"Endpoint: {currentEndpoint.DisplayName}");

    if (currentEndpoint is RouteEndpoint routeEndpoint)
    {
        Console.WriteLine($"  - Route Pattern: {routeEndpoint.RoutePattern}");
    }

    foreach (var endpointMetadata in currentEndpoint.Metadata)
    {
        Console.WriteLine($"  - Metadata: {endpointMetadata}");
    }

    await next(context);
});

app.MapGet("/", () => "Inspect Endpoint.");
```

```csharp
// Location 1: before routing runs, endpoint is always null here.
app.Use(async (context, next) =>
{
    Console.WriteLine($"1. Endpoint: {context.GetEndpoint()?.DisplayName ?? "(null)"}");
    await next(context);
});

app.UseRouting();

// Location 2: after routing runs, endpoint will be non-null if routing found a match.
app.Use(async (context, next) =>
{
    Console.WriteLine($"2. Endpoint: {context.GetEndpoint()?.DisplayName ?? "(null)"}");
    await next(context);
});

// Location 3: runs when this endpoint matches
app.MapGet("/", (HttpContext context) =>
{
    Console.WriteLine($"3. Endpoint: {context.GetEndpoint()?.DisplayName ?? "(null)"}");
    return "Hello World!";
}).WithDisplayName("Hello");

app.UseEndpoints(_ => { });

// Location 4: runs after UseEndpoints - will only run if there was no match.
app.Use(async (context, next) =>
{
    Console.WriteLine($"4. Endpoint: {context.GetEndpoint()?.DisplayName ?? "(null)"}");
    await next(context);
});
```

```txt
1. Endpoint: (null)
2. Endpoint: Hello
3. Endpoint: Hello
```

```txt
1. Endpoint: (null)
2. Endpoint: (null)
4. Endpoint: (null)
```

 - The endpoint is always ```null``` before ```UseRouting``` is called.

 - If a match is found, the endpoint is non-null between ```UseRouting``` and ```UseEndpoints```.

 - The ```UseEndpoints``` middleware is terminal when a match is found. Terminal middleware is defined later in this article.

 - The middleware after ```UseEndpoints``` execute only when no match is found.

```csharp
app.UseHttpMethodOverride();
app.UseRouting();

app.Use(async (context, next) =>
{
    if (context.GetEndpoint()?.Metadata.GetMetadata<RequiresAuditAttribute>() is not null)
    {
        Console.WriteLine($"ACCESS TO SENSITIVE DATA AT: {DateTime.UtcNow}");
    }

    await next(context);
});

app.MapGet("/", () => "Audit isn't required.");
app.MapGet("/sensitive", () => "Audit required for sensitive data.")
    .WithMetadata(new RequiresAuditAttribute());
```

```csharp
public class RequiresAuditAttribute : Attribute { }
```

 - Middleware can run before ```UseRouting``` to modify the data that routing operates upon.

   - Usually middleware that appears before routing modifies some property of the request, such as UseRewriter, UseHttpMethodOverride, or UsePathBase.

 - Middleware can run between ```UseRouting``` and ```UseEndpoints``` to process the results of routing before the endpoint is executed.

   - Middleware that runs between ```UseRouting``` and ```UseEndpoints```:

     - Usually inspects metadata to understand the endpoints.

     - Often makes security decisions, as done by ```UseAuthorization``` and ```UseCors```.

   - The combination of middleware and metadata allows configuring policies per-endpoint.

 - Log to a file or database.

 - Include details such as the user, IP address, name of the sensitive endpoint, and more.

 - Metadata is attached with a builder API.

 - Class-based frameworks include all attributes on the corresponding method and class when creating endpoints.

### Compare terminal middleware with routing

```csharp
// Approach 1: Terminal Middleware.
app.Use(async (context, next) =>
{
    if (context.Request.Path == "/")
    {
        await context.Response.WriteAsync("Terminal Middleware.");
        return;
    }

    await next(context);
});

app.UseRouting();

// Approach 2: Routing.
app.MapGet("/Routing", () => "Routing.");
```

 - The matching operation in the preceding sample is Path == "/" for the middleware and Path == "/Routing" for routing.

 - When a match is successful, it executes some functionality and returns, rather than invoking the ```next``` middleware.

 - Both approaches allow terminating the processing pipeline:

   - Middleware terminates the pipeline by returning rather than invoking ```next```.

   - Endpoints are always terminal.

 - Terminal middleware allows positioning the middleware at an arbitrary place in the pipeline:

   - Endpoints execute at the position of ```UseEndpoints```.

 - Terminal middleware allows arbitrary code to determine when the middleware matches:

   - Custom route matching code can be verbose and difficult to write correctly.

   - Routing provides straightforward solutions for typical apps. Most apps don't require custom route matching code.

 - Endpoints interface with middleware such as ```UseAuthorization``` and ```UseCors```.

   - Using a terminal middleware with ```UseAuthorization``` or ```UseCors``` requires manual interfacing with the authorization system.

 - A delegate to process requests.

 - A collection of arbitrary metadata. The metadata is used to implement cross-cutting concerns based on policies and configuration attached to each endpoint.

 - A significant amount of coding and testing.

 - Manual integration with other systems to achieve the desired level of flexibility.

 - Write an extension method on IEndpointRouteBuilder.

 - Create a nested middleware pipeline using CreateApplicationBuilder.

 - Attach the middleware to the new pipeline. In this case, UseHealthChecks.

 - Build the middleware pipeline into a RequestDelegate.

 - Call ```Map``` and provide the new middleware pipeline.

 - Return the builder object provided by ```Map``` from the extension method.

```csharp
app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/healthz").RequireAuthorization();
```

### URL matching

 - Is the process by which routing matches an incoming request to an endpoint.

 - Is based on data in the URL path and headers.

 - Can be extended to consider any data in the request.

 - Calling ```HttpContext```.GetEndpoint gets the endpoint.

 - ```HttpRequest.RouteValues``` gets the collection of route values.

 - Any decision that can affect dispatching or the application of security policies is made inside the routing system.

> Warning
For backward-compatibility, when a Controller or Razor Pages endpoint delegate is executed, the properties of ```RouteContext```.RouteData are set to appropriate values based on the request processing performed thus far.
The ```RouteContext``` type will be marked obsolete in a future release:

Migrate ```RouteData.Values``` to ```HttpRequest.RouteValues```.
Migrate ```RouteData.DataTokens``` to retrieve IDataTokensMetadata from the endpoint metadata.

  - Migrate ```RouteData.Values``` to ```HttpRequest.RouteValues```.

  - Migrate ```RouteData.DataTokens``` to retrieve IDataTokensMetadata from the endpoint metadata.

 - Processes the URL path against the set of endpoints and their route templates, collecting all of the matches.

 - Takes the preceding list and removes matches that fail with route constraints applied.

 - Takes the preceding list and removes matches that fail the set of MatcherPolicy instances.

 - Uses the ```EndpointSelector``` to make a final decision from the preceding list.

 - The ```RouteEndpoint```.Order

 - The route template precedence

 - Both match the URL path ```/hello```.

 - ```/hello``` is more specific and therefore higher priority.

 - The ```alpha``` constraint matches only alphabetic characters.

 - The ```int``` constraint matches only numbers.

 - These templates have the same route precedence, but there's no single URL they both match.

 - If the routing system reported an ambiguity error at startup, it would block this valid use case.

> Warning
The order of operations inside ```UseEndpoints``` doesn't influence the behavior of routing, with one exception. MapControllerRoute and MapAreaRoute automatically assign an order value to their endpoints based on the order they are invoked. This simulates long-time behavior of controllers without the routing system providing the same guarantees as older routing implementations.
Endpoint routing in ASP.NET Core:

Doesn't have the concept of routes.
Doesn't provide ordering guarantees. All endpoints are processed at once.

  - Doesn't have the concept of routes.

  - Doesn't provide ordering guarantees. All endpoints are processed at once.

### Route template precedence and endpoint selection order

 - Avoids the need to adjust the order of endpoints in common cases.

 - Attempts to match the common-sense expectations of routing behavior.

 - Templates with more segments are considered more specific.

 - A segment with literal text is considered more specific than a parameter segment.

 - A parameter segment with a constraint is considered more specific than one without.

 - A complex segment is considered as specific as a parameter segment with a constraint.

 - Catch-all parameters are the least specific. See catch-all in the Route templates section for important information on catch-all routes.

### URL generation concepts

 - Is the process by which routing can ```create``` a URL path based on a set of route values.

 - Allows for a logical separation between endpoints and the URLs that access them.

 - GetPathByAction

 - GetUriByAction

 - GetPathByPage

 - GetUriByPage

 - An address is bound to a list of endpoints that match the address.

 - Each endpoint's RoutePattern is evaluated until a route pattern that matches the supplied values is found. The resulting output is combined with the other URI parts supplied to the link generator and returned.

<table><thead>
<tr>
<th>Extension Method</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.routing.linkgenerator.getpathbyaddress" class="no-loc" data-linktype="absolute-path">GetPathByAddress</a></td>
<td>Generates a URI with an absolute path based on the provided values.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.routing.linkgenerator.geturibyaddress" class="no-loc" data-linktype="absolute-path">GetUriByAddress</a></td>
<td>Generates an absolute URI based on the provided values.</td>
</tr>
</tbody></table>

> Warning
Pay attention to the following implications of calling ```LinkGenerator``` methods:

Use GetUri* extension methods with caution in an app configuration that doesn't validate the ```Host``` header of incoming requests. If the ```Host``` header of incoming requests isn't validated, untrusted request input can be sent back to the client in URIs in a view or page. We recommend that all production apps configure their server to validate the ```Host``` header against known valid values.

Use ```LinkGenerator``` with caution in middleware in combination with ```Map``` or ```MapWhen```. ```Map```* changes the base path of the executing request, which affects the output of link generation. All of the ```LinkGenerator``` APIs allow specifying a base path. Specify an empty base path to undo the ```Map```* affect on link generation.

  - Use GetUri* extension methods with caution in an app configuration that doesn't validate the ```Host``` header of incoming requests. If the ```Host``` header of incoming requests isn't validated, untrusted request input can be sent back to the client in URIs in a view or page. We recommend that all production apps configure their server to validate the ```Host``` header against known valid values.

  - Use ```LinkGenerator``` with caution in middleware in combination with ```Map``` or ```MapWhen```. ```Map```* changes the base path of the executing request, which affects the output of link generation. All of the ```LinkGenerator``` APIs allow specifying a base path. Specify an empty base path to undo the ```Map```* affect on link generation.

### Middleware example

```csharp
public class ProductsMiddleware
{
    private readonly LinkGenerator _linkGenerator;

    public ProductsMiddleware(RequestDelegate next, LinkGenerator linkGenerator) =>
        _linkGenerator = linkGenerator;

    public async Task InvokeAsync(HttpContext httpContext)
    {
        httpContext.Response.ContentType = MediaTypeNames.Text.Plain;

        var productsPath = _linkGenerator.GetPathByAction("Products", "Store");

        await httpContext.Response.WriteAsync(
            $"Go to {productsPath} to see our products.");
    }
}
```

## Route templates

 - Can be used as a prefix to a route parameter to bind to the rest of the URI.

 - Are called a catch-all parameters. For example, blog/{**slug}:

   - Matches any URI that starts with blog/ and has any value following it.

   - The value following blog/ is assigned to the slug route value.

 - ```/files/myFile.txt```

 - ```/files/myFile```

 - A route parameter with a default value always produces a value.

 - An optional parameter has a value only when a value is provided by the request URL.

<table><thead>
<tr>
<th>Route Template</th>
<th>Example Matching URI</th>
<th>The request URI…</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>hello</code></td>
<td><code>/hello</code></td>
<td>Only matches the single path <code>/hello</code>.</td>
</tr>
<tr>
<td><code>{Page=Home}</code></td>
<td><code>/</code></td>
<td>Matches and sets <code>Page</code> to <code>Home</code>.</td>
</tr>
<tr>
<td><code>{Page=Home}</code></td>
<td><code>/Contact</code></td>
<td>Matches and sets <code>Page</code> to <code>Contact</code>.</td>
</tr>
<tr>
<td><code>{controller}/{action}/{id?}</code></td>
<td><code>/Products/List</code></td>
<td>Maps to the <code>Products</code> ```controller``` and <code>List</code> ```action```.</td>
</tr>
<tr>
<td><code>{controller}/{action}/{id?}</code></td>
<td><code>/Products/Details/123</code></td>
<td>Maps to the <code>Products</code> ```controller``` and  <code>Details</code> ```action``` with<code>id</code> set to 123.</td>
</tr>
<tr>
<td><code>{controller=Home}/{action=Index}/{id?}</code></td>
<td><code>/</code></td>
<td>Maps to the <code>Home</code> ```controller``` and <code>Index</code> method. <code>id</code> is ignored.</td>
</tr>
<tr>
<td><code>{controller=Home}/{action=Index}/{id?}</code></td>
<td><code>/Products</code></td>
<td>Maps to the <code>Products</code> ```controller``` and <code>Index</code> method. <code>id</code> is ignored.</td>
</tr>
</tbody></table>

### Complex segments

> Warning
When using System.Text.RegularExpressions to process untrusted input, pass a timeout. A malicious user can provide input to ```RegularExpressions``` causing a Denial-of-Service attack. ASP.NET Core framework APIs that use ```RegularExpressions``` pass a timeout.

 - The first literal, right to left, is ```c```. So ```/abcd``` is searched from right and finds ```/ab|c|d```.

 - Everything to the right (d) is now matched to the route parameter ```{d}```.

 - The ```next``` literal, right to left, is a. So ```/ab|c|d``` is searched starting where we left off, then a is found ```/|a|b|c|d```.

 - The value to the right (b) is now matched to the route parameter ```{b}```.

 - There is no remaining text and no remaining route template, so this is a match.

 - The first literal, right to left, is ```c```. So ```/aabcd``` is searched from right and finds ```/aab|c|d```.

 - Everything to the right (d) is now matched to the route parameter ```{d}```.

 - The ```next``` literal, right to left, is a. So ```/aab|c|d``` is searched starting where we left off, then a is found ```/a|a|b|c|d```.

 - The value to the right (b) is now matched to the route parameter ```{b}```.

 - At this point there is remaining text a, but the algorithm has run out of route template to parse, so this is not a match.

 - It matches the smallest amount of text possible in each step.

 - Any case where the delimiter value appears inside the parameter values results in not matching.

## Routing with special characters

```csharp
[HttpGet("{id?}/name")]
public async Task<ActionResult<string>> GetName(string id)
{
    var todoItem = await _context.TodoItems.FindAsync(id);

    if (todoItem == null || todoItem.Name == null)
    {
        return NotFound();
    }

    return todoItem.Name;
}
```

<table><thead>
<tr>
<th>ASCII</th>
<th>Encoded</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>/</code></td>
<td><code>%2F</code></td>
</tr>
<tr>
<td><code> </code></td>
<td><code>+</code></td>
</tr>
</tbody></table>

## Route constraints

> Warning
Don't use constraints for input validation. If constraints are used for input validation, invalid input results in a ```404``` Not Found response. Invalid input should produce a ```400``` Bad Request with an appropriate error message. Route constraints are used to disambiguate similar routes, not to validate the inputs for a particular route.

<table><thead>
<tr>
<th>constraint</th>
<th>Example</th>
<th>Example Matches</th>
<th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>int</code></td>
<td><code>{id:int}</code></td>
<td><code>123456789</code>, <code>-123456789</code></td>
<td>Matches any integer</td>
</tr>
<tr>
<td><code>bool</code></td>
<td><code>{active:bool}</code></td>
<td><code>true</code>, <code>FALSE</code></td>
<td>Matches <code>true</code> or <code>false</code>. Case-insensitive</td>
</tr>
<tr>
<td><code>datetime</code></td>
<td><code>{dob:datetime}</code></td>
<td><code>2016-12-31</code>, <code>2016-12-31 7:32pm</code></td>
<td>Matches a valid <code>DateTime</code> value in the invariant ```culture```. See preceding warning.</td>
</tr>
<tr>
<td><code>decimal</code></td>
<td><code>{price:decimal}</code></td>
<td><code>49.99</code>, <code>-1,000.01</code></td>
<td>Matches a valid <code>decimal</code> value in the invariant ```culture```. See preceding warning.</td>
</tr>
<tr>
<td><code>double</code></td>
<td><code>{weight:double}</code></td>
<td><code>1.234</code>, <code>-1,001.01e8</code></td>
<td>Matches a valid <code>double</code> value in the invariant ```culture```. See preceding warning.</td>
</tr>
<tr>
<td><code>float</code></td>
<td><code>{weight:float}</code></td>
<td><code>1.234</code>, <code>-1,001.01e8</code></td>
<td>Matches a valid <code>float</code> value in the invariant ```culture```. See preceding warning.</td>
</tr>
<tr>
<td><code>guid</code></td>
<td><code>{id:guid}</code></td>
<td><code>CD2C1638-1638-72D5-1638-DEADBEEF1638</code></td>
<td>Matches a valid <code>Guid</code> value</td>
</tr>
<tr>
<td><code>long</code></td>
<td><code>{ticks:long}</code></td>
<td><code>123456789</code>, <code>-123456789</code></td>
<td>Matches a valid <code>long</code> value</td>
</tr>
<tr>
<td><code>minlength(value)</code></td>
<td><code>{username:minlength(4)}</code></td>
<td><code>Rick</code></td>
<td>String must be at least 4 characters</td>
</tr>
<tr>
<td><code>maxlength(value)</code></td>
<td><code>{filename:maxlength(8)}</code></td>
<td><code>MyFile</code></td>
<td>String must be no more than 8 characters</td>
</tr>
<tr>
<td><code>length(length)</code></td>
<td><code>{filename:length(12)}</code></td>
<td><code>somefile.txt</code></td>
<td>String must be exactly 12 characters long</td>
</tr>
<tr>
<td><code>length(min,max)</code></td>
<td><code>{filename:length(8,16)}</code></td>
<td><code>somefile.txt</code></td>
<td>String must be at least 8 and no more than 16 characters long</td>
</tr>
<tr>
<td><code>min(value)</code></td>
<td><code>{age:min(18)}</code></td>
<td><code>19</code></td>
<td>Integer value must be at least 18</td>
</tr>
<tr>
<td><code>max(value)</code></td>
<td><code>{age:max(120)}</code></td>
<td><code>91</code></td>
<td>Integer value must be no more than 120</td>
</tr>
<tr>
<td><code>range(min,max)</code></td>
<td><code>{age:range(18,120)}</code></td>
<td><code>91</code></td>
<td>Integer value must be at least 18 but no more than 120</td>
</tr>
<tr>
<td><code>alpha</code></td>
<td><code>{name:alpha}</code></td>
<td><code>Rick</code></td>
<td>String must consist of one or more alphabetical characters, <code>a</code>-<code>z</code> and case-insensitive.</td>
</tr>
<tr>
<td><code>regex(expression)</code></td>
<td><code>{ssn:regex(^\\d{{3}}-\\d{{2}}-\\d{{4}}$)}</code></td>
<td><code>123-45-6789</code></td>
<td>String must match the regular expression. See tips about defining a regular expression.</td>
</tr>
<tr>
<td><code>required</code></td>
<td><code>{name:required}</code></td>
<td><code>Rick</code></td>
<td>Used to enforce that a non-parameter value is present during URL generation</td>
</tr>
</tbody></table>

> Warning
When using System.Text.RegularExpressions to process untrusted input, pass a timeout. A malicious user can provide input to ```RegularExpressions``` causing a Denial-of-Service attack. ASP.NET Core framework APIs that use ```RegularExpressions``` pass a timeout.

```csharp
[Route("users/{id:int:min(1)}")]
public User GetUserById(int id) { }
```

> Warning
Route constraints that verify the URL and are converted to a CLR type always use the invariant ```culture```. For example, conversion to the CLR type ```int``` or ```DateTime```. These constraints assume that the URL is not localizable. The framework-provided route constraints don't modify the values stored in route values. All route values parsed from the URL are stored as strings. For example, the ```float``` constraint attempts to convert the route value to a ```float```, but the converted value is used only to verify it can be converted to a ```float```.

### Regular expressions in constraints

> Warning
When using System.Text.RegularExpressions to process untrusted input, pass a timeout. A malicious user can provide input to ```RegularExpressions``` causing a Denial-of-Service attack. ASP.NET Core framework APIs that use ```RegularExpressions``` pass a timeout.

```csharp
app.MapGet("{message:regex(^\\d{{3}}-\\d{{2}}-\\d{{4}}$)}",
    () => "Inline Regex Constraint Matched");
```

```csharp
app.MapControllerRoute(
    name: "people",
    pattern: "people/{ssn}",
    constraints: new { ssn = "^\\d{3}-\\d{2}-\\d{4}$", },
    defaults: new { controller = "People", action = "List" });
```

 - Replace \ characters provided in the string as \\ characters in the C# source file in order to escape the \ string escape character.

 - Verbatim string literals.

<table><thead>
<tr>
<th>Regular expression</th>
<th>Escaped regular expression</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>^\d{3}-\d{2}-\d{4}$</code></td>
<td><code>^\\d{{3}}-\\d{{2}}-\\d{{4}}$</code></td>
</tr>
<tr>
<td><code>^[a-z]{2}$</code></td>
<td><code>^[[a-z]]{{2}}$</code></td>
</tr>
</tbody></table>

<table><thead>
<tr>
<th>Expression</th>
<th>String</th>
<th style="text-align: center;">Match</th>
<th>Comment</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>[a-z]{2}</code></td>
<td>hello</td>
<td style="text-align: center;">Yes</td>
<td>Substring matches</td>
</tr>
<tr>
<td><code>[a-z]{2}</code></td>
<td>123abc456</td>
<td style="text-align: center;">Yes</td>
<td>Substring matches</td>
</tr>
<tr>
<td><code>[a-z]{2}</code></td>
<td>mz</td>
<td style="text-align: center;">Yes</td>
<td>Matches expression</td>
</tr>
<tr>
<td><code>[a-z]{2}</code></td>
<td>MZ</td>
<td style="text-align: center;">Yes</td>
<td>Not case sensitive</td>
</tr>
<tr>
<td><code>^[a-z]{2}$</code></td>
<td>hello</td>
<td style="text-align: center;">No</td>
<td>See <code>^</code> and <code>$</code> above</td>
</tr>
<tr>
<td><code>^[a-z]{2}$</code></td>
<td>123abc456</td>
<td style="text-align: center;">No</td>
<td>See <code>^</code> and <code>$</code> above</td>
</tr>
</tbody></table>

### Custom route constraints

```csharp
builder.Services.AddRouting(options =>
    options.ConstraintMap.Add("noZeroes", typeof(NoZeroesRouteConstraint)));
```

```csharp
[ApiController]
[Route("api/[controller]")]
public class NoZeroesController : ControllerBase
{
    [HttpGet("{id:noZeroes}")]
    public IActionResult Get(string id) =>
        Content(id);
}
```

```csharp
public class NoZeroesRouteConstraint : IRouteConstraint
{
    private static readonly Regex _regex = new(
        @"^[1-9]*$",
        RegexOptions.CultureInvariant | RegexOptions.IgnoreCase,
        TimeSpan.FromMilliseconds(100));

    public bool Match(
        HttpContext? httpContext, IRouter? route, string routeKey,
        RouteValueDictionary values, RouteDirection routeDirection)
    {
        if (!values.TryGetValue(routeKey, out var routeValue))
        {
            return false;
        }

        var routeValueString = Convert.ToString(routeValue, CultureInfo.InvariantCulture);

        if (routeValueString is null)
        {
            return false;
        }

        return _regex.IsMatch(routeValueString);
    }
}
```

> Warning
When using System.Text.RegularExpressions to process untrusted input, pass a timeout. A malicious user can provide input to ```RegularExpressions``` causing a Denial-of-Service attack. ASP.NET Core framework APIs that use ```RegularExpressions``` pass a timeout.

 - Prevents ```0``` in the ```{id}``` segment of the route.

 - Is shown to provide a basic example of implementing a custom constraint. It should not be used in a production app.

```csharp
[HttpGet("{id}")]
public IActionResult Get(string id)
{
    if (id.Contains('0'))
    {
        return StatusCode(StatusCodes.Status406NotAcceptable);
    }

    return Content(id);
}
```

 - It doesn't require a custom constraint.

 - It returns a more descriptive error when the route parameter includes ```0```.

## Parameter transformers

 - Execute when generating a link using ```LinkGenerator```.

 - Implement ```Microsoft.AspNetCore.Routing```.IOutboundParameterTransformer.

 - Are configured using ```ConstraintMap```.

 - Take the parameter's route value and transform it to a new string value.

 - Result in using the transformed value in the generated link.

```csharp
public class SlugifyParameterTransformer : IOutboundParameterTransformer
{
    public string? TransformOutbound(object? value)
    {
        if (value is null)
        {
            return null;
        }

        return Regex.Replace(
            value.ToString()!,
                "([a-z])([A-Z])",
            "$1-$2",
            RegexOptions.CultureInvariant,
            TimeSpan.FromMilliseconds(100))
            .ToLowerInvariant();
    }
}
```

```csharp
builder.Services.AddRouting(options =>
    options.ConstraintMap["slugify"] = typeof(SlugifyParameterTransformer));
```

```csharp
app.MapControllerRoute(
    name: "default",
    pattern: "{controller:slugify=Home}/{action:slugify=Index}/{id?}");
```

 - The Microsoft.AspNetCore.Mvc.ApplicationModels.RouteTokenTransformerConvention MVC convention applies a specified parameter transformer to all attribute routes in the app. The parameter transformer transforms attribute route tokens as they are replaced. For more information, see Use a parameter transformer to customize token replacement.

 - Razor Pages uses the PageRouteTransformerConvention API convention. This convention applies a specified parameter transformer to all automatically discovered Razor Pages. The parameter transformer transforms the folder and file name segments of Razor Pages routes. For more information, see Use a parameter transformer to customize page routes.

## URL generation reference

### Troubleshooting URL generation with logging

### Addresses

 - Using endpoint name (string) as the address:

   - Provides similar functionality to MVC's route name.

   - Uses the IEndpointNameMetadata metadata type.

   - Resolves the provided string against the metadata of all registered endpoints.

   - Throws an exception on startup if multiple endpoints use the same name.

   - Recommended for general-purpose use outside of controllers and Razor Pages.

 - Using route values (RouteValuesAddress) as the address:

   - Provides similar functionality to controllers and Razor Pages legacy URL generation.

   - Very complex to extend and debug.

   - Provides the implementation used by ```IUrlHelper```, Tag Helpers, HTML Helpers, Action Results, etc.

 - The endpoint name scheme performs a basic dictionary lookup.

 - The route values scheme has a complex best subset of set algorithm.

### Ambient values and explicit values

```csharp
public class WidgetController : ControllerBase
{
    private readonly LinkGenerator _linkGenerator;

    public WidgetController(LinkGenerator linkGenerator) =>
        _linkGenerator = linkGenerator;

    public IActionResult Index()
    {
        var indexPath = _linkGenerator.GetPathByAction(
            HttpContext, values: new { id = 17 })!;

        return Content(indexPath);
    }

    // ...
```

 - Returns ```/Widget/Index/17```

 - Gets ```LinkGenerator``` via DI.

```csharp
var subscribePath = _linkGenerator.GetPathByAction(
    "Subscribe", "Home", new { id = 17 })!;
```

```csharp
var subscribePath = _linkGenerator.GetPathByAction(
    HttpContext, "Subscribe", null, new { id = 17 });
```

```csharp
public class GadgetController : ControllerBase
{
    public IActionResult Index() =>
        Content(Url.Action("Edit", new { id = 17 })!);
}
```

 - ```/Gadget/Edit/17``` is returned.

 - Url gets the ```IUrlHelper```.

 - Action generates a URL with an absolute path for an ```action``` method. The URL contains the specified ```action``` name and route values.

```csharp
public class IndexModel : PageModel
{
    public void OnGet()
    {
        var editUrl = Url.Page("./Edit", new { id = 17 });

        // ...
    }
}
```

 - ```IUrlHelper``` always provides the route values from the current request as ambient values.

 - ```IUrlHelper```.Action always copies the current ```action``` and ```controller``` route values as explicit values unless overridden by the developer.

 - ```IUrlHelper.Page``` always copies the current page route value as an explicit value unless overridden.

 - ```IUrlHelper.Page``` always overrides the current ```handler``` route value with ```null``` as an explicit values unless overridden.

### URL generation process

 - Processes the endpoints iteratively.

 - Returns the first successful result.

 - When linking to another ```action``` in the same ```controller```, the ```controller``` name doesn't need to be specified.

 - When linking to another ```controller``` in the same ```area```, the ```area``` name doesn't need to be specified.

 - When linking to the same ```action``` method, route values don't need to be specified.

 - When linking to another part of the app, you don't want to carry over route values that have no meaning in that part of the app.

 - ```id``` won't be reused because ```{controller}``` is to the left of ```{id?}```.

 - If the explicit values contain a value for ```id```, the ambient value for ```id``` is ignored. The ambient values for ```controller``` and ```action``` can be used.

 - If the explicit values contain a value for ```action```, any ambient value for ```action``` is ignored. The ambient values for ```controller``` can be used. If the explicit value for ```action``` is different from the ambient value for ```action```, the ```id``` value won't be used. If the explicit value for ```action``` is the same as the ambient value for ```action```, the ```id``` value can be used.

 - If the explicit values contain a value for ```controller```, any ambient value for ```controller``` is ignored. If the explicit value for ```controller``` is different from the ambient value for ```controller```, the ```action``` and ```id``` values won't be used. If the explicit value for ```controller``` is the same as the ambient value for ```controller```, the ```action``` and ```id``` values can be used.

 - There is a hierarchy of route values.

 - They don't appear in the template.

 - The required value names are combined with the route parameters, then processed from left-to-right.

 - For each parameter, the ambient value and explicit value are compared:

   - If the ambient value and explicit value are the same, the process continues.

   - If the ambient value is present and the explicit value isn't, the ambient value is used when generating the URL.

   - If the ambient value isn't present and the explicit value is, reject the ambient value and all subsequent ambient values.

   - If the ambient value and the explicit value are present, and the two values are different, reject the ambient value and all subsequent ambient values.

 - From left-to-right.

 - Each parameter has its accepted value substituted.

 - With the following special cases:

   - If the accepted values is missing a value and the parameter has a default value, the default value is used.

   - If the accepted values is missing a value and the parameter is optional, processing continues.

   - If any route parameter to the right of a missing optional parameter has a value, the operation fails.

   - Contiguous default-valued parameters and optional parameters are collapsed where possible.

<table><thead>
<tr>
<th>Ambient Values</th>
<th>Explicit Values</th>
<th>Result</th>
</tr>
</thead>
<tbody>
<tr>
<td>controller = "Home"</td>
<td>action = "About"</td>
<td><code>/Home/About</code></td>
</tr>
<tr>
<td>controller = "Home"</td>
<td>controller = "Order", ```action``` = "About"</td>
<td><code>/Order/About</code></td>
</tr>
<tr>
<td>controller = "Home", ```color``` = "Red"</td>
<td>action = "About"</td>
<td><code>/Home/About</code></td>
</tr>
<tr>
<td>controller = "Home"</td>
<td>action = "About", ```color``` = "Red"</td>
<td><code>/Home/About?color=Red</code></td>
</tr>
</tbody></table>

### Optional route parameter order

```csharp
using Microsoft.AspNetCore.Mvc;

namespace WebApplication1.Controllers;

[Route("api/[controller]")]
public class MyController : ControllerBase
{
    // GET /api/my/red/2/joe
    // GET /api/my/red/2
    // GET /api/my
    [HttpGet("{color}/{id:int?}/{name?}")]
    public IActionResult GetByIdAndOptionalName(string color, int id = 1, string? name = null)
    {
        return Ok($"{color} {id} {name ?? ""}");
    }
}
```

### Problems with route value invalidation

```csharp
app.MapControllerRoute(
    "default",
    "{culture}/{controller=Home}/{action=Index}/{id?}");

app.MapControllerRoute(
    "blog",
    "{culture}/{**slug}",
    new { controller = "Blog", action = "ReadPost" });
```

 - In the "default" route template, the ```culture``` route parameter is to the left of ```controller```, so changes to ```controller``` won't invalidate ```culture```.

 - In the "blog" route template, the ```culture``` route parameter is considered to be to the right of ```controller```, which appears in the required values.

## Parse URL paths with ```LinkParser```

```csharp
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    [HttpGet("{id}", Name = nameof(GetProduct))]
    public IActionResult GetProduct(string id)
    {
        // ...
```

```csharp
[HttpPost("{id}/Related")]
public IActionResult AddRelatedProduct(
    string id, string pathToRelatedProduct, [FromServices] LinkParser linkParser)
{
    var routeValues = linkParser.ParsePathByEndpointName(
        nameof(GetProduct), pathToRelatedProduct);
    var relatedProductId = routeValues?["id"];

    // ...
```

## Configure endpoint metadata

 - Enable Cors with endpoint routing

 - IAuthorizationPolicyProvider sample using a custom ```[MinimumAgeAuthorize]``` attribute

 - Test authentication with the ```[Authorize]``` attribute

 - RequireAuthorization

 - Selecting the scheme with the ```[Authorize]``` attribute

 - Apply policies using the ```[Authorize]``` attribute

 - Role-based authorization in ASP.NET Core

## ```Host``` matching in routes with ```RequireHost```

 - ```Host```: ```www.domain.com```, matches ```www.domain.com``` with any port.

 - ```Host``` with wildcard: ```*.domain.com```, matches ```www.domain.com```, ```subdomain.domain.com```, or ```www.subdomain.domain.com``` on any port.

 - Port: ```*:5000```, matches port 5000 with any host.

 - ```Host``` and port: ```www.domain.com:5000``` or ```*.domain.com:5000```, matches host and port.

```csharp
app.MapGet("/", () => "Contoso").RequireHost("contoso.com");
app.MapGet("/", () => "AdventureWorks").RequireHost("adventure-works.com");

app.MapHealthChecks("/healthz").RequireHost("*:8080");
```

```csharp
[Host("contoso.com", "adventure-works.com")]
public class HostsController : Controller
{
    public IActionResult Index() =>
        View();

    [Host("example.com")]
    public IActionResult Example() =>
        View();
}
```

 - The attribute on the ```action``` is used.

 - The ```controller``` attribute is ignored.

> Warning
API that relies on the ```Host``` header, such as `HttpRequest.Host` and ```RequireHost```, are subject to potential spoofing by clients.
To prevent host and port spoofing, use one of the following approaches:

Use ```HttpContext.Connection (ConnectionInfo.LocalPort)``` where the ports are checked.
Employ ```Host``` filtering.

  - Use ```HttpContext.Connection (ConnectionInfo.LocalPort)``` where the ports are checked.

  - Employ ```Host``` filtering.

## Route groups

```csharp
app.MapGroup("/public/todos")
    .MapTodosApi()
    .WithTags("Public");

app.MapGroup("/private/todos")
    .MapTodosApi()
    .WithTags("Private")
    .AddEndpointFilterFactory(QueryPrivateTodos)
    .RequireAuthorization();


EndpointFilterDelegate QueryPrivateTodos(EndpointFilterFactoryContext factoryContext, EndpointFilterDelegate next)
{
    var dbContextIndex = -1;

    foreach (var argument in factoryContext.MethodInfo.GetParameters())
    {
        if (argument.ParameterType == typeof(TodoDb))
        {
            dbContextIndex = argument.Position;
            break;
        }
    }

    // Skip filter if the method doesn't have a TodoDb parameter.
    if (dbContextIndex < 0)
    {
        return next;
    }

    return async invocationContext =>
    {
        var dbContext = invocationContext.GetArgument<TodoDb>(dbContextIndex);
        dbContext.IsPrivate = true;

        try
        {
            return await next(invocationContext);
        }
        finally
        {
            // This should only be relevant if you're pooling or otherwise reusing the DbContext instance.
            dbContext.IsPrivate = false;
        }
    };
}
```

```csharp
public static RouteGroupBuilder MapTodosApi(this RouteGroupBuilder group)
{
    group.MapGet("/", GetAllTodos);
    group.MapGet("/{id}", GetTodo);
    group.MapPost("/", CreateTodo);
    group.MapPut("/{id}", UpdateTodo);
    group.MapDelete("/{id}", DeleteTodo);

    return group;
}
```

```csharp
public static async Task<Created<Todo>> CreateTodo(Todo todo, TodoDb database)
{
    await database.AddAsync(todo);
    await database.SaveChangesAsync();

    return TypedResults.Created($"{todo.Id}", todo);
}
```

```csharp
var all = app.MapGroup("").WithOpenApi();
var org = all.MapGroup("{org}");
var user = org.MapGroup("{user}");
user.MapGet("", (string org, string user) => $"{org}/{user}");
```

```csharp
var outer = app.MapGroup("/outer");
var inner = outer.MapGroup("/inner");

inner.AddEndpointFilter((context, next) =>
{
    app.Logger.LogInformation("/inner group filter");
    return next(context);
});

outer.AddEndpointFilter((context, next) =>
{
    app.Logger.LogInformation("/outer group filter");
    return next(context);
});

inner.MapGet("/", () => "Hi!").AddEndpointFilter((context, next) =>
{
    app.Logger.LogInformation("MapGet filter");
    return next(context);
});
```

```dotnetcli
/outer group filter
/inner group filter
MapGet filter
```

## Performance guidance for routing

 - Developers eliminate their app code as the source of the problem.

 - It's common to assume routing is the cause.

```csharp
var logger = app.Services.GetRequiredService<ILogger<Program>>();

app.Use(async (context, next) =>
{
    var stopwatch = Stopwatch.StartNew();
    await next(context);
    stopwatch.Stop();

    logger.LogInformation("Time 1: {ElapsedMilliseconds}ms", stopwatch.ElapsedMilliseconds);
});

app.UseRouting();

app.Use(async (context, next) =>
{
    var stopwatch = Stopwatch.StartNew();
    await next(context);
    stopwatch.Stop();

    logger.LogInformation("Time 2: {ElapsedMilliseconds}ms", stopwatch.ElapsedMilliseconds);
});

app.UseAuthorization();

app.Use(async (context, next) =>
{
    var stopwatch = Stopwatch.StartNew();
    await next(context);
    stopwatch.Stop();

    logger.LogInformation("Time 3: {ElapsedMilliseconds}ms", stopwatch.ElapsedMilliseconds);
});

app.MapGet("/", () => "Timing Test.");
```

 - Interleave each middleware with a copy of the timing middleware shown in the preceding code.

 - Add a unique identifier to correlate the timing data with the code.

```csharp
public sealed class AutoStopwatch : IDisposable
{
    private readonly ILogger _logger;
    private readonly string _message;
    private readonly Stopwatch _stopwatch;
    private bool _disposed;

    public AutoStopwatch(ILogger logger, string message) =>
        (_logger, _message, _stopwatch) = (logger, message, Stopwatch.StartNew());

    public void Dispose()
    {
        if (_disposed)
        {
            return;
        }

        _logger.LogInformation("{Message}: {ElapsedMilliseconds}ms",
            _message, _stopwatch.ElapsedMilliseconds);

        _disposed = true;
    }
}
```

```csharp
var logger = app.Services.GetRequiredService<ILogger<Program>>();
var timerCount = 0;

app.Use(async (context, next) =>
{
    using (new AutoStopwatch(logger, $"Time {++timerCount}"))
    {
        await next(context);
    }
});

app.UseRouting();

app.Use(async (context, next) =>
{
    using (new AutoStopwatch(logger, $"Time {++timerCount}"))
    {
        await next(context);
    }
});

app.UseAuthorization();

app.Use(async (context, next) =>
{
    using (new AutoStopwatch(logger, $"Time {++timerCount}"))
    {
        await next(context);
    }
});

app.MapGet("/", () => "Timing Test.");
```

### Potentially expensive routing features

 - Regular expressions: It's possible to write regular expressions that are complex, or have long running time with a small amount of input.

 - Complex segments ({x}-{y}-{z}):

   - Are significantly more expensive than parsing a regular URL path segment.

   - Result in many more substrings being allocated.

 - Synchronous data access: Many complex apps have database access as part of their routing. Use extensibility points such as MatcherPolicy and EndpointSelectorContext, which are asynchronous.

### Guidance for large route tables

 - There are a high number of routes in the app using this pattern.

 - There is a large number of routes in the app.

#### How to determine if an app is running into the large route table problem

 - There are two symptoms to look for:

   - The app is slow to start on the first request.

     - Note that this is required but not sufficient. There are many other non-route problems than can cause slow app startup. Check for the condition below to accurately determine the app is running into this situation.

   - The app consumes a lot of memory during startup and a memory dump shows a large number of ```Microsoft.AspNetCore.Routing.Matching.DfaNode``` instances.

#### How to address this issue

 - Apply route constraints to your parameters, for example ```{parameter:int}```, ```{parameter:guid}```, ```{parameter:regex(\\d+)}```, etc. where possible.

   - This allows the routing algorithm to internally optimize the structures used for matching and drastically reduce the memory used.

   - In the vast majority of cases this will suffice to get back to an acceptable behavior.

 - Change the routes to move parameters to later segments in the template.

   - This reduces the number of possible "paths" to match an endpoint given a path.

 - Use a dynamic route and perform the mapping to a ```controller/page``` dynamically.

   - This can be achieved using ```MapDynamicControllerRoute``` and ```MapDynamicPageRoute```.

## Short-circuit middleware after routing

```csharp
app.MapGet("/short-circuit", () => "Short circuiting!").ShortCircuit();
```

```csharp
app.MapShortCircuit(404, "robots.txt", "favicon.ico");
```

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Information",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  }
}
```

```csharp
var app = WebApplication.Create();

app.UseHttpLogging();

app.MapGet("/", () => "No short-circuiting!");
app.MapGet("/short-circuit", () => "Short circuiting!").ShortCircuit();
app.MapShortCircuit(404, "robots.txt", "favicon.ico");

app.Run();
```

## Guidance for library authors

### Define endpoints

```csharp
// Your framework
app.MapMyFramework(...);

app.MapHealthChecks("/healthz");
```

 - Allows for metadata to be composed.

 - Is targeted by a variety of extension methods.

```csharp
// Your framework
app.MapMyFramework(...)
    .RequireAuthorization()
    .WithMyFrameworkFeature(awesome: true);

app.MapHealthChecks("/healthz");
```

### Creating routing-integrated middleware

```csharp
public interface ICoolMetadata
{
    bool IsCool { get; }
}

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class CoolMetadataAttribute : Attribute, ICoolMetadata
{
    public bool IsCool => true;
}
```

 - Make them accessible as attributes.

 - Most users are familiar with applying attributes.

 - Interfaces are composable.

 - Developers can declare their own types that combine multiple policies.

```csharp
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class SuppressCoolMetadataAttribute : Attribute, ICoolMetadata
{
    public bool IsCool => false;
}

[CoolMetadata]
public class MyController : Controller
{
    public void MyCool() { }

    [SuppressCoolMetadata]
    public void Uncool() { }
}
```

 - Don't just look for the presence of a metadata type.

 - Define a property on the metadata and check the property.

```csharp
app.UseAuthorization(new AuthorizationPolicy() { ... });

// Your framework
app.MapMyFramework(...).RequireAuthorization();
```

 - Endpoints without a specified policy.

 - Requests that don't match an endpoint.

## ```Debug``` diagnostics

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Debug",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  }
}
```

## Additional resources

 - View or download sample code (how to download)

 Ref: ```[```Routing in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-8.0)