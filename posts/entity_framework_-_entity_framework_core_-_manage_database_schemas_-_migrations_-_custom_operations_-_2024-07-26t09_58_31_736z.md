---
title: Entity Framework - Entity Framework Core - Manage database schemas - Migrations - Custom operations
published: true
date: 2024-07-26 09:58:31
tags: EFCore, Summary
description: The MigrationBuilder API allows you to perform many different kinds of operations during a migration, but it's far from exhaustive.
image:
---

## In this article

The MigrationBuilder API allows you to perform many different kinds of operations during a migration, but it's far from exhaustive.

To illustrate, let's look at implementing an operation that creates a database user using each approach. In our migrations, we want to enable writing the following code:

```csharp
migrationBuilder.CreateUser("SQLUser1", "Password");
```

## Using MigrationBuilder.Sql()

The easiest way to implement a custom operation is to define an extension method that calls ```MigrationBuilder.Sql()```. Here is an example that generates the appropriate Transact-SQL.

```csharp
public static OperationBuilder<SqlOperation> CreateUser(
    this MigrationBuilder migrationBuilder,
    string name,
    string password)
    => migrationBuilder.Sql($"CREATE USER {name} WITH PASSWORD '{password}';");
```

> Tip
Use the ```EXEC``` function when a statement must be the first or only one in a SQL batch. It might also be needed to work around parser errors in idempotent migration scripts that can occur when referenced columns don't currently exist on a table.

If your migrations need to support multiple database providers, you can use the ```MigrationBuilder.ActiveProvider``` property. Here's an example supporting both Microsoft SQL Server and PostgreSQL.

```csharp
public static OperationBuilder<SqlOperation> CreateUser(
    this MigrationBuilder migrationBuilder,
    string name,
    string password)
{
    switch (migrationBuilder.ActiveProvider)
    {
        case "Npgsql.EntityFrameworkCore.PostgreSQL":
            return migrationBuilder
                .Sql($"CREATE USER {name} WITH PASSWORD '{password}';");

        case "Microsoft.EntityFrameworkCore.SqlServer":
            return migrationBuilder
                .Sql($"CREATE USER {name} WITH PASSWORD = '{password}';");
    }

    throw new Exception("Unexpected provider.");
}
```

This approach only works if you know every provider where your custom operation will be applied.

## Using a ```MigrationOperation```

A ```MigrationOperation``` is a custom operation that is used to migrate a database from one provider to another.

```csharp
public class CreateUserOperation : MigrationOperation
{
    public string Name { get; set; }
    public string Password { get; set; }
}
```

With this approach, the extension method just needs to add one of these operations to ```MigrationBuilder.Operations```.

```csharp
public static OperationBuilder<CreateUserOperation> CreateUser(
    this MigrationBuilder migrationBuilder,
    string name,
    string password)
{
    var operation = new CreateUserOperation { Name = name, Password = password };
    migrationBuilder.Operations.Add(operation);

    return new OperationBuilder<CreateUserOperation>(operation);
}
```

The ```IMigrationsSqlGenerator``` service allows providers to migrate data from one SQL Server to another.

```csharp
public class MyMigrationsSqlGenerator : SqlServerMigrationsSqlGenerator
{
    public MyMigrationsSqlGenerator(
        MigrationsSqlGeneratorDependencies dependencies,
        ICommandBatchPreparer commandBatchPreparer)
        : base(dependencies, commandBatchPreparer)
    {
    }

    protected override void Generate(
        MigrationOperation operation,
        IModel model,
        MigrationCommandListBuilder builder)
    {
        if (operation is CreateUserOperation createUserOperation)
        {
            Generate(createUserOperation, builder);
        }
        else
        {
            base.Generate(operation, model, builder);
        }
    }

    private void Generate(
        CreateUserOperation operation,
        MigrationCommandListBuilder builder)
    {
        var sqlHelper = Dependencies.SqlGenerationHelper;
        var stringMapping = Dependencies.TypeMappingSource.FindMapping(typeof(string));

        builder
            .Append("CREATE USER ")
            .Append(sqlHelper.DelimitIdentifier(operation.Name))
            .Append(" WITH PASSWORD = ")
            .Append(stringMapping.GenerateSqlLiteral(operation.Password))
            .AppendLine(sqlHelper.StatementTerminator)
            .EndCommand();
    }
}
```

Replace the default migrations sql generator service with the updated one.

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder options)
    => options
        .UseSqlServer(_connectionString)
        .ReplaceService<IMigrationsSqlGenerator, MyMigrationsSqlGenerator>();
```

Ref: [Custom Migrations Operations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/operations)