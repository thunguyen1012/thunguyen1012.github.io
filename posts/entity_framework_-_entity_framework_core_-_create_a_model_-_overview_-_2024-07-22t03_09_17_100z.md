---
title: Entity Framework - Entity Framework Core - Create a model - Overview
published: true
date: 2024-07-22 03:09:17
tags: EFCore, Summary
description: EF Core uses a metadata model to describe how the application's entity types are mapped to the underlying database.
image:
---
- Article

  - 03/28/2023

  - 18 contributors

## In this article

EF Core uses a metadata model to describe how the application's entity types are mapped to the underlying database.

configuration can be applied to a model targeting any data store.

> Tip
You can view this article's samples on GitHub.

## Use fluent API to configure a model

You can use the ```OnModelCreating``` method to create a new model.

```csharp
using Microsoft.EntityFrameworkCore;

namespace EFModeling.EntityProperties.FluentAPI.Required;

internal class MyContext : DbContext
{
    public DbSet<Blog> Blogs { get; set; }

    #region Required
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Blog>()
            .Property(b => b.Url)
            .IsRequired();
    }
    #endregion
}

public class Blog
{
    public int BlogId { get; set; }
    public string Url { get; set; }
}
```

> Tip
To apply the same configuration to multiple objects in the model see bulk configuration.

### Grouping configuration

To reduce the size of the ```OnModelCreating``` method all configuration for an entity type can be extracted to a separate class implementing ```IEntityTypeConfiguration```<TEntity>.

```csharp
public class BlogEntityTypeConfiguration : IEntityTypeConfiguration<Blog>
{
    public void Configure(EntityTypeBuilder<Blog> builder)
    {
        builder
            .Property(b => b.Url)
            .IsRequired();
    }
}
```

Then just invoke the ```Configure``` method from ```OnModelCreating```.

```csharp
new BlogEntityTypeConfiguration().Configure(modelBuilder.Entity<Blog>());
```

#### Applying all configurations in an assembly

It is possible to apply all configuration specified in types implementing ```IEntityTypeConfiguration``` in a given assembly.

```csharp
modelBuilder.ApplyConfigurationsFromAssembly(typeof(BlogEntityTypeConfiguration).Assembly);
```

> Note
The order in which the configurations will be applied is undefined, therefore this method should only be used when the order doesn't matter.

#### Using ```EntityTypeConfigurationAttribute``` on entity types

Rather than explicitly calling ```Configure```, an ```EntityTypeConfigurationAttribute``` can instead be placed on the entity type such that EF Core can find and use appropriate configuration. For example:

```csharp
[EntityTypeConfiguration(typeof(BookConfiguration))]
public class Book
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Isbn { get; set; }
}
```

The ```Book``` entity type is included in a model using one of the normal mechanisms.

```csharp
public class BooksContext : DbContext
{
    public DbSet<Book> Books { get; set; }

    //...
```

Or by registering it in ```OnModelCreating```:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Book>();
}
```

> Note
EntityTypeConfigurationAttribute types will not be automatically discovered in an assembly. Entity types must be added to the model before the attribute will be discovered on that entity type.

## Use data annotations to configure a model

You can also apply certain attributes (known as Data Annotations) to your classes and properties. Data annotations will override conventions, but will be overridden by Fluent API configuration.

```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EFModeling.EntityProperties.DataAnnotations.Annotations;

internal class MyContext : DbContext
{
    public DbSet<Blog> Blogs { get; set; }
}

[Table("Blogs")]
public class Blog
{
    public int BlogId { get; set; }

    [Required]
    public string Url { get; set; }
}
```

## Built-in conventions

This article explains how to use the IConvention interface in EF Core.

Applications can remove or replace any of these conventions, as well as add new custom conventions that apply configuration for patterns that are not recognized by EF out of the box.

> Tip
The code shown below comes from ModelBuildingConventionsSample.cs.

### Removing an existing convention

Sometimes one of the built-in conventions may not appropriate for your application, in which case it can be removed.

> Tip
If your model doesn't use mapping attributes (aka data annotations) for configuration, then all conventions with the name ending in ```AttributeConvention``` can be safely removed to speed up model building.

#### Example: Don't create indexes for foreign key columns

In this post, I'm going to show you how to create indexes for foreign key columns in a ```Post``` entity.

```text
EntityType: Post
    Properties:
      Id (int) Required PK AfterSave:Throw ValueGenerated.OnAdd
      AuthorId (no field, int?) Shadow FK Index
      BlogId (no field, int) Shadow Required FK Index
    Navigations:
      Author (Author) ToPrincipal Author Inverse: Posts
      Blog (Blog) ToPrincipal Blog Inverse: Posts
    Keys:
      Id PK
    Foreign keys:
      Post {'AuthorId'} -> Author {'Id'} ToDependent: Posts ToPrincipal: Author ClientSetNull
      Post {'BlogId'} -> Blog {'Id'} ToDependent: Posts ToPrincipal: Blog Cascade
    Indexes:
      AuthorId
      BlogId
```

However, indexes have overhead, and it may not always be appropriate to create them for all FK columns. To achieve this, the ```ForeignKeyIndexConvention``` can be removed when building the model:

```csharp
protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
{
    configurationBuilder.Conventions.Remove(typeof(ForeignKeyIndexConvention));
}
```

Looking at the debug view of the model for ```Post``` now, we see that the indexes on FKs have not been created:

```text
EntityType: Post
    Properties:
      Id (int) Required PK AfterSave:Throw ValueGenerated.OnAdd
      AuthorId (no field, int?) Shadow FK
      BlogId (no field, int) Shadow Required FK
    Navigations:
      Author (Author) ToPrincipal Author Inverse: Posts
      Blog (Blog) ToPrincipal Blog Inverse: Posts
    Keys:
      Id PK
    Foreign keys:
      Post {'AuthorId'} -> Author {'Id'} ToDependent: Posts ToPrincipal: Author ClientSetNull
      Post {'BlogId'} -> Blog {'Id'} ToDependent: Posts ToPrincipal: Blog Cascade
```

When desired, indexes can still be explicitly created for foreign key columns, either using the IndexAttribute or with configuration in ```OnModelCreating```.

## Debug view

The model builder debug view can be accessed in the debugger of your IDE. For example, with Visual Studio:



It can also be accessed directly from code, for example to send the debug view to the console:

```csharp
Console.WriteLine(context.Model.ToDebugString());
```

Microsoft has released a debug view for Visual Studio that can be accessed from code.

```csharp
Console.WriteLine(context.Model.ToDebugString(MetadataDebugStringOptions.LongDefault));
```

Ref: [Creating and Configuring a Model](https://learn.microsoft.com/en-us/ef/core/modeling/)