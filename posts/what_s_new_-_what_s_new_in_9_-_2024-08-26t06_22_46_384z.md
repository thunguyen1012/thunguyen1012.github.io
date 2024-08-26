---
title: What's new - What's new in 9
published: true
date: 2024-08-26 06:22:46
tags: Summary, AspNetCore
description: This article highlights the most significant changes in ASP.NET Core 9.0 with links to relevant documentation.
image:
---

## In this article

This article highlights the most significant changes in ASP.NET Core 9.0 with links to relevant documentation.

This article has been updated for .NET 9 Preview 7.

## Blazor

This section describes new features for Blazor.

### .NET MAUI Blazor Hybrid and Web App solution template

A new solution template makes it easier to create .NET MAUI native and Blazor web client apps that share the same UI. This template shows how to create client apps that maximize code reuse and target Android, iOS, Mac, Windows, and Web.

Key features of this template include:

- The ability to choose a Blazor interactive render mode for the web app.

- Automatic creation of the appropriate projects, including a Blazor Web App (global Interactive Auto rendering) and a .NET MAUI Blazor Hybrid app.

- The created projects use a shared Razor class library (RCL) to maintain the UI's Razor components.

- Sample code is included that demonstrates how to use dependency injection to provide different interface implementations for the Blazor Hybrid app and the Blazor Web App.

To get started, install the .NET 9 SDK and install the .NET MAUI workload, which contains the template:

```dotnetcli
dotnet workload install maui
```

Create a solution from the project template in a command shell using the following command:

```dotnetcli
dotnet new maui-blazor-web
```

The template is also available in Visual Studio.

> Note
Currently, an exception occurs if Blazor rendering modes are defined at the per-page/component level. For more information, see BlazorWebView needs a way to enable overriding `ResolveComponentForRenderMode` (dotnet/aspnetcore #51235).

For more information, see Build a .NET MAUI Blazor Hybrid app with a Blazor Web App.

### Static asset delivery optimization

 ```MapStaticAssets``` is a new middleware that helps optimize the delivery of static assets in any ASP.NET Core app, including Blazor apps.

For more information, see either of the following resources:

- The Optimizing static web asset delivery section of this article.

- ASP.NET Core Blazor static files.

### Detect rendering location, interactivity, and assigned render mode at runtime

We've introduced a new API designed to simplify the process of querying component states at runtime. This API provides the following capabilities:

- Determine the current execution location of the component: This can be particularly useful for debugging and optimizing component performance.

- Check if the component is running in an interactive environment: This can be helpful for components that have different behaviors based on the interactivity of their environment.

- Retrieve the assigned render mode for the component: Understanding the render mode can help in optimizing the rendering process and improving the overall performance of a component.

For more information, see ASP.NET Core Blazor render modes.

### Improved server-side reconnection experience:

The following enhancements have been made to the default server-side reconnection experience:

- When the user navigates back to an app with a disconnected circuit, reconnection is attempted immediately rather than waiting for the duration of the next reconnect interval. This improves the user experience when navigating to an app in a browser tab that has gone to sleep.

- When a reconnection attempt reaches the server but the server has already released the circuit, a page refresh occurs automatically. This prevents the user from having to manually refresh the page if it's likely going to result in a successful reconnection.

- Reconnect timing uses a computed backoff strategy. By default, the first several reconnection attempts occur in rapid succession without a retry interval before computed delays are introduced between attempts. You can customize the retry interval behavior by specifying a function to compute the retry interval, as the following exponential backoff example demonstrates:

```javascript
Blazor.start({
  circuit: {
    reconnectionOptions: {
      retryIntervalMilliseconds: (previousAttempts, maxRetries) => 
        previousAttempts >= maxRetries ? null : previousAttempts * 1000
    },
  },
});
```

- The styling of the default reconnect UI has been modernized.

For more information, see ASP.NET Core Blazor SignalR guidance.

### Simplified authentication state serialization for Blazor Web Apps

New APIs make it easier to add authentication to an existing Blazor Web App. When you create a new Blazor Web App with authentication using Individual Accounts and you enable WebAssembly-based interactivity, the project includes a custom `AuthenticationStateProvider` in both the server and client projects.

These providers flow the user's authentication state to the browser. Authenticating on the server rather than the client allows the app to access authentication state during prerendering and before the Blazor WebAssembly runtime is initialized.

The custom `AuthenticationStateProvider` implementations use the Persistent Component State service (`PersistentComponentState`) to serialize the authentication state into HTML comments and read it back from WebAssembly to create a new `AuthenticationState` instance.

This works well if you've started from the Blazor Web App project template and selected the Individual Accounts option, but it's a lot of code to implement yourself or copy if you're trying to add authentication to an existing project. There are now APIs, which are now part of the Blazor Web App project template, that can be called in the server and client projects to add this functionality:

- ```AddAuthenticationStateSerialization```: Adds the necessary services to serialize the authentication state on the server.

- ```AddAuthenticationStateDeserialization```: Adds the necessary services to deserialize the authentication state in the browser.

By default, the API only serializes the server-side name and role claims for access in the browser. An option can be passed to ```AddAuthenticationStateSerialization``` to include all claims.

For more information, see the following sections of the ** article:

- Blazor Identity UI (Individual Accounts)

- Manage authentication state in Blazor Web Apps

### Add static server-side rendering (SSR) pages to a globally-interactive Blazor Web App

With the release of .NET 9, it's now simpler to add static SSR pages to apps that adopt global interactivity.

This approach is only useful when the app has specific pages that can't work with interactive Server or WebAssembly rendering. For example, adopt this approach for pages that depend on reading/writing HTTP cookies and can only work in a request/response cycle instead of interactive rendering. For pages that work with interactive rendering, you shouldn't force them to use static SSR rendering, as it's less efficient and less responsive for the end user.

Mark any Razor component page with the new `[ExcludeFromInteractiveRouting]` attribute assigned with the ```@attribute``` Razor directive:

```razor
@attribute [ExcludeFromInteractiveRouting]
```

Applying the attribute causes navigation to the page to exit from interactive routing. Inbound navigation is forced to perform a full-page reload instead resolving the page via interactive routing. The full-page reload forces the top-level root component, typically the App component (App.razor), to rerender from the server, allowing the app to switch to a different top-level render mode.

The ```HttpContext.AcceptsInteractiveRouting``` extension method allows the component to detect whether `[ExcludeFromInteractiveRouting]` is applied to the current page.

In the App component, use the pattern in the following example:

- Pages that aren't annotated with `[ExcludeFromInteractiveRouting]` default to the ```InteractiveServer``` render mode with global interactivity. You can replace ```InteractiveServer``` with ```InteractiveWebAssembly``` or ```InteractiveAuto``` to specify a different default global render mode.

- Pages annotated with `[ExcludeFromInteractiveRouting]` adopt static SSR (PageRenderMode is assigned ```null```).

```razor
<!DOCTYPE html>
<html>
<head>
    ...
    <HeadOutlet @rendermode="@PageRenderMode" />
</head>
<body>
    <Routes @rendermode="@PageRenderMode" />
    ...
</body>
</html>

@code {
    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = default!;

    private IComponentRenderMode? PageRenderMode
        => HttpContext.AcceptsInteractiveRouting() ? InteractiveServer : null;
}
```

An alternative to using the ```HttpContext.AcceptsInteractiveRouting``` extension method is to read endpoint metadata manually using ```HttpContext.GetEndpoint()?.Metadata```.

This feature is covered by the reference documentation in ASP.NET Core Blazor render modes.

### Constructor injection

Razor components support constructor injection.

In the following example, the partial (code-behind) class injects the ```NavigationManager``` service using a primary constructor:

```csharp
public partial class ConstructorInjection(NavigationManager navigation)
{
    protected NavigationManager Navigation { get; } = navigation;
}
```

For more information, see ASP.NET Core Blazor dependency injection.

### Websocket compression for Interactive Server components

By default, Interactive Server components enable compression for WebSocket connections and set a ```frame-ancestors``` Content Security Policy (CSP) directive set to 'self', which only permits embedding the app in an `<iframe>` of the origin from which the app is served when compression is enabled or when a configuration for the WebSocket context is provided.

Compression can be disabled by setting ```ConfigureWebSocketOptions``` to ```null```, which reduces the vulnerability of the app to attack but may result in reduced performance:

```csharp
.AddInteractiveServerRenderMode(o => o.ConfigureWebSocketOptions = null)
```

Configure a stricter ```frame-ancestors``` CSP with a value of 'none' (single quotes ```required```), which allows WebSocket compression but prevents browsers from embedding the app into any <iframe>:

```csharp
.AddInteractiveServerRenderMode(o => o.ContentSecurityFrameAncestorsPolicy = "'none'")
```

For more information, see the following resources:

- ASP.NET Core Blazor SignalR guidance

- Threat mitigation guidance for ASP.NET Core Blazor interactive server-side rendering

### Handle keyboard composition events in Blazor

The new ```KeyboardEventArgs.IsComposing``` property indicates if the keyboard event is part of a composition session. Tracking the composition state of keyboard events is crucial for handling international character input methods.

### Added ```OverscanCount``` parameter to ```QuickGrid```

The ```QuickGrid``` component now exposes an ```OverscanCount``` property that specifies how many additional rows are rendered before and after the visible region when virtualization is enabled.

The default ```OverscanCount``` is 3. The following example increases the ```OverscanCount``` to 4:

```razor
<QuickGrid ItemsProvider="itemsProvider" Virtualize="true" OverscanCount="4">
    ...
</QuickGrid>
```

## SignalR

This section describes new features for SignalR.

### Polymorphic type support in SignalR Hubs

Hub methods can now accept a base class instead of the derived class to enable polymorphic scenarios. The base type needs to be annotated to allow polymorphism.

```csharp
public class MyHub : Hub
{
    public void Method(JsonPerson person)
    {
        if (person is JsonPersonExtended)
        {
        }
        else if (person is JsonPersonExtended2)
        {
        }
        else
        {
        }
    }
}

[JsonPolymorphic]
[JsonDerivedType(typeof(JsonPersonExtended), nameof(JsonPersonExtended))]
[JsonDerivedType(typeof(JsonPersonExtended2), nameof(JsonPersonExtended2))]
private class JsonPerson
{
    public string Name { get; set; }
    public Person Child { get; set; }
    public Person Parent { get; set; }
}

private class JsonPersonExtended : JsonPerson
{
    public int Age { get; set; }
}

private class JsonPersonExtended2 : JsonPerson
{
    public string Location { get; set; }
}
```

### Improved Activities for SignalR

SignalR now has an `ActivitySource` named ```Microsoft.AspNetCore.SignalR.Server``` that emits events for hub method calls:

- Every method is its own activity, so anything that emits an activity during the hub method call is under the hub method activity.

- Hub method activities don't have a parent. This means they are not bundled under the long-running SignalR connection.

The following example uses the .NET Aspire dashboard and the OpenTelemetry packages:

```xml
<PackageReference Include="OpenTelemetry.Exporter.OpenTelemetryProtocol" Version="1.9.0" />
<PackageReference Include="OpenTelemetry.Extensions.Hosting" Version="1.9.0" />
<PackageReference Include="OpenTelemetry.Instrumentation.AspNetCore" Version="1.9.0" />
```

Add the following startup code to the ```Program.cs``` file:

```csharp
// Set OTEL_EXPORTER_OTLP_ENDPOINT environment variable depending on where your OTEL endpoint is
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddSignalR();

builder.Services.AddOpenTelemetry()
    .WithTracing(tracing =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // We want to view all traces in development
            tracing.SetSampler(new AlwaysOnSampler());
        }

        tracing.AddAspNetCoreInstrumentation();
        tracing.AddSource("Microsoft.AspNetCore.SignalR.Server");
    });

builder.Services.ConfigureOpenTelemetryTracerProvider(tracing => tracing.AddOtlpExporter());
```

The following is example output from the Aspire Dashboard:



### SignalR supports trimming and native AOT

Continuing the native AOT journey started in .NET 8, we have enabled trimming and native ahead-of-time (AOT) compilation support for both SignalR client and server scenarios. You can now take advantage of the performance benefits of using native AOT in applications that use SignalR for real-time web communications.

#### Getting started

Install the latest .NET 9 SDK.

Create a solution from the ```webapiaot``` template in a command shell using the following command:

```dotnetcli
dotnet new webapiaot -o SignalRChatAOTExample
```

Replace the contents of the ```Program.cs``` file with the following SignalR code:

```csharp
using Microsoft.AspNetCore.SignalR;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateSlimBuilder(args);

builder.Services.AddSignalR();
builder.Services.Configure<JsonHubProtocolOptions>(o =>
{
    o.PayloadSerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonSerializerContext.Default);
});

var app = builder.Build();

app.MapHub<ChatHub>("/chatHub");
app.MapGet("/", () => Results.Content("""
<!DOCTYPE html>
<html>
<head>
    <title>SignalR Chat</title>
</head>
<body>
    <input id="userInput" placeholder="Enter your name" />
    <input id="messageInput" placeholder="Type a message" />
    <button onclick="sendMessage()">Send</button>
    <ul id="messages"></ul>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/microsoft-signalr/8.0.7/signalr.min.js"></script>
    <script>
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("/chatHub")
            .build();

        connection.on("ReceiveMessage", (user, message) => {
            const li = document.createElement("li");
            li.textContent = `${user}: ${message}`;
            document.getElementById("messages").appendChild(li);
        });

        async function sendMessage() {
            const user = document.getElementById("userInput").value;
            const message = document.getElementById("messageInput").value;
            await connection.invoke("SendMessage", user, message);
        }

        connection.start().catch(err => console.error(err));
    </script>
</body>
</html>
""", "text/html"));

app.Run();

[JsonSerializable(typeof(string))]
internal partial class AppJsonSerializerContext : JsonSerializerContext { }

public class ChatHub : Hub
{
    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }
}
```

The preceding example produces a native Windows executable of 10 MB and a Linux executable of 10.9 MB.

#### Limitations

- Only the JSON protocol is currently supported:

  - As shown in the preceding code, apps that use JSON serialization and Native AOT must use the ```System.Text.Json``` Source Generator.

  - This follows the same approach as minimal APIs.

- On the SignalR server, Hub method parameters of type `IAsyncEnumerable<T>` and `ChannelReader<T>` where ```T``` is a ValueType (i.e. ```struct```) aren't supported. Using these types results in a runtime exception at startup in development and in the published app. For more information, see SignalR: Using `IAsyncEnumerable<T>` and `ChannelReader<T>` with ValueTypes in native AOT (dotnet/aspnetcore #56179).

- Strongly typed hubs aren't supported with Native AOT (PublishAot). Using strongly typed hubs with Native AOT will result in warnings during build and publish, and a runtime exception. Using strongly typed hubs with trimming (PublishedTrimmed) is supported.

- Only ```Task```, ```Task<T>```, ```ValueTask```, or ```ValueTask<T>``` are supported for async return types.

## Minimal APIs

This section describes new features for minimal APIs.

### Added ```InternalServerError``` and ```InternalServerError<TValue>``` to ```TypedResults```

The ```TypedResults``` class is a helpful vehicle for returning strongly-typed HTTP status code-based responses from a minimal API.  ```TypedResults``` now includes factory methods and types for returning "500 Internal Server Error" responses from endpoints. Here's an example that returns a 500 response:

```csharp
var app = WebApplication.Create();

app.MapGet("/", () => TypedResults.InternalServerError("Something went wrong!"));

app.Run();
```

### Call ```ProducesProblem``` and ```ProducesValidationProblem``` on route groups

The ```ProducesProblem``` and ```ProducesValidationProblem``` extension methods have been updated to support their use on route groups. These methods indicate that all endpoints in a route group can return ```ProblemDetails``` or ```ValidationProblemDetails``` responses for the purposes of OpenAPI metadata.

```csharp
var app = WebApplication.Create();

var todos = app.MapGroup("/todos")
    .ProducesProblem();

todos.MapGet("/", () => new Todo(1, "Create sample app", false));
todos.MapPost("/", (Todo todo) => Results.Ok(todo));

app.Run();

record Todo(int Id, string Title, boolean IsCompleted);
```

## OpenAPI

This section describes new features for OpenAPI

### Built-in support for OpenAPI document generation

The OpenAPI specification is a standard for describing HTTP APIs. The standard allows developers to define the shape of APIs that can be plugged into client generators, server generators, testing tools, documentation, and more. In .NET 9 Preview, ASP.NET Core provides built-in support for generating OpenAPI documents representing controller-based or minimal APIs via the ```Microsoft.AspNetCore.OpenApi``` package.

The following highlighted code calls:

- ```AddOpenApi``` to register the ```required``` dependencies into the app's DI container.

- ```MapOpenApi``` to register the ```required``` OpenAPI endpoints in the app's routes.

```csharp
var builder = WebApplication.CreateBuilder();

builder.Services.AddOpenApi();

var app = builder.Build();

app.MapOpenApi();

app.MapGet("/hello/{name}", (string name) => $"Hello {name}"!);

app.Run();
```

Install the ```Microsoft.AspNetCore.OpenApi``` package in the project using the following command:

```dotnetcli
dotnet add package Microsoft.AspNetCore.OpenApi --prerelease
```

Run the app and navigate to ```openapi/v1.json``` to view the generated OpenAPI document:



OpenAPI documents can also be generated at build-time by adding the ```Microsoft.Extensions.ApiDescription.Server``` package:

```dotnetcli
dotnet add package Microsoft.Extensions.ApiDescription.Server --prerelease
```

In the app's project file, add the following:

```xml
<PropertyGroup>
  <OpenApiDocumentsDirectory>$(MSBuildProjectDirectory)</OpenApiDocumentsDirectory>
  <OpenApiGenerateDocuments>true</OpenApiGenerateDocuments>
</PropertyGroup>
```

Run ```dotnet build``` and inspect the generated JSON file in the project directory.



ASP.NET Core's built-in OpenAPI document generation provides support for various customizations and options. It provides document and operation transformers and has the ability to manage multiple OpenAPI documents for the same application.

To learn more about ASP.NET Core's new OpenAPI document capabilities, see the new ```Microsoft.AspNetCore.OpenApi``` docs.

### Intellisense completion enhancements for OpenAPI package

ASP.NET Core's OpenAPI support is now more accessible and user-friendly. The OpenAPI APIs are shipped as an independent package, separate from the shared framework. Until now, this meant that developers didn't have the convenience of code-completion features like Intellisense for OpenAPI APIs.

Recognizing this gap, we have introduced a new completion provider and code fixer. These tools are designed to facilitate the discovery and use of OpenAPI APIs, making it easier for developers to integrate OpenAPI into their projects. The completion provider offers real-time code suggestions, while the code fixer assists in correcting common mistakes and improving API usage. This enhancement is part of our ongoing commitment to improve the developer experience and streamline API-related workflows.

When a user types a statement where an OpenAPI-related API is available, the completion provider displays a recommendation for the API. For example, in the following screenshots, completions for ```AddOpenApi``` and ```MapOpenApi``` are provided when a user is entering an invocation statement on a supported type, such as IEndpointConventionBuilder:

When the completion is accepted and the ```Microsoft.AspNetCore.OpenApi``` package is not installed, a codefixer provides a shortcut for automatically installing the dependency in the project.

### Support for `[Required]` and `[DefaultValue]` attributes on parameters and properties

When `[Required]` and `[DefaultValue]` attributes are applied on parameters or properties within complex types, the OpenAPI implementation maps these to the ```required``` and default properties in the OpenAPI document associated with the parameter or type schema.

For example, the following API produces the accompanying schema for the ```Todo``` type.

```csharp
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

var builder = WebApplication.CreateBuilder();

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapPost("/todos", (Todo todo) => { });

app.Run();

class Todo
{
	public int Id { get; init; }
	public required string Title { get; init; }
	[DefaultValue("A new todo")]
	public required string Description { get; init; }
	[Required]
	public DateTime CreatedOn { get; init; }
}
```

```json
{
	"required": [
	  "title",
	  "description",
	  "createdOn"
	],
	"type": "object",
	"properties": {
	  "id": {
	    "type": "integer",
	    "format": "int32"
	  },
	  "title": {
	    "type": "string"
	  },
	  "description": {
	    "type": "string",
	    "default": "A new todo"
	  },
	  "createdOn": {
	    "type": "string",
	    "format": "date-time"
	  }
	}
}
```

### Support for schema transformers on OpenAPI documents

Built-in OpenAPI support now ships with support for schema transformers that can be used to modify schemas generated by ```System.Text.Json``` and the OpenAPI implementation. Like document and operation transformers, schema transformers can be registered on the `OpenApiOptions` object. For example, the following code sample demonstrates using a schema transformer to add an example to a type's schema.

```csharp
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Microsoft.OpenApi.Any;

var builder = WebApplication.CreateBuilder();

builder.Services.AddOpenApi(options =>
{
    options.UseSchemaTransformer((schema, context, cancellationToken) =>
    {
        if (context.Type == typeof(Todo))
        {
            schema.Example = new OpenApiObject
            {
                ["id"] = new OpenApiInteger(1),
                ["title"] = new OpenApiString("A short title"),
                ["description"] = new OpenApiString("A long description"),
                ["createdOn"] = new OpenApiDateTime(DateTime.Now)
            };
        }
        return Task.CompletedTask;
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapPost("/todos", (Todo todo) => { });

app.Run();

class Todo
{
	public int Id { get; init; }
	public required string Title { get; init; }
	[DefaultValue("A new todo")]
	public required string Description { get; init; }
	[Required]
	public DateTime CreatedOn { get; init; }
}
```

### Improvements to transformer registration APIs in ```Microsoft.AspNetCore.OpenApi```

OpenAPI transformers support modifying the OpenAPI document, operations within the document, or schemas associated with types in the API. The APIs for registering transformers on an OpenAPI document provide a variety of options for registering transformers.

Previously, the following APIs were available for registering transformers:

```csharp
OpenApiOptions UseTransformer(Func<OpenApiDocument, OpenApiDocumentTransformerContext, CancellationToken, Task> transformer)
OpenApiOptions UseTransformer(IOpenApiDocumentTransformer transformer)
OpenApiOptions UseTransformer<IOpenApiDocumentTransformer>()
OpenApiOptions UseSchemaTransformer(Func<OpenApiSchema, OpenApiSchemaTransformerContext, CancellationToken, Task>)
OpenApiOptions UseOperationTransformer(Func<OpenApiOperation, OpenApiOperationTransformerContext, CancellationToken, Task>)
```

The new API set is as follows:

```csharp
OpenApiOptions AddDocumentTransformer(Func<OpenApiDocument, OpenApiDocumentTransformerContext, CancellationToken, Task> transformer)
OpenApiOptions AddDocumentTransformer(IOpenApiDocumentTransformer transformer)
OpenApiOptions AddDocumentTransformer<IOpenApiDocumentTransformer>()

OpenApiOptions AddSchemaTransformer(Func<OpenApiSchema, OpenApiSchemaTransformerContext, CancellationToken, Task> transformer)
OpenApiOptions AddSchemaTransformer(IOpenApiSchemaTransformer transformer)
OpenApiOptions AddSchemaTransformer<IOpenApiSchemaTransformer>()

OpenApiOptions AddOperationTransformer(Func<OpenApiOperation, OpenApiOperationTransformerContext, CancellationToken, Task> transformer)
OpenApiOptions AddOperationTransformer(IOpenApiOperationTransformer transformer)
OpenApiOptions AddOperationTransformer<IOpenApiOperationTransformer>()
```

### ```Microsoft.AspNetCore.OpenApi``` supports trimming and Native AOT

The new built-in OpenAPI support in ASP.NET Core now also supports trimming and Native AOT.

### Get started

Create a new ASP.NET Core Web API (native AOT) project.

```console
dotnet new webapiaot
```

Add the Microsoft.AspNetCore.OpenAPI package.

```console
dotnet add package Microsoft.AspNetCore.OpenApi --prerelease
```

For this preview, you also need to add the latest Microsoft.OpenAPI package to avoid trimming warnings.

```console
dotnet add package Microsoft.OpenApi
```

Update ```Program.cs``` to enable generating OpenAPI documents.

```diff
+ builder.Services.AddOpenApi();

var app = builder.Build();

+ app.MapOpenApi();
```

Publish the app.

```console
dotnet publish
```

The app publishes using Native AOT without warnings.

### Support calling ```ProducesProblem``` and ```ProducesValidationProblem``` on route groups

The ```ProducesProblem``` and ```ProducesValidationProblem``` extension methods have been updated for route groups. These methods can be used to indicate that all endpoints in a route group can return ```ProblemDetails``` or ```ValidationProblemDetails``` responses for the purposes of OpenAPI metadata.

```csharp
var app = WebApplication.Create();

var todos = app.MapGroup("/todos")
    .ProducesProblem(StatusCodes.Status500InternalServerError);

todos.MapGet("/", () => new Todo(1, "Create sample app", false));
todos.MapPost("/", (Todo todo) => Results.Ok(todo));

app.Run();

record Todo(int Id, string Title, bool IsCompleted);
```

### ```Problem``` and ```ValidationProblem``` result types support construction with `IEnumerable<KeyValuePair<string, object?>>` values

Prior to .NET 9, constructing ```Problem``` and ```ValidationProblem``` result types in minimal APIs ```required``` that the ```errors``` and ```extensions``` properties be initialized with an implementation of `IDictionary<string, object?>`. In this release, these construction APIs support overloads that consume `IEnumerable<KeyValuePair<string, object?>>`.

```csharp
var app = WebApplication.Create();

app.MapGet("/", () =>
{
    var extensions = new List<KeyValuePair<string, object?>> { new("test", "value") };
    return TypedResults.Problem("This is an error with extensions",
                                                       extensions: extensions);
});
```

Thanks to GitHub user joegoldman2 for this contribution!

## Authentication and authorization

This section describes new features for authentication and authorization.

### OpenIdConnectHandler adds support for Pushed Authorization Requests (PAR)

We'd like to thank Joe DeCock from Duende Software for adding Pushed Authorization Requests (PAR) to ASP.NET Core's OpenIdConnectHandler. Joe described the background and motivation for enabling PAR in his API proposal as follows:

 - Seeing authorization parameters, which could leak PII.

 - Tampering with those parameters, e.g., the attacker could change the scope of access being requested.

 - Duende IdentityServer

 - Curity

 - Keycloak

 - Authlete

For .NET 9, we have decided to enable PAR by default if the identity provider's discovery document advertises support for PAR, since it should provide enhanced security for providers that support it. The identity provider's discovery document is usually found at ```.well-known/openid-configuration```. If this causes problems, you can disable PAR via OpenIdConnectOptions.PushedAuthorizationBehavior as follows:

```csharp
builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
    })
    .AddCookie()
    .AddOpenIdConnect("oidc", oidcOptions =>
    {
        // Other provider-specific configuration goes here.

        // The default value is PushedAuthorizationBehavior.UseIfAvailable.

        // 'OpenIdConnectOptions' does not contain a definition for 'PushedAuthorizationBehavior'
        // and no accessible extension method 'PushedAuthorizationBehavior' accepting a first argument
        // of type 'OpenIdConnectOptions' could be found
        oidcOptions.PushedAuthorizationBehavior = PushedAuthorizationBehavior.Disable;
    });
```

To ensure that authentication only succeeds if PAR is used, use PushedAuthorizationBehavior.Require instead. This change also introduces a new OnPushAuthorization event to OpenIdConnectEvents which can be used customize the pushed authorization request or handle it manually. See the API proposal for more details.

### OIDC and OAuth Parameter Customization

The OAuth and OIDC authentication handlers now have an ```AdditionalAuthorizationParameters``` option to make it easier to customize authorization message parameters that are usually included as part of the redirect query ```string```. In .NET 8 and earlier, this requires a custom `OnRedirectToIdentityProvider` callback or overridden `BuildChallengeUrl` method in a custom handler. Here's an example of .NET 8 code:

```csharp
builder.Services.AddAuthentication().AddOpenIdConnect(options =>
{
    options.Events.OnRedirectToIdentityProvider = context =>
    {
        context.ProtocolMessage.SetParameter("prompt", "login");
        context.ProtocolMessage.SetParameter("audience", "https://api.example.com");
        return Task.CompletedTask;
    };
});
```

The preceding example can now be simplified to the following code:

```csharp
builder.Services.AddAuthentication().AddOpenIdConnect(options =>
{
    options.AdditionalAuthorizationParameters.Add("prompt", "login");
    options.AdditionalAuthorizationParameters.Add("audience", "https://api.example.com");
});
```

### Configure HTTP.sys extended authentication flags

You can now configure the ```HTTP_AUTH_EX_FLAG_ENABLE_KERBEROS_CREDENTIAL_CACHING``` and ```HTTP_AUTH_EX_FLAG_CAPTURE_CREDENTIAL``` HTTP.sys flags by using the new ```EnableKerberosCredentialCaching``` and ```CaptureCredentials``` properties on the HTTP.sys `AuthenticationManager` to optimize how Windows authentication is handled. For example:

```csharp
webBuilder.UseHttpSys(options =>
{
    options.Authentication.Schemes = AuthenticationSchemes.Negotiate;
    options.Authentication.EnableKerberosCredentialCaching = true;
    options.Authentication.CaptureCredentials = true;
});
```

## Miscellaneous

The following sections describe miscellaneous new features.

### New ```HybridCache``` library

The ```HybridCache``` API bridges some gaps in the existing ```IDistributedCache``` and ```IMemoryCache``` APIs. It also adds new capabilities, such as:

- "Stampede" protection to prevent parallel fetches of the same work.

- Configurable serialization.

 ```HybridCache``` is designed to be a drop-in replacement for existing ```IDistributedCache``` and ```IMemoryCache``` usage, and it provides a simple API for adding new caching code. It provides a unified API for both in-process and out-of-process caching.

To see how the ```HybridCache``` API is simplified, compare it to code that uses ```IDistributedCache```. Here's an example of what using ```IDistributedCache``` looks like:

```csharp
public class SomeService(IDistributedCache cache)
{
    public async Task<SomeInformation> GetSomeInformationAsync
        (string name, int id, CancellationToken token = default)
    {
        var key = $"someinfo:{name}:{id}"; // Unique key for this combination.
        var bytes = await cache.GetAsync(key, token); // Try to get from cache.
        SomeInformation info;
        if (bytes is null)
        {
            // Cache miss; get the data from the real source.
            info = await SomeExpensiveOperationAsync(name, id, token);

            // Serialize and cache it.
            bytes = SomeSerializer.Serialize(info);
            await cache.SetAsync(key, bytes, token);
        }
        else
        {
            // Cache hit; deserialize it.
            info = SomeSerializer.Deserialize<SomeInformation>(bytes);
        }
        return info;
    }

    // This is the work we're trying to cache.
    private async Task<SomeInformation> SomeExpensiveOperationAsync(string name, int id,
        CancellationToken token = default)
    { /* ... */ }
}
```

That's a lot of work to get right each time, including things like serialization. And in the cache miss scenario, you could end up with multiple concurrent threads, all getting a cache miss, all fetching the underlying data, all serializing it, and all sending that data to the cache.

To simplify and improve this code with ```HybridCache```, we first need to add the new library ```Microsoft.Extensions.Caching.Hybrid```:

```xml
<PackageReference Include="Microsoft.Extensions.Caching.Hybrid" Version="9.0.0" />
```

Register the ```HybridCache``` service, like you would register an ```IDistributedCache``` implementation:

```csharp
services.AddHybridCache(); // Not shown: optional configuration API.
```

Now most caching concerns can be offloaded to ```HybridCache```:

```csharp
public class SomeService(HybridCache cache)
{
    public async Task<SomeInformation> GetSomeInformationAsync
        (string name, int id, CancellationToken token = default)
    {
        return await cache.GetOrCreateAsync(
            $"someinfo:{name}:{id}", // Unique key for this combination.
            async cancel => await SomeExpensiveOperationAsync(name, id, cancel),
            token: token
        );
    }
}
```

We provide a concrete implementation of the ```HybridCache``` abstract class via dependency injection, but it's intended that developers can provide custom implementations of the API. The ```HybridCache``` implementation deals with everything related to caching, including concurrent operation handling. The cancel token here represents the combined cancellation of all concurrent callers—not just the cancellation of the caller we can see (that is, ```token```).

High throughput scenarios can be further optimized by using the ```TState``` pattern, to avoid some overhead from captured variables and per-instance callbacks:

```csharp
public class SomeService(HybridCache cache)
{
    public async Task<SomeInformation> GetSomeInformationAsync(string name, int id, CancellationToken token = default)
    {
        return await cache.GetOrCreateAsync(
            $"someinfo:{name}:{id}", // unique key for this combination
            (name, id), // all of the state we need for the final call, if needed
            static async (state, token) =>
                await SomeExpensiveOperationAsync(state.name, state.id, token),
            token: token
        );
    }
}
```

 ```HybridCache``` uses the configured ```IDistributedCache``` implementation, if any, for secondary out-of-process caching, for example, using
Redis. But even without an ```IDistributedCache```, the ```HybridCache``` service will still provide in-process caching and "stampede" protection.

#### A note on object reuse

In typical existing code that uses ```IDistributedCache```, every retrieval of an object from the cache results in deserialization. This behavior means that each concurrent caller gets a separate instance of the object, which cannot interact with other instances. The result is thread safety, as there's no risk of concurrent modifications to the same object instance.

Because a lot of ```HybridCache``` usage will be adapted from existing ```IDistributedCache``` code, ```HybridCache``` preserves this behavior by default to avoid introducing concurrency bugs. However, a given use case is inherently thread-safe:

- If the types being cached are immutable.

- If the code doesn't modify them.

In such cases, inform ```HybridCache``` that it's safe to reuse instances by:

- Marking the type as ```sealed```. The ```sealed``` keyword in C# means that the class can't be inherited.

- Applying the `[ImmutableObject(true)]` attribute to it. The `[ImmutableObject(true)]` attribute indicates that the object's state can't be changed after it's created.

By reusing instances, ```HybridCache``` can reduce the overhead of CPU and object allocations associated with per-call deserialization. This can lead to performance improvements in scenarios where the cached objects are large or accessed frequently.

#### Other ```HybridCache``` features

Like ```IDistributedCache```, ```HybridCache``` supports removal by key with a ```RemoveKeyAsync``` method.

 ```HybridCache``` also provides optional APIs for ```IDistributedCache``` implementations, to avoid `byte[]` allocations. This feature is implemented
by the preview versions of the ```Microsoft.Extensions.Caching.StackExchangeRedis``` and ```Microsoft.Extensions.Caching.SqlServer``` packages.

Serialization is configured as part of registering the service, with support for type-specific and generalized serializers via the
WithSerializer and ```.WithSerializerFactory``` methods, chained from the ```AddHybridCache``` call. By default, the library
handles ```string``` and `byte[]` internally, and uses ```System.Text.Json``` for everything else, but you can use protobuf, xml, or anything
else.

 ```HybridCache``` supports older .NET runtimes, down to .NET Framework 4.7.2 and .NET Standard 2.0.

For more information about ```HybridCache```, see ```HybridCache``` library in ASP.NET Core

### Developer exception page improvements

The ASP.NET Core developer exception page is displayed when an app throws an unhandled exception during development. The developer exception page provides detailed information about the exception and request.

Preview 3 added endpoint metadata to the developer exception page. ASP.NET Core uses endpoint metadata to control endpoint behavior, such as routing, response caching, rate limiting, OpenAPI generation, and more. The following image shows the new metadata information in the ```Routing``` section of the developer exception page:



While testing the developer exception page, small quality of life improvements were identified. They shipped in Preview 4:

- Better text wrapping. Long cookies, query ```string``` values, and method names no longer add horizontal browser scroll bars.

- Bigger text which is found in modern designs.

- More consistent table sizes.

The following animated image shows the new developer exception page:



### Dictionary debugging improvements

The debugging display of dictionaries and other key-value collections has an improved layout. The key is displayed in the debugger's key column instead of being concatenated with the value. The following images show the old and new display of a dictionary in the debugger.

Before:



After:



ASP.NET Core has many key-value collections. This improved debugging experience applies to:

- HTTP headers

- Query strings

- Forms

- Cookies

- View data

- Route data

- Features

### Fix for 503's during app recycle in IIS

By default there is now a 1 second delay between when IIS is notified of a recycle or shutdown and when ANCM tells the managed server to start shutting down. The delay is configurable via the ```ANCM_shutdownDelay``` environment variable or by setting the ```shutdownDelay``` handler setting. Both values are in milliseconds. The delay is mainly to reduce the likelihood of a race where:

- IIS hasn't started queuing requests to go to the new app.

- ANCM starts rejecting new requests that come into the old app.

Slower machines or machines with heavier CPU usage may want to adjust this value to reduce 503 likelihood.

Example of setting ```shutdownDelay```:

```xml
<aspNetCore processPath="dotnet" arguments="myapp.dll" stdoutLogEnabled="false" stdoutLogFile=".logsstdout">
  <handlerSettings>
    <!-- Milliseconds to delay shutdown by.
    this doesn't mean incoming requests will be delayed by this amount,
    but the old app instance will start shutting down after this timeout occurs -->
    <handlerSetting name="shutdownDelay" value="5000" />
  </handlerSettings>
</aspNetCore>
```

The fix is in the globally installed ANCM module that comes from the hosting bundle.

### Optimizing static web asset delivery

Following production best practices for serving static assets requires a significant amount of work and technical expertise. Without optimizations like compression, caching, and fingerprints:

- The browser has to make additional requests on every page load.

- More bytes than necessary are transferred through the network.

- Sometimes stale versions of files are served to clients.

Creating performant web apps requires optimizing asset delivery to the browser. Possible optimizations include:

- Serve a given asset once until the file changes or the browser clears its cache. Set the ETag header.

- Prevent the browser from using old or stale assets after an app is updated. Set the Last-Modified header.

- Set up proper caching headers.

- Use caching middleware.

- Serve compressed versions of the assets when possible.

- Use a CDN to serve the assets closer to the user.

- Minimize the size of assets served to the browser. This optimization doesn't include minification.

 ```MapStaticAssets``` is a new middleware that helps optimize the delivery of static assets in an app. It's designed to work with all UI frameworks, including Blazor, Razor Pages, and MVC. It's typically a drop-in replacement for ```UseStaticFiles```:

```diff
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseRouting();

app.UseAuthorization();

+app.MapStaticAssets();
-app.UseStaticFiles();
app.MapRazorPages();

app.Run();
```

 ```MapStaticAssets``` operates by combining build and publish-time processes to collect information about all the static resources in an app. This information is then utilized by the runtime library to efficiently serve these files to the browser.

 ```MapStaticAssets``` can replace ```UseStaticFiles``` in most situations, however, it's optimized for serving the assets that the app has knowledge of at build and publish time. If the app serves assets from other locations, such as disk or embedded resources, ```UseStaticFiles``` should be used.

 ```MapStaticAssets``` provides the following benefits not found with ```UseStaticFiles```:

- Build time compression for all the assets in the app:

  - ```gzip``` during development and ```gzip + brotli``` during publish.

  - All assets are compressed with the goal of reducing the size of the assets to the minimum.

- Content based ```ETags```: The ```Etags``` for each resource are the Base64 encoded ```string``` of the SHA-256 hash of the content. This ensures that the browser only redownloads a file if its contents have changed.

The following table shows the original and compressed sizes of the CSS and JS files in the default Razor Pages template:

<table><thead>
<tr>
<th>File</th>
<th>Original</th>
<th>Compressed</th>
<th>% Reduction</th>
</tr>
</thead>
<tbody>
<tr>
<td>bootstrap.min.css</td>
<td>163</td>
<td>17.5</td>
<td>89.26%</td>
</tr>
<tr>
<td>jquery.js</td>
<td>89.6</td>
<td>28</td>
<td>68.75%</td>
</tr>
<tr>
<td>bootstrap.min.js</td>
<td>78.5</td>
<td>20</td>
<td>74.52%</td>
</tr>
<tr>
<td><strong>Total</strong></td>
<td>331.1</td>
<td>65.5</td>
<td>80.20%</td>
</tr>
</tbody></table>

The following table shows the original and compressed sizes using the Fluent UI Blazor components library:

<table><thead>
<tr>
<th>File</th>
<th>Original</th>
<th>Compressed</th>
<th>% Reduction</th>
</tr>
</thead>
<tbody>
<tr>
<td>fluent.js</td>
<td>384</td>
<td>73</td>
<td>80.99%</td>
</tr>
<tr>
<td>fluent.css</td>
<td>94</td>
<td>11</td>
<td>88.30%</td>
</tr>
<tr>
<td><strong>Total</strong></td>
<td>478</td>
<td>84</td>
<td>82.43%</td>
</tr>
</tbody></table>

For a total of 478 KB uncompressed to 84 KB compressed.

The following table shows the original and compressed sizes using the MudBlazor Blazor components library:

<table><thead>
<tr>
<th>File</th>
<th>Original</th>
<th>Compressed</th>
<th>Reduction</th>
</tr>
</thead>
<tbody>
<tr>
<td>MudBlazor.min.css</td>
<td>541</td>
<td>37.5</td>
<td>93.07%</td>
</tr>
<tr>
<td>MudBlazor.min.js</td>
<td>47.4</td>
<td>9.2</td>
<td>80.59%</td>
</tr>
<tr>
<td><strong>Total</strong></td>
<td>588.4</td>
<td>46.7</td>
<td>92.07%</td>
</tr>
</tbody></table>

Optimization happens automatically when using ```MapStaticAssets```. When a library is added or updated, for example with new JavaScript or CSS, the assets are optimized as part of the build. Optimization is especially beneficial to mobile environments that can have a lower bandwidth or an unreliable connections.

For more information on the new file delivery features, see the following resources:

- Static files in ASP.NET Core

- ASP.NET Core Blazor static files

### Enabling dynamic compression on the server vs using ```MapStaticAssets```

 ```MapStaticAssets``` has the following advantages over dynamic compression on the server:

- Is simpler because there is no server specific configuration.

- Is more performant because the assets are compressed at build time.

- Allows the developer to spend extra time during the build process to ensure that the assets are the minimum size.

Consider the following table comparing MudBlazor compression with IIS dynamic compression and ```MapStaticAssets```:

<table><thead>
<tr>
<th>IIS ```gzip```</th>
<th>MapStaticAssets</th>
<th>MapStaticAssets Reduction</th>
</tr>
</thead>
<tbody>
<tr>
<td>≅ 90</td>
<td>37.5</td>
<td>59%</td>
</tr>
</tbody></table>

### ASP0026: Analyzer to warn when `[Authorize]` is overridden by `[AllowAnonymous]` from "farther away"

It seems intuitive that an `[Authorize]` attribute placed "closer" to an MVC action than an `[AllowAnonymous]` attribute would override the `[AllowAnonymous]` attribute and force authorization. However, this is not necessarily the case. What does matter is the relative order of the attributes.

The following code shows examples where a closer `[Authorize]` attribute gets overridden by an `[AllowAnonymous]` attribute that is farther away.

```csharp
[AllowAnonymous]
public class MyController
{
    [Authorize] // Overridden by the [AllowAnonymous] attribute on the class
    public IActionResult Private() => null;
}
```

```csharp
[AllowAnonymous]
public class MyControllerAnon : ControllerBase
{
}

[Authorize] // Overridden by the [AllowAnonymous] attribute on MyControllerAnon
public class MyControllerInherited : MyControllerAnon
{
}

public class MyControllerInherited2 : MyControllerAnon
{
    [Authorize] // Overridden by the [AllowAnonymous] attribute on MyControllerAnon
    public IActionResult Private() => null;
}
```

```csharp
[AllowAnonymous]
[Authorize] // Overridden by the preceding [AllowAnonymous]
public class MyControllerMultiple : ControllerBase
{
}
```

In .NET 9 Preview 6, we've introduced an analyzer that will highlight instances like these where a closer `[Authorize]` attribute gets overridden by an `[AllowAnonymous]` attribute that is farther away from an MVC action. The warning points to the overridden `[Authorize]` attribute with the following message:

The correct action to take if you see this warning depends on the intention behind the attributes. The farther away `[AllowAnonymous]` attribute should be removed if it's unintentionally exposing the endpoint to anonymous users. If the `[AllowAnonymous]` attribute was intended to override a closer `[Authorize]` attribute, you can repeat the `[AllowAnonymous]` attribute after the `[Authorize]` attribute to clarify the intent.

```csharp
[AllowAnonymous]
public class MyController
{
    // This produces no warning because the second, "closer" [AllowAnonymous]
    // clarifies that [Authorize] is intentionally overridden.
    // Specifying AuthenticationSchemes can still be useful
    // for endpoints that allow but don't require authenticated users.
    [Authorize(AuthenticationSchemes = "Cookies")]
    [AllowAnonymous]
    public IActionResult Privacy() => null;
}
```

### Improved Kestrel connection metrics

We've made a significant improvement to Kestrel's connection metrics by including metadata about why a connection failed. The ```kestrel.connection.duration``` metric now includes the connection close reason in the ```error.type``` attribute.

Here is a small sample of the ```error.type``` values:

- ```tls_handshake_failed``` - The connection requires TLS, and the TLS handshake failed.

- ```connection_reset``` - The connection was unexpectedly closed by the client while requests were in progress.

- ```request_headers_timeout``` - Kestrel closed the connection because it didn't receive request headers in time.

- ```max_request_body_size_exceeded``` - Kestrel closed the connection because uploaded data exceeded max size.

Previously, diagnosing Kestrel connection issues ```required``` a server to record detailed, low-level logging. However, logs can be expensive to generate and store, and it can be difficult to find the right information among the noise.

Metrics are a much cheaper alternative that can be left on in a production environment with minimal impact.

We expect improved connection metrics to be useful in many scenarios:

- Investigating performance issues caused by short connection lifetimes.

- Observing ongoing external attacks on Kestrel that impact performance and stability.

- Recording attempted external attacks on Kestrel that Kestrel's built-in security hardening prevented.

For more information, see ASP.NET Core metrics.

### Customize Kestrel named pipe endpoints

Kestrel's named pipe support has been improved with advanced customization options. The new ```CreateNamedPipeServerStream``` method on the named pipe options allows pipes to be customized per-endpoint.

An example of where this is useful is a Kestrel app that requires two pipe endpoints with different access security. The ```CreateNamedPipeServerStream``` option can be used to create pipes with custom security settings, depending on the pipe name.

```csharp
var builder = WebApplication.CreateBuilder();

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenNamedPipe("pipe1");
    options.ListenNamedPipe("pipe2");
});

builder.WebHost.UseNamedPipes(options =>
{
    options.CreateNamedPipeServerStream = (context) =>
    {
        var pipeSecurity = CreatePipeSecurity(context.NamedPipeEndpoint.PipeName);

        return NamedPipeServerStreamAcl.Create(context.NamedPipeEndPoint.PipeName, PipeDirection.InOut,
            NamedPipeServerStream.MaxAllowedServerInstances, PipeTransmissionMode.Byte,
            context.PipeOptions, inBufferSize: 0, outBufferSize: 0, pipeSecurity);
    };
});
```

### ```ExceptionHandlerMiddleware``` option to choose the status code based on the exception type

A new option when configuring the ```ExceptionHandlerMiddleware``` enables app developers to choose what status code to return when an exception occurs during request handling. The new option changes the status code being set in the ```ProblemDetails``` response from the ```ExceptionHandlerMiddleware```.

```csharp
app.UseExceptionHandler(new ExceptionHandlerOptions
{
    StatusCodeSelector = ex => ex is TimeoutException
        ? StatusCodes.Status503ServiceUnavailable
        : StatusCodes.Status500InternalServerError,
});
```

### Opt-out of HTTP metrics on certain endpoints and requests

.NET 9 introduces the ability to opt-out of HTTP metrics for specific endpoints and requests. Opting out of recording metrics is beneficial for endpoints frequently called by automated systems, such as health checks. Recording metrics for these requests is generally unnecessary.

HTTP requests to an endpoint can be excluded from metrics by adding metadata. Either:

- Add the `[DisableHttpMetrics]` attribute to the Web API controller, SignalR hub or gRPC service.

- Call DisableHttpMetrics when mapping endpoints in app startup:

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHealthChecks();

var app = builder.Build();
app.MapHealthChecks("/healthz").DisableHttpMetrics();
app.Run();
```

The ```MetricsDisabled``` property has been added to ```IHttpMetricsTagsFeature``` for:

- Advanced scenarios where a request doesn't map to an endpoint.

- Dynamically disabling metrics collection for specific HTTP requests.

```csharp
// Middleware that conditionally opts-out HTTP requests.
app.Use(async (context, next) =>
{
    var metricsFeature = context.Features.Get<IHttpMetricsTagsFeature>();
    if (metricsFeature != null &&
        context.Request.Headers.ContainsKey("x-disable-metrics"))
    {
        metricsFeature.MetricsDisabled = true;
    }

    await next(context);
});
```

### Data Protection support for deleting keys

Prior to .NET 9, data protection keys were not deletable by design, to prevent data loss. Deleting a key renders its protected data irretrievable. Given their small size, the accumulation of these keys generally posed minimal impact. However, to accommodate extremely long-running services, we have introduced the option to delete keys. Generally, only old keys should be deleted. Only delete keys when you can accept the risk of data loss in exchange for storage savings. We recommend data protection keys should not be deleted.

```csharp
using Microsoft.AspNetCore.DataProtection.KeyManagement;

var services = new ServiceCollection();
services.AddDataProtection();

var serviceProvider = services.BuildServiceProvider();

var keyManager = serviceProvider.GetService<IKeyManager>();

if (keyManager is IDeletableKeyManager deletableKeyManager)
{
    var utcNow = DateTimeOffset.UtcNow;
    var yearAgo = utcNow.AddYears(-1);

    if (!deletableKeyManager.DeleteKeys(key => key.ExpirationDate < yearAgo))
    {
        Console.WriteLine("Failed to delete keys.");
    }
    else
    {
        Console.WriteLine("Old keys deleted successfully.");
    }
}
else
{
    Console.WriteLine("Key manager does not support deletion.");
}
```

Ref: [What's new in ASP.NET Core 9.0](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-9.0?view=aspnetcore-8.0)