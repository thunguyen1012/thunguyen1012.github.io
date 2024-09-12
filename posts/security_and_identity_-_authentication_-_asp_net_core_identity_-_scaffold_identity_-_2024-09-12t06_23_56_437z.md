---
title: Security and Identity - Authentication - ASP.NET Core Identity - Scaffold Identity
published: true
date: 2024-09-12 06:23:56
tags: Summary, AspNetCore
description:
image:
---

## In this article

## Blazor Identity scaffolding

## Razor Pages and MVC Identity scaffolding

## Scaffold Identity into a Blazor project

  - Visual Studio

  - .NET CLI

   - From Solution Explorer, right-click on the project > Add > New Scaffolded Item.

   - From the left pane of the Add New Scaffolded Item dialog, select Identity. Select Blazor Identity in the center pane. Select the Add button.

   - In the Add Blazor Identity dialog:

     - Select or add with the plus (+) button the database context class (DbContext class).

     - Select the database provider (Database provider), which defaults to SQL Server.

     - Select or add with the plus (+) button the user class (User class).

     - Select the Add button.

   - SQLServer: ```Microsoft.EntityFrameworkCore.SqlServer```

   - SQLite: ```Microsoft.EntityFrameworkCore.Sqlite```

   - Cosmos: ```Microsoft.EntityFrameworkCore.Cosmos```

   - Postgres: ```Npgsql.EntityFrameworkCore.PostgreSQL```

```dotnetcli
dotnet tool install --global dotnet-aspnet-codegenerator
dotnet tool install --global dotnet-ef
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.VisualStudio.Web.CodeGeneration.Design
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
```

> Important
After the first five commands execute, make sure that you press Enter on the keyboard to execute the last command.

   - Command-line interface (CLI) tools for EF Core

   - ```aspnet-codegenerator``` scaffolding tool

   - Design time tools for EF Core

   - The SQLite and SQL Server providers with the EF Core package as a dependency

   - ```Microsoft.VisualStudio.Web.CodeGeneration.Design``` for scaffolding

```dotnetcli
dotnet aspnet-codegenerator identity -h
```

```dotnetcli
dotnet aspnet-codegenerator identity --useDefaultUI
```

  - Visual Studio

  - .NET CLI

```dotnetcli
dotnet ef migrations add {MIGRATION NAME}
```

```dotnetcli
dotnet ef migrations add CreateIdentitySchema
```

```dotnetcli
dotnet ef database update
```

## Client-side Blazor apps (Standalone Blazor WebAssembly)

## Scaffold Identity into a Razor project without existing authorization

> Note
For guidance on adding packages to .NET apps, see the articles under Install and manage packages at Package consumption workflow (NuGet documentation). Confirm correct package versions at NuGet.org.

  - Visual Studio

  - .NET CLI

   - From Solution Explorer, right-click on the project > Add > New Scaffolded Item.

   - From the left pane of the Add New Scaffolded Item dialog, select Identity. Select Identity in the center pane. Select the Add button.

   - In the Add Identity dialog, select the options you want.

     - If you have an existing, customized layout page for Identity (_Layout.cshtml), select your existing layout page to avoid overwriting your layout with incorrect markup by the scaffolder. For example, select either:

       - ```Pages/Shared/_Layout.cshtml``` for Razor Pages or Blazor Server projects with existing Razor Pages infrastructure.

       - ```Views/Shared/_Layout.cshtml``` for MVC projects or Blazor Server projects with existing MVC infrastructure.

     - For the data context (DbContext class):

       - Select your data context class. You must select at least one file to add your data context.

       - To create a data context and possibly create a new user class for Identity, select the + button. Accept the default value or specify a class (for example, ```Contoso.Data.ApplicationDbContext``` for a company named "Contoso"). To create a new user class, select the + button for User class and specify the class (for example, ```ContosoUser``` for a company named "Contoso").

     - Select the Add button to run the scaffolder.

```dotnetcli
dotnet tool install -g dotnet-aspnet-codegenerator
```

> Note
By default the architecture of the .NET binaries to install represents the currently running OS architecture. To specify a different OS architecture, see dotnet tool install, --arch option.
For more information, see GitHub issue dotnet/AspNetCore.Docs #29262.

```dotnetcli
dotnet add package Microsoft.VisualStudio.Web.CodeGeneration.Design
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
dotnet add package Microsoft.AspNetCore.Identity.UI
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
```

```dotnetcli
dotnet aspnet-codegenerator identity -h
```

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>netcoreapp3.1</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Diagnostics.EntityFrameworkCore" Version="3.1.0" />
    <PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="3.1.0" />
    <PackageReference Include="Microsoft.AspNetCore.Identity.UI" Version="3.1.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="3.1.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="3.1.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="3.1.0" />
    <PackageReference Include="Microsoft.VisualStudio.Web.CodeGeneration.Design" Version="3.1.0" />
  </ItemGroup>

</Project>
```

```dotnetcli
dotnet aspnet-codegenerator identity --useDefaultUI
```

### Migrations, UseAuthentication, and layout

  - Visual Studio

  - .NET CLI

```dotnetcli
dotnet ef migrations add CreateIdentitySchema
dotnet ef database update
```

  - Visual Studio

  - .NET CLI

```dotnetcli
dotnet ef database update
```

  - Visual Studio

  - .NET CLI

```powershell
Get-Migration
```

```dotnetcli
dotnet ef migrations list
```

### Layout changes

```cshtml
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@ViewData["Title"] - WebRPnoAuth2Auth</title>
    <link rel="stylesheet" href="~/lib/bootstrap/dist/css/bootstrap.css" />
    <link rel="stylesheet" href="~/css/site.css" asp-append-version="true" />
    <link rel="stylesheet" href="~/WebRPnoAuth2Auth.styles.css" asp-append-version="true" />
</head>
<body>
    <header>
        <nav class="navbar navbar-expand-sm navbar-toggleable-sm navbar-light bg-white border-bottom box-shadow mb-3">
            <div class="container">
                <a class="navbar-brand" asp-area="" asp-page="/Index">WebRPnoAuth2Auth</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target=".navbar-collapse" aria-controls="navbarSupportedContent"
                        aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="navbar-collapse collapse d-sm-inline-flex justify-content-between">
                    <ul class="navbar-nav flex-grow-1">
                        <li class="nav-item">
                            <a class="nav-link text-dark" asp-area="" asp-page="/Index">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-dark" asp-area="" asp-page="/Privacy">Privacy</a>
                        </li>
                    </ul>
                    <partial name="_LoginPartial" />
                </div>
            </div>
        </nav>
    </header>
    <div class="container">
        <main role="main" class="pb-3">
            @RenderBody()
        </main>
    </div>

    <footer class="border-top footer text-muted">
        <div class="container">
            &copy; 2021 - WebRPnoAuth2Auth - <a asp-area="" asp-page="/Privacy">Privacy</a>
        </div>
    </footer>

    <script src="~/lib/jquery/dist/jquery.js"></script>
    <script src="~/lib/bootstrap/dist/js/bootstrap.bundle.js"></script>
    <script src="~/js/site.js" asp-append-version="true"></script>

    @await RenderSectionAsync("Scripts", required: false)
</body>
</html>
```

## Scaffold Identity into a Razor project with authorization

> Note
For guidance on adding packages to .NET apps, see the articles under Install and manage packages at Package consumption workflow (NuGet documentation). Confirm correct package versions at NuGet.org.

  - Visual Studio

  - .NET CLI

   - From Solution Explorer, right-click on the project > Add > New Scaffolded Item.

   - From the left pane of the Add New Scaffolded Item dialog, select Identity. Select Identity in the center pane. Select the Add button.

   - In the Add Identity dialog, select the options you want.

     - If you have an existing, customized layout page for Identity (_Layout.cshtml), select your existing layout page to avoid overwriting your layout with incorrect markup by the scaffolder. For example, select either:

       - ```Pages/Shared/_Layout.cshtml``` for Razor Pages or Blazor Server projects with existing Razor Pages infrastructure.

       - ```Views/Shared/_Layout.cshtml``` for MVC projects or Blazor Server projects with existing MVC infrastructure.

     - For the data context (DbContext class):

       - Select your data context class. You must select at least one file to add your data context.

       - To create a data context and possibly create a new user class for Identity, select the + button. Accept the default value or specify a class (for example, ```Contoso.Data.ApplicationDbContext``` for a company named "Contoso"). To create a new user class, select the + button for User class and specify the class (for example, ```ContosoUser``` for a company named "Contoso").

     - Select the Add button to run the scaffolder.

```dotnetcli
dotnet tool install -g dotnet-aspnet-codegenerator
```

> Note
By default the architecture of the .NET binaries to install represents the currently running OS architecture. To specify a different OS architecture, see dotnet tool install, --arch option.
For more information, see GitHub issue dotnet/AspNetCore.Docs #29262.

```dotnetcli
dotnet add package Microsoft.VisualStudio.Web.CodeGeneration.Design
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
dotnet add package Microsoft.AspNetCore.Identity.UI
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
```

```dotnetcli
dotnet aspnet-codegenerator identity -h
```

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>netcoreapp3.1</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Diagnostics.EntityFrameworkCore" Version="3.1.0" />
    <PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="3.1.0" />
    <PackageReference Include="Microsoft.AspNetCore.Identity.UI" Version="3.1.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="3.1.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="3.1.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="3.1.0" />
    <PackageReference Include="Microsoft.VisualStudio.Web.CodeGeneration.Design" Version="3.1.0" />
  </ItemGroup>

</Project>
```

```dotnetcli
dotnet aspnet-codegenerator identity -dc MyApplication.Data.ApplicationDbContext --files "Account.Register;Account.Login"
```

> Note
PowerShell uses semicolon as a command separator. When using PowerShell, escape the semicolons in the file list or put the file list in double quotes. For example:

```dotnetcli
dotnet aspnet-codegenerator identity -dc MyApplication.Data.ApplicationDbContext --files "Account.Register;Account.Login;Account.Logout"
```

## Scaffold Identity into an MVC project without existing authorization

> Note
For guidance on adding packages to .NET apps, see the articles under Install and manage packages at Package consumption workflow (NuGet documentation). Confirm correct package versions at NuGet.org.

  - Visual Studio

  - .NET CLI

   - From Solution Explorer, right-click on the project > Add > New Scaffolded Item.

   - From the left pane of the Add New Scaffolded Item dialog, select Identity. Select Identity in the center pane. Select the Add button.

   - In the Add Identity dialog, select the options you want.

     - If you have an existing, customized layout page for Identity (_Layout.cshtml), select your existing layout page to avoid overwriting your layout with incorrect markup by the scaffolder. For example, select either:

       - ```Pages/Shared/_Layout.cshtml``` for Razor Pages or Blazor Server projects with existing Razor Pages infrastructure.

       - ```Views/Shared/_Layout.cshtml``` for MVC projects or Blazor Server projects with existing MVC infrastructure.

     - For the data context (DbContext class):

       - Select your data context class. You must select at least one file to add your data context.

       - To create a data context and possibly create a new user class for Identity, select the + button. Accept the default value or specify a class (for example, ```Contoso.Data.ApplicationDbContext``` for a company named "Contoso"). To create a new user class, select the + button for User class and specify the class (for example, ```ContosoUser``` for a company named "Contoso").

     - Select the Add button to run the scaffolder.

```dotnetcli
dotnet tool install -g dotnet-aspnet-codegenerator
```

> Note
By default the architecture of the .NET binaries to install represents the currently running OS architecture. To specify a different OS architecture, see dotnet tool install, --arch option.
For more information, see GitHub issue dotnet/AspNetCore.Docs #29262.

```dotnetcli
dotnet add package Microsoft.VisualStudio.Web.CodeGeneration.Design
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
dotnet add package Microsoft.AspNetCore.Identity.UI
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
```

```dotnetcli
dotnet aspnet-codegenerator identity -h
```

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>netcoreapp3.1</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Diagnostics.EntityFrameworkCore" Version="3.1.0" />
    <PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="3.1.0" />
    <PackageReference Include="Microsoft.AspNetCore.Identity.UI" Version="3.1.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="3.1.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="3.1.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="3.1.0" />
    <PackageReference Include="Microsoft.VisualStudio.Web.CodeGeneration.Design" Version="3.1.0" />
  </ItemGroup>

</Project>
```

```dotnetcli
dotnet aspnet-codegenerator identity --useDefaultUI
```

```cshtml
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@ViewData["Title"] - WebRPnoAuth2Auth</title>
    <link rel="stylesheet" href="~/lib/bootstrap/dist/css/bootstrap.css" />
    <link rel="stylesheet" href="~/css/site.css" asp-append-version="true" />
    <link rel="stylesheet" href="~/WebRPnoAuth2Auth.styles.css" asp-append-version="true" />
</head>
<body>
    <header>
        <nav class="navbar navbar-expand-sm navbar-toggleable-sm navbar-light bg-white border-bottom box-shadow mb-3">
            <div class="container">
                <a class="navbar-brand" asp-area="" asp-page="/Index">WebRPnoAuth2Auth</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target=".navbar-collapse" aria-controls="navbarSupportedContent"
                        aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="navbar-collapse collapse d-sm-inline-flex justify-content-between">
                    <ul class="navbar-nav flex-grow-1">
                        <li class="nav-item">
                            <a class="nav-link text-dark" asp-area="" asp-page="/Index">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-dark" asp-area="" asp-page="/Privacy">Privacy</a>
                        </li>
                    </ul>
                    <partial name="_LoginPartial" />
                </div>
            </div>
        </nav>
    </header>
    <div class="container">
        <main role="main" class="pb-3">
            @RenderBody()
        </main>
    </div>

    <footer class="border-top footer text-muted">
        <div class="container">
            &copy; 2021 - WebRPnoAuth2Auth - <a asp-area="" asp-page="/Privacy">Privacy</a>
        </div>
    </footer>

    <script src="~/lib/jquery/dist/jquery.js"></script>
    <script src="~/lib/bootstrap/dist/js/bootstrap.bundle.js"></script>
    <script src="~/js/site.js" asp-append-version="true"></script>

    @await RenderSectionAsync("Scripts", required: false)
</body>
</html>
```

  - Visual Studio

  - .NET CLI

```dotnetcli
dotnet ef migrations add CreateIdentitySchema
dotnet ef database update
```

  - Visual Studio

  - .NET CLI

```dotnetcli
dotnet ef database update
```

  - Visual Studio

  - .NET CLI

```powershell
Get-Migration
```

```dotnetcli
dotnet ef migrations list
```

```csharp
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WebMVCauth.Data;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<ApplicationDbContext>();
builder.Services.AddControllersWithViews();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");
app.MapRazorPages();

app.Run();
```

## Scaffold Identity into an MVC project with authorization

> Note
For guidance on adding packages to .NET apps, see the articles under Install and manage packages at Package consumption workflow (NuGet documentation). Confirm correct package versions at NuGet.org.

  - Visual Studio

  - .NET CLI

   - From Solution Explorer, right-click on the project > Add > New Scaffolded Item.

   - From the left pane of the Add New Scaffolded Item dialog, select Identity. Select Identity in the center pane. Select the Add button.

   - In the Add Identity dialog, select the options you want.

     - If you have an existing, customized layout page for Identity (_Layout.cshtml), select your existing layout page to avoid overwriting your layout with incorrect markup by the scaffolder. For example, select either:

       - ```Pages/Shared/_Layout.cshtml``` for Razor Pages or Blazor Server projects with existing Razor Pages infrastructure.

       - ```Views/Shared/_Layout.cshtml``` for MVC projects or Blazor Server projects with existing MVC infrastructure.

     - For the data context (DbContext class):

       - Select your data context class. You must select at least one file to add your data context.

       - To create a data context and possibly create a new user class for Identity, select the + button. Accept the default value or specify a class (for example, ```Contoso.Data.ApplicationDbContext``` for a company named "Contoso"). To create a new user class, select the + button for User class and specify the class (for example, ```ContosoUser``` for a company named "Contoso").

     - Select the Add button to run the scaffolder.

```dotnetcli
dotnet tool install -g dotnet-aspnet-codegenerator
```

> Note
By default the architecture of the .NET binaries to install represents the currently running OS architecture. To specify a different OS architecture, see dotnet tool install, --arch option.
For more information, see GitHub issue dotnet/AspNetCore.Docs #29262.

```dotnetcli
dotnet add package Microsoft.VisualStudio.Web.CodeGeneration.Design
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
dotnet add package Microsoft.AspNetCore.Identity.UI
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
```

```dotnetcli
dotnet aspnet-codegenerator identity -h
```

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>netcoreapp3.1</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Diagnostics.EntityFrameworkCore" Version="3.1.0" />
    <PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="3.1.0" />
    <PackageReference Include="Microsoft.AspNetCore.Identity.UI" Version="3.1.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="3.1.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="3.1.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="3.1.0" />
    <PackageReference Include="Microsoft.VisualStudio.Web.CodeGeneration.Design" Version="3.1.0" />
  </ItemGroup>

</Project>
```

```dotnetcli
dotnet aspnet-codegenerator identity -dc MyApplication.Data.ApplicationDbContext --files "Account.Register;Account.Login"
```

> Note
PowerShell uses semicolon as a command separator. When using PowerShell, escape the semicolons in the file list or put the file list in double quotes. For example:

```dotnetcli
dotnet aspnet-codegenerator identity -dc MyApplication.Data.ApplicationDbContext --files "Account.Register;Account.Login;Account.Logout"
```

## Create full Identity UI source

## ```Password``` configuration

 - ```Areas/Identity/Pages/Account/Register.cshtml.cs```

 - ```Areas/Identity/Pages/Account/ResetPassword.cshtml.cs```

## Disable a page

 - Scaffold Identity. Include Account.Register, Account.Login, and Account.RegisterConfirmation. For example:

```dotnetcli
dotnet aspnet-codegenerator identity -dc RPauth.Data.ApplicationDbContext --files "Account.Register;Account.Login;Account.RegisterConfirmation"
```

 - Update ```Areas/Identity/Pages/Account/Register.cshtml.cs``` so users can't register from this endpoint:

```csharp
public class RegisterModel : PageModel
{
    public IActionResult OnGet()
    {
        return RedirectToPage("Login");
    }

    public IActionResult OnPost()
    {
        return RedirectToPage("Login");
    }
}
```

 - Update ```Areas/Identity/Pages/Account/Register.cshtml``` to be consistent with the preceding changes:

```cshtml
@page
@model RegisterModel
@{
    ViewData["Title"] = "Go to Login";
}

<h1>@ViewData["Title"]</h1>

<li class="nav-item">
    <a class="nav-link text-dark" asp-area="Identity" asp-page="/Account/Login">Login</a>
</li>
```

 - Comment out or remove the registration link from ```Areas/Identity/Pages/Account/Login.cshtml```

```cshtml
@*
<p>
    <a asp-page="./Register" asp-route-returnUrl="@Model.ReturnUrl">Register as a new user</a>
</p>
*@
```

 - Update the ```Areas/Identity/Pages/Account/RegisterConfirmation``` page.

```csharp
[AllowAnonymous]
  public class RegisterConfirmationModel : PageModel
  {
      public IActionResult OnGet()
      {  
          return Page();
      }
  }
```

### Use another app to add users

 - A dedicated admin web app.

 - A console app.

 - A list of users is read into memory.

 - A strong unique password is generated for each user.

 - The user is added to the Identity database.

 - The user is notified and told to change the password.

```csharp
public class Program
{
    public static void Main(string[] args)
    {
        var host = CreateHostBuilder(args).Build();

        using (var scope = host.Services.CreateScope())
        {
            var services = scope.ServiceProvider;

            try
            {
                var context = services.GetRequiredService<AppDbCntx>();
                context.Database.Migrate();

                var config = host.Services.GetRequiredService<IConfiguration>();
                var userList = config.GetSection("userList").Get<List<string>>();

                SeedData.Initialize(services, userList).Wait();
            }
            catch (Exception ex)
            {
                var logger = services.GetRequiredService<ILogger<Program>>();
                logger.LogError(ex, "An error occurred adding users.");
            }
        }

        host.Run();
    }

    public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.UseStartup<Startup>();
            });
}
```

```csharp
public static async Task Initialize(IServiceProvider serviceProvider,
                                    List<string> userList)
{
    var userManager = serviceProvider.GetService<UserManager<IdentityUser>>();

    foreach (var userName in userList)
    {
        var userPassword = GenerateSecurePassword();
        var userId = await EnsureUser(userManager, userName, userPassword);

        NotifyUser(userName, userPassword);
    }
}

private static async Task<string> EnsureUser(UserManager<IdentityUser> userManager,
                                             string userName, string userPassword)
{
    var user = await userManager.FindByNameAsync(userName);

    if (user == null)
    {
        user = new IdentityUser(userName)
        {
            EmailConfirmed = true
        };
        await userManager.CreateAsync(user, userPassword);
    }

    return user.Id;
}
```

## Prevent publish of static Identity assets

Ref: [Scaffold Identity in ASP.NET Core projects](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/scaffold-identity?view=aspnetcore-8.0)