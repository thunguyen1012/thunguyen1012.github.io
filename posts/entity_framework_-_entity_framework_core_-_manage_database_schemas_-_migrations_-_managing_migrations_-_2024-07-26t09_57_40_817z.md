---
title: Entity Framework - Entity Framework Core - Manage database schemas - Migrations - Managing migrations
published: true
date: 2024-07-26 09:57:40
tags: EFCore, Summary
description: Migrations are files that move your model from one version of EF to another.
image:
---

## In this article

Migrations are files that move your model from one version of EF to another.

> Tip
If the ```DbContext``` is in a different assembly than the startup project, you can explicitly specify the target and startup projects in either the Package Manager Console tools or the .NET Core CLI tools.

## Add a migration

After your model has been changed, you can add a migration for that change:

 - .NET Core CLI

 - Visual Studio

```dotnetcli
dotnet ef migrations add AddBlogCreatedTimestamp
```

```powershell
Add-Migration AddBlogCreatedTimestamp
```

You can choose a name for the migration of a property from one system to another.

Three files are added to your project under the Migrations directory:

- XXXXXXXXXXXXXX_AddCreatedTimestamp.cs--The main migrations file. Contains the operations necessary to apply the migration (in ```Up```) and to revert it (in ```Down```).

- XXXXXXXXXXXXXX_AddCreatedTimestamp.Designer.cs--The migrations metadata file. Contains information used by EF.

- MyContextModelSnapshot.cs--A snapshot of your current model. Used to determine what changed when adding the next migration.

The timestamp in the filename helps keep them ordered chronologically so you can see the progression of changes.

### Namespaces

This page shows how to create and manage migration files.

 - .NET Core CLI

 - Visual Studio

```dotnetcli
dotnet ef migrations add InitialCreate --output-dir Your/Directory
```

> Note
You can also change the namespace independently of the directory using ```--namespace```.

```powershell
Add-Migration InitialCreate -OutputDir Your\Directory
```

> Note
You can also change the namespace independently of the directory using ```-Namespace```.

## Customize migration code

While EF Core generally creates accurate migrations, you should always review the code and make sure it corresponds to the desired change; in some cases, it is even necessary to do so.

### Column renames

One notable example where customizing migrations is required is when renaming a property. For example, if you rename a property from ```Name``` to ```FullName```, EF Core will generate the following migration:

```csharp
migrationBuilder.DropColumn(
    name: "Name",
    table: "Customers");

migrationBuilder.AddColumn<string>(
    name: "FullName",
    table: "Customers",
    nullable: true);
```

If you want to rename a column, use the following steps.

```csharp
migrationBuilder.RenameColumn(
    name: "Name",
    table: "Customers",
    newName: "FullName");
```

> Tip
The migration scaffolding process warns when an operation might result in data loss (like dropping a column). If you see that warning, be especially sure to review the migrations code for accuracy.

### Adding raw SQL

In this article we are going to show you how to rename a column using EF Core.

```csharp
migrationBuilder.DropColumn(
    name: "FirstName",
    table: "Customer");

migrationBuilder.DropColumn(
    name: "LastName",
    table: "Customer");

migrationBuilder.AddColumn<string>(
    name: "FullName",
    table: "Customer",
    nullable: true);
```

As before, this would cause unwanted data loss. To transfer the data from the old columns, we rearrange the migrations and introduce a raw SQL operation as follows:

```csharp
migrationBuilder.AddColumn<string>(
    name: "FullName",
    table: "Customer",
    nullable: true);

migrationBuilder.Sql(
@"
    UPDATE Customer
    SET FullName = FirstName + ' ' + LastName;
");

migrationBuilder.DropColumn(
    name: "FirstName",
    table: "Customer");

migrationBuilder.DropColumn(
    name: "LastName",
    table: "Customer");
```

### Arbitrary changes via raw SQL

Raw SQL can be used to manage database objects that EF Core isn't aware of.

For example, the following migration creates a SQL Server stored procedure:

```csharp
migrationBuilder.Sql(
@"
    EXEC ('CREATE PROCEDURE getFullName
        @LastName nvarchar(50),
        @FirstName nvarchar(50)
    AS
        RETURN @LastName + @FirstName;')");
```

> Tip
EXEC is used when a statement must be the first or only one in a SQL batch. It can also be used to work around parser errors in idempotent migration scripts that can occur when referenced columns don't currently exist on a table.

This can be used to manage any aspect of your database, including:

- Stored procedures

- Full-Text Search

- Functions

- Triggers

- Views

EF Core will automatically apply migrations to your database.

## Remove a migration

Sometimes you add a migration and realize you need to make additional changes to your EF Core model before applying it. To remove the last migration, use this command.

 - .NET Core CLI

 - Visual Studio

```dotnetcli
dotnet ef migrations remove
```

```powershell
Remove-Migration
```

After removing the migration, you can make the additional model changes and add it again.

> Warning
Avoid removing any migrations which have already been applied to production databases. Doing so means you won't be able to revert those migrations from the databases, and may break the assumptions made by subsequent migrations.

## Listing migrations

You can list all existing migrations as follows:

 - .NET Core CLI

 - Visual Studio

```dotnetcli
dotnet ef migrations list
```

```powershell
Get-Migration
```

## Checking for pending model changes

> Note
This feature was added in EF Core 8.0.

How do I check if a model has been migrated?

```dotnetcli
dotnet ef migrations has-pending-model-changes
```

You can also perform this check programmatically using ```context.Database.HasPendingModelChanges()```. This can be used to write a unit test that fails when you forget to add a migration.

## Resetting all migrations

In some cases, you may need to migrate your database to another database.

It's also possible to reset all migrations and create a single one without losing your data. This is sometimes called "squashing", and involves some manual work:

- Back up your database, in case something goes wrong.

- In your database, delete all rows from the migrations history table (e.g. ```DELETE FROM [__EFMigrationsHistory]``` on SQL Server).

- Delete your Migrations folder.

- Create a new migration and generate a SQL script for it (dotnet ef migrations script).

- Insert a single row into the migrations history, to record that the first migration has already been applied, since your tables are already there. The insert SQL is the last operation in the SQL script generated above, and resembles the following (don't forget to update the values):

```sql
INSERT INTO [__EFMigrationsHistory] ([MIGRATIONID], [PRODUCTVERSION])
VALUES (N'<full_migration_timestamp_and_name>', N'<EF_version>');
```

> Warning
Any custom migration code will be lost when the Migrations folder is deleted.  Any customizations must be applied to the new initial migration manually in order to be preserved.

## Additional resources

- Entity Framework Core tools reference - .NET Core CLI : Includes commands to update, drop, add, remove, and  more.

- Entity Framework Core tools reference - Package Manager Console in Visual Studio : Includes commands to update, drop, add, remove, and  more.

Ref: [Managing Migrations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/managing)