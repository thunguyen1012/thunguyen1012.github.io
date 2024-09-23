---
title: Security and Identity - Data protection - Implementation - Key storage providers
published: true
date: 2024-09-20 02:55:24
tags: Summary, AspNetCore
description: The data protection system employs a discovery mechanism by default to determine where cryptographic keys should be persisted. The developer can override the default discovery mechanism and manually specify the location.
image:
---

## In this article

This example shows how to set up a data protection system with a single line of code.

> Warning
If you specify an explicit key persistence location, the data protection system deregisters the default key encryption at rest mechanism, so keys are no longer encrypted at rest. It's recommended that you additionally specify an explicit key encryption mechanism for production deployments.

## File system

To configure a file system-based key repository, call the PersistKeysToFileSystem configuration routine as shown below. Provide a ```DirectoryInfo``` pointing to the repository where keys should be stored:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddDataProtection()
        .PersistKeysToFileSystem(new DirectoryInfo(@"c:\temp-keys\"));
}
```

The ```DirectoryInfo``` can point to a directory on the local machine, or it can point to a folder on a network share. If pointing to a directory on the local machine (and the scenario is that only apps on the local machine require access to use this repository), consider using Windows DPAPI (on Windows) to encrypt the keys at rest. Otherwise, consider using an X.509 certificate to encrypt keys at rest.

## Azure Storage

Microsoft has released a new data protection package for its Azure platform.

To configure the Azure Blob Storage provider, call one of the PersistKeysToAzureBlobStorage overloads.

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddDataProtection()
        .PersistKeysToAzureBlobStorage(new Uri("<blob URI including SAS token>"));
}
```

If the web app is running as an Azure service, connection ```string``` can be used to authenticate to Azure storage by using Azure.Storage.Blobs.

```csharp
string connectionString = "<connection_string>";
string containerName = "my-key-container";
string blobName = "keys.xml";
BlobContainerClient container = new BlobContainerClient(connectionString, containerName);

// optional - provision the container automatically
await container.CreateIfNotExistsAsync();

BlobClient blobClient = container.GetBlobClient(blobName);

services.AddDataProtection()
    .PersistKeysToAzureBlobStorage(blobClient);
```

> Note
The connection ```string``` to your storage account can be found in the Azure Portal under the "Access Keys" section or by running the following CLI command:

```bash
az storage account show-connection-string --name <account_name> --resource-group <resource_group>
```

## Redis

```csharp
public void ConfigureServices(IServiceCollection services)
{
    var redis = ConnectionMultiplexer.Connect("<URI>");
    services.AddDataProtection()
        .PersistKeysToStackExchangeRedis(redis, "DataProtection-Keys");
}
```

For more information, see the following topics:

- StackExchange.Redis ConnectionMultiplexer

- Azure Redis Cache

- ASP.NET Core DataProtection samples

## Registry

Only applies to Windows deployments.

Sometimes the app might not have write access to the file system. Consider a scenario where an app is running as a virtual service account (such as w3wp.exe's app pool identity). In these cases, the administrator can provision a registry key that's accessible by the service account identity. Call the PersistKeysToRegistry extension method as shown below. Provide a RegistryKey pointing to the location where cryptographic keys should be stored:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddDataProtection()
        .PersistKeysToRegistry(Registry.CurrentUser.OpenSubKey(@"SOFTWARE\Sample\keys", true));
}
```

> Important
We recommend using Windows DPAPI to encrypt the keys at rest.

## Entity Framework Core

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.Configure<CookiePolicyOptions>(options =>
    {
        options.CheckConsentNeeded = context => true;
        options.MinimumSameSitePolicy = SameSiteMode.None;
    });

    services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(
            Configuration.GetConnectionString("DefaultConnection")));

    // Add a DbContext to store your Database Keys
    services.AddDbContext<MyKeysContext>(options =>
        options.UseSqlServer(
            Configuration.GetConnectionString("MyKeysConnection")));

    // using Microsoft.AspNetCore.DataProtection;
    services.AddDataProtection()
        .PersistKeysToDbContext<MyKeysContext>();

    services.AddDefaultIdentity<IdentityUser>()
        .AddDefaultUI(UIFramework.Bootstrap4)
        .AddEntityFrameworkStores<ApplicationDbContext>();
    services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);
}
```

```csharp
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WebApp1.Data;

namespace WebApp1
{
    class MyKeysContext : DbContext, IDataProtectionKeyContext
    {
        // A recommended constructor overload when using EF Core 
        // with dependency injection.
        public MyKeysContext(DbContextOptions<MyKeysContext> options) 
            : base(options) { }

        // This maps to the table that stores keys.
        public DbSet<DataProtectionKey> DataProtectionKeys { get; set; }
    }
}
```

  - Visual Studio

  - .NET CLI

```powershell
Add-Migration AddDataProtectionKeys -Context MyKeysContext
Update-Database -Context MyKeysContext
```

```dotnetcli
dotnet ef migrations add AddDataProtectionKeys --context MyKeysContext
dotnet ef database update --context MyKeysContext
```

<table><thead>
<tr>
<th>Property/Field</th>
<th>CLR Type</th>
<th>SQL Type</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>Id</code></td>
<td><code>int</code></td>
<td><code>int</code>, PK, <code>IDENTITY(1,1)</code>, not null</td>
</tr>
<tr>
<td><code>FriendlyName</code></td>
<td><code>string</code></td>
<td><code>nvarchar(MAX)</code>, null</td>
</tr>
<tr>
<td><code>Xml</code></td>
<td><code>string</code></td>
<td><code>nvarchar(MAX)</code>, null</td>
</tr>
</tbody></table>

## Custom key repository

If the in-box mechanisms aren't appropriate, the developer can specify their own key persistence mechanism by providing a custom IXmlRepository.

Ref: [Key storage providers in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/implementation/key-storage-providers?view=aspnetcore-8.0)