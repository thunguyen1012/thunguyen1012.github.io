---
title: Performance - Memory and GC
published: true
date: 2024-09-24 04:01:11
tags: Summary, AspNetCore
description:
image:
---

## In this article

Memory management is complex, even in a managed framework like .NET. Analyzing and understanding memory issues can be challenging. This article:

- Was motivated by many memory leak and GC not working issues. Most of these issues were caused by not understanding how memory consumption works in .NET Core, or not understanding how it's measured.

- Demonstrates problematic memory use, and suggests alternative approaches.

## How garbage collection (GC) works in .NET Core

The heap controller (GC) allocates memory on managed objects that are no longer referenced by the app.

Objects are moved from one generation to another based on their lifetime.

When an ASP.NET Core app starts, the GC:

- Reserves some memory for the initial heap segments.

- Commits a small portion of memory when the runtime is loaded.

The preceding memory allocations are done for performance reasons. The performance benefit comes from heap segments in contiguous memory.

### GC.Collect caveats

In general, ASP.NET Core apps in production should not use GC.Collect explicitly. Inducing garbage collections at sub-optimal times can decrease performance significantly.

GC.Collect is useful when investigating memory leaks. Calling GC.Collect() triggers a blocking garbage collection cycle that tries to reclaim all objects inaccessible from managed code. It's a useful way to understand the size of the reachable live objects in the heap, and track growth of memory size over time.

## Analyzing the memory usage of an app

Dedicated tools can help analyzing memory usage:

- Counting object references

- Measuring how much impact the GC has on CPU usage

- Measuring memory space used for each generation

Use the following tools to analyze memory usage:

- dotnet-trace: Can be  used on production machines.

- Analyze memory usage without the Visual Studio debugger

- Profile memory usage in Visual Studio

### Detecting memory issues

Task Manager can be used to get an idea of how much memory an ASP.NET app is using. The Task Manager memory value:

- Represents the amount of memory that is used by the ASP.NET process.

- Includes the app's living objects and other memory consumers such as native memory usage.

If the Task Manager memory value increases indefinitely and never flattens out, the app has a memory leak. The following sections demonstrate and explain several memory usage patterns.

## Sample display memory usage app

The MemoryLeak sample app is available on GitHub. The MemoryLeak app:

- Includes a diagnostic controller that gathers real-time memory and GC data for the app.

- Has an Index page that displays the memory and GC data. The Index page is refreshed every second.

- Contains an API controller that provides various memory load patterns.

- Is not a supported tool, however, it can be used to display memory usage patterns of ASP.NET Core apps.

The following image shows the MemoryLeak Index page when a Gen 0 GC occurs.


![Chart showing 0 Requests Per Second (RPS)!](https://learn.microsoft.com/en-us/aspnet/core/performance/memory/_static/0rps.png?view=aspnetcore-8.0 "Chart showing 0 Requests Per Second (RPS)")

The chart displays two values for the memory usage:

- Allocated: the amount of memory occupied by managed objects

- Working set: The set of pages in the virtual address space of the process that are currently resident in physical memory. The working set shown is the same value Task Manager displays.

### Transient objects

The following API creates a 10-KB String instance and returns it to the client. On each request, a new object is allocated in memory and written to the response. Strings are stored as UTF-16 characters in .NET so each character takes 2 bytes in memory.

```csharp
[HttpGet("bigstring")]
public ActionResult<string> GetBigString()
{
    return new String('x', 10 * 1024);
}
```

The following graph is generated with a relatively small load in to show how memory allocations are impacted by the GC.



![Graph showing memory allocations for a relatively small load!](https://learn.microsoft.com/en-us/aspnet/core/performance/memory/_static/bigstring.png?view=aspnetcore-8.0 "Graph showing memory allocations for a relatively small load")

The preceding chart shows:

- 4K RPS (Requests per second).

- Generation 0 GC collections occur about every two seconds.

- The working set is constant at approximately 500 MB.

- CPU is 12%.

- The memory consumption and release (through GC) is stable.

The following chart is taken at the max throughput that can be handled by the machine.



![Chart showing max throughput!](https://learn.microsoft.com/en-us/aspnet/core/performance/memory/_static/bigstring2.png?view=aspnetcore-8.0 "Chart showing max throughput")

The preceding chart shows:

- 22K RPS

- Generation 0 GC collections occur several times per second.

- Generation 1 collections are triggered because the app allocated significantly more memory per second.

- The working set is constant at approximately 500 MB.

- CPU is 33%.

- The memory consumption and release (through GC) is stable.

- The CPU (33%) is not over-utilized, therefore the garbage collection can keep up with a high number of allocations.

### Workstation GC vs. Server GC

The .NET Garbage Collector has two different modes:

- Workstation GC: Optimized for the desktop.

- Server GC. The default GC for ASP.NET Core apps. Optimized for the server.

The GC mode can be set explicitly in the project file or in the ```runtimeconfig.json``` file of the published app. The following markup shows setting ```ServerGarbageCollection``` in the project file:

```xml
<PropertyGroup>
  <ServerGarbageCollection>true</ServerGarbageCollection>
</PropertyGroup>
```

Changing ```ServerGarbageCollection``` in the project file requires the app to be rebuilt.

Note: Server garbage collection is not available on machines with a single core. For more information, see IsServerGC.

The following image shows the memory profile under a 5K RPS using the Workstation GC.



![Chart showing memory profile for a Workstation GC!](https://learn.microsoft.com/en-us/aspnet/core/performance/memory/_static/workstation.png?view=aspnetcore-8.0 "Chart showing memory profile for a Workstation GC")

The differences between this chart and the server version are significant:

- The working set drops from 500 MB to 70 MB.

- The GC does generation 0 collections multiple times per second instead of every two seconds.

- GC drops from 300 MB to 10 MB.

The GC is a measure of the amount of memory used by the web server.



### GC using Docker and small containers

In this article, I'll show you how to run Google Chrome (GC) in a small container.

### Persistent object references

The GC cannot free objects that are referenced.

The following API creates a 10-KB String instance and returns it to the client.

```csharp
private static ConcurrentBag<string> _staticStrings = new ConcurrentBag<string>();

[HttpGet("staticstring")]
public ActionResult<string> GetStaticString()
{
    var bigString = new String('x', 10 * 1024);
    _staticStrings.Add(bigString);
    return bigString;
}
```

The preceding code:

- Is an example of a typical memory leak.

- With frequent calls, causes app memory to increase until the process crashes with an ```OutOfMemory``` exception.



![Chart showing a memory leak!](https://learn.microsoft.com/en-us/aspnet/core/performance/memory/_static/eternal.png?view=aspnetcore-8.0 "Chart showing a memory leak")

In the preceding image:

- Load testing the ```/api/staticstring``` endpoint causes a linear increase in memory.

- The GC tries to free memory as the memory pressure grows, by calling a generation 2 collection.

- The GC cannot free the leaked memory. Allocated and working set increase with time.

Some scenarios, such as caching, require object references to be held until memory pressure forces them to be released. The ```WeakReference``` class can be used for this type of caching code. A ```WeakReference``` object is collected under memory pressures. The default implementation of IMemoryCache uses ```WeakReference```.

### Native memory

Some .NET Core objects rely on native memory. Native memory can not be collected by the GC. The .NET object using native memory must free it using native code.

.NET provides the ```IDisposable``` interface to let developers release native memory. Even if ```Dispose``` is not called, correctly implemented classes call ```Dispose``` when the finalizer runs.

Consider the following code:

```csharp
[HttpGet("fileprovider")]
public void GetFileProvider()
{
    var fp = new PhysicalFileProvider(TempPath);
    fp.Watch("*.*");
}
```

PhysicalFileProvider is a managed class, so any instance will be collected at the end of the request.

The following image shows the memory profile while invoking the ```fileprovider``` API continuously.



![Chart showing a native memory leak!](https://learn.microsoft.com/en-us/aspnet/core/performance/memory/_static/fileprovider.png?view=aspnetcore-8.0 "Chart showing a native memory leak")

The preceding chart shows an obvious issue with the implementation of this class, as it keeps increasing memory usage. This is a known problem that is being tracked in this issue.

The same leak could happen in user code, by one of the following:

- Not releasing the class correctly.

- Forgetting to invoke the ```Dispose``` method of the dependent objects that should be disposed.

### Large object heap

Frequent memory allocation/free cycles can fragment memory, especially when allocating large chunks of memory. Objects are allocated in contiguous blocks of memory. To mitigate fragmentation, when the GC frees memory, it tries to defragment it. This process is called compaction. Compaction involves moving objects. Moving large objects imposes a performance penalty. For this reason the GC creates a special memory zone for large objects, called the large object heap (LOH). Objects that are greater than 85,000 bytes (approximately 83 KB) are:

- Placed on the LOH.

- Not compacted.

- Collected during generation 2 GCs.

When the LOH is full, the GC will trigger a generation 2 collection. Generation 2 collections:

- Are inherently slow.

- Additionally incur the cost of triggering a collection on all other generations.

The following code compacts the LOH immediately:

```csharp
GCSettings.LargeObjectHeapCompactionMode = GCLargeObjectHeapCompactionMode.CompactOnce;
GC.Collect();
```

See LargeObjectHeapCompactionMode for information on compacting the LOH.

In containers using .NET Core 3.0 and later, the LOH is automatically compacted.

The following API that illustrates this behavior:

```csharp
[HttpGet("loh/{size=85000}")]
public int GetLOH1(int size)
{
   return new byte[size].Length;
}
```

The following chart shows the memory profile of calling the ```/api/loh/84975``` endpoint, under maximum load:



![Chart showing memory profile of allocating bytes!](https://learn.microsoft.com/en-us/aspnet/core/performance/memory/_static/loh1.png?view=aspnetcore-8.0 "Chart showing memory profile of allocating bytes")

The following chart shows the memory profile of calling the ```/api/loh/84976``` endpoint, allocating just one more byte:



![Chart showing memory profile of allocating one more byte!](https://learn.microsoft.com/en-us/aspnet/core/performance/memory/_static/loh2.png?view=aspnetcore-8.0 "Chart showing memory profile of allocating one more byte")

Note: The ```byte[]``` structure has overhead bytes. That's why 84,976 bytes triggers the 85,000 limit.

Comparing the two preceding charts:

- The working set is similar for both scenarios, about 450 MB.

- The under LOH requests (84,975 bytes) shows mostly generation 0 collections.

- The over LOH requests generate constant generation 2 collections. Generation 2 collections are expensive. More CPU is required and throughput drops almost 50%.

Temporary large objects are particularly problematic because they cause gen2 GCs.

For maximum performance, large object use should be minimized. If possible, split up large objects. For example, Response Caching middleware in ASP.NET Core split the cache entries into blocks less than 85,000 bytes.

The following links show the ASP.NET Core approach to keeping objects under the LOH limit:

- ResponseCaching/Streams/StreamUtilities.cs

- ResponseCaching/MemoryResponseCache.cs

For more information, see:

- Large Object Heap Uncovered

- Large object heap

### ```HttpClient```

Incorrectly using ```HttpClient``` can result in a resource leak. System resources, such as database connections, sockets, file handles, etc.:

- Are more scarce than memory.

- Are more problematic when leaked than memory.

Experienced .NET developers know to call ```Dispose``` on objects that implement ```IDisposable```. Not disposing objects that implement ```IDisposable``` typically results in leaked memory or leaked system resources.

 ```HttpClient``` implements ```IDisposable```, but should not be disposed on every invocation. Rather, ```HttpClient``` should be reused.

The following endpoint creates and disposes a new  ```HttpClient``` instance on every request:

```csharp
[HttpGet("httpclient1")]
public async Task<int> GetHttpClient1(string url)
{
    using (var httpClient = new HttpClient())
    {
        var result = await httpClient.GetAsync(url);
        return (int)result.StatusCode;
    }
}
```

Under load, the following error messages are logged:

Even though the ```HttpClient``` instances are disposed, the actual network connection takes some time to be released by the operating system. By continuously creating new connections, ports exhaustion occurs. Each client connection requires its own client port.

One way to prevent port exhaustion is to reuse the same ```HttpClient``` instance:

```csharp
private static readonly HttpClient _httpClient = new HttpClient();

[HttpGet("httpclient2")]
public async Task<int> GetHttpClient2(string url)
{
    var result = await _httpClient.GetAsync(url);
    return (int)result.StatusCode;
}
```

The ```HttpClient``` instance is released when the app stops. This example shows that not every disposable resource should be disposed after each use.

See the following for a better way to handle the lifetime of an ```HttpClient``` instance:

- ```HttpClient``` and lifetime management

- HTTPClient factory blog

### Object pooling

The previous example showed how the ```HttpClient``` instance can be made static and reused by all requests. Reuse prevents running out of resources.

Object pooling:

- Uses the reuse pattern.

- Is designed for objects that are expensive to create.

A pool is a collection of pre-initialized objects that can be reserved and released across threads. Pools can define allocation rules such as limits, predefined sizes, or growth rate.

The NuGet package Microsoft.Extensions.ObjectPool contains classes that help to manage such pools.

The following API endpoint instantiates a byte buffer that is filled with random numbers on each request:

```csharp
[HttpGet("array/{size}")]
        public byte[] GetArray(int size)
        {
            var random = new Random();
            var array = new byte[size];
            random.NextBytes(array);

            return array;
        }
```

The following chart display calling the preceding API with moderate load:



![Chart showing calls to API with moderate load!](https://learn.microsoft.com/en-us/aspnet/core/performance/memory/_static/array.png?view=aspnetcore-8.0 "Chart showing calls to API with moderate load")

In the preceding chart, generation 0 collections happen approximately once per second.

The preceding code can be optimized by pooling the byte buffer by using `ArrayPool<T>`. A static instance is reused across requests.

What's different with this approach is that a pooled object is returned from the API. That means:

- The object is out of your control as soon as you return from the method.

- You can't release the object.

To set up disposal of the object:

- Encapsulate the pooled array in a disposable object.

- Register the pooled object with HttpContext.Response.RegisterForDispose.

 ```RegisterForDispose``` will take care of calling ```Dispose``` on the target object so that it's only released when the HTTP request is complete.

```csharp
private static ArrayPool<byte> _arrayPool = ArrayPool<byte>.Create();

private class PooledArray : IDisposable
{
    public byte[] Array { get; private set; }

    public PooledArray(int size)
    {
        Array = _arrayPool.Rent(size);
    }

    public void Dispose()
    {
        _arrayPool.Return(Array);
    }
}

[HttpGet("pooledarray/{size}")]
public byte[] GetPooledArray(int size)
{
    var pooledArray = new PooledArray(size);

    var random = new Random();
    random.NextBytes(pooledArray.Array);

    HttpContext.Response.RegisterForDispose(pooledArray);

    return pooledArray.Array;
}
```

Applying the same load as the non-pooled version results in the following chart:



![Chart showing fewer allocations!](https://learn.microsoft.com/en-us/aspnet/core/performance/memory/_static/pooledarray.png?view=aspnetcore-8.0 "Chart showing fewer allocations")

The main difference is allocated bytes, and as a consequence much fewer generation 0 collections.

## Additional resources

- Garbage Collection

- Understanding different GC modes with Concurrency Visualizer

- Large Object Heap Uncovered

- Large object heap

Ref: [Memory management and garbage collection (GC) in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/performance/memory?view=aspnetcore-8.0)