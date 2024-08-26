---
title: Entity Framework - Entity Framework Core - Database providers - Microsoft SQL Server and Azure SQL - Specify Azure SQL Database options
published: true
date: 2024-08-26 04:52:23
tags: Summary, EFCore
description: Azure SQL Database provides a variety of pricing options that are usually configured through the Azure Portal. However if you are managing the schema using EF Core migrations you can specify the desired options in the model itself.
image:
---

## In this article

In this article we are going to look at the pricing options available on Azure SQL Database.

You can specify the service tier of the database (EDITION) using ```HasServiceTier```:

```csharp
modelBuilder.HasServiceTier("BusinessCritical");
```

You can specify the maximum size of the database using `HasDatabaseMaxSize`:

```csharp
modelBuilder.HasDatabaseMaxSize("2 GB");
```

You can specify the performance level of the database (SERVICE_OBJECTIVE) using `HasPerformanceLevel`:

```csharp
modelBuilder.HasPerformanceLevel("BC_Gen4_1");
```

Use `HasPerformanceLevelSql` to configure the elastic pool, since the value is not a string literal:

```csharp
modelBuilder.HasPerformanceLevelSql("ELASTIC_POOL ( name = myelasticpool )");
```

> Tip
You can find all the supported values in the ALTER DATABASE documentation.

Ref: [Specifying Azure SQL Database Options](https://learn.microsoft.com/en-us/ef/core/providers/sql-server/azure-sql-database)