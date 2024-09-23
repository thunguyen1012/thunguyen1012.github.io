---
title: Security and Identity - Secrets management - Manage JWTs in development
published: true
date: 2024-09-20 02:56:06
tags: Summary, AspNetCore
description:
image:
---

## In this article

The ```dotnet ```user-jwts`````` command line tool can create and manage app specific local JSON Web Tokens (JWTs).

## Synopsis

```dotnetcli
dotnet user-jwts [<PROJECT>] [command]
dotnet user-jwts [command] -h|--help
```

## Description

Creates and manages project specific local JSON Web Tokens.

## Arguments

 ```PROJECT | SOLUTION```

The MSBuild project to apply a command on. If a project is not specified, MSBuild searches the current working directory for a file that has a file extension that ends in proj and uses that file.

## Commands

<table><thead>
<tr>
<th>Command</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>clear</td>
<td>Delete all issued JWTs for a project.</td>
</tr>
<tr>
<td>create</td>
<td>Issue a new JSON Web Token.</td>
</tr>
<tr>
<td>remove</td>
<td>Delete a given JWT.</td>
</tr>
<tr>
<td>key</td>
<td>Display or reset the signing key used to issue JWTs.</td>
</tr>
<tr>
<td>list</td>
<td>Lists the JWTs issued for the project.</td>
</tr>
<tr>
<td>print</td>
<td>Display the details of a given JWT.</td>
</tr>
</tbody></table>

### Create

Usage: ```dotnet ```user-jwts`````` create [options]

<table><thead>
<tr>
<th>Option</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>-p | --project</td>
<td>The path of the project to operate on. Defaults to the project in the current directory.</td>
</tr>
<tr>
<td>--scheme</td>
<td>The scheme name to use for the generated token. Defaults to 'Bearer'.</td>
</tr>
<tr>
<td>-n | --name</td>
<td>The name of the user to create the JWT for. Defaults to the current environment user.</td>
</tr>
<tr>
<td>--audience</td>
<td>The audiences to create the JWT for. Defaults to the URLs configured in the project's launchSettings.json.</td>
</tr>
<tr>
<td>--issuer</td>
<td>The issuer of the JWT. Defaults to 'dotnet-user-jwts'.</td>
</tr>
<tr>
<td>--scope</td>
<td>A scope claim to add to the JWT. Specify once for each scope.</td>
</tr>
<tr>
<td>--role</td>
<td>A role claim to add to the JWT. Specify once for each role.</td>
</tr>
<tr>
<td>--claim</td>
<td>Claims to add to the JWT. Specify once for each claim in the format "name=value".</td>
</tr>
<tr>
<td>--not-before</td>
<td>The UTC date &amp; time the JWT should not be valid before in the format 'yyyy-MM-dd [[HH:mm[[:ss]]]]'. Defaults to the date &amp; time the JWT is created.</td>
</tr>
<tr>
<td>--expires-on</td>
<td>The UTC date &amp; time the JWT should expire in the format 'yyyy-MM-dd [[[ [HH:mm]]:ss]]'. Defaults to 6 months after the --not-before date. Do not use this option in conjunction with the --valid-for option.</td>
</tr>
<tr>
<td>--valid-for</td>
<td>The period the JWT should expire after. Specify using a number followed by duration type like 'd' for days, 'h' for hours, 'm' for minutes, and 's' for seconds, e.g. 365d'. Do not use this option in conjunction with the --expires-on option.</td>
</tr>
<tr>
<td>-o | --output</td>
<td>The format to use for displaying output from the command. Can be one of 'default', 'token', or 'json'.</td>
</tr>
<tr>
<td>-h | --help</td>
<td>Show help information</td>
</tr>
</tbody></table>

## Examples

Run the following commands to create an empty web project and add the Microsoft.AspNetCore.Authentication.JwtBearer NuGet package:

```dotnetcli
dotnet new web -o MyJWT
cd MyJWT
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
```

Replace the contents of ```Program.cs``` with the following code:

```csharp
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthorization();
builder.Services.AddAuthentication("Bearer").AddJwtBearer();

var app = builder.Build();

app.UseAuthorization();

app.MapGet("/", () => "Hello, World!");
app.MapGet("/secret", (ClaimsPrincipal user) => $"Hello {user.Identity?.Name}. My secret")
    .RequireAuthorization();

app.Run();
```

In the preceding code, a GET request to ```/secret``` returns an ```401 Unauthorized``` error. A production app might get the JWT from a Security token service (STS), perhaps in response to logging in via a set of credentials. For the purpose of working with the API during local development, the ```dotnet ```user-jwts`````` command line tool can be used to create and manage app-specific local JWTs.

The ```user-jwts``` tool is similar in concept to the  ```user-secrets``` tool, it can be used to manage values for the app that are only valid for the developer on the local machine. In fact, the ```user-jwts``` tool utilizes the ```user-secrets``` infrastructure to manage the key that the JWTs are signed with, ensuring it’s stored safely in the user profile.

The ```user-jwts``` tool hides implementation details, such as where and how the values are stored. The tool can be used without knowing the implementation details. The values are stored in a JSON file in the local machine's user profile folder:

 - Windows

 - Linux / macOS

### Create a JWT

The following command creates a local JWT:

```dotnetcli
dotnet user-jwts create
```

The preceding command creates a JWT and updates the project’s ```appsettings.Development.json``` file with JSON similar to the following:

```csharp
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "Authentication": {
    "Schemes": {
      "Bearer": {
        "ValidAudiences": [
          "http://localhost:8401",
          "https://localhost:44308",
          "http://localhost:5182",
          "https://localhost:7076"
        ],
        "ValidIssuer": "dotnet-user-jwts"
      }
    }
  }
}
```

Copy the JWT and the ```ID``` created in the preceding command. Use a tool like Curl to test ```/secret```:

```dotnetcli
curl -i -H "Authorization: Bearer {token}" https://localhost:{port}/secret
```

Where {token} is the previously generated JWT.

### Display JWT security information

The following command displays the JWT security information, including expiration, scopes, roles, token header and payload, and the compact token:

```dotnetcli
dotnet user-jwts print {ID} --show-all
```

### Create a token for a specific user and scope

See Create in this topic for supported create options.

The following command creates a JWT for a user named ```MyTestUser```:

```dotnetcli
dotnet user-jwts create --name MyTestUser --scope "myapi:secrets"
```

The preceding command has output similar to the following:

```dotnetcli
New JWT saved with ID '43e0b748'.
Name: MyTestUser
Scopes: myapi:secrets

Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.{Remaining token deleted}
```

The preceding token can be used to test the ```/secret2``` endpoint in the following code:

```csharp
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthorization();
builder.Services.AddAuthentication("Bearer").AddJwtBearer();

var app = builder.Build();

app.MapGet("/", () => "Hello, World!");
app.MapGet("/secret", (ClaimsPrincipal user) => $"Hello {user.Identity?.Name}. My secret")
    .RequireAuthorization();
app.MapGet("/secret2", () => "This is a different secret!")
    .RequireAuthorization(p => p.RequireClaim("scope", "myapi:secrets"));

app.Run();
```

Ref: [Manage JSON Web Tokens in development with ```dotnet ```user-jwts``````](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/jwt-authn?view=aspnetcore-8.0)