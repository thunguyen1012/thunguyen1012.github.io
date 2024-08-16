---
title: Entity Framework - Entity Framework Core - Change tracking - Changing foreign keys and navigations
published: true
date: 2024-08-16 10:41:09
tags: Summary, EFCore
description: An Entity Framework Core model represents a relationship between a principal or parent entity and a dependent or child entity.
image:
---

## In this article

## Overview of foreign keys and navigations

An Entity Framework Core model represents a relationship between a principal or parent entity and a dependent or child entity.

The foreign key (FK) representation is used to store relationships between entities in the database.

The FK property can be used as a navigation property in a relationship.

> Tip
This document assumes that entity states and the basics of EF Core change tracking are understood. See Change Tracking in EF Core for more information on these topics.

> Tip
You can run and debug into all the code in this document by downloading the sample code from GitHub.

### Example model

The following model contains four entity types with relationships between them. The comments in the code indicate which properties are foreign keys, primary keys, and navigations.

```csharp
public class Blog
{
    public int Id { get; set; } // Primary key
    public string Name { get; set; }

    public IList<Post> Posts { get; } = new List<Post>(); // Collection navigation
    public BlogAssets Assets { get; set; } // Reference navigation
}

public class BlogAssets
{
    public int Id { get; set; } // Primary key
    public byte[] Banner { get; set; }

    public int? BlogId { get; set; } // Foreign key
    public Blog Blog { get; set; } // Reference navigation
}

public class Post
{
    public int Id { get; set; } // Primary key
    public string Title { get; set; }
    public string Content { get; set; }

    public int? BlogId { get; set; } // Foreign key
    public Blog Blog { get; set; } // Reference navigation

    public IList<Tag> Tags { get; } = new List<Tag>(); // Skip collection navigation
}

public class Tag
{
    public int Id { get; set; } // Primary key
    public string Text { get; set; }

    public IList<Post> Posts { get; } = new List<Post>(); // Skip collection navigation
}
```

The three relationships in this model are:

- Each blog can have many posts (one-to-many):

  - ```Blog``` is the principal/parent.

  - ```Post``` is the dependent/child. It contains the FK property ```Post.BlogId```, the value of which must match the ```Blog.Id``` PK value of the related blog.

  - ```Post.Blog``` is a reference navigation from a post to the associated blog. ```Post.Blog``` is the inverse navigation for ```Blog.Posts```.

  - ```Blog.Posts``` is a collection navigation from a blog to all the associated posts. ```Blog.Posts``` is the inverse navigation for ```Post.Blog```.

- Each blog can have one assets (one-to-one):

  - ```Blog``` is the principal/parent.

  - ```BlogAssets``` is the dependent/child. It contains the FK property ```BlogAssets.BlogId```, the value of which must match the ```Blog.Id``` PK value of the related blog.

  - ```BlogAssets.Blog``` is a reference navigation from the assets to the associated blog. ```BlogAssets.Blog``` is the inverse navigation for ```Blog.Assets```.

  - ```Blog.Assets``` is a reference navigation from the blog to the associated assets. ```Blog.Assets``` is the inverse navigation for ```BlogAssets.Blog```.

- Each post can have many tags and each tag can have many posts (many-to-many):

  - Many-to-many relationships are a further layer over two one-to-many relationships. Many-to-many relationships are covered later in this document.

  - ```Post.Tags``` is a collection navigation from a post to all the associated tags. ```Post.Tags``` is the inverse navigation for ```Tag.Posts```.

  - ```Tag.Posts``` is a collection navigation from a tag to all the associated posts. ```Tag.Posts``` is the inverse navigation for ```Post.Tags```.

See Relationships for more information on how to model and configure relationships.

## Relationship fixup

EF Core keeps navigations in alignment with foreign key values and vice versa.

### Fixup by query

EF Core fixes issues when entities are added or removed from the database.

```csharp
using var context = new BlogsContext();

var blogs = context.Blogs
    .Include(e => e.Posts)
    .Include(e => e.Assets)
    .ToList();

Console.WriteLine(context.ChangeTracker.DebugView.LongView);
```

In this article I'm going to show you how to add navigations to blog posts in EF Core.

Looking at the change tracker debug view after this query shows two blogs, each with one assets and two posts being tracked:

```output
Blog {Id: 1} Unchanged
  Id: 1 PK
  Name: '.NET Blog'
  Assets: {Id: 1}
  Posts: [{Id: 1}, {Id: 2}]
Blog {Id: 2} Unchanged
  Id: 2 PK
  Name: 'Visual Studio Blog'
  Assets: {Id: 2}
  Posts: [{Id: 3}, {Id: 4}]
BlogAssets {Id: 1} Unchanged
  Id: 1 PK
  Banner: <null>
  BlogId: 1 FK
  Blog: {Id: 1}
BlogAssets {Id: 2} Unchanged
  Id: 2 PK
  Banner: <null>
  BlogId: 2 FK
  Blog: {Id: 2}
Post {Id: 1} Unchanged
  Id: 1 PK
  BlogId: 1 FK
  Content: 'Announcing the release of EF Core 5.0, a full featured cross...'
  Title: 'Announcing the Release of EF Core 5.0'
  Blog: {Id: 1}
  Tags: []
Post {Id: 2} Unchanged
  Id: 2 PK
  BlogId: 1 FK
  Content: 'F# 5 is the latest version of F#, the functional programming...'
  Title: 'Announcing F# 5'
  Blog: {Id: 1}
  Tags: []
Post {Id: 3} Unchanged
  Id: 3 PK
  BlogId: 2 FK
  Content: 'If you are focused on squeezing out the last bits of perform...'
  Title: 'Disassembly improvements for optimized managed debugging'
  Blog: {Id: 2}
  Tags: []
Post {Id: 4} Unchanged
  Id: 4 PK
  BlogId: 2 FK
  Content: 'Examine when database queries were executed and measure how ...'
  Title: 'Database Profiling with Visual Studio'
  Blog: {Id: 2}
  Tags: []
```

The debug view shows the key values and navigations of the related entities.

### Fixup to locally tracked entities

DbContext fixes relationships between entities returned from a tracking query and entities already tracked by the DbContext.

```csharp
using var context = new BlogsContext();

var blogs = context.Blogs.ToList();
Console.WriteLine(context.ChangeTracker.DebugView.LongView);

var assets = context.Assets.ToList();
Console.WriteLine(context.ChangeTracker.DebugView.LongView);

var posts = context.Posts.ToList();
Console.WriteLine(context.ChangeTracker.DebugView.LongView);
```

Looking again at the debug views, after the first query only the two blogs are tracked:

```output
Blog {Id: 1} Unchanged
  Id: 1 PK
  Name: '.NET Blog'
  Assets: <null>
  Posts: []
Blog {Id: 2} Unchanged
  Id: 2 PK
  Name: 'Visual Studio Blog'
  Assets: <null>
  Posts: []
```

The ```Blog.Assets``` reference navigations are null, and the ```Blog.Posts``` collection navigations are empty because no associated entities are currently being tracked by the context.

After the second query, the ```BlogAssets``` reference navigations have been fixed up to point to the newly tracked ```BlogAsset``` instances.

```output
Blog {Id: 1} Unchanged
  Id: 1 PK
  Name: '.NET Blog'
  Assets: {Id: 1}
  Posts: []
Blog {Id: 2} Unchanged
  Id: 2 PK
  Name: 'Visual Studio Blog'
  Assets: {Id: 2}
  Posts: []
BlogAssets {Id: 1} Unchanged
  Id: 1 PK
  Banner: <null>
  BlogId: 1 FK
  Blog: {Id: 1}
BlogAssets {Id: 2} Unchanged
  Id: 2 PK
  Banner: <null>
  BlogId: 2 FK
  Blog: {Id: 2}
```

Finally, after the third query, the ```Blog.Posts``` collection navigations now contain all related posts, and the ```Post.Blog``` references point to the appropriate ```Blog``` instance:

```output
Blog {Id: 1} Unchanged
  Id: 1 PK
  Name: '.NET Blog'
  Assets: {Id: 1}
  Posts: [{Id: 1}, {Id: 2}]
Blog {Id: 2} Unchanged
  Id: 2 PK
  Name: 'Visual Studio Blog'
  Assets: {Id: 2}
  Posts: [{Id: 3}, {Id: 4}]
BlogAssets {Id: 1} Unchanged
  Id: 1 PK
  Banner: <null>
  BlogId: 1 FK
  Blog: {Id: 1}
BlogAssets {Id: 2} Unchanged
  Id: 2 PK
  Banner: <null>
  BlogId: 2 FK
  Blog: {Id: 2}
Post {Id: 1} Unchanged
  Id: 1 PK
  BlogId: 1 FK
  Content: 'Announcing the release of EF Core 5.0, a full featured cross...'
  Title: 'Announcing the Release of EF Core 5.0'
  Blog: {Id: 1}
  Tags: []
Post {Id: 2} Unchanged
  Id: 2 PK
  BlogId: 1 FK
  Content: 'F# 5 is the latest version of F#, the functional programming...'
  Title: 'Announcing F# 5'
  Blog: {Id: 1}
  Tags: []
Post {Id: 3} Unchanged
  Id: 3 PK
  BlogId: 2 FK
  Content: 'If you are focused on squeezing out the last bits of perform...'
  Title: 'Disassembly improvements for optimized managed debugging'
  Blog: {Id: 2}
  Tags: []
Post {Id: 4} Unchanged
  Id: 4 PK
  BlogId: 2 FK
  Content: 'Examine when database queries were executed and measure how ...'
  Title: 'Database Profiling with Visual Studio'
  Blog: {Id: 2}
  Tags: []
```

This is the same end-state as was achieved with the original single query, since EF Core fixed up navigations as entities were tracked, even when coming from multiple different queries.

> Note
Fixup never causes more data to be returned from the database. It only connects entities that are already returned by the query or already tracked by the DbContext. See Identity Resolution in EF Core for information about handling duplicates when serializing entities.

## Changing relationships using navigations

The easiest way to change the relationship between two entities is by manipulating a navigation, while leaving EF Core to fixup the inverse navigation and FK values appropriately. This can be done by:

- Adding or removing an entity from a collection navigation.

- Changing a reference navigation to point to a different entity, or setting it to null.

### Adding or removing from collection navigations

In this post, I'm going to show you how to move blog posts from one blog to another.

```csharp
using var context = new BlogsContext();

var dotNetBlog = context.Blogs.Include(e => e.Posts).Single(e => e.Name == ".NET Blog");
var vsBlog = context.Blogs.Include(e => e.Posts).Single(e => e.Name == "Visual Studio Blog");

Console.WriteLine(context.ChangeTracker.DebugView.LongView);

var post = vsBlog.Posts.Single(e => e.Title.StartsWith("Disassembly improvements"));
vsBlog.Posts.Remove(post);
dotNetBlog.Posts.Add(post);

context.ChangeTracker.DetectChanges();
Console.WriteLine(context.ChangeTracker.DebugView.LongView);

context.SaveChanges();
```

> Tip
A call to ```ChangeTracker.DetectChanges()``` is needed here because accessing the debug view does not cause automatic detection of changes.

This is the debug view printed after running the code above:

```output
Blog {Id: 1} Unchanged
  Id: 1 PK
  Name: '.NET Blog'
  Assets: <null>
  Posts: [{Id: 1}, {Id: 2}, {Id: 3}]
Blog {Id: 2} Unchanged
  Id: 2 PK
  Name: 'Visual Studio Blog'
  Assets: <null>
  Posts: [{Id: 4}]
Post {Id: 1} Unchanged
  Id: 1 PK
  BlogId: 1 FK
  Content: 'Announcing the release of EF Core 5.0, a full featured cross...'
  Title: 'Announcing the Release of EF Core 5.0'
  Blog: {Id: 1}
  Tags: []
Post {Id: 2} Unchanged
  Id: 2 PK
  BlogId: 1 FK
  Content: 'F# 5 is the latest version of F#, the functional programming...'
  Title: 'Announcing F# 5'
  Blog: {Id: 1}
  Tags: []
Post {Id: 3} Modified
  Id: 3 PK
  BlogId: 1 FK Modified Originally 2
  Content: 'If you are focused on squeezing out the last bits of perform...'
  Title: 'Disassembly improvements for optimized managed debugging'
  Blog: {Id: 1}
  Tags: []
Post {Id: 4} Unchanged
  Id: 4 PK
  BlogId: 2 FK
  Content: 'Examine when database queries were executed and measure how ...'
  Title: 'Database Profiling with Visual Studio'
  Blog: {Id: 2}
  Tags: []
```

The ```Blog.Posts``` navigation on the .NET ```Blog``` now has four posts (Posts: 1, Id: 2, Id: 3).

A few weeks ago I wrote some code that pointed to the Visual Studio blog (Blog: Id: 1) rather than the .NET blog (Blog: Id: 1).

```sql
-- Executed DbCommand (0ms) [Parameters=[@p1='3' (DbType = String), @p0='1' (Nullable = true) (DbType = String)], CommandType='Text', CommandTimeout='30']
UPDATE "Posts" SET "BlogId" = @p0
WHERE "Id" = @p1;
SELECT changes();
```

### Changing reference navigations

This example shows how to move a post from one blog to another by manipulating the collection navigation of posts on each blog.

```csharp
var post = vsBlog.Posts.Single(e => e.Title.StartsWith("Disassembly improvements"));
post.Blog = dotNetBlog;
```

This example shows how to change the reference navigation of a collection.

## Changing relationships using foreign key values

In this section, we will learn how to manipulate foreign key values directly in EF Core.

```csharp
var post = vsBlog.Posts.Single(e => e.Title.StartsWith("Disassembly improvements"));
post.BlogId = dotNetBlog.Id;
```

Notice how this is very similar to changing the reference navigation, as shown in the previous example.

The debug view after this change is exactly the same as was the case with the previous two examples.

> Tip
Do not write code to manipulate all navigations and FK values each time a relationship changes. Such code is more complicated and must ensure consistent changes to foreign keys and navigations in every case. If possible, just manipulate a single navigation, or maybe both navigations. If needed, just manipulate FK values. Avoid manipulating both navigations and FK values.

## Fixup for added or deleted entities

### Adding to a collection navigation

EF Core performs the following actions when it detects that a new dependent/child entity has been added to a collection navigation:

- If the entity is not tracked, then it is tracked. (The entity will usually be in the ```Added``` state. However, if the entity type is configured to use generated keys and the primary key value is set, then the entity is tracked in the ```Unchanged``` state.)

- If the entity is associated with a different principal/parent, then that relationship is severed.

- The entity becomes associated with the principal/parent that owns the collection navigation.

- Navigations and foreign key values are fixed up for all entities involved.

This code snippet shows how to move a post from one blog to another.

```csharp
var post = vsBlog.Posts.Single(e => e.Title.StartsWith("Disassembly improvements"));
vsBlog.Posts.Remove(post);
dotNetBlog.Posts.Add(post);
```

To:

```csharp
var post = vsBlog.Posts.Single(e => e.Title.StartsWith("Disassembly improvements"));
dotNetBlog.Posts.Add(post);
```

EF Core sees that the post has been added to a new blog and automatically removes it from the collection on the first blog.

### Removing from a collection navigation

The relationship between a principal and a child is a relationship between the principal and the child.

#### Optional relationships

In this example, I'm going to show you how to change the relationship between a dependent child and a parent.

```csharp
var post = dotNetBlog.Posts.Single(e => e.Title == "Announcing F# 5");
dotNetBlog.Posts.Remove(post);
```

Looking at the change tracking debug view after this change shows that:

- The ```Post.BlogId``` FK has been set to null (BlogId: <null> FK ```Modified``` Originally 1)

- The ```Post.Blog``` reference navigation has been set to null (Blog: <null>)

- The post has been removed from ```Blog.Posts``` collection navigation (Posts: [{Id: 1}])

```output
Blog {Id: 1} Unchanged
  Id: 1 PK
  Name: '.NET Blog'
  Assets: <null>
  Posts: [{Id: 1}]
Post {Id: 1} Unchanged
  Id: 1 PK
  BlogId: 1 FK
  Content: 'Announcing the release of EF Core 5.0, a full featured cross...'
  Title: 'Announcing the Release of EF Core 5.0'
  Blog: {Id: 1}
  Tags: []
Post {Id: 2} Modified
  Id: 2 PK
  BlogId: <null> FK Modified Originally 1
  Content: 'F# 5 is the latest version of F#, the functional programming...'
  Title: 'Announcing F# 5'
  Blog: <null>
  Tags: []
```

Notice that the post is not marked as ```Deleted```. It is marked as ```Modified``` so that the FK value in the database will be set to null when ```SaveChanges``` is called.

#### Required relationships

EF Core does not support severing a required relationship when ```SaveChanges``` is called.

For example, let's change the relationship between blog and posts to be required and then run the same code as in the previous example:

```csharp
var post = dotNetBlog.Posts.Single(e => e.Title == "Announcing F# 5");
dotNetBlog.Posts.Remove(post);
```

Looking at the debug view after this change shows that:

- The post has been marked as ```Deleted``` such that it will be deleted from the database when ```SaveChanges``` is called.

- The ```Post.Blog``` reference navigation has been set to null (```Blog: <null>```).

- The post has been removed from ```Blog.Posts``` collection navigation (```Posts: [{Id: 1}]```).

```output
Blog {Id: 1} Unchanged
  Id: 1 PK
  Name: '.NET Blog'
  Assets: <null>
  Posts: [{Id: 1}]
Post {Id: 1} Unchanged
  Id: 1 PK
  BlogId: 1 FK
  Content: 'Announcing the release of EF Core 5.0, a full featured cross...'
  Title: 'Announcing the Release of EF Core 5.0'
  Blog: {Id: 1}
  Tags: []
Post {Id: 2} Deleted
  Id: 2 PK
  BlogId: 1 FK
  Content: 'F# 5 is the latest version of F#, the functional programming...'
  Title: 'Announcing F# 5'
  Blog: <null>
  Tags: []
```

Notice that the ```Post.BlogId``` remains unchanged since for a required relationship it cannot be set to null.

Calling ```SaveChanges``` results in the orphaned post being deleted:

```sql
-- Executed DbCommand (0ms) [Parameters=[@p0='2' (DbType = String)], CommandType='Text', CommandTimeout='30']
DELETE FROM "Posts"
WHERE "Id" = @p0;
SELECT changes();
```

#### Delete orphans timing and re-parenting

An orphan is an entity that has been removed from one parent and re-parented with another parent.

```csharp
context.ChangeTracker.DeleteOrphansTiming = CascadeTiming.OnSaveChanges;

var post = vsBlog.Posts.Single(e => e.Title.StartsWith("Disassembly improvements"));
vsBlog.Posts.Remove(post);

context.ChangeTracker.DetectChanges();
Console.WriteLine(context.ChangeTracker.DebugView.LongView);

dotNetBlog.Posts.Add(post);

context.ChangeTracker.DetectChanges();
Console.WriteLine(context.ChangeTracker.DebugView.LongView);

context.SaveChanges();
```

An example of how EF Core behaves when a relationship is severed.

```output
Post {Id: 3} Modified
  Id: 3 PK
  BlogId: <null> FK Modified Originally 2
  Content: 'If you are focused on squeezing out the last bits of perform...'
  Title: 'Disassembly improvements for optimized managed debugging'
  Blog: <null>
  Tags: []
```

If a post has been orphaned by another post on the same blog, then the post will be saved as an orphan.

```output
Post {Id: 3} Modified
  Id: 3 PK
  BlogId: 1 FK Modified Originally 2
  Content: 'If you are focused on squeezing out the last bits of perform...'
  Title: 'Disassembly improvements for optimized managed debugging'
  Blog: {Id: 1}
  Tags: []
```

```SaveChanges``` called at this point will update the post in the database rather than deleting it.

It is also possible to turn off automatic deletion of orphans. This will result in an exception if ```SaveChanges``` is called while an orphan is being tracked. For example, this code:

```csharp
var dotNetBlog = context.Blogs.Include(e => e.Posts).Single(e => e.Name == ".NET Blog");

context.ChangeTracker.DeleteOrphansTiming = CascadeTiming.Never;

var post = dotNetBlog.Posts.Single(e => e.Title == "Announcing F# 5");
dotNetBlog.Posts.Remove(post);

context.SaveChanges(); // Throws
```

Will throw this exception:

orphans can be deleted at any time.

### Changing a reference navigation

Changing the reference navigation of a one-to-many relationship has the same effect as changing the collection navigation on the other end of the relationship.

#### Optional one-to-one relationships

Changes to a relationship's reference navigation cause the relationship to be severed.

```csharp
using var context = new BlogsContext();

var dotNetBlog = context.Blogs.Include(e => e.Assets).Single(e => e.Name == ".NET Blog");
dotNetBlog.Assets = new BlogAssets();

context.ChangeTracker.DetectChanges();
Console.WriteLine(context.ChangeTracker.DebugView.LongView);

context.SaveChanges();
```

The debug view before calling ```SaveChanges``` shows that the new assets has replaced the existing assets, which is now marked as ```Modified``` with a null ```BlogAssets.BlogId``` FK value:

```output
Blog {Id: 1} Unchanged
  Id: 1 PK
  Name: '.NET Blog'
  Assets: {Id: -2147482629}
  Posts: []
BlogAssets {Id: -2147482629} Added
  Id: -2147482629 PK Temporary
  Banner: <null>
  BlogId: 1 FK
  Blog: {Id: 1}
BlogAssets {Id: 1} Modified
  Id: 1 PK
  Banner: <null>
  BlogId: <null> FK Modified Originally 1
  Blog: <null>
```

This results in an update and an insert when SaveChanges is called:

```sql
-- Executed DbCommand (0ms) [Parameters=[@p1='1' (DbType = String), @p0=NULL], CommandType='Text', CommandTimeout='30']
UPDATE "Assets" SET "BlogId" = @p0
WHERE "Id" = @p1;
SELECT changes();

-- Executed DbCommand (0ms) [Parameters=[@p2=NULL, @p3='1' (Nullable = true) (DbType = String)], CommandType='Text', CommandTimeout='30']
INSERT INTO "Assets" ("Banner", "BlogId")
VALUES (@p2, @p3);
SELECT "Id"
FROM "Assets"
WHERE changes() = 1 AND "rowid" = last_insert_rowid();
```

#### Required one-to-one relationships

In our previous post on how to create ```BlogAssets```, we looked at how to create new ```BlogAssets```.

```output
Blog {Id: 1} Unchanged
  Id: 1 PK
  Name: '.NET Blog'
  Assets: {Id: -2147482639}
  Posts: []
BlogAssets {Id: -2147482639} Added
  Id: -2147482639 PK Temporary
  Banner: <null>
  BlogId: 1 FK
  Blog: {Id: 1}
BlogAssets {Id: 1} Deleted
  Id: 1 PK
  Banner: <null>
  BlogId: 1 FK
  Blog: <null>
```

This then results in a delete and an insert when ```SaveChanges``` is called:

```sql
-- Executed DbCommand (0ms) [Parameters=[@p0='1' (DbType = String)], CommandType='Text', CommandTimeout='30']
DELETE FROM "Assets"
WHERE "Id" = @p0;
SELECT changes();

-- Executed DbCommand (0ms) [Parameters=[@p1=NULL, @p2='1' (DbType = String)], CommandType='Text', CommandTimeout='30']
INSERT INTO "Assets" ("Banner", "BlogId")
VALUES (@p1, @p2);
SELECT "Id"
FROM "Assets"
WHERE changes() = 1 AND "rowid" = last_insert_rowid();
```

The timing of marking orphans as deleted can be changed in the same way as shown for collection navigations and has the same effects.

### Deleting an entity

#### Optional relationships

The ```DbContext.Delete``` method removes references to entities from the navigations of other entities.

For example, let's mark the Visual Studio blog as ```Deleted```:

```csharp
using var context = new BlogsContext();

var vsBlog = context.Blogs
    .Include(e => e.Posts)
    .Include(e => e.Assets)
    .Single(e => e.Name == "Visual Studio Blog");

context.Remove(vsBlog);

Console.WriteLine(context.ChangeTracker.DebugView.LongView);

context.SaveChanges();
```

Looking at the change tracker debug view before calling ```SaveChanges``` shows:

```output
Blog {Id: 2} Deleted
  Id: 2 PK
  Name: 'Visual Studio Blog'
  Assets: {Id: 2}
  Posts: [{Id: 3}, {Id: 4}]
BlogAssets {Id: 2} Modified
  Id: 2 PK
  Banner: <null>
  BlogId: <null> FK Modified Originally 2
  Blog: <null>
Post {Id: 3} Modified
  Id: 3 PK
  BlogId: <null> FK Modified Originally 2
  Content: 'If you are focused on squeezing out the last bits of perform...'
  Title: 'Disassembly improvements for optimized managed debugging'
  Blog: <null>
  Tags: []
Post {Id: 4} Modified
  Id: 4 PK
  BlogId: <null> FK Modified Originally 2
  Content: 'Examine when database queries were executed and measure how ...'
  Title: 'Database Profiling with Visual Studio'
  Blog: <null>
  Tags: []
```

Notice that:

- The blog is marked as ```Deleted```.

- The assets related to the deleted blog has a null FK value (```BlogId: <null> FK Modified Originally 2```) and a null reference navigation (```Blog: <null>```)

- Each post related to the deleted blog has a null FK value (```BlogId: <null> FK Modified Originally 2```) and a null reference navigation (```Blog: <null>```)

#### Required relationships

In this article we are going to look at the fixup behavior for required relationships in EF Core.

```output
Blog {Id: 2} Deleted
  Id: 2 PK
  Name: 'Visual Studio Blog'
  Assets: {Id: 2}
  Posts: [{Id: 3}, {Id: 4}]
BlogAssets {Id: 2} Deleted
  Id: 2 PK
  Banner: <null>
  BlogId: 2 FK
  Blog: {Id: 2}
Post {Id: 3} Deleted
  Id: 3 PK
  BlogId: 2 FK
  Content: 'If you are focused on squeezing out the last bits of perform...'
  Title: 'Disassembly improvements for optimized managed debugging'
  Blog: {Id: 2}
  Tags: []
Post {Id: 4} Deleted
  Id: 4 PK
  BlogId: 2 FK
  Content: 'Examine when database queries were executed and measure how ...'
  Title: 'Database Profiling with Visual Studio'
  Blog: {Id: 2}
  Tags: []
```

As expected, the dependents/children have been deleted.

#### Cascade delete timing and re-parenting

cascade delete when a parent or principal is deleted.

A cascade delete is the process of deleting an orphan from a database.

> Tip
Cascade delete and deleting orphans are closely related. Both result in deleting dependent/child entities when the relationship to their required principal/parent is severed. For cascade delete, this severing happens because the principal/parent is itself deleted. For orphans, the principal/parent entity still exists, but is no longer related to the dependent/child entities.

## Many-to-many relationships

In this paper we will look at how many-to-many relationships are implemented in EF Core.

### How many-to-many relationships work

Consider this EF Core model that creates a many-to-many relationship between posts and tags using an explicitly defined join entity type:

```csharp
public class Post
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }

    public int? BlogId { get; set; }
    public Blog Blog { get; set; }

    public IList<PostTag> PostTags { get; } = new List<PostTag>(); // Collection navigation
}

public class Tag
{
    public int Id { get; set; }
    public string Text { get; set; }

    public IList<PostTag> PostTags { get; } = new List<PostTag>(); // Collection navigation
}

public class PostTag
{
    public int PostId { get; set; } // First part of composite PK; FK to Post
    public int TagId { get; set; } // Second part of composite PK; FK to Tag

    public Post Post { get; set; } // Reference navigation
    public Tag Tag { get; set; } // Reference navigation
}
```

The ```PostTag``` join entity type contains two foreign key properties.

```csharp
using var context = new BlogsContext();

var post = context.Posts.Single(e => e.Id == 3);
var tag = context.Tags.Single(e => e.Id == 1);

context.Add(new PostTag { PostId = post.Id, TagId = tag.Id });

Console.WriteLine(context.ChangeTracker.DebugView.LongView);
```

Looking at the change tracker debug view after running this code shows that the post and tag are related by the new ```PostTag``` join entity:

```output
Post {Id: 3} Unchanged
  Id: 3 PK
  BlogId: 2 FK
  Content: 'If you are focused on squeezing out the last bits of perform...'
  Title: 'Disassembly improvements for optimized managed debugging'
  Blog: <null>
  PostTags: [{PostId: 3, TagId: 1}]
PostTag {PostId: 3, TagId: 1} Added
  PostId: 3 PK FK
  TagId: 1 PK FK
  Post: {Id: 3}
  Tag: {Id: 1}
Tag {Id: 1} Unchanged
  Id: 1 PK
  Text: '.NET'
  PostTags: [{PostId: 3, TagId: 1}]
```

The following examples show how to manipulate relationships between collections on ```Post``` and ```Tag```.

```csharp
context.Add(new PostTag { Post = post, Tag = tag });
```

This results in exactly the same change to FKs and navigations as in the previous example.

### Skip navigations

In this article, we'll look at how to manipulate the join table using special collection navigations.

```csharp
public class Post
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }

    public int? BlogId { get; set; }
    public Blog Blog { get; set; }

    public IList<Tag> Tags { get; } = new List<Tag>(); // Skip collection navigation
    public IList<PostTag> PostTags { get; } = new List<PostTag>(); // Collection navigation
}

public class Tag
{
    public int Id { get; set; }
    public string Text { get; set; }

    public IList<Post> Posts { get; } = new List<Post>(); // Skip collection navigation
    public IList<PostTag> PostTags { get; } = new List<PostTag>(); // Collection navigation
}

public class PostTag
{
    public int PostId { get; set; } // First part of composite PK; FK to Post
    public int TagId { get; set; } // Second part of composite PK; FK to Tag

    public Post Post { get; set; } // Reference navigation
    public Tag Tag { get; set; } // Reference navigation
}
```

This many-to-many relationship requires the following configuration to ensure the skip navigations and normal navigations are all used for the same many-to-many relationship:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasMany(p => p.Tags)
        .WithMany(p => p.Posts)
        .UsingEntity<PostTag>(
            j => j.HasOne(t => t.Tag).WithMany(p => p.PostTags),
            j => j.HasOne(t => t.Post).WithMany(p => p.PostTags));
}
```

See Relationships for more information on mapping many-to-many relationships.

In this article, I'm going to show you how to use skip navigations in WordPress.

```csharp
using var context = new BlogsContext();

var post = context.Posts.Single(e => e.Id == 3);
var tag = context.Tags.Single(e => e.Id == 1);

post.Tags.Add(tag);

context.ChangeTracker.DetectChanges();
Console.WriteLine(context.ChangeTracker.DebugView.LongView);
```

In this post I'm going to show you how to add an entity to a navigation collection.

```output
Post {Id: 3} Unchanged
  Id: 3 PK
  BlogId: 2 FK
  Content: 'If you are focused on squeezing out the last bits of perform...'
  Title: 'Disassembly improvements for optimized managed debugging'
  Blog: <null>
  PostTags: [{PostId: 3, TagId: 1}]
  Tags: [{Id: 1}]
PostTag {PostId: 3, TagId: 1} Added
  PostId: 3 PK FK
  TagId: 1 PK FK
  Post: {Id: 3}
  Tag: {Id: 1}
Tag {Id: 1} Unchanged
  Id: 1 PK
  Text: '.NET'
  PostTags: [{PostId: 3, TagId: 1}]
  Posts: [{Id: 3}]
```

We have fixed up some navigations in the ```PostTag``` join model.

With the introduction of skip navigations, it is now possible to layer many-to-many relationships on top of each other.

```csharp
context.Add(new PostTag { Post = post, Tag = tag });
```

Or using FK values:

```csharp
context.Add(new PostTag { PostId = post.Id, TagId = tag.Id });
```

This will still result in the skip navigations being fixed up correctly, resulting in the same debug view output as in the previous example.

### Skip navigations only

In part one of this series we defined the many-to-many relationship between a ```Post``` and a ```Tag```.

```csharp
using var context = new BlogsContext();

var post = context.Posts.Single(e => e.Id == 3);
var tag = context.Tags.Single(e => e.Id == 1);

post.Tags.Add(tag);

context.ChangeTracker.DetectChanges();
Console.WriteLine(context.ChangeTracker.DebugView.LongView);
```

EF Core has created a new join entity to represent the post and tag that are associated with it.

```output
Post {Id: 3} Unchanged
  Id: 3 PK
  BlogId: 2 FK
  Content: 'If you are focused on squeezing out the last bits of perform...'
  Title: 'Disassembly improvements for optimized managed debugging'
  Blog: <null>
  Tags: [{Id: 1}]
Tag {Id: 1} Unchanged
  Id: 1 PK
  Text: '.NET'
  Posts: [{Id: 3}]
PostTag (Dictionary<string, object>) {PostsId: 3, TagsId: 1} Added
  PostsId: 3 PK FK
  TagsId: 1 PK FK
```

See Relationships for more information about implicit join entities and the use of ```Dictionary<string, object>``` entity types.

> Important
The CLR type used for join entity types by convention may change in future releases to improve performance. Do not depend on the join type being ```Dictionary<string, object>``` unless this has been explicitly configured.

### Join entities with payloads

Is there a better way to manipulate many-to-many relationships in EF Core?

#### Payloads with generated values

EF Core supports adding additional properties to the join entity type. This is known as giving the join entity a "payload". For example, let's add ```TaggedOn``` property to the ```PostTag``` join entity:

```csharp
public class PostTag
{
    public int PostId { get; set; } // First part of composite PK; FK to Post
    public int TagId { get; set; } // Second part of composite PK; FK to Tag

    public DateTime TaggedOn { get; set; } // Payload
}
```

This example shows how to set the payload property when EF Core creates a join entity instance.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasMany(p => p.Tags)
        .WithMany(p => p.Posts)
        .UsingEntity<PostTag>(
            j => j.HasOne<Tag>().WithMany(),
            j => j.HasOne<Post>().WithMany(),
            j => j.Property(e => e.TaggedOn).HasDefaultValueSql("CURRENT_TIMESTAMP"));
}
```

A post can now be tagged in the same way as before:

```csharp
using var context = new BlogsContext();

var post = context.Posts.Single(e => e.Id == 3);
var tag = context.Tags.Single(e => e.Id == 1);

post.Tags.Add(tag);

context.SaveChanges();

Console.WriteLine(context.ChangeTracker.DebugView.LongView);
```

Looking at the change tracker debug view after calling SaveChanges shows that the payload property has been set appropriately:

```output
Post {Id: 3} Unchanged
  Id: 3 PK
  BlogId: 2 FK
  Content: 'If you are focused on squeezing out the last bits of perform...'
  Title: 'Disassembly improvements for optimized managed debugging'
  Blog: <null>
  Tags: [{Id: 1}]
PostTag {PostId: 3, TagId: 1} Unchanged
  PostId: 3 PK FK
  TagId: 1 PK FK
  TaggedOn: '12/29/2020 8:13:21 PM'
Tag {Id: 1} Unchanged
  Id: 1 PK
  Text: '.NET'
  Posts: [{Id: 3}]
```

#### Explicitly setting payload values

Following on from the previous example, let's add a payload property that does not use an automatically generated value:

```csharp
public class PostTag
{
    public int PostId { get; set; } // First part of composite PK; FK to Post
    public int TagId { get; set; } // Second part of composite PK; FK to Tag

    public DateTime TaggedOn { get; set; } // Auto-generated payload property
    public string TaggedBy { get; set; } // Not-generated payload property
}
```

A new feature has been added to Facebook's tag-and-join system.

```csharp
using var context = new BlogsContext();

var post = context.Posts.Single(e => e.Id == 3);
var tag = context.Tags.Single(e => e.Id == 1);

post.Tags.Add(tag);

context.ChangeTracker.DetectChanges();

var joinEntity = context.Set<PostTag>().Find(post.Id, tag.Id);

joinEntity.TaggedBy = "ajcvickers";

context.SaveChanges();

Console.WriteLine(context.ChangeTracker.DebugView.LongView);
```

Once the join entity has been located it can be manipulated in the normal way--in this example, to set the ```TaggedBy``` payload property before calling SaveChanges.

> Note
Note that a call to ```ChangeTracker.DetectChanges()``` is required here to give EF Core a chance to detect the navigation property change and create the join entity instance before ```Find``` is used. See Change Detection and Notifications for more information.

Alternately, the join entity can be created explicitly to associate a post with a tag. For example:

```csharp
using var context = new BlogsContext();

var post = context.Posts.Single(e => e.Id == 3);
var tag = context.Tags.Single(e => e.Id == 1);

context.Add(
    new PostTag { PostId = post.Id, TagId = tag.Id, TaggedBy = "ajcvickers" });

context.SaveChanges();

Console.WriteLine(context.ChangeTracker.DebugView.LongView);
```

Finally, another way to set payload data is by either overriding SaveChanges or using the ```DbContext.SavingChanges``` event to process entities before updating the database. For example:

```csharp
public override int SaveChanges()
{
    foreach (var entityEntry in ChangeTracker.Entries<PostTag>())
    {
        if (entityEntry.State == EntityState.Added)
        {
            entityEntry.Entity.TaggedBy = "ajcvickers";
        }
    }

    return base.SaveChanges();
}
```

Ref: [Changing Foreign Keys and Navigations](https://learn.microsoft.com/en-us/ef/core/change-tracking/relationship-changes)