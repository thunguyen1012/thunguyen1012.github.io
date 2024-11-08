---
title: Parallel programming - Task Parallel Library (TPL) - Task-based asynchronous programming - Prevent a child task from attaching to its parent
published: true
date: 2024-11-08 09:42:48
tags: Summary, .Net, AdvancedProgramming
description: This document demonstrates how to prevent a child task from attaching to the parent task. Preventing a child task from attaching to its parent is useful when you call a component that is written by a third party and that also uses tasks. For example, a third-party component that uses the TaskCreationOptions.AttachedToParent option to create a Task or Task<TResult> object can cause problems in your code if it is long-running or throws an unhandled exception.
image:
---

## In this article

This document demonstrates how to prevent a child task from attaching to the parent task.

## Example

The `AttachedToParent` option instructs the runtime to remove the `AttachedToParent` specification from child tasks.

```csharp
using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;

// Defines functionality that is provided by a third-party.
// In a real-world scenario, this would likely be provided
// in a separate code file or assembly.
namespace Contoso
{
   public class Widget
   {
      public Task Run()
      {
         // Create a long-running task that is attached to the
         // parent in the task hierarchy.
         return Task.Factory.StartNew(() =>
         {
            // Simulate a lengthy operation.
            Thread.Sleep(5000);
         }, TaskCreationOptions.AttachedToParent);
      }
   }
}

// Demonstrates how to prevent a child task from attaching to the parent.
class DenyChildAttach
{
   static void RunWidget(Contoso.Widget widget,
      TaskCreationOptions parentTaskOptions)
   {
      // Record the time required to run the parent
      // and child tasks.
      Stopwatch stopwatch = new Stopwatch();
      stopwatch.Start();

      Console.WriteLine("Starting widget as a background task...");

      // Run the widget task in the background.
      Task<Task> runWidget = Task.Factory.StartNew(() =>
         {
            Task widgetTask = widget.Run();

            // Perform other work while the task runs...
            Thread.Sleep(1000);

            return widgetTask;
         }, parentTaskOptions);

      // Wait for the parent task to finish.
      Console.WriteLine("Waiting for parent task to finish...");
      runWidget.Wait();
      Console.WriteLine("Parent task has finished. Elapsed time is {0} ms.",
         stopwatch.ElapsedMilliseconds);

      // Perform more work...
      Console.WriteLine("Performing more work on the main thread...");
      Thread.Sleep(2000);
      Console.WriteLine("Elapsed time is {0} ms.", stopwatch.ElapsedMilliseconds);

      // Wait for the child task to finish.
      Console.WriteLine("Waiting for child task to finish...");
      runWidget.Result.Wait();
      Console.WriteLine("Child task has finished. Elapsed time is {0} ms.",
        stopwatch.ElapsedMilliseconds);
   }

   static void Main(string[] args)
   {
      Contoso.Widget w = new Contoso.Widget();

      // Perform the same operation two times. The first time, the operation
      // is performed by using the default task creation options. The second
      // time, the operation is performed by using the DenyChildAttach option
      // in the parent task.

      Console.WriteLine("Demonstrating parent/child tasks with default options...");
      RunWidget(w, TaskCreationOptions.None);

      Console.WriteLine();

      Console.WriteLine("Demonstrating parent/child tasks with the DenyChildAttach option...");
      RunWidget(w, TaskCreationOptions.DenyChildAttach);
   }
}

/* Sample output:
Demonstrating parent/child tasks with default options...
Starting widget as a background task...
Waiting for parent task to finish...
Parent task has finished. Elapsed time is 5014 ms.
Performing more work on the main thread...
Elapsed time is 7019 ms.
Waiting for child task to finish...
Child task has finished. Elapsed time is 7019 ms.

Demonstrating parent/child tasks with the DenyChildAttach option...
Starting widget as a background task...
Waiting for parent task to finish...
Parent task has finished. Elapsed time is 1007 ms.
Performing more work on the main thread...
Elapsed time is 3015 ms.
Waiting for child task to finish...
Child task has finished. Elapsed time is 5015 ms.
*/
```

This example shows how to create a parent task and a child task.

## See also

- Task-based Asynchronous Programming

Ref: [How to: Prevent a Child Task from Attaching to its Parent](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/how-to-prevent-a-child-task-from-attaching-to-its-parent)