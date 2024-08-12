---
title: Entity Framework - Entity Framework Core - Save data - Basic save
published: true
date: 2024-08-12 08:10:04
tags: Summary, EFCore
description: DbContext.SaveChanges is a method for saving changes to the database with EF.
image:
---

## In this article

```DbContext.SaveChanges``` is a method for saving changes to the database with EF.

> Tip
You can view this article's sample on GitHub.

## Adding Data

Use the ```DbSet<TEntity>.Add``` method to add new instances of your entity classes. The data will be inserted into the database when you call ```DbContext.SaveChanges()```:

```csharp
using (var context = new BloggingContext())
{
    var blog = new Blog { Url = "http://example.com" };
    context.Blogs.Add(blog);
    context.SaveChanges();
}
```

> Tip
The ```Add```, ```Attach```, and ```Update``` methods all work on the full graph of entities passed to them, as described in the Related Data section. Alternately, the ```EntityEntry.State``` property can be used to set the state of just a single entity. For example, ```context.Entry(blog).State = EntityState.Modified```.

## Updating Data

The Entity Framework (EF) automatically detects changes made to an existing entity that is tracked by the context.

Simply modify the values assigned to properties and then call ```SaveChanges```:

```csharp
using (var context = new BloggingContext())
{
    var blog = context.Blogs.Single(b => b.Url == "http://example.com");
    blog.Url = "http://example.com/blog";
    context.SaveChanges();
}
```

## Deleting Data

Use the ```DbSet<TEntity>.Remove``` method to delete instances of your entity classes:

```csharp
using (var context = new BloggingContext())
{
    var blog = context.Blogs.Single(b => b.Url == "http://example.com/blog");
    context.Blogs.Remove(blog);
    context.SaveChanges();
}
```

 ```SaveChanges``` returns the name of an entity that has been saved to the database.

## Multiple Operations in a single ```SaveChanges```

You can combine multiple ```Add/Update/Remove``` operations into a single call to ```SaveChanges```:

```csharp
using (var context = new BloggingContext())
{
    // seeding database
    context.Blogs.Add(new Blog { Url = "http://example.com/blog" });
    context.Blogs.Add(new Blog { Url = "http://example.com/another_blog" });
    context.SaveChanges();
}

using (var context = new BloggingContext())
{
    // add
    context.Blogs.Add(new Blog { Url = "http://example.com/blog_one" });
    context.Blogs.Add(new Blog { Url = "http://example.com/blog_two" });

    // update
    var firstBlog = context.Blogs.First();
    firstBlog.Url = "";

    // remove
    var lastBlog = context.Blogs.OrderBy(e => e.BlogId).Last();
    context.Blogs.Remove(lastBlog);

    context.SaveChanges();
}
```

> Note
For most database providers, ```SaveChanges``` is transactional. This means all the operations either succeed or fail and the operations are never be left partially applied.

Ref: [Basic ```SaveChanges```](https://learn.microsoft.com/en-us/ef/core/saving/basic)