---
title: Entity Framework - Entity Framework Core - Query data - Global query filters
published: true
date: 2024-08-09 08:31:28
tags: Summary, EFCore
description: EF Core is a set of global query filters and query predicates.
image:
---

## In this article

EF Core is a set of global query filters and query predicates.

- Soft delete - An Entity Type defines an ```IsDeleted``` property.

- Multi-tenancy - An Entity Type defines a ```TenantId``` property.

## Example

The following example shows how to use Global Query Filters to implement multi-tenancy and soft-delete query behaviors in a simple blogging model.

> Tip
You can view this article's sample on GitHub.

> Note
Multi-tenancy is used here as a simple example. There is also an article with comprehensive guidance for multi-tenancy in EF Core applications.

First, define the entities:

```csharp
public class Blog
{
#pragma warning disable IDE0051, CS0169 // Remove unused private members
    private string _tenantId;
#pragma warning restore IDE0051, CS0169 // Remove unused private members

    public int BlogId { get; set; }
    public string Name { get; set; }
    public string Url { get; set; }

    public List<Post> Posts { get; set; }
}

public class Post
{
    public int PostId { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public bool IsDeleted { get; set; }

    public Blog Blog { get; set; }
}
```

In this example, we are going to define two properties on the ```Blog``` entity type and one property on the ```Post``` entity type.

Next, configure the query filters in ```OnModelCreating``` using the ```HasQueryFilter``` API.

```csharp
modelBuilder.Entity<Blog>().HasQueryFilter(b => EF.Property<string>(b, "_tenantId") == _tenantId);
modelBuilder.Entity<Post>().HasQueryFilter(p => !p.IsDeleted);
```

The predicate expressions passed to the ```HasQueryFilter``` calls will now automatically be applied to any LINQ queries for those types.

> Tip
Note the use of a DbContext instance level field: ```_tenantId``` used to set the current tenant. Model-level filters will use the value from the correct context instance (that is, the instance that is executing the query).

> Note
It is currently not possible to define multiple query filters on the same entity - only the last one will be applied. However, you can define a single filter with multiple conditions using the logical ```AND``` operator (&& in C#).

## Use of navigations

You can use navigations in defining global query filters.

To illustrate this configure query filters in ```OnModelCreating``` in the following way:

```csharp
modelBuilder.Entity<Blog>().HasMany(b => b.Posts).WithOne(p => p.Blog);
modelBuilder.Entity<Blog>().HasQueryFilter(b => b.Posts.Count > 0);
modelBuilder.Entity<Post>().HasQueryFilter(p => p.Title.Contains("fish"));
```

Next, query for all ```Blog``` entities:

```csharp
var filteredBlogs = db.Blogs.ToList();
```

This query produces the following SQL, which applies query filters defined for both ```Blog``` and ```Post``` entities:

```sql
SELECT [b].[BlogId], [b].[Name], [b].[Url]
FROM [Blogs] AS [b]
WHERE (
    SELECT COUNT(*)
    FROM [Posts] AS [p]
    WHERE ([p].[Title] LIKE N'%fish%') AND ([b].[BlogId] = [p].[BlogId])) > 0
```

> Note
Currently EF Core does not detect cycles in global query filter definitions, so you should be careful when defining them. If specified incorrectly, cycles could lead to infinite loops during query translation.

## Accessing entity with query filter using required navigation

> Caution
Using required navigation to access entity which has global query filter defined may lead to unexpected results.

You may get fewer elements than expected in result if the related entity is filtered out by the query filter.

To illustrate the problem, we can use the ```Blog``` and ```Post``` entities specified above and the following ```OnModelCreating``` method:

```csharp
modelBuilder.Entity<Blog>().HasMany(b => b.Posts).WithOne(p => p.Blog).IsRequired();
modelBuilder.Entity<Blog>().HasQueryFilter(b => b.Url.Contains("fish"));
```

The model can be seeded with the following data:

```csharp
db.Blogs.Add(
    new Blog
    {
        Url = "http://sample.com/blogs/fish",
        Posts = new List<Post>
        {
            new Post { Title = "Fish care 101" },
            new Post { Title = "Caring for tropical fish" },
            new Post { Title = "Types of ornamental fish" }
        }
    });

db.Blogs.Add(
    new Blog
    {
        Url = "http://sample.com/blogs/cats",
        Posts = new List<Post>
        {
            new Post { Title = "Cat care 101" },
            new Post { Title = "Caring for tropical cats" },
            new Post { Title = "Types of ornamental cats" }
        }
    });
```

The problem can be observed when executing two queries:

```csharp
var allPosts = db.Posts.ToList();
var allPostsWithBlogsIncluded = db.Posts.Include(p => p.Blog).ToList();
```

In this article, I will show you how to query a single ```Blog``` entity using EF Core.

```sql
SELECT [p].[PostId], [p].[BlogId], [p].[Content], [p].[IsDeleted], [p].[Title], [t].[BlogId], [t].[Name], [t].[Url]
FROM [Posts] AS [p]
INNER JOIN (
    SELECT [b].[BlogId], [b].[Name], [b].[Url]
    FROM [Blogs] AS [b]
    WHERE [b].[Url] LIKE N'%fish%'
) AS [t] ON [p].[BlogId] = [t].[BlogId]
```

Use of the ```INNER JOIN``` filters out all Posts whose related Blogs have been removed by a global query filter.

It can be addressed by using optional navigation instead of required.
This way the first query stays the same as before, however the second query will now generate ```LEFT JOIN``` and return 6 results.

```csharp
modelBuilder.Entity<Blog>().HasMany(b => b.Posts).WithOne(p => p.Blog).IsRequired(false);
modelBuilder.Entity<Blog>().HasQueryFilter(b => b.Url.Contains("fish"));
```

Is it possible to query both ```Blog``` and ```Post``` entities at the same time?

```csharp
modelBuilder.Entity<Blog>().HasMany(b => b.Posts).WithOne(p => p.Blog).IsRequired();
modelBuilder.Entity<Blog>().HasQueryFilter(b => b.Url.Contains("fish"));
modelBuilder.Entity<Post>().HasQueryFilter(p => p.Blog.Url.Contains("fish"));
```

## Disabling Filters

Filters may be disabled for individual LINQ queries by using the IgnoreQueryFilters operator.

```csharp
blogs = db.Blogs
    .Include(b => b.Posts)
    .IgnoreQueryFilters()
    .ToList();
```

## Limitations

Global query filters have the following limitations:

- Filters can only be defined for the root Entity Type of an inheritance hierarchy.

Ref: [Global Query Filters](https://learn.microsoft.com/en-us/ef/core/querying/filters)