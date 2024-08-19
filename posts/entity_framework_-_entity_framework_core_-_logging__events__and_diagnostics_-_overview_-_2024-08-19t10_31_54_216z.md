---
title: Entity Framework - Entity Framework Core - Logging, events, and diagnostics - Overview
published: true
date: 2024-08-19 10:31:54
tags: Summary, EFCore
description: Logging is an important part of any Entity Framework application.
image:
---

## In this article

Logging is an important part of any Entity Framework application.

## Quick reference

The table below provides a quick reference for the differences between the mechanisms described here.

<table><thead>
<tr>
<th style="text-align: left;">Mechanism</th>
<th>Async</th>
<th>Scope</th>
<th>Registered</th>
<th>Intended use</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">Simple Logging</td>
<td>No</td>
<td>Per context</td>
<td>Context configuration</td>
<td>Development-time logging</td>
</tr>
<tr>
<td style="text-align: left;">Microsoft.Extensions.Logging</td>
<td>No</td>
<td>Per context*</td>
<td>D.I. or context configuration</td>
<td>Production logging</td>
</tr>
<tr>
<td style="text-align: left;">Events</td>
<td>No</td>
<td>Per context</td>
<td>Any time</td>
<td>Reacting to EF events</td>
</tr>
<tr>
<td style="text-align: left;">Interceptors</td>
<td>Yes</td>
<td>Per context</td>
<td>Context configuration</td>
<td>Manipulating EF operations</td>
</tr>
<tr>
<td style="text-align: left;">Diagnostics listeners</td>
<td>No</td>
<td>Process</td>
<td>Globally</td>
<td>Application diagnostics</td>
</tr>
</tbody></table>

*Typically ```Microsoft.Extensions.Logging``` is configured per-application via dependency injection. However, at the EF level, each context can be configured with a different logger if needed.

## Simple logging

EF Core logs can be accessed from any type of application through the use of LogTo when configuring a DbContext instance.

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder.LogTo(Console.WriteLine);
```

This concept is similar to ```Database.Log``` in EF6.

See Simple Logging for more information.

## ```Microsoft.Extensions.Logging```

EF Core supports ```Microsoft.Extensions.Logging```.

See Using ```Microsoft.Extensions.Logging``` in EF Core for more information.

## Events

EF Core exposes .NET events to act as callbacks when certain things happen in the EF Core code.

Events are registered per DbContext instance and this registration can be done at any time. Use a diagnostic listener to get the same information but for all DbContext instances in the process.

See .NET Events in EF Core for more information.

## Interception

EF Core interceptors enable interception, modification, and/or suppression of EF Core operations.

Interceptors are software tools that allow the interception of communications.

Interceptors are registered per DbContext instance when the context is configured. Use a diagnostic listener to get the same information but for all DbContext instances in the process.

See Interception for more information.

## Diagnostic listeners

Diagnostic listeners allow listening for any EF Core event that occurs in the current .NET process.

Diagnostic listeners are not suitable for getting events from a single DbContext instance. EF Core interceptors provide access to the same events with per-context registration.

Diagnostic listeners are not designed for logging. Simple logging or ```Microsoft.Extensions.Logging``` are better choices for logging.

See Using diagnostic listeners in EF Core for more information.

Ref: [Overview of Logging and Interception](https://learn.microsoft.com/en-us/ef/core/logging-events-diagnostics/)