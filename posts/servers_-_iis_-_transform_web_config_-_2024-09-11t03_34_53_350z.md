---
title: Servers - IIS - Transform web.config
published: true
date: 2024-09-11 03:34:53
tags: Summary, AspNetCore
description:
image:
---

## In this article

Transformations to the web.config file can be applied automatically when an app is published based on:

- Build configuration

- Profile

- Environment

- Custom

These transformations occur for either of the following web.config generation scenarios:

- Generated automatically by the ```Microsoft.NET.Sdk.Web``` SDK.

- Provided by the developer in the content root of the app.

## Build configuration

Build configuration transforms are run first.

Include a web.{CONFIGURATION}.config file for each build configuration (Debug|Release) requiring a web.config transformation.

In the following example, a configuration-specific environment variable is set in web.Release.config:

```xml
<?xml version="1.0"?>
<configuration xmlns:xdt="http://schemas.microsoft.com/XML-Document-Transform">
  <location>
    <system.webServer>
      <aspNetCore>
        <environmentVariables xdt:Transform="InsertIfMissing">
          <environmentVariable name="Configuration_Specific" 
                               value="Configuration_Specific_Value" 
                               xdt:Locator="Match(name)" 
                               xdt:Transform="InsertIfMissing" />
        </environmentVariables>
      </aspNetCore>
    </system.webServer>
  </location>
</configuration>
```

The transform is applied when the configuration is set to Release:

```dotnetcli
dotnet publish --configuration Release
```

The MSBuild property for the configuration is $(Configuration).

## Profile

Profile transformations are run second, after Build configuration transforms.

Include a web.{PROFILE}.config file for each profile configuration requiring a web.config transformation.

In the following example, a profile-specific environment variable is set in web.FolderProfile.config for a folder publish profile:

```xml
<?xml version="1.0"?>
<configuration xmlns:xdt="http://schemas.microsoft.com/XML-Document-Transform">
  <location>
    <system.webServer>
      <aspNetCore>
        <environmentVariables xdt:Transform="InsertIfMissing">
          <environmentVariable name="Profile_Specific" 
                               value="Profile_Specific_Value" 
                               xdt:Locator="Match(name)" 
                               xdt:Transform="InsertIfMissing" />
        </environmentVariables>
      </aspNetCore>
    </system.webServer>
  </location>
</configuration>
```

The transform is applied when the profile is FolderProfile:

```dotnetcli
dotnet publish --configuration Release /p:PublishProfile=FolderProfile
```

The MSBuild property for the profile name is $(PublishProfile).

If no profile is passed, the default profile name is FileSystem and web.FileSystem.config is applied if the file is present in the app's content root.

## Environment

Environment transformations are run third, after Build configuration and Profile transforms.

Include a web.{ENVIRONMENT}.config file for each environment requiring a web.config transformation.

In the following example, an environment-specific environment variable is set in web.Production.config for the Production environment:

```xml
<?xml version="1.0"?>
<configuration xmlns:xdt="http://schemas.microsoft.com/XML-Document-Transform">
  <location>
    <system.webServer>
      <aspNetCore>
        <environmentVariables xdt:Transform="InsertIfMissing">
          <environmentVariable name="Environment_Specific" 
                               value="Environment_Specific_Value" 
                               xdt:Locator="Match(name)" 
                               xdt:Transform="InsertIfMissing" />
        </environmentVariables>
      </aspNetCore>
    </system.webServer>
  </location>
</configuration>
```

The transform is applied when the environment is Production:

```dotnetcli
dotnet publish --configuration Release /p:EnvironmentName=Production
```

The MSBuild property for the environment is $(EnvironmentName).

When publishing from Visual Studio and using a publish profile, see Visual Studio publish profiles (.pubxml) for ASP.NET Core app deployment.

The ```ASPNETCORE_ENVIRONMENT``` environment variable is automatically added to the web.config file when the environment name is specified.

## Custom

Custom transformations are run last, after Build configuration, Profile, and Environment transforms.

Include a {CUSTOM_NAME}.transform file for each custom configuration requiring a web.config transformation.

In the following example, a custom transform environment variable is set in custom.transform:

```xml
<?xml version="1.0"?>
<configuration xmlns:xdt="http://schemas.microsoft.com/XML-Document-Transform">
  <location>
    <system.webServer>
      <aspNetCore>
        <environmentVariables xdt:Transform="InsertIfMissing">
          <environmentVariable name="Custom_Specific" 
                               value="Custom_Specific_Value" 
                               xdt:Locator="Match(name)" 
                               xdt:Transform="InsertIfMissing" />
        </environmentVariables>
      </aspNetCore>
    </system.webServer>
  </location>
</configuration>
```

The transform is applied when the ```CustomTransformFileName``` property is passed to the dotnet publish command:

```dotnetcli
dotnet publish --configuration Release /p:CustomTransformFileName=custom.transform
```

The MSBuild property for the profile name is $(CustomTransformFileName).

## Prevent web.config transformation

To prevent transformations of the web.config file, set the MSBuild property $(IsWebConfigTransformDisabled):

```dotnetcli
dotnet publish /p:IsWebConfigTransformDisabled=true
```

## Additional resources

- Web.config Transformation Syntax for Web Application Project Deployment

- Web.config Transformation Syntax for Web Project Deployment Using Visual Studio

Ref: [Transform web.config](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/transform-webconfig?view=aspnetcore-8.0)