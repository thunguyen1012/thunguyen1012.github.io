---
title: APIs - Controller-based APIs - Conventions
published: true
date: 2024-09-09 07:27:46
tags: Summary, AspNetCore
description: Common API documentation can be extracted and applied to multiple actions, controllers, or all controllers within an assembly. Web API conventions are a substitute for decorating individual actions with [ProducesResponseType].
image:
---

## In this article

Common API documentation can be extracted and applied to multiple actions, controllers, or all controllers within an assembly. Web API conventions are a substitute for decorating individual actions with `[ProducesResponseType]`.

A convention allows you to:

- Define the most common return types and status codes returned from a specific type of action.

- Identify actions that deviate from the defined standard.

Default conventions are available from Microsoft.AspNetCore.Mvc.DefaultApiConventions. The conventions are demonstrated with the ```ValuesController.cs``` added to an API project template:

```csharp
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace WebApp1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ValuesController : ControllerBase
    {
        // GET api/values
        [HttpGet]
        public ActionResult<IEnumerable<string>> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public ActionResult<string> Get(int id)
        {
            return "value";
        }

        // POST api/values
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
```

Actions that follow the patterns in the ```ValuesController.cs``` work with the default conventions. If the default conventions don't meet your needs, see Create web API conventions.

At runtime, Microsoft.AspNetCore.Mvc.ApiExplorer understands conventions. ```ApiExplorer``` is MVC's abstraction to communicate with OpenAPI (also known as Swagger) document generators. Attributes from the applied convention are associated with an action and are included in the action's OpenAPI documentation. API analyzers also understand conventions. If your action is unconventional (for example, it returns a status code that isn't documented by the applied convention), a warning encourages you to document the status code.

View or download sample code (how to download)

## Apply web API conventions

A convention is an action that is associated with a specific convention.

- ```Microsoft.AspNetCore.Mvc.ApiConventionMethodAttribute``` — Applies to individual actions and specifies the convention type and the convention method that applies.
In the following example, the default convention type's ```Microsoft.AspNetCore.Mvc.DefaultApiConventions.Put``` convention method is applied to the ```Update``` action:

```csharp
// PUT api/contactsconvention/{guid}
[HttpPut("{id}")]
[ApiConventionMethod(typeof(DefaultApiConventions), 
                     nameof(DefaultApiConventions.Put))]
public IActionResult Update(string id, Contact contact)
{
    var contactToUpdate = _contacts.Get(id);

    if (contactToUpdate == null)
    {
        return NotFound();
    }

    _contacts.Update(contact);

    return NoContent();
}
```

The ```Microsoft.AspNetCore.Mvc.DefaultApiConventions.Put``` convention method applies the following attributes to the action:
```csharp
[ProducesDefaultResponseType]
[ProducesResponseType(StatusCodes.Status204NoContent)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
```
For more information on [ProducesDefaultResponseType], see Default Response.

- ```Microsoft.AspNetCore.Mvc.ApiConventionTypeAttribute``` applied to a controller — Applies the specified convention type to all actions on the controller. A convention method is marked with hints that determine the actions to which the convention method applies. For more information on hints, see Create web API conventions).
In the following example, the default set of conventions is applied to all actions in ContactsConventionController:

```csharp
[ApiController]
[ApiConventionType(typeof(DefaultApiConventions))]
[Route("api/[controller]")]
public class ContactsConventionController : ControllerBase
{
```

- ```Microsoft.AspNetCore.Mvc.ApiConventionTypeAttribute``` applied to an assembly — Applies the specified convention type to all controllers in the current assembly. As a recommendation, apply assembly-level attributes in the ```Startup.cs``` file.
In the following example, the default set of conventions is applied to all controllers in the assembly:

```csharp
[assembly: ApiConventionType(typeof(DefaultApiConventions))]
namespace ApiConventions
{
    public class Startup
    {
```

## Create web API conventions

If the default API conventions don't meet your needs, create your own conventions. A convention is:

- A static type with methods.

- Capable of defining response types and naming requirements on actions.

### Response types

These methods are annotated with [ProducesResponseType] or [ProducesDefaultResponseType] attributes. For example:

```csharp
public static class MyAppConventions
{
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public static void Find(int id)
    {
    }
}
```

If more specific metadata attributes are absent, applying this convention to an assembly enforces that:

- The convention method applies to any action named ```Find```.

- A parameter named ```id``` is present on the ```Find``` action.

### Naming requirements

The `[ApiConventionNameMatch]` and `[ApiConventionTypeMatch]` attributes can be applied to the convention method that determines the actions to which they apply. For example:

```csharp
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
[ApiConventionNameMatch(ApiConventionNameMatchBehavior.Prefix)]
public static void Find(
    [ApiConventionNameMatch(ApiConventionNameMatchBehavior.Suffix)]
    int id)
{ }
```

In the preceding example:

- The ```Microsoft.AspNetCore.Mvc.ApiExplorer.ApiConventionNameMatchBehavior.Prefix``` option applied to the method indicates that the convention matches any action prefixed with "Find". Examples of matching actions include ```Find```, ```FindPet```, and ```FindById```.

- The ```Microsoft.AspNetCore.Mvc.ApiExplorer.ApiConventionNameMatchBehavior.Suffix``` applied to the parameter indicates that the convention matches methods with exactly one parameter ending in the suffix identifier. Examples include parameters such as ```id``` or ```petId```. ```ApiConventionTypeMatch``` can be similarly applied to types to constrain the parameter type. A params[] argument indicates remaining parameters that don't need to be explicitly matched.

## Additional resources

- Video: Create metadata for NSwagClient

- Video: Beginner's Series to: Web APIs

- Use web API analyzers

- ASP.NET Core web API documentation with Swagger / OpenAPI

Ref: [Use web API conventions](https://learn.microsoft.com/en-us/aspnet/core/web-api/advanced/conventions?view=aspnetcore-8.0)