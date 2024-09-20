---
title: Security and Identity - Data protection - Extensibility APIs - Core cryptography extensibility
published: true
date: 2024-09-20 02:35:32
tags: Summary, AspNetCore
description: The IAuthenticatedEncryptor interface is the basic building block of the cryptographic subsystem. There's generally one IAuthenticatedEncryptor per key, and the IAuthenticatedEncryptor instance wraps all cryptographic key material and algorithmic information necessary to perform cryptographic operations.
image:
---

## In this article



> Warning
Types that implement any of the following interfaces should be thread-safe for multiple callers.



## `IAuthenticatedEncryptor`

The `IAuthenticatedEncryptor` interface is the basic building block of the cryptographic.

As its name suggests, the type is responsible for providing authenticated encryption and decryption services. It exposes the following two APIs.

- `Decrypt(ArraySegment<byte> ciphertext, ArraySegment<byte> additionalAuthenticatedData) : byte[]`

- `Encrypt(ArraySegment<byte> plaintext, ArraySegment<byte> additionalAuthenticatedData) : byte[]`

The following methods can be used to encrypt and decrypt data.

> Note
The `IAuthenticatedEncryptor` instance itself doesn't actually need to contain the key material. For example, the implementation could delegate to an HSM for all operations.



## How to create an IAuthenticatedEncryptor

 - ASP.NET Core 2.x

 - ASP.NET Core 1.x

  - `CreateEncryptorInstance(IKey key) : IAuthenticatedEncryptor`

```csharp
// we have an IAuthenticatedEncryptorFactory instance and an IKey instance
IAuthenticatedEncryptorFactory factory = ...;
IKey key = ...;

// get an encryptor instance and perform an authenticated encryption operation
ArraySegment<byte> plaintext = new ArraySegment<byte>(Encoding.UTF8.GetBytes("plaintext"));
ArraySegment<byte> aad = new ArraySegment<byte>(Encoding.UTF8.GetBytes("AAD"));
var encryptor1 = factory.CreateEncryptorInstance(key);
byte[] ciphertext = encryptor1.Encrypt(plaintext, aad);

// get another encryptor instance and perform an authenticated decryption operation
var encryptor2 = factory.CreateEncryptorInstance(key);
byte[] roundTripped = encryptor2.Decrypt(new ArraySegment<byte>(ciphertext), aad);


// the 'roundTripped' and 'plaintext' buffers should be equivalent
```

  - `CreateEncryptorInstance() : IAuthenticatedEncryptor`

  - `ExportToXml() : XmlSerializedDescriptorInfo`

```csharp
// we have an IAuthenticatedEncryptorDescriptor instance
IAuthenticatedEncryptorDescriptor descriptor = ...;

// get an encryptor instance and perform an authenticated encryption operation
ArraySegment<byte> plaintext = new ArraySegment<byte>(Encoding.UTF8.GetBytes("plaintext"));
ArraySegment<byte> aad = new ArraySegment<byte>(Encoding.UTF8.GetBytes("AAD"));
var encryptor1 = descriptor.CreateEncryptorInstance();
byte[] ciphertext = encryptor1.Encrypt(plaintext, aad);

// get another encryptor instance and perform an authenticated decryption operation
var encryptor2 = descriptor.CreateEncryptorInstance();
byte[] roundTripped = encryptor2.Decrypt(new ArraySegment<byte>(ciphertext), aad);


// the 'roundTripped' and 'plaintext' buffers should be equivalent
```



## IAuthenticatedEncryptorDescriptor (ASP.NET Core 2.x only)

 - ASP.NET Core 2.x

 - ASP.NET Core 1.x

  - `ExportToXml() : XmlSerializedDescriptorInfo`

## XML Serialization

`IAuthenticatedEncryptor` is an `IAuthenticatedEncryptor` whose implementation relies on an `IAuthenticatedEncryptor` descriptor.



A descriptor is a piece of code that describes a property.

The serialized descriptor may contain sensitive information such as cryptographic key material. The data protection system has built-in support for encrypting information before it's persisted to storage. To take advantage of this, the descriptor should mark the element which contains sensitive information with the attribute name "requiresEncryption" (xmlns "<http://schemas.asp.net/2015/03/dataProtection>"), value "true".

> Tip
There's a helper API for setting this attribute. Call the extension method `XElement.MarkAsRequiresEncryption()` located in namespace Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption.ConfigurationModel.

In some cases, the descriptor may contain sensitive information.



## IAuthenticatedEncryptorDescriptorDeserializer

The IAuthenticatedEncryptorDescriptorDeserializer interface represents a type that knows how to deserialize an IAuthenticatedEncryptorDescriptor instance from an XElement. It exposes a single method:

- `ImportFromXml(XElement element) : IAuthenticatedEncryptorDescriptor`

The `ImportFromXml` method takes the XElement that was returned by `IAuthenticatedEncryptorDescriptor.ExportToXml` and creates an equivalent of the original `IAuthenticatedEncryptorDescriptor`.

Types which implement IAuthenticatedEncryptorDescriptorDeserializer should have one of the following two public constructors:

- `.ctor(IServiceProvider)`

- `.ctor()`

> Note
The IServiceProvider passed to the constructor may be null.

## The top-level factory

 - ASP.NET Core 2.x

 - ASP.NET Core 1.x

  - `CreateNewDescriptor() : IAuthenticatedEncryptorDescriptor`

  - `CreateNewDescriptor() : IAuthenticatedEncryptorDescriptor`

Ref: [Core cryptography extensibility in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/extensibility/core-crypto?view=aspnetcore-8.0)