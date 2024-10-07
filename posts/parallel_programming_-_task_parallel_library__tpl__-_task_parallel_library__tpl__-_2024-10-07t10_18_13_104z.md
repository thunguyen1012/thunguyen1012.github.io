---
title: Parallel programming - Task Parallel Library (TPL) - Task Parallel Library (TPL)
published: true
date: 2024-10-07 10:18:13
tags: Summary, .Net, AdvancedProgramming
description: The Task Parallel Library (TPL) is a set of public types and APIs in the System.Threading and System.Threading.Tasks namespaces. The purpose of the TPL is to make developers more productive by simplifying the process of adding parallelism and concurrency to applications. The TPL dynamically scales the degree of concurrency to use all the available processors most efficiently. In addition, the TPL handles the partitioning of the work, the scheduling of threads on the ThreadPool, cancellation support, state management, and other low-level details. By using TPL, you can maximize the performance of your code while focusing on the work that your program is designed to accomplish.
image:
---

## In this article

The Task Parallel Library (TPL) is a set of public types and APIs in the System.Threading and System.Threading.Tasks namespaces. The purpose of the TPL is to make developers more productive by simplifying the process of adding parallelism and concurrency to applications. The TPL dynamically scales the degree of concurrency to use all the available processors most efficiently. In addition, the TPL handles the partitioning of the work, the scheduling of threads on the ThreadPool, cancellation support, state management, and other low-level details. By using TPL, you can maximize the performance of your code while focusing on the work that your program is designed to accomplish.

In .NET Framework 4, the TPL is the preferred way to write multithreaded and parallel code. However, not all code is suitable for parallelization. ```For``` example, if a loop performs only a small amount of work on each iteration, or it doesn't run for many iterations, then the overhead of parallelization can cause the code to run more slowly. Furthermore, parallelization, like any multithreaded code, adds complexity to your program execution. Although the TPL simplifies multithreaded scenarios, we recommend that you have a basic understanding of threading concepts, for example, locks, deadlocks, and race conditions, so that you can use the TPL effectively.

## Related articles

<table><thead>
<tr>
<th>Title</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="data-parallelism-task-parallel-library" data-linktype="relative-path">Data Parallelism</a></td>
<td>Describes how to create parallel <code>for</code> and <code>foreach</code> loops (<code>For</code> and <code>For Each</code> in Visual Basic).</td>
</tr>
<tr>
<td><a href="task-based-asynchronous-programming" data-linktype="relative-path">Task-based Asynchronous Programming</a></td>
<td>Describes how to create and run tasks implicitly by using <a href="/en-us/dotnet/api/system.threading.tasks.parallel.invoke" class="no-loc" data-linktype="absolute-path">Parallel.Invoke</a> or explicitly by using <a href="/en-us/dotnet/api/system.threading.tasks.task" class="no-loc" data-linktype="absolute-path">Task</a> objects directly.</td>
</tr>
<tr>
<td><a href="dataflow-task-parallel-library" data-linktype="relative-path">Dataflow</a></td>
<td>Describes how to use the dataflow components in the TPL Dataflow Library to handle multiple operations. These operations must communicate with one another and process data as it becomes available.</td>
</tr>
<tr>
<td><a href="potential-pitfalls-in-data-and-task-parallelism" data-linktype="relative-path">Potential Pitfalls in Data and Task Parallelism</a></td>
<td>Describes some common pitfalls and how to avoid them.</td>
</tr>
<tr>
<td><a href="introduction-to-plinq" data-linktype="relative-path">Parallel LINQ (PLINQ)</a></td>
<td>Describes how to achieve data parallelism with LINQ queries.</td>
</tr>
<tr>
<td><a href="./" data-linktype="relative-path">Parallel Programming</a></td>
<td>Top-level node for .NET parallel programming.</td>
</tr>
</tbody></table>

## See also

- Samples for Parallel Programming with the .NET Core & .NET Standard

Ref: [Task Parallel Library (TPL)](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/task-parallel-library-tpl)