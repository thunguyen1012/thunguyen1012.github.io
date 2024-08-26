---
title: Entity Framework - Entity Framework Core - Database providers - Microsoft SQL Server and Azure SQL - Miscellaneous
published: true
date: 2024-08-26 04:52:30
tags: Summary, EFCore
description: Starting with EF Core 7.0, EF Core saves changes to the database with significantly optimized SQL; unfortunately, this technique is not supported on SQL Server if the target table has database triggers, or certain kinds of computed columns. For more information on this SQL Server limitation, see the documentation on the OUTPUT clause.
image:
---

## In this article

## SaveChanges, database triggers and unsupported computed columns

For more information on how to use EF Core with SQL Server, see the documentation on how to use EF Core with SQL Server.

You can let EF Core know that the target table has a trigger; doing so will revert to the previous, less efficient technique. This can be done by configuring the corresponding entity type as follows:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .ToTable(tb => tb.HasTrigger("SomeTrigger"));
}
```

If you want to tell EF Core which triggers are present on the table, you can use the following method.

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

Ref: [Miscellaneous notes for SQL Server](https://learn.microsoft.com/en-us/ef/core/providers/sql-server/misc)