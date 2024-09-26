---
title: Advanced - Change tokens
published: true
date: 2024-09-25 09:33:47
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## ```IChangeToken``` interface

 - ```ActiveChangeCallbacks``` indicate if the token proactively raises callbacks. If ```ActiveChangedCallbacks``` is set to ```false```, a callback is never called, and the app must poll ```HasChanged``` for changes. It's also possible for a token to never be cancelled if no changes occur or the underlying change listener is disposed or disabled.

 - ```HasChanged``` receives a value that indicates if a change has occurred.

## ```ChangeToken``` class

 - `Func<IChangeToken>` produces the token.

 - ```Action``` is called when the token changes.

## Example uses of change tokens in ASP.NET Core

 - For monitoring changes to files, IFileProvider's Watch method creates an ```IChangeToken``` for the specified files or folder to watch.

 - ```IChangeToken``` tokens can be added to cache entries to trigger cache evictions on change.

 - For ```TOptions``` changes, the default `OptionsMonitor<TOptions>` implementation of `IOptionsMonitor<TOptions>` has an overload that accepts one or more `IOptionsChangeTokenSource<TOptions>` instances. Each instance returns an ```IChangeToken``` to register a change notification callback for tracking options changes.

## Monitor for configuration changes

```csharp
config.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
      .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true, 
          reloadOnChange: true);
```

```csharp
public static byte[] ComputeHash(string filePath)
{
    var runCount = 1;

    while(runCount < 4)
    {
        try
        {
            if (File.Exists(filePath))
            {
                using (var fs = File.OpenRead(filePath))
                {
                    return System.Security.Cryptography.SHA1
                        .Create().ComputeHash(fs);
                }
            }
            else 
            {
                throw new FileNotFoundException();
            }
        }
        catch (IOException ex)
        {
            if (runCount == 3)
            {
                throw;
            }

            Thread.Sleep(TimeSpan.FromSeconds(Math.Pow(2, runCount)));
            runCount++;
        }
    }

    return new byte[20];
}
```

### Simple startup change token

```csharp
ChangeToken.OnChange(
    () => config.GetReloadToken(),
    (state) => InvokeChanged(state),
    env);
```

```csharp
private void InvokeChanged(IWebHostEnvironment env)
{
    byte[] appsettingsHash = ComputeHash("appSettings.json");
    byte[] appsettingsEnvHash = 
        ComputeHash($"appSettings.{env.EnvironmentName}.json");

    if (!_appsettingsHash.SequenceEqual(appsettingsHash) || 
        !_appsettingsEnvHash.SequenceEqual(appsettingsEnvHash))
    {
        _appsettingsHash = appsettingsHash;
        _appsettingsEnvHash = appsettingsEnvHash;

        WriteConsole("Configuration changed (Simple Startup Change Token)");
    }
}
```

### Monitor configuration changes as a service

 - Basic startup token monitoring.

 - Monitoring as a service.

 - A mechanism to enable and disable monitoring.

```csharp
public interface IConfigurationMonitor
{
    bool MonitoringEnabled { get; set; }
    string CurrentState { get; set; }
}
```

```csharp
public ConfigurationMonitor(IConfiguration config, IWebHostEnvironment env)
{
    _env = env;

    ChangeToken.OnChange<IConfigurationMonitor>(
        () => config.GetReloadToken(),
        InvokeChanged,
        this);
}

public bool MonitoringEnabled { get; set; } = false;
public string CurrentState { get; set; } = "Not monitoring";
```

 - ```MonitoringEnabled```: Indicates if the callback should run its custom code.

 - ```CurrentState```: Describes the current monitoring ```state``` for use in the UI.

 - Doesn't run its code unless ```MonitoringEnabled``` is ```true```.

 - Outputs the current ```state``` in its ```WriteConsole``` output.

```csharp
private void InvokeChanged(IConfigurationMonitor state)
{
    if (MonitoringEnabled)
    {
        byte[] appsettingsHash = ComputeHash("appSettings.json");
        byte[] appsettingsEnvHash = 
            ComputeHash($"appSettings.{_env.EnvironmentName}.json");

        if (!_appsettingsHash.SequenceEqual(appsettingsHash) || 
            !_appsettingsEnvHash.SequenceEqual(appsettingsEnvHash))
        {
            string message = $"State updated at {DateTime.Now}";
          

            _appsettingsHash = appsettingsHash;
            _appsettingsEnvHash = appsettingsEnvHash;

            WriteConsole("Configuration changed (ConfigurationMonitor Class) " +
                $"{message}, state:{state.CurrentState}");
        }
    }
}
```

```csharp
services.AddSingleton<IConfigurationMonitor, ConfigurationMonitor>();
```

```csharp
public IndexModel(
    IConfiguration config, 
    IConfigurationMonitor monitor, 
    FileService fileService)
{
    _config = config;
    _monitor = monitor;
    _fileService = fileService;
}
```

```csharp
public IActionResult OnPostStartMonitoring()
{
    _monitor.MonitoringEnabled = true;
    _monitor.CurrentState = "Monitoring!";

    return RedirectToPage();
}

public IActionResult OnPostStopMonitoring()
{
    _monitor.MonitoringEnabled = false;
    _monitor.CurrentState = "Not monitoring";

    return RedirectToPage();
}
```

```cshtml
<button class="btn btn-success" asp-page-handler="StartMonitoring">
    Start Monitoring
</button>

<button class="btn btn-danger" asp-page-handler="StopMonitoring">
    Stop Monitoring
</button>
```

## Monitor cached file changes

 - Return file content.

 - Implement a retry algorithm with exponential back-off to cover cases where a file access problem temporarily delays reading the file's content.

```csharp
public async static Task<string> GetFileContent(string filePath)
{
    var runCount = 1;

    while(runCount < 4)
    {
        try
        {
            if (File.Exists(filePath))
            {
                using (var fileStreamReader = File.OpenText(filePath))
                {
                    return await fileStreamReader.ReadToEndAsync();
                }
            }
            else 
            {
                throw new FileNotFoundException();
            }
        }
        catch (IOException ex)
        {
            if (runCount == 3)
            {
                throw;
            }

            Thread.Sleep(TimeSpan.FromSeconds(Math.Pow(2, runCount)));
            runCount++;
        }
    }

    return null;
}
```

 - The file content is obtained using ```GetFileContent```.

 - A change token is obtained from the file provider with IFileProviders.Watch. The token's callback is triggered when the file is modified.

 - The file content is cached with a sliding expiration period. The change token is attached with `MemoryCacheEntryExtensions.AddExpirationToken` to evict the cache entry if the file changes while it's cached.

```csharp
public class FileService
{
    private readonly IMemoryCache _cache;
    private readonly IFileProvider _fileProvider;
    private List<string> _tokens = new List<string>();

    public FileService(IMemoryCache cache, IWebHostEnvironment env)
    {
        _cache = cache;
        _fileProvider = env.ContentRootFileProvider;
    }

    public async Task<string> GetFileContents(string fileName)
    {
        var filePath = _fileProvider.GetFileInfo(fileName).PhysicalPath;
        string fileContent;

        // Try to obtain the file contents from the cache.
        if (_cache.TryGetValue(filePath, out fileContent))
        {
            return fileContent;
        }

        // The cache doesn't have the entry, so obtain the file 
        // contents from the file itself.
        fileContent = await GetFileContent(filePath);

        if (fileContent != null)
        {
            // Obtain a change token from the file provider whose
            // callback is triggered when the file is modified.
            var changeToken = _fileProvider.Watch(fileName);

            // Configure the cache entry options for a five minute
            // sliding expiration and use the change token to
            // expire the file in the cache if the file is
            // modified.
            var cacheEntryOptions = new MemoryCacheEntryOptions()
                .SetSlidingExpiration(TimeSpan.FromMinutes(5))
                .AddExpirationToken(changeToken);

            // Put the file contents into the cache.
            _cache.Set(filePath, fileContent, cacheEntryOptions);

            return fileContent;
        }

        return string.Empty;
    }
}
```

```csharp
services.AddMemoryCache();
services.AddSingleton<FileService>();
```

```csharp
var fileContent = await _fileService.GetFileContents("poem.txt");
```

## CompositeChangeToken class

```csharp
var firstCancellationTokenSource = new CancellationTokenSource();
var secondCancellationTokenSource = new CancellationTokenSource();

var firstCancellationToken = firstCancellationTokenSource.Token;
var secondCancellationToken = secondCancellationTokenSource.Token;

var firstCancellationChangeToken = new CancellationChangeToken(firstCancellationToken);
var secondCancellationChangeToken = new CancellationChangeToken(secondCancellationToken);

var compositeChangeToken = 
    new CompositeChangeToken(
        new List<IChangeToken> 
        {
            firstCancellationChangeToken, 
            secondCancellationChangeToken
        });
```

## Additional resources

- Cache in-memory in ASP.NET Core

- Distributed caching in ASP.NET Core

- Response caching in ASP.NET Core

- Response Caching Middleware in ASP.NET Core

- Cache Tag Helper in ASP.NET Core MVC

- Distributed Cache Tag Helper in ASP.NET Core

Ref: [Detect changes with change tokens in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/change-tokens?view=aspnetcore-8.0)