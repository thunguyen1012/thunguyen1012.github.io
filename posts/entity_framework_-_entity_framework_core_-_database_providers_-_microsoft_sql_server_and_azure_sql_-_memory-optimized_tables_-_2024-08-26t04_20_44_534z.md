---
title: Entity Framework - Entity Framework Core - Database providers - Microsoft SQL Server and Azure SQL - Memory-optimized tables
published: true
date: 2024-08-26 04:20:44
tags: Summary, EFCore
description: Memory-Optimized Tables are a feature of SQL Server where the entire table resides in memory. A second copy of the table data is maintained on disk, but only for durability purposes. Data in memory-optimized tables is only read from disk during database recovery. For example, after a server restart.
image:
---

## In this article

Memoryd tables are a feature of SQL Server where data is stored in memory.

## Configuring a memory-optimized table

A memory table is a set of entities that can be mapped to a database.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>().ToTable(b => b.IsMemoryOptimized());
}
```

Ref: [Memory-Optimized Tables support in SQL Server EF Core Database Provider](https://learn.microsoft.com/en-us/ef/core/providers/sql-server/memory-optimized-tables)