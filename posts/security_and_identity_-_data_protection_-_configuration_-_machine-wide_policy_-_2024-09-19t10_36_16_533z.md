---
title: Security and Identity - Data protection - Configuration - Machine-wide policy
published: true
date: 2024-09-19 10:36:16
tags: Summary, AspNetCore
description:
image:
---

## In this article

The ASP.NET Data Protection system is a wrapper around ASP.NET Core Data Protection.

> Warning
The system administrator can set default policy, but they can't enforce it. The app developer can always override any value with one of their own choosing. The default policy only affects apps where the developer hasn't specified an explicit value for a setting.

## Setting default policy

To set default policy, an administrator can set known values in the system registry under the following registry key:

`HKLM\SOFTWARE\Microsoft\DotNetPackages\Microsoft.AspNetCore.DataProtection`

If you're on a 64-bit operating system and want to affect the behavior of 32-bit apps, remember to configure the Wow6432Node equivalent of the above key.

The supported values are shown below.

<table><thead>
<tr>
<th>Value</th>
<th style="text-align: center;">Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>EncryptionType</td>
<td style="text-align: center;">string</td>
<td>Specifies which algorithms should be used for data protection. The value must be CNG-CBC, CNG-GCM, or Managed and is described in more detail below.</td>
</tr>
<tr>
<td>DefaultKeyLifetime</td>
<td style="text-align: center;">DWORD</td>
<td>Specifies the lifetime for newly-generated keys. The value is specified in days and must be &gt;= 7.</td>
</tr>
<tr>
<td>KeyEscrowSinks</td>
<td style="text-align: center;">string</td>
<td>Specifies the types that are used for key escrow. The value is a semicolon-delimited list of key escrow sinks, where each element in the list is the assembly-qualified name of a type that implements <a href="/en-us/dotnet/api/microsoft.aspnetcore.dataprotection.keymanagement.ikeyescrowsink" class="no-loc" data-linktype="absolute-path">IKeyEscrowSink</a>.</td>
</tr>
</tbody></table>

## Encryption types

The `CngCbcAuthenticatedEncryptionSettings` type is a property of the `EncryptionType` class in the `CngCertificate` class.

<table><thead>
<tr>
<th>Value</th>
<th style="text-align: center;">Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>EncryptionAlgorithm</td>
<td style="text-align: center;">string</td>
<td>The name of a symmetric block cipher algorithm understood by CNG. This algorithm is opened in CBC mode.</td>
</tr>
<tr>
<td>EncryptionAlgorithmProvider</td>
<td style="text-align: center;">string</td>
<td>The name of the CNG provider implementation that can produce the algorithm EncryptionAlgorithm.</td>
</tr>
<tr>
<td>EncryptionAlgorithmKeySize</td>
<td style="text-align: center;">DWORD</td>
<td>The length (in bits) of the key to derive for the symmetric block cipher algorithm.</td>
</tr>
<tr>
<td>HashAlgorithm</td>
<td style="text-align: center;">string</td>
<td>The name of a hash algorithm understood by CNG. This algorithm is opened in HMAC mode.</td>
</tr>
<tr>
<td>HashAlgorithmProvider</td>
<td style="text-align: center;">string</td>
<td>The name of the CNG provider implementation that can produce the algorithm HashAlgorithm.</td>
</tr>
</tbody></table>

The `CngGcmAuthenticatedEncryptionSettings` type is a property of the `EncryptionType` type.

<table><thead>
<tr>
<th>Value</th>
<th style="text-align: center;">Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>EncryptionAlgorithm</td>
<td style="text-align: center;">string</td>
<td>The name of a symmetric block cipher algorithm understood by CNG. This algorithm is opened in Galois/Counter Mode.</td>
</tr>
<tr>
<td>EncryptionAlgorithmProvider</td>
<td style="text-align: center;">string</td>
<td>The name of the CNG provider implementation that can produce the algorithm EncryptionAlgorithm.</td>
</tr>
<tr>
<td>EncryptionAlgorithmKeySize</td>
<td style="text-align: center;">DWORD</td>
<td>The length (in bits) of the key to derive for the symmetric block cipher algorithm.</td>
</tr>
</tbody></table>

`EncryptionType` is a property of the `ManagedAuthenticatedEncryptionSettings` type.

<table><thead>
<tr>
<th>Value</th>
<th style="text-align: center;">Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>EncryptionAlgorithmType</td>
<td style="text-align: center;">string</td>
<td>The assembly-qualified name of a type that implements SymmetricAlgorithm.</td>
</tr>
<tr>
<td>EncryptionAlgorithmKeySize</td>
<td style="text-align: center;">DWORD</td>
<td>The length (in bits) of the key to derive for the symmetric encryption algorithm.</td>
</tr>
<tr>
<td>ValidationAlgorithmType</td>
<td style="text-align: center;">string</td>
<td>The assembly-qualified name of a type that implements KeyedHashAlgorithm.</td>
</tr>
</tbody></table>

If `EncryptionType` has any other value other than null or empty, the Data Protection system throws an exception at startup.

> Warning
When configuring a default policy setting that involves type names (EncryptionAlgorithmType, ValidationAlgorithmType, KeyEscrowSinks), the types must be available to the app. This means that for apps running on Desktop CLR, the assemblies that contain these types should be present in the Global Assembly Cache (GAC). For ASP.NET Core apps running on .NET Core, the packages that contain these types should be installed.

Ref: [Data Protection machine-wide policy support in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/configuration/machine-wide-policy?view=aspnetcore-8.0)