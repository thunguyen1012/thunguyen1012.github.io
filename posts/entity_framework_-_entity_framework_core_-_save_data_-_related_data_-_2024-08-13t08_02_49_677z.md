---
title: Entity Framework - Entity Framework Core - Save data - Related data
published: true
date: 2024-08-13 08:02:49
tags: Summary, EFCore
description: In addition to isolated entities, you can also make use of the relationships defined in your model.
image:
---

## In this article

In addition to isolated entities, you can also make use of the relationships defined in your model.

> Tip
You can view this article's sample on GitHub.

## Adding a graph of new entities

If you create several new related entities, adding one of them to the context will cause the others to be added too.

In the following example, the ```blog``` and three related posts are all inserted into the database. The posts are found and added, because they are reachable via the ```Blog.Posts``` navigation property.

```csharp
using (var context = new BloggingContext())
{
    var blog = new Blog
    {
        Url = "http://blogs.msdn.com/dotnet",
        Posts = new List<Post>
        {
            new Post { Title = "Intro to C#" },
            new Post { Title = "Intro to VB.NET" },
            new Post { Title = "Intro to F#" }
        }
    };

    context.Blogs.Add(blog);
    context.SaveChanges();
}
```

> Tip
Use the ```EntityEntry.State``` property to set the state of just a single entity. For example, ```context.Entry(blog).State = EntityState.Modified```.

## Adding a related entity

If you reference a new entity from the navigation property of an entity that is already tracked by the context, the entity will be discovered and inserted into the database.

In the following example, the ```post``` entity is inserted because it is added to the ```Posts``` property of the ```blog``` entity which was fetched from the database.

```csharp
using (var context = new BloggingContext())
{
    var blog = context.Blogs.Include(b => b.Posts).First();
    var post = new Post { Title = "Intro to EF Core" };

    blog.Posts.Add(post);
    context.SaveChanges();
}
```

## Changing relationships

If you change the navigation property of an entity, the corresponding changes will be made to the foreign key column in the database.

You can create a new ```blog``` entity and insert it into the database of the existing ```post``` entity.

```csharp
using (var context = new BloggingContext())
{
    var blog = new Blog { Url = "http://blogs.msdn.com/visualstudio" };
    var post = context.Posts.First();

    post.Blog = blog;
    context.SaveChanges();
}
```

## Removing relationships

You can remove a relationship by setting a reference navigation to ```null```, or removing the related entity from a collection navigation.

Removing a relationship can have side effects on the dependent entity, according to the cascade delete behavior configured in the relationship.

The child/dependent entity will be deleted from the database.

See Required and Optional Relationships to learn about how the requiredness of relationships can be configured.

See Cascade Delete for more details on how cascade delete behaviors work, how they can be configured explicitly and  how they are selected by convention.

In the following example, a cascade delete is configured on the relationship between ```Blog``` and ```Post```, so the ```post``` entity is deleted from the database.

```csharp
using (var context = new BloggingContext())
{
    var blog = context.Blogs.Include(b => b.Posts).First();
    var post = blog.Posts.First();

    blog.Posts.Remove(post);
    context.SaveChanges();
}
```

Ref: [Saving Related Data](https://learn.microsoft.com/en-us/ef/core/saving/related-data)