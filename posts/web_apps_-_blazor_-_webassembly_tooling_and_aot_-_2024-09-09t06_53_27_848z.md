---
title: Web apps - Blazor - WebAssembly tooling and AOT
published: true
date: 2024-09-09 06:53:27
tags: Summary, AspNetCore
description: This article describes the build tools for standalone Blazor WebAssembly apps and how to compile an app ahead of deployment with ahead-of-time (AOT) compilation.
image:
---

## In this article

This article describes the build tools for standalone Blazor WebAssembly apps and how to compile an app ahead of deployment with ahead-of-time (AOT) compilation.

Although the article primarily focuses on standalone Blazor WebAssembly apps, the section on heap size for some mobile device browsers also applies to the client-side project (.Client) of a Blazor Web App.

## .NET WebAssembly build tools

The .NET WebAssembly build tools are based on Emscripten, a compiler toolchain for the web platform. To install the build tools, use either of the following approaches:

- For the ASP.NET and web development workload in the Visual Studio installer, select the .NET WebAssembly build tools option from the list of optional components.

- Execute ```dotnet workload install wasm-tools``` in an administrative command shell.

> Note
.NET WebAssembly build tools for .NET 6 projects
The ```wasm-tools``` workload installs the build tools for the latest release. However, the current version of the build tools are incompatible with existing projects built with .NET 6. Projects using the build tools that must support both .NET 6 and a later release must use multi-targeting.
Use the ```wasm-tools-net6``` workload for .NET 6 projects when developing apps with the .NET 7 SDK. To install the ```wasm-tools-net6``` workload, execute the following command from an administrative command shell:
dotnet workload install ```wasm-tools-net6```

```dotnetcli
dotnet workload install wasm-tools-net6
```

## Ahead-of-time (AOT) compilation

Blazor WebAssembly is a high-performance .NET framework for building web apps.

For guidance on installing the .NET WebAssembly build tools, see ASP.NET Core Blazor WebAssembly build tools and ahead-of-time (AOT) compilation.

To enable WebAssembly AOT compilation, add the `<RunAOTCompilation>` property set to ```true``` to the Blazor WebAssembly app's project file:

```xml
<PropertyGroup>
  <RunAOTCompilation>true</RunAOTCompilation>
</PropertyGroup>
```

To compile the app to WebAssembly, publish the app. Publishing the ```Release``` configuration ensures the .NET Intermediate Language (IL) linking is also run to reduce the size of the published app:

```dotnetcli
dotnet publish -c Release
```

WebAssembly AOT compilation is only performed when the project is published. AOT compilation isn't used when the project is run during development (Development environment) because AOT compilation usually takes several minutes on small projects and potentially much longer for larger projects. Reducing the build time for AOT compilation is under development for future releases of ASP.NET Core.

The size of an AOT-compiled Blazor WebAssembly app is generally larger than the size of the app if compiled into .NET IL:

- Although the size difference depends on the app, most AOT-compiled apps are about twice the size of their IL-compiled versions. This means that using AOT compilation trades off load-time performance for runtime performance. Whether this tradeoff is worth using AOT compilation depends on your app. Blazor WebAssembly apps that are CPU intensive generally benefit the most from AOT compilation.

- The larger size of an AOT-compiled app is due to two conditions:

  - More code is required to represent high-level .NET IL instructions in native WebAssembly.

  - AOT does not trim out managed DLLs when the app is published. Blazor requires the DLLs for reflection metadata and to support certain .NET runtime features. Requiring the DLLs on the client increases the download size but provides a more compatible .NET experience.

> Note
For Mono/WebAssembly MSBuild properties and targets, see ```WasmApp.Common.targets``` (dotnet/runtime GitHub repository). Official documentation for common MSBuild properties is planned per Document blazor msbuild configuration options (dotnet/docs #27395).

## Trim .NET IL after ahead-of-time (AOT) compilation

```xml
<PropertyGroup>
  <RunAOTCompilation>true</RunAOTCompilation>
  <WasmStripILAfterAOT>true</WasmStripILAfterAOT>
</PropertyGroup>
```

```xml
<WasmStripILAfterAOT>false</WasmStripILAfterAOT>
```

## Heap size for some mobile device browsers

When building a Blazor app that runs on the client and targets mobile device browsers, especially Safari on iOS, decreasing the maximum memory for the app with the MSBuild property ```EmccMaximumHeapSize``` may be required. For more information, see Host and deploy ASP.NET Core Blazor WebAssembly.

## Runtime relinking

One of the largest parts of a Blazor WebAssembly app is the WebAssembly-based .NET runtime (dotnet.wasm) that the browser must download when the app is first accessed by a user's browser. Relinking the .NET WebAssembly runtime trims unused runtime code and thus improves download speed.

Runtime relinking requires installation of the .NET WebAssembly build tools. For more information, see Tooling for ASP.NET Core Blazor.

With the .NET WebAssembly build tools installed, runtime relinking is performed automatically when an app is published in the ```Release``` configuration. The size reduction is particularly dramatic when disabling globalization. For more information, see ASP.NET Core Blazor globalization and localization.

> Important
Runtime relinking trims class instance JavaScript-invokable .NET methods unless they're protected. For more information, see Call .NET methods from JavaScript functions in ASP.NET Core Blazor.

## Single Instruction, Multiple Data (SIMD)

```xml
<PropertyGroup>
  <WasmEnableSIMD>false</WasmEnableSIMD>
</PropertyGroup>
```

## Exception handling

```xml
<PropertyGroup>
  <WasmEnableExceptionHandling>false</WasmEnableExceptionHandling>
</PropertyGroup>
```

For more information, see the following resources:

- Configuring and hosting .NET WebAssembly applications: EH - Exception handling

- Exception handling

## Additional resources

- ASP.NET Core Blazor WebAssembly native dependencies

- Webcil packaging format for .NET assemblies

Ref: [ASP.NET Core Blazor WebAssembly build tools and ahead-of-time (AOT) compilation](https://learn.microsoft.com/en-us/aspnet/core/blazor/webassembly-build-tools-and-aot?view=aspnetcore-8.0)