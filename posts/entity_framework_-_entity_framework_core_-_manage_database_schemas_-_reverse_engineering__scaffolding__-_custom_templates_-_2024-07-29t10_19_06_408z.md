---
title: Entity Framework - Entity Framework Core - Manage database schemas - Reverse engineering (scaffolding) - Custom templates
published: true
date: 2024-07-29 10:19:06
tags: EFCore, Summary
description: This article shows how to scaffold code using T4 text templates.
image:
---

## In this article

> Note
This feature was added in EF Core 7.

This article shows how to scaffold code using T4 text templates.

## Prerequisites

This article assumes you're familiar with reverse engineering in EF Core. If not, please review that article before proceeding.

## Adding the default templates

In this tutorial, we will walk you through the process of writing scaffolded code.

Start by installing the EF Core template package for ```dotnet new```:

```dotnetcli
dotnet new install Microsoft.EntityFrameworkCore.Templates
```

Now you can add the default templates to your project. Do this by running the following command from your project directory.

```dotnetcli
dotnet new ef-templates
```

This command adds the following files to your project.

- CodeTemplates/

  - EFCore/

    - ```DbContext.t4```

    - ```EntityType.t4```

The ```DbContext.t4``` template is used to scaffold a DbContext class for the database, and the ```EntityType.t4``` template is used to scaffold entity type classes for each table and view in the database.

> Tip
The .t4 extension is used (instead of .tt) to prevent Visual Studio from transforming the templates. The templates will be transformed by EF Core instead.

## Introduction to T4

The following code shows how to use a T4 template to generate text using .NET.

> Important
T4 text templates--especially ones that generate code--can be difficult to read without syntax highlighting. If necessary, search for an extension to your code editor that enables T4 syntax highlighting.

```T4
<#@ template hostSpecific="true" #>
<#@ assembly name="Microsoft.EntityFrameworkCore.Design" #>
<#@ parameter name="NamespaceHint" type="System.String" #>
<#@ import namespace="Microsoft.EntityFrameworkCore" #>
<#
    if (!string.IsNullOrEmpty(NamespaceHint))
    {
#>
namespace <#= NamespaceHint #>;
```

The first few lines that begin with <#@ are called directives. They affect how the template is transformed. The following table briefly describes each kind of directive used.

<table><thead>
<tr>
<th>Directive</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>template</code></td>
<td>Specifies hostSpecific="true" which enables ```using``` the <code>Host</code> property inside the ```template``` to access EF Core services.</td>
</tr>
<tr>
<td><code>assembly</code></td>
<td>Adds ```assembly``` references required to compile the ```template```.</td>
</tr>
<tr>
<td><code>parameter</code></td>
<td>Declares parameters that will be passed in by EF Core when transforming the ```template```.</td>
</tr>
<tr>
<td><code>import</code></td>
<td>Like C# ```using``` directives, brings namespaces into scope for the ```template``` code.</td>
</tr>
</tbody></table>

The following sections of ```DbContext.t4``` are called directives.

Anything outside of a control block will be copied directly to the template output.

An expression control block begins with ```<#=```. The code inside of it will be evaluated and the result will be added to the template output. These are similar to C# interpolated string arguments.

For a more detailed and complete explanation of the T4 syntax, see Writing a T4 Text Template.

## Customize the entity types

Let's walk through what it's like to customize a template. By default, EF Core generates the following code for collection navigation properties.

```C#
public virtual ICollection<Album> Albums { get; } = new List<Album>();
```

In this article, I'm going to show you how to use ```<ListT>``` and ```<ObservableCollectionT>``` in your application.

Open the ```EntityType.t4``` template and find where it generates ```List<T>```. It looks like this:

```T4
if (navigation.IsCollection)
    {
#>
    public virtual ICollection<<#= targetType #>> <#= navigation.Name #> { get; } = new List<<#= targetType #>>();
<#
    }
```

Replace List with ObservableCollection.

```T4
public virtual ICollection<<#= targetType #>> <#= navigation.Name #> { get; } = new ObservableCollection<<#= targetType #>>();
```

We also need to add a using directive to the scaffolded code. The usings are specified in a list near the top of the template. Add ```System.Collections.ObjectModel``` to the list.

```C#
var usings = new List<string>
{
    "System",
    "System.Collections.Generic",
    "System.Collections.ObjectModel"
};
```

Test the changes by using the reverse engineering commands. The templates inside your project are used automatically by the commands.

 - .NET Core CLI

 - Visual Studio

```dotnetcli
dotnet ef dbcontext scaffold "Data Source=(localdb)\MSSQLLocalDB;Initial Catalog=Chinook" Microsoft.EntityFrameworkCore.SqlServer
```

```powershell
Scaffold-DbContext 'Data Source=(localdb)\MSSQLLocalDB;Initial Catalog=Chinook' Microsoft.EntityFrameworkCore.SqlServer
```

If you did everything correctly, the collection navigation properties should now use ```ObservableCollection<T>```.

```C#
public virtual ICollection<Album> Albums { get; } = new ObservableCollection<Album>();
```

## Updating templates

When you create a new project in EF Core, it creates a copy of the default templates for that project.

The EF Core repository has been updated to version 8.0.0.

```console
git clone --no-checkout https://github.com/dotnet/efcore.git
cd efcore
git diff v7.0.0 v8.0.0 -- src/EFCore.Design/Scaffolding/Internal/CSharpDbContextGenerator.tt src/EFCore.Design/Scaffolding/Internal/CSharpEntityTypeGenerator.tt
```

You can review the changes made to Microsoft.FrameworkCore.Templates by visiting the Microsoft Developers website.

Before adding the default templates to a new project, remember to update to the latest EF Core template package.

```dotnetcli
dotnet new update
```

## Advanced usage

### Ignoring the input model

You can use Migrations to map your app to a database.

In this tutorial, we'll look at how to create a model of a database using the ```dbContext.Database.CreateScript``` method.

### Entity configuration classes

The DbContext class is used to create models.

Each entity type in the model has its own class.

### Scaffolding other types of files

In this article, I'm going to show you how to use Reverse Engineering in EF Core.

```T4
<#@ output extension=".md" #>
<#@ assembly name="Microsoft.EntityFrameworkCore" #>
<#@ assembly name="Microsoft.EntityFrameworkCore.Relational" #>
<#@ assembly name="Microsoft.EntityFrameworkCore.Design" #>
<#@ parameter name="Model" type="Microsoft.EntityFrameworkCore.Metadata.IModel" #>
<#@ parameter name="Options" type="Microsoft.EntityFrameworkCore.Scaffolding.ModelCodeGenerationOptions" #>
<#@ import namespace="System.Linq" #>
<#@ import namespace="Microsoft.EntityFrameworkCore" #>
# <#= Options.ContextName #>

```mermaid
erDiagram
<#
    foreach (var entityType in Model.GetEntityTypes().Where(e => !e.IsSimpleManyToManyJoinEntityType()))
    {
#>
    <#= entityType.Name #> {
    }
<#
        foreach (var foreignKey in entityType.GetForeignKeys())
        {
#>
    <#= entityType.Name #> <#= foreignKey.IsUnique ? "|" : "}" #>o--<#= foreignKey.IsRequired ? "|" : "o" #>| <#= foreignKey.PrincipalEntityType.Name #> : "<#= foreignKey.GetConstraintName() #>"
<#
        }

        foreach (var skipNavigation in entityType.GetSkipNavigations().Where(n => n.IsLeftNavigation()))
        {
#>
    <#= entityType.Name #> }o--o{ <#= skipNavigation.TargetEntityType.Name #> : <#= skipNavigation.JoinEntityType.Name #>
<#
        }
    }
#>
```
```

Ref: [Custom Reverse Engineering Templates](https://learn.microsoft.com/en-us/ef/core/managing-schemas/scaffolding/templates)