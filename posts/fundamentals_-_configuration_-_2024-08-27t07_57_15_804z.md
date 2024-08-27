---
title: Fundamentals - Configuration
published: true
date: 2024-08-27 07:57:15
tags: Summary, AspNetCore
description: 
image:
---

## In this article

 - Settings files, such as ```appsettings.json```

 - Environment variables

 - Azure Key Vault

 - Azure App Configuration

 - Command-line arguments

 - Custom providers, installed or created

 - Directory files

 - In-memory .NET objects

## Application and Host Configuration

### Default application configuration sources

```csharp
var builder = WebApplication.CreateBuilder(args);
```

 - Command-line arguments using the Command-line configuration provider.

 - Non-prefixed environment variables using the Non-prefixed environment variables configuration provider.

 - User secrets when the app runs in the ```Development``` environment.

 - ```appsettings.{Environment}.json``` using the JSON configuration provider. For example, ```appsettings.Production.json``` and ```appsettings.Development.json```.

 - ```appsettings.json``` using the JSON configuration provider.

 - A fallback to the host configuration described in the next section.

### Default host configuration sources

 - Command-line arguments using the Command-line configuration provider

 - ```DOTNET_```-prefixed environment variables using the Environment variables configuration provider.

 - ```ASPNETCORE_```-prefixed environment variables using the Environment variables configuration provider.

 - ```ASPNETCORE_```-prefixed environment variables using the Environment variables configuration provider.

 - Command-line arguments using the Command-line configuration provider

 - ```DOTNET_```-prefixed environment variables using the Environment variables configuration provider.

### Host variables

 - Application ```name```

 - Environment ```name```, for example ```Development```, ```Production```, and ```Staging```

 - Content root

 - Web root

 - Whether to scan for hosting startup assemblies and which assemblies to scan for.

 - Variables read by app and library code from `HostBuilderContext.Configuration` in `IHostBuilder.ConfigureAppConfiguration` callbacks.

## Application configuration providers

```csharp
public class Index2Model : PageModel
{
    private IConfigurationRoot ConfigRoot;

    public Index2Model(IConfiguration configRoot)
    {
        ConfigRoot = (IConfigurationRoot)configRoot;
    }

    public ContentResult OnGet()
    {           
        string str = "";
        foreach (var provider in ConfigRoot.Providers.ToList())
        {
            str += provider.ToString() + "\n";
        }

        return Content(str);
    }
}
```

### ```appsettings.json```

```json
{
  "Position": {
    "Title": "Editor",
    "Name": "Joe Smith"
  },
  "MyKey": "My appsettings.json Value",
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  },
  "AllowedHosts": "*"
}
```

```csharp
public class TestModel : PageModel
{
    // requires using Microsoft.Extensions.Configuration;
    private readonly IConfiguration Configuration;

    public TestModel(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public ContentResult OnGet()
    {
        var myKeyValue = Configuration["MyKey"];
        var title = Configuration["Position:Title"];
        var name = Configuration["Position:Name"];
        var defaultLogLevel = Configuration["Logging:LogLevel:Default"];


        return Content($"MyKey value: {myKeyValue} \n" +
                       $"Title: {title} \n" +
                       $"Name: {name} \n" +
                       $"Default Log Level: {defaultLogLevel}");
    }
}
```

 - ```appsettings.json```

 - ```appsettings.{Environment}.json``` : For example, the ```appsettings.Production.json``` and ```appsettings.Development.json``` files. The environment version of the file is loaded based on the `IHostingEnvironment.EnvironmentName`. For more information, see Use multiple environments in ASP.NET Core.

 - In development, ```appsettings.Development.json``` configuration overwrites values found in ```appsettings.json```.

 - In production, ```appsettings.Production.json``` configuration overwrites values found in ```appsettings.json```. For example, when deploying the app to Azure.

### Comments in ```appsettings.json```

### Bind hierarchical configuration data using the options pattern

```json
"Position": {
    "Title": "Editor",
    "Name": "Joe Smith"
  }
```

```csharp
public class PositionOptions
{
    public const string Position = "Position";

    public string Title { get; set; } = String.Empty;
    public string Name { get; set; } = String.Empty;
}
```

 - Must be non-abstract with a public parameterless constructor.

 - All public read-write properties of the type are bound.

 - Fields are not bound. In the preceding code, ```Position``` is not bound. The ```Position``` field is used so the string "Position" doesn't need to be hard coded in the app when binding the class to a configuration provider.

 - Calls ```ConfigurationBinder.Bind``` to bind the ```PositionOptions``` class to the ```Position``` section.

 - Displays the ```Position``` configuration data.

```csharp
public class Test22Model : PageModel
{
    private readonly IConfiguration Configuration;

    public Test22Model(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public ContentResult OnGet()
    {
        var positionOptions = new PositionOptions();
        Configuration.GetSection(PositionOptions.Position).Bind(positionOptions);

        return Content($"Title: {positionOptions.Title} \n" +
                       $"Name: {positionOptions.Name}");
    }
}
```

```csharp
public class Test21Model : PageModel
{
    private readonly IConfiguration Configuration;
    public PositionOptions? positionOptions { get; private set; }

    public Test21Model(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public ContentResult OnGet()
    {            
        positionOptions = Configuration.GetSection(PositionOptions.Position)
                                                     .Get<PositionOptions>();

        return Content($"Title: {positionOptions.Title} \n" +
                       $"Name: {positionOptions.Name}");
    }
}
```

```csharp
using ConfigSample.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

builder.Services.Configure<PositionOptions>(
    builder.Configuration.GetSection(PositionOptions.Position));

var app = builder.Build();
```

```csharp
public class Test2Model : PageModel
{
    private readonly PositionOptions _options;

    public Test2Model(IOptions<PositionOptions> options)
    {
        _options = options.Value;
    }

    public ContentResult OnGet()
    {
        return Content($"Title: {_options.Title} \n" +
                       $"Name: {_options.Name}");
    }
}
```

## Combining service collection

```csharp
using ConfigSample.Options;
using Microsoft.Extensions.DependencyInjection.ConfigSample.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

builder.Services.Configure<PositionOptions>(
    builder.Configuration.GetSection(PositionOptions.Position));
builder.Services.Configure<ColorOptions>(
    builder.Configuration.GetSection(ColorOptions.Color));

builder.Services.AddScoped<IMyDependency, MyDependency>();
builder.Services.AddScoped<IMyDependency2, MyDependency2>();

var app = builder.Build();
```

```csharp
using ConfigSample.Options;
using Microsoft.Extensions.Configuration;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class MyConfigServiceCollectionExtensions
    {
        public static IServiceCollection AddConfig(
             this IServiceCollection services, IConfiguration config)
        {
            services.Configure<PositionOptions>(
                config.GetSection(PositionOptions.Position));
            services.Configure<ColorOptions>(
                config.GetSection(ColorOptions.Color));

            return services;
        }

        public static IServiceCollection AddMyDependencyGroup(
             this IServiceCollection services)
        {
            services.AddScoped<IMyDependency, MyDependency>();
            services.AddScoped<IMyDependency2, MyDependency2>();

            return services;
        }
    }
}
```

```csharp
using Microsoft.Extensions.DependencyInjection.ConfigSample.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddConfig(builder.Configuration)
    .AddMyDependencyGroup();

builder.Services.AddRazorPages();

var app = builder.Build();
```

## Security and user secrets

 - Never store passwords or other sensitive data in configuration provider code or in plain text configuration files. The Secret Manager tool can be used to store secrets in development.

 - Don't use production secrets in development or test environments.

 - Specify secrets outside of the project so that they can't be accidentally committed to a source code repository.

 - Use multiple environments in ASP.NET Core

 - Safe storage of app secrets in development in ASP.NET Core: Includes advice on using environment variables to store sensitive data. The Secret Manager tool uses the File configuration provider to store user secrets in a JSON file on the local system.

## Non-prefixed environment variables

 - List of highest to lowest priority default configuration sources including non-prefixed, ```ASPNETCORE_```-prefixed and ```DOTNETCORE_```-prefixed environment variables.

 - ```DOTNET_``` environment variables used outside of Microsoft.Extensions.Hosting.

 - Supported by all platforms. For example, the : separator is not supported by Bash, but ```__``` is.

 - Automatically replaced by a :

 - Set the environment keys and values of the preceding example on Windows.

 - Test the settings when using the sample download. The ```dotnet run``` command must be run in the project directory.

```dotnetcli
set MyKey="My key from Environment"
set Position__Title=Environment_Editor
set Position__Name=Environment_Rick
dotnet run
```

 - Are only set in processes launched from the command window they were set in.

 - Won't be read by browsers launched with Visual Studio.

```console
setx MyKey "My key from setx Environment" /M
setx Position__Title Environment_Editor /M
setx Position__Name Environment_Rick /M
```

 - With Visual Studio: Exit and restart Visual Studio.

 - With the CLI: Start a new command window and enter ```dotnet run```.

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

builder.Configuration.AddEnvironmentVariables(prefix: "MyCustomPrefix_");

var app = builder.Build();
```

 - ```builder```.Configuration.AddEnvironmentVariables(prefix: "MyCustomPrefix_") is added after the default configuration providers. For an example of ordering the configuration providers, see JSON configuration provider.

 - Environment variables set with the ```MyCustomPrefix_``` prefix override the default configuration providers. This includes environment variables without the prefix.

```dotnetcli
set MyCustomPrefix_MyKey="My key with MyCustomPrefix_ Environment"
set MyCustomPrefix_Position__Title=Editor_with_customPrefix
set MyCustomPrefix_Position__Name=Environment_Rick_cp
dotnet run
```

 - Encrypted at rest and transmitted over an encrypted channel.

 - Exposed as environment variables.

### Naming of environment variables

```json
{
    "SmtpServer": "smtp.example.com",
    "Logging": [
        {
            "Name": "ToEmail",
            "Level": "Critical",
            "Args": {
                "FromAddress": "MySystem@example.com",
                "ToAddress": "SRE@example.com"
            }
        },
        {
            "Name": "ToConsole",
            "Level": "Information"
        }
    ]
}
```

```console
setx SmtpServer smtp.example.com
setx Logging__0__Name ToEmail
setx Logging__0__Level Critical
setx Logging__0__Args__FromAddress MySystem@example.com
setx Logging__0__Args__ToAddress SRE@example.com
setx Logging__1__Name ToConsole
setx Logging__1__Level Information
```

### Environment variables set in generated ```launchSettings.json```

```json
"applicationUrl": "https://localhost:5001;http://localhost:5000"
```

### Escape environment variables on Linux

```cmd
groot@terminus:~$ systemd-escape http://localhost:5001
http:--localhost:5001
```

### Display environment variables

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

foreach (var c in builder.Configuration.AsEnumerable())
{
    Console.WriteLine(c.Key + " = " + c.Value);
}
```

## Command-line

 - ```appsettings.json``` and ```appsettings.{Environment}.json``` files.

 - App secrets in the ```Development``` environment.

 - Environment variables.

### Command-line arguments

```dotnetcli
dotnet run MyKey="Using =" Position:Title=Cmd Position:Name=Cmd_Rick
```

```dotnetcli
dotnet run /MyKey "Using /" /Position:Title=Cmd /Position:Name=Cmd_Rick
```

```dotnetcli
dotnet run --MyKey "Using --" --Position:Title=Cmd --Position:Name=Cmd_Rick
```

 - Must follow `=`, or the key must have a prefix of `--` or `/` when the ```value``` follows a space.

 - Isn't required if `=` is used. For example, MySetting=.

### Switch mappings

 - Switches must start with `-` or `--`.

 - The switch mappings dictionary must not contain duplicate keys.

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

var switchMappings = new Dictionary<string, string>()
         {
             { "-k1", "key1" },
             { "-k2", "key2" },
             { "--alt3", "key3" },
             { "--alt4", "key4" },
             { "--alt5", "key5" },
             { "--alt6", "key6" },
         };

builder.Configuration.AddCommandLine(args, switchMappings);

var app = builder.Build();
```

```dotnetcli
dotnet run -k1 value1 -k2 value2 --alt3=value2 /alt4=value3 --alt5 value5 /alt6 value6
```

```csharp
public class Test3Model : PageModel
{
    private readonly IConfiguration Config;

    public Test3Model(IConfiguration configuration)
    {
        Config = configuration;
    }

    public ContentResult OnGet()
    {
        return Content(
                $"Key1: '{Config["Key1"]}'\n" +
                $"Key2: '{Config["Key2"]}'\n" +
                $"Key3: '{Config["Key3"]}'\n" +
                $"Key4: '{Config["Key4"]}'\n" +
                $"Key5: '{Config["Key5"]}'\n" +
                $"Key6: '{Config["Key6"]}'");
    }
}
```

## Set environment and command-line arguments with Visual Studio

 - In Solution Explorer, right click the project and select Properties.

 - Select the Debug > General tab and select Open debug launch profiles UI.

## Hierarchical configuration data

```json
{
  "Position": {
    "Title": "Editor",
    "Name": "Joe Smith"
  },
  "MyKey": "My appsettings.json Value",
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  },
  "AllowedHosts": "*"
}
```

```csharp
public class TestModel : PageModel
{
    // requires using Microsoft.Extensions.Configuration;
    private readonly IConfiguration Configuration;

    public TestModel(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public ContentResult OnGet()
    {
        var myKeyValue = Configuration["MyKey"];
        var title = Configuration["Position:Title"];
        var name = Configuration["Position:Name"];
        var defaultLogLevel = Configuration["Logging:LogLevel:Default"];


        return Content($"MyKey value: {myKeyValue} \n" +
                       $"Title: {title} \n" +
                       $"Name: {name} \n" +
                       $"Default Log Level: {defaultLogLevel}");
    }
}
```

## Configuration keys and values

 - Are case-insensitive. For example, ```ConnectionString``` and ```connectionstring``` are treated as equivalent keys.

 - If a key and ```value``` is set in more than one configuration provider, the ```value``` from the last provider added is used. For more information, see Default configuration.

 - Hierarchical keys

   - Within the Configuration API, a colon separator (:) works on all platforms.

   - In environment variables, a colon separator may not work on all platforms. A double underscore, ```__```, is supported by all platforms and is automatically converted into a colon :.

   - In Azure Key Vault, hierarchical keys use `--` as a separator. The Azure Key Vault configuration provider automatically replaces -- with a : when the secrets are loaded into the app's configuration.

 - The ConfigurationBinder supports binding arrays to objects using array indices in configuration keys. Array binding is described in the Bind an array to a class section.

 - Are strings.

 - Null values can't be stored in configuration or bound to objects.

## Configuration providers

<table><thead>
<tr>
<th>Provider</th>
<th>Provides configuration from</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="../../security/key-vault-configuration?view=aspnetcore-8.0" data-linktype="relative-path">Azure Key Vault configuration provider</a></td>
<td>Azure Key Vault</td>
</tr>
<tr>
<td><a href="/en-us/azure/azure-app-configuration/quickstart-aspnet-core-app" data-linktype="absolute-path">Azure App configuration provider</a></td>
<td>Azure App Configuration</td>
</tr>
<tr>
<td><a href="#clcp" data-linktype="self-bookmark">Command-line configuration provider</a></td>
<td>Command-line parameters</td>
</tr>
<tr>
<td><a href="#custom-configuration-provider" data-linktype="self-bookmark">Custom configuration provider</a></td>
<td>Custom source</td>
</tr>
<tr>
<td><a href="#evcp" data-linktype="self-bookmark">Environment Variables configuration provider</a></td>
<td>Environment variables</td>
</tr>
<tr>
<td><a href="#file-configuration-provider" data-linktype="self-bookmark">File configuration provider</a></td>
<td>INI, JSON, and XML files</td>
</tr>
<tr>
<td><a href="#key-per-file-configuration-provider" data-linktype="self-bookmark">Key-per-file configuration provider</a></td>
<td>Directory files</td>
</tr>
<tr>
<td><a href="#memory-configuration-provider" data-linktype="self-bookmark">Memory configuration provider</a></td>
<td>In-memory collections</td>
</tr>
<tr>
<td><a href="../../security/app-secrets?view=aspnetcore-8.0" data-linktype="relative-path">User secrets</a></td>
<td>File in the user profile directory</td>
</tr>
</tbody></table>

 - ```appsettings.json```

 - ```appsettings.{Environment}.json```

 - User secrets

 - Environment variables using the Environment Variables configuration provider.

 - Command-line arguments using the Command-line configuration provider.

### Connection string prefixes

<table><thead>
<tr>
<th>Connection string prefix</th>
<th>Provider</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>CUSTOMCONNSTR_</code></td>
<td>Custom provider</td>
</tr>
<tr>
<td><code>MYSQLCONNSTR_</code></td>
<td><a href="https://www.mysql.com/" data-linktype="external">MySQL</a></td>
</tr>
<tr>
<td><code>SQLAZURECONNSTR_</code></td>
<td><a href="https://azure.microsoft.com/services/sql-database/" data-linktype="external">Azure SQL Database</a></td>
</tr>
<tr>
<td><code>SQLCONNSTR_</code></td>
<td><a href="https://www.microsoft.com/sql-server/" data-linktype="external">SQL Server</a></td>
</tr>
</tbody></table>

 - The configuration key is created by removing the environment variable prefix and adding a configuration key section (ConnectionStrings).

 - A new configuration key-value pair is created that represents the database connection provider (except for ```CUSTOMCONNSTR_```, which has no stated provider).

<table><thead>
<tr>
<th>Environment variable key</th>
<th>Converted configuration key</th>
<th>Provider configuration entry</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>CUSTOMCONNSTR_{KEY}</code></td>
<td><code>ConnectionStrings:{KEY}</code></td>
<td>Configuration entry not created.</td>
</tr>
<tr>
<td><code>MYSQLCONNSTR_{KEY}</code></td>
<td><code>ConnectionStrings:{KEY}</code></td>
<td>Key: <code>ConnectionStrings:{KEY}_ProviderName</code>:<br>Value: <code>MySql.Data.MySqlClient</code></td>
</tr>
<tr>
<td><code>SQLAZURECONNSTR_{KEY}</code></td>
<td><code>ConnectionStrings:{KEY}</code></td>
<td>Key: <code>ConnectionStrings:{KEY}_ProviderName</code>:<br>Value: <code>System.Data.SqlClient</code></td>
</tr>
<tr>
<td><code>SQLCONNSTR_{KEY}</code></td>
<td><code>ConnectionStrings:{KEY}</code></td>
<td>Key: <code>ConnectionStrings:{KEY}_ProviderName</code>:<br>Value: <code>System.Data.SqlClient</code></td>
</tr>
</tbody></table>

## File configuration provider

 - INI configuration provider

 - JSON configuration provider

 - XML configuration provider

### INI configuration provider

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddIniFile("MyIniConfig.ini", optional: true, reloadOnChange: true)
    .AddIniFile($"MyIniConfig.{builder.Environment.EnvironmentName}.ini",
                optional: true, reloadOnChange: true);

builder.Configuration.AddEnvironmentVariables();
builder.Configuration.AddCommandLine(args);

builder.Services.AddRazorPages();

var app = builder.Build();
```

 - Environment variables configuration provider

 - Command-line configuration provider.

```ini
MyKey="MyIniConfig.ini Value"

[Position]
Title="My INI Config title"
Name="My INI Config name"

[Logging:LogLevel]
Default=Information
Microsoft=Warning
```

```csharp
public class TestModel : PageModel
{
    // requires using Microsoft.Extensions.Configuration;
    private readonly IConfiguration Configuration;

    public TestModel(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public ContentResult OnGet()
    {
        var myKeyValue = Configuration["MyKey"];
        var title = Configuration["Position:Title"];
        var name = Configuration["Position:Name"];
        var defaultLogLevel = Configuration["Logging:LogLevel:Default"];


        return Content($"MyKey value: {myKeyValue} \n" +
                       $"Title: {title} \n" +
                       $"Name: {name} \n" +
                       $"Default Log Level: {defaultLogLevel}");
    }
}
```

### JSON configuration provider

 - Whether the file is optional.

 - Whether the configuration is reloaded if the file changes.

```csharp
using Microsoft.Extensions.DependencyInjection.ConfigSample.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("MyConfig.json",
        optional: true,
        reloadOnChange: true);

builder.Services.AddRazorPages();

var app = builder.Build();
```

 - Configures the JSON configuration provider to load the ```MyConfig.json``` file with the following options:

   - ```optional: ```true``````: The file is optional.

   - ```reloadOnChange: ```true`````` : The file is reloaded when changes are saved.

 - Reads the default configuration providers before the ```MyConfig.json``` file. Settings in the ```MyConfig.json``` file override setting in the default configuration providers, including the Environment variables configuration provider and the Command-line configuration provider.

### XML configuration provider

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddXmlFile("MyXMLFile.xml", optional: true, reloadOnChange: true)
    .AddXmlFile($"MyXMLFile.{builder.Environment.EnvironmentName}.xml",
                optional: true, reloadOnChange: true);

builder.Configuration.AddEnvironmentVariables();
builder.Configuration.AddCommandLine(args);

builder.Services.AddRazorPages();

var app = builder.Build();
```

 - Environment variables configuration provider

 - Command-line configuration provider.

```xml
<?xml version="1.0" encoding="utf-8" ?>
<configuration>
  <MyKey>MyXMLFile Value</MyKey>
  <Position>
    <Title>Title from  MyXMLFile</Title>
    <Name>Name from MyXMLFile</Name>
  </Position>
  <Logging>
    <LogLevel>
      <Default>Information</Default>
      <Microsoft>Warning</Microsoft>
    </LogLevel>
  </Logging>
</configuration>
```

```csharp
public class TestModel : PageModel
{
    // requires using Microsoft.Extensions.Configuration;
    private readonly IConfiguration Configuration;

    public TestModel(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public ContentResult OnGet()
    {
        var myKeyValue = Configuration["MyKey"];
        var title = Configuration["Position:Title"];
        var name = Configuration["Position:Name"];
        var defaultLogLevel = Configuration["Logging:LogLevel:Default"];


        return Content($"MyKey value: {myKeyValue} \n" +
                       $"Title: {title} \n" +
                       $"Name: {name} \n" +
                       $"Default Log Level: {defaultLogLevel}");
    }
}
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <section name="section0">
    <key name="key0">value 00</key>
    <key name="key1">value 01</key>
  </section>
  <section name="section1">
    <key name="key0">value 10</key>
    <key name="key1">value 11</key>
  </section>
</configuration>
```

```csharp
public class IndexModel : PageModel
{
    private readonly IConfiguration Configuration;

    public IndexModel(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public ContentResult OnGet()
    {
        var key00 = "section:section0:key:key0";
        var key01 = "section:section0:key:key1";
        var key10 = "section:section1:key:key0";
        var key11 = "section:section1:key:key1";

        var val00 = Configuration[key00];
        var val01 = Configuration[key01];
        var val10 = Configuration[key10];
        var val11 = Configuration[key11];

        return Content($"{key00} value: {val00} \n" +
                       $"{key01} value: {val01} \n" +
                       $"{key10} value: {val10} \n" +
                       $"{key10} value: {val11} \n"
                       );
    }
}
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <key attribute="value" />
  <section>
    <key attribute="value" />
  </section>
</configuration>
```

 - key:attribute

 - section:key:attribute

## Key-per-file configuration provider

 - An `Action<KeyPerFileConfigurationSource>` delegate that configures the source.

 - Whether the directory is optional and the path to the directory.

```csharp
.ConfigureAppConfiguration((hostingContext, config) =>
{
    var path = Path.Combine(
        Directory.GetCurrentDirectory(), "path/to/files");
    config.AddKeyPerFile(directoryPath: path, optional: true);
})
```

## Memory configuration provider

```csharp
var builder = WebApplication.CreateBuilder(args);

var Dict = new Dictionary<string, string>
        {
           {"MyKey", "Dictionary MyKey Value"},
           {"Position:Title", "Dictionary_Title"},
           {"Position:Name", "Dictionary_Name" },
           {"Logging:LogLevel:Default", "Warning"}
        };

builder.Configuration.AddInMemoryCollection(Dict);
builder.Configuration.AddEnvironmentVariables();
builder.Configuration.AddCommandLine(args);

builder.Services.AddRazorPages();

var app = builder.Build();
```

```csharp
public class TestModel : PageModel
{
    // requires using Microsoft.Extensions.Configuration;
    private readonly IConfiguration Configuration;

    public TestModel(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public ContentResult OnGet()
    {
        var myKeyValue = Configuration["MyKey"];
        var title = Configuration["Position:Title"];
        var name = Configuration["Position:Name"];
        var defaultLogLevel = Configuration["Logging:LogLevel:Default"];


        return Content($"MyKey value: {myKeyValue} \n" +
                       $"Title: {title} \n" +
                       $"Name: {name} \n" +
                       $"Default Log Level: {defaultLogLevel}");
    }
}
```

## Kestrel endpoint configuration

 - UseUrls

 - ```--urls``` on the command line

 - The environment variable ```ASPNETCORE_URLS```

```json
{
  "Kestrel": {
    "Endpoints": {
      "Https": {
        "Url": "https://localhost:9999"
      }
    }
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  },
  "AllowedHosts": "*"
}
```

## GetValue

```csharp
public class TestNumModel : PageModel
{
    private readonly IConfiguration Configuration;

    public TestNumModel(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public ContentResult OnGet()
    {
        var number = Configuration.GetValue<int>("NumberKey", 99);
        return Content($"{number}");
    }
}
```

## ```GetSection```, GetChildren, and Exists

```json
{
  "section0": {
    "key0": "value00",
    "key1": "value01"
  },
  "section1": {
    "key0": "value10",
    "key1": "value11"
  },
  "section2": {
    "subsection0": {
      "key0": "value200",
      "key1": "value201"
    },
    "subsection1": {
      "key0": "value210",
      "key1": "value211"
    }
  }
}
```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddJsonFile("MySubsection.json",
                 optional: true,
                 reloadOnChange: true);

builder.Services.AddRazorPages();

var app = builder.Build();
```

### ```GetSection```

```csharp
public class TestSectionModel : PageModel
{
    private readonly IConfiguration Config;

    public TestSectionModel(IConfiguration configuration)
    {
        Config = configuration.GetSection("section1");
    }

    public ContentResult OnGet()
    {
        return Content(
                $"section1:key0: '{Config["key0"]}'\n" +
                $"section1:key1: '{Config["key1"]}'");
    }
}
```

```csharp
public class TestSection2Model : PageModel
{
    private readonly IConfiguration Config;

    public TestSection2Model(IConfiguration configuration)
    {
        Config = configuration.GetSection("section2:subsection0");
    }

    public ContentResult OnGet()
    {
        return Content(
                $"section2:subsection0:key0 '{Config["key0"]}'\n" +
                $"section2:subsection0:key1:'{Config["key1"]}'");
    }
}
```

### GetChildren and Exists

```csharp
public class TestSection4Model : PageModel
{
    private readonly IConfiguration Config;

    public TestSection4Model(IConfiguration configuration)
    {
        Config = configuration;
    }

    public ContentResult OnGet()
    {
        string s = "";
        var selection = Config.GetSection("section2");
        if (!selection.Exists())
        {
            throw new Exception("section2 does not exist.");
        }
        var children = selection.GetChildren();

        foreach (var subSection in children)
        {
            int i = 0;
            var key1 = subSection.Key + ":key" + i++.ToString();
            var key2 = subSection.Key + ":key" + i.ToString();
            s += key1 + " value: " + selection[key1] + "\n";
            s += key2 + " value: " + selection[key2] + "\n";
        }
        return Content(s);
    }
}
```

## Bind an array

```json
{
  "array": {
    "entries": {
      "0": "value00",
      "1": "value10",
      "2": "value20",
      "4": "value40",
      "5": "value50"
    }
  }
}
```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddJsonFile("MyArray.json",
                 optional: true,
                 reloadOnChange: true);

builder.Services.AddRazorPages();

var app = builder.Build();
```

```csharp
public class ArrayModel : PageModel
{
    private readonly IConfiguration Config;
    public ArrayExample? _array { get; private set; }

    public ArrayModel(IConfiguration config)
    {
        Config = config;
    }

    public ContentResult OnGet()
    {
       _array = Config.GetSection("array").Get<ArrayExample>();
        if (_array == null)
        {
            throw new ArgumentNullException(nameof(_array));
        }
        string s = String.Empty;

        for (int j = 0; j < _array.Entries.Length; j++)
        {
            s += $"Index: {j}  Value:  {_array.Entries[j]} \n";
        }

        return Content(s);
    }
}
```

```csharp
public class ArrayExample
{
    public string[]? Entries { get; set; } 
}
```

```text
Index: 0  Value: value00
Index: 1  Value: value10
Index: 2  Value: value20
Index: 3  Value: value40
Index: 4  Value: value50
```

## Custom configuration provider

 - The EF in-memory database is used for demonstration purposes. To use a database that requires a connection string, implement a secondary ```ConfigurationBuilder``` to supply the connection string from another configuration provider.

 - The provider reads a database table into configuration at startup. The provider doesn't query the database on a per-key basis.

 - Reload-on-change isn't implemented, so updating the database after the app starts has no effect on the app's configuration.

```csharp
public class EFConfigurationValue
{
    public string Id { get; set; } = String.Empty;
    public string Value { get; set; } = String.Empty;
}
```

```csharp
public class EFConfigurationContext : DbContext
{
    public EFConfigurationContext(DbContextOptions<EFConfigurationContext> options) : base(options)
    {
    }

    public DbSet<EFConfigurationValue> Values => Set<EFConfigurationValue>();
}
```

```csharp
public class EFConfigurationSource : IConfigurationSource
{
    private readonly Action<DbContextOptionsBuilder> _optionsAction;

    public EFConfigurationSource(Action<DbContextOptionsBuilder> optionsAction) => _optionsAction = optionsAction;

    public IConfigurationProvider Build(IConfigurationBuilder builder) => new EFConfigurationProvider(_optionsAction);
}
```

```csharp
public class EFConfigurationProvider : ConfigurationProvider
{
    public EFConfigurationProvider(Action<DbContextOptionsBuilder> optionsAction)
    {
        OptionsAction = optionsAction;
    }

    Action<DbContextOptionsBuilder> OptionsAction { get; }

    public override void Load()
    {
        var builder = new DbContextOptionsBuilder<EFConfigurationContext>();

        OptionsAction(builder);

        using (var dbContext = new EFConfigurationContext(builder.Options))
        {
            if (dbContext == null || dbContext.Values == null)
            {
                throw new Exception("Null DB context");
            }
            dbContext.Database.EnsureCreated();

            Data = !dbContext.Values.Any()
                ? CreateAndSaveDefaultValues(dbContext)
                : dbContext.Values.ToDictionary(c => c.Id, c => c.Value);
        }
    }

    private static IDictionary<string, string> CreateAndSaveDefaultValues(
        EFConfigurationContext dbContext)
    {
        // Quotes (c)2005 Universal Pictures: Serenity
        // https://www.uphe.com/movies/serenity-2005
        var configValues =
            new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                    { "quote1", "I aim to misbehave." },
                    { "quote2", "I swallowed a bug." },
                    { "quote3", "You can't stop the signal, Mal." }
            };

        if (dbContext == null || dbContext.Values == null)
        {
            throw new Exception("Null DB context");
        }

        dbContext.Values.AddRange(configValues
            .Select(kvp => new EFConfigurationValue
            {
                Id = kvp.Key,
                Value = kvp.Value
            })
            .ToArray());

        dbContext.SaveChanges();

        return configValues;
    }
}
```

```csharp
public static class EntityFrameworkExtensions
{
    public static IConfigurationBuilder AddEFConfiguration(
               this IConfigurationBuilder builder,
               Action<DbContextOptionsBuilder> optionsAction)
    {
        return builder.Add(new EFConfigurationSource(optionsAction));
    }
}
```

```csharp
//using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEFConfiguration(
    opt => opt.UseInMemoryDatabase("InMemoryDb"));

var app = builder.Build();

app.Run();
```

## Access configuration with Dependency Injection (DI)

```csharp
public class Service
{
    private readonly IConfiguration _config;

    public Service(IConfiguration config) =>
        _config = config;

    public void DoSomething()
    {
        var configSettingValue = _config["ConfigSetting"];

        // ...
    }
}
```

## Access configuration in Razor Pages

```cshtml
@page
@model Test5Model
@using Microsoft.Extensions.Configuration
@inject IConfiguration Configuration

Configuration value for 'MyKey': @Configuration["MyKey"]
```

```csharp
using SampleApp.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

builder.Services.Configure<MyOptions>(
    builder.Configuration.GetSection("MyOptions"));

var app = builder.Build();
```

```cshtml
@page
@model SampleApp.Pages.Test3Model
@using Microsoft.Extensions.Options
@using SampleApp.Models
@inject IOptions<MyOptions> optionsAccessor


<p><b>Option1:</b> @optionsAccessor.Value.Option1</p>
<p><b>Option2:</b> @optionsAccessor.Value.Option2</p>
```

## Access configuration in a MVC view file

```cshtml
@using Microsoft.Extensions.Configuration
@inject IConfiguration Configuration

Configuration value for 'MyKey': @Configuration["MyKey"]
```

## Access configuration in ```Program.cs```

```csharp
var builder = WebApplication.CreateBuilder(args);

var key1 = builder.Configuration.GetValue<string>("KeyOne");

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

var key2 = app.Configuration.GetValue<int>("KeyTwo");
var key3 = app.Configuration.GetValue<bool>("KeyThree");

app.Logger.LogInformation("KeyOne: {KeyOne}", key1);
app.Logger.LogInformation("KeyTwo: {KeyTwo}", key2);
app.Logger.LogInformation("KeyThree: {KeyThree}", key3);

app.Run();
```

```json
{
  ...
  "KeyOne": "Key One Value",
  "KeyTwo": 1999,
  "KeyThree": true
}
```

## Configure options with a delegate

```csharp
using SampleApp.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

builder.Services.Configure<MyOptions>(myOptions =>
{
    myOptions.Option1 = "Value configured in delegate";
    myOptions.Option2 = 500;
});

var app = builder.Build();
```

```csharp
public class Test2Model : PageModel
{
    private readonly IOptions<MyOptions> _optionsDelegate;

    public Test2Model(IOptions<MyOptions> optionsDelegate )
    {
        _optionsDelegate = optionsDelegate;
    }

    public ContentResult OnGet()
    {
        return Content($"Option1: {_optionsDelegate.Value.Option1} \n" +
                       $"Option2: {_optionsDelegate.Value.Option2}");
    }
}
```

## Host versus app configuration

## Default host configuration

 - Host configuration is provided from:

   - Environment variables prefixed with ```DOTNET_``` (for example, ```DOTNET_ENVIRONMENT```) using the Environment Variables configuration provider. The prefix (DOTNET_) is stripped when the configuration key-value pairs are loaded.

   - Command-line arguments using the Command-line configuration provider.

 - Web Host default configuration is established (ConfigureWebHostDefaults):

   - Kestrel is used as the web server and configured using the app's configuration providers.

   - Add Host Filtering Middleware.

   - Add Forwarded Headers Middleware if the ```ASPNETCORE_FORWARDEDHEADERS_ENABLED``` environment variable is set to ```true```.

   - Enable IIS integration.

## Other configuration

 - ```launch.json```/launchSettings.json are tooling configuration files for the ```Development``` environment, described:

   - In Use multiple environments in ASP.NET Core.

   - Across the documentation set where the files are used to configure ASP.NET Core apps for ```Development``` scenarios.

 - ```web.config``` is a server configuration file, described in the following topics:

   - Host ASP.NET Core on Windows with IIS

   - ASP.NET Core Module (ANCM) for IIS

## Add configuration from an external assembly

## Configuration-binding source generator

## Additional resources

 - Configuration source code

 - ```WebApplicationBuilder``` source code

 - View or download sample code (how to download)

 - Options pattern in ASP.NET Core

 - ASP.NET Core Blazor configuration

Ref: [Configuration in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/?view=aspnetcore-8.0)