---
title: Entity Framework - Entity Framework Core - Query data - Split queries
published: true
date: 2024-07-31 10:03:05
tags: EFCore, Summary
description: This page shows an alternative way to load related entities in an EF query.
image:
---

## In this article

## Performance issues with single queries

This page shows an alternative way to load related entities in an EF query.

### Cartesian explosion

Let's examine the following LINQ query and its translated SQL equivalent:

```c#
var blogs = ctx.Blogs
    .Include(b => b.Posts)
    .Include(b => b.Contributors)
    .ToList();
```

```sql
SELECT [b].[Id], [b].[Name], [p].[Id], [p].[BlogId], [p].[Title], [c].[Id], [c].[BlogId], [c].[FirstName], [c].[LastName]
FROM [Blogs] AS [b]
LEFT JOIN [Posts] AS [p] ON [b].[Id] = [p].[BlogId]
LEFT JOIN [Contributors] AS [c] ON [b].[Id] = [c].[BlogId]
ORDER BY [b].[Id], [p].[Id]
```

In this article, I'm going to show you how to avoid this problem in a relational database application.

Note that cartesian explosion does not occur when the two JOINs aren't at the same level:

```c#
var blogs = ctx.Blogs
    .Include(b => b.Posts)
    .ThenInclude(p => p.Comments)
    .ToList();
```

```sql
SELECT [b].[Id], [b].[Name], [t].[Id], [t].[BlogId], [t].[Title], [t].[Id0], [t].[Content], [t].[PostId]
FROM [Blogs] AS [b]
LEFT JOIN [Posts] AS [p] ON [b].[Id] = [p].[BlogId]
LEFT JOIN [Comment] AS [c] ON [p].[Id] = [c].[PostId]
ORDER BY [b].[Id], [t].[Id]
```

The following query returns a list of all comments made on a post.

### Data duplication

JOINs can create another type of performance issue. Let's examine the following query, which only loads a single collection navigation:

```c#
var blogs = ctx.Blogs
    .Include(b => b.Posts)
    .ToList();
```

```sql
SELECT [b].[Id], [b].[Name], [b].[HugeColumn], [p].[Id], [p].[BlogId], [p].[Title]
FROM [Blogs] AS [b]
LEFT JOIN [Posts] AS [p] ON [b].[Id] = [p].[BlogId]
ORDER BY [b].[Id]
```

This query returns a list of all the posts on a particular blog.

If you don't actually need the huge column, it's easy to simply not query for it:

```c#
var blogs = ctx.Blogs
    .Select(b => new
    {
        b.Id,
        b.Name,
        b.Posts
    })
    .ToList();
```

This example shows how to project a blog to an anonymous type.

In this article, I'm going to show you how to use JOINs in your tables.

## Split queries

This article describes how to split a query into multiple SQL queries.

```csharp
using (var context = new BloggingContext())
{
    var blogs = context.Blogs
        .Include(blog => blog.Posts)
        .AsSplitQuery()
        .ToList();
}
```

It will produce the following SQL:

```sql
SELECT [b].[BlogId], [b].[OwnerId], [b].[Rating], [b].[Url]
FROM [Blogs] AS [b]
ORDER BY [b].[BlogId]

SELECT [p].[PostId], [p].[AuthorId], [p].[BlogId], [p].[Content], [p].[Rating], [p].[Title], [b].[BlogId]
FROM [Blogs] AS [b]
INNER JOIN [Posts] AS [p] ON [b].[BlogId] = [p].[BlogId]
ORDER BY [b].[BlogId]
```

> Warning
When using split queries with ```Skip/Take```, pay special attention to making your query ordering fully unique; not doing so could cause incorrect data to be returned. For example, if results are ordered only by date, but there can be multiple results with the same date, then each one of the split queries could each get different results from the database. Ordering by both date and ID (or any other unique property or combination of properties) makes the ordering fully unique and avoids this problem. Note that relational databases do not apply any ordering by default, even on the primary key.

> Note
One-to-one related entities are always loaded via JOINs in the same query, as it has no performance impact.

## Enabling split queries globally

You can also configure split queries as the default for your application's context:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
{
    optionsBuilder
        .UseSqlServer(
            @"Server=(localdb)\mssqllocaldb;Database=EFQuerying;Trusted_Connection=True;ConnectRetryCount=0",
            o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery));
}
```

When split queries are configured as the default, it's still possible to configure specific queries to execute as single queries:

```csharp
using (var context = new SplitQueriesBloggingContext())
{
    var blogs = context.Blogs
        .Include(blog => blog.Posts)
        .AsSingleQuery()
        .ToList();
}
```

EF Core uses single query mode by default in the absence of any configuration. Since it may cause performance issues, EF Core generates a warning whenever following conditions are met:

- EF Core detects that the query loads multiple collections.

- User hasn't configured query splitting mode globally.

- User hasn't used ```AsSingleQuery```/AsSplitQuery operator on the query.

To turn off the warning, configure query splitting mode globally or at the query level to an appropriate value.

## Characteristics of split queries

While split query avoids the performance issues associated with JOINs and cartesian explosion, it also has some drawbacks:

- While most databases guarantee data consistency for single queries, no such guarantees exist for multiple queries. If the database is updated concurrently when executing your queries, resulting data may not be consistent. You can mitigate it by wrapping the queries in a serializable or snapshot transaction, although doing so may create performance issues of its own. For more information, see your database's documentation.

- Each query currently implies an additional network roundtrip to your database. Multiple network roundtrips can degrade performance, especially where latency to the database is high (for example, cloud services).

- While some databases allow consuming the results of multiple queries at the same time (SQL Server with MARS, Sqlite), most allow only a single query to be active at any given point. So all results from earlier queries must be buffered in your application's memory before executing later queries, which leads to increased memory requirements.

- When including reference navigations as well as collection navigations, each one of the split queries will include joins to the reference navigations. This can degrade performance, particularly if there are many reference navigations. Please upvote #29182 if this is something you'd like to see fixed.

In this article, we'll look at how to load related entities using a single or split query.

## Best practices
When using the `SplitQuery` option in Entity Framework Core (EF Core), it's important to consider several best practices and key points to ensure optimal performance and maintainability:

### 1. **Understand When to Use Split Queries**
   - **Complex Queries:** Split queries can help reduce the complexity of queries involving multiple collections or related entities. EF Core generates separate SQL queries for each collection, which can reduce the amount of data loaded at once.
   - **Performance:** Split queries can improve performance by reducing the amount of data loaded into memory at once. This is particularly beneficial when working with large datasets or when eager loading multiple related entities.

### 2. **Evaluate the Trade-offs**
   - **Additional Round Trips:** Using split queries results in multiple round trips to the database, which can introduce latency. Consider the trade-off between loading less data per query and the potential performance cost of multiple queries.
   - **Transaction Consistency:** Since split queries execute multiple SQL statements, there's a small window of time where the data in the database could change between queries, leading to potential inconsistencies. This is less of an issue in read-only scenarios but can be critical in transactional contexts.

### 3. **Use Split Queries for Large Datasets**
   - **Avoiding Memory Overhead:** When querying large datasets, split queries can help avoid loading large amounts of related data into memory all at once, which can lead to performance issues or even out-of-memory errors.
   - **Asynchronous Execution:** Consider using asynchronous methods (`await` and `async`) with split queries to avoid blocking the thread while waiting for the database response.

### 4. **Combine with Projection**
   - **Optimized Loading:** When using split queries, consider combining them with projection (using `.Select()` to load only the necessary fields) to further optimize data retrieval. This can minimize the data loaded from each query, improving performance.

### 5. **Monitor and Profile Queries**
   - **Query Performance:** Regularly monitor and profile the SQL generated by EF Core when using split queries. Use tools like SQL Server Profiler, EF Core logging, or Application Insights to track the performance impact of split queries.
   - **Tuning:** Based on the performance data, you might need to tune the split queries or adjust your database indexes to ensure that the queries are efficient.

### 6. **Consider Alternatives**
   - **Filtered Includes:** In some cases, filtered includes (`.Include(x => x.RelatedEntities.Where(...))`) might be a better alternative to split queries, especially when you only need a subset of the related data.
   - **Explicit Loading:** If split queries are causing issues, consider using explicit loading (`.Load()`) for related entities. This gives you more control over when and how related data is loaded.

### 7. **Version Considerations**
   - **EF Core Version:** Ensure that you're using a version of EF Core that fully supports split queries (introduced in EF Core 5.0). If you're using an older version, consider upgrading to take advantage of this feature.

### 8. **Testing and Validation**
   - **Test for Consistency:** Always test split queries to ensure they return consistent and expected results, especially in scenarios where data may change between queries.
   - **Automated Tests:** Include automated tests that cover the scenarios where split queries are used to catch any potential issues early in the development cycle.

By carefully considering these points, you can effectively use the `SplitQuery` option in EF Core to improve performance and manageability in your application.

Ref: [Single vs. Split Queries](https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries)