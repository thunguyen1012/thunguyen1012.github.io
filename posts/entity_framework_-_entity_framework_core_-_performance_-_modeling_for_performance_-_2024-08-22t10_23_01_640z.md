---
title: Entity Framework - Entity Framework Core - Performance - Modeling for performance
published: true
date: 2024-08-22 10:23:01
tags: Summary, EFCore
description: In many cases, the way you model can have a profound impact on the performance of your application; while a properly normalized and "correct" model is usually a good starting point, in real-world applications some pragmatic compromises can go a long way for achieving good performance. Since it's quite difficult to change your model once an application is running in production, it's worth keeping performance in mind when creating the initial model.
image:
---

## In this article

In our series of articles on software development, we look at the importance of model-driven development.

## Denormalization and caching

In our series of posts on how to query your database, we are going to look at denormalization.

How do I keep my blog's average rating up to date?

The following details some techniques for denormalization and caching in EF Core, and points to the relevant sections in the documentation.

### Stored computed columns

If the data to be cached is a product of other columns in the same table, then a stored computed column can be a perfect solution. For example, a ```Customer``` may have ```FirstName``` and ```LastName``` columns, but we may need to search by the customer's full name. A stored computed column is automatically maintained by the database - which recalculates it whenever the row is changed - and you can even define an index over it to speed up queries.

### Update cache columns when inputs change

In this article, we'll look at how to recalculate a cached column when it needs to reference inputs from outside the table's row.

One way to do this, is to perform the update yourself, via the regular EF Core API. ```SaveChanges``` Events or interceptors can be used to automatically check if any Posts are being updated, and to perform the recalculation that way. Note that this typically entails additional database roundtrips, as additional commands must be sent.

In this article, I'm going to walk you through how to define a trigger for an EF migration.

### Materialized/indexed views

Materialized views are a new type of table view.

materialized views and SQL Server Indexed Views are two types of views in SQL Server.

Is there an API for creating and maintaining views, materialized/indexed or otherwise?

## Inheritance mapping

It's recommended to read the dedicated page on inheritance before continuing with this section.

EF Core currently supports three techniques for mapping an inheritance model to a relational database:

- Table-per-hierarchy (TPH), in which an entire .NET hierarchy of classes is mapped to a single database table.

- Table-per-type (TPT), in which each type in the .NET hierarchy is mapped to a different table in the database.

- Table-per-concrete-type (TPC), in which each concrete type in the .NET hierarchy is mapped to a different table in the database, where each table contains columns for all properties of the corresponding type.

The choice of inheritance mapping technique can have a considerable impact on application performance - it's recommended to carefully measure before committing to a choice.

TPT is a mapping technique for the .NET database hierarchy.

> Tip
If your database system supports it (e.g. SQL Server), then consider using "sparse columns" for TPH columns that will be rarely populated.

TPT is a popular mapping technique for relational databases.

In this article we will be comparing the performance of  and TPC when querying entities of a single leaf type.

In this article, I'm going to show you how to set up a hierarchy of rows in a database.

<table><thead>
<tr>
<th>Method</th>
<th style="text-align: right;">Mean</th>
<th style="text-align: right;">Error</th>
<th style="text-align: right;">StdDev</th>
<th style="text-align: right;">Gen 0</th>
<th style="text-align: right;">Gen 1</th>
<th style="text-align: right;">Allocated</th>
</tr>
</thead>
<tbody>
<tr>
<td>TPH</td>
<td style="text-align: right;">149.0 ms</td>
<td style="text-align: right;">3.38 ms</td>
<td style="text-align: right;">9.80 ms</td>
<td style="text-align: right;">4000.0000</td>
<td style="text-align: right;">1000.0000</td>
<td style="text-align: right;">40 MB</td>
</tr>
<tr>
<td>TPT</td>
<td style="text-align: right;">312.9 ms</td>
<td style="text-align: right;">6.17 ms</td>
<td style="text-align: right;">10.81 ms</td>
<td style="text-align: right;">9000.0000</td>
<td style="text-align: right;">3000.0000</td>
<td style="text-align: right;">75 MB</td>
</tr>
<tr>
<td>TPC</td>
<td style="text-align: right;">158.2 ms</td>
<td style="text-align: right;">3.24 ms</td>
<td style="text-align: right;">8.88 ms</td>
<td style="text-align: right;">5000.0000</td>
<td style="text-align: right;">2000.0000</td>
<td style="text-align: right;">46 MB</td>
</tr>
</tbody></table>

In this post I'm going to show you how to compare the performance of actual, TPC, and TPT against one another.

Ref: [Modeling for Performance](https://learn.microsoft.com/en-us/ef/core/performance/modeling-for-performance)