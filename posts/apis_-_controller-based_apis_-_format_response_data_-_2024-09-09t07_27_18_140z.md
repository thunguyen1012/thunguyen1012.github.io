---
title: APIs - Controller-based APIs - Format response data
published: true
date: 2024-09-09 07:27:18
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## Format-specific Action Results

```csharp
[HttpGet]
public IActionResult Get()
    => Ok(_todoItemStore.GetList());
```

 - The response header containing content-type: ```application/json; charset=utf-8```.

 - The request headers. For example, the ```Accept``` header. The ```Accept``` header is ignored by the preceding code.

```csharp
[HttpGet("Version")]
public ContentResult GetVersion()
    => Content("v1.0.0");
```

## Content negotiation

 - Implemented by ```ObjectResult```.

 - Built into the status code-specific action results returned from the helper methods. The action results helper methods are based on ```ObjectResult```.

```csharp
[HttpGet("{id:long}")]
public IActionResult GetById(long id)
{
    var todo = _todoItemStore.GetById(id);

    if (todo is null)
    {
        return NotFound();
    }

    return Ok(todo);
}
```

 - ```application/json```

 - ```text/json```

 - ```text/plain```

```csharp
[HttpGet("{id:long}")]
public TodoItem? GetById(long id)
    => _todoItemStore.GetById(id);
```

### The ```Accept``` header

 - Enumerates the media types in the accept header in preference order.

 - Tries to find a formatter that can produce a response in one of the formats specified.

 - Returns ```406 Not Acceptable``` if MvcOptions.ReturnHttpNotAcceptable is set to ```true```, or -

 - Tries to find the first formatter that can produce a response.

 - The first formatter that can handle the object is used to serialize the response.

 - There isn't any negotiation taking place. The server is determining what format to return.

### Browsers and content negotiation

 - The ```Accept``` header is ignored.

 - The content is returned in JSON, unless otherwise configured.

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(options =>
{
    options.RespectBrowserAcceptHeader = true;
});
```

## Configure formatters

### Add XML format support

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddXmlSerializerFormatters();
```

### Configure ```System.Text.Json```-based formatters

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    });
```

```csharp
[HttpGet]
public IActionResult Get() 
    => new JsonResult(
        _todoItemStore.GetList(),
        new JsonSerializerOptions { PropertyNamingPolicy = null });
```

### Add ```Newtonsoft.Json```-based JSON format support

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddNewtonsoftJson();
```

 - Input and output formatters that read and write JSON

 - JsonResult

 - JSON Patch

 - IJsonHelper

 - TempData

 - Uses ```Newtonsoft.Json``` attributes. For example, [JsonProperty] or [JsonIgnore].

 - Customizes the serialization settings.

 - Relies on features that ```Newtonsoft.Json``` provides.

```csharp
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ContractResolver = new DefaultContractResolver();
    });
```

```csharp
[HttpGet]
public IActionResult GetNewtonsoftJson()
    => new JsonResult(
        _todoItemStore.GetList(),
        new JsonSerializerSettings { ContractResolver = new DefaultContractResolver() });
```

### Format ```ProblemDetails``` and ```ValidationProblemDetails``` responses

```csharp
[HttpGet("Error")]
public IActionResult GetError()
    => Problem("Something went wrong.");
```

```csharp
public class SampleModel
{
    [Range(1, 10)]
    public int Value { get; set; }
}
```

```csharp
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "traceId": "00-00000000000000000000000000000000-000000000000000-00",
  "errors": {
    "Value": [
      "The field Value must be between 1 and 10."
    ]
  }
}
```

```csharp
builder.Services.AddControllers();

builder.Services.Configure<MvcOptions>(options =>
{
    options.ModelMetadataDetailsProviders.Add(
        new SystemTextJsonValidationMetadataProvider());
});
```

```csharp
public class SampleModel
{
    [Range(1, 10)]
    [JsonPropertyName("sampleValue")]
    public int Value { get; set; }
}
```

```csharp
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "traceId": "00-00000000000000000000000000000000-000000000000000-00",
  "errors": {
    "sampleValue": [
      "The field Value must be between 1 and 10."
    ]
  }
}
```

```csharp
builder.Services.AddControllers()
    .AddNewtonsoftJson();

builder.Services.Configure<MvcOptions>(options =>
{
    options.ModelMetadataDetailsProviders.Add(
        new NewtonsoftJsonValidationMetadataProvider());
});
```

## Specify a format

```csharp
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class TodoItemsController : ControllerBase
```

 - Forces all actions within the controller to return JSON-formatted responses for POCOs (Plain Old CLR Objects) or ```ObjectResult``` and its derived types.

 - Return JSON-formatted responses even if other formatters are configured and the client specifies a different format.

## Special case formatters

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(options =>
{
    // using Microsoft.AspNetCore.Mvc.Formatters;
    options.OutputFormatters.RemoveType<StringOutputFormatter>();
    options.OutputFormatters.RemoveType<HttpNoContentOutputFormatter>();
});
```

 - The JSON formatter returns a response with a body of ```null```.

 - The XML formatter returns an empty XML element with the attribute xsi:nil="true" set.

## Response format URL mappings

 - In the query ```string``` or part of the path.

 - By using a format-specific file extension such as .xml or .json.

```csharp
[ApiController]
[Route("api/[controller]")]
[FormatFilter]
public class TodoItemsController : ControllerBase
{
    private readonly TodoItemStore _todoItemStore;

    public TodoItemsController(TodoItemStore todoItemStore)
        => _todoItemStore = todoItemStore;

    [HttpGet("{id:long}.{format?}")]
    public TodoItem? GetById(long id)
        => _todoItemStore.GetById(id);
```

<table><thead>
<tr>
<th>Route</th>
<th>Formatter</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>/api/todoitems/5</code></td>
<td>The default output formatter</td>
</tr>
<tr>
<td><code>/api/todoitems/5.json</code></td>
<td>The JSON formatter (if configured)</td>
</tr>
<tr>
<td><code>/api/todoitems/5.xml</code></td>
<td>The XML formatter (if configured)</td>
</tr>
</tbody></table>

## Polymorphic deserialization

## Additional resources

 - View or download sample code (how to download)

Ref: [Format response data in ASP.NET Core Web API](https://learn.microsoft.com/en-us/aspnet/core/web-api/advanced/formatting?view=aspnetcore-8.0)