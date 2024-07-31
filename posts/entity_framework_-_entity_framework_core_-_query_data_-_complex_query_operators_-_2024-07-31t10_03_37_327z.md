---
title: Entity Framework - Entity Framework Core - Query data - Complex query operators
published: true
date: 2024-07-31 10:03:37
tags: EFCore, Summary
description: This page describes some of the complex operators supported by SqlServer.
image:
---

## In this article

This page describes some of the complex operators supported by SqlServer.

> Tip
You can view this article's sample on GitHub.

## Join

EF Core has two join operators.

```csharp
var query = from photo in context.Set<PersonPhoto>()
            join person in context.Set<Person>()
                on photo.PersonPhotoId equals person.PhotoId
            select new { person, photo };
```

```sql
SELECT [p].[PersonId], [p].[Name], [p].[PhotoId], [p0].[PersonPhotoId], [p0].[Caption], [p0].[Photo]
FROM [PersonPhoto] AS [p0]
INNER JOIN [Person] AS [p] ON [p0].[PersonPhotoId] = [p].[PhotoId]
```

Further, if the key selectors are anonymous types, EF Core generates a join condition to compare equality component-wise.

```csharp
var query = from photo in context.Set<PersonPhoto>()
            join person in context.Set<Person>()
                on new { Id = (int?)photo.PersonPhotoId, photo.Caption }
                equals new { Id = person.PhotoId, Caption = "SN" }
            select new { person, photo };
```

```sql
SELECT [p].[PersonId], [p].[Name], [p].[PhotoId], [p0].[PersonPhotoId], [p0].[Caption], [p0].[Photo]
FROM [PersonPhoto] AS [p0]
INNER JOIN [Person] AS [p] ON ([p0].[PersonPhotoId] = [p].[PhotoId] AND ([p0].[Caption] = N'SN'))
```

## GroupJoin

In this post I'm going to show you how to use the GroupJoin operator in EF Core.

```csharp
var query = from b in context.Set<Blog>()
            join p in context.Set<Post>()
                on b.BlogId equals p.BlogId into grouping
            select new { b, grouping };
```

```csharp
var query = from b in context.Set<Blog>()
            join p in context.Set<Post>()
                on b.BlogId equals p.BlogId into grouping
            select new { b, Posts = grouping.Where(p => p.Content.Contains("EF")).ToList() };
```

## SelectMany

The SelectMany operator allows you to enumerate over a collection selector for each outer element and generate values from each source of data.

### Collection selector doesn't reference outer

When the collection selector isn't referencing anything from the outer source, the result is a cartesian product of both data sources. It translates to ```CROSS JOIN``` in relational databases.

```csharp
var query = from b in context.Set<Blog>()
            from p in context.Set<Post>()
            select new { b, p };
```

```sql
SELECT [b].[BlogId], [b].[OwnerId], [b].[Rating], [b].[Url], [p].[PostId], [p].[AuthorId], [p].[BlogId], [p].[Content], [p].[Rating], [p].[Title]
FROM [Blogs] AS [b]
CROSS JOIN [Posts] AS [p]
```

### Collection selector references outer in a where clause

EF Core translates the join condition of a collection selector into the join condition of a database join.

```csharp
var query = from b in context.Set<Blog>()
            from p in context.Set<Post>().Where(p => b.BlogId == p.BlogId)
            select new { b, p };

var query2 = from b in context.Set<Blog>()
             from p in context.Set<Post>().Where(p => b.BlogId == p.BlogId).DefaultIfEmpty()
             select new { b, p };
```

```sql
SELECT [b].[BlogId], [b].[OwnerId], [b].[Rating], [b].[Url], [p].[PostId], [p].[AuthorId], [p].[BlogId], [p].[Content], [p].[Rating], [p].[Title]
FROM [Blogs] AS [b]
INNER JOIN [Posts] AS [p] ON [b].[BlogId] = [p].[BlogId]

SELECT [b].[BlogId], [b].[OwnerId], [b].[Rating], [b].[Url], [p].[PostId], [p].[AuthorId], [p].[BlogId], [p].[Content], [p].[Rating], [p].[Title]
FROM [Blogs] AS [b]
LEFT JOIN [Posts] AS [p] ON [b].[BlogId] = [p].[BlogId]
```

### Collection selector references outer in a non-where case

When we query a database to join an element, we query the collection selector for that element.

```csharp
var query = from b in context.Set<Blog>()
            from p in context.Set<Post>().Select(p => b.Url + "=>" + p.Title)
            select new { b, p };

var query2 = from b in context.Set<Blog>()
             from p in context.Set<Post>().Select(p => b.Url + "=>" + p.Title).DefaultIfEmpty()
             select new { b, p };
```

```sql
SELECT [b].[BlogId], [b].[OwnerId], [b].[Rating], [b].[Url], ([b].[Url] + N'=>') + [p].[Title] AS [p]
FROM [Blogs] AS [b]
CROSS APPLY [Posts] AS [p]

SELECT [b].[BlogId], [b].[OwnerId], [b].[Rating], [b].[Url], ([b].[Url] + N'=>') + [p].[Title] AS [p]
FROM [Blogs] AS [b]
OUTER APPLY [Posts] AS [p]
```

## GroupBy

server GroupBy operators create a result of type ```IGrouping<TKey, TElement>``` where ```TKey``` and ```TElement``` could be any type.

```csharp
var query = from p in context.Set<Post>()
            group p by p.AuthorId
            into g
            select new { g.Key, Count = g.Count() };
```

```sql
SELECT [p].[AuthorId] AS [Key], COUNT(*) AS [Count]
FROM [Posts] AS [p]
GROUP BY [p].[AuthorId]
```

EF Core translates queries where an aggregate operator on a grouping appears in a GroupBy (or other ordering) operator.

```csharp
var query = from p in context.Set<Post>()
            group p by p.AuthorId
            into g
            where g.Count() > 0
            orderby g.Key
            select new { g.Key, Count = g.Count() };
```

```sql
SELECT [p].[AuthorId] AS [Key], COUNT(*) AS [Count]
FROM [Posts] AS [p]
GROUP BY [p].[AuthorId]
HAVING COUNT(*) > 0
ORDER BY [p].[AuthorId]
```

The aggregate operators EF Core supports are as follows

<table><thead>
<tr>
<th>.NET</th>
<th>SQL</th>
</tr>
</thead>
<tbody>
<tr>
<td>Average(x =&gt; x.Property)</td>
<td>AVG(Property)</td>
</tr>
<tr>
<td>Count()</td>
<td>COUNT(*)</td>
</tr>
<tr>
<td>LongCount()</td>
<td>COUNT(*)</td>
</tr>
<tr>
<td>Max(x =&gt; x.Property)</td>
<td>MAX(Property)</td>
</tr>
<tr>
<td>Min(x =&gt; x.Property)</td>
<td>MIN(Property)</td>
</tr>
<tr>
<td>Sum(x =&gt; x.Property)</td>
<td>SUM(Property)</td>
</tr>
</tbody></table>

Additional aggregate operators may be supported. Check your provider docs for more function mappings.

The following query uses the ```IGrouping``` operator to create groupings after the results are returned from the database.

```csharp
var query = context.Books.GroupBy(s => s.Price);
```

```sql
SELECT [b].[Price], [b].[Id], [b].[AuthorId]
FROM [Books] AS [b]
ORDER BY [b].[Price]
```

In this case, the GroupBy operator doesn't translate directly to a ```GROUP BY``` clause in the SQL, but instead, EF Core creates the groupings after the results are returned from the server.

## Left Join

EF Core generates a Left Join between two data sources.

```csharp
var query = from b in context.Set<Blog>()
            join p in context.Set<Post>()
                on b.BlogId equals p.BlogId into grouping
            from p in grouping.DefaultIfEmpty()
            select new { b, p };
```

```sql
SELECT [b].[BlogId], [b].[OwnerId], [b].[Rating], [b].[Url], [p].[PostId], [p].[AuthorId], [p].[BlogId], [p].[Content], [p].[Rating], [p].[Title]
FROM [Blogs] AS [b]
LEFT JOIN [Posts] AS [p] ON [b].[BlogId] = [p].[BlogId]
```

This example shows how to group expressions using the GroupJoin operator.

Ref: [Complex Query Operators](https://learn.microsoft.com/en-us/ef/core/querying/complex-query-operators)