---
title: Entity Framework - Entity Framework Core - Create a model - Owned entity types
published: true
date: 2024-07-24 10:12:38
tags: EFCore, Summary
description: EF Core allows you to model entity types that can only ever appear on navigation properties of other entity types.
image:
---

## In this article

EF Core allows you to model entity types that can only ever appear on navigation properties of other entity types.

An owned entity is an entity that is owned by the owner.

## Configuring types as owned

The Azure Cosmos DB provider configures all related entity types as owned by default.

In this example, ```StreetAddress``` is a type with no identity property. It is used as a property of the ```Order``` type to specify the shipping address for a particular order.

We can use the ```OwnedAttribute``` to treat it as an owned entity when referenced from another entity type:

```csharp
[Owned]
public class StreetAddress
{
    public string Street { get; set; }
    public string City { get; set; }
}
```

```csharp
public class Order
{
    public int Id { get; set; }
    public StreetAddress ShippingAddress { get; set; }
}
```

It is also possible to use the ```OwnsOne``` method in ```OnModelCreating``` to specify that the ```ShippingAddress``` property is an Owned Entity of the ```Order``` entity type and to configure additional facets if needed.

```csharp
modelBuilder.Entity<Order>().OwnsOne(p => p.ShippingAddress);
```

If the ```ShippingAddress``` property is private in the ```Order``` type, you can use the string version of the ```OwnsOne``` method:

```csharp
modelBuilder.Entity<Order>().OwnsOne(typeof(StreetAddress), "ShippingAddress");
```

The model above is mapped to the following database schema:



See the full sample project for more context.

> Tip
The owned entity type can be marked as required, see Required one-to-one dependents for more information.

## Implicit keys

This example shows how to define a foreign key property for an owned type.

An instance of a owned type is an object that is owned by another instance of the same type.

## Collections of owned types

To configure a collection of owned types use ```OwnsMany``` in ```OnModelCreating```.

How do you define a foreign key for an owned type?

The two most straightforward solutions to this are:

- Defining a surrogate primary key on a new property independent of the foreign key that points to the owner. The contained values would need to be unique across all owners (e.g. if Parent {1} has Child {1}, then Parent {2} cannot have Child {1}), so the value doesn't have any inherent meaning. Since the foreign key is not part of the primary key its values can be changed, so you could move a child from one parent to another one, however this usually goes against aggregate semantics.

- Using the foreign key and an additional property as a composite key. The additional property value now only needs to be unique for a given parent (so if Parent {1} has Child {1,1} then Parent {2} can still have Child {2,1}). By making the foreign key part of the primary key the relationship between the owner and the owned entity becomes immutable and reflects aggregate semantics better. This is what EF Core does by default.

In this example we'll use the ```Distributor``` class.

```csharp
public class Distributor
{
    public int Id { get; set; }
    public ICollection<StreetAddress> ShippingCenters { get; set; }
}
```

 ```ShippingCenters``` uses a unique ```int``` value for the owned type referenced through the ```ShippingCenters``` navigation property.

To configure a different primary key call ```HasKey```.

```csharp
modelBuilder.Entity<Distributor>().OwnsMany(
    p => p.ShippingCenters, a =>
    {
        a.WithOwner().HasForeignKey("OwnerId");
        a.Property<int>("Id");
        a.HasKey("Id");
    });
```

The model above is mapped to the following database schema:



## Mapping owned types with table splitting

In this article I will show you how to split a relational database table in two.

The properties of the owned entity type will appear in the ```'Orders'``` table with the names ```'ShippingAddress_Street'``` and ```'ShippingAddress_City'```.

You can use the ```HasColumnName``` method to rename those columns.

```csharp
modelBuilder.Entity<Order>().OwnsOne(
    o => o.ShippingAddress,
    sa =>
    {
        sa.Property(p => p.Street).HasColumnName("ShipsToStreet");
        sa.Property(p => p.City).HasColumnName("ShipsToCity");
    });
```

> Note
Most of the normal entity type configuration methods like Ignore can be called in the same way.

## Sharing the same .NET type among multiple owned types

An owned entity type can be of the same .NET type as another owned entity type, therefore the .NET type may not be enough to identify an owned type.

In the .NET framework, owned entities are defined as entities that are owned by their owners.

For example, in the following class ```ShippingAddress``` and ```BillingAddress``` are both of the same .NET type, ```StreetAddress```.

```csharp
public class OrderDetails
{
    public DetailedOrder Order { get; set; }
    public StreetAddress BillingAddress { get; set; }
    public StreetAddress ShippingAddress { get; set; }
}
```

An example of a tracked instance of an object can be found here.

## Nested owned types

In this example ```OrderDetails``` owns ```BillingAddress``` and ```ShippingAddress```, which are both ```StreetAddress``` types. Then ```OrderDetails``` is owned by the ```DetailedOrder``` type.

```csharp
public class DetailedOrder
{
    public int Id { get; set; }
    public OrderDetails OrderDetails { get; set; }
    public OrderStatus Status { get; set; }
}
```

```csharp
public enum OrderStatus
{
    Pending,
    Shipped
}
```

Each navigation to an owned type defines a separate entity type with completely independent configuration.

An owned type is a nested type which can reference a regular entity which can be either the owner or a different entity as long as the owned entity is on the dependent side.

```csharp
public class OrderDetails
{
    public DetailedOrder Order { get; set; }
    public StreetAddress BillingAddress { get; set; }
    public StreetAddress ShippingAddress { get; set; }
}
```

## Configuring owned types

It is possible to chain the ```OwnsOne``` method in a fluent call to configure this model:

```csharp
modelBuilder.Entity<DetailedOrder>().OwnsOne(
    p => p.OrderDetails, od =>
    {
        od.WithOwner(d => d.Order);
        od.Navigation(d => d.Order).UsePropertyAccessMode(PropertyAccessMode.Property);
        od.OwnsOne(c => c.BillingAddress);
        od.OwnsOne(c => c.ShippingAddress);
    });
```

To define a navigation to the owner entity type that's not part of the ownership relationship ```WithOwner``` should be called without arguments.

It is also possible to achieve this result using ```OwnedAttribute``` on both ```OrderDetails``` and ```StreetAddress```.

In addition, notice the ```Navigation``` call. ```Navigation``` properties to owned types can be further configured as for non-owned navigation properties.

The model above is mapped to the following database schema:



## Storing owned types in separate tables

Unlike EF6 complex types, owned types can be stored in a separate table from the owner.

```csharp
modelBuilder.Entity<DetailedOrder>().OwnsOne(p => p.OrderDetails, od => { od.ToTable("OrderDetails"); });
```

It is possible to map an entity type to an owned type.

## Querying owned types

Two owned types are stored in the database.

```csharp
var order = context.DetailedOrders.First(o => o.Status == OrderStatus.Pending);
Console.WriteLine($"First pending order will ship to: {order.OrderDetails.ShippingAddress.City}");
```

## Limitations

Some of these limitations are fundamental to how owned entity types work, but some others are restrictions that we may be able to remove in future releases:

### By-design restrictions

- You cannot create a ```DbSet<T>``` for an owned type.

- You cannot call ```Entity<T>()``` with an owned type on ```ModelBuilder```.

- Instances of owned entity types cannot be shared by multiple owners (this is a well-known scenario for value objects that cannot be implemented using owned entity types).

### Current shortcomings

- Owned entity types cannot have inheritance hierarchies

### Shortcomings in previous versions

- In EF Core 2.x reference navigations to owned entity types cannot be null unless they are explicitly mapped to a separate table from the owner.

- In EF Core 3.x the columns for owned entity types mapped to the same table as the owner are always marked as nullable.

Ref: [Owned Entity Types](https://learn.microsoft.com/en-us/ef/core/modeling/owned-entities)