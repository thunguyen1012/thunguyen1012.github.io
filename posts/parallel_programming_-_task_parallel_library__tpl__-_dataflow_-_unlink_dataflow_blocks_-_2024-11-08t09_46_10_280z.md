---
title: Parallel programming - Task Parallel Library (TPL) - Dataflow - Unlink dataflow blocks
published: true
date: 2024-11-08 09:46:10
tags: Summary, .Net, AdvancedProgramming
description: This document describes how to unlink a target dataflow block from its source.
image:
---

## In this article

This document describes how to unlink a target dataflow block from its source.

> Note
The TPL Dataflow Library (the ```System.Threading.Tasks.Dataflow``` namespace) is not distributed with .NET. To install the ```System.Threading.Tasks.Dataflow``` namespace in Visual Studio, open your project, choose Manage NuGet Packages from the Project menu, and search online for the ```System.Threading.Tasks.Dataflow``` package. Alternatively, to install it using the .NET Core CLI, run ```dotnet add package System.Threading.Tasks.Dataflow```.

## Example

The following example creates three `TransformBlock<TInput,TOutput>` objects, each of which calls the ```TrySolution``` method to compute a value. This example requires only the result from the first call to ```TrySolution``` to finish.

```csharp
using System;
using System.Threading;
using System.Threading.Tasks.Dataflow;

// Demonstrates how to unlink dataflow blocks.
class DataflowReceiveAny
{
   // Receives the value from the first provided source that has
   // a message.
   public static T ReceiveFromAny<T>(params ISourceBlock<T>[] sources)
   {
      // Create a WriteOnceBlock<T> object and link it to each source block.
      var writeOnceBlock = new WriteOnceBlock<T>(e => e);
      foreach (var source in sources)
      {
         // Setting MaxMessages to one instructs
         // the source block to unlink from the WriteOnceBlock<T> object
         // after offering the WriteOnceBlock<T> object one message.
         source.LinkTo(writeOnceBlock, new DataflowLinkOptions { MaxMessages = 1 });
      }
      // Return the first value that is offered to the WriteOnceBlock object.
      return writeOnceBlock.Receive();
   }

   // Demonstrates a function that takes several seconds to produce a result.
   static int TrySolution(int n, CancellationToken ct)
   {
      // Simulate a lengthy operation that completes within three seconds
      // or when the provided CancellationToken object is cancelled.
      SpinWait.SpinUntil(() => ct.IsCancellationRequested,
         new Random().Next(3000));

      // Return a value.
      return n + 42;
   }

   static void Main(string[] args)
   {
      // Create a shared CancellationTokenSource object to enable the
      // TrySolution method to be cancelled.
      var cts = new CancellationTokenSource();

      // Create three TransformBlock<int, int> objects.
      // Each TransformBlock<int, int> object calls the TrySolution method.
      Func<int, int> action = n => TrySolution(n, cts.Token);
      var trySolution1 = new TransformBlock<int, int>(action);
      var trySolution2 = new TransformBlock<int, int>(action);
      var trySolution3 = new TransformBlock<int, int>(action);

      // Post data to each TransformBlock<int, int> object.
      trySolution1.Post(11);
      trySolution2.Post(21);
      trySolution3.Post(31);

      // Call the ReceiveFromAny<T> method to receive the result from the
      // first TransformBlock<int, int> object to finish.
      int result = ReceiveFromAny(trySolution1, trySolution2, trySolution3);

      // Cancel all calls to TrySolution that are still active.
      cts.Cancel();

      // Print the result to the console.
      Console.WriteLine("The solution is {0}.", result);

      cts.Dispose();
   }
}

/* Sample output:
The solution is 53.
*/
```

To receive the value from the first `TransformBlock<TInput,TOutput>` object that finishes, this example defines the `ReceiveFromAny(T)` method. The `ReceiveFromAny(T)` method accepts an array of `ISourceBlock<TOutput>` objects and links each of these objects to a `WriteOnceBlock<T>` object. When you use the `LinkTo` method to link a source dataflow block to a target block, the source propagates messages to the target as data becomes available. Because the `WriteOnceBlock<T>` class accepts only the first message that it is offered, the `ReceiveFromAny(T)` method produces its result by calling the `Receive` method. This produces the first message that is offered to the `WriteOnceBlock<T>` object. The `LinkTo` method has an overloaded version that takes an `DataflowLinkOptions` object with a `MaxMessages` property that, when it is set to ```1```, instructs the source block to unlink from the target after the target receives one message from the source. It is important for the `WriteOnceBlock<T>` object to unlink from its sources because the relationship between the array of sources and the `WriteOnceBlock<T>` object is no longer required after the `WriteOnceBlock<T>` object receives a message.

To enable the remaining calls to ```TrySolution``` to end after one of them computes a value, the ```TrySolution``` method takes a `CancellationToken` object that is canceled after the call to `ReceiveFromAny(T)` returns. The `SpinUntil` method returns when this `CancellationToken` object is canceled.

## See also

- Dataflow

Ref: [How to: Unlink Dataflow Blocks](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/how-to-unlink-dataflow-blocks)