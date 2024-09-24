---
title: Performance - Caching - Distributed caching
published: true
date: 2024-09-24 04:00:34
tags: Summary, AspNetCore
description:
image:
---

## In this article

 - Is coherent (consistent) across requests to multiple servers.

 - Survives server restarts and app deployments.

 - Doesn't use local memory.

## Prerequisites

 - For a Redis distributed cache, Microsoft.Extensions.Caching.StackExchangeRedis.

 - For SQL Server, Microsoft.Extensions.Caching.SqlServer.

 - For the NCache distributed cache, NCache.Microsoft.Extensions.Caching.OpenSource.

## ```IDistributedCache``` interface

 - Get, GetAsync: Accepts a string key and retrieves a cached item as a byte[] array if found in the cache.

 - Set, SetAsync: Adds an item (as byte[] array) to the cache using a string key.

 - Refresh, RefreshAsync: Refreshes an item in the cache based on its key, resetting its sliding expiration timeout (if any).

 - Remove, RemoveAsync: Removes a cache item based on its string key.

## Establish distributed caching services

 - Distributed Redis cache

 - Distributed Memory Cache

 - Distributed SQL Server cache

 - Distributed NCache cache

 - Distributed Azure CosmosDB cache

### Distributed Redis Cache

 - Create an Azure Cache for Redis.

 - Copy the Primary connection string (StackExchange.Redis) to Configuration.

   - Local development: Save the connection string with Secret Manager.

   - Azure: Save the connection string in the App Service Configuration or another secure store.

```csharp
builder.Services.AddStackExchangeRedisCache(options =>
 {
     options.Configuration = builder.Configuration.GetConnectionString("MyRedisConStr");
     options.InstanceName = "SampleInstance";
 });
```

### Distributed Memory Cache

 - In development and testing scenarios.

 - When a single server is used in production and memory consumption isn't an issue. Implementing the Distributed Memory Cache abstracts cached data storage. It allows for implementing a true distributed caching solution in the future if multiple nodes or fault tolerance become necessary.

```csharp
builder.Services.AddDistributedMemoryCache();
```

### Distributed SQL Server Cache

```dotnetcli
dotnet sql-cache create "Data Source=(localdb)/MSSQLLocalDB;Initial Catalog=DistCache;Integrated Security=True;" dbo TestCache
```

```console
Table and index were created successfully.
```

![SqlServer Cache Table!](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/distributed/_static/sqlservercachetable.png?view=aspnetcore-8.0 "SqlServer Cache Table")

> Note
An app should manipulate cache values using an instance of ```IDistributedCache```, not a SqlServerCache.

```csharp
builder.Services.AddDistributedSqlServerCache(options =>
{
    options.ConnectionString = builder.Configuration.GetConnectionString(
        "DistCache_ConnectionString");
    options.SchemaName = "dbo";
    options.TableName = "TestCache";
});
```

> Note
A ConnectionString (and optionally, SchemaName and TableName) are typically stored outside of source control (for example, stored by the Secret Manager or in ```appsettings.json```/```appsettings.{Environment}.json``` files). The connection string may contain credentials that should be kept out of source control systems.

### Distributed NCache Cache

 - Install NCache open source NuGet.

 - Configure the cache cluster in client.ncconf.

 - Add the following code to ```Program.cs```:

```csharp
builder.Services.AddNCacheDistributedCache(configuration =>
{
    configuration.CacheName = "democache";
    configuration.EnableLogs = true;
    configuration.ExceptionsEnabled = true;
});
```

### Distributed Azure CosmosDB Cache

#### Reuse an existing client

```csharp
services.AddCosmosCache((CosmosCacheOptions cacheOptions) =>
{
    cacheOptions.ContainerName = Configuration["CosmosCacheContainer"];
    cacheOptions.DatabaseName = Configuration["CosmosCacheDatabase"];
    cacheOptions.CosmosClient = existingCosmosClient;
    cacheOptions.CreateIfNotExists = true;
});
```

#### Create a new client

```csharp
services.AddCosmosCache((CosmosCacheOptions cacheOptions) =>
{
    cacheOptions.ContainerName = Configuration["CosmosCacheContainer"];
    cacheOptions.DatabaseName = Configuration["CosmosCacheDatabase"];
    cacheOptions.ClientBuilder = new CosmosClientBuilder(Configuration["CosmosConnectionString"]);
    cacheOptions.CreateIfNotExists = true;
});
```

## Use the distributed cache

```csharp
app.Lifetime.ApplicationStarted.Register(() =>
{
    var currentTimeUTC = DateTime.UtcNow.ToString();
    byte[] encodedCurrentTimeUTC = System.Text.Encoding.UTF8.GetBytes(currentTimeUTC);
    var options = new DistributedCacheEntryOptions()
        .SetSlidingExpiration(TimeSpan.FromSeconds(20));
    app.Services.GetService<IDistributedCache>()
                              .Set("cachedTimeUTC", encodedCurrentTimeUTC, options);
});
```

```csharp
public class IndexModel : PageModel
{
    private readonly IDistributedCache _cache;

    public IndexModel(IDistributedCache cache)
    {
        _cache = cache;
    }

    public string? CachedTimeUTC { get; set; }
    public string? ASP_Environment { get; set; }

    public async Task OnGetAsync()
    {
        CachedTimeUTC = "Cached Time Expired";
        var encodedCachedTimeUTC = await _cache.GetAsync("cachedTimeUTC");

        if (encodedCachedTimeUTC != null)
        {
            CachedTimeUTC = Encoding.UTF8.GetString(encodedCachedTimeUTC);
        }

        ASP_Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        if (String.IsNullOrEmpty(ASP_Environment))
        {
            ASP_Environment = "Null, so Production";
        }
    }

    public async Task<IActionResult> OnPostResetCachedTime()
    {
        var currentTimeUTC = DateTime.UtcNow.ToString();
        byte[] encodedCurrentTimeUTC = Encoding.UTF8.GetBytes(currentTimeUTC);
        var options = new DistributedCacheEntryOptions()
            .SetSlidingExpiration(TimeSpan.FromSeconds(20));
        await _cache.SetAsync("cachedTimeUTC", encodedCurrentTimeUTC, options);

        return RedirectToPage();
    }
}
```

## Recommendations

 - Existing infrastructure

 - Performance requirements

 - Cost

 - Team experience

## Additional resources

 - Redis Cache on Azure

 - SQL Database on Azure

 - ASP.NET Core ```IDistributedCache``` Provider for NCache in Web Farms (NCache on GitHub)

 - Repository README file for Microsoft.Extensions.Caching.Cosmos

 - Cache in-memory in ASP.NET Core

 - Detect changes with change tokens in ASP.NET Core

 - Response caching in ASP.NET Core

 - Response Caching Middleware in ASP.NET Core

 - Cache Tag Helper in ASP.NET Core MVC

 - Distributed Cache Tag Helper in ASP.NET Core

 - Host ASP.NET Core in a web farm

Ref: [Distributed caching in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/distributed?view=aspnetcore-8.0)