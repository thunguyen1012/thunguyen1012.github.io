
---
title: Entity Framework - Entity Framework Core - Create a model - Relationships - Navigations
published: true
date: 2024-07-16T04:32:42.369Z
tags: efcore, summary
description: This paper describes the use of navigations in the Entity Framework (EF).
image:
---
# [Relationship navigations](https://learn.microsoft.com/en-us/ef/core/modeling/relationships/navigations)

  - Article

  - 03/30/2023

  - 2 contributors

## In this article

This paper describes the use of navigations in the Entity Framework (EF).

> Important
Multiple relationships cannot share navigations. Any foreign key can be associated with at most one navigation from principal to dependent, and at most one navigation from dependent to principal.

> Tip
There is no need to make navigations virtual unless they are being used by lazy-loading or change-tracking proxies.

## Reference navigations

A navigation is an object representation of a relationship between two or more entities.

```csharp
public Blog TheBlog { get; set; }
```

Reference navigations are used to indicate whether an entity exists or not.

When using C# nullable reference types, reference navigations must be nullable for optional relationships:

```csharp
public Blog? TheBlog { get; set; }
```

Reference navigations for required relationships can be nullable or non-nullable.

## Collection navigations

Collection navigations are instances of a .NET collection type; that is, any type implementing ICollectionT>.

```csharp
public ICollection<Post> ThePosts { get; set; }
```

Collection navigations do not need to have a setter. It is common to initialize the collection inline, thereby removing the need to ever check if the property is ```null```. For example:

```csharp
public ICollection<Post> ThePosts { get; } = new List<Post>();
```

> Tip
Don't accidentally create an expression bodied property, such as public ICollection<Post> ThePosts => new List<Post>();. This will create a new, empty collection instance each time the property is accessed, and will therefore be useless as a navigation.

### Collection types

ICollectionT> is a collection implementation.

> Important
The collection must use reference equality. When creating a HashSet<T> for a collection navigation, make sure to use ```ReferenceEqualityComparer```.

Arrays cannot be used for collection navigations because, even though they implement ICollection<T>, the ```Add``` method throws an exception when called.

A collection can be exposed as an IEnumerableT>, which provides a read-only view that cannot be randomly modified by application code.

```csharp
public class Blog
{
    public int Id { get; set; }
    public IEnumerable<Post> ThePosts { get; } = new List<Post>();
}
```

A variation on this pattern includes methods for manipulation of the collection as needed. For example:

```csharp
public class Blog
{
    private readonly List<Post> _posts = new();

    public int Id { get; set; }

    public IEnumerable<Post> Posts => _posts;

    public void AddPost(Post post) => _posts.Add(post);
}
```

An entity could return a defensive copy of an exposed collection.

```csharp
public class Blog
{
    private readonly List<Post> _posts = new();

    public int Id { get; set; }

    public IEnumerable<Post> Posts => _posts.ToList();

    public void AddPost(Post post) => _posts.Add(post);
}
```

Carefully consider whether the value gained from this is high enough that it outweighs the overhead of creating a copy of the collection every time the navigation is accessed.

> Tip
This final pattern works because, by-default, EF accesses the collection through its backing field. This means that EF itself adds and removes entities from the actual collection, while applications only interact with a defensive copy of the collection.

### Initialization of collection navigations

Collection navigations can be initialized by the entity type, either eagerly:

```csharp
public class Blog
{
    public ICollection<Post> Posts { get; } = new List<Post>();
}
```

Or lazily:

```csharp
public class Blog
{
    private ICollection<Post>? _posts;

    public ICollection<Post> Posts => _posts ??= new List<Post>();
}
```

This example shows how to create an instance of a collection navigation.

- If the navigation is exposed as a HashSet<T>, then an instance of HashSet<T> using ```ReferenceEqualityComparer``` is created.

- Otherwise, if the navigation is exposed as a concrete type with a parameterless constructor, then an instance of that concrete type is created. This applies to List<T>, but also to other collection types, including custom collection types.

- Otherwise, if the navigation is exposed as an IEnumerable<T>, an ICollection<T>, or an ISet<T>, then an instance of HashSet<T> using ```ReferenceEqualityComparer``` is created.

- Otherwise, if the navigation is exposed as an IList<T>, then an instance of List<T> is created.

- Otherwise, an exception is thrown.

> Note
If notification entities, including change-tracking proxies, are being used, then ObservableCollection<T> and ObservableHashSet<T> are used in place of List<T> and HashSet<T>.

> Important
As described in the change tracking documentation, EF only tracks a single instance of any entity with a given key value. This means that collections used as navigations must use reference equality semantics. Entity types that don't override object equality will get this by default. Make sure to use ```ReferenceEqualityComparer``` when creating a HashSet<T> for use as a navigation to ensure it works for all entity types.

## Configuring navigations

Navigations are part of the model building process.

The navigation properties of an EF relationship are part of the overall relationship configuration.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .Navigation(e => e.Posts)
        .UsePropertyAccessMode(PropertyAccessMode.Property);

    modelBuilder.Entity<Post>()
        .Navigation(e => e.Blog)
        .UsePropertyAccessMode(PropertyAccessMode.Property);
}
```

> Note
The ```Navigation``` call cannot be used to create a navigation property. It is only used to configure a navigation property which has been previously created by defining a relationship or from a convention.

### Required navigations

The relationship between a foreign key and a relationship between a foreign key and a principal is optional.

Is there a way to ensure that a principal is associated with a certain number of dependents?

The principal and dependent types must exist in the same table.

Configuration of the navigation property as required is done using the ```Navigation``` method. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .Navigation(e => e.BlogHeader)
        .IsRequired();
}
```