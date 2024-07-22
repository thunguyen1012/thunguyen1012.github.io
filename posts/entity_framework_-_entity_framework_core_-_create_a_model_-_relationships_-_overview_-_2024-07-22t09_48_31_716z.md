---
title: Entity Framework - Entity Framework Core - Create a model - Relationships - Overview
published: true
date: 2024-07-22 09:48:31
tags: EFCore, Summary
description: This document provides a simple introduction to the representation of relationships in object models and relational databases, including how EF Core maps between the two.
image:
---
- Article

  - 03/30/2023

  - 22 contributors

## In this article

This document provides a simple introduction to the representation of relationships in object models and relational databases, including how EF Core maps between the two.

## Relationships in object models

A relationship is a relationship between two entities.

In an object-oriented language like C#, the blog and post are typically represented by two classes: ```Blog``` and ```Post```. For example:

```csharp
public class Blog
{
    public string Name { get; set; }
    public virtual Uri SiteUri { get; set; }
}
```

```csharp
public class Post
{
    public string Title { get; set; }
    public string Content { get; set; }
    public DateTime PublishedOn { get; set; }
    public bool Archived { get; set; }
}
```

In the classes above, there is nothing to indicate that ```Blog``` and ```Post``` are related. This can be added to the object model by adding a reference from ```Post``` to the ```Blog``` on which it is published:

```csharp
public class Post
{
    public string Title { get; set; }
    public string Content { get; set; }
    public DateOnly PublishedOn { get; set; }
    public bool Archived { get; set; }

    public Blog Blog { get; set; }
}
```

Likewise, the opposite direction of the same relationship can be represented as a collection of ```Post``` objects on each ```Blog```:

```csharp
public class Blog
{
    public string Name { get; set; }
    public virtual Uri SiteUri { get; set; }

    public ICollection<Post> Posts { get; }
}
```

This connection from ```Blog``` to ```Post``` and, inversely, from ```Post``` back to ```Blog``` is known as a "relationship" in EF Core.

> Important
A single relationship can typically traversed in either direction. In this example, that is from ```Blog``` to ```Post``` via the ```Blog.Posts``` property, and from ```Post``` back to ```Blog``` via the ```Post.Blog``` property. This is one relationship, not two.

> Tip
In EF Core, the ```Blog.Posts``` and ```Post.Blog``` properties are called "navigations".

## Relationships in relational databases

Relational databases represent relationships using foreign keys. For example, using SQL Server or Azure SQL, the following tables can be used to represent our ```Post``` and ```Blog``` classes:

```sql
CREATE TABLE [Posts] (
    [Id] int NOT NULL IDENTITY,
    [Title] nvarchar(max) NULL,
    [Content] nvarchar(max) NULL,
    [PublishedOn] datetime2 NOT NULL,
    [Archived] bit NOT NULL,
    [BlogId] int NOT NULL,
    CONSTRAINT [PK_Posts] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Posts_Blogs_BlogId] FOREIGN KEY ([BlogId]) REFERENCES [Blogs] ([Id]) ON DELETE CASCADE);

CREATE TABLE [Blogs] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NULL,
    [SiteUri] nvarchar(max) NULL,
    CONSTRAINT [PK_Blogs] PRIMARY KEY ([Id]));
```

The ```Posts``` table contains all the posts that have been published to the blog and the ```Blogs``` table contains all the posts that have been published to the blog.

## Mapping relationships in EF Core

EF Core relationship mapping is all about mapping the primary key/foreign key representation used in a relational database to the references between objects used in an object model.

In the most basic sense, this involves:

- Adding a primary key property to each entity type.

- Adding a foreign key property to one entity type.

- Associating the references between entity types with the primary and foreign keys to form a single relationship configuration.

EF mappings objects to foreign key values.

> Note
Primary keys are used for more than mapping relationships. See Keys for more information.

For example, the entity types shown above can be updated with primary and foreign key properties:

```csharp
public class Blog
{
    public int Id { get; set; }
    public string Name { get; set; }
    public virtual Uri SiteUri { get; set; }

    public ICollection<Post> Posts { get; }
}
```

```csharp
public class Post
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public DateTime PublishedOn { get; set; }
    public bool Archived { get; set; }

    public int BlogId { get; set; }
    public Blog Blog { get; set; }
}
```

> Tip
Primary and foreign key properties don't need to be publicly visible properties of the entity type. However, even when the properties are hidden, it is important to recognize that they still exist in the EF model.

The following example shows how to create a simple relationship between entity types ```Blog```, ```Blog.Id```, and ```Post```, ```Post.Blog```.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasMany(e => e.Posts)
        .WithOne(e => e.Blog)
        .HasForeignKey(e => e.BlogId)
        .HasPrincipalKey(e => e.Id);
}
```

Now all these properties will behave coherently together as a representation of a single relationship between ```Blog``` and ```Post```.

## Find out more

EF supports many different types of relationships, with many different ways these relationships can be represented and configured. To jump into examples for different kinds of relationships, see:

- One-to-many relationships, in which a single entity is associated with any number of other entities.

- One-to-one relationships, in which a single entity is associated with another single entity.

- Many-to-many relationships, in which any number of entities are associated with any number of other entities.

If you are new to EF, then trying the examples linked in in the bullet points above is a good way to get a feel for how relationships work.

To dig deeper into the properties of entity types involved in relationship mapping, see:

- Foreign and principal keys in relationships, which covers how foreign keys map to the database.

- Relationship navigations, which describes how navigations are layered over a foreign key to provide an object-oriented view of the relationship.

The following examples show how to build an EF model.

- Relationship conventions, which discover entity types, their properties, and the relationships between the types.

- Relationship mapping attributes, which can be used an alternative to the model building API for some aspects of relationship configuration.

> Important
The model-building API is the final source of truth for the EF model--it always takes precedence over configuration discovered by convention or specified by mapping attributes. It is also the only mechanism with full fidelity to configure every aspect of the EF model.

Other topics related to relationships include:

- Cascade deletes, which describe how related entities can be automatically deleted when ```SaveChanges``` or ```SaveChangesAsync``` is called.

- Owned entity types use a special type of "owning" relationship that implies a stronger connection between the two types than the "normal" relationships discussed here. Many of the concepts described here for normal relationships are carried over to owned relationships. However, owned relationships also have their own special behaviors.

> Tip
Refer to the glossary of relationship terms as needed when reading the documentation to help understand the terminology used.

## Using relationships

Relationships defined in the model can be used in various ways. For example:

- Relationships can be used to query related data in any of three ways:

  - Eagerly as part of a LINQ query, using ```Include```.

  - Lazily using lazy-loading proxies, or lazy-loading without proxies.

  - Explicitly using the ```Load``` or ```LoadAsync``` methods.

- Relationships can be used in data seeding through matching of PK values to FK values.

- Relationships can be used to track graphs of entities. Relationships are then used by the change tracker to:

  - Detect changes in relationships and perform fixup

  - Send foreign key updates to the database with ```SaveChanges``` or ```SaveChangesAsync```

Ref: [Introduction to relationships](https://learn.microsoft.com/en-us/ef/core/modeling/relationships)