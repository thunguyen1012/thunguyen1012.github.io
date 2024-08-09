---
title: Entity Framework - Entity Framework Core - Query data - SQL queries
published: true
date: 2024-08-09 08:30:15
tags: Summary, EFCore
description: Entity Framework Core allows you to drop down to SQL queries when working with a relational database.
image:
---

## In this article

Entity Framework Core allows you to drop down to SQL queries when working with a relational database.

> Tip
You can view this article's sample on GitHub.

## Basic SQL queries

You can use ```FromSql``` to begin a LINQ query based on a SQL query:

```csharp
var blogs = context.Blogs
    .FromSql($"SELECT * FROM dbo.Blogs")
    .ToList();
```

> Note
```FromSql``` was introduced in EF Core 7.0. When using older versions, use ```FromSqlInterpolated``` instead.

SQL queries can be used to execute a stored procedure which returns entity data:

```csharp
var blogs = context.Blogs
    .FromSql($"EXECUTE dbo.GetMostPopularBlogs")
    .ToList();
```

> Note
```FromSql``` can only be used directly on a ```DbSet```. It cannot be composed over an arbitrary LINQ query.

## Passing parameters

> Warning
Pay close attention to parameterization when using SQL queries
When introducing any user-provided values into a SQL query, care must be taken to avoid SQL injection attacks. SQL injection occurs when a program integrates a user-provided string value into a SQL query, and the user-provided value is crafted to terminate the string and perform another malicious SQL operation. To learn more about SQL injection, see this page.
The ```FromSql``` and ```FromSqlInterpolated``` methods are safe against SQL injection, and always integrate parameter data as a separate SQL parameter. However, the ```FromSqlRaw``` method can be vulnerable to SQL injection attacks, if improperly used. See below for more details.

The following example passes a single parameter to a stored procedure by including a parameter placeholder in the SQL query string and providing an additional argument:

```csharp
var user = "johndoe";

var blogs = context.Blogs
    .FromSql($"EXECUTE dbo.GetMostPopularBlogsForUser {user}")
    .ToList();
```

```FromSql``` sends the value of a parameter to the database in the form of a string.

When executing stored procedures, it can be useful to use named parameters in the SQL query string, especially when the stored procedure has optional parameters:

```csharp
var user = new SqlParameter("user", "johndoe");

var blogs = context.Blogs
    .FromSql($"EXECUTE dbo.GetMostPopularBlogsForUser @filterByUser={user}")
    .ToList();
```

The ```DbParameter``` class allows you to send a parameter to a database.

```csharp
var user = new SqlParameter("user", "johndoe");

var blogs = context.Blogs
    .FromSql($"EXECUTE dbo.GetMostPopularBlogsForUser {user}")
    .ToList();
```

> Note
The parameters you pass must exactly match the stored procedure definition. Pay special attention to the ordering of the parameters, taking care to not miss or misplace any of them - or consider using named parameter notation. Also, make sure the parameter types correspond, and that their facets (size, precision, scale) are set as needed.

### Dynamic SQL and parameters

In this article, I'll show you how to use FromSql to query a database.

```c#
var propertyName = "User";
var propertyValue = "johndoe";

var blogs = context.Blogs
    .FromSql($"SELECT * FROM [Blogs] WHERE {propertyName} = {propertyValue}")
    .ToList();
```

This code doesn't work, since databases do not allow parameterizing column names (or any other part of the schema).

In this article, I'm going to show you how to dynamically construct a query that accepts a column name from a user.

If you want to dynamically construct your SQL, you'll have to use ```FromSqlRaw```, which allows interpolating variable data directly into the SQL string: If you want to dynamically construct your SQL, you'll have to use ```FromSqlRaw```, which allows interpolating variable data directly into

```csharp
var columnName = "Url";
var columnValue = new SqlParameter("columnValue", "http://SomeURL");

var blogs = context.Blogs
    .FromSqlRaw($"SELECT * FROM [Blogs] WHERE {columnName} = @columnValue", columnValue)
    .ToList();
```

This code shows how to insert a column name directly into a SQL query, using C# string interpolation.

On the other hand, the column value is sent via a ```DbParameter```, and is therefore safe in the face of SQL injection.

> Warning
Be very careful when using FromSqlRaw, and always make sure values are either from a safe origin, or are properly sanitized. SQL injection attacks can have disasterous consequences for your application.

## Composing with LINQ

You can use EF Core to write SQL queries to your database.

```csharp
var searchTerm = "Lorem ipsum";

var blogs = context.Blogs
    .FromSql($"SELECT * FROM dbo.SearchBlogs({searchTerm})")
    .Where(b => b.Rating > 3)
    .OrderByDescending(b => b.Rating)
    .ToList();
```

The above query generates the following SQL:

```sql
SELECT [b].[BlogId], [b].[OwnerId], [b].[Rating], [b].[Url]
FROM (
    SELECT * FROM dbo.SearchBlogs(@p0)
) AS [b]
WHERE [b].[Rating] > 3
ORDER BY [b].[Rating] DESC
```

### Including related data

The ```Include``` operator can be used to load related data, just like with any other LINQ query:

```csharp
var searchTerm = "Lorem ipsum";

var blogs = context.Blogs
    .FromSql($"SELECT * FROM dbo.SearchBlogs({searchTerm})")
    .Include(b => b.Posts)
    .ToList();
```

EF Core's composable SQL query feature allows you to query the database using any SQL query language.

- A trailing semicolon

- On SQL Server, a trailing query-level hint (for example, ```OPTION (HASH JOIN)```)

- On SQL Server, an ```ORDER BY``` clause that isn't used with ```OFFSET 0``` OR ```TOP 100 PERCENT``` in the ```SELECT``` clause

EF Core tries to compose over a stored procedure call.

## Change Tracking

The ```FromSql``` or ```FromSqlRaw``` query syntax is very similar to the ```FromSql``` or ```FromSqlRaw``` query syntax in EF Core.

The following example uses a SQL query that selects from a Table-Valued Function (TVF), then disables change tracking with the call to ```AsNoTracking```:

```csharp
var searchTerm = "Lorem ipsum";

var blogs = context.Blogs
    .FromSql($"SELECT * FROM dbo.SearchBlogs({searchTerm})")
    .AsNoTracking()
    .ToList();
```

## Querying scalar (non-entity) types

> Note
This feature was introduced in EF Core 7.0.

Sql is an extension of the ```FromSql``` query language.

```csharp
var ids = context.Database
    .SqlQuery<int>($"SELECT [BlogId] FROM [Blogs]")
    .ToList();
```

In this article, I'm going to show you how to add operators to your SQL query.

```csharp
var overAverageIds = context.Database
    .SqlQuery<int>($"SELECT [BlogId] AS [Value] FROM [Blogs]")
    .Where(id => id > context.Blogs.Average(b => b.BlogId))
    .ToList();
```

```FromSql``` can be used with any type supported by your database provider.

```SqlQueryRaw``` allows for dynamic construction of SQL queries, just like ```FromSqlRaw``` does for entity types.

## Executing non-querying SQL

In this article we are going to look at how to execute SQL which does not return any data.

```csharp
using (var context = new BloggingContext())
{
    var rowsModified = context.Database.ExecuteSql($"UPDATE [Blogs] SET [Url] = NULL");
}
```

```ExecuteSqlRaw``` is a subclass of ```FromSqlRaw```.

> Note
Prior to EF Core 7.0, it was sometimes necessary to use the ```ExecuteSql``` APIs to perform a "bulk update" on the database, as above; this is considerably more efficient than querying for all matching rows and then using ```SaveChanges``` to modify them. EF Core 7.0 introduced ```ExecuteUpdate``` and ```ExecuteDelete```, which made it possible to express efficient bulk update operations via LINQ. It's recommended to use those APIs whenever possible, instead of ```ExecuteSql```.

## Limitations

There are a few limitations to be aware of when returning entity types from SQL queries:

- The SQL query must return data for all properties of the entity type.

- The column names in the result set must match the column names that properties are mapped to. Note that this behavior is different from EF6; EF6 ignored property-to-column mapping for SQL queries, and result set column names had to match those property names.

- The SQL query can't contain related data. However, in many cases you can compose on top of the query using the ```Include``` operator to return related data (see Including related data).

Ref: [SQL Queries](https://learn.microsoft.com/en-us/ef/core/querying/sql-queries)