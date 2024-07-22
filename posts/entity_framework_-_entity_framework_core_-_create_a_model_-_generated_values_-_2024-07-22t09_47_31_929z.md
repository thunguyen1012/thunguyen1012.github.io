---
title: Entity Framework - Entity Framework Core - Create a model - Generated values
published: true
date: 2024-07-22 09:47:31
tags: EFCore, Summary
description: EF Core generates values for database columns.
image:
---
- Article

  - 01/12/2023

  - 14 contributors

## In this article

EF Core generates values for database columns.

## Default values

On relational databases, a column can be configured with a default value; if a row is inserted without a value for that column, the default value will be used.

You can configure a default value on a property:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .Property(b => b.Rating)
        .HasDefaultValue(3);
}
```

You can also specify a SQL fragment that is used to calculate the default value:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .Property(b => b.Created)
        .HasDefaultValueSql("getdate()");
}
```

## Computed columns

On most relational databases, a column can be configured to have its value computed in the database, typically with an expression referring to other columns:

```csharp
modelBuilder.Entity<Person>()
    .Property(p => p.DisplayName)
    .HasComputedColumnSql("[LastName] + ', ' + [FirstName]");
```

The following example creates a virtual computed column, whose value is computed every time it is fetched from the database.

```csharp
modelBuilder.Entity<Person>()
    .Property(p => p.NameLength)
    .HasComputedColumnSql("LEN([LastName]) + LEN([FirstName])", stored: true);
```

## Primary keys

A primary key is a key parameter in a database.

For more information, see the documentation about keys and guidance for specific inheritance mapping strategies.

## Explicitly configuring value generation

How do you generate value for non-key properties in EF Core?

 - Data Annotations

 - Fluent API

```csharp
public class Blog
{
    public int BlogId { get; set; }
    public string Url { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTime Inserted { get; set; }
}
```

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .Property(b => b.Inserted)
        .ValueGeneratedOnAdd();
}
```

Similarly, a property can be configured to have its value generated on add or update:

 - Data Annotations

 - Fluent API

```csharp
public class Blog
{
    public int BlogId { get; set; }
    public string Url { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTime LastUpdated { get; set; }
}
```

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .Property(b => b.LastUpdated)
        .ValueGeneratedOnAddOrUpdate();
}
```

The following examples show how to generate values for property types.

The GUIDProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProviderProvider

byte[] properties that are configured as generated on add or update and marked as concurrency tokens are set up with the rowversion data type, so that values are automatically generated in the database.

Consult your provider's documentation for the specific value generation techniques it supports. The SQL Server value generation documentation can be found here.

## Date/time value generation

EF Core providers usually don't set up value generation automatically for date/time columns - you have to configure this yourself.

### Creation timestamp

In this article we are going to look at how to create a timestamp row.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .Property(b => b.Created)
        .HasDefaultValueSql("getdate()");
}
```

Be sure to select the appropriate function, as several may exist (e.g. GETDATE() vs. GETUTCDATE()).

### Update timestamp

In this article, I'm going to show you how to trigger a stored computed column in a database.

```sql
CREATE TRIGGER [dbo].[Blogs_UPDATE] ON [dbo].[Blogs]
    AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF ((SELECT TRIGGER_NESTLEVEL()) > 1) RETURN;

    UPDATE B
    SET LastUpdated = GETDATE()
    FROM dbo.Blogs AS B
    INNER JOIN INSERTED AS I
        ON B.BlogId = I.BlogId
END
```

For information on creating triggers, see the documentation on using raw SQL in migrations.

## Overriding value generation

In this article we will look at how to specify an explicit value for a property.

You can override value generation with an explicit value by setting the property to any value that is not the CLR default value for that property's type (null for ```string```, ```0``` for ```int```, ```Guid```, etc.).

> Note
Trying to insert explicit values into SQL Server IDENTITY fails by default; see these docs for a workaround.

To provide an explicit value for properties that have been configured as value generated on add or update, you must also configure the property as follows:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>().Property(b => b.LastUpdated)
        .ValueGeneratedOnAddOrUpdate()
        .Metadata.SetAfterSaveBehavior(PropertySaveBehavior.Save);
}
```

## No value generation

A property is a type of object that can be added to a database context.

In most cases you do not need to generate value for a key of type ```int```.

 - Data Annotations

 - Fluent API

```csharp
public class Blog
{
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public int BlogId { get; set; }

    public string Url { get; set; }
}
```

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .Property(b => b.BlogId)
        .ValueGeneratedNever();
}
```

Ref: [Generated Values](https://learn.microsoft.com/en-us/ef/core/modeling/generated-properties)