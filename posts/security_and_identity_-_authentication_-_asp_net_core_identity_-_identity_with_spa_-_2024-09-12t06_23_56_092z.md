---
title: Security and Identity - Authentication - ASP.NET Core Identity - Identity with SPA
published: true
date: 2024-09-12 06:23:56
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## Prerequisites

 - Isn't already configured for authentication.

 - Targets ```net8.0``` or later.

 - Can be either minimal API or controller-based API.

## Install NuGet packages

 - ```Microsoft.AspNetCore.Identity.EntityFrameworkCore``` - Enables Identity to work with Entity Framework Core (EF Core).

 - One that enables EF Core to work with a database, such as one of the following packages:

   - ```Microsoft.EntityFrameworkCore.SqlServer``` or

   - ```Microsoft.EntityFrameworkCore.Sqlite``` or

   - ```Microsoft.EntityFrameworkCore.InMemory```.

## Create an ```IdentityDbContext```

```csharp
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext : IdentityDbContext<IdentityUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) :
        base(options)
    { }
}
```

```csharp
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
```

## Configure the EF Core context

```csharp
builder.Services.AddDbContext<ApplicationDbContext>(
    options => options.UseInMemoryDatabase("AppDb"));
```

## Add Identity services to the container

```csharp
builder.Services.AddAuthorization();
```

## Activate Identity APIs

```csharp
builder.Services.AddIdentityApiEndpoints<IdentityUser>()
    .AddEntityFrameworkStores<ApplicationDbContext>();
```

## Map Identity routes

```csharp
app.MapIdentityApi<IdentityUser>();
```

## Secure selected endpoints

```csharp
app.MapGet("/weatherforecast", (HttpContext httpContext) =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        {
            Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            TemperatureC = Random.Shared.Next(-20, 55),
            Summary = summaries[Random.Shared.Next(summaries.Length)]
        })
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi()
.RequireAuthorization();
```

 - Secure Swagger UI endpoints, as shown in the following example:
```csharp
app.MapSwagger().RequireAuthorization();
```

 - Secure with a specific claim or permission, as shown in the following example:

```csharp
.RequireAuthorization("Admin");
```

## Test the API

### Attempt to access a secured endpoint

 - Run the app and navigate to the Swagger UI.

 - Expand a secured endpoint, such as ```/weatherforecast``` in a project created by the web API template.

 - Select  Try it out.

 - Select Execute. The response is ```401 - not authorized```.

### Test registration

 - Expand ```/register``` and select Try it out.

 - In the Parameters section of the UI, a sample request body is shown:

```json
{
  "email": "string",
  "password": "string"
}
```

 - Replace "string" with a valid email address and password, and then select Execute.
To comply with the default password validation rules, the password must be at least six characters long and contain at least one of each of the following characters:

If you enter an invalid email address or a bad password, the result includes the validation errors. Here's an example of a response body with validation errors:
```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "PasswordTooShort": [
      "Passwords must be at least 6 characters."
    ],
    "PasswordRequiresNonAlphanumeric": [
      "Passwords must have at least one non alphanumeric character."
    ],
    "PasswordRequiresDigit": [
      "Passwords must have at least one digit ('0'-'9')."
    ],
    "PasswordRequiresLower": [
      "Passwords must have at least one lowercase ('a'-'z')."
    ]
  }
}
```

The errors are returned in the ProblemDetails format so the client can parse them and display validation errors as needed.
A successful registration results in a ```200 - OK``` response.

   - Uppercase letter

   - Lowercase letter

   - Numeric digit

   - Nonalphanumeric character

### Test login

 - Expand ```/login``` and select Try it out. The example request body shows two additional parameters:
```json
{
  "email": "string",
  "password": "string",
  "twoFactorCode": "string",
  "twoFactorRecoveryCode": "string"
}
```

The extra JSON properties aren't needed for this example and can be deleted. Set ```useCookies``` to ```true```.

 - Replace "string" with the email address and password that you used to register, and then select Execute.
A successful login results in a ```200 - OK``` response with a cookie in the response header.

### Retest the secured endpoint

### Testing with nonbrowser clients

 - If you're ```using``` a tool for testing APIs, you might need to enable cookies in the settings.

 - The JavaScript ```fetch``` API doesn't ```include``` cookies by default. Enable them by setting ```credentials``` to the value ```include``` in the options.

 - An ```HttpClient``` running in a Blazor WebAssembly app needs the ```HttpRequestMessage``` to ```include``` ```credentials```, like the following example:

```csharp
request.SetBrowserRequestCredential(BrowserRequestCredentials.Include);
```

## Use token-based authentication

## Log out

```csharp
app.MapPost("/logout", async (SignInManager<IdentityUser> signInManager,
    [FromBody] object empty) =>
{
    if (empty != null)
    {
        await signInManager.SignOutAsync();
        return Results.Ok();
    }
    return Results.Unauthorized();
})
.WithOpenApi()
.RequireAuthorization();
```

```typescript
public signOut() {
  return this.http.post('/logout', {}, {
    withCredentials: true,
    observe: 'response',
    responseType: 'text'
```

## The MapIdentityApi<TUser> endpoints

 - ```POST /register```

 - ```POST /login```

 - ```POST /refresh```

 - ```GET /confirmEmail```

 - ```POST /resendConfirmationEmail```

 - ```POST /forgotPassword```

 - ```POST /resetPassword```

 - ```POST /manage/2fa```

 - ```GET /manage/info```

 - ```POST /manage/info```

## Use the ```POST /register``` endpoint

```json
{
  "email": "string",
  "password": "string",
}
```

 - Test registration earlier in this article.

 - RegisterRequest.

## Use the ```POST /login``` endpoint

```json
{
  "email": "string",
  "password": "string"
}
```

 - 

```json
{
  "email": "string",
  "password": "string",
  "twoFactorCode": "string",
}
```

 - 
```json
{
  "email": "string",
  "password": "string",
  "twoFactorRecoveryCode": "string"
}
```

 - ```useCookies``` - Set to ```true``` for cookie-based authentication. Set to ```false``` or omit for token-based authentication.

### Token-based authentication

```json
{
  "tokenType": "string",
  "accessToken": "string",
  "expiresIn": 0,
  "refreshToken": "string"
}
```

```http
Authorization: Bearer {access token}
```

## Use the ```POST /refresh``` endpoint

```json
{
  "refreshToken": "string"
}
```

```json
{
  "tokenType": "string",
  "accessToken": "string",
  "expiresIn": 0,
  "refreshToken": "string"
}
```

## Use the ```GET /confirmEmail``` endpoint

 - ```userId```

 - ```code```

 - ```changedEmail``` - Included only if the user changed the email address during registration.

```http
Please confirm your account by <a href='https://contoso.com/confirmEmail?userId={user ID}&code={generated code}&changedEmail={new email address}'>clicking here</a>.
```

 - Confirms the email address and enables the user to log in.

 - Returns the text "Thank you for confirming your email." in the response body.

```csharp
builder.Services.Configure<IdentityOptions>(options =>
{
    options.SignIn.RequireConfirmedEmail = true;
});

builder.Services.AddTransient<IEmailSender, EmailSender>();
```

## Use the ```POST /resendConfirmationEmail``` endpoint

```json
{
  "email": "string"
}
```

## Use the ```POST /forgotPassword``` endpoint

```json
{
  "email": "string"
}
```

## Use the ```POST /resetPassword``` endpoint

```json
{
  "email": "string",
  "resetCode": "string",
  "newPassword": "string"
}
```

## Use the ```POST /manage/2fa``` endpoint

### Enable 2FA

 - Call the ```/manage/2fa``` endpoint, sending an empty JSON object ({}) in the request body.

 - The response body provides the SharedKey along with some other properties that aren't needed at this point. The shared key is used to set up the authenticator app. Response body example:

```json
{
  "sharedKey": "string",
  "recoveryCodesLeft": 0,
  "recoveryCodes": null,
  "isTwoFactorEnabled": false,
  "isMachineRemembered": false
}
```

 - Use the shared key to get a Time-based one-time password (TOTP). For more information, see Enable QR ```code``` generation for TOTP authenticator apps in ASP.NET Core.

 - Call the ```/manage/2fa``` endpoint, sending the TOTP and ```"enable": true``` in the request body. For example:
```json
{
  "enable": true,
  "twoFactorCode": "string"
}
```

 - The response body confirms that IsTwoFactorEnabled is ```true``` and provides the RecoveryCodes. The recovery codes are used to log in when the authenticator app isn't available. Response body example after successfully enabling 2FA:
```json
{
  "sharedKey": "string",
  "recoveryCodesLeft": 10,
  "recoveryCodes": [
    "string",
    "string",
    "string",
    "string",
    "string",
    "string",
    "string",
    "string",
    "string",
    "string"
  ],
  "isTwoFactorEnabled": true,
  "isMachineRemembered": false
}
```

### Log in with 2FA

```json
{
  "email": "string",
  "password": "string",
  "twoFactorCode": "string"
}
```

```json
{
  "email": "string",
  "password": "string",
  "twoFactorRecoveryCode": "string"
}
```

### Reset the recovery codes

```json
{
  "resetRecoveryCodes": true
}
```

### Reset the shared key

```json
{
  "resetSharedKey": true
}
```

### Forget the machine

```json
{
  "forgetMachine": true
}
```

## Use the ```GET /manage/info``` endpoint

```json
{
  "email": "string",
  "isEmailConfirmed": true
}
```

## Use the ```POST /manage/info``` endpoint

```json
{
  "newEmail": "string",
  "newPassword": "string",
  "oldPassword": "string"
}
```

```json
{
  "email": "string",
  "isEmailConfirmed": false
}
```

## See also

 - Choose an identity management solution

 - Identity management solutions for .NET web apps

 - Simple authorization in ASP.NET Core

 - Add, download, and delete user data to Identity in an ASP.NET Core project

 - Create an ASP.NET Core app with user data protected by authorization

 - Account confirmation and password recovery in ASP.NET Core

 - Enable QR code generation for TOTP authenticator apps in ASP.NET Core

 - Sample Web API backend for SPAs
The .http file shows token-based authentication. For example:

   - Doesn't set ```useCookies```

   - Uses the ```Authorization``` header to pass the token

   - Shows refresh to extend session without forcing the user to login again

 - Sample Angular app that uses Identity to secure a Web API backend

Ref: [How to use Identity to secure a Web API backend for SPAs](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-api-authorization?view=aspnetcore-8.0)