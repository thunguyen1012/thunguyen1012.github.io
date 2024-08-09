---
title: Entity Framework - Entity Framework Core - Query data - Pagination
published: true
date: 2024-08-09 08:28:48
tags: Summary, EFCore
description: Pagination refers to retrieving results in pages, rather than all at once; this is typically done for large resultsets, where a user interface is shown that allows the user to navigate to the next or previous page of the results.
image:
---

## In this article

Pagination refers to retrieving results in pages, rather than all at once; this is typically done for large resultsets, where a user interface is shown that allows the user to navigate to the next or previous page of the results.

> Warning
Regardless of the pagination method used, always make sure that your ordering is fully unique. For example, if results are ordered only by date, but there can be multiple results with the same date, then results could be skipped when paginating as they're ordered differently across two paginating queries. Ordering by both date and ID (or any other unique property or combination of properties) makes the ordering fully unique and avoids this problem. Note that relational databases do not apply any ordering by default, even on the primary key.

## Offset pagination

A common way to implement pagination with databases is to use the ```Skip``` and ```Take``` (OFFSET and ```LIMIT``` in SQL). Given a page size of 10 results, the third page can be fetched with EF Core as follows:

```csharp
var position = 20;
var nextPage = context.Posts
    .OrderBy(b => b.PostId)
    .Skip(position)
    .Take(10)
    .ToList();
```

Unfortunately, while this technique is very intuitive, it also has some severe shortcomings:

- The database must still process the first 20 entries, even if they aren't returned to the application; this creates possibly significant computation load that increases with the number of rows being skipped.

- If any updates occur concurrently, your pagination may end up skipping certain entries or showing them twice. For example, if an entry is removed as the user is moving from page 2 to 3, the whole resultset "shifts up", and one entry would be skipped.

## Keyset pagination

In this article I'm going to show you how to use the ```WHERE``` clause to skip rows in a query.

```csharp
var lastId = 55;
var nextPage = context.Posts
    .OrderBy(b => b.PostId)
    .Where(b => b.PostId > lastId)
    .Take(10)
    .ToList();
```

Assuming an index is defined on ```PostId```, this query is very efficient, and also isn't sensitive to any concurrent changes happening in lower Id values.

Keyset and Random Access are two implementations of the same class.

### Multiple pagination keys

When using keyset pagination, it's frequently necessary to order by more than one property. For example, the following query paginates by date and ID:

```csharp
var lastDate = new DateTime(2020, 1, 1);
var lastId = 55;
var nextPage = context.Posts
    .OrderBy(b => b.Date)
    .ThenBy(b => b.PostId)
    .Where(b => b.Date > lastDate || (b.Date == lastDate && b.PostId > lastId))
    .Take(10)
    .ToList();
```

This ensures that the next page picks off exactly where the previous one ended. As more ordering keys are added, additional clauses can be added.

> Note
Most SQL databases support a simpler and more efficient version of the above, using row values: ```WHERE (Date, Id) > (@lastDate, @lastId)```. EF Core does not currently support expressing this in LINQ queries, this is tracked by #26822.

## Indexes

An index is a set of parameters that can be used to define a query.

For more information, see the documentation page on indexes.

## Additional resources

- To learn more about the shortcomings of offset-based pagination and about keyset pagination, see this post.

- .NET Data Community Standup session where we discuss pagination and demo all the above concepts.

- A technical deep dive presentation comparing offset and keyset pagination. While the content deals with the PostgreSQL database, the general information is valid for other relational databases as well.

- For extensions on top of EF Core which simplify keyset pagination, see MR.EntityFrameworkCore.KeysetPagination and MR.AspNetCore.Pagination.

Ref: [Pagination](https://learn.microsoft.com/en-us/ef/core/querying/pagination)