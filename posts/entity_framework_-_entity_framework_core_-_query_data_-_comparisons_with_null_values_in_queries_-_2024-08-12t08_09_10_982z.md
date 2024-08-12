---
title: Entity Framework - Entity Framework Core - Query data - Comparisons with null values in queries
published: true
date: 2024-08-12 08:09:10
tags: Summary, EFCore
description: EF Core tries to compensate for the difference between C# and SQL when translating queries to SQL.
image:
---

## In this article

## Introduction

EF Core tries to compensate for the difference between C# and SQL when translating queries to SQL.

```csharp
public class NullSemanticsEntity
{
    public int Id { get; set; }
    public int Int { get; set; }
    public int? NullableInt { get; set; }
    public string String1 { get; set; }
    public string String2 { get; set; }
}
```

and issue several queries:

```csharp
var query1 = context.Entities.Where(e => e.Id == e.Int);
var query2 = context.Entities.Where(e => e.Id == e.NullableInt);
var query3 = context.Entities.Where(e => e.Id != e.NullableInt);
var query4 = context.Entities.Where(e => e.String1 == e.String2);
var query5 = context.Entities.Where(e => e.String1 != e.String2);
```

In this post I'm going to show you how to query two columns, ```NullableInt``` and ```Id```.

```sql
SELECT [e].[Id], [e].[Int], [e].[NullableInt], [e].[String1], [e].[String2]
FROM [Entities] AS [e]
WHERE [e].[Id] = [e].[Int]

SELECT [e].[Id], [e].[Int], [e].[NullableInt], [e].[String1], [e].[String2]
FROM [Entities] AS [e]
WHERE [e].[Id] = [e].[NullableInt]
```

The third query introduces a ```null``` check.

```sql
SELECT [e].[Id], [e].[Int], [e].[NullableInt], [e].[String1], [e].[String2]
FROM [Entities] AS [e]
WHERE ([e].[Id] <> [e].[NullableInt]) OR [e].[NullableInt] IS NULL
```

Queries four and five show the pattern when both columns are nullable. It's worth noting that the ```<>``` operation produces more complicated (and potentially slower) query than the ```==``` operation.

```sql
SELECT [e].[Id], [e].[Int], [e].[NullableInt], [e].[String1], [e].[String2]
FROM [Entities] AS [e]
WHERE ([e].[String1] = [e].[String2]) OR ([e].[String1] IS NULL AND [e].[String2] IS NULL)

SELECT [e].[Id], [e].[Int], [e].[NullableInt], [e].[String1], [e].[String2]
FROM [Entities] AS [e]
WHERE (([e].[String1] <> [e].[String2]) OR ([e].[String1] IS NULL OR [e].[String2] IS NULL)) AND ([e].[String1] IS NOT NULL OR [e].[String2] IS NOT NULL)
```

## Treatment of nullable values in functions

The following example shows how to use ```null``` arguments in SQL to produce more efficient queries.

```csharp
var query = context.Entities.Where(e => e.String1.Substring(0, e.String2.Length) == null);
```

The generated SQL is as follows (we don't need to evaluate the ```SUBSTRING``` function since it will be only ```null``` when either of the arguments to it is ```null```.):

```sql
SELECT [e].[Id], [e].[Int], [e].[NullableInt], [e].[String1], [e].[String2]
FROM [Entities] AS [e]
WHERE [e].[String1] IS NULL OR [e].[String2] IS NULL
```

The optimization can also be used for user-defined functions. See user defined function mapping page for more details.

## Writing performant queries

- Comparing non-nullable columns is simpler and faster than comparing nullable columns. Consider marking columns as non-nullable whenever possible.

- Checking for equality (```==```) is simpler and faster than checking for non-equality (```!=```), because query doesn't need to distinguish between ```null``` and ```false``` result. Use equality comparison whenever possible. However, simply negating ```==``` comparison is effectively the same as ```!=```, so it doesn't result in performance improvement.

- In some cases, it is possible to simplify a complex comparison by filtering out ```null``` values from a column explicitly - for example when no ```null``` values are present or these values are not relevant in the result. Consider the following example:

```csharp
var query1 = context.Entities.Where(e => e.String1 != e.String2 || e.String1.Length == e.String2.Length);
var query2 = context.Entities.Where(
    e => e.String1 != null && e.String2 != null && (e.String1 != e.String2 || e.String1.Length == e.String2.Length));
```

These queries produce the following SQL:

```sql
SELECT [e].[Id], [e].[Int], [e].[NullableInt], [e].[String1], [e].[String2]
FROM [Entities] AS [e]
WHERE ((([e].[String1] <> [e].[String2]) OR ([e].[String1] IS NULL OR [e].[String2] IS NULL)) AND ([e].[String1] IS NOT NULL OR [e].[String2] IS NOT NULL)) OR ((CAST(LEN([e].[String1]) AS int) = CAST(LEN([e].[String2]) AS int)) OR ([e].[String1] IS NULL AND [e].[String2] IS NULL))

SELECT [e].[Id], [e].[Int], [e].[NullableInt], [e].[String1], [e].[String2]
FROM [Entities] AS [e]
WHERE ([e].[String1] IS NOT NULL AND [e].[String2] IS NOT NULL) AND (([e].[String1] <> [e].[String2]) OR (CAST(LEN([e].[String1]) AS int) = CAST(LEN([e].[String2]) AS int)))
```

In the second query, ```null``` results are filtered out from ```String1``` column explicitly. EF Core can safely treat the ```String1``` column as non-nullable during comparison, resulting in a simpler query.

## Using relational ```null``` semantics

There is an issue with the ```null``` comparison compensation inside the options builder inside Onuring method.

```csharp
new SqlServerDbContextOptionsBuilder(optionsBuilder).UseRelationalNulls();
```

> Warning
When using relational ```null``` semantics, your LINQ queries no longer have the same meaning as they do in C#, and may yield different results than expected. Exercise caution when using this mode.

Ref: [Query ```null``` semantics](https://learn.microsoft.com/en-us/ef/core/querying/null-comparisons)