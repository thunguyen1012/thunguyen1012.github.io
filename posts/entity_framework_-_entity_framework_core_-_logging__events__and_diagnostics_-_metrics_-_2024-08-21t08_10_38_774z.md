---
title: Entity Framework - Entity Framework Core - Logging, events, and diagnostics - Metrics
published: true
date: 2024-08-21 08:10:38
tags: Summary, EFCore
description: Entity Framework Core (EF Core) exposes continuous numeric metrics which can provide a good indication of your program's health. These metrics can be used for the following purposes:
image:
---

## In this article

Entity Framework Core (EF Core) exposes continuous numeric metrics which can provide a good indication of your program's health. These metrics can be used for the following purposes:

- Track general database load in realtime as the application is running

- Expose problematic coding practices which can lead to degraded performance

- Track down and isolate anomalous program behavior

## Metrics

EF Core reports metrics via the standard System.Diagnostics.Metrics API. ```Microsoft.EntityFrameworkCore``` is the name of the meter. It's recommended to read .NET documentation on metrics.

<blockquote class="note">Note
This feature is being introduced in EF Core 9.0 (in preview). See event counters below for older versions of EF Core.</blockquote>

### Metrics and their meaning

- ```microsoft.entityframeworkcore.active_dbcontexts```

- ```microsoft.entityframeworkcore.queries```

- ```microsoft.entityframeworkcore.savechanges```

- ```microsoft.entityframeworkcore.compiled_query_cache_hit_rate```

- ```microsoft.entityframeworkcore.execution_strategy_operation_failures```

- ```microsoft.entityframeworkcore.optimistic_concurrency_failures```

#### Metric: ```microsoft.entityframeworkcore.active_dbcontexts```

<table><thead>
<tr>
<th>Name</th>
<th>Instrument Type</th>
<th>Unit (UCUM)</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>microsoft.entityframeworkcore.active_dbcontexts</code></td>
<td>ObservableUpDownCounter</td>
<td><code>{dbcontext}</code></td>
<td>Number of currently active <code>DbContext</code> instances.</td>
</tr>
</tbody></table>

Available starting in: Entity Framework Core 9.0.

#### Metric: ```microsoft.entityframeworkcore.queries```

<table><thead>
<tr>
<th>Name</th>
<th>Instrument Type</th>
<th>Unit (UCUM)</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>microsoft.entityframeworkcore.queries</code></td>
<td>ObservableCounter</td>
<td><code>{query}</code></td>
<td>Cumulative count of queries executed.</td>
</tr>
</tbody></table>

Available starting in: Entity Framework Core 9.0.

#### Metric: ```microsoft.entityframeworkcore.savechanges```

<table><thead>
<tr>
<th>Name</th>
<th>Instrument Type</th>
<th>Unit (UCUM)</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>microsoft.entityframeworkcore.savechanges</code></td>
<td>ObservableCounter</td>
<td><code>{savechanges}</code></td>
<td>Cumulative count of changes saved.</td>
</tr>
</tbody></table>

Available starting in: Entity Framework Core 9.0.

#### Metric: ```microsoft.entityframeworkcore.compiled_query_cache_hit_rate```

<table><thead>
<tr>
<th>Name</th>
<th>Instrument Type</th>
<th>Unit (UCUM)</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>microsoft.entityframeworkcore.compiled_query_cache_hit_rate</code></td>
<td>ObservableGauge</td>
<td><code>%</code></td>
<td>Hit rate - since last observation - for the compiled query cache.</td>
</tr>
</tbody></table>

Available starting in: Entity Framework Core 9.0.

#### Metric: ```microsoft.entityframeworkcore.execution_strategy_operation_failures```

<table><thead>
<tr>
<th>Name</th>
<th>Instrument Type</th>
<th>Unit (UCUM)</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>microsoft.entityframeworkcore.execution_strategy_operation_failures</code></td>
<td>ObservableCounter</td>
<td><code>{failure}</code></td>
<td>Cumulative number of failed operation executed by an <code>IExecutionStrategy</code>.</td>
</tr>
</tbody></table>

Available starting in: Entity Framework Core 9.0.

#### Metric: ```microsoft.entityframeworkcore.optimistic_concurrency_failures```

<table><thead>
<tr>
<th>Name</th>
<th>Instrument Type</th>
<th>Unit (UCUM)</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>microsoft.entityframeworkcore.optimistic_concurrency_failures</code></td>
<td>ObservableCounter</td>
<td><code>{failure}</code></td>
<td>Cumulative number of optimistic concurrency failures.</td>
</tr>
</tbody></table>

Available starting in: Entity Framework Core 9.0.

## Event Counters (legacy)

EF Core reports metrics via the standard .NET event counters feature; it's recommended to read this blog post for a quick overview of how counters work.

### Attach to a process using ```dotnet-counters```

The ```dotnet-counters``` tool can be used to attach to a running process and report EF Core event counters regularly; nothing special needs to be done in the program for these counters to be available.

First, install the ```dotnet-counters``` tool: ```dotnet tool install --global dotnet-counters```.

Next, find the process ID (PID) of the .NET process running your EF Core application:

 - Windows

 - Linux or macOS

  - Open the Windows Task Manager by right-clicking on the task bar and selecting "Task Manager".

  - Make sure that the "More details" option is selected at the bottom of the window.

  - In the Processes tab, right-click a column and make sure that the PID column is enabled.

  - Locate your application in the process list, and get its process ID from the PID column.

  - Use the ```ps``` command to list all processes running for your user.

  - Locate your application in the process list, and get its process ID from the PID column.

Inside your .NET application, the process ID is available as ```Process.GetCurrentProcess().Id```; this can be useful for printing the PID upon startup.

Finally, launch ```dotnet-counters``` as follows:

```console
dotnet counters monitor Microsoft.EntityFrameworkCore -p <PID>
```

 ```dotnet-counters``` will now attach to your running process and start reporting continuous counter data:

```console
Press p to pause, r to resume, q to quit.
 Status: Running

[Microsoft.EntityFrameworkCore]
    Active DbContexts                                               1
    Execution Strategy Operation Failures (Count / 1 sec)           0
    Execution Strategy Operation Failures (Total)                   0
    Optimistic Concurrency Failures (Count / 1 sec)                 0
    Optimistic Concurrency Failures (Total)                         0
    Queries (Count / 1 sec)                                         1
    Queries (Total)                                               189
    Query Cache Hit Rate (%)                                      100
    SaveChanges (Count / 1 sec)                                     0
    SaveChanges (Total)                                             0
```

### Counters and their meaning

<table><thead>
<tr>
<th>Counter name</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>Active DbContexts <br> (<code>active-db-contexts</code>)</td>
<td>The number of active, undisposed ```DbContext``` instances currently in your application. If this number grows continuously, you may have a leak because ```DbContext``` instances aren't being properly disposed. Note that if <a href="../performance/advanced-performance-topics#dbcontext-pooling" data-linktype="relative-path">context pooling</a> is enabled, this number includes pooled ```DbContext``` instances not currently in use.</td>
</tr>
<tr>
<td>Execution Strategy Operation Failures <br> (<code>total-execution-strategy-operation-failures</code> and  <code>execution-strategy-operation-failures-per-second</code>)</td>
<td>The number of times a database operation failed to execute. If a retrying execution strategy is enabled, this includes each individual failure within multiple attempts on the same operation. This can be used to detect transient issues with your infrastructure.</td>
</tr>
<tr>
<td>Optimistic Concurrency Failures <br> (<code>total-optimistic-concurrency-failures</code> and <code>optimistic-concurrency-failures-per-second</code>)</td>
<td>The number of times <code>SaveChanges</code> failed because of an optimistic concurrency error, because data in the data store was changed since your code loaded it. This corresponds to a <a href="/en-us/dotnet/api/microsoft.entityframeworkcore.dbupdateconcurrencyexception" class="no-loc" data-linktype="absolute-path">DbUpdateConcurrencyException</a> being thrown.</td>
</tr>
<tr>
<td>Queries <br> (<code>total-queries</code> and <code>queries-per-second</code>)</td>
<td>The number of queries executed.</td>
</tr>
<tr>
<td>Query Cache Hit Rate (%) <br> (<code>compiled-query-cache-hit-rate</code>)</td>
<td>The ratio of query cache hits to misses. The first time a given LINQ query is executed by EF Core (excluding parameters), it must be compiled in what is a relatively heavy process. In a normal application, all queries are reused, and the query cache hit rate should be stable at 100% after an initial warmup period. If this number is less than 100% over time, you may experience degraded perf due to repeated compilations, which could be a result of suboptimal dynamic query generation.</td>
</tr>
<tr>
<td>SaveChanges <br>(<code>total-save-changes</code> and <code>save-changes-per-second</code>)</td>
<td>The number of times <code>SaveChanges</code> has been called. Note that <code>SaveChanges</code> saves multiple changes in a single batch, so this doesn't necessarily represent each individual update done on a single entity.</td>
</tr>
</tbody></table>

### Additional resources

- .NET documentation on event counters

Ref: [Metrics in EF Core](https://learn.microsoft.com/en-us/ef/core/logging-events-diagnostics/metrics)