---
title: Entity Framework - Entity Framework Core - Testing - Testing against your production database system
published: true
date: 2024-08-21 08:12:34
tags: Summary, EFCore
description: In this page, we discuss techniques for writing automated tests which involve the database system against which the application runs in production. Alternate testing approaches exist, where the production database system is swapped out by test doubles; see the testing overview page for more information. Note that testing against a different database than what is used in production (e.g. Sqlite) is not covered here, since the different database is used as a test double; this approach is covered in Testing without your production database system.
image:
---

## In this article

Automated testing can be a useful way to improve the performance of your application.

In this post I'm going to show you how to test the performance of a database against a real database.

<blockquote class="tip">Tip
This page shows xUnit techniques, but similar concepts exist in other testing frameworks, including NUnit.</blockquote>

## Setting up your database system

In this article I'm going to show you how to install and run a Docker database.

Database testing can be a bit of a headache.

- It doesn't support everything that SQL Server Developer Edition does.

- It's only available on Windows.

- It can cause lag on first test run as the service is spun up.

We generally recommend installing SQL Server Developer edition rather than LocalDB, since it provides the full SQL Server feature set and is generally very easy to do.

The Azure Cosmos DB emulator is a useful tool both for developing locally and for running tests.

## Creating, seeding and managing a test database

In this tutorial, I'll show you how to create a test database and how to use it in your tests.

When using Xunit, this can be done via a class fixture, which represents the database and is shared across multiple test runs:

```csharp
public class TestDatabaseFixture
{
    private const string ConnectionString = @"Server=(localdb)\mssqllocaldb;Database=EFTestSample;Trusted_Connection=True;ConnectRetryCount=0";

    private static readonly object _lock = new();
    private static bool _databaseInitialized;

    public TestDatabaseFixture()
    {
        lock (_lock)
        {
            if (!_databaseInitialized)
            {
                using (var context = CreateContext())
                {
                    context.Database.EnsureDeleted();
                    context.Database.EnsureCreated();

                    context.AddRange(
                        new Blog { Name = "Blog1", Url = "http://blog1.com" },
                        new Blog { Name = "Blog2", Url = "http://blog2.com" });
                    context.SaveChanges();
                }

                _databaseInitialized = true;
            }
        }
    }

    public BloggingContext CreateContext()
        => new BloggingContext(
            new DbContextOptionsBuilder<BloggingContext>()
                .UseSqlServer(ConnectionString)
                .Options);
}
```

When the above fixture is instantiated, it uses ```EnsureDeleted```() to drop the database (in case it exists from a previous run), and then ```EnsureCreated()``` to create it with your latest model configuration (see the docs for these APIs). Once the database is created, the fixture seeds it with some data our tests can use. It's worth spending some time thinking about your seed data, since changing it later for a new test may cause existing tests to fail.

To use the fixture in a test class, simply implement ```IClassFixture``` over your fixture type, and xUnit will inject it into your constructor:

```csharp
public class BloggingControllerTest : IClassFixture<TestDatabaseFixture>
{
    public BloggingControllerTest(TestDatabaseFixture fixture)
        => Fixture = fixture;

    public TestDatabaseFixture Fixture { get; }
```

Your test class now has a ```Fixture``` property which can be used by tests to create a fully functional context instance:

```csharp
[Fact]
public void GetBlog()
{
    using var context = Fixture.CreateContext();
    var controller = new BloggingController(context);

    var blog = controller.GetBlog("Blog2").Value;

    Assert.Equal("http://blog2.com", blog.Url);
}
```

In our series of posts on how to use xUnit, we've been looking at how to use database fixtures in test classes.

## Tests which modify data

In this talk, I'm going to show you how to isolate writing tests from modifying data in a database.

Here's a controller method which adds a Blog to our database:

```csharp
[HttpPost]
public ActionResult AddBlog(string name, string url)
{
    _context.Blogs.Add(new Blog { Name = name, Url = url });
    _context.SaveChanges();

    return Ok();
}
```

We can test this method with the following:

```csharp
[Fact]
public void AddBlog()
{
    using var context = Fixture.CreateContext();
    context.Database.BeginTransaction();

    var controller = new BloggingController(context);
    controller.AddBlog("Blog3", "http://blog3.com");

    context.ChangeTracker.Clear();

    var blog = context.Blogs.Single(b => b.Name == "Blog3");
    Assert.Equal("http://blog3.com", blog.Url);

}
```

Some notes on the test code above:

- We start a transaction to make sure the changes below aren't committed to the database, and don't interfere with other tests. Since the transaction is never committed, it is implicitly rolled back at the end of the test when the context instance is disposed.

- After making the updates we want, we clear the context instance's change tracker with ```ChangeTracker.Clear```, to make sure we actually load the blog from the database below. We could use two context instances instead, but we'd then have to make sure the same transaction is used by both instances.

- You may even want to start the transaction in the fixture's ```CreateContext```, so that tests receive a context instance that's already in a transaction, and ready for updates. This can help prevent cases where the transaction is accidentally forgotten, leading to test interference which can be hard to debug. You may also want to separate read-only and write tests in different test classes as well.

## Tests which explicitly manage transactions

There are many types of tests which can be carried out on a database: tests which query the database, tests which query the database, tests which query the database, tests which query the database, tests which query the database, tests which query the database, tests which query the database, tests which query the database

Let's examine the following controller method as an example:

```csharp
[HttpPost]
public ActionResult UpdateBlogUrl(string name, string url)
{
    // Note: it isn't usually necessary to start a transaction for updating. This is done here for illustration purposes only.
    using var transaction = _context.Database.BeginTransaction(IsolationLevel.Serializable);

    var blog = _context.Blogs.FirstOrDefault(b => b.Name == name);
    if (blog is null)
    {
        return NotFound();
    }

    blog.Url = url;
    _context.SaveChanges();

    transaction.Commit();
    return Ok();
}
```

In this class, we'll define a method that commits changes to a database.

```csharp
public class TransactionalTestDatabaseFixture
{
    private const string ConnectionString = @"Server=(localdb)\mssqllocaldb;Database=EFTransactionalTestSample;Trusted_Connection=True;ConnectRetryCount=0";

    public BloggingContext CreateContext()
        => new BloggingContext(
            new DbContextOptionsBuilder<BloggingContext>()
                .UseSqlServer(ConnectionString)
                .Options);

    public TransactionalTestDatabaseFixture()
    {
        using var context = CreateContext();
        context.Database.EnsureDeleted();
        context.Database.EnsureCreated();

        Cleanup();
    }

    public void Cleanup()
    {
        using var context = CreateContext();

        context.Blogs.RemoveRange(context.Blogs);

        context.AddRange(
            new Blog { Name = "Blog1", Url = "http://blog1.com" },
            new Blog { Name = "Blog2", Url = "http://blog2.com" });
        context.SaveChanges();
    }
}
```

This fixture is similar to the one used above, but notably contains a ```Cleanup``` method; we'll call this after every test to ensure that the database is reset to its starting state.

In this example, we want to share a test fixture between two classes.

First, we define a test collection, which references our fixture and will be used by all transactional test classes which require it:

```csharp
[CollectionDefinition("TransactionalTests")]
public class TransactionalTestsCollection : ICollectionFixture<TransactionalTestDatabaseFixture>
{
}
```

We now reference the test collection in our test class, and accept the fixture in the constructor as before:

```csharp
[Collection("TransactionalTests")]
public class TransactionalBloggingControllerTest : IDisposable
{
    public TransactionalBloggingControllerTest(TransactionalTestDatabaseFixture fixture)
        => Fixture = fixture;

    public TransactionalTestDatabaseFixture Fixture { get; }
```

Finally, we make our test class disposable, arranging for the fixture's ```Cleanup``` method to be called after each test:

```csharp
public void Dispose()
    => Fixture.Cleanup();
```

Note that since xUnit only ever instantiates the collection fixture once, there is no need for us to use locking around database creation and seeding as we did above.

The full sample code for the above can be viewed here.

<blockquote class="tip">Tip
If you have multiple test classes with tests which modify the database, you can still run them in parallel by having different fixtures, each referencing its own database. Creating and using many test databases isn't problematic and should be done whenever it's helpful.</blockquote>

## Efficient database creation

In the samples above, we used ```EnsureDeleted()``` and ```EnsureCreated()``` before running tests, to make sure we have an up-to-date test database. These operations can be a bit slow in certain databases, which can be a problem as you iterate over code changes and re-run tests over and over. If that's the case, you may want to temporarily comment out ```EnsureDeleted``` in your fixture's constructor: this will reuse the same database across test runs.

If you need to change the model of your database during the development cycle, you may want to consider using a different database model.

## Efficient database cleanup

In this post, I'm going to show you how to clean up the database between tests.

```csharp
using var context = CreateContext();

context.Blogs.RemoveRange(context.Blogs);

context.AddRange(
    new Blog { Name = "Blog1", Url = "http://blog1.com" },
    new Blog { Name = "Blog2", Url = "http://blog2.com" });
context.SaveChanges();
```

This typically isn't the most efficient way to clear out a table. If test speed is a concern, you may want to use raw SQL to delete the table instead:

```sql
DELETE FROM [Blogs];
```

You may want to write your own package to clean up tables in your model.

## Summary

- When testing against a real database, it's worth distinguishing between the following test categories:

  - Read-only tests are relatively simple, and can always execute in parallel against the same database without having to worry about isolation.

  - Write tests are more problematic, but transactions can be used to make sure they're properly isolated.

  - Transactional tests are the most problematic, requiring logic to reset the database back to its original state, as well as disabling parallelization.

- Separating these test categories out into separate classes may avoid confusion and accidental interference between tests.

- Give some thought up-front to your seeded test data, and try to write your tests in a way that won't break too often if that seed data changes.

- Use multiple databases to parallelize tests which modify the database, and possibly also to allow different seed data configurations.

- If test speed is a concern, you may want to look at more efficient techniques for creating your test database, and for cleaning its data between runs.

- Always keep test parallelization and isolation in mind.

Ref: [Testing against your production database system](https://learn.microsoft.com/en-us/ef/core/testing/testing-with-the-database)