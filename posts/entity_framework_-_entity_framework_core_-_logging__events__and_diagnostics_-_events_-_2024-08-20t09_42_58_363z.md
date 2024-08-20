---
title: Entity Framework - Entity Framework Core - Logging, events, and diagnostics - Events
published: true
date: 2024-08-20 09:42:58
tags: Summary, EFCore
description: Entity Framework Core (EF Core) exposes .NET events to act as callbacks when certain things happen in the EF Core code.
image:
---

## In this article

<blockquote class="tip">Tip
You can download the events sample from GitHub.</blockquote>

Entity Framework Core (EF Core) exposes .NET events to act as callbacks when certain things happen in the EF Core code.

Events are registered per ```DbContext``` instance. Use a diagnostic listener to get the same information but for all ```DbContext``` instances in the process.

## Events raised by EF Core

The following events are raised by EF Core:

<table><thead>
<tr>
<th style="text-align: left;">Event</th>
<th>When raised</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.dbcontext.savingchanges#microsoft-entityframeworkcore-dbcontext-savingchanges" class="no-loc" data-linktype="absolute-path">DbContext.SavingChanges</a></td>
<td>At the start of <a href="/en-us/dotnet/api/microsoft.entityframeworkcore.dbcontext.savechanges" class="no-loc" data-linktype="absolute-path">SaveChanges</a> or <a href="/en-us/dotnet/api/microsoft.entityframeworkcore.dbcontext.savechangesasync" class="no-loc" data-linktype="absolute-path">SaveChangesAsync</a></td>
</tr>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.dbcontext.savedchanges#microsoft-entityframeworkcore-dbcontext-savedchanges" class="no-loc" data-linktype="absolute-path">DbContext.SavedChanges</a></td>
<td>At the end of a successful <a href="/en-us/dotnet/api/microsoft.entityframeworkcore.dbcontext.savechanges" class="no-loc" data-linktype="absolute-path">SaveChanges</a> or <a href="/en-us/dotnet/api/microsoft.entityframeworkcore.dbcontext.savechangesasync" class="no-loc" data-linktype="absolute-path">SaveChangesAsync</a></td>
</tr>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.dbcontext.savechangesfailed#microsoft-entityframeworkcore-dbcontext-savechangesfailed" class="no-loc" data-linktype="absolute-path">DbContext.SaveChangesFailed</a></td>
<td>At the end of a failed <a href="/en-us/dotnet/api/microsoft.entityframeworkcore.dbcontext.savechanges" class="no-loc" data-linktype="absolute-path">SaveChanges</a> or <a href="/en-us/dotnet/api/microsoft.entityframeworkcore.dbcontext.savechangesasync" class="no-loc" data-linktype="absolute-path">SaveChangesAsync</a></td>
</tr>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.changetracking.changetracker.tracked#microsoft-entityframeworkcore-changetracking-changetracker-tracked" class="no-loc" data-linktype="absolute-path">ChangeTracker.Tracked</a></td>
<td>When an entity is tracked by the context</td>
</tr>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.changetracking.changetracker.statechanged#microsoft-entityframeworkcore-changetracking-changetracker-statechanged" class="no-loc" data-linktype="absolute-path">ChangeTracker.StateChanged</a></td>
<td>When a tracked entity changes its state</td>
</tr>
</tbody></table>

### Example: Timestamp state changes

Each entity tracked by a ```DbContext``` has an EntityState. For example, the ```Added``` state indicates that the entity will be inserted into the database.

This example uses the ```Tracked``` and ```StateChanged``` events to detect when an entity changes state.

The entity types in this example implement an interface that defines the timestamp properties:

```csharp
public interface IHasTimestamps
{
    DateTime? Added { get; set; }
    DateTime? Deleted { get; set; }
    DateTime? Modified { get; set; }
}
```

A method on the application's ```DbContext``` can then set timestamps for any entity that implements this interface:

```csharp
private static void UpdateTimestamps(object sender, EntityEntryEventArgs e)
{
    if (e.Entry.Entity is IHasTimestamps entityWithTimestamps)
    {
        switch (e.Entry.State)
        {
            case EntityState.Deleted:
                entityWithTimestamps.Deleted = DateTime.UtcNow;
                Console.WriteLine($"Stamped for delete: {e.Entry.Entity}");
                break;
            case EntityState.Modified:
                entityWithTimestamps.Modified = DateTime.UtcNow;
                Console.WriteLine($"Stamped for update: {e.Entry.Entity}");
                break;
            case EntityState.Added:
                entityWithTimestamps.Added = DateTime.UtcNow;
                Console.WriteLine($"Stamped for insert: {e.Entry.Entity}");
                break;
        }
    }
}
```

This method has the appropriate signature to use as an event handler for both the ```Tracked``` and ```StateChanged``` events.

```csharp
public BlogsContext()
{
    ChangeTracker.StateChanged += UpdateTimestamps;
    ChangeTracker.Tracked += UpdateTimestamps;
}
```

Both events are needed because new entities fire ```Tracked``` events when they are first tracked. ```StateChanged``` events are only fired for entities that change state while they are already being tracked.

The sample for this example contains a simple console application that makes changes to the blogging database:

```csharp
using (var context = new BlogsContext())
{
    context.Database.EnsureDeleted();
    context.Database.EnsureCreated();

    context.Add(
        new Blog
        {
            Id = 1,
            Name = "EF Blog",
            Posts = { new Post { Id = 1, Title = "EF Core 3.1!" }, new Post { Id = 2, Title = "EF Core 5.0!" } }
        });

    context.SaveChanges();
}

using (var context = new BlogsContext())
{
    var blog = context.Blogs.Include(e => e.Posts).Single();

    blog.Name = "EF Core Blog";
    context.Remove(blog.Posts.First());
    blog.Posts.Add(new Post { Id = 3, Title = "EF Core 6.0!" });

    context.SaveChanges();
}
```

The output from this code shows the state changes happening and the timestamps being applied:

```output
Stamped for insert: Blog 1 Added on: 10/15/2020 11:01:26 PM
Stamped for insert: Post 1 Added on: 10/15/2020 11:01:26 PM
Stamped for insert: Post 2 Added on: 10/15/2020 11:01:26 PM
Stamped for delete: Post 1 Added on: 10/15/2020 11:01:26 PM Deleted on: 10/15/2020 11:01:26 PM
Stamped for update: Blog 1 Added on: 10/15/2020 11:01:26 PM Modified on: 10/15/2020 11:01:26 PM
Stamped for insert: Post 3 Added on: 10/15/2020 11:01:26 PM
```

Ref: [.NET Events in EF Core](https://learn.microsoft.com/en-us/ef/core/logging-events-diagnostics/events)