---
title: Security and Identity - Authentication - ASP.NET Core Identity - External authentication providers - Twitter authentication
published: true
date: 2024-09-12 06:24:57
tags: Summary, AspNetCore
description:
image:
---

## In this article

This sample shows how to enable users to sign in with their Twitter account using a sample ASP.NET Core project created on the previous page.

> Note
The Microsoft.AspNetCore.Authentication.Twitter package described below uses the OAuth 1.0 APIs provided by Twitter. Twitter has since added OAuth 2.0 APIs with a different set of functionality. The OpenIddict and AspNet.Security.OAuth.Twitter packages are community implementations that use the new OAuth 2.0 APIs.

## Create the app in Twitter

- Add the Microsoft.AspNetCore.Authentication.Twitter NuGet package to the project.

- Navigate to twitter developer portal Dashboard and sign in. If you don't already have a Twitter account, use the Sign up now link to create one.

- If you don't have a project, create one.

- Select + Add app. Fill out the App name then record the generated API Key, API Key Secret and Bearer Token. These will be needed
later.

- In the App Settings page, select Edit in the Authentication settings section, then:


Note
Microsoft.AspNetCore.Identity requires users to have an email address by default. For Callback URLs during development, use ```https://localhost:{PORT}/signin-twitter```, where the {PORT} placeholder is the app's port.


Note
The URI segment ```/signin-twitter``` is set as the default callback of the Twitter authentication provider. You can change the default callback URI while configuring the Twitter authentication middleware via the inherited RemoteAuthenticationOptions.CallbackPath property of the TwitterOptions class.

  - Enable 3-legged OAuth

  - Request email address from users

  - Fill out the required fields and select Save

> Note
Microsoft.AspNetCore.Identity requires users to have an email address by default. For Callback URLs during development, use ```https://localhost:{PORT}/signin-twitter```, where the {PORT} placeholder is the app's port.

> Note
The URI segment ```/signin-twitter``` is set as the default callback of the Twitter authentication provider. You can change the default callback URI while configuring the Twitter authentication middleware via the inherited RemoteAuthenticationOptions.CallbackPath property of the TwitterOptions class.

## Store the Twitter consumer API key and secret

Store sensitive settings such as the Twitter consumer API key and secret with Secret Manager. For this sample, use the following steps:

- Initialize the project for secret storage per the instructions at Enable secret storage.

- Store the sensitive settings in the local secret store with the secrets keys ```Authentication:Twitter:ConsumerKey``` and ```Authentication:Twitter:ConsumerSecret```:

```dotnetcli
dotnet user-secrets set "Authentication:Twitter:ConsumerAPIKey" "<consumer-api-key>"
dotnet user-secrets set "Authentication:Twitter:ConsumerSecret" "<consumer-secret>"
```

The : separator doesn't work with environment variable hierarchical keys on all platforms. For example, the : separator is not supported by Bash. The double underscore, ```__```, is:

- Supported by all platforms.

- Automatically replaced by a colon, :.

These tokens can be found on the Keys and Access Tokens tab after creating a new Twitter application:

## Configure Twitter Authentication

```csharp
var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;
var configuration = builder.Configuration;

services.AddAuthentication().AddTwitter(twitterOptions =>
    {
        twitterOptions.ConsumerKey = configuration["Authentication:Twitter:ConsumerAPIKey"];
        twitterOptions.ConsumerSecret = configuration["Authentication:Twitter:ConsumerSecret"];
    });
```

The ```AddAuthentication(IServiceCollection, String)``` overload sets the DefaultScheme property. The ```AddAuthentication(IServiceCollection, Action<AuthenticationOptions>)``` overload allows configuring authentication options, which can be used to set up default authentication schemes for different purposes. Subsequent calls to ```AddAuthentication``` override previously configured AuthenticationOptions properties.

TheBuilder extension methods that register an authentication handler may only be called once per authentication scheme.

## Multiple authentication providers

When the app requires multiple providers, chain the provider extension methods behind ```AddAuthentication```:

```csharp
services.AddAuthentication()
    .AddMicrosoftAccount(microsoftOptions => { ... })
    .AddGoogle(googleOptions => { ... })
    .AddTwitter(twitterOptions => { ... })
    .AddFacebook(facebookOptions => { ... });
```

For more information on configuration options supported by Twitter authentication, see the TwitterOptions API reference. This can be used to request different information about the user.

## Sign in with Twitter

Run the app and select Log in. An option to sign in with Twitter appears:

Selecting Twitter redirects to Twitter for authentication:

After entering your Twitter credentials, you are redirected back to the web site where you can set your email.

You are now logged in using your Twitter credentials:

## Forward request information with a proxy or load balancer

If the app is deployed behind a proxy server or load balancer, some of the original request information might be forwarded to the app in request headers. This information usually includes the secure request scheme (https), host, and client IP address. Apps don't automatically read these request headers to discover and use the original request information.

The scheme is used in link generation that affects the authentication flow with external providers. Losing the secure scheme (https) results in the app generating incorrect insecure redirect URLs.

Use Forwarded Headers Middleware to make the original request information available to the app for request processing.

For more information, see Configure ASP.NET Core to work with proxy servers and load balancers.

## Troubleshooting

- ASP.NET Core 2.x only: If Identity isn't configured by calling ```services.AddIdentity``` in ```ConfigureServices```, attempting to authenticate will result in ArgumentException: The 'SignInScheme' option must be provided. The project template used in this sample ensures Identity is configured.

- If the site database has not been created by applying the initial migration, you will get A database operation failed while processing the request error. Tap Apply Migrations to create the database and refresh to continue past the error.

## Next steps

- This article showed how you can authenticate with Twitter. You can follow a similar approach to authenticate with other providers listed on the previous page.

- Once you publish your web site to Azure web app, you should reset the ```ConsumerSecret``` in the Twitter developer portal.

- Set the ```Authentication:Twitter:ConsumerKey``` and ```Authentication:Twitter:ConsumerSecret``` as application settings in the Azure portal. The configuration system is set up to read keys from environment variables.

Ref: [Twitter external sign-in setup with ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/social/twitter-logins?view=aspnetcore-8.0)