---
title: Entity Framework - Entity Framework Core - Query data - Client vs. server evaluation
published: true
date: 2024-07-30 09:48:01
tags: EFCore, Summary
description: Entity Framework Core attempts to evaluate queries on the server as much as possible.
image:
---

## In ```this``` article

Entity Framework Core attempts to evaluate queries on the server as much as possible.

> Note
Prior to version 3.0, Entity Framework Core supported client evaluation anywhere in the query. For more information, see the previous versions section.

> Tip
You can view this article's sample on GitHub.

## Client evaluation in the top-level projection

Is it possible to query a SQL Server database using a helper method?

```csharp
var blogs = context.Blogs
    .OrderByDescending(blog => blog.Rating)
    .Select(
        blog => new { Id = blog.BlogId, Url = StandardizeUrl(blog.Url) })
    .ToList();
```

```csharp
public static string StandardizeUrl(string url)
{
    url = url.ToLower();

    if (!url.StartsWith("http://"))
    {
        url = string.Concat("http://", url);
    }

    return url;
}
```

## Unsupported client evaluation

Entity Framework Core blocks client evaluation.

```csharp
var blogs = context.Blogs
    .Where(blog => StandardizeUrl(blog.Url).Contains("dotnet"))
    .ToList();
```

## Explicit client evaluation

You may need to force into client evaluation explicitly in certain cases like following

- The amount of data is small so that evaluating on the client doesn't incur a huge performance penalty.

- The LINQ operator being used has no server-side translation.

In some cases, you might want to stream the results of a query to a client.

```csharp
var blogs = context.Blogs
    .AsEnumerable()
    .Where(blog => StandardizeUrl(blog.Url).Contains("dotnet"))
    .ToList();
```

> Tip
If you are using ```AsAsyncEnumerable``` and want to compose the query further on client side then you can use System.Interactive.Async library which defines operators for async enumerables. For more information, see client side linq operators.

## Potential memory leak in client evaluation

EF Core uses an expression tree to store query plans for top-level projection.

- Using an instance method: When using instance methods in a client projection, the expression tree contains a constant of the instance. If your method doesn't use any data from the instance, consider making the method static. If you need instance data in the method body, then pass the specific data as an argument to the method.

- Passing constant arguments to method: This case arises generally by using this in an argument to client method. Consider splitting the argument in to multiple scalar arguments, which can be mapped by the database provider.

- Other constants: If a constant is come across in any other case, then you can evaluate whether the constant is needed in processing. If it's necessary to have the constant, or if you can't use a solution from the above cases, then create a local variable to store the value and use local variable in the query. EF Core will convert the local variable into a parameter.

## Previous versions

The following section applies to EF Core versions before 3.0.

A client evaluation warning has been reported in the latest release of EF Core.

If you're using .NET Core or .NET Framework 3.0 or later, you'll be able to change the default behavior of EF Core.

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
{
    optionsBuilder
        .UseSqlServer(@"Server=(localdb)\mssqllocaldb;Database=EFQuerying;Trusted_Connection=True;")
        .ConfigureWarnings(warnings => warnings.Throw(RelationalEventId.QueryClientEvaluationWarning));
}
```

Ref: [Client vs. Server Evaluation](https://learn.microsoft.com/en-us/ef/core/querying/client-eval)