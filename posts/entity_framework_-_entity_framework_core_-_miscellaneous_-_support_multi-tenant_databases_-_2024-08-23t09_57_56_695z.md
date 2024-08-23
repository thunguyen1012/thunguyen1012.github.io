---
title: Entity Framework - Entity Framework Core - Miscellaneous - Support multi-tenant databases
published: true
date: 2024-08-23 09:57:56
tags: Summary, EFCore
description: Many line of business applications are designed to work with multiple customers. It is important to secure the data so that customer data isn't "leaked" or seen by other customers and potential competitors. These applications are classified as "multi-tenant" because each customer is considered a tenant of the application with their own set of data.
image:
---

## In this article

A multi-tenant application is an application designed to work with multiple customers.

> Important
This document provides examples and solutions "as is." These are not intended to be "best practices" but rather "working practices" for your consideration.

> Tip
You can view the source code for this sample on GitHub

## Supporting multi-tenancy

Multi-tenancy is the practice of keeping data for more than one customer in a database.

<table><thead>
<tr>
<th style="text-align: center;">Approach</th>
<th style="text-align: center;">Column for Tenant?</th>
<th style="text-align: center;">Schema per Tenant?</th>
<th style="text-align: center;">Multiple Databases?</th>
<th style="text-align: center;">EF Core Support</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: center;">Discriminator (column)</td>
<td style="text-align: center;">Yes</td>
<td style="text-align: center;">No</td>
<td style="text-align: center;">No</td>
<td style="text-align: center;">Global query filter</td>
</tr>
<tr>
<td style="text-align: center;">Database per tenant</td>
<td style="text-align: center;">No</td>
<td style="text-align: center;">No</td>
<td style="text-align: center;">Yes</td>
<td style="text-align: center;">Configuration</td>
</tr>
<tr>
<td style="text-align: center;">Schema per tenant</td>
<td style="text-align: center;">No</td>
<td style="text-align: center;">Yes</td>
<td style="text-align: center;">No</td>
<td style="text-align: center;">Not supported</td>
</tr>
</tbody></table>

In our series of articles on how to use Apache Struts, we look at two approaches to Struts: database-per-tenant and database-per-tenant.

These examples should work fine in most app models, including console, WPF, WinForms, and ASP.NET Core apps. Blazor Server apps require special consideration.

### Blazor Server apps and the life of the factory

The recommended pattern for using Entity Framework Core in Blazor apps is to register the ```DbContextFactory```, then call it to create a new instance of the ```DbContext``` each operation. By default, the factory is a singleton so only one copy exists for all users of the application. This is usually fine because although the factory is shared, the individual ```DbContext``` instances are not.

For multi-tenancy, however, the connection string may change per user. Because the factory caches the configuration with the same lifetime, this means all users must share the same configuration. Therefore, the lifetime should be changed to ```Scoped```.

In Blazor Server apps, a singleton cannot be scoped to the user.

## An example solution (single database)

A possible solution is to create a simple ```ITenantService``` service that handles setting the user's current tenant. It provides callbacks so code is notified when the tenant changes. The implementation (with the callbacks omitted for clarity) might look like this:

```csharp
namespace Common
{
    public interface ITenantService
    {
        string Tenant { get; }

        void SetTenant(string tenant);

        string[] GetTenants();

        event TenantChangedEventHandler OnTenantChanged;
    }
}
```

The ```DbContext``` can then manage the multi-tenancy. The approach depends on your database strategy. If you are storing all tenants in a single database, you are likely going to use a query filter. The ```ITenantService``` is passed to the constructor via dependency injection and used to resolve and store the tenant identifier.

```csharp
public ContactContext(
    DbContextOptions<ContactContext> opts,
    ITenantService service)
    : base(opts) => _tenant = service.Tenant;
```

The ```OnModelCreating``` method is overridden to specify the query filter:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
    => modelBuilder.Entity<MultitenantContact>()
        .HasQueryFilter(mt => mt.Tenant == _tenant);
```

This ensures that every query is filtered to the tenant on every request. There is no need to filter in application code because the global filter will be automatically applied.

The tenant provider and ```DbContextFactory``` are configured in the application startup like this, using Sqlite as an example:

```csharp
builder.Services.AddDbContextFactory<ContactContext>(
    opt => opt.UseSqlite("Data Source=singledb.sqlite"), ServiceLifetime.Scoped);
```

Notice that the service lifetime is configured with ```ServiceLifetime.Scoped```. This enables it to take a dependency on the tenant provider.

> Note
Dependencies must always flow towards the singleton. That means a ```Scoped``` service can depend on another ```Scoped``` service or a ```Singleton``` service, but a ```Singleton``` service can only depend on other ```Singleton``` services: ```Transient => Scoped => Singleton```.

## Multiple schemas

> Warning
This scenario is not directly supported by EF Core and is not a recommended solution.

In a different approach, the same database may handle ```tenant1``` and ```tenant2``` by using table schemas.

- Tenant1 - ```tenant1.CustomerData```

- Tenant2 - ```tenant2.CustomerData```

If you are not using EF Core to handle database updates with migrations and already have multi-schema tables, you can override the schema in a ```DbContext``` in ```OnModelCreating``` like this (the schema for table ```CustomerData``` is set to the tenant):

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder) =>
    modelBuilder.Entity<CustomerData>().ToTable(nameof(CustomerData), tenant);
```

## Multiple databases and connection strings

The multiple database version is implemented by passing a different connection string for each tenant. This can be configured at startup by resolving the service provider and using it to build the connection string. A connection string by tenant section is added to the ```appsettings.json``` configuration file.

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "TenantA": "Data Source=tenantacontacts.sqlite",
    "TenantB": "Data Source=tenantbcontacts.sqlite"
  },
  "AllowedHosts": "*"
}
```

The service and configuration are both injected into the ```DbContext```:

```csharp
public ContactContext(
    DbContextOptions<ContactContext> opts,
    IConfiguration config,
    ITenantService service)
    : base(opts)
{
    _tenantService = service;
    _configuration = config;
}
```

The tenant is then used to look up the connection string in ```OnConfiguring```:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
{
    var tenant = _tenantService.Tenant;
    var connectionStr = _configuration.GetConnectionString(tenant);
    optionsBuilder.UseSqlite(connectionStr);
}
```

This works fine for most scenarios unless the user can switch tenants during the same session.

### Switching tenants

In the previous configuration for multiple databases, the options are cached at the ```Scoped``` level. This means that if the user changes the tenant, the options are not reevaluated and so the tenant change isn't reflected in queries.

The easy solution for this when the tenant can change is to set the lifetime to ```Transient```. This ensures the tenant is re-evaluated along with the connection string each time a ```DbContext``` is requested. The user can switch tenants as often as they like. The following table helps you choose which lifetime makes the most sense for your factory.

<table><thead>
<tr>
<th style="text-align: left;"><strong>Scenario</strong></th>
<th style="text-align: left;"><strong>Single database</strong></th>
<th style="text-align: left;"><strong>Multiple databases</strong></th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;"><em>User stays in a single tenant</em></td>
<td style="text-align: left;"><code>Scoped</code></td>
<td style="text-align: left;"><code>Scoped</code></td>
</tr>
<tr>
<td style="text-align: left;"><em>User can switch tenants</em></td>
<td style="text-align: left;"><code>Scoped</code></td>
<td style="text-align: left;"><code>Transient</code></td>
</tr>
</tbody></table>

The default of ```Singleton``` still makes sense if your database does not take on user-scoped dependencies.

## Performance notes

EF Core was designed so that ```DbContext``` instances can be instantiated quickly with as little overhead as possible. For that reason, creating a new ```DbContext``` per operation should usually be fine. If this approach is impacting the performance of your application, consider using ```DbContext``` pooling.

## Conclusion

This is working guidance for implementing multi-tenancy in EF Core apps. If you have further examples or scenarios or wish to provide feedback, please open an issue and reference this document.

Ref: [Multi-tenancy](https://learn.microsoft.com/en-us/ef/core/miscellaneous/multitenancy)