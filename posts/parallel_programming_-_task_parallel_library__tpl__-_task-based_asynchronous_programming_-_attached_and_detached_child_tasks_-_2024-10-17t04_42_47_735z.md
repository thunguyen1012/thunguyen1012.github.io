---
title: Parallel programming - Task Parallel Library (TPL) - Task-based asynchronous programming - Attached and detached child tasks
published: true
date: 2024-10-17 04:42:47
tags: Summary, .Net, AdvancedProgramming
description: A child task (or nested task) is a System.Threading.Tasks.Task instance that is created in the user delegate of another task, which is known as the parent task. A child task can be either detached or attached. A detached child task is a task that executes independently of its parent. An attached child task is a nested task that is created with the TaskCreationOptions.AttachedToParent option whose parent does not explicitly or by default prohibit it from being attached. A task may create any number of attached and detached child tasks, limited only by system resources.
image:
---
- Article

  - 09/15/2021

  - 12 contributors

## In this article

A child task is a task that is created in the user delegate of another task.

The following table lists the basic differences between the two kinds of child tasks.

<table><thead>
<tr>
<th>Category</th>
<th>Detached child tasks</th>
<th>Attached child tasks</th>
</tr>
</thead>
<tbody>
<tr>
<td>Parent waits for child tasks to complete.</td>
<td>No</td>
<td>Yes</td>
</tr>
<tr>
<td>Parent propagates exceptions thrown by child tasks.</td>
<td>No</td>
<td>Yes</td>
</tr>
<tr>
<td>Status of parent depends on status of child.</td>
<td>No</td>
<td>Yes</td>
</tr>
</tbody></table>

You can create tasks inside a parent task, or you can attach them to a child task.

## Detached child tasks

The console app creates a parent task and a child task.

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

public class Example
{
   public static void Main()
   {
      var parent = Task.Factory.StartNew(() => {
         Console.WriteLine("Outer task executing.");

         var child = Task.Factory.StartNew(() => {
            Console.WriteLine("Nested task starting.");
            Thread.SpinWait(500000);
            Console.WriteLine("Nested task completing.");
         });
      });

      parent.Wait();
      Console.WriteLine("Outer has completed.");
   }
}
// The example produces output like the following:
//        Outer task executing.
//        Nested task starting.
//        Outer has completed.
//        Nested task completing.
```

```vb
Imports System.Threading
Imports System.Threading.Tasks

Module Example
    Public Sub Main()
        Dim parent = Task.Factory.StartNew(Sub()
                                               Console.WriteLine("Outer task executing.")
                                               Dim child = Task.Factory.StartNew(Sub()
                                                                                     Console.WriteLine("Nested task starting.")
                                                                                     Thread.SpinWait(500000)
                                                                                     Console.WriteLine("Nested task completing.")
                                                                                 End Sub)
                                           End Sub)
        parent.Wait()
        Console.WriteLine("Outer task has completed.")
    End Sub
End Module
' The example produces output like the following:
'   Outer task executing.
'   Nested task starting.
'   Outer task has completed.
'   Nested task completing.
```

A child task can be a parent task or a detached child task.

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

class Example
{
   static void Main()
   {
      var outer = Task<int>.Factory.StartNew(() => {
            Console.WriteLine("Outer task executing.");

            var nested = Task<int>.Factory.StartNew(() => {
                  Console.WriteLine("Nested task starting.");
                  Thread.SpinWait(5000000);
                  Console.WriteLine("Nested task completing.");
                  return 42;
            });

            // Parent will wait for this detached child.
            return nested.Result;
      });

      Console.WriteLine("Outer has returned {0}.", outer.Result);
   }
}
// The example displays the following output:
//       Outer task executing.
//       Nested task starting.
//       Nested task completing.
//       Outer has returned 42.
```

```vb
Imports System.Threading
Imports System.Threading.Tasks

Module Example
    Public Sub Main()
        Dim parent = Task(Of Integer).Factory.StartNew(Function()
                                                           Console.WriteLine("Outer task executing.")
                                                           Dim child = Task(Of Integer).Factory.StartNew(Function()
                                                                                                             Console.WriteLine("Nested task starting.")
                                                                                                             Thread.SpinWait(5000000)
                                                                                                             Console.WriteLine("Nested task completing.")
                                                                                                             Return 42
                                                                                                         End Function)
                                                           Return child.Result


                                                       End Function)
        Console.WriteLine("Outer has returned {0}", parent.Result)
    End Sub
End Module
' The example displays the following output:
'       Outer task executing.
'       Nested task starting.
'       Detached task completing.
'       Outer has returned 42
```

## Attached child tasks

This example shows how to create an attached child task.

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

public class Example
{
   public static void Main()
   {
      var parent = Task.Factory.StartNew(() => {
            Console.WriteLine("Parent task executing.");
            var child = Task.Factory.StartNew(() => {
                  Console.WriteLine("Attached child starting.");
                  Thread.SpinWait(5000000);
                  Console.WriteLine("Attached child completing.");
            }, TaskCreationOptions.AttachedToParent);
      });
      parent.Wait();
      Console.WriteLine("Parent has completed.");
   }
}
// The example displays the following output:
//       Parent task executing.
//       Attached child starting.
//       Attached child completing.
//       Parent has completed.
```

```vb
Imports System.Threading
Imports System.Threading.Tasks

Module Example
    Public Sub Main()
        Dim parent = Task.Factory.StartNew(Sub()
                                               Console.WriteLine("Parent task executing")
                                               Dim child = Task.Factory.StartNew(Sub()
                                                                                     Console.WriteLine("Attached child starting.")
                                                                                     Thread.SpinWait(5000000)
                                                                                     Console.WriteLine("Attached child completing.")
                                                                                 End Sub, TaskCreationOptions.AttachedToParent)
                                           End Sub)
        parent.Wait()
        Console.WriteLine("Parent has completed.")
    End Sub
End Module
' The example displays the following output:
'       Parent task executing.
'       Attached child starting.
'       Attached child completing.
'       Parent has completed.
```

You can use attached child tasks to create tightly synchronized graphs of asynchronous operations.

A child task can attach to its parent task by calling the Task.Run method.

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

public class Example
{
   public static void Main()
   {
      var parent = Task.Run(() => {
            Console.WriteLine("Parent task executing.");
            var child = Task.Factory.StartNew(() => {
                  Console.WriteLine("Attached child starting.");
                  Thread.SpinWait(5000000);
                  Console.WriteLine("Attached child completing.");
            }, TaskCreationOptions.AttachedToParent);
      });
      parent.Wait();
      Console.WriteLine("Parent has completed.");
   }
}
// The example displays output like the following:
//       Parent task executing.
//       Parent has completed.
//       Attached child starting.
```

```vb
Imports System.Threading
Imports System.Threading.Tasks

Module Example
    Public Sub Main()
        Dim parent = Task.Run(Sub()
                                  Console.WriteLine("Parent task executing.")
                                  Dim child = Task.Factory.StartNew(Sub()
                                                                        Console.WriteLine("Attached child starting.")
                                                                        Thread.SpinWait(5000000)
                                                                        Console.WriteLine("Attached child completing.")
                                                                    End Sub, TaskCreationOptions.AttachedToParent)
                              End Sub)
        parent.Wait()
        Console.WriteLine("Parent has completed.")
    End Sub
End Module
' The example displays output like the following:
'       Parent task executing.
'       Parent has completed.
'       Attached child starting.
```

## Exceptions in child tasks

The attached child task method allows you to attach a child task to a parent task.

## Cancellation and child tasks

To cancel a parent task and all its children by using one cancellation request, you pass the same token as an argument to all tasks and provide in each task the logic to respond to the request in each task.

### When the parent cancels

If a parent cancels itself before its child task is started, the child never starts.

### When a detached child task cancels

A detached child task cancels itself by using the same token that was passed to the parent, and the parent does not wait for the child task to cancel itself.

### When an attached child task cancels

A child task is a subclass of a parent task.

For more information, see Exception Handling.

## Preventing a child task from attaching to its parent

The child taskPropagation method propagates exceptions from a child task to a parent task.

When a task tries to attach to its parent task, the child task will not be able to do so and will execute just as if the TaskCreationOptions.AttachedToParent option was not specified.

You might want to prevent a child task from attaching to its parent when the child task does not finish in a timely manner.

## See also

- Parallel Programming

- Data Parallelism

Ref: [Attached and Detached Child Tasks](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/attached-and-detached-child-tasks)