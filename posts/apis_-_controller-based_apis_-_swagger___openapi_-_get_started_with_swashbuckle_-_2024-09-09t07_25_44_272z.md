---
title: APIs - Controller-based APIs - Swagger / OpenAPI - Get started with Swashbuckle
published: true
date: 2024-09-09 07:25:44
tags: Summary, AspNetCore
description: 
image:
---

## In this article

 - Swashbuckle.AspNetCore.Swagger: a Swagger object model and middleware to expose ```SwaggerDocument``` objects as JSON endpoints.

 - Swashbuckle.AspNetCore.SwaggerGen: a Swagger generator that builds ```SwaggerDocument``` objects directly from your routes, controllers, and models. It's typically combined with the Swagger endpoint middleware to automatically expose Swagger JSON.

 - Swashbuckle.AspNetCore.SwaggerUI: an embedded version of the Swagger UI tool. It interprets Swagger JSON to build a rich, customizable experience for describing the web API functionality. It includes built-in test harnesses for the public methods.

## Package installation

  - Visual Studio

  - Visual Studio for Mac

  - Visual Studio Code

  - .NET CLI

   - From the Package Manager Console window:

     - Go to View > Other Windows > Package Manager Console

     - Navigate to the directory in which the ```.csproj``` file exists

     - Execute the following command:
Install-Package Swashbuckle.AspNetCore -Version 6.6.2

```powershell
Install-Package Swashbuckle.AspNetCore -Version 6.6.2
```

   - From the Manage NuGet Packages dialog:

     - Right-click the project in Solution Explorer > Manage NuGet Packages

     - Set the Package source to "nuget.org"

     - Ensure the "Include prerelease" option is enabled

     - Enter "Swashbuckle.AspNetCore" in the search box

     - Select the latest "Swashbuckle.AspNetCore" package from the Browse tab and click Install

   - Right-click the Packages folder in Solution Pad > Add Packages...

   - Set the Add Packages window's Source drop-down to "nuget.org"

   - Ensure the "Show pre-release packages" option is enabled

   - Enter "Swashbuckle.AspNetCore" in the search box

   - Select the latest "Swashbuckle.AspNetCore" package from the results pane and click Add Package

```dotnetcli
dotnet add TodoApi.csproj package Swashbuckle.AspNetCore -v 6.6.2
```

## Add and configure Swagger middleware

```csharp
builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
```

```csharp
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
```

> Tip
To serve the Swagger UI at the app's root (https://localhost:<port>/), set the ```RoutePrefix``` property to an empty string:
if (builder.Environment.IsDevelopment())
{
    app.UseSwaggerUI(options => // ```UseSwaggerUI``` is called only in Development.
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
        options.RoutePrefix = string.Empty;
    });
}

```csharp
if (builder.Environment.IsDevelopment())
{
    app.UseSwaggerUI(options => // UseSwaggerUI is called only in Development.
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
        options.RoutePrefix = string.Empty;
    });
}
```

> Note
By default, Swashbuckle generates and exposes Swagger JSON in version 3.0 of the specification—officially called the OpenAPI Specification. To support backwards compatibility, you can opt into exposing JSON in the 2.0 format instead. This 2.0 format is important for integrations such as Microsoft Power Apps and Microsoft Flow that currently support OpenAPI version 2.0. To opt into the 2.0 format, set the ```SerializeAsV2``` property in ```Program.cs```:

```csharp
app.UseSwagger(options =>
{
    options.SerializeAsV2 = true;
});
```

## Customize and extend

### API info and description

```csharp
using Microsoft.OpenApi.Models;
```

```csharp
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Version = "v1",
        Title = "ToDo API",
        Description = "An ASP.NET Core Web API for managing ToDo items",
        TermsOfService = new Uri("https://example.com/terms"),
        Contact = new OpenApiContact
        {
            Name = "Example Contact",
            Url = new Uri("https://example.com/contact")
        },
        License = new OpenApiLicense
        {
            Name = "Example License",
            Url = new Uri("https://example.com/license")
        }
    });
});
```

![Swagger UI with version information: description, author, and license.!](https://learn.microsoft.com/en-us/aspnet/core/tutorials/web-api-help-pages-using-swagger/_static/v6-swagger-info.png?view=aspnetcore-8.0 "Swagger UI with version information: description, author, and license.")

### XML comments

  - Visual Studio

  - Visual Studio for Mac

  - Visual Studio Code

  - .NET CLI

   - Right-click the project in Solution Explorer and select ```Edit <project_name>.csproj```.

   - Add GenerateDocumentationFile  to the ```.csproj``` file:

```XML
<PropertyGroup>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
</PropertyGroup>
```

   - From the Solution Pad, press control and click the project name. Navigate to Tools > Edit File.

   - Add GenerateDocumentationFile  to the ```.csproj``` file:

```XML
<PropertyGroup>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
</PropertyGroup>
```

```text
warning CS1591: Missing XML comment for publicly visible type or member 'TodoController'
```

```xml
<PropertyGroup>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
  <NoWarn>$(NoWarn);1591</NoWarn>
</PropertyGroup>
```

```csharp
namespace SwashbuckleSample.Models;

#pragma warning disable CS1591
public class TodoContext : DbContext
{
    public TodoContext(DbContextOptions<TodoContext> options) : base(options) { }

    public DbSet<TodoItem> TodoItems => Set<TodoItem>();
}
#pragma warning restore CS1591
```

```csharp
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Version = "v1",
        Title = "ToDo API",
        Description = "An ASP.NET Core Web API for managing ToDo items",
        TermsOfService = new Uri("https://example.com/terms"),
        Contact = new OpenApiContact
        {
            Name = "Example Contact",
            Url = new Uri("https://example.com/contact")
        },
        License = new OpenApiLicense
        {
            Name = "Example License",
            Url = new Uri("https://example.com/license")
        }
    });

    // using System.Reflection;
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
});
```

```csharp
/// <summary>
/// Deletes a specific TodoItem.
/// </summary>
/// <param name="id"></param>
/// <returns></returns>
[HttpDelete("{id}")]
public async Task<IActionResult> Delete(long id)
{
    var item = await _context.TodoItems.FindAsync(id);

    if (item is null)
    {
        return NotFound();
    }

    _context.TodoItems.Remove(item);
    await _context.SaveChangesAsync();

    return NoContent();
}
```

![Swagger UI showing XML comment 'Deletes a specific TodoItem.' for the DELETE method.!](https://learn.microsoft.com/en-us/aspnet/core/tutorials/web-api-help-pages-using-swagger/_static/v6-swagger-delete-summary.png?view=aspnetcore-8.0 "Swagger UI showing XML comment 'Deletes a specific TodoItem.' for the DELETE method.")

```json
"delete": {
    "tags": [
        "Todo"
    ],
    "summary": "Deletes a specific TodoItem.",
    "parameters": [
        {
            "name": "id",
            "in": "path",
            "description": "",
            "required": true,
            "schema": {
                "type": "integer",
                "format": "int64"
            }
        }
    ],
    "responses": {
        "200": {
            "description": "Success"
        }
    }
},
```

```csharp
/// <summary>
/// Creates a TodoItem.
/// </summary>
/// <param name="item"></param>
/// <returns>A newly created TodoItem</returns>
/// <remarks>
/// Sample request:
///
///     POST /Todo
///     {
///        "id": 1,
///        "name": "Item #1",
///        "isComplete": true
///     }
///
/// </remarks>
/// <response code="201">Returns the newly created item</response>
/// <response code="400">If the item is null</response>
[HttpPost]
[ProducesResponseType(StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
public async Task<IActionResult> Create(TodoItem item)
{
    _context.TodoItems.Add(item);
    await _context.SaveChangesAsync();

    return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
}
```

![Swagger UI with additional comments shown.!](https://learn.microsoft.com/en-us/aspnet/core/tutorials/web-api-help-pages-using-swagger/_static/v6-swagger-post-remarks.png?view=aspnetcore-8.0 "Swagger UI with additional comments shown.")

### Data annotations

```csharp
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace SwashbuckleSample.Models;

public class TodoItem
{
    public long Id { get; set; }

    [Required]
    public string Name { get; set; } = null!;

    [DefaultValue(false)]
    public bool IsComplete { get; set; }
}
```

```json
"schemas": {
    "TodoItem": {
        "required": [
            "name"
        ],
        "type": "object",
        "properties": {
            "id": {
                "type": "integer",
                "format": "int64"
            },
            "name": {
                "type": "string"
            },
            "isComplete": {
                "type": "boolean",
                "default": false
            }
        },
        "additionalProperties": false
    }
},
```

```csharp
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class TodoController : ControllerBase
{
```

![Swagger UI with default response content type!](https://learn.microsoft.com/en-us/aspnet/core/tutorials/web-api-help-pages-using-swagger/_static/v6-swagger-get-media-type.png?view=aspnetcore-8.0 "Swagger UI with default response content type")

### Describe response types

```csharp
/// <summary>
/// Creates a TodoItem.
/// </summary>
/// <param name="item"></param>
/// <returns>A newly created TodoItem</returns>
/// <remarks>
/// Sample request:
///
///     POST /Todo
///     {
///        "id": 1,
///        "name": "Item #1",
///        "isComplete": true
///     }
///
/// </remarks>
/// <response code="201">Returns the newly created item</response>
/// <response code="400">If the item is null</response>
[HttpPost]
[ProducesResponseType(StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
public async Task<IActionResult> Create(TodoItem item)
{
    _context.TodoItems.Add(item);
    await _context.SaveChangesAsync();

    return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
}
```

![Swagger UI showing POST Response Class description 'Returns the newly created Todo item' and '400 - If the item is null' for status code and reason under Response Messages.!](https://learn.microsoft.com/en-us/aspnet/core/tutorials/web-api-help-pages-using-swagger/_static/v6-swagger-post-responses.png?view=aspnetcore-8.0 "Swagger UI showing POST Response Class description 'Returns the newly created Todo item' and '400 - If the item is null' for status code and reason under Response Messages.")

### Customize the UI

```csharp
app.UseHttpsRedirection();
app.UseStaticFiles();
app.MapControllers();
```

```csharp
if (app.Environment.IsDevelopment())
{
    app.UseSwaggerUI(options => // UseSwaggerUI is called only in Development.
    {
        options.InjectStylesheet("/swagger-ui/custom.css");
    });
}
```

## Additional resources

 - View or download sample code (how to download)

 - Improve the developer experience of an API with Swagger documentation

Ref: [Get started with Swashbuckle and ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/tutorials/getting-started-with-swashbuckle?view=aspnetcore-8.0)