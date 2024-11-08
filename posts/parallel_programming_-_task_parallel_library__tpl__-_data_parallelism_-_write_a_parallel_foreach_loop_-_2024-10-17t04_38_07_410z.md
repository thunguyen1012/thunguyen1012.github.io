---
title: Parallel programming - Task Parallel Library (TPL) - Data parallelism - Write a Parallel.ForEach loop
published: true
date: 2024-10-17 04:38:07
tags: Summary, .Net, AdvancedProgramming
description: This article shows how to use a Parallel.ForEach loop to enable data parallelism over any System.Collections.IEnumerable or System.Collections.Generic.IEnumerable<T> data source.
image:
---

## In this article

This article shows how to use a `Parallel.ForEach` loop to enable data parallelism over any `System.Collections.IEnumerable` or `System.Collections.Generic.IEnumerable<T>` data source.

> Note
This documentation uses lambda expressions to define delegates in PLINQ. If you aren't familiar with lambda expressions in C# or Visual Basic, see Lambda expressions in PLINQ and TPL.

## Example

This example demonstrates Parallel.ForEach for CPU-intensive operations. When you run the example, it randomly generates 2 million numbers and tries to filter to prime numbers. The first case iterates over the collection via a for-each loop. The second case iterates over the collection via `Parallel.ForEach`. The resulting time taken by each iteration is displayed when the application is finished.

```csharp
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace ParallelExample
{
    class Program
    {
        static void Main()
        {
            // 2 million
            var limit = 2_000_000;
            var numbers = Enumerable.Range(0, limit).ToList();

            var watch = Stopwatch.StartNew();
            var primeNumbersFromForeach = GetPrimeList(numbers);
            watch.Stop();

            var watchForParallel = Stopwatch.StartNew();
            var primeNumbersFromParallelForeach = GetPrimeListWithParallel(numbers);
            watchForParallel.Stop();

            Console.WriteLine($"Classical foreach loop | Total prime numbers : {primeNumbersFromForeach.Count} | Time Taken : {watch.ElapsedMilliseconds} ms.");
            Console.WriteLine($"Parallel.ForEach loop  | Total prime numbers : {primeNumbersFromParallelForeach.Count} | Time Taken : {watchForParallel.ElapsedMilliseconds} ms.");

            Console.WriteLine("Press 'Enter' to exit.");
            Console.ReadLine();
        }

        /// <summary>
        /// GetPrimeList returns Prime numbers by using sequential ForEach
        /// </summary>
        /// <param name="inputs"></param>
        /// <returns></returns>
        private static IList<int> GetPrimeList(IList<int> numbers) => numbers.Where(IsPrime).ToList();

        /// <summary>
        /// GetPrimeListWithParallel returns Prime numbers by using Parallel.ForEach
        /// </summary>
        /// <param name="numbers"></param>
        /// <returns></returns>
        private static IList<int> GetPrimeListWithParallel(IList<int> numbers)
        {
            var primeNumbers = new ConcurrentBag<int>();

            Parallel.ForEach(numbers, number =>
            {
                if (IsPrime(number))
                {
                    primeNumbers.Add(number);
                }
            });

            return primeNumbers.ToList();
        }

        /// <summary>
        /// IsPrime returns true if number is Prime, else false.(https://en.wikipedia.org/wiki/Prime_number)
        /// </summary>
        /// <param name="number"></param>
        /// <returns></returns>
        private static bool IsPrime(int number)
        {
            if (number < 2)
            {
                return false;
            }

            for (var divisor = 2; divisor <= Math.Sqrt(number); divisor++)
            {
                if (number % divisor == 0)
                {
                    return false;
                }
            }
            return true;
        }
    }
}
```
A `Parallel.ForEach` loop works like a `Parallel.For` loop. The loop partitions the source collection and schedules the work on multiple threads based on the system environment. The more processors on the system, the faster the parallel method runs. For some source collections, a sequential loop might be faster, depending on the size of the source and the kind of work the loop performs. For more information about performance, see Potential pitfalls in data and task parallelism.

For more information about parallel loops, see How to: Write a simple `Parallel.For` loop.

To use the `Parallel.ForEach` loop with a non-generic collection, you can use the `Enumerable.Cast` extension method to convert the collection to a generic collection, as shown in the following example:

```csharp
Parallel.ForEach(nonGenericCollection.Cast<object>(),
    currentElement =>
    {
    });
```

You can also use Parallel LINQ (PLINQ) to parallelize the processing of `IEnumerable<T>` data sources. PLINQ enables you to use declarative query syntax to express the loop behavior. For more information, see Parallel LINQ (PLINQ).

## Compile and run the code

You can compile the code as a console application for .NET Framework or as a console application for .NET Core.

In Visual Studio, there are Visual Basic and C# console application templates for Windows Desktop and .NET Core.

From the command line, you can use the .NET CLI commands (for example, ```dotnet new console```) or create the file and use the command-line compiler for a .NET Framework application.

To run a .NET Core console application from the command line, use ```dotnet run``` from the folder that contains your application.

To run your console application from Visual Studio, press F5.

## See also

- Data parallelism

- Parallel programming

- Parallel LINQ (PLINQ)

Ref: [How to: Write a simple Parallel.ForEach loop](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/how-to-write-a-simple-parallel-foreach-loop)