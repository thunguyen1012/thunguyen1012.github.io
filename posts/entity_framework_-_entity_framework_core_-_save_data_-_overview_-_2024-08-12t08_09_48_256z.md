---
title: Entity Framework - Entity Framework Core - Save data - Overview
published: true
date: 2024-08-12 08:09:48
tags: Summary, EFCore
description: Entity Framework Core supports two fundamental approaches for saving data to the database.
image:
---

## In this article

Entity Framework Core supports two fundamental approaches for saving data to the database.

## Approach 1: change tracking and ```SaveChanges```

In this article, I'm going to show you how to set up an EF database.

```c#
using (var context = new BloggingContext())
{
    var blog = context.Blogs.Single(b => b.Url == "http://example.com");
    blog.Url = "http://example.com/blog";
    context.SaveChanges();
}
```

The code above performs the following steps:

- It uses a regular LINQ query to load an entity from the database (see Query data). EF's queries are tracking by default, meaning that EF tracks the loaded entities in its internal change tracker.

- The loaded entity instance is manipulated as usual, by assigning a .NET property. EF isn't involved in this step.

- Finally, ```DbContext.SaveChanges()``` is called. At this point, EF automatically detects any changes by comparing the entities with a snapshot from the moment they were loaded. Any detected changes are persisted to the database; when using a relational database, this typically involves sending e.g. a SQL ```UPDATE``` to update the relevant rows.

The following example shows how to update an existing database using EF.

 ```SaveChanges```() offers the following advantages:

- You don't need to write code to track which entities and properties changed - EF does this automatically for you, and only updates those properties in the database, improving performance. Imagine if your loaded entities are bound to a UI component, allowing users to change any property they wish; EF takes away the burden of figuring out which entities and properties were actually changed.

- Saving changes to the database can sometimes be complicated! For example, if you want to add a Blog and some Posts for that blog, you may need to fetch the database-generated key for the inserted Blog before you can insert the Posts (since they need to refer to the Blog). EF does all this for you, taking away the complexity.

- EF can detect concurrency issues, such as when a database row has been modified by someone else between your query and ```SaveChanges()```. More details are available in Concurrency conflicts.

- On databases which support it, ```SaveChanges()``` automatically wraps multiple changes in a transaction, ensuring your data stays consistent if a failure occurs. More details are available in Transactions.

- ```SaveChanges()``` also batches together multiple changes in many cases, significantly reducing the number of database roundtrips and greatly improving performance. More details are available in Efficient updating.

For more information and code samples on basic ```SaveChanges()``` usage, see Basic ```SaveChanges```. For more information on EF's change tracking, see the Change tracking overview.

## Approach 2: ```ExecuteUpdate``` and ```ExecuteDelete("bulk update")```

> Note
This feature was introduced in EF Core 7.0.

While change tracking and ```SaveChanges()``` are a powerful way to save changes, they do have certain disadvantages.

 ```SaveChanges``` allows you to modify or delete entities in a database.

To support this "bulk update" scenario, you can use ```ExecuteDelete``` as follows:

```c#
context.Blogs.Where(b => b.Rating < 3).ExecuteDelete();
```

This allows you to express a SQL ```DELETE``` statement via regular LINQ operators - similar to a regular LINQ query - causing the following SQL to be executed against the database:

```sql
DELETE FROM [b]
FROM [Blogs] AS [b]
WHERE [b].[Rating] < 3
```

This executes very efficiently in the database, without loading any data from the database or involving EF's change tracker. Similarly, ```ExecuteUpdate``` allows you to express a SQL ```UPDATE``` statement.

In this article, I'm going to show you how to change entities using the ```ExecuteUpdate``` and ```ExecuteDelete``` APIs.

 ```ExecuteUpdate``` and ```ExecuteDelete``` allow you to avoid the overhead of change tracking and the overhead of ```SaveChanges```.

However, note that ```ExecuteUpdate``` and ```ExecuteDelete``` also have certain limitations:

- These methods execute immediately, and currently cannot be batched with other operations. On the other hand, ```SaveChanges()```, can batch multiple operations together.

- Since change tracking isn't involved, it's your responsibility to know exactly which entities and properties need to be changed. This may mean more manual, low-level code tracking what needs to change and what doesn't.

- In addition, since change tracking isn't involved, these methods do not automatically apply Concurrency Control when persisting changes. However, you can still explicitly add a ```Where``` clause to implement concurrency control yourself.

- Only updating and deleting is currently supported; insertion must be done via ```DbSet<TEntity>.Add``` and ```SaveChanges()```.

For more information and code samples, see ```ExecuteUpdate``` and ```ExecuteDelete```.

## Summary

Following are a few guidelines for when to use which approach. Note that these aren't absolute rules, but provide a useful rules of thumb:

- If you don't know in advance which changes will take place, use ```SaveChanges```; it will automatically detect which changes need to be applied. Example scenarios:

  - "I want to load a Blog from the database and display a form allowing the user to change it"

- If you need to manipulate a graph of objects (i.e. multiple interconnected objects), use ```SaveChanges```; it will figure out the proper ordering of the changes and how to link everything together.

  - "I want to update a blog, changing some of its posts and deleting others"

- If you wish to change a potentially large number of entities based on some criterion, use ```ExecuteUpdate``` and ```ExecuteDelete```. Example scenarios:

  - "I want to give all employees a raise"

  - "I want to delete all blogs whose name starts with X"

- If you already know exactly which entities you wish to modify and how you wish to change them, use ```ExecuteUpdate``` and ```ExecuteDelete```. Example scenarios:

  - "I want to delete the blog whose name is 'Foo'"

  - "I want to change the name of the blog with Id 5 to 'Bar'"

Ref: [Saving Data](https://learn.microsoft.com/en-us/ef/core/saving/)