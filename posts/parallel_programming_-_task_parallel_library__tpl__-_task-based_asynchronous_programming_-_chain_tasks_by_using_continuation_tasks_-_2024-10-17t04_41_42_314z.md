---
title: Parallel programming - Task Parallel Library (TPL) - Task-based asynchronous programming - Chain tasks by using continuation tasks
published: true
date: 2024-10-17 04:41:42
tags: Summary, .Net, AdvancedProgramming
description: In asynchronous programming, it's common for one asynchronous operation to invoke a second operation on completion. Continuations allow descendant operations to consume the results of the first operation. Traditionally, continuations have been done by using callback methods. In the Task Parallel Library (TPL), the same functionality is provided by continuation tasks. A continuation task (also known just as a continuation) is an asynchronous task that's invoked by another task, known as the antecedent, when the antecedent finishes.
image:
---

## In this article

In asynchronous programming, it's common for one asynchronous operation to invoke a second operation on completion. Continuations allow descendant operations to consume the results of the first operation. Traditionally, continuations have been done by using callback methods. In the Task Parallel Library (TPL), the same functionality is provided by continuation tasks. A continuation task (also known just as a continuation) is an asynchronous task that's invoked by another task, known as the antecedent, when the antecedent finishes.

Continuations are relatively easy to use but are nevertheless powerful and flexible. For example, you can:

- Pass data from the antecedent to the continuation.

- Specify the precise conditions under which the continuation will be invoked or not invoked.

- Cancel a continuation either before it starts or cooperatively as it's running.

- Provide hints about how the continuation should be scheduled.

- Invoke multiple continuations from the same antecedent.

- Invoke one continuation when all or any one of multiple antecedents complete.

- Chain continuations one after another to any arbitrary length.

- Use a continuation to handle exceptions thrown by the antecedent.

## About continuations

A continuation is a task that's created in the WaitingForActivation state. It's activated automatically when its antecedent task or tasks complete. Calling Task.Start on a continuation in user code throws an System.InvalidOperationException exception.

A continuation is itself a Task and doesn't block the thread on which it's started. Call the Task.Wait method to block until the continuation task finishes.

## Create a continuation for a single antecedent

You create a continuation that executes when its antecedent has completed by calling the Task.ContinueWith method. The following example shows the basic pattern (for clarity, exception handling is omitted). It executes an antecedent task taskA that returns a DayOfWeek object that indicates the name of the current day of the week. When taskA completes, the antecedent represents its results in the ```ContinueWith``` continuation method. The result of the antecedent task is written to the console.

```csharp
using System;
using System.Threading.Tasks;

public class SimpleExample
{
    public static async Task Main()
    {
        // Declare, assign, and start the antecedent task.
        Task<DayOfWeek> taskA = Task.Run(() => DateTime.Today.DayOfWeek);

        // Execute the continuation when the antecedent finishes.
        await taskA.ContinueWith(antecedent => Console.WriteLine($"Today is {antecedent.Result}."));
    }
}
// The example displays the following output:
//       Today is Monday.
```

## Create a continuation for multiple antecedents

You can also create a continuation that will run when any or all of a group of tasks have completed. To execute a continuation when all antecedent tasks have completed, you can call the static (Shared in Visual Basic) `Task.WhenAll` method or the instance ``TaskFactory.ContinueWhenAll`` method. To execute a continuation when any of the antecedent tasks have completed, you can call the static (Shared in Visual Basic) `Task.WhenAny` method or the instance `TaskFactory.ContinueWhenAny` method.

The following examples show how to call the following methods to retrieve the returned `TaskTResult>`.

The following example calls the `Task.WhenAll(IEnumerable<Task>)` method to create a continuation task that reflects the results of its 10 antecedent tasks. Each antecedent task squares an index value that ranges from one to 10. If the antecedents complete successfully (their `Task.Status` property is `TaskStatus.RanToCompletion`), the `Task<TResult>.Result` property of the continuation is an array of the `Task<TResult>.Result` values returned by each antecedent. The example adds them to compute the sum of squares for all numbers between one and 10:

```csharp
using System.Collections.Generic;
using System;
using System.Threading.Tasks;

public class WhenAllExample
{
    public static async Task Main()
    {
        var tasks = new List<Task<int>>();
        for (int ctr = 1; ctr <= 10; ctr++)
        {
            int baseValue = ctr;
            tasks.Add(Task.Factory.StartNew(b => (int)b! * (int)b, baseValue));
        }

        var results = await Task.WhenAll(tasks);

        int sum = 0;
        for (int ctr = 0; ctr <= results.Length - 1; ctr++)
        {
            var result = results[ctr];
            Console.Write($"{result} {((ctr == results.Length - 1) ? "=" : "+")} ");
            sum += result;
        }

        Console.WriteLine(sum);
    }
}
// The example displays the similar output:
//    1 + 4 + 9 + 16 + 25 + 36 + 49 + 64 + 81 + 100 = 385
```

## Continuation options

When you create a single-task continuation, you can use a ```ContinueWith``` overload that takes a `System.Threading.Tasks.TaskContinuationOptions` enumeration value to specify the conditions under which the continuation starts. For example, you can specify that the continuation is to run only if the antecedent completes successfully, or only if it completes in a faulted state. If the condition isn't ```true``` when the antecedent is ready to invoke the continuation, the continuation transitions directly to the TaskStatus.Canceled state and can't be started later.

Many multi-task continuation methods, such as overloads of the `TaskFactory.ContinueWhenAll` method, also include a `System.Threading.Tasks.TaskContinuationOptions` parameter. However, only a subset of all `System.Threading.Tasks.TaskContinuationOptions` enumeration members is valid. You can specify `System.Threading.Tasks.TaskContinuationOptions` values that have counterparts in the `System.Threading.Tasks.TaskCreationOptions` enumeration, such as `TaskContinuationOptions.AttachedToParent`, `TaskContinuationOptions.LongRunning`, and `TaskContinuationOptions.PreferFairness`. If you specify any of the ```NotOn``` or ```OnlyOn``` options with a multi-task continuation, an `ArgumentOutOfRangeException` exception will be thrown at run time.

For more information on task continuation options, see the `TaskContinuationOptions` article.

## Pass data to a continuation

The Task.ContinueWith method passes a reference to the antecedent as an argument to the user delegate of the continuation. If the antecedent is a System.Threading.Tasks.`Task<TResult>` object, and the task ran until it was completed, then the continuation can access the `Task<TResult>.Result` property of the task.

The `Task<TResult>.Result` property blocks until the task has completed. However, if the task was canceled or faulted, attempting to access the Result property throws an AggregateException exception. You can avoid this problem by using the `OnlyOnRanToCompletion` option, as shown in the following example:

```csharp
using System;
using System.Threading.Tasks;

public class ResultExample
{
    public static async Task Main()
    {
       var task = Task.Run(
           () =>
           {
                DateTime date = DateTime.Now;
                return date.Hour > 17
                    ? "evening"
                    : date.Hour > 12
                        ? "afternoon"
                        : "morning";
            });
        
        await task.ContinueWith(
            antecedent =>
            {
                Console.WriteLine($"Good {antecedent.Result}!");
                Console.WriteLine($"And how are you this fine {antecedent.Result}?");
            }, TaskContinuationOptions.OnlyOnRanToCompletion);
   }
}
// The example displays the similar output:
//       Good afternoon!
//       And how are you this fine afternoon?
```

If you want the continuation to run even if the antecedent didn't run to successful completion, you must guard against the exception. One approach is to test the Task.Status property of the antecedent, and only attempt to access the Result property if the status isn't Faulted or Canceled. You can also examine the Exception property of the antecedent. For more information, see Exception Handling. The following example modifies the preceding example to access antecedent's `Task<TResult>.Result` property only if its status is `TaskStatus.RanToCompletion`:

```csharp
using System;
using System.Threading.Tasks;

public class ResultTwoExample
{
    public static async Task Main() =>
        await Task.Run(
            () =>
            {
                DateTime date = DateTime.Now;
                return date.Hour > 17
                   ? "evening"
                   : date.Hour > 12
                       ? "afternoon"
                       : "morning";
            })
            .ContinueWith(
                antecedent =>
                {
                    if (antecedent.Status == TaskStatus.RanToCompletion)
                    {
                        Console.WriteLine($"Good {antecedent.Result}!");
                        Console.WriteLine($"And how are you this fine {antecedent.Result}?");
                    }
                    else if (antecedent.Status == TaskStatus.Faulted)
                    {
                        Console.WriteLine(antecedent.Exception!.GetBaseException().Message);
                    }
                });
}
// The example displays output like the following:
//       Good afternoon!
//       And how are you this fine afternoon?
```

## Cancel a continuation

The `Task.Status` property of a continuation is set to `TaskStatus.Canceled` in the following situations:

- It throws an `OperationCanceledException` exception in response to a cancellation request. As with any task, if the exception contains the same token that was passed to the continuation, it's treated as an acknowledgment of cooperative cancellation.

- The continuation is passed a `System.Threading.CancellationToken` whose IsCancellationRequested property is ```true```. In this case, the continuation doesn't start, and it transitions to the `TaskStatus.Canceled` state.

- The continuation never runs because the condition set by its `TaskContinuationOptions` argument wasn't met. For example, if an antecedent goes into a `TaskStatus.Faulted` state, its continuation that was passed the `TaskContinuationOptions.NotOnFaulted` option won't run but will transition to the Canceled state.

If a task and its continuation represent two parts of the same logical operation, you can pass the same cancellation token to both tasks, as shown in the following example. It consists of an antecedent that generates a list of integers that are divisible by 33, which it passes to the continuation. The continuation in turn displays the list. Both the antecedent and the continuation pause regularly for random intervals. In addition, a System.Threading.Timer object is used to execute the ```Elapsed``` method after a five-second timeout interval. This example calls the `CancellationTokenSource.Cancel` method, which causes the currently executing task to call the `CancellationToken.ThrowIfCancellationRequested` method. Whether the `CancellationTokenSource.Cancel` method is called when the antecedent or its continuation is executing depends on the duration of the randomly generated pauses. If the antecedent is canceled, the continuation won't start. If the antecedent isn't canceled, the token can still be used to cancel the continuation.

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

public class CancellationExample
{
    static readonly Random s_random = new Random((int)DateTime.Now.Ticks);

    public static async Task Main()
    {
        using var cts = new CancellationTokenSource();
        CancellationToken token = cts.Token;
        var timer = new Timer(Elapsed, cts, 5000, Timeout.Infinite);

        var task = Task.Run(
            async () =>
            {
                var product33 = new List<int>();
                for (int index = 1; index < short.MaxValue; index++)
                {
                    if (token.IsCancellationRequested)
                    {
                        Console.WriteLine("\nCancellation requested in antecedent...\n");
                        token.ThrowIfCancellationRequested();
                    }
                    if (index % 2000 == 0)
                    {
                        int delay = s_random.Next(16, 501);
                        await Task.Delay(delay);
                    }
                    if (index % 33 == 0)
                    {
                        product33.Add(index);
                    }
                }

                return product33.ToArray();
            }, token);

        Task<double> continuation = task.ContinueWith(
            async antecedent =>
            {
                Console.WriteLine("Multiples of 33:\n");
                int[] array = antecedent.Result;
                for (int index = 0; index < array.Length; index++)
                {
                    if (token.IsCancellationRequested)
                    {
                        Console.WriteLine("\nCancellation requested in continuation...\n");
                        token.ThrowIfCancellationRequested();
                    }
                    if (index % 100 == 0)
                    {
                        int delay = s_random.Next(16, 251);
                        await Task.Delay(delay);
                    }

                    Console.Write($"{array[index]:N0}{(index != array.Length - 1 ? ", " : "")}");

                    if (Console.CursorLeft >= 74)
                    {
                        Console.WriteLine();
                    }
                }
                Console.WriteLine();
                return array.Average();
            }, token).Unwrap();

        try
        {
            await task;
            double result = await continuation;
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }

        Console.WriteLine("\nAntecedent Status: {0}", task.Status);
        Console.WriteLine("Continuation Status: {0}", continuation.Status);
    }

    static void Elapsed(object? state)
    {
        if (state is CancellationTokenSource cts)
        {
            cts.Cancel();
            Console.WriteLine("\nCancellation request issued...\n");
        }
    }
}
// The example displays the similar output:
//     Multiples of 33:
//     
//     33, 66, 99, 132, 165, 198, 231, 264, 297, 330, 363, 396, 429, 462, 495, 528,
//     561, 594, 627, 660, 693, 726, 759, 792, 825, 858, 891, 924, 957, 990, 1,023,
//     1,056, 1,089, 1,122, 1,155, 1,188, 1,221, 1,254, 1,287, 1,320, 1,353, 1,386,
//     1,419, 1,452, 1,485, 1,518, 1,551, 1,584, 1,617, 1,650, 1,683, 1,716, 1,749,
//     1,782, 1,815, 1,848, 1,881, 1,914, 1,947, 1,980, 2,013, 2,046, 2,079, 2,112,
//     2,145, 2,178, 2,211, 2,244, 2,277, 2,310, 2,343, 2,376, 2,409, 2,442, 2,475,
//     2,508, 2,541, 2,574, 2,607, 2,640, 2,673, 2,706, 2,739, 2,772, 2,805, 2,838,
//     2,871, 2,904, 2,937, 2,970, 3,003, 3,036, 3,069, 3,102, 3,135, 3,168, 3,201,
//     3,234, 3,267, 3,300, 3,333, 3,366, 3,399, 3,432, 3,465, 3,498, 3,531, 3,564,
//     3,597, 3,630, 3,663, 3,696, 3,729, 3,762, 3,795, 3,828, 3,861, 3,894, 3,927,
//     3,960, 3,993, 4,026, 4,059, 4,092, 4,125, 4,158, 4,191, 4,224, 4,257, 4,290,
//     4,323, 4,356, 4,389, 4,422, 4,455, 4,488, 4,521, 4,554, 4,587, 4,620, 4,653,
//     4,686, 4,719, 4,752, 4,785, 4,818, 4,851, 4,884, 4,917, 4,950, 4,983, 5,016,
//     5,049, 5,082, 5,115, 5,148, 5,181, 5,214, 5,247, 5,280, 5,313, 5,346, 5,379,
//     5,412, 5,445, 5,478, 5,511, 5,544, 5,577, 5,610, 5,643, 5,676, 5,709, 5,742,
//     Cancellation request issued...
//
//     5,775,
//     Cancellation requested in continuation...
//       
//     The operation was canceled.
//       
//     Antecedent Status: RanToCompletion
//     Continuation Status: Canceled
```

You can also prevent a continuation from executing if its antecedent is canceled without providing the continuation a cancellation token. Provide the token by specifying the `TaskContinuationOptions.NotOnCanceled` option when you create the continuation, as shown in the following example:

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

public class CancellationTwoExample
{
    public static async Task Main()
    {
        using var cts = new CancellationTokenSource();
        CancellationToken token = cts.Token;
        cts.Cancel();

        var task = Task.FromCanceled(token);
        Task continuation =
            task.ContinueWith(
                antecedent => Console.WriteLine("The continuation is running."),
                TaskContinuationOptions.NotOnCanceled);

        try
        {
            await task;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"{ex.GetType().Name}: {ex.Message}");
            Console.WriteLine();
        }

        Console.WriteLine($"Task {task.Id}: {task.Status:G}");
        Console.WriteLine($"Task {continuation.Id}: {continuation.Status:G}");
    }
}
// The example displays the similar output:
//       TaskCanceledException: A task was canceled.
//
//       Task 1: Canceled
//       Task 2: Canceled
```

After a continuation goes into the Canceled state, it might affect continuations that follow, depending on the `TaskContinuationOptions` that were specified for those continuations.

Continuations that are disposed won't start.

## Continuations and child tasks

A continuation doesn't run until the antecedent and all of its attached child tasks have completed. A continuation doesn't wait for detached child tasks to finish. The following two examples illustrate child tasks that are attached to and detached from an antecedent that creates a continuation. In the following example, the continuation runs only after all child tasks have completed, and multiple runs of the example produces identical output each time. The example launches the antecedent by calling the `TaskFactory.StartNew` method because by default the `Task.Run` method creates a parent task whose default task creation option is `TaskCreationOptions.DenyChildAttach`.

```csharp
using System;
using System.Threading.Tasks;

public class AttachedExample
{
    public static async Task Main()
    {
        await Task.Factory
                  .StartNew(
            () =>
            {
                Console.WriteLine($"Running antecedent task {Task.CurrentId}...");
                Console.WriteLine("Launching attached child tasks...");
                for (int ctr = 1; ctr <= 5; ctr++)
                {
                    int index = ctr;
                    Task.Factory.StartNew(async value =>
                    {
                        Console.WriteLine($"   Attached child task #{value} running");
                        await Task.Delay(1000);
                    }, index, TaskCreationOptions.AttachedToParent);
                }
                Console.WriteLine("Finished launching attached child tasks...");
            }).ContinueWith(
                antecedent =>
                    Console.WriteLine($"Executing continuation of Task {antecedent.Id}"));
    }
}
// The example displays the similar output:
//     Running antecedent task 1...
//     Launching attached child tasks...
//     Finished launching attached child tasks...
//        Attached child task #1 running
//        Attached child task #5 running
//        Attached child task #3 running
//        Attached child task #2 running
//        Attached child task #4 running
//     Executing continuation of Task 1
```

If child tasks are detached from the antecedent, however, the continuation runs as soon as the antecedent has terminated, regardless of the state of the child tasks. As a result, multiple runs of the following example can produce variable output that depends on how the task scheduler handled each child task:

```csharp
using System;
using System.Threading.Tasks;

public class DetachedExample
{
    public static async Task Main()
    {
        Task task =
            Task.Factory.StartNew(
                () =>
                {
                    Console.WriteLine($"Running antecedent task {Task.CurrentId}...");
                    Console.WriteLine("Launching attached child tasks...");
                    for (int ctr = 1; ctr <= 5; ctr++)
                    {
                        int index = ctr;
                        Task.Factory.StartNew(
                            async value =>
                            {
                                Console.WriteLine($"   Attached child task #{value} running");
                                await Task.Delay(1000);
                            }, index);
                    }
                    Console.WriteLine("Finished launching detached child tasks...");
                }, TaskCreationOptions.DenyChildAttach);

        Task continuation =
            task.ContinueWith(
                antecedent =>
                    Console.WriteLine($"Executing continuation of Task {antecedent.Id}"));

        await continuation;

        Console.ReadLine();
    }
}
// The example displays the similar output:
//     Running antecedent task 1...
//     Launching attached child tasks...
//     Finished launching detached child tasks...
//     Executing continuation of Task 1
//        Attached child task #1 running
//        Attached child task #5 running
//        Attached child task #2 running
//        Attached child task #3 running
//        Attached child task #4 running
```

The final status of the antecedent task depends on the final status of any attached child tasks. The status of detached child tasks doesn't affect the parent. For more information, see Attached and Detached Child Tasks.

## Associate state with continuations

You can associate arbitrary state with a task continuation. The ```ContinueWith``` method provides overloaded versions that each take an Object value that represents the state of the continuation. You can later access this state object by using the `Task.AsyncState` property. This state object is ```null``` if you don't provide a value.

Continuation state is useful when you convert existing code that uses the Asynchronous Programming Model (APM) to use the TPL. In the APM, you can provide object state in the `BeginMethod` method and later you can use the `IAsyncResult.AsyncState` property to access that state. To preserve this state when you convert a code that uses the APM to use the TPL, you use the ```ContinueWith``` method.

Continuation state can also be useful when you work with Task objects in the Visual Studio debugger. For example, in the Parallel Tasks window, the Task column displays the string representation of the state object for each task. For more information about the Parallel Tasks window, see Using the Tasks Window.

The following example shows how to use continuation state. It creates a chain of continuation tasks. Each task provides the current time, a DateTime object, for the state parameter of the ```ContinueWith``` method. Each DateTime object represents the time at which the continuation task is created. Each task produces as its result a second DateTime object that represents the time at which the task finishes. After all tasks finish, this example displays the creation time and the time at which each continuation task finishes.

```csharp
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

class ContinuationStateExample
{
    static DateTime DoWork()
    {
        Thread.Sleep(2000);

        return DateTime.Now;
    }

    static async Task Main()
    {
        Task<DateTime> task = Task.Run(() => DoWork());

        var continuations = new List<Task<DateTime>>();
        for (int i = 0; i < 5; i++)
        {
            task = task.ContinueWith((antecedent, _) => DoWork(), DateTime.Now);
            continuations.Add(task);
        }

        await task;

        foreach (Task<DateTime> continuation in continuations)
        {
            DateTime start = (DateTime)continuation.AsyncState!;
            DateTime end = continuation.Result;

            Console.WriteLine($"Task was created at {start.TimeOfDay} and finished at {end.TimeOfDay}.");
        }

        Console.ReadLine();
    }
}
// The example displays the similar output:
//     Task was created at 10:56:21.1561762 and finished at 10:56:25.1672062.
//     Task was created at 10:56:21.1610677 and finished at 10:56:27.1707646.
//     Task was created at 10:56:21.1610677 and finished at 10:56:29.1743230.
//     Task was created at 10:56:21.1610677 and finished at 10:56:31.1779883.
//     Task was created at 10:56:21.1610677 and finished at 10:56:33.1837083.
```

## Continuations that return Task types

Sometimes you might need to chain a continuation that returns a Task type. These tasks are referred as nested tasks. When a parent task calls `Task<TResult>.ContinueWith` and provides a ```continuationFunction``` that's task-returning, you can call Unwrap to create a proxy task that represents the asynchronous operation of the `<Task<Task<T>>>`.

The following example shows how to use continuations that wrap additional task returning functions. Each continuation can be unwrapped, exposing the inner task that was wrapped.

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

public class UnwrapExample
{
    public static async Task Main()
    {
        Task<int> taskOne = RemoteIncrement(0);
        Console.WriteLine("Started RemoteIncrement(0)");

        Task<int> taskTwo = RemoteIncrement(4)
            .ContinueWith(t => RemoteIncrement(t.Result))
            .Unwrap().ContinueWith(t => RemoteIncrement(t.Result))
            .Unwrap().ContinueWith(t => RemoteIncrement(t.Result))
            .Unwrap();

        Console.WriteLine("Started RemoteIncrement(...(RemoteIncrement(RemoteIncrement(4))...)");

        try
        {
            await taskOne;
            Console.WriteLine("Finished RemoteIncrement(0)");

            await taskTwo;
            Console.WriteLine("Finished RemoteIncrement(...(RemoteIncrement(RemoteIncrement(4))...)");
        }
        catch (Exception e)
        {
            Console.WriteLine($"A task has thrown the following (unexpected) exception:\n{e}");
        }
    }

    static Task<int> RemoteIncrement(int number) =>
        Task<int>.Factory.StartNew(
            obj =>
            {
                Thread.Sleep(1000);

                int x = (int)(obj!);
                Console.WriteLine("Thread={0}, Next={1}", Thread.CurrentThread.ManagedThreadId, ++x);
                return x;
            },
            number);
}

// The example displays the similar output:
//     Started RemoteIncrement(0)
//     Started RemoteIncrement(...(RemoteIncrement(RemoteIncrement(4))...)
//     Thread=4, Next=1
//     Finished RemoteIncrement(0)
//     Thread=5, Next=5
//     Thread=6, Next=6
//     Thread=6, Next=7
//     Thread=6, Next=8
//     Finished RemoteIncrement(...(RemoteIncrement(RemoteIncrement(4))...)
```

For more information on using Unwrap, see How to: Unwrap a nested Task.

## Handle exceptions thrown from continuations

An antecedent-continuation relationship isn't a parent-child relationship. Exceptions thrown by continuations aren't propagated to the antecedent. Therefore, handle exceptions thrown by continuations as you would handle them in any other task, as follows:

- You can use the `Wait`, `WaitAll`, or `WaitAny` method, or its generic counterpart, to wait on the continuation. You can wait for an antecedent and its continuations in the same ```try``` statement, as shown in the following example:

```csharp
using System;
using System.Threading.Tasks;

public class ExceptionExample
{
    public static async Task Main()
    {
        Task<int> task = Task.Run(
            () =>
            {
                Console.WriteLine($"Executing task {Task.CurrentId}");
                return 54;
            });

        var continuation = task.ContinueWith(
            antecedent =>
            {
                Console.WriteLine($"Executing continuation task {Task.CurrentId}");
                Console.WriteLine($"Value from antecedent: {antecedent.Result}");

                throw new InvalidOperationException();
            });

        try
        {
            await task;
            await continuation;
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }
    }
}
// The example displays the similar output:
//       Executing task 1
//       Executing continuation task 2
//       Value from antecedent: 54
//       Operation is not valid due to the current state of the object.
```

- You can use a second continuation to observe the Exception property of the first continuation. In the following example, a task attempts to read from a non-existent file. The continuation then displays information about the exception in the antecedent task.

```csharp
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

public class ExceptionTwoExample
{
    public static async Task Main()
    {
        var task = Task.Run(
            () =>
            {
                string fileText = File.ReadAllText(@"C:\NonexistentFile.txt");
                return fileText;
            });

        Task continuation = task.ContinueWith(
            antecedent =>
            {
                var fileNotFound =
                    antecedent.Exception
                        ?.InnerExceptions
                        ?.FirstOrDefault(e => e is FileNotFoundException) as FileNotFoundException;

                if (fileNotFound != null)
                {
                    Console.WriteLine(fileNotFound.Message);
                }
            }, TaskContinuationOptions.OnlyOnFaulted);

        await continuation;

        Console.ReadLine();
    }
}
// The example displays the following output:
//        Could not find file 'C:\NonexistentFile.txt'.
```

Because it was run with the `TaskContinuationOptions.OnlyOnFaulted` option, the continuation executes only if an exception occurs in the antecedent. Therefore it can assume that the antecedent's Exception property isn't ```null```. If the continuation executes whether or not an exception is thrown in the antecedent, it must check whether the antecedent's Exception property isn't ```null``` before attempting to handle the exception, as the following code fragment shows:

```csharp
var fileNotFound =
    antecedent.Exception
        ?.InnerExceptions
        ?.FirstOrDefault(e => e is FileNotFoundException) as FileNotFoundException;

if (fileNotFound != null)
{
    Console.WriteLine(fileNotFound.Message);
}
```

For more information, see Exception Handling.

- If the continuation is an attached child task that was created by using the `TaskContinuationOptions.AttachedToParent` option, its exceptions will be propagated by the parent back to the calling thread, as is the case in any other attached child. For more information, see Attached and Detached Child Tasks.

## See also

- Task Parallel Library (TPL)

Ref: [Chaining tasks using continuation tasks](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/chaining-tasks-by-using-continuation-tasks)