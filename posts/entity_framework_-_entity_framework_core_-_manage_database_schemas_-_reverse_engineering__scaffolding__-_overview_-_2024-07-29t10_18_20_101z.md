---
title: Entity Framework - Entity Framework Core - Manage database schemas - Reverse engineering (scaffolding) - Overview
published: true
date: 2024-07-29 10:18:20
tags: EFCore, Summary
description: In this article, we will learn how to perform reverse engineering using the EF Core Package Manager Console and the dotnet ef dbcontext command of the .NET Command-line Interface (CLI) tools.
image:
---

## In this article

In this article, we will learn how to perform reverse engineering using the EF Core Package Manager Console and the dotnet ef dbcontext command of the .NET Command-line Interface (CLI) tools.

> Note
The scaffolding of a ```DbContext``` and entity types documented here is distinct from the scaffolding of controllers in ASP.NET Core using Visual Studio, which is not documented here.

> Tip
If you use Visual Studio, try out the EF Core Power Tools community extension. These tools provide a graphical tool which builds on top of the EF Core command line tools and offers additional workflow and customization options.

## Prerequisites

- Before scaffolding, you'll need to install either the PMC tools, which work on Visual Studio only, or the .NET CLI tools, which across all platforms supported by .NET.

- Install the NuGet package for ```Microsoft.EntityFrameworkCore.Design``` in the project you are scaffolding to.

- Install the NuGet package for the database provider that targets the database schema you want to scaffold from.

## Required arguments

Both the PMC and the .NET CLI commands have two required arguments: the connection string to the database, and the EF Core database provider to use.

### Connection string

The first argument to the command is a connection string to the database. The tools will use this connection string to read the database schema.

The following example shows how to quote and escape a connection string when writing a PowerShell command.

In this article, we will be looking at how to scaffold data from a SQL Server database to a web application.

 - .NET Core CLI

 - Visual Studio PMC

```dotnetcli
dotnet ef dbcontext scaffold "Data Source=(localdb)\MSSQLLocalDB;Initial Catalog=Chinook" Microsoft.EntityFrameworkCore.SqlServer
```

```powershell
Scaffold-DbContext 'Data Source=(localdb)\MSSQLLocalDB;Initial Catalog=Chinook' Microsoft.EntityFrameworkCore.SqlServer
```

#### User secrets for connection strings

You can use the connection string syntax to read the connection string from configuration.

For example, consider an ASP.NET Core application with the following configuration file:

```json
{
  "ConnectionStrings": {
    "Chinook": "Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=Chinook"
  }
}
```

This connection string in the config file can be used to scaffold from a database using:

 - .NET Core CLI

 - Visual Studio PMC

```dotnetcli
dotnet ef dbcontext scaffold "Name=ConnectionStrings:Chinook" Microsoft.EntityFrameworkCore.SqlServer
```

```powershell
Scaffold-DbContext 'Name=ConnectionStrings:Chinook' Microsoft.EntityFrameworkCore.SqlServer
```

connection strings should be stored in a secure way, such as using Azure Key Vault or, when working locally, the Secret Manager tool, aka "User Secrets".

In this article I will show you how to create a new connection between your ASP.NET Core.NET project and a third-party application.

```dotnetcli
dotnet user-secrets init
```

This command sets up storage on your computer separate from your source code and adds a key for this storage to the project.

Next, store the connection string in user secrets. For example:

```dotnetcli
dotnet user-secrets set ConnectionStrings:Chinook "Data Source=(localdb)\MSSQLLocalDB;Initial Catalog=Chinook"
```

Now the same command that previous used the named connection string from the config file will instead use the connection string stored in User Secrets. For example:

 - .NET Core CLI

 - Visual Studio PMC

```dotnetcli
dotnet ef dbcontext scaffold "Name=ConnectionStrings:Chinook" Microsoft.EntityFrameworkCore.SqlServer
```

```powershell
Scaffold-DbContext 'Name=ConnectionStrings:Chinook' Microsoft.EntityFrameworkCore.SqlServer
```

#### Connection strings in the scaffolded code

By default, the scaffolder will include the connection string in the scaffolded code, but with a warning. For example:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see http://go.microsoft.com/fwlink/?LinkId=723263.
    => optionsBuilder.UseSqlServer("Data Source=(LocalDb)\\MSSQLLocalDB;Database=AllTogetherNow");
```

In this example, the ```DbContextListener``` method is used to create a connection string between the generated code and the DbContextListener.

> Tip
The ```-NoOnConfiguring``` (Visual Studio PMC) or ```--no-onconfiguring``` (.NET CLI) option can be passed to suppress creation of the ```OnConfiguring``` method containing the connection string.

### Provider name

The first argument is the provider name.

## Command line options

The scaffolding process can be controlled by various command line options.

### Specifying tables and views

By default, all tables and views in the database schema are scaffolded into entity types. You can limit which tables and views are scaffolded by specifying schemas and tables.

The -s (Visual Studio PMC) or -- (.NET CLI) argument specifies the schemas of tables and views for which entity types will be generated.

This example shows how to include tables and views in a schema.

For example, to scaffold only the ```Artists``` and ```Albums``` tables:

 - .NET CLI

 - Visual Studio PMC

```dotnetcli
dotnet ef dbcontext scaffold ... --table Artist --table Album
```

```powershell
Scaffold-DbContext ... -Tables Artists, Albums
```

To scaffold all tables and views from the ```Customer``` and ```Contractor``` schemas:

 - .NET CLI

 - Visual Studio PMC

```dotnetcli
dotnet ef dbcontext scaffold ... --schema Customer --schema Contractor
```

```powershell
Scaffold-DbContext ... -Schemas Customer, Contractor
```

For example, to scaffold the ```Purchases``` table from the ```Customer``` schema, and the ```Accounts``` and ```Contracts``` tables from the ```Contractor``` schema:

 - .NET CLI

 - Visual Studio PMC

```dotnetcli
dotnet ef dbcontext scaffold ... --table Customer.Purchases --table Contractor.Accounts --table Contractor.Contracts
```

```powershell
Scaffold-DbContext ... -Tables Customer.Purchases, Contractor.Accounts, Contractor.Contracts
```

### Preserving database names

The following changes have been made to the .NET database naming conventions.

For example, consider the following tables:

```sql
CREATE TABLE [BLOGS] (
    [ID] int NOT NULL IDENTITY,
    [Blog_Name] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Blogs] PRIMARY KEY ([ID]));

CREATE TABLE [posts] (
    [id] int NOT NULL IDENTITY,
    [postTitle] nvarchar(max) NOT NULL,
    [post content] nvarchar(max) NOT NULL,
    [1 PublishedON] datetime2 NOT NULL,
    [2 DeletedON] datetime2 NULL,
    [BlogID] int NOT NULL,
    CONSTRAINT [PK_Posts] PRIMARY KEY ([id]),
    CONSTRAINT [FK_Posts_Blogs_BlogId] FOREIGN KEY ([BlogID]) REFERENCES [Blogs] ([ID]) ON DELETE CASCADE);
```

By default, the following entity types will be scaffolded from these tables:

```csharp
public partial class Blog
{
    public int Id { get; set; }
    public string BlogName { get; set; } = null!;
    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
}

public partial class Post
{
    public int Id { get; set; }
    public string PostTitle { get; set; } = null!;
    public string PostContent { get; set; } = null!;
    public DateTime _1PublishedOn { get; set; }
    public DateTime? _2DeletedOn { get; set; }
    public int BlogId { get; set; }
    public virtual Blog Blog { get; set; } = null!;
    public virtual ICollection<Tag> Tags { get; set; } = new List<Tag>();
}
```

However, using ```-UseDatabaseNames``` or ```--use-database-names``` results in the following entity types:

```csharp
public partial class BLOG
{
    public int ID { get; set; }
    public string Blog_Name { get; set; } = null!;
    public virtual ICollection<post> posts { get; set; } = new List<post>();
}

public partial class post
{
    public int id { get; set; }
    public string postTitle { get; set; } = null!;
    public string post_content { get; set; } = null!;
    public DateTime _1_PublishedON { get; set; }
    public DateTime? _2_DeletedON { get; set; }
    public int BlogID { get; set; }
    public virtual BLOG Blog { get; set; } = null!;
}
```

### Use mapping attributes (aka Data Annotations)

The following example shows how to create a new Entity type in ```OnCreating``` by default.

For example, using the Fluent API will scaffold this:

```csharp
entity.Property(e => e.Title)
    .IsRequired()
    .HasMaxLength(160);
```

While using Data Annotations will scaffold this:

```csharp
[Required]
[StringLength(160)]
public string Title { get; set; }
```

> Tip
Some aspects of the model cannot be configured using mapping attributes. The scaffolder will still use the model building API to handle these cases.

### ```DbContext``` name

The scaffolded ```DbContext``` class name will be the name of the database suffixed with Context by default. To specify a different one, use ```-Context``` in PMC and ```--context``` in the .NET Core CLI.

### Target directories and namespaces

The entity classes and a ```DbContext``` class are scaffolded into the project's root directory and use the project's default namespace.

 - .NET CLI

 - Visual Studio PMC

```dotnetcli
dotnet ef dbcontext scaffold ... --context-dir Data --output-dir Models
```

```dotnetcli
dotnet ef dbcontext scaffold ... --namespace Your.Namespace --context-namespace Your.DbContext.Namespace
```

```powershell
Scaffold-DbContext ... -ContextDir Data -OutputDir Models
```

```powershell
Scaffold-DbContext ... -Namespace Your.Namespace -ContextNamespace Your.DbContext.Namespace
```

## The scaffolded code

The result of scaffolding from an existing database is:

- A file containing a class that inherits from ```DbContext```

- A file for each entity type

> Tip
Starting in EF7, you can also use T4 text templates to customize the generated code. See Custom Reverse Engineering Templates for more details.

### C# Nullable reference types

The C# scaffolder allows you to scaffold code that is being written in C#.

For example, the following ```Tags``` table contains both nullable non-nullable string columns:

```sql
CREATE TABLE [Tags] (
  [Id] int NOT NULL IDENTITY,
  [Name] nvarchar(max) NOT NULL,
  [Description] nvarchar(max) NULL,
  CONSTRAINT [PK_Tags] PRIMARY KEY ([Id]));
```

This results in corresponding nullable and non-nullable string properties in the generated class:

```csharp
public partial class Tag
{
    public Tag()
    {
        Posts = new HashSet<Post>();
    }

    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }

    public virtual ICollection<Post> Posts { get; set; }
}
```

Similarly, the following ```Posts``` tables contains a required relationship to the ```Blogs``` table:

```sql
CREATE TABLE [Posts] (
    [Id] int NOT NULL IDENTITY,
    [Title] nvarchar(max) NOT NULL,
    [Contents] nvarchar(max) NOT NULL,
    [PostedOn] datetime2 NOT NULL,
    [UpdatedOn] datetime2 NULL,
    [BlogId] int NOT NULL,
    CONSTRAINT [PK_Posts] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Posts_Blogs_BlogId] FOREIGN KEY ([BlogId]) REFERENCES [Blogs] ([Id]));
```

This results in the scaffolding of non-nullable (required) relationship between blogs:

```csharp
public partial class Blog
{
    public Blog()
    {
        Posts = new HashSet<Post>();
    }

    public int Id { get; set; }
    public string Name { get; set; } = null!;

    public virtual ICollection<Post> Posts { get; set; }
}
```

And posts:

```csharp
public partial class Post
{
    public Post()
    {
        Tags = new HashSet<Tag>();
    }

    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string Contents { get; set; } = null!;
    public DateTime PostedOn { get; set; }
    public DateTime? UpdatedOn { get; set; }
    public int BlogId { get; set; }

    public virtual Blog Blog { get; set; } = null!;

    public virtual ICollection<Tag> Tags { get; set; }
}
```

### Many-to-many relationships

In this tutorial, we'll show you how to create scaffolding between tables.

```sql
CREATE TABLE [Tags] (
  [Id] int NOT NULL IDENTITY,
  [Name] nvarchar(max) NOT NULL,
  [Description] nvarchar(max) NULL,
  CONSTRAINT [PK_Tags] PRIMARY KEY ([Id]));

CREATE TABLE [Posts] (
    [Id] int NOT NULL IDENTITY,
    [Title] nvarchar(max) NOT NULL,
    [Contents] nvarchar(max) NOT NULL,
    [PostedOn] datetime2 NOT NULL,
    [UpdatedOn] datetime2 NULL,
    CONSTRAINT [PK_Posts] PRIMARY KEY ([Id]));

CREATE TABLE [PostTag] (
    [PostsId] int NOT NULL,
    [TagsId] int NOT NULL,
    CONSTRAINT [PK_PostTag] PRIMARY KEY ([PostsId], [TagsId]),
    CONSTRAINT [FK_PostTag_Posts_TagsId] FOREIGN KEY ([TagsId]) REFERENCES [Tags] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_PostTag_Tags_PostsId] FOREIGN KEY ([PostsId]) REFERENCES [Posts] ([Id]) ON DELETE CASCADE);
```

When scaffolded, this results in a class for Post:

```csharp
public partial class Post
{
    public Post()
    {
        Tags = new HashSet<Tag>();
    }

    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string Contents { get; set; } = null!;
    public DateTime PostedOn { get; set; }
    public DateTime? UpdatedOn { get; set; }
    public int BlogId { get; set; }

    public virtual Blog Blog { get; set; } = null!;

    public virtual ICollection<Tag> Tags { get; set; }
}
```

And a class for ```Tag```:

```csharp
public partial class Tag
{
    public Tag()
    {
        Posts = new HashSet<Post>();
    }

    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }

    public virtual ICollection<Post> Posts { get; set; }
}
```

But no class for the ```PostTag``` table. Instead, configuration for a many-to-many relationship is scaffolded:

```csharp
entity.HasMany(d => d.Tags)
    .WithMany(p => p.Posts)
    .UsingEntity<Dictionary<string, object>>(
        "PostTag",
        l => l.HasOne<Tag>().WithMany().HasForeignKey("PostsId"),
        r => r.HasOne<Post>().WithMany().HasForeignKey("TagsId"),
        j =>
            {
                j.HasKey("PostsId", "TagsId");
                j.ToTable("PostTag");
                j.HasIndex(new[] { "TagsId" }, "IX_PostTag_TagsId");
            });
```

### Other programming languages

The scaffolding system used in C# is not the same as the scaffolding system used in other languages.

- EntityFrameworkCore.VisualBasic provides support for Visual Basic

- EFCore.FSharp provides support for F#

### Customizing the code

Starting with EF7, one of the best ways to customize the generated code is by customizing the T4 templates used to generate it.

The code can also be changed after it is generated, but the best way to do this depends on whether you intend to re-run the scaffolding process when the database model changes.

#### Scaffold once only

In this course, we'll look at how to scaffold your code so that it can be used as a template for any other code in your project.

Keeping the database and the EF model in sync can be done in one of two ways:

- Switch to using EF Core database migrations, and use the entity types and EF model configuration as the source of truth, using migrations to drive the schema.

- Manually update the entity types and EF configuration when the database changes. For example, if a new column is added to a table, then add a property for the column to the mapped entity type, and add any necessary configuration using mapping attributes and/or code in ```OnModelCreating```. This is relatively easy, with the only real challenge being a process to make sure that database changes are recorded or detected in some way so that the developer(s) responsible for the code can react.

#### Repeated scaffolding

A scaffolder is a piece of software that is used to make changes to a database when the database changes.

In this tutorial, I will show you how to scaffold your code using EF Core.

- Both the ```DbContext``` class and the entity classes are generated as partial. This allows introducing additional members and code in a separate file which will not be overridden when scaffolding is run.

- The ```DbContext``` class contains a partial method called ```OnModelCreatingPartial```. An implementation of this method can be added to the partial class for the ```DbContext```. It will then be called after ```OnModelCreating``` is called.

- Model configuration made using the ```ModelBuilder``` APIs overrides any configuration done by conventions or mapping attributes, as well earlier configuration done on the model builder. This means that code in ```OnModelCreatingPartial``` can be used to override the configuration generated by the scaffolding process, without the need to remove that configuration.

In this article, I'm going to show you how to use the T4 scaffolding approach to generate code.

## How it works

Reverse engineering starts by reading the database schema. It reads information about tables, columns, constraints, and indexes.

Next, it uses the schema information to create an EF Core model. Tables are used to create entity types; columns are used to create properties; and foreign keys are used to create relationships.

Finally, the model is used to generate code. The corresponding entity type classes, Fluent API, and data annotations are scaffolded in order to re-create the same model from your app.

## Limitations

- Not everything about a model can be represented using a database schema. For example, information about inheritance hierarchies, owned types, and table splitting are not present in the database schema. Because of this, these constructs will never be scaffolded.

- In addition, some column types may not be supported by the EF Core provider. These columns won't be included in the model.

- You can define concurrency tokens in an EF Core model to prevent two users from updating the same entity at the same time. Some databases have a special type to represent this type of column (for example, rowversion in SQL Server) in which case we can reverse engineer this information; however, other concurrency tokens will not be scaffolded.

Ref: [Scaffolding (Reverse Engineering)](https://learn.microsoft.com/en-us/ef/core/managing-schemas/scaffolding/)