---
title: Performance - Caching - Output caching
published: true
date: 2024-09-24 04:00:35
tags: Summary, AspNetCore
description:
image:
---

## In this article

## Add the middleware to the app

```csharp
builder.Services.AddOutputCache();
```

```csharp
var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseHttpsRedirection();
app.UseOutputCache();
app.UseAuthorization();
```

> Note

In apps that use CORS middleware, ```UseOutputCache``` must be called after UseCors.
In Razor Pages apps and apps with controllers, ```UseOutputCache``` must be called after ```UseRouting```.

  - In apps that use CORS middleware, ```UseOutputCache``` must be called after UseCors.

  - In Razor Pages apps and apps with controllers, ```UseOutputCache``` must be called after ```UseRouting```.

## Configure one endpoint or page

```csharp
app.MapGet("/cached", Gravatar.WriteGravatar).CacheOutput();
app.MapGet("/attribute", [OutputCache] (context) => 
    Gravatar.WriteGravatar(context));
```

```csharp
[ApiController]
[Route("/[controller]")]
[OutputCache]
public class CachedController : ControllerBase
{
    public async Task GetAsync()
    {
        await Gravatar.WriteGravatar(HttpContext);
    }
}
```

## Configure multiple endpoints or pages

```csharp
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(builder => 
        builder.Expire(TimeSpan.FromSeconds(10)));
    options.AddPolicy("Expire20", builder => 
        builder.Expire(TimeSpan.FromSeconds(20)));
    options.AddPolicy("Expire30", builder => 
        builder.Expire(TimeSpan.FromSeconds(30)));
});
```

```csharp
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(builder => 
        builder.Expire(TimeSpan.FromSeconds(10)));
    options.AddPolicy("Expire20", builder => 
        builder.Expire(TimeSpan.FromSeconds(20)));
    options.AddPolicy("Expire30", builder => 
        builder.Expire(TimeSpan.FromSeconds(30)));
});
```

```csharp
app.MapGet("/20", Gravatar.WriteGravatar).CacheOutput("Expire20");
app.MapGet("/30", [OutputCache(PolicyName = "Expire30")] (context) => 
    Gravatar.WriteGravatar(context));
```

```csharp
[ApiController]
[Route("/[controller]")]
[OutputCache(PolicyName = "Expire20")]
public class Expire20Controller : ControllerBase
{
    public async Task GetAsync()
    {
        await Gravatar.WriteGravatar(HttpContext);
    }
}
```

## Default output caching policy

 - Only HTTP 200 responses are cached.

 - Only HTTP GET or HEAD requests are cached.

 - Responses that set cookies aren't cached.

 - Responses to authenticated requests aren't cached.

```csharp
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(builder => builder.Cache());
});
```

### Override the default policy

```csharp
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.Extensions.Primitives;

namespace OCMinimal;

public sealed class MyCustomPolicy : IOutputCachePolicy
{
    public static readonly MyCustomPolicy Instance = new();

    private MyCustomPolicy()
    {
    }

    ValueTask IOutputCachePolicy.CacheRequestAsync(
        OutputCacheContext context, 
        CancellationToken cancellationToken)
    {
        var attemptOutputCaching = AttemptOutputCaching(context);
        context.EnableOutputCaching = true;
        context.AllowCacheLookup = attemptOutputCaching;
        context.AllowCacheStorage = attemptOutputCaching;
        context.AllowLocking = true;

        // Vary by any query by default
        context.CacheVaryByRules.QueryKeys = "*";

        return ValueTask.CompletedTask;
    }

    ValueTask IOutputCachePolicy.ServeFromCacheAsync
        (OutputCacheContext context, CancellationToken cancellationToken)
    {
        return ValueTask.CompletedTask;
    }

    ValueTask IOutputCachePolicy.ServeResponseAsync
        (OutputCacheContext context, CancellationToken cancellationToken)
    {
        var response = context.HttpContext.Response;

        // Verify existence of cookie headers
        if (!StringValues.IsNullOrEmpty(response.Headers.SetCookie))
        {
            context.AllowCacheStorage = false;
            return ValueTask.CompletedTask;
        }

        // Check response code
        if (response.StatusCode != StatusCodes.Status200OK && 
            response.StatusCode != StatusCodes.Status301MovedPermanently)
        {
            context.AllowCacheStorage = false;
            return ValueTask.CompletedTask;
        }

        return ValueTask.CompletedTask;
    }

    private static bool AttemptOutputCaching(OutputCacheContext context)
    {
        // Check if the current request fulfills the requirements
        // to be cached
        var request = context.HttpContext.Request;

        // Verify the method
        if (!HttpMethods.IsGet(request.Method) && 
            !HttpMethods.IsHead(request.Method) && 
            !HttpMethods.IsPost(request.Method))
        {
            return false;
        }

        // Verify existence of authorization headers
        if (!StringValues.IsNullOrEmpty(request.Headers.Authorization) || 
            request.HttpContext.User?.Identity?.IsAuthenticated == true)
        {
            return false;
        }

        return true;
    }
}
```

```csharp
builder.Services.AddOutputCache(options =>
{
    options.AddPolicy("CachePost", MyCustomPolicy.Instance);
});
```

```csharp
app.MapPost("/cachedpost", Gravatar.WriteGravatar)
    .CacheOutput("CachePost");
```

```csharp
[ApiController]
[Route("/[controller]")]
[OutputCache(PolicyName = "CachePost")]
public class PostController : ControllerBase
{
    public async Task GetAsync()
    {
        await Gravatar.WriteGravatar(HttpContext);
    }
}
```

### Alternative default policy override

 - A public constructor instead of a private constructor.

 - Eliminate the ```Instance``` property in the custom policy class.

```csharp
public sealed class MyCustomPolicy2 : IOutputCachePolicy
{

    public MyCustomPolicy2()
    {
    }
```

```csharp
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(builder => 
        builder.AddPolicy<MyCustomPolicy2>(), true);
});
```

## Specify the cache key

```csharp
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(builder => builder
        .With(c => c.HttpContext.Request.Path.StartsWithSegments("/blog"))
        .Tag("tag-blog"));
    options.AddBasePolicy(builder => builder.Tag("tag-all"));
    options.AddPolicy("Query", builder => builder.SetVaryByQuery("culture"));
    options.AddPolicy("NoCache", builder => builder.NoCache());
    options.AddPolicy("NoLock", builder => builder.SetLocking(false));
});
```

```csharp
app.MapGet("/query", Gravatar.WriteGravatar).CacheOutput("Query");
```

```csharp
[ApiController]
[Route("/[controller]")]
[OutputCache(PolicyName = "Query")]
public class QueryController : ControllerBase
{
    public async Task GetAsync()
    {
        await Gravatar.WriteGravatar(HttpContext);
    }
}
```

 - SetVaryByQuery - Specify one or more query string names to add to the cache key.

 - SetVaryByHeader - Specify one or more HTTP headers to add to the cache key.

 - VaryByValue- Specify a value to add to the cache key. The following example uses a value that indicates whether the current server time in seconds is odd or even. A new response is generated only when the number of seconds goes from odd to even or even to odd.

```csharp
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(builder => builder
        .With(c => c.HttpContext.Request.Path.StartsWithSegments("/blog"))
        .Tag("tag-blog"));
    options.AddBasePolicy(builder => builder.Tag("tag-all"));
    options.AddPolicy("Query", builder => builder.SetVaryByQuery("culture"));
    options.AddPolicy("NoCache", builder => builder.NoCache());
    options.AddPolicy("NoLock", builder => builder.SetLocking(false));
    options.AddPolicy("VaryByValue", builder => 
        builder.VaryByValue((context) =>
            new KeyValuePair<string, string>(
            "time", (DateTime.Now.Second % 2)
                .ToString(CultureInfo.InvariantCulture))));
});
```

## Cache revalidation

```csharp
app.MapGet("/etag", async (context) =>
{
    var etag = $"\"{Guid.NewGuid():n}\"";
    context.Response.Headers.ETag = etag;
    await Gravatar.WriteGravatar(context);

}).CacheOutput();
```

```csharp
[ApiController]
[Route("/[controller]")]
[OutputCache]
public class EtagController : ControllerBase
{
    public async Task GetAsync()
    {
        var etag = $"\"{Guid.NewGuid():n}\"";
        HttpContext.Response.Headers.ETag = etag;
        await Gravatar.WriteGravatar(HttpContext);
    }
}
```

## Use tags to evict cache entries

```csharp
app.MapGet("/blog", Gravatar.WriteGravatar)
    .CacheOutput(builder => builder.Tag("tag-blog"));
app.MapGet("/blog/post/{id}", Gravatar.WriteGravatar)
    .CacheOutput(builder => builder.Tag("tag-blog"));
```

```csharp
[ApiController]
[Route("/[controller]")]
[OutputCache(Tags = new[] { "tag-blog", "tag-all" })]
public class TagEndpointController : ControllerBase
{
    public async Task GetAsync()
    {
        await Gravatar.WriteGravatar(HttpContext);
    }
}
```

```csharp
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(builder => builder
        .With(c => c.HttpContext.Request.Path.StartsWithSegments("/blog"))
        .Tag("tag-blog"));
    options.AddBasePolicy(builder => builder.Tag("tag-all"));
    options.AddPolicy("Query", builder => builder.SetVaryByQuery("culture"));
    options.AddPolicy("NoCache", builder => builder.NoCache());
    options.AddPolicy("NoLock", builder => builder.SetLocking(false));
});
```

```csharp
var blog = app.MapGroup("blog")
    .CacheOutput(builder => builder.Tag("tag-blog"));
blog.MapGet("/", Gravatar.WriteGravatar);
blog.MapGet("/post/{id}", Gravatar.WriteGravatar);
```

```csharp
app.MapPost("/purge/{tag}", async (IOutputCacheStore cache, string tag) =>
{
    await cache.EvictByTagAsync(tag, default);
});
```

```csharp
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(builder => builder
        .With(c => c.HttpContext.Request.Path.StartsWithSegments("/blog"))
        .Tag("tag-blog"));
    options.AddBasePolicy(builder => builder.Tag("tag-all"));
    options.AddPolicy("Query", builder => builder.SetVaryByQuery("culture"));
    options.AddPolicy("NoCache", builder => builder.NoCache());
    options.AddPolicy("NoLock", builder => builder.SetLocking(false));
});
```

## Disable resource locking

```csharp
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(builder => builder
        .With(c => c.HttpContext.Request.Path.StartsWithSegments("/blog"))
        .Tag("tag-blog"));
    options.AddBasePolicy(builder => builder.Tag("tag-all"));
    options.AddPolicy("Query", builder => builder.SetVaryByQuery("culture"));
    options.AddPolicy("NoCache", builder => builder.NoCache());
    options.AddPolicy("NoLock", builder => builder.SetLocking(false));
});
```

```csharp
app.MapGet("/nolock", Gravatar.WriteGravatar)
    .CacheOutput("NoLock");
```

```csharp
[ApiController]
[Route("/[controller]")]
[OutputCache(PolicyName = "NoLock")]
public class NoLockController : ControllerBase
{
    public async Task GetAsync()
    {
        await Gravatar.WriteGravatar(HttpContext);
    }
}
```

## Limits

 - SizeLimit - Maximum size of cache storage. When this limit is reached, no new responses are cached until older entries are evicted. Default value is 100 MB.

 - MaximumBodySize - If the response body exceeds this limit, it isn't cached. Default value is 64 MB.

 - DefaultExpirationTimeSpan - The expiration time duration that applies when not specified by a policy. Default value is 60 seconds.

## Cache storage

### Redis cache

 - Install the Microsoft.AspNetCore.OutputCaching.StackExchangeRedis NuGet package.

 - Call ```builder.Services.AddStackExchangeRedisOutputCache``` (not ```AddStackExchangeRedisCache```), and provide a connection string that points to a Redis server.
For example:
```csharp
builder.Services.AddStackExchangeRedisOutputCache(options =>
{
    options.Configuration = 
        builder.Configuration.GetConnectionString("MyRedisConStr");
    options.InstanceName = "SampleInstance";
});

builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(builder => 
        builder.Expire(TimeSpan.FromSeconds(10)));
});
```


The configuration options are identical to the Redis-based distributed caching options.

   - ```options.Configuration``` - A connection string to an on-premises Redis server or to a hosted offering such as Azure Cache for Redis. For example, ```<instance_name>.redis.cache.windows.net:6380,password=<password>,ssl=True,abortConnect=False``` for Azure cache for Redis.

   - ```options.InstanceName``` - Optional, specifies a logical partition for the cache.

### ```IDistributedCache``` not recommended

## See also

 - Overview of caching in ASP.NET Core

 - ASP.NET Core Middleware

 - OutputCacheOptions

 - OutputCachePolicyBuilder

Ref: [Output caching middleware in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/output?view=aspnetcore-8.0)