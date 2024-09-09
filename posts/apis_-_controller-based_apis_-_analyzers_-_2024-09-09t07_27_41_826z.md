---
title: APIs - Controller-based APIs - Analyzers
published: true
date: 2024-09-09 07:27:41
tags: Summary, AspNetCore
description: ASP.NET Core provides an MVC analyzers package intended for use with web API projects. The analyzers work with controllers annotated with ApiControllerAttribute, while building on web API conventions.
image:
---

## In this article

ASP.NET Core provides an MVC analyzers package intended for use with web API projects. The analyzers work with controllers annotated with ApiControllerAttribute, while building on web API conventions.

The analyzers package notifies you of any controller action that:

- Returns an undeclared status code.

- Returns an undeclared success result.

- Documents a status code that isn't returned.

- Includes an explicit model validation check.

## Reference the analyzer package

The analyzers are included in the .NET Core SDK. To enable the analyzer in your project, include the ```IncludeOpenAPIAnalyzers``` property in the project file:

```xml
<PropertyGroup>
 <IncludeOpenAPIAnalyzers>true</IncludeOpenAPIAnalyzers>
</PropertyGroup>
```

## Analyzers for web API conventions

ASP.NET Core MVC documentation with Swagger / OpenAPI goes into further detail on documenting your web API.

One of the analyzers in the package inspects controllers annotated with ApiControllerAttribute and identifies actions that don't entirely document their responses. Consider the following example:

```csharp
// GET api/contacts/{guid}
[HttpGet("{id}", Name = "GetById")]
[ProducesResponseType(typeof(Contact), StatusCodes.Status200OK)]
public IActionResult Get(string id)
{
    var contact = _contacts.Get(id);

    if (contact == null)
    {
        return NotFound();
    }

    return Ok(contact);
}
```

This issue reports a problem with the HTTP 404 status code.



![analyzer reporting a warning!](https://learn.microsoft.com/en-us/aspnet/core/web-api/advanced/analyzers/conventions/_static/analyzer.gif?view=aspnetcore-8.0 "analyzer reporting a warning")

## Analyzers require Microsoft.NET.Sdk.Web

Analyzers don't work with library projects or projects referencing Sdk="Microsoft.NET.Sdk".

## Additional resources

- Use web API conventions

- ASP.NET Core web API documentation with Swagger / OpenAPI

- Create web APIs with ASP.NET Core

Ref: [Use web API analyzers](https://learn.microsoft.com/en-us/aspnet/core/web-api/advanced/analyzers?view=aspnetcore-8.0)