---
title: APIs - Minimal APIs - Tutorial: Create a minimal API
published: true
date: 2024-09-09 08:41:31
tags: Summary, AspNetCore
description:
image:
---

## In this article


## Overview

<table><thead>
<tr>
<th>API</th>
<th>Description</th>
<th>Request body</th>
<th>Response body</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>GET ```/todoitems```</code></td>
<td>Get all to-do items</td>
<td>None</td>
<td>Array of to-do items</td>
</tr>
<tr>
<td><code>GET ```/todoitems```/complete</code></td>
<td>Get completed to-do items</td>
<td>None</td>
<td>Array of to-do items</td>
</tr>
<tr>
<td><code>GET ```/todoitems```/{id}</code></td>
<td>Get an item by ID</td>
<td>None</td>
<td>To-do item</td>
</tr>
<tr>
<td><code>POST ```/todoitems```</code></td>
<td>Add a new item</td>
<td>To-do item</td>
<td>To-do item</td>
</tr>
<tr>
<td><code>PUT ```/todoitems```/{id}</code></td>
<td>Update an existing item &nbsp;</td>
<td>To-do item</td>
<td>None</td>
</tr>
<tr>
<td><code>DELETE ```/todoitems```/{id}</code> &nbsp; &nbsp;</td>
<td>Delete an item &nbsp; &nbsp;</td>
<td>None</td>
<td>None</td>
</tr>
</tbody></table>

## Prerequisites

  - Visual Studio

  - Visual Studio Code

   - Visual Studio 2022 with the ASP.NET and web development workload.

![VS22 installer workloads!](https://learn.microsoft.com/en-us/aspnet/core/tutorials/min-web-api/min-web-api/_static/asp-net-web-dev.png?view=aspnetcore-8.0 "VS22 installer workloads")

   - Visual Studio Code

   - C# for Visual Studio Code (latest version)

   - .NET 8.0 SDK

## Create an API project

  - Visual Studio

  - Visual Studio Code

   - Start Visual Studio 2022 and select Create a new project.

   - In the Create a new project dialog:

     - Enter ```Empty``` in the Search for templates search box.

     - Select the ASP.NET Core ```Empty``` template and select Next.

![Visual Studio Create a new project!](https://learn.microsoft.com/en-us/aspnet/core/tutorials/min-web-api/min-web-api/_static/8.x/create-new-project-empty-vs17.8.0.png?view=aspnetcore-8.0 "Visual Studio Create a new project")

   - Name the project TodoApi and select Next.

   - In the Additional information dialog:

     - Select .NET 8.0 (Long Term Support)

     - Uncheck Do not use top-level statements

     - Select Create

![Additional information!](https://learn.microsoft.com/en-us/aspnet/core/tutorials/min-web-api/min-web-api/_static/8.x/add-info-vs17.9.0.png?view=aspnetcore-8.0 "Additional information")

   - Open the integrated terminal.

   - Change directories (cd) to the folder that will contain the project folder.

   - Run the following commands:
dotnet new web -o TodoApi
cd TodoApi
code -r ../TodoApi

```dotnetcli
dotnet new web -o TodoApi
cd TodoApi
code -r ../TodoApi
```

   - When a dialog box asks if you want to trust the authors, select Yes.

   - When a dialog box asks if you want to add required assets to the project, select Yes.
The preceding commands create a new web minimal API project and open it in Visual Studio Code.

### Examine the code

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
```

 - Creates a WebApplicationBuilder and a WebApplication with preconfigured defaults.

 - Creates an ```HTTP``` ```GET``` endpoint / that returns Hello World!:

### Run the app

  - Visual Studio

  - Visual Studio Code

![This project is configured to use SSL. To avoid SSL warnings in the browser you can choose to trust the self-signed certificate that IIS Express has generated. Would you like to trust the IIS Express SSL certificate?!](https://learn.microsoft.com/en-us/aspnet/core/tutorials/min-web-api/../getting-started/_static/trustcertvs22.png?view=aspnetcore-8.0 "This project is configured to use SSL. To avoid SSL warnings in the browser you can choose to trust the self-signed certificate that IIS Express has generated. Would you like to trust the IIS Express SSL certificate?")

![Security warning dialog!](https://learn.microsoft.com/en-us/aspnet/core/tutorials/min-web-api/../getting-started/_static/cert.png?view=aspnetcore-8.0 "Security warning dialog")

   - Trust the HTTPS development certificate by running the following command:
dotnet dev-certs https --trust

The preceding command doesn't work on Linux. See your Linux distribution's documentation for trusting a certificate.
The preceding command displays the following dialog, provided the certificate was not previously trusted:

```dotnetcli
dotnet dev-certs https --trust
```

![Security warning dialog!](https://learn.microsoft.com/en-us/aspnet/core/tutorials/min-web-api/../getting-started/_static/cert.png?view=aspnetcore-8.0 "Security warning dialog")

   - Select Yes if you agree to trust the development certificate.
See Trust the ASP.NET Core HTTPS development certificate for more information.

## Add NuGet packages

  - Visual Studio

  - Visual Studio Code

   - From the Tools menu, select NuGet Package Manager > Manage NuGet Packages for Solution.

   - Select the Browse tab.

   - Enter ```Microsoft.EntityFrameworkCore.InMemory``` in the search box, and then select ```Microsoft.EntityFrameworkCore.InMemory```.

   - Select the Project checkbox in the right pane and then select Install.

   - Follow the preceding instructions to add the ```Microsoft.AspNetCore.Diagnostics.EntityFrameworkCore``` package.

   - Run the following commands:

```dotnetcli
dotnet add package Microsoft.EntityFrameworkCore.InMemory
dotnet add package Microsoft.AspNetCore.Diagnostics.EntityFrameworkCore
```

## The model and database context classes

 - In the project folder, create a file named ```Todo.cs``` with the following code:

```csharp
public class Todo
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public bool IsComplete { get; set; }
}
```

 - Create a file named ```TodoDb.cs``` with the following code:

```csharp
using Microsoft.EntityFrameworkCore;

class TodoDb : DbContext
{
    public TodoDb(DbContextOptions<TodoDb> options)
        : base(options) { }

    public DbSet<Todo> Todos => Set<Todo>();
}
```

## Add the API code

 - Replace the contents of the ```Program.cs``` file with the following code:

```csharp
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<TodoDb>(opt => opt.UseInMemoryDatabase("TodoList"));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();
var app = builder.Build();

app.MapGet("/todoitems", async (TodoDb db) =>
    await db.Todos.ToListAsync());

app.MapGet("/todoitems/complete", async (TodoDb db) =>
    await db.Todos.Where(t => t.IsComplete).ToListAsync());

app.MapGet("/todoitems/{id}", async (int id, TodoDb db) =>
    await db.Todos.FindAsync(id)
        is Todo todo
            ? Results.Ok(todo)
            : Results.NotFound());

app.MapPost("/todoitems", async (Todo todo, TodoDb db) =>
{
    db.Todos.Add(todo);
    await db.SaveChangesAsync();

    return Results.Created($"/todoitems/{todo.Id}", todo);
});

app.MapPut("/todoitems/{id}", async (int id, Todo inputTodo, TodoDb db) =>
{
    var todo = await db.Todos.FindAsync(id);

    if (todo is null) return Results.NotFound();

    todo.Name = inputTodo.Name;
    todo.IsComplete = inputTodo.IsComplete;

    await db.SaveChangesAsync();

    return Results.NoContent();
});

app.MapDelete("/todoitems/{id}", async (int id, TodoDb db) =>
{
    if (await db.Todos.FindAsync(id) is Todo todo)
    {
        db.Todos.Remove(todo);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    return Results.NotFound();
});

app.Run();
```

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<TodoDb>(opt => opt.UseInMemoryDatabase("TodoList"));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();
var app = builder.Build();
```

  - Visual Studio

  - Visual Studio Code

## Create API testing UI with Swagger

   - NSwag: A .NET library that integrates Swagger directly into ASP.NET Core applications, providing middleware and configuration.

   - Swagger: A set of open-source tools such as OpenAPIGenerator and SwaggerUI that generate API testing pages that follow the OpenAPI specification.

   - OpenAPI specification: A document that describes the capabilities of the API, based on the XML and attribute annotations within the controllers and models.

### Install Swagger tooling

   - Run the following command:
dotnet add package NSwag.AspNetCore

```dotnetcli
dotnet add package NSwag.AspNetCore
```

### Configure Swagger middleware

   - Add the following highlighted code before app is defined in line var app = builder.Build();

```csharp
using NSwag.AspNetCore;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<TodoDb>(opt => opt.UseInMemoryDatabase("TodoList"));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApiDocument(config =>
{
    config.DocumentName = "TodoAPI";
    config.Title = "TodoAPI v1";
    config.Version = "v1";
});
var app = builder.Build();
```

   - builder.Services.AddEndpointsApiExplorer();: Enables the API Explorer, which is a service that provides metadata about the ```HTTP``` API. The API Explorer is used by Swagger to generate the Swagger document.

   - builder.Services.AddOpenApiDocument(config => {...});: Adds the Swagger OpenAPI document generator to the application services and configures it to provide more information about the API, such as its title and version. For information on providing more robust API details, see Get started with NSwag and ASP.NET Core

   - Add the following highlighted code to the next line after app is defined in line var ```app = builder.Build();```

```csharp
var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi(config =>
    {
        config.DocumentTitle = "TodoAPI";
        config.Path = "/swagger";
        config.DocumentPath = "/swagger/{documentName}/swagger.json";
        config.DocExpansion = "list";
    });
}
```
The previous code enables the Swagger middleware for serving the generated JSON document and the Swagger UI. Swagger is only enabled in a development environment. Enabling Swagger in a production environment could expose potentially sensitive details about the API's structure and implementation.
## Test posting data

```csharp
app.MapPost("/todoitems", async (Todo todo, TodoDb db) =>
{
    db.Todos.Add(todo);
    await db.SaveChangesAsync();

    return Results.Created($"/todoitems/{todo.Id}", todo);
});
```

  - Visual Studio

  - Visual Studio Code

   - Select View > Other Windows > Endpoints Explorer.

   - Right-click the ```POST``` endpoint and select Generate request.

A new file is created in the project folder named ```TodoApi.http```, with contents similar to the following example:
@TodoApi_HostAddress = https://localhost:7031

Post {{TodoApi_HostAddress}}/todoitems

###

![Endpoints Explorer context menu highlighting Generate Request menu item.!](https://learn.microsoft.com/en-us/aspnet/core/tutorials/min-web-api/min-web-api/_static/8.x/generate-request-vs17.8.0.png?view=aspnetcore-8.0 "Endpoints Explorer context menu highlighting Generate Request menu item.")

     - The first line creates a variable that is used for all of the endpoints.

     - The next line defines a ```POST``` request.

     - The triple hashtag (###) line is a request delimiter: what comes after it is for a different request.

   - The ```POST``` request needs headers and a body. To define those parts of the request, add the following lines immediately after the ```POST``` request line:
Content-Type: application/json

{
  "name":"walk dog",
  "isComplete":true
}

The preceding code adds a Content-Type header and a JSON request body. The ```TodoApi.http``` file should now look like the following example, but with your port number:
@TodoApi_HostAddress = https://localhost:7057

Post {{TodoApi_HostAddress}}/todoitems
Content-Type: application/json

{
  "name":"walk dog",
  "isComplete":true
}

###

   - Run the app.

   - Select the Send request link that is above the ```POST``` request line.

The ```POST``` request is sent to the app and the response is displayed in the Response pane.

![.http file window with run link highlighted.!](https://learn.microsoft.com/en-us/aspnet/core/tutorials/min-web-api/min-web-api/_static/8.x/http-file-run-button-vs17.8.0.png?view=aspnetcore-8.0 ".http file window with run link highlighted.")

![.http file window with response from the POST request.!](https://learn.microsoft.com/en-us/aspnet/core/tutorials/min-web-api/min-web-api/_static/8.x/http-file-window-with-response-vs17.8.0.png?view=aspnetcore-8.0 ".http file window with response from the POST request.")

   - With the app still running, in the browser, navigate to ```https://localhost:<port>/swagger``` to display the API testing page generated by Swagger.

![Swagger generated API testing page!](https://learn.microsoft.com/en-us/aspnet/core/tutorials/min-web-api/min-web-api/_static/8.x/swagger.png?view=aspnetcore-8.0 "Swagger generated API testing page")

   - On the Swagger API testing page, select Post ```/todoitems``` > Try it out.

   - Note that the Request body field contains a generated example format reflecting the parameters for the API.

   - In the request body enter JSON for a to-do item, without specifying the optional ```id```:

```json
{
  "name":"walk dog",
  "isComplete":true
}
```

   - Select Execute.

![Swagger with Post request!](https://learn.microsoft.com/en-us/aspnet/core/tutorials/min-web-api/min-web-api/_static/8.x/swagger-post-1.png?view=aspnetcore-8.0 "Swagger with Post request")

![Swagger with Post resonse!](https://learn.microsoft.com/en-us/aspnet/core/tutorials/min-web-api/min-web-api/_static/8.x/swagger-post-responses.png?view=aspnetcore-8.0 "Swagger with Post resonse")

   - cURL: Swagger provides an example cURL command in Unix/Linux syntax, which can be run at the command line with any bash shell that uses Unix/Linux syntax, including Git Bash from Git for Windows.

   - Request URL: A simplified representation of the ```HTTP``` request made by Swagger UI's JavaScript code for the API call. Actual requests can include details such as headers and query parameters and a request body.

   - Server response: Includes the response body and headers. The response body shows the ```id``` was set to ```1```.

   - Response Code: A 201 ```HTTP``` status code was returned, indicating that the request was successfully processed and resulted in the creation of a new resource.

## Examine the ```GET``` endpoints

<table><thead>
<tr>
<th>API</th>
<th>Description</th>
<th>Request body</th>
<th>Response body</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>GET ```/todoitems```</code></td>
<td>Get all to-do items</td>
<td>None</td>
<td>Array of to-do items</td>
</tr>
<tr>
<td><code>GET ```/todoitems```/complete</code></td>
<td>Get all completed to-do items</td>
<td>None</td>
<td>Array of to-do items</td>
</tr>
<tr>
<td><code>GET ```/todoitems```/{id}</code></td>
<td>Get an item by ID</td>
<td>None</td>
<td>To-do item</td>
</tr>
</tbody></table>

```csharp
app.MapGet("/todoitems", async (TodoDb db) =>
    await db.Todos.ToListAsync());

app.MapGet("/todoitems/complete", async (TodoDb db) =>
    await db.Todos.Where(t => t.IsComplete).ToListAsync());

app.MapGet("/todoitems/{id}", async (int id, TodoDb db) =>
    await db.Todos.FindAsync(id)
        is Todo todo
            ? Results.Ok(todo)
            : Results.NotFound());
```

## Test the ```GET``` endpoints

  - Visual Studio

  - Visual Studio Code

   - In Endpoints Explorer, right-click the first ```GET``` endpoint, and select Generate request.
The following content is added to the ```TodoApi.http``` file:
Get {{TodoApi_HostAddress}}/todoitems

###

   - Select the Send request link that is above the new ```GET``` request line.
The ```GET``` request is sent to the app and the response is displayed in the Response pane.

   - The response body is similar to the following JSON:
```json
[
  {
    "id": 1,
    "name": "walk dog",
    "isComplete": true
  }
]
```

   - In Endpoints Explorer, right-click the ```/todoitems```/{id} ```GET``` endpoint and select Generate request.
The following content is added to the ```TodoApi.http``` file:
GET {{TodoApi_HostAddress}}/todoitems/{id}

###

   - Replace {id} with ```1```.

   - Select the Send request link that is above the new ```GET``` request line.
The ```GET``` request is sent to the app and the response is displayed in the Response pane.

   - The response body is similar to the following JSON:

```json
{
  "id": 1,
  "name": "walk dog",
  "isComplete": true
}
```

   - In Swagger select ```GET /todoitems``` > Try it out > Execute.

   - Alternatively, call ```GET /todoitems``` from a browser by entering the URI ```http://localhost:<port>/todoitems```. For example, ```http://localhost:5001/todoitems```

```json
[
  {
    "id": 1,
    "name": "walk dog",
    "isComplete": true
  }
]
```

   - Call ```GET /todoitems/{id}``` in Swagger to return data from a specific ```id```:

     - Select ```GET /todoitems``` > Try it out.

     - Set the ```id``` field to ```1``` and select Execute.

   - Alternatively, call ```GET /todoitems``` from a browser by entering the URI ```https://localhost:<port>/todoitems/1```. For example, ```https://localhost:5001/todoitems/1```

   - The response is similar to the following:

```json
{
  "id": 1,
  "name": "walk dog",
  "isComplete": true
}
```

## Return values

 - If no item matches the requested ID, the method returns a 404 status NotFound error code.

 - Otherwise, the method returns 200 with a JSON response body. Returning item results in an ```HTTP``` 200 response.

## Examine the PUT endpoint

```csharp
app.MapPut("/todoitems/{id}", async (int id, Todo inputTodo, TodoDb db) =>
{
    var todo = await db.Todos.FindAsync(id);

    if (todo is null) return Results.NotFound();

    todo.Name = inputTodo.Name;
    todo.IsComplete = inputTodo.IsComplete;

    await db.SaveChangesAsync();

    return Results.NoContent();
});
```

## Test the PUT endpoint

  - Visual Studio

  - Visual Studio Code

   - In Endpoints Explorer, right-click the PUT endpoint, and select Generate request.
The following content is added to the ```TodoApi.http``` file:
Put {{TodoApi_HostAddress}}/todoitems/{id}

###

   - In the PUT request line, replace {id} with ```1```.

   - Add the following lines immediately after the PUT request line:
Content-Type: application/json

{
  "name": "feed fish",
  "isComplete": false
}

The preceding code adds a Content-Type header and a JSON request body.

   - Select the Send request link that is above the new PUT request line.
The PUT request is sent to the app and the response is displayed in the Response pane. The response body is empty, and the status code is 204.

   - Select Put ```/todoitems```/{id} > Try it out.

   - Set the ```id``` field to ```1```.

   - Set the request body to the following JSON:

```json
{
  "name": "feed fish",
  "isComplete": false
}
```

   - Select Execute.

## Examine and test the DELETE endpoint

```csharp
app.MapDelete("/todoitems/{id}", async (int id, TodoDb db) =>
{
    if (await db.Todos.FindAsync(id) is Todo todo)
    {
        db.Todos.Remove(todo);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    return Results.NotFound();
});
```

  - Visual Studio

  - Visual Studio Code

   - In Endpoints Explorer, right-click the DELETE endpoint and select Generate request.
A DELETE request is added to ```TodoApi.http```.

   - Replace {id} in the DELETE request line with ```1```. The DELETE request should look like the following example:
DELETE {{TodoApi_HostAddress}}/todoitems/1

###

   - Select the Send request link for the DELETE request.
The DELETE request is sent to the app and the response is displayed in the Response pane. The response body is empty, and the status code is 204.

   - Select DELETE ```/todoitems```/{id} > Try it out.

   - Set the ID field to ```1``` and select Execute.
The DELETE request is sent to the app and the response is displayed in the Responses pane. The response body is empty, and the Server response status code is 204.

## Use the MapGroup API

  - Visual Studio

  - Visual Studio Code

```csharp
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<TodoDb>(opt => opt.UseInMemoryDatabase("TodoList"));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();
var app = builder.Build();

var todoItems = app.MapGroup("/todoitems");

todoItems.MapGet("/", async (TodoDb db) =>
    await db.Todos.ToListAsync());

todoItems.MapGet("/complete", async (TodoDb db) =>
    await db.Todos.Where(t => t.IsComplete).ToListAsync());

todoItems.MapGet("/{id}", async (int id, TodoDb db) =>
    await db.Todos.FindAsync(id)
        is Todo todo
            ? Results.Ok(todo)
            : Results.NotFound());

todoItems.MapPost("/", async (Todo todo, TodoDb db) =>
{
    db.Todos.Add(todo);
    await db.SaveChangesAsync();

    return Results.Created($"/todoitems/{todo.Id}", todo);
});

todoItems.MapPut("/{id}", async (int id, Todo inputTodo, TodoDb db) =>
{
    var todo = await db.Todos.FindAsync(id);

    if (todo is null) return Results.NotFound();

    todo.Name = inputTodo.Name;
    todo.IsComplete = inputTodo.IsComplete;

    await db.SaveChangesAsync();

    return Results.NoContent();
});

todoItems.MapDelete("/{id}", async (int id, TodoDb db) =>
{
    if (await db.Todos.FindAsync(id) is Todo todo)
    {
        db.Todos.Remove(todo);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    return Results.NotFound();
});

app.Run();
```

```csharp
using NSwag.AspNetCore;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<TodoDb>(opt => opt.UseInMemoryDatabase("TodoList"));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApiDocument(config =>
{
    config.DocumentName = "TodoAPI";
    config.Title = "TodoAPI v1";
    config.Version = "v1";
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi(config =>
    {
        config.DocumentTitle = "TodoAPI";
        config.Path = "/swagger";
        config.DocumentPath = "/swagger/{documentName}/swagger.json";
        config.DocExpansion = "list";
    });
}

var todoItems = app.MapGroup("/todoitems");

todoItems.MapGet("/", async (TodoDb db) =>
    await db.Todos.ToListAsync());

todoItems.MapGet("/complete", async (TodoDb db) =>
    await db.Todos.Where(t => t.IsComplete).ToListAsync());

todoItems.MapGet("/{id}", async (int id, TodoDb db) =>
    await db.Todos.FindAsync(id)
        is Todo todo
            ? Results.Ok(todo)
            : Results.NotFound());

todoItems.MapPost("/", async (Todo todo, TodoDb db) =>
{
    db.Todos.Add(todo);
    await db.SaveChangesAsync();

    return Results.Created($"/todoitems/{todo.Id}", todo);
});

todoItems.MapPut("/{id}", async (int id, Todo inputTodo, TodoDb db) =>
{
    var todo = await db.Todos.FindAsync(id);

    if (todo is null) return Results.NotFound();

    todo.Name = inputTodo.Name;
    todo.IsComplete = inputTodo.IsComplete;

    await db.SaveChangesAsync();

    return Results.NoContent();
});

todoItems.MapDelete("/{id}", async (int id, TodoDb db) =>
{
    if (await db.Todos.FindAsync(id) is Todo todo)
    {
        db.Todos.Remove(todo);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    return Results.NotFound();
});

app.Run();
```

 - Adds var todoItems = ```app.MapGroup("/todoitems");``` to set up the group using the URL prefix ```/todoitems```.

 - Changes all the ```app.Map<HttpVerb>``` methods to `todoItems.Map<HttpVerb>`.

 - Removes the URL prefix ```/todoitems``` from the `Map<HttpVerb>` method calls.

## Use the TypedResults API

  - Visual Studio

  - Visual Studio Code

```csharp
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<TodoDb>(opt => opt.UseInMemoryDatabase("TodoList"));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();
var app = builder.Build();

var todoItems = app.MapGroup("/todoitems");

todoItems.MapGet("/", GetAllTodos);
todoItems.MapGet("/complete", GetCompleteTodos);
todoItems.MapGet("/{id}", GetTodo);
todoItems.MapPost("/", CreateTodo);
todoItems.MapPut("/{id}", UpdateTodo);
todoItems.MapDelete("/{id}", DeleteTodo);

app.Run();

static async Task<IResult> GetAllTodos(TodoDb db)
{
    return TypedResults.Ok(await db.Todos.ToArrayAsync());
}

static async Task<IResult> GetCompleteTodos(TodoDb db)
{
    return TypedResults.Ok(await db.Todos.Where(t => t.IsComplete).ToListAsync());
}

static async Task<IResult> GetTodo(int id, TodoDb db)
{
    return await db.Todos.FindAsync(id)
        is Todo todo
            ? TypedResults.Ok(todo)
            : TypedResults.NotFound();
}

static async Task<IResult> CreateTodo(Todo todo, TodoDb db)
{
    db.Todos.Add(todo);
    await db.SaveChangesAsync();

    return TypedResults.Created($"/todoitems/{todo.Id}", todo);
}

static async Task<IResult> UpdateTodo(int id, Todo inputTodo, TodoDb db)
{
    var todo = await db.Todos.FindAsync(id);

    if (todo is null) return TypedResults.NotFound();

    todo.Name = inputTodo.Name;
    todo.IsComplete = inputTodo.IsComplete;

    await db.SaveChangesAsync();

    return TypedResults.NoContent();
}

static async Task<IResult> DeleteTodo(int id, TodoDb db)
{
    if (await db.Todos.FindAsync(id) is Todo todo)
    {
        db.Todos.Remove(todo);
        await db.SaveChangesAsync();
        return TypedResults.NoContent();
    }

    return TypedResults.NotFound();
}
```

```csharp
using NSwag.AspNetCore;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<TodoDb>(opt => opt.UseInMemoryDatabase("TodoList"));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApiDocument(config =>
{
    config.DocumentName = "TodoAPI";
    config.Title = "TodoAPI v1";
    config.Version = "v1";
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi(config =>
    {
        config.DocumentTitle = "TodoAPI";
        config.Path = "/swagger";
        config.DocumentPath = "/swagger/{documentName}/swagger.json";
        config.DocExpansion = "list";
    });
}

var todoItems = app.MapGroup("/todoitems");

todoItems.MapGet("/", GetAllTodos);
todoItems.MapGet("/complete", GetCompleteTodos);
todoItems.MapGet("/{id}", GetTodo);
todoItems.MapPost("/", CreateTodo);
todoItems.MapPut("/{id}", UpdateTodo);
todoItems.MapDelete("/{id}", DeleteTodo);

app.Run();

static async Task<IResult> GetAllTodos(TodoDb db)
{
    return TypedResults.Ok(await db.Todos.ToArrayAsync());
}

static async Task<IResult> GetCompleteTodos(TodoDb db)
{
    return TypedResults.Ok(await db.Todos.Where(t => t.IsComplete).ToListAsync());
}

static async Task<IResult> GetTodo(int id, TodoDb db)
{
    return await db.Todos.FindAsync(id)
        is Todo todo
            ? TypedResults.Ok(todo)
            : TypedResults.NotFound();
}

static async Task<IResult> CreateTodo(Todo todo, TodoDb db)
{
    db.Todos.Add(todo);
    await db.SaveChangesAsync();

    return TypedResults.Created($"/todoitems/{todo.Id}", todo);
}

static async Task<IResult> UpdateTodo(int id, Todo inputTodo, TodoDb db)
{
    var todo = await db.Todos.FindAsync(id);

    if (todo is null) return TypedResults.NotFound();

    todo.Name = inputTodo.Name;
    todo.IsComplete = inputTodo.IsComplete;

    await db.SaveChangesAsync();

    return TypedResults.NoContent();
}

static async Task<IResult> DeleteTodo(int id, TodoDb db)
{
    if (await db.Todos.FindAsync(id) is Todo todo)
    {
        db.Todos.Remove(todo);
        await db.SaveChangesAsync();
        return TypedResults.NoContent();
    }

    return TypedResults.NotFound();
}
```

```csharp
var todoItems = app.MapGroup("/todoitems");

todoItems.MapGet("/", GetAllTodos);
todoItems.MapGet("/complete", GetCompleteTodos);
todoItems.MapGet("/{id}", GetTodo);
todoItems.MapPost("/", CreateTodo);
todoItems.MapPut("/{id}", UpdateTodo);
todoItems.MapDelete("/{id}", DeleteTodo);
```

```csharp
static async Task<IResult> GetAllTodos(TodoDb db)
{
    return TypedResults.Ok(await db.Todos.ToArrayAsync());
}

static async Task<IResult> GetCompleteTodos(TodoDb db)
{
    return TypedResults.Ok(await db.Todos.Where(t => t.IsComplete).ToListAsync());
}

static async Task<IResult> GetTodo(int id, TodoDb db)
{
    return await db.Todos.FindAsync(id)
        is Todo todo
            ? TypedResults.Ok(todo)
            : TypedResults.NotFound();
}

static async Task<IResult> CreateTodo(Todo todo, TodoDb db)
{
    db.Todos.Add(todo);
    await db.SaveChangesAsync();

    return TypedResults.Created($"/todoitems/{todo.Id}", todo);
}

static async Task<IResult> UpdateTodo(int id, Todo inputTodo, TodoDb db)
{
    var todo = await db.Todos.FindAsync(id);

    if (todo is null) return TypedResults.NotFound();

    todo.Name = inputTodo.Name;
    todo.IsComplete = inputTodo.IsComplete;

    await db.SaveChangesAsync();

    return TypedResults.NoContent();
}

static async Task<IResult> DeleteTodo(int id, TodoDb db)
{
    if (await db.Todos.FindAsync(id) is Todo todo)
    {
        db.Todos.Remove(todo);
        await db.SaveChangesAsync();
        return TypedResults.NoContent();
    }

    return TypedResults.NotFound();
}
```

```csharp
static async Task<IResult> GetAllTodos(TodoDb db)
{
    return TypedResults.Ok(await db.Todos.ToArrayAsync());
}
```

```csharp
public async Task GetAllTodos_ReturnsOkOfTodosResult()
{
    // Arrange
    var db = CreateDbContext();

    // Act
    var result = await TodosApi.GetAllTodos(db);

    // Assert: Check for the correct returned type
    Assert.IsType<Ok<Todo[]>>(result);
}
```

## Prevent over-posting

 - Prevent over-posting.

 - Hide properties that clients aren't supposed to view.

 - Omit some properties to reduce payload size.

 - Flatten object graphs that contain nested objects. Flattened object graphs can be more convenient for clients.

```csharp
public class Todo
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public bool IsComplete { get; set; }
    public string? Secret { get; set; }
}
```

```csharp
public class TodoItemDTO
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public bool IsComplete { get; set; }

    public TodoItemDTO() { }
    public TodoItemDTO(Todo todoItem) =>
    (Id, Name, IsComplete) = (todoItem.Id, todoItem.Name, todoItem.IsComplete);
}
```

  - Visual Studio

  - Visual Studio Code

```csharp
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<TodoDb>(opt => opt.UseInMemoryDatabase("TodoList"));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();
var app = builder.Build();

RouteGroupBuilder todoItems = app.MapGroup("/todoitems");

todoItems.MapGet("/", GetAllTodos);
todoItems.MapGet("/complete", GetCompleteTodos);
todoItems.MapGet("/{id}", GetTodo);
todoItems.MapPost("/", CreateTodo);
todoItems.MapPut("/{id}", UpdateTodo);
todoItems.MapDelete("/{id}", DeleteTodo);

app.Run();

static async Task<IResult> GetAllTodos(TodoDb db)
{
    return TypedResults.Ok(await db.Todos.Select(x => new TodoItemDTO(x)).ToArrayAsync());
}

static async Task<IResult> GetCompleteTodos(TodoDb db) {
    return TypedResults.Ok(await db.Todos.Where(t => t.IsComplete).Select(x => new TodoItemDTO(x)).ToListAsync());
}

static async Task<IResult> GetTodo(int id, TodoDb db)
{
    return await db.Todos.FindAsync(id)
        is Todo todo
            ? TypedResults.Ok(new TodoItemDTO(todo))
            : TypedResults.NotFound();
}

static async Task<IResult> CreateTodo(TodoItemDTO todoItemDTO, TodoDb db)
{
    var todoItem = new Todo
    {
        IsComplete = todoItemDTO.IsComplete,
        Name = todoItemDTO.Name
    };

    db.Todos.Add(todoItem);
    await db.SaveChangesAsync();

    todoItemDTO = new TodoItemDTO(todoItem);

    return TypedResults.Created($"/todoitems/{todoItem.Id}", todoItemDTO);
}

static async Task<IResult> UpdateTodo(int id, TodoItemDTO todoItemDTO, TodoDb db)
{
    var todo = await db.Todos.FindAsync(id);

    if (todo is null) return TypedResults.NotFound();

    todo.Name = todoItemDTO.Name;
    todo.IsComplete = todoItemDTO.IsComplete;

    await db.SaveChangesAsync();

    return TypedResults.NoContent();
}

static async Task<IResult> DeleteTodo(int id, TodoDb db)
{
    if (await db.Todos.FindAsync(id) is Todo todo)
    {
        db.Todos.Remove(todo);
        await db.SaveChangesAsync();
        return TypedResults.NoContent();
    }

    return TypedResults.NotFound();
}
```

```csharp
using NSwag.AspNetCore;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<TodoDb>(opt => opt.UseInMemoryDatabase("TodoList"));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApiDocument(config =>
{
    config.DocumentName = "TodoAPI";
    config.Title = "TodoAPI v1";
    config.Version = "v1";
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi(config =>
    {
        config.DocumentTitle = "TodoAPI";
        config.Path = "/swagger";
        config.DocumentPath = "/swagger/{documentName}/swagger.json";
        config.DocExpansion = "list";
    });
}

RouteGroupBuilder todoItems = app.MapGroup("/todoitems");

todoItems.MapGet("/", GetAllTodos);
todoItems.MapGet("/complete", GetCompleteTodos);
todoItems.MapGet("/{id}", GetTodo);
todoItems.MapPost("/", CreateTodo);
todoItems.MapPut("/{id}", UpdateTodo);
todoItems.MapDelete("/{id}", DeleteTodo);

app.Run();

static async Task<IResult> GetAllTodos(TodoDb db)
{
    return TypedResults.Ok(await db.Todos.Select(x => new TodoItemDTO(x)).ToArrayAsync());
}

static async Task<IResult> GetCompleteTodos(TodoDb db) {
    return TypedResults.Ok(await db.Todos.Where(t => t.IsComplete).Select(x => new TodoItemDTO(x)).ToListAsync());
}

static async Task<IResult> GetTodo(int id, TodoDb db)
{
    return await db.Todos.FindAsync(id)
        is Todo todo
            ? TypedResults.Ok(new TodoItemDTO(todo))
            : TypedResults.NotFound();
}

static async Task<IResult> CreateTodo(TodoItemDTO todoItemDTO, TodoDb db)
{
    var todoItem = new Todo
    {
        IsComplete = todoItemDTO.IsComplete,
        Name = todoItemDTO.Name
    };

    db.Todos.Add(todoItem);
    await db.SaveChangesAsync();

    todoItemDTO = new TodoItemDTO(todoItem);

    return TypedResults.Created($"/todoitems/{todoItem.Id}", todoItemDTO);
}

static async Task<IResult> UpdateTodo(int id, TodoItemDTO todoItemDTO, TodoDb db)
{
    var todo = await db.Todos.FindAsync(id);

    if (todo is null) return TypedResults.NotFound();

    todo.Name = todoItemDTO.Name;
    todo.IsComplete = todoItemDTO.IsComplete;

    await db.SaveChangesAsync();

    return TypedResults.NoContent();
}

static async Task<IResult> DeleteTodo(int id, TodoDb db)
{
    if (await db.Todos.FindAsync(id) is Todo todo)
    {
        db.Todos.Remove(todo);
        await db.SaveChangesAsync();
        return TypedResults.NoContent();
    }

    return TypedResults.NotFound();
}
```

## Troubleshooting with the completed sample

## Next steps

 - Configure JSON serialization options.

 - Handle errors and exceptions: The developer exception page is enabled by default in the development environment for minimal API apps. For information about how to handle errors and exceptions, see Handle errors in ASP.NET Core APIs.

 - For an example of testing a minimal API app, see this GitHub sample.

 - OpenAPI support in minimal APIs.

 - Quickstart: Publish to Azure.

 - Organizing ASP.NET Core Minimal APIs.

### Learn more

Ref: [Tutorial: Create a minimal API with ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/tutorials/min-web-api?view=aspnetcore-8.0)