---
title: Servers - Kestrel - When to use a reverse proxy
published: true
date: 2024-09-11 03:14:20
tags: Summary, AspNetCore
description: Kestrel can be used by itself or with a reverse proxy server. A reverse proxy server receives HTTP requests from the network and forwards them to Kestrel. Examples of a reverse proxy server include:
image:
---

## In this article

Kestrel can be used by itself or with a reverse proxy server. A reverse proxy server receives HTTP requests from the network and forwards them to Kestrel. Examples of a reverse proxy server include:

- Internet Information Services (IIS)

- Nginx

- Apache

- YARP: Yet Another Reverse Proxy

Kestrel used as an edge (Internet-facing) web server:

![Kestrel communicates directly with the Internet without a reverse proxy server!](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/_static/kestrel-to-internet2.png?view=aspnetcore-8.0 "Kestrel communicates directly with the Internet without a reverse proxy server")

Kestrel used in a reverse proxy configuration:

![Kestrel communicates indirectly with the Internet through a reverse proxy server, such as IIS, Nginx, or Apache!](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/_static/kestrel-to-internet.png?view=aspnetcore-8.0 "Kestrel communicates indirectly with the Internet through a reverse proxy server, such as IIS, Nginx, or Apache")

Either configuration, with or without a reverse proxy server, is a supported hosting configuration.

When Kestrel is used as an edge server without a reverse proxy server, sharing of the same IP address and port among multiple processes is unsupported. When Kestrel is configured to listen on a port, Kestrel handles all traffic for that port regardless of requests' ```Host``` headers. A reverse proxy that can share ports can forward requests to Kestrel on a unique IP and port.

Even if a reverse proxy server isn't required, using a reverse proxy server might be a good choice.

A reverse proxy:

- Can limit the exposed public surface area of the apps that it hosts.

- Provides an additional layer of configuration and defense.

- Might integrate better with existing infrastructure.

- Simplifies load balancing and secure communication (HTTPS) configuration. Only the reverse proxy server requires the X.509 certificate for the public domain(s). That server can communicate with the app's servers on the internal network using plain HTTP or HTTPS with locally managed certificates. Internal HTTPS increases security but adds significant overhead.

> Warning
Hosting in a reverse proxy configuration requires host filtering.

## Additional resources

Configure ASP.NET Core to work with proxy servers and load balancers

Ref: [When to use Kestrel with a reverse proxy](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/when-to-use-a-reverse-proxy?view=aspnetcore-8.0)