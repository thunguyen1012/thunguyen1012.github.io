---
title: Security and Identity - Authentication - ASP.NET Core Identity - External authentication providers - Google authentication
published: true
date: 2024-09-12 06:24:56
tags: Summary, AspNetCore
description:
image:
---

## In this article

This tutorial shows you how to enable users to sign in with their Google account using the ASP.NET Core project created on the previous page.

## Create the Google OAuth 2.0 Client ID and secret

- Follow the guidance in Integrating Google Sign-In into your web app (Google documentation).

- Go to Google API & Services.

- A Project must exist first, you may have to create one. Once a project is selected, enter the Dashboard.

- In the Oauth consent screen of the Dashboard:

  - Select User Type - External and CREATE.

  - In the App information dialog, Provide an app name for the app, user support email, and developer contact information.

  - Step through the Scopes step.

  - Step through the Test users step.

  - Review the OAuth consent screen and go back to the app Dashboard.

- In the Credentials tab of the application Dashboard, select CREATE CREDENTIALS > OAuth client ID.

- Select Application type > Web application, choose a name.

- In the Authorized redirect URIs section, select ADD URI to set the redirect URI. Example redirect URI: ```https://localhost:{PORT}/signin-google```, where the {PORT} placeholder is the app's port.

- Select the CREATE button.

- Save the Client ID and Client Secret for use in the app's configuration.

- When deploying the site, either:

  - Update the app's redirect URI in the Google Console to the app's deployed redirect URI.

  - Create a new Google API registration in the Google Console for the production app with its production redirect URI.

## Store the Google client ID and secret

Store sensitive settings such as the Google client ID and secret values with Secret Manager. For this sample, use the following steps:

- Initialize the project for secret storage per the instructions at Enable secret storage.

- Store the sensitive settings in the local secret store with the secret keys ```Authentication:Google:ClientId``` and ```Authentication:Google:ClientSecret```:

```dotnetcli
dotnet user-secrets set "Authentication:Google:ClientId" "<client-id>"
dotnet user-secrets set "Authentication:Google:ClientSecret" "<client-secret>"
```

The : separator doesn't work with environment variable hierarchical keys on all platforms. For example, the : separator is not supported by Bash. The double underscore, ```__```, is:

- Supported by all platforms.

- Automatically replaced by a colon, :.

You can manage your API credentials and usage in the API Console.

## Configure Google authentication

Add the ```Microsoft.AspNetCore.Authentication.Google``` NuGet package to the app.

```csharp
var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;
var configuration = builder.Configuration;

services.AddAuthentication().AddGoogle(googleOptions =>
    {
        googleOptions.ClientId = configuration["Authentication:Google:ClientId"];
        googleOptions.ClientSecret = configuration["Authentication:Google:ClientSecret"];
    });
```

The call to AddIdentity configures the default scheme settings. The ```AddAuthentication(IServiceCollection, String)``` overload sets the DefaultScheme property. The ```AddAuthentication(IServiceCollection, Action<AuthenticationOptions>)``` overload allows configuring authentication options, which can be used to set up default authentication schemes for different purposes. Subsequent calls to ```AddAuthentication``` override previously configured AuthenticationOptions properties.

TheBuilder extension methods that register an authentication handler may only be called once per authentication scheme.

## Sign in with Google

- Run the app and select Log in. An option to sign in with Google appears.

- Select the Google button, which redirects to Google for authentication.

- After entering your Google credentials, you are redirected back to the web site.

## Forward request information with a proxy or load balancer

If the app is deployed behind a proxy server or load balancer, some of the original request information might be forwarded to the app in request headers. This information usually includes the secure request scheme (https), host, and client IP address. Apps don't automatically read these request headers to discover and use the original request information.

The scheme is used in link generation that affects the authentication flow with external providers. Losing the secure scheme (https) results in the app generating incorrect insecure redirect URLs.

Use Forwarded Headers Middleware to make the original request information available to the app for request processing.

For more information, see Configure ASP.NET Core to work with proxy servers and load balancers.

## Multiple authentication providers

When the app requires multiple providers, chain the provider extension methods behind ```AddAuthentication```:

```csharp
services.AddAuthentication()
    .AddMicrosoftAccount(microsoftOptions => { ... })
    .AddGoogle(googleOptions => { ... })
    .AddTwitter(twitterOptions => { ... })
    .AddFacebook(facebookOptions => { ... });
```

For more information on configuration options supported by Google authentication, see the GoogleOptions API reference . This can be used to request different information about the user.

## Change the default callback URI

The URI segment ```/signin-google``` is set as the default callback of the Google authentication provider. You can change the default callback URI while configuring the Google authentication middleware via the inherited RemoteAuthenticationOptions.CallbackPath property of the GoogleOptions class.

## Troubleshooting

- If the sign-in doesn't work and you aren't getting any errors, switch to development mode to make the issue easier to debug.

- If Identity isn't configured by calling ```services.AddIdentity``` in ```ConfigureServices```, attempting to authenticate results in ArgumentException: The 'SignInScheme' option must be provided. The project template used in this tutorial ensures Identity is configured.

- If the site database has not been created by applying the initial migration, you get A database operation failed while processing the request error. Select Apply Migrations to create the database, and refresh the page to continue past the error.

- HTTP 500 error after successfully authenticating the request by the OAuth 2.0 provider such as Google: See this GitHub issue.

- How to implement external authentication with Google for React and other SPA apps: See this GitHub issue.

## Next steps

- This article showed how you can authenticate with Google. You can follow a similar approach to authenticate with other providers listed on the previous page.

- Once you publish the app to Azure, reset the ```ClientSecret``` in the Google API Console.

- Set the ```Authentication:Google:ClientId``` and ```Authentication:Google:ClientSecret``` as application settings in the Azure portal. The configuration system is set up to read keys from environment variables.

Ref: [Google external login setup in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/social/google-logins?view=aspnetcore-8.0)