---
title: Parallel programming - Task Parallel Library (TPL) - Task-based asynchronous programming - Exception handling
published: true
date: 2024-10-17 04:43:27
tags: Summary, .Net, AdvancedProgramming
description: Unhandled exceptions that are thrown by user code that is running inside a task are propagated back to the calling thread, except in certain scenarios that are described later in this topic. Exceptions are propagated when you use one of the static or instance Task.Wait methods, and you handle them by enclosing the call in a try/catch statement. If a task is the parent of attached child tasks, or if you are waiting on multiple tasks, multiple exceptions could be thrown.
image:
---

## In this article

Unhandled exceptions that are thrown by user code that is running inside a task are propagated back to the calling thread, except in certain scenarios that are described later in this topic. Exceptions are propagated when you use one of the static or instance Task.Wait methods, and you handle them by enclosing the call in a ```try/catch``` statement. If a task is the parent of attached child tasks, or if you are waiting on multiple tasks, multiple exceptions could be thrown.

This example shows how to propagate exceptions back to the calling thread.

Even if only one exception is thrown, it is still wrapped in an `AggregateException` exception, as the following example shows.

```csharp
public static partial class Program
{
    public static void HandleThree()
    {
        var task = Task.Run(
            () => throw new CustomException("This exception is expected!"));

        try
        {
            task.Wait();
        }
        catch (AggregateException ae)
        {
            foreach (var ex in ae.InnerExceptions)
            {
                // Handle the custom exception.
                if (ex is CustomException)
                {
                    Console.WriteLine(ex.Message);
                }
                // Rethrow any other exception.
                else
                {
                    throw ex;
                }
            }
        }
    }
}
// The example displays the following output:
//        This exception is expected!
```

You could avoid an unhandled exception by just catching the `AggregateException` and not observing any of the inner exceptions. However, we recommend that you do not do this because it is analogous to catching the base Exception type in non-parallel scenarios. To catch an exception without taking specific actions to recover from it can leave your program in an indeterminate state.

The following example shows how to call the Task.Wait method to wait for a task's completion.

```csharp
public static partial class Program
{
    public static void HandleFour()
    {
        var task = Task.Run(
            () => throw new CustomException("This exception is expected!"));

        while (!task.IsCompleted) { }

        if (task.Status == TaskStatus.Faulted)
        {
            foreach (var ex in task.Exception?.InnerExceptions ?? new(Array.Empty<Exception>()))
            {
                // Handle the custom exception.
                if (ex is CustomException)
                {
                    Console.WriteLine(ex.Message);
                }
                // Rethrow any other exception.
                else
                {
                    throw ex;
                }
            }
        }
    }
}
// The example displays the following output:
//        This exception is expected!
```

> Caution
The preceding example code includes a while loop that polls the task's `Task.IsCompleted` property to determine when the task has completed. This should never be done in production code as it is very inefficient.

If you do not wait on a task that propagates an exception, or access its Exception property, the exception is escalated according to the .NET exception policy when the task is garbage-collected.

When exceptions are allowed to bubble up back to the joining thread, it is possible that a task may continue to process some items after the exception is raised.

> Note
When "Just My Code" is enabled, Visual Studio in some cases will break on the line that throws the exception and display an error message that says "exception not handled by user code." This error is benign. You can press F5 to continue and see the exception-handling behavior that is demonstrated in these examples. To prevent Visual Studio from breaking on the first error, just uncheck the Enable Just My Code checkbox under Tools, Options, Debugging, General.

## Attached child tasks and nested AggregateExceptions

In this article, I'm going to show you how to avoid having to iterate over nested `AggregateException` exceptions.

```csharp
public static partial class Program
{
    public static void FlattenTwo()
    {
        var task = Task.Factory.StartNew(() =>
        {
            var child = Task.Factory.StartNew(() =>
            {
                var grandChild = Task.Factory.StartNew(() =>
                {
                    // This exception is nested inside three AggregateExceptions.
                    throw new CustomException("Attached child2 faulted.");
                }, TaskCreationOptions.AttachedToParent);

                // This exception is nested inside two AggregateExceptions.
                throw new CustomException("Attached child1 faulted.");
            }, TaskCreationOptions.AttachedToParent);
        });

        try
        {
            task.Wait();
        }
        catch (AggregateException ae)
        {
            foreach (var ex in ae.Flatten().InnerExceptions)
            {
                if (ex is CustomException)
                {
                    Console.WriteLine(ex.Message);
                }
                else
                {
                    throw;
                }
            }
        }
    }
}
// The example displays the following output:
//    Attached child1 faulted.
//    Attached child2 faulted.
```

You can use the `AggregateException.Flatten` method to rethrow the inner exceptions from multiple AggregateException instances thrown by multiple tasks in a single AggregateException instance.

```csharp
public static partial class Program
{
    public static void TaskExceptionTwo()
    {
        try
        {
            ExecuteTasks();
        }
        catch (AggregateException ae)
        {
            foreach (var e in ae.InnerExceptions)
            {
                Console.WriteLine(
                    "{0}:\n   {1}", e.GetType().Name, e.Message);
            }
        }
    }

    static void ExecuteTasks()
    {
        // Assume this is a user-entered String.
        string path = @"C:\";
        List<Task> tasks = new();

        tasks.Add(Task.Run(() =>
        {
            // This should throw an UnauthorizedAccessException.
            return Directory.GetFiles(
                path, "*.txt",
                SearchOption.AllDirectories);
        }));

        tasks.Add(Task.Run(() =>
        {
            if (path == @"C:\")
            {
                throw new ArgumentException(
                    "The system root is not a valid path.");
            }
            return new string[] { ".txt", ".dll", ".exe", ".bin", ".dat" };
        }));

        tasks.Add(Task.Run(() =>
        {
            throw new NotImplementedException(
                "This operation has not been implemented.");
        }));

        try
        {
            Task.WaitAll(tasks.ToArray());
        }
        catch (AggregateException ae)
        {
            throw ae.Flatten();
        }
    }
}
// The example displays the following output:
//       UnauthorizedAccessException:
//          Access to the path 'C:\Documents and Settings' is denied.
//       ArgumentException:
//          The system root is not a valid path.
//       NotImplementedException:
//          This operation has not been implemented.
```

## Exceptions from detached child tasks

The topmost parent can manually rethrow an exception from a detached child to cause it to be wrapped in an AggregateException and propagated back to the calling thread.

```csharp
public static partial class Program
{
    public static void DetachedTwo()
    {
        var task = Task.Run(() =>
        {
            var nestedTask = Task.Run(
                () => throw new CustomException("Detached child task faulted."));

            // Here the exception will be escalated back to the calling thread.
            // We could use try/catch here to prevent that.
            nestedTask.Wait();
        });

        try
        {
            task.Wait();
        }
        catch (AggregateException ae)
        {
            foreach (var e in ae.Flatten().InnerExceptions)
            {
                if (e is CustomException)
                {
                    Console.WriteLine(e.Message);
                }
            }
        }
    }
}
// The example displays the following output:
//    Detached child task faulted.
```

Even if you use a continuation to observe an exception in a child task, the exception still must be observed by the parent task.

## Exceptions that indicate cooperative cancellation

The following example shows how to propagate a taskCanceledException if the calling thread is not waiting on the task.

```csharp
var tokenSource = new CancellationTokenSource();
var token = tokenSource.Token;
var task = Task.Factory.StartNew(() =>
{
    CancellationToken ct = token;
    while (someCondition)
    {
        // Do some work...
        Thread.SpinWait(50_000);
        ct.ThrowIfCancellationRequested();
    }
},
token);

// No waiting required.
tokenSource.Dispose();
```

## Using the handle method to filter inner exceptions

You can use the `AggregateException.Handle` method to filter out exceptions that you can treat as "handled" without using any further logic. In the user delegate that is supplied to the `AggregateException.Handle(Func<Exception,Boolean>)` method, you can examine the exception type, its Message property, or any other information about it that will let you determine whether it is benign. Any exceptions for which the delegate returns ```false``` are rethrown in a new AggregateException instance immediately after the `AggregateException.Handle` method returns.

The following example is functionally equivalent to the first example in this topic, which examines each exception in the `AggregateException.InnerExceptions` collection.  Instead, this exception handler calls the `AggregateException.Handle` method object for each exception, and only rethrows exceptions that are not ```CustomException``` instances.

```csharp
public static partial class Program
{
    public static void HandleMethodThree()
    {
        var task = Task.Run(
            () => throw new CustomException("This exception is expected!"));

        try
        {
            task.Wait();
        }
        catch (AggregateException ae)
        {
            // Call the Handle method to handle the custom exception,
            // otherwise rethrow the exception.
            ae.Handle(ex =>
            {
                if (ex is CustomException)
                {
                    Console.WriteLine(ex.Message);
                }
                return ex is CustomException;
            });
        }
    }
}
// The example displays the following output:
//        This exception is expected!
```

The following is a more complete example that uses the `AggregateException.Handle` method to provide special handling for an `UnauthorizedAccessException` exception when enumerating files.

```csharp
public static partial class Program
{
    public static void TaskException()
    {
        // This should throw an UnauthorizedAccessException.
        try
        {
            if (GetAllFiles(@"C:\") is { Length: > 0 } files)
            {
                foreach (var file in files)
                {
                    Console.WriteLine(file);
                }
            }
        }
        catch (AggregateException ae)
        {
            foreach (var ex in ae.InnerExceptions)
            {
                Console.WriteLine(
                    "{0}: {1}", ex.GetType().Name, ex.Message);
            }
        }
        Console.WriteLine();

        // This should throw an ArgumentException.
        try
        {
            foreach (var s in GetAllFiles(""))
            {
                Console.WriteLine(s);
            }
        }
        catch (AggregateException ae)
        {
            foreach (var ex in ae.InnerExceptions)
                Console.WriteLine(
                    "{0}: {1}", ex.GetType().Name, ex.Message);
        }
    }

    static string[] GetAllFiles(string path)
    {
        var task1 =
            Task.Run(() => Directory.GetFiles(
                path, "*.txt",
                SearchOption.AllDirectories));

        try
        {
            return task1.Result;
        }
        catch (AggregateException ae)
        {
            ae.Handle(x =>
            {
                // Handle an UnauthorizedAccessException
                if (x is UnauthorizedAccessException)
                {
                    Console.WriteLine(
                        "You do not have permission to access all folders in this path.");
                    Console.WriteLine(
                        "See your network administrator or try another path.");
                }
                return x is UnauthorizedAccessException;
            });
            return Array.Empty<string>();
        }
    }
}
// The example displays the following output:
//       You do not have permission to access all folders in this path.
//       See your network administrator or try another path.
//
//       ArgumentException: The path is not of a legal form.
```

## Observing exceptions by using the Task.Exception property

The Exception property can be used to find out which exceptions caused a task to complete in the `TaskStatus.Faulted` state.

```csharp
public static partial class Program
{
    public static void ExceptionPropagationTwo()
    {
        _ = Task.Run(
            () => throw new CustomException("task1 faulted."))
            .ContinueWith(_ =>
            {
                if (_.Exception?.InnerException is { } inner)
                {
                    Console.WriteLine("{0}: {1}",
                        inner.GetType().Name,
                        inner.Message);
                }
            }, 
            TaskContinuationOptions.OnlyOnFaulted);
        
        Thread.Sleep(500);
    }
}
// The example displays output like the following:
//        CustomException: task1 faulted.
```

When an exception is thrown, an exception continuation delegate is called.

- ```await task```

- `task.Wait()`

- ```task.Result```

- `task.GetAwaiter().GetResult()`

Use a ```try-catch``` statement to handle and observe thrown exceptions. Alternatively, observe the exception by accessing the Task.Exception property.

> Important
The AggregateException cannot be explicitly caught when using the following expressions:

 - ```await task```

 - `task.GetAwaiter().GetResult()`

## UnobservedTaskException event

In this article, I'll show you how to handle unobservedTaskException events.

## See also

- Task Parallel Library (TPL)

Ref: [Exception handling (Task Parallel Library)](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/exception-handling-task-parallel-library)