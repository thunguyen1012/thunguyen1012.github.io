---
title: Entity Framework - Entity Framework Core - Miscellaneous - Connection resiliency
published: true
date: 2024-08-23 09:57:32
tags: Summary, EFCore
description: Connection resiliency automatically retries failed database commands. The feature can be used with any database by supplying an "execution strategy", which encapsulates the logic necessary to detect failures and retry commands. EF Core providers can supply execution strategies tailored to their specific database failure conditions and optimal retry policies.
image:
---

## In this article

Connection resiliency is a new feature in the EF Core database management system.

A provider's execution strategy can have a significant impact on the performance of your application.

An execution strategy is specified when configuring the options for your context. This is typically in the ```OnConfiguring``` method of your derived context:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
{
    optionsBuilder
        .UseSqlServer(
            @"Server=(localdb)\mssqllocaldb;Database=EFMiscellanous.ConnectionResiliency;Trusted_Connection=True;ConnectRetryCount=0",
            options => options.EnableRetryOnFailure());
}
```

or in ```Startup.cs``` for an ASP.NET Core application:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddDbContext<PicnicContext>(
        options => options.UseSqlServer(
            "<connection string>",
            providerOptions => providerOptions.EnableRetryOnFailure()));
}
```

> Note
Enabling retry on failure causes EF to internally buffer the resultset, which may significantly increase memory requirements for queries returning large resultsets. See buffering and streaming for more details.

## Custom execution strategy

There is a mechanism to register a custom execution strategy of your own if you wish to change any of the defaults.

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
{
    optionsBuilder
        .UseMyProvider(
            "<connection string>",
            options => options.ExecutionStrategy(...));
}
```

## Execution strategies and transactions

An execution strategy that automatically retries on failures needs to be able to play back each operation in a retry block that fails. When retries are enabled, each operation you perform via EF Core becomes its own retriable operation. That is, each query and each call to ```SaveChanges()``` will be retried as a unit if a transient failure occurs.

However, if your code initiates a transaction using ```BeginTransaction()``` you are defining your own group of operations that need to be treated as a unit, and everything inside the transaction would need to be played back shall a failure occur. You will receive an exception like the following if you attempt to do this when using an execution strategy:

Is there a way to automatically invoke an execution strategy when it fails?

```csharp
using var db = new BloggingContext();
var strategy = db.Database.CreateExecutionStrategy();

strategy.Execute(
    () =>
    {
        using var context = new BloggingContext();
        using var transaction = context.Database.BeginTransaction();

        context.Blogs.Add(new Blog { Url = "http://blogs.msdn.com/dotnet" });
        context.SaveChanges();

        context.Blogs.Add(new Blog { Url = "http://blogs.msdn.com/visualstudio" });
        context.SaveChanges();

        transaction.Commit();
    });
```

This approach can also be used with ambient transactions.

```csharp
using var context1 = new BloggingContext();
context1.Blogs.Add(new Blog { Url = "http://blogs.msdn.com/visualstudio" });

var strategy = context1.Database.CreateExecutionStrategy();

strategy.Execute(
    () =>
    {
        using var context2 = new BloggingContext();
        using var transaction = new TransactionScope();

        context2.Blogs.Add(new Blog { Url = "http://blogs.msdn.com/dotnet" });
        context2.SaveChanges();

        context1.SaveChanges();

        transaction.Complete();
    });
```

## Transaction commit failure and the idempotency issue

The state of a transaction is unknown if a connection is dropped while the transaction is being committed.

The following example shows how to change the database state of a transaction.

There are several ways to deal with this.

### Option 1 - Do (almost) nothing

The likelihood of a connection failure during transaction commit is low so it may be acceptable for your application to just fail if this condition actually occurs.

You can use a store-generated key to create a new row in a query.

### Option 2 - Rebuild application state

- Discard the current ```DbContext```.

- Create a new ```DbContext``` and restore the state of your application from the database.

- Inform the user that the last operation might not have been completed successfully.

### Option 3 - Add state verification

For most of the operations that change the database state it is possible to add code that checks whether it succeeded. EF provides an extension method to make this easier - ```IExecutionStrategy.ExecuteInTransaction```.

This method begins and commits a transaction and also accepts a function in the ```verifySucceeded``` parameter that is invoked when a transient error occurs during the transaction commit.

```csharp
using var db = new BloggingContext();
var strategy = db.Database.CreateExecutionStrategy();

var blogToAdd = new Blog { Url = "http://blogs.msdn.com/dotnet" };
db.Blogs.Add(blogToAdd);

strategy.ExecuteInTransaction(
    db,
    operation: context => { context.SaveChanges(acceptAllChangesOnSuccess: false); },
    verifySucceeded: context => context.Blogs.AsNoTracking().Any(b => b.BlogId == blogToAdd.BlogId));

db.ChangeTracker.AcceptAllChanges();
```

> Note
Here ```SaveChanges``` is invoked with ```acceptAllChangesOnSuccess``` set to ```false``` to avoid changing the state of the ```Blog``` entity to ```Unchanged``` if ```SaveChanges``` succeeds. This allows to retry the same operation if the commit fails and the transaction is rolled back.

### Option 4 - Manually track the transaction

This example shows how to assign an ID to a commit when it fails.

- Add a table to the database used to track the status of the transactions.

- Insert a row into the table at the beginning of each transaction.

- If the connection fails during the commit, check for the presence of the corresponding row in the database.

- If the commit is successful, delete the corresponding row to avoid the growth of the table.

```csharp
using var db = new BloggingContext();
var strategy = db.Database.CreateExecutionStrategy();

db.Blogs.Add(new Blog { Url = "http://blogs.msdn.com/dotnet" });

var transaction = new TransactionRow { Id = Guid.NewGuid() };
db.Transactions.Add(transaction);

strategy.ExecuteInTransaction(
    db,
    operation: context => { context.SaveChanges(acceptAllChangesOnSuccess: false); },
    verifySucceeded: context => context.Transactions.AsNoTracking().Any(t => t.Id == transaction.Id));

db.ChangeTracker.AcceptAllChanges();
db.Transactions.Remove(transaction);
db.SaveChanges();
```

> Note
Make sure that the context used for the verification has an execution strategy defined as the connection is likely to fail again during verification if it failed during transaction commit.

## Additional resources

- Troubleshoot transient connection errors in Azure SQL Database and SQL Managed Instance

Ref: [Connection Resiliency](https://learn.microsoft.com/en-us/ef/core/miscellaneous/connection-resiliency)