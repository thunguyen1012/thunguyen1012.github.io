---
title: Entity Framework - Entity Framework Core - Change tracking - Explicitly tracking entities
published: true
date: 2024-08-16 10:38:01
tags: Summary, EFCore
description: Each DbContext instance tracks changes made to entities. These tracked entities in turn drive the changes to the database when SaveChanges is called.
image:
---

## In this article

Each ```DbContext``` instance tracks changes made to entities. These tracked entities in turn drive the changes to the database when ```SaveChanges``` is called.

```DbContext``` change tracking works best when the same DbContext instance is used to query for entities and update them by calling ```SaveChanges```.

> Tip
This document assumes that entity states and the basics of EF Core change tracking are understood. See Change Tracking in EF Core for more information on these topics.

> Tip
You can run and debug into all the code in this document by downloading the sample code from GitHub.

> Tip
For simplicity, this document uses and references synchronous methods such as ```SaveChanges``` rather than their async equivalents such as ```SaveChangesAsync```. Calling and awaiting the async method can be substituted unless otherwise noted.

## Introduction

Entities can be explicitly "attached" to a DbContext such that the context then tracks those entities. This is primarily useful when:

- Creating new entities that will be inserted into the database.

- Re-attaching disconnected entities that were previously queried by a different DbContext instance.

The first of these will be needed by most applications, and is primarily handled by the DbContext.Add methods.

```DbContexts``` are defined in two ways: the first is needed by applications that track entities or their relationships while the entities are being tracked, and the second is only needed by applications that change entities or their relationships while the entities are not being tracked.

The ```DbContext.Attach``` method has been deprecated.

> Tip
Attaching entities to the same DbContext instance that they were queried from should not normally be needed. Do not routinely perform a no-tracking query and then attach the returned entities to the same context. This will be slower than using a tracking query, and may also result in issues such as missing shadow property values, making it harder to get right.

### Generated versus explicit key values

Key properties can be used to track changes to an entity in a database.

Two models are used in the following sections. The first is configured to not use generated key values:

```csharp
public class Blog
{
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public int Id { get; set; }

    public string Name { get; set; }

    public IList<Post> Posts { get; } = new List<Post>();
}

public class Post
{
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public int Id { get; set; }

    public string Title { get; set; }
    public string Content { get; set; }

    public int? BlogId { get; set; }
    public Blog Blog { get; set; }
}
```

The following examples show how to generate key values using the Python programming language.

```csharp
public class Blog
{
    public int Id { get; set; }
    public string Name { get; set; }

    public IList<Post> Posts { get; } = new List<Post>();
}

public class Post
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }

    public int? BlogId { get; set; }
    public Blog Blog { get; set; }
}
```

Notice that the key properties in this model need no additional configuration here since using generated key values is the default for simple integer keys.

## Inserting new entities

### Explicit key values

An entity can be put in the ```Added``` state by calling ```DbContext.AddRange```, ```DbContext.AddAsync```, or the equivalent methods on ```DbSet<T>```.

> Tip
These methods all work in the same way in the context of change tracking. See Additional Change Tracking Features for more information.

For example, to start tracking a new blog:

```csharp
context.Add(
    new Blog { Id = 1, Name = ".NET Blog", });
```

Inspecting the change tracker debug view following this call shows that the context is tracking the new entity in the ```Added``` state:

```output
Blog {Id: 1} Added
  Id: 1 PK
  Name: '.NET Blog'
  Posts: []
```

The ```Add``` method adds a new entity to a list of existing entities.

```csharp
context.Add(
    new Blog
    {
        Id = 1,
        Name = ".NET Blog",
        Posts =
        {
            new Post
            {
                Id = 1,
                Title = "Announcing the Release of EF Core 5.0",
                Content = "Announcing the release of EF Core 5.0, a full featured cross-platform..."
            },
            new Post
            {
                Id = 2,
                Title = "Announcing F# 5",
                Content = "F# 5 is the latest version of F#, the functional programming language..."
            }
        }
    });
```

The context is now tracking all these entities as ```Added```:

```output
Blog {Id: 1} Added
  Id: 1 PK
  Name: '.NET Blog'
  Posts: [{Id: 1}, {Id: 2}]
Post {Id: 1} Added
  Id: 1 PK
  BlogId: 1 FK
  Content: 'Announcing the release of EF Core 5.0, a full featured cross...'
  Title: 'Announcing the Release of EF Core 5.0'
  Blog: {Id: 1}
Post {Id: 2} Added
  Id: 2 PK
  BlogId: 1 FK
  Content: 'F# 5 is the latest version of F#, the functional programming...'
  Title: 'Announcing F# 5'
  Blog: {Id: 1}
```

In this article we are going to look at how to set explicit values for key properties.

```sql
-- Executed DbCommand (0ms) [Parameters=[@p0='1' (DbType = String), @p1='.NET Blog' (Size = 9)], CommandType='Text', CommandTimeout='30']
INSERT INTO "Blogs" ("Id", "Name")
VALUES (@p0, @p1);

-- Executed DbCommand (0ms) [Parameters=[@p2='1' (DbType = String), @p3='1' (DbType = String), @p4='Announcing the release of EF Core 5.0, a full featured cross-platform...' (Size = 72), @p5='Announcing the Release of EF Core 5.0' (Size = 37)], CommandType='Text', CommandTimeout='30']
INSERT INTO "Posts" ("Id", "BlogId", "Content", "Title")
VALUES (@p2, @p3, @p4, @p5);

-- Executed DbCommand (0ms) [Parameters=[@p0='2' (DbType = String), @p1='1' (DbType = String), @p2='F# 5 is the latest version of F#, the functional programming language...' (Size = 72), @p3='Announcing F# 5' (Size = 15)], CommandType='Text', CommandTimeout='30']
INSERT INTO "Posts" ("Id", "BlogId", "Content", "Title")
VALUES (@p0, @p1, @p2, @p3);
```

All of these entities are tracked in the ```Unchanged``` state after ```SaveChanges``` completes, since these entities now exist in the database:

```output
Blog {Id: 1} Unchanged
  Id: 1 PK
  Name: '.NET Blog'
  Posts: [{Id: 1}, {Id: 2}]
Post {Id: 1} Unchanged
  Id: 1 PK
  BlogId: 1 FK
  Content: 'Announcing the release of EF Core 5.0, a full featured cross...'
  Title: 'Announcing the Release of EF Core 5.0'
  Blog: {Id: 1}
Post {Id: 2} Unchanged
  Id: 2 PK
  BlogId: 1 FK
  Content: 'F# 5 is the latest version of F#, the functional programming...'
  Title: 'Announcing F# 5'
  Blog: {Id: 1}
```

### Generated key values

In this article, I'll show you how to use the generated key property to insert blog posts.

```csharp
context.Add(
    new Blog
    {
        Name = ".NET Blog",
        Posts =
        {
            new Post
            {
                Title = "Announcing the Release of EF Core 5.0",
                Content = "Announcing the release of EF Core 5.0, a full featured cross-platform..."
            },
            new Post
            {
                Title = "Announcing F# 5",
                Content = "F# 5 is the latest version of F#, the functional programming language..."
            }
        }
    });
```

As with explicit key values, the context is now tracking all these entities as ```Added```:

```output
Blog {Id: -2147482644} Added
  Id: -2147482644 PK Temporary
  Name: '.NET Blog'
  Posts: [{Id: -2147482637}, {Id: -2147482636}]
Post {Id: -2147482637} Added
  Id: -2147482637 PK Temporary
  BlogId: -2147482644 FK Temporary
  Content: 'Announcing the release of EF Core 5.0, a full featured cross...'
  Title: 'Announcing the Release of EF Core 5.0'
  Blog: {Id: -2147482644}
Post {Id: -2147482636} Added
  Id: -2147482636 PK Temporary
  BlogId: -2147482644 FK Temporary
  Content: 'F# 5 is the latest version of F#, the functional programming...'
  Title: 'Announcing F# 5'
  Blog: {Id: -2147482644}
```

The following example shows how to generate temporary key values for an entity.

```sql
-- Executed DbCommand (0ms) [Parameters=[@p0='.NET Blog' (Size = 9)], CommandType='Text', CommandTimeout='30']
INSERT INTO "Blogs" ("Name")
VALUES (@p0);
SELECT "Id"
FROM "Blogs"
WHERE changes() = 1 AND "rowid" = last_insert_rowid();

-- Executed DbCommand (0ms) [Parameters=[@p1='1' (DbType = String), @p2='Announcing the release of EF Core 5.0, a full featured cross-platform...' (Size = 72), @p3='Announcing the Release of EF Core 5.0' (Size = 37)], CommandType='Text', CommandTimeout='30']
INSERT INTO "Posts" ("BlogId", "Content", "Title")
VALUES (@p1, @p2, @p3);
SELECT "Id"
FROM "Posts"
WHERE changes() = 1 AND "rowid" = last_insert_rowid();

-- Executed DbCommand (0ms) [Parameters=[@p0='1' (DbType = String), @p1='F# 5 is the latest version of F#, the functional programming language...' (Size = 72), @p2='Announcing F# 5' (Size = 15)], CommandType='Text', CommandTimeout='30']
INSERT INTO "Posts" ("BlogId", "Content", "Title")
VALUES (@p0, @p1, @p2);
SELECT "Id"
FROM "Posts"
WHERE changes() = 1 AND "rowid" = last_insert_rowid();
```

After ```SaveChanges``` completes, all of the entities have been updated with their real key values and are tracked in the ```Unchanged``` state since they now match the state in the database:

```output
Blog {Id: 1} Unchanged
  Id: 1 PK
  Name: '.NET Blog'
  Posts: [{Id: 1}, {Id: 2}]
Post {Id: 1} Unchanged
  Id: 1 PK
  BlogId: 1 FK
  Content: 'Announcing the release of EF Core 5.0, a full featured cross...'
  Title: 'Announcing the Release of EF Core 5.0'
  Blog: {Id: 1}
Post {Id: 2} Unchanged
  Id: 2 PK
  BlogId: 1 FK
  Content: 'F# 5 is the latest version of F#, the functional programming...'
  Title: 'Announcing F# 5'
  Blog: {Id: 1}
```

This is exactly the same end-state as the previous example that used explicit key values.

> Tip
An explicit key value can still be set even when using generated key values. EF Core will then attempt to insert using this key value. Some database configurations, including SQL Server with Identity columns, do not support such inserts and will throw (see these docs for a workaround).

## Attaching existing entities

### Explicit key values

```DbContext.AttachRange``` is a wrapper around the ```DbSet<T>``` method.

```csharp
context.Attach(
    new Blog { Id = 1, Name = ".NET Blog", });
```

> Note
The examples here are creating entities explicitly with new for simplicity. Normally the entity instances will have come from another source, such as being deserialized from a client, or being created from data in an HTTP Post.

Inspecting the change tracker debug view following this call shows that the entity is tracked in the ```Unchanged``` state:

```output
Blog {Id: 1} Unchanged
  Id: 1 PK
  Name: '.NET Blog'
  Posts: []
```

Just like ```Add```, ```Attach``` actually sets an entire graph of connected entities to the ```Unchanged``` state. For example, to attach an existing blog and associated existing posts:

```csharp
context.Attach(
    new Blog
    {
        Id = 1,
        Name = ".NET Blog",
        Posts =
        {
            new Post
            {
                Id = 1,
                Title = "Announcing the Release of EF Core 5.0",
                Content = "Announcing the release of EF Core 5.0, a full featured cross-platform..."
            },
            new Post
            {
                Id = 2,
                Title = "Announcing F# 5",
                Content = "F# 5 is the latest version of F#, the functional programming language..."
            }
        }
    });
```

The context is now tracking all these entities as ```Unchanged```:

```output
Blog {Id: 1} Unchanged
  Id: 1 PK
  Name: '.NET Blog'
  Posts: [{Id: 1}, {Id: 2}]
Post {Id: 1} Unchanged
  Id: 1 PK
  BlogId: 1 FK
  Content: 'Announcing the release of EF Core 5.0, a full featured cross...'
  Title: 'Announcing the Release of EF Core 5.0'
  Blog: {Id: 1}
Post {Id: 2} Unchanged
  Id: 2 PK
  BlogId: 1 FK
  Content: 'F# 5 is the latest version of F#, the functional programming...'
  Title: 'Announcing F# 5'
  Blog: {Id: 1}
```

Calling ```SaveChanges``` at this point will have no effect. All the entities are marked as ```Unchanged```, so there is nothing to update in the database.

### Generated key values

In this post, I'm going to show you how to use the change tracker to automatically detect new entities and put them in the ```Added``` state.

```csharp
context.Attach(
    new Blog
    {
        Id = 1,
        Name = ".NET Blog",
        Posts =
        {
            new Post
            {
                Id = 1,
                Title = "Announcing the Release of EF Core 5.0",
                Content = "Announcing the release of EF Core 5.0, a full featured cross-platform..."
            },
            new Post
            {
                Id = 2,
                Title = "Announcing F# 5",
                Content = "F# 5 is the latest version of F#, the functional programming language..."
            },
            new Post
            {
                Title = "Announcing .NET 5.0",
                Content = ".NET 5.0 includes many enhancements, including single file applications, more..."
            },
        }
    });
```

This example shows how to add a new blog to an existing database.

```output
Blog {Id: 1} Unchanged
  Id: 1 PK
  Name: '.NET Blog'
  Posts: [{Id: 1}, {Id: 2}, {Id: -2147482636}]
Post {Id: -2147482636} Added
  Id: -2147482636 PK Temporary
  BlogId: 1 FK
  Content: '.NET 5.0 includes many enhancements, including single file a...'
  Title: 'Announcing .NET 5.0'
  Blog: {Id: 1}
Post {Id: 1} Unchanged
  Id: 1 PK
  BlogId: 1 FK
  Content: 'Announcing the release of EF Core 5.0, a full featured cross...'
  Title: 'Announcing the Release of EF Core 5.0'
  Blog: {Id: 1}
Post {Id: 2} Unchanged
  Id: 2 PK
  BlogId: 1 FK
  Content: 'F# 5 is the latest version of F#, the functional programming...'
```

Calling ```SaveChanges``` at this point does nothing with the ```Unchanged``` entities, but inserts the new entity into the database. For example, when using SQLite:

```sql
-- Executed DbCommand (0ms) [Parameters=[@p0='1' (DbType = String), @p1='.NET 5.0 includes many enhancements, including single file applications, more...' (Size = 80), @p2='Announcing .NET 5.0' (Size = 19)], CommandType='Text', CommandTimeout='30']
INSERT INTO "Posts" ("BlogId", "Content", "Title")
VALUES (@p0, @p1, @p2);
SELECT "Id"
FROM "Posts"
WHERE changes() = 1 AND "rowid" = last_insert_rowid();
```

In this post I'm going to show you how to use generated key values in EF Core to create new entities in a disconnected graph.

## Updating existing entities

### Explicit key values

 ```Attach``` methods on ```DbContext.UpdateRange``` and ```DbSet<T>``` behave exactly as the ```Attach``` methods described above, except that entities are put into the ```Modified``` state.

```csharp
context.Update(
    new Blog { Id = 1, Name = ".NET Blog", });
```

Inspecting the change tracker debug view following this call shows that the context is tracking this entity in the ```Modified``` state:

```output
Blog {Id: 1} Modified
  Id: 1 PK
  Name: '.NET Blog' Modified
  Posts: []
```

Just like with ```Add``` and ```Attach```, ```Update``` actually marks an entire graph of related entities as ```Modified```. For example, to attach an existing blog and associated existing posts as ```Modified```:

```csharp
context.Update(
    new Blog
    {
        Id = 1,
        Name = ".NET Blog",
        Posts =
        {
            new Post
            {
                Id = 1,
                Title = "Announcing the Release of EF Core 5.0",
                Content = "Announcing the release of EF Core 5.0, a full featured cross-platform..."
            },
            new Post
            {
                Id = 2,
                Title = "Announcing F# 5",
                Content = "F# 5 is the latest version of F#, the functional programming language..."
            }
        }
    });
```

The context is now tracking all these entities as ```Modified```:

```output
Blog {Id: 1} Modified
  Id: 1 PK
  Name: '.NET Blog' Modified
  Posts: [{Id: 1}, {Id: 2}]
Post {Id: 1} Modified
  Id: 1 PK
  BlogId: 1 FK Modified Originally <null>
  Content: 'Announcing the release of EF Core 5.0, a full featured cross...' Modified
  Title: 'Announcing the Release of EF Core 5.0' Modified
  Blog: {Id: 1}
Post {Id: 2} Modified
  Id: 2 PK
  BlogId: 1 FK Modified Originally <null>
  Content: 'F# 5 is the latest version of F#, the functional programming...' Modified
  Title: 'Announcing F# 5' Modified
  Blog: {Id: 1}
```

Calling ```SaveChanges``` at this point will cause updates to be sent to the database for all these entities. For example, when using SQLite:

```sql
-- Executed DbCommand (0ms) [Parameters=[@p1='1' (DbType = String), @p0='.NET Blog' (Size = 9)], CommandType='Text', CommandTimeout='30']
UPDATE "Blogs" SET "Name" = @p0
WHERE "Id" = @p1;
SELECT changes();

-- Executed DbCommand (0ms) [Parameters=[@p3='1' (DbType = String), @p0='1' (DbType = String), @p1='Announcing the release of EF Core 5.0, a full featured cross-platform...' (Size = 72), @p2='Announcing the Release of EF Core 5.0' (Size = 37)], CommandType='Text', CommandTimeout='30']
UPDATE "Posts" SET "BlogId" = @p0, "Content" = @p1, "Title" = @p2
WHERE "Id" = @p3;
SELECT changes();

-- Executed DbCommand (0ms) [Parameters=[@p3='2' (DbType = String), @p0='1' (DbType = String), @p1='F# 5 is the latest version of F#, the functional programming language...' (Size = 72), @p2='Announcing F# 5' (Size = 15)], CommandType='Text', CommandTimeout='30']
UPDATE "Posts" SET "BlogId" = @p0, "Content" = @p1, "Title" = @p2
WHERE "Id" = @p3;
SELECT changes();
```

### Generated key values

DbContext ```Update``` returns a key value indicating whether an entity has been added to the database.

```csharp
context.Update(
    new Blog
    {
        Id = 1,
        Name = ".NET Blog",
        Posts =
        {
            new Post
            {
                Id = 1,
                Title = "Announcing the Release of EF Core 5.0",
                Content = "Announcing the release of EF Core 5.0, a full featured cross-platform..."
            },
            new Post
            {
                Id = 2,
                Title = "Announcing F# 5",
                Content = "F# 5 is the latest version of F#, the functional programming language..."
            },
            new Post
            {
                Title = "Announcing .NET 5.0",
                Content = ".NET 5.0 includes many enhancements, including single file applications, more..."
            },
        }
    });
```

As with the ```Attach``` example, the post with no key value is detected as new and set to the ```Added``` state. The other entities are marked as ```Modified```:

```output
Blog {Id: 1} Modified
  Id: 1 PK
  Name: '.NET Blog' Modified
  Posts: [{Id: 1}, {Id: 2}, {Id: -2147482633}]
Post {Id: -2147482633} Added
  Id: -2147482633 PK Temporary
  BlogId: 1 FK
  Content: '.NET 5.0 includes many enhancements, including single file a...'
  Title: 'Announcing .NET 5.0'
  Blog: {Id: 1}
Post {Id: 1} Modified
  Id: 1 PK
  BlogId: 1 FK Modified Originally <null>
  Content: 'Announcing the release of EF Core 5.0, a full featured cross...' Modified
  Title: 'Announcing the Release of EF Core 5.0' Modified
  Blog: {Id: 1}
Post {Id: 2} Modified
  Id: 2 PK
  BlogId: 1 FK Modified Originally <null>
  Content: 'F# 5 is the latest version of F#, the functional programming...' Modified
  Title: 'Announcing F# 5' Modified
  Blog: {Id: 1}
```

Calling ```SaveChanges``` at this point will cause updates to be sent to the database for all the existing entities, while the new entity is inserted. For example, when using SQLite:

```sql
-- Executed DbCommand (0ms) [Parameters=[@p1='1' (DbType = String), @p0='.NET Blog' (Size = 9)], CommandType='Text', CommandTimeout='30']
UPDATE "Blogs" SET "Name" = @p0
WHERE "Id" = @p1;
SELECT changes();

-- Executed DbCommand (0ms) [Parameters=[@p3='1' (DbType = String), @p0='1' (DbType = String), @p1='Announcing the release of EF Core 5.0, a full featured cross-platform...' (Size = 72), @p2='Announcing the Release of EF Core 5.0' (Size = 37)], CommandType='Text', CommandTimeout='30']
UPDATE "Posts" SET "BlogId" = @p0, "Content" = @p1, "Title" = @p2
WHERE "Id" = @p3;
SELECT changes();

-- Executed DbCommand (0ms) [Parameters=[@p3='2' (DbType = String), @p0='1' (DbType = String), @p1='F# 5 is the latest version of F#, the functional programming language...' (Size = 72), @p2='Announcing F# 5' (Size = 15)], CommandType='Text', CommandTimeout='30']
UPDATE "Posts" SET "BlogId" = @p0, "Content" = @p1, "Title" = @p2
WHERE "Id" = @p3;
SELECT changes();

-- Executed DbCommand (0ms) [Parameters=[@p0='1' (DbType = String), @p1='.NET 5.0 includes many enhancements, including single file applications, more...' (Size = 80), @p2='Announcing .NET 5.0' (Size = 19)], CommandType='Text', CommandTimeout='30']
INSERT INTO "Posts" ("BlogId", "Content", "Title")
VALUES (@p0, @p1, @p2);
SELECT "Id"
FROM "Posts"
WHERE changes() = 1 AND "rowid" = last_insert_rowid();
```

In this article, I'm going to show you how to generate updates and inserts from a disconnected graph.

## Deleting existing entities

The DbContext method returns a list of entities that can be deleted by ```SaveChanges```.

```csharp
context.Remove(
    new Post { Id = 2 });
```

Inspecting the change tracker debug view following this call shows that the context is tracking the entity in the ```Deleted``` state:

```output
Post {Id: 2} Deleted
  Id: 2 PK
  BlogId: <null> FK
  Content: <null>
  Title: <null>
  Blog: <null>
```

This entity will be deleted when ```SaveChanges``` is called. For example, when using SQLite:

```sql
-- Executed DbCommand (0ms) [Parameters=[@p0='2' (DbType = String)], CommandType='Text', CommandTimeout='30']
DELETE FROM "Posts"
WHERE "Id" = @p0;
SELECT changes();
```

After ```SaveChanges``` completes, the deleted entity is detached from the DbContext since it no longer exists in the database. The debug view is therefore empty because no entities are being tracked.

## Deleting dependent/child entities

Deleting dependent/child entities from a graph is more straightforward than deleting principal/parent entities. See the next section and Changing Foreign Keys and Navigations for more information.

Call ```Remove``` on an entity that should be deleted.

- Running a query for the entities

- Using the ```Attach``` or ```Update``` methods on a graph of disconnected entities, as described in the preceding sections.

For example, the code in the previous section is more likely to obtain a post from a client and then do something like this:

```csharp
context.Attach(post);
context.Remove(post);
```

This behaves exactly the same way as the previous example, since calling ```Remove``` on an un-tracked entity causes it to first be attached and then marked as ```Deleted```.

In more realistic examples, a graph of entities is first attached, and then some of those entities are marked as deleted. For example:

```csharp
// Attach a blog and associated posts
context.Attach(blog);

// Mark one post as Deleted
context.Remove(blog.Posts[1]);
```

All entities are marked as ```Unchanged```, except the one on which ```Remove``` was called:

```output
Blog {Id: 1} Unchanged
  Id: 1 PK
  Name: '.NET Blog'
  Posts: [{Id: 1}, {Id: 2}]
Post {Id: 1} Unchanged
  Id: 1 PK
  BlogId: 1 FK
  Content: 'Announcing the release of EF Core 5.0, a full featured cross...'
  Title: 'Announcing the Release of EF Core 5.0'
  Blog: {Id: 1}
Post {Id: 2} Deleted
  Id: 2 PK
  BlogId: 1 FK
  Content: 'F# 5 is the latest version of F#, the functional programming...'
  Title: 'Announcing F# 5'
  Blog: {Id: 1}
```

This entity will be deleted when ```SaveChanges``` is called. For example, when using SQLite:

```sql
-- Executed DbCommand (0ms) [Parameters=[@p0='2' (DbType = String)], CommandType='Text', CommandTimeout='30']
DELETE FROM "Posts"
WHERE "Id" = @p0;
SELECT changes();
```

After ```SaveChanges``` completes, the deleted entity is detached from the DbContext since it no longer exists in the database. Other entities remain in the ```Unchanged``` state:

```output
Blog {Id: 1} Unchanged
  Id: 1 PK
  Name: '.NET Blog'
  Posts: [{Id: 1}]
Post {Id: 1} Unchanged
  Id: 1 PK
  BlogId: 1 FK
  Content: 'Announcing the release of EF Core 5.0, a full featured cross...'
  Title: 'Announcing the Release of EF Core 5.0'
  Blog: {Id: 1}
```

## Deleting principal/parent entities

A relationship is a type of entity that connects two entity types.

In this article we are going to look at how to delete entities in a one-to-many relationship.

This invalid model state can be handled in two ways:

- Setting FK values to null. This indicates that the dependents/children are no longer related to any principal/parent. This is the default for optional relationships where the foreign key must be nullable. Setting the FK to null is not valid for required relationships, where the foreign key is typically non-nullable.

- Deleting the dependents/children. This is the default for required relationships, and is also valid for optional relationships.

See Changing Foreign Keys and Navigations for detailed information on change tracking and relationships.

### Optional relationships

In this article we are going to look at the relationship between the ```Post.BlogId``` foreign key property and the ```BlogId``` foreign key property.

```csharp
// Attach a blog and associated posts
context.Attach(blog);

// Mark the blog as deleted
context.Remove(blog);
```

Inspecting the change tracker debug view following the call to ```Remove``` shows that, as expected, the blog is now marked as ```Deleted```:

```output
Blog {Id: 1} Deleted
  Id: 1 PK
  Name: '.NET Blog'
  Posts: [{Id: 1}, {Id: 2}]
Post {Id: 1} Modified
  Id: 1 PK
  BlogId: <null> FK Modified Originally 1
  Content: 'Announcing the release of EF Core 5.0, a full featured cross...'
  Title: 'Announcing the Release of EF Core 5.0'
  Blog: <null>
Post {Id: 2} Modified
  Id: 2 PK
  BlogId: <null> FK Modified Originally 1
  Content: 'F# 5 is the latest version of F#, the functional programming...'
  Title: 'Announcing F# 5'
  Blog: <null>
```

It's been a while since I've done anything like this, but I've found a way to delete all the related posts in one go.

```sql
-- Executed DbCommand (0ms) [Parameters=[@p1='1' (DbType = String), @p0=NULL], CommandType='Text', CommandTimeout='30']
UPDATE "Posts" SET "BlogId" = @p0
WHERE "Id" = @p1;
SELECT changes();

-- Executed DbCommand (0ms) [Parameters=[@p1='2' (DbType = String), @p0=NULL], CommandType='Text', CommandTimeout='30']
UPDATE "Posts" SET "BlogId" = @p0
WHERE "Id" = @p1;
SELECT changes();

-- Executed DbCommand (0ms) [Parameters=[@p2='1' (DbType = String)], CommandType='Text', CommandTimeout='30']
DELETE FROM "Blogs"
WHERE "Id" = @p2;
SELECT changes();
```

 ```SaveChanges``` deletes an entity from the DbContext.

```output
Post {Id: 1} Unchanged
  Id: 1 PK
  BlogId: <null> FK
  Content: 'Announcing the release of EF Core 5.0, a full featured cross...'
  Title: 'Announcing the Release of EF Core 5.0'
  Blog: <null>
Post {Id: 2} Unchanged
  Id: 2 PK
  BlogId: <null> FK
  Content: 'F# 5 is the latest version of F#, the functional programming...'
  Title: 'Announcing F# 5'
  Blog: <null>
```

### Required relationships

If the ```Post.BlogId``` foreign key property is non-nullable, then the relationship between blogs and posts becomes "required".

```csharp
// Attach a blog and associated posts
context.Attach(blog);

// Mark the blog as deleted
context.Remove(blog);
```

Inspecting the change tracker debug view following the call to ```Remove``` shows that, as expected, the blog is again marked as ```Deleted```:

```output
Blog {Id: 1} Deleted
  Id: 1 PK
  Name: '.NET Blog'
  Posts: [{Id: 1}, {Id: 2}]
Post {Id: 1} Deleted
  Id: 1 PK
  BlogId: 1 FK
  Content: 'Announcing the release of EF Core 5.0, a full featured cross...'
  Title: 'Announcing the Release of EF Core 5.0'
  Blog: {Id: 1}
Post {Id: 2} Deleted
  Id: 2 PK
  BlogId: 1 FK
  Content: 'F# 5 is the latest version of F#, the functional programming...'
  Title: 'Announcing F# 5'
  Blog: {Id: 1}
```

More interestingly in this case is that all related posts have also been marked as ```Deleted```. Calling ```SaveChanges``` causes the blog and all related posts to be deleted from the database:

```sql
-- Executed DbCommand (0ms) [Parameters=[@p0='1' (DbType = String)], CommandType='Text', CommandTimeout='30']
DELETE FROM "Posts"
WHERE "Id" = @p0;
SELECT changes();

-- Executed DbCommand (0ms) [Parameters=[@p0='2' (DbType = String)], CommandType='Text', CommandTimeout='30']
DELETE FROM "Posts"
WHERE "Id" = @p0;
SELECT changes();

-- Executed DbCommand (0ms) [Parameters=[@p1='1' (DbType = String)], CommandType='Text', CommandTimeout='30']
DELETE FROM "Blogs"
WHERE "Id" = @p1;
```

After ```SaveChanges``` completes, all the deleted entities are detached from the DbContext since they no longer exist in the database. Output from the debug view is therefore empty.

> Note
This document only scratches the surface on working with relationships in EF Core. See Relationships for more information on modeling relationships, and Changing Foreign Keys and Navigations for more information on updating/deleting dependent/child entities when calling ```SaveChanges```.

## Custom tracking with ```TrackGraph```

```ChangeTracker.TrackGraph``` allows you to track entities in a graph.

In this article, I'm going to show you how to extend some of the rules in EF Core to make it easier to track entities with generated key values.

```csharp
blog.Posts.Add(
    new Post
    {
        Title = "Announcing .NET 5.0",
        Content = ".NET 5.0 includes many enhancements, including single file applications, more..."
    }
);

var toDelete = blog.Posts.Single(e => e.Title == "Announcing F# 5");
toDelete.Id = -toDelete.Id;
```

This disconnected graph can then be tracked using ```TrackGraph```:

```csharp
public static void UpdateBlog(Blog blog)
{
    using var context = new BlogsContext();

    context.ChangeTracker.TrackGraph(
        blog, node =>
        {
            var propertyEntry = node.Entry.Property("Id");
            var keyValue = (int)propertyEntry.CurrentValue;

            if (keyValue == 0)
            {
                node.Entry.State = EntityState.Added;
            }
            else if (keyValue < 0)
            {
                propertyEntry.CurrentValue = -keyValue;
                node.Entry.State = EntityState.Deleted;
            }
            else
            {
                node.Entry.State = EntityState.Modified;
            }

            Console.WriteLine($"Tracking {node.Entry.Metadata.DisplayName()} with key value {keyValue} as {node.Entry.State}");
        });

    context.SaveChanges();
}
```

This example shows how to track entities by key value.

The output from running this code is:

```output
Tracking Blog with key value 1 as Modified
Tracking Post with key value 1 as Modified
Tracking Post with key value -2 as Deleted
Tracking Post with key value 0 as Added
```

> Note
For simplicity, this code assumes each entity has an integer primary key property called ```Id```. This could be codified into an abstract base class or interface. Alternately, the primary key property or properties could be obtained from the IEntityType metadata such that this code would work with any type of entity.

In this post, I'm going to show you how to overload TrackGraph with EF Core.

The graph traversal overload, ```Change.TrackGraphTState>(Object, TState, FuncEntryGraphNodeTState>,Boolean)``` has a callback that returns a bool.

The advanced overload also allows state to be supplied to TrackGraph and this state is then passed to each callback.

Ref: [Explicitly Tracking Entities](https://learn.microsoft.com/en-us/ef/core/change-tracking/explicit-tracking)