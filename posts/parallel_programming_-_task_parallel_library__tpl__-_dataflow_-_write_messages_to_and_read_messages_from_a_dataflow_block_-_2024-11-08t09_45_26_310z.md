---
title: Parallel programming - Task Parallel Library (TPL) - Dataflow - Write messages to and read messages from a dataflow block
published: true
date: 2024-11-08 09:45:26
tags: Summary, .Net, AdvancedProgramming
description: This article describes how to use the Task Parallel Library (TPL) Dataflow Library to write messages to and read messages from a dataflow block. The TPL Dataflow Library provides both synchronous and asynchronous methods for writing messages to and reading messages from a dataflow block. This article shows how to uses the System.Threading.Tasks.Dataflow.BufferBlock<T> class. The BufferBlock<T> class buffers messages and behaves as both a message source and a message target.
image:
---

## In this article

This article describes how to use the Task Parallel Library (TPL) Dataflow Library to write messages to and read messages from a dataflow block. The TPL Dataflow Library provides both synchronous and asynchronous methods for writing messages to and reading messages from a dataflow block. This article shows how to uses the ```System.Threading.Tasks.Dataflow.BufferBlock<T>``` class. The `BufferBlock<T>` class buffers messages and behaves as both a message source and a message target.

> Note
The TPL Dataflow Library (the ```System.Threading.Tasks.Dataflow``` namespace) is not distributed with .NET. To install the ```System.Threading.Tasks.Dataflow``` namespace in Visual Studio, open your project, choose Manage NuGet Packages from the Project menu, and search online for the ```System.Threading.Tasks.Dataflow``` package. Alternatively, to install it using the .NET Core CLI, run ```dotnet add package System.Threading.Tasks.Dataflow```.

## Writing and reading synchronously

The following example uses the Post method to write to a `BufferBlock<T>` dataflow block and the Receive method to read from the same object.

```csharp
var bufferBlock = new BufferBlock<int>();

// Post several messages to the block.
for (int i = 0; i < 3; i++)
{
    bufferBlock.Post(i);
}

// Receive the messages back from the block.
for (int i = 0; i < 3; i++)
{
    Console.WriteLine(bufferBlock.Receive());
}

// Output:
//   0
//   1
//   2
```

You can read data from a dataflow block, as shown in the following example.

```csharp
// Post more messages to the block.
for (int i = 0; i < 3; i++)
{
    bufferBlock.Post(i);
}

// Receive the messages back from the block.
while (bufferBlock.TryReceive(out int value))
{
    Console.WriteLine(value);
}

// Output:
//   0
//   1
//   2
```

The following examples show how to use the Post method to asynchronously read and write to a message block.

```csharp
// Write to and read from the message block concurrently.
var post01 = Task.Run(() =>
{
    bufferBlock.Post(0);
    bufferBlock.Post(1);
});
var receive = Task.Run(() =>
{
    for (int i = 0; i < 3; i++)
    {
        Console.WriteLine(bufferBlock.Receive());
    }
});
var post2 = Task.Run(() =>
{
    bufferBlock.Post(2);
});

await Task.WhenAll(post01, receive, post2);

// Output:
//   0
//   1
//   2
```

## Writing and reading asynchronously

asynchronously read and write data to and from a dataflow block.

```csharp
// Post more messages to the block asynchronously.
for (int i = 0; i < 3; i++)
{
    await bufferBlock.SendAsync(i);
}

// Asynchronously receive the messages back from the block.
for (int i = 0; i < 3; i++)
{
    Console.WriteLine(await bufferBlock.ReceiveAsync());
}

// Output:
//   0
//   1
//   2
```

## A complete example

The following example shows all of the code for this article.

```csharp
using System;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;

// Demonstrates a how to write to and read from a dataflow block.
class DataflowReadWrite
{
    // Demonstrates asynchronous dataflow operations.
    static async Task AsyncSendReceive(BufferBlock<int> bufferBlock)
    {
        // Post more messages to the block asynchronously.
        for (int i = 0; i < 3; i++)
        {
            await bufferBlock.SendAsync(i);
        }

        // Asynchronously receive the messages back from the block.
        for (int i = 0; i < 3; i++)
        {
            Console.WriteLine(await bufferBlock.ReceiveAsync());
        }

        // Output:
        //   0
        //   1
        //   2
    }

    static async Task Main()
    {
        var bufferBlock = new BufferBlock<int>();

        // Post several messages to the block.
        for (int i = 0; i < 3; i++)
        {
            bufferBlock.Post(i);
        }

        // Receive the messages back from the block.
        for (int i = 0; i < 3; i++)
        {
            Console.WriteLine(bufferBlock.Receive());
        }

        // Output:
        //   0
        //   1
        //   2

        // Post more messages to the block.
        for (int i = 0; i < 3; i++)
        {
            bufferBlock.Post(i);
        }

        // Receive the messages back from the block.
        while (bufferBlock.TryReceive(out int value))
        {
            Console.WriteLine(value);
        }

        // Output:
        //   0
        //   1
        //   2

        // Write to and read from the message block concurrently.
        var post01 = Task.Run(() =>
        {
            bufferBlock.Post(0);
            bufferBlock.Post(1);
        });
        var receive = Task.Run(() =>
        {
            for (int i = 0; i < 3; i++)
            {
                Console.WriteLine(bufferBlock.Receive());
            }
        });
        var post2 = Task.Run(() =>
        {
            bufferBlock.Post(2);
        });

        await Task.WhenAll(post01, receive, post2);

        // Output:
        //   0
        //   1
        //   2

        // Demonstrate asynchronous dataflow operations.
        await AsyncSendReceive(bufferBlock);
    }
}
```

## Next steps

You can connect dataflow blocks to form graphs of dataflow blocks, or networks, which are graphs of dataflow blocks.

## See also

- Dataflow (Task Parallel Library)

Ref: [How to: Write and read messages from a Dataflow block](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/how-to-write-messages-to-and-read-messages-from-a-dataflow-block)