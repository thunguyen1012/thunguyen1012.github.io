---
title: APIs - Controller-based APIs - Overview
published: true
date: 2024-09-09 07:25:43
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## ```ControllerBase``` class

```csharp
[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
```

```csharp
[HttpPost]
[ProducesResponseType(StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
public ActionResult<Pet> Create(Pet pet)
{
    pet.Id = _petsInMemoryStore.Any() ? 
             _petsInMemoryStore.Max(p => p.Id) + 1 : 1;
    _petsInMemoryStore.Add(pet);

    return CreatedAtAction(nameof(GetById), new { id = pet.Id }, pet);
}
```

<table><thead>
<tr>
<th>Method</th>
<th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.mvc.controllerbase.badrequest" class="no-loc" data-linktype="absolute-path">BadRequest</a></td>
<td>Returns 400 status code.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.mvc.controllerbase.notfound" class="no-loc" data-linktype="absolute-path">NotFound</a></td>
<td>Returns 404 status code.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.mvc.controllerbase.physicalfile" class="no-loc" data-linktype="absolute-path">PhysicalFile</a></td>
<td>Returns a file.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.mvc.controllerbase.tryupdatemodelasync" class="no-loc" data-linktype="absolute-path">TryUpdateModelAsync</a></td>
<td>Invokes <a href="../mvc/models/model-binding?view=aspnetcore-8.0" data-linktype="relative-path">model binding</a>.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.mvc.controllerbase.tryvalidatemodel" class="no-loc" data-linktype="absolute-path">TryValidateModel</a></td>
<td>Invokes <a href="../mvc/models/validation?view=aspnetcore-8.0" data-linktype="relative-path">model validation</a>.</td>
</tr>
</tbody></table>

## Attributes

```csharp
[HttpPost]
[ProducesResponseType(StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
public ActionResult<Pet> Create(Pet pet)
{
    pet.Id = _petsInMemoryStore.Any() ? 
             _petsInMemoryStore.Max(p => p.Id) + 1 : 1;
    _petsInMemoryStore.Add(pet);

    return CreatedAtAction(nameof(GetById), new { id = pet.Id }, pet);
}
```

<table><thead>
<tr>
<th>Attribute</th>
<th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.mvc.routeattribute" data-linktype="absolute-path"><code>[Route]</code></a></td>
<td>Specifies URL pattern for a controller or action.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.mvc.bindattribute" data-linktype="absolute-path"><code>[Bind]</code></a></td>
<td>Specifies prefix and properties to include for model binding.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.mvc.httpgetattribute" data-linktype="absolute-path"><code>[HttpGet]</code></a></td>
<td>Identifies an action that supports the HTTP GET action verb.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.mvc.consumesattribute" data-linktype="absolute-path"><code>[Consumes]</code></a></td>
<td>Specifies data types that an action accepts.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.mvc.producesattribute" data-linktype="absolute-path"><code>[Produces]</code></a></td>
<td>Specifies data types that an action returns.</td>
</tr>
</tbody></table>

## ApiController attribute

 - Attribute routing requirement

 - Automatic HTTP 400 responses

 - Binding source parameter inference

 - Multipart/form-data request inference

 - Problem details for error status codes

### Attribute on specific controllers

```csharp
[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
```

### Attribute on multiple controllers

```csharp
[ApiController]
public class MyControllerBase : ControllerBase
{
}
```

```csharp
[Produces(MediaTypeNames.Application.Json)]
[Route("[controller]")]
public class PetsController : MyControllerBase
```

### Attribute on an assembly

```csharp
using Microsoft.AspNetCore.Mvc;
[assembly: ApiController]

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

var app = builder.Build();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
```

## Attribute routing requirement

```csharp
[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
```

## Automatic HTTP 400 responses

```csharp
if (!ModelState.IsValid)
{
    return BadRequest(ModelState);
}
```

### Default BadRequest response

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "traceId": "|7fb5e16a-4c8f23bbfc974667.",
  "errors": {
    "": [
      "A non-empty request body is required."
    ]
  }
}
```

 - Provides a machine-readable format for specifying errors in web API responses.

 - Complies with the RFC 7807 specification.

### Log automatic 400 responses

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
      // To preserve the default behavior, capture the original delegate to call later.
        var builtInFactory = options.InvalidModelStateResponseFactory;

        options.InvalidModelStateResponseFactory = context =>
        {
            var logger = context.HttpContext.RequestServices
                                .GetRequiredService<ILogger<Program>>();

            // Perform logging here.
            // ...

            // Invoke the default behavior, which produces a ValidationProblemDetails
            // response.
            // To produce a custom response, return a different implementation of 
            // IActionResult instead.
            return builtInFactory(context);
        };
    });

var app = builder.Build();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
```

### Disable automatic 400 response

```csharp
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.SuppressConsumesConstraintForFormFileParameters = true;
        options.SuppressInferBindingSourcesForParameters = true;
        options.SuppressModelStateInvalidFilter = true;
        options.SuppressMapClientErrors = true;
        options.ClientErrorMapping[StatusCodes.Status404NotFound].Link =
            "https://httpstatuses.com/404";
    });

var app = builder.Build();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
```

## Binding source parameter inference

<table><thead>
<tr>
<th>Attribute</th>
<th>Binding source</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.mvc.frombodyattribute" data-linktype="absolute-path"><code>[FromBody]</code></a></td>
<td>Request body</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.mvc.fromformattribute" data-linktype="absolute-path"><code>[FromForm]</code></a></td>
<td>Form data in the request body</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.mvc.fromheaderattribute" data-linktype="absolute-path"><code>[FromHeader]</code></a></td>
<td>Request header</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.mvc.fromqueryattribute" data-linktype="absolute-path"><code>[FromQuery]</code></a></td>
<td>Request query ```string``` parameter</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.mvc.fromrouteattribute" data-linktype="absolute-path"><code>[FromRoute]</code></a></td>
<td>Route data from the current request</td>
</tr>
<tr>
<td><a href="../mvc/controllers/dependency-injection?view=aspnetcore-8.0#action-injection-with-fromservices" data-linktype="relative-path"><code>[FromServices]</code></a></td>
<td>The request service injected as an action parameter</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.http.asparametersattribute" data-linktype="absolute-path"><code>[AsParameters]</code></a></td>
<td><a href="../fundamentals/minimal-apis?view=aspnetcore-8.0#asparam7" data-linktype="relative-path">Method parameters</a></td>
</tr>
</tbody></table>

> Warning
Don't use `[FromRoute]` when values might contain ```%2f``` (that is /). ```%2f``` won't be unescaped to /. Use `[FromQuery]` if the value might contain ```%2f```.

```csharp
[HttpGet]
public ActionResult<List<Product>> Get(
    [FromQuery] bool discontinuedOnly = false)
{
    List<Product> products = null;

    if (discontinuedOnly)
    {
        products = _productsInMemoryStore.Where(p => p.IsDiscontinued).ToList();
    }
    else
    {
        products = _productsInMemoryStore;
    }

    return products;
}
```

 - `[FromServices]` is inferred for complex type parameters registered in the DI Container.

 - `[FromBody]` is inferred for complex type parameters not registered in the DI Container. An exception to the `[FromBody]` inference rule is any complex, built-in type with a special meaning, such as IFormCollection and CancellationToken. The binding source inference code ignores those special types.

 - `[FromForm]` is inferred for action parameters of type IFormFile and IFormFileCollection. It's not inferred for any simple or user-defined types.

 - `[FromRoute]` is inferred for any action parameter name matching a parameter in the route template. When more than one route matches an action parameter, any route value is considered `[FromRoute]`.

 - `[FromQuery]` is inferred for any other action parameters.

### FromBody inference notes

 - `[FromBody]` inferred on both because they're complex types.

```csharp
[HttpPost]
public IActionResult Action1(Product product, Order order)
```

 - `[FromBody]` attribute on one, inferred on the other because it's a complex type.

```csharp
[HttpPost]
public IActionResult Action2(Product product, [FromBody] Order order)
```

 - `[FromBody]` attribute on both.

```csharp
[HttpPost]
public IActionResult Action3([FromBody] Product product, [FromBody] Order order)
```

### FromServices inference notes

```csharp
[Route("[controller]")]
[ApiController]
public class MyController : ControllerBase
{
    public ActionResult GetWithAttribute([FromServices] IDateTime dateTime) 
                                                        => Ok(dateTime.Now);

    [Route("noAttribute")]
    public ActionResult Get(IDateTime dateTime) => Ok(dateTime.Now);
}
```

```csharp
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSingleton<IDateTime, SystemDateTime>();

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.DisableImplicitFromServicesParameters = true;
});

var app = builder.Build();

app.MapControllers();

app.Run();
```

 - A previously specified ```BindingInfo.BindingSource``` is never overwritten.

 - A complex type parameter, registered in the DI container, is assigned ```BindingSource.Services```.

 - A complex type parameter, not registered in the DI container, is assigned ```BindingSource.Body```.

 - A parameter with a name that appears as a route value in any route template is assigned ```BindingSource.Path```.

 - All other parameters are ```BindingSource.Query```.

### Disable inference rules

```csharp
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.SuppressConsumesConstraintForFormFileParameters = true;
        options.SuppressInferBindingSourcesForParameters = true;
        options.SuppressModelStateInvalidFilter = true;
        options.SuppressMapClientErrors = true;
        options.ClientErrorMapping[StatusCodes.Status404NotFound].Link =
            "https://httpstatuses.com/404";
        options.DisableImplicitFromServicesParameters = true;
    });

var app = builder.Build();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
```

## Multipart/form-data request inference

```csharp
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.SuppressConsumesConstraintForFormFileParameters = true;
        options.SuppressInferBindingSourcesForParameters = true;
        options.SuppressModelStateInvalidFilter = true;
        options.SuppressMapClientErrors = true;
        options.ClientErrorMapping[StatusCodes.Status404NotFound].Link =
            "https://httpstatuses.com/404";
    });

var app = builder.Build();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
```

## Problem details for error status codes

```csharp
if (pet == null)
{
    return NotFound();
}
```

```json
{
  type: "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  title: "Not Found",
  status: 404,
  traceId: "0HLHLV31KRN83:00000001"
}
```

### Disable ```ProblemDetails``` response

```csharp
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.SuppressConsumesConstraintForFormFileParameters = true;
        options.SuppressInferBindingSourcesForParameters = true;
        options.SuppressModelStateInvalidFilter = true;
        options.SuppressMapClientErrors = true;
        options.ClientErrorMapping[StatusCodes.Status404NotFound].Link =
            "https://httpstatuses.com/404";
    });

var app = builder.Build();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
```

## Define supported request content types with the `[Consumes]` attribute

```csharp
[HttpPost]
[Consumes("application/xml")]
public IActionResult CreateProduct(Product product)
```

```csharp
[ApiController]
[Route("api/[controller]")]
public class ConsumesController : ControllerBase
{
    [HttpPost]
    [Consumes("application/json")]
    public IActionResult PostJson(IEnumerable<int> values) =>
        Ok(new { Consumes = "application/json", Values = values });

    [HttpPost]
    [Consumes("application/x-www-form-urlencoded")]
    public IActionResult PostForm([FromForm] IEnumerable<int> values) =>
        Ok(new { Consumes = "application/x-www-form-urlencoded", Values = values });
}
```

## Additional resources

 - View or download sample code. (How to download).

 - ```Controller``` action return types in ASP.NET Core web API

 - Handle errors in ASP.NET Core controller-based web APIs

 - Custom formatters in ASP.NET Core Web API

 - Format response data in ASP.NET Core Web API

 - ASP.NET Core web API documentation with Swagger / OpenAPI

 - Routing to controller actions in ASP.NET Core

 - Use port tunneling Visual Studio to debug web APIs

 - Create a web API with ASP.NET Core

Ref: [Create web APIs with ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/web-api/?view=aspnetcore-8.0)