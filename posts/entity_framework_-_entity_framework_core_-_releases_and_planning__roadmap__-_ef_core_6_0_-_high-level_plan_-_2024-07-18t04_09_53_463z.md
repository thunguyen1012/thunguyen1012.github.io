---
title: Entity Framework - Entity Framework Core - Releases and planning (roadmap) - EF Core 6.0 - High-level plan
published: true
date: 2024-07-18 04:09:53
tags: EFCore, Summary
description: We are planning for the release of Entity Framework Core (EF Core) 6.0.
image:
---
- Article

  - 01/30/2023

  - 3 contributors

## In this article

> Important
EF Core 6.0 has now been released. This page remains as a historical record of the plan.

We are planning for the release of Entity Framework Core (EF Core) 6.0.

This release plan is designed to help you plan your investment in this release.

> Important
This plan is not a commitment. It is a starting point that will evolve as we learn more. Some things not currently planned for 6.0 may get pulled in. Some things currently planned for 6.0 may get punted out.

## General information

### Version number and release date

EF Core 6.0 is the next release after EF Core 5.0 and is currently scheduled for release in November 2021 at the same time as .NET 6.

### Supported platforms

EF Core 6.0 requires .NET 6. EF Core 6.0 does not target any .NET Standard version; for more information see the future of .NET Standard.

EF Core 6.0 will not run on .NET Framework.

EF Core 6.0 will align with .NET 6 as a long-term support (LTS) release.

### Breaking changes

The latest release of EF Core is now available.

## Themes

The following areas will form the basis for the large investments in EF Core 6.0.

## Highly requested features

As always, a major input into the planning process comes from the voting (👍) for features on GitHub. For EF Core 6.0 we plan to work on the following highly requested features:

### SQL Server temporal tables

Tracked by #4693

Status: Complete

T-shirt size: Large

The latest release of the Enterprise Framework (EF) will now support temporal tables.

This work is initially scoped as described on the issue. We may pull in additional support based on feedback during the release.

### JSON columns

Tracked by #4021

Status: Cut

T-shirt size: Medium

We are working on a new support feature for Npg and Pomelo.

### ColumnAttribute.Order

Tracked by #10059

Status: In-progress

T-shirt size: Small

A new column ordering feature has been added to the Entity Framework.

## Performance

We have been working on improving the performance of EF Core for some time.

This theme will involve a lot of iterative investigation, which will inform where we focus resources. We plan to begin with:

### Performance infrastructure and new tests

Status: Scoped/Complete

T-shirt size: Medium

EF Core 6.0 will introduce a new set of performance tests.

Update: We have improved test infrastructure and added new tests to support the work done for EF Core 6. Additional improvements in this area have been scoped out of the EF Core 6.0 release.

### Compiled models

Tracked by #1906

Status: Complete

T-shirt size: X-Large

Compiled models will allow the generation of a compiled form of the EF model. This will provide both better startup performance, as well as generally better performance when accessing the model.

### TechEmpower Fortunes

Tracked by #23611

Status: Complete

T-shirt size: X-Large

We have been running the Fortunes benchmark on .NET against a database for several years.

- An implementation that uses ADO.NET directly. This is the fastest implementation of the three listed here.

- An implementation that uses Dapper. This is slower than using ADO.NET directly, but still fast.

- An implementation that uses EF Core. This is currently the slowest implementation of the three.

This week we are testing the latest release of EF Core.

### Linker/AOT

Tracked by #10963

Status: Scoped/Complete

T-shirt size: Medium

We've been working on improving the performance of EF Core for some time.

## Migrations and deployment

Following on from the investigations done for EF Core 5.0, we plan to introduce improved support for managing migrations and deploying databases. This includes two major areas:

### Migrations bundles

Tracked by #19693

Status: Complete

T-shirt size: Medium

A migrations bundle has been released for the dotnet ef database.

### Managing migrations

Tracked by #22945

Status: Cut

T-shirt size: Large

In the last release of EF Core, we made some improvements to the way migrations were handled.

Update: most of the work in this area has been cut for 6.0 due to resource constraints.

## Improve existing features and fix bugs

Any issue or bug assigned to the 6.0.0 milestone is currently planned for this release. This includes many small enhancements and bug fixes.

### EF6 query parity

Tracked by issues labeled with 'ef6-parity' and in the 6.0 milestone

Status: Scoped/Complete

T-shirt size: Large

EF Core 5.0 and EF Core 6.0 do not support all query patterns supported by EF6.

Update: Raw SQL queries for primitive and unmapped types has been cut from 6.0 due to resourcing constraints and priority adjustments.

### Value objects

Tracked by #9906

Status: Cut

T-shirt size: Medium

EF Core 6.0 will introduce a better experience focused on the needs of value objects in domain-driven design.

This work is initially scoped to allow value converters which map to multiple columns. We may pull in additional support based on feedback during the release.

### Azure Cosmos DB database provider

Tracked by issues labeled with 'area-cosmos' and in the 6.0 milestone

Status: Expanded/Complete

T-shirt size: Large

Azure Cosmos DB is part of EF Core 6.0.

Update: We have been doing extensive customer development around the Azure Cosmos DB provider. This has resulted in the following enhancements being pulled into EF Core 6.0:

- Azure Cosmos DB provider should default to implicit ownership

- Set partition key on join entity type by convention

- FromSql support

- Configure TTL per entity/entity type/collection

- API to configure container facets (throughput, size, partition key, etc.)

- Diagnostic events including statistics (query cost, activity id)

- Distinct operator in queries

- Add translators for member/methods which map to built-in functions

- Add basic support for collections and dictionaries of primitive types

Update: The following issues were cut from the 6.0 release:

- Find/FindAsync performs SQL API query when entity has embedded entities

- Optimize more queries that could use ReadItem

- Detect partition key filters in more queries

- Translate subquery in filter condition

- Allow to specify consistency level for CUD operations

- Support aggregate operators

### Expose model building conventions to applications

Tracked by #214

Status: Cut

T-shirt size: Medium

EF Core 6.0 will allow applications to hook into and change the conventions used by the database provider.

### Zero bug balance (ZBB)

Tracked by issues labeled with ```type-bug``` in the 6.0 milestone

Status: In-progress/Scoped

T-shirt size: Large

We plan to fix all outstanding bugs during the EF Core 6.0 time frame. Some things to keep in mind:

- This specifically applies to issues labeled ```type-bug```.

- There will be exceptions, such as when the bug requires a design change or new feature to fix properly. These issues will be marked with the ```blocked``` label.

- We will punt bugs based on risk when needed as is normal as we get close to a GA/RTM release.

### Miscellaneous features

Tracked by issues labeled with ```type-enhancement``` in the 6.0 milestone

Status: Complete

T-shirt size: Large

Miscellaneous features planned for EF 6.0 include, but are not limited to:

- Split query for non-navigation collections

- Detect simple join tables in reverse engineering and create many-to-many relationships

- Mechanism/API to specify a default conversion for any property of a given type in the model

Update: The following issues were cut from the 6.0 release:

- Complete full/free-text search on SQLite and SQL Server

- SQL Server spatial indexes

- Use the new batching API from ADO.NET

## .NET integration

The EF Core team also works on several related but independent technologies. In particular, we plan to work on:

### Enhancements to System.Data

Tracked by issues in the dotnet\runtime repo labeled with ```area-System.Data``` in the 6.0 milestone

Status: Scoped/Complete

T-shirt size: Large

This work includes:

- Implementation of the new batching API.

- Continued work with other .NET teams and the community to understand and evolve ADO.NET.

Update: The following issues were cut from the 6.0 release:

- Standardize on DiagnosticSource for tracing in System.Data.* components.

### Enhancements to Microsoft.Data.Sqlite

Tracked by issues labeled with ```type-enhancement``` and ```area-adonet-sqlite``` in the 6.0 milestone

Status: Scoped/Complete

T-shirt size: Medium

Several small improvements are planned for the Microsoft.Data.Sqlite, including connection pooling and prepared statements for performance.

Update: Prepared statements has been cut from the 6.0 release.

### Nullable reference types

Tracked by #14150

Status: Complete

T-shirt size: Large

We will annotate the EF Core code to use nullable reference types.

## Experiments and investigations

EF Core 6.0 will be released in the second half of 2017.

### SqlServer.Core

Tracked in the .NET Data Lab repo

Status: In-progress

T-shirt size: Ongoing

In this talk, we are going to investigate what potential there is for a highly performing SQL Server driver for .NET.

> Important
Investment in Microsoft.Data.SqlClient is not changing. It will continue to be the recommended way to connect to SQL Server and SQL Azure, both with and without EF Core. It will continue to support new SQL Server features as they are introduced.

### GraphQL

Status: In-progress

T-shirt size: Ongoing

.NET is one of Microsoft's core technologies.

### DataVerse (formerly Common Data Services)

Status: In-progress

T-shirt size: Ongoing

The purpose of this study is to define, describe, and analyse the .NET Data Store (SDK).

## Below-the-cut-line

Tracked by issues labeled with ```consider-for-current-release```

This is a list of improvements and bug fixes that are being considered for release of EF Core 6.0.

We are always looking for ways to improve the game.

## Suggestions

If you have any questions about the planning process, please feel free to contact us.

Ref: [Plan for Entity Framework Core 6.0](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-6.0/plan)