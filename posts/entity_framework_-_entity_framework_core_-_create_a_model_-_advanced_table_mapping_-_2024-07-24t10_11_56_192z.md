---
title: Entity Framework - Entity Framework Core - Create a model - Advanced table mapping
published: true
date: 2024-07-24 10:11:56
tags: EFCore, Summary
description: EF Core offers a lot of flexibility when it comes to mapping entity types to tables in a database. This becomes even more useful when you need to use a database that wasn't created by EF.
image:
---
## In this article

EF Core offers a lot of flexibility when it comes to mapping entity types to tables in a database. This becomes even more useful when you need to use a database that wasn't created by EF.

The below techniques are described in terms of tables, but the same result can be achieved when mapping to views as well.

## Table splitting

EF Core allows to map two or more entities to a single row. This is called table splitting or table sharing.

### Configuration

This article describes how to split entity types in a table.

A common scenario for table splitting is using only a subset of the columns in the table for greater performance or encapsulation.

In this example ```Order``` represents a subset of ```DetailedOrder```.

```csharp
public class Order
{
    public int Id { get; set; }
    public OrderStatus? Status { get; set; }
    public DetailedOrder DetailedOrder { get; set; }
}
```

```csharp
public class DetailedOrder
{
    public int Id { get; set; }
    public OrderStatus? Status { get; set; }
    public string BillingAddress { get; set; }
    public string ShippingAddress { get; set; }
    public byte[] Version { get; set; }
}
```

In addition to the required configuration we call ```Property(o => o.Status).HasColumnName("Status")``` to map ```DetailedOrder.Status``` to the same column as ```Order.Status```.

```csharp
modelBuilder.Entity<DetailedOrder>(
    dob =>
    {
        dob.ToTable("Orders");
        dob.Property(o => o.Status).HasColumnName("Status");
    });

modelBuilder.Entity<Order>(
    ob =>
    {
        ob.ToTable("Orders");
        ob.Property(o => o.Status).HasColumnName("Status");
        ob.HasOne(o => o.DetailedOrder).WithOne()
            .HasForeignKey<DetailedOrder>(o => o.Id);
        ob.Navigation(o => o.DetailedOrder).IsRequired();
    });
```

> Tip
See the full sample project for more context.

### Usage

Saving and querying entities using table splitting is done in the same way as other entities:

```csharp
using (var context = new TableSplittingContext())
{
    context.Database.EnsureDeleted();
    context.Database.EnsureCreated();

    context.Add(
        new Order
        {
            Status = OrderStatus.Pending,
            DetailedOrder = new DetailedOrder
            {
                Status = OrderStatus.Pending,
                ShippingAddress = "221 B Baker St, London",
                BillingAddress = "11 Wall Street, New York"
            }
        });

    context.SaveChanges();
}

using (var context = new TableSplittingContext())
{
    var pendingCount = context.Orders.Count(o => o.Status == OrderStatus.Pending);
    Console.WriteLine($"Current number of pending orders: {pendingCount}");
}

using (var context = new TableSplittingContext())
{
    var order = context.DetailedOrders.First(o => o.Status == OrderStatus.Pending);
    Console.WriteLine($"First pending order will ship to: {order.ShippingAddress}");
}
```

### Optional dependent entity

An instance of a dependent entity will be created if all of its properties are in the database.

If an instance of a dependent entity type is created, it will be checked against the instance's dependents.

### Concurrency tokens
To avoid exposing the concurrency token to the consuming code, it's possible the create one as a shadow property:

```csharp
modelBuilder.Entity<Order>()
    .Property<byte[]>("Version").IsRowVersion().HasColumnName("Version");

modelBuilder.Entity<DetailedOrder>()
    .Property(o => o.Version).IsRowVersion().HasColumnName("Version");
```

### Inheritance

It's recommended to read the dedicated page on inheritance before continuing with this section.

The dependent types using table splitting can have an inheritance hierarchy, but there are some limitations:

- The dependent entity type cannot use TPC mapping as the derived types wouldn't be able to map to the same table.

- The dependent entity type can use TPT mapping, but only the root entity type can use table splitting.

- If the principal entity type uses TPC, then only the entity types that don't have any descendants can use table splitting. Otherwise the dependent columns would need to be duplicated on the tables corresponding to the derived types, complicating all interactions.

## Entity splitting

EF Core allows to map an entity to rows in two or more tables. This is called entity splitting.

### Configuration

For example, consider a database with three tables that hold customer data:

- A ```Customers``` table for customer information

- A ```PhoneNumbers``` table for the customer's phone number

- An ```Addresses``` table for the customer's address

Here are definitions for these tables in SQL Server:

```sql
CREATE TABLE [Customers] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Customers] PRIMARY KEY ([Id])
);
    
CREATE TABLE [PhoneNumbers] (
    [CustomerId] int NOT NULL,
    [PhoneNumber] nvarchar(max) NULL,
    CONSTRAINT [PK_PhoneNumbers] PRIMARY KEY ([CustomerId]),
    CONSTRAINT [FK_PhoneNumbers_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [Addresses] (
    [CustomerId] int NOT NULL,
    [Street] nvarchar(max) NOT NULL,
    [City] nvarchar(max) NOT NULL,
    [PostCode] nvarchar(max) NULL,
    [Country] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Addresses] PRIMARY KEY ([CustomerId]),
    CONSTRAINT [FK_Addresses_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([Id]) ON DELETE CASCADE
);
```

For example, you might have three tables in your application - one for your customers, one for your suppliers, and one for your partners.

```csharp
public class Customer
{
    public Customer(string name, string street, string city, string? postCode, string country)
    {
        Name = name;
        Street = street;
        City = city;
        PostCode = postCode;
        Country = country;
    }

    public int Id { get; set; }
    public string Name { get; set; }
    public string? PhoneNumber { get; set; }
    public string Street { get; set; }
    public string City { get; set; }
    public string? PostCode { get; set; }
    public string Country { get; set; }
}
```

The following code splits the ```Customer``` entity type to the ```Customers```, ```PhoneNumbers```, and ```Addresses``` tables.

```csharp
modelBuilder.Entity<Customer>(
    entityBuilder =>
    {
        entityBuilder
            .ToTable("Customers")
            .SplitToTable(
                "PhoneNumbers",
                tableBuilder =>
                {
                    tableBuilder.Property(customer => customer.Id).HasColumnName("CustomerId");
                    tableBuilder.Property(customer => customer.PhoneNumber);
                })
            .SplitToTable(
                "Addresses",
                tableBuilder =>
                {
                    tableBuilder.Property(customer => customer.Id).HasColumnName("CustomerId");
                    tableBuilder.Property(customer => customer.Street);
                    tableBuilder.Property(customer => customer.City);
                    tableBuilder.Property(customer => customer.PostCode);
                    tableBuilder.Property(customer => customer.Country);
                });
    });
```

Notice also that, if necessary, different column names can be specified for each of the tables. To configure the column name for the main table see Table-specific facet configuration.

### Configuring the linking foreign key

Fluent has an entity type that can be mapped to tables in the database.

```csharp
modelBuilder.Entity<Customer>()
    .HasOne<Customer>()
    .WithOne()
    .HasForeignKey<Customer>(a => a.Id)
    .OnDelete(DeleteBehavior.Restrict);
```

### Limitations

- Entity splitting can't be used for entity types in hierarchies.

- For any row in the main table there must be a row in each of the split tables (the fragments are not optional).

## Table-specific facet configuration

In our series of articles on inheritance, we are going to look at how to map CLR properties to columns in a table.

```csharp
public abstract class Animal
{
    public int Id { get; set; }
    public string Breed { get; set; } = null!;
}

public class Cat : Animal
{
    public string? EducationalLevel { get; set; }
}

public class Dog : Animal
{
    public string? FavoriteToy { get; set; }
}
```

With the TPT inheritance mapping strategy, these types will be mapped to three tables. However, the primary key column in each table may have a different name. For example:

```sql
CREATE TABLE [Animals] (
    [Id] int NOT NULL IDENTITY,
    [Breed] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Animals] PRIMARY KEY ([Id])
);

CREATE TABLE [Cats] (
    [CatId] int NOT NULL,
    [EducationalLevel] nvarchar(max) NULL,
    CONSTRAINT [PK_Cats] PRIMARY KEY ([CatId]),
    CONSTRAINT [FK_Cats_Animals_CatId] FOREIGN KEY ([CatId]) REFERENCES [Animals] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [Dogs] (
    [DogId] int NOT NULL,
    [FavoriteToy] nvarchar(max) NULL,
    CONSTRAINT [PK_Dogs] PRIMARY KEY ([DogId]),
    CONSTRAINT [FK_Dogs_Animals_DogId] FOREIGN KEY ([DogId]) REFERENCES [Animals] ([Id]) ON DELETE CASCADE
);
```

EF7 allows this mapping to be configured using a nested table builder:

```csharp
modelBuilder.Entity<Animal>().ToTable("Animals");

modelBuilder.Entity<Cat>()
    .ToTable(
        "Cats",
        tableBuilder => tableBuilder.Property(cat => cat.Id).HasColumnName("CatId"));

modelBuilder.Entity<Dog>()
    .ToTable(
        "Dogs",
        tableBuilder => tableBuilder.Property(dog => dog.Id).HasColumnName("DogId"));
```

With the TPC inheritance mapping, the ```Breed``` property can also be mapped to different column names in different tables. For example, consider the following TPC tables:

```sql
CREATE TABLE [Cats] (
    [CatId] int NOT NULL DEFAULT (NEXT VALUE FOR [AnimalSequence]),
    [CatBreed] nvarchar(max) NOT NULL,
    [EducationalLevel] nvarchar(max) NULL,
    CONSTRAINT [PK_Cats] PRIMARY KEY ([CatId])
);

CREATE TABLE [Dogs] (
    [DogId] int NOT NULL DEFAULT (NEXT VALUE FOR [AnimalSequence]),
    [DogBreed] nvarchar(max) NOT NULL,
    [FavoriteToy] nvarchar(max) NULL,
    CONSTRAINT [PK_Dogs] PRIMARY KEY ([DogId])
);
```

EF7 supports this table mapping:

```csharp
modelBuilder.Entity<Animal>().UseTpcMappingStrategy();

modelBuilder.Entity<Cat>()
    .ToTable(
        "Cats",
        builder =>
        {
            builder.Property(cat => cat.Id).HasColumnName("CatId");
            builder.Property(cat => cat.Breed).HasColumnName("CatBreed");
        });

modelBuilder.Entity<Dog>()
    .ToTable(
        "Dogs",
        builder =>
        {
            builder.Property(dog => dog.Id).HasColumnName("DogId");
            builder.Property(dog => dog.Breed).HasColumnName("DogBreed");
        });
```

Ref: [Advanced table mapping](https://learn.microsoft.com/en-us/ef/core/modeling/table-splitting)