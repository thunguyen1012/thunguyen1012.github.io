---
title: Globalization and localization - Provide resources
published: true
date: 2024-09-24 04:35:38
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## ```SupportedCultures``` and ```SupportedUICultures```

## Resource files

 - In Solution Explorer, right click on the folder that will contain the resource file, and then select Add > New Item.

![Nested contextual menu: In Solution Explorer, a contextual menu is open for Resources. A second contextual menu is open for Add showing the New Item command highlighted.!](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/localization/_static/newi.png?view=aspnetcore-8.0 "Nested contextual menu: In Solution Explorer, a contextual menu is open for Resources. A second contextual menu is open for Add showing the New Item command highlighted.")

 - In the Search installed templates box, enter "resource" and name the file.

![Add New Item dialog!](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/localization/_static/res.png?view=aspnetcore-8.0 "Add New Item dialog")

 - Enter the key value (native string) in the Name column and the translated string in the Value column.

Visual Studio shows the Welcome.es.resx file.

![Welcome.es.resx file (the Welcome resource file for Spanish) with the word Hello in the Name column and the word Hola (Hello in Spanish) in the Value column!](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/localization/_static/hola.png?view=aspnetcore-8.0 "Welcome.es.resx file (the Welcome resource file for Spanish) with the word Hello in the Name column and the word Hola (Hello in Spanish) in the Value column")

![Solution Explorer showing the Welcome Spanish (es) resource file!](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/localization/_static/se.png?view=aspnetcore-8.0 "Solution Explorer showing the Welcome Spanish (es) resource file")

## Resource file naming

<table><thead>
<tr>
<th>Resource name</th>
<th>Dot or path naming</th>
</tr>
</thead>
<tbody>
<tr>
<td>Resources/Controllers.HomeController.fr.resx</td>
<td>Dot</td>
</tr>
<tr>
<td>Resources/Controllers/HomeController.fr.resx</td>
<td>Path</td>
</tr>
</tbody></table>

 - Resources/Views/Home/About.fr.resx

 - Resources/Views.Home.About.fr.resx

## RootNamespaceAttribute

> Warning
This can occur when a project's name is not a valid .NET identifier. For instance ```my-project-name.csproj``` will use the root namespace ```my_project_name``` and the assembly name ```my-project-name``` leading to this error.

 - Localization does not work by default.

 - Localization fails due to the way resources are searched for within the assembly. ```RootNamespace``` is a build-time value which is not available to the executing process.

```csharp
using System.Reflection;
using Microsoft.Extensions.Localization;

[assembly: ResourceLocation("Resource Folder Name")]
[assembly: RootNamespace("App Root Namespace")]
```

## Culture fallback behavior

 - Welcome.fr-CA.resx

 - Welcome.fr.resx

 - Welcome.resx (if the ```NeutralResourcesLanguage``` is "fr-CA")

## Generate resource files with Visual Studio

### Add other cultures

## Next steps

 - Make the app's content localizable.

 - Implement a strategy to select the language/culture for each request

## Additional resources

 - Url culture provider using middleware as filters in ASP.NET Core

 - Applying the RouteDataRequest CultureProvider globally with middleware as filters

 - Globalization and localization in ASP.NET Core

 - Make an ASP.NET Core app's content localizable

 - Strategies for selecting language and culture in a localized ASP.NET Core app

 - Troubleshoot ASP.NET Core localization

 - Globalizing and localizing .NET applications

 - Localization.StarterWeb project used in the article.

 - Resources in .resx Files

 - Microsoft Multilingual App Toolkit

 - Localization & Generics

Ref: [Provide localized resources for languages and cultures in an ASP.NET Core app](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/localization/provide-resources?view=aspnetcore-8.0)