---
title: Security and Identity - Secrets management - Protect secrets in development
published: true
date: 2024-09-20 02:56:06
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## Environment variables

> Warning
Environment variables are generally stored in plain, unencrypted text. If the machine or process is compromised, environment variables can be accessed by untrusted parties. Additional measures to prevent disclosure of user secrets may be required.

 - Supported by all platforms.

 - Automatically replaced by a colon, :.

## Secret Manager

> Warning
The Secret Manager tool doesn't encrypt the stored secrets and shouldn't be treated as a trusted store. It's for development purposes only. The keys and values are stored in a JSON configuration file in the user profile directory.

## How the Secret Manager tool works

  - Windows

  - Linux / macOS

## Enable secret storage

### Use the CLI

```dotnetcli
dotnet user-secrets init
```

```xml
<PropertyGroup>
  <TargetFramework>netcoreapp3.1</TargetFramework>
  <UserSecretsId>79a3edd0-2092-40a2-a04d-dcb46d5ca9ed</UserSecretsId>
</PropertyGroup>
```

### Use Visual Studio

### If ```GenerateAssemblyInfo``` is ```false```

```csharp
[assembly: UserSecretsId("your_user_secrets_id")]
```

## Set a secret

```dotnetcli
dotnet user-secrets set "Movies:ServiceApiKey" "12345"
```

```dotnetcli
dotnet user-secrets set "Movies:ServiceApiKey" "12345" --project "C:\apps\WebApp1\src\WebApp1"
```

### JSON structure flattening in Visual Studio

```json
{
  "Movies": {
    "ConnectionString": "Server=(localdb)\\mssqllocaldb;Database=Movie-1;Trusted_Connection=True;MultipleActiveResultSets=true",
    "ServiceApiKey": "12345"
  }
}
```

```json
{
  "Movies:ServiceApiKey": "12345"
}
```

## Set multiple secrets

  - Windows

  - Linux / macOS

```dotnetcli
type .\input.json | dotnet user-secrets set
```

```dotnetcli
cat ./input.json | dotnet user-secrets set
```

## Access a secret

 - Register the user secrets configuration source

 - Read the secret via the Configuration API

### Register the user secrets configuration source

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
```

### Read the secret via the Configuration API

```csharp
var builder = WebApplication.CreateBuilder(args);
var movieApiKey = builder.Configuration["Movies:ServiceApiKey"];

var app = builder.Build();

app.MapGet("/", () => movieApiKey);

app.Run();
```

```csharp
public class IndexModel : PageModel
{
    private readonly IConfiguration _config;

    public IndexModel(IConfiguration config)
    {
        _config = config;
    }

    public void OnGet()
    {
        var moviesApiKey = _config["Movies:ServiceApiKey"];

        // call Movies service with the API key
    }
}
```

## Map secrets to a POCO

```json
{
  "Movies:ConnectionString": "Server=(localdb)\\mssqllocaldb;Database=Movie-1;Trusted_Connection=True;MultipleActiveResultSets=true",
  "Movies:ServiceApiKey": "12345"
}
```

```csharp
var moviesConfig = 
    Configuration.GetSection("Movies").Get<MovieSettings>();
_moviesApiKey = moviesConfig.ServiceApiKey;
```

```csharp
public class MovieSettings
{
    public string ConnectionString { get; set; }

    public string ServiceApiKey { get; set; }
}
```

## String replacement with secrets

```json
{
  "ConnectionStrings": {
    "Movies": "Server=(localdb)\\mssqllocaldb;Database=Movie-1;User Id=johndoe;Password=pass123;MultipleActiveResultSets=true"
  }
}
```

```dotnetcli
dotnet user-secrets set "DbPassword" "pass123"
```

```json
{
  "ConnectionStrings": {
    "Movies": "Server=(localdb)\\mssqllocaldb;Database=Movie-1;User Id=johndoe;MultipleActiveResultSets=true"
  }
}
```

```csharp
using System.Data.SqlClient;

var builder = WebApplication.CreateBuilder(args);

var conStrBuilder = new SqlConnectionStringBuilder(
        builder.Configuration.GetConnectionString("Movies"));
conStrBuilder.Password = builder.Configuration["DbPassword"];
var connection = conStrBuilder.ConnectionString;

var app = builder.Build();

app.MapGet("/", () => connection);

app.Run();
```

## List the secrets

```json
{
  "Movies:ConnectionString": "Server=(localdb)\\mssqllocaldb;Database=Movie-1;Trusted_Connection=True;MultipleActiveResultSets=true",
  "Movies:ServiceApiKey": "12345"
}
```

```dotnetcli
dotnet user-secrets list
```

```console
Movies:ConnectionString = Server=(localdb)\mssqllocaldb;Database=Movie-1;Trusted_Connection=True;MultipleActiveResultSets=true
Movies:ServiceApiKey = 12345
```

## Remove a single secret

```json
{
  "Movies:ConnectionString": "Server=(localdb)\\mssqllocaldb;Database=Movie-1;Trusted_Connection=True;MultipleActiveResultSets=true",
  "Movies:ServiceApiKey": "12345"
}
```

```dotnetcli
dotnet user-secrets remove "Movies:ConnectionString"
```

```json
{
  "Movies": {
    "ServiceApiKey": "12345"
  }
}
```

```console
Movies:ServiceApiKey = 12345
```

## Remove all secrets

```json
{
  "Movies:ConnectionString": "Server=(localdb)\\mssqllocaldb;Database=Movie-1;Trusted_Connection=True;MultipleActiveResultSets=true",
  "Movies:ServiceApiKey": "12345"
}
```

```dotnetcli
dotnet user-secrets clear
```

```json
{}
```

```console
No secrets configured for this application.
```

## Manage user secrets with Visual Studio

![Visual Studio showing Manage User Secrets!](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets/app-secrets/_static/usvs.png?view=aspnetcore-8.0 "Visual Studio showing Manage User Secrets")

## Migrating User Secrets from ASP.NET Framework to ASP.NET Core

## User secrets in non-web applications

```powershell
Install-Package Microsoft.Extensions.Configuration
Install-Package Microsoft.Extensions.Configuration.UserSecrets
```

```dotnetcli
dotnet add package Microsoft.Extensions.Configuration
dotnet add package Microsoft.Extensions.Configuration.UserSecrets
```

```csharp
using Microsoft.Extensions.Configuration;

namespace ConsoleApp;

class Program
{
    static void Main(string[] args)
    {
        IConfigurationRoot config = new ConfigurationBuilder()
            .AddUserSecrets<Program>()
            .Build();

        Console.WriteLine(config["AppSecret"]);
    }
}
```

## Additional resources

 - See this issue and this issue for information on accessing user secrets from IIS.

 - Configuration in ASP.NET Core

 - Azure Key Vault configuration provider in ASP.NET Core

Ref: [Safe storage of app secrets in development in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets?view=aspnetcore-8.0)