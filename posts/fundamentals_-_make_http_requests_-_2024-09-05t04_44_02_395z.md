---
title: Fundamentals - Make HTTP requests
published: true
date: 2024-09-05 04:44:02
tags: Summary, AspNetCore
description: 
image:
---

## In this article

 - Provides a central location for naming and configuring logical ```HttpClient``` instances. For example, a client named  github could be registered and configured to access GitHub. A default client can be registered for general access.

 - Codifies the concept of outgoing middleware via delegating handlers in ```HttpClient```. Provides extensions for Polly-based middleware to take advantage of delegating handlers in ```HttpClient```.

 - Manages the pooling and lifetime of underlying ```HttpClientMessageHandler``` instances. Automatic management avoids common DNS (Domain Name System) problems that occur when manually managing ```HttpClient``` lifetimes.

 - Adds a configurable logging experience (via ```ILogger```) for all requests sent through clients created by the factory.

## Consumption patterns

 - Basic usage

 - Named clients

 - Typed clients

 - Generated clients

### Basic usage

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddHttpClient();
```

```csharp
public class BasicModel : PageModel
{
    private readonly IHttpClientFactory _httpClientFactory;

    public BasicModel(IHttpClientFactory httpClientFactory) =>
        _httpClientFactory = httpClientFactory;

    public IEnumerable<GitHubBranch>? GitHubBranches { get; set; }

    public async Task OnGet()
    {
        var httpRequestMessage = new HttpRequestMessage(
            HttpMethod.Get,
            "https://api.github.com/repos/dotnet/AspNetCore.Docs/branches")
        {
            Headers =
            {
                { HeaderNames.Accept, "application/vnd.github.v3+json" },
                { HeaderNames.UserAgent, "HttpRequestsSample" }
            }
        };

        var httpClient = _httpClientFactory.CreateClient();
        var httpResponseMessage = await httpClient.SendAsync(httpRequestMessage);

        if (httpResponseMessage.IsSuccessStatusCode)
        {
            using var contentStream =
                await httpResponseMessage.Content.ReadAsStreamAsync();
            
            GitHubBranches = await JsonSerializer.DeserializeAsync
                <IEnumerable<GitHubBranch>>(contentStream);
        }
    }
}
```

### Named clients

 - The app requires many distinct uses of ```HttpClient```.

 - Many HttpClients have different configuration.

```csharp
builder.Services.AddHttpClient("GitHub", httpClient =>
{
    httpClient.BaseAddress = new Uri("https://api.github.com/");

    // using Microsoft.Net.Http.Headers;
    // The GitHub API requires two headers.
    httpClient.DefaultRequestHeaders.Add(
        HeaderNames.Accept, "application/vnd.github.v3+json");
    httpClient.DefaultRequestHeaders.Add(
        HeaderNames.UserAgent, "HttpRequestsSample");
});
```

 - The base address https://api.github.com/.

 - Two headers required to work with the GitHub API.

#### ```CreateClient```

 - A new instance of ```HttpClient``` is created.

 - The configuration action is called.

```csharp
public class NamedClientModel : PageModel
{
    private readonly IHttpClientFactory _httpClientFactory;

    public NamedClientModel(IHttpClientFactory httpClientFactory) =>
        _httpClientFactory = httpClientFactory;

    public IEnumerable<GitHubBranch>? GitHubBranches { get; set; }

    public async Task OnGet()
    {
        var httpClient = _httpClientFactory.CreateClient("GitHub");
        var httpResponseMessage = await httpClient.GetAsync(
            "repos/dotnet/AspNetCore.Docs/branches");

        if (httpResponseMessage.IsSuccessStatusCode)
        {
            using var contentStream =
                await httpResponseMessage.Content.ReadAsStreamAsync();
            
            GitHubBranches = await JsonSerializer.DeserializeAsync
                <IEnumerable<GitHubBranch>>(contentStream);
        }
    }
}
```

### Typed clients

 - Provide the same capabilities as named clients without the need to use strings as keys.

 - Provides IntelliSense and compiler help when consuming clients.

 - Provide a single location to configure and interact with a particular ```HttpClient```. For example, a single typed client might be used:

   - For a single backend endpoint.

   - To encapsulate all logic dealing with the endpoint.

 - Work with DI and can be injected where required in the app.

```csharp
public class GitHubService
{
    private readonly HttpClient _httpClient;

    public GitHubService(HttpClient httpClient)
    {
        _httpClient = httpClient;

        _httpClient.BaseAddress = new Uri("https://api.github.com/");

        // using Microsoft.Net.Http.Headers;
        // The GitHub API requires two headers.
        _httpClient.DefaultRequestHeaders.Add(
            HeaderNames.Accept, "application/vnd.github.v3+json");
        _httpClient.DefaultRequestHeaders.Add(
            HeaderNames.UserAgent, "HttpRequestsSample");
    }

    public async Task<IEnumerable<GitHubBranch>?> GetAspNetCoreDocsBranchesAsync() =>
        await _httpClient.GetFromJsonAsync<IEnumerable<GitHubBranch>>(
            "repos/dotnet/AspNetCore.Docs/branches");
}
```

 - The configuration is moved into the typed client.

 - The provided ```HttpClient``` instance is stored as a private field.

```csharp
builder.Services.AddHttpClient<GitHubService>();
```

 - Create an instance of ```HttpClient```.

 - Create an instance of ```GitHubService```, passing in the instance of ```HttpClient``` to its constructor.

```csharp
public class TypedClientModel : PageModel
{
    private readonly GitHubService _gitHubService;

    public TypedClientModel(GitHubService gitHubService) =>
        _gitHubService = gitHubService;

    public IEnumerable<GitHubBranch>? GitHubBranches { get; set; }

    public async Task OnGet()
    {
        try
        {
            GitHubBranches = await _gitHubService.GetAspNetCoreDocsBranchesAsync();
        }
        catch (HttpRequestException)
        {
            // ...
        }
    }
}
```

```csharp
builder.Services.AddHttpClient<GitHubService>(httpClient =>
{
    httpClient.BaseAddress = new Uri("https://api.github.com/");

    // ...
});
```

### Generated clients

```csharp
public interface IGitHubClient
{
    [Get("/repos/dotnet/AspNetCore.Docs/branches")]
    Task<IEnumerable<GitHubBranch>> GetAspNetCoreDocsBranchesAsync();
}
```

```csharp
builder.Services.AddRefitClient<IGitHubClient>()
    .ConfigureHttpClient(httpClient =>
    {
        httpClient.BaseAddress = new Uri("https://api.github.com/");

        // using Microsoft.Net.Http.Headers;
        // The GitHub API requires two headers.
        httpClient.DefaultRequestHeaders.Add(
            HeaderNames.Accept, "application/vnd.github.v3+json");
        httpClient.DefaultRequestHeaders.Add(
            HeaderNames.UserAgent, "HttpRequestsSample");
    });
```

```csharp
public class RefitModel : PageModel
{
    private readonly IGitHubClient _gitHubClient;

    public RefitModel(IGitHubClient gitHubClient) =>
        _gitHubClient = gitHubClient;

    public IEnumerable<GitHubBranch>? GitHubBranches { get; set; }

    public async Task OnGet()
    {
        try
        {
            GitHubBranches = await _gitHubClient.GetAspNetCoreDocsBranchesAsync();
        }
        catch (ApiException)
        {
            // ...
        }
    }
}
```

## Make POST, PUT, and DELETE requests

 - POST

 - PUT

 - DELETE

 - PATCH

```csharp
public async Task CreateItemAsync(TodoItem todoItem)
{
    var todoItemJson = new StringContent(
        JsonSerializer.Serialize(todoItem),
        Encoding.UTF8,
        Application.Json); // using static System.Net.Mime.MediaTypeNames;

    using var httpResponseMessage =
        await _httpClient.PostAsync("/api/TodoItems", todoItemJson);

    httpResponseMessage.EnsureSuccessStatusCode();
}
```

 - Serializes the ```TodoItem``` parameter to JSON using ```System.Text.Json```.

 - Creates an instance of `StringContent` to package the serialized JSON for sending in the HTTP request's body.

 - Calls ```PostAsync``` to send the JSON content to the specified URL. This is a relative URL that gets added to the ```HttpClient```.BaseAddress.

 - Calls `EnsureSuccessStatusCode` to throw an exception if the response status code doesn't indicate success.

```csharp
public async Task SaveItemAsync(TodoItem todoItem)
{
    var todoItemJson = new StringContent(
        JsonSerializer.Serialize(todoItem),
        Encoding.UTF8,
        Application.Json);

    using var httpResponseMessage =
        await _httpClient.PutAsync($"/api/TodoItems/{todoItem.Id}", todoItemJson);

    httpResponseMessage.EnsureSuccessStatusCode();
}
```

```csharp
public async Task DeleteItemAsync(long itemId)
{
    using var httpResponseMessage =
        await _httpClient.DeleteAsync($"/api/TodoItems/{itemId}");

    httpResponseMessage.EnsureSuccessStatusCode();
}
```

## Outgoing request middleware

 - Simplifies defining the handlers to apply for each named client.

 - Supports registration and chaining of multiple handlers to build an outgoing request middleware pipeline. Each of these handlers is able to perform work before and after the   outgoing request. This pattern:

   - Is similar to the inbound middleware pipeline in ASP.NET Core.

   - Provides a mechanism to manage cross-cutting concerns around HTTP requests, such as:

     - caching

     - error handling

     - serialization

     - logging

 - Derive from `DelegatingHandler`.

 - Override `SendAsync`. Execute code before passing the request to the next handler in the pipeline:

```csharp
public class ValidateHeaderHandler : DelegatingHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request, CancellationToken cancellationToken)
    {
        if (!request.Headers.Contains("X-API-KEY"))
        {
            return new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = new StringContent(
                    "The API key header X-API-KEY is required.")
            };
        }

        return await base.SendAsync(request, cancellationToken);
    }
}
```

```csharp
builder.Services.AddTransient<ValidateHeaderHandler>();

builder.Services.AddHttpClient("HttpMessageHandler")
    .AddHttpMessageHandler<ValidateHeaderHandler>();
```

```csharp
builder.Services.AddTransient<SampleHandler1>();
builder.Services.AddTransient<SampleHandler2>();

builder.Services.AddHttpClient("MultipleHttpMessageHandlers")
    .AddHttpMessageHandler<SampleHandler1>()
    .AddHttpMessageHandler<SampleHandler2>();
```

### Use DI in outgoing request middleware

```csharp
public interface IOperationScoped
{
    string OperationId { get; }
}

public class OperationScoped : IOperationScoped
{
    public string OperationId { get; } = Guid.NewGuid().ToString()[^4..];
}
```

```csharp
builder.Services.AddScoped<IOperationScoped, OperationScoped>();
```

```csharp
public class OperationHandler : DelegatingHandler
{
    private readonly IOperationScoped _operationScoped;

    public OperationHandler(IOperationScoped operationScoped) =>
        _operationScoped = operationScoped;

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request, CancellationToken cancellationToken)
    {
        request.Headers.Add("X-OPERATION-ID", _operationScoped.OperationId);

        return await base.SendAsync(request, cancellationToken);
    }
}
```

 - Pass data into the handler using `HttpRequestMessage.Options`.

 - Use `IHttpContextAccessor` to access the current request.

 - Create a custom `AsyncLocal<T>` storage object to pass the data.

## Use Polly-based handlers

### Handle transient faults

 - HttpRequestException

 - HTTP 5xx

 - HTTP 408

```csharp
builder.Services.AddHttpClient("PollyWaitAndRetry")
    .AddTransientHttpErrorPolicy(policyBuilder =>
        policyBuilder.WaitAndRetryAsync(
            3, retryNumber => TimeSpan.FromMilliseconds(600)));
```

### Dynamically select policies

```csharp
var timeoutPolicy = Policy.TimeoutAsync<HttpResponseMessage>(
    TimeSpan.FromSeconds(10));
var longTimeoutPolicy = Policy.TimeoutAsync<HttpResponseMessage>(
    TimeSpan.FromSeconds(30));

builder.Services.AddHttpClient("PollyDynamic")
    .AddPolicyHandler(httpRequestMessage =>
        httpRequestMessage.Method == HttpMethod.Get ? timeoutPolicy : longTimeoutPolicy);
```

### Add multiple Polly handlers

```csharp
builder.Services.AddHttpClient("PollyMultiple")
    .AddTransientHttpErrorPolicy(policyBuilder =>
        policyBuilder.RetryAsync(3))
    .AddTransientHttpErrorPolicy(policyBuilder =>
        policyBuilder.CircuitBreakerAsync(5, TimeSpan.FromSeconds(30)));
```

 - Two handlers are added.

 - The first handler uses ```AddTransientHttpErrorPolicy``` to add a retry policy. Failed requests are retried up to three times.

 - The second ```AddTransientHttpErrorPolicy``` call adds a circuit breaker policy. Further external requests are blocked for 30 seconds if 5 failed attempts occur sequentially. Circuit breaker policies are stateful. All calls through this client share the same circuit state.

### Add policies from the Polly registry

```csharp
var timeoutPolicy = Policy.TimeoutAsync<HttpResponseMessage>(
    TimeSpan.FromSeconds(10));
var longTimeoutPolicy = Policy.TimeoutAsync<HttpResponseMessage>(
    TimeSpan.FromSeconds(30));

var policyRegistry = builder.Services.AddPolicyRegistry();

policyRegistry.Add("Regular", timeoutPolicy);
policyRegistry.Add("Long", longTimeoutPolicy);

builder.Services.AddHttpClient("PollyRegistryRegular")
    .AddPolicyHandlerFromRegistry("Regular");

builder.Services.AddHttpClient("PollyRegistryLong")
    .AddPolicyHandlerFromRegistry("Long");
```

 - Two policies, ```Regular``` and ```Long```, are added to the Polly registry.

 - `AddPolicyHandlerFromRegistry` configures individual named clients to use these policies from the Polly registry.

## ```HttpClient``` and lifetime management

```csharp
builder.Services.AddHttpClient("HandlerLifetime")
    .SetHandlerLifetime(TimeSpan.FromMinutes(5));
```

### Alternatives to ```IHttpClientFactory```

 - Resource exhaustion problems by pooling ```HttpMessageHandler``` instances.

 - Stale DNS problems by cycling ```HttpMessageHandler``` instances at regular intervals.

 - Create an instance of ```SocketsHttpHandler``` when the app starts and use it for the life of the app.

 - Configure ```PooledConnectionLifetime``` to an appropriate value based on DNS refresh times.

 - Create ```HttpClient``` instances using new ```HttpClient(handler, disposeHandler: false)``` as needed.

 - The ```SocketsHttpHandler``` shares connections across ```HttpClient``` instances. This sharing prevents socket exhaustion.

 - The ```SocketsHttpHandler``` cycles connections according to ```PooledConnectionLifetime``` to avoid stale DNS problems.

## Logging

## Configure the ```HttpMessageHandler```

```csharp
builder.Services.AddHttpClient("ConfiguredHttpMessageHandler")
    .ConfigurePrimaryHttpMessageHandler(() =>
        new HttpClientHandler
        {
            AllowAutoRedirect = true,
            UseDefaultCredentials = true
        });
```

## Cookies

 - Disabling automatic cookie handling

 - Avoiding ```IHttpClientFactory```

```csharp
builder.Services.AddHttpClient("NoAutomaticCookies")
    .ConfigurePrimaryHttpMessageHandler(() =>
        new HttpClientHandler
        {
            UseCookies = false
        });
```

## Use ```IHttpClientFactory``` in a console app

 - `Microsoft.Extensions.Hosting`

 - `Microsoft.Extensions.Http`

 - ```IHttpClientFactory``` and ```GitHubService``` are registered in the Generic Host's service container.

 - ```GitHubService``` is requested from DI, which in-turn requests an instance of ```IHttpClientFactory```.

 - ```GitHubService``` uses ```IHttpClientFactory``` to create an instance of ```HttpClient```, which it uses to retrieve docs GitHub branches.

```csharp
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

var host = new HostBuilder()
    .ConfigureServices(services =>
    {
        services.AddHttpClient();
        services.AddTransient<GitHubService>();
    })
    .Build();

try
{
    var gitHubService = host.Services.GetRequiredService<GitHubService>();
    var gitHubBranches = await gitHubService.GetAspNetCoreDocsBranchesAsync();

    Console.WriteLine($"{gitHubBranches?.Count() ?? 0} GitHub Branches");

    if (gitHubBranches is not null)
    {
        foreach (var gitHubBranch in gitHubBranches)
        {
            Console.WriteLine($"- {gitHubBranch.Name}");
        }
    }
}
catch (Exception ex)
{
    host.Services.GetRequiredService<ILogger<Program>>()
        .LogError(ex, "Unable to load branches from GitHub.");
}

public class GitHubService
{
    private readonly IHttpClientFactory _httpClientFactory;

    public GitHubService(IHttpClientFactory httpClientFactory) =>
        _httpClientFactory = httpClientFactory;

    public async Task<IEnumerable<GitHubBranch>?> GetAspNetCoreDocsBranchesAsync()
    {
        var httpRequestMessage = new HttpRequestMessage(
            HttpMethod.Get,
            "https://api.github.com/repos/dotnet/AspNetCore.Docs/branches")
        {
            Headers =
            {
                { "Accept", "application/vnd.github.v3+json" },
                { "User-Agent", "HttpRequestsConsoleSample" }
            }
        };

        var httpClient = _httpClientFactory.CreateClient();
        var httpResponseMessage = await httpClient.SendAsync(httpRequestMessage);

        httpResponseMessage.EnsureSuccessStatusCode();

        using var contentStream =
            await httpResponseMessage.Content.ReadAsStreamAsync();
        
        return await JsonSerializer.DeserializeAsync
            <IEnumerable<GitHubBranch>>(contentStream);
    }
}

public record GitHubBranch(
    [property: JsonPropertyName("name")] string Name);
```

## Header propagation middleware

 - Install the `Microsoft.AspNetCore.HeaderPropagation` package.

 - Configure the ```HttpClient``` and middleware pipeline in ```Program.cs```:

```csharp
// Add services to the container.
builder.Services.AddControllers();

builder.Services.AddHttpClient("PropagateHeaders")
    .AddHeaderPropagation();

builder.Services.AddHeaderPropagation(options =>
{
    options.Headers.Add("X-TraceId");
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseHttpsRedirection();

app.UseHeaderPropagation();

app.MapControllers();
```

 - Make outbound requests using the configured ```HttpClient``` instance, which includes the added headers.

## Additional resources

 - View or download sample code (how to download)

 - Use HttpClientFactory to implement resilient HTTP requests

 - Implement HTTP call retries with exponential backoff with `HttpClientFactory` and Polly policies

 - Implement the Circuit Breaker pattern

 - How to serialize and deserialize JSON in .NET

Ref: [Make HTTP requests using ```IHttpClientFactory``` in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/http-requests?view=aspnetcore-8.0)