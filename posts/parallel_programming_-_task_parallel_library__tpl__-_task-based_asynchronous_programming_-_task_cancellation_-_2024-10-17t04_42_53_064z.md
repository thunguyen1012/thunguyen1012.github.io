---
title: Parallel programming - Task Parallel Library (TPL) - Task-based asynchronous programming - Task cancellation
published: true
date: 2024-10-17 04:42:53
tags: Summary, .Net, AdvancedProgramming
description: The System.Threading.Tasks.Task and System.Threading.Tasks.Task<TResult> classes support cancellation by using cancellation tokens. For more information, see Cancellation in Managed Threads. In the Task classes, cancellation involves cooperation between the user delegate, which represents a cancelable operation, and the code that requested the cancellation. A successful cancellation involves the requesting code calling the CancellationTokenSource.Cancel method and the user delegate terminating the operation in a timely manner. You can terminate the operation by using one of these options:
image:
---

## In this article

You can cancel operations in the `System.Tasks.Tasks` class.

- By returning from the delegate. In many scenarios, this option is sufficient. However, a task instance that's canceled in this way transitions to the `TaskStatus.RanToCompletion` state, not to the `TaskStatus.Canceled` state.

- By throwing an `OperationCanceledException` and passing it the token on which cancellation was requested. The preferred way to perform is to use the `ThrowIfCancellationRequested` method. A task that's canceled in this way transitions to the Canceled state, which the calling code can use to verify that the task responded to its cancellation request.

The following example shows the basic pattern for task cancellation that throws the exception:

> Note
The token is passed to the user delegate and the task instance.

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

class Program
{
    static async Task Main()
    {
        var tokenSource2 = new CancellationTokenSource();
        CancellationToken ct = tokenSource2.Token;

        var task = Task.Run(() =>
        {
            // Were we already canceled?
            ct.ThrowIfCancellationRequested();

            bool moreToDo = true;
            while (moreToDo)
            {
                // Poll on this property if you have to do
                // other cleanup before throwing.
                if (ct.IsCancellationRequested)
                {
                    // Clean up here, then...
                    ct.ThrowIfCancellationRequested();
                }
            }
        }, tokenSource2.Token); // Pass same token to Task.Run.

        tokenSource2.Cancel();

        // Just continue on this thread, or await with try-catch:
        try
        {
            await task;
        }
        catch (OperationCanceledException e)
        {
            Console.WriteLine($"{nameof(OperationCanceledException)} thrown with message: {e.Message}");
        }
        finally
        {
            tokenSource2.Dispose();
        }

        Console.ReadKey();
    }
}
```

For a complete example, see How to: Cancel a Task and Its Children.

When a task instance observes an `OperationCanceledException` thrown by the user code, it compares the exception's token to its associated token (the one that was passed to the API that created the Task). If the tokens are same and the token's `IsCancellationRequested` property returns ```true```, the task interprets this as acknowledging cancellation and transitions to the Canceled state. If you don't use a Wait or WaitAll method to wait for the task, then the task just sets its status to Canceled.

If you're waiting on a Task that transitions to the Canceled state, a `System.Threading.Tasks.TaskCanceledException` exception (wrapped in an AggregateException exception) is thrown. This exception indicates successful cancellation instead of a faulty situation. Therefore, the task's Exception property returns ```null```.

If the token's `IsCancellationRequested` property returns ```false``` or if the exception's token doesn't match the Task's token, the `OperationCanceledException` is treated like a normal exception, causing the Task to transition to the Faulted state. The presence of other exceptions will also cause the Task to transition to the Faulted state. You can get the status of the completed task in the Status property.

It's possible that a task might continue to process some items after cancellation is requested.

## See also

- Cancellation in Managed Threads

- How to: Cancel a Task and Its Children

Ref: [Task cancellation](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/task-cancellation)