---
title: Entity Framework - Entity Framework Core - Query data - Tracking vs. no-tracking
published: true
date: 2024-07-30 09:48:28
tags: EFCore, Summary
description: Entity Framework Core now supports tracking of entities in its change tracker.
image:
---

## In this article

Entity Framework Core now supports tracking of entities in its change tracker.

> Note
Keyless entity types are never tracked. Wherever this article mentions entity types, it refers to entity types which have a key defined.

> Tip
You can view this article's sample on GitHub.

## Tracking queries

The following example shows how toggling between tracking queries and ```SaveChanges```.

```csharp
var blog = context.Blogs.SingleOrDefault(b => b.BlogId == 1);
blog.Rating = 5;
context.SaveChanges();
```

EF Core searches for entities in the context of an entry in the database.

## No-tracking queries

No-tracking queries give results based on what's in the database disregarding any local changes or added entities.

```csharp
var blogs = context.Blogs
    .AsNoTracking()
    .ToList();
```

The default tracking behavior can be changed at the context instance level:

```csharp
context.ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;

var blogs = context.Blogs.ToList();
```

The next section explains when a no-tracking query might be less efficient than a tracking query.

## Identity resolution

EF Core does no tracking of entities.

- Don't use the change tracker and don't do identity resolution.

- Return a new instance of the entity even when the same entity is contained in the result multiple times.

In this post I'm going to show you how to combine tracking and no-tracking in a query.

```csharp
var blogs = context.Blogs
    .AsNoTrackingWithIdentityResolution()
    .ToList();
```

## Configuring the default tracking behavior

If you find yourself changing the tracking behavior for many queries, you may want to change the default instead:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
{
    optionsBuilder
        .UseSqlServer(@"Server=(localdb)\mssqllocaldb;Database=EFQuerying.Tracking;Trusted_Connection=True;ConnectRetryCount=0")
        .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
}
```

This makes all your queries no-tracking by default. You can still add AsTracking to make specific queries tracking.

## Tracking and custom projections

If the result type of the query is an entity type, EF Core will track entity types contained in the result set.

```csharp
var blog = context.Blogs
    .Select(
        b =>
            new { Blog = b, PostCount = b.Posts.Count() });
```

If the result set contains entity types coming out from LINQ composition, EF Core will track them.

```csharp
var blog = context.Blogs
    .Select(
        b =>
            new { Blog = b, Post = b.Posts.OrderBy(p => p.Rating).LastOrDefault() });
```

If the result set contains any entity types, then tracking is done.

```csharp
var blog = context.Blogs
    .Select(
        b =>
            new { Id = b.BlogId, b.Url });
```

Here's how EF Core works.

```csharp
var blogs = context.Blogs
    .OrderByDescending(blog => blog.Rating)
    .Select(
        blog => new { Id = blog.BlogId, Url = StandardizeUrl(blog) })
    .ToList();
```

```csharp
public static string StandardizeUrl(Blog blog)
{
    var url = blog.Url.ToLower();

    if (!url.StartsWith("http://"))
    {
        url = string.Concat("http://", url);
    }

    return url;
}
```

EF Core doesn't track the keyless entity instances contained in the result. But EF Core tracks all the other instances of entity types with a key according to rules above.

## Previous versions

Before version 3.0, EF Core had some differences in how tracking was done. Notable differences are as follows:

- As explained in the Client vs Server Evaluation page, EF Core supported client evaluation in any part of the query before version 3.0. Client evaluation caused materialization of entities, which weren't part of the result. So EF Core analyzed the result to detect what to track. This design had certain differences as follows:

  - Client evaluation in the projection, which caused materialization but didn't return the materialized entity instance wasn't tracked. The following example didn't track ```blog``` entities.
var blogs = context.Blogs
    .OrderByDescending(blog => ```blog```.Rating)
    .Select(
        ```blog``` => new { Id = ```blog```.BlogId, Url = StandardizeUrl(blog) })
    .ToList();

```csharp
var blogs = context.Blogs
    .OrderByDescending(blog => blog.Rating)
    .Select(
        blog => new { Id = blog.BlogId, Url = StandardizeUrl(blog) })
    .ToList();
```

  - EF Core didn't track the objects coming out of LINQ composition in certain cases. The following example didn't track ```Post```.
var ```blog``` = context.Blogs
    .Select(
        b =>
            new { ```Blog``` = b, ```Post``` = b.Posts.OrderBy(p => p.Rating).LastOrDefault() });

```csharp
var blog = context.Blogs
    .Select(
        b =>
            new { Blog = b, Post = b.Posts.OrderBy(p => p.Rating).LastOrDefault() });
```

- Whenever query results contained keyless entity types, the whole query was made non-tracking. That means that entity types with keys, which are in the result weren't being tracked either.

- EF Core used to do identity resolution in no-tracking queries. It used weak references to keep track of entities that had already been returned. So if a result set contained the same entity multiples times, you would get the same instance for each occurrence. Though if a previous result with the same identity went out of scope and got garbage collected, EF Core returned a new instance.

Ref: [Tracking vs. No-Tracking Queries](https://learn.microsoft.com/en-us/ef/core/querying/tracking)