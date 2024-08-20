---
title: Entity Framework - Entity Framework Core - Logging, events, and diagnostics - Simple logging
published: true
date: 2024-08-20 09:42:24
tags: Summary, EFCore
description: Entity Framework Core (EF Core) simple logging can be used to easily obtain logs while developing and debugging applications.
image:
---

## In this article

<blockquote class="tip">Tip
You can download this article's sample from GitHub.</blockquote>

Entity Framework Core (EF Core) simple logging can be used to easily obtain logs while developing and debugging applications.

<blockquote class="tip">Tip
EF Core also integrates with ```Microsoft.Extensions.Logging```, which requires more configuration, but is often more suitable for logging in production applications.</blockquote>

## Configuration

EF Core logs can be accessed from any type of application through the use of ```LogTo``` when configuring a ```DbContext``` instance.

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder.LogTo(Console.WriteLine);
```

Alternately, ```LogTo``` can be called as part of ```AddDbContext``` or when creating a ```DbContextOptions``` instance to pass to the ```DbContext``` constructor.

<blockquote class="tip">Tip
```OnConfiguring``` is still called when ```AddDbContext``` is used or a ```DbContextOptions``` instance is passed to the ```DbContext``` constructor. This makes it the ideal place to apply context configuration regardless of how the ```DbContext``` is constructed.</blockquote>

## Directing the logs

### Logging to the console

This example shows how to generate a log message using EF Core.

The ```Console.WriteLine``` method is often used for this delegate, as shown above. This results in each log message being written to the console.

### Logging to the debug window

This example shows how to use the Lambda.WriteLine class to send an output window to another application.

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder.LogTo(message => Debug.WriteLine(message));
```

### Logging to a file

The following examples show how to write to a file using the WriteLine method.

```csharp
private readonly StreamWriter _logStream = new StreamWriter("mylog.txt", append: true);

protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder.LogTo(_logStream.WriteLine);

public override void Dispose()
{
    base.Dispose();
    _logStream.Dispose();
}

public override async ValueTask DisposeAsync()
{
    await base.DisposeAsync();
    await _logStream.DisposeAsync();
}
```

<blockquote class="tip">Tip
Consider using ```Microsoft.Extensions.Logging``` for logging to files in production applications.</blockquote>

## Getting detailed messages

### Sensitive data

An exception message should be sent to EF Core if there is a problem with any of the following:

However, knowing data values, especially for keys, can be very helpful when debugging. This can be enabled in EF Core by calling ```EnableSensitiveDataLogging()```. For example:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder
        .LogTo(Console.WriteLine)
        .EnableSensitiveDataLogging();
```

### Detailed query exceptions

This article describes how to diagnose exceptions in the EF Core database.

Turning on ```EnableDetailedErrors``` will cause EF to introduce these try-catch blocks and thereby provide more detailed errors. For example:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder
        .LogTo(Console.WriteLine)
        .EnableDetailedErrors();
```

## Filtering

### ```Log``` levels

EF Core logs all messages sent to the EF Core database.

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder.LogTo(Console.WriteLine, LogLevel.Information);
```

### Specific messages

A log message is a collection of messages sent to an event server by an application.

 ```LogTo``` can be configured to only log the messages associated with one or more event IDs. For example, to log only messages for the context being initialized or disposed:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder
        .LogTo(Console.WriteLine, new[] { CoreEventId.ContextDisposed, CoreEventId.ContextInitialized });
```

### Message categories

Every log message is assigned to a named hierarchical logger category. The categories are:

<table><thead>
<tr>
<th style="text-align: left;">Category</th>
<th>Messages</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">Microsoft.EntityFrameworkCore</td>
<td>All EF Core messages</td>
</tr>
<tr>
<td style="text-align: left;">Microsoft.EntityFrameworkCore.Database</td>
<td>All database interactions</td>
</tr>
<tr>
<td style="text-align: left;">Microsoft.EntityFrameworkCore.Database.Connection</td>
<td>Uses of a database connection</td>
</tr>
<tr>
<td style="text-align: left;">Microsoft.EntityFrameworkCore.Database.Command</td>
<td>Uses of a database command</td>
</tr>
<tr>
<td style="text-align: left;">Microsoft.EntityFrameworkCore.Database.Transaction</td>
<td>Uses of a database transaction</td>
</tr>
<tr>
<td style="text-align: left;">Microsoft.EntityFrameworkCore.Update</td>
<td>Saving entities, excluding database interactions</td>
</tr>
<tr>
<td style="text-align: left;">Microsoft.EntityFrameworkCore.Model</td>
<td>All model and metadata interactions</td>
</tr>
<tr>
<td style="text-align: left;">Microsoft.EntityFrameworkCore.Model.Validation</td>
<td>Model validation</td>
</tr>
<tr>
<td style="text-align: left;">Microsoft.EntityFrameworkCore.Query</td>
<td>Queries, excluding database interactions</td>
</tr>
<tr>
<td style="text-align: left;">Microsoft.EntityFrameworkCore.Infrastructure</td>
<td>General events, such as context creation</td>
</tr>
<tr>
<td style="text-align: left;">Microsoft.EntityFrameworkCore.Scaffolding</td>
<td>Database reverse engineering</td>
</tr>
<tr>
<td style="text-align: left;">Microsoft.EntityFrameworkCore.Migrations</td>
<td>Migrations</td>
</tr>
<tr>
<td style="text-align: left;">Microsoft.EntityFrameworkCore.ChangeTracking</td>
<td>Change tracking interactions</td>
</tr>
</tbody></table>

 ```LogTo``` can be configured to only log the messages from one or more categories. For example, to log only database interactions:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder
        .LogTo(Console.WriteLine, new[] { DbLoggerCategory.Database.Name });
```

Notice that the DbLoggerCategory class provides a hierarchical API for finding a category and avoids the need to hard-code strings.

Since categories are hierarchical, this example using the ```Database``` category will include all messages for the subcategories ```Database.Connection```, ```Database.Command```, and ```Database.Transaction```.

### Custom filters

 ```LogTo``` allows a custom filter to be used for cases where none of the filtering options above are sufficient.

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder
        .LogTo(
            Console.WriteLine,
            (eventId, logLevel) => logLevel >= LogLevel.Information
                                   || eventId == RelationalEventId.ConnectionOpened
                                   || eventId == RelationalEventId.ConnectionClosed);
```

<blockquote class="tip">Tip
Filtering using custom filters or using any of the other options shown here is more efficient than filtering in the ```LogTo``` delegate. This is because if the filter determines the message should not be logged, then the log message is not even created.</blockquote>

## Configuration for specific messages

The EF Core ```ConfigureWarnings``` API allows applications to change what happens when a specific event is encountered. This can be used to:

- Change the log level at which the event is logged

- Skip logging the event altogether

- Throw an exception when the event occurs

### Changing the log level for an event

This example shows how to change the log level of a message.

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder
        .ConfigureWarnings(
            b => b.Log(
                (RelationalEventId.ConnectionOpened, LogLevel.Information),
                (RelationalEventId.ConnectionClosed, LogLevel.Information)))
        .LogTo(Console.WriteLine, LogLevel.Information);
```

### Suppress logging an event

In a similar way, an individual event can be suppressed from logging. This is particularly useful for ignoring a warning that has been reviewed and understood. For example:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder
        .ConfigureWarnings(b => b.Ignore(CoreEventId.DetachedLazyLoadingWarning))
        .LogTo(Console.WriteLine);
```

### Throw for an event

EF Core is a wrapper around the existing EFWarnings method.

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder
        .ConfigureWarnings(b => b.Throw(RelationalEventId.MultipleCollectionIncludeWarning))
        .LogTo(Console.WriteLine);
```

## Message contents and formatting

The default content from ```LogTo``` is formatted across multiple lines. The first line contains message metadata:

- The ```LogLevel``` as a four-character prefix

- A local timestamp, formatted for the current culture

- The ```EventId``` in the form that can be copy/pasted to get the member from CoreEventId or one of the other ```EventId``` classes, plus the raw ID value

- The event category, as described above.

For example:

```output
info: 10/6/2020 10:52:45.581 RelationalEventId.CommandExecuted[20101] (Microsoft.EntityFrameworkCore.Database.Command)
      Executed DbCommand (0ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
      CREATE TABLE "Blogs" (
          "Id" INTEGER NOT NULL CONSTRAINT "PK_Blogs" PRIMARY KEY AUTOINCREMENT,
          "Name" INTEGER NOT NULL
      );
dbug: 10/6/2020 10:52:45.582 RelationalEventId.TransactionCommitting[20210] (Microsoft.EntityFrameworkCore.Database.Transaction)
      Committing transaction.
dbug: 10/6/2020 10:52:45.585 RelationalEventId.TransactionCommitted[20202] (Microsoft.EntityFrameworkCore.Database.Transaction)
      Committed transaction.
```

This content can be customized by passing values from ```DbContextLoggerOptions```, as shown in the following sections.

<blockquote class="tip">Tip
Consider using Microsoft.Extensions.Logging for more control over log formatting.</blockquote>

### Using UTC time

```DbContextLoggerOptions.DefaultWithUtcTime``` can be used to specify timestamps for the context logger.

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder.LogTo(
        Console.WriteLine,
        LogLevel.Debug,
        DbContextLoggerOptions.DefaultWithUtcTime);
```

This example results in the following log formatting:

```output
info: 2020-10-06T17:55:39.0333701Z RelationalEventId.CommandExecuted[20101] (Microsoft.EntityFrameworkCore.Database.Command)
      Executed DbCommand (0ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
      CREATE TABLE "Blogs" (
          "Id" INTEGER NOT NULL CONSTRAINT "PK_Blogs" PRIMARY KEY AUTOINCREMENT,
          "Name" INTEGER NOT NULL
      );
dbug: 2020-10-06T17:55:39.0333892Z RelationalEventId.TransactionCommitting[20210] (Microsoft.EntityFrameworkCore.Database.Transaction)
      Committing transaction.
dbug: 2020-10-06T17:55:39.0351684Z RelationalEventId.TransactionCommitted[20202] (Microsoft.EntityFrameworkCore.Database.Transaction)
      Committed transaction.
```

### Single line logging

Sometimes it is useful to get exactly one line per log message. This can be enabled by ```DbContextLoggerOptions.SingleLine```. For example:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder.LogTo(
        Console.WriteLine,
        LogLevel.Debug,
        DbContextLoggerOptions.DefaultWithLocalTime | DbContextLoggerOptions.SingleLine);
```

This example results in the following log formatting:

```output
info: 10/6/2020 10:52:45.723 RelationalEventId.CommandExecuted[20101] (Microsoft.EntityFrameworkCore.Database.Command) -> Executed DbCommand (0ms) [Parameters=[], CommandType='Text', CommandTimeout='30']CREATE TABLE "Blogs" (    "Id" INTEGER NOT NULL CONSTRAINT "PK_Blogs" PRIMARY KEY AUTOINCREMENT,    "Name" INTEGER NOT NULL);
dbug: 10/6/2020 10:52:45.723 RelationalEventId.TransactionCommitting[20210] (Microsoft.EntityFrameworkCore.Database.Transaction) -> Committing transaction.
dbug: 10/6/2020 10:52:45.725 RelationalEventId.TransactionCommitted[20202] (Microsoft.EntityFrameworkCore.Database.Transaction) -> Committed transaction.
```

### Other content options

Other flags in ```DbContextLoggerOptions``` can be used to trim down the amount of metadata included in the log. This can be useful in conjunction with single-line logging. For example:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder.LogTo(
        Console.WriteLine,
        LogLevel.Debug,
        DbContextLoggerOptions.UtcTime | DbContextLoggerOptions.SingleLine);
```

This example results in the following log formatting:

```output
2020-10-06T17:52:45.7320362Z -> Executed DbCommand (0ms) [Parameters=[], CommandType='Text', CommandTimeout='30']CREATE TABLE "Blogs" (    "Id" INTEGER NOT NULL CONSTRAINT "PK_Blogs" PRIMARY KEY AUTOINCREMENT,    "Name" INTEGER NOT NULL);
2020-10-06T17:52:45.7320531Z -> Committing transaction.
2020-10-06T17:52:45.7339441Z -> Committed transaction.
```

## Moving from EF6

EF Core simple logging differs from ```Database```.Log in EF6 in two important ways:

- ```Log``` messages are not limited to only database interactions

- The logging must be configured at context initialization time

For the first difference, the filtering described above can be used to limit which messages are logged.

The first difference between EF7 and EF6 is that EF7 does not generate log messages when they have been set.

```csharp
public Action<string> Log { get; set; }

protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder.LogTo(s => Log?.Invoke(s));
```

Ref: [Simple Logging](https://learn.microsoft.com/en-us/ef/core/logging-events-diagnostics/simple-logging)