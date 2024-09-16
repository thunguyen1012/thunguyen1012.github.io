---
title: Security and Identity - Authorization - Razor Pages authorization conventions
published: true
date: 2024-09-16 06:57:38
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## Require authorization to access a page

```csharp
services.AddRazorPages(options =>
{
    options.Conventions.AuthorizePage("/Contact");
    options.Conventions.AuthorizeFolder("/Private");
    options.Conventions.AllowAnonymousToPage("/Private/PublicPage");
    options.Conventions.AllowAnonymousToFolder("/Private/PublicPages");
});
```

```csharp
options.Conventions.AuthorizePage("/Contact", "AtLeast21");
```

> Note
An AuthorizeFilter can be applied to a page model class with the `[Authorize]` filter attribute. For more information, see Authorize filter attribute.

## Require authorization to access a folder of pages

```csharp
services.AddRazorPages(options =>
{
    options.Conventions.AuthorizePage("/Contact");
    options.Conventions.AuthorizeFolder("/Private");
    options.Conventions.AllowAnonymousToPage("/Private/PublicPage");
    options.Conventions.AllowAnonymousToFolder("/Private/PublicPages");
});
```

```csharp
options.Conventions.AuthorizeFolder("/Private", "AtLeast21");
```

## Require authorization to access an area page

```csharp
options.Conventions.AuthorizeAreaPage("Identity", "/Manage/Accounts");
```

```csharp
options.Conventions.AuthorizeAreaPage("Identity", "/Manage/Accounts", "AtLeast21");
```

## Require authorization to access a folder of areas

```csharp
options.Conventions.AuthorizeAreaFolder("Identity", "/Manage");
```

```csharp
options.Conventions.AuthorizeAreaFolder("Identity", "/Manage", "AtLeast21");
```

## Allow anonymous access to a page

```csharp
services.AddRazorPages(options =>
{
    options.Conventions.AuthorizePage("/Contact");
    options.Conventions.AuthorizeFolder("/Private");
    options.Conventions.AllowAnonymousToPage("/Private/PublicPage");
    options.Conventions.AllowAnonymousToFolder("/Private/PublicPages");
});
```

## Allow anonymous access to a folder of pages

```csharp
services.AddRazorPages(options =>
{
    options.Conventions.AuthorizePage("/Contact");
    options.Conventions.AuthorizeFolder("/Private");
    options.Conventions.AllowAnonymousToPage("/Private/PublicPage");
    options.Conventions.AllowAnonymousToFolder("/Private/PublicPages");
});
```

## Note on combining authorized and anonymous access

```csharp
// This works.
.AuthorizeFolder("/Private").AllowAnonymousToPage("/Private/Public")
```

```csharp
// This doesn't work!
.AllowAnonymousToFolder("/Public").AuthorizePage("/Public/Private")
```

## Additional resources

 - Razor Pages route and app conventions in ASP.NET Core

 - PageConventionCollection

Ref: [Razor Pages authorization conventions in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/razor-pages-authorization?view=aspnetcore-8.0)