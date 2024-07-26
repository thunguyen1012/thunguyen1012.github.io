---
title: Entity Framework - Entity Framework Core - Manage database schemas - Migrations - Overview
published: true
date: 2024-07-25 03:08:17
tags: EFCore, Summary
description: The migrations feature in EF Core provides a way to incrementally update the database schema to keep it in sync with the application's data model while preserving existing data in the database.
image:
---

## In this article

The migrations feature in EF Core provides a way to incrementally update the database schema to keep it in sync with the application's data model while preserving existing data in the database.

At a high level, migrations function in the following way:

- When a data model change is introduced, the developer uses EF Core tools to add a corresponding migration describing the updates necessary to keep the database schema in sync. EF Core compares the current model against a snapshot of the old model to determine the differences, and generates migration source files; the files can be tracked in your project's source control like any other source file.

- Once a new migration has been generated, it can be applied to a database in various ways. EF Core records all applied migrations in a special history table, allowing it to know which migrations have been applied and which haven't.

The rest of this page is a step-by-step beginner's guide for using migrations. Consult the other pages in this section for more in-depth information.

## Getting started

Let's assume you've just completed your first EF Core application, which contains the following simple model:

```csharp
public class Blog
{
    public int Id { get; set; }
    public string Name { get; set; }
}
```

In this session, we'll look at how to evolve your database schema without dropping the entire database.

### Install the tools

First, you'll have to install the EF Core command-line tools:

- We generally recommend using the .NET Core CLI tools, which work on all platforms.

- If you're more comfortable working inside Visual Studio or have experience with EF6 migrations, you can also use the Package Manager Console tools.

### Create your first migration

You're now ready to add your first migration! Instruct EF Core to create a migration named InitialCreate:

 - .NET Core CLI

 - Visual Studio

```dotnetcli
dotnet ef migrations add InitialCreate
```

```powershell
Add-Migration InitialCreate
```

In this article we're going to look at how to generate migration files using EF Core.

### Create your database and schema

At this point you can have EF create your database and create your schema from the migration. This can be done via the following:

 - .NET Core CLI

 - Visual Studio

```dotnetcli
dotnet ef database update
```

```powershell
Update-Database
```

In this tutorial, we'll show you how to migrate an existing application to a new database.

### Evolving your model

A few days have passed, and you're asked to add a creation timestamp to your blogs. You've done the necessary changes to your application, and your model now looks like this:

```csharp
public class Blog
{
    public int Id { get; set; }
    public string Name { get; set; }
    public DateTime CreatedTimestamp { get; set; }
}
```

Your model and your production database are now out of sync - we must add a new column to your database schema. Let's create a new migration for this:

 - .NET Core CLI

 - Visual Studio

```dotnetcli
dotnet ef migrations add AddBlogCreatedTimestamp
```

```powershell
Add-Migration AddBlogCreatedTimestamp
```

Note that we give migrations a descriptive name, to make it easier to understand the project history later.

EF Core now detects that a column has been added, and adds the appropriate migration.

You can now apply your migration as before:

 - .NET Core CLI

 - Visual Studio

```dotnetcli
dotnet ef database update
```

```powershell
Update-Database
```

We have applied a second migration to your database.

### Excluding parts of your model

Sometimes you may want to reference types from another DbContext. This can lead to migration conflicts. To prevent this, exclude the type from the migrations of one of the DbContexts.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<IdentityUser>()
        .ToTable("AspNetUsers", t => t.ExcludeFromMigrations());
}
```

### Next steps

If you have any questions about migrations, please feel free to contact us.

## Additional resources

- Entity Framework Core tools reference - .NET Core CLI : Includes commands to update, drop, add, remove, and  more.

- Entity Framework Core tools reference - Package Manager Console in Visual Studio : Includes commands to update, drop, add, remove, and  more.

- .NET Data Community Standup session going over new migration features in EF Core 5.0.

Ref: [Migrations Overview](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/)