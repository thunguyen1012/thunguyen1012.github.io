---
title: Security and Identity - Data protection - Configuration - Configure data protection
published: true
date: 2024-09-19 10:36:01
tags: Summary, AspNetCore
description: 
image:
---

## In this article

 - The app is spread across multiple machines.

 - For compliance reasons.

> Warning
Similar to configuration files, the data protection key ring should be protected using appropriate permissions. You can choose to encrypt keys at rest, but this doesn't prevent attackers from creating new keys. Consequently, your app's security is impacted. The storage location configured with Data Protection should have its access limited to the app itself, similar to the way you would protect configuration files. For example, if you choose to store your key ring on disk, use file system permissions. Ensure only the identity under which your web app runs has read, write, and create access to that directory. If you use Azure Blob Storage, only the web app should have the ability to read, write, or create new entries in the blob store, etc.
The extension method AddDataProtection returns an ```IDataProtectionBuilder```. ```IDataProtectionBuilder``` exposes extension methods that you can chain together to configure Data Protection options.

> Note
This article was written for an app that runs within a docker container. In a docker container the app always has the same path and, therefore, the same application discriminator. Apps that need to run in multiple environments (e.g. local and deployed), must set the default application discriminator for the environment.
Running an app in multiple environments is beyond the scope of this article.

 - Azure.Extensions.AspNetCore.DataProtection.Blobs

 - Azure.Extensions.AspNetCore.DataProtection.Keys

## ```ProtectKeysWithAzureKeyVault```

```azurecli
az login
```

```csharp
builder.Services.AddDataProtection()
    .PersistKeysToAzureBlobStorage(new Uri("<blobUriWithSasToken>"))
    .ProtectKeysWithAzureKeyVault(new Uri("<keyIdentifier>"), new DefaultAzureCredential());
```

 - ```ProtectKeysWithAzureKeyVault```(IDataProtectionBuilder, Uri, TokenCredential) permits the use of a ```keyIdentifier``` Uri and a tokenCredential to enable the data protection system to use the key vault.

 - ```ProtectKeysWithAzureKeyVault```(IDataProtectionBuilder, String, IKeyEncryptionKeyResolver) permits the use of a ```keyIdentifier``` string and IKeyEncryptionKeyResolver to enable the data protection system to use the key vault.

```csharp
builder.Services.AddDataProtection()
    // This blob must already exist before the application is run
    .PersistKeysToAzureBlobStorage("<storageAccountConnectionString", "<containerName>", "<blobName>")
    // Removing this line below for an initial run will ensure the file is created correctly
    .ProtectKeysWithAzureKeyVault(new Uri("<keyIdentifier>"), new DefaultAzureCredential());
```

## PersistKeysToFileSystem

```csharp
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(@"\\server\share\directory\"));
```

> Warning
If you change the key persistence location, the system no longer automatically encrypts keys at rest, since it doesn't know whether DPAPI is an appropriate encryption mechanism.

## PersistKeysToDbContext

```csharp
builder.Services.AddDataProtection()
    .PersistKeysToDbContext<SampleDbContext>();
```

```csharp
public DbSet<DataProtectionKey> DataProtectionKeys { get; set; } = null!;
```

## ProtectKeysWith*

```csharp
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(@"\\server\share\directory\"))
    .ProtectKeysWithCertificate(builder.Configuration["CertificateThumbprint"]);
```

```csharp
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(@"\\server\share\directory\"))
    .ProtectKeysWithCertificate(
        new X509Certificate2("certificate.pfx", builder.Configuration["CertificatePassword"]));
```

## UnprotectKeysWithAnyCertificate

```csharp
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(@"\\server\share\directory\"))
    .ProtectKeysWithCertificate(
        new X509Certificate2("certificate.pfx", builder.Configuration["CertificatePassword"]))
    .UnprotectKeysWithAnyCertificate(
        new X509Certificate2("certificate_1.pfx", builder.Configuration["CertificatePassword_1"]),
        new X509Certificate2("certificate_2.pfx", builder.Configuration["CertificatePassword_2"]));
```

## SetDefaultKeyLifetime

```csharp
builder.Services.AddDataProtection()
    .SetDefaultKeyLifetime(TimeSpan.FromDays(14));
```

## ```SetApplicationName```

 - Configure ```SetApplicationName``` in each app with the same value.

 - Use the same version of the Data Protection API stack across the apps. Perform either of the following in the apps' project files:

   - Reference the same shared framework version via the Microsoft.AspNetCore.App metapackage.

   - Reference the same Data Protection package version.

```csharp
builder.Services.AddDataProtection()
    .SetApplicationName("<sharedApplicationName>");
```

```csharp
var discriminator = app.Services.GetRequiredService<IOptions<DataProtectionOptions>>()
    .Value.ApplicationDiscriminator;
app.Logger.LogInformation("ApplicationDiscriminator: {ApplicationDiscriminator}", discriminator);
```

 - Per-application isolation

 - Data Protection and app isolation

> Warning
In .NET 6, WebApplicationBuilder normalizes the content root path to end with a ```DirectorySeparatorChar```. For example, on Windows the content root path ends in \ and on Linux /. Other hosts don't normalize the path. Most apps migrating from HostBuilder or  WebHostBuilder won't share the same app name because they won't have the terminating ```DirectorySeparatorChar```. To work around this issue, remove the directory separator character and set the app name manually, as shown in the following code:

```csharp
using Microsoft.AspNetCore.DataProtection;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);
var trimmedContentRootPath = builder.Environment.ContentRootPath.TrimEnd(Path.DirectorySeparatorChar);
builder.Services.AddDataProtection()
 .SetApplicationName(trimmedContentRootPath);
var app = builder.Build();

app.MapGet("/", () => Assembly.GetEntryAssembly()!.GetName().Name);

app.Run();
```

## DisableAutomaticKeyGeneration

```csharp
builder.Services.AddDataProtection()
    .DisableAutomaticKeyGeneration();
```

## Per-application isolation

 - For apps hosted in IIS, the unique ID is the IIS physical path of the app. If an app is deployed in a web farm environment, this value is stable assuming that the IIS environments are configured similarly across all machines in the web farm.

 - For self-hosted apps running on the Kestrel server, the unique ID is the physical path to the app on disk.

### Data Protection and app isolation

 - When multiple apps are pointed at the same key repository, the intention is that the apps share the same master key material. Data Protection is developed with the assumption that all apps sharing a key ring can access all items in that key ring. The application unique identifier is used to isolate application specific keys derived from the key ring provided keys. It doesn't expect item level permissions, such as those provided by Azure KeyVault to be used to enforce extra isolation. Attempting item level permissions generates application errors. If you don't want to rely on the built-in application isolation, separate key store locations should be used and not shared between applications.

 - The application discriminator (ApplicationDiscriminator) is used to allow different apps to share the same master key material but to keep their cryptographic payloads distinct from one another.  For the apps to be able to read each other's cryptographic payloads, they must have the same application discriminator, which can be set by calling ```SetApplicationName```.

 - If an app is compromised (for example, by an RCE attack), all master key material accessible to that app must also be considered compromised, regardless of its protection-at-rest state. This implies that if two apps are pointed at the same repository, even if they use different app discriminators, a compromise of one is functionally equivalent to a compromise of both.
This "functionally equivalent to a compromise of both" clause holds even if the two apps use different mechanisms for key protection at rest. Typically, this isn't an expected configuration. The protection-at-rest mechanism is intended to provide protection in the event an adversary gains read access to the repository. An adversary who gains write access to the repository (perhaps because they attained code execution permission within an app) can insert malicious keys into storage. The Data Protection system intentionally doesn't provide protection against an adversary who gains write access to the key repository.

 - If apps need to remain truly isolated from one another, they should use different key repositories. This naturally falls out of the definition of "isolated". Apps are not isolated if they all have Read and Write access to each other's data stores.

## Changing algorithms with ```UseCryptographicAlgorithms```

```csharp
builder.Services.AddDataProtection()
    .UseCryptographicAlgorithms(new AuthenticatedEncryptorConfiguration
    {
        EncryptionAlgorithm = EncryptionAlgorithm.AES_256_CBC,
        ValidationAlgorithm = ValidationAlgorithm.HMACSHA256
    });
```

> Tip
Changing algorithms doesn't affect existing keys in the key ring. It only affects newly-generated keys.

### Specifying custom managed algorithms

```csharp
builder.Services.AddDataProtection()
    .UseCustomCryptographicAlgorithms(new ManagedAuthenticatedEncryptorConfiguration
    {
        // A type that subclasses SymmetricAlgorithm
        EncryptionAlgorithmType = typeof(Aes),

        // Specified in bits
        EncryptionAlgorithmKeySize = 256,

        // A type that subclasses KeyedHashAlgorithm
        ValidationAlgorithmType = typeof(HMACSHA256)
    });
```

> Note
The SymmetricAlgorithm must have a key length of ≥ 128 bits and a block size of ≥ 64 bits, and it must support CBC-mode encryption with PKCS #7 padding. The KeyedHashAlgorithm must have a digest size of >= 128 bits, and it must support keys of length equal to the hash algorithm's digest length. The KeyedHashAlgorithm isn't strictly required to be HMAC.

### Specifying custom Windows CNG algorithms

```csharp
builder.Services.AddDataProtection()
    .UseCustomCryptographicAlgorithms(new CngCbcAuthenticatedEncryptorConfiguration
    {
        // Passed to BCryptOpenAlgorithmProvider
        EncryptionAlgorithm = "AES",
        EncryptionAlgorithmProvider = null,

        // Specified in bits
        EncryptionAlgorithmKeySize = 256,

        // Passed to BCryptOpenAlgorithmProvider
        HashAlgorithm = "SHA256",
        HashAlgorithmProvider = null
    });
```

> Note
The symmetric block cipher algorithm must have a key length of >= 128 bits, a block size of >= 64 bits, and it must support CBC-mode encryption with PKCS #7 padding. The hash algorithm must have a digest size of >= 128 bits and must support being opened with the BCRYPT_ALG_HANDLE_HMAC_FLAG flag. The *Provider properties can be set to null to use the default provider for the specified algorithm. For more information, see the BCryptOpenAlgorithmProvider documentation.

```csharp
builder.Services.AddDataProtection()
    .UseCustomCryptographicAlgorithms(new CngGcmAuthenticatedEncryptorConfiguration
    {
        // Passed to BCryptOpenAlgorithmProvider
        EncryptionAlgorithm = "AES",
        EncryptionAlgorithmProvider = null,

        // Specified in bits
        EncryptionAlgorithmKeySize = 256
    });
```

> Note
The symmetric block cipher algorithm must have a key length of >= 128 bits, a block size of exactly 128 bits, and it must support GCM encryption. You can set the EncryptionAlgorithmProvider property to null to use the default provider for the specified algorithm. For more information, see the BCryptOpenAlgorithmProvider documentation.

### Specifying other custom algorithms

## Persisting keys when hosting in a Docker container

 - A folder that's a Docker volume that persists beyond the container's lifetime, such as a shared volume or a host-mounted volume.

 - An external provider, such as Azure Blob Storage (shown in the ```ProtectKeysWithAzureKeyVault``` section) or Redis.

## Persisting keys with Redis

## Logging DataProtection

```csharp
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.AspNetCore.DataProtection": "Information"
    }
  },
  "AllowedHosts": "*"
}
```

## Additional resources

 - Non-DI aware scenarios for Data Protection in ASP.NET Core

 - Data Protection machine-wide policy support in ASP.NET Core

 - Host ASP.NET Core in a web farm

 - Key storage providers in ASP.NET Core

Ref: [Configure ASP.NET Core Data Protection](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/configuration/overview?view=aspnetcore-8.0)