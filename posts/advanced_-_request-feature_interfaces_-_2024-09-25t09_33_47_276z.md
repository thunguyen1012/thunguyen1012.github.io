---
title: Advanced - Request-feature interfaces
published: true
date: 2024-09-25 09:33:47
tags: Summary, AspNetCore
description:
image:
---

## In this article

The ```HttpContext``` API that applications and middleware use to process requests has an abstraction layer underneath it called feature interfaces. Each feature interface provides a granular subset of the functionality exposed by ```HttpContext```. These interfaces can be added, modified, wrapped, replaced, or even removed by the server or middleware as the request is processed without having to re-implement the entire ```HttpContext```. They can also be used to mock functionality when testing.

## Feature collections

The Features property of ```HttpContext``` provides access to the collection of feature interfaces for the current request. Since the feature collection is mutable even within the context of a request, middleware can be used to modify the collection and add support for additional features. Some advanced features are only available by accessing the associated interface through the feature collection.

## Feature interfaces

ASPNET Core is a part of Microsoft's ASP.NET operating system.

Most feature interfaces provide optional, light-up functionality, and their associated ```HttpContext``` APIs provide defaults if the feature isn't present. A few interfaces are indicated in the following content as required because they provide core request and response functionality and must be implemented in order to process the request.

The following feature interfaces are from Microsoft.AspNetCore.Http.Features:

`IHttpRequestFeature`: Defines the structure of an HTTP request, including the protocol, path, query string, headers, and body. This feature is required in order to process requests.

`IHttpResponseFeature`: Defines the structure of an HTTP response, including the status code, headers, and body of the response. This feature is required in order to process requests.

`IHttpAuthenticationFeature`: Holds the ClaimsPrincipal currently associated with the request.

`IFormFeature`: Used to parse and cache incoming HTTP and multipart form submissions.

`IHttpConnectionFeature`: Defines properties for the connection id and local and remote addresses and ports.

`IHttpRequestIdentifierFeature`: Adds a property that can be implemented to uniquely identify requests.

`IHttpRequestLifetimeFeature`: Defines support for aborting connections or detecting if a request has been terminated prematurely, such as by a client disconnect.

`IHttpUpgradeFeature`: Defines support for HTTP Upgrades, which allow the client to specify which additional protocols it would like to use if the server wishes to switch protocols.

`IHttpWebSocketFeature`: Defines an API for supporting WebSockets.

`IItemsFeature`: Stores the Items collection for per request application state.

`IQueryFeature`: Parses and caches the query string.

`IRequestCookiesFeature`: Parses and caches the request ```Cookie``` header values.

`IResponseCookiesFeature`: Controls how response cookies are applied to the ```Set-Cookie``` header.

`IServiceProvidersFeature`: Provides access to an IServiceProvider with scoped request services.

 ```ISessionFeature```: Defines ISessionFactory and ISession abstractions for supporting user sessions. ISessionFeature is implemented by the SessionMiddleware (see Session in ASP.NET Core).

`ITlsConnectionFeature`: Defines an API for retrieving client certificates.

`ITlsTokenBindingFeature`: Defines methods for working with TLS token binding parameters.

## Additional resources

- Web server implementations in ASP.NET Core

- ASP.NET Core Middleware

Ref: [Request Features in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/request-features?view=aspnetcore-8.0)