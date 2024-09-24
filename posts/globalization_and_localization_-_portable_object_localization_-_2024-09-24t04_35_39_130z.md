---
title: Globalization and localization - Portable Object localization
published: true
date: 2024-09-24 04:35:39
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## What is a PO file?

 - PO files support pluralization; .resx files don't support pluralization.

 - PO files aren't compiled like .resx files. As such, specialized tooling and build steps aren't required.

 - PO files work well with collaborative online editing tools.

### Example

```text
#: Pages/Index.cshtml:13
msgid "Hello world!"
msgstr "Bonjour le monde!"

msgid "There is one item."
msgid_plural "There are {0} items."
msgstr[0] "Il y a un élément."
msgstr[1] "Il y a {0} éléments."
```

 - #:: A comment indicating the context of the string to be translated. The same string might be translated differently depending on where it's being used.

 - ```msgid```: The untranslated string.

 - ```msgstr```: The translated string.

 - ```msgid_plural```: The untranslated plural string.

 - ```msgstr[0]```: The translated string for the case 0.

 - ```msgstr[N]```: The translated string for the case N.

## Configuring PO file support in ASP.NET Core

### Referencing the package

```xml
<PackageReference Include="OrchardCore.Localization.Core" Version="1.5.0" />
```

### Registering the service

```csharp
builder.Services.AddPortableObjectLocalization();

builder.Services
    .Configure<RequestLocalizationOptions>(options => options
        .AddSupportedCultures("fr", "cs")
        .AddSupportedUICultures("fr", "cs"));

builder.Services
    .AddRazorPages()
    .AddViewLocalization();
```

```cshtml
@page
@using Microsoft.AspNetCore.Mvc.Localization
@inject IViewLocalizer Localizer
@{
    ViewData["Title"] = "Home";
}

<div class="text-center">
    <h1 class="display-4">Welcome</h1>
    <p>Learn about <a href="https://docs.microsoft.com/aspnet/core">building Web apps with ASP.NET Core</a>.</p>
</div>

<p>@Localizer["Hello world!"]</p>
```

### Creating a PO file

```text
msgid "Hello world!"
msgstr "Bonjour le monde!"
```

### Testing the application

## Pluralization

### Creating pluralization PO files

```text
msgid "There is one item."
msgid_plural "There are {0} items."
msgstr[0] "Il y a un élément."
msgstr[1] "Il y a {0} éléments."
```

### Adding a language using different pluralization forms

```text
msgid "Hello world!"
msgstr "Ahoj světe!!"

msgid "There is one item."
msgid_plural "There are {0} items."
msgstr[0] "Existuje jedna položka."
msgstr[1] "Existují {0} položky."
msgstr[2] "Existuje {0} položek."
```

```csharp
builder.Services
    .Configure<RequestLocalizationOptions>(options => options
        .AddSupportedCultures("fr", "cs")
        .AddSupportedUICultures("fr", "cs"));
```

```cshtml
<p>@Localizer.Plural(1, "There is one item.", "There are {0} items.")</p>
<p>@Localizer.Plural(2, "There is one item.", "There are {0} items.")</p>
<p>@Localizer.Plural(5, "There is one item.", "There are {0} items.")</p>
```

```html
There is one item.
There are 2 items.
There are 5 items.
```

```html
Il y a un élément.
Il y a 2 éléments.
Il y a 5 éléments.
```

```html
Existuje jedna položka.
Existují 2 položky.
Existuje 5 položek.
```

## Advanced tasks

### Using additional arguments

```cshtml
<p>@Localizer.Plural(count, "There is one item with the color {1}.", "There are {0} items. The main color is {1}.", color)</p>
```

### Contextualizing strings

```text
msgctxt "Views.Home.About"
msgid "Hello world!"
msgstr "Bonjour le monde!"
```

```text
msgid "Hello world!"
msgstr "Bonjour le monde!"
```

### Changing the location of PO files

```csharp
services.AddPortableObjectLocalization(options => options.ResourcesPath = "Localization");
```

### Implementing a custom logic for finding localization files

### Using a different default pluralized language

Ref: [Configure portable object localization in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/portable-object-localization?view=aspnetcore-8.0)