---
title: Entity Framework - Entity Framework Core - Create a model - Alternating models with same DbContext
published: true
date: 2024-07-25 03:07:39
tags: EFCore, Summary
description: The model built in OnModelCreating can use a property on the context to change how the model is built. For example, suppose you wanted to configure an entity differently based on some property:
image:
---

## In this article

The model built in ```OnModelCreating``` can use a property on the context to change how the model is built. For example, suppose you wanted to configure an entity differently based on some property:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    if (UseIntProperty)
    {
        modelBuilder.Entity<ConfigurableEntity>().Ignore(e => e.StringProperty);
    }
    else
    {
        modelBuilder.Entity<ConfigurableEntity>().Ignore(e => e.IntProperty);
    }
}
```

In this post I'll show you how to use the ```OnModelCreating``` mechanism to make EF aware of the property producing different models.

## ```IModelCacheKeyFactory```

This example shows how to use the ```IModelCacheKeyFactory``` service to cache models.

The following implementation takes the ```UseIntProperty``` into account when producing a model cache key:

```csharp
public class DynamicModelCacheKeyFactory : IModelCacheKeyFactory
{
    public object Create(DbContext context, bool designTime)
        => context is DynamicContext dynamicContext
            ? (context.GetType(), dynamicContext.UseIntProperty, designTime)
            : (object)context.GetType();
}
```

You also have to implement the overload of the Create method that also handles design-time model caching. As in the following example:

```csharp
public class DynamicModelCacheKeyFactoryDesignTimeSupport : IModelCacheKeyFactory
{
    public object Create(DbContext context, bool designTime)
        => context is DynamicContext dynamicContext
            ? (context.GetType(), dynamicContext.UseIntProperty, designTime)
            : (object)context.GetType();

    public object Create(DbContext context)
        => Create(context, false);
}
```

Finally, register your new ```IModelCacheKeyFactory``` in your context's ```OnConfiguring```:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder
        .UseInMemoryDatabase("DynamicContext")
        .ReplaceService<IModelCacheKeyFactory, DynamicModelCacheKeyFactory>();
```

See the full sample project for more context.

Ref: [Alternating between multiple models with the same DbContext type](https://learn.microsoft.com/en-us/ef/core/modeling/dynamic-model)