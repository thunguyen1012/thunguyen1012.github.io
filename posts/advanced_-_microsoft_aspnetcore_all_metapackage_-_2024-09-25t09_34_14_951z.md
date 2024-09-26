---
title: Advanced - Microsoft.AspNetCore.All metapackage
published: true
date: 2024-09-25 09:34:14
tags: Summary, AspNetCore
description: This feature requires ASP.NET Core 2.x targeting .NET Core 2.x.
image:
---

## In this article

> Note
The ```Microsoft.AspNetCore.All``` metapackage isn't used in ASP.NET Core 3.0 and later. For more information, see this GitHub issue.

> Note
We recommend applications targeting ASP.NET Core 2.1 and later use the ```Microsoft.AspNetCore.App``` metapackage rather than this package. See Migrating from ```Microsoft.AspNetCore.All``` to ```Microsoft.AspNetCore.App``` in this article.

This feature requires ASP.NET Core 2.x targeting .NET Core 2.x.

 ```Microsoft.AspNetCore.All``` is a metapackage that refers to a shared framework. A shared framework is a set of assemblies (.dll files) that are not in the app's folders. The shared framework must be installed on the machine to run the app. For more information, see The shared framework.

The shared framework that ```Microsoft.AspNetCore.All``` refers to includes:

- All supported packages by the ASP.NET Core team.

- All supported packages by the Entity Framework Core.

- Internal and 3rd-party dependencies used by ASP.NET Core and Entity Framework Core.

All the features of ASP.NET Core 2.x and Entity Framework Core 2.x are included in the ```Microsoft.AspNetCore.All``` package. The default project templates targeting ASP.NET Core 2.0 use this package.

The version number of the ```Microsoft.AspNetCore.All``` metapackage represents the minimum ASP.NET Core version and Entity Framework Core version.

The following ```.csproj``` file references the ```Microsoft.AspNetCore.All``` metapackage for ASP.NET Core:

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>netcoreapp2.0</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.All" Version="2.0.9" />
  </ItemGroup>

</Project>
```

## Implicit versioning



## Migrating from ```Microsoft.AspNetCore.All``` to ```Microsoft.AspNetCore.App```

The following packages are included in ```Microsoft.AspNetCore.All``` but not the ```Microsoft.AspNetCore.App``` package.

- ```Microsoft.AspNetCore.ApplicationInsights.HostingStartup```

- ```Microsoft.AspNetCore.AzureAppServices.HostingStartup```

- ```Microsoft.AspNetCore.AzureAppServicesIntegration```

- ```Microsoft.AspNetCore.DataProtection.AzureKeyVault```

- ```Microsoft.AspNetCore.DataProtection.AzureStorage```

- ```Microsoft.AspNetCore.Server.Kestrel.Transport.Libuv```

- ```Microsoft.AspNetCore.SignalR.Redis```

- ```Microsoft.Data.Sqlite```

- ```Microsoft.Data.Sqlite.Core```

- ```Microsoft.EntityFrameworkCore.Sqlite```

- ```Microsoft.EntityFrameworkCore.Sqlite.Core```

- ```Microsoft.Extensions.Caching.Redis```

- ```Microsoft.Extensions.Configuration.AzureKeyVault```

- ```Microsoft.Extensions.Logging.AzureAppServices```

- ```Microsoft.VisualStudio.Web.BrowserLink```

To move from ```Microsoft.AspNetCore.All``` to ```Microsoft.AspNetCore.App```, if your app uses any APIs from the above packages, or packages brought in by those packages, add references to those packages in your project.

Any dependencies of the preceding packages that otherwise aren't dependencies of ```Microsoft.AspNetCore.App``` are not included implicitly. For example:

- ```StackExchange.Redis``` as a dependency of ```Microsoft.Extensions.Caching.Redis```

- ```Microsoft.ApplicationInsights``` as a dependency of ```Microsoft.AspNetCore.ApplicationInsights.HostingStartup```

## Update ASP.NET Core 2.1

We recommend migrating to the ```Microsoft.AspNetCore.App``` metapackage for 2.1 and later. To keep using the ```Microsoft.AspNetCore.All``` metapackage and ensure the latest patch version is deployed:

- On development machines and build servers: Install the latest .NET Core SDK.

- On deployment servers: Install the latest .NET Core runtime.
Your app will roll forward to the latest installed version on an application restart.

Ref: [Microsoft.AspNetCore.All metapackage for ASP.NET Core 2.0](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/metapackage?view=aspnetcore-8.0)