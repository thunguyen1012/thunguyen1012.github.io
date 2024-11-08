---
title: Parallel programming - Task Parallel Library (TPL) - Data parallelism - Write a Parallel.For loop
published: true
date: 2024-10-17 04:38:06
tags: Summary, .Net, AdvancedProgramming
description: This topic contains two examples that illustrate the Parallel.For method. The first uses the Parallel.For(Int64, Int64, Action<Int64>) method overload, and the second uses the Parallel.For(Int32, Int32, Action<Int32>) overload, the two simplest overloads of the Parallel.For method. You can use these two overloads of the Parallel.For method when you do not need to cancel the loop, break out of the loop iterations, or maintain any thread-local state.
image:
---

## In this article

This topic contains two examples that illustrate the `Parallel.For` method. The first uses the `Parallel.For(Int64, Int64, Action<Int64>)` method overload, and the second uses the `Parallel.For(Int32, Int32, Action<Int32>)` overload, the two simplest overloads of the `Parallel.For` method. You can use these two overloads of the `Parallel.For` method when you do not need to cancel the loop, break out of the loop iterations, or maintain any thread-local state.

> Note
This documentation uses lambda expressions to define delegates in TPL. If you are not familiar with lambda expressions in C# or Visual Basic, see Lambda Expressions in PLINQ and TPL.

The first example calculates the size of files in a single directory. The second computes the product of two matrices.

## Directory size example

This example is a simple command-line utility that calculates the total size of files in a directory. It expects a single directory path as an argument, and reports the number and total size of the files in that directory. After verifying that the directory exists, it uses the `Parallel.For` method to enumerate the files in the directory and determine their file sizes. Each file size is then added to the ```totalSize``` variable. Note that the addition is performed by calling the Interlocked.Add so that the addition is performed as an atomic operation. Otherwise, multiple tasks could try to update the ```totalSize``` variable simultaneously.

```csharp
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

public class Example
{
   public static void Main(string[] args)
   {
      long totalSize = 0;
      
      if (args.Length == 0) {
         Console.WriteLine("There are no command line arguments.");
         return;
      }
      if (! Directory.Exists(args[0])) {
         Console.WriteLine("The directory does not exist.");
         return;
      }

      String[] files = Directory.GetFiles(args[0]);
      Parallel.For(0, files.Length,
                   index => { FileInfo fi = new FileInfo(files[index]);
                              long size = fi.Length;
                              Interlocked.Add(ref totalSize, size);
                   } );
      Console.WriteLine("Directory '{0}':", args[0]);
      Console.WriteLine("{0:N0} files, {1:N0} bytes", files.Length, totalSize);
   }
}
// The example displaysoutput like the following:
//       Directory 'c:\windows\':
//       32 files, 6,587,222 bytes
```

## Matrix and stopwatch example

This example shows how to use the `System.Diagnostics.Stopwatch` class to compare the performance of a parallel loop with a non-parallel loop.

```csharp
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Threading.Tasks;

class MultiplyMatrices
{
    #region Sequential_Loop
    static void MultiplyMatricesSequential(double[,] matA, double[,] matB,
                                            double[,] result)
    {
        int matACols = matA.GetLength(1);
        int matBCols = matB.GetLength(1);
        int matARows = matA.GetLength(0);

        for (int i = 0; i < matARows; i++)
        {
            for (int j = 0; j < matBCols; j++)
            {
                double temp = 0;
                for (int k = 0; k < matACols; k++)
                {
                    temp += matA[i, k] * matB[k, j];
                }
                result[i, j] += temp;
            }
        }
    }
    #endregion

    #region Parallel_Loop
    static void MultiplyMatricesParallel(double[,] matA, double[,] matB, double[,] result)
    {
        int matACols = matA.GetLength(1);
        int matBCols = matB.GetLength(1);
        int matARows = matA.GetLength(0);

        // A basic matrix multiplication.
        // Parallelize the outer loop to partition the source array by rows.
        Parallel.For(0, matARows, i =>
        {
            for (int j = 0; j < matBCols; j++)
            {
                double temp = 0;
                for (int k = 0; k < matACols; k++)
                {
                    temp += matA[i, k] * matB[k, j];
                }
                result[i, j] = temp;
            }
        }); // Parallel.For
    }
    #endregion

    #region Main
    static void Main(string[] args)
    {
        // Set up matrices. Use small values to better view
        // result matrix. Increase the counts to see greater
        // speedup in the parallel loop vs. the sequential loop.
        int colCount = 180;
        int rowCount = 2000;
        int colCount2 = 270;
        double[,] m1 = InitializeMatrix(rowCount, colCount);
        double[,] m2 = InitializeMatrix(colCount, colCount2);
        double[,] result = new double[rowCount, colCount2];

        // First do the sequential version.
        Console.Error.WriteLine("Executing sequential loop...");
        Stopwatch stopwatch = new Stopwatch();
        stopwatch.Start();

        MultiplyMatricesSequential(m1, m2, result);
        stopwatch.Stop();
        Console.Error.WriteLine("Sequential loop time in milliseconds: {0}",
                                stopwatch.ElapsedMilliseconds);

        // For the skeptics.
        OfferToPrint(rowCount, colCount2, result);

        // Reset timer and results matrix.
        stopwatch.Reset();
        result = new double[rowCount, colCount2];

        // Do the parallel loop.
        Console.Error.WriteLine("Executing parallel loop...");
        stopwatch.Start();
        MultiplyMatricesParallel(m1, m2, result);
        stopwatch.Stop();
        Console.Error.WriteLine("Parallel loop time in milliseconds: {0}",
                                stopwatch.ElapsedMilliseconds);
        OfferToPrint(rowCount, colCount2, result);

        // Keep the console window open in debug mode.
        Console.Error.WriteLine("Press any key to exit.");
        Console.ReadKey();
    }
    #endregion

    #region Helper_Methods
    static double[,] InitializeMatrix(int rows, int cols)
    {
        double[,] matrix = new double[rows, cols];

        Random r = new Random();
        for (int i = 0; i < rows; i++)
        {
            for (int j = 0; j < cols; j++)
            {
                matrix[i, j] = r.Next(100);
            }
        }
        return matrix;
    }

    private static void OfferToPrint(int rowCount, int colCount, double[,] matrix)
    {
        Console.Error.Write("Computation complete. Print results (y/n)? ");
        char c = Console.ReadKey(true).KeyChar;
        Console.Error.WriteLine(c);
        if (Char.ToUpperInvariant(c) == 'Y')
        {
            if (!Console.IsOutputRedirected &&
                RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                Console.WindowWidth = 180;
            }

            Console.WriteLine();
            for (int x = 0; x < rowCount; x++)
            {
                Console.WriteLine("ROW {0}: ", x);
                for (int y = 0; y < colCount; y++)
                {
                    Console.Write("{0:#.##} ", matrix[x, y]);
                }
                Console.WriteLine();
            }
        }
    }
    #endregion
}
```

In this paper, we compare the performance benefits of parallelizing the outer loop with the performance benefits of parallelizing the inner loop.

## The Delegate

The third parameter of this overload of For is a delegate of type ```Action<int>``` in C#. An Action delegate, whether it has zero, one or sixteen type parameters, always returns void. The example uses a lambda expression to create the delegate, but you can create the delegate in other ways as well. For more information, see Lambda Expressions in PLINQ and TPL.

## The Iteration Value

The delegate is used to specify the source that is being processed on the current thread.

If you require more control over the concurrency level, use one of the overloads that takes a System.Threading.Tasks.ParallelOptions input parameter, such as: `Parallel.For(Int32, Int32`, `ParallelOptions`, ```Action<Int32,ParallelLoopState>)```.

## Return Value and Exception Handling

Returns the last iteration of a loop that ran to completion.

In the code in this example, the return value of For is not used.

## Analysis and Performance

As an experiment, increase the number of columns and rows in the matrices.

Try to avoid calls to shared resources, like the Console or the File System.

## Compile the Code

Copy and paste this code into a Visual Studio project.

## See also

- For

- ForEach

- Data Parallelism

- Parallel Programming

Ref: [How to: Write a Simple Parallel.For Loop](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/how-to-write-a-simple-parallel-for-loop)