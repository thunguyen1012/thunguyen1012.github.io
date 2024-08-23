---
title: Entity Framework - Entity Framework Core - Miscellaneous - Connection strings
published: true
date: 2024-08-23 09:57:40
tags: Summary, EFCore
description: Most database providers require some form of connection string to connect to the database. Sometimes this connection string contains sensitive information that needs to be protected. You may also need to change the connection string as you move your application between environments, such as development, testing, and production.
image:
---

## In this article

This article describes how to change the connection string between your application and a database.

## ASP.NET Core

In ASP.NET Core the configuration system is very flexible, and the connection string could be stored in ```appsettings.json```, an environment variable, the user secret store, or another configuration source. See the Configuration section of the ASP.NET Core documentation for more details.

For instance, you can use the Secret Manager tool to store your database password and then, in scaffolding, use a connection string that simply consists of ```Name=<database-alias>```.

```dotnetcli
dotnet user-secrets set ConnectionStrings:YourDatabaseAlias "Data Source=(localdb)\MSSQLLocalDB;Initial Catalog=YourDatabase"
dotnet ef dbcontext scaffold Name=ConnectionStrings:YourDatabaseAlias Microsoft.EntityFrameworkCore.SqlServer
```

Or the following example shows the connection string stored in ```appsettings.json```.

```json
{
  "ConnectionStrings": {
    "BloggingDatabase": "Server=(localdb)\\mssqllocaldb;Database=EFGetStarted.ConsoleApp.NewDb;Trusted_Connection=True;"
  },
}
```

Then the context is typically configured in ```Startup.cs``` with the connection string being read from configuration. Note the ```GetConnectionString()``` method looks for a configuration value whose key is ```ConnectionStrings:<connection string name>```. You need to import the ```Microsoft.Extensions.Configuration``` namespace to use this extension method.

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddDbContext<BloggingContext>(options =>
        options.UseSqlServer(Configuration.GetConnectionString("BloggingDatabase")));
}
```

## WinForms & WPF Applications

This article describes how to add a connection string to your application's configuration file.

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>

  <connectionStrings>
    <add name="BloggingDatabase"
         connectionString="Server=(localdb)\mssqllocaldb;Database=Blogging;Trusted_Connection=True;" />
  </connectionStrings>
</configuration>
```

> Tip
The ```providerName``` setting is not required on EF Core connection strings stored in App.config because the database provider is configured via code.

You can then read the connection string using the ```ConfigurationManager``` API in your context's ```OnConfiguring``` method. You may need to add a reference to the ```System.Configuration``` framework assembly to be able to use this API.

```csharp
public class BloggingContext : DbContext
{
    public DbSet<Blog> Blogs { get; set; }
    public DbSet<Post> Posts { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
      optionsBuilder.UseSqlServer(ConfigurationManager.ConnectionStrings["BloggingDatabase"].ConnectionString);
    }
}
```

## Universal Windows Platform (UWP)

Connection strings in a UWP application are typically a connection that just specifies a local filename.

```csharp
public class BloggingContext : DbContext
{
    public DbSet<Blog> Blogs { get; set; }
    public DbSet<Post> Posts { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
            optionsBuilder.UseSqlite("Data Source=blogging.db");
    }
}
```

Ref: [Connection Strings](https://learn.microsoft.com/en-us/ef/core/miscellaneous/connection-strings)