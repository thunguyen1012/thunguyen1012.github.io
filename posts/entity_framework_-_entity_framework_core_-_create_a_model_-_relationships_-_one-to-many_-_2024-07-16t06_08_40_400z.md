---
title: Entity Framework - Entity Framework Core - Create a model - Relationships - One-to-many
published: true
date: 2024-07-16 06:08:40
tags: EFCore, Summary
description: One-to-many relationships are used when a single entity is associated with any number of other entities.
image:
---
  - Article

  - 03/30/2023

  - 4 contributors

## In this article

One-to-many relationships are used when a single entity is associated with any number of other entities.

In this document, we are going to look at some of the basics of configuration management.

> Tip
The code for all the examples below can be found in OneToMany.cs.

## Required one-to-many

```csharp
// Principal (parent)
public class Blog
{
    public int Id { get; set; }
    public ICollection<Post> Posts { get; } = new List<Post>(); // Collection navigation containing dependents
}

// Dependent (child)
public class Post
{
    public int Id { get; set; }
    public int BlogId { get; set; } // Required foreign key property
    public Blog Blog { get; set; } = null!; // Required reference navigation to principal
}
```

A one-to-many relationship is made up from:

- One or more primary or alternate key properties on the principal entity; that is the "one" end of the relationship. For example, ```Blog.Id```.

- One or more foreign key properties on the dependent entity; that is the "many" end of the relationship. For example, ```Post.BlogId```.

- Optionally, a collection navigation on the principal entity referencing the dependent entities. For example, ```Blog.Posts```.

- Optionally, a reference navigation on the dependent entity referencing the principal entity. For example, ```Post.Blog```.

So, for the relationship in this example:

- The foreign key property ```Post.BlogId``` is not nullable. This makes the relationship "required" because every dependent (Post) must be related to some principal (Blog), since its foreign key property must be set to some value.

- Both entities have navigations pointing to the related entity or entities on the other side of the relationship.

> Note
A required relationship ensures that every dependent entity must be associated with some principal entity. However, a principal entity can always exist without any dependent entities. That is, a required relationship does not indicate that there will always be at least one dependent entity. There is no way in the EF model, and also no standard way in a relational database, to ensure that a principal is associated with a certain number of dependents. If this is needed, then it must be implemented in application (business) logic. See Required navigations for more information.

> Tip
A relationship with two navigations, one from dependent to principal, and an inverse from principal to dependents, is known as a bidirectional relationship.

This relationship is discovered by convention. That is:

- ```Blog``` is discovered as the principal in the relationship, and ```Post``` is discovered as the dependent.

- ```Post.BlogId``` is discovered as a foreign key of the dependent referencing the ```Blog.Id``` primary key of the principal. The relationship is discovered as required because ```Post.BlogId``` is not nullable.

- ```Blog.Posts``` is discovered as the collection navigation.

- ```Post.Blog``` is discovered as the reference navigation.

> Important
When using C# nullable reference types, the reference navigation must be nullable if the foreign key property is nullable. If the foreign key property is non-nullable, then the reference navigation may be nullable or not. In this case, ```Post.BlogId``` is non-nullable and ```Post.Blog``` is also non-nullable. The = ```null```!; construct is used to mark this as intentional for the C# compiler, since EF typically sets the ```Blog``` instance and it cannot be ```null``` for a fully loaded relationship. See Working with Nullable Reference Types for more information.

For cases where the navigations, foreign key, or required/optional nature of the relationship are not discovered by convention, these things can be configured explicitly. For example:

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

As with all relationships, configuration of the relationships starts with ```HasMany``` on the principal entity type (Blog) and then follows this with ```WithMany```.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasOne(e => e.Blog)
        .WithMany(e => e.Posts)
        .HasForeignKey(e => e.BlogId)
        .IsRequired();
}
```

Neither of these options is better than the other; they both result in exactly the same configuration.

> Tip
It is never necessary to configure a relationship twice, once starting from the principal, and then again starting from the dependent. Also, attempting to configure the principal and dependent halves of a relationship separately generally does not work. Choose to configure each relationship from either one end or the other and then write the configuration code only once.

## Optional one-to-many

```csharp
// Principal (parent)
public class Blog
{
    public int Id { get; set; }
    public ICollection<Post> Posts { get; } = new List<Post>(); // Collection navigation containing dependents
}

// Dependent (child)
public class Post
{
    public int Id { get; set; }
    public int? BlogId { get; set; } // Optional foreign key property
    public Blog? Blog { get; set; } // Optional reference navigation to principal
}
```

The following example shows how to define a relationship between a principal (Blog) and a post (Post).

> Important
When using C# nullable reference types, the reference navigation must be nullable if the foreign key property is nullable. In this case, ```Post.BlogId``` is nullable, so ```Post.Blog``` must be nullable too. See Working with Nullable Reference Types for more information.

In this release, we have added a new relationship between two objects.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasMany(e => e.Posts)
        .WithOne(e => e.Blog)
        .HasForeignKey(e => e.BlogId)
        .IsRequired(false);
}
```

## Required one-to-many with shadow foreign key

```csharp
// Principal (parent)
public class Blog
{
    public int Id { get; set; }
    public ICollection<Post> Posts { get; } = new List<Post>(); // Collection navigation containing dependents
}

// Dependent (child)
public class Post
{
    public int Id { get; set; }
    public Blog Blog { get; set; } = null!; // Required reference navigation to principal
}
```

A foreign key property is a detail of how the relationship between entities is represented in the database.

Following on from the previous two examples, this example removes the foreign key property from the dependent entity type. EF therefore creates a shadow foreign key property called ```BlogId``` of type ```int```.

Use ```IsRequired``` to force the shadow foreign key property to be non-nullable and make the relationship required.

In this release, we have added a new relationship between two objects.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasMany(e => e.Posts)
        .WithOne(e => e.Blog)
        .HasForeignKey("BlogId")
        .IsRequired();
}
```

## Optional one-to-many with shadow foreign key

```csharp
// Principal (parent)
public class Blog
{
    public int Id { get; set; }
    public ICollection<Post> Posts { get; } = new List<Post>(); // Collection navigation containing dependents
}

// Dependent (child)
public class Post
{
    public int Id { get; set; }
    public Blog? Blog { get; set; } // Optional reference navigation to principal
}
```

In the previous example, we created a shadow foreign key property called ```BlogId``` of type ```int```?

When C# nullable reference types are not being used, then the foreign key property will be created as nullable.

In this release, we have added a new relationship between two objects.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasMany(e => e.Posts)
        .WithOne(e => e.Blog)
        .HasForeignKey("BlogId")
        .IsRequired(false);
}
```

## One-to-many without navigation to principal

```csharp
// Principal (parent)
public class Blog
{
    public int Id { get; set; }
    public ICollection<Post> Posts { get; } = new List<Post>(); // Collection navigation containing dependents
}

// Dependent (child)
public class Post
{
    public int Id { get; set; }
    public int BlogId { get; set; } // Required foreign key property
}
```

For this example, the foreign key property has been re-introduced, but the navigation on the dependent has been removed.

> Tip
A relationship with only one navigation, one from dependent to principal or one from principal to dependent(s), but not both, is known as a unidirectional relationship.

In this release, we have added a new relationship between two objects.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasMany(e => e.Posts)
        .WithOne()
        .HasForeignKey(e => e.BlogId)
        .IsRequired();
}
```

Notice that the call to ```WithOne``` has no arguments. This is the way to tell EF that there is no navigation from ```Post``` to ```Blog```.

If configuration starts from an entity with no navigation, then the type of the entity on the other end of the relationship must be explicitly specified using the generic ```HasOne```> call.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasOne<Blog>()
        .WithMany(e => e.Posts)
        .HasForeignKey(e => e.BlogId)
        .IsRequired();
}
```

## One-to-many without navigation to principal and with shadow foreign key

```csharp
// Principal (parent)
public class Blog
{
    public int Id { get; set; }
    public ICollection<Post> Posts { get; } = new List<Post>(); // Collection navigation containing dependents
}

// Dependent (child)
public class Post
{
    public int Id { get; set; }
}
```

This example combines two of the previous examples by removing both the foreign key property and the navigation on the dependent.

The following example shows how to create a relationship between two pieces of code.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasMany(e => e.Posts)
        .WithOne()
        .IsRequired();
}
```

A more complete configuration can be used to explicitly configure the navigation and foreign key name, with an appropriate call to ```IsRequired```() or ```IsRequired```(false) as needed. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasMany(e => e.Posts)
        .WithOne()
        .HasForeignKey("BlogId")
        .IsRequired();
}
```

## One-to-many without navigation to dependents

```csharp
// Principal (parent)
public class Blog
{
    public int Id { get; set; }
}

// Dependent (child)
public class Post
{
    public int Id { get; set; }
    public int BlogId { get; set; } // Required foreign key property
    public Blog Blog { get; set; } = null!; // Required reference navigation to principal
}
```

This is the third in a series of examples of how to change the navigation on the dependent to the principal.

In this release, we have added a new relationship between two objects.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasOne(e => e.Blog)
        .WithMany()
        .HasForeignKey(e => e.BlogId)
        .IsRequired();
}
```

Notice again that ```WithMany```() is called with no arguments to indicate that there is no navigation in this direction.

If configuration starts from an entity with no navigation, then the type of the entity on the other end of the relationship must be explicitly specified using the generic ```HasMany```> call.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasMany<Post>()
        .WithOne(e => e.Blog)
        .HasForeignKey(e => e.BlogId)
        .IsRequired();
}
```

## One-to-many with no navigations

Occasionally, it can be useful to configure a relationship with no navigations. Such a relationship can only be manipulated by changing the foreign key value directly.

```csharp
// Principal (parent)
public class Blog
{
    public int Id { get; set; }
}

// Dependent (child)
public class Post
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
        .HasMany<Post>()
        .WithOne();
}
```

The ```Post.BlogId``` property is a foreign key, and the relationship between the foreign key and the ```Post.BlogId``` property is required.

A more complete explicit configuration of this relationship is::

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasMany<Post>()
        .WithOne()
        .HasForeignKey(e => e.BlogId)
        .IsRequired();
}
```

## One-to-many with alternate key

The following examples show how the foreign key property on a dependent can be used as an alternate key for the principal entity type.

```csharp
// Principal (parent)
public class Blog
{
    public int Id { get; set; }
    public int AlternateId { get; set; } // Alternate key as target of the Post.BlogId foreign key
    public ICollection<Post> Posts { get; } = new List<Post>(); // Collection navigation containing dependents
}

// Dependent (child)
public class Post
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
        .HasMany(e => e.Posts)
        .WithOne(e => e.Blog)
        .HasPrincipalKey(e => e.AlternateId);
}
```

 ```HasPrincipalKey``` can be combined with other calls to explicitly configure the navigations, foreign key properties, and required/optional nature. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasMany(e => e.Posts)
        .WithOne(e => e.Blog)
        .HasPrincipalKey(e => e.AlternateId)
        .HasForeignKey(e => e.BlogId)
        .IsRequired();
}
```

## One-to-many with composite foreign key

When a relationship has a primary or alternate key, then the foreign key of the relationship must also be a primary or alternate key with the same number of properties.

```csharp
// Principal (parent)
public class Blog
{
    public int Id1 { get; set; } // Composite key part 1
    public int Id2 { get; set; } // Composite key part 2
    public ICollection<Post> Posts { get; } = new List<Post>(); // Collection navigation containing dependents
}

// Dependent (child)
public class Post
{
    public int Id { get; set; }
    public int BlogId1 { get; set; } // Required foreign key property part 1
    public int BlogId2 { get; set; } // Required foreign key property part 2
    public Blog Blog { get; set; } = null!; // Required reference navigation to principal
}
```

This relationship is discovered by convention. However, the composite key itself needs to be configured explicitly::

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

            nestedBuilder.HasMany(e => e.Posts)
                .WithOne(e => e.Blog)
                .HasPrincipalKey(e => new { e.Id1, e.Id2 })
                .HasForeignKey(e => new { e.BlogId1, e.BlogId2 })
                .IsRequired();
        });
}
```

> Tip
In the code above, the calls to ```HasKey``` and ```HasMany``` have been grouped together into a nested builder. Nested builders remove the need to call Entity<>() multiple times for the same entity type, but are functionally equivalent to calling Entity<>() multiple times.

## Required one-to-many without cascade delete

```csharp
// Principal (parent)
public class Blog
{
    public int Id { get; set; }
    public ICollection<Post> Posts { get; } = new List<Post>(); // Collection navigation containing dependents
}

// Dependent (child)
public class Post
{
    public int Id { get; set; }
    public int BlogId { get; set; } // Required foreign key property
    public Blog Blog { get; set; } = null!; // Required reference navigation to principal
}
```

In this post, I'm going to show you how to delete cascades in the Entity Framework (EF).

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasMany(e => e.Posts)
        .WithOne(e => e.Blog)
        .OnDelete(DeleteBehavior.Restrict);
}
```

## Self-referencing one-to-many

In the previous examples, we looked at ```Employee``` types.

```csharp
public class Employee
{
    public int Id { get; set; }

    public int? ManagerId { get; set; } // Optional foreign key property
    public Employee? Manager { get; set; } // Optional reference navigation to principal
    public ICollection<Employee> Reports { get; } = new List<Employee>(); // Collection navigation containing dependents
}
```

A relationship is a relationship between two or more objects.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Employee>()
        .HasOne(e => e.Manager)
        .WithMany(e => e.Reports)
        .HasForeignKey(e => e.ManagerId)
        .IsRequired(false);
}
```

Ref: [One-to-many relationships](https://learn.microsoft.com/en-us/ef/core/modeling/relationships/one-to-many)
