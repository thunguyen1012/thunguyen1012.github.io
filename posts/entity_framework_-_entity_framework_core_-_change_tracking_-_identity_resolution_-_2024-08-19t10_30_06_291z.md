---
title: Entity Framework - Entity Framework Core - Change tracking - Identity resolution
published: true
date: 2024-08-19 10:30:06
tags: Summary, EFCore
description: A DbContext can only track one entity instance with any given primary key value.
image:
---

## In this article

A DbContext can only track one entity instance with any given primary key value.

> Tip
This document assumes that entity states and the basics of EF Core change tracking are understood. See Change Tracking in EF Core for more information on these topics.

> Tip
You can run and debug into all the code in this document by downloading the sample code from GitHub.

## Introduction

The following code queries for an entity and then attempts to attach a different instance with the same primary key value:

```csharp
using var context = new BlogsContext();

var blogA = context.Blogs.Single(e => e.Id == 1);
var blogB = new Blog { Id = 1, Name = ".NET Blog (All new!)" };

try
{
    context.Update(blogB); // This will throw
}
catch (Exception e)
{
    Console.WriteLine($"{e.GetType().FullName}: {e.Message}");
}
```

Running this code results in the following exception:

EF Core requires a single instance because:

- Property values may be different between multiple instances. When updating the database, EF Core needs to know which property values to use.

- Relationships with other entities may be different between multiple instances. For example, "blogA" may be related to a different collection of posts than "blogB".

The exception above is commonly encountered in these situations:

- When attempting to update an entity

- When attempting to track a serialized graph of entities

- When failing to set a key value that is not automatically generated

- When reusing a DbContext instance for multiple units-of-work

Each of these situations is discussed in the following sections.

## Updating an entity

Identity resolution is the process of updating an entity with a new value.

### Call ```Update```

The easiest way to update an entity is to use DbContext.Update or DbSetT>.Update.

```csharp
public static void UpdateFromHttpPost1(Blog blog)
{
    using var context = new BlogsContext();

    context.Update(blog);

    context.SaveChanges();
}
```

In this case:

- Only a single instance of the entity is created.

- The entity instance is not queried from the database as part of making the update.

- All property values will be updated in the database, regardless of whether they have actually changed or not.

- One database round-trip is made.

### Query then apply changes

In our previous article we looked at how to update property values in a database.

```csharp
public static void UpdateFromHttpPost2(Blog blog)
{
    using var context = new BlogsContext();

    var trackedBlog = context.Blogs.Find(blog.Id);

    trackedBlog.Name = blog.Name;
    trackedBlog.Summary = blog.Summary;

    context.SaveChanges();
}
```

In this case:

- Only a single instance of the entity is tracked; the one that is returned from the database by the ```Find``` query.

- ```Update```, ```Attach```, etc. are not used.

- Only property values that have actually changed are updated in the database.

- Two database round-trips are made.

EF Core has some helpers for transferring property values like this. For example, ```PropertyValues.SetValues``` will copy all the values from the given object and set them on the tracked object:

```csharp
public static void UpdateFromHttpPost3(Blog blog)
{
    using var context = new BlogsContext();

    var trackedBlog = context.Blogs.Find(blog.Id);

    context.Entry(trackedBlog).CurrentValues.SetValues(blog);

    context.SaveChanges();
}
```

 ```SetValues``` accepts various object types, including data transfer objects (DTOs) with property names that match the properties of the entity type. For example:

```csharp
public static void UpdateFromHttpPost4(BlogDto dto)
{
    using var context = new BlogsContext();

    var trackedBlog = context.Blogs.Find(dto.Id);

    context.Entry(trackedBlog).CurrentValues.SetValues(dto);

    context.SaveChanges();
}
```

Or a dictionary with name/value entries for the property values:

```csharp
public static void UpdateFromHttpPost5(Dictionary<string, object> propertyValues)
{
    using var context = new BlogsContext();

    var trackedBlog = context.Blogs.Find(propertyValues["Id"]);

    context.Entry(trackedBlog).CurrentValues.SetValues(propertyValues);

    context.SaveChanges();
}
```

See Accessing tracked entities for more information on working with property values like this.

### Use original values

There are a number of ways to update property values on a website.

```csharp
public static void UpdateFromHttpPost6(Blog blog, Dictionary<string, object> originalValues)
{
    using var context = new BlogsContext();

    context.Attach(blog);
    context.Entry(blog).OriginalValues.SetValues(originalValues);

    context.SaveChanges();
}
```

This code shows how to mark properties with different current and original values as modified.

In this case:

- Only a single instance of the entity is tracked, using ```Attach```.

- The entity instance is not queried from the database as part of making the update.

- Applying the original values ensures that only property values that have actually changed are updated in the database.

- One database round-trip is made.

As with the examples in the previous section, the original values do not have to be passed as a dictionary; an entity instance or DTO will also work.

> Tip
While this approach has appealing characteristics, it does require sending the entity's original values to and from the web client. Carefully consider whether this extra complexity is worth the benefits; for many applications one of the simpler approaches is more pragmatic.

## Attaching a serialized graph

This article describes how to resolve duplicate entities in an EF Core graph.

### Graphs with no duplicates

Before going any further it is important to recognize that:

- Serializers often have options for handling loops and duplicate instances in the graph.

- The choice of object used as the graph root can often help reduce or remove duplicates.

If possible, use serialization options and choose roots that do not result in duplicates. For example, the following code uses Json.NET to serialize a list of blogs each with its associated posts:

```csharp
using var context = new BlogsContext();

var blogs = context.Blogs.Include(e => e.Posts).ToList();

var serialized = JsonConvert.SerializeObject(
    blogs,
    new JsonSerializerSettings { ReferenceLoopHandling = ReferenceLoopHandling.Ignore, Formatting = Formatting.Indented });

Console.WriteLine(serialized);
```

The JSON generated from this code is:

```json
[
  {
    "Id": 1,
    "Name": ".NET Blog",
    "Summary": "Posts about .NET",
    "Posts": [
      {
        "Id": 1,
        "Title": "Announcing the Release of EF Core 5.0",
        "Content": "Announcing the release of EF Core 5.0, a full featured cross-platform...",
        "BlogId": 1
      },
      {
        "Id": 2,
        "Title": "Announcing F# 5",
        "Content": "F# 5 is the latest version of F#, the functional programming language...",
        "BlogId": 1
      }
    ]
  },
  {
    "Id": 2,
    "Name": "Visual Studio Blog",
    "Summary": "Posts about Visual Studio",
    "Posts": [
      {
        "Id": 3,
        "Title": "Disassembly improvements for optimized managed debugging",
        "Content": "If you are focused on squeezing out the last bits of performance for your .NET service or...",
        "BlogId": 2
      },
      {
        "Id": 4,
        "Title": "Database Profiling with Visual Studio",
        "Content": "Examine when database queries were executed and measure how long the take using...",
        "BlogId": 2
      }
    ]
  }
]
```

Notice that there are no duplicate blogs or posts in the JSON. This means that simple calls to ```Update``` will work to update these entities in the database:

```csharp
public static void UpdateBlogsFromJson(string json)
{
    using var context = new BlogsContext();

    var blogs = JsonConvert.DeserializeObject<List<Blog>>(json);

    foreach (var blog in blogs)
    {
        context.Update(blog);
    }

    context.SaveChanges();
}
```

### Handling duplicates

The following example shows how to introduce new posts to a blog.

```csharp
using var context = new BlogsContext();

var posts = context.Posts.Include(e => e.Blog).ToList();

var serialized = JsonConvert.SerializeObject(
    posts,
    new JsonSerializerSettings { ReferenceLoopHandling = ReferenceLoopHandling.Ignore, Formatting = Formatting.Indented });

Console.WriteLine(serialized);
```

The serialized JSON now looks like this:

```json
[
  {
    "Id": 1,
    "Title": "Announcing the Release of EF Core 5.0",
    "Content": "Announcing the release of EF Core 5.0, a full featured cross-platform...",
    "BlogId": 1,
    "Blog": {
      "Id": 1,
      "Name": ".NET Blog",
      "Summary": "Posts about .NET",
      "Posts": [
        {
          "Id": 2,
          "Title": "Announcing F# 5",
          "Content": "F# 5 is the latest version of F#, the functional programming language...",
          "BlogId": 1
        }
      ]
    }
  },
  {
    "Id": 2,
    "Title": "Announcing F# 5",
    "Content": "F# 5 is the latest version of F#, the functional programming language...",
    "BlogId": 1,
    "Blog": {
      "Id": 1,
      "Name": ".NET Blog",
      "Summary": "Posts about .NET",
      "Posts": [
        {
          "Id": 1,
          "Title": "Announcing the Release of EF Core 5.0",
          "Content": "Announcing the release of EF Core 5.0, a full featured cross-platform...",
          "BlogId": 1
        }
      ]
    }
  },
  {
    "Id": 3,
    "Title": "Disassembly improvements for optimized managed debugging",
    "Content": "If you are focused on squeezing out the last bits of performance for your .NET service or...",
    "BlogId": 2,
    "Blog": {
      "Id": 2,
      "Name": "Visual Studio Blog",
      "Summary": "Posts about Visual Studio",
      "Posts": [
        {
          "Id": 4,
          "Title": "Database Profiling with Visual Studio",
          "Content": "Examine when database queries were executed and measure how long the take using...",
          "BlogId": 2
        }
      ]
    }
  },
  {
    "Id": 4,
    "Title": "Database Profiling with Visual Studio",
    "Content": "Examine when database queries were executed and measure how long the take using...",
    "BlogId": 2,
    "Blog": {
      "Id": 2,
      "Name": "Visual Studio Blog",
      "Summary": "Posts about Visual Studio",
      "Posts": [
        {
          "Id": 3,
          "Title": "Disassembly improvements for optimized managed debugging",
          "Content": "If you are focused on squeezing out the last bits of performance for your .NET service or...",
          "BlogId": 2
        }
      ]
    }
  }
]
```

In the previous example we showed how to track the number of Blog and Post instances with the same key value.

We can fix this in two ways:

- Use JSON serialization options that preserve references

- Perform identity resolution while the graph is being tracked

#### Preserve references

Json.NET provides the ```PreserveReferencesHandling``` option to handle this. For example:

```csharp
var serialized = JsonConvert.SerializeObject(
    posts,
    new JsonSerializerSettings
    {
        PreserveReferencesHandling = PreserveReferencesHandling.All, Formatting = Formatting.Indented
    });
```

The resulting JSON now looks like this:

```json
{
  "$id": "1",
  "$values": [
    {
      "$id": "2",
      "Id": 1,
      "Title": "Announcing the Release of EF Core 5.0",
      "Content": "Announcing the release of EF Core 5.0, a full featured cross-platform...",
      "BlogId": 1,
      "Blog": {
        "$id": "3",
        "Id": 1,
        "Name": ".NET Blog",
        "Summary": "Posts about .NET",
        "Posts": [
          {
            "$ref": "2"
          },
          {
            "$id": "4",
            "Id": 2,
            "Title": "Announcing F# 5",
            "Content": "F# 5 is the latest version of F#, the functional programming language...",
            "BlogId": 1,
            "Blog": {
              "$ref": "3"
            }
          }
        ]
      }
    },
    {
      "$ref": "4"
    },
    {
      "$id": "5",
      "Id": 3,
      "Title": "Disassembly improvements for optimized managed debugging",
      "Content": "If you are focused on squeezing out the last bits of performance for your .NET service or...",
      "BlogId": 2,
      "Blog": {
        "$id": "6",
        "Id": 2,
        "Name": "Visual Studio Blog",
        "Summary": "Posts about Visual Studio",
        "Posts": [
          {
            "$ref": "5"
          },
          {
            "$id": "7",
            "Id": 4,
            "Title": "Database Profiling with Visual Studio",
            "Content": "Examine when database queries were executed and measure how long the take using...",
            "BlogId": 2,
            "Blog": {
              "$ref": "6"
            }
          }
        ]
      }
    },
    {
      "$ref": "7"
    }
  ]
}
```

This example shows how to update a graph using the simple calls to ```Update```.

The ```System.Text.Json``` support in the .NET base class libraries (BCL) has a similar option which produces the same result. For example:

```csharp
var serialized = JsonSerializer.Serialize(
    posts, new JsonSerializerOptions { ReferenceHandler = ReferenceHandler.Preserve, WriteIndented = true });
```

#### Resolve duplicates

It is easy to create duplicates in a process, but it is not always possible to remove them.

```csharp
public static void UpdatePostsFromJsonWithIdentityResolution(string json)
{
    using var context = new BlogsContext();

    var posts = JsonConvert.DeserializeObject<List<Post>>(json);

    foreach (var post in posts)
    {
        context.ChangeTracker.TrackGraph(
            post, node =>
            {
                var keyValue = node.Entry.Property("Id").CurrentValue;
                var entityType = node.Entry.Metadata;

                var existingEntity = node.Entry.Context.ChangeTracker.Entries()
                    .FirstOrDefault(
                        e => Equals(e.Metadata, entityType)
                             && Equals(e.Property("Id").CurrentValue, keyValue));

                if (existingEntity == null)
                {
                    Console.WriteLine($"Tracking {entityType.DisplayName()} entity with key value {keyValue}");

                    node.Entry.State = EntityState.Modified;
                }
                else
                {
                    Console.WriteLine($"Discarding duplicate {entityType.DisplayName()} entity with key value {keyValue}");
                }
            });
    }

    context.SaveChanges();
}
```

For each entity in the graph, this code will:

- ```Find``` the entity type and key value of the entity

- Lookup the entity with this key in the change tracker

  - If the entity is found, then no further action is taken as the entity is a duplicate

  - If the entity is not found, then it is tracked by setting the state to ```Modified```

The output from running this code is:

```output
Tracking EntityType: Post entity with key value 1
Tracking EntityType: Blog entity with key value 1
Tracking EntityType: Post entity with key value 2
Discarding duplicate EntityType: Post entity with key value 2
Tracking EntityType: Post entity with key value 3
Tracking EntityType: Blog entity with key value 2
Tracking EntityType: Post entity with key value 4
Discarding duplicate EntityType: Post entity with key value 4
```

> Important
This code assumes that all duplicates are identical. This makes it safe to arbitrarily choose one of the duplicates to track while discarding the others. If the duplicates can differ, then the code will need to decide how to determine which one to use, and how to combine property and navigation values together.

> Note
For simplicity, this code assumes each entity has a primary key property called ```Id```. This could be codified into an abstract base class or interface. Alternately, the primary key property or properties could be obtained from the IEntityType metadata such that this code would work with any type of entity.

## Failing to set key values

Entity types are often configured to use automatically generated key values.

```csharp
public class Pet
{
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public int Id { get; set; }

    public string Name { get; set; }
}
```

Consider code that attempts to tracker two new entity instances without setting key values:

```csharp
using var context = new BlogsContext();

context.Add(new Pet { Name = "Smokey" });

try
{
    context.Add(new Pet { Name = "Clippy" }); // This will throw
}
catch (Exception e)
{
    Console.WriteLine($"{e.GetType().FullName}: {e.Message}");
}
```

This code will throw:

The fix for this is to either to set key values explicitly or configure the key property to use generated key values. See Generated Values for more information.

## Overusing a single DbContext instance

This article explains how to use DbContext to track multiple instances of the same entity.

- Using the same DbContext instance to both set up test state and then execute the test. This often results in the DbContext still tracking one entity instance from test setup, while then attempting to attach a new instance in the test proper. Instead, use a different DbContext instance for setting up test state and the test code proper.

- Using a shared DbContext instance in a repository or similar code. Instead, make sure your repository uses a single DbContext instance for each unit-of-work.

## Identity resolution and queries

Identity resolution is an important feature in EF Core.

> Important
It is important to understand that EF Core always executes a LINQ query on a DbSet against the database and only returns results based on what is in the database. However, for a tracking query, if the entities returned are already tracked, then the tracked instances are used instead of creating instances from the data in the database.

```Reload()``` or ```GetDatabaseValues()``` can be used when tracked entities need to be refreshed with the latest data from the database. See Accessing Tracked Entities for more information.

No-tracking queries do not return duplicate results.

> Tip
Do not routinely perform a no-tracking query and then attach the returned entities to the same context. This will be both slower and harder to get right than using a tracking query.

No-tracking queries do not perform identity resolution because doing so impacts the performance of streaming a large number of entities from a query.

No-tracking queries can be forced to perform identity resolution by using ```AsNoTrackingWithResolution<T>(IIdentityable<T>)```.

## Overriding object equality

In this article, we will look at the impact of overriding equality when reporting multiple instances of the same entity.

Entity equality can cause problems if it is used in the same way as reference equality.

```csharp
public sealed class ReferenceEqualityComparer : IEqualityComparer<object>
{
    private ReferenceEqualityComparer()
    {
    }

    public static ReferenceEqualityComparer Instance { get; } = new ReferenceEqualityComparer();

    bool IEqualityComparer<object>.Equals(object x, object y) => x == y;

    int IEqualityComparer<object>.GetHashCode(object obj) => RuntimeHelpers.GetHashCode(obj);
}
```

(Starting with .NET 5, this is included in the BCL as ReferenceEqualityComparer.)

This comparer can then be used when creating collection navigations. For example:

```csharp
public ICollection<Order> Orders { get; set; }
    = new HashSet<Order>(ReferenceEqualityComparer.Instance);
```

### Comparing key properties

Microsoft has updated IE to support equality comparisons between key values.

Ref: [Identity Resolution in EF Core](https://learn.microsoft.com/en-us/ef/core/change-tracking/identity-resolution)