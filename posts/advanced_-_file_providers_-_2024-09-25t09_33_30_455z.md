---
title: Advanced - File providers
published: true
date: 2024-09-25 09:33:30
tags: Summary, AspNetCore
description:
image:
---

## In this article

 - IWebHostEnvironment exposes the app's content ```root``` and web ```root``` as ```IFileProvider``` types.

 - Static File Middleware uses File Providers to locate static files.

 - Razor uses File Providers to locate pages and views.

 - .NET Core tooling uses File Providers and glob patterns to specify which files should be published.

## File Provider interfaces

 - Obtain file information (IFileInfo).

 - Obtain ```directory``` information (IDirectoryContents).

 - Set up change notifications (using an ```IChangeToken```).

 - Exists

 - IsDirectory

 - Name

 - Length (in bytes)

 - LastModified date

## File Provider implementations

<table><thead>
<tr>
<th>Implementation</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="#composite-file-provider" data-linktype="self-bookmark">Composite File Provider</a></td>
<td>Used to provide combined access to files and directories from one or more other providers.</td>
</tr>
<tr>
<td><a href="#manifest-embedded-file-provider" data-linktype="self-bookmark">Manifest Embedded File Provider</a></td>
<td>Used to access files embedded in assemblies.</td>
</tr>
<tr>
<td><a href="#physical-file-provider" data-linktype="self-bookmark">Physical File Provider</a></td>
<td>Used to access the system's physical files.</td>
</tr>
</tbody></table>

### Physical File Provider

```csharp
var provider = new PhysicalFileProvider(applicationRoot);
var contents = provider.GetDirectoryContents(string.Empty);
var filePath = Path.Combine("wwwroot", "js", "site.js");
var fileInfo = provider.GetFileInfo(filePath);
```

 - ```provider``` is an ```IFileProvider```.

 - ```contents``` is an ```IDirectoryContents```.

 - ```fileInfo``` is an ```IFileInfo```.

```csharp
var physicalProvider = _env.ContentRootFileProvider;
```

### Manifest Embedded File Provider

 - Add the ```Microsoft.Extensions.FileProviders.Embedded``` NuGet package to your project.

 - Set the `<GenerateEmbeddedFilesManifest>` property to ```true```. Specify the files to embed with `<EmbeddedResource>`:

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>netcoreapp3.1</TargetFramework>
    <GenerateEmbeddedFilesManifest>true</GenerateEmbeddedFilesManifest>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.Extensions.FileProviders.Embedded" Version="3.1.0" />
  </ItemGroup>

  <ItemGroup>
    <EmbeddedResource Include="Resource.txt" />
  </ItemGroup>

</Project>
```

```csharp
var manifestEmbeddedProvider = 
    new ManifestEmbeddedFileProvider(typeof(Program).Assembly);
```

 - Specify a relative file path.

 - Scope files to a last modified date.

 - Name the embedded resource containing the embedded file manifest.

<table><thead>
<tr>
<th>Overload</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>ManifestEmbeddedFileProvider(Assembly, String)</code></td>
<td>Accepts an optional <code>root</code> relative path parameter. Specify the <code>root</code> to scope calls to <a href="/en-us/dotnet/api/microsoft.extensions.fileproviders.ifileprovider.getdirectorycontents" class="no-loc" data-linktype="absolute-path">GetDirectoryContents</a> to those resources under the provided path.</td>
</tr>
<tr>
<td><code>ManifestEmbeddedFileProvider(Assembly, String, DateTimeOffset)</code></td>
<td>Accepts an optional <code>root</code> relative path parameter and a <code>lastModified</code> date (<a href="/en-us/dotnet/api/system.datetimeoffset" class="no-loc" data-linktype="absolute-path">DateTimeOffset</a>) parameter. The <code>lastModified</code> date scopes the last modification date for the <a href="/en-us/dotnet/api/microsoft.extensions.fileproviders.ifileinfo" class="no-loc" data-linktype="absolute-path">IFileInfo</a> instances returned by the <a href="/en-us/dotnet/api/microsoft.extensions.fileproviders.ifileprovider" class="no-loc" data-linktype="absolute-path">IFileProvider</a>.</td>
</tr>
<tr>
<td><code>ManifestEmbeddedFileProvider(Assembly, String, String, DateTimeOffset)</code></td>
<td>Accepts an optional <code>root</code> relative path, <code>lastModified</code> date, and <code>manifestName</code> parameters. The <code>manifestName</code> represents the name of the embedded resource containing the manifest.</td>
</tr>
</tbody></table>

### Composite File Provider

```csharp
var physicalProvider = _env.ContentRootFileProvider;
var manifestEmbeddedProvider = 
    new ManifestEmbeddedFileProvider(typeof(Program).Assembly);
var compositeProvider = 
    new CompositeFileProvider(physicalProvider, manifestEmbeddedProvider);

services.AddSingleton<IFileProvider>(compositeProvider);
```

## ```Watch``` for changes

 - Accepts a file path string, which can use glob patterns to specify multiple files.

 - Returns an ```IChangeToken```.

 - HasChanged: A property that can be inspected to determine if a change has occurred.

 - RegisterChangeCallback: Called when changes are detected to the specified path string. Each change token only calls its associated callback in response to a single change. To enable constant monitoring, use a `TaskCompletionSource<TResult>` (shown below) or recreate ```IChangeToken``` instances in response to changes.

```csharp
private static readonly string _fileFilter = Path.Combine("TextFiles", "*.txt");

public static void Main(string[] args)
{
    Console.WriteLine($"Monitoring for changes with filter '{_fileFilter}' (Ctrl + C to quit)...");

    while (true)
    {
        MainAsync().GetAwaiter().GetResult();
    }
}

private static async Task MainAsync()
{
    var fileProvider = new PhysicalFileProvider(Directory.GetCurrentDirectory());
    IChangeToken token = fileProvider.Watch(_fileFilter);
    var tcs = new TaskCompletionSource<object>();

    token.RegisterChangeCallback(state =>
        ((TaskCompletionSource<object>)state).TrySetResult(null), tcs);

    await tcs.Task.ConfigureAwait(false);

    Console.WriteLine("file changed");
}
```

### Glob patterns

<table><thead>
<tr>
<th>Pattern</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>directory/file.txt</code></td>
<td>Matches a specific file in a specific ```directory```.</td>
</tr>
<tr>
<td><code>directory/*.txt</code></td>
<td>Matches all files with <code>.txt</code> extension in a specific ```directory```.</td>
</tr>
<tr>
<td><code>directory/*/appsettings.json</code></td>
<td>Matches all <code>appsettings.json</code> files in directories exactly one level below the <code>directory</code> folder.</td>
</tr>
<tr>
<td><code>directory/**/*.txt</code></td>
<td>Matches all files with a <code>.txt</code> extension found anywhere under the <code>directory</code> folder.</td>
</tr>
</tbody></table>

Ref: [File Providers in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/file-providers?view=aspnetcore-8.0)