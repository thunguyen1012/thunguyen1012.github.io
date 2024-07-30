---
title: Entity Framework - Entity Framework Core - Query data - Overview
published: true
date: 2024-07-30 09:47:37
tags: EFCore, Summary
description: Entity Framework Core allows you to query data from a relational database.
image:
---

## In this article

Entity Framework Core allows you to query data from a relational database.

> Tip
You can view this article's sample on GitHub.

The following snippets show a few examples of how to achieve common tasks with Entity Framework Core.

## Loading all data

```csharp
using (var context = new BloggingContext())
{
    var blogs = context.Blogs.ToList();
}
```

## Loading a single entity

```csharp
using (var context = new BloggingContext())
{
    var blog = context.Blogs
        .Single(b => b.BlogId == 1);
}
```

## Filtering

```csharp
using (var context = new BloggingContext())
{
    var blogs = context.Blogs
        .Where(b => b.Url.Contains("dotnet"))
        .ToList();
}
```

## Further readings

- Learn more about LINQ query expressions

- For more detailed information on how a query is processed in EF Core, see How queries Work.

Ref: [Querying Data](https://learn.microsoft.com/en-us/ef/core/querying/)