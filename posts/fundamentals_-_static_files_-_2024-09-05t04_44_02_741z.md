---
title: Fundamentals - Static files
published: true
date: 2024-09-05 04:44:02
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## Serve static files

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseAuthorization();

app.MapDefaultControllerRoute();
app.MapRazorPages();

app.Run();
```

 - ```wwwroot```

   - ```css```

   - ```js```

   - ```lib```

### Serve files in web root

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseAuthorization();

app.MapDefaultControllerRoute();
app.MapRazorPages();

app.Run();
```

```html
<img src="~/images/MyImage.jpg" class="img" alt="My image" />
```

### Serve files outside of web root

 - ```wwwroot```

   - ```css```

   - ```images```

   - ```js```

 - ```MyStaticFiles```

   - ```images```

     - ```red-rose.jpg```

```csharp
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
           Path.Combine(builder.Environment.ContentRootPath, "MyStaticFiles")),
    RequestPath = "/StaticFiles"
});

app.UseAuthorization();

app.MapDefaultControllerRoute();
app.MapRazorPages();

app.Run();
```

```html
<img src="~/StaticFiles/images/red-rose.jpg" class="img" alt="A red rose" />
```

### Set HTTP response headers

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

var cacheMaxAgeOneWeek = (60 * 60 * 24 * 7).ToString();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.Append(
             "Cache-Control", $"public, max-age={cacheMaxAgeOneWeek}");
    }
});

app.UseAuthorization();

app.MapDefaultControllerRoute();
app.MapRazorPages();

app.Run();
```

## Static file authorization

 - No authorization checks are performed on the static files.

 - Static files served by the Static File Middleware, such as those under ```wwwroot```, are publicly accessible.

 - Store them outside of ```wwwroot```.

 - Call ```UseStaticFiles```, specifying a path, after calling ```UseAuthorization```.

 - Set the fallback authorization policy.

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using StaticFileAuth.Data;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<ApplicationDbContext>();
builder.Services.AddRazorPages();

builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
           Path.Combine(builder.Environment.ContentRootPath, "MyStaticFiles")),
    RequestPath = "/StaticFiles"
});

app.MapRazorPages();

app.Run();
```

 - Store them outside of ```wwwroot``` and any directory accessible to the Static File Middleware.

 - Serve them via an action method to which authorization is applied and return a FileResult object:

```csharp
[Authorize]
public class BannerImageModel : PageModel
{
    private readonly IWebHostEnvironment _env;

    public BannerImageModel(IWebHostEnvironment env) =>
        _env = env;

    public PhysicalFileResult OnGet()
    {
        var filePath = Path.Combine(
                _env.ContentRootPath, "MyStaticFiles", "images", "red-rose.jpg");

        return PhysicalFile(filePath, "image/jpeg");
    }
}
```

```csharp
app.MapGet("/files/{fileName}",  IResult (string fileName) => 
    {
        var filePath = GetOrCreateFilePath(fileName);

        if (File.Exists(filePath))
        {
            return TypedResults.PhysicalFile(filePath, fileDownloadName: $"{fileName}");
        }

        return TypedResults.NotFound("No file found with the supplied file name");
    })
    .WithName("GetFileByName")
    .RequireAuthorization("AuthenticatedUsers");

// IFormFile uses memory buffer for uploading. For handling large file use streaming instead.
// https://learn.microsoft.com/aspnet/core/mvc/models/file-uploads#upload-large-files-with-streaming
app.MapPost("/files", async (IFormFile file, LinkGenerator linker, HttpContext context) =>
    {
        // Don't rely on the file.FileName as it is only metadata that can be manipulated by the end-user
        // Take a look at the `Utilities.IsFileValid` method that takes an IFormFile and validates its signature within the AllowedFileSignatures
        
        var fileSaveName = Guid.NewGuid().ToString("N") + Path.GetExtension(file.FileName);
        await SaveFileWithCustomFileName(file, fileSaveName);
        
        context.Response.Headers.Append("Location", linker.GetPathByName(context, "GetFileByName", new { fileName = fileSaveName}));
        return TypedResults.Ok("File Uploaded Successfully!");
    })
    .RequireAuthorization("AdminsOnly");

app.Run();
```

## Directory browsing

```csharp
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

builder.Services.AddDirectoryBrowser();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles();

var fileProvider = new PhysicalFileProvider(Path.Combine(builder.Environment.WebRootPath, "images"));
var requestPath = "/MyImages";

// Enable displaying browser links.
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = fileProvider,
    RequestPath = requestPath
});

app.UseDirectoryBrowser(new DirectoryBrowserOptions
{
    FileProvider = fileProvider,
    RequestPath = requestPath
});

app.UseAuthorization();

app.MapDefaultControllerRoute();
app.MapRazorPages();

app.Run();
```

![directory browsing!](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/static-files/_static/dir-browse.png?view=aspnetcore-8.0 "directory browsing")

## Serve default documents

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseDefaultFiles();

app.UseStaticFiles();
app.UseAuthorization();

app.MapDefaultControllerRoute();
app.MapRazorPages();

app.Run();
```

 - ```default.htm```

 - ```default.html```

 - ```index.htm```

 - ```index.html```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

var options = new DefaultFilesOptions();
options.DefaultFileNames.Clear();
options.DefaultFileNames.Add("mydefault.html");
app.UseDefaultFiles(options);

app.UseStaticFiles();

app.UseAuthorization();

app.MapDefaultControllerRoute();
app.MapRazorPages();

app.Run();
```

### ```UseFileServer``` for default documents

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseFileServer();

app.UseAuthorization();

app.MapDefaultControllerRoute();
app.MapRazorPages();

app.Run();
```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

builder.Services.AddDirectoryBrowser();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseFileServer(enableDirectoryBrowsing: true);

app.UseRouting();

app.UseAuthorization();

app.MapDefaultControllerRoute();
app.MapRazorPages();

app.Run();
```

 - ```wwwroot```

   - ```css```

   - ```images```

   - ```js```

 - ```MyStaticFiles```

   - ```images```

     - ```MyImage.jpg```

   - ```default.html```

```csharp
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

builder.Services.AddDirectoryBrowser();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseFileServer(new FileServerOptions
{
    FileProvider = new PhysicalFileProvider(
           Path.Combine(builder.Environment.ContentRootPath, "MyStaticFiles")),
    RequestPath = "/StaticFiles",
    EnableDirectoryBrowsing = true
});

app.UseAuthorization();

app.MapDefaultControllerRoute();
app.MapRazorPages();

app.Run();
```

<table><thead>
<tr>
<th>URI</th>
<th>Response</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>https://&lt;hostname&gt;/StaticFiles/images/MyImage.jpg</code></td>
<td><code>MyStaticFiles/images/MyImage.jpg</code></td>
</tr>
<tr>
<td><code>https://&lt;hostname&gt;/StaticFiles</code></td>
<td><code>MyStaticFiles/default.html</code></td>
</tr>
</tbody></table>

![Static files list!](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/static-files/_static/db2.png?view=aspnetcore-8.0 "Static files list")

## FileExtensionContentTypeProvider

```csharp
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

// Set up custom content types - associating file extension to MIME type
var provider = new FileExtensionContentTypeProvider();
// Add new mappings
provider.Mappings[".myapp"] = "application/x-msdownload";
provider.Mappings[".htm3"] = "text/html";
provider.Mappings[".image"] = "image/png";
// Replace an existing mapping
provider.Mappings[".rtf"] = "application/x-msdownload";
// Remove MP4 videos.
provider.Mappings.Remove(".mp4");

app.UseStaticFiles(new StaticFileOptions
{
    ContentTypeProvider = provider
});

app.UseAuthorization();

app.MapDefaultControllerRoute();
app.MapRazorPages();

app.Run();
```

## Non-standard content types

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles(new StaticFileOptions
{
    ServeUnknownFileTypes = true,
    DefaultContentType = "image/png"
});

app.UseAuthorization();

app.MapDefaultControllerRoute();
app.MapRazorPages();

app.Run();
```

> Warning
Enabling ServeUnknownFileTypes is a security risk. It's disabled by default, and its use is discouraged. FileExtensionContentTypeProvider provides a safer alternative to serving files with non-standard extensions.

## Serve files from multiple locations

```cshtml
@page

<p> Test /MyStaticFiles/image3.png</p>

<img src="~/image3.png" class="img" asp-append-version="true" alt="Test">
```

```csharp
app.UseStaticFiles(); // Serve files from wwwroot
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "MyStaticFiles"))
});
```

 - The ```/MyStaticFiles/image3.png``` file is displayed.

 - The Image Tag Helpers AppendVersion is not applied because the Tag Helpers depend on ```WebRootFileProvider```. ```WebRootFileProvider``` has not been updated to include the ```MyStaticFiles``` folder.

```csharp
var webRootProvider = new PhysicalFileProvider(builder.Environment.WebRootPath);
var newPathProvider = new PhysicalFileProvider(
  Path.Combine(builder.Environment.ContentRootPath, "MyStaticFiles"));

var compositeProvider = new CompositeFileProvider(webRootProvider,
                                                  newPathProvider);

// Update the default provider.
app.Environment.WebRootFileProvider = compositeProvider;

app.UseStaticFiles();
```

> Note
The preceding approach applies to Razor Pages and MVC apps. For guidance that applies to Blazor Web Apps, see ASP.NET Core Blazor static files.

### Security considerations for static files

> Warning
UseDirectoryBrowser and ```UseStaticFiles``` can leak secrets. Disabling directory browsing in production is highly recommended. Carefully review which directories are enabled via ```UseStaticFiles``` or ```UseDirectoryBrowser```. The entire directory and its sub-directories become publicly accessible. Store files suitable for serving to the public in a dedicated directory, such as ```<content_root>/wwwroot```. Separate these files from MVC views, Razor Pages, configuration files, etc.

 - The URLs for content exposed with ```UseDirectoryBrowser``` and ```UseStaticFiles``` are subject to the case sensitivity and character restrictions of the underlying file system. For example, Windows is case insensitive, but macOS and Linux aren't.

 - ASP.NET Core apps hosted in IIS use the ASP.NET Core Module to forward all requests to the app, including static file requests. The IIS static file handler isn't used and has no chance to handle requests.

 - Complete the following steps in IIS Manager to remove the IIS static file handler at the server or website level:

Navigate to the Modules feature.
Select StaticFileModule in the list.
Click Remove in the Actions sidebar.

   - Navigate to the Modules feature.

   - Select StaticFileModule in the list.

   - Click Remove in the Actions sidebar.

> Warning
If the IIS static file handler is enabled and the ASP.NET Core Module is configured incorrectly, static files are served. This happens, for example, if the web.config file isn't deployed.

 - Place code files, including ```.cs``` and ```.cshtml```, outside of the app project's web root. A logical separation is therefore created between the app's client-side content and server-based code. This prevents server-side code from being leaked.

## Serve files outside ```wwwroot``` by updating ```IWebHostEnvironment.WebRootPath```

 - In the development environment, static assets found in both ```wwwroot``` and the updated ```IWebHostEnvironment.WebRootPath``` are served from ```wwwroot```.

 - In any environment other than development, duplicate static assets are served from the updated ```IWebHostEnvironment.WebRootPath``` folder.

 - Containing an ```Index.html``` file in ```wwwroot``` and ```wwwroot-custom```.

 - With the following updated ```Program.cs``` file that sets WebRootPath = "wwwroot-custom":
var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    // Look for static files in "wwwroot-custom"
    WebRootPath = "wwwroot-custom"
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.Run();

```csharp
var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    // Look for static files in "wwwroot-custom"
    WebRootPath = "wwwroot-custom"
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.Run();
```

 - In the development environment return ```wwwroot/Index.html```

 - In any environment other than development return ```wwwroot-custom/Index.html```

 - Delete duplicate named assets in ```wwwroot```.

 - Set "ASPNETCORE_ENVIRONMENT" in ```Properties/launchSettings.json``` to any value other than "Development".

 - Completely disable static web assets by setting <StaticWebAssetsEnabled>false</StaticWebAssetsEnabled> in the project file. WARNING, disabling static web assets disables Razor Class Libraries.

 - Add the following JSON to the project file:
<ItemGroup>
    <Content Remove="wwwroot\**" />
</ItemGroup>

```xml
<ItemGroup>
    <Content Remove="wwwroot\**" />
</ItemGroup>
```

```csharp
var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    // Examine Hosting environment: logging value
    EnvironmentName = Environments.Staging,
    WebRootPath = "wwwroot-custom"
});

var app = builder.Build();

app.Logger.LogInformation("ASPNETCORE_ENVIRONMENT: {env}",
      Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"));

app.Logger.LogInformation("app.Environment.IsDevelopment(): {env}",
      app.Environment.IsDevelopment().ToString());

app.UseDefaultFiles();
app.UseStaticFiles();

app.Run();
```

## Additional resources

 - View or download sample code (how to download)

 - Middleware

 - Introduction to ASP.NET Core

Ref: [Static files in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/static-files?view=aspnetcore-8.0)