---
title: Parallel programming - Task Parallel Library (TPL) - Task-based asynchronous programming - Return a value from a task
published: true
date: 2024-11-08 09:42:18
tags: Summary, .Net, AdvancedProgramming
description: This example shows how to use the System.Threading.Tasks.Task<TResult> class to return a value from the Result property. To use this example, you must ensure that the C:\Users\Public\Pictures\Sample Pictures directory exists and that it contains files.
image:
---

## In this article

The C:UsersPublicPicturesSample Pictures directory exists and it contains files.

## Example

```csharp
using System;
using System.Linq;
using System.Threading.Tasks;

class Program
{
    static void Main()
    {
        // Return a value type with a lambda expression
        Task<int> task1 = Task<int>.Factory.StartNew(() => 1);
        int i = task1.Result;

        // Return a named reference type with a multi-line statement lambda.
        Task<Test> task2 = Task<Test>.Factory.StartNew(() =>
        {
            string s = ".NET";
            double d = 4.0;
            return new Test { Name = s, Number = d };
        });
        Test test = task2.Result;

        // Return an array produced by a PLINQ query
        Task<string[]> task3 = Task<string[]>.Factory.StartNew(() =>
        {
            string path = @"C:\Users\Public\Pictures\Sample Pictures\";
            string[] files = System.IO.Directory.GetFiles(path);

            var result = (from file in files.AsParallel()
                          let info = new System.IO.FileInfo(file)
                          where info.Extension == ".jpg"
                          select file).ToArray();

            return result;
        });

        foreach (var name in task3.Result)
            Console.WriteLine(name);
    }
    class Test
    {
        public string Name { get; set; }
        public double Number { get; set; }
    }
}
```

The Result property blocks the calling thread until the task finishes.

To see how to pass the result of a `System.Threading.Tasks.Task<TResult>` class to a continuation task, see Chaining Tasks by Using Continuation Tasks.

## See also

- Task-based Asynchronous Programming

- Lambda Expressions in PLINQ and TPL

Ref: [How to: Return a Value from a Task](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/how-to-return-a-value-from-a-task)