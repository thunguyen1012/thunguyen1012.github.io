---
title: Fundamentals - Logging and monitoring - Logging
published: true
date: 2024-09-04 08:51:38
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## ```Logging``` providers

 - ```Console```

 - ```Debug```

 - ```EventSource```

 - ```EventLog```: Windows only

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

app.Run();
```

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.Services.AddRazorPages();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

app.Run();
```

```csharp
var builder = WebApplication.CreateBuilder();
builder.Host.ConfigureLogging(logging =>
{
    logging.ClearProviders();
    logging.AddConsole();
});
```

 - Built-in logging providers

 - Third-party logging providers.

## Create logs

 - Creates a logger, ```ILogger<AboutModel>```, which uses a log category of the fully qualified name of the type ```AboutModel```. The log category is a string that is associated with each log.

 - Calls LogInformation to log at the ```Information``` level. The ```Log``` level indicates the severity of the logged event.

```csharp
public class AboutModel : PageModel
{
    private readonly ILogger _logger;

    public AboutModel(ILogger<AboutModel> logger)
    {
        _logger = logger;
    }

    public void OnGet()
    {
        _logger.LogInformation("About page visited at {DT}", 
            DateTime.UtcNow.ToLongTimeString());
    }
}
```

## Configure logging

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

 - The "Default" and "Microsoft.AspNetCore" categories are specified.

 - The "Microsoft.AspNetCore" category applies to all categories that start with "Microsoft.AspNetCore". For example, this setting applies to the "Microsoft.AspNetCore.Routing.EndpointMiddleware" category.

 - The "Microsoft.AspNetCore" category logs at log level ```Warning``` and higher.

 - A specific log provider is not specified, so ```LogLevel``` applies to all the enabled logging providers except for the Windows ```EventLog```.

```json
{
  "Logging": {
    "LogLevel": { // All providers, LogLevel applies to all the enabled providers.
      "Default": "Error", // Default logging, Error and higher.
      "Microsoft": "Warning" // All Microsoft* categories, Warning and higher.
    },
    "Debug": { // Debug provider.
      "LogLevel": {
        "Default": "Information", // Overrides preceding LogLevel:Default setting.
        "Microsoft.Hosting": "Trace" // Debug:Microsoft.Hosting category.
      }
    },
    "EventSource": { // EventSource provider
      "LogLevel": {
        "Default": "Warning" // All categories of EventSource provider.
      }
    }
  }
}
```

 - Specific providers: For example, ```Logging:EventSource:LogLevel:Default:Information```

 - Specific categories: For example, ```Logging:LogLevel:Microsoft:Warning```

 - All providers and all categories: ```Logging:LogLevel:Default:Warning```

 - Passed to the provider.

 - Logged or displayed.

```json
{
  "Logging": {
    "LogLevel": { // No provider, LogLevel applies to all the enabled providers.
      "Default": "Error",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Warning"
    },
    "Debug": { // Debug provider.
      "LogLevel": {
        "Default": "Information" // Overrides preceding LogLevel:Default setting.
      }
    },
    "Console": {
      "IncludeScopes": true,
      "LogLevel": {
        "Microsoft.AspNetCore.Mvc.Razor.Internal": "Warning",
        "Microsoft.AspNetCore.Mvc.Razor.Razor": "Debug",
        "Microsoft.AspNetCore.Mvc.Razor": "Error",
        "Default": "Information"
      }
    },
    "EventSource": {
      "LogLevel": {
        "Microsoft": "Information"
      }
    },
    "EventLog": {
      "LogLevel": {
        "Microsoft": "Information"
      }
    },
    "AzureAppServicesFile": {
      "IncludeScopes": true,
      "LogLevel": {
        "Default": "Warning"
      }
    },
    "AzureAppServicesBlob": {
      "IncludeScopes": true,
      "LogLevel": {
        "Microsoft": "Information"
      }
    },
    "ApplicationInsights": {
      "LogLevel": {
        "Default": "Information"
      }
    }
  }
}
```

 - The categories and levels aren't suggested values. The sample is provided to show all of the default providers.

 - Settings in ```Logging.{PROVIDER NAME}.LogLevel``` override settings in ```Logging.LogLevel```, where the {PROVIDER NAME} placeholder is the provider name. For example, the level in ```Debug.LogLevel.Default``` overrides the level in ```LogLevel.Default```.

 - Each default provider alias is used. Each provider defines an alias that can be used in configuration in place of the fully qualified type name. The built-in providers aliases are:

   - ```Console```

   - ```Debug```

   - ```EventSource```

   - ```EventLog```

   - ```AzureAppServicesFile```

   - ```AzureAppServicesBlob```

   - ```ApplicationInsights```

## ```Log``` in ```Program.cs```

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.Logger.LogInformation("Adding Routes");
app.MapGet("/", () => "Hello World!");
app.Logger.LogInformation("Starting the app");
app.Run();
```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Logging.AddConsole();

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.MapGet("/Test", async (ILogger<Program> logger, HttpResponse response) =>
{
    logger.LogInformation("Testing logging in Program.cs");
    await response.WriteAsync("Testing");
});

app.Run();
```

```csharp
using Microsoft.Extensions.Logging.Console;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.AddSimpleConsole(i => i.ColorBehavior = LoggerColorBehavior.Disabled);

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.MapGet("/Test", async (ILogger<Program> logger, HttpResponse response) =>
{
    logger.LogInformation("Testing logging in Program.cs");
    await response.WriteAsync("Testing");
});

app.Run();
```

## Set log level by command line, environment variables, and other configuration

 - Supported by all platforms.

 - Automatically replaced by a colon, :.

 - Set the environment key ```Logging:LogLevel:Microsoft``` to a value of ```Information``` on Windows.

 - Test the settings when using an app created with the ASP.NET Core web application templates. The ```dotnet run``` command must be run in the project directory after using set.

```dotnetcli
set Logging__LogLevel__Microsoft=Information
dotnet run
```

 - Is only set in processes launched from the command window they were set in.

 - Isn't read by browsers launched with Visual Studio.

```console
setx Logging__LogLevel__Microsoft Information /M
```

```json
"Logging": {
  "Console": {
    "LogLevel": {
      "Microsoft.Hosting.Lifetime": "Trace"
    }
  }
}
```

```console
setx Logging__Console__LogLevel__Microsoft.Hosting.Lifetime Trace /M
```

> Note
When configuring environment variables with names that contain . (periods) in macOS and Linux, consider the "Exporting a variable with a dot (.) in it" question on Stack Exchange and its corresponding accepted answer.

 - Encrypted at rest and transmitted over an encrypted channel.

 - Exposed as environment variables.

## How filtering rules are applied

 - Select all rules that match the provider or its alias. If no match is found, select all rules with an empty provider.

 - From the result of the preceding step, select rules with longest matching category prefix. If no match is found, select all rules that don't specify a category.

 - If multiple rules are selected, take the last one.

 - If no rules are selected, use ```MinimumLevel```.

## ```Logging``` output from ```dotnet run``` and Visual Studio

 - In Visual Studio

   - In the ```Debug``` output window when debugging.

   - In the ASP.NET Core Web Server window.

 - In the console window when the app is run with ```dotnet run```.

## ```Log``` category

```csharp
public class PrivacyModel : PageModel
{
    private readonly ILogger<PrivacyModel> _logger;

    public PrivacyModel(ILogger<PrivacyModel> logger)
    {
        _logger = logger;
    }

    public void OnGet()
    {
        _logger.LogInformation("GET Pages.PrivacyModel called.");
    }
}
```

```csharp
public class ContactModel : PageModel
{
    private readonly ILogger _logger;

    public ContactModel(ILoggerFactory logger)
    {
        _logger = logger.CreateLogger("TodoApi.Pages.ContactModel.MyCategory");
    }

    public void OnGet()
    {
        _logger.LogInformation("GET Pages.ContactModel called.");
    }
```

## ```Log``` level

<table><thead>
<tr>
<th>LogLevel</th>
<th>Value</th>
<th>Method</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.extensions.logging.loglevel#microsoft-extensions-logging-loglevel-trace" class="no-loc" data-linktype="absolute-path">Trace</a></td>
<td>0</td>
<td><a href="/en-us/dotnet/api/microsoft.extensions.logging.loggerextensions.logtrace" class="no-loc" data-linktype="absolute-path">LogTrace</a></td>
<td>Contain the most detailed messages. These messages may contain sensitive app data. These messages are disabled by default and should <em><strong>not</strong></em> be enabled in production.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.extensions.logging.loglevel#microsoft-extensions-logging-loglevel-debug" class="no-loc" data-linktype="absolute-path">Debug</a></td>
<td>1</td>
<td><a href="/en-us/dotnet/api/microsoft.extensions.logging.loggerextensions.logdebug" class="no-loc" data-linktype="absolute-path">LogDebug</a></td>
<td>For debugging and development. Use with caution in production due to the high volume.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.extensions.logging.loglevel#microsoft-extensions-logging-loglevel-information" class="no-loc" data-linktype="absolute-path">Information</a></td>
<td>2</td>
<td><a href="/en-us/dotnet/api/microsoft.extensions.logging.loggerextensions.loginformation" class="no-loc" data-linktype="absolute-path">LogInformation</a></td>
<td>Tracks the general flow of the app. May have long-term value.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.extensions.logging.loglevel#microsoft-extensions-logging-loglevel-warning" class="no-loc" data-linktype="absolute-path">Warning</a></td>
<td>3</td>
<td><a href="/en-us/dotnet/api/microsoft.extensions.logging.loggerextensions.logwarning" class="no-loc" data-linktype="absolute-path">LogWarning</a></td>
<td>For abnormal or unexpected events. Typically includes errors or conditions that don't cause the app to fail.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.extensions.logging.loglevel#microsoft-extensions-logging-loglevel-error" class="no-loc" data-linktype="absolute-path">Error</a></td>
<td>4</td>
<td><a href="/en-us/dotnet/api/microsoft.extensions.logging.loggerextensions.logerror" class="no-loc" data-linktype="absolute-path">LogError</a></td>
<td>For errors and exceptions that cannot be handled. These messages indicate a failure in the current operation or request, not an app-wide failure.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.extensions.logging.loglevel#microsoft-extensions-logging-loglevel-critical" class="no-loc" data-linktype="absolute-path">Critical</a></td>
<td>5</td>
<td><a href="/en-us/dotnet/api/microsoft.extensions.logging.loggerextensions.logcritical" class="no-loc" data-linktype="absolute-path">LogCritical</a></td>
<td>For failures that require immediate attention. Examples: data loss scenarios, out of disk space.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.extensions.logging.loglevel#microsoft-extensions-logging-loglevel-none" class="no-loc" data-linktype="absolute-path">None</a></td>
<td>6</td>
<td></td>
<td>Specifies that a logging category shouldn't write messages.</td>
</tr>
</tbody></table>

```csharp
[HttpGet]
public IActionResult Test1(int id)
{
    var routeInfo = ControllerContext.ToCtxString(id);

    _logger.Log(LogLevel.Information, MyLogEvents.TestItem, routeInfo);
    _logger.LogInformation(MyLogEvents.TestItem, routeInfo);

    return ControllerContext.MyDisplayRouteInfo();
}
```

```csharp
[HttpGet("{id}")]
public async Task<ActionResult<TodoItemDTO>> GetTodoItem(long id)
{
    _logger.LogInformation(MyLogEvents.GetItem, "Getting item {Id}", id);

    var todoItem = await _context.TodoItems.FindAsync(id);

    if (todoItem == null)
    {
        _logger.LogWarning(MyLogEvents.GetItemNotFound, "Get({Id}) NOT FOUND", id);
        return NotFound();
    }

    return ItemToDTO(todoItem);
}
```

 - In production:

   - ```Logging``` at the ```Trace```, ```Debug```, or ```Information``` levels produces a high-volume of detailed log messages. To control costs and not exceed data storage limits, log ```Trace```, ```Debug```, or ```Information``` level messages to a high-volume, low-cost data store. Consider limiting ```Trace```, ```Debug```, or ```Information``` to specific categories.

   - ```Logging``` at ```Warning``` through ```Critical``` levels should produce few log messages.

     - Costs and storage limits usually aren't a concern.

     - Few logs allow more flexibility in data store choices.

 - In development:

   - Set to ```Warning```.

   - Add ```Trace```, ```Debug```, or ```Information``` messages when troubleshooting. To limit output, set ```Trace```, ```Debug```, or ```Information``` only for the categories under investigation.

 - A Razor Pages app created with the ASP.NET Core templates.

 - ```Logging``` set to ```Logging:Console:LogLevel:Microsoft:Information```.

 - Navigation to the Privacy page:

```console
info: Microsoft.AspNetCore.Hosting.Diagnostics[1]
      Request starting HTTP/2 GET https://localhost:5001/Privacy
info: Microsoft.AspNetCore.Routing.EndpointMiddleware[0]
      Executing endpoint '/Privacy'
info: Microsoft.AspNetCore.Mvc.RazorPages.Infrastructure.PageActionInvoker[3]
      Route matched with {page = "/Privacy"}. Executing page /Privacy
info: Microsoft.AspNetCore.Mvc.RazorPages.Infrastructure.PageActionInvoker[101]
      Executing handler method DefaultRP.Pages.PrivacyModel.OnGet - ModelState is Valid
info: Microsoft.AspNetCore.Mvc.RazorPages.Infrastructure.PageActionInvoker[102]
      Executed handler method OnGet, returned result .
info: Microsoft.AspNetCore.Mvc.RazorPages.Infrastructure.PageActionInvoker[103]
      Executing an implicit handler method - ModelState is Valid
info: Microsoft.AspNetCore.Mvc.RazorPages.Infrastructure.PageActionInvoker[104]
      Executed an implicit handler method, returned result Microsoft.AspNetCore.Mvc.RazorPages.PageResult.
info: Microsoft.AspNetCore.Mvc.RazorPages.Infrastructure.PageActionInvoker[4]
      Executed page /Privacy in 74.5188ms
info: Microsoft.AspNetCore.Routing.EndpointMiddleware[1]
      Executed endpoint '/Privacy'
info: Microsoft.AspNetCore.Hosting.Diagnostics[2]
      Request finished in 149.3023ms 200 text/html; charset=utf-8
```

```json
{
  "Logging": {      // Default, all providers.
    "LogLevel": {
      "Microsoft": "Warning"
    },
    "Console": { // Console provider.
      "LogLevel": {
        "Microsoft": "Information"
      }
    }
  }
}
```

## ```Log``` event ```ID```

```csharp
public class MyLogEvents
{
    public const int GenerateItems = 1000;
    public const int ListItems     = 1001;
    public const int GetItem       = 1002;
    public const int InsertItem    = 1003;
    public const int UpdateItem    = 1004;
    public const int DeleteItem    = 1005;

    public const int TestItem      = 3000;

    public const int GetItemNotFound    = 4000;
    public const int UpdateItemNotFound = 4001;
}
```

```csharp
[HttpGet("{id}")]
public async Task<ActionResult<TodoItemDTO>> GetTodoItem(long id)
{
    _logger.LogInformation(MyLogEvents.GetItem, "Getting item {Id}", id);

    var todoItem = await _context.TodoItems.FindAsync(id);

    if (todoItem == null)
    {
        _logger.LogWarning(MyLogEvents.GetItemNotFound, "Get({Id}) NOT FOUND", id);
        return NotFound();
    }

    return ItemToDTO(todoItem);
}
```

```console
info: TodoApi.Controllers.TodoItemsController[1002]
      Getting item 1
warn: TodoApi.Controllers.TodoItemsController[4000]
      Get(1) NOT FOUND
```

## ```Log``` message template

```csharp
[HttpGet("{id}")]
public async Task<ActionResult<TodoItemDTO>> GetTodoItem(long id)
{
    _logger.LogInformation(MyLogEvents.GetItem, "Getting item {Id}", id);

    var todoItem = await _context.TodoItems.FindAsync(id);

    if (todoItem == null)
    {
        _logger.LogWarning(MyLogEvents.GetItemNotFound, "Get({Id}) NOT FOUND", id);
        return NotFound();
    }

    return ItemToDTO(todoItem);
}
```

```csharp
var apples = 1;
var pears = 2;
var bananas = 3;

_logger.LogInformation("Parameters: {Pears}, {Bananas}, {Apples}", apples, pears, bananas);
```

```text
Parameters: 1, 2, 3
```

```csharp
_logger.LogInformation("Getting item {Id} at {RequestTime}", id, DateTime.Now);
```

 - Each Azure Table entity can have ```ID``` and ```RequestTime``` properties.

 - Tables with properties simplify queries on logged data. For example, a query can find all logs within a particular ```RequestTime``` range without having to parse the time out of the text message.

## ```Log``` exceptions

```csharp
[HttpGet("{id}")]
public IActionResult TestExp(int id)
{
    var routeInfo = ControllerContext.ToCtxString(id);
    _logger.LogInformation(MyLogEvents.TestItem, routeInfo);

    try
    {
        if (id == 3)
        {
            throw new Exception("Test exception");
        }
    }
    catch (Exception ex)
    {
        _logger.LogWarning(MyLogEvents.GetItemNotFound, ex, "TestExp({Id})", id);
        return NotFound();
    }

    return ControllerContext.MyDisplayRouteInfo();
}
```

### ```Default``` log level

 - Created with the ASP.NET web app templates.

 - ```appsettings.json``` and ```appsettings.Development.json``` deleted or renamed.

```csharp
var builder = WebApplication.CreateBuilder();
builder.Logging.SetMinimumLevel(LogLevel.Warning);
```

### Filter function

```csharp
var builder = WebApplication.CreateBuilder();
builder.Logging.AddFilter((provider, category, logLevel) =>
{
    if (provider.Contains("ConsoleLoggerProvider")
        && category.Contains("Controller")
        && logLevel >= LogLevel.Information)
    {
        return true;
    }
    else if (provider.Contains("ConsoleLoggerProvider")
        && category.Contains("Microsoft")
        && logLevel >= LogLevel.Information)
    {
        return true;
    }
    else
    {
        return false;
    }
});
```

## ASP.NET Core categories

<table><thead>
<tr>
<th>Category</th>
<th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>Microsoft.AspNetCore</code></td>
<td>General ASP.NET Core diagnostics.</td>
</tr>
<tr>
<td><code>Microsoft.AspNetCore.DataProtection</code></td>
<td>Which keys were considered, found, and used.</td>
</tr>
<tr>
<td><code>Microsoft.AspNetCore.HostFiltering</code></td>
<td>Hosts allowed.</td>
</tr>
<tr>
<td><code>Microsoft.AspNetCore.Hosting</code></td>
<td>How long HTTP requests took to complete and what time they started. Which hosting startup assemblies were loaded.</td>
</tr>
<tr>
<td><code>Microsoft.AspNetCore.Mvc</code></td>
<td>MVC and Razor diagnostics. Model binding, filter execution, view compilation, action selection.</td>
</tr>
<tr>
<td><code>Microsoft.AspNetCore.Routing</code></td>
<td>Route matching information.</td>
</tr>
<tr>
<td><code>Microsoft.AspNetCore.Server</code></td>
<td>Connection start, stop, and keep alive responses. HTTPS certificate information.</td>
</tr>
<tr>
<td><code>Microsoft.AspNetCore.StaticFiles</code></td>
<td>Files served.</td>
</tr>
</tbody></table>

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Trace",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  }
}
```

## ```Log``` scopes

 - Is an IDisposable type that's returned by the BeginScope method.

 - Lasts until it's disposed.

 - ```Console```

 - ```AzureAppServicesFile``` and ```AzureAppServicesBlob```

```csharp
[HttpGet("{id}")]
public async Task<ActionResult<TodoItemDTO>> GetTodoItem(long id)
{
    TodoItem todoItem;
    var transactionId = Guid.NewGuid().ToString();
    using (_logger.BeginScope(new List<KeyValuePair<string, object>>
        {
            new KeyValuePair<string, object>("TransactionId", transactionId),
        }))
    {
        _logger.LogInformation(MyLogEvents.GetItem, "Getting item {Id}", id);

        todoItem = await _context.TodoItems.FindAsync(id);

        if (todoItem == null)
        {
            _logger.LogWarning(MyLogEvents.GetItemNotFound, 
                "Get({Id}) NOT FOUND", id);
            return NotFound();
        }
    }

    return ItemToDTO(todoItem);
}
```

## Built-in logging providers

 - ```Console```

 - ```Debug```

 - ```EventSource```

 - ```EventLog```

 - ```AzureAppServicesFile``` and ```AzureAppServicesBlob```

 - ```ApplicationInsights```

### ```Console```

### ```Debug```

 - ```/var/log/message```

 - ```/var/log/syslog```

### Event Source

#### ```dotnet-trace``` tooling

 - Run the app with the ```dotnet run``` command.

 - Determine the process identifier (PID) of the ```.```NET Core app:
dotnet-trace ps

Find the PID for the process that has the same name as the app's assembly.

```dotnetcli
dotnet-trace ps
```

 - Execute the ```dotnet-trace``` command.
General command syntax:
dotnet-trace collect -p {PID} 
    ```--providers``` ```Microsoft-Extensions-Logging```:{Keyword}:{Provider Level}
        ```:```FilterSpecs=\"
            {Logger Category 1}:{Category Level 1};
            {Logger Category ```2```}:{Category Level ```2```};
            ...
            {Logger Category N}:{Category Level N}\"

When using a PowerShell command shell, enclose the ```--providers``` value in single quotes ('):
dotnet-trace collect -p {PID} 
    ```--providers``` ```'```Microsoft-Extensions-Logging:{Keyword}:{Provider Level}
        ```:```FilterSpecs=\"
            {Logger Category 1}:{Category Level 1};
            {Logger Category ```2```}:{Category Level ```2```};
            ...
            {Logger Category N}:{Category Level N}\"'

On non-Windows platforms, add the ```-f speedscope``` option to change the format of the output trace file to ```speedscope```.
The following table defines the Keyword:

| Keyword | Description |
| ------- | ----------- |
| 1       | Log meta events about the ```LoggingEventSource```. Doesn't log events from ```ILogger```. |
| 2       | Turns on the ```Message``` event when ```ILogger```.Log() is called. Provides information in a programmatic (not formatted) way. |
| 4       | Turns on the ```FormatMessage``` event when ```ILogger```.Log() is called. Provides the formatted string version of the information. |
| 8       | Turns on the ```MessageJson``` event when ```ILogger```.Log() is called. Provides a JSON representation of the arguments. |

The following table lists the provider levels:
| Provider Level | Description |
| -------------- | ----------- |
| 0              | LogAlways   |
| 1              | Critical |
| 2              | Error |
| 3              | Warning |
| 4              | Informational |
| 5              | Verbose |

The parsing for a category level can be either a string or a number:

| Category named value | Numeric value |
| -------------------- | ------------- |
| Trace                | 0 |
| Debug                | 1 |
| Information          | 2 |
| Warning              | 3 |
| Error                | 4 |
| Critical             | 5 |

The provider level and category level:

If no ```FilterSpecs``` are specified then the ```EventSourceLogger``` implementation attempts to convert the provider level to a category level and applies it to all categories.

| Provider Level | Category Level |
| -------------- | -------------- |
| Verbose(5)     | Debug(1) |
| Informational(4) | Information(2) |
| Warning(3) | Warning(3) |
| Error(2) | Error(4) |
| Critical(1) | Critical(5) |

If ```FilterSpecs``` are provided, any category that is included in the list uses the category level encoded there, all other categories are filtered out.
The following examples assume:

Consider the following command:
```dotnet-trace collect -p %PID% --providers Microsoft-Extensions-Logging:4:5```

The preceding command:

Consider the following command:
```dotnet-trace collect -p %PID% --providers Microsoft-Extensions-Logging:4:5:\"FilterSpecs=*:5\"```

The preceding command:

The following command captures debug messages because category level 1 specifies ```Debug```.
```dotnet-trace collect -p %PID% --providers Microsoft-Extensions-Logging:4:5:\"FilterSpecs=*:1\"```

The following command captures debug messages because category specifies ```Debug```.
```dotnet-trace collect -p %PID% --providers Microsoft-Extensions-Logging:4:5:\"FilterSpecs=*:Debug\"```

FilterSpecs entries for {Logger Category} and {Category Level} represent additional log filtering conditions. Separate ```FilterSpecs``` entries with the ; semicolon character.
Example using a Windows command shell:
```dotnet-trace collect -p %PID% --providers Microsoft-Extensions-Logging:4:2:FilterSpecs=\"Microsoft.AspNetCore.Hosting*:4\"```

The preceding command activates:

```dotnetcli
dotnet-trace collect -p {PID} 
    --providers Microsoft-Extensions-Logging:{Keyword}:{Provider Level}
        :FilterSpecs=\"
            {Logger Category 1}:{Category Level 1};
            {Logger Category 2}:{Category Level 2};
            ...
            {Logger Category N}:{Category Level N}\"
```

<table><thead>
<tr>
<th style="text-align: center;">Keyword</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: center;">1</td>
<td>Log meta events about the <code>LoggingEventSource</code>. Doesn't log events from <code>ILogger</code>.</td>
</tr>
<tr>
<td style="text-align: center;">2</td>
<td>Turns on the <code>Message</code> event when <code>ILogger.Log()</code> is called. Provides information in a programmatic (not formatted) way.</td>
</tr>
<tr>
<td style="text-align: center;">4</td>
<td>Turns on the <code>FormatMessage</code> event when <code>ILogger.Log()</code> is called. Provides the formatted string version of the information.</td>
</tr>
<tr>
<td style="text-align: center;">8</td>
<td>Turns on the <code>MessageJson</code> event when <code>ILogger.Log()</code> is called. Provides a JSON representation of the arguments.</td>
</tr>
</tbody></table>

<table><thead>
<tr>
<th style="text-align: center;">Provider Level</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: center;">0</td>
<td><code>LogAlways</code></td>
</tr>
<tr>
<td style="text-align: center;">1</td>
<td><code>Critical</code></td>
</tr>
<tr>
<td style="text-align: center;">2</td>
<td><code>Error</code></td>
</tr>
<tr>
<td style="text-align: center;">3</td>
<td><code>Warning</code></td>
</tr>
<tr>
<td style="text-align: center;">4</td>
<td><code>Informational</code></td>
</tr>
<tr>
<td style="text-align: center;">5</td>
<td><code>Verbose</code></td>
</tr>
</tbody></table>

<table><thead>
<tr>
<th style="text-align: center;">Category named value</th>
<th>Numeric value</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: center;"><code>Trace</code></td>
<td>0</td>
</tr>
<tr>
<td style="text-align: center;"><code>Debug</code></td>
<td>1</td>
</tr>
<tr>
<td style="text-align: center;"><code>Information</code></td>
<td>2</td>
</tr>
<tr>
<td style="text-align: center;"><code>Warning</code></td>
<td>3</td>
</tr>
<tr>
<td style="text-align: center;"><code>Error</code></td>
<td>4</td>
</tr>
<tr>
<td style="text-align: center;"><code>Critical</code></td>
<td>5</td>
</tr>
</tbody></table>

   - Are in reverse order.

   - The string constants aren't all identical.

<table><thead>
<tr>
<th style="text-align: center;">Provider Level</th>
<th>Category Level</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: center;"><code>Verbose</code>(5)</td>
<td><code>Debug</code>(1)</td>
</tr>
<tr>
<td style="text-align: center;"><code>Informational</code>(4)</td>
<td><code>Information</code>(2)</td>
</tr>
<tr>
<td style="text-align: center;"><code>Warning</code>(3)</td>
<td><code>Warning</code>(3)</td>
</tr>
<tr>
<td style="text-align: center;"><code>Error</code>(2)</td>
<td><code>Error</code>(4)</td>
</tr>
<tr>
<td style="text-align: center;"><code>Critical</code>(1)</td>
<td><code>Critical</code>(5)</td>
</tr>
</tbody></table>

   - An app is running and calling logger.LogDebug("12345").

   - The process ```I (PID)D``` has been set via ```set PID=12345```, where ```12345``` is the actual PID.

```dotnetcli
dotnet-trace collect -p %PID% --providers Microsoft-Extensions-Logging:4:5
```

   - Captures debug messages.

   - Doesn't apply a ```FilterSpecs```.

   - Specifies level 5 which maps category ```Debug```.

```dotnetcli
dotnet-trace collect -p %PID%  --providers Microsoft-Extensions-Logging:4:5:\"FilterSpecs=*:5\"
```

   - Doesn't capture debug messages because the category level 5 is ```Critical```.

   - Provides a ```FilterSpecs```.

```dotnetcli
dotnet-trace collect -p %PID%  --providers Microsoft-Extensions-Logging:4:5:\"FilterSpecs=*:1\"
```

```dotnetcli
dotnet-trace collect -p %PID%  --providers Microsoft-Extensions-Logging:4:5:\"FilterSpecs=*:Debug\"
```

```dotnetcli
dotnet-trace collect -p %PID% --providers Microsoft-Extensions-Logging:4:2:FilterSpecs=\"Microsoft.AspNetCore.Hosting*:4\"
```

   - The Event Source logger to produce formatted strings (4) for errors (2).

   - ```Microsoft.AspNetCore.Hosting``` logging at the ```Informational``` logging level (4).

 - Stop the ```dotnet-trace``` tooling by pressing the Enter key or Ctrl+C.
The trace is saved with the name ```trace.nettrace``` in the folder where the ```dotnet-trace``` command is executed.

 - Open the trace with Perfview. Open the ```trace.nettrace``` file and explore the trace events.

 - ```Trace``` for performance analysis utility (dotnet-trace) (.NET Core documentation)

 - ```Trace``` for performance analysis utility (dotnet-trace) (dotnet/diagnostics GitHub repository documentation)

 - ```LoggingEventSource```

 - EventLevel

 - Perfview: Useful for viewing Event Source traces.

#### Perfview

### Windows ```EventLog```

```json
"Logging": {
  "EventLog": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

 - ```LogName```: "Application"

 - ```SourceName```: ".NET Runtime"

 - ```MachineName```: The local machine name is used.

```csharp
var builder = WebApplication.CreateBuilder();
builder.Logging.AddEventLog(eventLogSettings =>
{
    eventLogSettings.SourceName = "MyLogs";
});
```

### Azure App Service

```csharp
using Microsoft.Extensions.Logging.AzureAppServices;

var builder = WebApplication.CreateBuilder();
builder.Logging.AddAzureWebAppDiagnostics();
builder.Services.Configure<AzureFileLoggerOptions>(options =>
{
    options.FileName = "azure-diagnostics-";
    options.FileSizeLimit = 50 * 1024;
    options.RetainedFileCountLimit = 5;
});
builder.Services.Configure<AzureBlobLoggerOptions>(options =>
{
    options.BlobName = "log.txt";
});
```

 - Application ```Logging``` (Filesystem)

 - Application ```Logging``` (Blob)

#### Azure log streaming

 - The app server

 - The web server

 - Failed request tracing

 - Navigate to the App Service logs page from the app's portal page.

 - Set Application ```Logging``` (Filesystem) to On.

 - Choose the log Level. This setting only applies to Azure log streaming.

### Azure Application Insights

 - Application Insights overview

 - Application Insights for ASP.NET Core applications: Start here if you want to implement the full range of Application Insights telemetry along with logging.

 - ApplicationInsightsLoggerProvider for .NET Core ```ILogger``` logs: Start here if you want to implement the logging provider without the rest of Application Insights telemetry.

 - Application Insights logging adapters

 - Install, configure, and initialize the Application Insights SDK interactive tutorial.

## Third-party logging providers

 - elmah.io (GitHub repo)

 - Gelf (GitHub repo)

 - JSNLog (GitHub repo)

 - KissLog.net (GitHub repo)

 - Log4Net (GitHub repo)

 - NLog (GitHub repo)

 - PLogger (GitHub repo)

 - Sentry (GitHub repo)

 - Serilog (GitHub repo)

 - Stackdriver (Github repo)

 - Add a NuGet package to your project.

 - Call an ```ILoggerFactory``` extension method provided by the logging framework.

### No asynchronous logger methods

## Change log levels in a running app

## ```ILogger``` and ```ILoggerFactory```

 - The interfaces are in ```Microsoft.Extensions.Logging.Abstractions```.

 - The default implementations are in ```Microsoft.Extensions.Logging```.

## Apply log filter rules in code

```csharp
using Microsoft.Extensions.Logging.Console;
using Microsoft.Extensions.Logging.Debug;

var builder = WebApplication.CreateBuilder();
builder.Logging.AddFilter("System", LogLevel.Debug);
builder.Logging.AddFilter<DebugLoggerProvider>("Microsoft", LogLevel.Information);
builder.Logging.AddFilter<ConsoleLoggerProvider>("Microsoft", LogLevel.Trace);
```

 - The ```Debug``` logging provider.

 - ```Log``` level ```Information``` and higher.

 - All categories starting with "Microsoft".

## Automatically log scope with ```SpanId```, ```TraceId```, ```ParentId```, ```Baggage```, and ```Tags```.

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Logging.AddSimpleConsole(options =>
{
    options.IncludeScopes = true;
});

builder.Logging.Configure(options =>
{
    options.ActivityTrackingOptions = ActivityTrackingOptions.SpanId
                                       | ActivityTrackingOptions.TraceId
                                       | ActivityTrackingOptions.ParentId
                                       | ActivityTrackingOptions.Baggage
                                       | ActivityTrackingOptions.Tags;
});
var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
```

## Create a custom logger

## Additional resources

 - Improving logging performance with source generators

 - Behind [LogProperties] and the new telemetry logging source generator

 - ```Microsoft.Extensions.Logging``` source on GitHub

 - View or download sample code (how to download).

 - High performance logging

 - ```Logging``` bugs should be created in the ```dotnet/runtime``` GitHub repository.

 - ASP.NET Core Blazor logging

Ref: [Logging in ```.```NET Core and ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/logging/?view=aspnetcore-8.0)