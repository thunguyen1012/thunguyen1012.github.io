---
title: Advanced - Hosting startup assemblies
published: true
date: 2024-09-25 09:33:55
tags: Summary, AspNetCore
description:
image:
---

## In this article

## ```HostingStartup``` attribute

```csharp
[assembly: HostingStartup(typeof(StartupEnhancement.StartupEnhancementHostingStartup))]
```

## Discover loaded hosting startup assemblies

## Disable automatic loading of hosting startup assemblies

 - To prevent all hosting startup assemblies from loading, set one of the following to ```true``` or ```1```:

   - Prevent Hosting ```Startup``` host configuration setting:

```csharp
public static IHostBuilder CreateHostBuilder(string[] args) =>
    Host.CreateDefaultBuilder(args)
        .ConfigureWebHostDefaults(webBuilder =>
        {
            webBuilder.UseSetting(
                    WebHostDefaults.PreventHostingStartupKey, "true")
                .UseStartup<Startup>();
        });
```

   - ```ASPNETCORE_PREVENTHOSTINGSTARTUP``` environment variable.

 - To prevent specific hosting startup assemblies from loading, set one of the following to a semicolon-delimited string of hosting startup assemblies to exclude at startup:

   - Hosting ```Startup``` Exclude Assemblies host configuration setting:
```csharp
public static IHostBuilder CreateHostBuilder(string[] args) =>
    Host.CreateDefaultBuilder(args)
        .ConfigureWebHostDefaults(webBuilder =>
        {
            webBuilder.UseSetting(
                    WebHostDefaults.HostingStartupExcludeAssembliesKey, 
                    "{ASSEMBLY1;ASSEMBLY2; ...}")
                .UseStartup<Startup>();
        });
```

The {ASSEMBLY1;ASSEMBLY2; ...} placeholder represents the semicolon-separated list of assemblies.

   - ```ASPNETCORE_HOSTINGSTARTUPEXCLUDEASSEMBLIES``` environment variable.

## Project

 - Class library

 - Console app without an entry point

### Class library

 - Contains a hosting startup class, ```ServiceKeyInjection```, which implements ```IHostingStartup```. ```ServiceKeyInjection``` adds a pair of service strings to the app's configuration using the in-memory configuration provider (AddInMemoryCollection).

 - Includes a ```HostingStartup``` attribute that identifies the hosting startup's namespace and class.

```csharp
[assembly: HostingStartup(typeof(HostingStartupLibrary.ServiceKeyInjection))]

namespace HostingStartupLibrary
{
    public class ServiceKeyInjection : IHostingStartup
    {
        public void Configure(IWebHostBuilder builder)
        {
            builder.ConfigureAppConfiguration(config =>
            {
                var dict = new Dictionary<string, string>
                {
                    {"DevAccount_FromLibrary", "DEV_1111111-1111"},
                    {"ProdAccount_FromLibrary", "PROD_2222222-2222"}
                };

                config.AddInMemoryCollection(dict);
            });
        }
    }
}
```

```csharp
public class IndexModel : PageModel
{
    public IndexModel(IConfiguration config)
    {
        ServiceKey_Development_Library = config["DevAccount_FromLibrary"];
        ServiceKey_Production_Library = config["ProdAccount_FromLibrary"];
        ServiceKey_Development_Package = config["DevAccount_FromPackage"];
        ServiceKey_Production_Package = config["ProdAccount_FromPackage"];
    }

    public string ServiceKey_Development_Library { get; private set; }
    public string ServiceKey_Production_Library { get; private set; }
    public string ServiceKey_Development_Package { get; private set; }
    public string ServiceKey_Production_Package { get; private set; }

    public void OnGet()
    {
    }
}
```

 - Contains a hosting startup class, ```ServiceKeyInjection```, which implements ```IHostingStartup```. ```ServiceKeyInjection``` adds a pair of service strings to the app's configuration.

 - Includes a ```HostingStartup``` attribute.

```csharp
[assembly: HostingStartup(typeof(HostingStartupPackage.ServiceKeyInjection))]

namespace HostingStartupPackage
{
    public class ServiceKeyInjection : IHostingStartup
    {
        public void Configure(IWebHostBuilder builder)
        {
            builder.ConfigureAppConfiguration(config =>
            {
                var dict = new Dictionary<string, string>
                {
                    {"DevAccount_FromPackage", "DEV_3333333-3333"},
                    {"ProdAccount_FromPackage", "PROD_4444444-4444"}
                };

                config.AddInMemoryCollection(dict);
            });
        }
    }
}
```

```csharp
public class IndexModel : PageModel
{
    public IndexModel(IConfiguration config)
    {
        ServiceKey_Development_Library = config["DevAccount_FromLibrary"];
        ServiceKey_Production_Library = config["ProdAccount_FromLibrary"];
        ServiceKey_Development_Package = config["DevAccount_FromPackage"];
        ServiceKey_Production_Package = config["ProdAccount_FromPackage"];
    }

    public string ServiceKey_Development_Library { get; private set; }
    public string ServiceKey_Production_Library { get; private set; }
    public string ServiceKey_Development_Package { get; private set; }
    public string ServiceKey_Production_Package { get; private set; }

    public void OnGet()
    {
    }
}
```

### Console app without an entry point

 - A dependencies file is required to consume the hosting startup in the hosting startup assembly. A dependencies file is a runnable app asset that's produced by publishing an app, not a library.

 - A library can't be added directly to the ```runtime``` package store, which requires a runnable project that ```targets``` the shared ```runtime```.

 - A hosting startup assembly is created from the console app without an entry point that:

   - Includes a class that contains the ```IHostingStartup``` implementation.

   - Includes a ```HostingStartup``` attribute to identify the ```IHostingStartup``` implementation class.

 - The console app is published to obtain the hosting startup's dependencies. A consequence of publishing the console app is that unused dependencies are trimmed from the dependencies file.

 - The dependencies file is modified to set the ```runtime``` location of the hosting startup assembly.

 - The hosting startup assembly and its dependencies file is placed into the ```runtime``` package store. To discover the hosting startup assembly and its dependencies file, they're listed in a pair of environment variables.

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>netcoreapp3.0</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Hosting.Abstractions" 
                      Version="3.0.0" />
  </ItemGroup>

</Project>
```

```csharp
[assembly: HostingStartup(typeof(StartupEnhancement.StartupEnhancementHostingStartup))]
```

```csharp
namespace StartupEnhancement
{
    public class StartupEnhancementHostingStartup : IHostingStartup
    {
        public void Configure(IWebHostBuilder builder)
        {
            // Use the IWebHostBuilder to add app enhancements.
        }
    }
}
```

```json
"targets": {
  ".NETCoreApp,Version=v3.0": {
    "StartupEnhancement/1.0.0": {
      "dependencies": {
        "Microsoft.AspNetCore.Hosting.Abstractions": "3.0.0"
      },
      "runtime": {
        "StartupEnhancement.dll": {}
      }
    }
  }
}
```

## Configuration provided by the hosting startup

 - Provide configuration to the app using ConfigureAppConfiguration to load the configuration after the app's ConfigureAppConfiguration delegates execute. Hosting startup configuration takes priority over the app's configuration using this approach.

 - Provide configuration to the app using UseConfiguration to load the configuration before the app's ConfigureAppConfiguration delegates execute. The app's configuration values take priority over those provided by the hosting startup using this approach.

```csharp
public class ConfigurationInjection : IHostingStartup
{
    public void Configure(IWebHostBuilder builder)
    {
        Dictionary<string, string> dict;

        builder.ConfigureAppConfiguration(config =>
        {
            dict = new Dictionary<string, string>
            {
                {"ConfigurationKey1", 
                    "From IHostingStartup: Higher priority " +
                    "than the app's configuration."},
            };

            config.AddInMemoryCollection(dict);
        });

        dict = new Dictionary<string, string>
        {
            {"ConfigurationKey2", 
                "From IHostingStartup: Lower priority " +
                "than the app's configuration."},
        };

        var builtConfig = new ConfigurationBuilder()
            .AddInMemoryCollection(dict)
            .Build();

        builder.UseConfiguration(builtConfig);
    }
}
```

## Specify the hosting startup assembly

```csharp
public static IHostBuilder CreateHostBuilder(string[] args) =>
    Host.CreateDefaultBuilder(args)
        .ConfigureWebHostDefaults(webBuilder =>
        {
            webBuilder.UseSetting(
                    WebHostDefaults.HostingStartupAssembliesKey, 
                    "{ASSEMBLY1;ASSEMBLY2; ...}")
                .UseStartup<Startup>();
        });
```

## Activation

 - Runtime store: Activation doesn't require a compile-time reference for activation. The sample app places the hosting startup assembly and dependencies files into a folder, deployment, to facilitate deployment of the hosting startup in a multimachine environment. The deployment folder also includes a PowerShell script that creates or modifies environment variables on the deployment system to enable the hosting startup.

 - Compile-time reference required for activation

   - NuGet package

   - Project bin folder

### Runtime store

```dotnetcli
dotnet store --manifest {MANIFEST FILE} --runtime {RUNTIME IDENTIFIER} --output {OUTPUT LOCATION} --skip-optimization
```

```dotnetcli
dotnet store --manifest store.manifest.csproj --runtime win7-x64 --output ./deployment/store --skip-optimization
```

 - Extend the app's library graph by providing a set of additional ```.deps.json``` files to merge with the app's own ```.deps.json``` file on startup.

 - Make the hosting startup assembly discoverable and loadable.

 - Execute ```dotnet publish``` on the ```runtime``` store manifest file referenced in the previous section.

 - Remove the manifest reference from ```libraries``` and the ```runtime``` section of the resulting ```.deps.json``` file.

```json
{
  "runtimeTarget": {
    "name": ".NETCoreApp,Version=v3.0",
    "signature": ""
  },
  "compilationOptions": {},
  "targets": {
    ".NETCoreApp,Version=v3.0": {
      "store.manifest/1.0.0": {
        "dependencies": {
          "StartupDiagnostics": "1.0.0"
        },
        "runtime": {
          "store.manifest.dll": {}
        }
      },
      "StartupDiagnostics/1.0.0": {
        "runtime": {
          "lib/netcoreapp3.0/StartupDiagnostics.dll": {
            "assemblyVersion": "1.0.0.0",
            "fileVersion": "1.0.0.0"
          }
        }
      }
    }
  },
  "libraries": {
    "store.manifest/1.0.0": {
      "type": "project",
      "serviceable": false,
      "sha512": ""
    },
    "StartupDiagnostics/1.0.0": {
      "type": "package",
      "serviceable": true,
      "sha512": "sha512-xrhzuNSyM5/f4ZswhooJ9dmIYLP64wMnqUJSyTKVDKDVj5T+qtzypl8JmM/aFJLLpYrf0FYpVWvGujd7/FfMEw==",
      "path": "startupdiagnostics/1.0.0",
      "hashPath": "startupdiagnostics.1.0.0.nupkg.sha512"
    }
  }
}
```

 - {ADDITIONAL DEPENDENCIES PATH}: Location added to the ```DOTNET_ADDITIONAL_DEPS``` environment variable.

 - {SHARED FRAMEWORK NAME}: Shared framework required for this additional dependencies file.

 - {SHARED FRAMEWORK VERSION}: Minimum shared framework version.

 - {ENHANCEMENT ASSEMBLY NAME}: The enhancement's assembly name.

 - The hosting startup ```runtime``` store.

 - The hosting startup dependencies file.

 - A PowerShell script that creates or modifies the ```ASPNETCORE_HOSTINGSTARTUPASSEMBLIES```, ```DOTNET_SHARED_STORE```, and ```DOTNET_ADDITIONAL_DEPS``` to support the activation of the hosting startup. Run the script from an administrative PowerShell command prompt on the deployment system.

### NuGet package

 - The enhanced app's project file makes a package reference for the hosting startup in the app's project file (a compile-time reference). With the compile-time reference in place, the hosting startup assembly and all of its dependencies are incorporated into the app's dependency file (.deps.json). This approach applies to a hosting startup assembly package published to nuget.org.

 - The hosting startup's dependencies file is made available to the enhanced app as described in the Runtime store section (without a compile-time reference).

 - How to Create a NuGet Package with Cross Platform Tools

 - Publishing packages

 - Runtime package store

### Project bin folder

 - The enhanced app's project file makes an assembly reference to the hosting startup (a compile-time reference). With the compile-time reference in place, the hosting startup assembly and all of its dependencies are incorporated into the app's dependency file (.deps.json). This approach applies when the deployment scenario calls for making a compile-time reference to the hosting startup's assembly (.dll file) and moving the assembly to either:

   - The consuming project.

   - A location accessible by the consuming project.

 - The hosting startup's dependencies file is made available to the enhanced app as described in the Runtime store section (without a compile-time reference).

 - When targeting the .NET Framework, the assembly is loadable in the default load context, which on .NET Framework means that the assembly is located at either of the following locations:

   - Application base path: The bin folder where the app's executable (.exe) is located.

   - Global Assembly Cache (GAC): The GAC stores assemblies that several .NET Framework apps share. For more information, see How to: Install an assembly into the global assembly cache in the .NET Framework documentation.

## Sample code

 - Two hosting startup assemblies (class ```libraries```) set a pair of in-memory configuration key-value pairs each:

   - NuGet package (HostingStartupPackage)

   - Class library (HostingStartupLibrary)

 - A hosting startup is activated from a ```runtime``` store-deployed assembly (StartupDiagnostics). The assembly adds two middlewares to the app at startup that provide diagnostic information on:

   - Registered services

   - Address (scheme, host, path base, path, query string)

   - Connection (remote IP, remote port, local IP, local port, client certificate)

   - Request headers

   - Environment variables

 - Compile the HostingStartupPackage package with the dotnet pack command.

 - Add the package's assembly name of the HostingStartupPackage to the ```ASPNETCORE_HOSTINGSTARTUPASSEMBLIES``` environment variable.

 - Compile and run the app. A package reference is present in the enhanced app (a compile-time reference). A <PropertyGroup> in the app's project file specifies the package project's output (../HostingStartupPackage/bin/Debug) as a package source. This allows the app to use the package without uploading the package to nuget.org. For more information, see the notes in the HostingStartupApp's project file.

```xml
<PropertyGroup>
  <RestoreSources>$(RestoreSources);https://api.nuget.org/v3/index.json;../HostingStartupPackage/bin/Debug</RestoreSources>
</PropertyGroup>
```

 - Observe that the service configuration key values rendered by the Index page match the values set by the package's ```ServiceKeyInjection.Configure``` method.

```dotnetcli
dotnet nuget locals all --clear
```

 - Compile the HostingStartupLibrary class library with the dotnet build command.

 - Add the class library's assembly name of HostingStartupLibrary to the ```ASPNETCORE_HOSTINGSTARTUPASSEMBLIES``` environment variable.

 - bin-deploy the class library's assembly to the app by copying the HostingStartupLibrary.dll file from the class library's compiled output to the app's bin/Debug folder.

 - Compile and run the app. An <ItemGroup> in the app's project file references the class library's assembly (.\bin\Debug\netcoreapp3.0\HostingStartupLibrary.dll) (a compile-time reference). For more information, see the notes in the HostingStartupApp's project file.

```xml
<ItemGroup>
  <Reference Include=".\\bin\\Debug\\netcoreapp3.0\\HostingStartupLibrary.dll">
    <HintPath>.\bin\Debug\netcoreapp3.0\HostingStartupLibrary.dll</HintPath>
    <SpecificVersion>False</SpecificVersion> 
  </Reference>
</ItemGroup>
```

 - Observe that the service configuration key values rendered by the Index page match the values set by the class library's ```ServiceKeyInjection.Configure``` method.

 - The ```StartupDiagnostics``` project uses PowerShell to modify its ```StartupDiagnostics.deps.json``` file. PowerShell is installed by default on Windows starting with Windows 7 SP1 and Windows Server 2008 R2 SP1. To obtain PowerShell on other platforms, see Installing various versions of PowerShell.

 - Execute the build.ps1 script in the RuntimeStore folder. The script:

   - Generates the ```StartupDiagnostics``` package in the obj\packages folder.

   - Generates the ```runtime``` store for ```StartupDiagnostics``` in the store folder. The ```dotnet store``` command in the script uses the ```win7-x64``` ```runtime``` identifier (RID) for a hosting startup deployed to Windows. When providing the hosting startup for a different ```runtime```, substitute the correct RID on line 37 of the script. The ```runtime``` store for ```StartupDiagnostics``` would later be moved to the user's or system's ```runtime``` store on the machine where the assembly will be consumed. The user ```runtime``` store install location for the ```StartupDiagnostics``` assembly is .dotnet/store/x64/netcoreapp3.0/startupdiagnostics/1.0.0/lib/netcoreapp3.0/StartupDiagnostics.dll.

   - Generates the ```additionalDeps``` for ```StartupDiagnostics``` in the ```additionalDeps``` folder. The additional dependencies would later be moved to the user's or system's additional dependencies. The user ```StartupDiagnostics``` additional dependencies install location is ```.dotnet/x64/additionalDeps/StartupDiagnostics/shared/Microsoft.NETCore.App/3.0.0/StartupDiagnostics.deps.json```.

   - Places the deploy.ps1 file in the deployment folder.

 - Run the deploy.ps1 script in the deployment folder. The script appends:

   - ```StartupDiagnostics``` to the ```ASPNETCORE_HOSTINGSTARTUPASSEMBLIES``` environment variable.

   - The hosting startup dependencies path (in the RuntimeStore project's deployment folder) to the ```DOTNET_ADDITIONAL_DEPS``` environment variable.

   - The ```runtime``` store path (in the RuntimeStore project's deployment folder) to the ```DOTNET_SHARED_STORE``` environment variable.

 - Run the sample app.

 - Request the ```/services``` endpoint to see the app's registered services. Request the ```/diag``` endpoint to see the diagnostic information.

Ref: [Use hosting startup assemblies in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/platform-specific-configuration?view=aspnetcore-8.0)