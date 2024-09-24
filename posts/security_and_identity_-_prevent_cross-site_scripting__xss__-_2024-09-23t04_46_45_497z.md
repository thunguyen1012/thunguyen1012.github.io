---
title: Security and Identity - Prevent Cross-Site Scripting (XSS)
published: true
date: 2024-09-23 04:46:45
tags: Summary, AspNetCore
description:
image:
---

## In this article

Researchers at the University of British Columbia have discovered and fixed a cross-site scripting (XSS) vulnerability in the UBC website.

Web APIs that return data in the form of HTML Pages can trigger XSS attacks in their client apps if they don't properly accept user input, depending on how much trust the client app places in the API.

A vulnerability in a web API has been discovered that could allow a malicious third-party to gain access to the user's personal data.

## Protecting your application against XSS

At a basic level, XSS works by tricking your application into inserting a `<script>` tag into your rendered page, or by inserting an On* event into an element. Developers should use the following prevention steps to avoid introducing XSS into their applications:

- Never put untrusted data into your HTML input, unless you follow the rest of the steps below. Untrusted data is any data that may be controlled by an attacker, such as HTML form inputs, query strings, HTTP headers, or even data sourced from a database, as an attacker may be able to breach your database even if they can't breach your application.

- Before putting untrusted data inside an HTML element, ensure it's HTML encoded. HTML encoding takes characters such as < and changes them into a safe form like &lt;

- Before putting untrusted data into an HTML attribute, ensure it's HTML encoded. HTML attribute encoding is a superset of HTML encoding and encodes additional characters such as " and ".

- Before putting untrusted data into JavaScript, place the data in an HTML element whose contents you retrieve at runtime. If this isn't possible, then ensure the data is JavaScript encoded. JavaScript encoding takes dangerous characters for JavaScript and replaces them with their hex, for example, < would be encoded as ```\u003C```.

- Before putting untrusted data into a URL query string ensure it's URL encoded.

## HTML Encoding using Razor

In our series of articles on how to use MVC, we're going to look at how to encode input using the Razor engine.

Take the following Razor view:

```cshtml
@{
    var untrustedInput = "<\"123\">";
}

@untrustedInput
```

This view outputs the contents of the untrustedInput variable.

```html
&lt;&quot;123&quot;&gt;
```

> Warning
ASP.NET Core MVC provides an ```HtmlString``` class which isn't automatically encoded upon output. This should never be used in combination with untrusted input as this will expose an XSS vulnerability.

## JavaScript Encoding using Razor

In this article I will show you how to insert values into JavaScript.

```cshtml
@{
    var untrustedInput = "<script>alert(1)</script>";
}

<div id="injectedData"
     data-untrustedinput="@untrustedInput" />

<div id="scriptedWrite" />
<div id="scriptedWrite-html5" />

<script>
    var injectedData = document.getElementById("injectedData");

    // All clients
    var clientSideUntrustedInputOldStyle =
        injectedData.getAttribute("data-untrustedinput");

    // HTML 5 clients only
    var clientSideUntrustedInputHtml5 =
        injectedData.dataset.untrustedinput;

    // Put the injected, untrusted data into the scriptedWrite div tag.
    // Do NOT use document.write() on dynamically generated data as it
    // can lead to XSS.

    document.getElementById("scriptedWrite").innerText += clientSideUntrustedInputOldStyle;

    // Or you can use createElement() to dynamically create document elements
    // This time we're using textContent to ensure the data is properly encoded.
    var x = document.createElement("div");
    x.textContent = clientSideUntrustedInputHtml5;
    document.body.appendChild(x);

    // You can also use createTextNode on an element to ensure data is properly encoded.
    var y = document.createElement("div");
    y.appendChild(document.createTextNode(clientSideUntrustedInputHtml5));
    document.body.appendChild(y);

</script>
```

The preceding markup generates the following HTML:

```html
<div id="injectedData"
     data-untrustedinput="&lt;script&gt;alert(1)&lt;/script&gt;" />

<div id="scriptedWrite" />
<div id="scriptedWrite-html5" />

<script>
    var injectedData = document.getElementById("injectedData");

    // All clients
    var clientSideUntrustedInputOldStyle =
        injectedData.getAttribute("data-untrustedinput");

    // HTML 5 clients only
    var clientSideUntrustedInputHtml5 =
        injectedData.dataset.untrustedinput;

    // Put the injected, untrusted data into the scriptedWrite div tag.
    // Do NOT use document.write() on dynamically generated data as it can
    // lead to XSS.

    document.getElementById("scriptedWrite").innerText += clientSideUntrustedInputOldStyle;

    // Or you can use createElement() to dynamically create document elements
    // This time we're using textContent to ensure the data is properly encoded.
    var x = document.createElement("div");
    x.textContent = clientSideUntrustedInputHtml5;
    document.body.appendChild(x);

    // You can also use createTextNode on an element to ensure data is properly encoded.
    var y = document.createElement("div");
    y.appendChild(document.createTextNode(clientSideUntrustedInputHtml5));
    document.body.appendChild(y);

</script>
```

The preceding code generates the following output:

> Warning
Do NOT concatenate untrusted input in JavaScript to create DOM elements or use document.write() on dynamically generated content.
Use one of the following approaches to prevent code from being exposed to DOM-based XSS:

createElement() and assign property values with appropriate methods or properties such as node.textContent= or node.InnerText=.
document.CreateTextNode() and append it in the appropriate DOM location.
element.SetAttribute()
element[attribute]=

 - createElement() and assign property values with appropriate methods or properties such as node.textContent= or node.InnerText=.

 - document.CreateTextNode() and append it in the appropriate DOM location.

 - element.SetAttribute()

 - element[attribute]=

## Accessing encoders in code

The HTML, JavaScript and URL encoders are available to your code in two ways:

- Inject them via dependency injection.

- Use the default encoders contained in the ```System.Text.Encodings.Web``` namespace.

When using the default encoders, then any customizations applied to character ranges to be treated as safe won't take effect. The default encoders use the safest encoding rules possible.

To use the configurable encoders via DI your constructors should take an HtmlEncoder, JavaScriptEncoder and ```UrlEncoder``` parameter as appropriate. For example;

```csharp
public class HomeController : Controller
{
    HtmlEncoder _htmlEncoder;
    JavaScriptEncoder _javaScriptEncoder;
    UrlEncoder _urlEncoder;

    public HomeController(HtmlEncoder htmlEncoder,
                          JavaScriptEncoder javascriptEncoder,
                          UrlEncoder urlEncoder)
    {
        _htmlEncoder = htmlEncoder;
        _javaScriptEncoder = javascriptEncoder;
        _urlEncoder = urlEncoder;
    }
}
```

## Encoding URL Parameters

If you want to build a URL query string with untrusted input as a value use the ```UrlEncoder``` to encode the value. For example,

```csharp
var example = "\"Quoted Value with spaces and &\"";
var encodedValue = _urlEncoder.Encode(example);
```

After encoding the encodedValue variable contains ```%22Quoted%20Value%20with%20spaces%20and%20%26%22```. Spaces, quotes, punctuation and other unsafe characters are percent encoded to their hexadecimal value, for example a space character will become %20.

> Warning
Don't use untrusted input as part of a URL path. Always pass untrusted input as a query string value.



## Customizing the Encoders

Razor uses encoders to output its strings.

If your web site uses a lot of non-English characters, you might want to consider changing the language you use.

```html
<p>This link text is in Chinese: @Html.ActionLink("汉语/漢語", "Index")</p>
```

```html
<p>This link text is in Chinese: <a href="/">&#x6C49;&#x8BED;/&#x6F22;&#x8A9E;</a></p>
```

```csharp
builder.Services.AddSingleton<HtmlEncoder>(
     HtmlEncoder.Create(allowedRanges: new[] { UnicodeRanges.BasicLatin,
                                               UnicodeRanges.CjkUnifiedIdeographs }));
```

This example widens the safe list to include the Unicode Range CjkUnifiedIdeographs. The rendered output would now become

```html
<p>This link text is in Chinese: <a href="/">汉语/漢語</a></p>
```

There are two ways to find a safe list.

> Note
Customization of the safe list only affects encoders sourced via DI. If you directly access an encoder via ```System.Text.Encodings.Web.*Encoder.Default``` then the default, Basic Latin only safelist will be used.

## Where should encoding take place?

An encoder is a piece of software that converts data into a format that can be stored in a database.

## Validation as an XSS prevention technique

In our series of articles on cross-site scripting (XSS), we take a look at how to limit the impact of XSS attacks on websites.

Ref: [Prevent Cross-Site Scripting (XSS) in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/cross-site-scripting?view=aspnetcore-8.0)