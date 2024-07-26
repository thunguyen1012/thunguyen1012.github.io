---
title: Entity Framework - Entity Framework Core - Create a model - Bulk configuration
published: true
date: 2024-07-25 03:07:30
tags: EFCore, Summary
description: When an aspect needs to be configured in the same way across multiple entity types, the following techniques allow to reduce code duplication and consolidate the logic.
image:
---

## In this article

When an aspect needs to be configured in the same way across multiple entity types, the following techniques allow to reduce code duplication and consolidate the logic.

See the full sample project containing the code snippets presented below.

## Bulk configuration in ```OnModelCreating```

ModelBuilder exposes methods that allow you to iterate over objects in the model and apply common configuration to them.

In the following example the model contains a custom value type ```Currency```:

```csharp
public readonly struct Currency
{
    public Currency(decimal amount)
        => Amount = amount;

    public decimal Amount { get; }

    public override string ToString()
        => $"${Amount}";
}
```

This snippet of ```OnModelCreating``` adds all properties of the type ```Currency``` and configures a value converter to a supported type - ```decimal```:

```csharp
foreach (var entityType in modelBuilder.Model.GetEntityTypes())
{
    foreach (var propertyInfo in entityType.ClrType.GetProperties())
    {
        if (propertyInfo.PropertyType == typeof(Currency))
        {
            entityType.AddProperty(propertyInfo)
                .SetValueConverter(typeof(CurrencyConverter));
        }
    }
}
```

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

### Drawbacks of the ```Metadata``` API

- Unlike Fluent API, every modification to the model needs to be done explicitly. For example, if some of the ```Currency``` properties were configured as navigations by a convention then you need to first remove the navigation referencing the CLR property before adding an entity type property for it. #9117 will improve this.

- The conventions run after each change. If you remove a navigation discovered by a convention then the convention will run again and could add it back. To prevent this from happening you would need to either delay the conventions until after the property is added by calling ```DelayConventions()``` and later disposing the returned object or to mark the CLR property as ignored using AddIgnored.

- Entity types might be added after this iteration happens and the configuration won't be applied to them. This can usually be prevented by placing this code at the end of ```OnModelCreating```, but if you have two interdependent sets of configurations there might not be an order that will allow them to be applied consistently.

## Pre-convention configuration

EF Core supports the mapping of CLR types to model types derived from DbContext.

This example shows how configure all properties of type ```Currency``` to have a value converter:

```csharp
protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
{
    configurationBuilder
        .Properties<Currency>()
        .HaveConversion<CurrencyConverter>();
}
```

And this example shows how to configure some facets on all properties of type ```string```:

```csharp
configurationBuilder
    .Properties<string>()
    .AreUnicode(false)
    .HaveMaxLength(1024);
```

> Note
The type specified in a call from ```ConfigureConventions``` can be a base type, an interface or a generic type definition. All matching configurations will be applied in order from the least specific:

Interface
Base type
Generic type definition
Non-nullable value type
Exact type

 - Interface

 - Base type

 - Generic type definition

 - Non-nullable value type

 - Exact type

> Important
Pre-convention configuration is equivalent to explicit configuration that is applied as soon as a matching object is added to the model. It will override all conventions and Data Annotations. For example, with the above configuration all ```string``` foreign key properties will be created as non-unicode with ```MaxLength``` of 1024, even when this doesn't match the principal key.

### Ignoring types

Pre-convention configuration also allows to ignore a type and prevent it from being discovered by conventions either as an entity type or as a property on an entity type:

```csharp
configurationBuilder
    .IgnoreAny(typeof(IList<>));
```

### Default type mapping

In this article, I'll show you how to add or override a provider type mapping to EF.

```csharp
configurationBuilder
    .DefaultTypeMapping<Currency>()
    .HasConversion<CurrencyConverter>();
```

### Limitations of pre-convention configuration

- Many aspects cannot be configured with this approach. #6787 will expand this to more types.

- Currently the configuration is only determined by the CLR type. #20418 would allow custom predicates.

- This configuration is performed before a model is created. If there are any conflicts that arise when applying it, the exception stack trace will not contain the ```ConfigureConventions``` method, so it might be harder to find the cause.

## Conventions

> Note
Custom model building conventions were introduced in EF Core 7.0.

EF Core model building conventions are classes that contain logic that is triggered based on changes being made to the model as it is being built.

This paper describes how to use the pre-convention model configuration to easily specify common configuration for properties and types.

### Adding a new convention

#### Example: Constrain length of discriminator properties

Let's create a new convention that will constrain the maximum length of discriminator strings.

EF Core model building conventions are triggered based on changes being made to the model as it is being built.

In this talk, we will look at some of the interfaces that can be used to create and manage models.

Let's make this a bit more concrete by making a first attempt at implementing the discriminator-length convention:

```csharp
public class DiscriminatorLengthConvention1 : IEntityTypeBaseTypeChangedConvention
{
    public void ProcessEntityTypeBaseTypeChanged(
        IConventionEntityTypeBuilder entityTypeBuilder,
        IConventionEntityType? newBaseType,
        IConventionEntityType? oldBaseType,
        IConventionContext<IConventionEntityType> context)
    {
        var discriminatorProperty = entityTypeBuilder.Metadata.FindDiscriminatorProperty();
        if (discriminatorProperty != null
            && discriminatorProperty.ClrType == typeof(string))
        {
            discriminatorProperty.Builder.HasMaxLength(24);
        }
    }
}
```

This convention implements ```ITypeBaseChangedTypeConvention```, which means it will be triggered whenever the mapped inheritance hierarchy for an entity type is changed.

This convention is then used by calling ```Add``` in ```ConfigureConventions```:

```csharp
protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
{
    configurationBuilder.Conventions.Add(_ =>  new DiscriminatorLengthConvention1());
}
```

> Note
Rather than adding an instance of the convention directly, the ```Add``` method accepts a factory for creating instances of the convention. This allows the convention to use dependencies from the EF Core internal service provider. Since this convention has no dependencies, the service provider parameter is named ```_```, indicating that it is never used.

Building the model and looking at the ```Post``` entity type shows that this has worked - the discriminator property is now configured to with a maximum length of 24:

```text
Discriminator (no field, string) Shadow Required AfterSave:Throw MaxLength(24)
```

But what happens if we now explicitly configure a different discriminator property? For example:

```csharp
modelBuilder.Entity<Post>()
    .HasDiscriminator<string>("PostTypeDiscriminator")
    .HasValue<Post>("Post")
    .HasValue<FeaturedPost>("Featured");
```

Looking at the debug view of the model, we find that the discriminator length is no longer configured.

```text
PostTypeDiscriminator (no field, string) Shadow Required AfterSave:Throw
```

When we add a custom discriminator to our convention, it does not behave as expected.

When we want to apply a configuration to a model, we often need to trigger other conventions to do so.

```csharp
public class DiscriminatorLengthConvention2 : IModelFinalizingConvention
{
    public void ProcessModelFinalizing(IConventionModelBuilder modelBuilder, IConventionContext<IConventionModelBuilder> context)
    {
        foreach (var entityType in modelBuilder.Metadata.GetEntityTypes()
                     .Where(entityType => entityType.BaseType == null))
        {
            var discriminatorProperty = entityType.FindDiscriminatorProperty();
            if (discriminatorProperty != null
                && discriminatorProperty.ClrType == typeof(string))
            {
                discriminatorProperty.Builder.HasMaxLength(24);
            }
        }
    }
}
```

After building the model with this new convention, we find that the discriminator length is now configured correctly even though it has been customized:

```text
PostTypeDiscriminator (no field, string) Shadow Required AfterSave:Throw MaxLength(24)
```

We can go one step further and configure the max length to be the length of the longest discriminator value:

```csharp
public class DiscriminatorLengthConvention3 : IModelFinalizingConvention
{
    public void ProcessModelFinalizing(IConventionModelBuilder modelBuilder, IConventionContext<IConventionModelBuilder> context)
    {
        foreach (var entityType in modelBuilder.Metadata.GetEntityTypes()
                     .Where(entityType => entityType.BaseType == null))
        {
            var discriminatorProperty = entityType.FindDiscriminatorProperty();
            if (discriminatorProperty != null
                && discriminatorProperty.ClrType == typeof(string))
            {
                var maxDiscriminatorValueLength =
                    entityType.GetDerivedTypesInclusive().Select(e => ((string)e.GetDiscriminatorValue()!).Length).Max();

                discriminatorProperty.Builder.HasMaxLength(maxDiscriminatorValueLength);
            }
        }
    }
}
```

Now the discriminator column max length is 8, which is the length of "Featured", the longest discriminator value in use.

```text
PostTypeDiscriminator (no field, string) Shadow Required AfterSave:Throw MaxLength(8)
```

#### Example: Default length for all ```string``` properties

Let's look at another example where a finalizing convention can be used - setting a default maximum length for any ```string``` property. The convention looks quite similar to the previous example:

```csharp
public class MaxStringLengthConvention : IModelFinalizingConvention
{
    public void ProcessModelFinalizing(IConventionModelBuilder modelBuilder, IConventionContext<IConventionModelBuilder> context)
    {
        foreach (var property in modelBuilder.Metadata.GetEntityTypes()
                     .SelectMany(
                         entityType => entityType.GetDeclaredProperties()
                             .Where(
                                 property => property.ClrType == typeof(string))))
        {
            property.Builder.HasMaxLength(512);
        }
    }
}
```

In this post I'm going to show you how to implement a convention in ```Post```.

```text
EntityType: Post
  Properties:
    Id (int) Required PK AfterSave:Throw ValueGenerated.OnAdd
    AuthorId (no field, int?) Shadow FK Index
    BlogId (no field, int) Shadow Required FK Index
    Content (string) Required MaxLength(512)
    Discriminator (no field, string) Shadow Required AfterSave:Throw MaxLength(512)
    PublishedOn (DateTime) Required
    Title (string) Required MaxLength(512)
```

> Note
The same can be accomplished by pre-convention configuration, but using a convention allows to further filter applicable properties and for Data Annotations to override the configuration.

This example shows how to set the max length of a ```string``` to the max length of a discriminator property.

### Replacing an existing convention

This example shows how to replace an existing convention with a new one.

#### Example: Opt-in property mapping

This article describes how to change the property discovery convention in EF Core.

```csharp
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
public sealed class PersistAttribute : Attribute
{
}
```

Here is the new convention:

```csharp
public class AttributeBasedPropertyDiscoveryConvention : PropertyDiscoveryConvention
{
    public AttributeBasedPropertyDiscoveryConvention(ProviderConventionSetBuilderDependencies dependencies)
        : base(dependencies)
    {
    }

    public override void ProcessEntityTypeAdded(
        IConventionEntityTypeBuilder entityTypeBuilder,
        IConventionContext<IConventionEntityTypeBuilder> context)
        => Process(entityTypeBuilder);

    public override void ProcessEntityTypeBaseTypeChanged(
        IConventionEntityTypeBuilder entityTypeBuilder,
        IConventionEntityType? newBaseType,
        IConventionEntityType? oldBaseType,
        IConventionContext<IConventionEntityType> context)
    {
        if ((newBaseType == null
             || oldBaseType != null)
            && entityTypeBuilder.Metadata.BaseType == newBaseType)
        {
            Process(entityTypeBuilder);
        }
    }

    private void Process(IConventionEntityTypeBuilder entityTypeBuilder)
    {
        foreach (var memberInfo in GetRuntimeMembers())
        {
            if (Attribute.IsDefined(memberInfo, typeof(PersistAttribute), inherit: true))
            {
                entityTypeBuilder.Property(memberInfo);
            }
            else if (memberInfo is PropertyInfo propertyInfo
                     && Dependencies.TypeMappingSource.FindMapping(propertyInfo) != null)
            {
                entityTypeBuilder.Ignore(propertyInfo.Name);
            }
        }

        IEnumerable<MemberInfo> GetRuntimeMembers()
        {
            var clrType = entityTypeBuilder.Metadata.ClrType;

            foreach (var property in clrType.GetRuntimeProperties()
                         .Where(p => p.GetMethod != null && !p.GetMethod.IsStatic))
            {
                yield return property;
            }

            foreach (var property in clrType.GetRuntimeFields())
            {
                yield return property;
            }
        }
    }
}
```

> Tip
When replacing a built-in convention, the new convention implementation should inherit from the existing convention class. Note that some conventions have relational or provider-specific implementations, in which case the new convention implementation should inherit from the most specific existing convention class for the database provider in use.

The convention is then registered using the Replace method in ```ConfigureConventions```:

```csharp
protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
{
    configurationBuilder.Conventions.Replace<PropertyDiscoveryConvention>(
        serviceProvider => new AttributeBasedPropertyDiscoveryConvention(
            serviceProvider.GetRequiredService<ProviderConventionSetBuilderDependencies>()));
}
```

> Tip
This is a case where the existing convention has dependencies, represented by the ```ProviderConventionSetBuilderDependencies``` dependency object. These are obtained from the internal service provider using ```GetRequiredService``` and passed to the convention constructor.

Notice that this convention allows fields to be mapped (in addition to properties) so long as they are marked with ```[Persist]```. This means we can use private fields as hidden keys in the model.

For example, consider the following entity types:

```csharp
public class LaundryBasket
{
    [Persist]
    [Key]
    private readonly int _id;

    [Persist]
    public int TenantId { get; init; }

    public bool IsClean { get; set; }

    public List<Garment> Garments { get; } = new();
}

public class Garment
{
    public Garment(string name, string color)
    {
        Name = name;
        Color = color;
    }

    [Persist]
    [Key]
    private readonly int _id;

    [Persist]
    public int TenantId { get; init; }

    [Persist]
    public string Name { get; }

    [Persist]
    public string Color { get; }

    public bool IsClean { get; set; }

    public LaundryBasket? Basket { get; set; }
}
```

The model built from these entity types is:

```text
Model:
  EntityType: Garment
    Properties:
      _id (_id, int) Required PK AfterSave:Throw ValueGenerated.OnAdd
      Basket_id (no field, int?) Shadow FK Index
      Color (string) Required
      Name (string) Required
      TenantId (int) Required
    Navigations:
      Basket (LaundryBasket) ToPrincipal LaundryBasket Inverse: Garments
    Keys:
      _id PK
    Foreign keys:
      Garment {'Basket_id'} -> LaundryBasket {'_id'} ToDependent: Garments ToPrincipal: Basket ClientSetNull
    Indexes:
      Basket_id
  EntityType: LaundryBasket
    Properties:
      _id (_id, int) Required PK AfterSave:Throw ValueGenerated.OnAdd
      TenantId (int) Required
    Navigations:
      Garments (List<Garment>) Collection ToDependent Garment Inverse: Basket
    Keys:
      _id PK
```

Normally, ```IsClean``` would have been mapped, but since it is not marked with ```[Persist]```, it is now treated as an un-mapped property.

> Tip
This convention could not be implemented as a model finalizing convention because there are existing model finalizing conventions that need to run after the property is mapped to further configure it.

### Conventions implementation considerations

EF Core keeps track of how every piece of configuration was made. This is represented by the ```ConfigurationSource``` enum. The different kinds of configuration are:

- ```Explicit```: The model element was explicitly configured in ```OnModelCreating```

- ```DataAnnotation```: The model element was configured using a mapping attribute (aka data annotation) on the CLR type

- ```Convention```: The model element was configured by a model building convention

Conventions should never override configuration marked as DataConvention or ```Explicit```.

```csharp
property.Builder.HasMaxLength(512);
```

Calling ```HasMaxLength``` on the convention builder will only set the max length if it was not already configured by a mapping attribute or in ```OnModelCreating```.

Builder methods like this also have a second parameter: ```fromDataAnnotation```. Set this to ```true``` if the convention is making the configuration on behalf of a mapping attribute. For example:

```csharp
property.Builder.HasMaxLength(512, fromDataAnnotation: true);
```

This sets the ```ConfigurationSource``` to ```DataAnnotation```, which means that the value can now be overridden by explicit mapping on ```OnModelCreating```, but not by non-mapping attribute conventions.

If the current configuration can't be overridden then the method will return ```null```, this needs to be accounted for if you need to perform further configuration:

```csharp
property.Builder.HasMaxLength(512)?.IsUnicode(false);
```

The maximum length of a facet can be set by calling CanSetCanLength.

```csharp
public class MaxStringLengthNonUnicodeConvention : IModelFinalizingConvention
{
    public void ProcessModelFinalizing(IConventionModelBuilder modelBuilder, IConventionContext<IConventionModelBuilder> context)
    {
        foreach (var property in modelBuilder.Metadata.GetEntityTypes()
                     .SelectMany(
                         entityType => entityType.GetDeclaredProperties()
                             .Where(
                                 property => property.ClrType == typeof(string))))
        {
            var propertyBuilder = property.Builder;
            if (propertyBuilder.CanSetMaxLength(512)
                && propertyBuilder.CanSetIsUnicode(false))
            {
                propertyBuilder.HasMaxLength(512)!.IsUnicode(false);
            }
        }
    }
}
```

Here we can be sure that the call to ```HasMaxLength``` will not return ```null```. It is still recommended to use the builder instance returned from ```HasMaxLength``` as it might be different from ```propertyBuilder```.

> Note
Other conventions are not triggered immediately after a convention makes a change, they are delayed until all conventions have finished processing the current change.

### ```IConventionContext```

All convention methods also have an ```IConventionContext<TMetadata>``` parameter. It provides methods that could be useful in some specific cases.

#### Example: ```NotMappedAttribute``` convention

This convention looks for ```NotMappedAttribute``` on a type that is added to the model and tries to remove that type from the model.

```csharp
public virtual void ProcessEntityTypeAdded(
    IConventionEntityTypeBuilder entityTypeBuilder,
    IConventionContext<IConventionEntityTypeBuilder> context)
{
    var type = entityTypeBuilder.Metadata.ClrType;
    if (!Attribute.IsDefined(type, typeof(NotMappedAttribute), inherit: true))
    {
        return;
    }

    if (entityTypeBuilder.ModelBuilder.Ignore(entityTypeBuilder.Metadata.Name, fromDataAnnotation: true) != null)
    {
        context.StopProcessing();
    }
}
```

### ```IConventionModel```

The ```IMutableModel``` API exposes methods that allow you to iterate over and apply common configuration to the model.

> Caution
It is advised to always perform configuration by calling methods on the builder exposed as the Builder property, because the builders check whether the given configuration would override something that was already specified using Fluent API or Data Annotations.

## When to use each approach for bulk configuration

Use ```Metadata``` API when:

- The configuration needs to be applied at a certain time and not react to later changes in the model.

- The model building speed is very important. ```Metadata``` API has fewer safety checks and thus can be slightly faster than other approaches, however using a Compiled model would yield even better startup times.

Use Pre-convention model configuration when:

- The applicability condition is simple as it only depends on the type.

- The configuration needs to be applied at any point a property of the given type is added in the model and overrides Data Annotations and conventions

Use Finalizing Conventions when:

- The applicability condition is complex.

- The configuration shouldn't override what is specified by Data Annotations.

Use Interactive Conventions when:

- Multiple conventions depend on each other. Finalizing conventions run in the order they were added and therefore can't react to changes made by later finalizing conventions.

- The logic is shared between several contexts. Interactive conventions are safer than other approaches.

Ref: [Model bulk configuration](https://learn.microsoft.com/en-us/ef/core/modeling/bulk-configuration)