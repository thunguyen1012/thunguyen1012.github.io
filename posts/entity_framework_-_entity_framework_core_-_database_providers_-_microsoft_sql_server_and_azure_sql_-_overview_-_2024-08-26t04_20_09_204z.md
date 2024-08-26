---
title: Entity Framework - Entity Framework Core - Database providers - Microsoft SQL Server and Azure SQL - Overview
published: true
date: 2024-08-26 04:20:09
tags: Summary, EFCore
description: This database provider allows Entity Framework Core to be used with Microsoft SQL Server (including Azure SQL Database). The provider is maintained as part of the Entity Framework Core Project.
image:
---

## In this article

This database provider allows Entity Framework Core to be used with Microsoft SQL Server (including Azure SQL Database). The provider is maintained as part of the Entity Framework Core Project.

## Install

Install the Microsoft.EntityFrameworkCore.SqlServer NuGet package.

 - .NET Core CLI


```dotnetcli
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
```

 - Visual Studio
```powershell
Install-Package Microsoft.EntityFrameworkCore.SqlServer
```

> Note
The provider references Microsoft.Data.SqlClient (not System.Data.SqlClient). If your project takes a direct dependency on SqlClient, make sure it references the Microsoft.Data.SqlClient package.

> Tip
The Microsoft.Data.SqlClient package ships more frequently than the EF Core provider. If you would like to take advantage of new features and bug fixes, you can add a direct package reference to the latest version of Microsoft.Data.SqlClient.

> Warning
The async implementation of Microsoft.Data.SqlClient unfortunately has some known issues (e.g. #593, #601, and others). If you're seeing unexpected performance problems, try using sync command execution instead, especially when dealing with large text or binary values.

## Supported Database Engines

- Microsoft SQL Server (2012 onwards)

Ref: [Microsoft SQL Server EF Core Database Provider](https://learn.microsoft.com/en-us/ef/core/providers/sql-server/)