---
title: Performance - Caching - Overview
published: true
date: 2024-09-24 04:00:33
tags: Summary, AspNetCore
description:
image:
---

## In this article

## In-memory caching

## Distributed Cache

## ```HybridCache```

### Features

 - A unified API for both in-process and out-of-process caching.
HybridCache is designed to be a drop-in replacement for existing ```IDistributedCache``` and ```IMemoryCache``` usage, and it provides a
simple API for adding new caching code. If the app has an ```IDistributedCache``` implementation, the ```HybridCache``` service uses it for secondary caching. This two-level caching strategy allows ```HybridCache``` to provide the speed of an in-memory cache and the durability of a distributed or persistent cache.

 - Stampede protection.
Cache stampede happens when a frequently used cache entry is revoked, and too many requests try to repopulate the same cache entry at the same time. ```HybridCache``` combines concurrent operations, ensuring that all requests for a given response wait for the first request to populate the cache.

 - Configurable serialization.
Serialization is configured as part of registering the service, with support for type-specific and generalized serializers via the ```WithSerializer``` and ```WithSerializerFactory``` methods, chained from the ```AddHybridCache``` call. By default, the service handles ```string``` and `byte[]` internally, and uses ```System.Text.Json``` for everything else. It can be configured for other types of serializers, such as protobuf or XML.

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

```csharp
public class SomeService(HybridCache cache)
{
    public async Task<SomeInformation> GetSomeInformationAsync
        (string name, int id, CancellationToken token = default)
    {
        return await cache.GetOrCreateAsync(
            $"someinfo:{name}:{id}", // Unique key for this entry.
            async cancel => await SomeExpensiveOperationAsync(name, id, cancel),
            token: token
        );
    }
}
```

### Compatibility

### Additional resources

 - ```HybridCache``` library in ASP.NET Core

 - GitHub issue dotnet/aspnetcore #54647

 - ```HybridCache``` source code

## Cache Tag Helper

## Distributed Cache Tag Helper

## Response caching

 - Enables caching server responses based on HTTP cache headers. Implements the standard HTTP caching semantics. Caches based on HTTP cache headers like proxies do.

 - Is typically not beneficial for UI apps such as Razor Pages because browsers generally set request headers that prevent caching. Output caching, which is available in ASP.NET Core 7.0 and later, benefits UI apps. With output caching, configuration decides what should be cached independently of HTTP headers.

 - May be beneficial for public GET or HEAD API requests from clients where the Conditions for caching are met.

## Output caching

 - The caching behavior is configurable on the server.
Response caching behavior is defined by HTTP headers. For example, when you visit a website with Chrome or Edge, the browser automatically sends a ```Cache-control: max-age=0``` header. This header effectively disables response caching, since the server follows the directions provided by the client. A new response is returned for every request, even if the server has a fresh cached response. With output caching the client doesn't override the caching behavior that you configure on the server.

 - The cache storage medium is extensible.
Memory is used by default. Response caching is limited to memory.

 - You can programmatically invalidate selected cache entries.
Response caching's dependence on HTTP headers leaves you with few options for invalidating cache entries.

 - Resource locking mitigates the risk of cache stampede and thundering herd.
Cache stampede happens when a frequently used cache entry is revoked, and too many requests try to repopulate the same cache entry at the same time. Thundering herd is similar: a burst of requests for the same response that isn't already in a cache entry. Resource locking ensures that all requests for a given response wait for the first request to populate the cache. Response caching doesn't have a resource locking feature.

 - Cache revalidation minimizes bandwidth usage.
Cache revalidation means the server can return a ```304 Not Modified``` HTTP status code instead of a cached response body. This status code informs the client that the response to the request is unchanged from what was previously received. Response caching doesn't do cache revalidation.

Ref: [Overview of caching in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/overview?view=aspnetcore-8.0)