---
title: Parallel programming - Task Parallel Library (TPL) - Data parallelism - Handle exceptions in parallel loops
published: true
date: 2024-10-17 04:38:29
tags: Summary, .Net, AdvancedProgramming
description: The Parallel.For and Parallel.ForEach overloads do not have any special mechanism to handle exceptions that might be thrown. In this respect, they resemble regular for and foreach loops (For and For Each in Visual Basic); an unhandled exception causes the loop to terminate as soon as all currently running iterations finish.
image:
---

## In this article

The `Parallel.For` and `Parallel.ForEach` overloads do not have any special mechanism to handle exceptions that might be thrown. In this respect, they resemble regular ```for``` and ```foreach``` loops; an unhandled exception causes the loop to terminate as soon as all currently running iterations finish.

The following example shows how to handle parallel loop exceptions.

> Note
When "Just My Code" is enabled, Visual Studio in some cases will break on the line that throws the exception and display an error message that says "exception not handled by user code." This error is benign. You can press F5 to continue from it, and see the exception-handling behavior that is demonstrated in the example below. To prevent Visual Studio from breaking on the first error, just uncheck the "Just My Code" checkbox under Tools, Options, Debugging, General.

## Example

In this example, all exceptions are caught and then wrapped in an `System.AggregateException` which is thrown. The caller can decide which exceptions to handle.

```csharp
public static partial class Program
{
    public static void ExceptionTwo()
    {
        // Create some random data to process in parallel.
        // There is a good probability this data will cause some exceptions to be thrown.
        byte[] data = new byte[5_000];
        Random r = Random.Shared;
        r.NextBytes(data);

        try
        {
            ProcessDataInParallel(data);
        }
        catch (AggregateException ae)
        {
            var ignoredExceptions = new List<Exception>();
            // This is where you can choose which exceptions to handle.
            foreach (var ex in ae.Flatten().InnerExceptions)
            {
                if (ex is ArgumentException) Console.WriteLine(ex.Message);
                else ignoredExceptions.Add(ex);
            }
            if (ignoredExceptions.Count > 0)
            {
                throw new AggregateException(ignoredExceptions);
            }
        }

        Console.WriteLine("Press any key to exit.");
        Console.ReadKey();
    }

    private static void ProcessDataInParallel(byte[] data)
    {
        // Use ConcurrentQueue to enable safe enqueueing from multiple threads.
        var exceptions = new ConcurrentQueue<Exception>();

        // Execute the complete loop and capture all exceptions.
        Parallel.ForEach(data, d =>
        {
            try
            {
                // Cause a few exceptions, but not too many.
                if (d < 3) throw new ArgumentException($"Value is {d}. Value must be greater than or equal to 3.");
                else Console.Write(d + " ");
            }
            // Store the exception and continue with the loop.
            catch (Exception e)
            {
                exceptions.Enqueue(e);
            }
        });
        Console.WriteLine();

        // Throw the exceptions here after the loop completes.
        if (!exceptions.IsEmpty)
        {
            throw new AggregateException(exceptions);
        }
    }
}
```

## See also

- Data Parallelism

- Lambda Expressions in PLINQ and TPL

Ref: [How to: Handle Exceptions in Parallel Loops](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/how-to-handle-exceptions-in-parallel-loops)