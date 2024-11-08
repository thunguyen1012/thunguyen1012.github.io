---
title: Parallel programming - Task Parallel Library (TPL) - Dataflow - Implement a producer-consumer dataflow pattern
published: true
date: 2024-11-08 09:45:33
tags: Summary, .Net, AdvancedProgramming
description: In this article, you'll learn how to use the TPL dataflow library to implement a producer-consumer pattern. In this pattern, the producer sends messages to a message block, and the consumer reads messages from that block.
image:
---

## In this article

In this article, you'll learn how to use the TPL dataflow library to implement a producer-consumer pattern.

> Note
The TPL Dataflow Library (the ```System.Threading.Tasks.Dataflow``` namespace) is not distributed with .NET. To install the ```System.Threading.Tasks.Dataflow``` namespace in Visual Studio, open your project, choose Manage NuGet Packages from the Project menu, and search online for the ```System.Threading.Tasks.Dataflow``` package. Alternatively, to install it using the .NET Core CLI, run ```dotnet add package System.Threading.Tasks.Dataflow```.

## Example

The following example demonstrates a basic producer-consumer model that uses dataflow. The ```Produce``` method writes arrays that contain random bytes of data to a ```System.Threading.Tasks.Dataflow.ITargetBlock<TInput>``` object and the ```Consume``` method reads bytes from a ```System.Threading.Tasks.Dataflow.ISourceBlock<TOutput>``` object. By acting on the `ISourceBlock<TOutput>` and `ITargetBlock<TInput>` interfaces, instead of their derived types, you can write reusable code that can act on a variety of dataflow block types. This example uses the `BufferBlock<T>` class. Because the `BufferBlock<T>` class acts as both a source block and as a target block, the producer and the consumer can use a shared object to transfer data.

The ```Produce``` method calls the Post method in a loop to synchronously write data to the target block. After the ```Produce``` method writes all data to the target block, it calls the Complete method to indicate that the block will never have additional data available. The ```Consume``` method uses the async and await operators (Async and Await in Visual Basic) to asynchronously compute the total number of bytes that are received from the `ISourceBlock<TOutput>` object. To act asynchronously, the ```Consume``` method calls the OutputAvailableAsync method to receive a notification when the source block has data available and when the source block will never have additional data available.

```csharp
using System;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;

class DataflowProducerConsumer
{
    static void Produce(ITargetBlock<byte[]> target)
    {
        var rand = new Random();

        for (int i = 0; i < 100; ++ i)
        {
            var buffer = new byte[1024];
            rand.NextBytes(buffer);
            target.Post(buffer);
        }

        target.Complete();
    }

    static async Task<int> ConsumeAsync(ISourceBlock<byte[]> source)
    {
        int bytesProcessed = 0;

        while (await source.OutputAvailableAsync())
        {
            byte[] data = await source.ReceiveAsync();
            bytesProcessed += data.Length;
        }

        return bytesProcessed;
    }

    static async Task Main()
    {
        var buffer = new BufferBlock<byte[]>();
        var consumerTask = ConsumeAsync(buffer);
        Produce(buffer);

        var bytesProcessed = await consumerTask;

        Console.WriteLine($"Processed {bytesProcessed:#,#} bytes.");
    }
}

// Sample  output:
//     Processed 102,400 bytes.
```

## Robust programming

The following example shows how to read data from a source block.

```csharp
static async Task<int> ConsumeAsync(IReceivableSourceBlock<byte[]> source)
{
    int bytesProcessed = 0;
    while (await source.OutputAvailableAsync())
    {
        while (source.TryReceive(out byte[] data))
        {
            bytesProcessed += data.Length;
        }
    }
    return bytesProcessed;
}
```

The `TryReceive` method returns ```False``` when no data is available. When multiple consumers must access the source block concurrently, this mechanism guarantees that data is still available after the call to `OutputAvailableAsync`.

## See also

- Dataflow

Ref: [How to: Implement a producer-consumer dataflow pattern](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/how-to-implement-a-producer-consumer-dataflow-pattern)