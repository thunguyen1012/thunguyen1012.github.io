
---
title: Entity Framework - Entity Framework Core - Create a model - Relationships - Mapping attributes
published: true
date: 2024-07-16T04:33:13.593Z
tags: efcore, summary
description: OnModelCreating implements the OnModelCreating mapping attribute.
image:
---
# [Mapping attributes (aka data annotations) for relationships](https://learn.microsoft.com/en-us/ef/core/modeling/relationships/mapping-attributes)

  - Article

  - 03/30/2023

  - 4 contributors

## In this article

 ```OnModelCreating``` implements the ```OnModelCreating``` mapping attribute.

> Important
This document only covers mapping attributes in the context of relationship configuration. Other uses of mapping attributes are covered in the relevant sections of the wider modeling documentation.

> Tip
The code below can be found in MappingAttributes.cs.

## Where to get mapping attributes

Mappings are part of the architecture of the .NET framework.

All new mapping attributes designed for EF Core are now specific to EF Core, thereby keeping their semantics simple and clear.

## RequiredAttribute

The Required attribute is used to indicate that a property cannot be ```null```.

```csharp
public class Blog
{
    public string Id { get; set; }
    public List<Post> Posts { get; } = new();
}

public class Post
{
    public int Id { get; set; }

    [Required]
    public string BlogId { get; set; }

    public Blog Blog { get; init; }
}
```

> Note
When using C# nullable reference types, the ```BlogId``` property in this example is already non-nullable, which means the [Required] attribute will have no affect.

[Required] placed on the dependent navigation has the same effect. That is, making the foreign key non-nullable, and thereby making the relationship required. For example:

```csharp
public class Blog
{
    public string Id { get; set; }
    public List<Post> Posts { get; } = new();
}

public class Post
{
    public int Id { get; set; }

    public string BlogId { get; set; }

    [Required]
    public Blog Blog { get; init; }
}
```

If [Required] is found on the dependent navigation and the foreign key property is in shadow state, then shadow property is made non-nullable, thereby making the relationship required. For example:

```csharp
public class Blog
{
    public string Id { get; set; }
    public List<Post> Posts { get; } = new();
}

public class Post
{
    public int Id { get; set; }

    [Required]
    public Blog Blog { get; init; }
}
```

> Note
Using [Required] on the principal navigation side of a relationship has no effect.

## ForeignKeyAttribute

ForeignKeyAttribute is used to connect a foreign key property with its navigations. [ForeignKey] can be placed on the foreign key property with the name of the dependent navigation. For example:

```csharp
public class Blog
{
    public string Id { get; set; }
    public List<Post> Posts { get; } = new();
}

public class Post
{
    public int Id { get; set; }

    [ForeignKey(nameof(Blog))]
    public string BlogKey { get; set; }

    public Blog Blog { get; init; }
}
```

Or, [ForeignKey] can be placed on either the dependent or principal navigation with the name of the property to use as the foreign key. For example:

```csharp
public class Blog
{
    public string Id { get; set; }
    public List<Post> Posts { get; } = new();
}

public class Post
{
    public int Id { get; set; }

    public string BlogKey { get; set; }

    [ForeignKey(nameof(BlogKey))]
    public Blog Blog { get; init; }
}
```

When [ForeignKey] is placed on a navigation and the name provided does not match any property name, then a shadow property with that name will be created to act as the foreign key. For example:

```csharp
public class Blog
{
    public string Id { get; set; }
    public List<Post> Posts { get; } = new();
}

public class Post
{
    public int Id { get; set; }

    [ForeignKey("BlogKey")]
    public Blog Blog { get; init; }
}
```

## InversePropertyAttribute

This example shows how to use InversePropertyAttribute to pair navigations between entity types.

```csharp
public class Blog
{
    public int Id { get; set; }

    [InverseProperty("Blog")]
    public List<Post> Posts { get; } = new();

    public int FeaturedPostId { get; set; }
    public Post FeaturedPost { get; set; }
}

public class Post
{
    public int Id { get; set; }
    public int BlogId { get; set; }

    public Blog Blog { get; init; }
}
```

> Important
[InverseProperty] is only needed when there is more than one relationship between the same types. With a single relationship, the two navigations are paired automatically.

## DeleteBehaviorAttribute

The following example shows how to change the relationship between the client and the server.

```csharp
public class Blog
{
    public int Id { get; set; }
    public List<Post> Posts { get; } = new();
}

public class Post
{
    public int Id { get; set; }
    public int BlogId { get; set; }

    [DeleteBehavior(DeleteBehavior.Restrict)]
    public Blog Blog { get; init; }
}
```

See ```Cascade``` delete for more information on cascading behaviors.