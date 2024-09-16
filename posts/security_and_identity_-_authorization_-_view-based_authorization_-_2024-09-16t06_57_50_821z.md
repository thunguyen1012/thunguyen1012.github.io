---
title: Security and Identity - Authorization - View-based authorization
published: true
date: 2024-09-16 06:57:50
tags: Summary, AspNetCore
description: A developer often wants to show, hide, or otherwise modify a UI based on the current user identity. You can access the authorization service within MVC views via dependency injection. To inject the authorization service into a Razor view, use the @inject directive:
image:
---

## In this article

A developer often wants to show, hide, or otherwise modify a UI based on the current user identity. You can access the authorization service within MVC views via dependency injection. To inject the authorization service into a Razor view, use the ```@inject``` directive:

```cshtml
@using Microsoft.AspNetCore.Authorization
@inject IAuthorizationService AuthorizationService
```

If you want the authorization service in every view, place the ```@inject``` directive into the ```_ViewImports.cshtml``` file of the Views directory. For more information, see Dependency injection into views.

Use the injected authorization service to invoke ```AuthorizeAsync``` in exactly the same way you would check during resource-based authorization:

```cshtml
@if ((await AuthorizationService.AuthorizeAsync(User, "PolicyName")).Succeeded)
{
    <p>This paragraph is displayed because you fulfilled PolicyName.</p>
}
```

In some cases, the resource will be your view model. Invoke ```AuthorizeAsync``` in exactly the same way you would check during resource-based authorization:

```cshtml
@if ((await AuthorizationService.AuthorizeAsync(User, Model, Operations.Edit)).Succeeded)
{
    <p><a class="btn btn-default" role="button"
        href="@Url.Action("Edit", "Document", new { id = Model.Id })">Edit</a></p>
}
```

In the preceding code, the model is passed as a resource the policy evaluation should take into consideration.

> Warning
Don't rely on toggling visibility of your app's UI elements as the sole authorization check. Hiding a UI element may not completely prevent access to its associated controller action. For example, consider the button in the preceding code snippet. A user can invoke the ```Edit``` action method if he or she knows the relative resource URL is /Document/Edit/1. For this reason, the ```Edit``` action method should perform its own authorization check.

Ref: [View-based authorization in ASP.NET Core MVC](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/views?view=aspnetcore-8.0)