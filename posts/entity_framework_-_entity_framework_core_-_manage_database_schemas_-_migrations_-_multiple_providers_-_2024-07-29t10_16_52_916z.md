---
title: Entity Framework - Entity Framework Core - Manage database schemas - Migrations - Multiple providers
published: true
date: 2024-07-29 10:16:52
tags: EFCore, Summary
description: This article describes how to scaffold migrations between providers using the EF Core Tools.
image:
---

## In this article

This article describes how to scaffold migrations between providers using the EF Core Tools.

## Using multiple context types

One way to create multiple migration sets is to use one DbContext type per provider.

```csharp
class SqliteBlogContext : BlogContext
{
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlite("Data Source=my.db");
}
```

Specify the context type when adding new migrations.

 - .NET Core CLI

 - Visual Studio

```dotnetcli
dotnet ef migrations add InitialCreate --context BlogContext --output-dir Migrations/SqlServerMigrations
dotnet ef migrations add InitialCreate --context SqliteBlogContext --output-dir Migrations/SqliteMigrations
```

```powershell
Add-Migration InitialCreate -Context BlogContext -OutputDir Migrations\SqlServerMigrations
Add-Migration InitialCreate -Context SqliteBlogContext -OutputDir Migrations\SqliteMigrations
```

> Tip
You don't need to specify the output directory for subsequent migrations since they are created as siblings to the
last one.

## Using one context type

It is possible to use one DbContext type in your migrations.

> Tip
You can view this article's sample on GitHub.

You can pass arguments into the app from the tools. This can enable a more streamlined workflow that avoids having to make manual changes to the project when running the tools.

Here's one pattern that works well when using a Generic Host.

```csharp
public static IHostBuilder CreateHostBuilder(string[] args)
    => Host.CreateDefaultBuilder(args)
        .ConfigureServices(
            (hostContext, services) =>
            {
                services.AddHostedService<Worker>();

                // Set the active provider via configuration
                var configuration = hostContext.Configuration;
                var provider = configuration.GetValue("Provider", "SqlServer");

                services.AddDbContext<BlogContext>(
                    options => _ = provider switch
                    {
                        "Sqlite" => options.UseSqlite(
                            configuration.GetConnectionString("SqliteConnection"),
                            x => x.MigrationsAssembly("SqliteMigrations")),

                        "SqlServer" => options.UseSqlServer(
                            configuration.GetConnectionString("SqlServerConnection"),
                            x => x.MigrationsAssembly("SqlServerMigrations")),

                        _ => throw new Exception($"Unsupported provider: {provider}")
                    });
            });
```

Since the default host builder reads configuration from command-line arguments, you can specify the provider when running the tools.

 - .NET Core CLI

 - Visual Studio

```dotnetcli
dotnet ef migrations add MyMigration --project ../SqlServerMigrations -- --provider SqlServer
dotnet ef migrations add MyMigration --project ../SqliteMigrations -- --provider Sqlite
```

> Tip
The -- token directs ```dotnet ef``` to treat everything that follows as an argument and not try to parse them as options. Any extra arguments not used by ```dotnet ef``` are forwarded to the app.

```powershell
Add-Migration MyMigration -Args "--provider SqlServer"
Add-Migration MyMigration -Args "--provider Sqlite"
```

Ref: [Migrations with Multiple Providers](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/providers)