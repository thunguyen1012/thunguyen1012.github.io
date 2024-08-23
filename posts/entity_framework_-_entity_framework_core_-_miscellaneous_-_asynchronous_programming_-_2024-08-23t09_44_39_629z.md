---
title: Entity Framework - Entity Framework Core - Miscellaneous - Asynchronous programming
published: true
date: 2024-08-23 09:44:39
tags: Summary, EFCore
description: Asynchronous operations avoid blocking a thread while the query is executed in the database. Async operations are important for keeping a responsive UI in rich client applications, and can also increase throughput in web applications where they free up the thread to service other requests in web applications.
image:
---

## In this article

Async operations are used to query a database.

Following the .NET standard, EF Core provides asynchronous counterparts to all synchronous methods which perform I/O. These have the same effects as the sync methods, and can be used with the C# ```async``` and ```await``` keywords. For example, instead of using ```DbContext.SaveChanges```, which will block a thread while database I/O is performed, ```DbContext.SaveChangesAsync``` can be used:

```csharp
var blog = new Blog { Url = "http://sample.com" };
context.Blogs.Add(blog);
await context.SaveChangesAsync();
```

For more information, see the general C# asynchronous programming docs.

> Warning
EF Core doesn't support multiple parallel operations being run on the same context instance. You should always wait for an operation to complete before beginning the next operation. This is typically done by using the ```await``` keyword on each ```async``` operation.

> Warning
The ```async``` implementation of ```Microsoft.Data.SqlClient``` unfortunately has some known issues (e.g. #593, #601, and others). If you're seeing unexpected performance problems, try using sync command execution instead, especially when dealing with large text or binary values.

> Note
EF Core passes cancellation tokens down to the underlying database provider in use (e.g. Microsoft.Data.SqlClient). These tokens may or may not be honored - consult your database provider's documentation.

## Async LINQ operators

In order to support executing LINQ queries asynchronously, EF Core provides a set of ```async``` extension methods which execute the query and return results. These counterparts to the standard, synchronous LINQ operators include ```ToListAsync```, ```SingleAsync```, ```AsAsyncEnumerable```, etc.:

```csharp
var blogs = await context.Blogs.Where(b => b.Rating > 3).ToListAsync();
```

Note that there are no ```async``` versions of some LINQ operators such as Where or OrderBy, because these only build up the LINQ expression tree and don't cause the query to be executed in the database. Only operators which cause query execution have ```async``` counterparts.

> Important
The EF Core ```async``` extension methods are defined in the ```Microsoft.EntityFrameworkCore``` namespace. This namespace must be imported for the methods to be available.

## Client-side ```async``` LINQ operators

The ```async``` LINQ operators discussed above can only be used on EF queries - you cannot use them with client-side LINQ to Objects query. To perform client-side ```async``` LINQ operations outside of EF, use the ```System.Linq.Async``` package; this package can be especially useful for performing operations on the client that cannot be translated for evaluation at the server.

In EF Core 6.0 and lower, referencing ```System.Linq.Async``` unfortunately causes ambiguous invocation compilation errors on LINQ operators applied to EF's DbSets; this makes it hard to use both EF and ```System.Linq.Async``` in the same project. To work around this issue, add AsQueryable to your DbSet:

```csharp
var groupedHighlyRatedBlogs = await context.Blogs
    .AsQueryable()
    .Where(b => b.Rating > 3) // server-evaluated
    .AsAsyncEnumerable()
    .GroupBy(b => b.Rating) // client-evaluated
    .ToListAsync();
```

Ref: [Asynchronous Programming](https://learn.microsoft.com/en-us/ef/core/miscellaneous/async)