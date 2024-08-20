---
title: Entity Framework - Entity Framework Core - Logging, events, and diagnostics - Interceptors
published: true
date: 2024-08-20 09:44:00
tags: Summary, EFCore
description: Entity Framework Core interceptors enable interception, modification, and/or suppression of Entity Framework Core operations.
image:
---
## In this article

Entity Framework Core interceptors enable interception, modification, and/or suppression of Entity Framework Core operations.

Interceptors are software tools that allow the interception of communications.

Interceptors are registered per DbContext instance when the context is configured. Use a diagnostic listener to get the same information but for all DbContext instances in the process.

## Registering interceptors

Interceptors are registered using ```AddInterceptors``` when configuring a DbContext instance. This is commonly done in an override of ```DbContext.OnConfiguring```. For example:

```csharp
public class ExampleContext : BlogsContext
{
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.AddInterceptors(new TaggedQueryCommandInterceptor());
}
```

Alternately, ```AddInterceptors``` can be called as part of ```AddDbContext``` or when creating a ```DbContextOptions``` instance to pass to the ```DbContext``` constructor.

<blockquote class="tip">Tip
```OnConfiguring``` is still called when ```AddDbContext``` is used or a ```DbContextOptions``` instance is passed to the ```DbContext``` constructor. This makes it the ideal place to apply context configuration regardless of how the ```DbContext``` is constructed.</blockquote>

Interceptors are often stateless, which means that a single interceptor instance can be used for all DbContext instances. For example:

```csharp
public class TaggedQueryCommandInterceptorContext : BlogsContext
{
    private static readonly TaggedQueryCommandInterceptor _interceptor
        = new TaggedQueryCommandInterceptor();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.AddInterceptors(_interceptor);
}
```

Each interceptor instance must implement one or more interfaces derived from ```IInterceptor```.

## Database interception

<blockquote class="note">Note
Database interception is only available for relational database providers.</blockquote>

Low-level database interception is split into the three interfaces shown in the following table.

<table><thead>
<tr>
<th style="text-align: left;">Interceptor</th>
<th>Database operations intercepted</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.diagnostics.idbcommandinterceptor" class="no-loc" data-linktype="absolute-path">IDbCommandInterceptor</a></td>
<td>Creating commands<br>Executing commands<br>Command failures<br>Disposing the command's DbDataReader</td>
</tr>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.diagnostics.idbconnectioninterceptor" class="no-loc" data-linktype="absolute-path">IDbConnectionInterceptor</a></td>
<td>Opening and closing connections<br>Connection failures</td>
</tr>
<tr>
<td style="text-align: left;"><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.diagnostics.idbtransactioninterceptor" class="no-loc" data-linktype="absolute-path">IDbTransactionInterceptor</a></td>
<td>Creating transactions<br>Using existing transactions<br>Committing transactions<br>Rolling back transactions<br>Creating and using savepoints<br>Transaction failures</td>
</tr>
</tbody></table>

The ```DbCommandInterceptor``` and ```DbConnectionInterceptor``` classes are used to intercept incoming commands.

Each pair of methods have both sync and async variations. This allows for asynchronous I/O, such as requesting an access token, to happen as part of intercepting an async database operation.

### Example: Command interception to add query hints

<blockquote class="tip">Tip
You can download the command interceptor sample from GitHub.</blockquote>

An ```IDbCommandInterceptor``` can be used to modify SQL before it is sent to the database. This example shows how to modify the SQL to include a query hint.

In our series of articles on Apache Struts, we look at how to intercept Struts commands that use SQL queries.

```csharp
var blogs1 = context.Blogs.TagWith("Use hint: robust plan").ToList();
```

This SQL query adds a tag to the first line of the command text.

```csharp
public class TaggedQueryCommandInterceptor : DbCommandInterceptor
{
    public override InterceptionResult<DbDataReader> ReaderExecuting(
        DbCommand command,
        CommandEventData eventData,
        InterceptionResult<DbDataReader> result)
    {
        ManipulateCommand(command);

        return result;
    }

    public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(
        DbCommand command,
        CommandEventData eventData,
        InterceptionResult<DbDataReader> result,
        CancellationToken cancellationToken = default)
    {
        ManipulateCommand(command);

        return new ValueTask<InterceptionResult<DbDataReader>>(result);
    }

    private static void ManipulateCommand(DbCommand command)
    {
        if (command.CommandText.StartsWith("-- Use hint: robust plan", StringComparison.Ordinal))
        {
            command.CommandText += " OPTION (ROBUST PLAN)";
        }
    }
}
```

Notice:

- The interceptor inherits from ```DbCommandInterceptor``` to avoid having to implement every method in the interceptor interface.

- The interceptor implements both sync and async methods. This ensures that the same query hint is applied to sync and async queries.

- The interceptor implements the ```Executing``` methods which are called by EF Core with the generated SQL before it is sent to the database. Contrast this with the ```Executed``` methods, which are called after the database call has returned.

Running the code in this example generates the following when a query is tagged:

```sql
-- Use hint: robust plan

SELECT [b].[Id], [b].[Name]
FROM [Blogs] AS [b] OPTION (ROBUST PLAN)
```

On the other hand, when a query is not tagged, then it is sent to the database unmodified:

```sql
SELECT [b].[Id], [b].[Name]
FROM [Blogs] AS [b]
```

### Example: Connection interception for SQL Azure authentication using AAD

<blockquote class="tip">Tip
You can download the connection interceptor sample from GitHub.</blockquote>

An IDbConnectionInterceptor can be used to manipulate the DbConnection before it is used to connect to the database.

```csharp
public class AadAuthenticationInterceptor : DbConnectionInterceptor
{
    public override InterceptionResult ConnectionOpening(
        DbConnection connection,
        ConnectionEventData eventData,
        InterceptionResult result)
        => throw new InvalidOperationException("Open connections asynchronously when using AAD authentication.");

    public override async ValueTask<InterceptionResult> ConnectionOpeningAsync(
        DbConnection connection,
        ConnectionEventData eventData,
        InterceptionResult result,
        CancellationToken cancellationToken = default)
    {
        var sqlConnection = (SqlConnection)connection;

        var provider = new AzureServiceTokenProvider();
        // Note: in some situations the access token may not be cached automatically the Azure Token Provider.
        // Depending on the kind of token requested, you may need to implement your own caching here.
        sqlConnection.AccessToken = await provider.GetAccessTokenAsync("https://database.windows.net/", null, cancellationToken);

        return result;
    }
}
```

<blockquote class="tip">Tip
```Microsoft.Data.SqlClient``` now supports AAD authentication via connection string. See SqlAuthenticationMethod for more information.</blockquote>

<blockquote class="warning">Warning
Notice that the interceptor throws if a sync call is made to open the connection. This is because there is no non-async method to obtain the access token and there is no universal and simple way to call an async method from non-async context without risking deadlock.</blockquote>

<blockquote class="warning">Warning
in some situations the access token may not be cached automatically the Azure Token Provider. Depending on the kind of token requested, you may need to implement your own caching here.</blockquote>

### Example: Advanced command interception for caching

<blockquote class="tip">Tip
You can download the advanced command interceptor sample from GitHub.</blockquote>

EF Core interceptors can:

- Tell EF Core to suppress executing the operation being intercepted

- Change the result of the operation reported back to EF Core

This example shows an interceptor that uses these features to behave like a primitive second-level cache. Cached query results are returned for a specific query, avoiding a database roundtrip.

<blockquote class="warning">Warning
Take care when changing the EF Core default behavior in this way. EF Core may behave in unexpected ways if it gets an abnormal result that it cannot process correctly. Also, this example demonstrates interceptor concepts; it is not intended as a template for a robust second-level cache implementation.</blockquote>

In this example, the application frequently executes a query to obtain the most recent "daily message":

```csharp
async Task<string> GetDailyMessage(DailyMessageContext context)
    => (await context.DailyMessages.TagWith("Get_Daily_Message").OrderBy(e => e.Id).LastAsync()).Message;
```

This sample application queries a database for a new message.

#### Interceptor state

This example shows how to use an interceptor to cache a daily message.

```csharp
private readonly object _lock = new object();
private int _id;
private string _message;
private DateTime _queriedAt;
```

#### Before execution

The ```Executing``` method tags a query and then checks if there is a cached result.

```csharp
public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(
    DbCommand command,
    CommandEventData eventData,
    InterceptionResult<DbDataReader> result,
    CancellationToken cancellationToken = default)
{
    if (command.CommandText.StartsWith("-- Get_Daily_Message", StringComparison.Ordinal))
    {
        lock (_lock)
        {
            if (_message != null
                && DateTime.UtcNow < _queriedAt + new TimeSpan(0, 0, 10))
            {
                command.CommandText = "-- Get_Daily_Message: Skipping DB call; using cache.";
                result = InterceptionResult<DbDataReader>.SuppressWithResult(new CachedDailyMessageDataReader(_id, _message));
            }
        }
    }

    return new ValueTask<InterceptionResult<DbDataReader>>(result);
}
```

This example shows how to suppress the execution of an EF Core query.

This interceptor checks if the query is going to be executed before executing it.

#### After execution

This method will suppress the result if a cached message is available.

```csharp
public override async ValueTask<DbDataReader> ReaderExecutedAsync(
    DbCommand command,
    CommandExecutedEventData eventData,
    DbDataReader result,
    CancellationToken cancellationToken = default)
{
    if (command.CommandText.StartsWith("-- Get_Daily_Message", StringComparison.Ordinal)
        && !(result is CachedDailyMessageDataReader))
    {
        try
        {
            await result.ReadAsync(cancellationToken);

            lock (_lock)
            {
                _id = result.GetInt32(0);
                _message = result.GetString(1);
                _queriedAt = DateTime.UtcNow;
                return new CachedDailyMessageDataReader(_id, _message);
            }
        }
        finally
        {
            await result.DisposeAsync();
        }
    }

    return result;
}
```

#### Demonstration

The caching interceptor sample contains a simple console application that queries for daily messages to test the caching:

```csharp
// 1. Initialize the database with some daily messages.
using (var context = new DailyMessageContext())
{
    await context.Database.EnsureDeletedAsync();
    await context.Database.EnsureCreatedAsync();

    context.AddRange(
        new DailyMessage { Message = "Remember: All builds are GA; no builds are RTM." },
        new DailyMessage { Message = "Keep calm and drink tea" });

    await context.SaveChangesAsync();
}

// 2. Query for the most recent daily message. It will be cached for 10 seconds.
using (var context = new DailyMessageContext())
{
    Console.WriteLine(await GetDailyMessage(context));
}

// 3. Insert a new daily message.
using (var context = new DailyMessageContext())
{
    context.Add(new DailyMessage { Message = "Free beer for unicorns" });

    await context.SaveChangesAsync();
}

// 4. Cached message is used until cache expires.
using (var context = new DailyMessageContext())
{
    Console.WriteLine(await GetDailyMessage(context));
}

// 5. Pretend it's the next day.
Thread.Sleep(10000);

// 6. Cache is expired, so the last message will not be queried again.
using (var context = new DailyMessageContext())
{
    Console.WriteLine(await GetDailyMessage(context));
}

async Task<string> GetDailyMessage(DailyMessageContext context)
    => (await context.DailyMessages.TagWith("Get_Daily_Message").OrderBy(e => e.Id).LastAsync()).Message;
```

This results in the following output:

```output
info: 10/15/2020 12:32:11.801 RelationalEventId.CommandExecuted[20101] (Microsoft.EntityFrameworkCore.Database.Command)
      Executed DbCommand (0ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
      -- Get_Daily_Message

      SELECT "d"."Id", "d"."Message"
      FROM "DailyMessages" AS "d"
      ORDER BY "d"."Id" DESC
      LIMIT 1

Keep calm and drink tea

info: 10/15/2020 12:32:11.821 RelationalEventId.CommandExecuted[20101] (Microsoft.EntityFrameworkCore.Database.Command)
      Executed DbCommand (0ms) [Parameters=[@p0='Free beer for unicorns' (Size = 22)], CommandType='Text', CommandTimeout='30']
      INSERT INTO "DailyMessages" ("Message")
      VALUES (@p0);
      SELECT "Id"
      FROM "DailyMessages"
      WHERE changes() = 1 AND "rowid" = last_insert_rowid();

info: 10/15/2020 12:32:11.826 RelationalEventId.CommandExecuted[20101] (Microsoft.EntityFrameworkCore.Database.Command)
      Executed DbCommand (0ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
      -- Get_Daily_Message: Skipping DB call; using cache.

Keep calm and drink tea

info: 10/15/2020 12:32:21.833 RelationalEventId.CommandExecuted[20101] (Microsoft.EntityFrameworkCore.Database.Command)
      Executed DbCommand (0ms) [Parameters=[], CommandType='Text', CommandTimeout='30']
      -- Get_Daily_Message

      SELECT "d"."Id", "d"."Message"
      FROM "DailyMessages" AS "d"
      ORDER BY "d"."Id" DESC
      LIMIT 1

Free beer for unicorns
```

Notice from the log output that the application continues to use the cached message until the timeout expires, at which point the database is queried again for any new message.

## ```SaveChanges``` interception

<blockquote class="tip">Tip
You can download the ```SaveChanges``` interceptor sample from GitHub.</blockquote>

The SaveChangesInterceptor class defines a set of methods that can be used to intercept changes in a database.

<blockquote class="tip">Tip
Interceptors are powerful. However, in many cases it may be easier to override the ```SaveChanges``` method or use the .NET events for ```SaveChanges``` exposed on DbContext.</blockquote>

### Example: ```SaveChanges``` interception for auditing

 ```SaveChanges``` can be intercepted to create an independent audit record of the changes made.

<blockquote class="note">Note
This is not intended to be a robust auditing solution. Rather it is a simplistic example used to demonstrate the features of interception.</blockquote>

#### The application context

The sample for auditing uses a simple DbContext with blogs and posts.

```csharp
public class BlogsContext : DbContext
{
    private readonly AuditingInterceptor _auditingInterceptor = new AuditingInterceptor("DataSource=audit.db");

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder
            .AddInterceptors(_auditingInterceptor)
            .UseSqlite("DataSource=blogs.db");

    public DbSet<Blog> Blogs { get; set; }
}

public class Blog
{
    public int Id { get; set; }
    public string Name { get; set; }

    public ICollection<Post> Posts { get; } = new List<Post>();
}

public class Post
{
    public int Id { get; set; }
    public string Title { get; set; }

    public Blog Blog { get; set; }
}
```

Notice that a new instance of the interceptor is registered for each DbContext instance. This is because the auditing interceptor contains state linked to the current context instance.

#### The audit context

The sample also contains a second DbContext and model used for the auditing database.

```csharp
public class AuditContext : DbContext
{
    private readonly string _connectionString;

    public AuditContext(string connectionString)
    {
        _connectionString = connectionString;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlite(_connectionString);

    public DbSet<SaveChangesAudit> SaveChangesAudits { get; set; }
}

public class SaveChangesAudit
{
    public int Id { get; set; }
    public Guid AuditId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public bool Succeeded { get; set; }
    public string ErrorMessage { get; set; }

    public ICollection<EntityAudit> Entities { get; } = new List<EntityAudit>();
}

public class EntityAudit
{
    public int Id { get; set; }
    public EntityState State { get; set; }
    public string AuditMessage { get; set; }

    public SaveChangesAudit SaveChangesAudit { get; set; }
}
```

#### The interceptor

The general idea for auditing with the interceptor is:

- An audit message is created at the beginning of ```SaveChanges``` and is written to the auditing database

- ```SaveChanges``` is allowed to continue

- If ```SaveChanges``` succeeds, then the audit message is updated to indicate success

- If ```SaveChanges``` fails, then the audit message is updated to indicate the failure

The first stage is handled before any changes are sent to the database using overrides of ```ISaveChangesInterceptor.SavingChanges``` and ```ISaveChangesInterceptor.SavingChangesAsync```.

```csharp
public async ValueTask<InterceptionResult<int>> SavingChangesAsync(
    DbContextEventData eventData,
    InterceptionResult<int> result,
    CancellationToken cancellationToken = default)
{
    _audit = CreateAudit(eventData.Context);

    using var auditContext = new AuditContext(_connectionString);

    auditContext.Add(_audit);
    await auditContext.SaveChangesAsync();

    return result;
}

public InterceptionResult<int> SavingChanges(
    DbContextEventData eventData,
    InterceptionResult<int> result)
{
    _audit = CreateAudit(eventData.Context);

    using var auditContext = new AuditContext(_connectionString);
    auditContext.Add(_audit);
    auditContext.SaveChanges();

    return result;
}
```

You may wish to throw from the sync ```SavingChanges``` method to ensure that all database I/O is async.

#### The audit message

interceptor methods are used to intercept incoming events.

```csharp
private static SaveChangesAudit CreateAudit(DbContext context)
{
    context.ChangeTracker.DetectChanges();

    var audit = new SaveChangesAudit { AuditId = Guid.NewGuid(), StartTime = DateTime.UtcNow };

    foreach (var entry in context.ChangeTracker.Entries())
    {
        var auditMessage = entry.State switch
        {
            EntityState.Deleted => CreateDeletedMessage(entry),
            EntityState.Modified => CreateModifiedMessage(entry),
            EntityState.Added => CreateAddedMessage(entry),
            _ => null
        };

        if (auditMessage != null)
        {
            audit.Entities.Add(new EntityAudit { State = entry.State, AuditMessage = auditMessage });
        }
    }

    return audit;

    string CreateAddedMessage(EntityEntry entry)
        => entry.Properties.Aggregate(
            $"Inserting {entry.Metadata.DisplayName()} with ",
            (auditString, property) => auditString + $"{property.Metadata.Name}: '{property.CurrentValue}' ");

    string CreateModifiedMessage(EntityEntry entry)
        => entry.Properties.Where(property => property.IsModified || property.Metadata.IsPrimaryKey()).Aggregate(
            $"Updating {entry.Metadata.DisplayName()} with ",
            (auditString, property) => auditString + $"{property.Metadata.Name}: '{property.CurrentValue}' ");

    string CreateDeletedMessage(EntityEntry entry)
        => entry.Properties.Where(property => property.Metadata.IsPrimaryKey()).Aggregate(
            $"Deleting {entry.Metadata.DisplayName()} with ",
            (auditString, property) => auditString + $"{property.Metadata.Name}: '{property.CurrentValue}' ");
}
```

The result is a ```SaveChangesAudit``` entity with a collection of ```EntityAudit``` entities, one for each insert, update, or delete. The interceptor then inserts these entities into the audit database.

<blockquote class="tip">Tip
```ToString``` is overridden in every EF Core event data class to generate the equivalent log message for the event. For example, calling ```ContextInitializedEventData.ToString``` generates "Entity Framework Core 5.0.0 initialized 'BlogsContext' using provider 'Microsoft.EntityFrameworkCore.Sqlite' with options: None".</blockquote>

#### Detecting success

The ```SaveChanges``` interceptor retrieves the audit entity that contains the saved changes.

```csharp
public int SavedChanges(SaveChangesCompletedEventData eventData, int result)
{
    using var auditContext = new AuditContext(_connectionString);

    auditContext.Attach(_audit);
    _audit.Succeeded = true;
    _audit.EndTime = DateTime.UtcNow;

    auditContext.SaveChanges();

    return result;
}

public async ValueTask<int> SavedChangesAsync(
    SaveChangesCompletedEventData eventData,
    int result,
    CancellationToken cancellationToken = default)
{
    using var auditContext = new AuditContext(_connectionString);

    auditContext.Attach(_audit);
    _audit.Succeeded = true;
    _audit.EndTime = DateTime.UtcNow;

    await auditContext.SaveChangesAsync(cancellationToken);

    return result;
}
```

We need to update an audit entity in the database.

#### Detecting failure

The failure method of the ```ISaveChangesInterceptor``` method throws an exception when a change is made in the database.

```csharp
public void SaveChangesFailed(DbContextErrorEventData eventData)
{
    using var auditContext = new AuditContext(_connectionString);

    auditContext.Attach(_audit);
    _audit.Succeeded = false;
    _audit.EndTime = DateTime.UtcNow;
    _audit.ErrorMessage = eventData.Exception.Message;

    auditContext.SaveChanges();
}

public async Task SaveChangesFailedAsync(
    DbContextErrorEventData eventData,
    CancellationToken cancellationToken = default)
{
    using var auditContext = new AuditContext(_connectionString);

    auditContext.Attach(_audit);
    _audit.Succeeded = false;
    _audit.EndTime = DateTime.UtcNow;
    _audit.ErrorMessage = eventData.Exception.InnerException?.Message;

    await auditContext.SaveChangesAsync(cancellationToken);
}
```

#### Demonstration

The auditing sample contains a simple console application that makes changes to the blogging database and then shows the auditing that was created.

```csharp
// Insert, update, and delete some entities

using (var context = new BlogsContext())
{
    context.Add(
        new Blog { Name = "EF Blog", Posts = { new Post { Title = "EF Core 3.1!" }, new Post { Title = "EF Core 5.0!" } } });

    await context.SaveChangesAsync();
}

using (var context = new BlogsContext())
{
    var blog = context.Blogs.Include(e => e.Posts).Single();

    blog.Name = "EF Core Blog";
    context.Remove(blog.Posts.First());
    blog.Posts.Add(new Post { Title = "EF Core 6.0!" });

    context.SaveChanges();
}

// Do an insert that will fail

using (var context = new BlogsContext())
{
    try
    {
        context.Add(new Post { Id = 3, Title = "EF Core 3.1!" });

        await context.SaveChangesAsync();
    }
    catch (DbUpdateException)
    {
    }
}

// Look at the audit trail

using (var context = new AuditContext("DataSource=audit.db"))
{
    foreach (var audit in context.SaveChangesAudits.Include(e => e.Entities).ToList())
    {
        Console.WriteLine(
            $"Audit {audit.AuditId} from {audit.StartTime} to {audit.EndTime} was{(audit.Succeeded ? "" : " not")} successful.");

        foreach (var entity in audit.Entities)
        {
            Console.WriteLine($"  {entity.AuditMessage}");
        }

        if (!audit.Succeeded)
        {
            Console.WriteLine($"  Error: {audit.ErrorMessage}");
        }
    }
}
```

The result shows the contents of the auditing database:

```output
Audit 52e94327-1767-4046-a3ca-4c6b1eecbca6 from 10/14/2020 9:10:17 PM to 10/14/2020 9:10:17 PM was successful.
  Inserting Blog with Id: '-2147482647' Name: 'EF Blog'
  Inserting Post with Id: '-2147482647' BlogId: '-2147482647' Title: 'EF Core 3.1!'
  Inserting Post with Id: '-2147482646' BlogId: '-2147482647' Title: 'EF Core 5.0!'
Audit 8450f57a-5030-4211-a534-eb66b8da7040 from 10/14/2020 9:10:17 PM to 10/14/2020 9:10:17 PM was successful.
  Inserting Post with Id: '-2147482645' BlogId: '1' Title: 'EF Core 6.0!'
  Updating Blog with Id: '1' Name: 'EF Core Blog'
  Deleting Post with Id: '1'
Audit 201fef4d-66a7-43ad-b9b6-b57e9d3f37b3 from 10/14/2020 9:10:17 PM to 10/14/2020 9:10:17 PM was not successful.
  Inserting Post with Id: '3' BlogId: '' Title: 'EF Core 3.1!'
  Error: SQLite Error 19: 'UNIQUE constraint failed: Post.Id'.
```

Ref: [Interceptors](https://learn.microsoft.com/en-us/ef/core/logging-events-diagnostics/interceptors)