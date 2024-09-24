---
title: Advanced - Custom model binding
published: true
date: 2024-09-24 04:35:52
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## Default model binder limitations

## Model binding simple and complex types

### Working with the ```ByteArrayModelBinder```

```csharp
public IModelBinder GetBinder(ModelBinderProviderContext context)
{
    if (context == null)
    {
        throw new ArgumentNullException(nameof(context));
    }

    if (context.Metadata.ModelType == typeof(byte[]))
    {
        var loggerFactory = context.Services.GetRequiredService<ILoggerFactory>();
        return new ByteArrayModelBinder(loggerFactory);
    }

    return null;
}
```

```csharp
[HttpPost]
public void Post([FromForm] byte[] file, string filename)
{
    // Don't trust the file name sent by the client. Use
    // Path.GetRandomFileName to generate a safe random
    // file name. _targetFilePath receives a value
    // from configuration (the appsettings.json file in
    // the sample app).
    var trustedFileName = Path.GetRandomFileName();
    var filePath = Path.Combine(_targetFilePath, trustedFileName);

    if (System.IO.File.Exists(filePath))
    {
        return;
    }

    System.IO.File.WriteAllBytes(filePath, file);
}
```

```csharp
[HttpPost("Profile")]
public void SaveProfile([FromForm] ProfileViewModel model)
{
    // Don't trust the file name sent by the client. Use
    // Path.GetRandomFileName to generate a safe random
    // file name. _targetFilePath receives a value
    // from configuration (the appsettings.json file in
    // the sample app).
    var trustedFileName = Path.GetRandomFileName();
    var filePath = Path.Combine(_targetFilePath, trustedFileName);

    if (System.IO.File.Exists(filePath))
    {
        return;
    }

    System.IO.File.WriteAllBytes(filePath, model.File);
}

public class ProfileViewModel
{
    public byte[] File { get; set; }
    public string FileName { get; set; }
}
```

## Custom model binder sample

 - Converts incoming request data into strongly typed key arguments.

 - Uses Entity Framework Core to fetch the associated entity.

 - Passes the associated entity as an argument to the action method.

```csharp
using CustomModelBindingSample.Binders;
using Microsoft.AspNetCore.Mvc;

namespace CustomModelBindingSample.Data
{
    [ModelBinder(BinderType = typeof(AuthorEntityBinder))]
    public class Author
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string GitHub { get; set; }
        public string Twitter { get; set; }
        public string BlogUrl { get; set; }
    }
}
```

```csharp
public class AuthorEntityBinder : IModelBinder
{
    private readonly AuthorContext _context;

    public AuthorEntityBinder(AuthorContext context)
    {
        _context = context;
    }

    public Task BindModelAsync(ModelBindingContext bindingContext)
    {
        if (bindingContext == null)
        {
            throw new ArgumentNullException(nameof(bindingContext));
        }

        var modelName = bindingContext.ModelName;

        // Try to fetch the value of the argument by name
        var valueProviderResult = bindingContext.ValueProvider.GetValue(modelName);

        if (valueProviderResult == ValueProviderResult.None)
        {
            return Task.CompletedTask;
        }

        bindingContext.ModelState.SetModelValue(modelName, valueProviderResult);

        var value = valueProviderResult.FirstValue;

        // Check if the argument value is null or empty
        if (string.IsNullOrEmpty(value))
        {
            return Task.CompletedTask;
        }

        if (!int.TryParse(value, out var id))
        {
            // Non-integer arguments result in model state errors
            bindingContext.ModelState.TryAddModelError(
                modelName, "Author Id must be an integer.");

            return Task.CompletedTask;
        }

        // Model will be null if not found, including for
        // out of range id values (0, -3, etc.)
        var model = _context.Authors.Find(id);
        bindingContext.Result = ModelBindingResult.Success(model);
        return Task.CompletedTask;
    }
}
```

> Note
The preceding ```AuthorEntityBinder``` class is intended to illustrate a custom model binder. The class isn't intended to illustrate best practices for a lookup scenario. For lookup, bind the ```authorId``` and query the database in an action method. This approach separates model binding failures from ```NotFound``` cases.

```csharp
[HttpGet("get/{author}")]
public IActionResult Get(Author author)
{
    if (author == null)
    {
        return NotFound();
    }

    return Ok(author);
}
```

```csharp
[HttpGet("{id}")]
public IActionResult GetById([ModelBinder(Name = "id")] Author author)
{
    if (author == null)
    {
        return NotFound();
    }

    return Ok(author);
}
```

### Implementing a ModelBinderProvider

```csharp
using CustomModelBindingSample.Data;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ModelBinding.Binders;
using System;

namespace CustomModelBindingSample.Binders
{
    public class AuthorEntityBinderProvider : IModelBinderProvider
    {
        public IModelBinder GetBinder(ModelBinderProviderContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            if (context.Metadata.ModelType == typeof(Author))
            {
                return new BinderTypeModelBinder(typeof(AuthorEntityBinder));
            }

            return null;
        }
    }
}
```

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddDbContext<AuthorContext>(options => options.UseInMemoryDatabase("Authors"));

    services.AddControllers(options =>
    {
        options.ModelBinderProviders.Insert(0, new AuthorEntityBinderProvider());
    });
}
```

### Polymorphic model binding

 - Isn't typical for a REST API that's designed to interoperate with all languages.

 - Makes it difficult to reason about the bound models.

```csharp
public abstract class Device
{
    public string Kind { get; set; }
}

public class Laptop : Device
{
    public string CPUIndex { get; set; }
}

public class SmartPhone : Device
{
    public string ScreenSize { get; set; }
}

public class DeviceModelBinderProvider : IModelBinderProvider
{
    public IModelBinder GetBinder(ModelBinderProviderContext context)
    {
        if (context.Metadata.ModelType != typeof(Device))
        {
            return null;
        }

        var subclasses = new[] { typeof(Laptop), typeof(SmartPhone), };

        var binders = new Dictionary<Type, (ModelMetadata, IModelBinder)>();
        foreach (var type in subclasses)
        {
            var modelMetadata = context.MetadataProvider.GetMetadataForType(type);
            binders[type] = (modelMetadata, context.CreateBinder(modelMetadata));
        }

        return new DeviceModelBinder(binders);
    }
}

public class DeviceModelBinder : IModelBinder
{
    private Dictionary<Type, (ModelMetadata, IModelBinder)> binders;

    public DeviceModelBinder(Dictionary<Type, (ModelMetadata, IModelBinder)> binders)
    {
        this.binders = binders;
    }

    public async Task BindModelAsync(ModelBindingContext bindingContext)
    {
        var modelKindName = ModelNames.CreatePropertyModelName(bindingContext.ModelName, nameof(Device.Kind));
        var modelTypeValue = bindingContext.ValueProvider.GetValue(modelKindName).FirstValue;

        IModelBinder modelBinder;
        ModelMetadata modelMetadata;
        if (modelTypeValue == "Laptop")
        {
            (modelMetadata, modelBinder) = binders[typeof(Laptop)];
        }
        else if (modelTypeValue == "SmartPhone")
        {
            (modelMetadata, modelBinder) = binders[typeof(SmartPhone)];
        }
        else
        {
            bindingContext.Result = ModelBindingResult.Failed();
            return;
        }

        var newBindingContext = DefaultModelBindingContext.CreateBindingContext(
            bindingContext.ActionContext,
            bindingContext.ValueProvider,
            modelMetadata,
            bindingInfo: null,
            bindingContext.ModelName);

        await modelBinder.BindModelAsync(newBindingContext);
        bindingContext.Result = newBindingContext.Result;

        if (newBindingContext.Result.IsModelSet)
        {
            // Setting the ValidationState ensures properties on derived types are correctly 
            bindingContext.ValidationState[newBindingContext.Result.Model] = new ValidationStateEntry
            {
                Metadata = modelMetadata,
            };
        }
    }
}
```

## Recommendations and best practices

 - Shouldn't attempt to set status codes or return results (for example, 404 Not Found). If model binding fails, an action filter or logic within the action method itself should handle the failure.

 - Are most useful for eliminating repetitive code and cross-cutting concerns from action methods.

 - Typically shouldn't be used to convert a ```string``` into a custom type, a ```TypeConverter``` is usually a better option.

Ref: [Custom Model Binding in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/mvc/advanced/custom-model-binding?view=aspnetcore-8.0)