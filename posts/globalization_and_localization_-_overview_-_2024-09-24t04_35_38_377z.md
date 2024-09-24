---
title: Globalization and localization - Overview
published: true
date: 2024-09-24 04:35:38
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## Terms

 - Globalization (G11N): The process of making an app support different languages and regions. The abbreviation comes from the first and last letters and the number of letters between them.

 - Localization (L10N): The process of customizing a globalized app for specific languages and regions.

 - Internationalization (I18N): Both globalization and localization.

 - Culture: A language and, optionally, a region.

 - Neutral culture: A culture that has a specified language, but not a region (for example "en", "es").

 - Specific culture: A culture that has a specified language and region (for example, "en-US", "en-GB", "es-CL").

 - Parent culture: The neutral culture that contains a specific culture (for example, "en" is the parent culture of "en-US" and "en-GB").

 - Locale: A locale is the same as a culture.

## Language and country/region codes

## Tasks to localize an app

 - Make an ASP.NET Core app's content localizable.

 - Provide localized resources for the cultures the app supports

 - Implement a strategy to select the culture for each request

## Additional resources

 - Url culture provider using middleware as filters in ASP.NET Core

 - Applying the RouteDataRequest CultureProvider globally with middleware as filters

 - ```IStringLocalizer``` : Uses the ResourceManager and ResourceReader to provide culture-specific resources at run time. The interface has an indexer and an ```IEnumerable``` for returning localized strings.

 - ```IHtmlLocalizer```: For resources that contain HTML.

 - View and DataAnnotations

 - Troubleshoot ASP.NET Core localization

 - Globalizing and localizing .NET applications

 - Resources in .resx Files

 - Microsoft Multilingual App Toolkit

 - Localization & Generics

Ref: [Globalization and localization in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/localization?view=aspnetcore-8.0)