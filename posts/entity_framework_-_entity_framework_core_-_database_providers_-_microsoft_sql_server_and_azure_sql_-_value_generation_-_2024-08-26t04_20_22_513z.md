---
title: Entity Framework - Entity Framework Core - Database providers - Microsoft SQL Server and Azure SQL - Value generation
published: true
date: 2024-08-26 04:20:22
tags: Summary, EFCore
description: This page details value generation configuration  and patterns that are specific to the SQL Server provider. It's recommended to first read the general page on value generation.
image:
---

## In this article

This page details value generation configuration  and patterns that are specific to the SQL Server provider. It's recommended to first read the general page on value generation.

## IDENTITY columns

By convention, numeric columns that are configured to have their values generated on add are set up as SQL Server IDENTITY columns.

### Seed and increment

By default, IDENTITY columns start off at 1 (the seed), and increment by 1 each time a row is added (the increment). You can configure a different seed and increment as follows:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .Property(b => b.BlogId)
        .UseIdentityColumn(seed: 10, increment: 10);
}
```

### Inserting explicit values into IDENTITY columns

By default, SQL Server doesn't allow inserting explicit values into IDENTITY columns. To do so, you must manually enable ```IDENTITY_INSERT``` before calling ```SaveChanges()```, as follows:

```csharp
using (var context = new ExplicitIdentityValuesContext())
{
    context.Blogs.Add(new Blog { BlogId = 100, Url = "http://blog1.somesite.com" });
    context.Blogs.Add(new Blog { BlogId = 101, Url = "http://blog2.somesite.com" });

    context.Database.OpenConnection();
    try
    {
        context.Database.ExecuteSqlRaw("SET IDENTITY_INSERT dbo.Blogs ON");
        context.SaveChanges();
        context.Database.ExecuteSqlRaw("SET IDENTITY_INSERT dbo.Blogs OFF");
    }
    finally
    {
        context.Database.CloseConnection();
    }
}
```

> Note
We have a feature request on our backlog to do this automatically within the SQL Server provider.

## Sequences

IDENTITY columns draw their default values from a sequence.

SQL Server allows you to create sequences and use them as detailed in the general page on sequences. It's up to you to configure your properties to use sequences via ```HasDefaultValueSql()```.

## GUIDs

The provider provides a GUID primary key that can be inserted into a database, and a GUID dependent that references that key.

To have EF generate the same sequential GUID values for non-key properties, configure them as follows:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>().Property(b => b.Guid).HasValueGenerator(typeof(SequentialGuidValueGenerator));
}
```

## Rowversions

SQL Server has the ```rowversion``` data type, which automatically changes whenever the row is updated. This makes it very useful as a concurrency token, for managing cases where the same row is simultaneously updated by multiple transactions.

To fully understand concurrency tokens and how to use them, read the dedicated page on concurrency conflicts. To map a byte[] property to a ```rowversion``` column, configure it as follows:

 - Data Annotations

 - Fluent API

```c#
public class Person
{
    public int PersonId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }

    [Timestamp]
    public byte[] Version { get; set; }
}
```

```c#
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Person>()
        .Property(p => p.Version)
        .IsRowVersion();
}
```

Ref: [SQL Server Value Generation](https://learn.microsoft.com/en-us/ef/core/providers/sql-server/value-generation)