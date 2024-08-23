---
title: Entity Framework - Entity Framework Core - Miscellaneous - Plug-in APIs
published: true
date: 2024-08-23 09:57:59
tags: Summary, EFCore
description: EF Core extensions often require adding logic to core EF and provider components. This usually requires creating a derived component and replacing the original one in the internal service provider. This gets complicated when multiple extensions want to change the same component. In these cases, we provide plug-in APIs to allow multiple extensions to provide additional logic.
image:
---

## In this article

We provide APIs to allow multiple EF Core extensions to provide additional logic.

## List of services

The following is a list of plug-in APIs.

<table><thead>
<tr>
<th>Service</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.storage.itypemappingsourceplugin" class="no-loc" data-linktype="absolute-path">ITypeMappingSourcePlugin</a></td>
<td>Adds mappings between .NET types and primitive store types.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.storage.irelationaltypemappingsourceplugin" class="no-loc" data-linktype="absolute-path">IRelationalTypeMappingSourcePlugin</a></td>
<td>Adds mappings between .NET types and primitive relational database types.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.metadata.conventions.infrastructure.iconventionsetplugin" class="no-loc" data-linktype="absolute-path">IConventionSetPlugin</a></td>
<td>Adds model building conventions.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.query.imembertranslatorplugin" class="no-loc" data-linktype="absolute-path">IMemberTranslatorPlugin</a></td>
<td>Adds SQL translations for .NET properties.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.query.imethodcalltranslatorplugin" class="no-loc" data-linktype="absolute-path">IMethodCallTranslatorPlugin</a></td>
<td>Adds SQL translations for .NET methods.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.query.iaggregatemethodcalltranslatorplugin" class="no-loc" data-linktype="absolute-path">IAggregateMethodCallTranslatorPlugin</a></td>
<td>Adds SQL translations for .NET enumerable methods.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.query.ievaluatableexpressionfilterplugin" class="no-loc" data-linktype="absolute-path">IEvaluatableExpressionFilterPlugin</a></td>
<td>Forces server-eval of certain expressions.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.entityframeworkcore.scaffolding.iprovidercodegeneratorplugin" class="no-loc" data-linktype="absolute-path">IProviderCodeGeneratorPlugin</a></td>
<td>Scaffolds provider and DbContext options.</td>
</tr>
</tbody></table>

## Examples

Here are some extensions making use of these APIs:

<table><thead>
<tr>
<th>Extension</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="https://github.com/dotnet/efcore/tree/main/src/EFCore.Sqlite.NTS" data-linktype="external">Microsoft.EntityFrameworkCore.Sqlite.NetTopologySuite</a></td>
<td>Adds type mappings and SQL translations for SpatiaLite's types.</td>
</tr>
<tr>
<td><a href="https://github.com/dotnet/efcore/tree/main/src/EFCore.SqlServer.HierarchyId" data-linktype="external">Microsoft.EntityFrameworkCore.SqlServer.HierarchyId</a></td>
<td>Adds type mappings and SQL translations for SQL Server's hierarchyid type.</td>
</tr>
<tr>
<td><a href="https://github.com/dotnet/efcore/tree/main/src/EFCore.SqlServer.NTS" data-linktype="external">Microsoft.EntityFrameworkCore.SqlServer.NetTopologySuite</a></td>
<td>Adds type mappings and SQL translations for SQL Server's geography and geometry types.</td>
</tr>
<tr>
<td><a href="https://github.com/efcore/EFCore.CheckConstraints" data-linktype="external">EFCore.CheckConstraints</a></td>
<td>Adds model building conventions for relational database check constraints.</td>
</tr>
<tr>
<td><a href="https://github.com/efcore/EFCore.NamingConventions" data-linktype="external">EFCore.NamingConventions</a></td>
<td>Adds model building conventions for alternative relational database table, column, and constraint names.</td>
</tr>
</tbody></table>

Ref: [Plug-in APIs](https://learn.microsoft.com/en-us/ef/core/miscellaneous/plugins)