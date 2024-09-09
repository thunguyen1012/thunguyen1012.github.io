---
title: APIs - Controller-based APIs - Swagger / OpenAPI - Get started with NSwag
published: true
date: 2024-09-09 07:25:44
tags: Summary, AspNetCore
description: 
image:
---

## In this article

 - The ability to utilize the Swagger UI and Swagger generator.

 - Flexible code generation capabilities.

## Package installation

 - Generate the Swagger specification for the implemented web API.

 - Serve the Swagger UI to browse and test the web API.

 - Serve the Redoc to add API documentation for the Web API.

  - Visual Studio

  - Visual Studio for Mac

  - Visual Studio Code

  - .NET CLI

   - From the Package Manager Console window:

     - Go to View > Other Windows > Package Manager Console

     - Navigate to the directory in which the ```NSwagSample.csproj``` file exists

     - Execute the following command:
Install-Package ```NSwag```.AspNetCore

```powershell
Install-Package NSwag.AspNetCore
```

   - From the Manage NuGet Packages dialog:

     - Right-click the project in Solution Explorer > Manage NuGet Packages

     - Set the Package source to "nuget.org"

     - Enter "NSwag.AspNetCore" in the search box

     - Select the "NSwag.AspNetCore" package from the Browse tab and click Install

   - Right-click the Packages folder in Solution Pad > Add Packages...

   - Set the Add Packages window's Source drop-down to "nuget.org"

   - Enter "NSwag.AspNetCore" in the search box

   - Select the "NSwag.AspNetCore" package from the results pane and click Add Package

```dotnetcli
dotnet add NSwagSample.csproj package NSwag.AspNetCore
```

## Add and configure Swagger middleware

 - Add the ```OpenApi``` generator to the services collection in ```Program.cs```:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApiDocument();
```

 - Enable the middleware for serving the generated ```OpenApi``` specification, the Swagger UI, and the Redoc UI, also in ```Program.cs```:

```csharp
if (app.Environment.IsDevelopment())
{
    // Add OpenAPI 3.0 document serving middleware
    // Available at: http://localhost:<port>/swagger/v1/swagger.json
    app.UseOpenApi();

    // Add web UIs to interact with the document
    // Available at: http://localhost:<port>/swagger
    app.UseSwaggerUi(); // UseSwaggerUI Protected by if (env.IsDevelopment())
}
```

 - Launch the app. Navigate to:

   - ```http://localhost:<port>/swagger``` to view the Swagger UI.

   - ```http://localhost:<port>/swagger/v1/swagger.json``` to view the Swagger specification.

## Code generation

 - NSwagStudio: A Windows desktop app for generating API client code in C# or TypeScript.

 - The ```NSwag```.CodeGeneration.CSharp or ```NSwag```.CodeGeneration.TypeScript NuGet packages for code generation inside your project.

 - ```NSwag``` from the command line.

 - The ```NSwag```.MSBuild NuGet package.

 - The Unchase OpenAPI (Swagger) Connected Service: A Visual Studio Connected Service for generating API client code in C# or TypeScript. Also generates C# controllers for OpenAPI services with ```NSwag```.

### Generate code with NSwagStudio

 - Install NSwagStudio by following the instructions at the NSwagStudio GitHub repository. On the ```NSwag``` release page, you can download an xcopy version which can be started without installation and admin privileges.

 - Launch NSwagStudio and enter the ```swagger.json``` file URL in the Swagger Specification URL text box. For example, ```http://localhost:5232/swagger/v1/swagger.json```.

 - Click the ```Create``` local Copy button to generate a JSON representation of your Swagger specification.

![NSwag Studio imports the specification and exports a CSharp Client.!](https://learn.microsoft.com/en-us/aspnet/core/tutorials/web-api-help-pages-using-swagger/_static/v6-nswag-nswagstudio.png?view=aspnetcore-8.0 "NSwag Studio imports the specification and exports a CSharp Client.")

 - In the Outputs area, click the CSharp Client checkbox. Depending on your project, you can also choose TypeScript Client or CSharp Web API Controller. If you select CSharp Web API Controller, a service specification rebuilds the service, serving as a reverse generation.

 - Click Generate Outputs to produce a complete C# client implementation of the TodoApi.NSwag project. To see the generated client code, click the CSharp Client tab:

```csharp
namespace MyNamespace
{
    using System = global::System;

    [System.CodeDom.Compiler.GeneratedCode("NSwag", "14.0.1.0 (NJsonSchema v11.0.0.0 (Newtonsoft.Json v13.0.0.0))")]
    public partial class TodoClient
    {
    #pragma warning disable 8618 // Set by constructor via BaseUrl property
        private string _baseUrl;
    #pragma warning restore 8618 // Set by constructor via BaseUrl property
        private System.Net.Http.HttpClient _httpClient;
        private static System.Lazy<Newtonsoft.Json.JsonSerializerSettings> _settings = new System.Lazy<Newtonsoft.Json.JsonSerializerSettings>(CreateSerializerSettings, true);

        public TodoClient(System.Net.Http.HttpClient httpClient)
        {
            BaseUrl = "http://localhost:5232";
            _httpClient = httpClient;
        }

        private static Newtonsoft.Json.JsonSerializerSettings CreateSerializerSettings()
        {
            var settings = new Newtonsoft.Json.JsonSerializerSettings();
            UpdateJsonSerializerSettings(settings);
            return settings;
        }

        public string BaseUrl
        {
            get { return _baseUrl; }
            set
            {
                _baseUrl = value;
                if (!string.IsNullOrEmpty(_baseUrl) && !_baseUrl.EndsWith("/"))
                    _baseUrl += '/';
            }
        }
        // code omitted for brevity
```

> Tip
The C# client code is generated based on selections in the Settings tab. Modify the settings to perform tasks such as default namespace renaming and synchronous method generation.

 - Copy the generated C# code into a file in the client project that will consume the API.

 - Start consuming the web API:

```csharp
var todoClient = new TodoClient(new HttpClient());

// Gets all to-dos from the API
var allTodos = await todoClient.GetAsync();

// Create a new TodoItem, and save it via the API.
await todoClient.CreateAsync(new TodoItem());

// Get a single to-do by ID
var foundTodo = await todoClient.GetByIdAsync(1);
```

## Customize API documentation

### API info and description

```csharp
using NSwag;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApiDocument(options => {
     options.PostProcess = document =>
     {
         document.Info = new OpenApiInfo
         {
             Version = "v1",
             Title = "ToDo API",
             Description = "An ASP.NET Core Web API for managing ToDo items",
             TermsOfService = "https://example.com/terms",
             Contact = new OpenApiContact
             {
                 Name = "Example Contact",
                 Url = "https://example.com/contact"
             },
             License = new OpenApiLicense
             {
                 Name = "Example License",
                 Url = "https://example.com/license"
             }
         };
     };
});
```

![Swagger UI with version information.!](https://learn.microsoft.com/en-us/aspnet/core/tutorials/web-api-help-pages-using-swagger/_static/v6-nswag-custom-info-swagger.png?view=aspnetcore-8.0 "Swagger UI with version information.")

### XML comments

  - Visual Studio

  - Visual Studio for Mac

  - Visual Studio Code

  - .NET CLI

   - Right-click the project in Solution Explorer and select ```Edit <project_name>.csproj```.

   - Manually add the highlighted lines to the ```.csproj``` file:

```xml
<PropertyGroup>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
</PropertyGroup>
```

   - From the Solution Pad, press control and click the project name. Navigate to Tools > Edit File.

   - Manually add the highlighted lines to the ```.csproj``` file:

```xml
<PropertyGroup>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
</PropertyGroup>
```

```text
warning CS1591: Missing XML comment for publicly visible type or member 'TodoContext'
```

```xml
<PropertyGroup>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
  <NoWarn>$(NoWarn);1591</NoWarn>
</PropertyGroup>
```

```csharp
namespace NSwagSample.Models;

#pragma warning disable CS1591
public class TodoContext : DbContext
{
    public TodoContext(DbContextOptions<TodoContext> options) : base(options) { }

    public DbSet<TodoItem> TodoItems => Set<TodoItem>();
}
#pragma warning restore CS1591
```

### Data annotations

```csharp
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace NSwagSample.Models;

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
"TodoItem": {
  "type": "object",
  "additionalProperties": false,
  "required": [
    "name"
  ],
  "properties": {
    "id": {
      "type": "integer",
      "format": "int64"
    },
    "name": {
      "type": "string",
      "minLength": 1
    },
    "isComplete": {
      "type": "boolean",
      "default": false
    }
  }
}
```

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

![Swagger UI showing POST Response Class description 'Returns the newly created Todo item' and '400 - If the item is null' for status code and reason under Response Messages.!](https://learn.microsoft.com/en-us/aspnet/core/tutorials/web-api-help-pages-using-swagger/_static/v6-nswag-swagger-post.png?view=aspnetcore-8.0 "Swagger UI showing POST Response Class description 'Returns the newly created Todo item' and '400 - If the item is null' for status code and reason under Response Messages.")

### Redoc

```csharp
if (app.Environment.IsDevelopment())
{
    // Add OpenAPI 3.0 document serving middleware
    // Available at: http://localhost:<port>/swagger/v1/swagger.json
    app.UseOpenApi();

    // Add web UIs to interact with the document
    // Available at: http://localhost:<port>/swagger
    app.UseSwaggerUi(); // UseSwaggerUI is called only in Development.
    
    // Add ReDoc UI to interact with the document
    // Available at: http://localhost:<port>/redoc
    app.UseReDoc(options =>
    {
        options.Path = "/redoc";
    });
}
```

![Redoc documentation for the Sample API.!](https://learn.microsoft.com/en-us/aspnet/core/tutorials/getting-started-with-nswag/web-api-help-pages-using-swagger/_static/v6-nswag-redoc.png?view=aspnetcore-8.0 "Redoc documentation for the Sample API.")

Ref: [Get started with ```NSwag``` and ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/tutorials/getting-started-with-nswag?view=aspnetcore-8.0)