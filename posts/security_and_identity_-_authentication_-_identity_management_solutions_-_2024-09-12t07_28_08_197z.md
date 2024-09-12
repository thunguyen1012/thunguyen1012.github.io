---
title: Security and Identity - Authentication - Identity management solutions
published: true
date: 2024-09-12 07:28:08
tags: Summary, AspNetCore
description: The following table provides an overview of various identity management solutions that can be used in ASP.NET Core apps. These solutions offer features and capabilities to manage user authentication, authorization, and user identity within an app. It includes options for apps that are:
image:
---

## In this article

Identity management is an essential part of any ASP.NET Core app.

- Container-based

- Self-hosted, where you manage the installation and infrastructure to support it.

- Managed, such as cloud-based services like Microsoft Entra

How do I find the right identity management solution for my ASP.NET Core app?

Many of the commercial licenses provide "community" or free options that may be available depending on your company size and app requirements.

<table><thead>
<tr>
<th>Name</th>
<th>Type</th>
<th>License Type</th>
<th>Documentation</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="https://dotnet.microsoft.com/apps/aspnet" data-linktype="external">ASP.NET Core Identity</a></td>
<td>Self host</td>
<td><a href="https://github.com/dotnet/aspnetcore/blob/main/LICENSE.txt" data-linktype="external">OSS (MIT)</a></td>
<td><a href="/en-us/training/modules/secure-aspnet-core-identity/" data-linktype="absolute-path">Secure a web app with ASP.NET Core Identity</a></td>
</tr>
<tr>
<td><a href="https://auth0.com/" data-linktype="external">Auth0</a></td>
<td>Managed</td>
<td><a href="https://auth0.com/pricing" data-linktype="external">Commercial</a></td>
<td><a href="https://auth0.com/docs/get-started" data-linktype="external">Get started</a></td>
</tr>
<tr>
<td><a href="https://duendesoftware.com/products/identityserver" data-linktype="external">Duende IdentityServer</a></td>
<td>Self host</td>
<td><a href="https://duendesoftware.com/products/identityserver#pricing" data-linktype="external">Commercial</a></td>
<td><a href="https://docs.duendesoftware.com/identityserver/v6/aspnet_identity/" data-linktype="external">ASP.NET Identity integration</a></td>
</tr>
<tr>
<td><a href="https://www.keycloak.org" data-linktype="external">Keycloak</a></td>
<td>Container</td>
<td><a href="https://github.com/keycloak/keycloak/blob/master/LICENSE.txt" data-linktype="external">OSS (Apache 2.0)</a></td>
<td><a href="https://www.keycloak.org/docs/latest/securing_apps/#client-adapters" data-linktype="external">Keycloak client adapters documentation</a></td>
</tr>
<tr>
<td><a href="https://azure.microsoft.com/services/active-directory" data-linktype="external">Microsoft Entra ID</a></td>
<td>Managed</td>
<td><a href="https://azure.microsoft.com/pricing/details/active-directory/" data-linktype="external">Commercial</a></td>
<td><a href="/en-us/azure/active-directory/fundamentals/active-directory-whatis" data-linktype="absolute-path">Entra documentation</a></td>
</tr>
<tr>
<td><a href="https://www.okta.com" data-linktype="external">Okta</a></td>
<td>Managed</td>
<td><a href="https://www.okta.com/pricing/" data-linktype="external">Commercial</a></td>
<td><a href="https://developer.okta.com/code/dotnet/aspnetcore/" data-linktype="external">Okta for ASP.NET Core</a></td>
</tr>
<tr>
<td><a href="https://github.com/openiddict/openiddict-core" data-linktype="external">OpenIddict</a></td>
<td>Self host</td>
<td><a href="https://github.com/openiddict/openiddict-core/blob/dev/LICENSE.md" data-linktype="external">OSS (Apache 2.0)</a></td>
<td><a href="https://documentation.openiddict.com/" data-linktype="external">OpenIddict documentation</a></td>
</tr>
</tbody></table>

Is there a solution that should be added to this list? Do you have a correction, suggestion, or feedback? We welcome your contributions. Learn how to contribute.

Ref: [Identity management solutions for .NET web apps](https://learn.microsoft.com/en-us/aspnet/core/security/identity-management-solutions?view=aspnetcore-8.0)