---
title: Security and Identity - Authentication - ASP.NET Core Identity - External authentication providers - Microsoft authentication
published: true
date: 2024-09-12 06:24:56
tags: Summary, AspNetCore
description:
image:
---

## In this article

## Create the app in Microsoft Developer Portal

 - Add the Microsoft.AspNetCore.Authentication.MicrosoftAccount NuGet package to the project.

 - Navigate to the Azure portal - App registrations page and create or sign into a Microsoft account:

 - Select New registration

 - Enter a Name.

 - Select an option for Supported account types.

   - The ```MicrosoftAccount``` package supports App Registrations created using "Accounts in any organizational directory" or "Accounts in any organizational directory and Microsoft accounts" options by default.

   - To use other options, set ```AuthorizationEndpoint``` and ```TokenEndpoint``` members of ```MicrosoftAccountOptions``` used to initialize the Microsoft Account authentication to the URLs displayed on Endpoints page of the App Registration after it is created (available by clicking Endpoints on the Overview page).

 - Under Redirect URI, enter your development URL with ```/signin-microsoft``` appended. For example, ```https://localhost:5001/signin-microsoft```. The Microsoft authentication scheme configured later in this sample will automatically handle requests at ```/signin-microsoft``` route to implement the OAuth flow.

 - Select Register

### Create client secret

 - In the left pane, select Certificates & secrets.

 - Under Client secrets, select New client secret

   - Add a description for the client secret.

   - Select the Add button.

 - Under Client secrets, copy the value of the client secret.

## Store the Microsoft client ID and secret

 - Initialize the project for secret storage per the instructions at Enable secret storage.

 - Store the sensitive settings in the local secret store with the secret keys ```Authentication:Microsoft:ClientId``` and ```Authentication:Microsoft:ClientSecret```:

```dotnetcli
dotnet user-secrets set "Authentication:Microsoft:ClientId" "<client-id>"
dotnet user-secrets set "Authentication:Microsoft:ClientSecret" "<client-secret>"
```

 - Supported by all platforms.

 - Automatically replaced by a colon, :.

## Configure Microsoft Account Authentication

```csharp
var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;
var configuration = builder.Configuration;

services.AddAuthentication().AddMicrosoftAccount(microsoftOptions =>
    {
        microsoftOptions.ClientId = configuration["Authentication:Microsoft:ClientId"];
        microsoftOptions.ClientSecret = configuration["Authentication:Microsoft:ClientSecret"];
    });
```

## Sign in with Microsoft Account

 - Run the app and select Log in. An option to sign in with Microsoft appears.

 - Select to sign in with Microsoft. You are redirected to Microsoft for authentication. After signing in with your Microsoft Account, you will be prompted to let the app access your info:

 - Select Yes. You are redirected back to the web site where you can set your email.

## Multiple authentication providers

```csharp
services.AddAuthentication()
    .AddMicrosoftAccount(microsoftOptions => { ... })
    .AddGoogle(googleOptions => { ... })
    .AddTwitter(twitterOptions => { ... })
    .AddFacebook(facebookOptions => { ... });
```

## Forward request information with a proxy or load balancer

## Troubleshooting

 - If the Microsoft Account provider redirects you to a sign in error page, note the error title and description query string parameters directly following the # (hashtag) in the Uri.
Although the error message seems to indicate a problem with Microsoft authentication, the most common cause is your application Uri not matching any of the Redirect URIs specified for the Web platform.

 - If Identity isn't configured by calling ```services.AddIdentity``` in ```ConfigureServices```, attempting to authenticate will result in ArgumentException: The 'SignInScheme' option must be provided. The project template used in this sample ensures that this is done.

 - If the site database has not been created by applying the initial migration, you will get A database operation failed while processing the request error. Tap Apply Migrations to create the database and refresh to continue past the error.

## Next steps

 - This article showed how you can authenticate with Microsoft. You can follow a similar approach to authenticate with other providers listed on the previous page.

 - Once you publish your web site to Azure web app, create a new client secrets in the Microsoft Developer Portal.

 - Set the ```Authentication:Microsoft:ClientId``` and ```Authentication:Microsoft:ClientSecret``` as application settings in the Azure portal. The configuration system is set up to read keys from environment variables.

Ref: [Microsoft Account external login setup with ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/social/microsoft-logins?view=aspnetcore-8.0)