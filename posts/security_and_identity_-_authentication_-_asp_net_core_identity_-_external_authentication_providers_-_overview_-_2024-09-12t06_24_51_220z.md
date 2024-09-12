---
title: Security and Identity - Authentication - ASP.NET Core Identity - External authentication providers - Overview
published: true
date: 2024-09-12 06:24:51
tags: Summary, AspNetCore
description:
image:
---

## In this article

This tutorial demonstrates how to build an ASP.NET Core app that enables users to sign in using OAuth 2.0 with credentials from external authentication providers.

In this article, you'll find out how to set up your own social networks.

Enabling users to sign in with their existing credentials:

- Is convenient for the users.

- Shifts many of the complexities of managing the sign-in process onto a third party.

## Create a New ASP.NET Core Project

 - Visual Studio

 - Visual Studio Code / Visual Studio for Mac

  - Select the ASP.NET Core Web App template. Select OK.

  - In the Authentication type input,  select  Individual Accounts.

  - Open the terminal.  For Visual Studio Code you can open the integrated terminal.

  - Change directories (cd) to a folder which will contain the project.

  - For Windows, run the following command:
```dotnetcli
dotnet new webapp -o WebApp1 -au Individual -uld
```

For macOS and Linux, run the following command:

```dotnetcli
dotnet new webapp -o WebApp1 -au Individual
```

    - The ```dotnet new``` command creates a new Razor Pages project in the WebApp1 folder.

    - ```-au Individual``` creates the ```code``` for Individual authentication.

    - ```-uld``` uses LocalDB, a lightweight version of SQL Server Express for Windows. Omit ```-uld``` to use SQLite.

    - The ```code``` command opens the WebApp1 folder in a new instance of Visual Studio Code.

## Apply migrations

- Run the app and select the Register link.

- Enter the email and password for the new account, and then select Register.

- Follow the instructions to apply migrations.

## Forward request information with a proxy or load balancer

If the app is deployed behind a proxy server or load balancer, some of the original request information might be forwarded to the app in request headers. This information usually includes the secure request scheme (https), host, and client IP address. Apps don't automatically read these request headers to discover and use the original request information.

The scheme is used in link generation that affects the authentication flow with external providers. Losing the secure scheme (https) results in the app generating incorrect insecure redirect URLs.

Use Forwarded Headers Middleware to make the original request information available to the app for request processing.

For more information, see Configure ASP.NET Core to work with proxy servers and load balancers.

## Use SecretManager to store tokens assigned by login providers

Social login providers assign Application Id and Application Secret tokens during the registration process. The exact token names vary by provider. These tokens represent the credentials your app uses to access their API. The tokens constitute the "user secrets" that can be linked to your app configuration with the help of Secret Manager. User secrets are a more secure alternative to storing the tokens in a configuration file, such as ```appsettings.json```.

> Important
Secret Manager is for development purposes only. You can store and protect Azure test and production secrets with the Azure Key Vault configuration provider.

Follow the steps in Safe storage of app secrets in development in ASP.NET Core topic to store tokens assigned by each login provider below.

## Setup login providers required by your application

Use the following topics to configure your application to use the respective providers:

- Facebook instructions

- Twitter instructions

- Google instructions

- Microsoft instructions

- Other provider instructions

## Multiple authentication providers

When the app requires multiple providers, chain the provider extension methods from AddAuthentication:

```csharp
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WebApplication16.Data;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

var connectionString = config.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddDefaultIdentity<IdentityUser>(options =>
                                 options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<ApplicationDbContext>();
builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

builder.Services.AddAuthentication()
   .AddGoogle(options =>
   {
       IConfigurationSection googleAuthNSection =
       config.GetSection("Authentication:Google");
       options.ClientId = googleAuthNSection["ClientId"];
       options.ClientSecret = googleAuthNSection["ClientSecret"];
   })
   .AddFacebook(options =>
   {
       IConfigurationSection FBAuthNSection =
       config.GetSection("Authentication:FB");
       options.ClientId = FBAuthNSection["ClientId"];
       options.ClientSecret = FBAuthNSection["ClientSecret"];
   })
   .AddMicrosoftAccount(microsoftOptions =>
   {
       microsoftOptions.ClientId = config["Authentication:Microsoft:ClientId"];
       microsoftOptions.ClientSecret = config["Authentication:Microsoft:ClientSecret"];
   })
   .AddTwitter(twitterOptions =>
   {
       twitterOptions.ConsumerKey = config["Authentication:Twitter:ConsumerAPIKey"];
       twitterOptions.ConsumerSecret = config["Authentication:Twitter:ConsumerSecret"];
       twitterOptions.RetrieveUserDetails = true;
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

app.MapRazorPages();
app.MapDefaultControllerRoute();

app.Run();
```

## Optionally set password

When you register with an external login provider, you don't have a password registered with the app.

To create a password and sign in using your email that you set during the sign in process with external providers:

- Select the Hello <email alias> link at the top-right corner to navigate to the Manage view.

![Web application Manage view!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/social/index/_static/pass1a.png?view=aspnetcore-8.0 "Web application Manage view")

- Select Create

![Set your password page!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/social/index/_static/pass2a.png?view=aspnetcore-8.0 "Set your password page")

- Set a valid password and you can use this to sign in with your email.

## Additional information

- Sign in with Apple Example Integration

- See this GitHub issue for information on how to customize the login buttons.

- Persist additional data about the user and their access and refresh tokens. For more information, see Persist additional claims and tokens from external providers in ASP.NET Core.

Ref: [Facebook, Google, and external provider authentication in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/social/?view=aspnetcore-8.0)