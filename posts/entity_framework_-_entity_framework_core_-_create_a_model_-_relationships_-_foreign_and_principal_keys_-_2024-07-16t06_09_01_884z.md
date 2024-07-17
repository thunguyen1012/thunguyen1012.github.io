---
title: Entity Framework - Entity Framework Core - Create a model - Relationships - Foreign and principal keys
published: true
date: 2024-07-16 06:09:01
tags: EFCore, Summary
description: One-to-one and one-to-many relationships are composed of two one-to-many relationships, each of which is itself defined by a foreign key referencing a principal key.
image:
---
  - Article

  - 03/30/2023

  - 3 contributors

## In this article

One-to-one and one-to-many relationships are composed of two one-to-many relationships, each of which is itself defined by a foreign key referencing a principal key.

> Tip
The code below can be found in ForeignAndPrincipalKeys.cs.

## Foreign keys

 ```HasForeignKey``` is a type of foreign key that can be used to identify properties in a model.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasMany(e => e.Posts)
        .WithOne(e => e.Blog)
        .HasForeignKey(e => e.ContainingBlogId);
}
```

Or, for a composite foreign key made up of more than one property:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasMany(e => e.Posts)
        .WithOne(e => e.Blog)
        .HasForeignKey(e => new { e.ContainingBlogId1, e.ContainingBlogId2 });
}
```

> Tip
Using lambda expressions in model building API ensures that the property use is available for code analysis and refactoring, and also provides the property type to the API for use in further chained methods.

 ```HasForeignKey``` can also be passed the name of the foreign key property as a string. For example, for a single property:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasMany(e => e.Posts)
        .WithOne(e => e.Blog)
        .HasForeignKey("ContainingBlogId");
}
```

Or, for a composite foreign key:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasMany(e => e.Posts)
        .WithOne(e => e.Blog)
        .HasForeignKey("ContainingBlogId1", "ContainingBlogId2");
}
```

Using a string is useful when:

- The property or properties are private.

- The property or properties do not exist on the entity type and should be created as shadow properties.

- The property name is calculated or constructed based on some input to the model building process.

### Non-nullable foreign key columns

The nullable foreign key property can be used to determine whether a relationship is optional or required.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasMany(e => e.Posts)
        .WithOne(e => e.Blog)
        .HasForeignKey(e => e.BlogId)
        .IsRequired();
}
```

Or, if the foreign key is discovered by convention, then ```IsRequired``` can be used without a call to ```HasForeignKey```:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasMany(e => e.Posts)
        .WithOne(e => e.Blog)
        .IsRequired();
}
```

The following example shows how to explicitly set the foreign key property of a column in a database.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .Property(e => e.BlogId)
        .IsRequired();
}
```

### Shadow foreign keys

Foreign key properties can be created as shadow properties. A shadow property exists in the EF model but does not exist on the .NET type. EF keeps track of the property value and state internally.

Shadow foreign keys are usually used when there is a desire to hide the relational concept of a foreign key from the domain model used by application code/business logic.

> Tip
If entities are going to be serialized, for example to send over a wire, then the foreign key values can be a useful way to keep the relationship information intact when the entities are not in an object/graph form. It is therefore often pragmatic to keep foreign key properties in the .NET type for this purpose. Foreign key properties can be private, which is often a good compromise to avoid exposing the foreign key while allowing its value to travel with the entity.

Shadow foreign key properties are often created by convention. A shadow foreign key will also be created if the argument to ```HasForeignKey``` does not match any .NET property. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasMany(e => e.Posts)
        .WithOne(e => e.Blog)
        .HasForeignKey("MyBlogId");
}
```

By convention, a shadow foreign key gets its type from the principal key in the relationship. This type is made nullable unless the relationship is detected as or configured as required.

The shadow foreign key property can also be created explicitly, which is useful for configuring facets of the property. For example, to make the property non-nullable:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .Property<string>("MyBlogId")
        .IsRequired();

    modelBuilder.Entity<Blog>()
        .HasMany(e => e.Posts)
        .WithOne(e => e.Blog)
        .HasForeignKey("MyBlogId");
}
```

> Tip
By convention, foreign key properties inherit facets such as maximum length and Unicode support from the principal key in the relationship. It is therefore rarely necessary to explicitly configure facets on a foreign key property.

The creation of a shadow property if the given name does not match any property of the entity type can be disabled using ```ConfigureWarnings```. For example:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder.ConfigureWarnings(b => b.Throw(CoreEventId.ShadowPropertyCreated));
```

### Foreign key constraint names

Foreign key constraints are named FK_dependent type name>_principal type name>_foreign key property name>.

This can be changed in the model building API using ```HasConstraintName```. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasMany(e => e.Posts)
        .WithOne(e => e.Blog)
        .HasForeignKey(e => e.BlogId)
        .HasConstraintName("My_BlogId_Constraint");
}
```

> Tip
The constraint name is not used by the EF runtime. It is only used when creating a database schema using EF Core Migrations.

### Indexes for foreign keys

By convention, EF creates a database index for the property or properties of a foreign key. See Model building conventions for more information about the types of indexes created by convention.

> Tip
Relationships are defined in the EF model between entity types included in that model. Some relationships may need to reference an entity type in the model of a different context--for example, when using the BoundedContext pattern. In these situation, the foreign key column(s) should be mapped to normal properties, and these properties can then be manipulated manually to handle changes to the relationship.

## Principal keys

A foreign key is a key that can be used in a relationship between two or more properties.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasMany(e => e.Posts)
        .WithOne(e => e.Blog)
        .HasPrincipalKey(e => e.AlternateId);
}
```

Or for a composite foreign key with multiple properties:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasMany(e => e.Posts)
        .WithOne(e => e.Blog)
        .HasPrincipalKey(e => new { e.AlternateId1, e.AlternateId2 });
}
```

 ```HasPrincipalKey``` can also be passed the name of the alternate key property as a string. For example, for a single property key:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasMany(e => e.Posts)
        .WithOne(e => e.Blog)
        .HasPrincipalKey("AlternateId");
}
```

Or, for a composite key:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasMany(e => e.Posts)
        .WithOne(e => e.Blog)
        .HasPrincipalKey("AlternateId1", "AlternateId2");
}
```

> Note
The order of the properties in the principal and foreign key must match. This is also the order in which the key is defined in the database schema. It does not have to be the same as the order of the properties in the entity type or the columns in the table.

The ```HasAlternateKey``` property can be used to define an alternate key for a principal entity.

## Relationships to keyless entities

A relationship is a relationship between two or more parties.

> Tip
An entity type cannot have an alternate key but no primary key. In this case, the alternate key (or one of the alternate keys, if there are several) must be promoted to the primary key.

However, keyless entity types can still have foreign keys defined, and hence can act as the dependent end of a relationship. For example, consider these types, where ```Tag``` has no key:

```csharp
public class Tag
{
    public string Text { get; set; } = null!;
    public int PostId { get; set; }
    public Post Post { get; set; } = null!;
}

public class Post
{
    public int Id { get; set; }
}
```

 ```Tag``` can be configured at the dependent end of the relationship:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Tag>()
        .HasNoKey();

    modelBuilder.Entity<Post>()
        .HasMany<Tag>()
        .WithOne(e => e.Post);
}
```

> Note
EF does not support navigations pointing to keyless entity types. See GitHub Issue #30331.

## Foreign keys in many-to-many relationships

In this article we are going to look at how to define join entity foreign keys.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasMany(e => e.Tags)
        .WithMany(e => e.Posts)
        .UsingEntity(
            l => l.HasOne(typeof(Tag)).WithMany().HasConstraintName("TagForeignKey_Constraint"),
            r => r.HasOne(typeof(Post)).WithMany().HasConstraintName("PostForeignKey_Constraint"));
}
```

Ref: [Foreign and principal keys in relationships](https://learn.microsoft.com/en-us/ef/core/modeling/relationships/foreign-and-principal-keys)