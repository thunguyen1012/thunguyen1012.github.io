---
title: Servers - IIS - Hosting Bundle
published: true
date: 2024-09-11 03:27:47
tags: Summary, AspNetCore
description: The .NET Core Hosting bundle is an installer for the .NET Core Runtime and the ASP.NET Core Module. The bundle allows ASP.NET Core apps to run with IIS.
image:
---

## In this article

The .NET Core Hosting bundle is an installer for the .NET Core Runtime and the ASP.NET Core Module. The bundle allows ASP.NET Core apps to run with IIS.

## Install the .NET Core Hosting Bundle

> Important
If the Hosting Bundle is installed before IIS, the bundle installation must be repaired. Run the Hosting Bundle installer again after installing IIS.
If the Hosting Bundle is installed after installing the 64-bit (x64) version of .NET Core, SDKs might appear to be missing (No .NET Core SDKs were detected). To resolve the problem, see Troubleshoot and debug ASP.NET Core projects.

Breaking changes and security advisories are reported on the Announcements repo. Announcements can be limited to a specific version by selecting a Label filter.

## Direct download

Download the installer using the following links:

- Current version:.NET Core Hosting Bundle installer (direct download)

- Previous and pre-release versions

## Visual C++ Redistributable Requirement

On older versions of Windows, for example Windows Server 2012 R2, install the Visual Studio C++ 2015, 2017, 2019 Redistributable. Otherwise, a confusing error message in the Windows Event Log reports that The data is the error.

Current x64 VS C++ redistributable
Current x86 VS C++ redistributable

## Earlier versions of the installer

To obtain an earlier version of the installer:

- Navigate to the Download .NET Core page.

- Select the desired .NET Core version.

- In the Run apps - Runtime column, find the row of the .NET Core runtime version desired.

- Download the installer using the Hosting Bundle link.

> Warning
Some installers contain release versions that have reached their end of life (EOL) and are no longer supported by Microsoft. For more information, see the support policy.
The ASP.NET Core Module is forward and backward compatible with in-support releases of .NET.

## Options

- The following parameters are available when running the installer from an administrator command shell:

  - ```OPT_NO_ANCM=1```: Skip installing the ASP.NET Core Module.

  - ```OPT_NO_RUNTIME=1```: Skip installing the .NET Core runtime. Used when the server only hosts self-contained deployments (SCD).

  - ```OPT_NO_SHAREDFX=1```: Skip installing the ASP.NET Shared Framework (ASP.NET runtime). Used when the server only hosts self-contained deployments (SCD).

  - ```OPT_NO_X86=1```: Skip installing x86 runtimes. Use this parameter when you know that you won't be hosting 32-bit apps. If there's any chance that you will host both 32-bit and 64-bit apps in the future, don't use this parameter and install both runtimes.

  - ```OPT_NO_SHARED_CONFIG_CHECK=1```: Disable the check for using an IIS Shared Configuration when the shared configuration (applicationHost.config) is on the same machine as the IIS installation. Only available for ASP.NET Core 2.2 or later Hosting Bundler installers. For more information, see Advanced configuration.

> Note
For information on IIS Shared Configuration, see ASP.NET Core Module with IIS Shared Configuration.

> Note
When running the Hosting Bundle installer with options set, the value for each option is saved in the registry. Subsequent installs from the same Major.Minor version band use the same options, unless another set of options is explicitly passed from the command line. If the first install of the hosting bundle has no options passed, each option gets a default value of ```0``` written in to the registry. A value of ```0``` implies that the option is off, meaning the user is not opting out of the given component.

## Restart IIS

After the Hosting Bundle is installed, a manual IIS restart may be required. For example, the ```dotnet``` CLI tooling (command) might not exist on the PATH for running IIS worker processes.

This guide will teach you how to manually restart the Windows operating system.

```console
net stop was /y
net start w3svc
```

## Module version and Hosting Bundle installer logs

To determine the version of the installed ASP.NET Core Module:

- On the hosting system, navigate to ```%PROGRAMFILES%\IIS\Asp.Net Core Module\V2```.

- Locate the ```aspnetcorev2.dll``` file.

- Right-click the file and select Properties from the contextual menu.

- Select the Details tab. The File version and Product version represent the installed version of the module.

The Hosting Bundle installer logs for the module are found at ```C:\Users\%UserName%\AppData\Local\Temp```. The file is named ```dd_DotNetCoreWinSvrHosting__{TIMESTAMP}_000_AspNetCoreModule_x64.log```, where the placeholder {TIMESTAMP} is the timestamp of the file.

Ref: [The .NET Core Hosting Bundle](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/hosting-bundle?view=aspnetcore-8.0)