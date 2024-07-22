---
title: Entity Framework - Entity Framework Core - Create a model - Indexes and constraints
published: true
date: 2024-07-22 09:49:06
tags: EFCore, Summary
description: An index is a set of columns that can be used to retrieve data from a data store.
image:
---
- Article

  - 12/18/2023

  - 10 contributors

## In this article

An index is a set of columns that can be used to retrieve data from a data store.

You can specify an index over a column as follows:

 - Data Annotations

 - Fluent API

```csharp
[Index(nameof(Url))]
public class Blog
{
    public int BlogId { get; set; }
    public string Url { get; set; }
}
```

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasIndex(b => b.Url);
}
```

> Note
By convention, an index is created in each property (or set of properties) that are used as a foreign key.

## Composite index

An index can also span more than one column:

 - Data Annotations

 - Fluent API

```csharp
[Index(nameof(FirstName), nameof(LastName))]
public class Person
{
    public int PersonId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
}
```

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Person>()
        .HasIndex(p => new { p.FirstName, p.LastName });
}
```

See the performance docs for more information.

## Index uniqueness

By default, indexes aren't unique: multiple rows are allowed to have the same value(s) for the index's column set. You can make an index unique as follows:

 - Data Annotations

 - Fluent API

```csharp
[Index(nameof(Url), IsUnique = true)]
public class Blog
{
    public int BlogId { get; set; }
    public string Url { get; set; }
}
```

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasIndex(b => b.Url)
        .IsUnique();
}
```

Attempting to insert more than one entity with the same values for the index's column set will cause an exception to be thrown.

## Index sort order

> Note
This feature is being introduced in EF Core 7.0.

The sort order of an index's columns affects its performance.

The index sort order is ascending by default. You can make all columns have descending order as follows:

 - Data Annotations

 - Fluent API

```csharp
[Index(nameof(Url), nameof(Rating), AllDescending = true)]
public class Blog
{
    public int BlogId { get; set; }
    public string Url { get; set; }
    public int Rating { get; set; }
}
```

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasIndex(b => new { b.Url, b.Rating })
        .IsDescending();
}
```

You may also specify the sort order on a column-by-column basis as follows:

 - Data Annotations

 - Fluent API

```csharp
[Index(nameof(Url), nameof(Rating), IsDescending = new[] { false, true })]
public class Blog
{
    public int BlogId { get; set; }
    public string Url { get; set; }
    public int Rating { get; set; }
}
```

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasIndex(b => new { b.Url, b.Rating })
        .IsDescending(false, true);
}
```

## Index naming and multiple indexes

By convention, indexes created in a relational database are named IX_<type name>_<property name>. For composite indexes, <property name> becomes an underscore separated list of property names.

You can set the name of the index created in the database:

 - Data Annotations

 - Fluent API

```csharp
[Index(nameof(Url), Name = "Index_Url")]
public class Blog
{
    public int BlogId { get; set; }
    public string Url { get; set; }
}
```

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasIndex(b => b.Url)
        .HasDatabaseName("Index_Url");
}
```

Note that if you call ```HasIndex``` more than once on the same set of properties, that continues to configure a single index rather than create a new one:

```csharp
modelBuilder.Entity<Blog>()
    .HasIndex(b => new { b.FirstName, b.LastName })
    .HasDatabaseName("IX_Names_Ascending");

modelBuilder.Entity<Blog>()
    .HasIndex(b => new { b.FirstName, b.LastName })
    .HasDatabaseName("IX_Names_Descending")
    .IsDescending();
```

Since the second ```HasIndex``` call overrides the first one, this creates only a single, descending index. This can be useful for further configuring an index that was created by convention.

To create multiple indexes over the same set of properties, pass a name to the ```HasIndex```, which will be used to identify the index in the EF model, and to distinguish it from other indexes on the same properties:

```c#
modelBuilder.Entity<Blog>()
    .HasIndex(b => new { b.FirstName, b.LastName }, "IX_Names_Ascending");

modelBuilder.Entity<Blog>()
    .HasIndex(b => new { b.FirstName, b.LastName }, "IX_Names_Descending")
    .IsDescending();
```

Note that this name is also used as a default for the database name, so explicitly calling ```HasDatabaseName``` isn't required.

## Index filter

This article describes how to specify a filtered index in a SQL Server database.

You can use the Fluent API to specify a filter on an index, provided as a SQL expression:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasIndex(b => b.Url)
        .HasFilter("[Url] IS NOT NULL");
}
```

When using the SQL Server provider EF adds an 'IS NOT NULL' filter for all nullable columns that are part of a unique index. To override this convention you can supply a ```null``` value.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasIndex(b => b.Url)
        .IsUnique()
        .HasFilter(null);
}
```

## Included columns

In this article, I'm going to show you how to improve query performance in a relational database.

In this article, I'm going to show you how to use the index key to query a table.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasIndex(p => p.Url)
        .IncludeProperties(
            p => new { p.Title, p.PublishedOn });
}
```

## Check constraints

Check constraints allow you to restrict access to data in a table.

You can use the Fluent API to specify a check constraint on a table, provided as a SQL expression:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder
        .Entity<Product>()
        .ToTable(b => b.HasCheckConstraint("CK_Prices", "[Price] > [DiscountedPrice]"));
}
```

Multiple check constraints can be defined on the same table, each with their own name.

Note: some common check constraints can be configured via the community package EFCore.CheckConstraints.

Ref: [Indexes](https://learn.microsoft.com/en-us/ef/core/modeling/indexes)