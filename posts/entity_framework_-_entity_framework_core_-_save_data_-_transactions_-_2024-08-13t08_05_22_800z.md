---
title: Entity Framework - Entity Framework Core - Save data - Transactions
published: true
date: 2024-08-13 08:05:22
tags: Summary, EFCore
description: A transaction is a type of database operation.
image:
---

## In this article

A transaction is a type of database operation.

> Tip
You can view this article's sample on GitHub.

## Default transaction behavior

 ```SaveChanges``` checks if the database provider supports transactions.

For most applications, this default behavior is sufficient. You should only manually control transactions if your application requirements deem it necessary.

## Controlling transactions

You can use the ```DbContext.Database``` API to begin, commit, and rollback transactions. The following example shows two ```SaveChanges``` operations and a LINQ query being executed in a single transaction:

```csharp
using var context = new BloggingContext();
using var transaction = context.Database.BeginTransaction();

try
{
    context.Blogs.Add(new Blog { Url = "http://blogs.msdn.com/dotnet" });
    context.SaveChanges();

    context.Blogs.Add(new Blog { Url = "http://blogs.msdn.com/visualstudio" });
    context.SaveChanges();

    var blogs = context.Blogs
        .OrderBy(b => b.Url)
        .ToList();

    // Commit transaction if all commands succeed, transaction will auto-rollback
    // when disposed if either commands fails
    transaction.Commit();
}
catch (Exception)
{
    // TODO: Handle failure
}
```

While all relational database providers support transactions, other providers types may throw or no-op when transaction APIs are called.

> Note
Manually controlling transactions in this way is incompatible with implicitly invoked retrying execution strategies. See Connection Resiliency for more information.

## Savepoints

 ```SaveChanges``` is a library that allows you to automatically roll back a database transaction if it encounters an error.

> Warning
Savepoints are incompatible with SQL Server's Multiple Active Result Sets (MARS). Savepoints will not be created by EF when MARS is enabled on the connection, even if MARS is not actively in use. If an error occurs during ```SaveChanges```, the transaction may be left in an unknown state.

It's also possible to manually manage savepoints, just as it is with transactions. The following example creates a savepoint within a transaction, and rolls back to it on failure:

```csharp
using var context = new BloggingContext();
using var transaction = context.Database.BeginTransaction();

try
{
    context.Blogs.Add(new Blog { Url = "https://devblogs.microsoft.com/dotnet/" });
    context.SaveChanges();

    transaction.CreateSavepoint("BeforeMoreBlogs");

    context.Blogs.Add(new Blog { Url = "https://devblogs.microsoft.com/visualstudio/" });
    context.Blogs.Add(new Blog { Url = "https://devblogs.microsoft.com/aspnet/" });
    context.SaveChanges();

    transaction.Commit();
}
catch (Exception)
{
    // If a failure occurred, we rollback to the savepoint and can continue the transaction
    transaction.RollbackToSavepoint("BeforeMoreBlogs");

    // TODO: Handle failure, possibly retry inserting blogs
}
```

## Cross-context transaction

You can share a transaction between two instances of the same application.

To share a transaction, the contexts must share both a ```DbConnection``` and a ```DbTransaction```.

### Allow connection to be externally provided

Sharing a ```DbConnection``` requires the ability to pass a connection into a context when constructing it.

The ```DbConnection``` method is used to provide an external connection to the DbContext.

> Tip
```DbContextOptionsBuilder``` is the API you used in ```DbContext.OnConfiguring``` to configure the context, you are now going to use it externally to create ```DbContextOptions```.

```csharp
public class BloggingContext : DbContext
{
    public BloggingContext(DbContextOptions<BloggingContext> options)
        : base(options)
    {
    }

    public DbSet<Blog> Blogs { get; set; }
}
```

An alternative is to keep using ```DbContext.OnConfiguring```, but accept a ```DbConnection``` that is saved and then used in ```DbContext.OnConfiguring```.

```csharp
public class BloggingContext : DbContext
{
    private DbConnection _connection;

    public BloggingContext(DbConnection connection)
    {
      _connection = connection;
    }

    public DbSet<Blog> Blogs { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlServer(_connection);
    }
}
```

### Share connection and transaction

You can now create multiple context instances that share the same connection. Then use the ```DbContext.Database.UseTransaction(DbTransaction)``` API to enlist both contexts in the same transaction.

```csharp
using var connection = new SqlConnection(connectionString);
var options = new DbContextOptionsBuilder<BloggingContext>()
    .UseSqlServer(connection)
    .Options;

using var context1 = new BloggingContext(options);
using var transaction = context1.Database.BeginTransaction();
try
{
    context1.Blogs.Add(new Blog { Url = "http://blogs.msdn.com/dotnet" });
    context1.SaveChanges();

    using (var context2 = new BloggingContext(options))
    {
        context2.Database.UseTransaction(transaction.GetDbTransaction());

        var blogs = context2.Blogs
            .OrderBy(b => b.Url)
            .ToList();

        context2.Blogs.Add(new Blog { Url = "http://dot.net" });
        context2.SaveChanges();
    }

    // Commit transaction if all commands succeed, transaction will auto-rollback
    // when disposed if either commands fails
    transaction.Commit();
}
catch (Exception)
{
    // TODO: Handle failure
}
```

## Using external DbTransactions (relational databases only)

If you are using multiple data access technologies to access a relational database, you may want to share a transaction between operations performed by these different technologies.

The following example, shows how to perform an ADO.NET SqlClient operation and an Entity Framework Core operation in the same transaction.

```csharp
using var connection = new SqlConnection(connectionString);
connection.Open();

using var transaction = connection.BeginTransaction();
try
{
    // Run raw ADO.NET command in the transaction
    var command = connection.CreateCommand();
    command.Transaction = transaction;
    command.CommandText = "DELETE FROM dbo.Blogs";
    command.ExecuteNonQuery();

    // Run an EF Core command in the transaction
    var options = new DbContextOptionsBuilder<BloggingContext>()
        .UseSqlServer(connection)
        .Options;

    using (var context = new BloggingContext(options))
    {
        context.Database.UseTransaction(transaction);
        context.Blogs.Add(new Blog { Url = "http://blogs.msdn.com/dotnet" });
        context.SaveChanges();
    }

    // Commit transaction if all commands succeed, transaction will auto-rollback
    // when disposed if either commands fails
    transaction.Commit();
}
catch (Exception)
{
    // TODO: Handle failure
}
```

## Using System.Transactions

It is possible to use ambient transactions if you need to coordinate across a larger scope.

```csharp
using (var scope = new TransactionScope(
           TransactionScopeOption.Required,
           new TransactionOptions { IsolationLevel = IsolationLevel.ReadCommitted }))
{
    using var connection = new SqlConnection(connectionString);
    connection.Open();

    try
    {
        // Run raw ADO.NET command in the transaction
        var command = connection.CreateCommand();
        command.CommandText = "DELETE FROM dbo.Blogs";
        command.ExecuteNonQuery();

        // Run an EF Core command in the transaction
        var options = new DbContextOptionsBuilder<BloggingContext>()
            .UseSqlServer(connection)
            .Options;

        using (var context = new BloggingContext(options))
        {
            context.Blogs.Add(new Blog { Url = "http://blogs.msdn.com/dotnet" });
            context.SaveChanges();
        }

        // Commit transaction if all commands succeed, transaction will auto-rollback
        // when disposed if either commands fails
        scope.Complete();
    }
    catch (Exception)
    {
        // TODO: Handle failure
    }
}
```

It is also possible to enlist in an explicit transaction.

```csharp
using (var transaction = new CommittableTransaction(
           new TransactionOptions { IsolationLevel = IsolationLevel.ReadCommitted }))
{
    var connection = new SqlConnection(connectionString);

    try
    {
        var options = new DbContextOptionsBuilder<BloggingContext>()
            .UseSqlServer(connection)
            .Options;

        using (var context = new BloggingContext(options))
        {
            context.Database.OpenConnection();
            context.Database.EnlistTransaction(transaction);

            // Run raw ADO.NET command in the transaction
            var command = connection.CreateCommand();
            command.CommandText = "DELETE FROM dbo.Blogs";
            command.ExecuteNonQuery();

            // Run an EF Core command in the transaction
            context.Blogs.Add(new Blog { Url = "http://blogs.msdn.com/dotnet" });
            context.SaveChanges();
            context.Database.CloseConnection();
        }

        // Commit transaction if all commands succeed, transaction will auto-rollback
        // when disposed if either commands fails
        transaction.Commit();
    }
    catch (Exception)
    {
        // TODO: Handle failure
    }
}
```

> Note
If you're using async APIs, be sure to specify ```TransactionScopeAsyncFlowOption.Enabled``` in the ```TransactionScope``` constructor to ensure that the ambient transaction flows across async calls.

For more information on ```TransactionScope``` and ambient transactions, see this documentation.

### Limitations of System.Transactions

- EF Core relies on database providers to implement support for ```System.Transactions```. If a provider does not implement support for ```System.Transactions```, it is possible that calls to these APIs will be completely ignored. SqlClient supports it.

Important
It is recommended that you test that the API behaves correctly with your provider before you rely on it for managing transactions. You are encouraged to contact the maintainer of the database provider if it does not.

> Important
It is recommended that you test that the API behaves correctly with your provider before you rely on it for managing transactions. You are encouraged to contact the maintainer of the database provider if it does not.

- Distributed transaction support in System.Transactions was added to .NET 7.0 for Windows only. Any attempt to use distributed transactions on older .NET versions or on non-Windows platforms will fail.

- ```TransactionScope``` does not support async commit/rollback; that means that disposing it synchronously blocks the executing thread until the operation is complete.

Ref: [Using Transactions](https://learn.microsoft.com/en-us/ef/core/saving/transactions)