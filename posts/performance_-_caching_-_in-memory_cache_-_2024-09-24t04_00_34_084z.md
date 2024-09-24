---
title: Performance - Caching - In-memory cache
published: true
date: 2024-09-24 04:00:34
tags: Summary, AspNetCore
description:
image:
---

## In this article

## ```System.Runtime.Caching```/`MemoryCache`

 - .NET Standard 2.0 or later.

 - Any .NET implementation that targets .NET Standard 2.0 or later. For example, ASP.NET Core 3.1 or later.

 - .NET Framework 4.5 or later.

## Cache guidelines

 - Code should always have a fallback option to fetch data and not depend on a cached value being available.

 - The cache uses a scarce resource, memory. Limit cache growth:

   - Do not insert external input into the cache. As an example, ```using``` arbitrary user-provided input as a cache key is not recommended since the input might consume an unpredictable amount of memory.

   - Use expirations to limit cache growth.

   - Use ```SetSize```, ```Size```, and ```SizeLimit``` to limit cache size. The ASP.NET Core runtime does not limit cache size based on memory pressure. It's up to the developer to limit cache size.

## Use ```IMemoryCache```

> Warning
Using a shared memory cache from Dependency Injection and calling ```SetSize```, ```Size```, or ```SizeLimit``` to limit cache size can cause the app to fail. When a size limit is set on a cache, all entries must specify a size when being added. This can lead to issues since developers may not have full control on what uses the shared cache.
When ```using``` ```SetSize```, ```Size```, or ```SizeLimit``` to limit cache, create a cache singleton for caching. For more information and an example, see Use ```SetSize```, ```Size```, and ```SizeLimit``` to limit cache size.
A shared cache is one shared by other frameworks or libraries.

```csharp
public class IndexModel : PageModel
{
    private readonly IMemoryCache _memoryCache;

    public IndexModel(IMemoryCache memoryCache) =>
        _memoryCache = memoryCache;

    // ...
```

```csharp
public void OnGet()
{
    CurrentDateTime = DateTime.Now;

    if (!_memoryCache.TryGetValue(CacheKeys.Entry, out DateTime cacheValue))
    {
        cacheValue = CurrentDateTime;

        var cacheEntryOptions = new MemoryCacheEntryOptions()
            .SetSlidingExpiration(TimeSpan.FromSeconds(3));

        _memoryCache.Set(CacheKeys.Entry, cacheValue, cacheEntryOptions);
    }

    CacheCurrentDateTime = cacheValue;
}
```

```cshtml
<ul>
    <li>Current Time: @Model.CurrentDateTime</li>
    <li>Cached Time: @Model.CacheCurrentDateTime</li>
</ul>
```

```csharp
_memoryCache.Set(CacheKeys.Entry, DateTime.Now, TimeSpan.FromDays(1));
```

```csharp
public void OnGetCacheGetOrCreate()
{
    var cachedValue = _memoryCache.GetOrCreate(
        CacheKeys.Entry,
        cacheEntry =>
        {
            cacheEntry.SlidingExpiration = TimeSpan.FromSeconds(3);
            return DateTime.Now;
        });

    // ...
}

public async Task OnGetCacheGetOrCreateAsync()
{
    var cachedValue = await _memoryCache.GetOrCreateAsync(
        CacheKeys.Entry,
        cacheEntry =>
        {
            cacheEntry.SlidingExpiration = TimeSpan.FromSeconds(3);
            return Task.FromResult(DateTime.Now);
        });

    // ...
}
```

```csharp
var cacheEntry = _memoryCache.Get<DateTime?>(CacheKeys.Entry);
```

```csharp
var cachedValue = _memoryCache.GetOrCreate(
    CacheKeys.Entry,
    cacheEntry =>
    {
        cacheEntry.AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(20);
        return DateTime.Now;
    });
```

```csharp
var cachedValue = _memoryCache.GetOrCreate(
    CacheKeys.CallbackEntry,
    cacheEntry =>
    {
        cacheEntry.SlidingExpiration = TimeSpan.FromSeconds(3);
        cacheEntry.AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(20);
        return DateTime.Now;
    });
```

## ```MemoryCacheEntryOptions```

 - Sets the cache priority to CacheItemPriority.NeverRemove.

 - Sets a PostEvictionDelegate that gets called after the entry is evicted from the cache. The callback is run on a different thread from the code that removes the item from the cache.

```csharp
public void OnGetCacheRegisterPostEvictionCallback()
{
    var memoryCacheEntryOptions = new MemoryCacheEntryOptions()
        .SetPriority(CacheItemPriority.NeverRemove)
        .RegisterPostEvictionCallback(PostEvictionCallback, _memoryCache);

    _memoryCache.Set(CacheKeys.CallbackEntry, DateTime.Now, memoryCacheEntryOptions);
}

private static void PostEvictionCallback(
    object cacheKey, object cacheValue, EvictionReason evictionReason, object state)
{
    var memoryCache = (IMemoryCache)state;

    memoryCache.Set(
        CacheKeys.CallbackMessage,
        $"Entry {cacheKey} was evicted: {evictionReason}.");
}
```

## Use ```SetSize```, ```Size```, and ```SizeLimit``` to limit cache size

 - If the web app was primarily caching strings, each cache entry size could be the string length.

 - The app could specify the size of all entries as 1, and the size limit is the count of entries.

 - Limit cache growth.

 - Call ```Compact``` or ```Remove``` when available memory is limited.

```csharp
public class MyMemoryCache
{
    public MemoryCache Cache { get; } = new MemoryCache(
        new MemoryCacheOptions
        {
            SizeLimit = 1024
        });
}
```

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddSingleton<MyMemoryCache>();
```

```csharp
if (!_myMemoryCache.Cache.TryGetValue(CacheKeys.Entry, out DateTime cacheValue))
{
    var cacheEntryOptions = new MemoryCacheEntryOptions()
        .SetSize(1);

    // cacheEntryOptions.Size = 1;

    _myMemoryCache.Cache.Set(CacheKeys.Entry, cacheValue, cacheEntryOptions);
}
```

### ```MemoryCache.Compact```

 - All expired items.

 - Items by priority. Lowest priority items are removed first.

 - Least recently used objects.

 - Items with the earliest absolute expiration.

 - Items with the earliest sliding expiration.

```csharp
_myMemoryCache.Cache.Remove(CacheKeys.Entry);
_myMemoryCache.Cache.Compact(.25);
```

## Cache dependencies

```csharp
public void OnGetCacheCreateDependent()
{
    var cancellationTokenSource = new CancellationTokenSource();

    _memoryCache.Set(
        CacheKeys.DependentCancellationTokenSource,
        cancellationTokenSource);

    using var parentCacheEntry = _memoryCache.CreateEntry(CacheKeys.Parent);

    parentCacheEntry.Value = DateTime.Now;

    _memoryCache.Set(
        CacheKeys.Child,
        DateTime.Now,
        new CancellationChangeToken(cancellationTokenSource.Token));
}

public void OnGetCacheRemoveDependent()
{
    var cancellationTokenSource = _memoryCache.Get<CancellationTokenSource>(
        CacheKeys.DependentCancellationTokenSource);

    cancellationTokenSource.Cancel();
}
```

## Additional notes

 - Expiration doesn't happen in the background. There's no timer that actively scans the cache for expired items. Any activity on the cache (`Get`, ```Set```, ```Remove```) can trigger a background scan for expired items. A timer on the ```CancellationTokenSource (CancelAfter)``` also removes the entry and triggers a scan for expired items. The following example uses ```CancellationTokenSource(TimeSpan)``` for the registered token. When this token fires, it removes the entry immediately and fires the eviction callbacks:

```csharp
if (!_memoryCache.TryGetValue(CacheKeys.Entry, out DateTime cacheValue))
{
    cacheValue = DateTime.Now;

    var cancellationTokenSource = new CancellationTokenSource(
        TimeSpan.FromSeconds(10));

    var cacheEntryOptions = new MemoryCacheEntryOptions()
        .AddExpirationToken(
            new CancellationChangeToken(cancellationTokenSource.Token))
        .RegisterPostEvictionCallback((key, value, reason, state) =>
        {
            ((CancellationTokenSource)state).Dispose();
        }, cancellationTokenSource);

    _memoryCache.Set(CacheKeys.Entry, cacheValue, cacheEntryOptions);
}
```

 - When ```using``` a callback to repopulate a cache item:

   - Multiple requests can find the cached key value empty because the callback hasn't completed.

   - This can result in several threads repopulating the cached item.

 - When one cache entry is used to create another, the child copies the parent entry's expiration tokens and time-based expiration settings. The child isn't expired by manual removal or updating of the parent entry.

 - Use PostEvictionCallbacks to set the callbacks that will be fired after the cache entry is evicted from the cache.

 - For most apps, ```IMemoryCache``` is enabled. For example, calling ```AddMvc```, ```AddControllersWithViews```, ```AddRazorPages```, ```AddMvcCore().AddRazorViewEngine```, and many other Add{Service} methods in ```Program.cs```, enables ```IMemoryCache```. For apps that don't call one of the preceding `Add{Service}` methods, it may be necessary to call AddMemoryCache in ```Program.cs```.

## Background cache update

## Additional resources

 - View or download sample code (how to download)

 - Distributed caching in ASP.NET Core

 - Detect changes with change tokens in ASP.NET Core

 - Response caching in ASP.NET Core

 - Response Caching Middleware in ASP.NET Core

 - Cache Tag Helper in ASP.NET Core MVC

 - Distributed Cache Tag Helper in ASP.NET Core

Ref: [Cache in-memory in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/memory?view=aspnetcore-8.0)