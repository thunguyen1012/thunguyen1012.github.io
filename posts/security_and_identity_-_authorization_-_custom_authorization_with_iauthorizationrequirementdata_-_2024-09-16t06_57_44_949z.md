---
title: Security and Identity - Authorization - Custom authorization with IAuthorizationRequirementData
published: true
date: 2024-09-16 06:57:44
tags: Summary, AspNetCore
description: Consider the following sample that implements a custom MinimumAgeAuthorizationHandler:
image:
---

## In this article

Consider the following sample that implements a custom ```MinimumAgeAuthorizationHandler```:

```csharp
using AuthRequirementsData.Authorization;
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder();

builder.Services.AddAuthentication().AddJwtBearer();
builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddSingleton<IAuthorizationHandler, MinimumAgeAuthorizationHandler>();

var app = builder.Build();

app.MapControllers();

app.Run();
```

The ```MinimumAgeAuthorizationHandler``` class:

```csharp
using Microsoft.AspNetCore.Authorization;
using System.Globalization;
using System.Security.Claims;

namespace AuthRequirementsData.Authorization;

class MinimumAgeAuthorizationHandler : AuthorizationHandler<MinimumAgeAuthorizeAttribute>
{
    private readonly ILogger<MinimumAgeAuthorizationHandler> _logger;

    public MinimumAgeAuthorizationHandler(ILogger<MinimumAgeAuthorizationHandler> logger)
    {
        _logger = logger;
    }

    // Check whether a given MinimumAgeRequirement is satisfied or not for a particular
    // context.
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context,
                                               MinimumAgeAuthorizeAttribute requirement)
    {
        // Log as a warning so that it's very clear in sample output which authorization
        // policies(and requirements/handlers) are in use.
        _logger.LogWarning("Evaluating authorization requirement for age >= {age}",
                                                                    requirement.Age);

        // Check the user's age.
        var dateOfBirthClaim = context.User.FindFirst(c => c.Type == 
                                                                 ClaimTypes.DateOfBirth);
        if (dateOfBirthClaim != null)
        {
            // If the user has a date of birth claim, check their age.
            var dateOfBirth = Convert.ToDateTime(dateOfBirthClaim.Value,
                                                           CultureInfo.InvariantCulture);
            var age = DateTime.Now.Year - dateOfBirth.Year;
            if (dateOfBirth > DateTime.Now.AddYears(-age))
            {
                // Adjust age if the user hasn't had a birthday yet this year.
                age--;
            }

            // If the user meets the age criterion, mark the authorization requirement
            // succeeded.
            if (age >= requirement.Age)
            {
                _logger.LogInformation(
                    "Minimum age authorization requirement {age} satisfied", 
                      requirement.Age);
                context.Succeed(requirement);
            }
            else
            {
                _logger.LogInformation("Current user's DateOfBirth claim ({dateOfBirth})"
                   + " does not satisfy the minimum age authorization requirement {age}",
                    dateOfBirthClaim.Value,
                    requirement.Age);
            }
        }
        else
        {
            _logger.LogInformation("No DateOfBirth claim present");
        }

        return Task.CompletedTask;
    }
}
```

The custom ```MinimumAgePolicyProvider```:

```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace AuthRequirementsData.Authorization;

class MinimumAgePolicyProvider : IAuthorizationPolicyProvider
{
    const string POLICY_PREFIX = "MinimumAge";
    public DefaultAuthorizationPolicyProvider FallbackPolicyProvider { get; }
    public MinimumAgePolicyProvider(IOptions<AuthorizationOptions> options)
    {
        FallbackPolicyProvider = new DefaultAuthorizationPolicyProvider(options);
    }
    public Task<AuthorizationPolicy> GetDefaultPolicyAsync() => 
                            FallbackPolicyProvider.GetDefaultPolicyAsync();
    public Task<AuthorizationPolicy?> GetFallbackPolicyAsync() =>
                            FallbackPolicyProvider.GetFallbackPolicyAsync();

    public Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        if (policyName.StartsWith(POLICY_PREFIX, StringComparison.OrdinalIgnoreCase) &&
            int.TryParse(policyName.Substring(POLICY_PREFIX.Length), out var age))
        {
            var policy = new AuthorizationPolicyBuilder(
                                                JwtBearerDefaults.AuthenticationScheme);
            policy.AddRequirements(new MinimumAgeRequirement(age));
            return Task.FromResult<AuthorizationPolicy?>(policy.Build());
        }

        return Task.FromResult<AuthorizationPolicy?>(null);
    }
}
```

A custom implementation of ASP.NET Core should handle all policies, including default policies, etc.

- Constructed with options from the dependency injection container.

- Used if this custom provider isn't able to handle a given policy name.

If a custom policy provider is able to handle all expected policy names, setting the fallback policy with `GetFallbackPolicyAsync()` isn't required.

```csharp
class MinimumAgePolicyProvider : IAuthorizationPolicyProvider
{
    const string POLICY_PREFIX = "MinimumAge";
    public DefaultAuthorizationPolicyProvider FallbackPolicyProvider { get; }
    public MinimumAgePolicyProvider(IOptions<AuthorizationOptions> options)
    {
        FallbackPolicyProvider = new DefaultAuthorizationPolicyProvider(options);
    }
    public Task<AuthorizationPolicy> GetDefaultPolicyAsync() => 
                            FallbackPolicyProvider.GetDefaultPolicyAsync();
    public Task<AuthorizationPolicy?> GetFallbackPolicyAsync() =>
                            FallbackPolicyProvider.GetFallbackPolicyAsync();
```

Policies are looked up by string name, therefore parameters, for example, ```age```, are embedded in the policy names. This is abstracted away from developers by the more strongly-typed attributes derived from AuthorizeAttribute. For example, the `[MinimumAgeAuthorize()]` attribute in this sample looks up policies by string name.

```csharp
public Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
{
    if (policyName.StartsWith(POLICY_PREFIX, StringComparison.OrdinalIgnoreCase) &&
        int.TryParse(policyName.Substring(POLICY_PREFIX.Length), out var age))
    {
        var policy = new AuthorizationPolicyBuilder(
                                            JwtBearerDefaults.AuthenticationScheme);
        policy.AddRequirements(new MinimumAgeRequirement(age));
        return Task.FromResult<AuthorizationPolicy?>(policy.Build());
    }

    return Task.FromResult<AuthorizationPolicy?>(null);
}
```

The ```MinimumAgeAuthorizeAttribute``` uses the `IAuthorizationRequirementData` interface that allows the attribute definition to specify the requirements associated with the authorization policy:

```csharp
using Microsoft.AspNetCore.Authorization;

namespace AuthRequirementsData.Authorization;

class MinimumAgeAuthorizeAttribute : AuthorizeAttribute, IAuthorizationRequirement,
                                     IAuthorizationRequirementData
{
    public MinimumAgeAuthorizeAttribute(int age) => Age = age;
    public int Age { get; }

    public IEnumerable<IAuthorizationRequirement> GetRequirements()
    {
        yield return this;
    }
}
```

The ```GreetingsController``` displays the user's name when they satisfy the minimum ```age``` policy:

```csharp
using AuthRequirementsData.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthRequirementsData.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GreetingsController : Controller
{
    [MinimumAgeAuthorize(16)]
    [HttpGet("hello")]
    public string Hello() => $"Hello {(HttpContext.User.Identity?.Name ?? "world")}!";
}
```

The complete sample can be found in the AuthRequirementsData folder of the AspNetCore.Docs.Samples repository.

The sample can be tested with ```dotnet user-jwts``` and curl:

- ```dotnet user-jwts create --claim http://schemas.xmlsoap.org/ws/2005/05/identity/claims/dateofbirth=1989-01-01```

- ```curl -i -H "Authorization: Bearer <token from ```dotnet user-jwts```>" http://localhost:<port>/api/greetings/hello```

Ref: [Custom authorization policies with IAuthorizationRequirementData](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/iard?view=aspnetcore-8.0)