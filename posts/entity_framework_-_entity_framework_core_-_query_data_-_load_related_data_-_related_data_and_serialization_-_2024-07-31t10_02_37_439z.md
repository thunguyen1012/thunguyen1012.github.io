---
title: Entity Framework - Entity Framework Core - Query data - Load related data - Related data and serialization
published: true
date: 2024-07-31 10:02:37
tags: EFCore, Summary
description: In this article, I'm going to show you how to create a nested object graph using EF Core.
image:
---

## In this article

In this article, I'm going to show you how to create a nested object graph using EF Core.

Some serialization frameworks don't allow such cycles. For example, ```Json.NET``` will throw the following exception if a cycle is found.

System.Text.Json will throw a similar exception if a cycle is found.

If you're using Json.NET in ASP.NET Core, you can configure ```Json.NET``` to ignore cycles that it finds in the object graph. This configuration is done in the ConfigureServices(...) method in ```Startup.cs```.

```csharp
public void ConfigureServices(IServiceCollection services)
{
    ...

    services.AddMvc()
        .AddJsonOptions(
            options => options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
        );

    ...
}
```

If you're using ```System.Text.Json```, you can configure it like this.

```csharp
public void ConfigureServices(IServiceCollection services)
{
    ...

    services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        });

    ...
}
```

If you're serializing a text file, you can use the ```[Text.Json]``` attribute in the System.Text.Json to ignore the text in the file while serializing.

Ref: [Related data and serialization](https://learn.microsoft.com/en-us/ef/core/querying/related-data/serialization)