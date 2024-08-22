---
title: Entity Framework - Entity Framework Core - Performance - Efficient querying
published: true
date: 2024-08-22 10:22:01
tags: Summary, EFCore
description: Querying efficiently is a vast subject, that covers subjects as wide-ranging as indexes, related entity loading strategies, and many others. This section details some common themes for making your queries faster, and pitfalls users typically encounter.
image:
---

## In this article

How do you make your queries faster?

## Use indexes properly

The performance of a query is an important consideration for any software developer.

```csharp
// Matches on start, so uses an index (on SQL Server)
var posts1 = context.Posts.Where(p => p.Title.StartsWith("A")).ToList();
// Matches on end, so does not use the index
var posts2 = context.Posts.Where(p => p.Title.EndsWith("A")).ToList();
```

A slow index query can be a sign that your database is suffering from indexing problems.

When using indexes in an EF application, it's important to keep in mind some general guidelines.

- While indexes speed up queries, they also slow down updates since they need to be kept up-to-date. Avoid defining indexes which aren't needed, and consider using index filters to limit the index to a subset of the rows, thereby reducing this overhead.

- Composite indexes can speed up queries which filter on multiple columns, but they can also speed up queries which don't filter on all the index's columns - depending on ordering. For example, an index on columns A and B speeds up queries filtering by A and B as well as queries filtering only by A, but it does not speed up queries only filtering over B.

- If a query filters by an expression over a column (e.g. ```price / 2```), a simple index cannot be used. However, you can define a stored persisted column for your expression, and create an index over that. Some databases also support expression indexes, which can be directly used to speed up queries filtering by any expression.

- Different databases allow indexes to be configured in various ways, and in many cases EF Core providers expose these via the Fluent API. For example, the SQL Server provider allows you to configure whether an index is clustered, or set its fill factor. Consult your provider's documentation for more information.

## Project only properties you need

Entity instances are instances of data stored in a database.

```csharp
foreach (var blog in context.Blogs)
{
    Console.WriteLine("Blog: " + blog.Url);
}
```

Although this code only actually needs each Blog's ```Url``` property, the entire Blog entity is fetched, and unneeded columns are transferred from the database:

```sql
SELECT [b].[BlogId], [b].[CreationDate], [b].[Name], [b].[Rating], [b].[Url]
FROM [Blogs] AS [b]
```

This can be optimized by using ```Select``` to tell EF which columns to project out:

```csharp
foreach (var blogName in context.Blogs.Select(b => b.Url))
{
    Console.WriteLine("Blog: " + blogName);
}
```

The resulting SQL pulls back only the needed columns:

```sql
SELECT [b].[Url]
FROM [Blogs] AS [b]
```

If you need to project out more than one column, project out to a C# anonymous type with the properties you want.

In this post I'm going to show you how to change the properties of an Entity Framework blog.

## Limit the resultset size

By default, a query returns all rows that matches its filters:

```csharp
var blogsAll = context.Posts
    .Where(p => p.Title.StartsWith("A"))
    .ToList();
```

If you want to test the performance of a query against real-world data, use a test database.

As a result, it's usually worth giving thought to limiting the number of results:

```csharp
var blogs25 = context.Posts
    .Where(p => p.Title.StartsWith("A"))
    .Take(25)
    .ToList();
```

Is there a way to show the number of rows in a database at a time?

## Efficient pagination

Pagination refers to retrieving results in pages, rather than all at once; this is typically done for large resultsets, where a user interface is shown that allows the user to navigate to the next or previous page of the results. A common way to implement pagination with databases is to use the ```Skip``` and ```Take``` operators (OFFSET and ```LIMIT``` in SQL); while this is an intuitive implementation, it's also quite inefficient. For pagination that allows moving one page at a time (as opposed to jumping to arbitrary pages), consider using keyset pagination instead.

For more information, see the documentation page on pagination.

## Avoid cartesian explosion when loading related entities

In relational databases, all related entities are loaded by introducing JOINs in single query.

```sql
SELECT [b].[BlogId], [b].[OwnerId], [b].[Rating], [b].[Url], [p].[PostId], [p].[AuthorId], [p].[BlogId], [p].[Content], [p].[Rating], [p].[Title]
FROM [Blogs] AS [b]
LEFT JOIN [Post] AS [p] ON [b].[BlogId] = [p].[BlogId]
ORDER BY [b].[BlogId], [p].[PostId]
```

This article explains how to avoid the "cartesian explosion" problem in your application.

EF allows avoiding this effect via the use of "split queries", which load the related entities via separate queries. For more information, read the documentation on split and single queries.

> Note
The current implementation of split queries executes a roundtrip for each query. We plan to improve this in the future, and execute all queries in a single roundtrip.

## Load related entities eagerly when possible

It's recommended to read the dedicated page on related entities before continuing with this section.

In this article, I'm going to show you how to use eager loading and filtered include to load related entities.

```csharp
using (var context = new BloggingContext())
{
    var filteredBlogs = context.Blogs
        .Include(
            blog => blog.Posts
                .Where(post => post.BlogId == 1)
                .OrderByDescending(post => post.Title)
                .Take(5))
        .ToList();
}
```

In some cases, it may be more efficient to just always load all Posts, rather than to execute the additional roundtrips and selectively get only the Posts you need.

### Beware of lazy loading

In this talk, I'm going to show you how to use lazy loading in the EF Core database.

Consider the following:

```csharp
foreach (var blog in context.Blogs.ToList())
{
    foreach (var post in blog.Posts)
    {
        Console.WriteLine($"Blog {blog.Url}, Post: {post.Title}");
    }
}
```

This seemingly innocent piece of code iterates through all the blogs and their posts, printing them out. Turning on EF Core's statement logging reveals the following:

```console
info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (1ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
      SELECT [b].[BlogId], [b].[Rating], [b].[Url]
      FROM [Blogs] AS [b]
info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (5ms) [Parameters=[@__p_0='1'], CommandType='Text', CommandTimeout='30']
      SELECT [p].[PostId], [p].[BlogId], [p].[Content], [p].[Title]
      FROM [Post] AS [p]
      WHERE [p].[BlogId] = @__p_0
info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (1ms) [Parameters=[@__p_0='2'], CommandType='Text', CommandTimeout='30']
      SELECT [p].[PostId], [p].[BlogId], [p].[Content], [p].[Title]
      FROM [Post] AS [p]
      WHERE [p].[BlogId] = @__p_0
info: Microsoft.EntityFrameworkCore.Database.Command[20101]
      Executed DbCommand (1ms) [Parameters=[@__p_0='3'], CommandType='Text', CommandTimeout='30']
      SELECT [p].[PostId], [p].[BlogId], [p].[Content], [p].[Title]
      FROM [Post] AS [p]
      WHERE [p].[BlogId] = @__p_0

... and so on
```

I'm having problems with lazy loading and N+1 problems.

In this post we're going to show you how to load some of the blog posts that we're going to be publishing over the next few weeks.

```csharp
foreach (var blog in context.Blogs.Select(b => new { b.Url, b.Posts }).ToList())
{
    foreach (var post in blog.Posts)
    {
        Console.WriteLine($"Blog {blog.Url}, Post: {post.Title}");
    }
}
```

This will make EF Core fetch all the Blogs - along with their Posts - in a single query. In some cases, it may also be useful to avoid cartesian explosion effects by using split queries.

> Warning
Because lazy loading makes it extremely easy to inadvertently trigger the N+1 problem, it is recommended to avoid it. Eager or explicit loading make it very clear in the source code when a database roundtrip occurs.

## Buffering and streaming

The difference between buffering and streaming queries is significant.

Whether a query buffers or streams depends on how it is evaluated:

```csharp
// ToList and ToArray cause the entire resultset to be buffered:
var blogsList = context.Posts.Where(p => p.Title.StartsWith("A")).ToList();
var blogsArray = context.Posts.Where(p => p.Title.StartsWith("A")).ToArray();

// Foreach streams, processing one row at a time:
foreach (var blog in context.Posts.Where(p => p.Title.StartsWith("A")))
{
    // ...
}

// AsEnumerable also streams, allowing you to execute LINQ operators on the client-side:
var doubleFilteredBlogs = context.Posts
    .Where(p => p.Title.StartsWith("A")) // Translated to SQL and executed in the database
    .AsEnumerable()
    .Where(p => SomeDotNetMethod(p)); // Executed at the client on all database results
```

If you have a large number of rows to query, then you might want to consider buffering your results.

> Note
Avoid using ```ToList``` or ```ToArray``` if you intend to use another LINQ operator on the result - this will needlessly buffer all results into memory. Use ```AsEnumerable``` instead.

### Internal buffering by EF

In certain situations, EF will itself buffer the resultset internally, regardless of how you evaluate your query. The two cases where this happens are:

- When a retrying execution strategy is in place. This is done to make sure the same results are returned if the query is retried later.

- When split query is used, the resultsets of all but the last query are buffered - unless MARS (Multiple Active Result Sets) is enabled on SQL Server. This is because it is usually impossible to have multiple query resultsets active at the same time.

You may want to consider buffering the resultset before loading it into memory.

## Tracking, no-tracking and identity resolution

It's recommended to read the dedicated page on tracking and no-tracking before continuing with this section.

Changes made to an instance of Entity Framework (EF) will be tracked and persisted.

- EF internally maintains a dictionary of tracked instances. When new data is loaded, EF checks the dictionary to see if an instance is already tracked for that entity's key (identity resolution). The dictionary maintenance and lookups take up some time when loading the query's results.

- Before handing a loaded instance to the application, EF snapshots that instance and keeps the snapshot internally. When SaveChanges is called, the application's instance is compared with the snapshot to discover the changes to be persisted. The snapshot takes up more memory, and the snapshotting process itself takes time; it's sometimes possible to specify different, possibly more efficient snapshotting behavior via value comparers, or to use change-tracking proxies to bypass the snapshotting process altogether (though that comes with its own set of disadvantages).

In read-only scenarios where changes aren't saved back to the database, the following overheads can be avoided:

In this post, I'm going to walk you through some of the differences between tracking and no-tracking queries.

Is it possible to track the number of posts on a blog?

<table><thead>
<tr>
<th>Method</th>
<th>NumBlogs</th>
<th>NumPostsPerBlog</th>
<th style="text-align: right;">Mean</th>
<th style="text-align: right;">Error</th>
<th style="text-align: right;">StdDev</th>
<th style="text-align: right;">Median</th>
<th style="text-align: right;">Ratio</th>
<th style="text-align: right;">RatioSD</th>
<th style="text-align: right;">Gen 0</th>
<th style="text-align: right;">Gen 1</th>
<th style="text-align: right;">Gen 2</th>
<th style="text-align: right;">Allocated</th>
</tr>
</thead>
<tbody>
<tr>
<td>AsTracking</td>
<td>10</td>
<td>20</td>
<td style="text-align: right;">1,414.7 us</td>
<td style="text-align: right;">27.20 us</td>
<td style="text-align: right;">45.44 us</td>
<td style="text-align: right;">1,405.5 us</td>
<td style="text-align: right;">1.00</td>
<td style="text-align: right;">0.00</td>
<td style="text-align: right;">60.5469</td>
<td style="text-align: right;">13.6719</td>
<td style="text-align: right;">-</td>
<td style="text-align: right;">380.11 KB</td>
</tr>
<tr>
<td>AsNoTracking</td>
<td>10</td>
<td>20</td>
<td style="text-align: right;">993.3 us</td>
<td style="text-align: right;">24.04 us</td>
<td style="text-align: right;">65.40 us</td>
<td style="text-align: right;">966.2 us</td>
<td style="text-align: right;">0.71</td>
<td style="text-align: right;">0.05</td>
<td style="text-align: right;">37.1094</td>
<td style="text-align: right;">6.8359</td>
<td style="text-align: right;">-</td>
<td style="text-align: right;">232.89 KB</td>
</tr>
</tbody></table>

In this paper, we demonstrate how to reduce the overhead of change tracking in the Entity Framework (EF).

## Using SQL queries

In most cases, SQL exists for your query in EF.

- Use SQL queries directly in your query, e.g. via FromSqlRaw. EF even lets you compose over the SQL with regular LINQ queries, allowing you to express only a part of the query in SQL. This is a good technique when the SQL only needs to be used in a single query in your codebase.

- Define a user-defined function (UDF), and then call that from your queries. Note that EF allows UDFs to return full resultsets - these are known as table-valued functions (TVFs) - and also allows mapping a ```DbSet``` to a function, making it look just like just another table.

- Define a database view and query from it in your queries. Note that unlike functions, views cannot accept parameters.

> Note
Raw SQL should generally be used as a last resort, after making sure that EF can't generate the SQL you want, and when performance is important enough for the given query to justify it. Using raw SQL brings considerable maintenance disadvantages.

## Asynchronous programming

In this article, I'm going to show you how to use asynchronous APIs.

For more information, see the page on async programming.

> Warning
Avoid mixing synchronous and asynchronous code in the same application - it's very easy to inadvertently trigger subtle thread-pool starvation issues.

> Warning
The async implementation of Microsoft.Data.SqlClient unfortunately has some known issues (e.g. #593, #601, and others). If you're seeing unexpected performance problems, try using sync command execution instead, especially when dealing with large text or binary values.

## Additional resources

- See the advanced performance topics page for additional topics related to efficient querying.

- See the performance section of the null comparison documentation page for some best practices when comparing nullable values.

Ref: [Efficient Querying](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying)