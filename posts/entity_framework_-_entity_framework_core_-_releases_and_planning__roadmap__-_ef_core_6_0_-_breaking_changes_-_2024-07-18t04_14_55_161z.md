---
title: Entity Framework - Entity Framework Core - Releases and planning (roadmap) - EF Core 6.0 - Breaking changes
published: true
date: 2024-07-18 04:14:55
tags: EFCore, Summary
description: The following API and behavior changes have the potential to break existing applications updating to EF Core 6.0.
image:
---
- Article

  - 01/30/2023

  - 7 contributors

## In this article

The following API and behavior changes have the potential to break existing applications updating to EF Core 6.0.

## Target Framework

EF Core 6.0 targets .NET 6. Applications targeting older .NET, .NET Core, and .NET Framework versions will need to target .NET 6 to use EF Core 6.0.

## Summary

* These changes are of particular interest to authors of database providers and extensions.

## High-impact changes



### Nested optional dependents sharing a table and with no required properties are disallowed

Tracking Issue #24558

#### Old behavior

In our series of articles on data protection, we look at some of the best practices for protecting data against loss.

```csharp
public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; }
    public ContactInfo ContactInfo { get; set; }
}

[Owned]
public class ContactInfo
{
    public string Phone { get; set; }
    public Address Address { get; set; }
}

[Owned]
public class Address
{
    public string House { get; set; }
    public string Street { get; set; }
    public string City { get; set; }
    public string Postcode { get; set; }
}
```

Is there a way to query for the owner ```Customer``` without creating an instance of ```ContactInfo``` or ```Address```?

#### New behavior

Attempting to use this model will now throw the following exception:

This prevents data loss when querying and saving data.

#### Why

Using models with nested optional dependents sharing a table and with no required properties often resulted in silent data loss.

#### Mitigations

Avoid using optional dependents sharing a table and with no required properties. There are three easy ways to do this:

- Make the dependents required. This means that the dependent entity will always have a value after it is queried, even if all its properties are ```null```. For example:
public class ```Customer```
{
    public ```int``` Id { get; set; }
    public string Name { get; set; }

    [Required]
    public ```Address``` ```Address``` { get; set; }
}

Or:
modelBuilder.Entity<Customer>(
    b =>
        {
            b.OwnsOne(e => e.Address);
            b.Navigation(e => e.Address).IsRequired();
        });

```csharp
public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; }

    [Required]
    public Address Address { get; set; }
}
```

```csharp
modelBuilder.Entity<Customer>(
    b =>
        {
            b.OwnsOne(e => e.Address);
            b.Navigation(e => e.Address).IsRequired();
        });
```

- Make sure that the dependent contains at least one required property.

- Map optional dependents to their own table, instead of sharing a table with the principal. For example:
modelBuilder.Entity<Customer>(
    b =>
        {
            b.ToTable("Customers");
            b.OwnsOne(e => e.Address, b => b.ToTable("CustomerAddresses"));
        });

```csharp
modelBuilder.Entity<Customer>(
    b =>
        {
            b.ToTable("Customers");
            b.OwnsOne(e => e.Address, b => b.ToTable("CustomerAddresses"));
        });
```

The problems with optional dependents and examples of these mitigations are included in the documentation for What's new in EF Core 6.0.

## Medium-impact changes



### Changing the owner of an owned entity now throws an exception

Tracking Issue #4073

#### Old behavior

It was possible to reassign an owned entity to a different owner entity.

#### New behavior

This action will now throw an exception:

#### Why

When an entity is changed it causes the owner entity to change, and since they are also used as the primary key this results in the entity identity changing. When the owner entity is changed it causes the values of the foreign key on the owned entity to change, and since they are also used as the primary key

#### Mitigations

Instead of assigning the same owned instance to a new owner you can assign a copy and delete the old one.



### Azure Cosmos DB: Related entity types are discovered as owned

Tracking Issue #24803
What's new: Default to implicit ownership

#### Old behavior

As in other providers, related entity types were discovered as normal (non-owned) types.

#### New behavior

Related entity types will now be owned by the entity type on which they were discovered. Only the entity types that correspond to a ```DbSet```<TEntity> property will be discovered as non-owned.

#### Why

Azure Cosmos DB does not support embedding related entities into a single document.

#### Mitigations

To configure an entity type to be non-owned call modelBuilder.Entity<MyEntity>();



### SQLite: Connections are pooled

Tracking Issue #13837
What's new: Default to implicit ownership

#### Old behavior

Previously, connections in Microsoft.Data.Sqlite were not pooled.

#### New behavior

Starting in 6.0, connections are now pooled by default. This results in database files being kept open by the process even after the ADO.NET connection object is closed.

#### Why

Pooling the underlying connections greatly improves the performance of opening and closing ADO.NET connection objects.

#### Mitigations

Connection pooling can be disabled by adding ```Pooling=False``` to a connection string.

The connection pool for a database file has been cleared.

```csharp
SqliteConnection.ClearPool(connection);
File.Delete(databaseFile);
```



### Many-to-many relationships without mapped join entities are now scaffolded

Tracking Issue #22475

#### Old behavior

Scaffolding (reverse engineering) a ```DbContext``` and entity types from an existing database always explicitly mapped join tables to join entity types for many-to-many relationships.

#### New behavior

The following changes have been made to the syntax of the join table constructor.

#### Why

Many-to-many relationships without explicit join types were introduced in EF Core 5.0 and are a cleaner, more natural way to represent simple join tables.

#### Mitigations

Many-to-many relationships need to be joined directly to many-to-many relationships.

In this article, I'm going to show you how to add back the join type and navigations using partial classes.

```csharp
public partial class PostTag
{
    public int PostsId { get; set; }
    public int TagsId { get; set; }

    public virtual Post Posts { get; set; }
    public virtual Tag Tags { get; set; }
}

public partial class Post
{
    public virtual ICollection<PostTag> PostTags { get; set; }
}

public partial class Tag
{
    public virtual ICollection<PostTag> PostTags { get; set; }
}
```

Then add configuration for the join type and navigations to a partial class for the ```DbContext```:

```csharp
public partial class DailyContext
{
    partial void OnModelCreatingPartial(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Post>(entity =>
        {
            entity.HasMany(d => d.Tags)
                .WithMany(p => p.Posts)
                .UsingEntity<PostTag>(
                    l => l.HasOne<Tag>(e => e.Tags).WithMany(e => e.PostTags).HasForeignKey(e => e.TagsId),
                    r => r.HasOne<Post>(e => e.Posts).WithMany(e => e.PostTags).HasForeignKey(e => e.PostsId),
                    j =>
                    {
                        j.HasKey("PostsId", "TagsId");
                        j.ToTable("PostTag");
                    });
        });
    }
}
```

In this post I will show you how to scaffold the many-to-many relationship between two entities.

This example shows how to use the join entity as a many-to-many relationship in EF Core.

## Low-impact changes



### Cleaned up mapping between DeleteBehavior and ```ON DELETE``` values

Tracking Issue #21252

#### Old behavior

Some of the mappings between a relationship's OnDelete() behavior and the foreign keys' ```ON DELETE``` behavior in the database were inconsistent in both Migrations and Scaffolding.

#### New behavior

The following table illustrates the changes for Migrations.

The changes for Scaffolding are as follows.

#### Why

The new mappings are more consistent. The default database behavior of NO ACTION is now preferred over the more restrictive and less performant RESTRICT behavior.

#### Mitigations

If you are upgrading to EF Core 6.0 from EF 5.0 or earlier, you may want to consider changing the OnDelete behavior of optional relationships.

You can choose to either apply these operations or manually remove them from the migration since they have no functional impact on EF Core.

SQL Server doesn't support RESTRICT, so these foreign keys were already created using NO ACTION. The migration operations will have no affect on SQL Server and are safe to remove.



### In-memory database validates required properties do not contain nulls

Tracking Issue #10613

#### Old behavior

The in-memory database allowed saving ```null``` values even when the property was configured as required.

#### New behavior

The in-memory database throws a ```Microsoft.EntityFrameworkCore.DbUpdateException``` when ```SaveChanges``` or ```SaveChangesAsync``` is called and a required property is set to ```null```.

#### Why

The in-memory database behavior now matches the behavior of other databases.

#### Mitigations

The previous behavior (i.e. not checking ```null``` values) can be restored when configuring the in-memory provider. For example:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
{
    optionsBuilder
        .UseInMemoryDatabase("MyDatabase", b => b.EnableNullChecks(false));
}
```



### Removed last ORDER BY when joining for collections

Tracking Issue #19828

#### Old behavior

In this article, I'm going to show you how to perform SQL JOINs on collections (one-to-many relationships).

```sql
SELECT [b].[BlogId], [b].[Name], [p].[PostId], [p].[BlogId], [p].[Title]
FROM [Blogs] AS [b]
LEFT JOIN [Post] AS [p] ON [b].[BlogId] = [p].[BlogId]
ORDER BY [b].[BlogId], [p].[PostId]
```

These orderings are necessary for proper materialization of the entities.

#### New behavior

The very last ORDER BY for a collection join is now omitted:

```sql
SELECT [b].[BlogId], [b].[Name], [p].[PostId], [p].[BlogId], [p].[Title]
FROM [Blogs] AS [b]
LEFT JOIN [Post] AS [p] ON [b].[BlogId] = [p].[BlogId]
ORDER BY [b].[BlogId]
```

An ORDER BY for the ```Post```'s ID column is no longer generated.

#### Why

This paper shows how to remove the last ordering at the database side of EF Core.

#### Mitigations

If your application expects joined entities to be returned in a particular order, make that explicit by adding a LINQ ```OrderBy``` operator to your query.



### ```DbSet``` no longer implements ```IAsyncEnumerable```

Tracking Issue #24041

#### Old behavior

 ```DbSet```<TEntity>, which is used to execute queries on ```DbContext```, used to implement ```IAsyncEnumerable```<T>.

#### New behavior

 ```DbSet```<TEntity> no longer directly implements ```IAsyncEnumerable```<T>.

#### Why

DbSetT> and IAsyncEnumerableT> have been removed from System.Linq.

The deprecated ```DbSet``` method has been removed from ```IAsyncEnumerable```.

#### Mitigations

If you need to refer to a ```DbSet```<TEntity> as an ```IAsyncEnumerable```<T>, call ```DbSet```<TEntity>.AsAsyncEnumerable to explicitly cast it.



### TVF return entity type is also mapped to a table by default

Tracking Issue #23408

#### Old behavior

An entity type was not mapped to a table by default when used as a return type of a TVF configured with HasDbFunction.

#### New behavior

An entity type used as a return type of a TVF retains the default table mapping.

#### Why

It isn't intuitive that configuring a TVF removes the default table mapping for the return entity type.

#### Mitigations

To remove the default table mapping, call ToTable(EntityTypeBuilder, String):

```csharp
modelBuilder.Entity<MyEntity>().ToTable((string?)null));
```



### Check constraint name uniqueness is now validated

Tracking Issue #25061

#### Old behavior

Check constraints with the same name were allowed to be declared and used on the same table.

#### New behavior

Explicitly configuring two check constraints with the same name on the same table will now result in an exception. Check constraints created by a convention will be assigned a unique name.

#### Why

Is there a way to create two check constraints with the same name on the same table?

#### Mitigations

In some cases, valid check constraint names might be different due to this change. To specify the desired name explicitly, call HasName:

```csharp
modelBuilder.Entity<MyEntity>().HasCheckConstraint("CK_Id", "Id > 0", c => c.HasName("CK_MyEntity_Id"));
```



### ```Added``` ```IReadOnly``` Metadata interfaces and removed extension methods

Tracking Issue #19213

#### Old behavior

There were three sets of metadata interfaces: IModel, IMutableModel and IConventionModel as well as extension methods.

#### New behavior

A new set of ```IReadOnly``` interfaces has been added, e.g. IReadOnlyModel. Extension methods that were previously defined for the metadata interfaces have been converted to default interface methods.

#### Why

Default interface methods allow the implementation to be overridden, this is leveraged by the new run-time model implementation to offer better performance.

#### Mitigations

These changes shouldn't affect most code. However, if you were using the extension methods via the static invocation syntax, it would need to be converted to instance invocation syntax.



### IExecutionStrategy is now a singleton service

Tracking Issue #21350

#### New behavior

IExecutionStrategy has been renamed to IExecutionStrategy.

#### Why

This reduced allocations on two hot paths in EF.

#### Mitigations

Implementations deriving from ExecutionStrategy should clear any state in OnFirstExecution().

Conditional logic in the delegate passed to ExecutionStrategy should be moved to a custom implementation of IExecutionStrategy.



### SQL Server: More errors are considered transient

Tracking Issue #25050

#### New behavior

The errors listed in the issue above are now considered transient. When using the default (non-retrying) execution strategy, these errors will now be wrapped in an addition exception instance.

#### Why

We continue to gather feedback from both users and SQL Server team on which errors should be considered transient.

#### Mitigations

To change the set of errors that are considered transient, use a custom execution strategy that could be derived from SqlServerRetryingExecutionStrategy - Connection Resiliency - EF Core.



### Azure Cosmos DB: More characters are escaped in 'id' values

Tracking Issue #25100

#### Old behavior

In EF Core 5, only '|' was escaped in ```id``` values.

#### New behavior

In EF Core 6, '/', '\', '?' and '#' are also escaped in ```id``` values.

#### Why

These characters are invalid, as documented in Resource.Id. Using them in ```id``` will cause queries to fail.

#### Mitigations

You can override the generated value by setting it before the entity is marked as ```Added```:

```csharp
var entry = context.Attach(entity);
entry.Property("__id").CurrentValue = "MyEntity|/\\?#";
entry.State = EntityState.Added;
```



### Some ```Singleton``` services are now ```Scoped```

Tracking Issue #25084

#### New behavior

Many query services and some design-time services that were registered as ```Singleton``` are now registered as ```Scoped```.

#### Why

The lifetime had to be changed to allow a new feature - DefaultTypeMapping - to affect queries.

The design-time services lifetimes have been adjusted to match the run-time services lifetimes to avoid errors when using both.

#### Mitigations

Use TryAdd to register EF Core services using the default lifetime. Only use TryAddProviderSpecificServices for services that are not added by EF.



### New caching API for extensions that add or replace services

Tracking Issue #19152

#### Old behavior

In EF Core 5, GetServiceProviderHashCode returned ```long``` and was used directly as part of the cache key for the service provider.

#### New behavior

GetServiceProviderHashCode now returns ```int``` and is only used to calculate the hash code of the cache key for the service provider.

Also, ShouldUseSameServiceProvider needs to be implemented to indicate whether the current object represents the same service configuration and thus can use the same service provider.

#### Why

A new method has been developed to ensure that the same service provider is used on every workstation.

#### Mitigations

Many extensions don't expose any options that affect registered services and can use the following implementation of ShouldUseSameServiceProvider:

```csharp
private sealed class ExtensionInfo : DbContextOptionsExtensionInfo
{
    public ExtensionInfo(IDbContextOptionsExtension extension)
        : base(extension)
    {
    }

    ...

    public override bool ShouldUseSameServiceProvider(DbContextOptionsExtensionInfo other)
        => other is ExtensionInfo;
}
```

Otherwise, additional predicates should be added to compare all relevant options.



### New snapshot and design-time model initialization procedure

Tracking Issue #22031

#### Old behavior

In EF Core 5, specific conventions needed to be invoked before the snapshot model was ready to be used.

#### New behavior

The following changes have been made to the IModelRuntimer package.

#### Why

IModelRuntimeInitializer abstracts away the model finalization steps, so these can now be changed without further breaking changes for the users.

The optimized run-time model was introduced to improve run-time performance. It has several optimizations, one of which is removing metadata that is not used at run-time.

#### Mitigations

The following snippet illustrates how to check whether the current model is different from the snapshot model:

```csharp
var snapshotModel = migrationsAssembly.ModelSnapshot?.Model;

if (snapshotModel is IMutableModel mutableModel)
{
    snapshotModel = mutableModel.FinalizeModel();
}

if (snapshotModel != null)
{
    snapshotModel = context.GetService<IModelRuntimeInitializer>().Initialize(snapshotModel);
}

var hasDifferences = context.GetService<IMigrationsModelDiffer>().HasDifferences(
    snapshotModel?.GetRelationalModel(),
    context.GetService<IDesignTimeModel>().Model.GetRelationalModel());
```

This snippet shows how to implement IDesignTimeDbContextFactory<TContext> by creating a model externally and calling UseModel:

```csharp
internal class MyDesignContext : IDesignTimeDbContextFactory<MyContext>
{
    public TestContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder();
        optionsBuilder.UseSqlServer(Configuration.GetConnectionString("DB"));

        var modelBuilder = SqlServerConventionSetBuilder.CreateModelBuilder();
        CustomizeModel(modelBuilder);
        var model = modelBuilder.Model.FinalizeModel();

        var serviceContext = new MyContext(optionsBuilder.Options);
        model = serviceContext.GetService<IModelRuntimeInitializer>().Initialize(model);
        return new MyContext(optionsBuilder.Options);
    }
}
```



### ```OwnedNavigationBuilder.HasIndex``` returns a different type now

Tracking Issue #24005

#### Old behavior

In EF Core 5, HasIndex returned IndexBuilder<TEntity> where ```TEntity``` is the owner type.

#### New behavior

HasIndex now returns IndexBuilder<TDependentEntity>, where ```TDependentEntity``` is the owned type.

#### Why

The returned builder object wasn't typed correctly.

#### Mitigations

Recompiling your assembly against the latest version of EF Core will be enough to fix any issues caused by this change.



### DbFunctionBuilder.HasSchema(null) overrides [DbFunction(Schema = "schema")]

Tracking Issue #24228

#### Old behavior

In EF Core 5, calling ```HasSchema``` with ```null``` value didn't store the configuration source, thus DbFunctionAttribute was able to override it.

#### New behavior

Calling ```HasSchema``` with ```null``` value now stores the configuration source and prevents the attribute from overriding it.

#### Why

Configuration specified with the ModelBuilder API should not be overridable by data annotations.

#### Mitigations

Remove the ```HasSchema``` call to let the attribute configure the schema.



### Pre-initialized navigations are overridden by values from database queries

Tracking Issue #23851

#### Old behavior

Navigation properties set to an empty object were left unchanged for tracking queries, but were overwritten for non-tracking queries. For example, consider the following entity types:

```csharp
public class Foo
{
    public int Id { get; set; }

    public Bar Bar { get; set; } = new(); // Don't do this.
}

public class Bar
{
    public int Id { get; set; }
}
```

A no-tracking query for ```Foo``` including ```Bar``` set ```Foo.Bar``` to the entity queried from the database. For example, this code:

```csharp
var foo = context.Foos.AsNoTracking().Include(e => e.Bar).Single();
Console.WriteLine($"Foo.Bar.Id = {foo.Bar.Id}");
```

Printed ```Foo.Bar.Id = 1```.

However, the same query run for tracking didn't overwrite ```Foo.Bar``` with the entity queried from the database. For example, this code:

```csharp
var foo = context.Foos.Include(e => e.Bar).Single();
Console.WriteLine($"Foo.Bar.Id = {foo.Bar.Id}");
```

Printed ```Foo.Bar.Id = 0```.

#### New behavior

In EF Core 6.0, the behavior of tracking queries now matches that of no-tracking queries. This means that both this code:

```csharp
var foo = context.Foos.AsNoTracking().Include(e => e.Bar).Single();
Console.WriteLine($"Foo.Bar.Id = {foo.Bar.Id}");
```

And this code:

```csharp
var foo = context.Foos.Include(e => e.Bar).Single();
Console.WriteLine($"Foo.Bar.Id = {foo.Bar.Id}");
```

Print ```Foo.Bar.Id = 1```.

#### Why

There are two reasons for making this change:

- To ensure that tracking and no-tracking queries have consistent behavior.

- When a database is queried it is reasonable to assume that the application code wants to get back the values that are stored in the database.

#### Mitigations

There are two mitigations:

- Do not query for objects from the database that should not be included in the results. For example, in the code snippets above, do not ```Include``` ```Foo.Bar``` if the ```Bar``` instance should not be returned from the database and included in the results.

- Set the value of the navigation after querying from the database. For example, in the code snippets above, call foo.Bar = new() after running the query.

Consider not initializing related entity instances to default objects.



### Unknown enum string values in the database are not converted to the enum default when queried

Tracking Issue #24084

#### Old behavior

The Enum property can be set to the default value for an enum type.

#### New behavior

EF Core 6.0 now throws an ```InvalidOperationException``` with the message "Cannot convert string value '{value}' from the database to any value in the mapped '{enumType}' enum."

#### Why

Converting to the default value can result in database corruption if the entity is later saved back to the database.

#### Mitigations

Ideally, ensure that the database column only contains valid values. Alternately, implement a ```ValueConverter``` with the old behavior.



### DbFunctionBuilder.HasTranslation now provides the function arguments as ```IReadOnlyList``` rather than ```IReadOnlyCollection```

Tracking Issue #23565

#### Old behavior

When configuring translation for a user-defined function using ```HasTranslation``` method, the arguments to the function were provided as ```IReadOnlyCollection```<SqlExpression>.

#### New behavior

In EF Core 6.0, the arguments are now provided as ```IReadOnlyList```<SqlExpression>.

#### Why

 ```IReadOnlyList``` allows to use indexers, so the arguments are now easier to access.

#### Mitigations

None. ```IReadOnlyList``` implements ```IReadOnlyCollection``` interface, so the transition should be straightforward.



### Default table mapping is not removed when the entity is mapped to a table-valued function

Tracking Issue #23408

#### Old behavior

When an entity was mapped to a table-valued function, its default mapping to a table was removed.

#### New behavior

In EF Core 6.0, the entity is still mapped to a table using default mapping, even if it's also mapped to table-valued function.

#### Why

Table-valued functions which return entities are often used either as a helper or to encapsulate an operation returning a collection of entities, rather than a strict replacement of the entire table.

#### Mitigations

Mapping to a table can be explicitly disabled in the model configuration:

```csharp
modelBuilder.Entity<MyEntity>().ToTable((string)null);
```



### dotnet-ef targets .NET 6

Tracking Issue #27787

#### Old behavior

The dotnet-ef command has targeted .NET Core 3.1 for a while now. This allowed you to use newer version of the tool without installing newer versions of the .NET runtime.

#### New behavior

EF has updated its dotnet-ef tool to target .NET 6.

#### Why

The .NET 6.0.200 SDK updated the behavior of ```dotnet tool install``` on osx-arm64 to create an osx-x64 shim for tools targeting .NET Core 3.1.

#### Mitigations

To run dotnet-ef without installing the .NET 6 runtime, you can install an older version of the tool:

```dotnetcli
dotnet tool install dotnet-ef --version 3.1.*
```



### ```IModelCacheKeyFactory``` implementations may need to be updated to handle design-time caching

Tracking Issue #25154

#### Old behavior

 ```IModelCacheKeyFactory``` did not have an option to cache the design-time model separately from the runtime model.

#### New behavior

 ```IModelCacheKeyFactory``` has a new overload that allows the design-time model to be cached separately from the runtime model. Not implementing this method may result in an exception similar to:

#### Why

This paper describes how to implement compiled models in C.

#### Mitigations

Implement the new overload. For example:

```csharp
public object Create(DbContext context, bool designTime)
    => context is DynamicContext dynamicContext
        ? (context.GetType(), dynamicContext.UseIntProperty, designTime)
        : (object)context.GetType();
```

A fix-up has been released to fix a bug in the query 'Include'.



### ```NavigationBaseIncludeIgnored``` is now an error by default

Tracking Issue #4315

#### Old behavior

The event ```CoreEventId.NavigationBaseIncludeIgnored``` was logged as a warning by default.

#### New behavior

The event ```CoreEventId.NavigationBaseIncludeIgnored``` was logged as an error by default and causes an exception to be thrown.

#### Why

These query patterns are not allowed, so EF Core now throws to indicate that the queries should be updated.

#### Mitigations

The old behavior can be restored by configuring the event as a warning. For example:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder.ConfigureWarnings(b => b.Warn(CoreEventId.NavigationBaseIncludeIgnored));
```

Ref: [Breaking changes in EF Core 6.0](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-6.0/breaking-changes)