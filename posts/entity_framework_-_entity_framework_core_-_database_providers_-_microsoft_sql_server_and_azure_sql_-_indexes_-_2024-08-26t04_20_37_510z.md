---
title: Entity Framework - Entity Framework Core - Database providers - Microsoft SQL Server and Azure SQL - Indexes
published: true
date: 2024-08-26 04:20:37
tags: Summary, EFCore
description: This page details index configuration options that are specific to the SQL Server provider.
image:
---

## In this article

This page details index configuration options that are specific to the SQL Server provider.

## Clustering

You can create a clustered index for your table to improve the speed of your queries.

By default, the primary key column of a table is implicitly backed by a clustered index, and all other indexes are non-clustered.

You can configure an index or key to be clustered as follows:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>().HasIndex(b => b.PublishedOn).IsClustered();
}
```

> Note
SQL Server only supports one clustered index per table, and the primary key is by default clustered. If you'd like to have a clustered index on a non-key column, you must explicitly make your key non-clustered.

## Fill factor

The index fill-factor option is provided for fine-tuning index data storage and performance. For more information, see the SQL Server documentation on fill factor.

You can configure an index's fill factor as follows:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>().HasIndex(b => b.PublishedOn).HasFillFactor(10);
}
```

## Online creation

The ONLINE option allows concurrent user access to the underlying table or clustered index data and any associated nonclustered indexes during index creation, so that users can continue to update and query the underlying data.

You can configure an index with the ONLINE option as follows:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>().HasIndex(b => b.PublishedOn).IsCreatedOnline();
}
```

Ref: [Index features specific to the Entity Framework Core SQL Server provider](https://learn.microsoft.com/en-us/ef/core/providers/sql-server/indexes)