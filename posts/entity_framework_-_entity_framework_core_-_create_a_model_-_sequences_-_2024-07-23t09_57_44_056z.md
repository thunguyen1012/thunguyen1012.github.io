---
title: Entity Framework - Entity Framework Core - Create a model - Sequences
published: true
date: 2024-07-23 09:57:44
tags: EFCore, Summary
description: A sequence generates unique, sequential numeric values in the database. Sequences are not associated with a specific table, and multiple tables can be set up to draw values from the same sequence.
image:
---
- Article

  - 01/30/2023

  - 4 contributors

## In this article

> Note
Sequences are a feature typically supported only by relational databases. If you're using a non-relational database such as Azure Cosmos DB, check your database documentation on generating unique values.

A sequence generates unique, sequential numeric values in the database. Sequences are not associated with a specific table, and multiple tables can be set up to draw values from the same sequence.

## Basic usage

You can set up a sequence in the model, and then use it to generate values for properties:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.HasSequence<int>("OrderNumbers");

    modelBuilder.Entity<Order>()
        .Property(o => o.OrderNo)
        .HasDefaultValueSql("NEXT VALUE FOR OrderNumbers");
}
```

The following example shows how to generate a value from a sequence using SQL Server.

## Configuring sequence settings

You can also configure additional aspects of the sequence, such as its schema, start value, increment, etc.:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.HasSequence<int>("OrderNumbers", schema: "shared")
        .StartsAt(1000)
        .IncrementsBy(5);
}
```

Ref: [Sequences](https://learn.microsoft.com/en-us/ef/core/modeling/sequences)