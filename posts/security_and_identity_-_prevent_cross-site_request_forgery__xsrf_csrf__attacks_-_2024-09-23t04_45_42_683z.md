---
title: Security and Identity - Prevent Cross-Site Request Forgery (XSRF/CSRF) attacks
published: true
date: 2024-09-23 04:45:42
tags: Summary, AspNetCore
description:
image:
---

## In this article

 - A user signs into ```www.good-banking-site.example.com``` using forms authentication. The server authenticates the user and issues a response that includes an authentication cookie. The site is vulnerable to attack because it trusts any request that it receives with a valid authentication cookie.

 - The user visits a malicious site, ```www.bad-crook-site.example.com```.
The malicious site, ```www.bad-crook-site.example.com```, contains an HTML form similar to the following example:

```html
<h1>Congratulations! You're a Winner!</h1>
<form action="https://good-banking-site.com/api/account" method="post">
    <input type="hidden" name="Transaction" value="withdraw" />
    <input type="hidden" name="Amount" value="1000000" />
    <input type="submit" value="Click to collect your prize!" />
</form>
```
Notice that the form's ```action``` posts to the vulnerable site, not to the malicious site. This is the "cross-site" part of CSRF.
 - The user selects the submit button. The browser makes the request and automatically includes the authentication cookie for the requested domain, ```www.good-banking-site.example.com```.

 - The request runs on the ```www.good-banking-site.example.com``` server with the user's authentication context and can perform any ```action``` that an authenticated user is allowed to perform.

 - Run a script that automatically submits the form.

 - Send the form submission as an AJAX request.

 - Hide the form using CSS.

 - Browsers store cookies issued by a web app.

 - Stored cookies include session cookies for authenticated users.

 - Browsers send all of the cookies associated with a domain to the web app every request regardless of how the request to app was generated within the browser.

 - Sign out of web apps when finished using them.

 - Clear browser cookies periodically.

## Authentication fundamentals

### ```Cookie```-based authentication

### Token-based authentication

### Multiple apps hosted at one domain

## Antiforgery in ASP.NET Core

> Warning
ASP.NET Core implements antiforgery using ASP.NET Core Data Protection. The data protection stack must be configured to work in a server farm. For more information, see Configuring data protection.

 - AddMvc

 - MapRazorPages

 - MapControllerRoute

 - AddRazorComponents

```cshtml
<form method="post">
    <!-- ... -->
</form>
```

 - The ```action``` attribute is empty (action="").

 - The ```action``` attribute isn't supplied (<form method="post">).

 - Explicitly disable antiforgery tokens with the ```asp-antiforgery``` attribute:

```cshtml
<form method="post" asp-antiforgery="false">
    <!-- ... -->
</form>
```

 - The form element is opted-out of Tag Helpers by using the Tag Helper ! opt-out symbol:

```cshtml
<!form method="post">
    <!-- ... -->
</!form>
```

 - Remove the ```FormTagHelper``` from the view. The ```FormTagHelper``` can be removed from a view by adding the following directive to the Razor view:
@removeTagHelper Microsoft.AspNetCore.Mvc.TagHelpers.FormTagHelper, Microsoft.AspNetCore.Mvc.TagHelpers

```cshtml
@removeTagHelper Microsoft.AspNetCore.Mvc.TagHelpers.FormTagHelper, Microsoft.AspNetCore.Mvc.TagHelpers
```

> Note
Razor Pages are automatically protected from XSRF/CSRF. For more information, see XSRF/CSRF and Razor Pages.

 - The server sends a token associated with the current user's identity to the client.

 - The client sends back the token to the server for verification.

 - If the server receives a token that doesn't match the authenticated user's identity, the request is rejected.

```cshtml
<form asp-action="Index" asp-controller="Home" method="post">
    <!-- ... -->
</form>

@using (Html.BeginForm("Index", "Home"))
{
    <!-- ... -->
}
```

```cshtml
<form asp-action="Index" asp-controller="Home" method="post">
    @Html.AntiForgeryToken()

    <!-- ... -->
</form>
```

```html
<input name="__RequestVerificationToken" type="hidden" value="CfDJ8NrAkS ... s2-m9Yw">
```

 - ```ValidateAntiForgeryToken```

 - ```AutoValidateAntiforgeryToken```

 - ```IgnoreAntiforgeryToken```

## Antiforgery with ```AddControllers```

## Multiple browser tabs and the Synchronizer Token Pattern

 - Only the most recently loaded tab contains a valid antiforgery token.

 - Requests made from previously loaded tabs fail with an error: ```Antiforgery token validation failed. The antiforgery cookie token and request token do not match```

## Configure antiforgery with ```AntiforgeryOptions```

```csharp
builder.Services.AddAntiforgery(options =>
{
    // Set Cookie properties using CookieBuilder properties†.
    options.FormFieldName = "AntiforgeryFieldname";
    options.HeaderName = "X-CSRF-TOKEN-HEADERNAME";
    options.SuppressXFrameOptionsHeader = false;
});
```

<table><thead>
<tr>
<th>Option</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.antiforgery.antiforgeryoptions.cookie" class="no-loc" data-linktype="absolute-path">Cookie</a></td>
<td>Determines the settings used to create the antiforgery cookies.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.antiforgery.antiforgeryoptions.formfieldname" class="no-loc" data-linktype="absolute-path">FormFieldName</a></td>
<td>The name of the hidden form field used by the antiforgery system to render antiforgery tokens in views.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.antiforgery.antiforgeryoptions.headername" class="no-loc" data-linktype="absolute-path">HeaderName</a></td>
<td>The name of the header used by the antiforgery system. If <code>null</code>, the system considers only form data.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/microsoft.aspnetcore.antiforgery.antiforgeryoptions.suppressxframeoptionsheader" class="no-loc" data-linktype="absolute-path">SuppressXFrameOptionsHeader</a></td>
<td>Specifies whether to suppress generation of the <code>X-Frame-Options</code> header. By default, the header is generated with a value of "SAMEORIGIN". Defaults to <code>false</code>.</td>
</tr>
</tbody></table>

## Generate antiforgery tokens with ```IAntiforgery```

```csharp
app.UseRouting();

app.UseAuthorization();

var antiforgery = app.Services.GetRequiredService<IAntiforgery>();

app.Use((context, next) =>
{
    var requestPath = context.Request.Path.Value;

    if (string.Equals(requestPath, "/", StringComparison.OrdinalIgnoreCase)
        || string.Equals(requestPath, "/index.html", StringComparison.OrdinalIgnoreCase))
    {
        var tokenSet = antiforgery.GetAndStoreTokens(context);
        context.Response.Cookies.Append("XSRF-TOKEN", tokenSet.RequestToken!,
            new CookieOptions { HttpOnly = false });
    }

    return next(context);
});
```

### Require antiforgery validation

```csharp
[HttpPost]
[ValidateAntiForgeryToken]
public IActionResult Index()
{
    // ...

    return RedirectToAction();
}
```

### Automatically validate antiforgery tokens for unsafe HTTP methods only

 - GET

 - HEAD

 - OPTIONS

 - TRACE

```csharp
[AutoValidateAntiforgeryToken]
public class HomeController : Controller
```

```csharp
builder.Services.AddControllersWithViews(options =>
{
    options.Filters.Add(new AutoValidateAntiforgeryTokenAttribute());
});
```

### Override global or controller antiforgery attributes

```csharp
[IgnoreAntiforgeryToken]
public IActionResult IndexOverride()
{
    // ...

    return RedirectToAction();
}
```

## Refresh tokens after authentication

## JavaScript, AJAX, and SPAs

### Blazor

### JavaScript

```cshtml
@inject Microsoft.AspNetCore.Antiforgery.IAntiforgery Antiforgery

@{
    ViewData["Title"] = "JavaScript";

    var requestToken = Antiforgery.GetAndStoreTokens(Context).RequestToken;
}

<input id="RequestVerificationToken" type="hidden" value="@requestToken" />

<button id="button" class="btn btn-primary">Submit with Token</button>
<div id="result" class="mt-2"></div>

@section Scripts {
<script>
    document.addEventListener("DOMContentLoaded", () => {
        const resultElement = document.getElementById("result");

        document.getElementById("button").addEventListener("click", async () => {

            const response = await fetch("@Url.Action("FetchEndpoint")", {
                method: "POST",
                headers: {
                    RequestVerificationToken:
                        document.getElementById("RequestVerificationToken").value
                }
            });

            if (response.ok) {
                resultElement.innerText = await response.text();
            } else {
                resultElement.innerText = `Request Failed: ${response.status}`
            }
        });
    });
</script>
}
```

 - Access tokens in an additional request to the server, typically usually ```same-origin```.

 - Use the cookie's contents to create a header with the token's value.

```csharp
builder.Services.AddAntiforgery(options => options.HeaderName = "X-XSRF-TOKEN");
```

```csharp
app.UseAuthorization();
app.MapGet("antiforgery/token", (IAntiforgery forgeryService, HttpContext context) =>
{
    var tokens = forgeryService.GetAndStoreTokens(context);
    context.Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken!,
            new CookieOptions { HttpOnly = false });

    return Results.Ok();
}).RequireAuthorization();
```

```javascript
var response = await fetch("/antiforgery/token", {
    method: "GET",
    headers: { "Authorization": authorizationToken }
});

if (response.ok) {
    // https://developer.mozilla.org/docs/web/api/document/cookie
    const xsrfToken = document.cookie
        .split("; ")
        .find(row => row.startsWith("XSRF-TOKEN="))
        .split("=")[1];

    response = await fetch("/JavaScript/FetchEndpoint", {
        method: "POST",
        headers: { "X-XSRF-TOKEN": xsrfToken, "Authorization": authorizationToken }
    });

    if (response.ok) {
        resultElement.innerText = await response.text();
    } else {
        resultElement.innerText = `Request Failed: ${response.status}`
    }
} else {    
    resultElement.innerText = `Request Failed: ${response.status}`
}
```

> Note
When the antiforgery token is provided in both the request header and in the form payload, only the token in the header is validated.

### Antiforgery with Minimal APIs

```csharp
var builder = WebApplication.CreateBuilder();

builder.Services.AddAntiforgery();

var app = builder.Build();

app.UseAntiforgery();

app.MapGet("/", () => "Hello World!");

app.Run();
```

 - Does not short-circuit the execution of the rest of the request pipeline.

 - Sets the IAntiforgeryValidationFeature in the HttpContext.Features of the current request.

 - The endpoint contains metadata implementing IAntiforgeryMetadata where ```RequiresValidation=true```.

 - The HTTP method associated with the endpoint is a relevant HTTP method. The relevant methods are all HTTP methods except for TRACE, OPTIONS, HEAD, and GET.

 - The request is associated with a valid endpoint.

```csharp
public static string GenerateForm(string action, 
    AntiforgeryTokenSet token, bool UseToken=true)
{
    string tokenInput = "";
    if (UseToken)
    {
        tokenInput = $@"<input name=""{token.FormFieldName}""
                         type=""hidden"" value=""{token.RequestToken}"" />";
    }

    return $@"
    <html><body>
        <form action=""{action}"" method=""POST"" enctype=""multipart/form-data"">
            {tokenInput}
            <input type=""text"" name=""name"" />
            <input type=""date"" name=""dueDate"" />
            <input type=""checkbox"" name=""isCompleted"" />
            <input type=""submit"" />
        </form>
    </body></html>
";
}
```

```csharp
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder();

builder.Services.AddAntiforgery();

var app = builder.Build();

app.UseAntiforgery();

// Pass token
app.MapGet("/", (HttpContext context, IAntiforgery antiforgery) =>
{
    var token = antiforgery.GetAndStoreTokens(context);
    return Results.Content(MyHtml.GenerateForm("/todo", token), "text/html");
});

// Don't pass a token, fails
app.MapGet("/SkipToken", (HttpContext context, IAntiforgery antiforgery) =>
{
    var token = antiforgery.GetAndStoreTokens(context);
    return Results.Content(MyHtml.GenerateForm("/todo",token, false ), "text/html");
});

// Post to /todo2. DisableAntiforgery on that endpoint so no token needed.
app.MapGet("/DisableAntiforgery", (HttpContext context, IAntiforgery antiforgery) =>
{
    var token = antiforgery.GetAndStoreTokens(context);
    return Results.Content(MyHtml.GenerateForm("/todo2", token, false), "text/html");
});

app.MapPost("/todo", ([FromForm] Todo todo) => Results.Ok(todo));

app.MapPost("/todo2", ([FromForm] Todo todo) => Results.Ok(todo))
                                                .DisableAntiforgery();

app.Run();

class Todo
{
    public required string Name { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime DueDate { get; set; }
}

public static class MyHtml
{
    public static string GenerateForm(string action, 
        AntiforgeryTokenSet token, bool UseToken=true)
    {
        string tokenInput = "";
        if (UseToken)
        {
            tokenInput = $@"<input name=""{token.FormFieldName}""
                             type=""hidden"" value=""{token.RequestToken}"" />";
        }

        return $@"
        <html><body>
            <form action=""{action}"" method=""POST"" enctype=""multipart/form-data"">
                {tokenInput}
                <input type=""text"" name=""name"" />
                <input type=""date"" name=""dueDate"" />
                <input type=""checkbox"" name=""isCompleted"" />
                <input type=""submit"" />
            </form>
        </body></html>
    ";
    }
}
```

 - ```/todo``` require a valid antiforgery token.

 - ```/todo2``` do not require a valid antiforgery token because ```DisableAntiforgery``` is called.

```csharp
app.MapPost("/todo", ([FromForm] Todo todo) => Results.Ok(todo));

app.MapPost("/todo2", ([FromForm] Todo todo) => Results.Ok(todo))
                                                .DisableAntiforgery();
```

 - ```/todo``` from the form generated by the / endpoint succeeds because the antiforgery token is valid.

 - ```/todo``` from the form generated by the ```/SkipToken``` fails because the antiforgery is not included.

 - ```/todo2``` from the form generated by the ```/DisableAntiforgery``` endpoint succeeds because the antiforgery is not required.

```csharp
app.MapPost("/todo", ([FromForm] Todo todo) => Results.Ok(todo));

app.MapPost("/todo2", ([FromForm] Todo todo) => Results.Ok(todo))
                                                .DisableAntiforgery();
```

 - In the development environment, an exception is thrown.

 - In the production environment, a message is logged.

## Windows authentication and antiforgery cookies

## Extend antiforgery

## Additional resources

 - Host ASP.NET Core in a web farm

Ref: [Prevent Cross-Site Request Forgery (XSRF/CSRF) attacks in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-8.0)