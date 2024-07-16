---
title: Entity Framework - Entity Framework Core - Create a model - Relationships - One-to-one
published: true
date: 2024-07-16 06:08:47
tags: EFCore, Summary
description: One-to-one relationships are used when one entity is associated with at most one other entity. For example, a Blog has one BlogHeader, and that BlogHeader belongs to a single Blog.
image:
---
# [One-to-one relationships](https://learn.microsoft.com/en-us/ef/core/modeling/relationships/one-to-one)

  - Article

  - 03/30/2023

  - 6 contributors

## In this article

One-to-one relationships are used when one entity is associated with at most one other entity. For example, a ```Blog``` has one ```BlogHeader```, and that ```BlogHeader``` belongs to a single ```Blog```.

In this document, we are going to look at some of the basics of configuration management.

> Tip
The code for all the examples below can be found in OneToOne.cs.

## Required one-to-one

```csharp
// Principal (parent)
public class Blog
{
    public int Id { get; set; }
    public BlogHeader? Header { get; set; } // Reference navigation to dependent
}

// Dependent (child)
public class BlogHeader
{
    public int Id { get; set; }
    public int BlogId { get; set; } // Required foreign key property
    public Blog Blog { get; set; } = null!; // Required reference navigation to principal
}
```

A one-to-one relationship is made up from:

- One or more primary or alternate key properties on the principal entity. For example, ```Blog.Id```.

- One or more foreign key properties on the dependent entity. For example, ```BlogHeader.BlogId```.

- Optionally, a reference navigation on the principal entity referencing the dependent entity. For example, ```Blog.Header```.

- Optionally, a reference navigation on the dependent entity referencing the principal entity. For example, ```BlogHeader.Blog```.

> Tip
It is not always obvious which side of a one-to-one relationship should be the principal, and which side should be the dependent. Some considerations are:

If the database tables for the two types already exist, then the table with the foreign key column(s) must map to the dependent type.
A type is usually the dependent type if it cannot logically exist without the other type. For example, it makes no sense to have a header for a blog that does not exist, so ```BlogHeader``` is naturally the dependent type.
If there is a natural parent/child relationship, then the child is usually the dependent type.

 - If the database tables for the two types already exist, then the table with the foreign key column(s) must map to the dependent type.

 - A type is usually the dependent type if it cannot logically exist without the other type. For example, it makes no sense to have a header for a blog that does not exist, so ```BlogHeader``` is naturally the dependent type.

 - If there is a natural parent/child relationship, then the child is usually the dependent type.

So, for the relationship in this example:

- The foreign key property ```BlogHeader.BlogId``` is not nullable. This makes the relationship "required" because every dependent (BlogHeader) must be related to some principal (Blog), since its foreign key property must be set to some value.

- Both entities have navigations pointing to the related entity on the other side of the relationship.

> Note
A required relationship ensures that every dependent entity must be associated with some principal entity. However, a principal entity can always exist without any dependent entity. That is, a required relationship does not indicate that there will always be a dependent entity. There is no way in the EF model, and also no standard way in a relational database, to ensure that a principal is associated with a dependent. If this is needed, then it must be implemented in application (business) logic. See Required navigations for more information.

> Tip
A relationship with two navigations--one from dependent to principal and an inverse from principal to dependent--is known as a bidirectional relationship.

This relationship is discovered by convention. That is:

- ```Blog``` is discovered as the principal in the relationship, and ```BlogHeader``` is discovered as the dependent.

- ```BlogHeader.BlogId``` is discovered as a foreign key of the dependent referencing the ```Blog.Id``` primary key of the principal. The relationship is discovered as required because ```BlogHeader.BlogId``` is not nullable.

- ```Blog.BlogHeader``` is discovered as a reference navigation.

- ```BlogHeader.Blog``` is discovered as a reference navigation.

> Important
When using C# nullable reference types, the navigation from the dependent to the principal must be nullable if the foreign key property is nullable. If the foreign key property is non-nullable, then the navigation may be nullable or not. In this case, ```BlogHeader.BlogId``` is non-nullable, and ```BlogHeader.Blog``` is also non-nullable. The = ```null```!; construct is used to mark this as intentional for the C# compiler, since EF typically sets the ```Blog``` instance and it cannot be ```null``` for a fully loaded relationship. See Working with Nullable Reference Types for more information.

For cases where the navigations, foreign key, or required/optional nature of the relationship are not discovered by convention, these things can be configured explicitly. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasOne(e => e.Header)
        .WithOne(e => e.Blog)
        .HasForeignKey<BlogHeader>(e => e.BlogId)
        .IsRequired();
}
```

As with all relationships, configuration of the relationships starts with the principal entity type.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<BlogHeader>()
        .HasOne(e => e.Blog)
        .WithOne(e => e.Header)
        .HasForeignKey<BlogHeader>(e => e.BlogId)
        .IsRequired();
}
```

Neither of these options is better than the other; they both result in exactly the same configuration.

> Tip
It is never necessary to configure a relationship twice, once starting from the principal, and then again starting from the dependent. Also, attempting to configure the principal and dependent halves of a relationship separately generally does not work. Choose to configure each relationship from either one end or the other and then write the configuration code only once.

## Optional one-to-one

```csharp
// Principal (parent)
public class Blog
{
    public int Id { get; set; }
    public BlogHeader? Header { get; set; } // Reference navigation to dependent
}

// Dependent (child)
public class BlogHeader
{
    public int Id { get; set; }
    public int? BlogId { get; set; } // Optional foreign key property
    public Blog? Blog { get; set; } // Optional reference navigation to principal
}
```

The following example shows how to set the foreign key property and navigation to a principal (Blog).

> Important
When using C# nullable reference types, the navigation property from dependent to principal must be nullable if the foreign key property is nullable. In this case, ```BlogHeader.BlogId``` is nullable, so ```BlogHeader.Blog``` must be nullable too. See Working with Nullable Reference Types for more information.

In this release, we have added a new relationship between two objects.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasOne(e => e.Header)
        .WithOne(e => e.Blog)
        .HasForeignKey<BlogHeader>(e => e.BlogId)
        .IsRequired(false);
}
```

## Required one-to-one with primary key to primary key relationship

```csharp
// Principal (parent)
public class Blog
{
    public int Id { get; set; }
    public BlogHeader? Header { get; set; } // Reference navigation to dependent
}

// Dependent (child)
public class BlogHeader
{
    public int Id { get; set; }
    public Blog Blog { get; set; } = null!; // Required reference navigation to principal
}
```

A one-to-one relationship is a relationship between a principal and a dependent.

The foreign key is a property of the relationship between the two parties.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasOne(e => e.Header)
        .WithOne(e => e.Blog)
        .HasForeignKey<BlogHeader>();
}
```

> Tip
HasPrincipalKey can also used for this purpose, but doing so is less common.

When the primary key is suitable, then it is used as the foreign key.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasOne(e => e.Header)
        .WithOne(e => e.Blog)
        .HasForeignKey<BlogHeader>(e => e.Id)
        .IsRequired();
}
```

## Required one-to-one with shadow foreign key

```csharp
// Principal (parent)
public class Blog
{
    public int Id { get; set; }
    public BlogHeader? Header { get; set; } // Reference navigation to dependent
}

// Dependent (child)
public class BlogHeader
{
    public int Id { get; set; }
    public Blog Blog { get; set; } = null!; // Required reference navigation to principal
}
```

A foreign key property is a detail of how the relationship between entities is represented in the database.

In the previous example, EF created a shadow foreign key property called ```BlogId``` of type ```int```.

The shadow foreign key property is used to navigation from dependent to principal.

This relationship again needs some configuration to indicate the principal and dependent ends:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasOne(e => e.Header)
        .WithOne(e => e.Blog)
        .HasForeignKey<BlogHeader>("BlogId");
}
```

For cases where the navigations, foreign key, or required/optional nature of the relationship are not discovered by convention, these things can be configured explicitly. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasOne(e => e.Header)
        .WithOne(e => e.Blog)
        .HasForeignKey<BlogHeader>("BlogId")
        .IsRequired();
}
```

## Optional one-to-one with shadow foreign key

```csharp
// Principal (parent)
public class Blog
{
    public int Id { get; set; }
    public BlogHeader? Header { get; set; } // Reference navigation to dependent
}

// Dependent (child)
public class BlogHeader
{
    public int Id { get; set; }
    public Blog? Blog { get; set; } // Optional reference navigation to principal
}
```

This example shows how to create a relationship between a dependent entity type and a foreign key property.

The foreign key property can be a nullable reference type or a shadow property.

As before, this relationship needs some configuration to indicate the principal and dependent ends:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasOne(e => e.Header)
        .WithOne(e => e.Blog)
        .HasForeignKey<BlogHeader>("BlogId");
}
```

For cases where the navigations, foreign key, or required/optional nature of the relationship are not discovered by convention, these things can be configured explicitly. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasOne(e => e.Header)
        .WithOne(e => e.Blog)
        .HasForeignKey<BlogHeader>("BlogId")
        .IsRequired(false);
}
```

## One-to-one without navigation to principal

```csharp
// Principal (parent)
public class Blog
{
    public int Id { get; set; }
    public BlogHeader? Header { get; set; } // Reference navigation to dependent
}

// Dependent (child)
public class BlogHeader
{
    public int Id { get; set; }
    public int BlogId { get; set; } // Required foreign key property
}
```

For this example, the foreign key property has been re-introduced, but the navigation on the dependent has been removed.

> Tip
A relationship with only one navigation--one from dependent to principal or one from principal to dependent, but not both--is known as a unidirectional relationship.

A relationship between a navigation and a foreign key is a relationship between the navigation and the foreign key.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasOne(e => e.Header)
        .WithOne()
        .HasForeignKey<BlogHeader>(e => e.BlogId)
        .IsRequired();
}
```

Notice that the call to ```WithOne``` has no arguments. This is the way to tell EF that there is no navigation from ```BlogHeader``` to ```Blog```.

If configuration starts from an entity with no navigation, then the type of the entity on the other end of the relationship must be explicitly specified using the generic ```HasOne```> call.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<BlogHeader>()
        .HasOne<Blog>()
        .WithOne(e => e.Header)
        .HasForeignKey<BlogHeader>(e => e.BlogId)
        .IsRequired();
}
```

## One-to-one without navigation to principal and with shadow foreign key

```csharp
// Principal (parent)
public class Blog
{
    public int Id { get; set; }
    public BlogHeader? Header { get; set; } // Reference navigation to dependent
}

// Dependent (child)
public class BlogHeader
{
    public int Id { get; set; }
}
```

This example combines two of the previous examples by removing both the foreign key property and the navigation on the dependent.

As before, this relationship needs some configuration to indicate the principal and dependent ends:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasOne(e => e.Header)
        .WithOne()
        .HasForeignKey<BlogHeader>("BlogId")
        .IsRequired();
}
```

A more complete configuration can be used to explicitly configure the navigation and foreign key name, with an appropriate call to ```IsRequired```() or ```IsRequired```(false) as needed. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasOne(e => e.Header)
        .WithOne()
        .HasForeignKey<BlogHeader>("BlogId")
        .IsRequired();
}
```

## One-to-one without navigation to dependent

```csharp
// Principal (parent)
public class Blog
{
    public int Id { get; set; }
}

// Dependent (child)
public class BlogHeader
{
    public int Id { get; set; }
    public int BlogId { get; set; } // Required foreign key property
    public Blog Blog { get; set; } = null!; // Required reference navigation to principal
}
```

This is the third in a series of examples of how to change the navigation on the dependent to the principal.

By convention, EF will treat this as a one-to-many relationship. Some minimal configuration is needed to make it one-to-one:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<BlogHeader>()
        .HasOne(e => e.Blog)
        .WithOne();
}
```

Notice again that ```WithOne```() is called with no arguments to indicate that there is no navigation in this direction.

For cases where the navigations, foreign key, or required/optional nature of the relationship are not discovered by convention, these things can be configured explicitly. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<BlogHeader>()
        .HasOne(e => e.Blog)
        .WithOne()
        .HasForeignKey<BlogHeader>(e => e.BlogId)
        .IsRequired();
}
```

If configuration starts from an entity with no navigation, then the type of the entity on the other end of the relationship must be explicitly specified using the generic ```HasOne```> call.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasOne<BlogHeader>()
        .WithOne(e => e.Blog)
        .HasForeignKey<BlogHeader>(e => e.BlogId)
        .IsRequired();
}
```

## One-to-one with no navigations

Occasionally, it can be useful to configure a relationship with no navigations. Such a relationship can only be manipulated by changing the foreign key value directly.

```csharp
// Principal (parent)
public class Blog
{
    public int Id { get; set; }
}

// Dependent (child)
public class BlogHeader
{
    public int Id { get; set; }
    public int BlogId { get; set; } // Required foreign key property
}
```

This relationship is not discovered by convention, since there are no navigations indicating that the two types are related. It can be configured explicitly in ```OnModelCreating```. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasOne<BlogHeader>()
        .WithOne();
}
```

The "required" relationship between the ```BlogHeader.BlogId``` property and the foreign key property of the blog header is set to true.

A more complete explicit configuration of this relationship is::

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasOne<BlogHeader>()
        .WithOne()
        .HasForeignKey<BlogHeader>(e => e.BlogId)
        .IsRequired();
}
```

## One-to-one with alternate key

The following examples show how the foreign key property on a dependent can be used as an alternate key for the principal entity type.

```csharp
// Principal (parent)
public class Blog
{
    public int Id { get; set; }
    public int AlternateId { get; set; } // Alternate key as target of the BlogHeader.BlogId foreign key
    public BlogHeader? Header { get; set; } // Reference navigation to dependent
}

// Dependent (child)
public class BlogHeader
{
    public int Id { get; set; }
    public int BlogId { get; set; } // Required foreign key property
    public Blog Blog { get; set; } = null!; // Required reference navigation to principal
}
```

The ```HasPrincipalKey``` relationship between an EF model and its primary key is defined explicitly in ```OnModelCreating```.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasOne(e => e.Header)
        .WithOne(e => e.Blog)
        .HasPrincipalKey<Blog>(e => e.AlternateId);
}
```

 ```HasPrincipalKey``` can be combined with other calls to explicitly configure the navigations, foreign key properties, and required/optional nature. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasOne(e => e.Header)
        .WithOne(e => e.Blog)
        .HasPrincipalKey<Blog>(e => e.AlternateId)
        .HasForeignKey<BlogHeader>(e => e.BlogId)
        .IsRequired();
}
```

## One-to-one with composite foreign key

When the principal of a relationship has a primary or alternate key, then the foreign key of the principal must also be a primary or alternate key with the same number of properties.

```csharp
// Principal (parent)
public class Blog
{
    public int Id1 { get; set; } // Composite key part 1
    public int Id2 { get; set; } // Composite key part 2
    public BlogHeader? Header { get; set; } // Reference navigation to dependent
}

// Dependent (child)
public class BlogHeader
{
    public int Id { get; set; }
    public int BlogId1 { get; set; } // Required foreign key property part 1
    public int BlogId2 { get; set; } // Required foreign key property part 2
    public Blog Blog { get; set; } = null!; // Required reference navigation to principal
}
```

The following example shows the relationship between two composite keys.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasKey(e => new { e.Id1, e.Id2 });
}
```

> Important
A composite foreign key value is considered to be ```null``` if any of its property values are ```null```. A composite foreign key with one property ```null``` and another non-null will not be considered a match for a primary or alternate key with the same values. Both will be considered ```null```.

Both ```HasForeignKey``` and ```HasPrincipalKey``` can be used to explicitly specify keys with multiple properties. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>(
        nestedBuilder =>
        {
            nestedBuilder.HasKey(e => new { e.Id1, e.Id2 });

            nestedBuilder.HasOne(e => e.Header)
                .WithOne(e => e.Blog)
                .HasPrincipalKey<Blog>(e => new { e.Id1, e.Id2 })
                .HasForeignKey<BlogHeader>(e => new { e.BlogId1, e.BlogId2 })
                .IsRequired();
        });
}
```

> Tip
In the code above, the calls to ```HasKey``` and ```HasOne``` have been grouped together into a nested builder. Nested builders remove the need to call Entity<>() multiple times for the same entity type, but are functionally equivalent to calling Entity<>() multiple times.

## Required one-to-one without cascade delete

```csharp
// Principal (parent)
public class Blog
{
    public int Id { get; set; }
    public BlogHeader? Header { get; set; } // Reference navigation to dependent
}

// Dependent (child)
public class BlogHeader
{
    public int Id { get; set; }
    public int BlogId { get; set; } // Required foreign key property
    public Blog Blog { get; set; } = null!; // Required reference navigation to principal
}
```

In this article, I'm going to show you how to generate an error when deleting a cascade of dependent rows.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasOne(e => e.Header)
        .WithOne(e => e.Blog)
        .OnDelete(DeleteBehavior.Restrict);
}
```

## Self-referencing one-to-one

The following examples show how to specify the principal entity and dependent entity types.

```csharp
public class Person
{
    public int Id { get; set; }

    public int? HusbandId { get; set; } // Optional foreign key property
    public Person? Husband { get; set; } // Optional reference navigation to principal
    public Person? Wife { get; set; } // Reference navigation to dependent
}
```

A relationship is a relationship between two or more objects.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Person>()
        .HasOne(e => e.Husband)
        .WithOne(e => e.Wife)
        .HasForeignKey<Person>(e => e.HusbandId)
        .IsRequired(false);
}
```

> Note
For one-to-one self referencing relationships, since the principal and dependent entity types are the same, specifying which type contains the foreign key does not clarify the dependent end. In this case, the navigation specified in ```HasOne``` points from dependent to principal, and the navigation specified in ```WithOne``` points from principal to dependent.