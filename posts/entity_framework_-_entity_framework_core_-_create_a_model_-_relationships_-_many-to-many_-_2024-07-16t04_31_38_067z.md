
---
title: Entity Framework - Entity Framework Core - Create a model - Relationships - Many-to-many
published: true
date: 2024-07-16T04:31:38.067Z
tags: efcore, summary
description: Many-to-many relationships are used when any number entities of one entity type is associated with any number of entities of the same or another entity type.
image:
---
# [Many-to-many relationships](https://learn.microsoft.com/en-us/ef/core/modeling/relationships/many-to-many)

  - Article

  - 03/30/2023

  - 6 contributors

## In this article

Many-to-many relationships are used when any number entities of one entity type is associated with any number of entities of the same or another entity type.

## Understanding many-to-many relationships

Many-to-many relationships can be represented using just a foreign key.

Many-to-many relationships can be tricky to map to a relational database.

```sql
CREATE TABLE "Posts" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_Posts" PRIMARY KEY AUTOINCREMENT);

CREATE TABLE "Tags" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_Tags" PRIMARY KEY AUTOINCREMENT);

CREATE TABLE "PostTag" (
    "PostsId" INTEGER NOT NULL,
    "TagsId" INTEGER NOT NULL,
    CONSTRAINT "PK_PostTag" PRIMARY KEY ("PostsId", "TagsId"),
    CONSTRAINT "FK_PostTag_Posts_PostsId" FOREIGN KEY ("PostsId") REFERENCES "Posts" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_PostTag_Tags_TagsId" FOREIGN KEY ("TagsId") REFERENCES "Tags" ("Id") ON DELETE CASCADE);
```

The ```PostTag``` table is a join table for the ```Posts``` table.

In this post, I'm going to show you how to map a schema in EF Core to a .NET class.

```csharp
public class Post
{
    public int Id { get; set; }
    public List<PostTag> PostTags { get; } = [];
}

public class Tag
{
    public int Id { get; set; }
    public List<PostTag> PostTags { get; } = [];
}

public class PostTag
{
    public int PostsId { get; set; }
    public int TagsId { get; set; }
    public Post Post { get; set; } = null!;
    public Tag Tag { get; set; } = null!;
}
```

This example shows how to map the join table's many-to-many relationships to the join table's two one-to-many relationships.

EF allows for a more natural mapping through the introduction of two collection navigations, one on ```Post``` containing its related ```Tags```, and an inverse on ```Tag``` containing its related ```Posts```. For example:

```csharp
public class Post
{
    public int Id { get; set; }
    public List<PostTag> PostTags { get; } = [];
    public List<Tag> Tags { get; } = [];
}

public class Tag
{
    public int Id { get; set; }
    public List<PostTag> PostTags { get; } = [];
    public List<Post> Posts { get; } = [];
}

public class PostTag
{
    public int PostsId { get; set; }
    public int TagsId { get; set; }
    public Post Post { get; set; } = null!;
    public Tag Tag { get; set; } = null!;
}
```

> Tip
These new navigations are known as "skip navigations", because they skip over the join entity to provide direct access to the other side of the many-to-many relationship.

The Entity Framework (EF) can transparently map many-to-many relationships between entities.

```csharp
public class Post
{
    public int Id { get; set; }
    public List<Tag> Tags { get; } = [];
}

public class Tag
{
    public int Id { get; set; }
    public List<Post> Posts { get; } = [];
}
```

The ```Post``` and ```Tag``` types shown here in the database schema at the top of this section are both join types.

## Examples

The following sections contain examples of many-to-many relationships, including the configuration needed to achieve each mapping.

> Tip
The code for all the examples below can be found in ManyToMany.cs.

## Basic many-to-many

In the most basic case for a many-to-many, the entity types on each end of the relationship both have a collection navigation. For example:

```csharp
public class Post
{
    public int Id { get; set; }
    public List<Tag> Tags { get; } = [];
}

public class Tag
{
    public int Id { get; set; }
    public List<Post> Posts { get; } = [];
}
```

This relationship is mapped by convention. Even though it is not needed, an equivalent explicit configuration for this relationship is shown below as a learning tool:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasMany(e => e.Tags)
        .WithMany(e => e.Posts);
}
```

Even with this explicit configuration, many aspects of the relationship are still configured by convention. A more complete explicit configuration, again for learning purposes, is:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasMany(e => e.Tags)
        .WithMany(e => e.Posts)
        .UsingEntity(
            "PostTag",
            l => l.HasOne(typeof(Tag)).WithMany().HasForeignKey("TagsId").HasPrincipalKey(nameof(Tag.Id)),
            r => r.HasOne(typeof(Post)).WithMany().HasForeignKey("PostsId").HasPrincipalKey(nameof(Post.Id)),
            j => j.HasKey("PostsId", "TagsId"));
}
```

> Important
Please don't attempt to fully configure everything even when it is not needed. As can be seen above, the code gets complicated quickly and its easy to make a mistake. And even in the example above there are many things in the model that are still configured by convention. It's not realistic to think that everything in an EF model can always be fully configured explicitly.

Regardless of whether the relationship is built by convention or using either of the shown explicit configurations, the resulting mapped schema (using SQLite) is:

```sql
CREATE TABLE "Posts" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_Posts" PRIMARY KEY AUTOINCREMENT);

CREATE TABLE "Tags" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_Tags" PRIMARY KEY AUTOINCREMENT);

CREATE TABLE "PostTag" (
    "PostsId" INTEGER NOT NULL,
    "TagsId" INTEGER NOT NULL,
    CONSTRAINT "PK_PostTag" PRIMARY KEY ("PostsId", "TagsId"),
    CONSTRAINT "FK_PostTag_Posts_PostsId" FOREIGN KEY ("PostsId") REFERENCES "Posts" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_PostTag_Tags_TagsId" FOREIGN KEY ("TagsId") REFERENCES "Tags" ("Id") ON DELETE CASCADE);
```

> Tip
When using a Database First flow to scaffold a DbContext from an existing database, EF Core 6 and later looks for this pattern in the database schema and scaffolds a many-to-many relationship as described in this document. This behavior can be changed through use of a custom T4 template. For other options, see Many-to-many relationships without mapped join entities are now scaffolded.

> Important
Currently, EF Core uses Dictionary<string, object> to represent join entity instances for which no .NET class has been configured. However, to improve performance, a different type may be used in a future EF Core release. Do not depend on the join type being Dictionary<string, object> unless this has been explicitly configured.

## Many-to-many with named join table

In the previous example, the join table was named ```PostTag``` by convention. It can be given an explicit name with ```UsingEntity```. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasMany(e => e.Tags)
        .WithMany(e => e.Posts)
        .UsingEntity("PostsToTagsJoinTable");
}
```

Everything else about the mapping remains the same, with only the name of the join table changing:

```sql
CREATE TABLE "PostsToTagsJoinTable" (
    "PostsId" INTEGER NOT NULL,
    "TagsId" INTEGER NOT NULL,
    CONSTRAINT "PK_PostsToTagsJoinTable" PRIMARY KEY ("PostsId", "TagsId"),
    CONSTRAINT "FK_PostsToTagsJoinTable_Posts_PostsId" FOREIGN KEY ("PostsId") REFERENCES "Posts" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_PostsToTagsJoinTable_Tags_TagsId" FOREIGN KEY ("TagsId") REFERENCES "Tags" ("Id") ON DELETE CASCADE);
```

## Many-to-many with join table foreign key names

This example shows how to change the names of the foreign key columns in the join table.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasMany(e => e.Tags)
        .WithMany(e => e.Posts)
        .UsingEntity(
            l => l.HasOne(typeof(Tag)).WithMany().HasForeignKey("TagForeignKey"),
            r => r.HasOne(typeof(Post)).WithMany().HasForeignKey("PostForeignKey"));
}
```

The second way is to leave the properties with their by-convention names, but then map these properties to different column names. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasMany(e => e.Tags)
        .WithMany(e => e.Posts)
        .UsingEntity(
            j =>
            {
                j.Property("PostsId").HasColumnName("PostForeignKey");
                j.Property("TagsId").HasColumnName("TagForeignKey");
            });
}
```

In either case, the mapping remains the same, with only the foreign key column names changed:

```sql
CREATE TABLE "PostTag" (
    "PostForeignKey" INTEGER NOT NULL,
    "TagForeignKey" INTEGER NOT NULL,
    CONSTRAINT "PK_PostTag" PRIMARY KEY ("PostForeignKey", "TagForeignKey"),
    CONSTRAINT "FK_PostTag_Posts_PostForeignKey" FOREIGN KEY ("PostForeignKey") REFERENCES "Posts" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_PostTag_Tags_TagForeignKey" FOREIGN KEY ("TagForeignKey") REFERENCES "Tags" ("Id") ON DELETE CASCADE);
```

> Tip
Although not shown here, the previous two examples can be combined to map change the join table name and its foreign key column names.

## Many-to-many with class for join entity

In our series of articles on how to create a join table, we are going to look at how to create a join table with a shared-type entity type.

```csharp
public class Post
{
    public int Id { get; set; }
    public List<Tag> Tags { get; } = [];
}

public class Tag
{
    public int Id { get; set; }
    public List<Post> Posts { get; } = [];
}

public class PostTag
{
    public int PostId { get; set; }
    public int TagId { get; set; }
}
```

> Tip
The class can have any name, but it is common to combine the names of the types at either end of the relationship.

Now the ```UsingEntity``` method can be used to configure this as the join entity type for the relationship. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasMany(e => e.Tags)
        .WithMany(e => e.Posts)
        .UsingEntity<PostTag>();
}
```

The ```PostId``` and ```TagId``` properties can be used as foreign keys for the join entity type.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasMany(e => e.Tags)
        .WithMany(e => e.Posts)
        .UsingEntity<PostTag>(
            l => l.HasOne<Tag>().WithMany().HasForeignKey(e => e.TagId),
            r => r.HasOne<Post>().WithMany().HasForeignKey(e => e.PostId));
}
```

The mapped database schema for the join table in this example is structurally equivalent to the previous examples, but with some different column names:

```sql
CREATE TABLE "PostTag" (
    "PostId" INTEGER NOT NULL,
    "TagId" INTEGER NOT NULL,
    CONSTRAINT "PK_PostTag" PRIMARY KEY ("PostId", "TagId"),
    CONSTRAINT "FK_PostTag_Posts_PostId" FOREIGN KEY ("PostId") REFERENCES "Posts" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_PostTag_Tags_TagId" FOREIGN KEY ("TagId") REFERENCES "Tags" ("Id") ON DELETE CASCADE);
```

## Many-to-many with navigations to join entity

Following on from the previous example, now that there is a class representing the join entity, it becomes easy to add navigations that reference this class. For example:

```csharp
public class Post
{
    public int Id { get; set; }
    public List<Tag> Tags { get; } = [];
    public List<PostTag> PostTags { get; } = [];
}

public class Tag
{
    public int Id { get; set; }
    public List<Post> Posts { get; } = [];
    public List<PostTag> PostTags { get; } = [];
}

public class PostTag
{
    public int PostId { get; set; }
    public int TagId { get; set; }
}
```

> Important
As shown in this example, navigations to the join entity type can be used in addition to the skip navigations between the two ends of the many-to-many relationship. This means that the skip navigations can be used to interact with the many-to-many relationship in a natural manner, while the navigations to the join entity type can be used when greater control over the join entities themselves is needed. In a sense, this mapping provides the best of both worlds between a simple many-to-many mapping, and a mapping that more explicitly matches the database schema.

This example shows how to create a join entity with a single name.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasMany(e => e.Tags)
        .WithMany(e => e.Posts)
        .UsingEntity<PostTag>();
}
```

The navigations can be configured explicitly for cases where they cannot be determined by convention. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasMany(e => e.Tags)
        .WithMany(e => e.Posts)
        .UsingEntity<PostTag>(
            l => l.HasOne<Tag>().WithMany(e => e.PostTags),
            r => r.HasOne<Post>().WithMany(e => e.PostTags));
}
```

The mapped database schema is not affected by including navigations in the model:

```sql
CREATE TABLE "PostTag" (
    "PostId" INTEGER NOT NULL,
    "TagId" INTEGER NOT NULL,
    CONSTRAINT "PK_PostTag" PRIMARY KEY ("PostId", "TagId"),
    CONSTRAINT "FK_PostTag_Posts_PostId" FOREIGN KEY ("PostId") REFERENCES "Posts" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_PostTag_Tags_TagId" FOREIGN KEY ("TagId") REFERENCES "Tags" ("Id") ON DELETE CASCADE);
```

## Many-to-many with navigations to and from join entity

This example shows how to add navigations to the join entity type from the join entity types at either end of the many-to-many relationship.

```csharp
public class Post
{
    public int Id { get; set; }
    public List<Tag> Tags { get; } = [];
    public List<PostTag> PostTags { get; } = [];
}

public class Tag
{
    public int Id { get; set; }
    public List<Post> Posts { get; } = [];
    public List<PostTag> PostTags { get; } = [];
}

public class PostTag
{
    public int PostId { get; set; }
    public int TagId { get; set; }
    public Post Post { get; set; } = null!;
    public Tag Tag { get; set; } = null!;
}
```

This example shows how to create a join entity with a single name.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasMany(e => e.Tags)
        .WithMany(e => e.Posts)
        .UsingEntity<PostTag>();
}
```

The navigations can be configured explicitly for cases where they cannot be determined by convention. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasMany(e => e.Tags)
        .WithMany(e => e.Posts)
        .UsingEntity<PostTag>(
            l => l.HasOne<Tag>(e => e.Tag).WithMany(e => e.PostTags),
            r => r.HasOne<Post>(e => e.Post).WithMany(e => e.PostTags));
}
```

The mapped database schema is not affected by including navigations in the model:

```sql
CREATE TABLE "PostTag" (
    "PostId" INTEGER NOT NULL,
    "TagId" INTEGER NOT NULL,
    CONSTRAINT "PK_PostTag" PRIMARY KEY ("PostId", "TagId"),
    CONSTRAINT "FK_PostTag_Posts_PostId" FOREIGN KEY ("PostId") REFERENCES "Posts" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_PostTag_Tags_TagId" FOREIGN KEY ("TagId") REFERENCES "Tags" ("Id") ON DELETE CASCADE);
```

## Many-to-many with navigations and changed foreign keys

The previous example showed a many-to-many with navigations to and from the join entity type. This example is the same, except that the foreign key properties used are also changed. For example:

```csharp
public class Post
{
    public int Id { get; set; }
    public List<Tag> Tags { get; } = [];
    public List<PostTag> PostTags { get; } = [];
}

public class Tag
{
    public int Id { get; set; }
    public List<Post> Posts { get; } = [];
    public List<PostTag> PostTags { get; } = [];
}

public class PostTag
{
    public int PostForeignKey { get; set; }
    public int TagForeignKey { get; set; }
    public Post Post { get; set; } = null!;
    public Tag Tag { get; set; } = null!;
}
```

Again, the ```UsingEntity``` method is used to configure this:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasMany(e => e.Tags)
        .WithMany(e => e.Posts)
        .UsingEntity<PostTag>(
            l => l.HasOne<Tag>(e => e.Tag).WithMany(e => e.PostTags).HasForeignKey(e => e.TagForeignKey),
            r => r.HasOne<Post>(e => e.Post).WithMany(e => e.PostTags).HasForeignKey(e => e.PostForeignKey));
}
```

The mapped database schema is now:

```sql
CREATE TABLE "PostTag" (
    "PostForeignKey" INTEGER NOT NULL,
    "TagForeignKey" INTEGER NOT NULL,
    CONSTRAINT "PK_PostTag" PRIMARY KEY ("PostForeignKey", "TagForeignKey"),
    CONSTRAINT "FK_PostTag_Posts_PostForeignKey" FOREIGN KEY ("PostForeignKey") REFERENCES "Posts" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_PostTag_Tags_TagForeignKey" FOREIGN KEY ("TagForeignKey") REFERENCES "Tags" ("Id") ON DELETE CASCADE);
```

## Unidirectional many-to-many

> Note
Unidirectional many-to-many relationships were introduced in EF Core 7. In earlier releases, a private navigation could be used as a workaround.

It is not necessary to include a navigation on both sides of the many-to-many relationship. For example:

```csharp
public class Post
{
    public int Id { get; set; }
    public List<Tag> Tags { get; } = [];
}

public class Tag
{
    public int Id { get; set; }
}
```

The following example shows how to create a relationship between two objects.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasMany(e => e.Tags)
        .WithMany();
}
```

Removing the navigation does not affect the database schema:

```sql
CREATE TABLE "Posts" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_Posts" PRIMARY KEY AUTOINCREMENT);

CREATE TABLE "Tags" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_Tags" PRIMARY KEY AUTOINCREMENT);

CREATE TABLE "PostTag" (
    "PostId" INTEGER NOT NULL,
    "TagsId" INTEGER NOT NULL,
    CONSTRAINT "PK_PostTag" PRIMARY KEY ("PostId", "TagsId"),
    CONSTRAINT "FK_PostTag_Posts_PostId" FOREIGN KEY ("PostId") REFERENCES "Posts" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_PostTag_Tags_TagsId" FOREIGN KEY ("TagsId") REFERENCES "Tags" ("Id") ON DELETE CASCADE);
```

## Many-to-many and join table with payload

The join table is an important part of the many-to-many relationship.

```csharp
public class Post
{
    public int Id { get; set; }
    public List<Tag> Tags { get; } = [];
    public List<PostTag> PostTags { get; } = [];
}

public class Tag
{
    public int Id { get; set; }
    public List<Post> Posts { get; } = [];
    public List<PostTag> PostTags { get; } = [];
}

public class PostTag
{
    public int PostId { get; set; }
    public int TagId { get; set; }
    public DateTime CreatedOn { get; set; }
}
```

It is common to use generated values for payload properties--for example, a database timestamp that is automatically set when the association row is inserted.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasMany(e => e.Tags)
        .WithMany(e => e.Posts)
        .UsingEntity<PostTag>(
            j => j.Property(e => e.CreatedOn).HasDefaultValueSql("CURRENT_TIMESTAMP"));
}
```

The result maps to a entity type schema with a timestamp set automatically when a row is inserted:

```sql
CREATE TABLE "PostTag" (
    "PostId" INTEGER NOT NULL,
    "TagId" INTEGER NOT NULL,
    "CreatedOn" TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT "PK_PostTag" PRIMARY KEY ("PostId", "TagId"),
    CONSTRAINT "FK_PostTag_Posts_PostId" FOREIGN KEY ("PostId") REFERENCES "Posts" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_PostTag_Tags_TagId" FOREIGN KEY ("TagId") REFERENCES "Tags" ("Id") ON DELETE CASCADE);
```

> Tip
The SQL shown here is for SQLite. On SQL Server/Azure SQL, use .HasDefaultValueSql("GETUTCDATE()") and for ```TEXT``` read ```datetime```.

## Custom shared-type entity type as a join entity

In our previous article on CLR, we looked at how to map join tables with the same shape.

```csharp
public class JoinType
{
    public int Id1 { get; set; }
    public int Id2 { get; set; }
    public DateTime CreatedOn { get; set; }
}
```

This type can then be referenced as the join entity type by multiple different many-to-many relationships. For example:

```csharp
public class Post
{
    public int Id { get; set; }
    public List<Tag> Tags { get; } = [];
    public List<JoinType> PostTags { get; } = [];
}

public class Tag
{
    public int Id { get; set; }
    public List<Post> Posts { get; } = [];
    public List<JoinType> PostTags { get; } = [];
}

public class Blog
{
    public int Id { get; set; }
    public List<Author> Authors { get; } = [];
    public List<JoinType> BlogAuthors { get; } = [];
}

public class Author
{
    public int Id { get; set; }
    public List<Blog> Blogs { get; } = [];
    public List<JoinType> BlogAuthors { get; } = [];
}
```

And these relationships can then be configured appropriately to map the join type to a different table for each relationship:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasMany(e => e.Tags)
        .WithMany(e => e.Posts)
        .UsingEntity<JoinType>(
            "PostTag",
            l => l.HasOne<Tag>().WithMany(e => e.PostTags).HasForeignKey(e => e.Id1),
            r => r.HasOne<Post>().WithMany(e => e.PostTags).HasForeignKey(e => e.Id2),
            j => j.Property(e => e.CreatedOn).HasDefaultValueSql("CURRENT_TIMESTAMP"));

    modelBuilder.Entity<Blog>()
        .HasMany(e => e.Authors)
        .WithMany(e => e.Blogs)
        .UsingEntity<JoinType>(
            "BlogAuthor",
            l => l.HasOne<Author>().WithMany(e => e.BlogAuthors).HasForeignKey(e => e.Id1),
            r => r.HasOne<Blog>().WithMany(e => e.BlogAuthors).HasForeignKey(e => e.Id2),
            j => j.Property(e => e.CreatedOn).HasDefaultValueSql("CURRENT_TIMESTAMP"));
}
```

This results in the following tables in the database schema:

```sql
CREATE TABLE "BlogAuthor" (
    "Id1" INTEGER NOT NULL,
    "Id2" INTEGER NOT NULL,
    "CreatedOn" TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT "PK_BlogAuthor" PRIMARY KEY ("Id1", "Id2"),
    CONSTRAINT "FK_BlogAuthor_Authors_Id1" FOREIGN KEY ("Id1") REFERENCES "Authors" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_BlogAuthor_Blogs_Id2" FOREIGN KEY ("Id2") REFERENCES "Blogs" ("Id") ON DELETE CASCADE);


CREATE TABLE "PostTag" (
    "Id1" INTEGER NOT NULL,
    "Id2" INTEGER NOT NULL,
    "CreatedOn" TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT "PK_PostTag" PRIMARY KEY ("Id1", "Id2"),
    CONSTRAINT "FK_PostTag_Posts_Id2" FOREIGN KEY ("Id2") REFERENCES "Posts" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_PostTag_Tags_Id1" FOREIGN KEY ("Id1") REFERENCES "Tags" ("Id") ON DELETE CASCADE);
```

## Many-to-many with alternate keys

In this article, I'm going to show you how to use foreign keys in the join entity type.

```csharp
public class Post
{
    public int Id { get; set; }
    public int AlternateKey { get; set; }
    public List<Tag> Tags { get; } = [];
}

public class Tag
{
    public int Id { get; set; }
    public int AlternateKey { get; set; }
    public List<Post> Posts { get; } = [];
}
```

The configuration for this model is:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasMany(e => e.Tags)
        .WithMany(e => e.Posts)
        .UsingEntity(
            l => l.HasOne(typeof(Tag)).WithMany().HasPrincipalKey(nameof(Tag.AlternateKey)),
            r => r.HasOne(typeof(Post)).WithMany().HasPrincipalKey(nameof(Post.AlternateKey)));
}
```

And the resulting database schema, for clarity, including also the tables with the alternate keys:

```sql
CREATE TABLE "Posts" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_Posts" PRIMARY KEY AUTOINCREMENT,
    "AlternateKey" INTEGER NOT NULL,
    CONSTRAINT "AK_Posts_AlternateKey" UNIQUE ("AlternateKey"));

CREATE TABLE "Tags" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_Tags" PRIMARY KEY AUTOINCREMENT,
    "AlternateKey" INTEGER NOT NULL,
    CONSTRAINT "AK_Tags_AlternateKey" UNIQUE ("AlternateKey"));

CREATE TABLE "PostTag" (
    "PostsAlternateKey" INTEGER NOT NULL,
    "TagsAlternateKey" INTEGER NOT NULL,
    CONSTRAINT "PK_PostTag" PRIMARY KEY ("PostsAlternateKey", "TagsAlternateKey"),
    CONSTRAINT "FK_PostTag_Posts_PostsAlternateKey" FOREIGN KEY ("PostsAlternateKey") REFERENCES "Posts" ("AlternateKey") ON DELETE CASCADE,
    CONSTRAINT "FK_PostTag_Tags_TagsAlternateKey" FOREIGN KEY ("TagsAlternateKey") REFERENCES "Tags" ("AlternateKey") ON DELETE CASCADE);
```

The configuration for using alternate keys is slightly different if the join entity type is represented by a .NET type. For example:

```csharp
public class Post
{
    public int Id { get; set; }
    public int AlternateKey { get; set; }
    public List<Tag> Tags { get; } = [];
    public List<PostTag> PostTags { get; } = [];
}

public class Tag
{
    public int Id { get; set; }
    public int AlternateKey { get; set; }
    public List<Post> Posts { get; } = [];
    public List<PostTag> PostTags { get; } = [];
}

public class PostTag
{
    public int PostId { get; set; }
    public int TagId { get; set; }
    public Post Post { get; set; } = null!;
    public Tag Tag { get; set; } = null!;
}
```

The configuration can now use the generic ```UsingEntity```<> method:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasMany(e => e.Tags)
        .WithMany(e => e.Posts)
        .UsingEntity<PostTag>(
            l => l.HasOne<Tag>(e => e.Tag).WithMany(e => e.PostTags).HasPrincipalKey(e => e.AlternateKey),
            r => r.HasOne<Post>(e => e.Post).WithMany(e => e.PostTags).HasPrincipalKey(e => e.AlternateKey));
}
```

And the resulting schema is:

```sql
CREATE TABLE "Posts" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_Posts" PRIMARY KEY AUTOINCREMENT,
    "AlternateKey" INTEGER NOT NULL,
    CONSTRAINT "AK_Posts_AlternateKey" UNIQUE ("AlternateKey"));

CREATE TABLE "Tags" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_Tags" PRIMARY KEY AUTOINCREMENT,
    "AlternateKey" INTEGER NOT NULL,
    CONSTRAINT "AK_Tags_AlternateKey" UNIQUE ("AlternateKey"));

CREATE TABLE "PostTag" (
    "PostId" INTEGER NOT NULL,
    "TagId" INTEGER NOT NULL,
    CONSTRAINT "PK_PostTag" PRIMARY KEY ("PostId", "TagId"),
    CONSTRAINT "FK_PostTag_Posts_PostId" FOREIGN KEY ("PostId") REFERENCES "Posts" ("AlternateKey") ON DELETE CASCADE,
    CONSTRAINT "FK_PostTag_Tags_TagId" FOREIGN KEY ("TagId") REFERENCES "Tags" ("AlternateKey") ON DELETE CASCADE);
```

## Many-to-many and join table with separate primary key

The join entity type in all the examples has a primary key composed of the two foreign key properties.

> Note
EF Core does not support duplicate entities in any collection navigation.

Is it possible to define an additional primary key column in a join table?

It is perhaps easiest to this by creating a class to represent the join entity. For example:

```csharp
public class Post
{
    public int Id { get; set; }
    public List<Tag> Tags { get; } = [];
}

public class Tag
{
    public int Id { get; set; }
    public List<Post> Posts { get; } = [];
}

public class PostTag
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public int TagId { get; set; }
}
```

This ```PostTag.Id``` property is now picked up as the primary key by convention, so the only configuration needed is a call to ```UsingEntity``` for the ```PostTag``` type:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasMany(e => e.Tags)
        .WithMany(e => e.Posts)
        .UsingEntity<PostTag>();
}
```

And the resulting schema for the join table is:

```sql
CREATE TABLE "PostTag" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_PostTag" PRIMARY KEY AUTOINCREMENT,
    "PostId" INTEGER NOT NULL,
    "TagId" INTEGER NOT NULL,
    CONSTRAINT "FK_PostTag_Posts_PostId" FOREIGN KEY ("PostId") REFERENCES "Posts" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_PostTag_Tags_TagId" FOREIGN KEY ("TagId") REFERENCES "Tags" ("Id") ON DELETE CASCADE);
```

A primary key can also be added to the join entity without defining a class for it. For example, with just ```Post``` and ```Tag``` types:

```csharp
public class Post
{
    public int Id { get; set; }
    public List<Tag> Tags { get; } = [];
}

public class Tag
{
    public int Id { get; set; }
    public List<Post> Posts { get; } = [];
}
```

The key can be added with this configuration:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasMany(e => e.Tags)
        .WithMany(e => e.Posts)
        .UsingEntity(
            j =>
            {
                j.IndexerProperty<int>("Id");
                j.HasKey("Id");
            });
}
```

Which results in a join table with a separate primary key column:

```sql
CREATE TABLE "PostTag" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_PostTag" PRIMARY KEY AUTOINCREMENT,
    "PostsId" INTEGER NOT NULL,
    "TagsId" INTEGER NOT NULL,
    CONSTRAINT "FK_PostTag_Posts_PostsId" FOREIGN KEY ("PostsId") REFERENCES "Posts" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_PostTag_Tags_TagsId" FOREIGN KEY ("TagsId") REFERENCES "Tags" ("Id") ON DELETE CASCADE);
```

## Many-to-many without cascading delete

In this post, I'm going to show you how to create foreign keys between the join table and the two sides of a many-to-many relationship.

It's hard to imagine when it is useful to change this behavior, but it can be done if desired. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasMany(e => e.Tags)
        .WithMany(e => e.Posts)
        .UsingEntity(
            l => l.HasOne(typeof(Tag)).WithMany().OnDelete(DeleteBehavior.Restrict),
            r => r.HasOne(typeof(Post)).WithMany().OnDelete(DeleteBehavior.Restrict));
}
```

The database schema for the join table uses restricted delete behavior on the foreign key constraint:

```sql
CREATE TABLE "PostTag" (
    "PostsId" INTEGER NOT NULL,
    "TagsId" INTEGER NOT NULL,
    CONSTRAINT "PK_PostTag" PRIMARY KEY ("PostsId", "TagsId"),
    CONSTRAINT "FK_PostTag_Posts_PostsId" FOREIGN KEY ("PostsId") REFERENCES "Posts" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_PostTag_Tags_TagsId" FOREIGN KEY ("TagsId") REFERENCES "Tags" ("Id") ON DELETE RESTRICT);
```

## Self-referencing many-to-many

The same entity type can be used at both ends of a many-to-many relationship; this is known as a "self-referencing" relationship. For example:

```csharp
public class Person
{
    public int Id { get; set; }
    public List<Person> Parents { get; } = [];
    public List<Person> Children { get; } = [];
}
```

This maps to a join table called ```PersonPerson```, with both foreign keys pointing back to the ```People``` table:

```sql
CREATE TABLE "PersonPerson" (
    "ChildrenId" INTEGER NOT NULL,
    "ParentsId" INTEGER NOT NULL,
    CONSTRAINT "PK_PersonPerson" PRIMARY KEY ("ChildrenId", "ParentsId"),
    CONSTRAINT "FK_PersonPerson_People_ChildrenId" FOREIGN KEY ("ChildrenId") REFERENCES "People" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_PersonPerson_People_ParentsId" FOREIGN KEY ("ParentsId") REFERENCES "People" ("Id") ON DELETE CASCADE);
```

## Symmetrical self-referencing many-to-many

Many-to-many relationships are not always symmetrical.

```csharp
public class Person
{
    public int Id { get; set; }
    public List<Person> Friends { get; } = [];
}
```

The relationship between two entities should be easy to map.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Person>()
        .HasMany(e => e.Friends)
        .WithMany();
}
```

However, to make sure two people are both related to each other, each person will need to be manually added to the other person's ```Friends``` collection. For example:

```csharp
ginny.Friends.Add(hermione);
hermione.Friends.Add(ginny);
```

## Direct use of join table

This example shows how to map a join table to a normal entity type and use the two one-to-many relationships for all operations.

For example, these entity types represent the mapping of two normal tables and join table without using any many-to-many relationships:

```csharp
public class Post
{
    public int Id { get; set; }
    public List<PostTag> PostTags { get; } = new();
}

public class Tag
{
    public int Id { get; set; }
    public List<PostTag> PostTags { get; } = new();
}

public class PostTag
{
    public int PostId { get; set; }
    public int TagId { get; set; }
    public Post Post { get; set; } = null!;
    public Tag Tag { get; set; } = null!;
}
```

This requires no special mapping, since these are normal entity types with normal one-to-many relationships.

## Additional resources

- .NET Data Community Standup session, with a deep dive into many-to-many and the infrastructure underpinning it.