---
title: Entity Framework - Entity Framework Core - Miscellaneous - Supported .NET implementations
published: true
date: 2024-08-23 09:44:37
tags: Summary, EFCore
description: We want EF Core to be available to developers on all modern .NET implementations. EF Core's support on .NET for Windows, Linux, and macOS is covered by automated testing and many applications are known to be using it successfully, other platforms that leverage trimming and ahead-of-time (AoT) compilation like iOS, Wasm, and Unity have some limitations that we are working to address.
image:
---

## In this article

EF Core is an open-sourced tool that allows developers to create, deploy, and manage web applications.

Several older .NET implementations are no longer supported. See the sections below for more guidance.

<table><thead>
<tr>
<th>EF Core</th>
<th>.NET &amp; .NET Core</th>
<th>.NET Standard</th>
<th>.NET Framework</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>8.0</strong></td>
<td>8.0</td>
<td></td>
<td></td>
</tr>
<tr>
<td><strong>7.0</strong></td>
<td>6.0</td>
<td></td>
<td></td>
</tr>
<tr>
<td><strong>6.0</strong></td>
<td>6.0</td>
<td></td>
<td></td>
</tr>
<tr>
<td><del><strong>5.0</strong></del> (EOL)</td>
<td>5.0</td>
<td>2.1</td>
<td></td>
</tr>
<tr>
<td><del><strong>3.1</strong></del> (EOL)</td>
<td>3.1</td>
<td>2.0</td>
<td>4.7.2</td>
</tr>
</tbody></table>

## .NET

EF Core is a .NET runtime library.

.NET supports multiple platforms including Windows, Linux, macOS, iOS, Android, and Wasm. For more details on which version are supported, see the .NET Supported OS Policy.

## .NET Core

Microsoft has announced that .NET Core will no longer be available.

## .NET Standard

.NET Standard has been superseded by a new approach to uniformity. For more information, see The future of .NET Standard. The last version of EF Core that supported .NET Standard was version 5.0.

## .NET Framework

EF Core is no longer compatible with the .NET Framework.

## Xamarin

EF Core is no longer supported by Microsoft.

## Universal Windows Platform

The last version of EF Core that supported UWP was version 3.1. We recommend using .NET and the Windows App SDK instead.

## Unity

EF Core does not support .NET libraries.

## Tizen

In this article, we're going to show you how to develop apps for Tizen using .NET. Tizen .NET enables you to develop apps for it using .NET and .NET MAUI.

Ref: [.NET implementations supported by EF Core](https://learn.microsoft.com/en-us/ef/core/miscellaneous/platforms)