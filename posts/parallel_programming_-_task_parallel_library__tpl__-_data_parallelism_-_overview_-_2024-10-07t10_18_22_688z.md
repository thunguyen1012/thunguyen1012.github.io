---
title: Parallel programming - Task Parallel Library (TPL) - Data parallelism - Overview
published: true
date: 2024-10-07 10:18:22
tags: Summary, .Net, AdvancedProgramming
description: Data parallelism refers to scenarios in which the same operation is performed concurrently (that is, in parallel) on elements in a source collection or array. In data parallel operations, the source collection is partitioned so that multiple threads can operate on different segments concurrently.
image:
---

## In this article

There are two types of data parallelism: data parallel and data parallel.

The Task Parallel Library (TPL) supports data parallelism through the System.Threading.Tasks.Parallel class. This class provides method-based parallel implementations of for and ```foreach``` loops (For and ```For Each``` in Visual Basic). You write the loop logic for a Parallel.For or Parallel.ForEach loop much as you would write a sequential loop. You do not have to create threads or queue work items. In basic loops, you do not have to take locks. The TPL handles all the low-level work for you. For in-depth information about the use of Parallel.For and Parallel.ForEach, download the document Patterns for Parallel Programming: Understanding and Applying Parallel Patterns with the .NET Framework 4. The following code example shows a simple ```foreach``` loop and its parallel equivalent.

> Note
This documentation uses lambda expressions to define delegates in TPL. If you are not familiar with lambda expressions in C# or Visual Basic, see Lambda Expressions in PLINQ and TPL.

```csharp
// Sequential version
foreach (var item in sourceCollection)
{
    Process(item);
}

// Parallel equivalent
Parallel.ForEach(sourceCollection, item => Process(item));
```

The parallel loop scheduler (TPL) partitions the data source of a loop so that the loop can operate on multiple parts concurrently.

> Note
You can also supply your own custom partitioner or scheduler. For more information, see Custom Partitioners for PLINQ and TPL and Task Schedulers.

Both the Parallel.For and Parallel.ForEach methods have several overloads that let you stop or break loop execution, monitor the state of the loop on other threads, maintain thread-local state, finalize thread-local objects, control the degree of concurrency, and so on. The helper types that enable this functionality include ParallelLoopState, ParallelOptions, ParallelLoopResult, CancellationToken, and CancellationTokenSource.

 For more information, see Patterns for Parallel Programming: Understanding and Applying Parallel Patterns with the .NET Framework 4.

Data parallelism with declarative, or query-like, syntax is supported by PLINQ. For more information, see Parallel LINQ (PLINQ).

## Related Topics

<table><thead>
<tr>
<th>Title</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="how-to-write-a-simple-parallel-for-loop" data-linktype="relative-path">How to: Write a Simple Parallel.For Loop</a></td>
<td>Describes how to write a <a href="/en-us/dotnet/api/system.threading.tasks.parallel.for" class="no-loc" data-linktype="absolute-path">For</a> loop over any array or indexable <a href="/en-us/dotnet/api/system.collections.generic.ienumerable-1" class="no-loc" data-linktype="absolute-path">IEnumerable&lt;T&gt;</a> source collection.</td>
</tr>
<tr>
<td><a href="how-to-write-a-simple-parallel-foreach-loop" data-linktype="relative-path">How to: Write a Simple Parallel.ForEach Loop</a></td>
<td>Describes how to write a <a href="/en-us/dotnet/api/system.threading.tasks.parallel.foreach" class="no-loc" data-linktype="absolute-path">ForEach</a> loop over any <a href="/en-us/dotnet/api/system.collections.generic.ienumerable-1" class="no-loc" data-linktype="absolute-path">IEnumerable&lt;T&gt;</a> source collection.</td>
</tr>
<tr>
<td><a href="/en-us/previous-versions/dotnet/netframework-4.0/dd460721(v=vs.100)" data-linktype="absolute-path">How to: Stop or Break from a Parallel.For Loop</a></td>
<td>Describes how to stop or break from a parallel loop so that all threads are informed of the action.</td>
</tr>
<tr>
<td><a href="how-to-write-a-parallel-for-loop-with-thread-local-variables" data-linktype="relative-path">How to: Write a Parallel.For Loop with Thread-Local Variables</a></td>
<td>Describes how to write a <a href="/en-us/dotnet/api/system.threading.tasks.parallel.for" class="no-loc" data-linktype="absolute-path">For</a> loop in which each thread maintains a private variable that is not visible to any other threads, and how to synchronize the results from all threads when the loop completes.</td>
</tr>
<tr>
<td><a href="how-to-write-a-parallel-foreach-loop-with-partition-local-variables" data-linktype="relative-path">How to: Write a Parallel.ForEach Loop with Partition-Local Variables</a></td>
<td>Describes how to write a <a href="/en-us/dotnet/api/system.threading.tasks.parallel.foreach" class="no-loc" data-linktype="absolute-path">ForEach</a> loop in which each thread maintains a private variable that is not visible to any other threads, and how to synchronize the results from all threads when the loop completes.</td>
</tr>
<tr>
<td><a href="how-to-cancel-a-parallel-for-or-foreach-loop" data-linktype="relative-path">How to: Cancel a Parallel.For or ForEach Loop</a></td>
<td>Describes how to cancel a parallel loop by using a <a href="/en-us/dotnet/api/system.threading.cancellationtoken" class="no-loc" data-linktype="absolute-path">System.Threading.CancellationToken</a></td>
</tr>
<tr>
<td><a href="how-to-speed-up-small-loop-bodies" data-linktype="relative-path">How to: Speed Up Small Loop Bodies</a></td>
<td>Describes one way to speed up execution when a loop body is very small.</td>
</tr>
<tr>
<td><a href="task-parallel-library-tpl" data-linktype="relative-path">Task Parallel Library (TPL)</a></td>
<td>Provides an overview of the Task Parallel Library.</td>
</tr>
<tr>
<td><a href="./" data-linktype="relative-path">Parallel Programming</a></td>
<td>Introduces Parallel Programming in the .NET Framework.</td>
</tr>
</tbody></table>

## See also

- Parallel Programming

Ref: [Data Parallelism (Task Parallel Library)](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/data-parallelism-task-parallel-library)