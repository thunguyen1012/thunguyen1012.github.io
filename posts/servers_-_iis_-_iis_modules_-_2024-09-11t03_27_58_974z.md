---
title: Servers - IIS - IIS Modules
published: true
date: 2024-09-11 03:27:58
tags: Summary, AspNetCore
description: Some of the native IIS modules and all of the IIS managed modules aren't able to process requests for ASP.NET Core apps. In many cases, ASP.NET Core offers an alternative to the scenarios addressed by IIS native and managed modules.
image:
---

## In this article

Some ASP.NET Core apps aren't working properly.

## Native modules

The table indicates native IIS modules that are functional with ASP.NET Core apps and the ASP.NET Core Module.

<table><thead>
<tr>
<th>Module</th>
<th style="text-align: center;">Functional with ASP.NET Core apps</th>
<th>ASP.NET Core Option</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Anonymous Authentication</strong><br><code>AnonymousAuthenticationModule</code></td>
<td style="text-align: center;">Yes</td>
<td></td>
</tr>
<tr>
<td><strong>Basic Authentication</strong><br><code>BasicAuthenticationModule</code></td>
<td style="text-align: center;">Yes</td>
<td></td>
</tr>
<tr>
<td><strong>Client Certification Mapping Authentication</strong><br><code>CertificateMappingAuthenticationModule</code></td>
<td style="text-align: center;">Yes</td>
<td></td>
</tr>
<tr>
<td><strong>CGI</strong><br><code>CgiModule</code></td>
<td style="text-align: center;">No</td>
<td></td>
</tr>
<tr>
<td><strong>Configuration Validation</strong><br><code>ConfigurationValidationModule</code></td>
<td style="text-align: center;">Yes</td>
<td></td>
</tr>
<tr>
<td><strong>HTTP Errors</strong><br><code>CustomErrorModule</code></td>
<td style="text-align: center;">No</td>
<td><a href="../../fundamentals/error-handling?view=aspnetcore-8.0#usestatuscodepages" data-linktype="relative-path">Status Code Pages Middleware</a></td>
</tr>
<tr>
<td><strong>Custom Logging</strong><br><code>CustomLoggingModule</code></td>
<td style="text-align: center;">Yes</td>
<td></td>
</tr>
<tr>
<td><strong>Default Document</strong><br><code>DefaultDocumentModule</code></td>
<td style="text-align: center;">No</td>
<td><a href="../../fundamentals/static-files?view=aspnetcore-8.0#serve-a-default-document" data-linktype="relative-path">Default Files Middleware</a></td>
</tr>
<tr>
<td><strong>Digest Authentication</strong><br><code>DigestAuthenticationModule</code></td>
<td style="text-align: center;">Yes</td>
<td></td>
</tr>
<tr>
<td><strong>Directory Browsing</strong><br><code>DirectoryListingModule</code></td>
<td style="text-align: center;">No</td>
<td><a href="../../fundamentals/static-files?view=aspnetcore-8.0#enable-directory-browsing" data-linktype="relative-path">Directory Browsing Middleware</a></td>
</tr>
<tr>
<td><strong>Dynamic Compression</strong><br><code>DynamicCompressionModule</code></td>
<td style="text-align: center;">Yes</td>
<td><a href="../../performance/response-compression?view=aspnetcore-8.0" data-linktype="relative-path">Response Compression Middleware</a></td>
</tr>
<tr>
<td><strong>Failed Requests Tracing</strong><br><code>FailedRequestsTracingModule</code></td>
<td style="text-align: center;">Yes</td>
<td><a href="../../fundamentals/logging/?view=aspnetcore-8.0#dotnet-trace-tooling" data-linktype="relative-path">ASP.NET Core Logging</a></td>
</tr>
<tr>
<td><strong>File Caching</strong><br><code>FileCacheModule</code></td>
<td style="text-align: center;">No</td>
<td><a href="../../performance/caching/middleware?view=aspnetcore-8.0" data-linktype="relative-path">Response Caching Middleware</a></td>
</tr>
<tr>
<td><strong>HTTP Caching</strong><br><code>HttpCacheModule</code></td>
<td style="text-align: center;">No</td>
<td><a href="../../performance/caching/middleware?view=aspnetcore-8.0" data-linktype="relative-path">Response Caching Middleware</a></td>
</tr>
<tr>
<td><strong>HTTP Logging</strong><br><code>HttpLoggingModule</code></td>
<td style="text-align: center;">Yes</td>
<td><a href="../../fundamentals/logging/?view=aspnetcore-8.0" data-linktype="relative-path">ASP.NET Core Logging</a></td>
</tr>
<tr>
<td><strong>HTTP Redirection</strong><br><code>HttpRedirectionModule</code></td>
<td style="text-align: center;">Yes</td>
<td><a href="../../fundamentals/url-rewriting?view=aspnetcore-8.0" data-linktype="relative-path">URL Rewriting Middleware</a></td>
</tr>
<tr>
<td><strong>HTTP Tracing</strong><br><code>TracingModule</code></td>
<td style="text-align: center;">Yes</td>
<td></td>
</tr>
<tr>
<td><strong>IIS Client Certificate Mapping Authentication</strong><br><code>IISCertificateMappingAuthenticationModule</code></td>
<td style="text-align: center;">Yes</td>
<td></td>
</tr>
<tr>
<td><strong>IP and Domain Restrictions</strong><br><code>IpRestrictionModule</code></td>
<td style="text-align: center;">Yes</td>
<td></td>
</tr>
<tr>
<td><strong>ISAPI Filters</strong><br><code>IsapiFilterModule</code></td>
<td style="text-align: center;">Yes</td>
<td><a href="../../fundamentals/middleware/?view=aspnetcore-8.0" data-linktype="relative-path">Middleware</a></td>
</tr>
<tr>
<td><strong>ISAPI</strong><br><code>IsapiModule</code></td>
<td style="text-align: center;">Yes</td>
<td><a href="../../fundamentals/middleware/?view=aspnetcore-8.0" data-linktype="relative-path">Middleware</a></td>
</tr>
<tr>
<td><strong>Protocol Support</strong><br><code>ProtocolSupportModule</code></td>
<td style="text-align: center;">Yes</td>
<td></td>
</tr>
<tr>
<td><strong>Request Filtering</strong><br><code>RequestFilteringModule</code></td>
<td style="text-align: center;">Yes</td>
<td><a href="../../fundamentals/url-rewriting?view=aspnetcore-8.0#irule-based-rule" data-linktype="relative-path">URL Rewriting Middleware <code>IRule</code></a></td>
</tr>
<tr>
<td><strong>Request Monitor</strong><br><code>RequestMonitorModule</code></td>
<td style="text-align: center;">Yes</td>
<td></td>
</tr>
<tr>
<td><strong>URL Rewriting</strong>†<br><code>RewriteModule</code></td>
<td style="text-align: center;">Yes</td>
<td><a href="../../fundamentals/url-rewriting?view=aspnetcore-8.0" data-linktype="relative-path">URL Rewriting Middleware</a></td>
</tr>
<tr>
<td><strong>Server-Side Includes</strong><br><code>ServerSideIncludeModule</code></td>
<td style="text-align: center;">No</td>
<td></td>
</tr>
<tr>
<td><strong>Static Compression</strong><br><code>StaticCompressionModule</code></td>
<td style="text-align: center;">No</td>
<td><a href="../../performance/response-compression?view=aspnetcore-8.0" data-linktype="relative-path">Response Compression Middleware</a></td>
</tr>
<tr>
<td><strong>Static Content</strong><br><code>StaticFileModule</code></td>
<td style="text-align: center;">No</td>
<td><a href="../../fundamentals/static-files?view=aspnetcore-8.0" data-linktype="relative-path">Static File Middleware</a></td>
</tr>
<tr>
<td><strong>Token Caching</strong><br><code>TokenCacheModule</code></td>
<td style="text-align: center;">Yes</td>
<td></td>
</tr>
<tr>
<td><strong>URI Caching</strong><br><code>UriCacheModule</code></td>
<td style="text-align: center;">Yes</td>
<td></td>
</tr>
<tr>
<td><strong>URL Authorization</strong><br><code>UrlAuthorizationModule</code></td>
<td style="text-align: center;">Yes</td>
<td><a href="../../security/authentication/identity?view=aspnetcore-8.0" data-linktype="relative-path">ASP.NET Core Identity</a></td>
</tr>
<tr>
<td><strong>WebDav</strong><br><code>WebDAV</code></td>
<td style="text-align: center;">No</td>
<td></td>
</tr>
<tr>
<td><strong>Windows Authentication</strong><br><code>WindowsAuthenticationModule</code></td>
<td style="text-align: center;">Yes</td>
<td></td>
</tr>
</tbody></table>

†The URL Rewrite Module's ```isFile``` and ```isDirectory``` match types don't work with ASP.NET Core apps due to the changes in directory structure.

## Managed modules

Managed modules are not functional with hosted ASP.NET Core apps when the app pool's .NET CLR version is set to No Managed Code. ASP.NET Core offers middleware alternatives in several cases.

<table><thead>
<tr>
<th>Module</th>
<th>ASP.NET Core Option</th>
</tr>
</thead>
<tbody>
<tr>
<td>AnonymousIdentification</td>
<td></td>
</tr>
<tr>
<td>DefaultAuthentication</td>
<td></td>
</tr>
<tr>
<td>FileAuthorization</td>
<td></td>
</tr>
<tr>
<td>FormsAuthentication</td>
<td><a href="../../security/authentication/cookie?view=aspnetcore-8.0" data-linktype="relative-path">Cookie Authentication Middleware</a></td>
</tr>
<tr>
<td>OutputCache</td>
<td><a href="../../performance/caching/middleware?view=aspnetcore-8.0" data-linktype="relative-path">Response Caching Middleware</a></td>
</tr>
<tr>
<td>Profile</td>
<td></td>
</tr>
<tr>
<td>RoleManager</td>
<td></td>
</tr>
<tr>
<td>ScriptModule-4.0</td>
<td></td>
</tr>
<tr>
<td>Session</td>
<td><a href="../../fundamentals/app-state?view=aspnetcore-8.0" data-linktype="relative-path">Session Middleware</a></td>
</tr>
<tr>
<td>UrlAuthorization</td>
<td></td>
</tr>
<tr>
<td>UrlMappingsModule</td>
<td><a href="../../fundamentals/url-rewriting?view=aspnetcore-8.0" data-linktype="relative-path">URL Rewriting Middleware</a></td>
</tr>
<tr>
<td>UrlRoutingModule-4.0</td>
<td><a href="../../security/authentication/identity?view=aspnetcore-8.0" data-linktype="relative-path">ASP.NET Core Identity</a></td>
</tr>
<tr>
<td>WindowsAuthentication</td>
<td></td>
</tr>
</tbody></table>

## IIS Manager application changes

The web.config file is the file that serves as the home page of the app.

## Disabling IIS modules

A module can be disabled by adding a line to the app's web.config file.

### Module deactivation

Many modules offer a configuration setting that allows them to be disabled without removing the module from the app. This is the simplest and quickest way to deactivate a module. For example, the HTTP Redirection Module can be disabled with the <httpRedirect> element in web.config:

```xml
<configuration>
  <system.webServer>
    <httpRedirect enabled="false" />
  </system.webServer>
</configuration>
```

For more information on disabling modules with configuration settings, follow the links in the Child Elements section of IIS <system.webServer>.

### Module removal

If opting to remove a module with a setting in web.config, unlock the module and unlock the <modules> section of web.config first:

- Unlock the module at the server level. Select the IIS server in the IIS Manager Connections sidebar. Open the Modules in the IIS area. Select the module in the list. In the Actions sidebar on the right, select Unlock. If the action entry for the module appears as Lock, the module is already unlocked, and no action is required. Unlock as many modules as you plan to remove from web.config later.

- Deploy the app without a <modules> section in web.config. If an app is deployed with a web.config containing the <modules> section without having unlocked the section first in the IIS Manager, the Configuration Manager throws an exception when attempting to unlock the section. Therefore, deploy the app without a <modules> section.

- Unlock the <modules> section of web.config. In the Connections sidebar, select the website in Sites. In the Management area, open the Configuration Editor. Use the navigation controls to select the ```system.webServer/modules``` section. In the Actions sidebar on the right, select to Unlock the section. If the action entry for the module section appears as Lock Section, the module section is already unlocked, and no action is required.

- Add a <modules> section to the app's local web.config file with a <remove> element to remove the module from the app. Add multiple <remove> elements to remove multiple modules. If web.config changes are made on the server, immediately make the same changes to the project's web.config file locally. Removing a module using this approach doesn't affect the use of the module with other apps on the server.
<configuration>
 <system.webServer>
   <modules>
     <remove name="MODULE_NAME" />
   </modules>
 </system.webServer>
</configuration>

```xml
<configuration>
 <system.webServer>
   <modules>
     <remove name="MODULE_NAME" />
   </modules>
 </system.webServer>
</configuration>
```

In order to add or remove modules for IIS Express using web.config, modify applicationHost.config to unlock the <modules> section:

- Open {APPLICATION ROOT}\.vs\config\applicationhost.config.

- Locate the <section> element for IIS modules and change ```overrideModeDefault``` from ```Deny``` to ```Allow```:
<section name="modules"
         allowDefinition="MachineToApplication"
         ```overrideModeDefault```="Allow" />

```xml
<section name="modules"
         allowDefinition="MachineToApplication"
         overrideModeDefault="Allow" />
```

- Locate the <location path="" overrideMode="Allow"><system.webServer><modules> section. For any modules that you wish to remove, set ```lockItem``` from ```true``` to ```false```. In the following example, the CGI Module is unlocked:
<add name="CgiModule" ```lockItem```="false" />

```xml
<add name="CgiModule" lockItem="false" />
```

- After the <modules> section and individual modules are unlocked, you're free to add or remove IIS modules using the app's web.config file for running the app on IIS Express.

An IIS module can also be removed with Appcmd.exe. Provide the ```MODULE_NAME``` and ```APPLICATION_NAME``` in the command:

```console
Appcmd.exe delete module MODULE_NAME /app.name:APPLICATION_NAME
```

For example, remove the ```DynamicCompressionModule``` from the Default Web Site:

```console
%windir%\system32\inetsrv\appcmd.exe delete module DynamicCompressionModule /app.name:"Default Web Site"
```

## Minimum module configuration

The only modules required to run an ASP.NET Core app are the Anonymous Authentication Module and the ASP.NET Core Module.

The URI Caching Module (UriCacheModule) allows IIS to cache website configuration at the URL level. Without this module, IIS must read and parse configuration on every request, even when the same URL is repeatedly requested. Parsing the configuration every request results in a significant performance penalty. Although the URI Caching Module isn't strictly required for a hosted ASP.NET Core app to run, we recommend that the URI Caching Module be enabled for all ASP.NET Core deployments.

The HTTP Caching Module (HttpCacheModule) implements the IIS output cache and also the logic for caching items in the HTTP.sys cache. Without this module, content is no longer cached in kernel mode, and cache profiles are ignored. Removing the HTTP Caching Module usually has adverse effects on performance and resource usage. Although the HTTP Caching Module isn't strictly required for a hosted ASP.NET Core app to run, we recommend that the HTTP Caching Module be enabled for all ASP.NET Core deployments.

## Additional resources

- Introduction to IIS Architectures: Modules in IIS

- IIS Modules Overview

- Customizing IIS 7.0 Roles and Modules

- IIS <system.webServer>

Ref: [IIS modules with ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/modules?view=aspnetcore-8.0)