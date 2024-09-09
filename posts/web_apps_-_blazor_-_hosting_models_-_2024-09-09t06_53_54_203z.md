---
title: Web apps - Blazor - Hosting models
published: true
date: 2024-09-09 06:53:54
tags: Summary, AspNetCore
description: With the Blazor Server hosting model, components are executed on the server from within an ASP.NET Core app. UI updates, event handling, and JavaScript calls are handled over a SignalR connection using the WebSockets protocol. The state on the server associated with each connected client is called a circuit. Circuits aren't tied to a specific network connection and can tolerate temporary network interruptions and attempts by the client to reconnect to the server when the connection is lost.
image:
---

## In this article

## Blazor Server

Blazor Server is a server-side Java app development platform.

In a traditional server-rendered app, opening the same app in multiple browser screens (tabs or ```iframes```) typically doesn't translate into additional resource demands on the server. For the Blazor Server hosting model, each browser screen requires a separate circuit and separate instances of server-managed component state. Blazor considers closing a browser tab or navigating to an external URL a graceful termination. In the event of a graceful termination, the circuit and associated resources are immediately released. A client may also disconnect non-gracefully, for instance due to a network interruption. Blazor Server stores disconnected circuits for a configurable interval to allow the client to reconnect.



![The browser interacts with Blazor (hosted inside of an ASP.NET Core app) on the server over a SignalR connection.!](https://learn.microsoft.com/en-us/aspnet/core/blazor/hosting-models/hosting-models/_static/blazor-server.png?view=aspnetcore-8.0 "The browser interacts with Blazor (hosted inside of an ASP.NET Core app) on the server over a SignalR connection.")

On the client, the Blazor script establishes the SignalR connection with the server. The script is served from an embedded resource in the ASP.NET Core shared framework.

The Blazor Server hosting model offers several benefits:

- Download size is significantly smaller than when the Blazor WebAssembly hosting model is used, and the app loads much faster.

- The app takes full advantage of server capabilities, including the use of .NET Core APIs.

- .NET Core on the server is used to run the app, so existing .NET tooling, such as debugging, works as expected.

- Thin clients are supported. For example, Blazor Server works with browsers that don't support WebAssembly and on resource-constrained devices.

- The app's .NET/C# code base, including the app's component code, isn't served to clients.

The Blazor Server hosting model has the following limitations:

- Higher latency usually exists. Every user interaction involves a network hop.

- There's no offline support. If the client connection fails, interactivity fails.

- Scaling apps with many users requires server resources to handle multiple client connections and client state.

- An ASP.NET Core server is required to serve the app. Serverless deployment scenarios aren't possible, such as serving the app from a Content Delivery Network (CDN).

Blazor Server apps are hosted on Azure.

## Blazor WebAssembly

The Blazor WebAssembly hosting model runs components client-side in the browser on a WebAssembly-based .NET runtime. The Blazor WebAssembly hosting model runs components client-side in the browser on a WebAssembly-based .NET runtime.



![Blazor WebAssembly: Blazor runs on a UI thread inside the browser.!](https://learn.microsoft.com/en-us/aspnet/core/blazor/hosting-models/hosting-models/_static/blazor-webassembly.png?view=aspnetcore-8.0 "Blazor WebAssembly: Blazor runs on a UI thread inside the browser.")

Blazor WebAssembly is a full-stack .NET web development tool that allows you to build web apps using a single codebase.

The Blazor script handles:

- Downloading the .NET runtime, Razor components, and the component's dependencies.

- Initialization of the runtime.

WebAssembly from Blazor reduces the download times of large apps by up to 50%.

- Unused code is stripped out of the app when it's published by the Intermediate Language (IL) Trimmer.

- HTTP responses are compressed.

- The .NET runtime and assemblies are cached in the browser.

The Blazor WebAssembly hosting model offers several benefits:

- For standalone Blazor WebAssembly apps, there's no .NET server-side dependency after the app is downloaded from the server, so the app remains functional if the server goes offline.

- Client resources and capabilities are fully leveraged.

- Work is offloaded from the server to the client.

- For standalone Blazor WebAssembly apps, an ASP.NET Core web server isn't required to host the app. Serverless deployment scenarios are possible, such as serving the app from a Content Delivery Network (CDN).

The Blazor WebAssembly hosting model has the following limitations:

- Razor components are restricted to the capabilities of the browser.

- Capable client hardware and software (for example, WebAssembly support) is required.

- Download size is larger, and components take longer to load.

- Code sent to the client can't be protected from inspection and tampering by users.

## Blazor Hybrid

![Hybrid apps with .NET and Blazor render UI in a Web View control, where the HTML DOM interacts with Blazor and .NET of the native desktop or mobile app.!](https://learn.microsoft.com/en-us/aspnet/core/blazor/hosting-models/hosting-models/_static/hybrid-apps-1.png?view=aspnetcore-8.0 "Hybrid apps with .NET and Blazor render UI in a Web View control, where the HTML DOM interacts with Blazor and .NET of the native desktop or mobile app.")

 - Reuse existing components that can be shared across mobile, desktop, and web.

 - Leverage web development skills, experience, and resources.

 - Apps have full access to the native capabilities of the device.

 - Separate native client apps must be built, deployed, and maintained for each target platform.

 - Native client apps usually take longer to find, download, and install over accessing a web app in a browser.

 - .NET Multi-platform App UI (.NET MAUI)

 - Windows Presentation Foundation (WPF)

 - Windows Forms

## Which Blazor hosting model should I choose?

<table><thead>
<tr>
<th>Feature</th>
<th style="text-align: center;">Blazor Server</th>
<th style="text-align: center;">Blazor WebAssembly (WASM)</th>
<th style="text-align: center;">Blazor Hybrid</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="#complete-net-api-compatibility" data-linktype="self-bookmark">Complete .NET API compatibility</a></td>
<td style="text-align: center;"><span aria-hidden="true">✔️</span><span class="visually-hidden">Supported</span></td>
<td style="text-align: center;"><span aria-hidden="true">❌</span><span class="visually-hidden">Not supported</span></td>
<td style="text-align: center;"><span aria-hidden="true">✔️</span><span class="visually-hidden">Supported</span></td>
</tr>
<tr>
<td><a href="#direct-access-to-server-and-network-resources" data-linktype="self-bookmark">Direct access to server and network resources</a></td>
<td style="text-align: center;"><span aria-hidden="true">✔️</span><span class="visually-hidden">Supported</span></td>
<td style="text-align: center;"><span aria-hidden="true">❌</span><span class="visually-hidden">Not supported</span>†</td>
<td style="text-align: center;"><span aria-hidden="true">❌</span><span class="visually-hidden">Not supported</span>†</td>
</tr>
<tr>
<td><a href="#small-payload-size-with-fast-initial-load-time" data-linktype="self-bookmark">Small payload size with fast initial load time</a></td>
<td style="text-align: center;"><span aria-hidden="true">✔️</span><span class="visually-hidden">Supported</span></td>
<td style="text-align: center;"><span aria-hidden="true">❌</span><span class="visually-hidden">Not supported</span></td>
<td style="text-align: center;"><span aria-hidden="true">❌</span><span class="visually-hidden">Not supported</span></td>
</tr>
<tr>
<td><a href="#near-native-execution-speed" data-linktype="self-bookmark">Near native execution speed</a></td>
<td style="text-align: center;"><span aria-hidden="true">✔️</span><span class="visually-hidden">Supported</span></td>
<td style="text-align: center;"><span aria-hidden="true">✔️</span><span class="visually-hidden">Supported</span>‡</td>
<td style="text-align: center;"><span aria-hidden="true">✔️</span><span class="visually-hidden">Supported</span></td>
</tr>
<tr>
<td><a href="#app-code-secure-and-private-on-the-server" data-linktype="self-bookmark">App code secure and private on the server</a></td>
<td style="text-align: center;"><span aria-hidden="true">✔️</span><span class="visually-hidden">Supported</span></td>
<td style="text-align: center;"><span aria-hidden="true">❌</span><span class="visually-hidden">Not supported</span>†</td>
<td style="text-align: center;"><span aria-hidden="true">❌</span><span class="visually-hidden">Not supported</span>†</td>
</tr>
<tr>
<td><a href="#run-apps-offline-once-downloaded" data-linktype="self-bookmark">Run apps offline once downloaded</a></td>
<td style="text-align: center;"><span aria-hidden="true">❌</span><span class="visually-hidden">Not supported</span></td>
<td style="text-align: center;"><span aria-hidden="true">✔️</span><span class="visually-hidden">Supported</span></td>
<td style="text-align: center;"><span aria-hidden="true">✔️</span><span class="visually-hidden">Supported</span></td>
</tr>
<tr>
<td><a href="#static-site-hosting" data-linktype="self-bookmark">Static site hosting</a></td>
<td style="text-align: center;"><span aria-hidden="true">❌</span><span class="visually-hidden">Not supported</span></td>
<td style="text-align: center;"><span aria-hidden="true">✔️</span><span class="visually-hidden">Supported</span></td>
<td style="text-align: center;"><span aria-hidden="true">❌</span><span class="visually-hidden">Not supported</span></td>
</tr>
<tr>
<td><a href="#offloads-processing-to-clients" data-linktype="self-bookmark">Offloads processing to clients</a></td>
<td style="text-align: center;"><span aria-hidden="true">❌</span><span class="visually-hidden">Not supported</span></td>
<td style="text-align: center;"><span aria-hidden="true">✔️</span><span class="visually-hidden">Supported</span></td>
<td style="text-align: center;"><span aria-hidden="true">✔️</span><span class="visually-hidden">Supported</span></td>
</tr>
<tr>
<td><a href="#full-access-to-native-client-capabilities" data-linktype="self-bookmark">Full access to native client capabilities</a></td>
<td style="text-align: center;"><span aria-hidden="true">❌</span><span class="visually-hidden">Not supported</span></td>
<td style="text-align: center;"><span aria-hidden="true">❌</span><span class="visually-hidden">Not supported</span></td>
<td style="text-align: center;"><span aria-hidden="true">✔️</span><span class="visually-hidden">Supported</span></td>
</tr>
<tr>
<td><a href="#web-based-deployment" data-linktype="self-bookmark">Web-based deployment</a></td>
<td style="text-align: center;"><span aria-hidden="true">✔️</span><span class="visually-hidden">Supported</span></td>
<td style="text-align: center;"><span aria-hidden="true">✔️</span><span class="visually-hidden">Supported</span></td>
<td style="text-align: center;"><span aria-hidden="true">❌</span><span class="visually-hidden">Not supported</span></td>
</tr>
</tbody></table>

After you choose the app's hosting model, you can generate a Blazor Server or Blazor WebAssembly app from a Blazor project template. For more information, see Tooling for ASP.NET Core Blazor.

### Complete .NET API compatibility

### Direct access to server and network resources

 - Third-party libraries, packages, and services might be costly to implement and maintain, weakly supported, or introduce security risks.

 - If one or more server-based APIs are developed internally by your organization, additional resources are required to build and maintain them.

### Small payload size with fast initial load time

### Near native execution speed

### App code secure and private on the server

### Run apps offline once downloaded

### Static site hosting

Blazor WebAssembly apps can be hosted on the Blazor web server.

### Offloads processing to clients

### Full access to native client capabilities

### Web-based deployment

Blazor web apps are updated on the next app refresh from the browser.

## Setting a component's hosting model

Ref: [ASP.NET Core Blazor hosting models](https://learn.microsoft.com/en-us/aspnet/core/blazor/hosting-models?view=aspnetcore-8.0)