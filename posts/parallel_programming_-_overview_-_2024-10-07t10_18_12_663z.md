---
title: Parallel programming - Overview
published: true
date: 2024-10-07 10:18:12
tags: Summary, .Net, AdvancedProgramming
description: Many personal computers and workstations have multiple CPU cores that enable multiple threads to be executed simultaneously. To take advantage of the hardware, you can parallelize your code to distribute work across multiple processors.
image:
---

## In this article

In this tutorial, we'll look at how to parallelize your code to distribute work across multiple processors.

Visual Studio and .NET simplify parallel programming by providing a runtime, class library types, and diagnostic tools. Visual Studio and .NET enhance support for parallel programming by providing a runtime, class library types, and diagnostic tools.

The following illustration provides a high-level overview of the parallel programming architecture in .NET.



![.NET Parallel Programming Architecture!](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/media/tpl-architecture.png ".NET Parallel Programming Architecture")

## Related Topics

<table><thead>
<tr>
<th>Technology</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="task-parallel-library-tpl" data-linktype="relative-path">Task Parallel Library (TPL)</a></td>
<td>Provides documentation for the <a href="/en-us/dotnet/api/system.threading.tasks.parallel" class="no-loc" data-linktype="absolute-path">System.Threading.Tasks.Parallel</a> class, which includes parallel versions of <code>For</code> and <code>ForEach</code> loops, and also for the <a href="/en-us/dotnet/api/system.threading.tasks.task" class="no-loc" data-linktype="absolute-path">System.Threading.Tasks.Task</a> class, which represents the preferred way to express asynchronous operations.</td>
</tr>
<tr>
<td><a href="introduction-to-plinq" data-linktype="relative-path">Parallel LINQ (PLINQ)</a></td>
<td>A parallel implementation of LINQ to Objects that significantly improves performance in many scenarios.</td>
</tr>
<tr>
<td><a href="data-structures-for-parallel-programming" data-linktype="relative-path">Data Structures for Parallel Programming</a></td>
<td>Provides links to documentation for thread-safe collection classes, lightweight synchronization types, and types for lazy initialization.</td>
</tr>
<tr>
<td><a href="parallel-diagnostic-tools" data-linktype="relative-path">Parallel Diagnostic Tools</a></td>
<td>Provides links to documentation for Visual Studio debugger windows for tasks and parallel stacks, and for the <a href="/en-us/visualstudio/profiling/concurrency-visualizer" data-linktype="absolute-path">Concurrency Visualizer</a>.</td>
</tr>
<tr>
<td><a href="custom-partitioners-for-plinq-and-tpl" data-linktype="relative-path">Custom Partitioners for PLINQ and TPL</a></td>
<td>Describes how partitioners work and how to configure the default partitioners or create a new partitioner.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/system.threading.tasks.taskscheduler" data-linktype="absolute-path">Task Schedulers</a></td>
<td>Describes how schedulers work and how the default schedulers may be configured.</td>
</tr>
<tr>
<td><a href="lambda-expressions-in-plinq-and-tpl" data-linktype="relative-path">Lambda Expressions in PLINQ and TPL</a></td>
<td>Provides a brief overview of lambda expressions in C# and Visual Basic, and shows how they are used in PLINQ and the Task Parallel Library.</td>
</tr>
<tr>
<td><a href="for-further-reading-parallel-programming" data-linktype="relative-path">For Further Reading</a></td>
<td>Provides links to additional information and sample resources for parallel programming in .NET.</td>
</tr>
</tbody></table>

## See also

- Managed Threading

- Asynchronous programming patterns

Ref: [Parallel programming in .NET: A guide to the documentation](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/)