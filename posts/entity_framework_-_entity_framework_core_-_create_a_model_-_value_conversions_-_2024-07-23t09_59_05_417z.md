---
title: Entity Framework - Entity Framework Core - Create a model - Value conversions
published: true
date: 2024-07-23 09:59:05
tags: EFCore, Summary
description: Property values can be converted from one type to another in the database.
image:
---
- Article

  - 07/05/2023

  - 12 contributors

## In this article

Property values can be converted from one type to another in the database.

> Tip
You can run and debug into all the code in this document by downloading the sample code from GitHub.

## Overview

Value converters can be used to convert data between entities in a database.

The following examples show how to define and implement simple and complex database conversions.

> Note
A property that has been configured for value conversion may also need to specify a ValueComparer<T>. See the examples below, and the Value Comparers documentation for more information.

## Configuring a value converter

Value conversions are configured in DbContext.OnModelCreating. For example, consider an enum and entity type defined as:

```csharp
public class Rider
{
    public int Id { get; set; }
    public EquineBeast Mount { get; set; }
}

public enum EquineBeast
{
    Donkey,
    Mule,
    Horse,
    Unicorn
}
```

In this article I'm going to show you how to convert a ```ModelClrType``` to a ```ProviderClrType```.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder
        .Entity<Rider>()
        .Property(e => e.Mount)
        .HasConversion(
            v => v.ToString(),
            v => (EquineBeast)Enum.Parse(typeof(EquineBeast), v));
}
```

> Note
A ```null``` value will never be passed to a value converter. A ```null``` in a database column is always a ```null``` in the entity instance, and vice-versa. This makes the implementation of conversions easier and allows them to be shared amongst nullable and non-nullable properties. See GitHub issue #13850 for more information.

### Bulk-configuring a value converter

In this article, I'm going to show you how to use pre-convention model configuration to create a single value converter for your entire model.

```csharp
public class CurrencyConverter : ValueConverter<Currency, decimal>
{
    public CurrencyConverter()
        : base(
            v => v.Amount,
            v => new Currency(v))
    {
    }
}
```

Then, override ConfigureConventions in your context type and configure the converter as follows:

```csharp
protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
{
    configurationBuilder
        .Properties<Currency>()
        .HaveConversion<CurrencyConverter>();
}
```

## Pre-defined conversions

EF Core is a library that allows you to easily create, update, and delete databases.

EF Core will automatically convert any type of ```string``` to another type when the provider type is configured as ```string``` using the generic type of HasConversion:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder
        .Entity<Rider>()
        .Property(e => e.Mount)
        .HasConversion<string>();
}
```

The same thing can be achieved by explicitly specifying the database column type. For example, if the entity type is defined like so:

 - Data Annotations

 - Fluent API

```csharp
public class Rider2
{
    public int Id { get; set; }

    [Column(TypeName = "nvarchar(24)")]
    public EquineBeast Mount { get; set; }
}
```

```csharp
modelBuilder
    .Entity<Rider2>()
    .Property(e => e.Mount)
    .HasColumnType("nvarchar(24)");
```

Then the enum values will be saved as strings in the database without any further configuration in OnModelCreating.

## The ```ValueConverter``` class

Calling HasConversion as shown above will create a ```ValueConverter```<TModel,TProvider> instance and set it on the property. The ```ValueConverter``` can instead be created explicitly. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    var converter = new ValueConverter<EquineBeast, string>(
        v => v.ToString(),
        v => (EquineBeast)Enum.Parse(typeof(EquineBeast), v));

    modelBuilder
        .Entity<Rider>()
        .Property(e => e.Mount)
        .HasConversion(converter);
}
```

This can be useful when multiple properties use the same conversion.

## Built-in converters

EF Core ships with a set of pre-defined ValueConverterTModel,TProvider classes, found in the Microsoft.FrameworkCore.Storage.ValueConversion classes.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder
        .Entity<User>()
        .Property(e => e.IsActive)
        .HasConversion<int>();
}
```

This is functionally the same as creating an instance of the built-in BoolToZeroOneConverter<TProvider> and setting it explicitly:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    var converter = new BoolToZeroOneConverter<int>();

    modelBuilder
        .Entity<User>()
        .Property(e => e.IsActive)
        .HasConversion(converter);
}
```

The following table commonly-used pre-defined conversions from model/property types to database provider types.

<table><thead>
<tr>
<th style="text-align: left;">Model/property type</th>
<th>Provider/database type</th>
<th>Conversion</th>
<th>Usage</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">bool</td>
<td>any_numeric_type</td>
<td>False/true to 0/1</td>
<td><code>.HasConversion&lt;any_numeric_type&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;"></td>
<td>any_numeric_type</td>
<td>False/true to any two numbers</td>
<td>Use <a href="/en-us/dotnet/api/microsoft.entityframeworkcore.storage.valueconversion.booltotwovaluesconverter-1" class="no-loc" data-linktype="absolute-path">BoolToTwoValuesConverter&lt;TProvider&gt;</a></td>
</tr>
<tr>
<td style="text-align: left;"></td>
<td>string</td>
<td>False/true to "N"/"Y"</td>
<td><code>.HasConversion&lt;string&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;"></td>
<td>string</td>
<td>False/true to any two strings</td>
<td>Use <a href="/en-us/dotnet/api/microsoft.entityframeworkcore.storage.valueconversion.booltostringconverter" class="no-loc" data-linktype="absolute-path">BoolToStringConverter</a></td>
</tr>
<tr>
<td style="text-align: left;">any_numeric_type</td>
<td>bool</td>
<td>0/1 to false/true</td>
<td><code>.HasConversion&lt;bool&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;"></td>
<td>any_numeric_type</td>
<td>Simple cast</td>
<td><code>.HasConversion&lt;any_numeric_type&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;"></td>
<td>string</td>
<td>The number as a ```string```</td>
<td><code>.HasConversion&lt;string&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;">Enum</td>
<td>any_numeric_type</td>
<td>The numeric value of the enum</td>
<td><code>.HasConversion&lt;any_numeric_type&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;"></td>
<td>string</td>
<td>The ```string``` representation of the enum value</td>
<td><code>.HasConversion&lt;string&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;">string</td>
<td>bool</td>
<td>Parses the ```string``` as a ```bool```</td>
<td><code>.HasConversion&lt;bool&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;"></td>
<td>any_numeric_type</td>
<td>Parses the ```string``` as the given numeric type</td>
<td><code>.HasConversion&lt;any_numeric_type&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;"></td>
<td>char</td>
<td>The first character of the ```string```</td>
<td><code>.HasConversion&lt;char&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;"></td>
<td>DateTime</td>
<td>Parses the ```string``` as a ```DateTime```</td>
<td><code>.HasConversion&lt;DateTime&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;"></td>
<td>DateTimeOffset</td>
<td>Parses the ```string``` as a DateTimeOffset</td>
<td><code>.HasConversion&lt;DateTimeOffset&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;"></td>
<td>TimeSpan</td>
<td>Parses the ```string``` as a TimeSpan</td>
<td><code>.HasConversion&lt;TimeSpan&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;"></td>
<td>Guid</td>
<td>Parses the ```string``` as a Guid</td>
<td><code>.HasConversion&lt;Guid&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;"></td>
<td>byte[]</td>
<td>The ```string``` as UTF8 bytes</td>
<td><code>.HasConversion&lt;byte[]&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;">char</td>
<td>string</td>
<td>A single character ```string```</td>
<td><code>.HasConversion&lt;string&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;">DateTime</td>
<td>long</td>
<td>Encoded date/time preserving ```DateTime```.Kind</td>
<td><code>.HasConversion&lt;long&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;"></td>
<td>long</td>
<td>Ticks</td>
<td>Use <a href="/en-us/dotnet/api/microsoft.entityframeworkcore.storage.valueconversion.datetimetoticksconverter" class="no-loc" data-linktype="absolute-path">DateTimeToTicksConverter</a></td>
</tr>
<tr>
<td style="text-align: left;"></td>
<td>string</td>
<td>Invariant culture date/time ```string```</td>
<td><code>.HasConversion&lt;string&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;">DateTimeOffset</td>
<td>long</td>
<td>Encoded date/time with offset</td>
<td><code>.HasConversion&lt;long&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;"></td>
<td>string</td>
<td>Invariant culture date/time ```string``` with offset</td>
<td><code>.HasConversion&lt;string&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;">TimeSpan</td>
<td>long</td>
<td>Ticks</td>
<td><code>.HasConversion&lt;long&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;"></td>
<td>string</td>
<td>Invariant culture time span ```string```</td>
<td><code>.HasConversion&lt;string&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;">Uri</td>
<td>string</td>
<td>The URI as a ```string```</td>
<td><code>.HasConversion&lt;string&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;">PhysicalAddress</td>
<td>string</td>
<td>The address as a ```string```</td>
<td><code>.HasConversion&lt;string&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;"></td>
<td>byte[]</td>
<td>Bytes in big-endian network order</td>
<td><code>.HasConversion&lt;byte[]&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;">IPAddress</td>
<td>string</td>
<td>The address as a ```string```</td>
<td><code>.HasConversion&lt;string&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;"></td>
<td>byte[]</td>
<td>Bytes in big-endian network order</td>
<td><code>.HasConversion&lt;byte[]&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;">Guid</td>
<td>string</td>
<td>The GUID in 'dddddddd-dddd-dddd-dddd-dddddddddddd' format</td>
<td><code>.HasConversion&lt;string&gt;()</code></td>
</tr>
<tr>
<td style="text-align: left;"></td>
<td>byte[]</td>
<td>Bytes in ```.```NET binary serialization order</td>
<td><code>.HasConversion&lt;byte[]&gt;()</code></td>
</tr>
</tbody></table>

The following examples show how to convert a ```string``` to another format.

The full list of built-in converters is:

- Converting ```bool``` properties:

  - BoolToStringConverter - Bool to strings such as "N" and "Y"

  - BoolToTwoValuesConverter<TProvider> - Bool to any two values

  - BoolToZeroOneConverter<TProvider> - Bool to zero and one

- Converting ```byte``` array properties:

  - BytesToStringConverter - Byte array to Base64-encoded ```string```

- Any conversion that requires only a type-cast

  - CastingConverter<TModel,TProvider> - Conversions that require only a type cast

- Converting ```char``` properties:

  - CharToStringConverter - Char to single character ```string```

- Converting DateTimeOffset properties:

  - DateTimeOffsetToBinaryConverter - DateTimeOffset to binary-encoded 64-bit value

  - DateTimeOffsetToBytesConverter - DateTimeOffset to ```byte``` array

  - DateTimeOffsetToStringConverter - DateTimeOffset to ```string```

- Converting ```DateTime``` properties:

  - DateTimeToBinaryConverter - ```DateTime``` to 64-bit value including DateTimeKind

  - DateTimeToStringConverter - ```DateTime``` to ```string```

  - DateTimeToTicksConverter - ```DateTime``` to ticks

- Converting enum properties:

  - EnumToNumberConverter<TEnum,TNumber> - Enum to underlying number

  - EnumToStringConverter<TEnum> - Enum to ```string```

- Converting Guid properties:

  - GuidToBytesConverter - Guid to ```byte``` array

  - GuidToStringConverter - Guid to ```string```

- Converting IPAddress properties:

  - IPAddressToBytesConverter - IPAddress to ```byte``` array

  - IPAddressToStringConverter - IPAddress to ```string```

- Converting numeric (int, ```double```, ```decimal```, etc.) properties:

  - NumberToBytesConverter<TNumber> - Any numerical value to ```byte``` array

  - NumberToStringConverter<TNumber> - Any numerical value to ```string```

- Converting PhysicalAddress properties:

  - PhysicalAddressToBytesConverter - PhysicalAddress to ```byte``` array

  - PhysicalAddressToStringConverter - PhysicalAddress to ```string```

- Converting ```string``` properties:

  - StringToBoolConverter - Strings such as "N" and "Y" to ```bool```

  - StringToBytesConverter - ```String``` to UTF8 bytes

  - StringToCharConverter - ```String``` to character

  - StringToDateTimeConverter - ```String``` to ```DateTime```

  - StringToDateTimeOffsetConverter - ```String``` to DateTimeOffset

  - StringToEnumConverter<TEnum> - ```String``` to enum

  - StringToGuidConverter - ```String``` to Guid

  - StringToNumberConverter<TNumber> - ```String``` to numeric type

  - StringToTimeSpanConverter - ```String``` to TimeSpan

  - StringToUriConverter - ```String``` to Uri

- Converting TimeSpan properties:

  - TimeSpanToStringConverter - TimeSpan to ```string```

  - TimeSpanToTicksConverter - TimeSpan to ticks

- Converting Uri properties:

  - UriToStringConverter - Uri to ```string```

Note that all the built-in converters are stateless and so a single instance can be safely shared by multiple properties.

## Column facets and mapping hints

Some database types have facets that modify how the data is stored. These include:

- Precision and scale for decimals and date/time columns

- Size/length for binary and ```string``` columns

- Unicode for ```string``` columns

In this article we are going to look at some of the facets that can be used to specify the database type that will be used when converting a property to strings.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder
        .Entity<Rider>()
        .Property(e => e.Mount)
        .HasConversion<string>()
        .HasMaxLength(20)
        .IsUnicode(false);
}
```

Or, when creating the converter explicitly:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    var converter = new ValueConverter<EquineBeast, string>(
        v => v.ToString(),
        v => (EquineBeast)Enum.Parse(typeof(EquineBeast), v));

    modelBuilder
        .Entity<Rider>()
        .Property(e => e.Mount)
        .HasConversion(converter)
        .HasMaxLength(20)
        .IsUnicode(false);
}
```

This results in a varchar(20) column when using EF Core migrations against SQL Server:

```sql
CREATE TABLE [Rider] (
    [Id] int NOT NULL IDENTITY,
    [Mount] varchar(20) NOT NULL,
    CONSTRAINT [PK_Rider] PRIMARY KEY ([Id]));
```

However, if by default all ```EquineBeast``` columns should be varchar(20), then this information can be given to the value converter as a ConverterMappingHints. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    var converter = new ValueConverter<EquineBeast, string>(
        v => v.ToString(),
        v => (EquineBeast)Enum.Parse(typeof(EquineBeast), v),
        new ConverterMappingHints(size: 20, unicode: false));

    modelBuilder
        .Entity<Rider>()
        .Property(e => e.Mount)
        .HasConversion(converter);
}
```

The following example shows how to convert a max set of facets to a max set of hints.

## Examples

### Simple value objects

This example shows how to wrap primitive types.

```csharp
public readonly struct Dollars
{
    public Dollars(decimal amount) 
        => Amount = amount;
        
    public decimal Amount { get; }

    public override string ToString() 
        => $"${Amount}";
}
```

This can be used in an entity type:

```csharp
public class Order
{
    public int Id { get; set; }

    public Dollars Price { get; set; }
}
```

And converted to the underlying ```decimal``` when stored in the database:

```csharp
modelBuilder.Entity<Order>()
    .Property(e => e.Price)
    .HasConversion(
        v => v.Amount,
        v => new Dollars(v));
```

> Note
This value object is implemented as a readonly struct. This means that EF Core can snapshot and compare values without issue. See Value Comparers for more information.

### Composite value objects

This example shows how to use a value object type to compose multiple properties that together form a domain concept.

```csharp
public readonly struct Money
{
    [JsonConstructor]
    public Money(decimal amount, Currency currency)
    {
        Amount = amount;
        Currency = currency;
    }

    public override string ToString()
        => (Currency == Currency.UsDollars ? "$" : "£") + Amount;

    public decimal Amount { get; }
    public Currency Currency { get; }
}

public enum Currency
{
    UsDollars,
    PoundsSterling
}
```

This value object can be used in an entity type as before:

```csharp
public class Order
{
    public int Id { get; set; }

    public Money Price { get; set; }
}
```

System.Text.Json allows you to convert values from an object to and from a database column.

```csharp
modelBuilder.Entity<Order>()
    .Property(e => e.Price)
    .HasConversion(
        v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
        v => JsonSerializer.Deserialize<Money>(v, (JsonSerializerOptions)null));
```

> Note
We plan to allow mapping an object to multiple columns in a future version of EF Core, removing the need to use serialization here. This is tracked by GitHub issue #13947.

> Note
As with the previous example, this value object is implemented as a readonly struct. This means that EF Core can snapshot and compare values without issue. See Value Comparers for more information.

### Collections of primitives

Serialization can also be used to store a collection of primitive values. For example:

```csharp
public class Post
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Contents { get; set; }

    public ICollection<string> Tags { get; set; }
}
```

Using System.Text.Json again:

```csharp
modelBuilder.Entity<Post>()
    .Property(e => e.Tags)
    .HasConversion(
        v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
        v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null),
        new ValueComparer<ICollection<string>>(
            (c1, c2) => c1.SequenceEqual(c2),
            c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
            c => (ICollection<string>)c.ToList()));
```

ICollection<string> represents a mutable reference type. This means that a ValueComparer<T> is needed so that EF Core can track and detect changes correctly. See Value Comparers for more information.

### Collections of value objects

Combining the previous two examples together we can create a collection of value objects. For example, consider an ```AnnualFinance``` type that models blog finances for a single year:

```csharp
public readonly struct AnnualFinance
{
    [JsonConstructor]
    public AnnualFinance(int year, Money income, Money expenses)
    {
        Year = year;
        Income = income;
        Expenses = expenses;
    }

    public int Year { get; }
    public Money Income { get; }
    public Money Expenses { get; }
    public Money Revenue => new Money(Income.Amount - Expenses.Amount, Income.Currency);
}
```

This type composes several of the ```Money``` types we created previously:

```csharp
public readonly struct Money
{
    [JsonConstructor]
    public Money(decimal amount, Currency currency)
    {
        Amount = amount;
        Currency = currency;
    }

    public override string ToString()
        => (Currency == Currency.UsDollars ? "$" : "£") + Amount;

    public decimal Amount { get; }
    public Currency Currency { get; }
}

public enum Currency
{
    UsDollars,
    PoundsSterling
}
```

We can then add a collection of ```AnnualFinance``` to our entity type:

```csharp
public class Blog
{
    public int Id { get; set; }
    public string Name { get; set; }

    public IList<AnnualFinance> Finances { get; set; }
}
```

And again use serialization to store this:

```csharp
modelBuilder.Entity<Blog>()
    .Property(e => e.Finances)
    .HasConversion(
        v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
        v => JsonSerializer.Deserialize<List<AnnualFinance>>(v, (JsonSerializerOptions)null),
        new ValueComparer<IList<AnnualFinance>>(
            (c1, c2) => c1.SequenceEqual(c2),
            c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
            c => (IList<AnnualFinance>)c.ToList()));
```

> Note
As before, this conversion requires a ValueComparer<T>. See Value Comparers for more information.

### Value objects as keys

Key properties can be used to assign values to objects.

```csharp
public readonly struct BlogKey
{
    public BlogKey(int id) => Id = id;
    public int Id { get; }
}

public readonly struct PostKey
{
    public PostKey(int id) => Id = id;
    public int Id { get; }
}
```

These can then be used in the domain model:

```csharp
public class Blog
{
    public BlogKey Id { get; set; }
    public string Name { get; set; }

    public ICollection<Post> Posts { get; set; }
}

public class Post
{
    public PostKey Id { get; set; }

    public string Title { get; set; }
    public string Content { get; set; }

    public BlogKey? BlogId { get; set; }
    public Blog Blog { get; set; }
}
```

Notice that ```Blog.Id``` cannot accidentally be assigned a ```PostKey```, and ```Post.Id``` cannot accidentally be assigned a ```BlogKey```. Similarly, the ```Post.BlogId``` foreign key property must be assigned a ```BlogKey```.

> Note
Showing this pattern does not mean we recommend it. Carefully consider whether this level of abstraction is helping or hampering your development experience. Also, consider using navigations and generated keys instead of dealing with key values directly.

These key properties can then be mapped using value converters:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    var blogKeyConverter = new ValueConverter<BlogKey, int>(
        v => v.Id,
        v => new BlogKey(v));

    modelBuilder.Entity<Blog>().Property(e => e.Id).HasConversion(blogKeyConverter);

    modelBuilder.Entity<Post>(
        b =>
        {
            b.Property(e => e.Id).HasConversion(v => v.Id, v => new PostKey(v));
            b.Property(e => e.BlogId).HasConversion(blogKeyConverter);
        });
}
```

> Note
Key properties with conversions can only use generated key values starting with EF Core 7.0.

### Use ```ulong``` for ```timestamp```/rowversion

In this article, I'll show you how to use value converters to make it easier to implement optimistic concurrency in SQL Server.

```csharp
public class Blog
{
    public int Id { get; set; }
    public string Name { get; set; }
    public ulong Version { get; set; }
}
```

This can be mapped to a SQL server ```rowversion``` column using a value converter:

```csharp
modelBuilder.Entity<Blog>()
    .Property(e => e.Version)
    .IsRowVersion()
    .HasConversion<byte[]>();
```

### Specify the ```DateTime```.Kind when reading dates

SQL Server discards the ```DateTime```.Kind flag when storing a ```DateTime``` as a ```datetime``` or ```datetime2```. This means that ```DateTime``` values coming back from the database always have a DateTimeKind of ```Unspecified```.

Value converters can be used in two ways to deal with this. First, EF Core has a value converter that creates an 8-byte opaque value which preserves the ```Kind``` flag. For example:

```csharp
modelBuilder.Entity<Post>()
    .Property(e => e.PostedOn)
    .HasConversion<long>();
```

This allows ```DateTime``` values with different ```Kind``` flags to be mixed in the database.

The DateTimeKind flag can be used to set the ```datetime``` value in a database to a specific ```Kind```.

```csharp
modelBuilder.Entity<Post>()
    .Property(e => e.LastUpdated)
    .HasConversion(
        v => v,
        v => new DateTime(v.Ticks, DateTimeKind.Utc));
```

If a mix of local and ```UTC``` values are being set in entity instances, then the converter can be used to convert appropriately before inserting. For example:

```csharp
modelBuilder.Entity<Post>()
    .Property(e => e.LastUpdated)
    .HasConversion(
        v => v.ToUniversalTime(),
        v => new DateTime(v.Ticks, DateTimeKind.Utc));
```

> Note
Carefully consider unifying all database access code to use ```UTC``` time all the time, only dealing with local time when presenting data to users.

### Use case-insensitive ```string``` keys

An EF Core value comparer can be used to force EF Core to perform case-insensitive ```string``` comparisons like in a database.

```csharp
public class Blog
{
    public string Id { get; set; }
    public string Name { get; set; }

    public ICollection<Post> Posts { get; set; }
}

public class Post
{
    public string Id { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }

    public string BlogId { get; set; }
    public Blog Blog { get; set; }
}
```

 ```Post.BlogId``` is a value that is used to display a graph of objects with the same name.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    var comparer = new ValueComparer<string>(
        (l, r) => string.Equals(l, r, StringComparison.OrdinalIgnoreCase),
        v => v.ToUpper().GetHashCode(),
        v => v);

    modelBuilder.Entity<Blog>()
        .Property(e => e.Id)
        .Metadata.SetValueComparer(comparer);

    modelBuilder.Entity<Post>(
        b =>
        {
            b.Property(e => e.Id).Metadata.SetValueComparer(comparer);
            b.Property(e => e.BlogId).Metadata.SetValueComparer(comparer);
        });
}
```

> Note
.NET ```string``` comparisons and database ```string``` comparisons can differ in more than just case sensitivity. This pattern works for simple ASCII keys, but may fail for keys with any kind of culture-specific characters. See Collations and Case Sensitivity for more information.

### Handle fixed-length database strings

This example shows how to compare key values between two strings.

This example shows how padding can be used when reading key values.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    var converter = new ValueConverter<string, string>(
        v => v,
        v => v.Trim());

    var comparer = new ValueComparer<string>(
        (l, r) => string.Equals(l, r, StringComparison.OrdinalIgnoreCase),
        v => v.ToUpper().GetHashCode(),
        v => v);

    modelBuilder.Entity<Blog>()
        .Property(e => e.Id)
        .HasColumnType("char(20)")
        .HasConversion(converter, comparer);

    modelBuilder.Entity<Post>(
        b =>
        {
            b.Property(e => e.Id).HasColumnType("char(20)").HasConversion(converter, comparer);
            b.Property(e => e.BlogId).HasColumnType("char(20)").HasConversion(converter, comparer);
        });
}
```

### Encrypt property values

Researchers at the Massachusetts Institute of Technology (MIT) have developed a way to encrypt data before it is sent to a database.

```csharp
modelBuilder.Entity<User>().Property(e => e.Password).HasConversion(
    v => new string(v.Reverse().ToArray()),
    v => new string(v.Reverse().ToArray()));
```

> Note
There is currently no way to get a reference to the current DbContext, or other session state, from within a value converter. This limits the kinds of encryption that can be used. Vote for GitHub issue #11597 to have this limitation removed.

> Warning
Make sure to understand all the implications if you roll your own encryption to protect sensitive data. Consider instead using pre-built encryption mechanisms, such as Always Encrypted on SQL Server.

## Limitations

There are a few known current limitations of the value conversion system:

- As noted above, ```null``` cannot be converted. Please vote (👍) for GitHub issue #13850 if this is something you need.

- It isn't possible to query into value-converted properties, e.g. reference members on the value-converted ```.```NET type in your LINQ queries. Please vote (👍) for GitHub issue #10434 if this is something you need - but considering using a JSON column instead.

- There is currently no way to spread a conversion of one property to multiple columns or vice-versa. Please vote (👍) for GitHub issue #13947 if this is something you need.

- Value generation is not supported for most keys mapped through value converters. Please vote (👍) for GitHub issue #11597 if this is something you need.

- Value conversions cannot reference the current DbContext instance. Please vote (👍) for GitHub issue #12205 if this is something you need.

- Parameters using value-converted types cannot currently be used in raw SQL APIs. Please vote (👍) for GitHub issue #27534 if this is something you need.

Removal of these limitations is being considered for future releases.

Ref: [Value Conversions](https://learn.microsoft.com/en-us/ef/core/modeling/value-conversions)