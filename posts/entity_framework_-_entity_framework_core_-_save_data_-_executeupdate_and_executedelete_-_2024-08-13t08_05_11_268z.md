---
title: Entity Framework - Entity Framework Core - Save data - ExecuteUpdate and ExecuteDelete
published: true
date: 2024-08-13 08:05:11
tags: Summary, EFCore
description: Two techniques can be used to save data to the database without using EF's traditional change tracking and SaveChanges method.
image:
---

## In this article

> Note
This feature was introduced in EF Core 7.0.

Two techniques can be used to save data to the database without using EF's traditional change tracking and ```SaveChanges``` method.

## ```ExecuteDelete```

Let's assume that you need to delete all Blogs with a rating below a certain threshold. The traditional ```SaveChanges()``` approach requires you to do the following:

```c#
foreach (var blog in context.Blogs.Where(b => b.Rating < 3))
{
    context.Blogs.Remove(blog);
}

context.SaveChanges();
```

We use a tracker to find all the blogs that match our filter and then apply changes to them.

Here is the same task performed via the ```ExecuteDelete``` API:

```c#
context.Blogs.Where(b => b.Rating < 3).ExecuteDelete();
```

This uses the familiar LINQ operators to determine which Blogs should be affected - just as if we were querying them - and then tells EF to execute a SQL ```DELETE``` against the database:

```sql
DELETE FROM [b]
FROM [Blogs] AS [b]
WHERE [b].[Rating] < 3
```

In this post I'm going to show you how to delete a bunch of Wordpress blogs.

## ```ExecuteUpdate```

Rather than deleting these Blogs, what if we wanted to change a property to indicate that they should be hidden instead? ```ExecuteUpdate``` provides a similar way to express a SQL ```UPDATE``` statement:

```c#
context.Blogs
    .Where(b => b.Rating < 3)
    .ExecuteUpdate(setters => setters.SetProperty(b => b.IsVisible, false));
```

In this article we are going to use ```ExecuteUpdate``` to change the value of a property in one of our blogs.

```sql
UPDATE [b]
SET [b].[IsVisible] = CAST(0 AS bit)
FROM [Blogs] AS [b]
WHERE [b].[Rating] < 3
```

### Updating multiple properties

 ```ExecuteUpdate``` allows updating multiple properties in a single invocation. For example, to both set ```IsVisible``` to ```false``` and to set ```Rating``` to zero, simply chain additional ```SetProperty``` calls together:

```c#
context.Blogs
    .Where(b => b.Rating < 3)
    .ExecuteUpdate(setters => setters
        .SetProperty(b => b.IsVisible, false)
        .SetProperty(b => b.Rating, 0));
```

This executes the following SQL:

```sql
UPDATE [b]
SET [b].[Rating] = 0,
    [b].[IsVisible] = CAST(0 AS bit)
FROM [Blogs] AS [b]
WHERE [b].[Rating] < 3
```

### Referencing the existing property value

 ```ExecuteUpdate``` allows you to update a property's constant value.

```c#
context.Blogs
    .Where(b => b.Rating < 3)
    .ExecuteUpdate(setters => setters.SetProperty(b => b.Rating, b => b.Rating + 1));
```

This example shows how to update a Blog using the ```SetProperty``` function.

```sql
UPDATE [b]
SET [b].[Rating] = [b].[Rating] + 1
FROM [Blogs] AS [b]
WHERE [b].[Rating] < 3
```

### Navigations and related entities

 ```ExecuteUpdate``` is an add-on for ```SetProperty``` that allows you to update the ratings of all the properties in the ```SetProperty``` database.

```c#
context.Blogs.ExecuteUpdate(
    setters => setters.SetProperty(b => b.Rating, b => b.Posts.Average(p => p.Rating)));
```

However, EF does allow performing this operation by first using ```Select``` to calculate the average rating and project it to an anonymous type, and then using ```ExecuteUpdate``` over that:

```c#
context.Blogs
    .Select(b => new { Blog = b, NewRating = b.Posts.Average(p => p.Rating) })
    .ExecuteUpdate(setters => setters.SetProperty(b => b.Blog.Rating, b => b.NewRating));
```

This executes the following SQL:

```sql
UPDATE [b]
SET [b].[Rating] = CAST((
    SELECT AVG(CAST([p].[Rating] AS float))
    FROM [Post] AS [p]
    WHERE [b].[Id] = [p].[BlogId]) AS int)
FROM [Blogs] AS [b]
```

## Change tracking

This example shows how to use ```SaveChanges``` to apply changes to a database.

The functions ```ExecuteUpdate``` and ```ExecuteDelete``` are very similar to the functions ```SaveChanges``` and ```SaveChanges```.

Consider the following code:

```c#
// 1. Query the blog with the name `SomeBlog`. Since EF queries are tracking by default, the Blog is now tracked by EF's change tracker.
var blog = context.Blogs.Single(b => b.Name == "SomeBlog");

// 2. Increase the rating of all blogs in the database by one. This executes immediately.
context.Blogs.ExecuteUpdate(setters => setters.SetProperty(b => b.Rating, b => b.Rating + 1));

// 3. Increase the rating of `SomeBlog` by two. This modifies the .NET `Rating` property and is not yet persisted to the database.
blog.Rating += 2;

// 4. Persist tracked changes to the database.
context.SaveChanges();
```

In this post, I'm going to show you how to change the rating of a .NET instance of a blog.

As a result, it is usually a good idea to avoid mixing both tracked ```SaveChanges``` modifications and untracked modifications via ```ExecuteUpdate```/ExecuteDelete.

## Transactions

Continuing on the above, it's important to understand that ```ExecuteUpdate``` and ```ExecuteDelete``` do not implicitly start a transaction they're invoked. Consider the following code:

```c#
context.Blogs.ExecuteUpdate(/* some update */);
context.Blogs.ExecuteUpdate(/* another update */);

var blog = context.Blogs.Single(b => b.Name == "SomeBlog");
blog.Rating += 2;
context.SaveChanges();
```

To wrap multiple operations in a single transaction, explicitly start a transaction with DatabaseFacade:

```c#
using (var transaction = context.Database.BeginTransaction())
{
    context.Blogs.ExecuteUpdate(/* some update */);
    context.Blogs.ExecuteUpdate(/* another update */);

    ...
}
```

For more information about transaction handling, see Using Transactions.

## Concurrency control and rows affected

 ```SaveChanges``` provides automatic Concurrency Control, using a concurrency token to ensure that a row wasn't changed between the moment you loaded it and the moment you save changes to it.

However, both these methods do return the number of rows that were affected by the operation; this can come particularly handy for implementing concurrency control yourself:

```c#
// (load the ID and concurrency token for a Blog in the database)

var numUpdated = context.Blogs
    .Where(b => b.Id == id && b.ConcurrencyToken == concurrencyToken)
    .ExecuteUpdate(/* ... */);
if (numUpdated == 0)
{
    throw new Exception("Update failed!");
}
```

This code shows how to apply an update to a specific Blog, and only if its concurrency token has a specific value (e.g. the one we saw when querying the Blog from the database).

## Limitations

- Only updating and deleting is currently supported; insertion must be done via DbSet<TEntity>.Add and ```SaveChanges()```.

- While the SQL ```UPDATE``` and ```DELETE``` statements allow retrieving original column values for the rows affected, this isn't currently supported by ```ExecuteUpdate``` and ```ExecuteDelete```.

- Multiple invocations of these methods cannot be batched. Each invocation performs its own roundtrip to the database.

- Databases typically allow only a single table to be modified with ```UPDATE``` or ```DELETE```.

- These methods currently only work with relational database providers.

## Additional resources

- .NET Data Access Community Standup session where we discuss ```ExecuteUpdate``` and ```ExecuteDelete```.

Ref: [ExecuteUpdate and ```ExecuteDelete```](https://learn.microsoft.com/en-us/ef/core/saving/execute-insert-update-delete)