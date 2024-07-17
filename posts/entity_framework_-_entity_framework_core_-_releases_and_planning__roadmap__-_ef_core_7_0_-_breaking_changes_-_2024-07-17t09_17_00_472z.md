---
title: Entity Framework - Entity Framework Core - Releases and planning (roadmap) - EF Core 7.0 - Breaking changes
published: true
date: 2024-07-17 09:17:00
tags: EFCore, Summary
description: EF Core 7 has been released and is now available for download.
image:
---
- Article

  - 09/21/2023

  - 4 contributors

## In this article

EF Core 7 has been released and is now available for download.

- Breaking changes in EF Core 6

## Target Framework

EF Core 7.0 is now available.

## Summary

## High-impact changes



### ```Encrypt``` defaults to ```true``` for SQL Server connections

Tracking Issue: SqlClient #1210

> Important
This is a severe breaking change in the Microsoft.Data.SqlClient package. There is nothing that can be done in EF Core to revert or mitigate this change. Please direct feedback to the Microsoft.Data.SqlClient GitHub Repo or contact a Microsoft Support Professional for additional questions or help.

#### Old behavior

SqlClient connection strings use ```Encrypt=False``` by default. This allows connections on development machines where the local server does not have a valid certificate.

#### New behavior

SqlClient connection strings use ```Encrypt=True``` by default. This means that:

- The server must be configured with a valid certificate

- The client must trust this certificate

If these conditions are not met, then a ```SqlException``` will be thrown. For example:

#### Why

This change was made to ensure that, by default, either the connection is secure or the application will fail to connect.

#### Mitigations

There are three ways to proceed:

- Install a valid certificate on the server. Note that this is an involved process and requires obtaining a certificate and ensuring it is signed by an authority trusted by the client.

- If the server has a certificate, but it is not trusted by the client, then ```TrustServerCertificate=True``` to allow bypassing the normal trust mechanims.

- Explicitly add ```Encrypt=False``` to the connection string.

> Warning
Options 2 and 3 both leave the server in a potentially insecure state.



### Some warnings throw exceptions by default again

Tracking Issue #29069

#### Old behavior

In EF Core 6.0, a bug in the SQL Server provider meant that some warnings that are configured to throw exceptions by default were instead being logged but not throwing exceptions. These warnings are:

#### New behavior

Starting with EF Core 7.0, these warnings again, by default, result in an exception being thrown.

#### Why

These are issues that very likely indicate an error in the application code that should be fixed.

#### Mitigations

Fix the underlying issue that is the reason for the warning.

Alternately, the warning level can be changed so that it is logged only or suppressed entirely. For example:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder
        .ConfigureWarnings(b => b.Ignore(RelationalEventId.AmbientTransactionWarning));
```



### SQL Server tables with triggers or certain computed columns now require special EF Core configuration

Tracking Issue #27372

#### Old behavior

Previous versions of the SQL Server provider saved changes via a less efficient technique which always worked.

#### New behavior

EF Core now saves changes via a significantly more efficient technique; unfortunately, this technique is not supported on SQL Server if the target table has database triggers, or certain types of computed columns.

#### Why

In this paper, we investigate the impact of a new database trigger method on EF Core applications.

#### Mitigations

Starting with EF Core 8.0, the use or not of the "OUTPUT" clause can be configured explicitly. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .ToTable(tb => tb.UseSqlOutputClause(false));
}
```

If you have a trigger in a target table, then you can let EF Core know this, and EF will revert to the previous, less efficient technique.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .ToTable(tb => tb.HasTrigger("SomeTrigger"));
}
```

The following snippet shows how to tell EF Core that a trigger is present in a table.

If most or all of your tables have triggers, you can opt out of using the newer, efficient technique for all your model's tables by using the following model building convention:

```csharp
public class BlankTriggerAddingConvention : IModelFinalizingConvention
{
    public virtual void ProcessModelFinalizing(
        IConventionModelBuilder modelBuilder,
        IConventionContext<IConventionModelBuilder> context)
    {
        foreach (var entityType in modelBuilder.Metadata.GetEntityTypes())
        {
            var table = StoreObjectIdentifier.Create(entityType, StoreObjectType.Table);
            if (table != null
                && entityType.GetDeclaredTriggers().All(t => t.GetDatabaseName(table.Value) == null)
                && (entityType.BaseType == null
                    || entityType.GetMappingStrategy() != RelationalAnnotationNames.TphMappingStrategy))
            {
                entityType.Builder.HasTrigger(table.Value.Name + "_Trigger");
            }

            foreach (var fragment in entityType.GetMappingFragments(StoreObjectType.Table))
            {
                if (entityType.GetDeclaredTriggers().All(t => t.GetDatabaseName(fragment.StoreObject) == null))
                {
                    entityType.Builder.HasTrigger(fragment.StoreObject.Name + "_Trigger");
                }
            }
        }
    }
}
```

Use the convention on your ```DbContext``` by overriding ```ConfigureConventions```:

```csharp
protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
{
    configurationBuilder.Conventions.Add(_ => new BlankTriggerAddingConvention());
}
```

This effectively calls ```HasTrigger``` on all your model's tables, instead of you having to do it manually for each and every table.



### SQLite tables with AFTER triggers and virtual tables now require special EF Core configuration

Tracking Issue #29916

#### Old behavior

Previous versions of the SQLite provider saved changes via a less efficient technique which always worked.

#### New behavior

An update to EF Core has been released.

#### Why

In this paper, we examine the impact of introducing a new method for managing database triggers on EF Core applications.

#### Mitigations

In EF Core 8.0, the ```UseSqlReturningClause``` method has been introduced to explicitly revert back to the older, less efficient SQL. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .ToTable(tb => tb.UseSqlReturningClause(false));
}
```

If you are still using EF Core 7.0, then it's possible to revert to the old mechanism for the entire application by inserting the following code in your context configuration:

```c#
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder
        .UseSqlite(...)
        .ReplaceService<IUpdateSqlGenerator, SqliteLegacyUpdateSqlGenerator>();
```

## Medium-impact changes



### Orphaned dependents of optional relationships are not automatically deleted

Tracking Issue #27217

#### Old behavior

A relationship is optional if its foreign key is null.

An optional dependent can be severed from its principal by either setting its foreign key to null, or clearing the navigation to or from it.

#### New behavior

A dependent is deleted when the principal of the relationship is deleted.

#### Why

The dependent can exist without any relationship to a principal, so severing the relationship should not cause the entity to be deleted.

#### Mitigations

The dependent can be explicitly deleted:

```csharp
context.Remove(blog);
```

Or ```SaveChanges``` can be overridden or intercepted to delete dependents with no principal reference. For example:

```csharp
context.SavingChanges += (c, _) =>
    {
        foreach (var entry in ((DbContext)c!).ChangeTracker
            .Entries<Blog>()
            .Where(e => e.State == EntityState.Modified))
        {
            if (entry.Reference(e => e.Author).CurrentValue == null)
            {
                entry.State = EntityState.Deleted;
            }
        }
    };
```



### Cascade delete is configured between tables when using TPT mapping with SQL Server

Tracking Issue #28532

#### Old behavior

EF Core configures a cascade deletes for this.

In EF Core 6.0, a bug in the SQL Server database provider meant that these cascade deletes were not being created.

#### New behavior

Starting with EF Core 7.0, the cascade deletes are now being created for SQL Server just as they always were for other databases.

#### Why

Cascade deletes from the base table to the sub-tables in TPT allow an entity to be deleted by deleting its row in the base table.

#### Mitigations

In the latest release of SQL Server, there is a change to the mapping between tables in the TPT mapping.

For example, this model creates a cycle of cascading relationships:

```csharp
[Table("FeaturedPosts")]
public class FeaturedPost : Post
{
    public int ReferencePostId { get; set; }
    public Post ReferencePost { get; set; } = null!;
}

[Table("Posts")]
public class Post
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? Content { get; set; }
}
```

One of these will need to be configured to not use cascade deletes on the server. For example, to change the explicit relationship:

```csharp
modelBuilder
    .Entity<FeaturedPost>()
    .HasOne(e => e.ReferencePost)
    .WithMany()
    .OnDelete(DeleteBehavior.ClientCascade);
```

Or to change the implicit relationship created for the TPT mapping:

```csharp
modelBuilder
    .Entity<FeaturedPost>()
    .HasOne<Post>()
    .WithOne()
    .HasForeignKey<FeaturedPost>(e => e.Id)
    .OnDelete(DeleteBehavior.ClientCascade);
```



### Higher chance of busy/locked errors on SQLite when not using write-ahead logging

#### Old behavior

Microsoft has released a new version of its SQL Server Reporting Services (SSRS) that allows changes to a table to be automatically retryed.

#### New behavior

EF Core now saves changes via a more efficient technique, using the RETURNING clause.

#### Why

A team of researchers at the University of California, Berkeley, has released a new logging method for the Apache Struts framework.

#### Mitigations

How do I enable write-ahead logging on my database?

```sql
PRAGMA journal_mode = 'wal';
```

If, for some reason, you can't enable write-ahead logging, it's possible to revert to the old mechanism for the entire application by inserting the following code in your context configuration:

 - EF Core 7.0

 - EF Core 8.0 and above

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder
        .UseSqlite(...)
        .ReplaceService<IUpdateSqlGenerator, SqliteLegacyUpdateSqlGenerator>();
```

```csharp
protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
{
    configurationBuilder.Conventions.Add(_ => new DoNotUseReturningClauseConvention());
}
```

```csharp
class DoNotUseReturningClauseConvention : IModelFinalizingConvention
{
    public void ProcessModelFinalizing(
        IConventionModelBuilder modelBuilder,
        IConventionContext<IConventionModelBuilder> context)
    {
        foreach (var entityType in modelBuilder.Metadata.GetEntityTypes())
        {
            entityType.UseSqlReturningClause(false);
        }
    }
}
```

## Low-impact changes



### Key properties may need to be configured with a provider value comparer

Tracking Issue #27738

#### Old behavior

EF Core 7.0 introduces the ability to compare key values between entity types.

#### New behavior

A "provider value comparer" can be used to compare the values of two or more properties.

#### Why

Entity-splitting and table-splitting can result in multiple properties mapped to the same database column, and vice-versa.

#### Mitigations

Configure a provider value comparer. For example, consider the case where a value object is being used as a key, and the comparer for that key uses case-insensitive string comparisons:

```csharp
var blogKeyComparer = new ValueComparer<BlogKey>(
    (l, r) => string.Equals(l.Id, r.Id, StringComparison.OrdinalIgnoreCase),
    v => v.Id.ToUpper().GetHashCode(),
    v => v);

var blogKeyConverter = new ValueConverter<BlogKey, string>(
    v => v.Id,
    v => new BlogKey(v));

modelBuilder.Entity<Blog>()
    .Property(e => e.Id).HasConversion(
        blogKeyConverter, blogKeyComparer);
```

The database values (strings) cannot directly use the comparer defined for ```BlogKey``` types. Therefore, a provider comparer for case-insensitive string comparisons must be configured:

```csharp
var caseInsensitiveComparer = new ValueComparer<string>(
    (l, r) => string.Equals(l, r, StringComparison.OrdinalIgnoreCase),
    v => v.ToUpper().GetHashCode(),
    v => v);

var blogKeyComparer = new ValueComparer<BlogKey>(
    (l, r) => string.Equals(l.Id, r.Id, StringComparison.OrdinalIgnoreCase),
    v => v.Id.ToUpper().GetHashCode(),
    v => v);

var blogKeyConverter = new ValueConverter<BlogKey, string>(
    v => v.Id,
    v => new BlogKey(v));

modelBuilder.Entity<Blog>()
    .Property(e => e.Id).HasConversion(
        blogKeyConverter, blogKeyComparer, caseInsensitiveComparer);
```



### Check constraints and other table facets are now configured on the table

Tracking Issue #28205

#### Old behavior

In EF Core 6.0, ```HasCheckConstraint```, ```HasComment```, and ```IsMemoryOptimized``` were called directly on the entity type builder. For example:

```csharp
modelBuilder
    .Entity<Blog>()
    .HasCheckConstraint("CK_Blog_TooFewBits", "Id > 1023");

modelBuilder
    .Entity<Blog>()
    .HasComment("It's my table, and I'll delete it if I want to.");

modelBuilder
    .Entity<Blog>()
    .IsMemoryOptimized();
```

#### New behavior

Starting with EF Core 7.0, these methods are instead called on the table builder:

```csharp
modelBuilder
    .Entity<Blog>()
    .ToTable(b => b.HasCheckConstraint("CK_Blog_TooFewBits", "Id > 1023"));

modelBuilder
    .Entity<Blog>()
    .ToTable(b => b.HasComment("It's my table, and I'll delete it if I want to."));

modelBuilder
    .Entity<Blog>()
    .ToTable(b => b.IsMemoryOptimized());
```

The existing methods have been marked as ```Obsolete```. They currently have the same behavior as the new methods, but will be removed in a future release.

#### Why

These facets apply to tables only. They will not be applied to any mapped views, functions, or stored procedures.

#### Mitigations

Use the table builder methods, as shown above.



### Navigations from new entities to deleted entities are not fixed up

Tracking Issue #28249

#### Old behavior

In EF Core 6.0, when a new entity is tracked either from a tracking query or by attaching it to the ```DbContext```, then navigations to and from related entities in the ```Deleted``` state are fixed up.

#### New behavior

Starting with EF Core 7.0, navigations to and from ```Deleted``` entities are not fixed up.

#### Why

Once an entity is marked as ```Deleted``` it rarely makes sense to associate it with non-deleted entities.

#### Mitigations

Query or attach entities before marking entities as ```Deleted```, or manually set navigation properties to and from the deleted entity.



### Using ```FromSqlRaw``` and related methods from the wrong provider throws use-the-correct-method

Tracking Issue #26502

#### Old behavior

EF Core 6.0 introduces a silent no-op for some Azure Cosmos DB methods.

#### New behavior

Starting with EF Core 7.0, using an extension method designed for one provider on a different provider will throw an exception.

#### Why

The correct extension method must be used for it to function correctly in all situations.

#### Mitigations

Use the correct extension method for the provider being used. If multiple providers are referenced, then call the extension method as a static method. For example:

```csharp
var result = CosmosQueryableExtensions.FromSqlRaw(context.Blogs, "SELECT ...").ToList();
```

Or:

```csharp
var result = RelationalQueryableExtensions.FromSqlRaw(context.Blogs, "SELECT ...").ToList();
```



### Scaffolded ```OnConfiguring``` no longer calls ```IsConfigured```

Tracking Issue #4274

#### Old behavior

In EF Core 6.0, the ```DbContext``` type scaffolded from an existing database contained a call to ```IsConfigured```. For example:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
{
    if (!optionsBuilder.IsConfigured)
    {
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see http://go.microsoft.com/fwlink/?LinkId=723263.
        optionsBuilder.UseNpgsql("MySecretConnectionString");
    }
}
```

#### New behavior

Starting with EF Core 7.0, the call to ```IsConfigured``` is no longer included.

#### Why

Is it really necessary to leave Onuring inside your ```DbContext```?

#### Mitigations

Either:

- Use the ```--no-onconfiguring``` (.NET CLI) or ```-NoOnConfiguring``` (Visual Studio Package Manager Console) argument when scaffolding from an existing database.

- Customize the T4 templates to add back the call to ```IsConfigured```.

Ref: [Breaking changes in EF Core 7.0 (EF7)](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-7.0/breaking-changes)