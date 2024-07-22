---
title: Entity Framework - Entity Framework Core - Create a model - Entity types
published: true
date: 2024-07-22 03:09:43
tags: EFCore, Summary
description: EF Core includes a DbSet of a type on your context.
image:
---
- Article

  - 01/12/2023

  - 7 contributors

## In this article

EF Core includes a ```DbSet``` of a type on your context.

## Including types in the model

The ```OnModelCreating``` method can be used to create new entities in a ```DbSet``` model.

In the code sample below, all types are included:

- ```Blog``` is included because it's exposed in a ```DbSet``` property on the context.

- ```Post``` is included because it's discovered via the ```Blog.Posts``` navigation property.

- ```AuditEntry``` because it is specified in ```OnModelCreating```.

```csharp
internal class MyContext : DbContext
{
    public DbSet<Blog> Blogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AuditEntry>();
    }
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

    public Blog Blog { get; set; }
}

public class AuditEntry
{
    public int AuditEntryId { get; set; }
    public string Username { get; set; }
    public string Action { get; set; }
}
```

## Excluding types from the model

If you don't want a type to be included in the model, you can exclude it:

 - Data Annotations

 - Fluent API

```csharp
[NotMapped]
public class BlogMetadata
{
    public DateTime LoadedFromDatabase { get; set; }
}
```

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Ignore<BlogMetadata>();
}
```

### Excluding from migrations

The entity type of a ```DbContext``` is mapped to a ```DbContext``` type.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<IdentityUser>()
        .ToTable("AspNetUsers", t => t.ExcludeFromMigrations());
}
```

With this configuration migrations will not create the ```AspNetUsers``` table, but ```IdentityUser``` is still included in the model and can be used normally.

This migration has excluded ```AspNetUsers``` from managing the table.

## Table name

Each entity type has its own class name.

You can manually configure the table name:

 - Data Annotations

 - Fluent API

```csharp
[Table("blogs")]
public class Blog
{
    public int BlogId { get; set; }
    public string Url { get; set; }
}
```

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .ToTable("blogs");
}
```

## Table schema

When using a relational database, tables are by convention created in your database's default schema. For example, Microsoft SQL Server will use the ```dbo``` schema (SQLite does not support schemas).

You can configure tables to be created in a specific schema as follows:

 - Data Annotations

 - Fluent API

```csharp
[Table("blogs", Schema = "blogging")]
public class Blog
{
    public int BlogId { get; set; }
    public string Url { get; set; }
}
```

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .ToTable("blogs", schema: "blogging");
}
```

Rather than specifying the schema for each table, you can also define the default schema at the model level with the fluent API:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.HasDefaultSchema("blogging");
}
```

Note that setting the default schema will also affect other database objects, such as sequences.

## View mapping

Entity types can be mapped to database views using the Fluent API.

> Note
EF will assume that the referenced view already exists in the database, it will not create it automatically in a migration.

```csharp
modelBuilder.Entity<Blog>()
    .ToView("blogsView", schema: "blogging");
```

Mapping to a view will remove the default table mapping, but the entity type can also be mapped to a table explicitly.

> Tip
To test keyless entity types mapped to views using the in-memory provider, map them to a query via ToInMemoryQuery. See the in-memory provider docs for more information.

## Table-valued function mapping

In this post, I'm going to show you how to map entity types to table-valued functions.

```csharp
public class BlogWithMultiplePosts
{
    public string Url { get; set; }
    public int PostCount { get; set; }
}
```

Next, create the following table-valued function in the database, which returns only blogs with multiple posts as well as the number of posts associated with each of these blogs:

```sql
CREATE FUNCTION dbo.BlogsWithMultiplePosts()
RETURNS TABLE
AS
RETURN
(
    SELECT b.Url, COUNT(p.BlogId) AS PostCount
    FROM Blogs AS b
    JOIN Posts AS p ON b.BlogId = p.BlogId
    GROUP BY b.BlogId, b.Url
    HAVING COUNT(p.BlogId) > 1
)
```

Now, the entity ```BlogWithMultiplePosts``` can be mapped to this function in a following way:

```csharp
modelBuilder.Entity<BlogWithMultiplePosts>().HasNoKey().ToFunction("BlogsWithMultiplePosts");
```

> Note
In order to map an entity to a table-valued function the function must be parameterless.

 ```HasColumnName``` method can be used to specify the columns of entity properties returned by the TVF.

When the entity type is mapped to a table-valued function, the query:

```csharp
var query = from b in context.Set<BlogWithMultiplePosts>()
            where b.PostCount > 3
            select new { b.Url, b.PostCount };
```

Produces the following SQL:

```sql
SELECT [b].[Url], [b].[PostCount]
FROM [dbo].[BlogsWithMultiplePosts]() AS [b]
WHERE [b].[PostCount] > 3
```

## Table comments

You can set an arbitrary text comment that gets set on the database table, allowing you to document your schema in the database:

 - Data Annotations

 - Fluent API

```csharp
[Comment("Blogs managed on the website")]
public class Blog
{
    public int BlogId { get; set; }
    public string Url { get; set; }
}
```

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>().ToTable(
        tableBuilder => tableBuilder.HasComment("Blogs managed on the website"));
}
```

## Shared-type entity types

Entity types that use the same CLR type are known as shared-type entity types.

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

Ref: [Entity Types](https://learn.microsoft.com/en-us/ef/core/modeling/entity-types)