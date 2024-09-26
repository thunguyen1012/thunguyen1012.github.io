---
title: Advanced - URL rewriting
published: true
date: 2024-09-25 09:33:30
tags: Summary, AspNetCore
description:
image:
---

## In this article

 - Move or replace server resources temporarily or permanently and maintain stable locators for those resources.

 - Split request processing across different apps or across areas of one app.

 - Remove, add, or reorganize URL segments on incoming requests.

 - Optimize public URLs for Search Engine Optimization (SEO).

 - Permit the use of friendly public URLs to help visitors predict the content returned by requesting a resource.

 - Redirect insecure requests to secure endpoints.

 - Prevent hotlinking, where an external site uses a hosted static asset on another site by linking the asset into its own content.

## URL redirect and URL rewrite

![A WebAPI service endpoint has been temporarily changed from version 1 (v1) to version 2 (v2) on the server. A client makes a request to the service at the version 1 path /v1/api. The server sends back a 302 (Found) response with the new, temporary path for the service at version 2 /v2/api. The client makes a second request to the service at the redirect URL. The server responds with a 200 (OK) status code.!](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/url-rewriting/_static/url_redirect.png?view=aspnetcore-8.0 "A WebAPI service endpoint has been temporarily changed from version 1 (v1) to version 2 (v2) on the server. A client makes a request to the service at the version 1 path /v1/api. The server sends back a 302 (Found) response with the new, temporary path for the service at version 2 /v2/api. The client makes a second request to the service at the redirect URL. The server responds with a 200 (OK) status code.")

 - The ```301 - Moved Permanently``` status code is used where the resource has a new, permanent URL and that all future requests for the resource should use the new URL. The client may cache and reuse the response when a 301 status code is received.

 - The ```302 - Found``` status code is used where the redirection is temporary or generally subject to change. The 302 status code indicates to the client not to store the URL and use it in the future.

![A WebAPI service endpoint has been changed from version 1 (v1) to version 2 (v2) on the server. A client makes a request to the service at the version 1 path /v1/api. The request URL is rewritten to access the service at the version 2 path /v2/api. The service responds to the client with a 200 (OK) status code.!](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/url-rewriting/_static/url_rewrite.png?view=aspnetcore-8.0 "A WebAPI service endpoint has been changed from version 1 (v1) to version 2 (v2) on the server. A client makes a request to the service at the version 1 path /v1/api. The request URL is rewritten to access the service at the version 2 path /v2/api. The service responds to the client with a 200 (OK) status code.")

## URL rewriting sample app

## When to use URL rewriting middleware

 - URL Rewrite module with IIS on Windows Server

 - Apache mod_rewrite module on Apache Server

 - URL rewriting on Nginx

 - The middleware doesn't support the full features of these modules.
Some of the features of the server modules don't work with ASP.NET Core projects, such as the ```IsFile``` and ```IsDirectory``` constraints of the IIS Rewrite module. In these scenarios, use the middleware instead.

 - The performance of the middleware probably doesn't match that of the modules.
Benchmarking is the only way to know with certainty which approach degrades performance the most or if degraded performance is negligible.

## Extension and options

```csharp
using Microsoft.AspNetCore.Rewrite;
using RewriteRules;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

using (StreamReader apacheModRewriteStreamReader =
    File.OpenText("ApacheModRewrite.txt"))
using (StreamReader iisUrlRewriteStreamReader =
    File.OpenText("IISUrlRewrite.xml"))
{
    var options = new RewriteOptions()
        .AddRedirect("redirect-rule/(.*)", "redirected/$1")
        .AddRewrite(@"^rewrite-rule/(\d+)/(\d+)", "rewritten?var1=$1&var2=$2",
            skipRemainingRules: true)
        .AddApacheModRewrite(apacheModRewriteStreamReader)
        .AddIISUrlRewrite(iisUrlRewriteStreamReader)
        .Add(MethodRules.RedirectXmlFileRequests)
        .Add(MethodRules.RewriteTextFileRequests)
        .Add(new RedirectImageRequests(".png", "/png-images"))
        .Add(new RedirectImageRequests(".jpg", "/jpg-images"));

    app.UseRewriter(options);
}

app.UseStaticFiles();

app.Run(context => context.Response.WriteAsync(
    $"Rewritten or Redirected Url: " +
    $"{context.Request.Path + context.Request.QueryString}"));

app.Run();
```

### Redirect non-www to ```www```

 - AddRedirectToWwwPermanent: Permanently redirect the request to the ```www``` subdomain if the request is non-www. Redirects with a Status308PermanentRedirect status code.

 - AddRedirectToWww: Redirect the request to the ```www``` subdomain if the incoming request is non-www. Redirects with a Status307TemporaryRedirect status code. An overload permits  providing the status code for the response. Use a field of the StatusCodes class for a status code assignment.

### URL redirect

```csharp
using Microsoft.AspNetCore.Rewrite;
using RewriteRules;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

using (StreamReader apacheModRewriteStreamReader =
    File.OpenText("ApacheModRewrite.txt"))
using (StreamReader iisUrlRewriteStreamReader =
    File.OpenText("IISUrlRewrite.xml"))
{
    var options = new RewriteOptions()
        .AddRedirect("redirect-rule/(.*)", "redirected/$1")
        .AddRewrite(@"^rewrite-rule/(\d+)/(\d+)", "rewritten?var1=$1&var2=$2",
            skipRemainingRules: true)
        .AddApacheModRewrite(apacheModRewriteStreamReader)
        .AddIISUrlRewrite(iisUrlRewriteStreamReader)
        .Add(MethodRules.RedirectXmlFileRequests)
        .Add(MethodRules.RewriteTextFileRequests)
        .Add(new RedirectImageRequests(".png", "/png-images"))
        .Add(new RedirectImageRequests(".jpg", "/jpg-images"));

    app.UseRewriter(options);
}

app.UseStaticFiles();

app.Run(context => context.Response.WriteAsync(
    $"Rewritten or Redirected Url: " +
    $"{context.Request.Path + context.Request.QueryString}"));

app.Run();
```

 - The second request receives a 200 - OK response from the app.

 - The body of the response shows the redirect URL.

> Warning
Be cautious when establishing redirect rules. Redirect rules are evaluated on every request to the app, including after a redirect. It's easy to accidentally create a loop of infinite redirects.

### URL redirect to a secure endpoint

 - The middleware defaults to ```null```.

 - The scheme changes to ```https``` (HTTPS protocol), and the client accesses the resource on port 443.

```csharp
using Microsoft.AspNetCore.Rewrite;
using RewriteRules;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

int? localhostHTTPSport = null;
if (app.Environment.IsDevelopment())
{
    localhostHTTPSport = Int32.Parse(Environment.GetEnvironmentVariable(
                   "ASPNETCORE_URLS")!.Split(new Char[] { ':', ';' })[2]);
}

using (StreamReader apacheModRewriteStreamReader =
    File.OpenText("ApacheModRewrite.txt"))
using (StreamReader iisUrlRewriteStreamReader =
    File.OpenText("IISUrlRewrite.xml"))
{
    var options = new RewriteOptions()
        // localhostHTTPport not needed for production, used only with localhost.
        .AddRedirectToHttps(301, localhostHTTPSport)
        .AddRedirect("redirect-rule/(.*)", "redirected/$1")
        .AddRewrite(@"^rewrite-rule/(\d+)/(\d+)", "rewritten?var1=$1&var2=$2",
            skipRemainingRules: true)
        .AddApacheModRewrite(apacheModRewriteStreamReader)
        .AddIISUrlRewrite(iisUrlRewriteStreamReader)
        .Add(MethodRules.RedirectXmlFileRequests)
        .Add(MethodRules.RewriteTextFileRequests)
        .Add(new RedirectImageRequests(".png", "/png-images"))
        .Add(new RedirectImageRequests(".jpg", "/jpg-images"));

    app.UseRewriter(options);
}

app.UseStaticFiles();

app.Run(context => context.Response.WriteAsync(
    $"Rewritten or Redirected Url: " +
    $"{context.Request.Path + context.Request.QueryString}"));

app.Run();
```

```csharp
using Microsoft.AspNetCore.Rewrite;
using RewriteRules;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

using (StreamReader apacheModRewriteStreamReader =
    File.OpenText("ApacheModRewrite.txt"))
using (StreamReader iisUrlRewriteStreamReader =
    File.OpenText("IISUrlRewrite.xml"))
{
    var options = new RewriteOptions()
        .AddRedirectToHttpsPermanent()
        .AddRedirect("redirect-rule/(.*)", "redirected/$1")
        .AddRewrite(@"^rewrite-rule/(\d+)/(\d+)", "rewritten?var1=$1&var2=$2",
            skipRemainingRules: true)
        .AddApacheModRewrite(apacheModRewriteStreamReader)
        .AddIISUrlRewrite(iisUrlRewriteStreamReader)
        .Add(MethodRules.RedirectXmlFileRequests)
        .Add(MethodRules.RewriteTextFileRequests)
        .Add(new RedirectImageRequests(".png", "/png-images"))
        .Add(new RedirectImageRequests(".jpg", "/jpg-images"));

    app.UseRewriter(options);
}

app.UseStaticFiles();

app.Run(context => context.Response.WriteAsync(
    $"Rewritten or Redirected Url: " +
    $"{context.Request.Path + context.Request.QueryString}"));

app.Run();
```

> Note
When redirecting to a secure endpoint without the requirement for additional redirect rules, we recommend using HTTPS Redirection Middleware. For more information, see Enforce HTTPS.

 - Use the HTTP URL, which has a different port than the HTTPS URL. The HTTP URL is in the ```Properties/launchSettings.json``` file.

 - Removing the ```s``` from ```https```://localhost/{port} fails because localhost doesn't respond on HTTP to the HTTPS port.

![Browser window with developer tools tracking the requests and responses: Add redirect to HTTPS!](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/url-rewriting/_static/add_redirect_to_https6.png?view=aspnetcore-8.0 "Browser window with developer tools tracking the requests and responses: Add redirect to HTTPS")

### URL rewrite

```csharp
using Microsoft.AspNetCore.Rewrite;
using RewriteRules;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

using (StreamReader apacheModRewriteStreamReader =
    File.OpenText("ApacheModRewrite.txt"))
using (StreamReader iisUrlRewriteStreamReader =
    File.OpenText("IISUrlRewrite.xml"))
{
    var options = new RewriteOptions()
        .AddRedirectToHttpsPermanent()
        .AddRedirect("redirect-rule/(.*)", "redirected/$1")
        .AddRewrite(@"^rewrite-rule/(\d+)/(\d+)", "rewritten?var1=$1&var2=$2",
            skipRemainingRules: true)
        .AddApacheModRewrite(apacheModRewriteStreamReader)
        .AddIISUrlRewrite(iisUrlRewriteStreamReader)
        .Add(MethodRules.RedirectXmlFileRequests)
        .Add(MethodRules.RewriteTextFileRequests)
        .Add(new RedirectImageRequests(".png", "/png-images"))
        .Add(new RedirectImageRequests(".jpg", "/jpg-images"));

    app.UseRewriter(options);
}

app.UseStaticFiles();

app.Run(context => context.Response.WriteAsync(
    $"Rewritten or Redirected Url: " +
    $"{context.Request.Path + context.Request.QueryString}"));

app.Run();
```

<table><thead>
<tr>
<th>Path</th>
<th style="text-align: center;">Match</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>/redirect-rule/1234/5678</code></td>
<td style="text-align: center;">Yes</td>
</tr>
<tr>
<td><code>/my-cool-redirect-rule/1234/5678</code></td>
<td style="text-align: center;">Yes</td>
</tr>
<tr>
<td><code>/anotherredirect-rule/1234/5678</code></td>
<td style="text-align: center;">Yes</td>
</tr>
</tbody></table>

<table><thead>
<tr>
<th>Path</th>
<th style="text-align: center;">Match</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>/rewrite-rule/1234/5678</code></td>
<td style="text-align: center;">Yes</td>
</tr>
<tr>
<td><code>/my-cool-rewrite-rule/1234/5678</code></td>
<td style="text-align: center;">No</td>
</tr>
<tr>
<td><code>/anotherrewrite-rule/1234/5678</code></td>
<td style="text-align: center;">No</td>
</tr>
</tbody></table>

### Performance tips for URL rewrite and redirect

 - Order rewrite rules from the most frequently matched rule to the least frequently matched rule.

 - Use ```skipRemainingRules: true``` whenever possible because matching rules is computationally expensive and increases app response time. Skip the processing of the remaining rules when a match occurs and no additional rule processing is required.

> Warning
A malicious user can provide expensive to process input to ```RegularExpressions``` causing a Denial-of-Service attack. ASP.NET Core framework APIs that use ```RegularExpressions``` pass a timeout. For example, the RedirectRule and RewriteRule classes both pass in a one second timeout.

### Apache mod_rewrite

```csharp
using Microsoft.AspNetCore.Rewrite;
using RewriteRules;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

using (StreamReader apacheModRewriteStreamReader =
    File.OpenText("ApacheModRewrite.txt"))
using (StreamReader iisUrlRewriteStreamReader =
    File.OpenText("IISUrlRewrite.xml"))
{
    var options = new RewriteOptions()
        .AddRedirectToHttpsPermanent()
        .AddRedirect("redirect-rule/(.*)", "redirected/$1")
        .AddRewrite(@"^rewrite-rule/(\d+)/(\d+)", "rewritten?var1=$1&var2=$2",
            skipRemainingRules: true)
        .AddApacheModRewrite(apacheModRewriteStreamReader)
        .AddIISUrlRewrite(iisUrlRewriteStreamReader)
        .Add(MethodRules.RedirectXmlFileRequests)
        .Add(MethodRules.RewriteTextFileRequests)
        .Add(new RedirectImageRequests(".png", "/png-images"))
        .Add(new RedirectImageRequests(".jpg", "/jpg-images"));

    app.UseRewriter(options);
}

app.UseStaticFiles();

app.Run(context => context.Response.WriteAsync(
    $"Rewritten or Redirected Url: " +
    $"{context.Request.Path + context.Request.QueryString}"));

app.Run();
```

 - CONN_REMOTE_ADDR

 - HTTP_ACCEPT

 - HTTP_CONNECTION

 - HTTP_COOKIE

 - HTTP_FORWARDED

 - HTTP_HOST

 - HTTP_REFERER

 - HTTP_USER_AGENT

 - HTTPS

 - IPV6

 - QUERY_STRING

 - REMOTE_ADDR

 - REMOTE_PORT

 - REQUEST_FILENAME

 - REQUEST_METHOD

 - REQUEST_SCHEME

 - REQUEST_URI

 - SCRIPT_FILENAME

 - SERVER_ADDR

 - SERVER_PORT

 - SERVER_PROTOCOL

 - TIME

 - TIME_DAY

 - TIME_HOUR

 - TIME_MIN

 - TIME_MON

 - TIME_SEC

 - TIME_WDAY

 - TIME_YEAR

### IIS URL Rewrite Module rules

```csharp
using Microsoft.AspNetCore.Rewrite;
using RewriteRules;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

using (StreamReader apacheModRewriteStreamReader =
    File.OpenText("ApacheModRewrite.txt"))
using (StreamReader iisUrlRewriteStreamReader =
    File.OpenText("IISUrlRewrite.xml"))
{
    var options = new RewriteOptions()
        .AddRedirectToHttpsPermanent()
        .AddRedirect("redirect-rule/(.*)", "redirected/$1")
        .AddRewrite(@"^rewrite-rule/(\d+)/(\d+)", "rewritten?var1=$1&var2=$2",
            skipRemainingRules: true)
        .AddApacheModRewrite(apacheModRewriteStreamReader)
        .AddIISUrlRewrite(iisUrlRewriteStreamReader)
        .Add(MethodRules.RedirectXmlFileRequests)
        .Add(MethodRules.RewriteTextFileRequests)
        .Add(new RedirectImageRequests(".png", "/png-images"))
        .Add(new RedirectImageRequests(".jpg", "/jpg-images"));

    app.UseRewriter(options);
}

app.UseStaticFiles();

app.Run(context => context.Response.WriteAsync(
    $"Rewritten or Redirected Url: " +
    $"{context.Request.Path + context.Request.QueryString}"));

app.Run();
```

```xml
<rewrite>
  <rules>
    <rule name="Rewrite segment to id querystring" stopProcessing="true">
      <match url="^iis-rules-rewrite/(.*)$" />
      <action type="Rewrite" url="rewritten?id={R:1}" appendQueryString="false"/>
    </rule>
  </rules>
</rewrite>
```

 - Consider disabling the IIS Rewrite Module for the app.

 - For more information, see Disabling IIS modules.

#### Unsupported features

 - Outbound Rules

 - Custom Server Variables

 - Wildcards

 - LogRewrittenUrl

#### Supported server variables

 - CONTENT_LENGTH

 - CONTENT_TYPE

 - HTTP_ACCEPT

 - HTTP_CONNECTION

 - HTTP_COOKIE

 - HTTP_HOST

 - HTTP_REFERER

 - HTTP_URL

 - HTTP_USER_AGENT

 - HTTPS

 - LOCAL_ADDR

 - QUERY_STRING

 - REMOTE_ADDR

 - REMOTE_PORT

 - REQUEST_FILENAME

 - REQUEST_URI

```csharp
var fileProvider = new PhysicalFileProvider(Directory.GetCurrentDirectory());
```

### Method-based rule

<table><thead>
<tr>
<th>Rewrite context result</th>
<th>Action</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>RuleResult.ContinueRules</code> (default)</td>
<td>Continue applying rules.</td>
</tr>
<tr>
<td><code>RuleResult.EndResponse</code></td>
<td>Stop applying rules and send the response.</td>
</tr>
<tr>
<td><code>RuleResult.SkipRemainingRules</code></td>
<td>Stop applying rules and send the context to the next middleware.</td>
</tr>
</tbody></table>

```csharp
using Microsoft.AspNetCore.Rewrite;
using RewriteRules;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

using (StreamReader apacheModRewriteStreamReader =
    File.OpenText("ApacheModRewrite.txt"))
using (StreamReader iisUrlRewriteStreamReader =
    File.OpenText("IISUrlRewrite.xml"))
{
    var options = new RewriteOptions()
        .AddRedirectToHttpsPermanent()
        .AddRedirect("redirect-rule/(.*)", "redirected/$1")
        .AddRewrite(@"^rewrite-rule/(\d+)/(\d+)", "rewritten?var1=$1&var2=$2",
            skipRemainingRules: true)
        .AddApacheModRewrite(apacheModRewriteStreamReader)
        .AddIISUrlRewrite(iisUrlRewriteStreamReader)
        .Add(MethodRules.RedirectXmlFileRequests)
        .Add(MethodRules.RewriteTextFileRequests)
        .Add(new RedirectImageRequests(".png", "/png-images"))
        .Add(new RedirectImageRequests(".jpg", "/jpg-images"));

    app.UseRewriter(options);
}

app.UseStaticFiles();

app.Run(context => context.Response.WriteAsync(
    $"Rewritten or Redirected Url: " +
    $"{context.Request.Path + context.Request.QueryString}"));

app.Run();
```

 - The request is redirected to ```/xmlfiles/file.xml```

 - The status code is set to ```301 - Moved Permanently```. When the browser makes a new request for ```/xmlfiles/file.xml```, Static File Middleware serves the file to the client from the wwwroot/xmlfiles folder. For a redirect, explicitly set the status code of the response. Otherwise, a 200 - OK status code is returned, and the redirect doesn't occur on the client.

```csharp
public static void RedirectXmlFileRequests(RewriteContext context)
{
    var request = context.HttpContext.Request;

    // Because the client is redirecting back to the same app, stop 
    // processing if the request has already been redirected.
    if (request.Path.StartsWithSegments(new PathString("/xmlfiles")) ||
        request.Path.Value==null)
    {
        return;
    }

    if (request.Path.Value.EndsWith(".xml", StringComparison.OrdinalIgnoreCase))
    {
        var response = context.HttpContext.Response;
        response.StatusCode = (int) HttpStatusCode.MovedPermanently;
        context.Result = RuleResult.EndResponse;
        response.Headers[HeaderNames.Location] = 
            "/xmlfiles" + request.Path + request.QueryString;
    }
}
```

```csharp
using Microsoft.AspNetCore.Rewrite;
using RewriteRules;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

using (StreamReader apacheModRewriteStreamReader =
    File.OpenText("ApacheModRewrite.txt"))
using (StreamReader iisUrlRewriteStreamReader =
    File.OpenText("IISUrlRewrite.xml"))
{
    var options = new RewriteOptions()
        .AddRedirectToHttpsPermanent()
        .AddRedirect("redirect-rule/(.*)", "redirected/$1")
        .AddRewrite(@"^rewrite-rule/(\d+)/(\d+)", "rewritten?var1=$1&var2=$2",
            skipRemainingRules: true)
        .AddApacheModRewrite(apacheModRewriteStreamReader)
        .AddIISUrlRewrite(iisUrlRewriteStreamReader)
        .Add(MethodRules.RedirectXmlFileRequests)
        .Add(MethodRules.RewriteTextFileRequests)
        .Add(new RedirectImageRequests(".png", "/png-images"))
        .Add(new RedirectImageRequests(".jpg", "/jpg-images"));

    app.UseRewriter(options);
}

app.UseStaticFiles();

app.Run(context => context.Response.WriteAsync(
    $"Rewritten or Redirected Url: " +
    $"{context.Request.Path + context.Request.QueryString}"));

app.Run();
```

```csharp
public static void RewriteTextFileRequests(RewriteContext context)
{
    var request = context.HttpContext.Request;

    if (request.Path.Value != null &&
        request.Path.Value.EndsWith(".txt", StringComparison.OrdinalIgnoreCase))
    {
        context.Result = RuleResult.SkipRemainingRules;
        request.Path = "/file.txt";
    }
}
```

### ```IRule```-based rule

```csharp
using Microsoft.AspNetCore.Rewrite;
using RewriteRules;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

using (StreamReader apacheModRewriteStreamReader =
    File.OpenText("ApacheModRewrite.txt"))
using (StreamReader iisUrlRewriteStreamReader =
    File.OpenText("IISUrlRewrite.xml"))
{
    var options = new RewriteOptions()
        .AddRedirectToHttpsPermanent()
        .AddRedirect("redirect-rule/(.*)", "redirected/$1")
        .AddRewrite(@"^rewrite-rule/(\d+)/(\d+)", "rewritten?var1=$1&var2=$2",
            skipRemainingRules: true)
        .AddApacheModRewrite(apacheModRewriteStreamReader)
        .AddIISUrlRewrite(iisUrlRewriteStreamReader)
        .Add(MethodRules.RedirectXmlFileRequests)
        .Add(MethodRules.RewriteTextFileRequests)
        .Add(new RedirectImageRequests(".png", "/png-images"))
        .Add(new RedirectImageRequests(".jpg", "/jpg-images"));

    app.UseRewriter(options);
}

app.UseStaticFiles();

app.Run(context => context.Response.WriteAsync(
    $"Rewritten or Redirected Url: " +
    $"{context.Request.Path + context.Request.QueryString}"));

app.Run();
```

```csharp
public class RedirectImageRequests : IRule
{
    private readonly string _extension;
    private readonly PathString _newPath;

    public RedirectImageRequests(string extension, string newPath)
    {
        if (string.IsNullOrEmpty(extension))
        {
            throw new ArgumentException(nameof(extension));
        }

        if (!Regex.IsMatch(extension, @"^\.(png|jpg|gif)$"))
        {
            throw new ArgumentException("Invalid extension", nameof(extension));
        }

        if (!Regex.IsMatch(newPath, @"(/[A-Za-z0-9]+)+?"))
        {
            throw new ArgumentException("Invalid path", nameof(newPath));
        }

        _extension = extension;
        _newPath = new PathString(newPath);
    }

    public void ApplyRule(RewriteContext context)
    {
        var request = context.HttpContext.Request;

        // Because we're redirecting back to the same app, stop 
        // processing if the request has already been redirected
        if (request.Path.StartsWithSegments(new PathString(_newPath)) ||
            request.Path.Value == null)
        {
            return;
        }

        if (request.Path.Value.EndsWith(_extension, StringComparison.OrdinalIgnoreCase))
        {
            var response = context.HttpContext.Response;
            response.StatusCode = (int) HttpStatusCode.MovedPermanently;
            context.Result = RuleResult.EndResponse;
            response.Headers[HeaderNames.Location] = 
                _newPath + request.Path + request.QueryString;
        }
    }
}
```

 - PNG request: ```https://redirect6.azurewebsites.net/image.png```

 - JPG request: ```https://redirect6.azurewebsites.net/image.jpg```

## Regex examples

<table><thead>
<tr>
<th>Goal</th>
<th>Regex String &amp;<br>Match Example</th>
<th>Replacement String &amp;<br>Output Example</th>
</tr>
</thead>
<tbody>
<tr>
<td>Rewrite ```path``` into querystring</td>
<td><code>^path/(.*)/(.*)</code><br><code>/path/abc/123</code></td>
<td><code>path?var1=$1&amp;var2=$2</code><br><code>/path?var1=abc&amp;var2=123</code></td>
</tr>
<tr>
<td>Strip trailing slash</td>
<td><code>^path2/(.*)/$</code><br><code>/path2/xyz/</code></td>
<td><code>$1</code><br><code>/path2/xyz</code></td>
</tr>
<tr>
<td>Enforce trailing slash</td>
<td><code>^path3/(.*[^/])$</code><br><code>/path3/xyz</code></td>
<td><code>$1/</code><br><code>/path3/xyz/</code></td>
</tr>
<tr>
<td>Avoid rewriting specific requests</td>
<td><code>^(.*)(?&lt;!\.axd)$</code> or <br> <code>^(?!.*\.axd$)(.*)$</code><br>Yes: <code>/path4/resource.htm</code><br>No: <code>/path4/resource.axd</code></td>
<td><code>rewritten/$1</code><br><code>/rewritten/resource.htm</code><br><code>/resource.axd</code></td>
</tr>
<tr>
<td>Rearrange URL segments</td>
<td><code>path5/(.*)/(.*)/(.*)</code><br><code>path5/1/2/3</code></td>
<td><code>path5/$3/$2/$1</code><br><code>path5/3/2/1</code></td>
</tr>
<tr>
<td>Replace a URL segment</td>
<td><code>^path6/(.*)/segment2/(.*)</code><br><code>^path6/segment1/segment2/segment3</code></td>
<td><code>path6/$1/replaced/$2</code><br><code>/path6/segment1/replaced/segment3</code></td>
</tr>
</tbody></table>

```csharp
using Microsoft.AspNetCore.Rewrite;
using RewriteRules;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

using (StreamReader apacheModRewriteStreamReader =
    File.OpenText("ApacheModRewrite.txt"))
using (StreamReader iisUrlRewriteStreamReader =
    File.OpenText("IISUrlRewrite.xml"))
{
    var options = new RewriteOptions()
        .AddRedirectToHttpsPermanent()
        .AddRedirect("redirect-rule/(.*)", "redirected/$1")
        .AddRewrite(@"^rewrite-rule/(\d+)/(\d+)", "rewritten?var1=$1&var2=$2",
            skipRemainingRules: true)

        // Rewrite path to QS.
        .AddRewrite(@"^path/(.*)/(.*)", "path?var1=$1&var2=$2",
            skipRemainingRules: true)
        // Skip trailing slash.
        .AddRewrite(@"^path2/(.*)/$", "path2/$1",
            skipRemainingRules: true)
         // Enforce trailing slash.
         .AddRewrite(@"^path3/(.*[^/])$", "path3/$1/",
            skipRemainingRules: true)
         // Avoid rewriting specific requests.
         .AddRewrite(@"^path4/(.*)(?<!\.axd)$", "rewritten/$1",
            skipRemainingRules: true)
         // Rearrange URL segments
         .AddRewrite(@"^path5/(.*)/(.*)/(.*)", "path5/$3/$2/$1",
            skipRemainingRules: true)
          // Replace a URL segment
          .AddRewrite(@"^path6/(.*)/segment2/(.*)", "path6/$1/replaced/$2",
            skipRemainingRules: true)

        .AddApacheModRewrite(apacheModRewriteStreamReader)
        .AddIISUrlRewrite(iisUrlRewriteStreamReader)
        .Add(MethodRules.RedirectXmlFileRequests)
        .Add(MethodRules.RewriteTextFileRequests)
        .Add(new RedirectImageRequests(".png", "/png-images"))
        .Add(new RedirectImageRequests(".jpg", "/jpg-images"));

    app.UseRewriter(options);
}

app.UseStaticFiles();

app.Run(context => context.Response.WriteAsync(
    $"Rewritten or Redirected Url: " +
    $"{context.Request.Path + context.Request.QueryString}"));

app.Run();
```

## Additional resources

- View or download sample code (how to download)

- RewriteMiddleware source on GitHub

- App startup in ASP.NET Core

- ASP.NET Core Middleware

- Regular expressions in ```.```NET

- Regular expression language - quick reference

- Apache mod_rewrite

- Using Url Rewrite Module 2.0 (for IIS)

- URL Rewrite Module Configuration Reference

- Keep a simple URL structure

- 10 URL Rewriting Tips and Tricks

- To slash or not to slash

Ref: [URL Rewriting Middleware in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/url-rewriting?view=aspnetcore-8.0)