---
title: Entity Framework - Entity Framework Core - DbContext configuration and initialization - Overview
published: true
date: 2024-07-22 03:07:55
tags: EFCore, Summary
description: This article shows basic patterns for initialization and configuration of a DbContext instance.
image:
---
- Article

  - 02/18/2023

  - 9 contributors

## In this article

This article shows basic patterns for initialization and configuration of a ```DbContext``` instance.

## The ```DbContext``` lifetime

The lifetime of a ```DbContext``` instance is the length of the lifetime of the instance itself.

> Tip
To quote Martin Fowler from the link above, "A Unit of Work keeps track of everything you do during a business transaction that can affect the database. When you're done, it figures out everything that needs to be done to alter the database as a result of your work."

A typical unit-of-work when using Entity Framework Core (EF Core) involves:

- Creation of a ```DbContext``` instance

- Tracking of entity instances by the context. Entities become tracked by

  - Being returned from a query

  - Being added or attached to the context

- Changes are made to the tracked entities as needed to implement the business rule

- SaveChanges or SaveChangesAsync is called. EF Core detects the changes made and writes them to the database.

- The ```DbContext``` instance is disposed

> Important

It is very important to dispose the ```DbContext``` after use. This ensures both that any unmanaged resources are freed, and that any events or other hooks are unregistered so as to prevent memory leaks in case the instance remains referenced.
DbContext is not thread-safe. Do not share contexts between threads. Make sure to ```await``` all async calls before continuing to use the context instance.
An ```InvalidOperationException``` thrown by EF Core code can put the context into an unrecoverable state. Such exceptions indicate a program error and are not designed to be recovered from.

 - It is very important to dispose the ```DbContext``` after use. This ensures both that any unmanaged resources are freed, and that any events or other hooks are unregistered so as to prevent memory leaks in case the instance remains referenced.

 - ```DbContext``` is not thread-safe. Do not share contexts between threads. Make sure to ```await``` all async calls before continuing to use the context instance.

 - An ```InvalidOperationException``` thrown by EF Core code can put the context into an unrecoverable state. Such exceptions indicate a program error and are not designed to be recovered from.

## ```DbContext``` in dependency injection for ASP.NET Core

In many web applications, each HTTP request corresponds to a single unit-of-work. This makes tying the context lifetime to that of the request a good default for web applications.

ASP.NET Core applications are configured using dependency injection. EF Core can be added to this configuration using ```AddDbContext``` in the ```ConfigureServices``` method of ```Startup.cs```. For example:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();

    services.AddDbContext<ApplicationDbContext>(
        options => options.UseSqlServer("name=ConnectionStrings:DefaultConnection"));
}
```

This example registers a ```DbContext``` subclass called ```ApplicationDbContext``` as a scoped service in the ASP.NET Core application service provider.

The ```ApplicationDbContext``` class must expose a public constructor with a DbContextOptionsApplicationDbContext> parameter.

```csharp
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
}
```

 ```ApplicationDbContext``` can then be used in ASP.NET Core controllers or other services through constructor injection. For example:

```csharp
public class MyController
{
    private readonly ApplicationDbContext _context;

    public MyController(ApplicationDbContext context)
    {
        _context = context;
    }
}
```

The final result is an ```ApplicationDbContext``` instance created for each request and passed to the controller to perform a unit-of-work before being disposed when the request ends.

In this article, you'll learn how to create a ```new``` app in ASP.NET Core.

## Simple ```DbContext``` initialization with 'new'

 ```DbContext``` instances can be constructed in the normal .NET way, for example by overriding the Onuring method, or by passing options to the constructor.

```csharp
public class ApplicationDbContext : DbContext
{
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlServer(@"Server=(localdb)\mssqllocaldb;Database=Test;ConnectRetryCount=0");
    }
}
```

This pattern also makes it easy to pass configuration like the connection string via the ```DbContext``` constructor. For example:

```csharp
public class ApplicationDbContext : DbContext
{
    private readonly string _connectionString;

    public ApplicationDbContext(string connectionString)
    {
        _connectionString = connectionString;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlServer(_connectionString);
    }
}
```

 ```DbContextOptionsBuilder``` can be used to create a ```DbContextOptions``` object that is then passed to the ```DbContext``` constructor.

```csharp
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
}
```

The ```DbContextOptions``` can be created and the constructor can be called explicitly:

```csharp
var contextOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
    .UseSqlServer(@"Server=(localdb)\mssqllocaldb;Database=Test;ConnectRetryCount=0")
    .Options;

using var context = new ApplicationDbContext(contextOptions);
```

## Using a ```DbContext``` factory (e.g. for Blazor)

This article describes how to create a service scope that aligns with the desired ```DbContext``` lifetime.

In these cases, AddDbContextFactory can be used to register a factory for creation of ```DbContext``` instances. For example:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddDbContextFactory<ApplicationDbContext>(
        options =>
            options.UseSqlServer(@"Server=(localdb)\mssqllocaldb;Database=Test;ConnectRetryCount=0"));
}
```

The ```ApplicationDbContext``` class must expose a public constructor with a ```DbContextOptions```<ApplicationDbContext> parameter. This is the same pattern as used in the traditional ASP.NET Core section above.

```csharp
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
}
```

The ```DbContextFactory``` factory can then be used in other services through constructor injection. For example:

```csharp
private readonly IDbContextFactory<ApplicationDbContext> _contextFactory;

public MyController(IDbContextFactory<ApplicationDbContext> contextFactory)
{
    _contextFactory = contextFactory;
}
```

The injected factory can then be used to construct ```DbContext``` instances in the service code. For example:

```csharp
public void DoSomething()
{
    using (var context = _contextFactory.CreateDbContext())
    {
        // ...
    }
}
```

Notice that the ```DbContext``` instances created in this way are not managed by the application's service provider and therefore must be disposed by the application.

See ASP.NET Core Blazor Server with Entity Framework Core for more information on using EF Core with Blazor.

## ```DbContextOptions```

The starting point for all ```DbContext``` configuration is ```DbContextOptionsBuilder```. There are three ways to get this builder:

- In ```AddDbContext``` and related methods

- In ```OnConfiguring```

- Constructed explicitly with ```new```

Onuring can be used to perform any of the following:

### Configuring the database provider

 ```DbContext``` instances can be configured to use any database provider.

```csharp
public class ApplicationDbContext : DbContext
{
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlServer(@"Server=(localdb)\mssqllocaldb;Database=Test;ConnectRetryCount=0");
    }
}
```

These Use* methods are extension methods implemented by the database provider. This means that the database provider NuGet package must be installed before the extension method can be used.

> Tip
EF Core database providers make extensive use of extension methods. If the compiler indicates that a method cannot be found, then make sure that the provider's NuGet package is installed and that you have using Microsoft.EntityFrameworkCore; in your code.

The following table contains examples for common database providers.

*These database providers are not shipped by Microsoft. See Database Providers for more information about database providers.

> Warning
The EF Core in-memory database is not designed for production use. In addition, it may not be the best choice even for testing. See Testing Code That Uses EF Core for more information.

See Connection Strings for more information on using connection strings with EF Core.

This article describes how to connect to Azure SQL using the built-in connection builder.

```csharp
public class ApplicationDbContext : DbContext
{
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder
            .UseSqlServer(
                @"Server=(localdb)\mssqllocaldb;Database=Test",
                providerOptions => { providerOptions.EnableRetryOnFailure(); });
    }
}
```

> Tip
The same database provider is used for SQL Server and Azure SQL. However, it is recommended that connection resiliency be used when connecting to SQL Azure.

See Database Providers for more information on provider-specific configuration.

### Other ```DbContext``` configuration

Other ```DbContext``` configuration can be chained either before or after (it makes no difference which) the Use* call. For example, to turn on sensitive-data logging:

```csharp
public class ApplicationDbContext : DbContext
{
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder
            .EnableSensitiveDataLogging()
            .UseSqlServer(@"Server=(localdb)\mssqllocaldb;Database=Test;ConnectRetryCount=0");
    }
}
```

The following table contains examples of common methods called on ```DbContextOptionsBuilder```.

> Note
UseLazyLoadingProxies and UseChangeTrackingProxies are extension methods from the Microsoft.EntityFrameworkCore.Proxies NuGet package. This kind of ".UseSomething()" call is the recommended way to configure and/or use EF Core extensions contained in other packages.

### ```DbContextOptions``` versus ```DbContextOptions```<TContext>

Most ```DbContext``` subclasses that accept a ```DbContextOptions``` should use the generic ```DbContextOptions```<TContext> variation. For example:

```csharp
public sealed class SealedApplicationDbContext : DbContext
{
    public SealedApplicationDbContext(DbContextOptions<SealedApplicationDbContext> contextOptions)
        : base(contextOptions)
    {
    }
}
```

This ensures that the correct options for the specific ```DbContext``` subtype are resolved from dependency injection, even when multiple ```DbContext``` subtypes are registered.

> Tip
Your ```DbContext``` does not need to be sealed, but sealing is best practice to do so for classes not designed to be inherited from.

However, if the ```DbContext``` subtype is itself intended to be inherited from, then it should expose a protected constructor taking a non-generic ```DbContextOptions```. For example:

```csharp
public abstract class ApplicationDbContextBase : DbContext
{
    protected ApplicationDbContextBase(DbContextOptions contextOptions)
        : base(contextOptions)
    {
    }
}
```

This allows multiple concrete subclasses to call this base constructor using their different generic ```DbContextOptions```<TContext> instances. For example:

```csharp
public sealed class ApplicationDbContext1 : ApplicationDbContextBase
{
    public ApplicationDbContext1(DbContextOptions<ApplicationDbContext1> contextOptions)
        : base(contextOptions)
    {
    }
}

public sealed class ApplicationDbContext2 : ApplicationDbContextBase
{
    public ApplicationDbContext2(DbContextOptions<ApplicationDbContext2> contextOptions)
        : base(contextOptions)
    {
    }
}
```

Notice that this is exactly the same pattern as when inheriting from ```DbContext``` directly. That is, the ```DbContext``` constructor itself accepts a non-generic ```DbContextOptions``` for this reason.

A ```DbContext``` subclass intended to be both instantiated and inherited from should expose both forms of constructor. For example:

```csharp
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> contextOptions)
        : base(contextOptions)
    {
    }

    protected ApplicationDbContext(DbContextOptions contextOptions)
        : base(contextOptions)
    {
    }
}
```

## Design-time ```DbContext``` configuration

This article describes how to create a ```DbContext``` in an EF Core design-time tool.

DbContexts can be used at run-time or at design-time.

## Avoiding ```DbContext``` threading issues

Entity Framework Core does not support multiple parallel operations being run on the same ```DbContext``` instance.

When EF Core detects an attempt to use a ```DbContext``` instance concurrently, you'll see an ```InvalidOperationException``` with a message like this:

When concurrent access goes undetected, it can result in undefined behavior, application crashes and data corruption.

There are common mistakes that can inadvertently cause concurrent access on the same ```DbContext``` instance:

### Asynchronous operation pitfalls

Asynchronous methods can cause EF Core to be corrupted.

Always ```await``` EF Core asynchronous methods immediately.

### Implicitly sharing ```DbContext``` instances via dependency injection

The ```AddDbContext``` extension method registers ```DbContext``` types with a scoped lifetime by default.

One logical request is made to a ```DbContext``` instance for maintaining a Blazor user circuit. For Blazor Server hosting model, one logical request is used for maintaining the Blazor user circuit, and thus only one scoped ```DbContext``` instance is available per user circuit if the default injection scope is used.

Any code that explicitly executes multiple threads in parallel should ensure that ```DbContext``` instances aren't ever accessed concurrently.

The ```DbContext``` can be defined as a scoped context, or as a transient context.

## More reading

- Read Dependency Injection to learn more about using DI.

- Read Testing for more information.

Ref: [DbContext Lifetime, Configuration, and Initialization](https://learn.microsoft.com/en-us/ef/core/dbcontext-configuration/)