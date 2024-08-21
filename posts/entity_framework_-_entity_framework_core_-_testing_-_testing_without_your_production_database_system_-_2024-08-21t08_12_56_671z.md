---
title: Entity Framework - Entity Framework Core - Testing - Testing without your production database system
published: true
date: 2024-08-21 08:12:56
tags: Summary, EFCore
description: In this page, we discuss techniques for writing automated tests which do not involve the database system against which the application runs in production, by swapping your database with a test double. There are various types of test doubles and approaches for doing this, and it's recommended to thoroughly read Choosing a testing strategy to fully understand the different options. Finally, it's also possible to test against your production database system; this is covered in Testing against your production database system.
image:
---

## In this article

It's possible to write automated tests which do not involve the database system against which the application runs in production, by swapping your database with a test double.

<blockquote class="tip">Tip
This page shows xUnit techniques, but similar concepts exist in other testing frameworks, including NUnit.</blockquote>

## Repository pattern

If you've decided to write tests without involving your production database system, then the recommended technique for doing so is the repository pattern:

```csharp
public interface IBloggingRepository
{
    Blog GetBlogByName(string name);

    IEnumerable<Blog> GetAllBlogs();

    void AddBlog(Blog blog);

    void SaveChanges();
}
```

... and here's a partial sample implementation for production use:

```csharp
public class BloggingRepository : IBloggingRepository
{
    private readonly BloggingContext _context;

    public BloggingRepository(BloggingContext context)
        => _context = context;

    public Blog GetBlogByName(string name)
        => _context.Blogs.FirstOrDefault(b => b.Name == name);

    // Other code...
}
```

There's not much to it: the repository simply wraps an EF Core context, and exposes methods which execute the database queries and updates on it. A key point to note is that our ```GetAllBlogs``` method returns ```IEnumerable<Blog>```, and not ```IQueryable<Blog>```. Returning the latter would mean that query operators can still be composed over the result, requiring that EF Core still be involved in translating the query; this would defeat the purpose of having a repository in the first place. ```IEnumerable<Blog>``` allows us to easily stub or mock what the repository returns.

For an ASP.NET Core application, we need to register the repository as a service in dependency injection by adding the following to the application's ```ConfigureServices```:

```csharp
services.AddScoped<IBloggingRepository, BloggingRepository>();
```

Finally, our controllers get injected with the repository service instead of the EF Core context, and execute methods on it:

```csharp
private readonly IBloggingRepository _repository;

public BloggingControllerWithRepository(IBloggingRepository repository)
    => _repository = repository;

[HttpGet]
public Blog GetBlog(string name)
    => _repository.GetBlogByName(name);
```

You've written your application, and now it's time to write your tests.

```csharp
[Fact]
public void GetBlog()
{
    // Arrange
    var repositoryMock = new Mock<IBloggingRepository>();
    repositoryMock
        .Setup(r => r.GetBlogByName("Blog2"))
        .Returns(new Blog { Name = "Blog2", Url = "http://blog2.com" });

    var controller = new BloggingControllerWithRepository(repositoryMock.Object);

    // Act
    var blog = controller.GetBlog("Blog2");

    // Assert
    repositoryMock.Verify(r => r.GetBlogByName("Blog2"));
    Assert.Equal("http://blog2.com", blog.Url);
}
```

The full sample code can be viewed here.

## SQLite in-memory

The EF Core database system can be used as an in-memory database when testing, since it provides easy isolation between tests and does not require dealing with actual files.

To use in-memory SQLite, it's important to understand that a new database is created whenever a low-level connection is opened, and that it's deleted when that connection is closed. In normal usage, EF Core's ```DbContext``` opens and closes database connections as needed - every time a query is executed - to avoid keeping connection for unnecessarily long times. However, with in-memory SQLite this would lead to resetting the database every time; so as a workaround, we open the connection before passing it to EF Core, and arrange for it to be closed only when the test completes:

```csharp
public SqliteInMemoryBloggingControllerTest()
    {
        // Create and open a connection. This creates the SQLite in-memory database, which will persist until the connection is closed
        // at the end of the test (see Dispose below).
        _connection = new SqliteConnection("Filename=:memory:");
        _connection.Open();

        // These options will be used by the context instances in this test suite, including the connection opened above.
        _contextOptions = new DbContextOptionsBuilder<BloggingContext>()
            .UseSqlite(_connection)
            .Options;

        // Create the schema and seed some data
        using var context = new BloggingContext(_contextOptions);

        if (context.Database.EnsureCreated())
        {
            using var viewCommand = context.Database.GetDbConnection().CreateCommand();
            viewCommand.CommandText = @"
CREATE VIEW AllResources AS
SELECT Url
FROM Blogs;";
            viewCommand.ExecuteNonQuery();
        }

        context.AddRange(
            new Blog { Name = "Blog1", Url = "http://blog1.com" },
            new Blog { Name = "Blog2", Url = "http://blog2.com" });
        context.SaveChanges();
    }

    BloggingContext CreateContext() => new BloggingContext(_contextOptions);

    public void Dispose() => _connection.Dispose();
```

Tests can now call ```CreateContext```, which returns a context using the connection we set up in the constructor, ensuring we have a clean database with the seeded data.

The full sample code for SQLite in-memory testing can be viewed here.

## In-memory provider

In this article, I'm going to show you how to use in-memory databases for testing.

```csharp
public InMemoryBloggingControllerTest()
{
    _contextOptions = new DbContextOptionsBuilder<BloggingContext>()
        .UseInMemoryDatabase("BloggingControllerTest")
        .ConfigureWarnings(b => b.Ignore(InMemoryEventId.TransactionIgnoredWarning))
        .Options;

    using var context = new BloggingContext(_contextOptions);

    context.Database.EnsureDeleted();
    context.Database.EnsureCreated();

    context.AddRange(
        new Blog { Name = "Blog1", Url = "http://blog1.com" },
        new Blog { Name = "Blog2", Url = "http://blog2.com" });

    context.SaveChanges();
}
```

The full sample code for in-memory testing can be viewed here.

### In-memory database naming

In-memory databases are identified by a simple, string name, and it's possible to connect to the same database several times by providing the same name (this is why the sample above must call ```EnsureDeleted``` before each test). However, note that in-memory databases are rooted in the context's internal service provider; while in most cases contexts share the same service provider, configuring contexts with different options may trigger the use of a new internal service provider. When that's the case, explicitly pass the same instance of ```InMemoryDatabaseRoot``` to ```UseInMemoryDatabase``` for all contexts which should share in-memory databases (this is typically done by having a static ```InMemoryDatabaseRoot``` field).

### Transactions

Note that by default, if a transaction is started, the in-memory provider will throw an exception since transactions aren't supported. You may wish to have transactions silently ignored instead, by configuring EF Core to ignore ```InMemoryEventId.TransactionIgnoredWarning``` as in the above sample. However, if your code actually relies on transactional semantics - e.g. depends on rollback actually rolling back changes - your test won't work.

### Views

The in-memory provider allows the definition of views via LINQ queries, using ToInMemoryQuery:

```csharp
modelBuilder.Entity<UrlResource>()
    .ToInMemoryQuery(() => context.Blogs.Select(b => new UrlResource { Url = b.Url }));
```

Ref: [Testing without your production database system](https://learn.microsoft.com/en-us/ef/core/testing/testing-without-the-database)