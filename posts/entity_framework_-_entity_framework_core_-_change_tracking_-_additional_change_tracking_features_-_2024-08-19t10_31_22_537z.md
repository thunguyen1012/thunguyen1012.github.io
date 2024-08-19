---
title: Entity Framework - Entity Framework Core - Change tracking - Additional change tracking features
published: true
date: 2024-08-19 10:31:22
tags: Summary, EFCore
description: This document covers miscellaneous features and scenarios involving change tracking.
image:
---

## In this article

This document covers miscellaneous features and scenarios involving change tracking.

> Tip
This document assumes that entity states and the basics of EF Core change tracking are understood. See Change Tracking in EF Core for more information on these topics.

> Tip
You can run and debug into all the code in this document by downloading the sample code from GitHub.

## ```Add``` versus ```AddAsync```

Entity Framework Core (EF Core) provides async methods whenever using that method may result in a database interaction.

EF Core ships with two methods for adding entities to the database.

Other similar methods like ```Update```, ```Attach```, and ```Remove``` do not have async overloads because they never generate new key values, and hence never need to access the database.

## ```AddRange```, ```UpdateRange```, ```AttachRange```, and ```RemoveRange```

```DbSet<T>``` and ```DbContext``` provide alternate versions of ```Add```, ```Update```, ```Attach```, and ```Remove``` that accept multiple instances in a single call.

This paper describes the use of methods "range" and "non-range".

> Note
This is different from EF6, where ```AddRange``` and ```Add``` both automatically called ```DetectChanges```, but calling ```Add``` multiple times caused ```DetectChanges``` to be called multiple times instead of once. This made ```AddRange``` more efficient in EF6. In EF Core, neither of these methods automatically call ```DetectChanges```.

## ```DbContext``` versus ```DbSet``` methods

```DbSet<T>``` and ```DbContext``` are both methods of the Entity Framework DbSet.

When using EF Core model types, methods like ```Add```, ```Update```, ```Attach```, and ```Remove``` must first be created for the EF Core model type that is being used. Methods like ```Add```, ```Update```, ```Attach```, and ```Remove``` can then be used on the DbSet without any ambiguity as to which EF Core model type is

A shared-type entity type is used by default for the join entities in many-to-many relationships.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder
        .SharedTypeEntity<Dictionary<string, int>>(
            "PostTag",
            b =>
            {
                b.IndexerProperty<int>("TagId");
                b.IndexerProperty<int>("PostId");
            });

    modelBuilder.Entity<Post>()
        .HasMany(p => p.Tags)
        .WithMany(p => p.Posts)
        .UsingEntity<Dictionary<string, int>>(
            "PostTag",
            j => j.HasOne<Tag>().WithMany(),
            j => j.HasOne<Post>().WithMany());
}
```

This code shows how to associate two entities by tracking a new join entity instance.

```csharp
using var context = new BlogsContext();

var post = context.Posts.Single(e => e.Id == 3);
var tag = context.Tags.Single(e => e.Id == 1);

var joinEntitySet = context.Set<Dictionary<string, int>>("PostTag");
var joinEntity = new Dictionary<string, int> { ["PostId"] = post.Id, ["TagId"] = tag.Id };
joinEntitySet.Add(joinEntity);

Console.WriteLine(context.ChangeTracker.DebugView.LongView);

context.SaveChanges();
```

Notice that ```DbContext.Set<TEntity>(String)``` is used to create a DbSet for the ```PostTag``` entity type. This DbSet can then be used to call ```Add``` with the new join entity instance.

> Important
The CLR type used for join entity types by convention may change in future releases to improve performance. Do not depend on any specific join entity type unless it has been explicitly configured as is done for ```Dictionary<string, int>``` in the code above.

## ```Property``` versus field access

Access to entity properties using the backing field of the property by default.

This article describes how to change the ```PropertyAccessMode``` in EF Core to prevent notifications when setting a property.

- All entity types in the model using ```ModelBuilder.UsePropertyAccessMode```

- All properties and navigations of a specific entity type using ```EntityTypeBuilder<TEntity>.UsePropertyAccessMode```

- A specific property using ```PropertyBuilder.UsePropertyAccessMode```

- A specific navigation using ```NavigationBuilder.UsePropertyAccessMode```

 ```Property``` access modes ```Field``` and ```PreferField``` will cause EF Core to access the property value through its backing field.

EF Core will throw an exception if it cannot access the value through the field or property getter/setter.

EF Core will use the preferred access mode if it is possible to access a property through its getter or setter.

The following two examples show how to configure EF Core to use backing fields only when creating entity instances.

The different property access modes are summarized in the following table:

<table><thead>
<tr>
<th style="text-align: left;">PropertyAccessMode</th>
<th>Preference</th>
<th>Preference creating entities</th>
<th>Fallback</th>
<th>Fallback creating entities</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;"><code>Field</code></td>
<td>Field</td>
<td>Field</td>
<td>Throws</td>
<td>Throws</td>
</tr>
<tr>
<td style="text-align: left;"><code>Property</code></td>
<td>Property</td>
<td>Property</td>
<td>Throws</td>
<td>Throws</td>
</tr>
<tr>
<td style="text-align: left;"><code>PreferField</code></td>
<td>Field</td>
<td>Field</td>
<td>Property</td>
<td>Property</td>
</tr>
<tr>
<td style="text-align: left;"><code>PreferProperty</code></td>
<td>Property</td>
<td>Property</td>
<td>Field</td>
<td>Field</td>
</tr>
<tr>
<td style="text-align: left;"><code>FieldDuringConstruction</code></td>
<td>Property</td>
<td>Field</td>
<td>Field</td>
<td>Throws</td>
</tr>
<tr>
<td style="text-align: left;"><code>PreferFieldDuringConstruction</code></td>
<td>Property</td>
<td>Field</td>
<td>Field</td>
<td>Property</td>
</tr>
</tbody></table>

## Temporary values

EF Core creates temporary key values when tracking new entities that will have real key values generated by the database when SaveChanges are called.

### Accessing temporary values

Temporary values are stored in the change tracker and not set onto entity instances directly. Temporary values are stored in the change tracker and not set onto entity instances directly.

```csharp
using var context = new BlogsContext();

var blog = new Blog { Name = ".NET Blog" };

context.Add(blog);

Console.WriteLine($"Blog.Id set on entity is {blog.Id}");
Console.WriteLine($"Blog.Id tracked by EF is {context.Entry(blog).Property(e => e.Id).CurrentValue}");
```

The output from this code is:

```output
Blog.Id set on entity is 0
Blog.Id tracked by EF is -2147482643
```

```PropertyEntry.IsTemporary``` can be used to check for temporary values.

### Manipulating temporary values

The following code shows how to associate a graph of new entities by foreign key, while still allowing real key values to be generated when SaveChanges is called.

```csharp
var blogs = new List<Blog> { new Blog { Id = -1, Name = ".NET Blog" }, new Blog { Id = -2, Name = "Visual Studio Blog" } };

var posts = new List<Post>
{
    new Post
    {
        Id = -1,
        BlogId = -1,
        Title = "Announcing the Release of EF Core 5.0",
        Content = "Announcing the release of EF Core 5.0, a full featured cross-platform..."
    },
    new Post
    {
        Id = -2,
        BlogId = -2,
        Title = "Disassembly improvements for optimized managed debugging",
        Content = "If you are focused on squeezing out the last bits of performance for your .NET service or..."
    }
};

using var context = new BlogsContext();

foreach (var blog in blogs)
{
    context.Add(blog).Property(e => e.Id).IsTemporary = true;
}

foreach (var post in posts)
{
    context.Add(post).Property(e => e.Id).IsTemporary = true;
}

Console.WriteLine(context.ChangeTracker.DebugView.LongView);

context.SaveChanges();

Console.WriteLine(context.ChangeTracker.DebugView.LongView);
```

Notice that:

- Negative numbers are used as temporary key values; this is not required, but is a common convention to prevent key clashes.

- The ```Post.BlogId``` FK property is assigned the same negative value as the PK of the associated blog.

- The PK values are marked as temporary by setting IsTemporary after each entity is tracked. This is necessary because any key value supplied by the application is assumed to be a real key value.

Looking at the change tracker debug view before calling SaveChanges shows that the PK values are marked as temporary and posts are associated with the correct blogs, including fixup of navigations:

```output
Blog {Id: -2} Added
  Id: -2 PK Temporary
  Name: 'Visual Studio Blog'
  Posts: [{Id: -2}]
Blog {Id: -1} Added
  Id: -1 PK Temporary
  Name: '.NET Blog'
  Posts: [{Id: -1}]
Post {Id: -2} Added
  Id: -2 PK Temporary
  BlogId: -2 FK
  Content: 'If you are focused on squeezing out the last bits of perform...'
  Title: 'Disassembly improvements for optimized managed debugging'
  Blog: {Id: -2}
  Tags: []
Post {Id: -1} Added
  Id: -1 PK Temporary
  BlogId: -1 FK
  Content: 'Announcing the release of EF Core 5.0, a full featured cross...'
  Title: 'Announcing the Release of EF Core 5.0'
  Blog: {Id: -1}
```

After calling SaveChanges, these temporary values have been replaced by real values generated by the database:

```output
Blog {Id: 1} Unchanged
  Id: 1 PK
  Name: '.NET Blog'
  Posts: [{Id: 1}]
Blog {Id: 2} Unchanged
  Id: 2 PK
  Name: 'Visual Studio Blog'
  Posts: [{Id: 2}]
Post {Id: 1} Unchanged
  Id: 1 PK
  BlogId: 1 FK
  Content: 'Announcing the release of EF Core 5.0, a full featured cross...'
  Title: 'Announcing the Release of EF Core 5.0'
  Blog: {Id: 1}
  Tags: []
Post {Id: 2} Unchanged
  Id: 2 PK
  BlogId: 2 FK
  Content: 'If you are focused on squeezing out the last bits of perform...'
  Title: 'Disassembly improvements for optimized managed debugging'
  Blog: {Id: 2}
  Tags: []
```

## Working with default values

In this article, I'm going to show you how to use EF Core to get a property's default value from the database when SaveChanges is called.

```csharp
public class Token
{
    public int Id { get; set; }
    public string Name { get; set; }
    public DateTime ValidFrom { get; set; }
}
```

The ```ValidFrom``` property is configured to get a default value from the database:

```csharp
modelBuilder
    .Entity<Token>()
    .Property(e => e.ValidFrom)
    .HasDefaultValueSql("CURRENT_TIMESTAMP");
```

When inserting an entity of this type, EF Core will let the database generate the value unless an explicit value has been set instead. For example:

```csharp
using var context = new BlogsContext();

context.AddRange(
    new Token { Name = "A" },
    new Token { Name = "B", ValidFrom = new DateTime(1111, 11, 11, 11, 11, 11) });

context.SaveChanges();

Console.WriteLine(context.ChangeTracker.DebugView.LongView);
```

Looking at the change tracker debug view shows that the first token had ```ValidFrom``` generated by the database, while the second token used the value explicitly set:

```output
Token {Id: 1} Unchanged
  Id: 1 PK
  Name: 'A'
  ValidFrom: '12/30/2020 6:36:06 PM'
Token {Id: 2} Unchanged
  Id: 2 PK
  Name: 'B'
  ValidFrom: '11/11/1111 11:11:11 AM'
```

> Note
Using database default values requires that the database column has a default value constraint configured. This is done automatically by EF Core migrations when using ```HasDefaultValueSql``` or ```HasDefaultValue```. Make sure to create the default constraint on the column in some other way when not using EF Core migrations.

### Using nullable properties

The default property setting (CLR) in the Entity Framework Core (EF) is not explicitly set in the database.

```csharp
public class Foo1
{
    public int Id { get; set; }
    public int Count { get; set; }
}
```

Where that property is configured to have a database default of -1:

```csharp
modelBuilder
    .Entity<Foo1>()
    .Property(e => e.Count)
    .HasDefaultValue(-1);
```

The default value for the CLR property is -1.

```csharp
using var context = new BlogsContext();

var fooA = new Foo1 { Count = 10 };
var fooB = new Foo1 { Count = 0 };
var fooC = new Foo1();

context.AddRange(fooA, fooB, fooC);
context.SaveChanges();

Debug.Assert(fooA.Count == 10);
Debug.Assert(fooB.Count == -1); // Not what we want!
Debug.Assert(fooC.Count == -1);
```

In this post I'm going to show you how to set the ```Count``` property to 0.

```csharp
public class Foo2
{
    public int Id { get; set; }
    public int? Count { get; set; }
}
```

This makes the CLR default null, instead of 0, which means 0 will now be inserted when explicitly set:

```csharp
using var context = new BlogsContext();

var fooA = new Foo2 { Count = 10 };
var fooB = new Foo2 { Count = 0 };
var fooC = new Foo2();

context.AddRange(fooA, fooB, fooC);
context.SaveChanges();

Debug.Assert(fooA.Count == 10);
Debug.Assert(fooB.Count == 0);
Debug.Assert(fooC.Count == -1);
```

### Using nullable backing fields

The problem with making the property nullable that it may not be conceptually nullable in the domain model. Forcing the property to be nullable therefore compromises the model.

The property can be left non-nullable, with only the backing field being nullable. For example:

```csharp
public class Foo3
{
    public int Id { get; set; }

    private int? _count;

    public int Count
    {
        get => _count ?? -1;
        set => _count = value;
    }
}
```

This allows the CLR default (0) to be inserted if the property is explicitly set to 0, while not needing to expose the property as nullable in the domain model. For example:

```csharp
using var context = new BlogsContext();

var fooA = new Foo3 { Count = 10 };
var fooB = new Foo3 { Count = 0 };
var fooC = new Foo3();

context.AddRange(fooA, fooB, fooC);
context.SaveChanges();

Debug.Assert(fooA.Count == 10);
Debug.Assert(fooB.Count == 0);
Debug.Assert(fooC.Count == -1);
```

#### Nullable backing fields for ```bool``` properties

The CLR defaults for a property's "false" or "true" state can be overridden by the normal pattern of the property's "false" or "true" state.

```csharp
public class User
{
    public int Id { get; set; }
    public string Name { get; set; }

    private bool? _isAuthorized;

    public bool IsAuthorized
    {
        get => _isAuthorized ?? true;
        set => _isAuthorized = value;
    }
}
```

The ```IsAuthorized``` property is configured with a database default value of "true":

```csharp
modelBuilder
    .Entity<User>()
    .Property(e => e.IsAuthorized)
    .HasDefaultValue(true);
```

The ```IsAuthorized``` property can be set to "true" or "false" explicitly before inserting, or can be left unset in which case the database default will be used:

```csharp
using var context = new BlogsContext();

var userA = new User { Name = "Mac" };
var userB = new User { Name = "Alice", IsAuthorized = true };
var userC = new User { Name = "Baxter", IsAuthorized = false }; // Always deny Baxter access!

context.AddRange(userA, userB, userC);

context.SaveChanges();
```

The output from SaveChanges when using SQLite shows that the database default is used for Mac, while explicit values are set for Alice and Baxter:

```sql
-- Executed DbCommand (0ms) [Parameters=[@p0='Mac' (Size = 3)], CommandType='Text', CommandTimeout='30']
INSERT INTO "User" ("Name")
VALUES (@p0);
SELECT "Id", "IsAuthorized"
FROM "User"
WHERE changes() = 1 AND "rowid" = last_insert_rowid();

-- Executed DbCommand (0ms) [Parameters=[@p0='True' (DbType = String), @p1='Alice' (Size = 5)], CommandType='Text', CommandTimeout='30']
INSERT INTO "User" ("IsAuthorized", "Name")
VALUES (@p0, @p1);
SELECT "Id"
FROM "User"
WHERE changes() = 1 AND "rowid" = last_insert_rowid();

-- Executed DbCommand (0ms) [Parameters=[@p0='False' (DbType = String), @p1='Baxter' (Size = 6)], CommandType='Text', CommandTimeout='30']
INSERT INTO "User" ("IsAuthorized", "Name")
VALUES (@p0, @p1);
SELECT "Id"
FROM "User"
WHERE changes() = 1 AND "rowid" = last_insert_rowid();
```

### Schema defaults only

EF Core has a property called ```PropertyBuilder``` that can be used to create defaults in the database schema created by EF Core migrations without EF Core ever using these values for inserts.

```csharp
modelBuilder
    .Entity<Bar>()
    .Property(e => e.Count)
    .HasDefaultValue(-1)
    .ValueGeneratedNever();
```

Ref: [Additional Change Tracking Features](https://learn.microsoft.com/en-us/ef/core/change-tracking/miscellaneous)