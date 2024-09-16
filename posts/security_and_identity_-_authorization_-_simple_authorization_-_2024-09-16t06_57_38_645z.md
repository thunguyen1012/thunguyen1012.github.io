---
title: Security and Identity - Authorization - Simple authorization
published: true
date: 2024-09-16 06:57:38
tags: Summary, AspNetCore
description: Authorization in ASP.NET Core is controlled with the [Authorize] attribute and its various parameters. In its most basic form, applying the [Authorize] attribute to a controller, action, or Razor Page, limits access to that component to authenticated users.
image:
---

## In this article



Authorization in ASP.NET Core is controlled with the `[Authorize]` attribute and its various parameters. In its most basic form, applying the `[Authorize]` attribute to a controller, action, or Razor Page, limits access to that component to authenticated users.

## Prerequisites

This article assumes that you have a basic understanding of ASP.NET Core Razor Pages and MVC. If you're new to ASP.NET Core, see the following resources:

- Introduction to Razor Pages in ASP.NET Core

- Overview of ASP.NET Core MVC

- Tutorial: Get started with Razor Pages in ASP.NET Core

- Introduction to Identity on ASP.NET Core

## Use the `[Authorize]` attribute

The following code limits access to the ```AccountController``` to authenticated users:

```csharp
[Authorize]
public class AccountController : Controller
{
    public ActionResult Login()
    {
    }

    public ActionResult Logout()
    {
    }
}
```

If you want to apply authorization to an action rather than the controller, apply the ```AuthorizeAttribute``` attribute to the action itself:

```csharp
public class AccountController : Controller
{
   public ActionResult Login()
   {
   }

   [Authorize]
   public ActionResult Logout()
   {
   }
}
```

Now only authenticated users can access the ```Logout``` function.

You can also use the ```AllowAnonymous``` attribute to allow access by non-authenticated users to individual actions. For example:

```csharp
[Authorize]
public class AccountController : Controller
{
    [AllowAnonymous]
    public ActionResult Login()
    {
    }

    public ActionResult Logout()
    {
    }
}
```

This would allow only authenticated users to the ```AccountController```, except for the ```Login``` action, which is accessible by everyone, regardless of their authenticated or unauthenticated / anonymous status.

> Warning
`[AllowAnonymous]` bypasses authorization statements. If you combine `[AllowAnonymous]` and an `[Authorize]` attribute, the `[Authorize]` attributes are ignored. For example if you apply `[AllowAnonymous]` at the controller level:

Any authorization requirements from `[Authorize]` attributes on the same controller or action methods on the controller are ignored.
Authentication middleware is not short-circuited but doesn't need to succeed.

 - Any authorization requirements from `[Authorize]` attributes on the same controller or action methods on the controller are ignored.

 - Authentication middleware is not short-circuited but doesn't need to succeed.

The following code limits access to the ```LogoutModel``` Razor Page to authenticated users:

```csharp
[Authorize]
public class LogoutModel : PageModel
{
    public async Task OnGetAsync()
    {

    }

    public async Task<IActionResult> OnPostAsync()
    {

    }
}
```

For information on how to globally require all users to be authenticated, see Require authenticated users.



## Authorize attribute and Razor Pages

The ```AuthorizeAttribute``` can not be applied to Razor Page handlers. For example, `[Authorize]` can't be applied to ```OnGet```, ```OnPost```, or any other page handler. Consider using an ASP.NET Core MVC controller for pages with different authorization requirements for different handlers. Using an MVC controller when different authorization requirements are required:

- Is the least complex approach.

- Is the approach recommended by Microsoft.

If you decide not to use an MVC controller, the following two approaches can be used to apply authorization to Razor Page handler methods:

- Use separate pages for page handlers requiring different authorization. Move shared content into one or more partial views. When possible, this is the recommended approach.

- For content that must share a common page, write a filter that performs authorization as part of `IAsyncPageFilter.OnPageHandlerSelectionAsync`. The PageHandlerAuth GitHub project demonstrates this approach:

```csharp
[TypeFilter(typeof(AuthorizeIndexPageHandlerFilter))]
public class IndexModel : PageModel
{
    private readonly ILogger<IndexModel> _logger;

    public IndexModel(ILogger<IndexModel> logger)
    {
        _logger = logger;
    }

    public void OnGet()
    {

    }

    public void OnPost()
    {

    }

    [AuthorizePageHandler]
    public void OnPostAuthorized()
    {

    }
}
```

```csharp
public class AuthorizeIndexPageHandlerFilter : IAsyncPageFilter, IOrderedFilter
{
    private readonly IAuthorizationPolicyProvider policyProvider;
    private readonly IPolicyEvaluator policyEvaluator;

    public AuthorizeIndexPageHandlerFilter(
        IAuthorizationPolicyProvider policyProvider,
        IPolicyEvaluator policyEvaluator)
    {
        this.policyProvider = policyProvider;
        this.policyEvaluator = policyEvaluator;
    }

    // Run late in the selection pipeline
    public int Order => 10000;

    public Task OnPageHandlerExecutionAsync(PageHandlerExecutingContext context, PageHandlerExecutionDelegate next) => next();

    public async Task OnPageHandlerSelectionAsync(PageHandlerSelectedContext context)
    {
        var attribute = context.HandlerMethod?.MethodInfo?.GetCustomAttribute<AuthorizePageHandlerAttribute>();
        if (attribute is null)
        {
            return;
        }

        var policy = await AuthorizationPolicy.CombineAsync(policyProvider, new[] { attribute });
        if (policy is null)
        {
            return;
        }

        await AuthorizeAsync(context, policy);
    }

    #region AuthZ - do not change
    private async Task AuthorizeAsync(ActionContext actionContext, AuthorizationPolicy policy)
    {
        var httpContext = actionContext.HttpContext;
        var authenticateResult = await policyEvaluator.AuthenticateAsync(policy, httpContext);
        var authorizeResult = await policyEvaluator.AuthorizeAsync(policy, authenticateResult, httpContext, actionContext.ActionDescriptor);
        if (authorizeResult.Challenged)
        {
            if (policy.AuthenticationSchemes.Count > 0)
            {
                foreach (var scheme in policy.AuthenticationSchemes)
                {
                    await httpContext.ChallengeAsync(scheme);
                }
            }
            else
            {
                await httpContext.ChallengeAsync();
            }

            return;
        }
        else if (authorizeResult.Forbidden)
        {
            if (policy.AuthenticationSchemes.Count > 0)
            {
                foreach (var scheme in policy.AuthenticationSchemes)
                {
                    await httpContext.ForbidAsync(scheme);
                }
            }
            else
            {
                await httpContext.ForbidAsync();
            }

            return;
        }
    }
```

  - The `AuthorizeIndexPageHandlerFilter` implements the authorization filter:

  - The `[AuthorizePageHandler]` attribute is applied to the ```OnPostAuthorized``` page handler:



> Warning
The PageHandlerAuth sample approach does not:

Compose with authorization attributes applied to the page, page model, or globally. Composing authorization attributes results in authentication and authorization executing multiple times when you have one more ```AuthorizeAttribute``` or ```AuthorizeFilter``` instances also applied to the page.
Work in conjunction with the rest of ASP.NET Core authentication and authorization system. You must verify using this approach works correctly for your application.

 - Compose with authorization attributes applied to the page, page model, or globally. Composing authorization attributes results in authentication and authorization executing multiple times when you have one more ```AuthorizeAttribute``` or ```AuthorizeFilter``` instances also applied to the page.

 - Work in conjunction with the rest of ASP.NET Core authentication and authorization system. You must verify using this approach works correctly for your application.

There are no plans to support the ```AuthorizeAttribute``` on Razor Page handlers.

Ref: [Simple authorization in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/simple?view=aspnetcore-8.0)