---
title: APIs - Minimal APIs - Route Handlers
published: true
date: 2024-09-09 08:41:35
tags: Summary, AspNetCore
description: A configured WebApplication supports Map{Verb} and MapMethods where {Verb} is a Pascal-cased HTTP method like Get, Post, Put or Delete:
image:
---

## In this article

A configured ```WebApplication``` supports Map{Verb} and MapMethods where {Verb} is a Pascal-cased HTTP method like ```Get```, ```Post```, ```Put``` or ```Delete```:

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "This is a GET");
app.MapPost("/", () => "This is a POST");
app.MapPut("/", () => "This is a PUT");
app.MapDelete("/", () => "This is a DELETE");

app.MapMethods("/options-or-head", new[] { "OPTIONS", "HEAD" }, 
                          () => "This is an options or head request ");

app.Run();
```

The Delegate arguments passed to these methods are called "route handlers".

## Route handlers

Route handlers are methods that execute when the route matches.

### Lambda expression

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/inline", () => "This is an inline lambda");

var handler = () => "This is a lambda variable";

app.MapGet("/", handler);

app.Run();
```

### Local function

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

string LocalFunction() => "This is local function";

app.MapGet("/", LocalFunction);

app.Run();
```

### Instance method

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var handler = new HelloHandler();

app.MapGet("/", handler.Hello);

app.Run();

class HelloHandler
{
    public string Hello()
    {
        return "Hello Instance method";
    }
}
```

### Static method

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", HelloHandler.Hello);

app.Run();

class HelloHandler
{
    public static string Hello()
    {
        return "Hello static method";
    }
}
```

### Endpoint defined outside of ```Program.cs```

Minimal APIs don't have to be located in ```Program.cs```.

 ```Program.cs```

```csharp
using MinAPISeparateFile;

var builder = WebApplication.CreateSlimBuilder(args);

var app = builder.Build();

TodoEndpoints.Map(app);

app.Run();
```

 ```TodoEndpoints.cs```

```csharp
namespace MinAPISeparateFile;

public static class TodoEndpoints
{
    public static void Map(WebApplication app)
    {
        app.MapGet("/", async context =>
        {
            // Get all todo items
            await context.Response.WriteAsJsonAsync(new { Message = "All todo items" });
        });

        app.MapGet("/{id}", async context =>
        {
            // Get one todo item
            await context.Response.WriteAsJsonAsync(new { Message = "One todo item" });
        });
    }
}
```

See also Route groups later in this article.

### Named endpoints and link generation

Endpoints can be given names in order to generate URLs to the endpoint. Using a named endpoint avoids having to hard code paths in an app:

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/hello", () => "Hello named route")
   .WithName("hi");

app.MapGet("/", (LinkGenerator linker) => 
        $"The link to the hello route is {linker.GetPathByName("hi", values: null)}");

app.Run();
```

The preceding code displays ```The link to the hello route is ```/```hello``` from the / endpoint.

NOTE: Endpoint names are case sensitive.

Endpoint names:

- Must be globally unique.

- Are used as the OpenAPI operation id when OpenAPI support is enabled. For more information, see OpenAPI.

### Route Parameters

Route parameters can be captured as part of the route pattern definition:

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/users/{userId}/books/{bookId}", 
    (int userId, int bookId) => $"The user id is {userId} and book id is {bookId}");

app.Run();
```

The preceding code returns ```The user id is 3 and book id is 7``` from the URI ```/users/3/books/7```.

The route handler can declare the parameters to capture. When a request is made to a route with parameters declared to capture, the parameters are parsed and passed to the handler. This makes it easy to capture the values in a type safe way. In the preceding code, ```userId``` and ```bookId``` are both ```int```.

In the preceding code, if either route value cannot be converted to an ```int```, an exception is thrown. The GET request ```/users/hello/books/3``` throws the following exception:

BadHttpRequestException: Failed to bind parameter "int ```userId```" from "hello".

### Wildcard and catch all routes

The following catch all route returns ```Routing to hello``` from the `/posts/hello' endpoint:

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/posts/{*rest}", (string rest) => $"Routing to {rest}");

app.Run();
```

### Route constraints

Route constraints constrain the matching behavior of a route.

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/todos/{id:int}", (int id) => db.Todos.Find(id));
app.MapGet("/todos/{text}", (string text) => db.Todos.Where(t => t.Text.Contains(text));
app.MapGet("/posts/{slug:regex(^[a-z0-9_-]+$)}", (string slug) => $"Post {slug}");

app.Run();
```

The following table demonstrates the preceding route templates and their behavior:

<table><thead>
<tr>
<th>Route Template</th>
<th>Example Matching URI</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>/todos/{id:int}</code></td>
<td><code>/todos/1</code></td>
</tr>
<tr>
<td><code>/todos/{text}</code></td>
<td><code>/todos/something</code></td>
</tr>
<tr>
<td><code>/posts/{slug:regex(^[a-z0-9_-]+$)}</code></td>
<td><code>/posts/mypost</code></td>
</tr>
</tbody></table>

For more information, see Route constraint reference in Routing in ASP.NET Core.

### Route groups

The MapGroup extension method helps organize groups of endpoints with a common prefix. It reduces repetitive code and allows for customizing entire groups of endpoints with a single call to methods like RequireAuthorization and WithMetadata which add endpoint metadata.

For example, the following code creates two similar groups of endpoints:

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

In this scenario, you can use a relative address for the ```Location``` header in the ```201 Created``` result:

```csharp
public static async Task<Created<Todo>> CreateTodo(Todo todo, TodoDb database)
{
    await database.AddAsync(todo);
    await database.SaveChangesAsync();

    return TypedResults.Created($"{todo.Id}", todo);
}
```

The first group of endpoints will only match requests prefixed with ```/public/todos``` and are accessible without any authentication. The second group of endpoints will only match requests prefixed with ```/private/todos``` and require authentication.

The ```QueryPrivateTodos``` endpoint filter factory is a local function that modifies the route handler's ```TodoDb``` parameters to allow to access and store private todo data.

Route groups also support nested groups and complex prefix patterns with route parameters and constraints. In the following example, and route handler mapped to the ```user``` group can capture the {org} and {group} route parameters defined in the outer group prefixes.

The prefix can also be empty. This can be useful for adding endpoint metadata or filters to a group of endpoints without changing the route pattern.

```csharp
var all = app.MapGroup("").WithOpenApi();
var org = all.MapGroup("{org}");
var user = org.MapGroup("{user}");
user.MapGet("", (string org, string user) => $"{org}/{user}");
```

Adding filters or metadata to a group behaves the same way as adding them individually to each endpoint before adding any extra filters or metadata that may have been added to an inner group or specific endpoint.

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

In the above example, the outer filter will log the incoming request before the inner filter even though it was added second. Because the filters were applied to different groups, the order they were added relative to each other does not matter. The order filters are added does matter if applied to the same group or specific endpoint.

A request to ```/outer/inner/``` will log the following:

```dotnetcli
/outer group filter
/inner group filter
MapGet filter
```

## Parameter binding

Parameter binding in Minimal API applications describes the rules in detail for how route handler parameters are populated.

## Responses

Create responses in Minimal API applications describes in detail how values returned from route handlers are converted into responses.

Ref: [Route Handlers in Minimal API apps](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/route-handlers?view=aspnetcore-8.0)