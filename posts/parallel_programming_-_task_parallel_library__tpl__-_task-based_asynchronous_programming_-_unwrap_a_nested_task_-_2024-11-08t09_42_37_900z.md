---
title: Parallel programming - Task Parallel Library (TPL) - Task-based asynchronous programming - Unwrap a nested task
published: true
date: 2024-11-08 09:42:37
tags: Summary, .Net, AdvancedProgramming
description: You can return a task from a method, and then wait on or continue from that task, as shown in the following example:
image:
---

## In this article

You can return a task from a method, and then wait on or continue from that task, as shown in the following example:

```csharp
static Task<string> DoWorkAsync()
{
    return Task<String>.Factory.StartNew(() =>
    {
       //...
        return "Work completed.";
    });
}

static void StartTask()
{
    Task<String> t = DoWorkAsync();
    t.Wait();
    Console.WriteLine(t.Result);
}
```

In the previous example, the Result property is of type ```string``` (String in Visual Basic).

However, in some scenarios, you might want to create a task within another task, and then return the nested task. In this case, the ```TResult``` of the enclosing task is itself a task. In the following example, the Result property is a ```Task<Task<string>>``` in C#.

```csharp
// Note the type of t and t2.
Task<Task<string>> t = Task.Factory.StartNew(() => DoWorkAsync());
Task<Task<string>> t2 = DoWorkAsync().ContinueWith((s) => DoMoreWorkAsync());

// Outputs: System.Threading.Tasks.Task`1[System.String]
Console.WriteLine(t.Result);
```

In this example, we will show you how to unwrap a task and retrieve its Result property.

```csharp
// Unwrap the inner task.
Task<string> t3 = DoWorkAsync().ContinueWith((s) => DoMoreWorkAsync()).Unwrap();

// Outputs "More work completed."
Console.WriteLine(t.Result);
```

The Unwrap methods can be used to transform any ```Task<Task>``` or ```Task<Task<TResult>>``` to a ```Task``` or ```Task<TResult>```. The new task fully represents the inner nested task, and includes cancellation state and all exceptions.

## Example

The following example demonstrates how to use the Unwrap extension methods.

```csharp
namespace Unwrap
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Threading;
    using System.Threading.Tasks;
    // A program whose only use is to demonstrate Unwrap.
    class Program
    {
        static void Main()
        {
            // An arbitrary threshold value.
            byte threshold = 0x40;

            // data is a Task<byte[]>
            var data = Task<byte[]>.Factory.StartNew(() =>
                {
                    return GetData();
                });

            // We want to return a task so that we can
            // continue from it later in the program.
            // Without Unwrap: stepTwo is a Task<Task<byte[]>>
            // With Unwrap: stepTwo is a Task<byte[]>
            var stepTwo = data.ContinueWith((antecedent) =>
                {
                    return Task<byte>.Factory.StartNew( () => Compute(antecedent.Result));
                })
                .Unwrap();

            // Without Unwrap: antecedent.Result = Task<byte>
            // and the following method will not compile.
            // With Unwrap: antecedent.Result = byte and
            // we can work directly with the result of the Compute method.
            var lastStep = stepTwo.ContinueWith( (antecedent) =>
                {
                    if (antecedent.Result >= threshold)
                    {
                      return Task.Factory.StartNew( () =>  Console.WriteLine("Program complete. Final = 0x{0:x} threshold = 0x{1:x}", stepTwo.Result, threshold));
                    }
                    else
                    {
                        return DoSomeOtherAsynchronousWork(stepTwo.Result, threshold);
                    }
                });

            lastStep.Wait();
            Console.WriteLine("Press any key");
            Console.ReadKey();
        }

        #region Dummy_Methods
        private static byte[] GetData()
        {
            Random rand = new Random();
            byte[] bytes = new byte[64];
            rand.NextBytes(bytes);
            return bytes;
        }

        static Task DoSomeOtherAsynchronousWork(int i, byte b2)
        {
            return Task.Factory.StartNew(() =>
                {
                    Thread.SpinWait(500000);
                    Console.WriteLine("Doing more work. Value was <= threshold");
                });
        }
        static byte Compute(byte[] data)
        {

            byte final = 0;
            foreach (byte item in data)
            {
                final ^= item;
                Console.WriteLine("{0:x}", final);
            }
            Console.WriteLine("Done computing");
            return final;
        }
        #endregion
    }
}
```

## See also

- System.Threading.Tasks.TaskExtensions

- ```Task```-based Asynchronous Programming

Ref: [How to: Unwrap a Nested ```Task```](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/how-to-unwrap-a-nested-task)