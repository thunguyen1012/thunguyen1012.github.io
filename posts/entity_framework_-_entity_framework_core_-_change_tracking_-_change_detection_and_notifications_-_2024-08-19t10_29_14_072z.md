---
title: Entity Framework - Entity Framework Core - Change tracking - Change detection and notifications
published: true
date: 2024-08-19 10:29:14
tags: Summary, EFCore
description: This document describes how to track changes made to entities in a DbContext.
image:
---

## In this article

This document describes how to track changes made to entities in a DbContext.

This document covers how to use property notifications or change-tracking proxies to force immediate detection of changes in the DbContext.

> Tip
You can run and debug into all the code in this document by downloading the sample code from GitHub.

## Snapshot change tracking

This example shows how to change the property values of an entity when it is first tracked by a DbContext instance.

Changes to an application's database are detected by the application.

### When change detection is needed

In this article, I'm going to show you how to make changes to a website without using EF Core.

```csharp
using var context = new BlogsContext();
var blog = context.Blogs.Include(e => e.Posts).First(e => e.Name == ".NET Blog");

// Change a property value
blog.Name = ".NET Blog (Updated!)";

// Add a new entity to a navigation
blog.Posts.Add(
    new Post
    {
        Title = "What’s next for System.Text.Json?", Content = ".NET 5.0 was released recently and has come with many..."
    });

Console.WriteLine(context.ChangeTracker.DebugView.LongView);
context.ChangeTracker.DetectChanges();
Console.WriteLine(context.ChangeTracker.DebugView.LongView);
```

How do I debug changes made to an entity?

```output
Blog {Id: 1} Unchanged
  Id: 1 PK
  Name: '.NET Blog (Updated!)' Originally '.NET Blog'
  Posts: [{Id: 1}, {Id: 2}, <not found>]
Post {Id: 1} Unchanged
  Id: 1 PK
  BlogId: 1 FK
  Content: 'Announcing the release of EF Core 5.0, a full featured cross...'
  Title: 'Announcing the Release of EF Core 5.0'
  Blog: {Id: 1}
Post {Id: 2} Unchanged
  Id: 2 PK
  BlogId: 1 FK
  Content: 'F# 5 is the latest version of F#, the functional programming...'
  Title: 'Announcing F# 5'
  Blog: {Id: 1}
```

The astute will notice that the debug view of the blog has not yet been updated.

Contrast this with the debug view after calling DetectChanges:

```output
Blog {Id: 1} Modified
  Id: 1 PK
  Name: '.NET Blog (Updated!)' Modified Originally '.NET Blog'
  Posts: [{Id: 1}, {Id: 2}, {Id: -2147482643}]
Post {Id: -2147482643} Added
  Id: -2147482643 PK Temporary
  BlogId: 1 FK
  Content: '.NET 5.0 was released recently and has come with many...'
  Title: 'What's next for System.Text.Json?'
  Blog: {Id: 1}
Post {Id: 1} Unchanged
  Id: 1 PK
  BlogId: 1 FK
  Content: 'Announcing the release of EF Core 5.0, a full featured cross...'
  Title: 'Announcing the Release of EF Core 5.0'
  Blog: {Id: 1}
Post {Id: 2} Unchanged
  Id: 2 PK
  BlogId: 1 FK
  Content: 'F# 5 is the latest version of F#, the functional programming...'
  Title: 'Announcing F# 5'
  Blog: {Id: 1}
```

Now the blog is correctly marked as ```Modified``` and the new post has been detected and is tracked as ```Added```.

In this section we are going to look at how to make changes to a property and navigation on an entity instance.

Contrast this to the following code which modifies the entities in the same way, but this time using EF Core methods:

```csharp
using var context = new BlogsContext();
var blog = context.Blogs.Include(e => e.Posts).First(e => e.Name == ".NET Blog");

// Change a property value
context.Entry(blog).Property(e => e.Name).CurrentValue = ".NET Blog (Updated!)";

// Add a new entity to the DbContext
context.Add(
    new Post
    {
        Blog = blog,
        Title = "What’s next for System.Text.Json?",
        Content = ".NET 5.0 was released recently and has come with many..."
    });

Console.WriteLine(context.ChangeTracker.DebugView.LongView);
```

This example shows how EF Core can detect changes made to an entity by a method called ```DbContext.Add```.

> Tip
Don't attempt to avoid detecting changes by always using EF Core methods to make entity changes. Doing so is often more cumbersome and performs less well than making changes to entities in the normal way. The intention of this document is to inform as to when detecting changes is needed and when it is not. The intention is not to encourage avoidance of change detection.

### Methods that automatically detect changes

```DetectChanges()``` is called automatically by methods where doing so is likely to impact the results. These methods are:

- ```DbContext.SaveChanges``` and ```DbContext.SaveChangesAsync```, to ensure that all changes are detected before updating the database.

- ```ChangeTracker.Entries()``` and ```ChangeTracker.Entries<TEntity>()```, to ensure entity states and modified properties are up-to-date.

- ```ChangeTracker.HasChanges()```, to ensure that the result is accurate.

- ```ChangeTracker.CascadeChanges()```, to ensure correct entity states for principal/parent entities before cascading.

- ```DbSet<TEntity>.Local```, to ensure that the tracked graph is up-to-date.

There are also some places where detection of changes happens on only a single entity instance, rather than on the entire graph of tracked entities. These places are:

- When using ```DbContext.Entry```, to ensure that the entity's state and modified properties are up-to-date.

- When using ```EntityEntry``` methods such as ```Property```, ```Collection```, ```Reference``` or ```Member``` to ensure property modifications, current values, etc. are up-to-date.

- When a dependent/child entity is going to be deleted because a required relationship has been severed. This detects when an entity should not be deleted because it has been re-parented.

Local detection of changes for a single entity can be triggered explicitly by calling ```EntityEntry.DetectChanges()```.

> Note
Local detect changes can miss some changes that a full detection would find. This happens when cascading actions resulting from undetected changes to other entities have an impact on the entity in question. In such situations the application may need to force a full scan of all entities by explicitly calling ```ChangeTracker.DetectChanges()```.

### Disabling automatic change detection

Changes to entities can be automatically detected by ChangeTracker.

```csharp
public override int SaveChanges()
{
    foreach (var entityEntry in ChangeTracker.Entries<PostTag>()) // Detects changes automatically
    {
        if (entityEntry.State == EntityState.Added)
        {
            entityEntry.Entity.TaggedBy = "ajcvickers";
            entityEntry.Entity.TaggedOn = DateTime.Now;
        }
    }

    try
    {
        ChangeTracker.AutoDetectChangesEnabled = false;
        return base.SaveChanges(); // Avoid automatically detecting changes again here
    }
    finally
    {
        ChangeTracker.AutoDetectChangesEnabled = true;
    }
}
```

This code shows how to disable automatic change detection when calling down into the base SaveChanges method.

> Tip
Do not assume that your code must disable automatic change detection to perform well. This is only needed when profiling an application tracking many entities indicates that performance of change detection is an issue.

### Detecting changes and value conversions

To use snapshot change tracking with an entity type, EF Core must be able to:

- Make a snapshot of each property value when the entity is tracked

- Compare this value to the current value of the property

- Generate a hash code for the value

When a value converter is used to map a property to a database it must specify how to perform these actions.

## Notification entities

EF Core supports a number of tracking and notification methods.

### Implementing notification entities

In our series of articles on Microsoft's .NET platform, we look at some of the ways that Notification entities can be used.

```csharp
public class Blog : INotifyPropertyChanging, INotifyPropertyChanged
{
    public event PropertyChangingEventHandler PropertyChanging;
    public event PropertyChangedEventHandler PropertyChanged;

    private int _id;

    public int Id
    {
        get => _id;
        set
        {
            PropertyChanging?.Invoke(this, new PropertyChangingEventArgs(nameof(Id)));
            _id = value;
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Id)));
        }
    }

    private string _name;

    public string Name
    {
        get => _name;
        set
        {
            PropertyChanging?.Invoke(this, new PropertyChangingEventArgs(nameof(Name)));
            _name = value;
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Name)));
        }
    }

    public IList<Post> Posts { get; } = new ObservableCollection<Post>();
}
```

EF Core ships with an ```ObservableHashSet<T>``` implementation that has more efficient lookups at the expense of stable ordering. EF Core also ships with an ```ObservableHashSet<T>``` implementation that has more efficient lookups at the expense of stable ordering.

Most of this notification code is typically moved into an unmapped base class. For example:

```csharp
public class Blog : NotifyingEntity
{
    private int _id;

    public int Id
    {
        get => _id;
        set => SetWithNotify(value, out _id);
    }

    private string _name;

    public string Name
    {
        get => _name;
        set => SetWithNotify(value, out _name);
    }

    public IList<Post> Posts { get; } = new ObservableCollection<Post>();
}

public abstract class NotifyingEntity : INotifyPropertyChanging, INotifyPropertyChanged
{
    protected void SetWithNotify<T>(T value, out T field, [CallerMemberName] string propertyName = "")
    {
        NotifyChanging(propertyName);
        field = value;
        NotifyChanged(propertyName);
    }

    public event PropertyChangingEventHandler PropertyChanging;
    public event PropertyChangedEventHandler PropertyChanged;

    private void NotifyChanged(string propertyName)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));

    private void NotifyChanging(string propertyName)
        => PropertyChanging?.Invoke(this, new PropertyChangingEventArgs(propertyName));
}
```

### Configuring notification entities

 ```INotifyPropertyChanged``` and ```INotifyPropertyChanging``` are interfaces used by EF Core to notify users of changes to their properties.

Instead, EF Core must be configured to use these notification entities. This is usually done for all entity types by calling ```ModelBuilder.HasChangeTrackingStrategy```. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.HasChangeTrackingStrategy(ChangeTrackingStrategy.ChangingAndChangedNotifications);
}
```

The following example shows how to use the DetectChanges strategy to track changes in a notification entity.

Full notification change tracking requires that both ```INotifyPropertyChanging``` and ```INotifyPropertyChanged``` are implemented.

The different ChangeTrackingStrategy values are summarized in the following table.

<table><thead>
<tr>
<th style="text-align: left;">ChangeTrackingStrategy</th>
<th>Interfaces needed</th>
<th>Needs DetectChanges</th>
<th>Snapshots original values</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">Snapshot</td>
<td>None</td>
<td>Yes</td>
<td>Yes</td>
</tr>
<tr>
<td style="text-align: left;">ChangedNotifications</td>
<td>INotifyPropertyChanged</td>
<td>No</td>
<td>Yes</td>
</tr>
<tr>
<td style="text-align: left;">ChangingAndChangedNotifications</td>
<td>INotifyPropertyChanged and ```INotifyPropertyChanging```</td>
<td>No</td>
<td>No</td>
</tr>
<tr>
<td style="text-align: left;">ChangingAndChangedNotificationsWithOriginalValues</td>
<td>INotifyPropertyChanged and ```INotifyPropertyChanging```</td>
<td>No</td>
<td>Yes</td>
</tr>
</tbody></table>

### Using notification entities

Notification entities behave like any other entities, except that making changes to the entity instances do not require a call to ```ChangeTracker.DetectChanges()``` to detect these changes. For example:

```csharp
using var context = new BlogsContext();
var blog = context.Blogs.Include(e => e.Posts).First(e => e.Name == ".NET Blog");

// Change a property value
blog.Name = ".NET Blog (Updated!)";

// Add a new entity to a navigation
blog.Posts.Add(
    new Post
    {
        Title = "What’s next for System.Text.Json?", Content = ".NET 5.0 was released recently and has come with many..."
    });

Console.WriteLine(context.ChangeTracker.DebugView.LongView);
```

When notification entities are used, changes to entities are detected immediately.

```output
Blog {Id: 1} Modified
  Id: 1 PK
  Name: '.NET Blog (Updated!)' Modified
  Posts: [{Id: 1}, {Id: 2}, {Id: -2147482643}]
Post {Id: -2147482643} Added
  Id: -2147482643 PK Temporary
  BlogId: 1 FK
  Content: '.NET 5.0 was released recently and has come with many...'
  Title: 'What's next for System.Text.Json?'
  Blog: {Id: 1}
Post {Id: 1} Unchanged
  Id: 1 PK
  BlogId: 1 FK
  Content: 'Announcing the release of EF Core 5.0, a full featured cross...'
  Title: 'Announcing the Release of EF Core 5.0'
  Blog: {Id: 1}
Post {Id: 2} Unchanged
  Id: 2 PK
  BlogId: 1 FK
  Content: 'F# 5 is the latest version of F#, the functional programming...'
  Title: 'Announcing F# 5'
  Blog: {Id: 1}
```

## Change-tracking proxies

EF Core is a plug-in for Microsoft's Visual Studio that allows you to implement change-tracking in your application.

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder.UseChangeTrackingProxies();
```

A dynamic proxy is a component of the ```Castle.Core``` framework that can be used to create collections.

```csharp
public class Blog
{
    public virtual int Id { get; set; }
    public virtual string Name { get; set; }

    public virtual IList<Post> Posts { get; } = new ObservableCollection<Post>();
}

public class Post
{
    public virtual int Id { get; set; }
    public virtual string Title { get; set; }
    public virtual string Content { get; set; }

    public virtual int BlogId { get; set; }
    public virtual Blog Blog { get; set; }
}
```

EF Core has a change-tracking proxy that can be used to track changes made to Entity Framework entities.

The following examples show how to create proxy instances for entities in the EF Core database.

```csharp
using var context = new BlogsContext();
var blog = context.Blogs.Include(e => e.Posts).First(e => e.Name == ".NET Blog");

// Change a property value
blog.Name = ".NET Blog (Updated!)";

// Add a new entity to a navigation
blog.Posts.Add(
    context.CreateProxy<Post>(
        p =>
        {
            p.Title = "What’s next for System.Text.Json?";
            p.Content = ".NET 5.0 was released recently and has come with many...";
        }));

Console.WriteLine(context.ChangeTracker.DebugView.LongView);
```

## Change tracking events

EF Core fires the ChangeTracker.Tracked event when an entity is tracked for the first time.

> Note
The ```StateChanged``` event is not fired when an entity is first tracked, even though the state has changed from ```Detached``` to one of the other states. Make sure to listen for both ```StateChanged``` and ```Tracked``` events to get all relevant notifications.

Ref: [Change Detection and Notifications](https://learn.microsoft.com/en-us/ef/core/change-tracking/change-detection)