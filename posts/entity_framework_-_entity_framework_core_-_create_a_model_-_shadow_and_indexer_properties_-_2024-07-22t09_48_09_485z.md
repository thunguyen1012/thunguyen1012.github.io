---
title: Entity Framework - Entity Framework Core - Create a model - Shadow and indexer properties
published: true
date: 2024-07-22 09:48:09
tags: EFCore, Summary
description: This article describes the use of shadow properties in the EF Core model.
image:
---
- Article

  - 02/07/2024

  - 13 contributors

## In this article

This article describes the use of shadow properties in the EF Core model.

This article describes how to use indexer properties in .NET.

## Foreign key shadow properties

A shadow property represents a relationship between two or more properties in a model.

The name of a property will be the name of the property's principal key property.

For example, the following code listing will result in a ```BlogId``` shadow property being introduced to the ```Post``` entity:

```csharp
internal class MyContext : DbContext
{
    public DbSet<Blog> Blogs { get; set; }
    public DbSet<Post> Posts { get; set; }
}

public class Blog
{
    public int BlogId { get; set; }
    public string Url { get; set; }

    public List<Post> Posts { get; set; }
}

public class Post
{
    public int PostId { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }

    // Since there is no CLR property which holds the foreign
    // key for this relationship, a shadow property is created.
    public Blog Blog { get; set; }
}
```

## Configuring shadow properties

Fluent supports shadow properties.

```csharp
internal class MyContext : DbContext
{
    public DbSet<Blog> Blogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Blog>()
            .Property<DateTime>("LastUpdated");
    }
}

public class Blog
{
    public int BlogId { get; set; }
    public string Url { get; set; }
}
```

This method returns the name of an existing property or one defined on the entity class.

## Accessing shadow properties

Shadow property values can be obtained and changed through the ```ChangeTracker``` API:

```csharp
context.Entry(myBlog).Property("LastUpdated").CurrentValue = DateTime.Now;
```

Shadow properties can be referenced in LINQ queries via the ```EF.Property``` static method:

```csharp
var blogs = context.Blogs
    .OrderBy(b => EF.Property<DateTime>(b, "LastUpdated"));
```

Shadow properties cannot be accessed after a no-tracking query since the entities returned are not tracked by the change tracker.

## Configuring indexer properties

In our series of articles on how to use the Fluent API, we'll be looking at how to create indexer properties.

```csharp
internal class MyContext : DbContext
{
    public DbSet<Blog> Blogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Blog>().IndexerProperty<DateTime>("LastUpdated");
    }
}

public class Blog
{
    private readonly Dictionary<string, object> _data = new Dictionary<string, object>();
    public int BlogId { get; set; }

    public object this[string key]
    {
        get => _data[key];
        set => _data[key] = value;
    }
}
```

The ```IndexerProperty``` method returns the name of an indexer property that can be accessed via an entity class.

Indexer properties can be referenced in LINQ queries via the ```EF.Property``` static method as shown above or by using the CLR indexer property.

## ```Property``` bag entity types

Entity types that contain shadow properties are known as shadow entity types.

```csharp
internal class MyContext : DbContext
{
    public DbSet<Dictionary<string, object>> Blogs => Set<Dictionary<string, object>>("Blog");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.SharedTypeEntity<Dictionary<string, object>>(
            "Blog", bb =>
            {
                bb.Property<int>("BlogId");
                bb.Property<string>("Url");
                bb.Property<DateTime>("LastUpdated");
            });
    }
}
```

 ```Property``` bag entity types can be used wherever a normal entity type is used, including as an owned entity type. However, they do have certain limitations:

- They can't have shadow properties.

- Indexer navigations aren't supported

- Inheritance isn't supported

- Some relationship model-building API lack overloads for shared-type entity types

- Other types can't be marked as property bags

Ref: [Shadow and Indexer Properties](https://learn.microsoft.com/en-us/ef/core/modeling/shadow-properties)