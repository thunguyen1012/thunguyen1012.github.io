---
title: Entity Framework - Entity Framework Core - Save data - Disconnected entities
published: true
date: 2024-08-16 10:36:05
tags: Summary, EFCore
description: Save changes to entities in a database.
image:
---

## In this article

Save changes to entities in a database.

When entities are queried using a context instance, they are queried and saved using the same instance.

> Tip
You can view this article's sample on GitHub.

> Tip
EF Core can only track one instance of any entity with a given primary key value. The best way to avoid this being an issue is to use a short-lived context for each unit-of-work such that the context starts empty, has entities attached to it, saves those entities, and then the context is disposed and discarded.

## Identifying new entities

### Client identifies new entities

There are a number of ways to deal with requests to insert or update entities.

The remainder of this section covers the cases where it is necessary to determine in some other way whether to insert or update.

### With auto-generated keys

An automatically generated key can be used to determine whether an entity needs to be inserted or updated.

It is easy to check for an unset key when the entity type is known:

```csharp
public static bool IsItNew(Blog blog)
    => blog.BlogId == 0;
```

However, EF also has a built-in way to do this for any entity type and key type:

```csharp
public static bool IsItNew(DbContext context, object entity)
    => !context.Entry(entity).IsKeySet;
```

> Tip
Keys are set as soon as entities are tracked by the context, even if the entity is in the Added state. This helps when traversing a graph of entities and deciding what to do with each, such as when using the TrackGraph API. The key value should only be used in the way shown here before any call is made to track the entity.

### With other keys

Some other mechanism is needed to identify new entities when key values are not generated automatically. There are two general approaches to this:

- Query for the entity

- Pass a flag from the client

To query for the entity, just use the Find method:

```csharp
public static bool IsItNew(BloggingContext context, Blog blog)
    => context.Blogs.Find(blog.BlogId) == null;
```

This document shows the code for passing a flag from a client to a controller.

## Saving single entities

If it is known whether or not an insert or update is needed, then either Add or Update can be used appropriately:

```csharp
public static void Insert(DbContext context, object entity)
{
    context.Add(entity);
    context.SaveChanges();
}

public static void Update(DbContext context, object entity)
{
    context.Update(entity);
    context.SaveChanges();
}
```

However, if the entity uses auto-generated key values, then the Update method can be used for both cases:

```csharp
public static void InsertOrUpdate(DbContext context, object entity)
{
    context.Update(entity);
    context.SaveChanges();
}
```

If the entity is not using auto-generated keys, then the application must decide whether the entity should be inserted or updated: For example:

```csharp
public static void InsertOrUpdate(BloggingContext context, Blog blog)
{
    var existingBlog = context.Blogs.Find(blog.BlogId);
    if (existingBlog == null)
    {
        context.Add(blog);
    }
    else
    {
        context.Entry(existingBlog).CurrentValues.SetValues(blog);
    }

    context.SaveChanges();
}
```

The steps here are:

- If Find returns null, then the database doesn't already contain the blog with this ID, so we call Add mark it for insertion.

- If Find returns an entity, then it exists in the database and the context is now tracking the existing entity

  - We then use SetValues to set the values for all properties on this entity to those that came from the client.

  - The SetValues call will mark the entity to be updated as needed.

> Tip
SetValues will only mark as modified the properties that have different values to those in the tracked entity. This means that when the update is sent, only those columns that have actually changed will be updated. (And if nothing has changed, then no update will be sent at all.)

## Working with graphs

### Identity resolution

When working with graphs the graph should ideally be created such as this invariant is maintained, and the context should be used for only one unit-of-work.

### All new/all existing entities

A graph is a representation of a single entity, such as a collection of blog posts.

```csharp
var blog = new Blog
{
    Url = "http://sample.com", Posts = new List<Post> { new Post { Title = "Post 1" }, new Post { Title = "Post 2" }, }
};
```

can be inserted like this:

```csharp
public static void InsertGraph(DbContext context, object rootEntity)
{
    context.Add(rootEntity);
    context.SaveChanges();
}
```

The call to Add will mark the blog and all the posts to be inserted.

Likewise, if all the entities in a graph need to be updated, then Update can be used:

```csharp
public static void UpdateGraph(DbContext context, object rootEntity)
{
    context.Update(rootEntity);
    context.SaveChanges();
}
```

The blog and all its posts will be marked to be updated.

### Mix of new and existing entities

With auto-generated keys, Update can again be used for both inserts and updates, even if the graph contains a mix of entities that require inserting and those that require updating:

```csharp
public static void InsertOrUpdateGraph(DbContext context, object rootEntity)
{
    context.Update(rootEntity);
    context.SaveChanges();
}
```

Update will mark any entity in the graph, blog or post, for insertion if it does not have a key value set, while all other entities are marked for update.

As before, when not using auto-generated keys, a query and some processing can be used:

```csharp
public static void InsertOrUpdateGraph(BloggingContext context, Blog blog)
{
    var existingBlog = context.Blogs
        .Include(b => b.Posts)
        .FirstOrDefault(b => b.BlogId == blog.BlogId);

    if (existingBlog == null)
    {
        context.Add(blog);
    }
    else
    {
        context.Entry(existingBlog).CurrentValues.SetValues(blog);
        foreach (var post in blog.Posts)
        {
            var existingPost = existingBlog.Posts
                .FirstOrDefault(p => p.PostId == post.PostId);

            if (existingPost == null)
            {
                existingBlog.Posts.Add(post);
            }
            else
            {
                context.Entry(existingPost).CurrentValues.SetValues(post);
            }
        }
    }

    context.SaveChanges();
}
```

## Handling deletes

Delete is the process of deleting an entity from a query.

For true deletes, a common pattern is to use an extension of the query pattern to perform what is essentially a graph diff. For example:

```csharp
public static void InsertUpdateOrDeleteGraph(BloggingContext context, Blog blog)
{
    var existingBlog = context.Blogs
        .Include(b => b.Posts)
        .FirstOrDefault(b => b.BlogId == blog.BlogId);

    if (existingBlog == null)
    {
        context.Add(blog);
    }
    else
    {
        context.Entry(existingBlog).CurrentValues.SetValues(blog);
        foreach (var post in blog.Posts)
        {
            var existingPost = existingBlog.Posts
                .FirstOrDefault(p => p.PostId == post.PostId);

            if (existingPost == null)
            {
                existingBlog.Posts.Add(post);
            }
            else
            {
                context.Entry(existingPost).CurrentValues.SetValues(post);
            }
        }

        foreach (var post in existingBlog.Posts)
        {
            if (!blog.Posts.Any(p => p.PostId == post.PostId))
            {
                context.Remove(post);
            }
        }
    }

    context.SaveChanges();
}
```

## ```TrackGraph```

```TrackGraph``` is a graph-traversal approach to managing entities.

```csharp
public static void SaveAnnotatedGraph(DbContext context, object rootEntity)
{
    context.ChangeTracker.TrackGraph(
        rootEntity,
        n =>
        {
            var entity = (EntityBase)n.Entry.Entity;
            n.Entry.State = entity.IsNew
                ? EntityState.Added
                : entity.IsChanged
                    ? EntityState.Modified
                    : entity.IsDeleted
                        ? EntityState.Deleted
                        : EntityState.Unchanged;
        });

    context.SaveChanges();
}
```

The flags are only shown as part of the entity for simplicity of the example. Typically the flags would be part of a DTO or some other state included in the request.

Ref: [Disconnected entities](https://learn.microsoft.com/en-us/ef/core/saving/disconnected-entities)