---
title: Entity Framework - Entity Framework Core - Manage database schemas - Create and drop APIs
published: true
date: 2024-07-29 10:17:06
tags: EFCore, Summary
description: This article describes two methods that can be used to ensure that data is not dropped when the database schema changes.
image:
---

## In this article

This article describes two methods that can be used to ensure that data is not dropped when the database schema changes.

Some providers (especially non-relational ones) don't support Migrations. For these providers, ```EnsureCreated``` is often the easiest way to initialize the database schema.

> Warning
EnsureCreated and Migrations don't work well together. If you're using Migrations, don't use ```EnsureCreated``` to initialize the schema.

How do I transition from ```EnsureCreated``` to Migrations?

## ```EnsureDeleted```

The ```EnsureDeleted``` method will drop the database if it exists. If you don't have the appropriate permissions, an exception is thrown.

```csharp
// Drop the database if it exists
dbContext.Database.EnsureDeleted();
```

## ```EnsureCreated```

 ```EnsureCreated``` will create the database if it doesn't exist and initialize the database schema. If any tables exist (including tables for another ```DbContext``` class), the schema won't be initialized.

```csharp
// Create the database if it doesn't exist
dbContext.Database.EnsureCreated();
```

> Tip
Async versions of these methods are also available.

## SQL Script

To get the SQL used by ```EnsureCreated```, you can use the GenerateCreateScript method.

```csharp
var sql = dbContext.Database.GenerateCreateScript();
```

## Multiple ```DbContext``` classes

This guide will show you how to create a new table in the IRDatabaseCreator service.

```csharp
// TODO: Check whether the schema needs to be initialized

// Initialize the schema for this DbContext
var databaseCreator = dbContext.GetService<IRelationalDatabaseCreator>();
databaseCreator.CreateTables();
```

Ref: [Create and Drop APIs](https://learn.microsoft.com/en-us/ef/core/managing-schemas/ensure-created)