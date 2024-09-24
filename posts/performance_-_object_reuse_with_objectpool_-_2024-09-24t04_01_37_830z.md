---
title: Performance - Object reuse with ObjectPool
published: true
date: 2024-09-24 04:01:37
tags: Summary, AspNetCore
description:
image:
---

## In this article

 - Expensive to allocate/initialize.

 - Represent a limited resource.

 - Used predictably and frequently.

 - Unless the initialization cost of an object is high, it's usually slower to get the object from the pool.

 - Objects managed by the pool aren't de-allocated until the pool is de-allocated.

## ```ObjectPool``` concepts

 - Items that are not returned to the pool will be disposed.

 - When the pool gets disposed by DI, all items in the pool are disposed.

 - Calling ```Get``` throws an ```ObjectDisposedException```.

 - Calling ```Return``` disposes the given item.

 - ```ObjectPool```<T> : The basic object pool abstraction. Used to get and return objects.

 - `PooledObjectPolicy<T>` : Implement this to customize how an object is created and how it's reset when returned to the pool. This can be passed into an object pool that's constructed directly.

 - ```IResettable``` : Automatically resets the object when returned to an object pool.

 - Instantiating a pool.

 - Registering a pool in Dependency injection (DI) as an instance.

 - Registering the ```ObjectPoolProvider<>``` in DI and using it as a factory.

## How to use ```ObjectPool```

## ```ObjectPool``` sample

 - Adds ```ObjectPoolProvider``` to the Dependency injection (DI) container.

 - Implements the ```IResettable``` interface to automatically clear the contents of the buffer when returned to the object pool.

```csharp
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.ObjectPool;
using System.Security.Cryptography;

var builder = WebApplication.CreateBuilder(args);

builder.Services.TryAddSingleton<ObjectPoolProvider, DefaultObjectPoolProvider>();

builder.Services.TryAddSingleton<ObjectPool<ReusableBuffer>>(serviceProvider =>
{
    var provider = serviceProvider.GetRequiredService<ObjectPoolProvider>();
    var policy = new DefaultPooledObjectPolicy<ReusableBuffer>();
    return provider.Create(policy);
});

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

// return the SHA256 hash of a word 
// https://localhost:7214/hash/SamsonAmaugo
app.MapGet("/hash/{name}", (string name, ObjectPool<ReusableBuffer> bufferPool) =>
{

    var buffer = bufferPool.Get();
    try
    {
        // Set the buffer data to the ASCII values of a word
        for (var i = 0; i < name.Length; i++)
        {
            buffer.Data[i] = (byte)name[i];
        }

        Span<byte> hash = stackalloc byte[32];
        SHA256.HashData(buffer.Data.AsSpan(0, name.Length), hash);
        return "Hash: " + Convert.ToHexString(hash);
    }
    finally
    {
        // Data is automatically reset because this type implemented IResettable
        bufferPool.Return(buffer); 
    }
});
app.Run();

public class ReusableBuffer : IResettable
{
    public byte[] Data { get; } = new byte[1024 * 1024]; // 1 MB

    public bool TryReset()
    {
        Array.Clear(Data);
        return true;
    }
}
```

Ref: [Object reuse with ```ObjectPool``` in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/performance/objectpool?view=aspnetcore-8.0)