---
title: Entity Framework - Entity Framework Core - Create a model - Backing fields
published: true
date: 2024-07-23 09:57:59
tags: EFCore, Summary
description: A backing field is a property of an EF class.
image:
---
- Article

  - 01/12/2023

  - 12 contributors

## In this article

A backing field is a property of an EF class.

## Basic configuration

By convention, the following fields will be discovered as backing fields for a given property (listed in precedence order).

- <camel-cased property name>

- _<camel-cased property name>

- _<property name>

- m_<camel-cased property name>

- m_<property name>

In the following sample, the ```Url``` property is configured to have ```_url``` as its backing field:

```csharp
public class Blog
{
    private string _url;

    public int BlogId { get; set; }

    public string Url
    {
        get { return _url; }
        set { _url = value; }
    }
}
```

Note that backing fields are only discovered for properties that are included in the model. For more information on which properties are included in the model, see Including & Excluding Properties.

You can also configure backing fields by using a Data Annotations or the Fluent API, e.g. if the field name doesn't correspond to the above conventions:

 - Data Annotations

 - Fluent API

```csharp
public class Blog
{
    private string _validatedUrl;

    public int BlogId { get; set; }

    [BackingField(nameof(_validatedUrl))]
    public string Url
    {
        get { return _validatedUrl; }
    }

    public void SetUrl(string url)
    {
        // put your validation code here

        _validatedUrl = url;
    }
}
```

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .Property(b => b.Url)
        .HasField("_validatedUrl");
}
```

## Field and property access

The following sample instructs EF to write to the backing field only while materializing, and to use the property in all other cases:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Blog>()
        .Property(b => b.Url)
        .HasField("_validatedUrl")
        .UsePropertyAccessMode(PropertyAccessMode.PreferFieldDuringConstruction);
}
```

See the PropertyAccessMode enum for the complete set of supported options.

## Field-only properties

You can create a conceptual property in your model that does not have a corresponding CLR property in the entity class, but instead uses a field to store the data in the entity.

You can configure a field-only property by providing a name in the Property(...) API:

```csharp
internal class MyContext : DbContext
{
    public DbSet<Blog> Blogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Blog>()
            .Property("_validatedUrl");
    }
}

public class Blog
{
    private string _validatedUrl;

    public int BlogId { get; set; }

    public string GetUrl()
    {
        return _validatedUrl;
    }

    public void SetUrl(string url)
    {
        using (var client = new HttpClient())
        {
            var response = client.GetAsync(url).Result;
            response.EnsureSuccessStatusCode();
        }

        _validatedUrl = url;
    }
}
```

EF will attempt to find a CLR property with the given name, or a field if a property isn't found. If neither a property nor a field are found, a shadow property will be set up instead.

You may need to refer to a field-only property from LINQ queries, but such fields are typically private. You can use the EF.Property(...) method in a LINQ query to refer to the field:

```csharp
var blogs = db.blogs.OrderBy(b => EF.Property<string>(b, "_validatedUrl"));
```

Ref: [Backing Fields](https://learn.microsoft.com/en-us/ef/core/modeling/backing-field)