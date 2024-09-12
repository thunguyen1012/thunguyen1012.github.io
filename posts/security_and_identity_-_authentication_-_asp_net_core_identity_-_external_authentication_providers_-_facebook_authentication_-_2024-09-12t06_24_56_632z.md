---
title: Security and Identity - Authentication - ASP.NET Core Identity - External authentication providers - Facebook authentication
published: true
date: 2024-09-12 06:24:56
tags: Summary, AspNetCore
description:
image:
---

## In this article

This tutorial with code examples shows how to enable your users to sign in with their Facebook account using a sample ASP.NET Core project created on the previous page. We start by creating a Facebook ```App ID``` by following the official steps.

## Create the app in Facebook

- Add the Microsoft.AspNetCore.Authentication.Facebook NuGet package to the project.

- Navigate to the Facebook Developers app page and sign in. If you don't already have a Facebook account, use the Sign up for Facebook link on the login page to create one.  Once you have a Facebook account, follow the instructions to register as a Facebook Developer.

- From the My Apps menu select Create App. The Create an app form appears.

![Facebook for developers portal open in Microsoft Edge!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/social/index/_static/fbmyapps.png?view=aspnetcore-8.0 "Facebook for developers portal open in Microsoft Edge")

- Select an app type that best fits your project. For this project, select Consumer, and then Next. A new ```App ID``` is created.

- Fill out the form and tap the Create App button.

![Create a New App ID form!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/social/index/_static/fbnewappid.png?view=aspnetcore-8.0 "Create a New App ID form")

- On the Add Products to Your App page, select Set Up on the Facebook Login card.

![Product Setup page!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/social/index/_static/fbproductsetup.png?view=aspnetcore-8.0 "Product Setup page")

- The Quickstart wizard launches with Choose a Platform as the first page. Bypass the wizard for now by clicking the FaceBook Login Settings link in the menu on the lower left:

![Skip Quick Start!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/social/index/_static/fbskipquickstart.png?view=aspnetcore-8.0 "Skip Quick Start")

- The Client OAuth Settings page is presented:

![Client OAuth Settings page!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/social/index/_static/fboauthsetup.png?view=aspnetcore-8.0 "Client OAuth Settings page")

- Enter your development URI with /signin-facebook appended into the Valid OAuth Redirect URIs field (for example: ```https://localhost:44320/signin-facebook```). The Facebook authentication configured later in this tutorial will automatically handle requests at /signin-facebook route to implement the OAuth flow.

> Note
The URI /signin-facebook is set as the default callback of the Facebook authentication provider. You can change the default callback URI while configuring the Facebook authentication middleware via the inherited RemoteAuthenticationOptions.CallbackPath property of the FacebookOptions class.

- Select Save Changes.

- Select Settings > Basic link in the left navigation.

- Make a note of your ```App ID``` and your ```App Secret```. You will add both into your ASP.NET Core application in the next section:

- When deploying the site you need to revisit the Facebook Login setup page, and register a new public URI.

## Store the Facebook app ID and secret

Store sensitive settings such as the Facebook app ID and secret values with Secret Manager. For this sample, use the following steps:

- Initialize the project for secret storage per the instructions at Enable secret storage.

- Store the sensitive settings in the local secret store with the secret keys ```Authentication:Facebook:AppId``` and ```Authentication:Facebook:AppSecret```:

```dotnetcli
dotnet user-secrets set "Authentication:Facebook:AppId" "<app-id>"
dotnet user-secrets set "Authentication:Facebook:AppSecret" "<app-secret>"
```

The : separator doesn't work with environment variable hierarchical keys on all platforms. For example, the : separator is not supported by Bash. The double underscore, ```__```, is:

- Supported by all platforms.

- Automatically replaced by a colon, :.

## Configure Facebook Authentication

```csharp
var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;
var configuration = builder.Configuration;

services.AddAuthentication().AddFacebook(facebookOptions =>
    {
        facebookOptions.AppId = configuration["Authentication:Facebook:AppId"];
        facebookOptions.AppSecret = configuration["Authentication:Facebook:AppSecret"];
    });
```

The ```AddAuthentication(IServiceCollection, String)``` overload sets the DefaultScheme property. The ```AddAuthentication(IServiceCollection, Action<AuthenticationOptions>)``` overload allows configuring authentication options, which can be used to set up default authentication schemes for different purposes. Subsequent calls to ```AddAuthentication``` override previously configured AuthenticationOptions properties.

TheBuilder extension methods that register an authentication handler may only be called once per authentication scheme.

## Sign in with Facebook

- Run the app and select Log in.

- Under Use another service to log in., select Facebook.

- You are redirected to Facebook for authentication.

- Enter your Facebook credentials.

- You are redirected back to your site where you can set your email.

You are now logged in using your Facebook credentials:



## React to cancel authorize external sign-in

 ```AccessDeniedPath``` can provide a redirect path to the user agent when the user doesn't approve the requested authorization demand.

The following code sets the ```AccessDeniedPath``` to "/AccessDeniedPathInfo":

```csharp
services.AddAuthentication().AddFacebook(options =>
{
    options.AppId = Configuration["Authentication:Facebook:AppId"];
    options.AppSecret = Configuration["Authentication:Facebook:AppSecret"];
    options.AccessDeniedPath = "/AccessDeniedPathInfo";
});
```

We recommend the ```AccessDeniedPath``` page contains the following information:

- Remote authentication was canceled.

- This app requires authentication.

- To try sign-in again, select the Login link.

### Test ```AccessDeniedPath```

- Navigate to facebook.com

- If you are signed in, you must sign out.

- Run the app and select Facebook sign-in.

- Select Not now. You are redirected to the specified ```AccessDeniedPath``` page.

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

For more information on configuration options supported by Facebook authentication, see the FacebookOptions API reference. Configuration options can be used to:

- Request different information about the user.

- Add query string arguments to customize the login experience.

## Troubleshooting

- ASP.NET Core 2.x only: If Identity isn't configured by calling ```services.AddIdentity``` in ```ConfigureServices```, attempting to authenticate will result in ArgumentException: The 'SignInScheme' option must be provided. The project template used in this tutorial ensures that this is done.

- If the site database has not been created by applying the initial migration, you get A database operation failed while processing the request error. Tap Apply Migrations to create the database and refresh to continue past the error.

## Next steps

- This article showed how you can authenticate with Facebook. You can follow a similar approach to authenticate with other providers listed on the previous page.

- Once you publish your web site to Azure web app, you should reset the ```AppSecret``` in the Facebook developer portal.

- Set the ```Authentication:Facebook:AppId``` and ```Authentication:Facebook:AppSecret``` as application settings in the Azure portal. The configuration system is set up to read keys from environment variables.

Ref: [Facebook external login setup in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/social/facebook-logins?view=aspnetcore-8.0)