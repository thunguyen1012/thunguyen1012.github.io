---
title: Parallel programming - Task Parallel Library (TPL) - Data parallelism - Write a Parallel.ForEach loop with partition-local variables
published: true
date: 2024-10-17 04:38:24
tags: Summary, .Net, AdvancedProgramming
description: The following example shows how to write a ForEach method that uses partition-local variables. When a ForEach loop executes, it divides its source collection into multiple partitions. Each partition has its own copy of the partition-local variable. A partition-local variable is similar to a thread-local variable, except that multiple partitions can run on a single thread.
image:
---

## In this article

The following example shows how to write a ForEach method that uses partition-local variables. When a ForEach loop executes, it divides its source collection into multiple partitions. Each partition has its own copy of the partition-local variable. A partition-local variable is similar to a thread-local variable, except that multiple partitions can run on a single thread.

The code and parameters in this example closely resemble the corresponding For method. For more information, see How to: Write a Parallel.For Loop with Thread-Local Variables.

To use a partition-local variable in a ForEach loop, you must call one of the method overloads that takes two type parameters. The first type parameter, ```TSource```, specifies the type of the source element, and the second type parameter, ```TLocal```, specifies the type of the partition-local variable.

## Example

The following example calls the `Parallel.ForEach<TSource,TLocal>(IEnumerable<TSource>, Func<TLocal>, Func<TSource,ParallelLoopState,TLocal,TLocal>, Action<TLocal>)` overload to compute the sum of an array of one million elements. This overload has four parameters:

- ```source```, which is the data source. It must implement `IEnumerable<T>`. The data source in our example is the one million member `IEnumerable<Int32>` object returned by the `Enumerable.Range` method.

- ```localInit```, or the function that initializes the partition-local variable. This function is called once for each partition in which the Parallel.ForEach operation executes. Our example initializes the partition-local variable to zero.

- ```body```, a `Func<T1,T2,T3,TResult>` that is invoked by the parallel loop on each iteration of the loop. Its signature is `Func<TSource, ParallelLoopState, TLocal, TLocal>`. You supply the code for the delegate, and the loop passes in the input parameters, which are:

Your delegate returns the partition-local variable, which is then passed to the next iteration of the loop that executes in that particular partition. Each loop partition maintains a separate instance of this variable.
In the example, the delegate adds the value of each integer to the partition-local variable, which maintains a running total of the values of the integer elements in that partition.

  - The current element of the `IEnumerable<T>`.

  - A ParallelLoopState variable that you can use in your delegate's code to examine the state of the loop.

  - The partition-local variable.

- ```localFinally```, an `Action<TLocal>` delegate that the `Parallel.ForEach` invokes when the looping operations in each partition have completed. The `Parallel.ForEach` method passes your `Action<TLocal>` delegate the final value of the partition-local variable for this loop partition, and you provide the code that performs the required action for combining the result from this partition with the results from the other partitions. This delegate can be invoked concurrently by multiple tasks. Because of this, the example uses the `Interlocked.Add(Int32, Int32)` method to synchronize access to the total variable. Because the delegate type is an `Action<T>`, there is no return value.

```csharp
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

class Test
{
    static void Main()
    {
        int[] nums = Enumerable.Range(0, 1000000).ToArray();
        long total = 0;

        // First type parameter is the type of the source elements
        // Second type parameter is the type of the thread-local variable (partition subtotal)
        Parallel.ForEach<int, long>(
            nums, // source collection
            () => 0, // method to initialize the local variable
            (j, loop, subtotal) => // method invoked by the loop on each iteration
            {
                subtotal += j; //modify local variable
                return subtotal; // value to be passed to next iteration
            },
            // Method to be executed when each partition has completed.
            // finalResult is the final value of subtotal for a particular partition.
            (finalResult) => Interlocked.Add(ref total, finalResult));

        Console.WriteLine("The total from Parallel.ForEach is {0:N0}", total);
    }
}
// The example displays the following output:
//        The total from Parallel.ForEach is 499,999,500,000
```

## See also

- Data Parallelism

- How to: Write a Parallel.For Loop with Thread-Local Variables

- Lambda Expressions in PLINQ and TPL

Ref: [How to: Write a Parallel.ForEach loop with partition-local variables](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/how-to-write-a-parallel-foreach-loop-with-partition-local-variables)