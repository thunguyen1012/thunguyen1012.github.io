---
title: Entity Framework - Entity Framework Core - Create a model - Entity properties
published: true
date: 2024-07-22 03:10:26
tags: EFCore, Summary
description: Each entity type in your model has a set of properties, which EF Core will read and write from the database. If you're using a relational database, entity properties map to table columns.
image:
---
- Article

  - 01/12/2023

  - 6 contributors

## In this article

Each entity type in your model has a set of properties, which EF Core will read and write from the database. If you're using a relational database, entity properties map to table columns.

## Included and excluded properties

By convention, all public properties with a getter and a setter will be included in the model.

Specific properties can be excluded as follows:

 - Data Annotations

 - Fluent API

```csharp
public class Blog
{
    public int BlogId { get; set; }
    public string Url { get; set; }

    [NotMapped]
    public DateTime LoadedFromDatabase { get; set; }
}
```

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .Ignore(b => b.LoadedFromDatabase);
}
```

## Column names

By convention, when using a relational database, entity properties are mapped to table columns having the same name as the property.

If you prefer to configure your columns with different names, you can do so as following code snippet:

 - Data Annotations

 - Fluent API

```csharp
public class Blog
{
    [Column("blog_id")]
    public int BlogId { get; set; }

    public string Url { get; set; }
}
```

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .Property(b => b.BlogId)
        .HasColumnName("blog_id");
}
```

## Column data types

This example shows how to select a data type from a relational database.

For example, SQL Server maps ```DateTime``` properties to ```datetime2```(7) columns, and ```string``` properties to nvarchar(max) columns (or to nvarchar(450) for properties that are used as a key).

You can specify the maximum ```string``` length and the maximum number of characters for a column.

 - Data Annotations

 - Fluent API

```csharp
public class Blog
{
    public int BlogId { get; set; }

    [Column(TypeName = "varchar(200)")]
    public string Url { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal Rating { get; set; }
}
```

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>(
        eb =>
        {
            eb.Property(b => b.Url).HasColumnType("varchar(200)");
            eb.Property(b => b.Rating).HasColumnType("decimal(5, 2)");
        });
}
```

### Maximum length

The maximum length of a row in an array.

> Note
Entity Framework does not do any validation of maximum length before passing data to the provider. It is up to the provider or data store to validate if appropriate. For example, when targeting SQL Server, exceeding the maximum length will result in an exception as the data type of the underlying column will not allow excess data to be stored.

In the following example, configuring a maximum length of 500 will cause a column of type nvarchar(500) to be created on SQL Server:

 - Data Annotations

 - Fluent API

```csharp
public class Blog
{
    public int BlogId { get; set; }

    [MaxLength(500)]
    public string Url { get; set; }
}
```

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .Property(b => b.Url)
        .HasMaxLength(500);
}
```

### Precision and Scale

The properties of a column are controlled by the facets of the column.

> Note
Entity Framework does not do any validation of precision or scale before passing data to the provider. It is up to the provider or data store to validate as appropriate. For example, when targeting SQL Server, a column of data type ```datetime``` does not allow the precision to be set, whereas a ```datetime2``` one can have precision between 0 and 7 inclusive.

The ```Score``` and ```LastUpdated``` properties can cause columns to be created on SQL Server.

 - Data Annotations

 - Fluent API

```csharp
public class Blog
{
    public int BlogId { get; set; }
    [Precision(14, 2)]
    public decimal Score { get; set; }
    [Precision(3)]
    public DateTime LastUpdated { get; set; }
}
```

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .Property(b => b.Score)
        .HasPrecision(14, 2);

    modelBuilder.Entity<Blog>()
        .Property(b => b.LastUpdated)
        .HasPrecision(3);
}
```

### Unicode

This article explains the difference between Unicode and non-Unicode data.

Text properties are configured as Unicode by default. You can configure a column as non-Unicode as follows:

 - Data Annotations

 - Fluent API

```csharp
public class Book
{
    public int Id { get; set; }
    public string Title { get; set; }

    [Unicode(false)]
    [MaxLength(22)]
    public string Isbn { get; set; }
}
```

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Book>()
        .Property(b => b.Isbn)
        .IsUnicode(false);
}
```

## Required and optional properties

A property is considered optional if it is not a valid value to be assigned to a property.

### Conventions

All properties with .NET value types (int, ```decimal```, ```bool```, etc.) are configured as required, and all properties with nullable .NET value types (int?, ```decimal```?, ```bool```?, etc.) are configured as optional.

EF Core 8 introduces a new feature called nullable reference types, which allows reference types to be annotated, indicating whether they are valid or not.

- If nullable reference types are disabled, all properties with .NET reference types are configured as optional by convention (for example, ```string```).

- If nullable reference types are enabled, properties will be configured based on the C# nullability of their .NET type: ```string```? will be configured as optional, but ```string``` will be configured as required.

The following example shows an entity type with required and optional properties, with the nullable reference feature disabled and enabled:

 - Without NRT (default)

 - With NRT

```csharp
public class CustomerWithoutNullableReferenceTypes
{
    public int Id { get; set; }

    [Required] // Data annotations needed to configure as required
    public string FirstName { get; set; }

    [Required] // Data annotations needed to configure as required
    public string LastName { get; set; }

    public string MiddleName { get; set; } // Optional by convention
}
```

```csharp
public class Customer
{
    public int Id { get; set; }
    public string FirstName { get; set; } // Required by convention
    public string LastName { get; set; } // Required by convention
    public string? MiddleName { get; set; } // Optional by convention

    // Note the following use of constructor binding, which avoids compiled warnings
    // for uninitialized non-nullable properties.
    public Customer(string firstName, string lastName, string? middleName = null)
    {
        FirstName = firstName;
        LastName = lastName;
        MiddleName = middleName;
    }
}
```

This article describes the use of nullable reference types in the Fluent database.

> Note
Exercise caution when enabling nullable reference types on an existing project: reference type properties which were previously configured as optional will now be configured as required, unless they are explicitly annotated to be nullable. When managing a relational database schema, this may cause migrations to be generated which alter the database column's nullability.

For more information on nullable reference types and how to use them with EF Core, see the dedicated documentation page for this feature.

### Explicit configuration

A property that would be optional by convention can be configured to be required as follows:

 - Data Annotations

 - Fluent API

```csharp
public class Blog
{
    public int BlogId { get; set; }

    [Required]
    public string Url { get; set; }
}
```

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .Property(b => b.Url)
        .IsRequired();
}
```

## Column collations

A collation can be defined on text columns, determining how they are compared and ordered. For example, the following code snippet configures a SQL Server column to be case-insensitive:

```csharp
modelBuilder.Entity<Customer>().Property(c => c.Name)
    .UseCollation("SQL_Latin1_General_CP1_CI_AS");
```

If all columns in a database need to use a certain collation, define the collation at the database level instead.

General information about EF Core support for collations can be found in the collation documentation page.

## Column comments

You can set an arbitrary text comment that gets set on the database column, allowing you to document your schema in the database:

 - Data Annotations

 - Fluent API

```csharp
public class Blog
{
    public int BlogId { get; set; }

    [Comment("The URL of the blog")]
    public string Url { get; set; }
}
```

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .Property(b => b.Url)
        .HasComment("The URL of the blog");
}
```

## Column order

When creating a table with Migrations, EF Core orders key columns first, followed by properties of the entity type and owned types, and finally properties from base types.

 - Data Annotations

 - Fluent API

```csharp
public class EntityBase
{
    [Column(Order = 0)]
    public int Id { get; set; }
}

public class PersonBase : EntityBase
{
    [Column(Order = 1)]
    public string FirstName { get; set; }

    [Column(Order = 2)]
    public string LastName { get; set; }
}

public class Employee : PersonBase
{
    public string Department { get; set; }
    public decimal AnnualSalary { get; set; }
}
```

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Employee>(x =>
    {
        x.Property(b => b.Id)
            .HasColumnOrder(0);

        x.Property(b => b.FirstName)
            .HasColumnOrder(1);

        x.Property(b => b.LastName)
            .HasColumnOrder(2);
    });
}
```

The column order attribute can be used to re-order columns in a table.

Ref: [Entity Properties](https://learn.microsoft.com/en-us/ef/core/modeling/entity-properties)