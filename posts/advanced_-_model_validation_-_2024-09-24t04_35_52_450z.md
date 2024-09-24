---
title: Advanced - Model validation
published: true
date: 2024-09-24 04:35:52
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## Model state

```csharp
public async Task<IActionResult> OnPostAsync()
{
    if (!ModelState.IsValid)
    {
        return Page();
    }

    _context.Movies.Add(Movie);
    await _context.SaveChangesAsync();

    return RedirectToPage("./Index");
}
```

```csharp
public async Task<IActionResult> Create(Movie movie)
{
    if (!ModelState.IsValid)
    {
        return View(movie);
    }

    _context.Movies.Add(movie);
    await _context.SaveChangesAsync();

    return RedirectToAction(nameof(Index));
}
```

## Rerun validation

```csharp
public async Task<IActionResult> OnPostTryValidateAsync()
{
    var modifiedReleaseDate = DateTime.Now.Date;
    Movie.ReleaseDate = modifiedReleaseDate;

    ModelState.ClearValidationState(nameof(Movie));
    if (!TryValidateModel(Movie, nameof(Movie)))
    {
        return Page();
    }

    _context.Movies.Add(Movie);
    await _context.SaveChangesAsync();

    return RedirectToPage("./Index");
}
```

## Validation attributes

```csharp
public class Movie
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Title { get; set; } = null!;

    [ClassicMovie(1960)]
    [DataType(DataType.Date)]
    [Display(Name = "Release Date")]
    public DateTime ReleaseDate { get; set; }

    [Required]
    [StringLength(1000)]
    public string Description { get; set; } = null!;

    [Range(0, 999.99)]
    public decimal Price { get; set; }

    public Genre Genre { get; set; }

    public bool Preorder { get; set; }
}
```

## Built-in attributes

 - [ValidateNever]: Indicates that a property or parameter should be excluded from validation.

 - [CreditCard]: Validates that the property has a credit card format. Requires jQuery Validation Additional Methods.

 - [Compare]: Validates that two properties in a model match.

 - [EmailAddress]: Validates that the property has an email format.

 - [Phone]: Validates that the property has a telephone number format.

 - [Range]: Validates that the property value falls within a specified range.

 - [RegularExpression]: Validates that the property value matches a specified regular expression.

 - [Required]: Validates that the field isn't ```null```. See [Required] attribute for details about this attribute's behavior.

 - [StringLength]: Validates that a string property value doesn't exceed a specified length limit.

 - [Url]: Validates that the property has a URL format.

 - [Remote]: Validates input on the client by calling an action method on the server. See [Remote] attribute for details about this attribute's behavior.

### Error messages

```csharp
[StringLength(8, ErrorMessage = "Name length can't be more than 8.")]
```

```csharp
[StringLength(8, ErrorMessage = "{0} length must be between {2} and {1}.", MinimumLength = 6)]
```

### Use JSON property names in validation errors

```csharp
using Microsoft.AspNetCore.Mvc.ModelBinding.Metadata;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(options =>
{
    options.ModelMetadataDetailsProviders.Add(new SystemTextJsonValidationMetadataProvider());
});

var app = builder.Build();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
```

```csharp
using Microsoft.AspNetCore.Mvc.NewtonsoftJson;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(options =>
{
    options.ModelMetadataDetailsProviders.Add(new NewtonsoftJsonValidationMetadataProvider());
}).AddNewtonsoftJson();

var app = builder.Build();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
```

## Non-nullable reference types and [Required] attribute

```csharp
public class Person
{
    public string Name { get; set; }
}
```

```csharp
public class Person
{
    public string? Name { get; set; }
}
```

```csharp
builder.Services.AddControllers(
    options => options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true);
```

### [Required] validation on the server

 - Make the field nullable (for example, ```decimal?``` instead of ```decimal```). ```Nullable<T>``` value types are treated like standard nullable types.

 - Specify the default error message to be used by model binding, as shown in the following example:
```csharp
builder.Services.AddRazorPages()
    .AddMvcOptions(options =>
    {
        options.MaxModelValidationErrors = 50;
        options.ModelBindingMessageProvider.SetValueMustNotBeNullAccessor(
            _ => "The field is required.");
    });

builder.Services.AddSingleton
    <IValidationAttributeAdapterProvider, CustomValidationAttributeAdapterProvider>();
```

For more information about model binding errors that you can set default messages for, see DefaultModelBindingMessageProvider.


### [Required] validation on the client

 - A value is considered present only if input is entered for it. Therefore, client-side validation handles non-nullable types the same as nullable types.

 - Whitespace in a string field is considered valid input by the jQuery Validation required method. Server-side validation considers a required string field invalid if only whitespace is entered.

## [Remote] attribute

 - Create an action method for JavaScript to call.  The jQuery Validation remote method expects a JSON response:

Here's an example of an action method that returns a custom error message:
```csharp
[AcceptVerbs("GET", "POST")]
public IActionResult VerifyEmail(string email)
{
    if (!_userService.VerifyEmail(email))
    {
        return Json($"Email {email} is already in use.");
    }

    return Json(true);
}
```

   - ```true``` means the input data is valid.

   - ```false```, ```undefined```, or ```null``` means the input is invalid. Display the default error message.

   - Any other string means the input is invalid. Display the string as a custom error message.


 - In the model class, annotate the property with a [Remote] attribute that points to the validation action method, as shown in the following example:

```csharp
[Remote(action: "VerifyEmail", controller: "Users")]
public string Email { get; set; } = null!;
```

### Additional fields

```csharp
[Remote(action: "VerifyName", controller: "Users", AdditionalFields = nameof(LastName))]
[Display(Name = "First Name")]
public string FirstName { get; set; } = null!;

[Remote(action: "VerifyName", controller: "Users", AdditionalFields = nameof(FirstName))]
[Display(Name = "Last Name")]
public string LastName { get; set; } = null!;
```

```csharp
[AcceptVerbs("GET", "POST")]
public IActionResult VerifyName(string firstName, string lastName)
{
    if (!_userService.VerifyName(firstName, lastName))
    {
        return Json($"A user named {firstName} {lastName} already exists.");
    }

    return Json(true);
}
```

```csharp
[Remote(action: "VerifyName", controller: "Users",
    AdditionalFields = nameof(FirstName) + "," + nameof(LastName))]
public string MiddleName { get; set; }
```

## Alternatives to built-in attributes

 - Create custom attributes.

 - Implement IValidatableObject.

## Custom attributes

 - Is only run on the server.

 - For Classic movies, validates the release date:

```csharp
public class ClassicMovieAttribute : ValidationAttribute
{
    public ClassicMovieAttribute(int year)
        => Year = year;

    public int Year { get; }

    public string GetErrorMessage() =>
        $"Classic movies must have a release year no later than {Year}.";

    protected override ValidationResult? IsValid(
        object? value, ValidationContext validationContext)
    {
        var movie = (Movie)validationContext.ObjectInstance;
        var releaseYear = ((DateTime)value!).Year;

        if (movie.Genre == Genre.Classic && releaseYear > Year)
        {
            return new ValidationResult(GetErrorMessage());
        }

        return ValidationResult.Success;
    }
}
```

## IValidatableObject

```csharp
public class ValidatableMovie : IValidatableObject
{
    private const int _classicYear = 1960;

    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Title { get; set; } = null!;

    [DataType(DataType.Date)]
    [Display(Name = "Release Date")]
    public DateTime ReleaseDate { get; set; }

    [Required]
    [StringLength(1000)]
    public string Description { get; set; } = null!;

    [Range(0, 999.99)]
    public decimal Price { get; set; }

    public Genre Genre { get; set; }

    public bool Preorder { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Genre == Genre.Classic && ReleaseDate.Year > _classicYear)
        {
            yield return new ValidationResult(
                $"Classic movies must have a release year no later than {_classicYear}.",
                new[] { nameof(ReleaseDate) });
        }
    }
}
```

## Custom validation

```csharp
if (Contact.Name == Contact.ShortName)
{
    ModelState.AddModelError("Contact.ShortName", 
                             "Short name can't be the same as Name.");
}
```

```csharp
if (contact.Name == contact.ShortName)
{
    ModelState.AddModelError(nameof(contact.ShortName),
                             "Short name can't be the same as Name.");
}
```

```csharp
public async Task<IActionResult> OnPostAsync()
{
    // Attach Validation Error Message to the Model on validation failure.          

    if (Contact.Name == Contact.ShortName)
    {
        ModelState.AddModelError("Contact.ShortName", 
                                 "Short name can't be the same as Name.");
    }

    if (_context.Contact.Any(i => i.PhoneNumber == Contact.PhoneNumber))
    {
        ModelState.AddModelError("Contact.PhoneNumber",
                                  "The Phone number is already in use.");
    }
    if (_context.Contact.Any(i => i.Email == Contact.Email))
    {
        ModelState.AddModelError("Contact.Email", "The Email is already in use.");
    }

    if (!ModelState.IsValid || _context.Contact == null || Contact == null)
    {
        // if model is invalid, return the page with the model state errors.
        return Page();
    }
    _context.Contact.Add(Contact);
    await _context.SaveChangesAsync();

    return RedirectToPage("./Index");
}
```

```csharp
[HttpPost]
[ValidateAntiForgeryToken]
public async Task<IActionResult> Create([Bind("Id,Name,ShortName,Email,PhoneNumber")] Contact contact)
{
    // Attach Validation Error Message to the Model on validation failure.
    if (contact.Name == contact.ShortName)
    {
        ModelState.AddModelError(nameof(contact.ShortName),
                                 "Short name can't be the same as Name.");
    }

    if (_context.Contact.Any(i => i.PhoneNumber == contact.PhoneNumber))
    {
        ModelState.AddModelError(nameof(contact.PhoneNumber),
                                  "The Phone number is already in use.");
    }
    if (_context.Contact.Any(i => i.Email == contact.Email))
    {
        ModelState.AddModelError(nameof(contact.Email), "The Email is already in use.");
    }

    if (ModelState.IsValid)
    {
        _context.Add(contact);
        await _context.SaveChangesAsync();
        return RedirectToAction(nameof(Index));
    }
    return View(contact);
}
```

## ValidationResult

```csharp
public class ValidateNameAttribute : ValidationAttribute
{
    public ValidateNameAttribute()
    {
        const string defaultErrorMessage = "Error with Name";
        ErrorMessage ??= defaultErrorMessage;
    }

    protected override ValidationResult? IsValid(object? value,
                                         ValidationContext validationContext)
    {
        if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
        {
            return new ValidationResult("Name is required.");
        }

        if (value.ToString()!.ToLower().Contains("zz"))
        {

            return new ValidationResult(
                        FormatErrorMessage(validationContext.DisplayName));
        }

        return ValidationResult.Success;
    }
}
```

```csharp
public class Contact
{
    public Guid Id { get; set; }

    [ValidateName(ErrorMessage = "Name must not contain `zz`")] 
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
}
```

## Top-level node validation

 - Action parameters

 - Controller properties

 - Page handler parameters

 - Page model properties

```csharp
[AcceptVerbs("GET", "POST")]
public IActionResult VerifyPhone(
    [RegularExpression(@"^\d{3}-\d{3}-\d{4}$")] string phone)
{
    if (!ModelState.IsValid)
    {
        return Json($"Phone {phone} has an invalid format. Format: ###-###-####");
    }

    return Json(true);
}
```

```csharp
[HttpPost]
public IActionResult CheckAge([BindRequired, FromQuery] int age)
{
```

## Maximum errors

```csharp
builder.Services.AddRazorPages()
    .AddMvcOptions(options =>
    {
        options.MaxModelValidationErrors = 50;
        options.ModelBindingMessageProvider.SetValueMustNotBeNullAccessor(
            _ => "The field is required.");
    });

builder.Services.AddSingleton
    <IValidationAttributeAdapterProvider, CustomValidationAttributeAdapterProvider>();
```

## Maximum recursion

## Automatic short-circuit

## Client-side validation

```cshtml
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.js"></script>
```

```cshtml
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.3/jquery.validate.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validation-unobtrusive/3.2.12/jquery.validate.unobtrusive.js"></script>
```

```cshtml
<div class="form-group">
    <label asp-for="Movie.ReleaseDate" class="control-label"></label>
    <input asp-for="Movie.ReleaseDate" class="form-control" />
    <span asp-validation-for="Movie.ReleaseDate" class="text-danger"></span>
</div>
```

```html
<div class="form-group">
    <label class="control-label" for="Movie_ReleaseDate">Release Date</label>
    <input class="form-control" type="date" data-val="true"
        data-val-required="The Release Date field is required."
        id="Movie_ReleaseDate" name="Movie.ReleaseDate" value="">
    <span class="text-danger field-validation-valid"
        data-valmsg-for="Movie.ReleaseDate" data-valmsg-replace="true"></span>
</div>
```

## Unobtrusive validation

### Add Validation to Dynamic Forms

```javascript
$.get({
    url: "https://url/that/returns/a/form",
    dataType: "html",
    error: function(jqXHR, textStatus, errorThrown) {
        alert(textStatus + ": Couldn't add form. " + errorThrown);
    },
    success: function(newFormHTML) {
        var container = document.getElementById("form-container");
        container.insertAdjacentHTML("beforeend", newFormHTML);
        var forms = container.getElementsByTagName("form");
        var newForm = forms[forms.length - 1];
        $.validator.unobtrusive.parse(newForm);
    }
})
```

### Add Validation to Dynamic Controls

```javascript
$.get({
    url: "https://url/that/returns/a/control",
    dataType: "html",
    error: function(jqXHR, textStatus, errorThrown) {
        alert(textStatus + ": Couldn't add control. " + errorThrown);
    },
    success: function(newInputHTML) {
        var form = document.getElementById("my-form");
        form.insertAdjacentHTML("beforeend", newInputHTML);
        $(form).removeData("validator")    // Added by jQuery Validation
               .removeData("unobtrusiveValidation");   // Added by jQuery Unobtrusive Validation
        $.validator.unobtrusive.parse(form);
    }
})
```

## Custom client-side validation

```javascript
$.validator.addMethod('classicmovie', function (value, element, params) {
    var genre = $(params[0]).val(), year = params[1], date = new Date(value);

    // The Classic genre has a value of '0'.
    if (genre && genre.length > 0 && genre[0] === '0') {
        // The release date for a Classic is valid if it's no greater than the given year.
        return date.getUTCFullYear() <= year;
    }

    return true;
});

$.validator.unobtrusive.adapters.add('classicmovie', ['year'], function (options) {
    var element = $(options.form).find('select#Movie_Genre')[0];

    options.rules['classicmovie'] = [element, parseInt(options.params['year'])];
    options.messages['classicmovie'] = options.message;
});
```

 - Flag the field as being subject to validation (data-val="true").

 - Identify a validation rule name and error message text (for example, ```data-```val-rulename="Error message.").

 - Provide any additional parameters the validator needs (for example, ```data-```val-rulename-param1="value").

```html
<input class="form-control" type="date"
    data-val="true"
    data-val-classicmovie="Classic movies must have a release year no later than 1960."
    data-val-classicmovie-year="1960"
    data-val-required="The Release Date field is required."
    id="Movie_ReleaseDate" name="Movie.ReleaseDate" value="">
```

 - Create a class that derives from AttributeAdapterBase<TAttribute> and a class that implements IValidationAttributeAdapterProvider, and register your attribute and its adapter in DI. This method follows the single responsibility principle in that server-related and client-related validation code is in separate classes. The adapter also has the advantage that since it's registered in DI, other services in DI are available to it if needed.

 - Implement IClientModelValidator in your ValidationAttribute class. This method might be appropriate if the attribute doesn't do any server-side validation and doesn't need any services from DI.

### AttributeAdapter for client-side validation

 - Create an attribute adapter class for the custom validation attribute. Derive the class from AttributeAdapterBase<TAttribute>. Create an ```AddValidation``` method that adds data- attributes to the rendered output, as shown in this example:

```csharp
public class ClassicMovieAttributeAdapter : AttributeAdapterBase<ClassicMovieAttribute>
{
    public ClassicMovieAttributeAdapter(
        ClassicMovieAttribute attribute, IStringLocalizer? stringLocalizer)
        : base(attribute, stringLocalizer)
    {

    }

    public override void AddValidation(ClientModelValidationContext context)
    {
        MergeAttribute(context.Attributes, "data-val", "true");
        MergeAttribute(context.Attributes, "data-val-classicmovie", GetErrorMessage(context));

        var year = Attribute.Year.ToString(CultureInfo.InvariantCulture);
        MergeAttribute(context.Attributes, "data-val-classicmovie-year", year);
    }

    public override string GetErrorMessage(ModelValidationContextBase validationContext)
        => Attribute.GetErrorMessage();
}
```

 - Create an adapter provider class that implements IValidationAttributeAdapterProvider. In the GetAttributeAdapter method pass in the custom attribute to the adapter's constructor, as shown in this example:

```csharp
public class CustomValidationAttributeAdapterProvider : IValidationAttributeAdapterProvider
{
    private readonly IValidationAttributeAdapterProvider baseProvider =
        new ValidationAttributeAdapterProvider();

    public IAttributeAdapter? GetAttributeAdapter(
        ValidationAttribute attribute, IStringLocalizer? stringLocalizer)
    {
        if (attribute is ClassicMovieAttribute classicMovieAttribute)
        {
            return new ClassicMovieAttributeAdapter(classicMovieAttribute, stringLocalizer);
        }

        return baseProvider.GetAttributeAdapter(attribute, stringLocalizer);
    }
}
```

 - Register the adapter provider for DI in ```Program.cs```:

```csharp
builder.Services.AddRazorPages()
    .AddMvcOptions(options =>
    {
        options.MaxModelValidationErrors = 50;
        options.ModelBindingMessageProvider.SetValueMustNotBeNullAccessor(
            _ => "The field is required.");
    });

builder.Services.AddSingleton
    <IValidationAttributeAdapterProvider, CustomValidationAttributeAdapterProvider>();
```

### IClientModelValidator for client-side validation

 - In the custom validation attribute, implement the IClientModelValidator interface and create an ```AddValidation``` method. In the ```AddValidation``` method, add data- attributes for validation, as shown in the following example:

```csharp
public class ClassicMovieWithClientValidatorAttribute :
    ValidationAttribute, IClientModelValidator
{
    public ClassicMovieWithClientValidatorAttribute(int year)
        => Year = year;

    public int Year { get; }

    public void AddValidation(ClientModelValidationContext context)
    {
        MergeAttribute(context.Attributes, "data-val", "true");
        MergeAttribute(context.Attributes, "data-val-classicmovie", GetErrorMessage());

        var year = Year.ToString(CultureInfo.InvariantCulture);
        MergeAttribute(context.Attributes, "data-val-classicmovie-year", year);
    }

    public string GetErrorMessage() =>
        $"Classic movies must have a release year no later than {Year}.";

    protected override ValidationResult? IsValid(
        object? value, ValidationContext validationContext)
    {
        var movie = (Movie)validationContext.ObjectInstance;
        var releaseYear = ((DateTime)value!).Year;

        if (movie.Genre == Genre.Classic && releaseYear > Year)
        {
            return new ValidationResult(GetErrorMessage());
        }

        return ValidationResult.Success;
    }

    private static bool MergeAttribute(IDictionary<string, string> attributes, string key, string value)
    {
        if (attributes.ContainsKey(key))
        {
            return false;
        }

        attributes.Add(key, value);
        return true;
    }
}
```

## Disable client-side validation

```csharp
builder.Services.AddRazorPages()
    .AddViewOptions(options =>
    {
        options.HtmlHelperOptions.ClientValidationEnabled = false;
    });
```

 - Comment out the reference to ```_ValidationScriptsPartial``` in all the ```.cshtml``` files.

 - Remove the contents of the Pages\Shared_ValidationScriptsPartial.cshtml file.

## Problem details

 - ExceptionHandlerMiddleware: Generates a problem details response when a custom handler is not defined.

 - StatusCodePagesMiddleware: Generates a problem details response by default.

 - DeveloperExceptionPageMiddleware: Generates a problem details response in development when the ```Accept``` request HTTP header doesn't include ```text/html```.

## Additional resources

 - System.ComponentModel.DataAnnotations

 - Model Binding

Ref: [Model validation in ASP.NET Core MVC and Razor Pages](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/validation?view=aspnetcore-8.0)