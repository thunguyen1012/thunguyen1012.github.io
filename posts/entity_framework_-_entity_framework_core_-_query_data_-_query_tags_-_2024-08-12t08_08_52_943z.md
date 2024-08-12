---
title: Entity Framework - Entity Framework Core - Query data - Query tags
published: true
date: 2024-08-12 08:08:52
tags: Summary, EFCore
description: Query tags help correlate LINQ queries in code with generated SQL queries captured in logs.
You annotate a LINQ query using the new TagWith() method:
image:
---

## In this article

Query tags help correlate LINQ queries in code with generated SQL queries captured in logs.
You annotate a LINQ query using the new ```TagWith()``` method:

> Tip
You can view this article's sample on GitHub.

```csharp
var myLocation = new Point(1, 2);
var nearestPeople = (from f in context.People.TagWith("This is my spatial query!")
                     orderby f.Location.Distance(myLocation) descending
                     select f).Take(5).ToList();
```

This LINQ query is translated to the following SQL statement:

```sql
-- This is my spatial query!

SELECT TOP(@__p_1) [p].[Id], [p].[Location]
FROM [People] AS [p]
ORDER BY [p].[Location].STDistance(@__myLocation_0) DESC
```

It's possible to call TagWith() many times on the same query.
Query tags are cumulative.
For example, given the following methods:

```csharp
private static IQueryable<Person> GetNearestPeople(SpatialContext context, Point myLocation)
    => from f in context.People.TagWith("GetNearestPeople")
       orderby f.Location.Distance(myLocation) descending
       select f;

private static IQueryable<T> Limit<T>(IQueryable<T> source, int limit) => source.TagWith("Limit").Take(limit);
```

The following query:

```csharp
var results = Limit(GetNearestPeople(context, new Point(1, 2)), 25).ToList();
```

Translates to:

```sql
-- GetNearestPeople

-- Limit

SELECT TOP(@__p_1) [p].[Id], [p].[Location]
FROM [People] AS [p]
ORDER BY [p].[Location].STDistance(@__myLocation_0) DESC
```

It's also possible to use multi-line strings as query tags.
For example:

```csharp
var results = Limit(GetNearestPeople(context, new Point(1, 2)), 25).TagWith(
                @"This is a multi-line
string").ToList();
```

Produces the following SQL:

```sql
-- GetNearestPeople

-- Limit

-- This is a multi-line
-- string

SELECT TOP(@__p_1) [p].[Id], [p].[Location]
FROM [People] AS [p]
ORDER BY [p].[Location].STDistance(@__myLocation_0) DESC
```

## Known limitations

Query tags aren't parameterizable: EF Core always treats query tags in the query as string literals that are included in the generated SQL.

Ref: [Query tags](https://learn.microsoft.com/en-us/ef/core/querying/tags)