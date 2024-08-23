---
title: Entity Framework - Entity Framework Core - Performance - Advanced performance topics
published: true
date: 2024-08-23 09:44:16
tags: Summary, EFCore
description: A DbContext is generally a light object: creating and disposing one doesn't involve a database operation, and most applications can do so without any noticeable impact on performance. However, each context instance does set up various internal services and objects necessary for performing its duties, and the overhead of continuously doing so may be significant in high-performance scenarios. For these cases, EF Core can pool your context instances: when you dispose your context, EF Core resets its state and stores it in an internal pool; when a new instance is next requested, that pooled instance is returned instead of setting up a new one. Context pooling allows you to pay context setup costs only once at program startup, rather than continuously.
image:
---

## In this article

## ```DbContext``` pooling

A ```DbContext``` is generally a light object: creating and disposing one doesn't involve a database operation, and most applications can do so without any noticeable impact on performance. However, each context instance does set up various internal services and objects necessary for performing its duties, and the overhead of continuously doing so may be significant in high-performance scenarios. For these cases, EF Core can pool your context instances: when you dispose your context, EF Core resets its state and stores it in an internal pool; when a new instance is next requested, that pooled instance is returned instead of setting up a new one. Context pooling allows you to pay context setup costs only once at program startup, rather than continuously.

Note that context pooling is orthogonal to database connection pooling, which is managed at a lower level in the database driver.

 - With dependency injection

 - Without dependency injection

```csharp
builder.Services.AddDbContextPool<WeatherForecastContext>(
    o => o.UseSqlServer(builder.Configuration.GetConnectionString("WeatherForecastContext")));
```

```csharp
var options = new DbContextOptionsBuilder<PooledBloggingContext>()
    .UseSqlServer(@"Server=(localdb)\mssqllocaldb;Database=Blogging;Trusted_Connection=True;ConnectRetryCount=0")
    .Options;

var factory = new PooledDbContextFactory<PooledBloggingContext>(options);

using (var context = factory.CreateDbContext())
{
    var allPosts = context.Posts.ToList();
}
```

### Benchmarks

This week we're testing the performance of fetching a single row from a SQL Server database running locally on the same machine, with and without context pooling.

<table><thead>
<tr>
<th>Method</th>
<th>NumBlogs</th>
<th style="text-align: right;">Mean</th>
<th style="text-align: right;">Error</th>
<th style="text-align: right;">StdDev</th>
<th style="text-align: right;">Gen 0</th>
<th style="text-align: right;">Gen 1</th>
<th style="text-align: right;">Gen 2</th>
<th style="text-align: right;">Allocated</th>
</tr>
</thead>
<tbody>
<tr>
<td>WithoutContextPooling</td>
<td>1</td>
<td style="text-align: right;">701.6 us</td>
<td style="text-align: right;">26.62 us</td>
<td style="text-align: right;">78.48 us</td>
<td style="text-align: right;">11.7188</td>
<td style="text-align: right;">-</td>
<td style="text-align: right;">-</td>
<td style="text-align: right;">50.38 KB</td>
</tr>
<tr>
<td>WithContextPooling</td>
<td>1</td>
<td style="text-align: right;">350.1 us</td>
<td style="text-align: right;">6.80 us</td>
<td style="text-align: right;">14.64 us</td>
<td style="text-align: right;">0.9766</td>
<td style="text-align: right;">-</td>
<td style="text-align: right;">-</td>
<td style="text-align: right;">4.63 KB</td>
</tr>
</tbody></table>

### Managing state in pooled contexts

Context pooling works by reusing the same context instance across requests; this means that it's effectively registered as a Singleton, and the same instance is reused across multiple requests (or DI scopes). This means that special care must be taken when the context involves any state that may change between requests. Crucially, the context's ```OnConfiguring``` is only invoked once - when the instance context is first created - and so cannot be used to set state which needs to vary (e.g. a tenant ID).

In this article we are going to learn how to use context pooling in ASP.NET.

Let's assume that your application registers a scoped ```ITenant``` service, which wraps the tenant ID and any other tenant-related information:

```csharp
// Below is a minimal tenant resolution strategy, which registers a scoped ITenant service in DI.
// In this sample, we simply accept the tenant ID as a request query, which means that a client can impersonate any
// tenant. In a real application, the tenant ID would be set based on secure authentication data.
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ITenant>(sp =>
{
    var tenantIdString = sp.GetRequiredService<IHttpContextAccessor>().HttpContext.Request.Query["TenantId"];

    return tenantIdString != StringValues.Empty && int.TryParse(tenantIdString, out var tenantId)
        ? new Tenant(tenantId)
        : null;
});
```

As written above, pay special attention to where you get the tenant ID from - this is an important aspect of your application's security.

Once we have our scoped ```ITenant``` service, register a pooling context factory as a Singleton service, as usual:

```csharp
builder.Services.AddPooledDbContextFactory<WeatherForecastContext>(
    o => o.UseSqlServer(builder.Configuration.GetConnectionString("WeatherForecastContext")));
```

Next, write a custom context factory which gets a pooled context from the Singleton factory we registered, and injects the tenant ID into context instances it hands out:

```csharp
public class WeatherForecastScopedFactory : IDbContextFactory<WeatherForecastContext>
{
    private const int DefaultTenantId = -1;

    private readonly IDbContextFactory<WeatherForecastContext> _pooledFactory;
    private readonly int _tenantId;

    public WeatherForecastScopedFactory(
        IDbContextFactory<WeatherForecastContext> pooledFactory,
        ITenant tenant)
    {
        _pooledFactory = pooledFactory;
        _tenantId = tenant?.TenantId ?? DefaultTenantId;
    }

    public WeatherForecastContext CreateDbContext()
    {
        var context = _pooledFactory.CreateDbContext();
        context.TenantId = _tenantId;
        return context;
    }
}
```

Once we have our custom context factory, register it as a Scoped service:

```csharp
builder.Services.AddScoped<WeatherForecastScopedFactory>();
```

Finally, arrange for a context to get injected from our Scoped factory:

```csharp
builder.Services.AddScoped(
    sp => sp.GetRequiredService<WeatherForecastScopedFactory>().CreateDbContext());
```

As this point, your controllers automatically get injected with a context instance that has the right tenant ID, without having to know anything about it.

The full source code for this sample is available here.

> Note
Although EF Core takes care of resetting internal state for ```DbContext``` and its related services, it generally does not reset state in the underlying database driver, which is outside of EF. For example, if you manually open and use a ```DbConnection``` or otherwise manipulate ADO.NET state, it's up to you to restore that state before returning the context instance to the pool, e.g. by closing the connection. Failure to do so may cause state to get leaked across unrelated requests.

## Compiled queries

The following example shows how to cache a query tree for execution.

cached queries allow EF to query the database more quickly than if it had to query the database itself.

EF supports compiled queries, which allow the explicit compilation of a query into a .NET delegate.

<table><thead>
<tr>
<th>Method</th>
<th>NumBlogs</th>
<th style="text-align: right;">Mean</th>
<th style="text-align: right;">Error</th>
<th style="text-align: right;">StdDev</th>
<th style="text-align: right;">Gen 0</th>
<th style="text-align: right;">Allocated</th>
</tr>
</thead>
<tbody>
<tr>
<td>WithCompiledQuery</td>
<td>1</td>
<td style="text-align: right;">564.2 us</td>
<td style="text-align: right;">6.75 us</td>
<td style="text-align: right;">5.99 us</td>
<td style="text-align: right;">1.9531</td>
<td style="text-align: right;">9 KB</td>
</tr>
<tr>
<td>WithoutCompiledQuery</td>
<td>1</td>
<td style="text-align: right;">671.6 us</td>
<td style="text-align: right;">12.72 us</td>
<td style="text-align: right;">16.54 us</td>
<td style="text-align: right;">2.9297</td>
<td style="text-align: right;">13 KB</td>
</tr>
<tr>
<td>WithCompiledQuery</td>
<td>10</td>
<td style="text-align: right;">645.3 us</td>
<td style="text-align: right;">10.00 us</td>
<td style="text-align: right;">9.35 us</td>
<td style="text-align: right;">2.9297</td>
<td style="text-align: right;">13 KB</td>
</tr>
<tr>
<td>WithoutCompiledQuery</td>
<td>10</td>
<td style="text-align: right;">709.8 us</td>
<td style="text-align: right;">25.20 us</td>
<td style="text-align: right;">73.10 us</td>
<td style="text-align: right;">3.9063</td>
<td style="text-align: right;">18 KB</td>
</tr>
</tbody></table>

To use compiled queries, first compile a query with EF.CompileAsyncQuery as follows (use EF.CompileQuery for synchronous queries):

```csharp
private static readonly Func<BloggingContext, int, IAsyncEnumerable<Blog>> _compiledQuery
    = EF.CompileAsyncQuery(
        (BloggingContext context, int length) => context.Blogs.Where(b => b.Url.StartsWith("http://") && b.Url.Length == length));
```

In this code sample, we provide EF with a lambda accepting a ```DbContext``` instance, and an arbitrary parameter to be passed to the query. You can now invoke that delegate whenever you wish to execute the query:

```csharp
await foreach (var blog in _compiledQuery(context, 8))
{
    // Do something with the results
}
```

Note that the delegate is thread-safe, and can be invoked concurrently on different context instances.

### Limitations

- Compiled queries may only be used against a single EF Core model. Different context instances of the same type can sometimes be configured to use different models; running compiled queries in this scenario is not supported.

- When using parameters in compiled queries, use simple, scalar parameters. More complex parameter expressions - such as member/method accesses on instances - are not supported.

## Query caching and parameterization

The following example shows how to cache a query tree for execution.

Consider the following two queries:

```csharp
var post1 = context.Posts.FirstOrDefault(p => p.Title == "post1");
var post2 = context.Posts.FirstOrDefault(p => p.Title == "post2");
```

This example shows how to query an expression tree using the following syntax: This example shows how to query an expression tree using the following syntax: This example shows how to query an expression tree using the following syntax: This example shows how to query an expression tree using the following syntax:

```sql
SELECT TOP(1) [b].[Id], [b].[Name]
FROM [Posts] AS [b]
WHERE [b].[Name] = N'post1'

SELECT TOP(1) [b].[Id], [b].[Name]
FROM [Posts] AS [b]
WHERE [b].[Name] = N'post2'
```

Because the SQL differs, your database server will likely also need to produce a query plan for both queries, rather than reusing the same plan.

A small modification to your queries can change things considerably:

```csharp
var postTitle = "post1";
var post1 = context.Posts.FirstOrDefault(p => p.Title == postTitle);
postTitle = "post2";
var post2 = context.Posts.FirstOrDefault(p => p.Title == postTitle);
```

This example shows how to query two separate blogs using the same query plan.

```sql
SELECT TOP(1) [b].[Id], [b].[Name]
FROM [Posts] AS [b]
WHERE [b].[Name] = @__postTitle_0
```

Here's an example of how to parameterize a query.

> Note
EF Core's metrics report the Query Cache Hit Rate. In a normal application, this metric reaches 100% soon after program startup, once most queries have executed at least once. If this metric remains stable below 100%, that is an indication that your application may be doing something which defeats the query cache - it's a good idea to investigate that.

> Note
How the database manages caches query plans is database-dependent. For example, SQL Server implicitly maintains an LRU query plan cache, whereas PostgreSQL does not (but prepared statements can produce a very similar end effect). Consult your database documentation for more details.

## Dynamically-constructed queries

In this talk, we'll look at some of the performance issues caused by queries.

The following example uses three techniques to construct a query's ```Where``` lambda expression:

- Expression API with constant: Dynamically build the expression with the Expression API, using a constant node. This is a frequent mistake when dynamically building expression trees, and causes EF to recompile the query each time it's invoked with a different constant value (it also usually causes plan cache pollution at the database server).

- Expression API with parameter: A better version, which substitutes the constant with a parameter. This ensures that the query is only compiled once regardless of the value provided, and the same (parameterized) SQL is generated.

- Simple with parameter: A version which doesn't use the Expression API, for comparison, which creates the same tree as the method above but is much simpler. In many cases, it's possible to dynamically build your expression tree without resorting to the Expression API, which is easy to get wrong.

We add a ```Where``` operator to the query only if the given parameter is not null. Note that this isn't a good use case for dynamically constructing a query - but we're using it for simplicity:

 - Expression API with constant

 - Expression API with parameter

 - Simple with parameter

```csharp
[Benchmark]
public int ExpressionApiWithConstant()
{
    var url = "blog" + Interlocked.Increment(ref _blogNumber);
    using var context = new BloggingContext();

    IQueryable<Blog> query = context.Blogs;

    if (_addWhereClause)
    {
        var blogParam = Expression.Parameter(typeof(Blog), "b");
        var whereLambda = Expression.Lambda<Func<Blog, bool>>(
            Expression.Equal(
                Expression.MakeMemberAccess(
                    blogParam,
                    typeof(Blog).GetMember(nameof(Blog.Url)).Single()),
                Expression.Constant(url)),
            blogParam);

        query = query.Where(whereLambda);
    }

    return query.Count();
}
```

```csharp
[Benchmark]
public int ExpressionApiWithParameter()
{
    var url = "blog" + Interlocked.Increment(ref _blogNumber);
    using var context = new BloggingContext();

    IQueryable<Blog> query = context.Blogs;

    if (_addWhereClause)
    {
        var blogParam = Expression.Parameter(typeof(Blog), "b");

        // This creates a lambda expression whose body is identical to the url captured closure variable in the non-dynamic query:
        // blogs.Where(b => b.Url == url)
        // This dynamically creates an expression node which EF can properly recognize and parameterize in the database query.
        // We then extract that body and use it in our dynamically-constructed query.
        Expression<Func<string>> urlParameterLambda = () => url;
        var urlParamExpression = urlParameterLambda.Body;

        var whereLambda = Expression.Lambda<Func<Blog, bool>>(
            Expression.Equal(
                Expression.MakeMemberAccess(
                    blogParam,
                    typeof(Blog).GetMember(nameof(Blog.Url)).Single()),
                urlParamExpression),
            blogParam);

        query = query.Where(whereLambda);
    }

    return query.Count();
}
```

```csharp
[Benchmark]
public int SimpleWithParameter()
{
    var url = "blog" + Interlocked.Increment(ref _blogNumber);

    using var context = new BloggingContext();

    IQueryable<Blog> query = context.Blogs;

    if (_addWhereClause)
    {
        Expression<Func<Blog, bool>> whereLambda = b => b.Url == url;

        query = query.Where(whereLambda);
    }

    return query.Count();
}
```

Benchmarking these two techniques gives the following results:

<table><thead>
<tr>
<th>Method</th>
<th style="text-align: right;">Mean</th>
<th style="text-align: right;">Error</th>
<th style="text-align: right;">StdDev</th>
<th style="text-align: right;">Gen0</th>
<th style="text-align: right;">Gen1</th>
<th style="text-align: right;">Allocated</th>
</tr>
</thead>
<tbody>
<tr>
<td>ExpressionApiWithConstant</td>
<td style="text-align: right;">1,665.8 us</td>
<td style="text-align: right;">56.99 us</td>
<td style="text-align: right;">163.5 us</td>
<td style="text-align: right;">15.6250</td>
<td style="text-align: right;">-</td>
<td style="text-align: right;">109.92 KB</td>
</tr>
<tr>
<td>ExpressionApiWithParameter</td>
<td style="text-align: right;">757.1 us</td>
<td style="text-align: right;">35.14 us</td>
<td style="text-align: right;">103.6 us</td>
<td style="text-align: right;">12.6953</td>
<td style="text-align: right;">0.9766</td>
<td style="text-align: right;">54.95 KB</td>
</tr>
<tr>
<td>SimpleWithParameter</td>
<td style="text-align: right;">760.3 us</td>
<td style="text-align: right;">37.99 us</td>
<td style="text-align: right;">112.0 us</td>
<td style="text-align: right;">12.6953</td>
<td style="text-align: right;">-</td>
<td style="text-align: right;">55.03 KB</td>
</tr>
</tbody></table>

If you have a constant version of a query, it's a good idea to keep it that way.

> Note
Avoid constructing queries with the expression tree API unless you really need to. Aside from the API's complexity, it's very easy to inadvertently cause significant performance issues when using them.

## Compiled models

Compiled models can improve EF Core startup time for applications with large models. A large model typically means hundreds to thousands of entity types and relationships. Startup time here is the time to perform the first operation on a ```DbContext``` when that ```DbContext``` type is used for the first time in the application. Note that just creating a ```DbContext``` instance does not cause the EF model to be initialized. Instead, typical first operations that cause the model to be initialized include calling ```DbContext.Add``` or executing the first query.

Compiled models are created using the ```dotnet ef``` command-line tool. Ensure that you have installed the latest version of the tool before continuing.

A new ```dbcontext optimize``` command is used to generate the compiled model. For example:

```dotnetcli
dotnet ef dbcontext optimize
```

The ```--output-dir``` and ```--namespace``` options can be used to specify the directory and namespace into which the compiled model will be generated. For example:

```dotnetcli
PS C:\dotnet\efdocs\samples\core\Miscellaneous\CompiledModels> dotnet ef dbcontext optimize --output-dir MyCompiledModels --namespace MyCompiledModels
Build started...
Build succeeded.
Successfully generated a compiled model, to use it call 'options.UseModel(MyCompiledModels.BlogsContextModel.Instance)'. Run this command again when the model is modified.
PS C:\dotnet\efdocs\samples\core\Miscellaneous\CompiledModels>
```

- For more information see ```dotnet ef dbcontext optimize```.

- If you're more comfortable working inside Visual Studio, you can also use Optimize-DbContext

The output from running this command includes a piece of code to copy-and-paste into your ```DbContext``` configuration to cause EF Core to use the compiled model. For example:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder
        .UseModel(MyCompiledModels.BlogsContextModel.Instance)
        .UseSqlite(@"Data Source=test.db");
```

### Compiled model bootstrapping

It is typically not necessary to look at the generated bootstrapping code. However, sometimes it can be useful to customize the model or its loading. The bootstrapping code looks something like this:

```csharp
[DbContext(typeof(BlogsContext))]
partial class BlogsContextModel : RuntimeModel
{
    private static BlogsContextModel _instance;
    public static IModel Instance
    {
        get
        {
            if (_instance == null)
            {
                _instance = new BlogsContextModel();
                _instance.Initialize();
                _instance.Customize();
            }

            return _instance;
        }
    }

    partial void Initialize();

    partial void Customize();
}
```

This is a partial class with partial methods that can be implemented to customize the model as needed.

In addition, multiple compiled models can be generated for ```DbContext``` types that may use different models depending on some runtime configuration. These should be placed into different folders and namespaces, as shown above. Runtime information, such as the connection string, can then be examined and the correct model returned as needed. For example:

```csharp
public static class RuntimeModelCache
{
    private static readonly ConcurrentDictionary<string, IModel> _runtimeModels
        = new();

    public static IModel GetOrCreateModel(string connectionString)
        => _runtimeModels.GetOrAdd(
            connectionString, cs =>
            {
                if (cs.Contains("X"))
                {
                    return BlogsContextModel1.Instance;
                }

                if (cs.Contains("Y"))
                {
                    return BlogsContextModel2.Instance;
                }

                throw new InvalidOperationException("No appropriate compiled model found.");
            });
}
```

### Limitations

Compiled models have some limitations:

- Global query filters are not supported.

- Lazy loading and change-tracking proxies are not supported.

- The model must be manually synchronized by regenerating it any time the model definition or configuration change.

- Custom IModelCacheKeyFactory implementations are not supported. However, you can compile multiple models and load the appropriate one as needed.

Because of these limitations, you should only use compiled models if your EF Core startup time is too slow. Compiling small models is typically not worth it.

If supporting any of these features is critical to your success, then please vote for the appropriate issues linked above.

## Reducing runtime overhead

In this performance guide, we'll look at how to reduce EF Core overhead in high-performance applications.

- Turn on ```DbContext``` pooling; our benchmarks show that this feature can have a decisive impact on high-perf, low-latency applications.

  - Make sure that the ```maxPoolSize``` corresponds to your usage scenario; if it is too low, ```DbContext``` instances will be constantly created and disposed, degrading performance. Setting it too high may needlessly consume memory as unused ```DbContext``` instances are maintained in the pool.

  - For an extra tiny perf boost, consider using ```PooledDbContextFactory``` instead of having DI inject context instances directly. DI management of ```DbContext``` pooling incurs a slight overhead.

- Use precompiled queries for hot queries.

  - The more complex the LINQ query - the more operators it contains and the bigger the resulting expression tree - the more gains can be expected from using compiled queries.

- Consider disabling thread safety checks by setting ```EnableThreadSafetyChecks``` to false in your context configuration.

  - Using the same ```DbContext``` instance concurrently from different threads isn't supported. EF Core has a safety feature which detects this programming bug in many cases (but not all), and immediately throws an informative exception. However, this safety feature adds some runtime overhead.

  - WARNING: Only disable thread safety checks after thoroughly testing that your application doesn't contain such concurrency bugs.

Ref: [Advanced Performance Topics](https://learn.microsoft.com/en-us/ef/core/performance/advanced-performance-topics)