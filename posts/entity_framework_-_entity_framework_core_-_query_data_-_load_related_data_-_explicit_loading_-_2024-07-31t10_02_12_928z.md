---
title: Entity Framework - Entity Framework Core - Query data - Load related data - Explicit loading
published: true
date: 2024-07-31 10:02:12
tags: EFCore, Summary
description: You can explicitly load a navigation property via the DbContext.Entry(...) API.
image:
---

## In this article

## Explicit loading

You can explicitly load a navigation property via the ```DbContext.Entry(...)``` API.

```csharp
using (var context = new BloggingContext())
{
    var blog = context.Blogs
        .Single(b => b.BlogId == 1);

    context.Entry(blog)
        .Collection(b => b.Posts)
        .Load();

    context.Entry(blog)
        .Reference(b => b.Owner)
        .Load();
}
```

You can explicitly load a navigation property by executing a query that returns the related entities.

## Querying related entities

You can also get a LINQ query that represents the contents of a navigation property.

This allows you to apply other operators over the query. For example, applying an aggregate operator over the related entities without loading them into memory.

```csharp
using (var context = new BloggingContext())
{
    var blog = context.Blogs
        .Single(b => b.BlogId == 1);

    var postCount = context.Entry(blog)
        .Collection(b => b.Posts)
        .Query()
        .Count();
}
```

You can also filter which related entities are loaded into memory.

```csharp
using (var context = new BloggingContext())
{
    var blog = context.Blogs
        .Single(b => b.BlogId == 1);

    var goodPosts = context.Entry(blog)
        .Collection(b => b.Posts)
        .Query()
        .Where(p => p.Rating > 3)
        .ToList();
}
```

Ref: [Explicit Loading of Related Data](https://learn.microsoft.com/en-us/ef/core/querying/related-data/explicit)