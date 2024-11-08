---
title: Parallel programming - Task Parallel Library (TPL) - Data parallelism - Iterate file directories with the Parallel class
published: true
date: 2024-10-17 04:39:08
tags: Summary, .Net, AdvancedProgramming
description: In many cases, file iteration is an operation that can be easily parallelized. The topic How to: Iterate File Directories with PLINQ shows the easiest way to perform this task for many scenarios. However, complications can arise when your code has to deal with the many types of exceptions that can arise when accessing the file system. The following example shows one approach to the problem. It uses a stack-based iteration to traverse all files and folders under a specified directory, and it enables your code to catch and handle various exceptions. Of course, the way that you handle the exceptions is up to you.
image:
---

## In this article

In our series of articles on PLINQ, we look at how to iterate over a file system.

## Example

In this article, I will show you how to iterate over a large number of files.

```csharp
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Security;
using System.Threading;
using System.Threading.Tasks;

class Program
{
    static void Main()
    {
        try
        {
            TraverseTreeParallelForEach(@"C:\Program Files", (f) =>
            {
                // Exceptions are no-ops.
                try
                {
                    // Do nothing with the data except read it.
                    byte[] data = File.ReadAllBytes(f);
                }
                catch (FileNotFoundException) { }
                catch (IOException) { }
                catch (UnauthorizedAccessException) { }
                catch (SecurityException) { }
                // Display the filename.
                Console.WriteLine(f);
            });
        }
        catch (ArgumentException)
        {
            Console.WriteLine(@"The directory 'C:\Program Files' does not exist.");
        }

        // Keep the console window open.
        Console.ReadKey();
    }

    public static void TraverseTreeParallelForEach(string root, Action<string> action)
    {
        //Count of files traversed and timer for diagnostic output
        int fileCount = 0;
        var sw = Stopwatch.StartNew();

        // Determine whether to parallelize file processing on each folder based on processor count.
        int procCount = Environment.ProcessorCount;

        // Data structure to hold names of subfolders to be examined for files.
        Stack<string> dirs = new Stack<string>();

        if (!Directory.Exists(root))
        {
            throw new ArgumentException(
                "The given root directory doesn't exist.", nameof(root));
        }
        dirs.Push(root);

        while (dirs.Count > 0)
        {
            string currentDir = dirs.Pop();
            string[] subDirs = { };
            string[] files = { };

            try
            {
                subDirs = Directory.GetDirectories(currentDir);
            }
            // Thrown if we do not have discovery permission on the directory.
            catch (UnauthorizedAccessException e)
            {
                Console.WriteLine(e.Message);
                continue;
            }
            // Thrown if another process has deleted the directory after we retrieved its name.
            catch (DirectoryNotFoundException e)
            {
                Console.WriteLine(e.Message);
                continue;
            }

            try
            {
                files = Directory.GetFiles(currentDir);
            }
            catch (UnauthorizedAccessException e)
            {
                Console.WriteLine(e.Message);
                continue;
            }
            catch (DirectoryNotFoundException e)
            {
                Console.WriteLine(e.Message);
                continue;
            }
            catch (IOException e)
            {
                Console.WriteLine(e.Message);
                continue;
            }

            // Execute in parallel if there are enough files in the directory.
            // Otherwise, execute sequentially.Files are opened and processed
            // synchronously but this could be modified to perform async I/O.
            try
            {
                if (files.Length < procCount)
                {
                    foreach (var file in files)
                    {
                        action(file);
                        fileCount++;
                    }
                }
                else
                {
                    Parallel.ForEach(files, () => 0,
                        (file, loopState, localCount) =>
                        {
                            action(file);
                            return (int)++localCount;
                        },
                        (c) =>
                        {
                            Interlocked.Add(ref fileCount, c);
                        });
                }
            }
            catch (AggregateException ae)
            {
                ae.Handle((ex) =>
                {
                    if (ex is UnauthorizedAccessException)
                    {
                        // Here we just output a message and go on.
                        Console.WriteLine(ex.Message);
                        return true;
                    }
                    // Handle other exceptions here if necessary...

                    return false;
                });
            }

            // Push the subdirectories onto the stack for traversal.
            // This could also be done before handing the files.
            foreach (string str in subDirs)
                dirs.Push(str);
        }

        // For diagnostic purposes.
        Console.WriteLine("Processed {0} files in {1} milliseconds", fileCount, sw.ElapsedMilliseconds);
    }
}
```

Asynchronous I/O is a technique for accessing data asynchronously.

The example uses the local ```fileCount``` variable to maintain a count of the total number of files processed. Because the variable might be accessed concurrently by multiple tasks, access to it is synchronized by calling the `Interlocked.Add` method.

This example shows how to stop or break a parallel loop.

## See also

- Data Parallelism

Ref: [How to: Iterate File Directories with the Parallel Class](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/how-to-iterate-file-directories-with-the-parallel-class)