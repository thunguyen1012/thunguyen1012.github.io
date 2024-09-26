---
title: Advanced - ASP.NET Core in class libraries
published: true
date: 2024-09-25 09:34:14
tags: Summary, AspNetCore
description:
image:
---

## In this article

This document provides guidance for using ASP.NET Core APIs in a class library. For all other library guidance, see Open-source library guidance.

## Determine which ASP.NET Core versions to support

ASP.NET Core adheres to the .NET Core support policy. Consult the support policy when determining which ASP.NET Core versions to support in a library. A library should:

- Make an effort to support all ASP.NET Core versions classified as Long-Term Support (LTS).

- Not feel obligated to support ASP.NET Core versions classified as End of Life (EOL).

The ASP.NET Core framework is being developed by Microsoft.

## Use the ASP.NET Core shared framework

With the release of .NET Core 3.0, many ASP.NET Core assemblies are no longer published to NuGet as packages. Instead, the assemblies are included in the ```Microsoft.AspNetCore.App``` shared framework, which is installed with the .NET Core SDK and runtime installers. For a list of packages no longer being published, see Remove obsolete package references.

As of .NET Core 3.0, projects using the ```Microsoft.NET.Sdk.Web``` MSBuild SDK implicitly reference the shared framework. Projects using the ```Microsoft.NET.Sdk``` or ```Microsoft.NET.Sdk.Razor``` SDK must reference ASP.NET Core to use ASP.NET Core APIs in the shared framework.

To reference ASP.NET Core, add the following `<FrameworkReference>` element to your project file:

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>netcoreapp3.1</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <FrameworkReference Include="Microsoft.AspNetCore.App" />
  </ItemGroup>

</Project>
```

## Include Blazor extensibility

Blazor supports creating Razor components class libraries for server-side and client-side apps. To support Razor components in a class library, the class library must use the ```Microsoft.NET.Sdk.Razor``` SDK.

### Support server-side and client-side apps

To support Razor component consumption by server-side and client-side apps from a single library, use the following instructions for your editor.

 - Visual Studio

 - Visual Studio Code / .NET CLI

> Note
Do not select the Support pages and views checkbox. Selecting the checkbox results in a class library that only supports server-side apps.

```dotnetcli
dotnet new razorclasslib
```

> Note
Do not add the ```-s|--support-pages-and-views``` option to the ```dotnet new``` command. Applying the option results in a class library that only supports server-side apps.

The library generated from the project template:

- Targets the current .NET framework based on the installed SDK.

- Enables ```browser``` compatibility checks for platform dependencies by including ```browser``` as a supported platform with the ```SupportedPlatform``` MSBuild item.

- Adds a NuGet package reference for Microsoft.AspNetCore.Components.Web.

 ```RazorClassLibrary-CSharp.csproj``` (reference source)

> Note
Documentation links to .NET reference source usually load the repository's default branch, which represents the current development for the next release of .NET. To select a tag for a specific release, use the Switch branches or tags dropdown list. For more information, see How to select a version tag of ASP.NET Core source code (dotnet/AspNetCore.Docs #26205).

### Support multiple framework versions

If the library must support features added to Blazor in the current release while also supporting one or more earlier releases, multi-target the library. Provide a semicolon-separated list of Target Framework Monikers (TFMs) in the ```TargetFrameworks``` MSBuild property:

```xml
<TargetFrameworks>{TARGET FRAMEWORKS}</TargetFrameworks>
```

In the preceding example, the {TARGET FRAMEWORKS} placeholder represents the semicolon-separated TFMs list. For example, ```netcoreapp3.1;net5.0```.

### Only support server-side consumption

In this article, I'm going to show you how to build a server-side app using an ASP.NET class library.

- Specify that the library supports pages and views when the library is created with the Support pages and views checkbox (Visual Studio) or the ```-s|--support-pages-and-views``` option with the ```dotnet new``` command:
dotnet new razorclasslib -s

```dotnetcli
dotnet new razorclasslib -s
```

- Only provide a framework reference to ASP.NET Core in the library's project file in addition to any other required MSBuild properties:
<ItemGroup>
  <FrameworkReference Include="Microsoft.AspNetCore.App" />
</ItemGroup>

```xml
<ItemGroup>
  <FrameworkReference Include="Microsoft.AspNetCore.App" />
</ItemGroup>
```

For more information on libraries containing Razor components, see Consume ASP.NET Core Razor components from a Razor class library (RCL).

## Include MVC extensibility

This section outlines recommendations for libraries that include:

- Razor views or Razor Pages

- Tag Helpers

- View components

This section doesn't discuss multi-targeting to support multiple versions of MVC. For guidance on supporting multiple ASP.NET Core versions, see Support multiple ASP.NET Core versions.

### Razor views or Razor Pages

A project that includes Razor views or Razor Pages must use the ```Microsoft.NET.Sdk.Razor``` SDK.

If the project targets .NET Core 3.x, it requires:

- An ```AddRazorSupportForMvc``` MSBuild property set to ```true```.

- A <FrameworkReference> element for the shared framework.

The Razor Class Library project template satisfies the preceding requirements for projects targeting .NET Core. Use the following instructions for your editor.

 - Visual Studio

 - Visual Studio Code / .NET CLI

```dotnetcli
dotnet new razorclasslib -s
```

For example:

```xml
<Project Sdk="Microsoft.NET.Sdk.Razor">

  <PropertyGroup>
    <TargetFramework>netcoreapp3.1</TargetFramework>
    <AddRazorSupportForMvc>true</AddRazorSupportForMvc>
  </PropertyGroup>

  <ItemGroup>
    <FrameworkReference Include="Microsoft.AspNetCore.App" />
  </ItemGroup>

</Project>
```

If the project targets .NET Standard instead, a ```Microsoft.AspNetCore.Mvc``` package reference is required. The ```Microsoft.AspNetCore.Mvc``` package moved into the shared framework in ASP.NET Core 3.0 and is therefore no longer published. For example:

```xml
<Project Sdk="Microsoft.NET.Sdk.Razor">

  <PropertyGroup>
    <TargetFramework>netstandard2.0</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Mvc" Version="2.2.0" />
  </ItemGroup>

</Project>
```

### Tag Helpers

A project that includes Tag Helpers should use the ```Microsoft.NET.Sdk``` SDK. If targeting .NET Core 3.x, add a `<FrameworkReference>` element for the shared framework. For example:

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>netcoreapp3.1</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <FrameworkReference Include="Microsoft.AspNetCore.App" />
  </ItemGroup>

</Project>
```

If targeting .NET Standard (to support versions earlier than ASP.NET Core 3.x), add a package reference to ```Microsoft.AspNetCore.Mvc.Razor```. The ```Microsoft.AspNetCore.Mvc.Razor``` package moved into the shared framework and is therefore no longer published. For example:

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>netstandard2.0</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Mvc" Version="2.2.0" />
  </ItemGroup>

</Project>
```

### View components

A project that includes View components should use the ```Microsoft.NET.Sdk``` SDK. If targeting .NET Core 3.x, add a `<FrameworkReference>` element for the shared framework. For example:

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>netcoreapp3.1</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <FrameworkReference Include="Microsoft.AspNetCore.App" />
  </ItemGroup>

</Project>
```

If targeting .NET Standard (to support versions earlier than ASP.NET Core 3.x), add a package reference to ```Microsoft.AspNetCore.Mvc.ViewFeatures```. The ```Microsoft.AspNetCore.Mvc.ViewFeatures``` package moved into the shared framework and is therefore no longer published. For example:

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>netstandard2.0</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Mvc.ViewFeatures" Version="2.2.0" />
  </ItemGroup>

</Project>
```

## Support multiple ASP.NET Core versions

Multi-targeting is required to author a library that supports multiple variants of ASP.NET Core. Consider a scenario in which a Tag Helpers library must support the following ASP.NET Core variants:

- ASP.NET Core 2.1 targeting .NET Framework 4.6.1

- ASP.NET Core 2.x targeting .NET Core 2.x

- ASP.NET Core 3.x targeting .NET Core 3.x

The following project file supports these variants via the ```TargetFrameworks``` property:

```xml
<Project Sdk="Microsoft.NET.Sdk">
  
  <PropertyGroup>
    <TargetFrameworks>netcoreapp2.1;netcoreapp3.1;net461</TargetFrameworks>
  </PropertyGroup>
  
  <ItemGroup>
    <PackageReference Include="Markdig" Version="0.16.0" />
  </ItemGroup>
  
  <ItemGroup Condition="'$(TargetFramework)' != 'netcoreapp3.1'">
    <PackageReference Include="Microsoft.AspNetCore.Mvc.Razor" Version="2.1.0" />
  </ItemGroup>

  <ItemGroup Condition="'$(TargetFramework)' == 'netcoreapp3.1'">
    <FrameworkReference Include="Microsoft.AspNetCore.App" />
  </ItemGroup>
</Project>
```

With the preceding project file:

- The ```Markdig``` package is added for all consumers.

- A reference to ```Microsoft.AspNetCore.Mvc.Razor``` is added for consumers targeting .NET Framework 4.6.1 or later or .NET Core 2.x. Version 2.1.0 of the package works with ASP.NET Core 2.2 because of backwards compatibility.

- The shared framework is referenced for consumers targeting .NET Core 3.x. The ```Microsoft.AspNetCore.Mvc.Razor``` package is included in the shared framework.

Alternatively, .NET Standard 2.0 could be targeted instead of targeting both .NET Core 2.1 and .NET Framework 4.6.1:

```xml
<Project Sdk="Microsoft.NET.Sdk">
  
  <PropertyGroup>
    <TargetFrameworks>netstandard2.0;netcoreapp3.1</TargetFrameworks>
  </PropertyGroup>
  
  <ItemGroup>
    <PackageReference Include="Markdig" Version="0.16.0" />
  </ItemGroup>
  
  <ItemGroup Condition="'$(TargetFramework)' != 'netcoreapp3.1'">
    <PackageReference Include="Microsoft.AspNetCore.Mvc.Razor" Version="2.1.0" />
  </ItemGroup>

  <ItemGroup Condition="'$(TargetFramework)' == 'netcoreapp3.1'">
    <FrameworkReference Include="Microsoft.AspNetCore.App" />
  </ItemGroup>
</Project>
```

With the preceding project file, the following caveats exist:

- Since the library only contains Tag Helpers, it's more straightforward to target the specific platforms on which ASP.NET Core runs: .NET Core and .NET Framework. Tag Helpers can't be used by other .NET Standard 2.0-compliant target frameworks such as Unity, UWP, and Xamarin.

- Using .NET Standard 2.0 from .NET Framework has some issues that were addressed in .NET Framework 4.7.2. You can improve the experience for consumers using .NET Framework 4.6.1 through 4.7.1 by targeting .NET Framework 4.6.1.

If your library needs to call platform-specific APIs, target specific .NET implementations instead of .NET Standard. For more information, see Multi-targeting.

## Use an API that hasn't changed

In this article, I'm going to show you how to continue using the ASP.NET Core APIs in .NET Core 3.1.

- Follow the standard library guidance.

- Add a package reference for each API's NuGet package if the corresponding assembly doesn't exist in the shared framework.

## Use an API that changed

If you're upgrading to .NET Core 3.1 or later, it's a good idea to consider whether you can rewrite the library to not use the broken API in all versions.

If you can rewrite the library, do so and continue to target an earlier target framework (for example, .NET Standard 2.0 or .NET Framework 4.6.1) with package references.

If you can't rewrite the library, take the following steps:

- Add a target for .NET Core 3.1.

- Add a <FrameworkReference> element for the shared framework.

- Use the #if preprocessor directive with the appropriate target framework symbol to conditionally compile code.

In this article, you will learn how to enable synchronous features in your ASP.NET code.

```csharp
public async Task Invoke(HttpContext httpContext)
{
    if (httpContext.Request.Path.StartsWithSegments(_path, StringComparison.Ordinal))
    {
        httpContext.Response.StatusCode = (int) HttpStatusCode.OK;
        httpContext.Response.ContentType = "application/json";
        httpContext.Response.ContentLength = _bufferSize;

#if !NETCOREAPP3_1 && !NETCOREAPP5_0
        var syncIOFeature = httpContext.Features.Get<IHttpBodyControlFeature>();
        if (syncIOFeature != null)
        {
            syncIOFeature.AllowSynchronousIO = true;
        }

        using (var sw = new StreamWriter(
            httpContext.Response.Body, _encoding, bufferSize: _bufferSize))
        {
            _json.Serialize(sw, new JsonMessage { message = "Hello, World!" });
        }
#else
        await JsonSerializer.SerializeAsync<JsonMessage>(
            httpContext.Response.Body, new JsonMessage { message = "Hello, World!" });
#endif
        return;
    }

    await _next(httpContext);
}
```

## Use an API introduced in 3.1

Imagine that you want to use an ASP.NET Core API that was introduced in ASP.NET Core 3.1. Consider the following questions:

- Does the library functionally require the new API?

- Can the library implement this feature in a different way?

If the library functionally requires the API and there's no way to implement it down-level:

- Target .NET Core 3.x only.

- Add a `<FrameworkReference>` element for the shared framework.

If the library can implement the feature in a different way:

- Add .NET Core 3.x as a target framework.

- Add a `<FrameworkReference>` element for the shared framework.

- Use the #if preprocessor directive with the appropriate target framework symbol to conditionally compile code.

For example, the following Tag Helper uses the ```IWebHostEnvironment``` interface introduced in ASP.NET Core 3.1. Consumers targeting .NET Core 3.1 execute the code path defined by the ```NETCOREAPP3_1``` target framework symbol. The Tag Helper's constructor parameter type changes to ```IHostingEnvironment``` for .NET Core 2.1 and .NET Framework 4.6.1 consumers. This change was necessary because ASP.NET Core 3.1 marked ```IHostingEnvironment``` as obsolete and recommended ```IWebHostEnvironment``` as the replacement.

```csharp
[HtmlTargetElement("script", Attributes = "asp-inline")]
public class ScriptInliningTagHelper : TagHelper
{
    private readonly IFileProvider _wwwroot;

#if NETCOREAPP3_1
    public ScriptInliningTagHelper(IWebHostEnvironment env)
#else
    public ScriptInliningTagHelper(IHostingEnvironment env)
#endif
    {
        _wwwroot = env.WebRootFileProvider;
    }

    // code omitted for brevity
}
```

The following multi-targeted project file supports this Tag Helper scenario:

```xml
<Project Sdk="Microsoft.NET.Sdk">
  
  <PropertyGroup>
    <TargetFrameworks>netcoreapp2.1;netcoreapp3.1;net461</TargetFrameworks>
  </PropertyGroup>
  
  <ItemGroup>
    <PackageReference Include="Markdig" Version="0.16.0" />
  </ItemGroup>
  
  <ItemGroup Condition="'$(TargetFramework)' != 'netcoreapp3.1'">
    <PackageReference Include="Microsoft.AspNetCore.Mvc.Razor" Version="2.1.0" />
  </ItemGroup>

  <ItemGroup Condition="'$(TargetFramework)' == 'netcoreapp3.1'">
    <FrameworkReference Include="Microsoft.AspNetCore.App" />
  </ItemGroup>
</Project>
```

## Use an API removed from the shared framework

To use an ASP.NET Core assembly that was removed from the shared framework, add the appropriate package reference.

For example, to add the web API client:

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net6.0</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <FrameworkReference Include="Microsoft.AspNetCore.App" />
  </ItemGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNet.WebApi.Client" Version="5.2.7" />
  </ItemGroup>

</Project>
```

## Additional resources

- Reusable Razor UI in class libraries with ASP.NET Core

- Consume ASP.NET Core Razor components from a Razor class library (RCL)

- .NET implementation support

- .NET support policies

Ref: [Use ASP.NET Core APIs in a class library](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/target-aspnetcore?view=aspnetcore-8.0)