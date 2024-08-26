---
title: Entity Framework - Entity Framework Core - Database providers - Microsoft SQL Server and Azure SQL - Columns
published: true
date: 2024-08-26 04:20:29
tags: Summary, EFCore
description: This page details column configuration options that are specific to the SQL Server provider.
image:
---

## In this article

This page details column configuration options that are specific to the SQL Server provider.

## Unicode and UTF-8

SQL Server 2019 introduced introduced UTF-8 support, which allows storing UTF-8 data in ```char``` and ```varchar``` columns by configuring them with special UTF-8 collations. EF Core 7.0 introduced full support for mapping to UTF-8 columns, and it's possible to use them in previous EF versions as well, with some extra steps.

 - EF Core 7.0

```c#
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .Property(b => b.Name)
        .HasColumnType("varchar(max)")
        .UseCollation("LATIN1_GENERAL_100_CI_AS_SC_UTF8")
        .IsUnicode();
}
```

 - Older versions
```c#
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .Property(b => b.Name)
        .UseCollation("LATIN1_GENERAL_100_CI_AS_SC_UTF8");
}
```

## Sparse columns

Sparse columns are ordinary columns that have an optimized storage for null values, reducing the space requirements for null values at the cost of more overhead to retrieve non-null values.

In some cases, it may make sense to configure a column as sparse, in order to reduce the space requirements. in these cases, it may make sense to configure the column as sparse, in order to reduce the space requirements.

A column can be made sparse via the Fluent API:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<RareBlog>()
        .Property(b => b.RareProperty)
        .IsSparse();
}
```

For more information on sparse columns, see the SQL Server docs.

Ref: [Column features specific to the Entity Framework Core SQL Server provider](https://learn.microsoft.com/en-us/ef/core/providers/sql-server/columns)