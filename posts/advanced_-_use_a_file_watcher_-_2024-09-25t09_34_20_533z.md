---
title: Advanced - Use a file watcher
published: true
date: 2024-09-25 09:34:20
tags: Summary, AspNetCore
description:
image:
---

## In this article

 ```dotnet watch``` is a tool that runs a .NET CLI command when source files change. For example, a file change can trigger compilation, test execution, or deployment.

This tutorial uses an existing web API with two endpoints: one that returns a sum and one that returns a product. The product method has a bug, which is fixed in this tutorial.

Download the sample app. It consists of two projects: WebApp (an ASP.NET Core web API) and WebAppTests (unit tests for the web API).

In a command shell, navigate to the WebApp folder. Run the following command:

```dotnetcli
dotnet run
```

> Note
You can use dotnet run --project <PROJECT> to specify a project to run. For example, running ```dotnet run --project WebApp``` from the root of the sample app will also run the WebApp project.

The console output shows messages similar to the following (indicating that the app is running and awaiting requests):

```console
$ dotnet run
Hosting environment: Development
Content root path: C:/Docs/aspnetcore/tutorials/dotnet-watch/sample/WebApp
Now listening on: http://localhost:5000
Application started. Press Ctrl+C to shut down.
```

In a web browser, navigate to ```http://localhost:<port number>/api/math/sum?a=4&b=5```. You should see the result of ```9```.

Navigate to the product API (`http://localhost:<port number>/api/math/product?a=4&b=5`). It returns ```9```, not ```20``` as you'd expect. That problem is fixed later in the tutorial.

## Run .NET CLI commands using ```dotnet watch```

Any .NET CLI command can be run with ```dotnet watch```. For example:

<table><thead>
<tr>
<th>Command</th>
<th>Command with ```watch```</th>
</tr>
</thead>
<tbody>
<tr>
<td>dotnet run</td>
<td>dotnet ```watch``` run</td>
</tr>
<tr>
<td>dotnet run -f netcoreapp3.1</td>
<td>dotnet ```watch``` run -f netcoreapp3.1</td>
</tr>
<tr>
<td>dotnet run -f netcoreapp3.1 -- --arg1</td>
<td>dotnet ```watch``` run -f netcoreapp3.1 -- --arg1</td>
</tr>
<tr>
<td>dotnet test</td>
<td>dotnet ```watch``` test</td>
</tr>
</tbody></table>

Run ```dotnet watch run``` in the WebApp folder. The console output indicates ```watch``` has started.

 - Only watches files that impact builds by default.

 - Any additionally watched files (via configuration) still results in a build taking place.

> Note
You can use ```dotnet watch --project <PROJECT>``` to specify a project to ```watch```. For example, running ```dotnet watch --project WebApp run``` from the root of the sample app will also run and ```watch``` the WebApp project.

## Make changes with ```dotnet watch```

Make sure ```dotnet watch``` is running.

Fix the bug in the ```Product``` method of ```MathController.cs``` so it returns the product and not the sum:

```csharp
public static int Product(int a, int b)
{
    return a * b;
}
```

Save the file. The console output indicates that ```dotnet watch``` detected a file change and restarted the app.

Verify ```http://localhost:<port number>/api/math/product?a=4&b=5``` returns the correct result.

## Run tests using ```dotnet watch```

- Change the ```Product``` method of ```MathController.cs``` back to returning the sum. Save the file.

- In a command shell, navigate to the WebAppTests folder.

- Run dotnet restore.

- Run ```dotnet watch test```. Its output indicates that a test failed and that the watcher is awaiting file changes:
Total tests: 2. Passed: 1. Failed: 1. Skipped: 0.
Test Run Failed.

```console
Total tests: 2. Passed: 1. Failed: 1. Skipped: 0.
Test Run Failed.
```

- Fix the ```Product``` method code so it returns the product. Save the file.

 ```dotnet ```watch``` detects the file change and reruns the tests. The console output indicates the tests passed.

## Customize files list to ```watch```

By default, ```dotnet-watch``` tracks all files matching the following glob patterns:

- ```**/*.cs```

- ```*.csproj```

- ```**/*.resx```

- Content files: `wwwroot/**`, ```**/*.config```, ```**/*.json```

More items can be added to the ```watch``` list by editing the ```.csproj``` file. Items can be specified individually or by using glob patterns.

```xml
<ItemGroup>
    <!-- extends watching group to include *.js files -->
    <Watch Include="**\*.js" Exclude="node_modules\**\*;**\*.js.map;obj\**\*;bin\**\*" />
</ItemGroup>
```

## Opt-out of files to be watched

 ```dotnet-watch``` can be configured to ignore its default settings. To ignore specific files, add the Watch="false" attribute to an item's definition in the ```.csproj``` file:

```xml
<ItemGroup>
    <!-- exclude Generated.cs from dotnet-watch -->
    <Compile Include="Generated.cs" Watch="false" />

    <!-- exclude Strings.resx from dotnet-watch -->
    <EmbeddedResource Include="Strings.resx" Watch="false" />

    <!-- exclude changes in this referenced project -->
    <ProjectReference Include="..\ClassLibrary1\ClassLibrary1.csproj" Watch="false" />
</ItemGroup>
```

```xml
<ItemGroup>
     <!-- Exclude all Content items from being watched. -->
    <Content Update="@(Content)" Watch="false" />
</ItemGroup>
```

## Custom ```watch``` projects

 ```dotnet-watch``` isn't restricted to C# projects. Custom ```watch``` projects can be created to handle different scenarios. Consider the following project layout:

- test/

  - ```UnitTests/UnitTests.csproj```

  - ```IntegrationTests/IntegrationTests.csproj```

If the goal is to ```watch``` both projects, create a custom project file configured to ```watch``` both projects:

```xml
<Project>
    <ItemGroup>
        <TestProjects Include="**\*.csproj" />
        <Watch Include="**\*.cs" />
    </ItemGroup>

    <Target Name="Test">
        <MSBuild Targets="VSTest" Projects="@(TestProjects)" />
    </Target>

    <Import Project="$(MSBuildExtensionsPath)\Microsoft.Common.targets" />
</Project>
```

To start file watching on both projects, change to the test folder. Execute the following command:

```dotnetcli
dotnet watch msbuild /t:Test
```

VSTest executes when any file changes in either test project.

## ```dotnet-watch``` configuration

Some configuration options can be passed to ```dotnet watch``` through environment variables. The available variables are:

<table><thead>
<tr>
<th>Setting</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>DOTNET_USE_POLLING_FILE_WATCHER</code></td>
<td>If set to "1" or "true", <code>dotnet watch</code> uses a polling file watcher instead of CoreFx's <code>FileSystemWatcher</code>. Used when watching files on network shares or Docker mounted volumes.</td>
</tr>
<tr>
<td><code>DOTNET_WATCH_SUPPRESS_MSBUILD_INCREMENTALISM</code></td>
<td>By default, <code>dotnet watch</code> optimizes the build by avoiding certain operations such as running restore or re-evaluating the set of watched files on every file change. If set to "1" or "true",  these optimizations are disabled.</td>
</tr>
<tr>
<td><code>DOTNET_WATCH_SUPPRESS_LAUNCH_BROWSER</code></td>
<td><code>dotnet watch run</code> attempts to launch browsers for web apps with <code>launchBrowser</code> configured in <code>launchSettings.json</code>. If set to "1" or "true", this behavior is suppressed.</td>
</tr>
<tr>
<td><code>DOTNET_WATCH_SUPPRESS_BROWSER_REFRESH</code></td>
<td><code>dotnet watch run</code> attempts to refresh browsers when it detects file changes. If set to "1" or "true", this behavior is suppressed. This behavior is also suppressed if <code>DOTNET_WATCH_SUPPRESS_LAUNCH_BROWSER</code> is set.</td>
</tr>
</tbody></table>

## Browser refresh

 ```dotnet watch``` injects a script into the app that allows it to refresh the browser when the content changes. In some scenarios, such as when the app enables response compression, ```dotnet watch``` might not be able to inject the script. For such cases in development, manually inject the script into the app. For example, to configure the  web app to manually inject the script, update the layout file to include ```_framework/aspnet-browser-refresh.js```:

```razor
@* _Layout.cshtml *@
<environment names="Development">
    <script src="/_framework/aspnetcore-browser-refresh.js"></script>
</environment>
```

## Non-ASCII characters

Visual Studio 17.2 and later includes the .NET SDK 6.0.300 and later. With the .NET SDK and 6.0.300 later, ```dotnet-watch``` emits non-ASCII characters to the console during a hot reload session. On certain console hosts, such as the Windows conhost, these characters may appear garbled. To avoid garbled characters, consider one of the following approaches:

- Configure the ```DOTNET_WATCH_SUPPRESS_EMOJIS=1``` environment variable to suppress emitting these values.

- Switch to a different terminal, such as https://github.com/microsoft/terminal, that  supports rendering non-ASCII characters.

Ref: [Develop ASP.NET Core apps using a file watcher](https://learn.microsoft.com/en-us/aspnet/core/tutorials/dotnet-watch?view=aspnetcore-8.0)