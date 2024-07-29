---
title: Entity Framework - Entity Framework Core - Manage database schemas - Migrations - Custom history table
published: true
date: 2024-07-29 10:16:59
tags: EFCore, Summary
description: How do I keep track of which migrations have been applied to the database?
image:
---

## In this article

How do I keep track of which migrations have been applied to the database?

> Important
If you customize the Migrations history table after applying migrations, you are responsible for updating the
existing table in the database.

## Schema and table name

You can change the schema and table name of a migration table using the ```MigrationsHistoryTable``` method in Onuring SQL Server (or ASP.NET Core).

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder options)
    => options.UseSqlServer(
        _connectionString,
        x => x.MigrationsHistoryTable("__MyMigrationsHistory", "mySchema"));
```

## Other changes

To configure additional aspects of the table, override and replace the provider-specific
```IHistoryRepository``` service. Here is an example of changing the MigrationId column name to Id on SQL Server.

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder options)
    => options
        .UseSqlServer(_connectionString)
        .ReplaceService<IHistoryRepository, MyHistoryRepository>();
```

> Warning
```SqlServerHistoryRepository``` is inside an internal namespace and may change in future releases.

```csharp
internal class MyHistoryRepository : SqlServerHistoryRepository
{
    public MyHistoryRepository(HistoryRepositoryDependencies dependencies)
        : base(dependencies)
    {
    }

    protected override void ConfigureTable(EntityTypeBuilder<HistoryRow> history)
    {
        base.ConfigureTable(history);

        history.Property(h => h.MigrationId).HasColumnName("Id");
    }
}
```

Ref: [Custom Migrations History Table](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/history-table)