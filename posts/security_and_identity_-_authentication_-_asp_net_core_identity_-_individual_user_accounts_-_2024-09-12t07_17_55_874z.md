---
title: Security and Identity - Authentication - ASP.NET Core Identity - Individual user accounts
published: true
date: 2024-09-12 07:17:55
tags: Summary, AspNetCore
description: ASP.NET Core Identity is included in project templates in Visual Studio with the "Individual User Accounts" option.
image:
---

## In this article

ASP.NET Core Identity is included in project templates in Visual Studio with the "Individual User Accounts" option.

The authentication templates are available in .NET CLI with ```-au Individual```:

```dotnetcli
dotnet new mvc -au Individual
dotnet new webapp -au Individual
```

See this GitHub issue for web API authentication.



## No Authentication

Authentication is specified in the .NET CLI with the ```-au``` option. In Visual Studio, the Change Authentication dialog is available for new web applications. The default for new web apps in Visual Studio is No Authentication.

Projects created with no authentication:

- Don't contain web pages and UI to sign in and sign out.

- Don't contain authentication code.



## Windows Authentication

Windows Authentication is specified for new web apps in the .NET CLI with the ```-au Windows``` option. In Visual Studio, the Change Authentication dialog provides the Windows Authentication options.

If Windows Authentication is selected, the app is configured to use the Windows Authentication IIS module. Windows Authentication is intended for Intranet web sites.

## dotnet new webapp authentication options

The following table shows the authentication options available for new web apps:

<table><thead>
<tr>
<th>Option</th>
<th>Type of authentication</th>
<th>Link for more information</th>
</tr>
</thead>
<tbody>
<tr>
<td>None</td>
<td>No authentication.</td>
<td></td>
</tr>
<tr>
<td>Individual</td>
<td>Individual authentication.</td>
<td><a href="identity?view=aspnetcore-8.0" data-linktype="relative-path">Introduction to Identity on ASP.NET Core</a></td>
</tr>
<tr>
<td>IndividualB2C</td>
<td>Cloud-hosted individual authentication with Azure AD B2C.</td>
<td><a href="/en-us/azure/active-directory-b2c/" data-linktype="absolute-path">Azure AD B2C</a></td>
</tr>
<tr>
<td>SingleOrg</td>
<td>Organizational authentication for a single tenant. Entra External ID tenants also use SingleOrg.</td>
<td><a href="/en-us/azure/active-directory/develop/quickstart-v2-aspnet-core-webapp" data-linktype="absolute-path">Entra ID</a></td>
</tr>
<tr>
<td>MultiOrg</td>
<td>Organizational authentication for multiple tenants.</td>
<td><a href="/en-us/azure/active-directory/develop/quickstart-v2-aspnet-core-webapp" data-linktype="absolute-path">Entra ID</a></td>
</tr>
<tr>
<td>Windows</td>
<td>Windows authentication.</td>
<td><a href="windowsauth?view=aspnetcore-8.0" data-linktype="relative-path">Windows Authentication</a></td>
</tr>
</tbody></table>

## Visual Studio new webapp authentication options

The following table shows the authentication options available when creating a new web app with Visual Studio:

<table><thead>
<tr>
<th>Option</th>
<th>Type of authentication</th>
<th>Link for more information</th>
</tr>
</thead>
<tbody>
<tr>
<td>None</td>
<td>No authentication</td>
<td></td>
</tr>
<tr>
<td>Individual User Accounts / Store user accounts in-app</td>
<td>Individual authentication</td>
<td><a href="identity?view=aspnetcore-8.0" data-linktype="relative-path">Introduction to Identity on ASP.NET Core</a></td>
</tr>
<tr>
<td>Individual User Accounts / Connect to an existing user store in the cloud</td>
<td>Cloud-hosted individual authentication with Azure AD B2C</td>
<td><a href="/en-us/azure/active-directory-b2c/" data-linktype="absolute-path">Azure AD B2C</a></td>
</tr>
<tr>
<td>Work or School Cloud / Single Org</td>
<td>Organizational authentication for a single tenant</td>
<td><a href="/en-us/azure/active-directory/develop/quickstart-v2-aspnet-core-webapp" data-linktype="absolute-path">Azure AD</a></td>
</tr>
<tr>
<td>Work or School Cloud / Multiple Org</td>
<td>Organizational authentication for multiple tenants</td>
<td><a href="/en-us/azure/active-directory/develop/quickstart-v2-aspnet-core-webapp" data-linktype="absolute-path">Azure AD</a></td>
</tr>
<tr>
<td>Windows</td>
<td>Windows authentication</td>
<td><a href="windowsauth?view=aspnetcore-8.0" data-linktype="relative-path">Windows Authentication</a></td>
</tr>
</tbody></table>

## Additional resources

The following articles show how to use the code generated in ASP.NET Core templates that use individual user accounts:

- Account confirmation and password recovery in ASP.NET Core

- Create an ASP.NET Core app with user data protected by authorization

Ref: [Articles based on ASP.NET Core projects created with individual user accounts](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/individual?view=aspnetcore-8.0)