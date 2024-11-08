---
title: Parallel programming - Task Parallel Library (TPL) - Data parallelism - Cancel a parallel loop
published: true
date: 2024-10-17 04:38:27
tags: Summary, .Net, AdvancedProgramming
description: The Parallel.For and Parallel.ForEach methods support cancellation through the use of cancellation tokens. For more information about cancellation in general, see Cancellation. In a parallel loop, you supply the CancellationToken to the method in the ParallelOptions parameter and then enclose the parallel call in a try-catch block.
image:
---

## In this article

The `Parallel.For` and `Parallel.ForEach` methods support cancellation through the use of cancellation tokens.

## Example

The following example shows how to cancel a call to `Parallel.ForEach`. You can apply the same approach to a Parallel.For call.

```csharp
namespace CancelParallelLoops
{
    using System;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;

    class Program
    {
        static void Main()
        {
            int[] nums = Enumerable.Range(0, 10_000_000).ToArray();
            CancellationTokenSource cts = new();

            // Use ParallelOptions instance to store the CancellationToken
            ParallelOptions options = new()
            {
                CancellationToken = cts.Token,
                MaxDegreeOfParallelism = Environment.ProcessorCount
            };
            Console.WriteLine("Press any key to start. Press 'c' to cancel.");
            Console.ReadKey();

            // Run a task so that we can cancel from another thread.
            Task.Factory.StartNew(() =>
            {
                if (Console.ReadKey().KeyChar is 'c')
                    cts.Cancel();
                Console.WriteLine("press any key to exit");
            });

            try
            {
                Parallel.ForEach(nums, options, (num) =>
                {
                    double d = Math.Sqrt(num);
                    Console.WriteLine("{0} on {1}", d, Environment.CurrentManagedThreadId);
                });
            }
            catch (OperationCanceledException e)
            {
                Console.WriteLine(e.Message);
            }
            finally
            {
                cts.Dispose();
            }

            Console.ReadKey();
        }
    }
}
```

If the token that signals the cancellation is the same token that is specified in the `ParallelOptions` instance, then the parallel loop will throw a single `OperationCanceledException` on cancellation. This immediately stops all iterations from executing as the exception is thrown. If some other token causes cancellation, the loop will throw an `AggregateException` with an `OperationCanceledException` as an ```InnerException```.

## See also

- Data parallelism

- Lambda expressions in PLINQ and TPL

Ref: [How to: Cancel a Parallel.For or ForEach Loop](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/how-to-cancel-a-parallel-for-or-foreach-loop)