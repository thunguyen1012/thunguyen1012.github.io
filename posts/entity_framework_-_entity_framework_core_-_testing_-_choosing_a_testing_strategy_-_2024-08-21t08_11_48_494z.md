---
title: Entity Framework - Entity Framework Core - Testing - Choosing a testing strategy
published: true
date: 2024-08-21 08:11:48
tags: Summary, EFCore
description: As discussed in the Overview, a basic decision you need to make is whether your tests will involve your production database system - just as your application does - or whether your tests will run against a test double, which replaces your production database system.
image:
---

## In this article

In this article, you'll find out how to write tests that run against your production database system.

Testing against a real external resource - rather than replacing it with a test double - can involve the following difficulties:

- In many cases, it's simply not possible or practical to test against the actual external resource. For example, your application may interact with some service that cannot be easily tested against (because of rate limiting, or the lack of a testing environment).

- Even when it's possible to involve the real external resource, this may be exceedingly slow: running a large amount of tests against a cloud service may cause tests to take too long. Testing should be part of the developer's everyday workflow, so it's important that tests run quickly.

- Executing tests against an external resource may involve isolation issues, where tests interfere with one another. For example, multiple tests running in parallel against a database may modify data and cause each other to fail in various ways. Using a test double avoids this, as each test runs against its own, in-memory resource, and is therefore naturally isolated from other tests.

A database test double checks that your program can run against a real production database system.

## Testing against the database may be easier than it seems

There are a number of problems with testing against a real database, including:

- Most databases can nowadays be easily installed on the developer's machine. Container-based technologies such as Docker can make this very easy, and technologies such as Github Workspaces and Dev Container set up your entire development environment for you (including the database). When using SQL Server, it's also possible to test against LocalDB on Windows, or easily set up a Docker image on Linux.

- Testing against a local database - with a reasonable test dataset - is usually extremely fast: communication is completely local, and test data is typically buffered in memory on the database side. EF Core itself contains over 30,000 tests against SQL Server alone; these complete reliably in a few minutes, execute in CI on every single commit, and are very frequently executed by developers locally. Some developers turn to an in-memory database (a "fake") in the belief that this is needed for speed - this is almost never actually the case.

- Isolation is indeed a hurdle when running tests against a real database, as tests may modify data and interfere with one another. However, there are various techniques to provide isolation in database testing scenarios; we concentrate on these in Testing against your production database system).

If you're testing against a production database system, it's a good idea to write isolated tests against your database, rather than test doubles.

## Different types of test doubles

Test doubles is a broad term which encompasses very different approaches. This section covers some common techniques involving test doubles for testing EF Core applications:

- Use SQLite (in-memory mode) as a database fake, replacing your production database system.

- Use the EF Core in-memory provider as a database fake, replacing your production database system.

- Mock or stub out ```DbContext``` and ```DbSet```.

- Introduce a repository layer between EF Core and your application code, and mock or stub that layer.

In this article, we'll be looking at the different ways in which you can write tests.

### SQLite as a database fake

There are a number of ways to test your software.

In this article, I'm going to show you how to test against EF Core against SQL Server.

- The same LINQ query may return different results on different providers. For example, SQL Server does case-insensitive string comparison by default, whereas SQLite is case-sensitive. This can make your tests pass against SQLite where they would fail against SQL Server (or vice versa).

- Some queries which work on SQL Server simply aren't supported on SQLite, because the exact SQL support in these two database differs.

- If your query happens to use a provider-specific method such as SQL Server's ```EF.Functions.DateDiffDay```, that query will fail on SQLite, and cannot be tested.

- Raw SQL may work, or it may fail or return different results, depending on exactly what is being done. SQL dialects are different in many ways across databases.

In this article, we'll look at how to write tests against your production database system.

For information on how to use SQLite for testing, see this section.

### In-memory as a database fake

EF Core is a database-as-a-service (DB-as-a-service) that allows developers to build, run, and test applications on a single database.

- The in-memory provider generally supports fewer query types than the SQLite provider, since it isn't a relational database. More queries will fail or behave differently in comparison to your production database.

- Transactions are not supported.

- Raw SQL is completely unsupported. Compare this with SQLite, where it's possible to use raw SQL, as long as that SQL works in the same way on SQLite and your production database.

- The in-memory provider has not been optimized for performance, and will generally work slower than SQLite in in-memory mode (or even your production database system).

In-memory databases are often used to store large amounts of data.

For information on how to use in-memory for testing, see the see this section.

### Mocking or stubbing ```DbContext``` and ```DbSet```

This approach typically uses a mock framework to create a test double of ```DbContext``` and ```DbSet```, and tests against those doubles. Mocking ```DbContext``` can be a good approach for testing various non-query functionality, such as calls to ```Add``` or ```SaveChanges()```, allowing you to verify that your code called them in write scenarios.

However, properly mocking ```DbSet``` query functionality is not possible, since queries are expressed via LINQ operators, which are static extension method calls over ```IQueryable```. As a result, when some people talk about "mocking ```DbSet```", what they really mean is that they create a ```DbSet``` backed by an in-memory collection, and then evaluate query operators against that collection in memory, just like a simple ```IEnumerable```. Rather than a mock, this is actually a sort of fake, where the in-memory collection replaces the the real database.

Since only the ```DbSet``` itself is faked and the query is evaluated in-memory, this approach ends up being very similar to using the EF Core in-memory provider: both techniques execute query operators in .NET over an in-memory collection. As a result, this technique suffers from the same drawbacks as well: queries will behave differently (e.g. around case sensitivity) or will simply fail (e.g. because of provider-specific methods), raw SQL won't work and transactions will be ignored at best. As a result, this technique should generally be avoided for testing any query code.

### Repository pattern

The approaches above attempted to either swap EF Core's production database provider with a fake testing provider, or to create a ```DbSet``` backed by an in-memory collection. These techniques are similar in that they still evaluate the program's LINQ queries - either in SQLite or in memory - and this is ultimately the source of the difficulties outlined above: a query designed to execute against a specific production database cannot reliably execute elsewhere without issues.

In this article, I'm going to show you how to perform a proper test double between your application code and EF Core.

The following diagram compares the database fake approach (SQLite/in-memory) with the repository pattern:



Since LINQ queries are no longer part of testing, you can directly provide query results to your application. Put another way, the previous approaches roughly allow stubbing out query inputs (e.g. replacing SQL Server tables with in-memory ones), but then still execute the actual query operators in-memory. The repository pattern, in contrast, allows you to stub out query outputs directly, allowing for far more powerful and focused unit testing. Note that for this to work, your repository cannot expose any ```IQueryable```-returning methods, as these once again cannot be stubbed out; ```IEnumerable``` should be returned instead.

However, since the repository pattern requires encapsulating each and every (testable) LINQ query in an ```IEnumerable```-returning method, it imposes an additional architectural layer on your application, and can incur significant cost to implement and maintain. This cost should not be discounted when making a choice on how to test an application, especially given that tests against the real database are still likely to be needed for the queries exposed by the repository.

In this post I'm going to look at some of the benefits of repositories for testing your application.

For a sample showing testing with a repository, see this section.

## Overall comparison

The following table provides a quick, comparative view of the different testing techniques, and shows which functionality can be tested under which approach:

<table><thead>
<tr>
<th>Feature</th>
<th>In-memory</th>
<th>SQLite in-memory</th>
<th>Mock ```DbContext```</th>
<th>Repository pattern</th>
<th>Testing against the database</th>
</tr>
</thead>
<tbody>
<tr>
<td>Test double type</td>
<td>Fake</td>
<td>Fake</td>
<td>Fake</td>
<td>Mock/stub</td>
<td>Real, no double</td>
</tr>
<tr>
<td>Raw SQL?</td>
<td>No</td>
<td>Depends</td>
<td>No</td>
<td>Yes</td>
<td>Yes</td>
</tr>
<tr>
<td>Transactions?</td>
<td>No (ignored)</td>
<td>Yes</td>
<td>Yes</td>
<td>Yes</td>
<td>Yes</td>
</tr>
<tr>
<td>Provider-specific translations?</td>
<td>No</td>
<td>No</td>
<td>No</td>
<td>Yes</td>
<td>Yes</td>
</tr>
<tr>
<td>Exact query behavior?</td>
<td>Depends</td>
<td>Depends</td>
<td>Depends</td>
<td>Yes</td>
<td>Yes</td>
</tr>
<tr>
<td>Can use LINQ anywhere in the application?</td>
<td>Yes</td>
<td>Yes</td>
<td>Yes</td>
<td>No*</td>
<td>Yes</td>
</tr>
</tbody></table>

* All testable database LINQ queries must be encapsulated in ```IEnumerable```-returning repository methods, in order to be stubbed/mocked.

## Summary

- We recommend that developers have good test coverage of their application running against their actual production database system. This provides confidence that the application actually works in production, and with proper design, tests can execute reliably and quickly. Since these tests are required in any case, it's a good idea to start there, and if needed, add tests using test doubles later, as required.

- If you've decided to use a test double, we recommend implementing the repository pattern, which allows you to stub or mock out your data access layer above EF Core, rather than using a fake EF Core provider (Sqlite/in-memory) or by mocking ```DbSet```.

- If the repository pattern isn't a viable option for some reason, consider using SQLite in-memory databases.

- Avoid the in-memory provider for testing purposes - this is discouraged and only supported for legacy applications.

- Avoid mocking ```DbSet``` for querying purposes.

Ref: [Choosing a testing strategy](https://learn.microsoft.com/en-us/ef/core/testing/choosing-a-testing-strategy)