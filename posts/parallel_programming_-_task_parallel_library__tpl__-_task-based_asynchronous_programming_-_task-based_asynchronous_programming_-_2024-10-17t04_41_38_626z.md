---
title: Parallel programming - Task Parallel Library (TPL) - Task-based asynchronous programming - Task-based asynchronous programming
published: true
date: 2024-10-17 04:41:38
tags: Summary, .Net, AdvancedProgramming
description: The Task Parallel Library (TPL) is based on the concept of a task, which represents an asynchronous operation. In some ways, a task resembles a thread or ThreadPool work item but at a higher level of abstraction. The term task parallelism refers to one or more independent tasks running concurrently. Tasks provide two primary benefits:
image:
---

## In this article

The goal of the Task Parallel Library (TPL) is to make it easier for software developers to create and maintain high-level tasks.

- More efficient and more scalable use of system resources.
Behind the scenes, tasks are queued to the ThreadPool, which has been enhanced with algorithms that determine and adjust to the number of threads. These algorithms provide load balancing to maximize throughput. This process makes tasks relatively lightweight, and you can create many of them to enable fine-grained parallelism.

- More programmatic control than is possible with a thread or work item.
Tasks and the framework built around them provide a rich set of APIs that support waiting, cancellation, continuations, robust exception handling, detailed status, custom scheduling, and more.

For both reasons, TPL is the preferred API for writing multi-threaded, asynchronous, and parallel code in .NET.

## Creating and running tasks implicitly

The Parallel.Invoke method provides a convenient way to run any number of arbitrary statements concurrently. Just pass in an Action delegate for each item of work. The easiest way to create these delegates is to use lambda expressions. The lambda expression can either call a named method or provide the code inline. The following example shows a basic Invoke call that creates and starts two tasks that run concurrently. The first task is represented by a lambda expression that calls a method named ```DoSomeWork```, and the second task is represented by a lambda expression that calls a method named ```DoSomeOtherWork```.

> Note
This documentation uses lambda expressions to define delegates in TPL. If you aren't familiar with lambda expressions in C# or Visual Basic, see Lambda Expressions in PLINQ and TPL.

```csharp
Parallel.Invoke(() => DoSomeWork(), () => DoSomeOtherWork());
```

> Note
The number of Task instances that are created behind the scenes by Invoke isn't necessarily equal to the number of delegates that are provided. The TPL might employ various optimizations, especially with large numbers of delegates.

For more information, see How to: Use Parallel.Invoke to Execute Parallel Operations.

For greater control over task execution or to return a value from the task, you must work with Task objects more explicitly.

## Creating and running tasks explicitly

The System.Tasks.Tasks

In this article, you will learn how to create a task and how to express the code that will execute it.

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

public class Lambda
{
   public static void Main()
   {
      Thread.CurrentThread.Name = "Main";

      // Create a task and supply a user delegate by using a lambda expression.
      Task taskA = new Task( () => Console.WriteLine("Hello from taskA."));
      // Start the task.
      taskA.Start();

      // Output a message from the calling thread.
      Console.WriteLine("Hello from thread '{0}'.",
                        Thread.CurrentThread.Name);
      taskA.Wait();
   }
}
// The example displays output as follows:
//       Hello from thread 'Main'.
//       Hello from taskA.
// or
//       Hello from taskA.
//       Hello from thread 'Main'.
```

You can use the `Task.Create` methods to create and start a task in one operation.

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Run;

public class Example
{
   public static void Main()
   {
      Thread.CurrentThread.Name = "Main";

      // Define and run the task.
      Task taskA = Task.Run( () => Console.WriteLine("Hello from taskA."));

      // Output a message from the calling thread.
      Console.WriteLine("Hello from thread '{0}'.",
                          Thread.CurrentThread.Name);
      taskA.Wait();
   }
}
// The example displays output as follows:
//       Hello from thread 'Main'.
//       Hello from taskA.
// or
//       Hello from taskA.
//       Hello from thread 'Main'.
```

You can also use the `TaskFactory.StartNew` method to create and start a task in one operation. As shown in the following example, you can use this method when:

- Creation and scheduling don't have to be separated and you require additional task creation options or the use of a specific scheduler.

- You need to pass additional state into the task that you can retrieve through its `Task.AsyncState` property.

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

namespace TaskIntro;

class CustomData
{
    public long CreationTime;
    public int Name;
    public int ThreadNum;
}

public class AsyncState
{
    public static void Main()
    {
        Task[] taskArray = new Task[10];
        for (int i = 0; i < taskArray.Length; i++)
        {
            taskArray[i] = Task.Factory.StartNew((Object obj) =>
            {
                CustomData data = obj as CustomData;
                if (data == null) return;

                data.ThreadNum = Thread.CurrentThread.ManagedThreadId;
            },
            new CustomData() { Name = i, CreationTime = DateTime.Now.Ticks });
        }
        Task.WaitAll(taskArray);
        foreach (var task in taskArray)
        {
            var data = task.AsyncState as CustomData;
            if (data != null)
                Console.WriteLine("Task #{0} created at {1}, ran on thread #{2}.",
                                  data.Name, data.CreationTime, data.ThreadNum);
        }
    }
}
// The example displays output like the following:
//     Task #0 created at 635116412924597583, ran on thread #3.
//     Task #1 created at 635116412924607584, ran on thread #4.
//     Task #2 created at 635116412924607584, ran on thread #4.
//     Task #3 created at 635116412924607584, ran on thread #4.
//     Task #4 created at 635116412924607584, ran on thread #3.
//     Task #5 created at 635116412924607584, ran on thread #3.
//     Task #6 created at 635116412924607584, ran on thread #4.
//     Task #7 created at 635116412924607584, ran on thread #4.
//     Task #8 created at 635116412924607584, ran on thread #3.
//     Task #9 created at 635116412924607584, ran on thread #4.
```

`Task` and `Task<TResult>` each expose a static Factory property that returns a default instance of TaskFactory, so that you can call the method as `Task.Factory.StartNew()`. Also, in the following example, because the tasks are of type `System.Threading.Tasks.Task<TResult>`, they each have a public `Task<TResult>.Result` property that contains the result of the computation. The tasks run asynchronously and might complete in any order. If the Result property is accessed before the computation finishes, the property blocks the calling thread until the value is available.

```csharp
using System;
using System.Threading.Tasks;

public class Result
{
   public static void Main()
   {
        Task<Double>[] taskArray = { Task<Double>.Factory.StartNew(() => DoComputation(1.0)),
                                     Task<Double>.Factory.StartNew(() => DoComputation(100.0)),
                                     Task<Double>.Factory.StartNew(() => DoComputation(1000.0)) };

        var results = new Double[taskArray.Length];
        Double sum = 0;

        for (int i = 0; i < taskArray.Length; i++) {
            results[i] = taskArray[i].Result;
            Console.Write("{0:N1} {1}", results[i],
                              i == taskArray.Length - 1 ? "= " : "+ ");
            sum += results[i];
        }
        Console.WriteLine("{0:N1}", sum);
   }

   private static Double DoComputation(Double start)
   {
      Double sum = 0;
      for (var value = start; value <= start + 10; value += .1)
         sum += value;

      return sum;
   }
}
// The example displays the following output:
//        606.0 + 10,605.0 + 100,495.0 = 111,706.0
```

For more information, see How to: Return a Value from a Task.

When you use a lambda expression to create a delegate, you have access to all the variables that are visible at that point in your source code. However, in some cases, most notably within loops, a lambda doesn't capture the variable as expected. It only captures the reference of the variable, not the value, as it mutates after each iteration. The following example illustrates the problem. It passes a loop counter to a lambda expression that instantiates a ```CustomData``` object and uses the loop counter as the object's identifier. As the output from the example shows, each ```CustomData``` object has an identical identifier.

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Example.Iterations;

class CustomData
{
   public long CreationTime;
   public int Name;
   public int ThreadNum;
}

public class IterationTwo
{
   public static void Main()
   {
      // Create the task object by using an Action(Of Object) to pass in the loop
      // counter. This produces an unexpected result.
      Task[] taskArray = new Task[10];
      for (int i = 0; i < taskArray.Length; i++) {
         taskArray[i] = Task.Factory.StartNew( (Object obj) => {
                                                 var data = new CustomData() {Name = i, CreationTime = DateTime.Now.Ticks};
                                                 data.ThreadNum = Thread.CurrentThread.ManagedThreadId;
                                                 Console.WriteLine("Task #{0} created at {1} on thread #{2}.",
                                                                   data.Name, data.CreationTime, data.ThreadNum);
                                               },
                                              i );
      }
      Task.WaitAll(taskArray);
   }
}
// The example displays output like the following:
//       Task #10 created at 635116418427727841 on thread #4.
//       Task #10 created at 635116418427737842 on thread #4.
//       Task #10 created at 635116418427737842 on thread #4.
//       Task #10 created at 635116418427737842 on thread #4.
//       Task #10 created at 635116418427737842 on thread #4.
//       Task #10 created at 635116418427737842 on thread #4.
//       Task #10 created at 635116418427727841 on thread #3.
//       Task #10 created at 635116418427747843 on thread #3.
//       Task #10 created at 635116418427747843 on thread #3.
//       Task #10 created at 635116418427737842 on thread #4.
```

You can access the value on each iteration by providing a state object to a task through its constructor. The following example modifies the previous example by using the loop counter when creating the ```CustomData``` object, which, in turn, is passed to the lambda expression. As the output from the example shows, each ```CustomData``` object now has a unique identifier based on the value of the loop counter at the time the object was instantiated.

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

class CustomData
{
   public long CreationTime;
   public int Name;
   public int ThreadNum;
}

public class IterationOne
{
   public static void Main()
   {
      // Create the task object by using an Action(Of Object) to pass in custom data
      // to the Task constructor. This is useful when you need to capture outer variables
      // from within a loop.
      Task[] taskArray = new Task[10];
      for (int i = 0; i < taskArray.Length; i++) {
         taskArray[i] = Task.Factory.StartNew( (Object obj ) => {
                                                  CustomData data = obj as CustomData;
                                                  if (data == null)
                                                     return;

                                                  data.ThreadNum = Thread.CurrentThread.ManagedThreadId;
                                                  Console.WriteLine("Task #{0} created at {1} on thread #{2}.",
                                                                   data.Name, data.CreationTime, data.ThreadNum);
                                               },
                                               new CustomData() {Name = i, CreationTime = DateTime.Now.Ticks} );
      }
      Task.WaitAll(taskArray);
   }
}
// The example displays output like the following:
//       Task #0 created at 635116412924597583 on thread #3.
//       Task #1 created at 635116412924607584 on thread #4.
//       Task #3 created at 635116412924607584 on thread #4.
//       Task #4 created at 635116412924607584 on thread #4.
//       Task #2 created at 635116412924607584 on thread #3.
//       Task #6 created at 635116412924607584 on thread #3.
//       Task #5 created at 635116412924607584 on thread #4.
//       Task #8 created at 635116412924607584 on thread #4.
//       Task #7 created at 635116412924607584 on thread #3.
//       Task #9 created at 635116412924607584 on thread #4.
```

This state is passed as an argument to the task delegate, and it can be accessed from the task object by using the Task.AsyncState property. The following example is a variation on the previous example. It uses the AsyncState property to display information about the ```CustomData``` objects passed to the lambda expression.

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

namespace TaskIntro;

class CustomData
{
    public long CreationTime;
    public int Name;
    public int ThreadNum;
}

public class AsyncState
{
    public static void Main()
    {
        Task[] taskArray = new Task[10];
        for (int i = 0; i < taskArray.Length; i++)
        {
            taskArray[i] = Task.Factory.StartNew((Object obj) =>
            {
                CustomData data = obj as CustomData;
                if (data == null) return;

                data.ThreadNum = Thread.CurrentThread.ManagedThreadId;
            },
            new CustomData() { Name = i, CreationTime = DateTime.Now.Ticks });
        }
        Task.WaitAll(taskArray);
        foreach (var task in taskArray)
        {
            var data = task.AsyncState as CustomData;
            if (data != null)
                Console.WriteLine("Task #{0} created at {1}, ran on thread #{2}.",
                                  data.Name, data.CreationTime, data.ThreadNum);
        }
    }
}
// The example displays output like the following:
//     Task #0 created at 635116412924597583, ran on thread #3.
//     Task #1 created at 635116412924607584, ran on thread #4.
//     Task #2 created at 635116412924607584, ran on thread #4.
//     Task #3 created at 635116412924607584, ran on thread #4.
//     Task #4 created at 635116412924607584, ran on thread #3.
//     Task #5 created at 635116412924607584, ran on thread #3.
//     Task #6 created at 635116412924607584, ran on thread #4.
//     Task #7 created at 635116412924607584, ran on thread #4.
//     Task #8 created at 635116412924607584, ran on thread #3.
//     Task #9 created at 635116412924607584, ran on thread #4.
```

## Task ID

In this article, you'll learn how to view task IDs in the Visual Studio Parallel Stacks window.

## Task creation options

This article describes how to schedule a task on a thread pool.

The following example shows a task that has the LongRunning and PreferFairness options:

```csharp
var task3 = new Task(() => MyLongRunningMethod(),
                    TaskCreationOptions.LongRunning | TaskCreationOptions.PreferFairness);
task3.Start();
```
## Tasks, threads, and culture

The thread's culture and UI culture are defined by the `Thread.CurrentCulture` and `Thread.CurrentUICulture` properties, respectively.

You can specify a system culture and UI culture for all threads in an application domain by using the `CultureInfo.DefaultCurrentCulture` and `CultureInfo.DefaultUICulture` properties.

The following example provides a simple illustration. It changes the app's current culture to French (France). If French (France) is already the current culture, it changes to English (United States). It then invokes a delegate named ```formatDelegate``` that returns some numbers formatted as currency values in the new culture. Whether the delegate is invoked by a task either synchronously or asynchronously, the task uses the culture of the calling thread.

```csharp
using System;
using System.Globalization;
using System.Threading;
using System.Threading.Tasks;

public class Example
{
   public static void Main()
   {
       decimal[] values = { 163025412.32m, 18905365.59m };
       string formatString = "C2";
       Func<String> formatDelegate = () => { string output = String.Format("Formatting using the {0} culture on thread {1}.\n",
                                                                           CultureInfo.CurrentCulture.Name,
                                                                           Thread.CurrentThread.ManagedThreadId);
                                             foreach (var value in values)
                                                output += String.Format("{0}   ", value.ToString(formatString));

                                             output += Environment.NewLine;
                                             return output;
                                           };

       Console.WriteLine("The example is running on thread {0}",
                         Thread.CurrentThread.ManagedThreadId);
       // Make the current culture different from the system culture.
       Console.WriteLine("The current culture is {0}",
                         CultureInfo.CurrentCulture.Name);
       if (CultureInfo.CurrentCulture.Name == "fr-FR")
          Thread.CurrentThread.CurrentCulture = new CultureInfo("en-US");
       else
          Thread.CurrentThread.CurrentCulture = new CultureInfo("fr-FR");

       Console.WriteLine("Changed the current culture to {0}.\n",
                         CultureInfo.CurrentCulture.Name);

       // Execute the delegate synchronously.
       Console.WriteLine("Executing the delegate synchronously:");
       Console.WriteLine(formatDelegate());

       // Call an async delegate to format the values using one format string.
       Console.WriteLine("Executing a task asynchronously:");
       var t1 = Task.Run(formatDelegate);
       Console.WriteLine(t1.Result);

       Console.WriteLine("Executing a task synchronously:");
       var t2 = new Task<String>(formatDelegate);
       t2.RunSynchronously();
       Console.WriteLine(t2.Result);
   }
}
// The example displays the following output:
//         The example is running on thread 1
//         The current culture is en-US
//         Changed the current culture to fr-FR.
//
//         Executing the delegate synchronously:
//         Formatting using the fr-FR culture on thread 1.
//         163 025 412,32 €   18 905 365,59 €
//
//         Executing a task asynchronously:
//         Formatting using the fr-FR culture on thread 3.
//         163 025 412,32 €   18 905 365,59 €
//
//         Executing a task synchronously:
//         Formatting using the fr-FR culture on thread 1.
//         163 025 412,32 €   18 905 365,59 €
```

> Note
In versions of .NET Framework earlier than .NET Framework 4.6, a task's culture is determined by the culture of the thread on which it runs, not the culture of the calling thread. For asynchronous tasks, the culture used by the task could be different from the calling thread's culture.

For more information on asynchronous tasks and culture, see the "Culture and asynchronous task-based operations" section in the CultureInfo article.

## Creating task continuations

In this article we are going to look at two methods that can be used to continue an antecedent task.

In the following example, the ```getData``` task is started by a call to the `TaskFactory.StartNew<TResult>(Func<TResult>)` method. The ```processData``` task is started automatically when ```getData``` finishes, and ```displayData``` is started when ```processData``` finishes. ```getData``` produces an integer array, which is accessible to the ```processData``` task through the ```getData``` task's `Task<TResult>.Result` property. The ```processData``` task processes that array and returns a result whose type is inferred from the return type of the lambda expression passed to the `Task<TResult>.ContinueWith<TNewResult>(Func<Task<TResult>,TNewResult>)` method. The ```displayData``` task executes automatically when ```processData``` finishes, and the `Tuple<T1,T2,T3>` object returned by the ```processData``` lambda expression is accessible to the ```displayData``` task through the ```processData``` task's `Task<TResult>.Result` property. The ```displayData``` task takes the result of the ```processData``` task. It produces a result whose type is inferred in a similar manner, and which is made available to the program in the Result property.

```csharp
using System;
using System.Threading.Tasks;

public class ContinuationOne
{
   public static void Main()
   {
      var getData = Task.Factory.StartNew(() => {
                                             Random rnd = new Random();
                                             int[] values = new int[100];
                                             for (int ctr = 0; ctr <= values.GetUpperBound(0); ctr++)
                                                values[ctr] = rnd.Next();

                                             return values;
                                          } );
      var processData = getData.ContinueWith((x) => {
                                                int n = x.Result.Length;
                                                long sum = 0;
                                                double mean;

                                                for (int ctr = 0; ctr <= x.Result.GetUpperBound(0); ctr++)
                                                   sum += x.Result[ctr];

                                                mean = sum / (double) n;
                                                return Tuple.Create(n, sum, mean);
                                             } );
      var displayData = processData.ContinueWith((x) => {
                                                    return String.Format("N={0:N0}, Total = {1:N0}, Mean = {2:N2}",
                                                                         x.Result.Item1, x.Result.Item2,
                                                                         x.Result.Item3);
                                                 } );
      Console.WriteLine(displayData.Result);
   }
}
// The example displays output similar to the following:
//    N=100, Total = 110,081,653,682, Mean = 1,100,816,536.82
```

The `Task.ContinueWith` method is an instance method of the `Task.ContinueWith` method.

```csharp
using System;
using System.Threading.Tasks;

public class ContinuationTwo
{
   public static void Main()
   {
      var displayData = Task.Factory.StartNew(() => {
                                                 Random rnd = new Random();
                                                 int[] values = new int[100];
                                                 for (int ctr = 0; ctr <= values.GetUpperBound(0); ctr++)
                                                    values[ctr] = rnd.Next();

                                                 return values;
                                              } ).
                        ContinueWith((x) => {
                                        int n = x.Result.Length;
                                        long sum = 0;
                                        double mean;

                                        for (int ctr = 0; ctr <= x.Result.GetUpperBound(0); ctr++)
                                           sum += x.Result[ctr];

                                        mean = sum / (double) n;
                                        return Tuple.Create(n, sum, mean);
                                     } ).
                        ContinueWith((x) => {
                                        return String.Format("N={0:N0}, Total = {1:N0}, Mean = {2:N2}",
                                                             x.Result.Item1, x.Result.Item2,
                                                             x.Result.Item3);
                                     } );
      Console.WriteLine(displayData.Result);
   }
}
// The example displays output similar to the following:
//    N=100, Total = 110,081,653,682, Mean = 1,100,816,536.82
```

The `ContinueWhenAll` and `ContinueWhenAny` methods enable you to continue from multiple tasks.

For more information, see Chaining Tasks by Using Continuation Tasks.

## Creating detached child tasks

In this article, I'm going to show you how to create a task that doesn't need to be synchronized with a parent task.

```csharp
var outer = Task.Factory.StartNew(() =>
{
    Console.WriteLine("Outer task beginning.");

    var child = Task.Factory.StartNew(() =>
    {
        Thread.SpinWait(5000000);
        Console.WriteLine("Detached task completed.");
    });
});

outer.Wait();
Console.WriteLine("Outer task completed.");
// The example displays the following output:
//    Outer task beginning.
//    Outer task completed.
//    Detached task completed.
```

> Note
The parent task doesn't wait for the detached child task to finish.

## Creating child tasks

You can use the `AttachedToParent` option to express structured task parallelism.

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

public class Child
{
   public static void Main()
   {
      var parent = Task.Factory.StartNew(() => {
                      Console.WriteLine("Parent task beginning.");
                      for (int ctr = 0; ctr < 10; ctr++) {
                         int taskNo = ctr;
                         Task.Factory.StartNew((x) => {
                                                  Thread.SpinWait(5000000);
                                                  Console.WriteLine("Attached child #{0} completed.",
                                                                    x);
                                               },
                                               taskNo, TaskCreationOptions.AttachedToParent);
                      }
                   });

      parent.Wait();
      Console.WriteLine("Parent task completed.");
   }
}
// The example displays output like the following:
//       Parent task beginning.
//       Attached child #9 completed.
//       Attached child #0 completed.
//       Attached child #8 completed.
//       Attached child #1 completed.
//       Attached child #7 completed.
//       Attached child #2 completed.
//       Attached child #6 completed.
//       Attached child #3 completed.
//       Attached child #5 completed.
//       Attached child #4 completed.
//       Parent task completed.
```

A parent task can use the `TaskCreationOptions.DenyChildAttach` option to prevent other tasks from attaching to the parent task. For more information, see Attached and Detached Child Tasks.

## Waiting for tasks to finish

The Task.Wait method lets you wait for a task to finish.

Typically, you would wait for a task for one of these reasons:

- The main thread depends on the final result computed by a task.

- You have to handle exceptions that might be thrown from the task.

- The application might terminate before all tasks have completed execution. For example, console applications will terminate after all synchronous code in ```Main``` (the application entry point) has executed.

The following example shows the basic pattern that doesn't involve exception handling:

```csharp
Task[] tasks = new Task[3]
{
    Task.Factory.StartNew(() => MethodA()),
    Task.Factory.StartNew(() => MethodB()),
    Task.Factory.StartNew(() => MethodC())
};

//Block until all tasks complete.
Task.WaitAll(tasks);

// Continue on this thread...
```

For an example that shows exception handling, see Exception Handling.

Time-out and cancellationTokens let you specify how long you want to wait before responding to a request.

The Task.Wait method waits for a task to complete.

## Composing tasks

This section describes the methods of the Task and TaskTResult> classes.

### Task.WhenAll

The Task.WhenAll method asynchronously waits for multiple Task or TaskTResult> objects to finish.

### Task.WhenAny

The Task.WhenAny method asynchronously waits for one of multiple Task or TaskTResult> objects to finish.

- Redundant operations: Consider an algorithm or operation that can be performed in many ways. You can use the WhenAny method to select the operation that finishes first and then cancel the remaining operations.

- Interleaved operations: You can start multiple operations that must finish and use the WhenAny method to process results as each operation finishes. After one operation finishes, you can start one or more tasks.

- Throttled operations: You can use the WhenAny method to extend the previous scenario by limiting the number of concurrent operations.

- Expired operations: You can use the WhenAny method to select between one or more tasks and a task that finishes after a specific time, such as a task that's returned by the Delay method. The Delay method is described in the following section.

### Task.Delay

The Task.Delay method produces a Task object that finishes after the specified time.

### Task(T).FromResult

You can use the FromResult method to retrieve the results of asynchronous operations that are held in a cache.

## Handling exceptions in tasks

When a task throws one or more exceptions, the exceptions are wrapped in an AggregateException exception. That exception is propagated back to the thread that joins with the task. Typically, it's the thread waiting for the task to finish or the thread accessing the Result property. This behavior enforces the .NET Framework policy that all unhandled exceptions by default should terminate the process. The calling code can handle the exceptions by using any of the following in a ```try/catch``` block:

- The Wait method

- The WaitAll method

- The WaitAny method

- The Result property

The joining thread can handle exceptions by accessing the Exception property before the task is garbage-collected.

For more information about exceptions and tasks, see Exception Handling.

## Canceling tasks

The CancellationTokenTask class is one of many CancellationToken classes in the .NET Framework 4.

A cancellation request is a request for a token to be used to cancel an event.

For more information, see Task Cancellation and How to: Cancel a Task and Its Children.

## The TaskFactory class

The TaskFactory class provides static methods that encapsulate common patterns for creating and starting tasks and continuation tasks.

- The most common pattern is StartNew, which creates and starts a task in one statement.

- When you create continuation tasks from multiple antecedents, use the ContinueWhenAll method or ContinueWhenAny method or their equivalents in the `Task<TResult>` class. For more information, see Chaining Tasks by Using Continuation Tasks.

- To encapsulate Asynchronous Programming Model ```BeginX``` and ```EndX``` methods in a Task or `Task<TResult>` instance, use the FromAsync methods. For more information, see TPL and Traditional .NET Framework Asynchronous Programming.

A taskFactory is a property of the Task class or TaskTResult> class.

## Tasks without delegates

You can use a Task to encapsulate some asynchronous operations.

## Custom schedulers

The Task PoolListener (TPL) lets you control which tasks are scheduled to run on the System.

## Related data structures

Microsoft has released the .NET Framework 4 with a new Parallel Programming Language (TPL).

## Custom task types

The Task and TaskTResult> classes can be subclassed.

You can't use Run or the `System.Completioning.Tasks.TaskFactory` to create instances of your custom task type.

## Related sections

<table><thead>
<tr>
<th>Title</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="chaining-tasks-by-using-continuation-tasks" data-linktype="relative-path">Chaining Tasks by Using Continuation Tasks</a></td>
<td>Describes how continuations work.</td>
</tr>
<tr>
<td><a href="attached-and-detached-child-tasks" data-linktype="relative-path">Attached and Detached Child Tasks</a></td>
<td>Describes the difference between attached and detached child tasks.</td>
</tr>
<tr>
<td><a href="task-cancellation" data-linktype="relative-path">Task Cancellation</a></td>
<td>Describes the cancellation support that's built into the <a href="/en-us/dotnet/api/system.threading.tasks.task" class="no-loc" data-linktype="absolute-path">Task</a> object.</td>
</tr>
<tr>
<td><a href="exception-handling-task-parallel-library" data-linktype="relative-path">Exception Handling</a></td>
<td>Describes how exceptions on concurrent threads are handled.</td>
</tr>
<tr>
<td><a href="how-to-use-parallel-invoke-to-execute-parallel-operations" data-linktype="relative-path">How to: Use Parallel.Invoke to Execute Parallel Operations</a></td>
<td>Describes how to use <a href="/en-us/dotnet/api/system.threading.tasks.parallel.invoke" class="no-loc" data-linktype="absolute-path">Invoke</a>.</td>
</tr>
<tr>
<td><a href="how-to-return-a-value-from-a-task" data-linktype="relative-path">How to: Return a Value from a Task</a></td>
<td>Describes how to return values from tasks.</td>
</tr>
<tr>
<td><a href="how-to-cancel-a-task-and-its-children" data-linktype="relative-path">How to: Cancel a Task and Its Children</a></td>
<td>Describes how to cancel tasks.</td>
</tr>
<tr>
<td><a href="how-to-create-pre-computed-tasks" data-linktype="relative-path">How to: Create Pre-Computed Tasks</a></td>
<td>Describes how to use the <a href="/en-us/dotnet/api/system.threading.tasks.task.fromresult" class="no-loc" data-linktype="absolute-path">Task.FromResult</a> method to retrieve the results of asynchronous download operations that are held in a cache.</td>
</tr>
<tr>
<td><a href="how-to-traverse-a-binary-tree-with-parallel-tasks" data-linktype="relative-path">How to: Traverse a Binary Tree with Parallel Tasks</a></td>
<td>Describes how to use tasks to traverse a binary tree.</td>
</tr>
<tr>
<td><a href="how-to-unwrap-a-nested-task" data-linktype="relative-path">How to: Unwrap a Nested Task</a></td>
<td>Demonstrates how to use the <a href="/en-us/dotnet/api/system.threading.tasks.taskextensions.unwrap" class="no-loc" data-linktype="absolute-path">Unwrap</a> extension method.</td>
</tr>
<tr>
<td><a href="data-parallelism-task-parallel-library" data-linktype="relative-path">Data Parallelism</a></td>
<td>Describes how to use <a href="/en-us/dotnet/api/system.threading.tasks.parallel.for" class="no-loc" data-linktype="absolute-path">For</a> and <a href="/en-us/dotnet/api/system.threading.tasks.parallel.foreach" class="no-loc" data-linktype="absolute-path">ForEach</a> to create parallel loops over data.</td>
</tr>
<tr>
<td><a href="./" data-linktype="relative-path">Parallel Programming</a></td>
<td>Top-level node for .NET Framework parallel programming.</td>
</tr>
</tbody></table>

## See also

- Parallel Programming

- Samples for Parallel Programming with the .NET Core & .NET Standard

Ref: [Task-based asynchronous programming](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/task-based-asynchronous-programming)