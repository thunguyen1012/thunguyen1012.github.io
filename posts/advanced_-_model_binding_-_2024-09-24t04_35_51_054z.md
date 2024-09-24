---
title: Advanced - Model binding
published: true
date: 2024-09-24 04:35:51
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## What is Model binding

 - Retrieves data from various sources such as route data, form fields, and query strings.

 - Provides the data to controllers and Razor pages in method parameters and public properties.

 - Converts ```string``` data to .NET types.

 - Updates properties of complex types.

## Example

```csharp
[HttpGet("{id}")]
public ActionResult<Pet> GetById(int id, bool dogsOnly)
```

```http
https://contoso.com/api/pets/2?DogsOnly=true
```

 - Finds the first parameter of ```GetById```, an integer named ```id```.

 - Looks through the available sources in the HTTP request and finds ```id = "2"``` in route data.

 - Converts the ```string``` "2" into integer 2.

 - Finds the next parameter of ```GetById```, a boolean named ```dogsOnly```.

 - Looks through the sources and finds "DogsOnly=true" in the query ```string```. ```Name``` matching is not case-sensitive.

 - Converts the ```string``` "true" into boolean ```true```.

## Targets

 - Parameters of the controller action method that a request is routed to.

 - Parameters of the Razor Pages handler method that a request is routed to.

 - Public properties of a controller or ```PageModel``` class, if specified by attributes.

### [BindProperty] attribute

```csharp
public class EditModel : PageModel
{
    [BindProperty]
    public Instructor? Instructor { get; set; }

    // ...
}
```

### [BindProperties] attribute

```csharp
[BindProperties]
public class CreateModel : PageModel
{
    public Instructor? Instructor { get; set; }

    // ...
}
```

### Model binding for HTTP GET requests

```csharp
[BindProperty(Name = "ai_user", SupportsGet = true)]
public string? ApplicationInsightsCookie { get; set; }
```

## Model binding simple and complex types

## Sources

 - Form fields

 - The request body (For controllers that have the [ApiController] attribute.)

 - Route data

 - Query ```string``` parameters

 - Uploaded files

 - Route data and query ```string``` values are used only for simple types.

 - Uploaded files are bound only to target types that implement ```IFormFile``` or IEnumerable<IFormFile>.

 - [FromQuery] - Gets values from the query ```string```.

 - [FromRoute] - Gets values from route data.

 - [FromForm] - Gets values from posted form fields.

 - [FromBody] - Gets values from the request body.

 - [FromHeader] - Gets values from HTTP headers.

 - Are added to model properties individually and not to the model class, as in the following example:

```csharp
public class Instructor
{
    public int Id { get; set; }

    [FromQuery(Name = "Note")]
    public string? NoteFromQueryString { get; set; }

    // ...
}
```

 - Optionally accept a model name value in the constructor. This option is provided in case the property name doesn't match the value in the request. For instance, the value in the request might be a header with a hyphen in its name, as in the following example:

```csharp
public void OnGet([FromHeader(Name = "Accept-Language")] string language)
```

### [FromBody] attribute

```csharp
public ActionResult<Pet> Create([FromBody] Pet pet)
```

```csharp
public class Pet
{
    public string Name { get; set; } = null!;

    [FromQuery] // Attribute is ignored.
    public string Breed { get; set; } = null!;
}
```

 - The [FromQuery] attribute is ignored.

 - The ```Breed``` property is not populated from a query ```string``` parameter.

### Additional sources

 - ```Create``` a class that implements ```IValueProvider```.

 - ```Create``` a class that implements ```IValueProviderFactory```.

 - Register the factory class in ```Program.cs```.

```csharp
builder.Services.AddControllers(options =>
{
    options.ValueProviderFactories.Add(new CookieValueProviderFactory());
});
```

## No source for a model property

 - Nullable simple types are set to ```null```.

 - Non-nullable value types are set to default(T). For example, a parameter ```int ```id`````` is set to 0.

 - For complex Types, model binding creates an instance by using the default constructor, without setting properties.

 - Arrays are set to Array.Empty<T>(), except that byte[] arrays are set to ```null```.

## Type conversion errors

```csharp
public IActionResult OnPost()
{
    if (!ModelState.IsValid)
    {
        return Page();
    }

    // ...

    return RedirectToPage("./Index");
}
```

## Simple types

 - Boolean

 - Byte, SByte

 - Char

 - DateOnly

 - DateTime

 - DateTimeOffset

 - Decimal

 - Double

 - Enum

 - Guid

 - Int16, Int32, Int64

 - Single

 - TimeOnly

 - TimeSpan

 - UInt16, UInt32, UInt64

 - Uri

 - Version

## ```Bind``` with ```IParsable<T>.TryParse```

```csharp
public static bool TryParse (string? s, IFormatProvider? provider, out TSelf result);
```

```csharp
public class DateRange : IParsable<DateRange>
{
    public DateOnly? From { get; init; }
    public DateOnly? To { get; init; }

    public static DateRange Parse(string value, IFormatProvider? provider)
    {
        if (!TryParse(value, provider, out var result))
        {
           throw new ArgumentException("Could not parse supplied value.", nameof(value));
        }

        return result;
    }

    public static bool TryParse(string? value,
                                IFormatProvider? provider, out DateRange dateRange)
    {
        var segments = value?.Split(',', StringSplitOptions.RemoveEmptyEntries 
                                       | StringSplitOptions.TrimEntries);

        if (segments?.Length == 2
            && DateOnly.TryParse(segments[0], provider, out var fromDate)
            && DateOnly.TryParse(segments[1], provider, out var toDate))
        {
            dateRange = new DateRange { From = fromDate, To = toDate };
            return true;
        }

        dateRange = new DateRange { From = default, To = default };
        return false;
    }
}
```

 - Converts a ```string``` representing two dates to a ```DateRange``` object

 - The model binder uses the ```IParsable<TSelf>.TryParse``` method to bind the ```DateRange```.

```csharp
// GET /WeatherForecast/ByRange?range=7/24/2022,07/26/2022
public IActionResult ByRange([FromQuery] DateRange range)
{
    if (!ModelState.IsValid)
        return View("Error", ModelState.Values.SelectMany(v => v.Errors));

    var weatherForecasts = Enumerable
        .Range(1, 5).Select(index => new WeatherForecast
        {
            Date = DateTime.Now.AddDays(index),
            TemperatureC = Random.Shared.Next(-20, 55),
            Summary = Summaries[Random.Shared.Next(Summaries.Length)]
        })
        .Where(wf => DateOnly.FromDateTime(wf.Date) >= range.From
                     && DateOnly.FromDateTime(wf.Date) <= range.To)
        .Select(wf => new WeatherForecastViewModel
        {
            Date = wf.Date.ToString("d"),
            TemperatureC = wf.TemperatureC,
            TemperatureF = 32 + (int)(wf.TemperatureC / 0.5556),
            Summary = wf.Summary
        });

    return View("Index", weatherForecasts);
}
```

```csharp
public class Locale : CultureInfo, IParsable<Locale>
{
    public Locale(string culture) : base(culture)
    {
    }

    public static Locale Parse(string value, IFormatProvider? provider)
    {
        if (!TryParse(value, provider, out var result))
        {
           throw new ArgumentException("Could not parse supplied value.", nameof(value));
        }

        return result;
    }

    public static bool TryParse([NotNullWhen(true)] string? value,
                                IFormatProvider? provider, out Locale locale)
    {
        if (value is null)
        {
            locale = new Locale(CurrentCulture.Name);
            return false;
        }
        
        try
        {
            locale = new Locale(value);
            return true;
        }
        catch (CultureNotFoundException)
        {
            locale = new Locale(CurrentCulture.Name);
            return false;
        }
    }
}
```

```csharp
// GET /en-GB/WeatherForecast
public IActionResult Index([FromRoute] Locale locale)
{
    var weatherForecasts = Enumerable
        .Range(1, 5).Select(index => new WeatherForecast
        {
            Date = DateTime.Now.AddDays(index),
            TemperatureC = Random.Shared.Next(-20, 55),
            Summary = Summaries[Random.Shared.Next(Summaries.Length)]
        })
        .Select(wf => new WeatherForecastViewModel
        {
            Date = wf.Date.ToString("d", locale),
            TemperatureC = wf.TemperatureC,
            TemperatureF = 32 + (int)(wf.TemperatureC / 0.5556),
            Summary = wf.Summary
        });

    return View(weatherForecasts);
}
```

```csharp
// GET /af-ZA/WeatherForecast/RangeByLocale?range=2022-07-24,2022-07-29
public IActionResult RangeByLocale([FromRoute] Locale locale, [FromQuery] string range)
{
    if (!ModelState.IsValid)
        return View("Error", ModelState.Values.SelectMany(v => v.Errors));

    if (!DateRange.TryParse(range, locale, out DateRange rangeResult))
    {
        ModelState.TryAddModelError(nameof(range),
            $"Invalid date range: {range} for locale {locale.DisplayName}");

        return View("Error", ModelState.Values.SelectMany(v => v.Errors));
    }

    var weatherForecasts = Enumerable
        .Range(1, 5).Select(index => new WeatherForecast
        {
            Date = DateTime.Now.AddDays(index),
            TemperatureC = Random.Shared.Next(-20, 55),
            Summary = Summaries[Random.Shared.Next(Summaries.Length)]
        })
        .Where(wf => DateOnly.FromDateTime(wf.Date) >= rangeResult.From
                     && DateOnly.FromDateTime(wf.Date) <= rangeResult.To)
        .Select(wf => new WeatherForecastViewModel
        {
            Date = wf.Date.ToString("d", locale),
            TemperatureC = wf.TemperatureC,
            TemperatureF = 32 + (int) (wf.TemperatureC / 0.5556),
            Summary = wf.Summary
        });

    return View("Index", weatherForecasts);
}
```

### ```Bind``` with ```TryParse```

```csharp
public static bool TryParse(string value, T out result);
public static bool TryParse(string value, IFormatProvider provider, T out result);
```

```csharp
public class DateRangeTP
{
    public DateOnly? From { get; }
    public DateOnly? To { get; }

    public DateRangeTP(string from, string to)
    {
        if (string.IsNullOrEmpty(from))
            throw new ArgumentNullException(nameof(from));
        if (string.IsNullOrEmpty(to))
            throw new ArgumentNullException(nameof(to));

        From = DateOnly.Parse(from);
        To = DateOnly.Parse(to);
    }

    public static bool TryParse(string? value, out DateRangeTP? result)
    {
        var range = value?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        if (range?.Length != 2)
        {
            result = default;
            return false;
        }

        result = new DateRangeTP(range[0], range[1]);
        return true;
    }
}
```

```csharp
// GET /WeatherForecast/ByRangeTP?range=7/24/2022,07/26/2022
public IActionResult ByRangeTP([FromQuery] DateRangeTP range)
{
    if (!ModelState.IsValid)
        return View("Error", ModelState.Values.SelectMany(v => v.Errors));

    var weatherForecasts = Enumerable
        .Range(1, 5).Select(index => new WeatherForecast
        {
            Date = DateTime.Now.AddDays(index),
            TemperatureC = Random.Shared.Next(-20, 55),
            Summary = Summaries[Random.Shared.Next(Summaries.Length)]
        })
        .Where(wf => DateOnly.FromDateTime(wf.Date) >= range.From
                     && DateOnly.FromDateTime(wf.Date) <= range.To)
        .Select(wf => new WeatherForecastViewModel
        {
            Date = wf.Date.ToString("d"),
            TemperatureC = wf.TemperatureC,
            TemperatureF = 32 + (int)(wf.TemperatureC / 0.5556),
            Summary = wf.Summary
        });

    return View("Index", weatherForecasts);
}
```

## Complex types

 - ```Id``` set to ```100```.

 - ```Name``` set to ```null```. Model binding expects ```Instructor.Name``` because ```Instructor.Id``` was used in the preceding query parameter.

```csharp
public class Instructor
{
    public int ID { get; set; }
    public string LastName { get; set; }
    public string FirstName { get; set; }
}
```

### ```Prefix``` = parameter name

```csharp
public IActionResult OnPost(int? id, Instructor instructorToUpdate)
```

### ```Prefix``` = property name

```csharp
[BindProperty]
public Instructor Instructor { get; set; }
```

### Custom prefix

```csharp
public IActionResult OnPost(
    int? id, [Bind(Prefix = "Instructor")] Instructor instructorToUpdate)
```

### Attributes for complex type targets

 - [Bind]

 - [BindRequired]

 - [BindNever]

> Warning
These attributes affect model binding when posted form data is the source of values. They do not affect input formatters, which process posted JSON and XML request bodies. Input formatters are explained later in this article.

### [Bind] attribute

```csharp
[Bind("LastName,FirstMidName,HireDate")]
public class Instructor
```

```csharp
[HttpPost]
public IActionResult OnPost(
    [Bind("LastName,FirstMidName,HireDate")] Instructor instructor)
```

### [ModelBinder] attribute

```csharp
[HttpPost]
public IActionResult OnPost(
    [ModelBinder<MyInstructorModelBinder>] Instructor instructor)
```

```csharp
public class Instructor
{
    [ModelBinder(Name = "instructor_id")]
    public string Id { get; set; }

    // ...
}
```

### [BindRequired] attribute

```csharp
public class InstructorBindRequired
{
    // ...

    [BindRequired]
    public DateTime HireDate { get; set; }
}
```

### [BindNever] attribute

```csharp
public class InstructorBindNever
{
    [BindNever]
    public int Id { get; set; }

    // ...
}
```

## Collections

 - Suppose the parameter to be bound is an array named ```selectedCourses```:

```csharp
public IActionResult OnPost(int? id, int[] selectedCourses)
```

 - Form or query ```string``` data can be in one of the following formats:
```
selectedCourses=1050&selectedCourses=2000 

selectedCourses[0]=1050&selectedCourses[1]=2000

[0]=1050&[1]=2000

selectedCourses[a]=1050&selectedCourses[b]=2000&selectedCourses.index=a&selectedCourses.index=b

[a]=1050&[b]=2000&index=a&index=b
```

Avoid binding a parameter or a property named ```index``` or ```Index``` if it is adjacent to a collection value. Model binding attempts to use ```index``` as the ```index``` for the collection which might result in incorrect binding. For example, consider the following action:
```csharp
public IActionResult Post(string index, List<Product> products)
```

In the preceding code, the ```index``` query ```string``` parameter binds to the ```index``` method parameter and also is used to bind the product collection. Renaming the ```index``` parameter or using a model binding attribute to configure binding avoids this issue:

```csharp
public IActionResult Post(string productIndex, List<Product> products)
```

 - The following format is supported only in form data:
`selectedCourses[]=1050&selectedCourses[]=2000`

 - For all of the preceding example formats, model binding passes an array of two items to the ```selectedCourses``` parameter:

Data formats that use subscript numbers (... [0] ... [1] ...) must ensure that they are numbered sequentially starting at zero. If there are any gaps in subscript numbering, all items after the gap are ignored. For example, if the subscripts are 0 and 2 instead of 0 and 1, the second item is ignored.

   - ```selectedCourses```[0]=1050

   - ```selectedCourses```[1]=2000

## Dictionaries

 - Suppose the target parameter is a ```Dictionary<int, string> named selectedCourses```:

```csharp
public IActionResult OnPost(int? id, Dictionary<int, string> selectedCourses)
```

 - The posted form or query ```string``` data can look like one of the following examples:
```
selectedCourses[1050]=Chemistry&selectedCourses[2000]=Economics

[1050]=Chemistry&selectedCourses[2000]=Economics

selectedCourses[0].Key=1050&selectedCourses[0].Value=Chemistry&
selectedCourses[1].Key=2000&selectedCourses[1].Value=Economics


[0].Key=1050&[0].Value=Chemistry&[1].Key=2000&[1].Value=Economics
```
 - For all of the preceding example formats, model binding passes a dictionary of two items to the ```selectedCourses``` parameter:

   - ```selectedCourses["1050"]="Chemistry"```

   - ```selectedCourses["2000"]="Economics"```

## Constructor binding and record types

```csharp
public record Person(
    [Required] string Name, [Range(0, 150)] int Age, [BindNever] int Id);

public class PersonController
{
    public IActionResult Index() => View();

    [HttpPost]
    public IActionResult Index(Person person)
    {
        // ...
    }
}
```

```cshtml
@model Person

Name: <input asp-for="Name" />
<br />
Age: <input asp-for="Age" />
```

```csharp
public record Person([Required] string Name, [Range(0, 100)] int Age);
```

 - Be a record type.

 - Have exactly one public constructor.

 - Contain parameters that have a property with the same name and type. The names must not differ by case.

### POCOs without parameterless constructors

```csharp
public class Person(string Name)

public record Person([Required] string Name, [Range(0, 100)] int Age)
{
    public Person(string Name) : this (Name, 0);
}
```

### Record types with manually authored constructors

```csharp
public record Person
{
    public Person([Required] string Name, [Range(0, 100)] int Age)
        => (this.Name, this.Age) = (Name, Age);

    public string Name { get; set; }
    public int Age { get; set; }
}
```

### Record types, validation and binding metadata

```csharp
public record Person (string Name, int Age)
{
   [BindProperty(Name = "SomeName")] // This does not get used
   [Required] // This does not get used
   public string Name { get; init; }
}
```

### Validation and metadata

```csharp
public record Person([Required] string Name)
{
    private readonly string _name;

    // The following property is never null.
    // However this object could have been constructed as "new Person(null)".
    public string Name { get; init => _name = value ?? string.Empty; }
}
```

### TryUpdateModel does not update parameters on a record type

```csharp
public record Person(string Name)
{
    public int Age { get; set; }
}

var person = new Person("initial-name");
TryUpdateModel(person, ...);
```

## Globalization behavior of model binding route data and query strings

 - Treat values as invariant culture.

 - Expect that URLs are culture-invariant.

 - Inherit from ```IValueProviderFactory```

 - Copy the code from QueryStringValueProviderFactory or RouteValueValueProviderFactory

 - Replace the culture value passed to the value provider constructor with ```CultureInfo```.CurrentCulture

 - Replace the default value provider factory in MVC options with your new one:

```csharp
public class CultureQueryStringValueProviderFactory : IValueProviderFactory
{
    public Task CreateValueProviderAsync(ValueProviderFactoryContext context)
    {
        _ = context ?? throw new ArgumentNullException(nameof(context));

        var query = context.ActionContext.HttpContext.Request.Query;
        if (query?.Count > 0)
        {
            context.ValueProviders.Add(
                new QueryStringValueProvider(
                    BindingSource.Query,
                    query,
                    CultureInfo.CurrentCulture));
        }

        return Task.CompletedTask;
    }
}
```

```csharp
builder.Services.AddControllers(options =>
{
    var index = options.ValueProviderFactories.IndexOf(
        options.ValueProviderFactories.OfType<QueryStringValueProviderFactory>()
            .Single());

    options.ValueProviderFactories[index] =
        new CultureQueryStringValueProviderFactory();
});
```

## Special data types

### ```IFormFile``` and IFormFileCollection

### ```CancellationToken```

### FormCollection

## Input formatters

 - In ```Program.cs```, call AddXmlSerializerFormatters or AddXmlDataContractSerializerFormatters.

```csharp
builder.Services.AddControllers()
    .AddXmlSerializerFormatters();
```

 - Apply the ```Consumes``` attribute to controller classes or action methods that should expect XML in the request body.
```csharp
[HttpPost]
[Consumes("application/xml")]
public ActionResult<Pet> Create(Pet pet)
```

For more information, see Introducing XML Serialization.



### Customize model binding with input formatters

```csharp
public class InstructorObjectId
{
    [Required]
    public ObjectId ObjectId { get; set; } = null!;
}
```

```csharp
internal class ObjectIdConverter : JsonConverter<ObjectId>
{
    public override ObjectId Read(
        ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        => new(JsonSerializer.Deserialize<int>(ref reader, options));

    public override void Write(
        Utf8JsonWriter writer, ObjectId value, JsonSerializerOptions options)
        => writer.WriteNumberValue(value.Id);
}
```

```csharp
[JsonConverter(typeof(ObjectIdConverter))]
public record ObjectId(int Id);
```

## Exclude specified types from model binding

```csharp
builder.Services.AddRazorPages()
    .AddMvcOptions(options =>
    {
        options.ModelMetadataDetailsProviders.Add(
            new ExcludeBindingMetadataProvider(typeof(Version)));
        options.ModelMetadataDetailsProviders.Add(
            new SuppressChildValidationMetadataProvider(typeof(Guid)));
    });
```

```csharp
builder.Services.AddRazorPages()
    .AddMvcOptions(options =>
    {
        options.ModelMetadataDetailsProviders.Add(
            new ExcludeBindingMetadataProvider(typeof(Version)));
        options.ModelMetadataDetailsProviders.Add(
            new SuppressChildValidationMetadataProvider(typeof(Guid)));
    });
```

## Custom model binders

## Manual model binding

```csharp
if (await TryUpdateModelAsync(
    newInstructor,
    "Instructor",
    x => x.Name, x => x.HireDate!))
{
    _instructorStore.Add(newInstructor);
    return RedirectToPage("./Index");
}

return Page();
```

 - Used with Razor Pages and MVC apps using controllers and views to prevent over-posting.

 - Not used with a web API unless consumed from form data, query strings, and route data. Web API endpoints that consume JSON use Input formatters to deserialize the request body into an object.

## [FromServices] attribute

 - Make the parameter nullable.

 - Set a default value for the parameter.

## Additional resources

 - View or download sample code (how to download)

 - Model validation in ASP.NET Core MVC

 - Custom Model Binding in ASP.NET Core

Ref: [Model Binding in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/model-binding?view=aspnetcore-8.0)