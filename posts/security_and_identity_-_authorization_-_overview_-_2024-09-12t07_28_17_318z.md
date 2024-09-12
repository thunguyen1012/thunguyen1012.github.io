---
title: Security and Identity - Authorization - Overview
published: true
date: 2024-09-12 07:28:17
tags: Summary, AspNetCore
description: Authorization refers to the process that determines what a user is able to do. For example, an administrative user is allowed to create a document library, add documents, edit documents, and delete them. A non-administrative user working with the library is only authorized to read the documents.
image:
---

## In this article



An administrative user is a person who has been given permission to do something in the library.

Authorization is the process of granting or denying access to a system.

For more information about authentication in ASP.NET Core, see Overview of ASP.NET Core Authentication.

## Authorization types

ASP.NET Core authorization provides a simple, declarative role and a rich policy-based model.

## Namespaces

Authorization components, including the ```AuthorizeAttribute``` and ```AllowAnonymousAttribute``` attributes, are found in the ```Microsoft.AspNetCore.Authorization``` namespace.

Consult the documentation on simple authorization.

Ref: [Introduction to authorization in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/introduction?view=aspnetcore-8.0)