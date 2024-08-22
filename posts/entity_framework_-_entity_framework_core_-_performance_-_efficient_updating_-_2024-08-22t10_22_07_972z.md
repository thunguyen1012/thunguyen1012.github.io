---
title: Entity Framework - Entity Framework Core - Performance - Efficient updating
published: true
date: 2024-08-22 10:22:07
tags: Summary, EFCore
description: EF Core helps minimize roundtrips by automatically batching together all updates in a single roundtrip. Consider the following:
image:
---

## In this article

## Batching

EF Core helps minimize roundtrips by automatically batching together all updates in a single roundtrip. Consider the following:

```csharp
var blog = context.Blogs.Single(b => b.Url == "http://someblog.microsoft.com");
blog.Url = "http://someotherblog.microsoft.com";
context.Add(new Blog { Url = "http://newblog1.microsoft.com" });
context.Add(new Blog { Url = "http://newblog2.microsoft.com" });
context.SaveChanges();
```

The above loads a blog from the database, changes its URL, and then adds two new blogs; to apply this, two SQL INSERT statements and one ```UPDATE``` statement are sent to the database. Rather than sending them one by one, as Blog instances are added, EF Core tracks these changes internally, and executes them in a single roundtrip when ```SaveChanges``` is called.

EF Core defaults to executing batches of statements in a single roundtrip.

Users can also tweak these thresholds to achieve potentially higher performance - but benchmark carefully before modifying these:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
{
    optionsBuilder.UseSqlServer(
        @"Server=(localdb)\mssqllocaldb;Database=Blogging;Trusted_Connection=True",
        o => o
            .MinBatchSize(1)
            .MaxBatchSize(100));
}
```

## Use ```ExecuteUpdate``` and ```ExecuteDelete``` when relevant

Let's assume you want to give all your employees a raise. A typical implementation for this in EF Core would look like the following:

```c#
foreach (var employee in context.Employees)
{
    employee.Salary += 1000;
}
context.SaveChanges();
```

While this is perfectly valid code, let's analyze what it does from a performance perspective:

- A database roundtrip is performed, to load all the relevant employees; note that this brings all the Employees' row data to the client, even if only the salary will be needed.

- EF Core's change tracking creates snapshots when loading the entities, and then compares those snapshots to the instances to find out which properties changed.

- Typically, a second database roundtrip is performed to save all the changes (note that some database providers split the changes into multiples roundtrips). Although this batching behavior is far better than doing a roundtrip for each update, EF Core still sends an ```UPDATE``` statement per employee, and the database must execute each statement separately.

Starting with EF Core 7.0, you can use the ```ExecuteUpdate``` and ```ExecuteDelete``` methods to do the same thing far more efficiently:

```c#
context.Employees.ExecuteUpdate(s => s.SetProperty(e => e.Salary, e => e.Salary + 1000));
```

This sends the following SQL statement to the database:

```sql
UPDATE [Employees] SET [Salary] = [Salary] + 1000;
```

This ```UPDATE``` performs the entire operation in a single roundtrip, without loading or sending any actual data to the database, and without making use of EF's change tracking machinery, which imposes an additional overhead. For more information, see ```ExecuteUpdate``` and ```ExecuteDelete```.

If you're using an older version of EF Core which doesn't yet support ```ExecuteUpdate``` and ```ExecuteDelete```, or want to execute a complex SQL statement which isn't supported by these methods, you can still use a SQL query to perform the operation:

 - EF Core 7.0

 - Older Versions

```c#
context.Database.ExecuteSql($"UPDATE [Employees] SET [Salary] = [Salary] + 1000");
```

```c#
context.Database.ExecuteSqlInterpolated($"UPDATE [Employees] SET [Salary] = [Salary] + 1000");
```

To learn more about the differences between ```SaveChanges``` and ```ExecuteUpdate```/ExecuteDelete, see the Overview page on saving data.

Ref: [Efficient Updating](https://learn.microsoft.com/en-us/ef/core/performance/efficient-updating)