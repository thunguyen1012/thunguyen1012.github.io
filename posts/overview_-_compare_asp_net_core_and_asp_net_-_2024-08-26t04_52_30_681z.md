---
title: Overview - Compare ASP.NET Core and ASP.NET
published: true
date: 2024-08-26 04:52:30
tags: Summary, AspNetCore
description: ASP.NET Core is a redesign of ASP.NET 4.x. This article lists the differences between them.
image:
---

## In this article

ASP.NET Core is a redesign of ASP.NET 4.x. This article lists the differences between them.

## ASP.NET Core

ASP.NET Core is an open-source, cross-platform framework for building modern, cloud-based web apps on Windows, macOS, or Linux.

ASP.NET Core provides the following benefits:

- A unified story for building web UI and web APIs.

- Architected for testability.

- Razor Pages makes coding page-focused scenarios easier and more productive.

- Blazor lets you use C# in the browser alongside JavaScript. Share server-side and client-side app logic all written with .NET.

- Ability to develop and run on Windows, macOS, and Linux.

- Open-source and community-focused.

- Integration of modern, client-side frameworks and development workflows.

- Support for hosting Remote Procedure Call (RPC) services using gRPC.

- A cloud-ready, environment-based configuration system.

- Built-in dependency injection.

- A lightweight, high-performance, and modular HTTP request pipeline.

- Ability to host on the following:

  - Kestrel

  - IIS

  - HTTP.sys

  - Nginx

  - Docker

- Side-by-side versioning.

- Tooling that simplifies modern web development.

## ASP.NET 4.x

ASP.NET 4.x is a mature framework that provides the services needed to build enterprise-grade, server-based web apps on Windows.

## Framework selection

The following table compares ASP.NET Core to ASP.NET 4.x.

<table><thead>
<tr>
<th>ASP.NET Core</th>
<th>ASP.NET 4.x</th>
</tr>
</thead>
<tbody>
<tr>
<td>Build for Windows, macOS, or Linux</td>
<td>Build for Windows</td>
</tr>
<tr>
<td><a href="../razor-pages/?view=aspnetcore-8.0" data-linktype="relative-path">Razor Pages</a> is the recommended approach to create a Web UI as of ASP.NET Core 2.x. See also <a href="../mvc/overview?view=aspnetcore-8.0" data-linktype="relative-path">MVC</a>, <a href="../tutorials/first-web-api?view=aspnetcore-8.0" data-linktype="relative-path">Web API</a>, and <a href="../signalr/introduction?view=aspnetcore-8.0" data-linktype="relative-path">SignalR</a>.</td>
<td>Use <a href="/en-us/aspnet/web-forms" data-linktype="absolute-path">Web Forms</a>, <a href="/en-us/aspnet/signalr" data-linktype="absolute-path">SignalR</a>, <a href="/en-us/aspnet/mvc" data-linktype="absolute-path">MVC</a>, <a href="/en-us/aspnet/web-api/" data-linktype="absolute-path">Web API</a>, <a href="/en-us/aspnet/webhooks/" data-linktype="absolute-path">WebHooks</a>, or <a href="/en-us/aspnet/web-pages" data-linktype="absolute-path">Web Pages</a></td>
</tr>
<tr>
<td>Multiple versions per machine</td>
<td>One version per machine</td>
</tr>
<tr>
<td>Develop with <a href="https://visualstudio.microsoft.com/vs/" data-linktype="external">Visual Studio</a>, <a href="https://visualstudio.microsoft.com/vs/mac/" data-linktype="external">Visual Studio for Mac</a>, or <a href="https://code.visualstudio.com/" data-linktype="external">Visual Studio Code</a> using C# or F#</td>
<td>Develop with <a href="https://visualstudio.microsoft.com/vs/" data-linktype="external">Visual Studio</a> using C#, VB, or F#</td>
</tr>
<tr>
<td>Higher performance than ASP.NET 4.x</td>
<td>Good performance</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/standard/choosing-core-framework-server" data-linktype="absolute-path">Use .NET Core runtime</a></td>
<td>Use .NET Framework runtime</td>
</tr>
</tbody></table>

See ASP.NET Core targeting .NET Framework for information on ASP.NET Core 2.x support on .NET Framework.

## ASP.NET Core scenarios

- Websites

- APIs

- Real-time

- Deploy an ASP.NET Core app to Azure

## ASP.NET 4.x scenarios

- Websites

- APIs

- Real-time

- Create an ASP.NET 4.x web app in Azure

## Additional resources

- Introduction to ASP.NET

- Introduction to ASP.NET Core

- Deploy ASP.NET Core apps to Azure App Service

Ref: [Choose between ASP.NET 4.x and ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/choose-aspnet-framework?view=aspnetcore-8.0)