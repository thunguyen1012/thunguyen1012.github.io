---
title: Security and Identity - Authentication - Configure WS-Federation authentication
published: true
date: 2024-09-12 07:18:09
tags: Summary, AspNetCore
description: This tutorial demonstrates how to enable users to sign in with a WS-Federation authentication provider like Active Directory Federation Services (ADFS) or Microsoft Entra ID. It uses the ASP.NET Core sample app described in Facebook, Google, and external provider authentication.
image:
---

## In this article

This tutorial shows how to enable users to sign in with a WS-Federation authentication provider like Active Directory Federation Services (ADFS) or Microsoft Entra ID.

Web Services-Federation (WS-Federation) is a component of Microsoft's Windows Server operating system.

By default, the new middleware:

- Doesn't allow unsolicited logins. This feature of the WS-Federation protocol is vulnerable to XSRF attacks. However, it can be enabled with the ```AllowUnsolicitedLogins``` option.

- Doesn't check every form post for sign-in messages. Only requests to the ```CallbackPath``` are checked for sign-ins. ```CallbackPath``` defaults to ```/signin-wsfed``` but can be changed via the inherited RemoteAuthenticationOptions.CallbackPath property of the WsFederationOptions class. This path can be shared with other authentication providers by enabling the SkipUnrecognizedRequests option.

## Register the app with Active Directory

### Active Directory Federation Services

- Open the server's Add Relying Party Trust Wizard from the ADFS Management console:



![Add Relying Party Trust Wizard: Welcome!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/ws-federation/_static/adfsaddtrust.png?view=aspnetcore-8.0 "Add Relying Party Trust Wizard: Welcome")

- Choose to enter data manually:



![Add Relying Party Trust Wizard: Select Data Source!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/ws-federation/_static/adfsselectdatasource.png?view=aspnetcore-8.0 "Add Relying Party Trust Wizard: Select Data Source")

- Enter a display name for the relying party. The name isn't important to the ASP.NET Core app.

- Microsoft.AspNetCore.Authentication.WsFederation lacks support for token encryption, so don't configure a token encryption certificate:



![Add Relying Party Trust Wizard: Configure Certificate!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/ws-federation/_static/adfsconfigurecert.png?view=aspnetcore-8.0 "Add Relying Party Trust Wizard: Configure Certificate")

- Enable support for WS-Federation Passive protocol, using the app's URL. Verify the port is correct for the app:



![Add Relying Party Trust Wizard: Configure URL!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/ws-federation/_static/adfsconfigureurl.png?view=aspnetcore-8.0 "Add Relying Party Trust Wizard: Configure URL")

> Note
This must be an HTTPS URL. IIS Express can provide a self-signed certificate when hosting the app during development. Kestrel requires manual certificate configuration. See the Kestrel documentation for more details.

- Click Next through the rest of the wizard and Close at the end.

- ASP.NET Core Identity requires a Name ID claim. Add one from the Edit Claim Rules dialog:



![Edit Claim Rules!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/ws-federation/_static/editclaimrules.png?view=aspnetcore-8.0 "Edit Claim Rules")

- In the Add Transform Claim Rule Wizard, leave the default Send LDAP Attributes as Claims template selected, and click Next. Add a rule mapping the SAM-Account-Name LDAP attribute to the Name ID outgoing claim:



![Add Transform Claim Rule Wizard: Configure Claim Rule!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/ws-federation/_static/addtransformclaimrule.png?view=aspnetcore-8.0 "Add Transform Claim Rule Wizard: Configure Claim Rule")

- Click Finish > OK in the Edit Claim Rules window.

### Microsoft Entra ID

- Navigate to the Microsoft Entra ID tenant's app registrations blade. Click New application registration:



![Microsoft Entra ID: App registrations!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/ws-federation/_static/aadnewappregistration.png?view=aspnetcore-8.0 "Microsoft Entra ID: App registrations")

- Enter a name for the app registration. This isn't important to the ASP.NET Core app.

- Enter the URL the app listens on as the Sign-on URL:



![Microsoft Entra ID: Create app registration!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/ws-federation/_static/aadcreateappregistration.png?view=aspnetcore-8.0 "Microsoft Entra ID: Create app registration")

- Click Endpoints and note the Federation Metadata Document URL. This is the WS-Federation middleware's ```MetadataAddress```:



![Microsoft Entra ID: Endpoints!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/ws-federation/_static/aadfederationmetadatadocument.png?view=aspnetcore-8.0 "Microsoft Entra ID: Endpoints")

- Navigate to the new app registration. Click Expose an API. Click Application ID URI Set > Save. Make note of the  Application ID URI. This is the WS-Federation middleware's ```Wtrealm```:



![Microsoft Entra ID: App registration properties!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/ws-federation/_static/aadappiduri.png?view=aspnetcore-8.0 "Microsoft Entra ID: App registration properties")

## Use WS-Federation without ASP.NET Core Identity

The WS-Federation middleware can be used without Identity. For example:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddAuthentication(sharedOptions =>
    {
        sharedOptions.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        sharedOptions.DefaultChallengeScheme = WsFederationDefaults.AuthenticationScheme;
    })
     .AddWsFederation(options =>
     {
         options.Wtrealm = Configuration["wsfed:realm"];
         options.MetadataAddress = Configuration["wsfed:metadata"];
     })
     .AddCookie();

    services.AddControllersWithViews();
    services.AddRazorPages();
}

public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    if (env.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
        app.UseDatabaseErrorPage();
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

    app.UseEndpoints(endpoints =>
    {
        endpoints.MapControllerRoute(
            name: "default",
            pattern: "{controller=Home}/{action=Index}/{id?}");
        endpoints.MapRazorPages();
    });
}
```

## Add WS-Federation as an external login provider for ASP.NET Core Identity

- Add a dependency on Microsoft.AspNetCore.Authentication.WsFederation to the project.

- Add WS-Federation to ```Startup.ConfigureServices```:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(
            Configuration.GetConnectionString("DefaultConnection")));
    services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = true)
        .AddEntityFrameworkStores<ApplicationDbContext>();


    services.AddAuthentication()
        .AddWsFederation(options =>
        {
            // MetadataAddress represents the Active Directory instance used to authenticate users.
            options.MetadataAddress = "https://<ADFS FQDN or AAD tenant>/FederationMetadata/2007-06/FederationMetadata.xml";

            // Wtrealm is the app's identifier in the Active Directory instance.
            // For ADFS, use the relying party's identifier, its WS-Federation Passive protocol URL:
            options.Wtrealm = "https://localhost:44307/";

            // For AAD, use the Application ID URI from the app registration's Overview blade:
            options.Wtrealm = "api://bbd35166-7c13-49f3-8041-9551f2847b69";
        });

    services.AddControllersWithViews();
    services.AddRazorPages();
}
```

The ```AddAuthentication(IServiceCollection, String)``` overload sets the DefaultScheme property. The ```AddAuthentication(IServiceCollection, Action<AuthenticationOptions>)``` overload allows configuring authentication options, which can be used to set up default authentication schemes for different purposes. Subsequent calls to ```AddAuthentication``` override previously configured AuthenticationOptions properties.

TheBuilder extension methods that register an authentication handler may only be called once per authentication scheme.

### Log in with WS-Federation

Browse to the app and click the Log in link in the nav header. There's an option to log in with WsFederation:

![Log in page!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/ws-federation/_static/wsfederationbutton.png?view=aspnetcore-8.0 "Log in page")

With ADFS as the provider, the button redirects to an ADFS sign-in page:

![ADFS sign-in page!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/ws-federation/_static/adfsloginpage.png?view=aspnetcore-8.0 "ADFS sign-in page")

With Microsoft Entra ID as the provider, the button redirects to a Microsoft Entra ID sign-in page:

![Microsoft Entra ID sign-in page!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/ws-federation/_static/aadsignin.png?view=aspnetcore-8.0 "Microsoft Entra ID sign-in page")

A successful sign-in for a new user redirects to the app's user registration page:

![Register page!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/ws-federation/_static/register.png?view=aspnetcore-8.0 "Register page")

Ref: [Authenticate users with WS-Federation in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/ws-federation?view=aspnetcore-8.0)