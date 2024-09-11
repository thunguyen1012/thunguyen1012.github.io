---
title: Servers - Kestrel - Request draining
published: true
date: 2024-09-11 03:14:31
tags: Summary, AspNetCore
description: Opening HTTP connections is time consuming. For HTTPS, it's also resource intensive. Therefore, Kestrel tries to reuse connections per the HTTP/1.1 protocol. A request body must be fully consumed to allow the connection to be reused. The app doesn't always consume the request body, such as HTTP POST requests where the server returns a redirect or 404 response. In the HTTP POST redirect case:
image:
---

## In this article

In this article, I'm going to show you how to reuse HTTP and HTTPS connections between your app and a server.

- The client may already have sent part of the POST data.

- The server writes the 301 response.

- The connection can't be used for a new request until the POST data from the previous request body has been fully read.

- Kestrel tries to drain the request body. Draining the request body means reading and discarding the data without processing it.

The draining process makes a tradeoff between allowing the connection to be reused and the time it takes to drain any remaining data:

- Draining has a timeout of five seconds, which isn't configurable.

- If all of the data specified by the ```Content-Length``` or ```Transfer-Encoding``` header hasn't been read before the timeout, the connection is closed.

Sometimes you may want to terminate the request immediately, before or after writing the response. For example, clients may have restrictive data caps. Limiting uploaded data might be a priority. In such cases to terminate a request, call HttpContext.Abort from a controller, Razor Page, or middleware.

There are caveats to calling ```Abort```:

- Creating new connections can be slow and expensive.

- There's no guarantee that the client has read the response before the connection closes.

- Calling ```Abort``` should be rare and reserved for severe error cases, not common errors.

  - Only call ```Abort``` when a specific problem needs to be solved. For example, call ```Abort``` if malicious clients are trying to POST data or when there's a bug in client code that causes large or several requests.

  - Don't call ```Abort``` for common error situations, such as HTTP 404 (Not Found).

Calling HttpResponse.CompleteAsync before calling ```Abort``` ensures that the server has completed writing the response. However, client behavior isn't predictable and they may not read the response before the connection is aborted.

If there's any unread request body data after completing a response, then the server sends an HTTP/2 RST frame.

When sending a request to a server, it's a good idea to wait for the server to respond before sending the request body.

Ref: [Request draining with ASP.NET Core Kestrel web server](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/request-draining?view=aspnetcore-8.0)