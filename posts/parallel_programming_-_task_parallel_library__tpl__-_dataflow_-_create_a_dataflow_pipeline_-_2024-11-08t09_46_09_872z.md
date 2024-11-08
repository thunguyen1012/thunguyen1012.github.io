---
title: Parallel programming - Task Parallel Library (TPL) - Dataflow - Create a dataflow pipeline
published: true
date: 2024-11-08 09:46:09
tags: Summary, .Net, AdvancedProgramming
description: Although you can use the DataflowBlock.Receive, DataflowBlock.ReceiveAsync, and DataflowBlock.TryReceive methods to receive messages from source blocks, you can also connect message blocks to form a dataflow pipeline. A dataflow pipeline is a series of components, or dataflow blocks, each of which performs a specific task that contributes to a larger goal. Every dataflow block in a dataflow pipeline performs work when it receives a message from another dataflow block. An analogy to this is an assembly line for automobile manufacturing. As each vehicle passes through the assembly line, one station assembles the frame, the next one installs the engine, and so on. Because an assembly line enables multiple vehicles to be assembled at the same time, it provides better throughput than assembling complete vehicles one at a time.
image:
---

## In this article

You can use the following methods to receive messages from source blocks.

This document demonstrates a dataflow pipeline that downloads the book The Iliad of Homer from a website and searches the text to match individual words with words that reverse the first word's characters.

- Create the dataflow blocks that participate in the pipeline.

- Connect each dataflow block to the next block in the pipeline. Each block receives as input the output of the previous block in the pipeline.

- For each dataflow block, create a continuation task that sets the next block to the completed state after the previous block finishes.

- Post data to the head of the pipeline.

- Mark the head of the pipeline as completed.

- Wait for the pipeline to complete all work.

## Prerequisites

Read Dataflow before you start this walkthrough.

## Creating a Console Application

In Visual Studio, create a Visual C# or Visual Basic Console Application project. Install the ```System.Threading.Tasks.Dataflow``` NuGet package.

> Note
The TPL Dataflow Library (the ```System.Threading.Tasks.Dataflow``` namespace) is not distributed with .NET. To install the ```System.Threading.Tasks.Dataflow``` namespace in Visual Studio, open your project, choose Manage NuGet Packages from the Project menu, and search online for the ```System.Threading.Tasks.Dataflow``` package. Alternatively, to install it using the .NET Core CLI, run ```dotnet add package System.Threading.Tasks.Dataflow```.

Add the following code to your project to create the basic application.

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks.Dataflow;

// Demonstrates how to create a basic dataflow pipeline.
// This program downloads the book "The Iliad of Homer" by Homer from the Web
// and finds all reversed words that appear in that book.
static class Program
{
   static void Main()
   {
   }
}
```

## Creating the Dataflow Blocks

Add the following code to the ```Main``` method to create the dataflow blocks that participate in the pipeline. The table that follows summarizes the role of each member of the pipeline.

```csharp
//
// Create the members of the pipeline.
//

// Downloads the requested resource as a string.
var downloadString = new TransformBlock<string, string>(async uri =>
{
   Console.WriteLine("Downloading '{0}'...", uri);

   return await new HttpClient(new HttpClientHandler{ AutomaticDecompression = System.Net.DecompressionMethods.GZip }).GetStringAsync(uri);
});

// Separates the specified text into an array of words.
var createWordList = new TransformBlock<string, string[]>(text =>
{
   Console.WriteLine("Creating word list...");

   // Remove common punctuation by replacing all non-letter characters
   // with a space character.
   char[] tokens = text.Select(c => char.IsLetter(c) ? c : ' ').ToArray();
   text = new string(tokens);

   // Separate the text into an array of words.
   return text.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
});

// Removes short words and duplicates.
var filterWordList = new TransformBlock<string[], string[]>(words =>
{
   Console.WriteLine("Filtering word list...");

   return words
      .Where(word => word.Length > 3)
      .Distinct()
      .ToArray();
});

// Finds all words in the specified collection whose reverse also
// exists in the collection.
var findReversedWords = new TransformManyBlock<string[], string>(words =>
{
   Console.WriteLine("Finding reversed words...");

   var wordsSet = new HashSet<string>(words);

   return from word in words.AsParallel()
          let reverse = new string(word.Reverse().ToArray())
          where word != reverse && wordsSet.Contains(reverse)
          select word;
});

// Prints the provided reversed words to the console.
var printReversedWords = new ActionBlock<string>(reversedWord =>
{
   Console.WriteLine("Found reversed words {0}/{1}",
      reversedWord, new string(reversedWord.Reverse().ToArray()));
});
```

<table><thead>
<tr>
<th>Member</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>downloadString</code></td>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.transformblock-2" class="no-loc" data-linktype="absolute-path">TransformBlock&lt;TInput,TOutput&gt;</a></td>
<td>Downloads the book text from the Web.</td>
</tr>
<tr>
<td><code>createWordList</code></td>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.transformblock-2" class="no-loc" data-linktype="absolute-path">TransformBlock&lt;TInput,TOutput&gt;</a></td>
<td>Separates the book text into an array of words.</td>
</tr>
<tr>
<td><code>filterWordList</code></td>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.transformblock-2" class="no-loc" data-linktype="absolute-path">TransformBlock&lt;TInput,TOutput&gt;</a></td>
<td>Removes short words and duplicates from the word array.</td>
</tr>
<tr>
<td><code>findReversedWords</code></td>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.transformmanyblock-2" class="no-loc" data-linktype="absolute-path">TransformManyBlock&lt;TInput,TOutput&gt;</a></td>
<td>Finds all words in the filtered word array collection whose reverse also occurs in the word array.</td>
</tr>
<tr>
<td><code>printReversedWords</code></td>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.actionblock-1" class="no-loc" data-linktype="absolute-path">ActionBlock&lt;TInput&gt;</a></td>
<td>Displays words and the corresponding reverse words to the console.</td>
</tr>
</tbody></table>

Although you could combine multiple steps in the dataflow pipeline in this example into one step, the example illustrates the concept of composing multiple independent dataflow tasks to perform a larger task. The example uses `TransformBlock<TInput,TOutput>` to enable each member of the pipeline to perform an operation on its input data and send the results to the next step in the pipeline. The ```findReversedWords``` member of the pipeline is a `TransformManyBlock<TInput,TOutput>` object because it produces multiple independent outputs for each input. The tail of the pipeline, ```printReversedWords```, is an `ActionBlock<TInput>` object because it performs an action on its input, and does not produce a result.

## Forming the Pipeline

Add the following code to connect each block to the next block in the pipeline.

The LinkTo method connects a source dataflow block to a target dataflow block in the pipeline.

```csharp
//
// Connect the dataflow blocks to form a pipeline.
//

var linkOptions = new DataflowLinkOptions { PropagateCompletion = true };

downloadString.LinkTo(createWordList, linkOptions);
createWordList.LinkTo(filterWordList, linkOptions);
filterWordList.LinkTo(findReversedWords, linkOptions);
findReversedWords.LinkTo(printReversedWords, linkOptions);
```

## Posting Data to the Pipeline

Add the following code to post the URL of the book The Iliad of Homer to the head of the dataflow pipeline.

```csharp
// Process "The Iliad of Homer" by Homer.
downloadString.Post("http://www.gutenberg.org/cache/epub/16452/pg16452.txt");
```

This example uses `DataflowBlock.Post` to synchronously send data to the head of the pipeline. Use the `DataflowBlock.SendAsync` method when you must asynchronously send data to a dataflow node.

## Completing Pipeline Activity

Add the following code to mark the head of the pipeline as completed. The head of the pipeline propagates its completion after it processes all buffered messages.

```csharp
// Mark the head of the pipeline as complete.
downloadString.Complete();
```

This example shows how to send data through a dataflow pipeline.

## Waiting for the Pipeline to Finish

Add the following code to wait for the pipeline to finish. The overall operation is finished when the tail of the pipeline finishes.

```csharp
// Wait for the last block in the pipeline to process all messages.
printReversedWords.Completion.Wait();
```

You can wait for dataflow completion from any thread or from multiple threads at the same time.

## The Complete Example

The following example shows the complete code for this walkthrough.

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks.Dataflow;

// Demonstrates how to create a basic dataflow pipeline.
// This program downloads the book "The Iliad of Homer" by Homer from the Web
// and finds all reversed words that appear in that book.
static class DataflowReversedWords
{
   static void Main()
   {
      //
      // Create the members of the pipeline.
      //

      // Downloads the requested resource as a string.
      var downloadString = new TransformBlock<string, string>(async uri =>
      {
         Console.WriteLine("Downloading '{0}'...", uri);

         return await new HttpClient(new HttpClientHandler{ AutomaticDecompression = System.Net.DecompressionMethods.GZip }).GetStringAsync(uri);
      });

      // Separates the specified text into an array of words.
      var createWordList = new TransformBlock<string, string[]>(text =>
      {
         Console.WriteLine("Creating word list...");

         // Remove common punctuation by replacing all non-letter characters
         // with a space character.
         char[] tokens = text.Select(c => char.IsLetter(c) ? c : ' ').ToArray();
         text = new string(tokens);

         // Separate the text into an array of words.
         return text.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
      });

      // Removes short words and duplicates.
      var filterWordList = new TransformBlock<string[], string[]>(words =>
      {
         Console.WriteLine("Filtering word list...");

         return words
            .Where(word => word.Length > 3)
            .Distinct()
            .ToArray();
      });

      // Finds all words in the specified collection whose reverse also
      // exists in the collection.
      var findReversedWords = new TransformManyBlock<string[], string>(words =>
      {
         Console.WriteLine("Finding reversed words...");

         var wordsSet = new HashSet<string>(words);

         return from word in words.AsParallel()
                let reverse = new string(word.Reverse().ToArray())
                where word != reverse && wordsSet.Contains(reverse)
                select word;
      });

      // Prints the provided reversed words to the console.
      var printReversedWords = new ActionBlock<string>(reversedWord =>
      {
         Console.WriteLine("Found reversed words {0}/{1}",
            reversedWord, new string(reversedWord.Reverse().ToArray()));
      });

      //
      // Connect the dataflow blocks to form a pipeline.
      //

      var linkOptions = new DataflowLinkOptions { PropagateCompletion = true };

      downloadString.LinkTo(createWordList, linkOptions);
      createWordList.LinkTo(filterWordList, linkOptions);
      filterWordList.LinkTo(findReversedWords, linkOptions);
      findReversedWords.LinkTo(printReversedWords, linkOptions);

      // Process "The Iliad of Homer" by Homer.
      downloadString.Post("http://www.gutenberg.org/cache/epub/16452/pg16452.txt");

      // Mark the head of the pipeline as complete.
      downloadString.Complete();

      // Wait for the last block in the pipeline to process all messages.
      printReversedWords.Completion.Wait();
   }
}
/* Sample output:
   Downloading 'http://www.gutenberg.org/cache/epub/16452/pg16452.txt'...
   Creating word list...
   Filtering word list...
   Finding reversed words...
   Found reversed words doom/mood
   Found reversed words draw/ward
   Found reversed words aera/area
   Found reversed words seat/taes
   Found reversed words live/evil
   Found reversed words port/trop
   Found reversed words sleek/keels
   Found reversed words area/aera
   Found reversed words tops/spot
   Found reversed words evil/live
   Found reversed words mood/doom
   Found reversed words speed/deeps
   Found reversed words moor/room
   Found reversed words trop/port
   Found reversed words spot/tops
   Found reversed words spots/stops
   Found reversed words stops/spots
   Found reversed words reed/deer
   Found reversed words keels/sleek
   Found reversed words deeps/speed
   Found reversed words deer/reed
   Found reversed words taes/seat
   Found reversed words room/moor
   Found reversed words ward/draw
*/
```

## Next Steps

This example shows how to introduce a form of parallelism into your application that resembles how parts might move through an automobile factory.

The parallelism that is achieved by using dataflow pipelines is known as coarse-grained parallelism because it typically consists of fewer, larger tasks. You can also use a more fine-grained parallelism of smaller, short-running tasks in a dataflow pipeline. In this example, the ```findReversedWords``` member of the pipeline uses PLINQ to process multiple items in the work list in parallel. The use of fine-grained parallelism in a coarse-grained pipeline can improve overall throughput.

You can connect a source dataflow block to multiple target blocks to create a dataflow network.

## See also

- Dataflow

Ref: [Walkthrough: Creating a Dataflow Pipeline](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/walkthrough-creating-a-dataflow-pipeline)