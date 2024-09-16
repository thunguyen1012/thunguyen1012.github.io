---
title: Security and Identity - Data protection - Data protection APIs
published: true
date: 2024-09-16 06:58:11
tags: Summary, AspNetCore
description: Basically, protecting data consists of the following steps:
image:
---

## In this article



Basically, protecting data consists of the following steps:

- Create a data protector from a data protection provider.

- Call the ```Protect``` method with the data you want to protect.

- Call the ```Unprotect``` method with the data you want to turn back into plain text.

In this article, I will show you how to add a data protection system to a service container.

- Configuring a service container for dependency injection and registering the data protection stack.

- Receiving the data protection provider via DI.

- Creating a protector.

- Protecting then unprotecting data.

```csharp
using System;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.DependencyInjection;

public class Program
{
    public static void Main(string[] args)
    {
        // add data protection services
        var serviceCollection = new ServiceCollection();
        serviceCollection.AddDataProtection();
        var services = serviceCollection.BuildServiceProvider();

        // create an instance of MyClass using the service provider
        var instance = ActivatorUtilities.CreateInstance<MyClass>(services);
        instance.RunSample();
    }

    public class MyClass
    {
        IDataProtector _protector;

        // the 'provider' parameter is provided by DI
        public MyClass(IDataProtectionProvider provider)
        {
            _protector = provider.CreateProtector("Contoso.MyClass.v1");
        }

        public void RunSample()
        {
            Console.Write("Enter input: ");
            string input = Console.ReadLine();

            // protect the payload
            string protectedPayload = _protector.Protect(input);
            Console.WriteLine($"Protect returned: {protectedPayload}");

            // unprotect the payload
            string unprotectedPayload = _protector.Unprotect(protectedPayload);
            Console.WriteLine($"Unprotect returned: {unprotectedPayload}");
        }
    }
}

/*
 * SAMPLE OUTPUT
 *
 * Enter input: Hello world!
 * Protect returned: CfDJ8ICcgQwZZhlAlTZT...OdfH66i1PnGmpCR5e441xQ
 * Unprotect returned: Hello world!
 */
```

This example shows how to define a purpose string for a data protector.

> Tip
Instances of ```IDataProtectionProvider``` and ```IDataProtector``` are thread-safe for multiple callers. It's intended that once a component gets a reference to an ```IDataProtector``` via a call to ```CreateProtector```, it will use that reference for multiple calls to ```Protect``` and ```Unprotect```.
A call to ```Unprotect``` will throw CryptographicException if the protected payload cannot be verified or deciphered. Some components may wish to ignore errors during unprotect operations; a component which reads authentication cookies might handle this error and treat the request as if it had no cookie at all rather than fail the request outright. Components which want this behavior should specifically catch CryptographicException instead of swallowing all exceptions.



## Use AddOptions to configure custom repository

Consider the following code which uses a service provider because the implementation of ```IXmlRepository``` has a dependency on a singleton service:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // ...

    var sp = services.BuildServiceProvider();
    services.AddDataProtection()
      .AddKeyManagementOptions(o => o.XmlRepository = sp.GetService<IXmlRepository>());
}
```

The preceding code logs the following warning:

In our series of letters from African journalists, film-maker and columnist Farai Sevenzo looks at some of the issues that matter to him.

The following code provides the ```IXmlRepository``` implementation without having to build the service provider and therefore making additional copies of singleton services:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddDbContext<DataProtectionDbContext>(options =>
        options.UseSqlServer(
            Configuration.GetConnectionString("DefaultConnection")));

    // Register XmlRepository for data protection.
    services.AddOptions<KeyManagementOptions>()
    .Configure<IServiceScopeFactory>((options, factory) =>
    {
        options.XmlRepository = new CustomXmlRepository(factory);
    });

    services.AddRazorPages();
}
```

The preceding code removes the call to ```GetService``` and hides IConfigureOptions<T>.

The following code shows the custom XML repository:

```csharp
using CustomXMLrepo.Data;
using Microsoft.AspNetCore.DataProtection.Repositories;
using Microsoft.Extensions.DependencyInjection;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;

public class CustomXmlRepository : IXmlRepository
{
    private readonly IServiceScopeFactory factory;

    public CustomXmlRepository(IServiceScopeFactory factory)
    {
        this.factory = factory;
    }

    public IReadOnlyCollection<XElement> GetAllElements()
    {
        using (var scope = factory.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<DataProtectionDbContext>();
            var keys = context.XmlKeys.ToList()
                .Select(x => XElement.Parse(x.Xml))
                .ToList();
            return keys;
        }
    }

    public void StoreElement(XElement element, string friendlyName)
    {
        var key = new XmlKey
        {
            Xml = element.ToString(SaveOptions.DisableFormatting)
        };

        using (var scope = factory.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<DataProtectionDbContext>();
            context.XmlKeys.Add(key);
            context.SaveChanges();
        }
    }
}
```

The following code shows the XmlKey class:

```csharp
public class XmlKey
{
    public Guid Id { get; set; }
    public string Xml { get; set; }

    public XmlKey()
    {
        this.Id = Guid.NewGuid();
    }
}
```

Ref: [Get started with the Data Protection APIs in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/using-data-protection?view=aspnetcore-8.0)