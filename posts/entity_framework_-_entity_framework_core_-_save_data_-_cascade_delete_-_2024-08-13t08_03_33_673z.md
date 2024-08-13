---
title: Entity Framework - Entity Framework Core - Save data - Cascade delete
published: true
date: 2024-08-13 08:03:33
tags: Summary, EFCore
description: Entity Framework Core (EF Core) represents relationships using foreign keys.
image:
---

## In this article

Entity Framework Core (EF Core) represents relationships using foreign keys.

If the parent entity is deleted, then the foreign key values of the dependents/children will no longer match the primary or alternate key of any parent entity.

There are two options to avoid this referential constraint violation:

- Set the FK values to null

- Also delete the dependent/child entities

The first option is only valid for optional relationships where the foreign key property (and the database column to which it is mapped) must be nullable.

The second option is valid for any kind of relationship and is known as "cascade delete".

> Tip
This document describes cascade deletes (and deleting orphans) from the perspective of updating the database. It makes heavy use of concepts introduced in Change Tracking in EF Core and Changing Foreign Keys and Navigations. Make sure to fully understand these concepts before tackling the material here.

> Tip
You can run and debug into all the code in this document by downloading the sample code from GitHub.

## When cascading behaviors happen

Cascading deletes are used when a dependent/child entity can no longer be associated with its current principal/parent.

### Deleting a principal/parent

The value of ```Blog``` in a relationship with ```Post``` is a foreign key property, the value of ```Blog``` in a relationship with ```Post``` is a foreign key property, the value of ```Blog``` in a relationship with ```Post``` is a foreign key property, the value of ```Blog``` in a relationship with ```Post``` is a foreign key property, the value

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

    public int BlogId { get; set; }
    public Blog Blog { get; set; }
}
```

A relationship between the ```Post.BlogId``` foreign key property and the ```Post.BlogId``` foreign key property.

When deleting a blog, all posts are cascade deleted. For example:

```csharp
using var context = new BlogsContext();

var blog = context.Blogs.OrderBy(e => e.Name).Include(e => e.Posts).First();

context.Remove(blog);

context.SaveChanges();
```

SaveChanges generates the following SQL, using SQL Server as an example:

```sql
-- Executed DbCommand (1ms) [Parameters=[@p0='1'], CommandType='Text', CommandTimeout='30']
SET NOCOUNT ON;
DELETE FROM [Posts]
WHERE [Id] = @p0;
SELECT @@ROWCOUNT;

-- Executed DbCommand (0ms) [Parameters=[@p0='2'], CommandType='Text', CommandTimeout='30']
SET NOCOUNT ON;
DELETE FROM [Posts]
WHERE [Id] = @p0;
SELECT @@ROWCOUNT;

-- Executed DbCommand (2ms) [Parameters=[@p1='1'], CommandType='Text', CommandTimeout='30']
SET NOCOUNT ON;
DELETE FROM [Blogs]
WHERE [Id] = @p1;
SELECT @@ROWCOUNT;
```

### Severing a relationship

Rather than deleting the blog, we could instead sever the relationship between each post and its blog. This can be done by setting the reference navigation ```Post.Blog``` to null for each post:

```csharp
using var context = new BlogsContext();

var blog = context.Blogs.OrderBy(e => e.Name).Include(e => e.Posts).First();

foreach (var post in blog.Posts)
{
    post.Blog = null;
}

context.SaveChanges();
```

The relationship can also be severed by removing each post from the ```Blog.Posts``` collection navigation:

```csharp
using var context = new BlogsContext();

var blog = context.Blogs.OrderBy(e => e.Name).Include(e => e.Posts).First();

blog.Posts.Clear();

context.SaveChanges();
```

In either case the result is the same: the blog is not deleted, but the posts that are no longer associated with any blog are deleted:

```sql
-- Executed DbCommand (1ms) [Parameters=[@p0='1'], CommandType='Text', CommandTimeout='30']
SET NOCOUNT ON;
DELETE FROM [Posts]
WHERE [Id] = @p0;
SELECT @@ROWCOUNT;

-- Executed DbCommand (0ms) [Parameters=[@p0='2'], CommandType='Text', CommandTimeout='30']
SET NOCOUNT ON;
DELETE FROM [Posts]
WHERE [Id] = @p0;
SELECT @@ROWCOUNT;
```

Deleting entities that are no longer associated with any principal/dependent is known as "deleting orphans".

> Tip
Cascade delete and deleting orphans are closely related. Both result in deleting dependent/child entities when the relationship to their required principal/parent is severed. For cascade delete, this severing happens because the principal/parent is itself deleted. For orphans, the principal/parent entity still exists, but is no longer related to the dependent/child entities.

## Where cascading behaviors happen

Cascading behaviors can be applied to:

- Entities tracked by the current DbContext

- Entities in the database that have not been loaded into the context

### ```Cascade``` delete of tracked entities

EF Core always applies configured cascading behaviors to tracked entities.

> Tip
The exact timing of when cascading behaviors happen to tracked entities can be controlled using ```ChangeTracker.CascadeDeleteTiming``` and ```ChangeTracker.DeleteOrphansTiming```. See Changing Foreign Keys and Navigations for more information.

### ```Cascade``` delete in the database

When migrating to a new database system, you may need to create a new table for each post in the database.

```sql
CREATE TABLE [Posts] (
    [Id] int NOT NULL IDENTITY,
    [Title] nvarchar(max) NULL,
    [Content] nvarchar(max) NULL,
    [BlogId] int NOT NULL,
    CONSTRAINT [PK_Posts] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Posts_Blogs_BlogId] FOREIGN KEY ([BlogId]) REFERENCES [Blogs] ([Id]) ON DELETE CASCADE
);
```

Notice that the foreign key constraint defining the relationship between blogs and posts is configured with ```ON DELETE CASCADE```.

The following example shows how to delete a blog without first loading posts.

```csharp
using var context = new BlogsContext();

var blog = context.Blogs.OrderBy(e => e.Name).First();

context.Remove(blog);

context.SaveChanges();
```

Notice that there is no ```Include``` for posts, so they are not loaded. SaveChanges in this case will delete just the blog, since that's the only entity being tracked:

```sql
-- Executed DbCommand (6ms) [Parameters=[@p0='1'], CommandType='Text', CommandTimeout='30']
SET NOCOUNT ON;
DELETE FROM [Blogs]
WHERE [Id] = @p0;
SELECT @@ROWCOUNT;
```

If a post is deleted from a database, the post will be deleted from the database as well.

> Note
Databases don't typically have any way to automatically delete orphans. This is because while EF Core represents relationships using navigations as well of foreign keys, databases have only foreign keys and no navigations. This means that it is usually not possible to sever a relationship without loading both sides into the DbContext.

> Note
The EF Core in-memory database does not currently support cascade deletes in the database.

> Warning
Do not configure cascade delete in the database when soft-deleting entities. This may cause entities to be accidentally really deleted instead of soft-deleted.

### Database cascade limitations

Some databases, most notably SQL Server, have limitations on the cascade behaviors that form cycles. For example, consider the following model:

```csharp
public class Blog
{
    public int Id { get; set; }
    public string Name { get; set; }

    public IList<Post> Posts { get; } = new List<Post>();

    public int OwnerId { get; set; }
    public Person Owner { get; set; }
}

public class Post
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }

    public int BlogId { get; set; }
    public Blog Blog { get; set; }

    public int AuthorId { get; set; }
    public Person Author { get; set; }
}

public class Person
{
    public int Id { get; set; }
    public string Name { get; set; }

    public IList<Post> Posts { get; } = new List<Post>();

    public Blog OwnedBlog { get; set; }
}
```

This model has three relationships, all required and therefore configured to cascade delete by convention:

- Deleting a blog will cascade delete all the related posts

- Deleting the author of posts will cause the authored posts to be cascade deleted

- Deleting the owner of a blog will cause the blog to be cascade deleted

This is all reasonable (if a bit draconian in blog management policies!) but attempting to create a SQL Server database with these cascades configured results in the following exception:

There are two ways to handle this situation:

- Change one or more of the relationships to not cascade delete.

- Configure the database without one or more of these cascade deletes, then ensure all dependent entities are loaded so that EF Core can perform the cascading behavior.

Taking the first approach with our example, we could make the post-blog relationship optional by giving it a nullable foreign key property:

```csharp
public int? BlogId { get; set; }
```

This example shows how to delete a blog post from a database.

Taking the second approach instead, we can keep the blog-owner relationship required and configured for cascade delete, but make this configuration only apply to tracked entities, not the database:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder
        .Entity<Blog>()
        .HasOne(e => e.Owner)
        .WithOne(e => e.OwnedBlog)
        .OnDelete(DeleteBehavior.ClientCascade);
}
```

Now what happens if we load both a person and the blog they own, then delete the person?

```csharp
using var context = new BlogsContext();

var owner = context.People.Single(e => e.Name == "ajcvickers");
var blog = context.Blogs.Single(e => e.Owner == owner);

context.Remove(owner);

context.SaveChanges();
```

EF Core will cascade the delete of the owner so that the blog is also deleted:

```sql
-- Executed DbCommand (8ms) [Parameters=[@p0='1'], CommandType='Text', CommandTimeout='30']
SET NOCOUNT ON;
DELETE FROM [Blogs]
WHERE [Id] = @p0;
SELECT @@ROWCOUNT;

-- Executed DbCommand (2ms) [Parameters=[@p1='1'], CommandType='Text', CommandTimeout='30']
SET NOCOUNT ON;
DELETE FROM [People]
WHERE [Id] = @p1;
SELECT @@ROWCOUNT;
```

However, if the blog is not loaded when the owner is deleted:

```csharp
using var context = new BlogsContext();

var owner = context.People.Single(e => e.Name == "ajcvickers");

context.Remove(owner);

context.SaveChanges();
```

Then an exception will be thrown due to violation of the foreign key constraint in the database:

## Cascading nulls

All relationships have a foreign key property mapped to a nullable database column.

Let's look again at the examples from When cascading behaviors happen, but this time with an optional relationship represented by a nullable ```Post.BlogId``` foreign key property:

```csharp
public int? BlogId { get; set; }
```

This foreign key property will be set to null for each post when its related blog is deleted. For example, this code, which is the same as before:

```csharp
using var context = new BlogsContext();

var blog = context.Blogs.OrderBy(e => e.Name).Include(e => e.Posts).First();

context.Remove(blog);

context.SaveChanges();
```

Will now result in the following database updates when ```SaveChanges``` is called:

```sql
-- Executed DbCommand (2ms) [Parameters=[@p1='1', @p0=NULL (DbType = Int32)], CommandType='Text', CommandTimeout='30']
SET NOCOUNT ON;
UPDATE [Posts] SET [BlogId] = @p0
WHERE [Id] = @p1;
SELECT @@ROWCOUNT;

-- Executed DbCommand (0ms) [Parameters=[@p1='2', @p0=NULL (DbType = Int32)], CommandType='Text', CommandTimeout='30']
SET NOCOUNT ON;
UPDATE [Posts] SET [BlogId] = @p0
WHERE [Id] = @p1;
SELECT @@ROWCOUNT;

-- Executed DbCommand (1ms) [Parameters=[@p2='1'], CommandType='Text', CommandTimeout='30']
SET NOCOUNT ON;
DELETE FROM [Blogs]
WHERE [Id] = @p2;
SELECT @@ROWCOUNT;
```

Likewise, if the relationship is severed using either of the examples from above:

```csharp
using var context = new BlogsContext();

var blog = context.Blogs.OrderBy(e => e.Name).Include(e => e.Posts).First();

foreach (var post in blog.Posts)
{
    post.Blog = null;
}

context.SaveChanges();
```

Or:

```csharp
using var context = new BlogsContext();

var blog = context.Blogs.OrderBy(e => e.Name).Include(e => e.Posts).First();

blog.Posts.Clear();

context.SaveChanges();
```

Then the posts are updated with null foreign key values when SaveChanges is called:

```sql
-- Executed DbCommand (2ms) [Parameters=[@p1='1', @p0=NULL (DbType = Int32)], CommandType='Text', CommandTimeout='30']
SET NOCOUNT ON;
UPDATE [Posts] SET [BlogId] = @p0
WHERE [Id] = @p1;
SELECT @@ROWCOUNT;

-- Executed DbCommand (0ms) [Parameters=[@p1='2', @p0=NULL (DbType = Int32)], CommandType='Text', CommandTimeout='30']
SET NOCOUNT ON;
UPDATE [Posts] SET [BlogId] = @p0
WHERE [Id] = @p1;
SELECT @@ROWCOUNT;
```

See Changing Foreign Keys and Navigations for more information on how EF Core manages foreign keys and navigations as their values are changed.

> Note
The fixup of relationships like this has been the default behavior of Entity Framework since the first version in 2008. Prior to EF Core it didn't have a name and was not possible to change. It is now known as ```ClientSetNull``` as described in the next section.

cascading nulls can be configured to cascade nulls like this when a principal or parent in an optional relationship is deleted.

## Configuring cascading behaviors

> Tip
Be sure to read sections above before coming here. The configuration options will likely not make sense if the preceding material is not understood.

 ```Cascade``` behaviors are configured per relationship using the ```OnDelete``` method in OnModelCreating. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder
        .Entity<Blog>()
        .HasOne(e => e.Owner)
        .WithOne(e => e.OwnedBlog)
        .OnDelete(DeleteBehavior.ClientCascade);
}
```

See Relationships for more information on configuring relationships between entity types.

This example shows how to use an enum to create a cascade of entities.

### Impact on database schema

The following table shows the result of each ```OnDelete``` value on the foreign key constraint created by EF Core migrations or EnsureCreated.

<table><thead>
<tr>
<th style="text-align: left;">DeleteBehavior</th>
<th>Impact on database schema</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">Cascade</td>
<td>ON DELETE CASCADE</td>
</tr>
<tr>
<td style="text-align: left;">Restrict</td>
<td>ON DELETE RESTRICT</td>
</tr>
<tr>
<td style="text-align: left;">NoAction</td>
<td>database default</td>
</tr>
<tr>
<td style="text-align: left;">SetNull</td>
<td>ON DELETE SET NULL</td>
</tr>
<tr>
<td style="text-align: left;">ClientSetNull</td>
<td>database default</td>
</tr>
<tr>
<td style="text-align: left;">ClientCascade</td>
<td>database default</td>
</tr>
<tr>
<td style="text-align: left;">ClientNoAction</td>
<td>database default</td>
</tr>
</tbody></table>

There is a difference between ONRICT and ONNO.

SQL Server doesn't support ```ON DELETE RESTRICT```, so ```ON DELETE NO ACTION``` is used instead.

The only values that will cause cascading behaviors on the database are ```Cascade``` and ```SetNull```. All other values will configure the database to not cascade any changes.

### Impact on SaveChanges behavior

What happens when the principal or parent of a dependent/child entity dies?

- Optional (nullable FK) and required (non-nullable FK) relationships

- When dependents/children are loaded and tracked by the DbContext and when they exist only in the database

#### Required relationship with dependents/children loaded

<table><thead>
<tr>
<th style="text-align: left;">DeleteBehavior</th>
<th>On deleting principal/parent</th>
<th>On severing from principal/parent</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">Cascade</td>
<td>Dependents deleted by EF Core</td>
<td>Dependents deleted by EF Core</td>
</tr>
<tr>
<td style="text-align: left;">Restrict</td>
<td><code>InvalidOperationException</code></td>
<td><code>InvalidOperationException</code></td>
</tr>
<tr>
<td style="text-align: left;">NoAction</td>
<td><code>InvalidOperationException</code></td>
<td><code>InvalidOperationException</code></td>
</tr>
<tr>
<td style="text-align: left;">SetNull</td>
<td><code>SqlException</code> on creating database</td>
<td><code>SqlException</code> on creating database</td>
</tr>
<tr>
<td style="text-align: left;">ClientSetNull</td>
<td><code>InvalidOperationException</code></td>
<td><code>InvalidOperationException</code></td>
</tr>
<tr>
<td style="text-align: left;">ClientCascade</td>
<td>Dependents deleted by EF Core</td>
<td>Dependents deleted by EF Core</td>
</tr>
<tr>
<td style="text-align: left;">ClientNoAction</td>
<td><code>DbUpdateException</code></td>
<td><code>InvalidOperationException</code></td>
</tr>
</tbody></table>

Notes:

- The default for required relationships like this is ```Cascade```.

- Using anything other than cascade delete for required relationships will result in an exception when ```SaveChanges``` is called.

  - Typically, this is an ```InvalidOperationException``` from EF Core since the invalid state is detected in the loaded children/dependents.

  - ```ClientNoAction``` forces EF Core to not check fixup dependents before sending them to the database, so in this case the database throws an exception, which is then wrapped in a ```DbUpdateException``` by ```SaveChanges```.

  - ```SetNull``` is rejected when creating the database since the foreign key column is not nullable.

- Since dependents/children are loaded, they are always deleted by EF Core, and never left for the database to delete.

#### Required relationship with dependents/children not loaded

<table><thead>
<tr>
<th style="text-align: left;">DeleteBehavior</th>
<th>On deleting principal/parent</th>
<th>On severing from principal/parent</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">Cascade</td>
<td>Dependents deleted by database</td>
<td>N/A</td>
</tr>
<tr>
<td style="text-align: left;">Restrict</td>
<td><code>DbUpdateException</code></td>
<td>N/A</td>
</tr>
<tr>
<td style="text-align: left;">NoAction</td>
<td><code>DbUpdateException</code></td>
<td>N/A</td>
</tr>
<tr>
<td style="text-align: left;">SetNull</td>
<td><code>SqlException</code> on creating database</td>
<td>N/A</td>
</tr>
<tr>
<td style="text-align: left;">ClientSetNull</td>
<td><code>DbUpdateException</code></td>
<td>N/A</td>
</tr>
<tr>
<td style="text-align: left;">ClientCascade</td>
<td><code>DbUpdateException</code></td>
<td>N/A</td>
</tr>
<tr>
<td style="text-align: left;">ClientNoAction</td>
<td><code>DbUpdateException</code></td>
<td>N/A</td>
</tr>
</tbody></table>

Notes:

- Severing a relationship is not valid here since the dependents/children are not loaded.

- The default for required relationships like this is ```Cascade```.

- Using anything other than cascade delete for required relationships will result in an exception when SaveChanges is called.

  - Typically, this is a ```DbUpdateException``` because the dependents/children are not loaded, and hence the invalid state can only be detected by the database. SaveChanges then wraps the database exception in a ```DbUpdateException```.

  - ```SetNull``` is rejected when creating the database since the foreign key column is not nullable.

#### Optional relationship with dependents/children loaded

<table><thead>
<tr>
<th style="text-align: left;">DeleteBehavior</th>
<th>On deleting principal/parent</th>
<th>On severing from principal/parent</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">Cascade</td>
<td>Dependents deleted by EF Core</td>
<td>Dependents deleted by EF Core</td>
</tr>
<tr>
<td style="text-align: left;">Restrict</td>
<td>Dependent FKs set to null by EF Core</td>
<td>Dependent FKs set to null by EF Core</td>
</tr>
<tr>
<td style="text-align: left;">NoAction</td>
<td>Dependent FKs set to null by EF Core</td>
<td>Dependent FKs set to null by EF Core</td>
</tr>
<tr>
<td style="text-align: left;">SetNull</td>
<td>Dependent FKs set to null by EF Core</td>
<td>Dependent FKs set to null by EF Core</td>
</tr>
<tr>
<td style="text-align: left;">ClientSetNull</td>
<td>Dependent FKs set to null by EF Core</td>
<td>Dependent FKs set to null by EF Core</td>
</tr>
<tr>
<td style="text-align: left;">ClientCascade</td>
<td>Dependents deleted by EF Core</td>
<td>Dependents deleted by EF Core</td>
</tr>
<tr>
<td style="text-align: left;">ClientNoAction</td>
<td><code>DbUpdateException</code></td>
<td>Dependent FKs set to null by EF Core</td>
</tr>
</tbody></table>

Notes:

- The default for optional relationships like this is ```ClientSetNull```.

- Dependents/children are never deleted unless ```Cascade``` or ```ClientCascade``` are configured.

- All other values cause the dependent FKs to be set to null by EF Core...

  - ...except ```ClientNoAction``` which tells EF Core not to touch the foreign keys of dependents/children when the principal/parent is deleted. The database therefore throws an exception, which is wrapped as a ```DbUpdateException``` by SaveChanges.

#### Optional relationship with dependents/children not loaded

<table><thead>
<tr>
<th style="text-align: left;">DeleteBehavior</th>
<th>On deleting principal/parent</th>
<th>On severing from principal/parent</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">Cascade</td>
<td>Dependents deleted by database</td>
<td>N/A</td>
</tr>
<tr>
<td style="text-align: left;">Restrict</td>
<td><code>DbUpdateException</code></td>
<td>N/A</td>
</tr>
<tr>
<td style="text-align: left;">NoAction</td>
<td><code>DbUpdateException</code></td>
<td>N/A</td>
</tr>
<tr>
<td style="text-align: left;">SetNull</td>
<td>Dependent FKs set to null by database</td>
<td>N/A</td>
</tr>
<tr>
<td style="text-align: left;">ClientSetNull</td>
<td><code>DbUpdateException</code></td>
<td>N/A</td>
</tr>
<tr>
<td style="text-align: left;">ClientCascade</td>
<td><code>DbUpdateException</code></td>
<td>N/A</td>
</tr>
<tr>
<td style="text-align: left;">ClientNoAction</td>
<td><code>DbUpdateException</code></td>
<td>N/A</td>
</tr>
</tbody></table>

Notes:

- Severing a relationship is not valid here since the dependents/children are not loaded.

- The default for optional relationships like this is ```ClientSetNull```.

- Dependents/children must be loaded to avoid a database exception unless the database has been configured to cascade either deletes or nulls.

Ref: [Cascade Delete](https://learn.microsoft.com/en-us/ef/core/saving/cascade-delete)