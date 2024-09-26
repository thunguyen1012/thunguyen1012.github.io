---
title: Advanced - Microsoft.AspNetCore.App metapackage
published: true
date: 2024-09-25 09:34:14
tags: Summary, AspNetCore
description: 
image:
---

## In this article

 - Projects that target the ```Microsoft.NET.Sdk.Web``` SDK implicitly reference the ```Microsoft.AspNetCore.App``` framework.

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>netcoreapp3.0</TargetFramework>
  </PropertyGroup>
    ...
</Project>
```

 - Doesn't include third-party dependencies.

 - Includes all supported packages by the ASP.NET Core team.

Ref: [Microsoft.AspNetCore.App for ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/metapackage-app?view=aspnetcore-8.0)