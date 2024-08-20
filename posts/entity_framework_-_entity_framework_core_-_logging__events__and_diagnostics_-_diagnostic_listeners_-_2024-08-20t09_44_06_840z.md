---
title: Entity Framework - Entity Framework Core - Logging, events, and diagnostics - Diagnostic listeners
published: true
date: 2024-08-20 09:44:06
tags: Summary, EFCore
description: The DiagnosticListener class is a part of a common mechanism across .NET for obtaining diagnostic information from running applications.
image:
---

## In this article

<blockquote class="tip">Tip
You can download this article's sample from GitHub.</blockquote>

The ```DiagnosticListener``` class is a part of a common mechanism across .NET for obtaining diagnostic information from running applications.

Diagnostic listeners are not suitable for getting events from a single DbContext instance. EF Core interceptors provide access to the same events with per-context registration.

Diagnostic listeners are not designed for logging. Consider using simple logging or ```Microsoft.Extensions.Logging``` for logging.

## Example: Observing diagnostic events

Resolving EF Core events is a two-step process. First, an observer for ```DiagnosticListener``` itself must be created:

```csharp
public class DiagnosticObserver : IObserver<DiagnosticListener>
{
    public void OnCompleted()
        => throw new NotImplementedException();

    public void OnError(Exception error)
        => throw new NotImplementedException();

    public void OnNext(DiagnosticListener value)
    {
        if (value.Name == DbLoggerCategory.Name) // "Microsoft.EntityFrameworkCore"
        {
            value.Subscribe(new KeyValueObserver());
        }
    }
}
```

The ```OnNext``` method looks for the ```DiagnosticListener``` that comes from EF Core. This listener has the name "Microsoft.EntityFrameworkCore", which can be obtained from the DbLoggerCategory class as shown.

This observer must then be registered globally, for example in the application's ```Main``` method:

```csharp
DiagnosticListener.AllListeners.Subscribe(new DiagnosticObserver());
```

Second, once the EF Core ```DiagnosticListener``` is found, a new key-value observer is created to subscribe to the actual EF Core events. For example:

```csharp
public class KeyValueObserver : IObserver<KeyValuePair<string, object>>
{
    public void OnCompleted()
        => throw new NotImplementedException();

    public void OnError(Exception error)
        => throw new NotImplementedException();

    public void OnNext(KeyValuePair<string, object> value)
    {
        if (value.Key == CoreEventId.ContextInitialized.Name)
        {
            var payload = (ContextInitializedEventData)value.Value;
            Console.WriteLine($"EF is initializing {payload.Context.GetType().Name} ");
        }

        if (value.Key == RelationalEventId.ConnectionOpening.Name)
        {
            var payload = (ConnectionEventData)value.Value;
            Console.WriteLine($"EF is opening a connection to {payload.Connection.ConnectionString} ");
        }
    }
}
```

The ```OnNext``` method is this time called with a key/value pair for each EF Core event. The key is the name of the event, which can be obtained from one of:

- ```CoreEventId``` for events common to all EF Core database providers

- ```RelationalEventId``` for events common to all relational database providers

- A similar class for events specific to the current database provider. For example, ```SqlServerEventId``` for the SQL Server provider.

The value of the key/value pair is a payload type specific to the event. The type of payload to expect is documented on each event defined in these event classes.

The payload is the data that the application is trying to retrieve.

<blockquote class="tip">Tip
```ToString``` is overridden in every EF Core event data class to generate the equivalent log message for the event. For example, calling ```ContextInitializedEventData.ToString``` generates "Entity Framework Core 5.0.0 initialized 'BlogsContext' using provider 'Microsoft.EntityFrameworkCore.Sqlite' with options: None".</blockquote>

The sample contains a simple console application that makes changes to the blogging database and prints out the diagnostic events encountered.

```csharp
public static void Main()
{
    DiagnosticListener.AllListeners.Subscribe(new DiagnosticObserver());

    using (var context = new BlogsContext())
    {
        context.Database.EnsureDeleted();
        context.Database.EnsureCreated();

        context.Add(
            new Blog { Name = "EF Blog", Posts = { new Post { Title = "EF Core 3.1!" }, new Post { Title = "EF Core 5.0!" } } });

        context.SaveChanges();
    }

    using (var context = new BlogsContext())
    {
        var blog = context.Blogs.Include(e => e.Posts).Single();

        blog.Name = "EF Core Blog";
        context.Remove(blog.Posts.First());
        blog.Posts.Add(new Post { Title = "EF Core 6.0!" });

        context.SaveChanges();
    }
```

The output from this code shows the events detected:

```output
EF is initializing BlogsContext
EF is opening a connection to Data Source=blogs.db;Mode=ReadOnly
EF is opening a connection to DataSource=blogs.db
EF is opening a connection to Data Source=blogs.db;Mode=ReadOnly
EF is opening a connection to DataSource=blogs.db
EF is opening a connection to DataSource=blogs.db
EF is opening a connection to DataSource=blogs.db
EF is initializing BlogsContext
EF is opening a connection to DataSource=blogs.db
EF is opening a connection to DataSource=blogs.db
```

Ref: [Using Diagnostic Listeners in EF Core](https://learn.microsoft.com/en-us/ef/core/logging-events-diagnostics/diagnostic-listeners)