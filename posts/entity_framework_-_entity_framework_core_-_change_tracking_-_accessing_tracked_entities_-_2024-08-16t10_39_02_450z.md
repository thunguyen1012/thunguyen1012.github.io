---
title: Entity Framework - Entity Framework Core - Change tracking - Accessing tracked entities
published: true
date: 2024-08-16 10:39:02
tags: Summary, EFCore
description: There are four main APIs for accessing entities tracked by a DbContext:
image:
---

## In this article

There are four main APIs for accessing entities tracked by a DbContext:

- ```DbContext.Entry``` returns an ```EntityEntry<TEntity>``` instance for a given entity instance.

- ```ChangeTracker.Entries``` returns ```EntityEntry<TEntity>``` instances for all tracked entities, or for all tracked entities of a given type.

- ```DbContext.Find```, ```DbContext.FindAsync```, ```DbSet<TEntity>.Find```, and ```DbSet<TEntity>.FindAsync``` find a single entity by primary key, first looking in tracked entities, and then querying the database if needed.

- ```DbSet<TEntity>.Local``` returns actual entities (not EntityEntry instances) for entities of the entity type represented by the DbSet.

Each of these is described in more detail in the sections below.

> Tip
This document assumes that entity states and the basics of EF Core change tracking are understood. See Change Tracking in EF Core for more information on these topics.

> Tip
You can run and debug into all the code in this document by downloading the sample code from GitHub.

## Using ```DbContext.Entry``` and ```EntityEntry``` instances

For each tracked entity, Entity Framework Core (EF Core) keeps track of:

- The overall state of the entity. This is one of ```Unchanged```, ```Modified```, ```Added```, or ```Deleted```; see Change Tracking in EF Core for more information.

- The relationships between tracked entities. For example, the blog to which a post belongs.

- The "current values" of properties.

- The "original values" of properties, when this information is available. Original values are the property values that existed when entity was queried from the database.

- Which property values have been modified since they were queried.

- Other information about property values, such as whether or not the value is temporary.

Passing an entity instance to ```DbContext.Entry``` results in an ```EntityEntry<TEntity>``` providing access to this information for the given entity. For example:

```csharp
using var context = new BlogsContext();

var blog = context.Blogs.Single(e => e.Id == 1);
var entityEntry = context.Entry(blog);
```

The following sections show how to use an EntityEntry to access and manipulate entity state, as well as the state of the entity's properties and navigations.

### Working with the entity

The most common use of ```EntityEntry<TEntity>``` is to access the current ```EntityState``` of an entity. For example:

```csharp
var currentState = context.Entry(blog).State;
if (currentState == EntityState.Unchanged)
{
    context.Entry(blog).State = EntityState.Modified;
}
```

The ```EntityEntry``` method can be used to start tracking entities.

```csharp
var newBlog = new Blog();
Debug.Assert(context.Entry(newBlog).State == EntityState.Detached);

context.Entry(newBlog).State = EntityState.Added;
Debug.Assert(context.Entry(newBlog).State == EntityState.Added);
```

> Tip
Unlike in EF6, setting the state of an individual entity will not cause all connected entities to be tracked. This makes setting the state this way a lower-level operation than calling ```Add```, ```Attach```, or ```Update```, which operate on an entire graph of entities.

The following table summarizes ways to use an EntityEntry to work with an entire entity:

<table><thead>
<tr>
<th style="text-align: left;">EntityEntry member</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.changetracking.entityentry.state#microsoft-entityframeworkcore-changetracking-entityentry-state" class="no-loc" data-linktype="absolute-path">EntityEntry.State</a></td>
<td>Gets and sets the <a href="/en-us/dotnet/api/microsoft.entityframeworkcore.entitystate" class="no-loc" data-linktype="absolute-path">EntityState</a> of the entity.</td>
</tr>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.changetracking.entityentry.entity#microsoft-entityframeworkcore-changetracking-entityentry-entity" class="no-loc" data-linktype="absolute-path">EntityEntry.Entity</a></td>
<td>Gets the entity instance.</td>
</tr>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.changetracking.entityentry.context#microsoft-entityframeworkcore-changetracking-entityentry-context" class="no-loc" data-linktype="absolute-path">EntityEntry.Context</a></td>
<td>The <a href="/en-us/dotnet/api/microsoft.entityframeworkcore.dbcontext" class="no-loc" data-linktype="absolute-path">DbContext</a> that is tracking this entity.</td>
</tr>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.changetracking.entityentry.metadata#microsoft-entityframeworkcore-changetracking-entityentry-metadata" class="no-loc" data-linktype="absolute-path">EntityEntry.Metadata</a></td>
<td><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.metadata.ientitytype" class="no-loc" data-linktype="absolute-path">IEntityType</a> metadata for the type of entity.</td>
</tr>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.changetracking.entityentry.iskeyset#microsoft-entityframeworkcore-changetracking-entityentry-iskeyset" class="no-loc" data-linktype="absolute-path">EntityEntry.IsKeySet</a></td>
<td>Whether or not the entity has had its key value set.</td>
</tr>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.changetracking.entityentry.reload#microsoft-entityframeworkcore-changetracking-entityentry-reload" class="no-loc" data-linktype="absolute-path">EntityEntry.Reload()</a></td>
<td>Overwrites property values with values read from the database.</td>
</tr>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.changetracking.entityentry.detectchanges#microsoft-entityframeworkcore-changetracking-entityentry-detectchanges" class="no-loc" data-linktype="absolute-path">EntityEntry.DetectChanges()</a></td>
<td>Forces detection of changes for this entity only; see <a href="change-detection" data-linktype="relative-path">Change Detection and Notifications</a>.</td>
</tr>
</tbody></table>

### Working with a single property

Several overloads of ```EntityEntry<TEntity>.Property``` allow access to information about an individual property of an entity. For example, using a strongly-typed, fluent-like API:

```csharp
PropertyEntry<Blog, string> propertyEntry = context.Entry(blog).Property(e => e.Name);
```

The property name can instead be passed as a string. For example:

```csharp
PropertyEntry<Blog, string> propertyEntry = context.Entry(blog).Property<string>("Name");
```

The returned ```PropertyEntry<TEntity,TProperty>``` can then be used to access information about the property. For example, it can be used to get and set the current value of the property on this entity:

```csharp
string currentValue = context.Entry(blog).Property(e => e.Name).CurrentValue;
context.Entry(blog).Property(e => e.Name).CurrentValue = "1unicorn2";
```

The following examples show how to obtain entity and property values using the Property method.

```csharp
PropertyEntry propertyEntry = context.Entry(blog).Property("Name");
```

This allows access to property information for any property regardless of its type, at the expense of boxing value types. For example:

```csharp
object blog = context.Blogs.Single(e => e.Id == 1);

object currentValue = context.Entry(blog).Property("Name").CurrentValue;
context.Entry(blog).Property("Name").CurrentValue = "1unicorn2";
```

The following table summarizes property information exposed by PropertyEntry:

<table><thead>
<tr>
<th style="text-align: left;">PropertyEntry member</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.changetracking.propertyentry-2.currentvalue#microsoft-entityframeworkcore-changetracking-propertyentry-2-currentvalue" class="no-loc" data-linktype="absolute-path">PropertyEntry&lt;TEntity,TProperty&gt;.CurrentValue</a></td>
<td>Gets and sets the current value of the property.</td>
</tr>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.changetracking.propertyentry-2.originalvalue#microsoft-entityframeworkcore-changetracking-propertyentry-2-originalvalue" class="no-loc" data-linktype="absolute-path">PropertyEntry&lt;TEntity,TProperty&gt;.OriginalValue</a></td>
<td>Gets and sets the original value of the property, if available.</td>
</tr>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.changetracking.propertyentry-2.entityentry#microsoft-entityframeworkcore-changetracking-propertyentry-2-entityentry" class="no-loc" data-linktype="absolute-path">PropertyEntry&lt;TEntity,TProperty&gt;.EntityEntry</a></td>
<td>A back reference to the <a href="/en-us/dotnet/api/microsoft.entityframeworkcore.changetracking.entityentry-1" class="no-loc" data-linktype="absolute-path">EntityEntry&lt;TEntity&gt;</a> for the entity.</td>
</tr>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.changetracking.propertyentry.metadata#microsoft-entityframeworkcore-changetracking-propertyentry-metadata" class="no-loc" data-linktype="absolute-path">PropertyEntry.Metadata</a></td>
<td><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.metadata.iproperty" class="no-loc" data-linktype="absolute-path">IProperty</a> metadata for the property.</td>
</tr>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.changetracking.propertyentry.ismodified#microsoft-entityframeworkcore-changetracking-propertyentry-ismodified" class="no-loc" data-linktype="absolute-path">PropertyEntry.IsModified</a></td>
<td>Indicates whether this property is marked as modified, and allows this state to be changed.</td>
</tr>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.changetracking.propertyentry.istemporary#microsoft-entityframeworkcore-changetracking-propertyentry-istemporary" class="no-loc" data-linktype="absolute-path">PropertyEntry.IsTemporary</a></td>
<td>Indicates whether this property is marked as <a href="miscellaneous#temporary-values#temporary-values" data-linktype="relative-path">temporary</a>, and allows this state to be changed.</td>
</tr>
</tbody></table>

Notes:

- The original value of a property is the value that the property had when the entity was queried from the database. However, original values are not available if the entity was disconnected and then explicitly attached to another DbContext, for example with ```Attach``` or ```Update```. In this case, the original value returned will be the same as the current value.

- ```SaveChanges``` will only update properties marked as modified. Set IsModified to true to force EF Core to update a given property value, or set it to false to prevent EF Core from updating the property value.

- Temporary values are typically generated by EF Core value generators. Setting the current value of a property will replace the temporary value with the given value and mark the property as not temporary. Set IsTemporary to true to force a value to be temporary even after it has been explicitly set.

### Working with a single navigation

Several overloads of ```EntityEntry<TEntity>.Reference```, ```EntityEntry<TEntity>.Collection```, and ```EntityEntry.Navigation``` allow access to information about an individual navigation.

Reference navigations point to the "one" sides of one-to-many relationships, and both sides of one-to-one relationships.

```csharp
ReferenceEntry<Post, Blog> referenceEntry1 = context.Entry(post).Reference(e => e.Blog);
ReferenceEntry<Post, Blog> referenceEntry2 = context.Entry(post).Reference<Blog>("Blog");
ReferenceEntry referenceEntry3 = context.Entry(post).Reference("Blog");
```

Navigations can be collections of related entities when used for the "many" sides of one-to-many relationships.

```csharp
CollectionEntry<Blog, Post> collectionEntry1 = context.Entry(blog).Collection(e => e.Posts);
CollectionEntry<Blog, Post> collectionEntry2 = context.Entry(blog).Collection<Post>("Posts");
CollectionEntry collectionEntry3 = context.Entry(blog).Collection("Posts");
```

navigations can be accessed using the ```EntityEntry.Navigation``` method.

```csharp
NavigationEntry navigationEntry = context.Entry(blog).Navigation("Posts");
```

The following table summarizes ways to use ```ReferenceEntry<TEntity,TProperty>```, ```CollectionEntry<TEntity,TRelatedEntity>```, and NavigationEntry:

<table><thead>
<tr>
<th style="text-align: left;">NavigationEntry member</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.changetracking.memberentry.currentvalue#microsoft-entityframeworkcore-changetracking-memberentry-currentvalue" class="no-loc" data-linktype="absolute-path">MemberEntry.CurrentValue</a></td>
<td>Gets and sets the current value of the navigation. This is the entire collection for collection navigations.</td>
</tr>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.changetracking.navigationentry.metadata#microsoft-entityframeworkcore-changetracking-navigationentry-metadata" class="no-loc" data-linktype="absolute-path">NavigationEntry.Metadata</a></td>
<td><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.metadata.inavigationbase" class="no-loc" data-linktype="absolute-path">INavigationBase</a> metadata for the navigation.</td>
</tr>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.changetracking.navigationentry.isloaded#microsoft-entityframeworkcore-changetracking-navigationentry-isloaded" class="no-loc" data-linktype="absolute-path">NavigationEntry.IsLoaded</a></td>
<td>Gets or sets a value indicating whether the related entity or collection has been fully loaded from the database.</td>
</tr>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.changetracking.navigationentry.load#microsoft-entityframeworkcore-changetracking-navigationentry-load" class="no-loc" data-linktype="absolute-path">NavigationEntry.Load()</a></td>
<td>Loads the related entity or collection from the database; see <a href="../querying/related-data/explicit" data-linktype="relative-path">Explicit Loading of Related Data</a>.</td>
</tr>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.changetracking.navigationentry.query#microsoft-entityframeworkcore-changetracking-navigationentry-query" class="no-loc" data-linktype="absolute-path">NavigationEntry.Query()</a></td>
<td>The query EF Core would use to load this navigation as an <code>IQueryable</code> that can be further composed; see <a href="../querying/related-data/explicit" data-linktype="relative-path">Explicit Loading of Related Data</a>.</td>
</tr>
</tbody></table>

### Working with all properties of an entity

```EntityEntry.Properties``` returns an ```IEnumerable<T>``` of ```PropertyEntry``` for every property of the entity.

```csharp
foreach (var propertyEntry in context.Entry(blog).Properties)
{
    if (propertyEntry.Metadata.ClrType == typeof(DateTime))
    {
        propertyEntry.CurrentValue = DateTime.Now;
    }
}
```

```EntityEntry``` contains several methods to get and set property values in a database.

```csharp
var currentValues = context.Entry(blog).CurrentValues;
var originalValues = context.Entry(blog).OriginalValues;
var databaseValues = context.Entry(blog).GetDatabaseValues();
```

```PropertyValues``` objects can be used to manipulate entities.

#### Setting current or original values from an entity or DTO

An entity is a property of an object.

```csharp
public class BlogDto
{
    public int Id { get; set; }
    public string Name { get; set; }
}
```

This can be used to set the current values of a tracked entity using ```PropertyValues.SetValues```:

```csharp
var blogDto = new BlogDto { Id = 1, Name = "1unicorn2" };

context.Entry(blog).CurrentValues.SetValues(blogDto);
```

An instance of the DTO ```BlogDto``` is used to set the current values of a tracked entity.

Note that properties will only be marked as modified if the value set differs from the current value.

#### Setting current or original values from a dictionary

The previous example set values from an entity or DTO instance. The same behavior is available when property values are stored as name/value pairs in a dictionary. For example:

```csharp
var blogDictionary = new Dictionary<string, object> { ["Id"] = 1, ["Name"] = "1unicorn2" };

context.Entry(blog).CurrentValues.SetValues(blogDictionary);
```

#### Setting current or original values from the database

The ```GetDatabaseValues``` class can be used to update the values of entities in a database.

```csharp
var databaseValues = context.Entry(blog).GetDatabaseValues();
context.Entry(blog).CurrentValues.SetValues(databaseValues);
context.Entry(blog).OriginalValues.SetValues(databaseValues);
```

#### Creating a cloned object containing current, original, or database values

The ```PropertyValues``` object returned from ```CurrentValues```, ```OriginalValues```, or ```GetDatabaseValues``` can be used to create a clone of the entity using ```PropertyValues.ToObject()```. For example:

```csharp
var clonedBlog = context.Entry(blog).GetDatabaseValues().ToObject();
```

Note that ```ToObject``` returns a new instance that is not tracked by the ```DbContext```. The returned object also does not have any relationships set to other entities.

An object can be cloned from another object.

### Working with all navigations of an entity

```EntityEntry.Navigation``` returns an ```IEnumerable<T>``` of ```NavigationEntry``` for every navigation of the entity.

```csharp
foreach (var navigationEntry in context.Entry(blog).Navigations)
{
    navigationEntry.Load();
}
```

### Working with all members of an entity

```EntityEntry.Member``` and ```EntityEntry.Member``` are provided for this purpose.

```csharp
foreach (var memberEntry in context.Entry(blog).Members)
{
    Console.WriteLine(
        $"Member {memberEntry.Metadata.Name} is of type {memberEntry.Metadata.ClrType.ShortDisplayName()} and has value {memberEntry.CurrentValue}");
}
```

Running this code on a blog from the sample generates the following output:

```output
Member Id is of type int and has value 1
Member Name is of type string and has value .NET Blog
Member Posts is of type IList<Post> and has value System.Collections.Generic.List`1[Post]
```

> Tip
The change tracker debug view shows information like this. The debug view for the entire change tracker is generated from the individual ```EntityEntry.DebugView``` of each tracked entity.

## ```Find``` and ```FindAsync```

```DbContext.Find```, ```DbContext.FindAsync```, ```DbSet<T>```, and ```DbSet<T>``` are designed for efficient lookup of a single entity when its primary key is known.

```csharp
using var context = new BlogsContext();

Console.WriteLine("First call to Find...");
var blog1 = context.Blogs.Find(1);

Console.WriteLine($"...found blog {blog1.Name}");

Console.WriteLine();
Console.WriteLine("Second call to Find...");
var blog2 = context.Blogs.Find(1);
Debug.Assert(blog1 == blog2);

Console.WriteLine("...returned the same instance without executing a query.");
```

The output from this code (including EF Core logging) when using SQLite is:

```output
First call to Find...
info: 12/29/2020 07:45:53.682 RelationalEventId.CommandExecuted[20101] (Microsoft.EntityFrameworkCore.Database.Command)
      Executed DbCommand (1ms) [Parameters=[@__p_0='1' (DbType = String)], CommandType='Text', CommandTimeout='30']
      SELECT "b"."Id", "b"."Name"
      FROM "Blogs" AS "b"
      WHERE "b"."Id" = @__p_0
      LIMIT 1
...found blog .NET Blog

Second call to Find...
...returned the same instance without executing a query.
```

In this example, we are trying to find an entity in a database.

Find returns null if an entity with the given key is not tracked locally and does not exist in the database.

### Composite keys

Find can also be used with composite keys. For example, consider an ```OrderLine``` entity with a composite key consisting of the order ID and the product ID:

```csharp
public class OrderLine
{
    public int OrderId { get; set; }
    public int ProductId { get; set; }

    //...
}
```

The composite key must be configured in ```DbContext.OnModelCreating``` to define the key parts and their order. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder
        .Entity<OrderLine>()
        .HasKey(e => new { e.OrderId, e.ProductId });
}
```

Notice that ```OrderId``` is the first part of the key and ```ProductId``` is the second part of the key. This order must be used when passing key values to Find. For example:

```csharp
var orderline = context.OrderLines.Find(orderId, productId);
```

## Using ```ChangeTracker.Entries``` to access all tracked entities

So far we have accessed only a single ```EntityEntry``` at a time. ```ChangeTracker.Entries()``` returns an ```EntityEntry``` for every entity currently tracked by the ```DbContext```. For example:

```csharp
using var context = new BlogsContext();
var blogs = context.Blogs.Include(e => e.Posts).ToList();

foreach (var entityEntry in context.ChangeTracker.Entries())
{
    Console.WriteLine($"Found {entityEntry.Metadata.Name} entity with ID {entityEntry.Property("Id").CurrentValue}");
}
```

This code generates the following output:

```output
Found Blog entity with ID 1
Found Post entity with ID 1
Found Post entity with ID 2
```

Notice that entries for both blogs and posts are returned. The results can instead be filtered to a specific entity type using the ```ChangeTracker.Entries<TEntity>()``` generic overload:

```csharp
foreach (var entityEntry in context.ChangeTracker.Entries<Post>())
{
    Console.WriteLine(
        $"Found {entityEntry.Metadata.Name} entity with ID {entityEntry.Property(e => e.Id).CurrentValue}");
}
```

The output from this code shows that only posts are returned:

```output
Found Post entity with ID 1
Found Post entity with ID 2
```

Also, using the generic overload returns generic ```EntityEntry<TEntity>``` instances. This is what allows that fluent-like access to the ```Id``` property in this example.

The following example shows how to implement filtering in a model.

```csharp
public interface IEntityWithKey
{
    int Id { get; set; }
}
```

Then this interface can be used to work with the key of any tracked entity in a strongly-typed manner. For example:

```csharp
foreach (var entityEntry in context.ChangeTracker.Entries<IEntityWithKey>())
{
    Console.WriteLine(
        $"Found {entityEntry.Metadata.Name} entity with ID {entityEntry.Property(e => e.Id).CurrentValue}");
}
```

## Using ```DbSet.Local``` to query tracked entities

EF Core queries are always executed on the database, and only return entities that have been saved to the database.

```DbContext``` methods can be used to load entities into the context and then work with them.

```csharp
using var context = new BlogsContext();

context.Blogs.Include(e => e.Posts).Load();

foreach (var blog in context.Blogs.Local)
{
    Console.WriteLine($"Blog: {blog.Name}");
}

foreach (var post in context.Posts.Local)
{
    Console.WriteLine($"Post: {post.Title}");
}
```

Notice that, unlike ```ChangeTracker.Entries()```, ```DbSet.Local``` returns entity instances directly. An ```EntityEntry``` can, of course, always be obtained for the returned entity by calling ```DbContext.Entry```.

### The local view

```DbSet<TEntity>.Local``` returns a view of locally tracked entities that reflects the current ```EntityState``` of those entities. Specifically, this means that:

- ```Added``` entities are included. Note that this is not the case for normal EF Core queries, since ```Added``` entities do not yet exist in the database and so are therefore never returned by a database query.

- ```Deleted``` entities are excluded. Note that this is again not the case for normal EF Core queries, since ```Deleted``` entities still exist in the database and so are returned by database queries.

 ```DbSet.Local``` is view over the data that reflects the current conceptual state of the entity graph, with ```Added``` entities included and deleted entities excluded.

This is typically the ideal view for data binding, since it presents to the user the data as they understand it based on the changes made by the application.

The following code demonstrates this by marking one post as ```Deleted``` and then adding a new post, marking it as ```Added```:

```csharp
using var context = new BlogsContext();

var posts = context.Posts.Include(e => e.Blog).ToList();

Console.WriteLine("Local view after loading posts:");

foreach (var post in context.Posts.Local)
{
    Console.WriteLine($"  Post: {post.Title}");
}

context.Remove(posts[1]);

context.Add(
    new Post
    {
        Title = "What’s next for System.Text.Json?",
        Content = ".NET 5.0 was released recently and has come with many...",
        Blog = posts[0].Blog
    });

Console.WriteLine("Local view after adding and deleting posts:");

foreach (var post in context.Posts.Local)
{
    Console.WriteLine($"  Post: {post.Title}");
}
```

The output from this code is:

```output
Local view after loading posts:
  Post: Announcing the Release of EF Core 5.0
  Post: Announcing F# 5
  Post: Announcing .NET 5.0
Local view after adding and deleting posts:
  Post: What’s next for System.Text.Json?
  Post: Announcing the Release of EF Core 5.0
  Post: Announcing .NET 5.0
```

Notice that the deleted post is removed from the local view, and the added post is included.

### Using Local to add and remove entities

```DbSet<T>.Local``` returns an instance of ```DbSet<T>```.

The local view's notifications are hooked into DbContext change tracking such that the local view stays in sync with the ```DbContext```. Specifically:

- Adding a new entity to ```DbSet.Local``` causes it to be tracked by the ```DbContext```, typically in the ```Added``` state. (If the entity already has a generated key value, then it is tracked as ```Unchanged``` instead.)

- Removing an entity from ```DbSet.Local``` causes it to be marked as ```Deleted```.

- An entity that becomes tracked by the DbContext will automatically appear in the ```DbSet.Local``` collection. For example, executing a query to bring in more entities automatically causes the local view to be updated.

- An entity that is marked as ```Deleted``` will be removed from the local collection automatically.

In this post I'm going to show you how to create a local view of a tracked entity.

```csharp
using var context = new BlogsContext();

var posts = context.Posts.Include(e => e.Blog).ToList();

Console.WriteLine("Local view after loading posts:");

foreach (var post in context.Posts.Local)
{
    Console.WriteLine($"  Post: {post.Title}");
}

context.Posts.Local.Remove(posts[1]);

context.Posts.Local.Add(
    new Post
    {
        Title = "What’s next for System.Text.Json?",
        Content = ".NET 5.0 was released recently and has come with many...",
        Blog = posts[0].Blog
    });

Console.WriteLine("Local view after adding and deleting posts:");

foreach (var post in context.Posts.Local)
{
    Console.WriteLine($"  Post: {post.Title}");
}
```

The output remains unchanged from the previous example because changes made to the local view are synced with the DbContext.

### Using the local view for Windows Forms or WPF data binding

This example shows how to create a local view of a notification collection.

- ```LocalView<TEntity>.ToObservableCollection()``` returns an ```ObservableCollection<T>``` for WPF data binding.

- ```LocalView<TEntity>.ToBindingList()``` returns a ```BindingList<T>``` for Windows Forms data binding.

For example:

```csharp
ObservableCollection<Post> observableCollection = context.Posts.Local.ToObservableCollection();
BindingList<Post> bindingList = context.Posts.Local.ToBindingList();
```

See Get Started with WPF for more information on WPF data binding with EF Core, and Get Started with Windows Forms for more information on Windows Forms data binding with EF Core.

> Tip
The local view for a given DbSet instance is created lazily when first accessed and then cached. ```LocalView``` creation itself is fast and it does not use significant memory. However, it does call ```DetectChanges```, which can be slow for large numbers of entities. The collections created by ```ToObservableCollection``` and ```ToBindingList``` are also created lazily and then cached. Both of these methods create new collections, which can be slow and use a lot of memory when thousands of entities are involved.

Ref: [Accessing Tracked Entities](https://learn.microsoft.com/en-us/ef/core/change-tracking/entity-entries)