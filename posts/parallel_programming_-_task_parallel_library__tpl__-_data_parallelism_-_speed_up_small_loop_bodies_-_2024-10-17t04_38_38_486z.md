---
title: Parallel programming - Task Parallel Library (TPL) - Data parallelism - Speed up small loop bodies
published: true
date: 2024-10-17 04:38:38
tags: Summary, .Net, AdvancedProgramming
description: When a Parallel.For loop has a small body, it might perform more slowly than the equivalent sequential loop, such as the for loop in C# and the For loop in Visual Basic. Slower performance is caused by the overhead involved in partitioning the data and the cost of invoking a delegate on each loop iteration. To address such scenarios, the Partitioner class provides the Partitioner.Create method, which enables you to provide a sequential loop for the delegate body, so that the delegate is invoked only once per partition, instead of once per iteration. For more information, see Custom Partitioners for PLINQ and TPL.
image:
---

## In this article

The Partitioner class allows you to provide a sequential loop for the delegate body of a `Parallel.For` loop.

## Example

```csharp
using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

class Program
{
    static void Main()
    {

        // Source must be array or IList.
        var source = Enumerable.Range(0, 100000).ToArray();

        // Partition the entire source array.
        var rangePartitioner = Partitioner.Create(0, source.Length);

        double[] results = new double[source.Length];

        // Loop over the partitions in parallel.
        Parallel.ForEach(rangePartitioner, (range, loopState) =>
        {
            // Loop over each range element without a delegate invocation.
            for (int i = range.Item1; i < range.Item2; i++)
            {
                results[i] = source[i] * Math.PI;
            }
        });

        Console.WriteLine("Operation complete. Print results? y/n");
        char input = Console.ReadKey().KeyChar;
        if (input == 'y' || input == 'Y')
        {
            foreach(double d in results)
            {
                Console.Write("{0} ", d);
            }
        }
    }
}
```

This example shows how to use a For or ForEach loop with the default partitioner.

## See also

- Data Parallelism

- Custom Partitioners for PLINQ and TPL

- Iterators (C#)

- Iterators (Visual Basic)

- Lambda Expressions in PLINQ and TPL

Ref: [How to: Speed Up Small Loop Bodies](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/how-to-speed-up-small-loop-bodies)