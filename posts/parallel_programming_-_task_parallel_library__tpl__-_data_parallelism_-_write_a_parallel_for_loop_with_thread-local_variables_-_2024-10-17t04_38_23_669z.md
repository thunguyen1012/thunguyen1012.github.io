---
title: Parallel programming - Task Parallel Library (TPL) - Data parallelism - Write a Parallel.For loop with thread-local variables
published: true
date: 2024-10-17 04:38:23
tags: Summary, .Net, AdvancedProgramming
description: This example shows how to use thread-local variables to store and retrieve state in each separate task that is created by a For loop. By using thread-local data, you can avoid the overhead of synchronizing a large number of accesses to shared state. Instead of writing to a shared resource on each iteration, you compute and store the value until all iterations for the task are complete. You can then write the final result once to the shared resource, or pass it to another method.
image:
---

## In this article

In this lesson, you'll learn how to use thread-local variables to store and retrieve state in each separate task that is created by a For loop.

## Example

The ForTLocal method calculates the sum of the values in an array that contains one million elements.

```csharp
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

class Test
{
    static void Main()
    {
        int[] nums = Enumerable.Range(0, 1_000_000).ToArray();
        long total = 0;

        // Use type parameter to make subtotal a long, not an int
        Parallel.For<long>(0, nums.Length, () => 0,
            (j, loop, subtotal) =>
            {
                subtotal += nums[j];
                return subtotal;
            },
            subtotal => Interlocked.Add(ref total, subtotal));

        Console.WriteLine("The total is {0:N0}", total);
        Console.WriteLine("Press any key to exit");
        Console.ReadKey();
    }
}
```
The following example shows how to specify three parameters for a method.

The type of the third parameter is a `Func<TResult>` where ```TResult``` is the type of the variable that will store the thread-local state. Its type is defined by the generic type argument supplied when calling the generic `For<TLocal>(Int32, Int32, Func<TLocal>, Func<Int32,ParallelLoopState,TLocal,TLocal>, Action<TLocal>)` method, which in this case is `Int64`. The type argument tells the compiler the type of the temporary variable that will be used to store the thread-local state. In this example, the expression ```() => 0``` initializes the thread-local variable to zero. If the generic type argument is a reference type or user-defined value type, the expression would look like this:

```csharp
() => new MyClass()
```

The fourth parameter defines the loop logic. It must be a delegate or lambda expression whose signature is `Func<int, ParallelLoopState, long, long>` in C#. The first parameter is the value of the loop counter for that iteration of the loop. The second is a `ParallelLoopState` object that can be used to break out of the loop; this object is provided by the Parallel class to each occurrence of the loop. The third parameter is the thread-local variable. The last parameter is the return type. In this case, the type is Int64 because that is the type we specified in the For type argument. That variable is named ```subtotal``` and is returned by the lambda expression. The return value is used to initialize ```subtotal``` on each subsequent iteration of the loop. You can also think of this last parameter as a value that is passed to each iteration, and then passed to the ```localFinally``` delegate when the last iteration is complete.

The `For<TLocal>` method defines a method that is called on every iteration of a `ParallelLoopState` thread.

For more information about how to use lambda expressions, see Lambda Expressions in PLINQ and TPL.

## See also

- Data Parallelism

- Parallel Programming

- Task Parallel Library (TPL)

- Lambda Expressions in PLINQ and TPL

Ref: [How to: Write a Parallel.For Loop with Thread-Local Variables](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/how-to-write-a-parallel-for-loop-with-thread-local-variables)