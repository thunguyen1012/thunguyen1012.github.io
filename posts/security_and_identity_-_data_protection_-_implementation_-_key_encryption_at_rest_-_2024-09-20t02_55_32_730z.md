---
title: Security and Identity - Data protection - Implementation - Key encryption at rest
published: true
date: 2024-09-20 02:55:32
tags: Summary, AspNetCore
description: The data protection system employs a discovery mechanism by default to determine how cryptographic keys should be encrypted at rest. The developer can override the discovery mechanism and manually specify how keys should be encrypted at rest.
image:
---

## In this article

A new feature in the Python programming language allows developers to control how their code is encrypted.

> Warning
If you specify an explicit key persistence location, the data protection system deregisters the default key encryption at rest mechanism. Consequently, keys are no longer encrypted at rest. We recommend that you specify an explicit key encryption mechanism for production deployments. The encryption-at-rest mechanism options are described in this topic.

## Azure Key Vault

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddDataProtection()
        .PersistKeysToAzureBlobStorage(new Uri("<blobUriWithSasToken>"))
        .ProtectKeysWithAzureKeyVault("<keyIdentifier>", "<clientId>", "<clientSecret>");
}
```

## Windows DPAPI

Only applies to Windows deployments.

When Windows DPAPI is used, key material is encrypted with CryptProtectData before being persisted to storage. DPAPI is an appropriate encryption mechanism for data that's never read outside of the current machine (though it's possible to back these keys up to Active Directory). To configure DPAPI key-at-rest encryption, call one of the ```ProtectKeysWithDpapi```) extension methods:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // Only the local user account can decrypt the keys
    services.AddDataProtection()
        .ProtectKeysWithDpapi();
}
```

If ```ProtectKeysWithDpapi``` is called with no parameters, only the current Windows user account can decipher the persisted key ring. You can optionally specify that any user account on the machine (not just the current user account) be able to decipher the key ring:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // All user accounts on the machine can decrypt the keys
    services.AddDataProtection()
        .ProtectKeysWithDpapi(protectToLocalMachine: true);
}
```

## X.509 certificate

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddDataProtection()
        .ProtectKeysWithCertificate("3BCE558E2AD3E0E34A7743EAB5AEA2A9BD2575A0");
}
```

## Windows DPAPI-NG

This mechanism is available only on Windows 8/Windows Server 2012 or later.

Beginning with Windows 8, Windows OS supports DPAPI-NG (also called CNG DPAPI). For more information, see About CNG DPAPI.

The principal is encoded as a protection descriptor rule. In the following example that calls ```ProtectKeysWithDpapiNG```, only the domain-joined user with the specified SID can decrypt the key ring:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // Uses the descriptor rule "SID=S-1-5-21-..."
    services.AddDataProtection()
        .ProtectKeysWithDpapiNG("SID=S-1-5-21-...",
        flags: DpapiNGProtectionDescriptorFlags.None);
}
```

There's also a parameterless overload of ```ProtectKeysWithDpapiNG```. Use this convenience method to specify the rule "SID={CURRENT_ACCOUNT_SID}", where CURRENT_ACCOUNT_SID is the SID of the current Windows user account:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    // Use the descriptor rule "SID={current account SID}"
    services.AddDataProtection()
        .ProtectKeysWithDpapiNG();
}
```

A domain-joined machine can be used to decrypt an encrypted payload.

## Certificate-based encryption with Windows DPAPI-NG

If the app is running on Windows Server 2012 R2 or later, you can use Windows DPAPI-NG to perform certificate-based encryption.

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddDataProtection()
        .ProtectKeysWithDpapiNG("CERTIFICATE=HashId:3BCE558E2...B5AEA2A9BD2575A0",
            flags: DpapiNGProtectionDescriptorFlags.None);
}
```

Any app pointed at this repository must be running on Windows 8.1/Windows Server 2012 R2 or later to decipher the keys.

## Custom key encryption

If the in-box mechanisms aren't appropriate, the developer can specify their own key encryption mechanism by providing a custom IXmlEncryptor.

Ref: [Key encryption at rest in Windows and Azure using ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/implementation/key-encryption-at-rest?view=aspnetcore-8.0)