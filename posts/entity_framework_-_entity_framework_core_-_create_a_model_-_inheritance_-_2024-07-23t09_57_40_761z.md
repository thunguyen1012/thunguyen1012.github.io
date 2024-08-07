---
title: Entity Framework - Entity Framework Core - Create a model - Inheritance
published: true
date: 2024-07-23 09:57:40
tags: EFCore, Summary
description: inheritance support for Entity Framework (EF) is available.
image:
---
- Article

  - 01/12/2023

  - 10 contributors

## In this article

inheritance support for Entity Framework (EF) is available.

## Entity type hierarchy mapping

This section describes how to specify the type of hierarchy CLR in your model.

The following sample exposes a ```DbSet``` for ```Blog``` and its subclass ```RssBlog```. If ```Blog``` has any other subclass, it will not be included in the model.

```csharp
internal class MyContext : DbContext
{
    public DbSet<Blog> Blogs { get; set; }
    public DbSet<RssBlog> RssBlogs { get; set; }
}

public class Blog
{
    public int BlogId { get; set; }
    public string Url { get; set; }
}

public class RssBlog : Blog
{
    public string RssUrl { get; set; }
}
```

> Note
Database columns are automatically made nullable as necessary when using TPH mapping. For example, the ```RssUrl``` column is nullable because regular ```Blog``` instances do not have that property.

If you don't want to expose a ```DbSet``` for one or more entities in the hierarchy, you can also use the Fluent API to ensure they are included in the model.

> Tip
If you don't rely on conventions, you can specify the base type explicitly using ```HasBaseType```. You can also use .HasBaseType((Type)null) to remove an entity type from the hierarchy.

## Table-per-hierarchy and discriminator configuration

EF maps the inheritance between rows in a table.

The model above is mapped to the following database schema (note the implicitly created ```Discriminator``` column, which identifies which type of ```Blog``` is stored in each row).



You can configure the name and type of the discriminator column and the values that are used to identify each type in the hierarchy:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasDiscriminator<string>("blog_type")
        .HasValue<Blog>("blog_base")
        .HasValue<RssBlog>("blog_rss");
}
```

In the examples above, EF added the discriminator implicitly as a shadow property on the base entity of the hierarchy. This property can be configured like any other:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .Property("Discriminator")
        .HasMaxLength(200);
}
```

Finally, the discriminator can also be mapped to a regular .NET property in your entity:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasDiscriminator(b => b.BlogType);

    modelBuilder.Entity<Blog>()
        .Property(e => e.BlogType)
        .HasMaxLength(200)
        .HasColumnName("blog_type");
        
    modelBuilder.Entity<RssBlog>();
}
```

In this article, I will show you how to mark the discriminator mapping in EF Core model as incomplete to indicate that we should query any type in the hierarchy.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .HasDiscriminator()
        .IsComplete(false);
}
```

### Shared columns

This example shows how to map two sibling entity types in the hierarchy to the same database column.

```csharp
public class MyContext : DbContext
{
    public DbSet<BlogBase> Blogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Blog>()
            .Property(b => b.Url)
            .HasColumnName("Url");

        modelBuilder.Entity<RssBlog>()
            .Property(b => b.Url)
            .HasColumnName("Url");
    }
}

public abstract class BlogBase
{
    public int BlogId { get; set; }
}

public class Blog : BlogBase
{
    public string Url { get; set; }
}

public class RssBlog : BlogBase
{
    public string Url { get; set; }
}
```

> Note
Relational database providers, such as SQL Server, will not automatically use the discriminator predicate when querying shared columns when using a cast. The query ```Url = (blog as ```RssBlog```).Url``` would also return the ```Url``` value for the sibling ```Blog``` rows. To restrict the query to ```RssBlog``` entities you need to manually add a filter on the discriminator, such as ```Url = blog is ```RssBlog``` ? (blog as ```RssBlog```).Url : null```.

## Table-per-type configuration

The TPT mapping pattern allows you to store properties that belong to a base type or derived type in a table that maps to that type.

```csharp
modelBuilder.Entity<Blog>().ToTable("Blogs");
modelBuilder.Entity<RssBlog>().ToTable("RssBlogs");
```

> Tip
Instead of calling ```ToTable``` on each entity type you can call modelBuilder.Entity<Blog>().UseTptMappingStrategy() on each root entity type and the table names will be generated by EF.

> Tip
To configure different column names for the primary key columns in each table see Table-specific facet configuration.

EF will create the following database schema for the model above.

```sql
CREATE TABLE [Blogs] (
    [BlogId] int NOT NULL IDENTITY,
    [Url] nvarchar(max) NULL,
    CONSTRAINT [PK_Blogs] PRIMARY KEY ([BlogId])
);

CREATE TABLE [RssBlogs] (
    [BlogId] int NOT NULL,
    [RssUrl] nvarchar(max) NULL,
    CONSTRAINT [PK_RssBlogs] PRIMARY KEY ([BlogId]),
    CONSTRAINT [FK_RssBlogs_Blogs_BlogId] FOREIGN KEY ([BlogId]) REFERENCES [Blogs] ([BlogId]) ON DELETE NO ACTION
);
```

> Note
If the primary key constraint is renamed the new name will be applied to all the tables mapped to the hierarchy, future EF versions will allow renaming the constraint only for a particular table when issue 19970 is fixed.

If you are employing bulk configuration you can retrieve the column name for a specific table by calling GetColumnName(IProperty, StoreObjectIdentifier).

```csharp
foreach (var entityType in modelBuilder.Model.GetEntityTypes())
{
    var tableIdentifier = StoreObjectIdentifier.Create(entityType, StoreObjectType.Table);

    Console.WriteLine($"{entityType.DisplayName()}\t\t{tableIdentifier}");
    Console.WriteLine(" Property\tColumn");

    foreach (var property in entityType.GetProperties())
    {
        var columnName = property.GetColumnName(tableIdentifier.Value);
        Console.WriteLine($" {property.Name,-10}\t{columnName}");
    }

    Console.WriteLine();
}
```

> Warning
In many cases, TPT shows inferior performance when compared to TPH. See the performance docs for more information.

> Caution
Columns for a derived type are mapped to different tables, therefore composite FK constraints and indexes that use both the inherited and declared properties cannot be created in the database.

## Table-per-concrete-type configuration

> Note
The table-per-concrete-type (TPC) feature was introduced in EF Core 7.0.

This article describes the TPC mapping pattern for entity types.

> Tip
The EF Team demonstrated and talked in depth about TPC mapping in an episode of the .NET Data Community Standup. As with all Community Standup episodes, you can watch the TPC episode now on YouTube.

```csharp
modelBuilder.Entity<Blog>().UseTpcMappingStrategy()
    .ToTable("Blogs");
modelBuilder.Entity<RssBlog>()
    .ToTable("RssBlogs");
```

> Tip
Instead of calling ```ToTable``` on each entity type just calling modelBuilder.Entity<Blog>().UseTpcMappingStrategy() on each root entity type will generate the table names by convention.

> Tip
To configure different column names for the primary key columns in each table see Table-specific facet configuration.

EF will create the following database schema for the model above.

```sql
CREATE TABLE [Blogs] (
    [BlogId] int NOT NULL DEFAULT (NEXT VALUE FOR [BlogSequence]),
    [Url] nvarchar(max) NULL,
    CONSTRAINT [PK_Blogs] PRIMARY KEY ([BlogId])
);

CREATE TABLE [RssBlogs] (
    [BlogId] int NOT NULL DEFAULT (NEXT VALUE FOR [BlogSequence]),
    [Url] nvarchar(max) NULL,
    [RssUrl] nvarchar(max) NULL,
    CONSTRAINT [PK_RssBlogs] PRIMARY KEY ([BlogId])
);
```

### TPC database schema

The table-per-concrete-type (TPC) is a new approach to mapping database objects to concrete types.

For example, consider mapping this hierarchy:

```csharp
public abstract class Animal
{
    protected Animal(string name)
    {
        Name = name;
    }

    public int Id { get; set; }
    public string Name { get; set; }
    public abstract string Species { get; }

    public Food? Food { get; set; }
}

public abstract class Pet : Animal
{
    protected Pet(string name)
        : base(name)
    {
    }

    public string? Vet { get; set; }

    public ICollection<Human> Humans { get; } = new List<Human>();
}

public class FarmAnimal : Animal
{
    public FarmAnimal(string name, string species)
        : base(name)
    {
        Species = species;
    }

    public override string Species { get; }

    [Precision(18, 2)]
    public decimal Value { get; set; }

    public override string ToString()
        => $"Farm animal '{Name}' ({Species}/{Id}) worth {Value:C} eats {Food?.ToString() ?? "<Unknown>"}";
}

public class Cat : Pet
{
    public Cat(string name, string educationLevel)
        : base(name)
    {
        EducationLevel = educationLevel;
    }

    public string EducationLevel { get; set; }
    public override string Species => "Felis catus";

    public override string ToString()
        => $"Cat '{Name}' ({Species}/{Id}) with education '{EducationLevel}' eats {Food?.ToString() ?? "<Unknown>"}";
}

public class Dog : Pet
{
    public Dog(string name, string favoriteToy)
        : base(name)
    {
        FavoriteToy = favoriteToy;
    }

    public string FavoriteToy { get; set; }
    public override string Species => "Canis familiaris";

    public override string ToString()
        => $"Dog '{Name}' ({Species}/{Id}) with favorite toy '{FavoriteToy}' eats {Food?.ToString() ?? "<Unknown>"}";
}

public class Human : Animal
{
    public Human(string name)
        : base(name)
    {
    }

    public override string Species => "Homo sapiens";

    public Animal? FavoriteAnimal { get; set; }
    public ICollection<Pet> Pets { get; } = new List<Pet>();

    public override string ToString()
        => $"Human '{Name}' ({Species}/{Id}) with favorite animal '{FavoriteAnimal?.Name ?? "<Unknown>"}'" +
           $" eats {Food?.ToString() ?? "<Unknown>"}";
}
```

When using SQL Server, the tables created for this hierarchy are:

```sql
CREATE TABLE [Cats] (
    [Id] int NOT NULL DEFAULT (NEXT VALUE FOR [AnimalSequence]),
    [Name] nvarchar(max) NOT NULL,
    [FoodId] uniqueidentifier NULL,
    [Vet] nvarchar(max) NULL,
    [EducationLevel] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Cats] PRIMARY KEY ([Id]));

CREATE TABLE [Dogs] (
    [Id] int NOT NULL DEFAULT (NEXT VALUE FOR [AnimalSequence]),
    [Name] nvarchar(max) NOT NULL,
    [FoodId] uniqueidentifier NULL,
    [Vet] nvarchar(max) NULL,
    [FavoriteToy] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Dogs] PRIMARY KEY ([Id]));

CREATE TABLE [FarmAnimals] (
    [Id] int NOT NULL DEFAULT (NEXT VALUE FOR [AnimalSequence]),
    [Name] nvarchar(max) NOT NULL,
    [FoodId] uniqueidentifier NULL,
    [Value] decimal(18,2) NOT NULL,
    [Species] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_FarmAnimals] PRIMARY KEY ([Id]));

CREATE TABLE [Humans] (
    [Id] int NOT NULL DEFAULT (NEXT VALUE FOR [AnimalSequence]),
    [Name] nvarchar(max) NOT NULL,
    [FoodId] uniqueidentifier NULL,
    [FavoriteAnimalId] int NULL,
    CONSTRAINT [PK_Humans] PRIMARY KEY ([Id]));
```

Notice that:

- There are no tables for the ```Animal``` or ```Pet``` types, since these are ```abstract``` in the object model. Remember that C# does not allow instances of ```abstract``` types, and there is therefore no situation where an ```abstract``` type instance will be saved to the database.

- The mapping of properties in base types is repeated for each concrete type. For example, every table has a ```Name``` column, and both Cats and Dogs have a ```Vet``` column.

- Saving some data into this database results in the following:

Cats table

<table><thead>
<tr>
<th style="text-align: left;">Id</th>
<th style="text-align: left;">Name</th>
<th style="text-align: left;">FoodId</th>
<th style="text-align: left;">Vet</th>
<th style="text-align: left;">EducationLevel</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">1</td>
<td style="text-align: left;">Alice</td>
<td style="text-align: left;">99ca3e98-b26d-4a0c-d4ae-08da7aca624f</td>
<td style="text-align: left;">Pengelly</td>
<td style="text-align: left;">MBA</td>
</tr>
<tr>
<td style="text-align: left;">2</td>
<td style="text-align: left;">Mac</td>
<td style="text-align: left;">99ca3e98-b26d-4a0c-d4ae-08da7aca624f</td>
<td style="text-align: left;">Pengelly</td>
<td style="text-align: left;">Preschool</td>
</tr>
<tr>
<td style="text-align: left;">8</td>
<td style="text-align: left;">Baxter</td>
<td style="text-align: left;">5dc5019e-6f72-454b-d4b0-08da7aca624f</td>
<td style="text-align: left;">Bothell ```Pet``` Hospital</td>
<td style="text-align: left;">BSc</td>
</tr>
</tbody></table>

Dogs table

<table><thead>
<tr>
<th style="text-align: left;">Id</th>
<th style="text-align: left;">Name</th>
<th style="text-align: left;">FoodId</th>
<th style="text-align: left;">Vet</th>
<th style="text-align: left;">FavoriteToy</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">3</td>
<td style="text-align: left;">Toast</td>
<td style="text-align: left;">011aaf6f-d588-4fad-d4ac-08da7aca624f</td>
<td style="text-align: left;">Pengelly</td>
<td style="text-align: left;">Mr. Squirrel</td>
</tr>
</tbody></table>

FarmAnimals table

<table><thead>
<tr>
<th style="text-align: left;">Id</th>
<th style="text-align: left;">Name</th>
<th style="text-align: left;">FoodId</th>
<th style="text-align: left;">Value</th>
<th style="text-align: left;">Species</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">4</td>
<td style="text-align: left;">Clyde</td>
<td style="text-align: left;">1d495075-f527-4498-d4af-08da7aca624f</td>
<td style="text-align: left;">100.00</td>
<td style="text-align: left;">Equus africanus asinus</td>
</tr>
</tbody></table>

Humans table

<table><thead>
<tr>
<th style="text-align: left;">Id</th>
<th style="text-align: left;">Name</th>
<th style="text-align: left;">FoodId</th>
<th style="text-align: left;">FavoriteAnimalId</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">5</td>
<td style="text-align: left;">Wendy</td>
<td style="text-align: left;">5418fd81-7660-432f-d4b1-08da7aca624f</td>
<td style="text-align: left;">2</td>
</tr>
<tr>
<td style="text-align: left;">6</td>
<td style="text-align: left;">Arthur</td>
<td style="text-align: left;">59b495d4-0414-46bf-d4ad-08da7aca624f</td>
<td style="text-align: left;">1</td>
</tr>
<tr>
<td style="text-align: left;">9</td>
<td style="text-align: left;">Katie</td>
<td style="text-align: left;">null</td>
<td style="text-align: left;">8</td>
</tr>
</tbody></table>

In this post we'll look at the characteristics of table mapping.

### Key generation

In this paper we describe the inheritance mapping of key values between entities.

The table hierarchy is mapped to a row in the table, and the keys for other tables are linked to this row using foreign key constraints.

In this post I’m going to show you how to use the ```Identity``` column in EF Core to generate a unique key value for each entity in a hierarchy.

Key values are used to define the relationships between tables in a database.

```sql
[Id] int NOT NULL DEFAULT (NEXT VALUE FOR [AnimalSequence])
```

 ```AnimalSequence``` is a database sequence created by EF Core.

 ```Identity``` columns can be used to control the relationship between tables in a TPC table.

```csharp
modelBuilder.Entity<Cat>().ToTable("Cats", tb => tb.Property(e => e.Id).UseIdentityColumn(1, 4));
modelBuilder.Entity<Dog>().ToTable("Dogs", tb => tb.Property(e => e.Id).UseIdentityColumn(2, 4));
modelBuilder.Entity<FarmAnimal>().ToTable("FarmAnimals", tb => tb.Property(e => e.Id).UseIdentityColumn(3, 4));
modelBuilder.Entity<Human>().ToTable("Humans", tb => tb.Property(e => e.Id).UseIdentityColumn(4, 4));
```

> Important
Using this strategy makes it harder to add derived types later as it requires the total number of types in the hierarchy to be known beforehand.

integer key generation is not supported when using the TPC strategy.

### Foreign key constraints

In this article, I'm going to show you how to use the TPC mapping strategy in a database.

```sql
CONSTRAINT [FK_Animals_Animals_FavoriteAnimalId] FOREIGN KEY ([FavoriteAnimalId]) REFERENCES [Animals] ([Id])
```

When using FK, the primary key for any given animal is stored in the table corresponding to the concrete type of that animal.

EF Core will attempt to insert invalid data into the FK column.

## Summary and guidance

In this article I'm going to show you how to use  and TPC in your code.

That being said, TPC is also a good mapping strategy to use when your code will mostly query for entities of a single leaf type and your benchmarks show an improvement compared with TPH.

Use TPT only if constrained to do so by external factors.

Ref: [Inheritance](https://learn.microsoft.com/en-us/ef/core/modeling/inheritance)