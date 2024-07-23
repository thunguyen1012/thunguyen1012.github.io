---
title: Entity Framework - Entity Framework Core - Create a model - Value comparers
published: true
date: 2024-07-23 09:59:45
tags: EFCore, Summary
description: EF Core has a new feature called change tracking.
image:
---
- Article

  - 01/12/2023

  - 7 contributors

## In this article

> Tip
The code in this document can be found on GitHub as a runnable sample.

## Background

EF Core has a new feature called change tracking.

This article describes how to snapshot a property using the EF Core library.

The following example shows how to use the built-in hash code comparison functionality in Django.

```csharp
modelBuilder
    .Entity<EntityType>()
    .Property(e => e.MyListProperty)
    .HasConversion(
        v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
        v => JsonSerializer.Deserialize<List<int>>(v, (JsonSerializerOptions)null),
        new ValueComparer<List<int>>(
            (c1, c2) => c1.SequenceEqual(c2),
            c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
            c => c.ToList()));
```

See mutable classes below for further details.

Note that value comparers are also used when determining whether two key values are the same when resolving relationships; this is explained below.

## Shallow vs. deep comparison

For large, immutable value types such as ```int```, EF Core's default logic works well: the value is copied as-is when snapshotted, and compared with the type's built-in equality comparison.

Consider byte arrays, which can be arbitrarily large. These could be compared:

- By reference, such that a difference is only detected if a new byte array is used

- By deep comparison, such that mutation of the bytes in the array is detected

There are two ways to perform a SaveChanges operation on a byte array: copying the current array to the new array, or comparing it to the existing array.

reference equality would not work when byte arrays are used to represent binary keys, since it's very unlikely that an FK property is set to the same instance as a PK property to which it needs to be compared.

Note that the chosen comparison and snapshotting logic must correspond to each other: deep comparison requires deep snapshotting to function correctly.

## Simple immutable classes

Consider a property that uses a value converter to map a simple, immutable class.

```csharp
public sealed class ImmutableClass
{
    public ImmutableClass(int value)
    {
        Value = value;
    }

    public int Value { get; }

    private bool Equals(ImmutableClass other)
        => Value == other.Value;

    public override bool Equals(object obj)
        => ReferenceEquals(this, obj) || obj is ImmutableClass other && Equals(other);

    public override int GetHashCode()
        => Value.GetHashCode();
}
```

```csharp
modelBuilder
    .Entity<MyEntityType>()
    .Property(e => e.MyProperty)
    .HasConversion(
        v => v.Value,
        v => new ImmutableClass(v));
```

Properties of this type do not need special comparisons or snapshots because:

- Equality is overridden so that different instances will compare correctly

- The type is immutable, so there is no chance of mutating a snapshot value

So in this case the default behavior of EF Core is fine as it is.

## Simple immutable structs

The mapping for simple structs is also simple and requires no special comparers or snapshotting.

```csharp
public readonly struct ImmutableStruct
{
    public ImmutableStruct(int value)
    {
        Value = value;
    }

    public int Value { get; }
}
```

```csharp
modelBuilder
    .Entity<EntityType>()
    .Property(e => e.MyProperty)
    .HasConversion(
        v => v.Value,
        v => new ImmutableStruct(v));
```

EF Core has built-in support for generating compiled, memberwise comparisons of struct properties.

## Mutable classes

In this article, I will show you how to use a mutable type with properties that cannot be changed.

```csharp
public List<int> MyListProperty { get; set; }
```

The List<T> class:

- Has reference equality; two lists containing the same values are treated as different.

- Is mutable; values in the list can be added and removed.

A typical value conversion on a list property might convert the list to and from JSON:

 - EF Core 5.0

 - Older versions

```csharp
modelBuilder
    .Entity<EntityType>()
    .Property(e => e.MyListProperty)
    .HasConversion(
        v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
        v => JsonSerializer.Deserialize<List<int>>(v, (JsonSerializerOptions)null),
        new ValueComparer<List<int>>(
            (c1, c2) => c1.SequenceEqual(c2),
            c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
            c => c.ToList()));
```

```csharp
modelBuilder
    .Entity<EntityType>()
    .Property(e => e.MyListProperty)
    .HasConversion(
        v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
        v => JsonSerializer.Deserialize<List<int>>(v, (JsonSerializerOptions)null));

var valueComparer = new ValueComparer<List<int>>(
    (c1, c2) => c1.SequenceEqual(c2),
    c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
    c => c.ToList());

modelBuilder
    .Entity<EntityType>()
    .Property(e => e.MyListProperty)
    .Metadata
    .SetValueComparer(valueComparer);
```

The ValueComparer<T> constructor accepts three expressions:

- An expression for checking equality

- An expression for generating a hash code

- An expression to snapshot a value

In this case the comparison is done by checking if the sequences of numbers are the same.

Likewise, the hash code is built from this same sequence. (Note that this is a hash code over mutable values and hence can cause problems. Be immutable instead if you can.)

The snapshot is created by cloning the list with ```ToList```. Again, this is only needed if the lists are going to be mutated. Be immutable instead if you can.

> Note
Value converters and comparers are constructed using expressions rather than simple delegates. This is because EF Core inserts these expressions into a much more complex expression tree that is then compiled into an entity shaper delegate. Conceptually, this is similar to compiler inlining. For example, a simple conversion may just be a compiled in cast, rather than a call to another method to do the conversion.

## Key comparers

This course teaches you how to create a comparer for a key property.

Use SetKeyValueComparer in the rare cases where different semantics is required on the same property.

> Note
SetStructuralValueComparer has been obsoleted. Use SetKeyValueComparer instead.

## Overriding the default comparer

You can override the comparer used by EF Core by setting a different comparer on the property:

```csharp
modelBuilder
    .Entity<EntityType>()
    .Property(e => e.MyBytes)
    .Metadata
    .SetValueComparer(
        new ValueComparer<byte[]>(
            (c1, c2) => c1.SequenceEqual(c2),
            c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
            c => c.ToArray()));
```

EF Core will now compare byte sequences and will therefore detect byte array mutations.

Ref: [Value Comparers](https://learn.microsoft.com/en-us/ef/core/modeling/value-comparers)