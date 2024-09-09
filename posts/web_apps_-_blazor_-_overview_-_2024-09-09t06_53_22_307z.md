---
title: Web apps - Blazor - Overview
published: true
date: 2024-09-09 06:53:22
tags: Summary, AspNetCore
description: Welcome to Blazor!
image:
---

## In this article

Welcome to Blazor!

 - Create rich interactive UIs using C#.

 - Share server-side and client-side app logic written in .NET.

 - Render the UI as HTML and CSS for wide browser support, including mobile browsers.

 - Build hybrid desktop and mobile apps with .NET and Blazor.

Using .NET for client-side web development offers the following advantages:

- Write code in C#, which can improve productivity in app development and maintenance.

- Leverage the existing .NET ecosystem of .NET libraries.

- Benefit from .NET's performance, reliability, and security.

- Stay productive on Windows, Linux, or macOS with a development environment, such as Visual Studio or Visual Studio Code. Integrate with modern hosting platforms, such as Docker.

- Build on a common set of languages, frameworks, and tools that are stable, feature-rich, and easy to use.

> Note
For a Blazor quick start tutorial, see Build your first Blazor app.

## Components

Blazor apps are based on components. A component in Blazor is an element of UI, such as a page, dialog, or data entry form.

Components are .NET C# classes built into .NET assemblies that:

- Define flexible UI rendering logic.

- Handle user events.

- Can be nested and reused.

- Can be shared and distributed as Razor class libraries or NuGet packages.

The component class is usually written in the form of a Razor markup page with a ```.razor``` file extension. Components in Blazor are formally referred to as Razor components, informally as Blazor components. Razor is a syntax for combining HTML markup with C# code designed for developer productivity. Razor allows you to switch between HTML markup and C# in the same file with IntelliSense programming support in Visual Studio.

Blazor uses natural HTML tags for UI composition. The following Razor markup demonstrates a component that increments a counter when the user selects a button.

```razor
<PageTitle>Counter</PageTitle>

<h1>Counter</h1>

<p role="status">Current count: @currentCount</p>

<button class="btn btn-primary" @onclick="IncrementCount">Click me</button>

@code {
    private int currentCount = 0;

    private void IncrementCount()
    {
        currentCount++;
    }
}
```

Components render into an in-memory representation of the browser's Document Object Model (DOM) called a render tree, which is used to update the UI in a flexible and efficient way.

## Build a full-stack web app with Blazor

## Build a native client app with Blazor Hybrid

## Next steps

Ref: [ASP.NET Core Blazor](https://learn.microsoft.com/en-us/aspnet/core/blazor/?view=aspnetcore-8.0)