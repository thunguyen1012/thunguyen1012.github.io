---
title: Servers - IIS - web.config file
published: true
date: 2024-09-11 03:27:48
tags: Summary, AspNetCore
description: The web.config is a file that is read by IIS and the ASP.NET Core Module to configure an app hosted with IIS.
image:
---

## In this article

The ```web.config``` is a file that is read by IIS and the ASP.NET Core Module to configure an app hosted with IIS.

## ```web.config``` file location

In order to set up the ASP.NET Core Module correctly, the ```web.config``` file must be present at the content root path (typically the app base path) of the deployed app. This is the same location as the website physical path provided to IIS. The ```web.config``` file is required at the root of the app to enable the publishing of multiple apps using Web Deploy.

Sensitive files exist on the app's physical path, such as ```{ASSEMBLY}.runtimeconfig.json```, ```{ASSEMBLY}.xml``` (XML Documentation comments), and ```{ASSEMBLY}.deps.json```, where the placeholder {ASSEMBLY} is the assembly name. When the ```web.config``` file is present and the site starts normally, IIS doesn't serve these sensitive files if they're requested. If the ```web.config``` file is missing, incorrectly named, or unable to configure the site for normal startup, IIS may serve sensitive files publicly.

The ```web.config``` file must be present in the deployment at all times, correctly named, and able to configure the site for normal start up. Never remove the ```web.config``` file from a production deployment.

If a ```web.config``` file isn't present in the project, the file is created with the correct ```processPath``` and ```arguments``` to configure the ASP.NET Core Module and moved to published output.

If a ```web.config``` file is present in the project, the file is transformed with the correct ```processPath``` and ```arguments``` to configure the ASP.NET Core Module and moved to published output. The transformation doesn't modify IIS configuration settings in the file.

The ```web.config``` file may provide additional IIS configuration settings that control active IIS modules. For information on IIS modules that are capable of processing requests with ASP.NET Core apps, see the IIS modules topic.

Creating, transforming, and publishing the ```web.config``` file is handled by an MSBuild target (_TransformWebConfig) when the project is published. This target is present in the Web SDK targets (Microsoft.NET.Sdk.Web). The SDK is set at the top of the project file:

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
```

To prevent the Web SDK from transforming the ```web.config``` file, use the <IsTransformWebConfigDisabled> property in the project file:

```xml
<PropertyGroup>
  <IsTransformWebConfigDisabled>true</IsTransformWebConfigDisabled>
</PropertyGroup>
```

When disabling the Web SDK from transforming the file, the ```processPath``` and ```arguments``` should be manually set by the developer. For more information, see ASP.NET Core Module (ANCM) for IIS.

## Configuration of ASP.NET Core Module with ```web.config```

The ASP.NET Core Module is configured with the ```aspNetCore``` section of the ```system.webServer``` node in the site's ```web.config``` file.

The following ```web.config``` file is published for a framework-dependent deployment and configures the ASP.NET Core Module to handle site requests:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <location path="." inheritInChildApplications="false">
    <system.webServer>
      <handlers>
        <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModuleV2" resourceType="Unspecified" />
      </handlers>
      <aspNetCore processPath="dotnet"
                  arguments=".\MyApp.dll"
                  stdoutLogEnabled="false"
                  stdoutLogFile=".\logs\stdout"
                  hostingModel="inprocess" />
    </system.webServer>
  </location>
</configuration>
```

The following ```web.config``` is published for a self-contained deployment:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <location path="." inheritInChildApplications="false">
    <system.webServer>
      <handlers>
        <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModuleV2" resourceType="Unspecified" />
      </handlers>
      <aspNetCore processPath=".\MyApp.exe"
                  stdoutLogEnabled="false"
                  stdoutLogFile=".\logs\stdout"
                  hostingModel="inprocess" />
    </system.webServer>
  </location>
</configuration>
```

The InheritInChildApplications property is set to ```false``` to indicate that the settings specified within the <location> element aren't inherited by apps that reside in a subdirectory of the app.

When an app is deployed to Azure App Service, the ```stdoutLogFile``` path is set to ```\\?\%home%\LogFiles\stdout```. The path saves ```stdout``` ```logs``` to the ```LogFiles``` folder, which is a location automatically created by the service.

For information on IIS sub-application configuration, see Advanced configuration.

### Attributes of the ```aspNetCore``` element

<table><thead>
<tr>
<th>Attribute</th>
<th>Description</th>
<th style="text-align: center;">Default</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>arguments</code></td>
<td><p>Optional string attribute.</p><p>Arguments to the executable specified in <code>processPath</code>.</p></td>
<td style="text-align: center;"></td>
</tr>
<tr>
<td><code>disableStartUpErrorPage</code></td>
<td><p>Optional Boolean attribute.</p><p>If ```true```, the <strong>502.5 - Process Failure</strong> page is suppressed, and the 502 status code page configured in the <code>web.config</code> takes precedence.</p></td>
<td style="text-align: center;"><code>false</code></td>
</tr>
<tr>
<td><code>forwardWindowsAuthToken</code></td>
<td><p>Optional Boolean attribute.</p><p>If ```true```, the token is forwarded to the child process listening on <code>%ASPNETCORE_PORT%</code> as a header 'MS-ASPNETCORE-WINAUTHTOKEN' per request. It's the responsibility of that process to call CloseHandle on this token per request.</p></td>
<td style="text-align: center;"><code>true</code></td>
</tr>
<tr>
<td><code>hostingModel</code></td>
<td><p>Optional string attribute.</p><p>Specifies the hosting model as in-process (<code>InProcess</code>/<code>inprocess</code>) or out-of-process (<code>OutOfProcess</code>/<code>outofprocess</code>).</p></td>
<td style="text-align: center;"><code>OutOfProcess</code>/<code>outofprocess</code> when not present</td>
</tr>
<tr>
<td><code>processesPerApplication</code></td>
<td><p>Optional integer attribute.</p><p>Specifies the number of instances of the process specified in the <code>processPath</code> setting that can be spun up per app.</p><p>†For in-process hosting, the value is limited to <code>1</code>.</p><p>Setting <code>processesPerApplication</code> is discouraged. This attribute will be removed in a future release.</p></td>
<td style="text-align: center;">Default: <code>1</code><br>Min: <code>1</code><br>Max: <code>100</code>†</td>
</tr>
<tr>
<td><code>processPath</code></td>
<td><p>Required string attribute.</p><p>Path to the executable that launches a process listening for HTTP requests. Relative paths are supported. If the path begins with <code>.</code>, the path is considered to be relative to the site root.</p></td>
<td style="text-align: center;"></td>
</tr>
<tr>
<td><code>rapidFailsPerMinute</code></td>
<td><p>Optional integer attribute.</p><p>Specifies the number of times the process specified in <code>processPath</code> is allowed to crash per minute. If this limit is exceeded, the module stops launching the process for the remainder of the minute.</p><p>Not supported with in-process hosting.</p></td>
<td style="text-align: center;">Default: <code>10</code><br>Min: <code>0</code><br>Max: <code>100</code></td>
</tr>
<tr>
<td><code>requestTimeout</code></td>
<td><p>Optional timespan attribute.</p><p>Specifies the duration for which the ASP.NET Core Module waits for a response from the process listening on %ASPNETCORE_PORT%.</p><p>In versions of the ASP.NET Core Module that shipped with the release of ASP.NET Core 2.1 or later, the <code>requestTimeout</code> is specified in hours, minutes, and seconds.</p><p>Doesn't apply to in-process hosting. For in-process hosting, the module waits for the app to process the request.</p><p>Valid values for minutes and seconds segments of the string are in the range ```0```-59. Use of <code>60</code> in the value for minutes or seconds results in a <em>500 - Internal Server Error</em>.</p></td>
<td style="text-align: center;">Default: <code>00:02:00</code><br>Min: <code>00:00:00</code><br>Max: <code>360:00:00</code></td>
</tr>
<tr>
<td><code>shutdownTimeLimit</code></td>
<td><p>Optional integer attribute.</p><p>Duration in seconds that the module waits for the executable to gracefully shutdown when the <code>app_offline.htm</code> file is detected.</p></td>
<td style="text-align: center;">Default: <code>10</code><br>Min: <code>0</code><br>Max: <code>600</code></td>
</tr>
<tr>
<td><code>startupTimeLimit</code></td>
<td><p>Optional integer attribute.</p><p>Duration in seconds that the module waits for the executable to start a process listening on the port. If this time limit is exceeded, the module kills the process.</p><p>When hosting <em>in-process</em>: The process is <strong>not</strong> restarted and does <strong>not</strong> use the <code>rapidFailsPerMinute</code> setting.</p><p>When hosting <em>out-of-process</em>: The module attempts to relaunch the process when it receives a new request and continues to attempt to restart the process on subsequent incoming requests unless the app fails to start <code>rapidFailsPerMinute</code> number of times in the last rolling minute.</p><p>A value of ```0``` (zero) is <strong>not</strong> considered an infinite timeout.</p></td>
<td style="text-align: center;">Default: <code>120</code><br>Min: <code>0</code><br>Max: <code>3600</code></td>
</tr>
<tr>
<td><code>stdoutLogEnabled</code></td>
<td><p>Optional Boolean attribute.</p><p>If ```true```, <code>stdout</code> and <code>stderr</code> for the process specified in <code>processPath</code> are redirected to the file specified in <code>stdoutLogFile</code>.</p></td>
<td style="text-align: center;"><code>false</code></td>
</tr>
<tr>
<td><code>stdoutLogFile</code></td>
<td><p>Optional string attribute.</p><p>Specifies the relative or absolute file path for which <code>stdout</code> and <code>stderr</code> from the process specified in <code>processPath</code> are logged. Relative paths are relative to the root of the site. Any path starting with <code>.</code> are relative to the site root and all other paths are treated as absolute paths. Any folders provided in the path are created by the module when the log file is created. Using underscore delimiters, a timestamp, process ID, and file extension (<code>.log</code>) are added to the last segment of the <code>stdoutLogFile</code> path. If <code>.\logs\stdout</code> is supplied as a value, an example ```stdout``` log is saved as <code>stdout_20180205194132_1934.log</code> in the <code>logs</code> folder when saved on February 5, 2018 at 19:41:32 with a process ID of 1934.</p></td>
<td style="text-align: center;"><code>aspnetcore-stdout</code></td>
</tr>
</tbody></table>

### Set environment variables

Environment variables can be specified for the process in the ```processPath``` attribute. Specify an environment variable with the <environmentVariable> child element of an <environmentVariables> collection element. Environment variables set in this section take precedence over system environment variables.

The following example sets two environment variables in ```web.config```. ```ASPNETCORE_ENVIRONMENT``` configures the app's environment to ```Development```. A developer may temporarily set this value in the ```web.config``` file in order to force the Developer Exception Page to load when debugging an app exception. ```CONFIG_DIR``` is an example of a user-defined environment variable, where the developer has written code that reads the value on startup to form a path for loading the app's configuration file.

```xml
<aspNetCore processPath="dotnet"
      arguments=".\MyApp.dll"
      stdoutLogEnabled="false"
      stdoutLogFile=".\logs\stdout"
      hostingModel="inprocess">
  <environmentVariables>
    <environmentVariable name="ASPNETCORE_ENVIRONMENT" value="Development" />
    <environmentVariable name="CONFIG_DIR" value="f:\application_config" />
  </environmentVariables>
</aspNetCore>
```

> Note
An alternative to setting the environment directly in ```web.config``` is to include the <EnvironmentName> property in the publish profile (.pubxml) or project file. This approach sets the environment in ```web.config``` when the project is published:
<PropertyGroup>
  ```<EnvironmentName>```Development</EnvironmentName>
</PropertyGroup>

```xml
<PropertyGroup>
  <EnvironmentName>Development</EnvironmentName>
</PropertyGroup>
```

> Warning
Only set the ```ASPNETCORE_ENVIRONMENT``` environment variable to ```Development``` on staging and testing servers that aren't accessible to untrusted networks, such as the Internet.

## Configuration of IIS with ```web.config```

IIS configuration is influenced by the <system.webServer> section of ```web.config``` for IIS scenarios that are functional for ASP.NET Core apps with the ASP.NET Core Module. For example, IIS configuration is functional for dynamic compression. If IIS is configured at the server level to use dynamic compression, the <urlCompression> element in the app's ```web.config``` file can disable it for an ASP.NET Core app.

For more information, see the following topics:

- Configuration reference for <system.webServer>

- ASP.NET Core Module (ANCM) for IIS

- IIS modules with ASP.NET Core

To set environment variables for individual apps running in isolated app pools (supported for IIS ```10```.0 or later), see the ```AppCmd.exe``` command section of the Environment Variables <environmentVariables> topic in the IIS reference documentation.

## Configuration sections of ```web.config```

Configuration sections of ASP.NET 4.x apps in ```web.config``` aren't used by ASP.NET Core apps for configuration:

- <system.web>

- <appSettings>

- <connectionStrings>

- <location>

ASP.NET Core apps are configured using other configuration providers. For more information, see Configuration.

## Transform ```web.config```

If you need to transform ```web.config``` on publish, see Transform ```web.config```. You might need to transform ```web.config``` on publish to set environment variables based on the configuration, profile, or environment.

## Additional resources

- IIS <system.webServer>

- IIS modules with ASP.NET Core

- Transform ```web.config```

Ref: [web.config file](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/web-config?view=aspnetcore-8.0)