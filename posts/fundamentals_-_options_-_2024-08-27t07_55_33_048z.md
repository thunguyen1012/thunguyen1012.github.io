---
title: Fundamentals - Options
published: true
date: 2024-08-27 07:55:33
tags: Summary, AspNetCore
description: 
image:
---

## In this article

 - Encapsulation:

   - Classes that depend on configuration settings depend only on the configuration settings that they use.

 - Separation of Concerns:

   - Settings for different parts of the app aren't dependent or coupled to one another.

## ```Bind``` hierarchical configuration

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

 - Must be non-abstract.

 - Has public read-write properties of the type that have corresponding items in config are bound.

 - Has its read-write properties bound to matching entries in configuration.

 - Does not have its fields bound. In the preceding code, ```Position``` is not bound. The ```Position``` field is used so the string "Position" doesn't need to be hard coded in the app when binding the class to a configuration provider.

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
namespace ConfigSample.Options;

public abstract class SomethingWithAName
{
    public abstract string? Name { get; set; }
}

public class NameTitleOptions(int age) : SomethingWithAName
{
    public const string NameTitle = "NameTitle";

    public override string? Name { get; set; }
    public string Title { get; set; } = string.Empty;

    public int Age { get; set; } = age;
}
```

```csharp
public class Test33Model : PageModel
{
    private readonly IConfiguration Configuration;

    public Test33Model(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public ContentResult OnGet()
    {
        var nameTitleOptions = new NameTitleOptions(22);
        Configuration.GetSection(NameTitleOptions.NameTitle).Bind(nameTitleOptions);

        return Content($"Title: {nameTitleOptions.Title} \n" +
                       $"Name: {nameTitleOptions.Name}  \n" +
                       $"Age: {nameTitleOptions.Age}"
                       );
    }
}
```

 - ```Bind``` allows the concretion of an abstract.

 - `Get<>` has to create an instance itself.

## The Options Pattern

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

## Options interfaces

 - Does not support:

   - Reading of configuration data after the app has started.

   - Named options

 - Is registered as a Singleton and can be injected into any service lifetime.

 - Is useful in scenarios where options should be recomputed on every request. For more information, see Use ```IOptionsSnapshot``` to read updated data.

 - Is registered as Scoped and therefore can't be injected into a Singleton service.

 - Supports named options

 - Is used to retrieve options and manage options notifications for ```TOptions``` instances.

 - Is registered as a Singleton and can be injected into any service lifetime.

 - Supports:

   - Change notifications

   - named options

   - Reloadable configuration

   - Selective options invalidation (`IOptionsMonitorCache<TOptions>`)

## Use ```IOptionsSnapshot``` to read updated data

 - Options are computed once per request when accessed and cached for the lifetime of the request.

 - May incur a significant performance penalty because it's a Scoped service and is recomputed per request. For more information, see this GitHub issue and Improve the performance of configuration binding.

 - Changes to the configuration are read after the app starts when using configuration providers that support reading updated configuration values.

 - ```IOptionsMonitor``` is a Singleton service that retrieves current option values at any time, which is especially useful in singleton dependencies.

 - ```IOptionsSnapshot``` is a Scoped service and provides a snapshot of the options at the time the ```IOptionsSnapshot<T>``` object is constructed. Options snapshots are designed for use with transient and scoped dependencies.

```csharp
public class TestSnapModel : PageModel
{
    private readonly MyOptions _snapshotOptions;

    public TestSnapModel(IOptionsSnapshot<MyOptions> snapshotOptionsAccessor)
    {
        _snapshotOptions = snapshotOptionsAccessor.Value;
    }

    public ContentResult OnGet()
    {
        return Content($"Option1: {_snapshotOptions.Option1} \n" +
                       $"Option2: {_snapshotOptions.Option2}");
    }
}
```

```csharp
using SampleApp.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

builder.Services.Configure<MyOptions>(
    builder.Configuration.GetSection("MyOptions"));

var app = builder.Build();
```

## ```IOptionsMonitor```

```csharp
using SampleApp.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

builder.Services.Configure<MyOptions>(
    builder.Configuration.GetSection("MyOptions"));

var app = builder.Build();
```

```csharp
public class TestMonitorModel : PageModel
{
    private readonly IOptionsMonitor<MyOptions> _optionsDelegate;

    public TestMonitorModel(IOptionsMonitor<MyOptions> optionsDelegate )
    {
        _optionsDelegate = optionsDelegate;
    }

    public ContentResult OnGet()
    {
        return Content($"Option1: {_optionsDelegate.CurrentValue.Option1} \n" +
                       $"Option2: {_optionsDelegate.CurrentValue.Option2}");
    }
}
```

## Named options support using IConfigureNamedOptions

 - Are useful when multiple configuration sections bind to the same properties.

 - Are case sensitive.

```json
{
  "TopItem": {
    "Month": {
      "Name": "Green Widget",
      "Model": "GW46"
    },
    "Year": {
      "Name": "Orange Gadget",
      "Model": "OG35"
    }
  }
}
```

```csharp
public class TopItemSettings
{
    public const string Month = "Month";
    public const string Year = "Year";

    public string Name { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
}
```

```csharp
using SampleApp.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

builder.Services.Configure<TopItemSettings>(TopItemSettings.Month,
    builder.Configuration.GetSection("TopItem:Month"));
builder.Services.Configure<TopItemSettings>(TopItemSettings.Year,
    builder.Configuration.GetSection("TopItem:Year"));

var app = builder.Build();
```

```csharp
public class TestNOModel : PageModel
{
    private readonly TopItemSettings _monthTopItem;
    private readonly TopItemSettings _yearTopItem;

    public TestNOModel(IOptionsSnapshot<TopItemSettings> namedOptionsAccessor)
    {
        _monthTopItem = namedOptionsAccessor.Get(TopItemSettings.Month);
        _yearTopItem = namedOptionsAccessor.Get(TopItemSettings.Year);
    }

    public ContentResult OnGet()
    {
        return Content($"Month:Name {_monthTopItem.Name} \n" +
                       $"Month:Model {_monthTopItem.Model} \n\n" +
                       $"Year:Name {_yearTopItem.Name} \n" +
                       $"Year:Model {_yearTopItem.Model} \n"   );
    }
}
```

## ```OptionsBuilder``` API

## Use DI services to configure options

 - Pass a configuration delegate to Configure on ```OptionsBuilder<TOptions>```. ```OptionsBuilder<TOptions>``` provides overloads of Configure that allow use of up to five services to configure options:

```csharp
builder.Services.AddOptions<MyOptions>("optionalName")
    .Configure<Service1, Service2, Service3, Service4, Service5>(
        (o, s, s2, s3, s4, s5) => 
            o.Property = DoSomethingWith(s, s2, s3, s4, s5));
```

 - Create a type that implements `IConfigureOptions<TOptions>` or `IConfigureNamedOptions<TOptions>` and register the type as a service.

## Options validation

```json
{
  "MyConfig": {
    "Key1": "My Key One",
    "Key2": 10,
    "Key3": 32
  }
}
```

```csharp
public class MyConfigOptions
{
    public const string MyConfig = "MyConfig";

    [RegularExpression(@"^[a-zA-Z''-'\s]{1,40}$")]
    public string Key1 { get; set; }
    [Range(0, 1000,
        ErrorMessage = "Value for {0} must be between {1} and {2}.")]
    public int Key2 { get; set; }
    public int Key3 { get; set; }
}
```

 - Calls `AddOptions` to get an ```OptionsBuilder<TOptions>``` that binds to the ```MyConfigOptions``` class.

 - Calls ```ValidateDataAnnotations``` to enable validation using ```DataAnnotations```.

```csharp
using OptionsValidationSample.Configuration;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

builder.Services.AddOptions<MyConfigOptions>()
            .Bind(builder.Configuration.GetSection(MyConfigOptions.MyConfig))
            .ValidateDataAnnotations();

var app = builder.Build();
```

```csharp
public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly IOptions<MyConfigOptions> _config;

    public HomeController(IOptions<MyConfigOptions> config,
                          ILogger<HomeController> logger)
    {
        _config = config;
        _logger = logger;

        try
        {
            var configValue = _config.Value;

        }
        catch (OptionsValidationException ex)
        {
            foreach (var failure in ex.Failures)
            {
                _logger.LogError(failure);
            }
        }
    }

    public ContentResult Index()
    {
        string msg;
        try
        {
            msg = $"Key1: {_config.Value.Key1} \n" +
                  $"Key2: {_config.Value.Key2} \n" +
                  $"Key3: {_config.Value.Key3}";
        }
        catch (OptionsValidationException optValEx)
        {
            return Content(optValEx.Message);
        }
        return Content(msg);
    }
```

```csharp
using OptionsValidationSample.Configuration;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

builder.Services.AddOptions<MyConfigOptions>()
            .Bind(builder.Configuration.GetSection(MyConfigOptions.MyConfig))
            .ValidateDataAnnotations()
        .Validate(config =>
        {
            if (config.Key2 != 0)
            {
                return config.Key3 > config.Key2;
            }

            return true;
        }, "Key3 must be > than Key2.");   // Failure message.

var app = builder.Build();
```

### ```IValidateOptions<TOptions>``` and ```IValidatableObject```

```csharp
public class MyConfigValidation : IValidateOptions<MyConfigOptions>
{
    public MyConfigOptions _config { get; private set; }

    public  MyConfigValidation(IConfiguration config)
    {
        _config = config.GetSection(MyConfigOptions.MyConfig)
            .Get<MyConfigOptions>();
    }

    public ValidateOptionsResult Validate(string name, MyConfigOptions options)
    {
        string? vor = null;
        var rx = new Regex(@"^[a-zA-Z''-'\s]{1,40}$");
        var match = rx.Match(options.Key1!);

        if (string.IsNullOrEmpty(match.Value))
        {
            vor = $"{options.Key1} doesn't match RegEx \n";
        }

        if ( options.Key2 < 0 || options.Key2 > 1000)
        {
            vor = $"{options.Key2} doesn't match Range 0 - 1000 \n";
        }

        if (_config.Key2 != default)
        {
            if(_config.Key3 <= _config.Key2)
            {
                vor +=  "Key3 must be > than Key2.";
            }
        }

        if (vor != null)
        {
            return ValidateOptionsResult.Fail(vor);
        }

        return ValidateOptionsResult.Success;
    }
}
```

```csharp
using Microsoft.Extensions.Options;
using OptionsValidationSample.Configuration;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

builder.Services.Configure<MyConfigOptions>(builder.Configuration.GetSection(
                                        MyConfigOptions.MyConfig));

builder.Services.AddSingleton<IValidateOptions
                              <MyConfigOptions>, MyConfigValidation>();

var app = builder.Build();
```

 - Implement the ```IValidatableObject``` interface and its Validate method within the class.

 - Call ```ValidateDataAnnotations``` in ```Program.cs```.

### ```ValidateOnStart```

```csharp
builder.Services.AddOptions<MyConfigOptions>()
    .Bind(builder.Configuration.GetSection(MyConfigOptions.MyConfig))
    .ValidateDataAnnotations()
    .ValidateOnStart();
```

## Options post-configuration

```csharp
using OptionsValidationSample.Configuration;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

builder.Services.AddOptions<MyConfigOptions>()
                .Bind(builder.Configuration.GetSection(MyConfigOptions.MyConfig));

builder.Services.PostConfigure<MyConfigOptions>(myOptions =>
{
    myOptions.Key1 = "post_configured_key1_value";
});
```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

builder.Services.Configure<TopItemSettings>(TopItemSettings.Month,
    builder.Configuration.GetSection("TopItem:Month"));
builder.Services.Configure<TopItemSettings>(TopItemSettings.Year,
    builder.Configuration.GetSection("TopItem:Year"));

builder.Services.PostConfigure<TopItemSettings>("Month", myOptions =>
{
    myOptions.Name = "post_configured_name_value";
    myOptions.Model = "post_configured_model_value";
});

var app = builder.Build();
```

```csharp
using OptionsValidationSample.Configuration;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

builder.Services.AddOptions<MyConfigOptions>()
                .Bind(builder.Configuration.GetSection(MyConfigOptions.MyConfig));

builder.Services.PostConfigureAll<MyConfigOptions>(myOptions =>
{
    myOptions.Key1 = "post_configured_key1_value";
});
```

## Access options in ```Program.cs```

```csharp
var app = builder.Build();

var option1 = app.Services.GetRequiredService<IOptionsMonitor<MyOptions>>()
    .CurrentValue.Option1;
```

## Additional resources

 - View or download sample code (how to download)

Ref: [Options pattern in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/options?view=aspnetcore-8.0)