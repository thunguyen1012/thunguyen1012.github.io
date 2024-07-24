---
title: Entity Framework - Entity Framework Core - Create a model - Keyless entity types
published: true
date: 2024-07-24 10:12:45
tags: EFCore, Summary
description: In addition to regular entity types, an EF Core model can contain keyless entity types, which can be used to carry out database queries against data that doesn't contain key values.
image:
---

## In this article

> Note
This feature was added under the name of query types. It was later renamed to keyless entity types.

In addition to regular entity types, an EF Core model can contain keyless entity types, which can be used to carry out database queries against data that doesn't contain key values.

## Defining Keyless entity types

Keyless entity types can be defined as follows:

 - Data Annotations

 - Fluent API

```csharp
[Keyless]
public class BlogPostsCount
{
    public string BlogName { get; set; }
    public int PostCount { get; set; }
}
```

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<BlogPostsCount>()
        .HasNoKey();
}
```

## Keyless entity types characteristics

Keyless entity types can be used on both relational and non-relational databases.

However, they are different from regular entity types in that they:

- Cannot have a key defined.

- Are never tracked for changes in the ```DbContext``` and therefore are never inserted, updated or deleted on the database.

- Are never discovered by convention.

- Only support a subset of navigation mapping capabilities, specifically:

  - They may never act as the principal end of a relationship.

  - They may not have navigations to owned entities

  - They can only contain reference navigation properties pointing to regular entities.

  - Entities cannot contain navigation properties to keyless entity types.

- Need to be configured with a ```[Keyless]``` data annotation or a ```.HasNoKey()``` method call.

- May be mapped to a defining query. A defining query is a query declared in the model that acts as a data source for a keyless entity type.

- Can have a hierarchy, but it must be mapped as TPH.

- Cannot use table splitting or entity splitting.

## Usage scenarios

Some of the main usage scenarios for keyless entity types are:

- Serving as the return type for SQL queries.

- Mapping to database views that do not contain a primary key.

- Mapping to tables that do not have a primary key defined.

- Mapping to queries defined in the model.

## Mapping to database objects

In this article we are going to look at how to map a keyless entity type to a database object using the ```ToTable``` or ```ToView``` fluent API.

## Example

The following example shows how to use keyless entity types to query a database view.

> Tip
You can view this article's sample on GitHub.

First, we define a simple Blog and Post model:

```csharp
public class Blog
{
    public int BlogId { get; set; }
    public string Name { get; set; }
    public string Url { get; set; }
    public ICollection<Post> Posts { get; set; }
}

public class Post
{
    public int PostId { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public int BlogId { get; set; }
}
```

Next, we define a simple database view that will allow us to query the number of posts associated with each blog:

```csharp
db.Database.ExecuteSqlRaw(
    @"CREATE VIEW View_BlogPostCounts AS
                SELECT b.Name, Count(p.PostId) as PostCount
                FROM Blogs b
                JOIN Posts p on p.BlogId = b.BlogId
                GROUP BY b.Name");
```

Next, we define a class to hold the result from the database view:

```csharp
public class BlogPostsCount
{
    public string BlogName { get; set; }
    public int PostCount { get; set; }
}
```

Next, we configure the keyless entity type in ```OnModelCreating``` using the ```HasNoKey``` API.
We use fluent configuration API to configure the mapping for the keyless entity type:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder
        .Entity<BlogPostsCount>(
            eb =>
            {
                eb.HasNoKey();
                eb.ToView("View_BlogPostCounts");
                eb.Property(v => v.BlogName).HasColumnName("Name");
            });
}
```

Next, we configure the ```DbContext``` to include the ```DbSet<T>```:

```csharp
public DbSet<BlogPostsCount> BlogPostCounts { get; set; }
```

Finally, we can query the database view in the standard way:

```csharp
var postCounts = db.BlogPostCounts.ToList();

foreach (var postCount in postCounts)
{
    Console.WriteLine($"{postCount.BlogName} has {postCount.PostCount} posts.");
    Console.WriteLine();
}
```

> Tip
Note we have also defined a context level query property (DbSet) to act as a root for queries against this type.

> Tip
To test keyless entity types mapped to views using the in-memory provider, map them to a query via ToInMemoryQuery. See the in-memory provider docs for more information.

Ref: [Keyless Entity Types](https://learn.microsoft.com/en-us/ef/core/modeling/keyless-entity-types)