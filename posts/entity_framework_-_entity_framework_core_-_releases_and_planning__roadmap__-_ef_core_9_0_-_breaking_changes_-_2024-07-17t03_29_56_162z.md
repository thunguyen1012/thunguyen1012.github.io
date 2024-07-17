---
title: Entity Framework - Entity Framework Core - Releases and planning (roadmap) - EF Core 9.0 - Breaking changes
published: true
date: 2024-07-17 03:29:56
tags: EFCore, Summary
description: EF Core 9 has been released and is now available for download.
image:
---
- Article

  - 06/08/2024

  - 3 contributors

## In this article

EF Core 9 has been released and is now available for download.

- Breaking changes in EF Core 8

- Breaking changes in EF Core 7

- Breaking changes in EF Core 6

## Target Framework

EF Core 9 is the latest release of the Microsoft .NET Framework.

## Summary

## Medium-impact changes



### Sync I/O via the Azure Cosmos DB provider is no longer supported

Tracking Issue #32563

#### Old behavior

EF Core has been improved to prevent deadlock when calling methods against Azure Cosmos DB SDK.

#### New behavior

Entity Framework (EF) now throws by default when attempting to use synchronous I/O.

#### Why

Synchronous blocking on asynchronous methods can result in deadlock, and the Azure Cosmos DB SDK only supports async methods.

#### Mitigations

In EF Core 9.0, the error can be suppressed with:

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
{
    optionsBuilder.ConfigureWarnings(w => w.Ignore(CosmosEventId.SyncNotSupported));
}
```

Azure Cosmos DB is now supported by EF Core.

## Low-impact changes



### EF.Functions.Unhex() now returns byte[]?

Tracking Issue #33864

#### Old behavior

The EF.Functions.Unhex() function was previously annotated to return byte[].

#### New behavior

Starting with EF Core 9.0, Unhex() is now annotated to return byte[]?.

#### Why

Unhex() is translated to the SQLite ```unhex``` function, which returns NULL for invalid inputs. As a result, Unhex() returned ```null``` for those cases, in violation of the annotation.

#### Mitigations

In this article, I'm going to show you how to use the ```null```-forgiving operator to ensure that the content of an invocation is always valid.

```c#
var binaryData = await context.Blogs.Select(b => EF.Functions.Unhex(b.HexString)!).ToListAsync();
```

Otherwise, add runtime checks for ```null``` on the return value of Unhex().



### ```SqlFunctionExpression```'s nullability ```arguments```' arity validated

Tracking Issue #33852

#### Old behavior

Previously it was possible to create a ```SqlFunctionExpression``` with a different number of ```arguments``` and nullability propagation ```arguments```.

#### New behavior

Starting with EF Core 9.0, EF now throws if the number of ```arguments``` and nullability propagation ```arguments``` do not match.

#### Why

Not having matching number of ```arguments``` and nullability propagation ```arguments``` can lead to unexpected behavior.

#### Mitigations

Make sure the ```argumentsPropagateNullability``` has same number of elements as the ```arguments```. When in doubt use ```false``` for nullability argument.

Ref: [Breaking changes in EF Core 9 (EF9)](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-9.0/breaking-changes)