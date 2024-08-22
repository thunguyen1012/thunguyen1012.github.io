---
title: Entity Framework - Entity Framework Core - Performance - Performance diagnosis
published: true
date: 2024-08-22 10:20:55
tags: Summary, EFCore
description: This section discusses ways for detecting performance issues in your EF application, and once a problematic area has been identified, how to further analyze them to identify the root problem. It's important to carefully diagnose and investigate any problems before jumping to any conclusions, and to avoid assuming where the root of the issue is.
image:
---

## In this article

If you are experiencing problems with your EF application, it's important to know how to diagnose them.

## Identifying slow database commands via logging

In this article, I'm going to show you how to monitor the time it takes EF to query your database.

EF makes it very easy to capture command execution times, via either simple logging or Microsoft.Extensions.Logging:

 - Simple logging

 - Microsoft.Extensions.Logging

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
{
    optionsBuilder
        .UseSqlServer(@"Server=(localdb)\mssqllocaldb;Database=Blogging;Trusted_Connection=True;ConnectRetryCount=0")
        .LogTo(Console.WriteLine, LogLevel.Information);
}
```

```csharp
private static ILoggerFactory ContextLoggerFactory
    => LoggerFactory.Create(b => b.AddConsole().AddFilter("", LogLevel.Information));

protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
{
    optionsBuilder
        .UseSqlServer(@"Server=(localdb)\mssqllocaldb;Database=Blogging;Trusted_Connection=True;ConnectRetryCount=0")
        .UseLoggerFactory(ContextLoggerFactory);
}
```

When the logging level is set at ```LogLevel.Information```, EF emits a log message for each command execution with the time taken:

```log
info: 06/12/2020 09:12:36.117 RelationalEventId.CommandExecuted[20101] (Microsoft.EntityFrameworkCore.Database.Command)
      Executed DbCommand (4ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
      SELECT [b].[Id], [b].[Name]
      FROM [Blogs] AS [b]
      WHERE [b].[Name] = N'foo'
```

Command logging allows you to see how long it takes for a given command to run.

> Warning
Leaving command execution logging enabled in your production environment is usually a bad idea. The logging itself slows down your application, and may quickly create huge log files which can fill up your server's disk. It's recommended to only keep logging on for a short interval of time to gather data - while carefully monitoring your application - or to capture logging data on a pre-production system.

## Correlating database commands to LINQ queries

In this article, I'm going to show you how to use EF's command execution logging feature.

```csharp
var myLocation = new Point(1, 2);
var nearestPeople = (from f in context.People.TagWith("This is my spatial query!")
                     orderby f.Location.Distance(myLocation) descending
                     select f).Take(5).ToList();
```

The tag shows up in the logs:

```sql
-- This is my spatial query!

SELECT TOP(@__p_1) [p].[Id], [p].[Location]
FROM [People] AS [p]
ORDER BY [p].[Location].STDistance(@__myLocation_0) DESC
```

It's often worth tagging the major queries of an application in this way, to make the command execution logs more immediately readable.

## Other interfaces for capturing performance data

In this article, we'll look at some of the ways in which EF can be used to monitor database performance.

SQL Server offers a number of tools that can help you monitor and manage your SQL Server instance.

Another approach for capturing performance data is to collect information automatically emitted by either EF or the database driver via the ```DiagnosticSource``` interface, and then analyze that data or display it on a dashboard. If you are using Azure, then Azure Application Insights provides such powerful monitoring out of the box, integrating database performance and query execution times in the analysis of how quickly your web requests are being served. More information on this is available in the Application Insights performance tutorial, and in the Azure SQL analytics page.

## Inspecting query execution plans

In our series of articles on how to improve the performance of your SQL queries, we'll be looking at how to optimize your queries.

In this article, I'm going to show you how to identify slow queries using SQL Server.



In this article, I'm going to show you how to write an execution plan.

While the above information is specific to SQL Server, other databases typically provide the same kind of tools with similar visualization.

> Important
Databases sometimes generate different query plans depending on actual data in the database. For example, if a table contains only a few rows, a database may choose not to use an index on that table, but to perform a full table scan instead. If analyzing query plans on a test database, always make sure it contains data that is similar to your production system.

## Metrics

In this article, I'm going to show you how to get performance information about the Entity Framework (EF).

See the dedicated page on EF's metrics for more information.

## Benchmarking with EF Core

In this article, I'm going to show you how to write a benchmark.

> Tip
The full benchmark project for the source below is available here. You are encouraged to copy it and use it as a template for your own benchmarks.

As a simple benchmark scenario, let's compare the following different methods of calculating the average ranking of all Blogs in our database:

- Load all entities, sum up their individual rankings, and calculate the average.

- The same as above, only use a non-tracking query. This should be faster, since identity resolution isn't performed, and the entities aren't snapshotted for the purposes of change tracking.

- Avoid loading the entire Blog entity instances at all, by projecting out the ranking only. The saves us from transferring the other, unneeded columns of the Blog entity type.

- Calculate the average in the database by making it part of the query. This should be the fastest way, since everything is calculated in the database and only the result is transferred back to the client.

BenchmarkDotNet makes it easy to benchmark the performance of your code.

 - Load entities

 - Load entities, no tracking

 - Project only ranking

 - Calculate in database

```csharp
[Benchmark]
public double LoadEntities()
{
    var sum = 0;
    var count = 0;
    using var ctx = new BloggingContext();
    foreach (var blog in ctx.Blogs)
    {
        sum += blog.Rating;
        count++;
    }

    return (double)sum / count;
}
```

```csharp
[Benchmark]
public double LoadEntitiesNoTracking()
{
    var sum = 0;
    var count = 0;
    using var ctx = new BloggingContext();
    foreach (var blog in ctx.Blogs.AsNoTracking())
    {
        sum += blog.Rating;
        count++;
    }

    return (double)sum / count;
}
```

```csharp
[Benchmark]
public double ProjectOnlyRanking()
{
    var sum = 0;
    var count = 0;
    using var ctx = new BloggingContext();
    foreach (var rating in ctx.Blogs.Select(b => b.Rating))
    {
        sum += rating;
        count++;
    }

    return (double)sum / count;
}
```

```csharp
[Benchmark(Baseline = true)]
public double CalculateInDatabase()
{
    using var ctx = new BloggingContext();
    return ctx.Blogs.Average(b => b.Rating);
}
```

The results are below, as printed by BenchmarkDotNet:

<table><thead>
<tr>
<th>Method</th>
<th style="text-align: right;">Mean</th>
<th style="text-align: right;">Error</th>
<th style="text-align: right;">StdDev</th>
<th style="text-align: right;">Median</th>
<th style="text-align: right;">Ratio</th>
<th style="text-align: right;">RatioSD</th>
<th style="text-align: right;">Gen 0</th>
<th style="text-align: right;">Gen 1</th>
<th style="text-align: right;">Gen 2</th>
<th style="text-align: right;">Allocated</th>
</tr>
</thead>
<tbody>
<tr>
<td>LoadEntities</td>
<td style="text-align: right;">2,860.4 us</td>
<td style="text-align: right;">54.31 us</td>
<td style="text-align: right;">93.68 us</td>
<td style="text-align: right;">2,844.5 us</td>
<td style="text-align: right;">4.55</td>
<td style="text-align: right;">0.33</td>
<td style="text-align: right;">210.9375</td>
<td style="text-align: right;">70.3125</td>
<td style="text-align: right;">-</td>
<td style="text-align: right;">1309.56 KB</td>
</tr>
<tr>
<td>LoadEntitiesNoTracking</td>
<td style="text-align: right;">1,353.0 us</td>
<td style="text-align: right;">21.26 us</td>
<td style="text-align: right;">18.85 us</td>
<td style="text-align: right;">1,355.6 us</td>
<td style="text-align: right;">2.10</td>
<td style="text-align: right;">0.14</td>
<td style="text-align: right;">87.8906</td>
<td style="text-align: right;">3.9063</td>
<td style="text-align: right;">-</td>
<td style="text-align: right;">540.09 KB</td>
</tr>
<tr>
<td>ProjectOnlyRanking</td>
<td style="text-align: right;">910.9 us</td>
<td style="text-align: right;">20.91 us</td>
<td style="text-align: right;">61.65 us</td>
<td style="text-align: right;">892.9 us</td>
<td style="text-align: right;">1.46</td>
<td style="text-align: right;">0.14</td>
<td style="text-align: right;">41.0156</td>
<td style="text-align: right;">0.9766</td>
<td style="text-align: right;">-</td>
<td style="text-align: right;">252.08 KB</td>
</tr>
<tr>
<td>CalculateInDatabase</td>
<td style="text-align: right;">627.1 us</td>
<td style="text-align: right;">14.58 us</td>
<td style="text-align: right;">42.54 us</td>
<td style="text-align: right;">626.4 us</td>
<td style="text-align: right;">1.00</td>
<td style="text-align: right;">0.00</td>
<td style="text-align: right;">4.8828</td>
<td style="text-align: right;">-</td>
<td style="text-align: right;">-</td>
<td style="text-align: right;">33.27 KB</td>
</tr>
</tbody></table>

> Note
As the methods instantiate and dispose the context within the method, these operations are counted for the benchmark, although strictly speaking they are not part of the querying process. This should not matter if the goal is to compare two alternatives to one another (since the context instantiation and disposal are the same), and gives a more holistic measurement for the entire operation.

One limitation of BenchmarkDotNet is that it measures simple, single-thread performance of the methods you provide, and is therefore not well-suited for benchmarking concurrent scenarios.

> Important
Always make sure to have data in your database that is similar to production data when benchmarking, otherwise the benchmark results may not represent actual performance in production.

Ref: [Performance Diagnosis](https://learn.microsoft.com/en-us/ef/core/performance/performance-diagnosis)