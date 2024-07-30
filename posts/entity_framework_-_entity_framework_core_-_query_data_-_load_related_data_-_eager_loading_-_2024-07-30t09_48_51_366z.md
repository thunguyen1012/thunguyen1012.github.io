---
title: Entity Framework - Entity Framework Core - Query data - Load related data - Eager loading
published: true
date: 2024-07-30 09:48:51
tags: EFCore, Summary
description: You can use the Include method to specify related data to be included in query results.
image:
---

## In this article

## Eager loading

You can use the ```Include``` method to specify related data to be included in query results.

```csharp
using (var context = new BloggingContext())
{
    var blogs = context.Blogs
        .Include(blog => blog.Posts)
        .ToList();
}
```

> Tip
Entity Framework Core will automatically fix-up navigation properties to any other entities that were previously loaded into the context instance. So even if you don't explicitly include the data for a navigation property, the property may still be populated if some or all of the related entities were previously loaded.

You can include related data from multiple relationships in a single query.

```csharp
using (var context = new BloggingContext())
{
    var blogs = context.Blogs
        .Include(blog => blog.Posts)
        .Include(blog => blog.Owner)
        .ToList();
}
```

> Caution
Eager loading a collection navigation in a single query may cause performance issues. For more information, see Single vs. split queries.

## Including multiple levels

This example shows how to create a relationship between a blog and the author of that blog.

```csharp
using (var context = new BloggingContext())
{
    var blogs = context.Blogs
        .Include(blog => blog.Posts)
        .ThenInclude(post => post.Author)
        .ToList();
}
```

You can chain multiple calls to ```ThenInclude``` to continue including further levels of related data.

```csharp
using (var context = new BloggingContext())
{
    var blogs = context.Blogs
        .Include(blog => blog.Posts)
        .ThenInclude(post => post.Author)
        .ThenInclude(author => author.Photo)
        .ToList();
}
```

You can combine all of the calls to include related data from multiple levels and multiple roots in the same query.

```csharp
using (var context = new BloggingContext())
{
    var blogs = context.Blogs
        .Include(blog => blog.Posts)
        .ThenInclude(post => post.Author)
        .ThenInclude(author => author.Photo)
        .Include(blog => blog.Owner)
        .ThenInclude(owner => owner.Photo)
        .ToList();
}
```

In this article, I'm going to show you how to include multiple related entities for one of the entities that is being included.

```csharp
using (var context = new BloggingContext())
{
    var blogs = context.Blogs
        .Include(blog => blog.Posts)
        .ThenInclude(post => post.Author)
        .Include(blog => blog.Posts)
        .ThenInclude(post => post.Tags)
        .ToList();
}
```

> Tip
You can also load multiple navigations using a single ```Include``` method. This is possible for navigation "chains" that are all references, or when they end with a single collection.

```csharp
using (var context = new BloggingContext())
{
    var blogs = context.Blogs
        .Include(blog => blog.Owner.AuthoredPosts)
        .ThenInclude(post => post.Blog.Owner.Photo)
        .ToList();
}
```

## Filtered include

When applying ```Include``` to load related data, you can add certain enumerable operations to the included collection navigation, which allows for filtering and sorting of the results.

Supported operations are: ```Where```, ```OrderBy```, ```OrderByDescending```, ```ThenBy```, ```ThenByDescending```, ```Skip```, and ```Take```.

Such operations should be applied on the collection navigation in the lambda passed to the ```Include``` method, ```as``` shown in example below:

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

Filter operations can be applied to a given collection navigation (blog.Posts).

```csharp
using (var context = new BloggingContext())
{
    var filteredBlogs = context.Blogs
        .Include(blog => blog.Posts.Where(post => post.BlogId == 1))
        .ThenInclude(post => post.Author)
        .Include(blog => blog.Posts)
        .ThenInclude(post => post.Tags.OrderBy(postTag => postTag.TagId).Skip(3))
        .ToList();
}
```

Alternatively, identical operations can be applied for each navigation that is included multiple times:

```csharp
using (var context = new BloggingContext())
{
    var filteredBlogs = context.Blogs
        .Include(blog => blog.Posts.Where(post => post.BlogId == 1))
        .ThenInclude(post => post.Author)
        .Include(blog => blog.Posts.Where(post => post.BlogId == 1))
        .ThenInclude(post => post.Tags.OrderBy(postTag => postTag.TagId).Skip(3))
        .ToList();
}
```

> Caution
In case of tracking queries, results of Filtered ```Include``` may be unexpected due to navigation fixup. All relevant entities that have been queried for previously and have been stored in the Change Tracker will be present in the results of Filtered ```Include``` query, even if they don't meet the requirements of the filter. Consider using ```NoTracking``` queries or re-create the DbContext when using Filtered ```Include``` in those situations.

Example:

```csharp
var orders = context.Orders.Where(o => o.Id > 1000).ToList();

// customer entities will have references to all orders where Id > 1000, rather than > 5000
var filtered = context.Customers.Include(c => c.Orders.Where(o => o.Id > 5000)).ToList();
```

> Note
In case of tracking queries, the navigation on which filtered include was applied is considered to be loaded. This means that EF Core will not attempt to re-load its values using explicit loading or lazy loading, even though some elements could still be missing.

## ```Include``` on derived types

You can include related data from navigation defined only on a derived type using ```Include``` and ```ThenInclude```.

Given the following model:

```csharp
public class SchoolContext : DbContext
{
    public DbSet<Person> People { get; set; }
    public DbSet<School> Schools { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<School>().HasMany(s => s.Students).WithOne(s => s.School);
    }
}

public class Person
{
    public int Id { get; set; }
    public string Name { get; set; }
}

public class Student : Person
{
    public School School { get; set; }
}

public class School
{
    public int Id { get; set; }
    public string Name { get; set; }

    public List<Student> Students { get; set; }
}
```

Contents of ```School``` navigation of all People who are Students can be eagerly loaded using many patterns:

- Using cast

```csharp
context.People.Include(person => ((Student)person).School).ToList()
```

- Using ```as``` operator

```csharp
context.People.Include(person => (person as Student).School).ToList()
```

- Using overload of ```Include``` that takes parameter of type ```string```

```csharp
context.People.Include("School").ToList()
```

## Model configuration for auto-including navigations

In this article we will learn how to automatically include a navigation in a model in every query where the entity type is returned in the results.

```csharp
modelBuilder.Entity<Theme>().Navigation(e => e.ColorScheme).AutoInclude();
```

After above configuration, running a query like below will load ```ColorScheme``` navigation for all the themes in the results.

```csharp
using (var context = new BloggingContext())
{
    var themes = context.Themes.ToList();
}
```

Auto-include configuration is applied to all navigations configured as auto-included on derived type of the entity.

You can use auto-include method in your query to load the related data through a navigation, which is configured at model level to be auto-included.

```csharp
using (var context = new BloggingContext())
{
    var themes = context.Themes.IgnoreAutoIncludes().ToList();
}
```

> Note
Navigations to owned types are also configured as auto-included by convention and using ```IgnoreAutoIncludes``` API doesn't stop them from being included. They will still be included in query results.

Ref: [Eager Loading of Related Data](https://learn.microsoft.com/en-us/ef/core/querying/related-data/eager)