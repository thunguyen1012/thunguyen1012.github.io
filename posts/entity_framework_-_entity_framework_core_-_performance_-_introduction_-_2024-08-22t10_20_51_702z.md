---
title: Entity Framework - Entity Framework Core - Performance - Introduction
published: true
date: 2024-08-22 10:20:51
tags: Summary, EFCore
description: Database performance is a vast and complex topic, spanning an entire stack of components: the database, networking, the database driver, and data access layers such as EF Core. While high-level layers and O/RMs such as EF Core considerably simplify application development and improve maintainability, they can sometimes be opaque, hiding performance-critical internal details such as the SQL being executed. This section attempts to provide an overview of how to achieve good performance with EF Core, and how to avoid common pitfalls which can degrade application performance.
image:
---

## In this article

How to achieve good performance with EF Core, and how to avoid common pitfalls which can degrade application performance.

## Identify bottlenecks and measure, measure, measure

In our series of articles on database performance, we look at how to diagnose slow queries.

Don't rely on public benchmarks to tell you which database solution is best for your application.

## Aspects of data access performance

Overall data access performance can be broken down into the following broad categories:

- Pure database performance. With relational database, EF translates the application's LINQ queries into the SQL statements getting executed by the database; these SQL statements themselves can run more or less efficiently. The right index in the right place can make a world of difference in SQL performance, or rewriting your LINQ query may make EF generate a better SQL query.

- Network data transfer. As with any networking system, it's important to limit the amount of data going back and forth on the wire. This covers making sure that you only send and load data which you're actually going to need, but also avoiding the so-called "cartesian explosion" effect when loading related entities.

- Network roundtrips. Beyond the amount of data going back and forth, the network roundtrips, since the time taken for a query to execute in the database can be dwarfed by the time packets travel back and forth between your application and your database. Roundtrip overhead heavily depends on your environment; the further away your database server is, the higher the latency and the costlier each roundtrip. With the advent of the cloud, applications increasingly find themselves further away from the database, and "chatty" applications which perform too many roundtrips experience degraded performance. Therefore, it's important to understand exactly when your application contacts the database, how many roundtrips it performs, and whether that number can be minimized.

- EF runtime overhead. Finally, EF itself adds some runtime overhead to database operations: EF needs to compile your queries from LINQ to SQL (although that should normally be done only once), change tracking adds some overhead (but can be disabled), etc. In practice, the EF overhead for real-world applications is likely to be negligible in most cases, as query execution time in the database and network latency dominate the total time; but it's important to understand what your options are and how to avoid some pitfalls.

## Know what's happening under the hood

The Entity Framework (EF) is a component of the SQL Server operating system.

## Cache outside the database

The most efficient way to interact with a database, is to not interact with it at all.

Ref: [Introduction to Performance](https://learn.microsoft.com/en-us/ef/core/performance/)