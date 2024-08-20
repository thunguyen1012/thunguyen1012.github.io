---
title: Entity Framework - Entity Framework Core - Logging, events, and diagnostics - Microsoft.Extensions.Logging
published: true
date: 2024-08-20 09:42:50
tags: Summary, EFCore
description: Microsoft.Extensions.Logging is an extension of Microsoft.Extensions.Logging.
image:
---

## In this article

 ```Microsoft.Extensions.Logging``` is an extension of ```Microsoft.Extensions.Logging```.

Entity Framework Core (EF Core) fully integrates with ```Microsoft.Extensions.Logging```.

## ASP.NET Core applications

The ```AddDbContext``` or ```AddDbContextExtensions.Logging``` methods of the ```AddDbContext``` or ```AddDbContextExtensions```.

## Other application types

This example shows how to use ASP.NET Core's GenericHost to get the same dependency injection patterns as are used in ASP.NET Core applications.

 ```Microsoft.Extensions.Logging``` can also be used for applications that don't use dependency injection, although simple logging can be easier to set up.

The ```Microsoft.Extensions.Logging``` method returns a loggerFactory instance of the DbContext.

 - EF Core 3.0 and above

 - EF Core 2.1

```csharp
public static readonly ILoggerFactory MyLoggerFactory
    = LoggerFactory.Create(builder => { builder.AddConsole(); });
```

```csharp
public static readonly LoggerFactory MyLoggerFactory
    = new LoggerFactory(new[] { new ConsoleLoggerProvider((_, __) => true, true) });
```

<blockquote class="warning">Warning
In EF Core 2.1, It is very important that applications do not create a new LoggerFactory instance for each DbContext instance. Doing so will result in a memory leak and poor performance. This has been fixed in EF Core 3.0 and above.</blockquote>

This singleton/global instance should then be registered with EF Core on the ```DbContextOptionsBuilder```. For example:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder
        .UseLoggerFactory(MyLoggerFactory)
        .UseSqlServer(@"Server=(localdb)\mssqllocaldb;Database=EFLogging;Trusted_Connection=True;ConnectRetryCount=0");
```

## Getting detailed messages

<blockquote class="tip">Tip
```OnConfiguring``` is still called when ```AddDbContext``` is used or a ```DbContextOptions``` instance is passed to the DbContext constructor. This makes it the ideal place to apply context configuration regardless of how the DbContext is constructed.</blockquote>

### Sensitive data

An exception message should be sent to EF Core if there is a problem with any of the following:

However, knowing data values, especially for keys, can be very helpful when debugging. This can be enabled in EF Core by calling ```EnableSensitiveDataLogging()```. For example:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder.EnableSensitiveDataLogging();
```

### Detailed query exceptions

This article describes how to diagnose exceptions in the EF Core database.

Turning on ```EnableDetailedErrors``` will cause EF to introduce these try-catch blocks and thereby provide more detailed errors. For example:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder.EnableDetailedErrors();
```

## Configuration for specific messages

The EF Core ```ConfigureWarnings``` API allows applications to change what happens when a specific event is encountered. This can be used to:

- Change the log level at which the event is logged

- Skip logging the event altogether

- Throw an exception when the event occurs

### Changing the log level for an event

Sometimes it can be useful to change the pre-defined log level for an event. For example, this can be used to promote two additional events from ```LogLevel.Debug``` to ```LogLevel.Information```:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder
        .ConfigureWarnings(
            b => b.Log(
                (RelationalEventId.ConnectionOpened, LogLevel.Information),
                (RelationalEventId.ConnectionClosed, LogLevel.Information)));
```

### Suppress logging an event

In a similar way, an individual event can be suppressed from logging. This is particularly useful for ignoring a warning that has been reviewed and understood. For example:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder
        .ConfigureWarnings(b => b.Ignore(CoreEventId.DetachedLazyLoadingWarning));
```

### Throw for an event

EF Core is a wrapper around the existing EFWarnings method.

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder
        .ConfigureWarnings(b => b.Throw(RelationalEventId.QueryPossibleUnintendedUseOfEqualsWarning));
```

## Filtering and other configuration

See Logging in .NET for guidance on log filtering and other configuration.

EF Core logging events are defined in one of:

- ```CoreEventId``` for events common to all EF Core database providers

- ```RelationalEventId``` for events common to all relational database providers

- A similar class for events specific to the current database provider. For example, ```SqlServerEventId``` for the SQL Server provider.

These definitions contain the event IDs, log level, and category for each event, as used by ```Microsoft.Extensions.Logging```.

Ref: [Using ```Microsoft.Extensions.Logging``` in EF Core](https://learn.microsoft.com/en-us/ef/core/logging-events-diagnostics/extensions-logging)