---
title: Parallel programming - Task Parallel Library (TPL) - Dataflow - Perform an action when a dataflow block receives data
published: true
date: 2024-11-08 09:45:40
tags: Summary, .Net, AdvancedProgramming
description: Execution dataflow block types call a user-provided delegate when they receive data. The System.Threading.Tasks.Dataflow.ActionBlock<TInput>, System.Threading.Tasks.Dataflow.TransformBlock<TInput,TOutput>, and System.Threading.Tasks.Dataflow.TransformManyBlock<TInput,TOutput> classes are execution dataflow block types. You can use the delegate keyword (Sub in Visual Basic), Action<T>, Func<T,TResult>, or a lambda expression when you provide a work function to an execution dataflow block. This document describes how to use Func<T,TResult> and lambda expressions to perform action in execution blocks.
image:
---

## In this article

Execution dataflow block types call a user-provided ```delegate``` when they receive data. The ```System.Threading.Tasks.Dataflow.ActionBlock<TInput>```, ```System.Threading.Tasks.Dataflow.TransformBlock<TInput,TOutput>```, and ```System.Threading.Tasks.Dataflow.TransformManyBlock<TInput,TOutput>``` classes are execution dataflow block types. You can use the ```delegate``` keyword (Sub in Visual Basic), `Action<T>`, `Func<T,TResult>`, or a lambda expression when you provide a work function to an execution dataflow block. This document describes how to use `Func<T,TResult>` and lambda expressions to perform action in execution blocks.

> Note
The TPL Dataflow Library (the ```System.Threading.Tasks.Dataflow``` namespace) is not distributed with .NET. To install the ```System.Threading.Tasks.Dataflow``` namespace in Visual Studio, open your project, choose Manage NuGet Packages from the Project menu, and search online for the ```System.Threading.Tasks.Dataflow``` package. Alternatively, to install it using the .NET Core CLI, run ```dotnet add package System.Threading.Tasks.Dataflow```.

## Example

The following example shows how to use dataflow to read a file from disk and compute the number of bytes in that file that are equal to zero.

```csharp
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;

// Demonstrates how to provide delegates to exectution dataflow blocks.
class DataflowExecutionBlocks
{
   // Computes the number of zero bytes that the provided file
   // contains.
   static int CountBytes(string path)
   {
      byte[] buffer = new byte[1024];
      int totalZeroBytesRead = 0;
      using (var fileStream = File.OpenRead(path))
      {
         int bytesRead = 0;
         do
         {
            bytesRead = fileStream.Read(buffer, 0, buffer.Length);
            totalZeroBytesRead += buffer.Count(b => b == 0);
         } while (bytesRead > 0);
      }

      return totalZeroBytesRead;
   }

   static void Main(string[] args)
   {
      // Create a temporary file on disk.
      string tempFile = Path.GetTempFileName();

      // Write random data to the temporary file.
      using (var fileStream = File.OpenWrite(tempFile))
      {
         Random rand = new Random();
         byte[] buffer = new byte[1024];
         for (int i = 0; i < 512; i++)
         {
            rand.NextBytes(buffer);
            fileStream.Write(buffer, 0, buffer.Length);
         }
      }

      // Create an ActionBlock<int> object that prints to the console
      // the number of bytes read.
      var printResult = new ActionBlock<int>(zeroBytesRead =>
      {
         Console.WriteLine("{0} contains {1} zero bytes.",
            Path.GetFileName(tempFile), zeroBytesRead);
      });

      // Create a TransformBlock<string, int> object that calls the
      // CountBytes function and returns its result.
      var countBytes = new TransformBlock<string, int>(
         new Func<string, int>(CountBytes));

      // Link the TransformBlock<string, int> object to the
      // ActionBlock<int> object.
      countBytes.LinkTo(printResult);

      // Create a continuation task that completes the ActionBlock<int>
      // object when the TransformBlock<string, int> finishes.
      countBytes.Completion.ContinueWith(delegate { printResult.Complete(); });

      // Post the path to the temporary file to the
      // TransformBlock<string, int> object.
      countBytes.Post(tempFile);

      // Requests completion of the TransformBlock<string, int> object.
      countBytes.Complete();

      // Wait for the ActionBlock<int> object to print the message.
      printResult.Completion.Wait();

      // Delete the temporary file.
      File.Delete(tempFile);
   }
}

/* Sample output:
tmp4FBE.tmp contains 2081 zero bytes.
*/
```

Although you can provide a lambda expression to a `TransformBlock<TInput,TOutput>` object, this example uses `Func<T,TResult>` to enable other code to use the ```CountBytes``` method. The `ActionBlock<TInput>` object uses a lambda expression because the work to be performed is specific to this task and is not likely to be useful from other code. For more information about how lambda expressions work in the Task Parallel Library, see Lambda Expressions in PLINQ and TPL.

The section Summary of Delegate Types in the Dataflow document summarizes the ```delegate``` types that you can provide to `ActionBlock<TInput>`, `TransformBlock<TInput,TOutput>`, and `TransformManyBlock<TInput,TOutput>` objects. The table also specifies whether the ```delegate``` type operates synchronously or asynchronously.

## Robust Programming

This example provides a ```delegate``` of type `Func<T,TResult>` to the `TransformBlock<TInput,TOutput>` object to perform the task of the dataflow block synchronously. To enable the dataflow block to behave asynchronously, provide a ```delegate``` of type `Func<T, Task<TResult>>` to the dataflow block. When a dataflow block behaves asynchronously, the task of the dataflow block is complete only when the returned Task<TResult> object finishes. The following example modifies the ```CountBytes``` method and uses the async and await operators (Async and Await in Visual Basic) to asynchronously compute the total number of bytes that are zero in the provided file. The ReadAsync method performs file read operations asynchronously.

```csharp
// Asynchronously computes the number of zero bytes that the provided file
// contains.
static async Task<int> CountBytesAsync(string path)
{
   byte[] buffer = new byte[1024];
   int totalZeroBytesRead = 0;
   using (var fileStream = new FileStream(
      path, FileMode.Open, FileAccess.Read, FileShare.Read, 0x1000, true))
   {
      int bytesRead = 0;
      do
      {
         // Asynchronously read from the file stream.
         bytesRead = await fileStream.ReadAsync(buffer, 0, buffer.Length);
         totalZeroBytesRead += buffer.Count(b => b == 0);
      } while (bytesRead > 0);
   }

   return totalZeroBytesRead;
}
```

You can use Transform expressions to perform action in an execution dataflow block.

```csharp
// Create a TransformBlock<string, int> object that calls the
// CountBytes function and returns its result.
var countBytesAsync = new TransformBlock<string, int>(async path =>
{
   byte[] buffer = new byte[1024];
   int totalZeroBytesRead = 0;
   using (var fileStream = new FileStream(
      path, FileMode.Open, FileAccess.Read, FileShare.Read, 0x1000, true))
   {
      int bytesRead = 0;
      do
      {
         // Asynchronously read from the file stream.
         bytesRead = await fileStream.ReadAsync(buffer, 0, buffer.Length);
         totalZeroBytesRead += buffer.Count(b => b == 0);
      } while (bytesRead > 0);
   }

   return totalZeroBytesRead;
});
```

## See also

- Dataflow

Ref: [How to: Perform Action When a Dataflow Block Receives Data](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/how-to-perform-action-when-a-dataflow-block-receives-data)