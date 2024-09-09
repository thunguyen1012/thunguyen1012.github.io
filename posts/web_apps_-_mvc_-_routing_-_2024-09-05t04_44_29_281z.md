---
title: Web apps - MVC - Routing
published: true
date: 2024-09-05 04:44:29
tags: Summary, AspNetCore
description:
image:
---

## In this article

 - Are defined at startup in ```Program.cs``` or in attributes.

 - Describe how URL paths are matched to actions.

 - Are used to generate URLs for links. The generated links are typically returned in responses.

 - Explains the interactions between MVC and routing:

   - How typical MVC apps make use of routing features.

   - Covers both:

     - Conventional routing typically used with controllers and views.

     - Attribute routing used with REST APIs. If you're primarily interested in routing for REST APIs, jump to the Attribute routing for REST APIs ```section```.

   - See Routing for advanced routing details.

 - Refers to the ```default``` routing system called endpoint routing. It's possible to use controllers with the previous version of routing for compatibility purposes. See the 2.2-3.0 migration guide for instructions.

## Set up conventional route

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
```

```csharp
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");
```

 - Matches a URL path like ```/Products/Details/5```

 - Extracts the route values { controller = Products, action = ```Details```, ```id = ```5 } by tokenizing the path. The extraction of route values results in a match if the app has a controller named ```ProductsController``` and a ```Details``` action:
MyDisplayRouteInfo is provided by the Rick.Docs.Samples.RouteInfo NuGet package and displays route information.

```csharp
public class ProductsController : Controller
{
    public IActionResult Details(int id)
    {
        return ControllerContext.MyDisplayRouteInfo(id);
    }
}
```

 - ```/Products/Details/5``` model binds the value of ```id = ```5 to set the id parameter to ```5```. See Model Binding for more details.

 - {controller=Home} defines ```Home``` as the ```default``` controller.

 - {action=Index} defines ```Index``` as the ```default``` action.

 - The ? character in {id?} defines id as optional.

   - Default and optional route parameters don't need to be present in the URL path for a match. See Route Template Reference for a detailed description of route template syntax.

 - Matches the URL path /.

 - Produces the route values { controller = ```Home```, action = ```Index``` }.

```csharp
public class HomeController : Controller
{
    public IActionResult Index() { ... }
}
```

 - ```/Home/Index/17```

 - ```/Home/Index```

 - ```/Home```

 - /

```csharp
app.MapDefaultControllerRoute();
```

```csharp
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");
```

> Important
Routing is configured using the ```UseRouting``` and ```UseEndpoints``` middleware. To use controllers:

Call MapControllers to map attribute routed controllers.
Call MapControllerRoute or ```MapAreaControllerRoute```, to map both conventionally routed controllers and attribute routed controllers.

Apps typically don't need to call ```UseRouting``` or ```UseEndpoints```. WebApplicationBuilder configures a middleware pipeline that wraps middleware added in ```Program.cs``` with ```UseRouting``` and ```UseEndpoints```. For more information, see Routing in ASP.NET Core.

  - Call MapControllers to map attribute routed controllers.

  - Call MapControllerRoute or ```MapAreaControllerRoute```, to map both conventionally routed controllers and attribute routed controllers.

## Conventional routing

```csharp
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");
```

 - The first path segment, {controller=Home}, maps to the controller name.

 - The second segment, {action=Index}, maps to the action name.

 - The third segment, {id?} is used for an optional id. The ? in {id?} makes it optional. id is used to map to a model entity.

 - ```/Products/List``` maps to the ```ProductsController.List``` action.

 - ```/Blog/Article/17``` maps to ```BlogController.Article``` and typically model binds the id parameter to 17.

 - Is based on the controller and action names only.

 - Isn't based on namespaces, source file locations, or method parameters.

 - Helps simplify the code.

 - Makes the UI more predictable.

> Warning
The id in the preceding code is defined as optional by the route template. Actions can execute without the optional ID provided as part of the URL. Generally, when id is omitted from the URL:

id is set to ```0``` by model binding.
No entity is found in the database matching ```id == 0```.

Attribute routing provides fine-grained control to make the ID required for some actions and not for others. By convention, the documentation includes optional parameters like id when they're likely to appear in correct usage.

  - id is set to ```0``` by model binding.

  - No entity is found in the database matching ```id == 0```.

 - Supports a basic and descriptive routing scheme.

 - Is a useful starting point for UI-based apps.

 - Is the only route template needed for many web UI apps. For larger web UI apps, another route using Areas is frequently all that's needed.

 - Automatically assign an order value to their endpoints based on the order they are invoked.

 - Doesn't have a concept of routes.

 - Doesn't provide ordering guarantees for the execution of extensibility,  all endpoints are processed at once.

### Multiple conventional routes

```csharp
app.MapControllerRoute(name: "blog",
                pattern: "blog/{*article}",
                defaults: new { controller = "Blog", action = "Article" });
app.MapControllerRoute(name: "default",
               pattern: "{controller=Home}/{action=Index}/{id?}");
```

 - It uses conventional routing.

 - It's dedicated to a specific action.

 - They can only have the ```default``` values { controller = "Blog", action = "Article" }.

 - This route always maps to the action ```BlogController.Article```.

 - ```blog``` route has a higher priority for matches than the ```default``` route because it is added first.

 - Is an example of Slug style routing where it's typical to have an article name as part of the URL.

> Warning
In ASP.NET Core, routing doesn't:

Define a concept called a route. ```UseRouting``` adds route matching to the middleware pipeline. The ```UseRouting``` middleware looks at the set of endpoints defined in the app, and selects the best endpoint match based on the request.
Provide guarantees about the execution order of extensibility like IRouteConstraint or ```IActionConstraint```.

See Routing for reference material on routing.

  - Define a concept called a route. ```UseRouting``` adds route matching to the middleware pipeline. The ```UseRouting``` middleware looks at the set of endpoints defined in the app, and selects the best endpoint match based on the request.

  - Provide guarantees about the execution order of extensibility like IRouteConstraint or ```IActionConstraint```.

### Conventional routing order

### Resolving ambiguous actions

 - Choose the best candidate.

 - Throw an exception.

```csharp
public class Products33Controller : Controller
{
    public IActionResult Edit(int id)
    {
        return ControllerContext.MyDisplayRouteInfo(id);
    }

    [HttpPost]
    public IActionResult Edit(int id, Product product)
    {
        return ControllerContext.MyDisplayRouteInfo(id, product.name);
    }
}
```

 - The URL path ```/Products33/Edit/17```

 - Route data { controller = Products33, action = Edit, id = 17 }.

 - Edit(int) displays a ```form``` to edit a product.

 - Edit(int, Product) processes  the posted ```form```.

 - Edit(int, Product) is selected when the request is an HTTP ```POST```.

 - Edit(int) is selected when the HTTP verb is anything else. Edit(int) is generally called via ```GET```.

### Conventional route names

```csharp
app.MapControllerRoute(name: "blog",
                pattern: "blog/{*article}",
                defaults: new { controller = "Blog", action = "Article" });
app.MapControllerRoute(name: "default",
               pattern: "{controller=Home}/{action=Index}/{id?}");
```

 - Have no impact on URL matching or handling of requests.

 - Are used only for URL generation.

 - Are interchangeable.

 - Which one is used in documentation and code depends on the API being described.

## Attribute routing for REST APIs

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

var app = builder.Build();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
```

 - ```HomeController``` matches a set of URLs similar to what the ```default``` conventional route {controller=Home}/{action=Index}/{id?} matches.

```csharp
public class HomeController : Controller
{
    [Route("")]
    [Route("Home")]
    [Route("Home/Index")]
    [Route("Home/Index/{id?}")]
    public IActionResult Index(int? id)
    {
        return ControllerContext.MyDisplayRouteInfo(id);
    }

    [Route("Home/About")]
    [Route("Home/About/{id?}")]
    public IActionResult About(int? id)
    {
        return ControllerContext.MyDisplayRouteInfo(id);
    }
}
```

```csharp
public class MyDemoController : Controller
{
    [Route("")]
    [Route("Home")]
    [Route("Home/Index")]
    [Route("Home/Index/{id?}")]
    public IActionResult MyIndex(int? id)
    {
        return ControllerContext.MyDisplayRouteInfo(id);
    }

    [Route("Home/About")]
    [Route("Home/About/{id?}")]
    public IActionResult MyAbout(int? id)
    {
        return ControllerContext.MyDisplayRouteInfo(id);
    }
}
```

```csharp
public class HomeController : Controller
{
    [Route("")]
    [Route("Home")]
    [Route("[controller]/[action]")]
    public IActionResult Index()
    {
        return ControllerContext.MyDisplayRouteInfo();
    }

    [Route("[controller]/[action]")]
    public IActionResult About()
    {
        return ControllerContext.MyDisplayRouteInfo();
    }
}
```

```csharp
[Route("[controller]/[action]")]
public class HomeController : Controller
{
    [Route("~/")]
    [Route("/Home")]
    [Route("~/Home/Index")]
    public IActionResult Index()
    {
        return ControllerContext.MyDisplayRouteInfo();
    }

    public IActionResult About()
    {
        return ControllerContext.MyDisplayRouteInfo();
    }
}
```

## Reserved routing names

 - action

 - ```area```

 - controller

 - ```handler```

 - ```page```

```csharp
public class MyDemo2Controller : Controller
{
    [Route("/articles/{page}")]
    public IActionResult ListArticles(int page)
    {
        return ControllerContext.MyDisplayRouteInfo(page);
    }
}
```

 - ```page```

 - using

 - ```namespace```

 - ```inject```

 - ```section```

 - ```inherits```

 - model

 - ```addTagHelper```

 - ```removeTagHelper```

## HTTP verb templates

 - ```[HttpGet]```

 - ```[HttpPost]```

 - ```[HttpPut]```

 - ```[HttpDelete]```

 - ```[HttpHead]```

 - ```[HttpPatch]```

### Route templates

 - All the HTTP verb templates are route templates.

 - ```[Route]```

### Attribute routing with Http verb attributes

```csharp
[Route("api/[controller]")]
[ApiController]
public class Test2Controller : ControllerBase
{
    [HttpGet]   // GET /api/test2
    public IActionResult ListProducts()
    {
        return ControllerContext.MyDisplayRouteInfo();
    }

    [HttpGet("{id}")]   // GET /api/test2/xyz
    public IActionResult GetProduct(string id)
    {
       return ControllerContext.MyDisplayRouteInfo(id);
    }

    [HttpGet("int/{id:int}")] // GET /api/test2/int/3
    public IActionResult GetIntProduct(int id)
    {
        return ControllerContext.MyDisplayRouteInfo(id);
    }

    [HttpGet("int2/{id}")]  // GET /api/test2/int2/3
    public IActionResult GetInt2Product(int id)
    {
        return ControllerContext.MyDisplayRouteInfo(id);
    }
}
```

 - Each action contains the ```[HttpGet]``` attribute, which constrains matching to HTTP ```GET``` requests only.

 - The ```GetProduct``` action includes the "{id}" template, therefore id is appended to the "api/[controller]" template on the controller. The methods template is "api/[controller]/{id}". Therefore this action only matches ```GET``` requests for the ```form``` ```/api/test2/xyz```,/api/test2/123,/api/test2/{any string}, etc.
```csharp
[HttpGet("{id}")]   // GET /api/test2/xyz
public IActionResult GetProduct(string id)
{
   return ControllerContext.MyDisplayRouteInfo(id);
}
```

 - The ```GetIntProduct``` action contains the "int/{id:int}" template. The ```:int``` portion of the template constrains the id route values to strings that can be converted to an integer. A ```GET``` request to ```/api/test2/int/abc```:

   - Doesn't match this action.

   - Returns a 404 Not Found error.
```csharp
[HttpGet("int/{id:int}")] // GET /api/test2/int/3
public IActionResult GetIntProduct(int id)
{
    return ControllerContext.MyDisplayRouteInfo(id);
}
```

 - The ```GetInt2Product``` action contains {id} in the template, but doesn't constrain id to values that can be converted to an integer. A ```GET``` request to ```/api/test2/int2/abc```:

   - Matches this route.

   - Model binding fails to convert ```abc``` to an integer. The id parameter of the method is integer.

   - Returns a 400 Bad Request because model binding failed to convert ```abc``` to an integer.

```csharp
[HttpGet("int2/{id}")]  // GET /api/test2/int2/3
public IActionResult GetInt2Product(int id)
{
    return ControllerContext.MyDisplayRouteInfo(id);
}
```

```csharp
[ApiController]
public class MyProductsController : ControllerBase
{
    [HttpGet("/products3")]
    public IActionResult ListProducts()
    {
        return ControllerContext.MyDisplayRouteInfo();
    }

    [HttpPost("/products3")]
    public IActionResult CreateProduct(MyProduct myProduct)
    {
        return ControllerContext.MyDisplayRouteInfo(myProduct.Name);
    }
}
```

 - The ```MyProductsController.ListProducts``` action runs when the HTTP verb is ```GET```.

 - The ```MyProductsController.CreateProduct``` action runs when the HTTP verb is ```POST```.

```csharp
[ApiController]
public class Products2ApiController : ControllerBase
{
    [HttpGet("/products2/{id}", Name = "Products_List")]
    public IActionResult GetProduct(int id)
    {
        return ControllerContext.MyDisplayRouteInfo(id);
    }
}
```

 - Is run with URL path like ```/products2/3```

 - Isn't run with the URL path ```/products2```.

## Route name

```csharp
[ApiController]
public class Products2ApiController : ControllerBase
{
    [HttpGet("/products2/{id}", Name = "Products_List")]
    public IActionResult GetProduct(int id)
    {
        return ControllerContext.MyDisplayRouteInfo(id);
    }
}
```

 - Have no impact on the URL matching behavior of routing.

 - Are only used for URL generation.

## Combining attribute routes

```csharp
[ApiController]
[Route("products")]
public class ProductsApiController : ControllerBase
{
    [HttpGet]
    public IActionResult ListProducts()
    {
        return ControllerContext.MyDisplayRouteInfo();
    }

    [HttpGet("{id}")]
    public IActionResult GetProduct(int id)
    {
        return ControllerContext.MyDisplayRouteInfo(id);
    }
}
```

 - The URL path ```/products``` can match ```ProductsApi.ListProducts```

 - The URL path ```/products/5``` can match ProductsApi.GetProduct(int).

```csharp
[Route("Home")]
public class HomeController : Controller
{
    [Route("")]
    [Route("Index")]
    [Route("/")]
    public IActionResult Index()
    {
        return ControllerContext.MyDisplayRouteInfo();
    }

    [Route("About")]
    public IActionResult About()
    {
        return ControllerContext.MyDisplayRouteInfo();
    }
}
```

<table><thead>
<tr>
<th>Attribute</th>
<th>Combines with <code>[Route("Home")]</code></th>
<th>Defines route template</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>[Route("")]</code></td>
<td>Yes</td>
<td><code>"Home"</code></td>
</tr>
<tr>
<td><code>[Route("Index")]</code></td>
<td>Yes</td>
<td><code>"Home/Index"</code></td>
</tr>
<tr>
<td><code>[Route("/")]</code></td>
<td><strong>No</strong></td>
<td><code>""</code></td>
</tr>
<tr>
<td><code>[Route("About")]</code></td>
<td>Yes</td>
<td><code>"Home/About"</code></td>
</tr>
</tbody></table>

### Attribute route order

 - The route entries behave as if placed in an ideal ordering.

 - The most specific routes have a chance to execute before the more general routes.

```csharp
public class MyDemoController : Controller
{
    [Route("")]
    [Route("Home")]
    [Route("Home/Index")]
    [Route("Home/Index/{id?}")]
    public IActionResult MyIndex(int? id)
    {
        return ControllerContext.MyDisplayRouteInfo(id);
    }

    [Route("Home/About")]
    [Route("Home/About/{id?}")]
    public IActionResult MyAbout(int? id)
    {
        return ControllerContext.MyDisplayRouteInfo(id);
    }
}
```

```text
AmbiguousMatchException: The request matched multiple endpoints. Matches:

 WebMvcRouting.Controllers.HomeController.Index
 WebMvcRouting.Controllers.MyDemoController.MyIndex
```

```csharp
[Route("")]
[Route("Home", Order = 2)]
[Route("Home/MyIndex")]
public IActionResult MyIndex()
{
    return ControllerContext.MyDisplayRouteInfo();
}
```

 - The preceding code is an example or poor routing design. It was used to illustrate the ```Order``` property.

 - The ```Order``` property only resolves the ambiguity, that template cannot be matched. It would be better to remove the ```[Route("Home")]``` template.

## Token replacement in route templates ```[controller]```, ```[action]```, ```[area]```

```csharp
[Route("[controller]/[action]")]
public class Products0Controller : Controller
{
    [HttpGet]
    public IActionResult List()
    {
        return ControllerContext.MyDisplayRouteInfo();
    }


    [HttpGet("{id}")]
    public IActionResult Edit(int id)
    {
        return ControllerContext.MyDisplayRouteInfo(id);
    }
}
```

```csharp
[HttpGet]
public IActionResult List()
{
    return ControllerContext.MyDisplayRouteInfo();
}
```

 - Matches ```/Products0/List```

```csharp
[HttpGet("{id}")]
public IActionResult Edit(int id)
{
    return ControllerContext.MyDisplayRouteInfo(id);
}
```

 - Matches ```/```Products0/Edit/{id}

```csharp
public class Products20Controller : Controller
{
    [HttpGet("[controller]/[action]")]  // Matches '/Products20/List'
    public IActionResult List()
    {
        return ControllerContext.MyDisplayRouteInfo();
    }

    [HttpGet("[controller]/[action]/{id}")]   // Matches '/Products20/Edit/{id}'
    public IActionResult Edit(int id)
    {
        return ControllerContext.MyDisplayRouteInfo(id);
    }
}
```

```csharp
[ApiController]
[Route("api/[controller]/[action]", Name = "[controller]_[action]")]
public abstract class MyBase2Controller : ControllerBase
{
}

public class Products11Controller : MyBase2Controller
{
    [HttpGet]                      // /api/products11/list
    public IActionResult List()
    {
        return ControllerContext.MyDisplayRouteInfo();
    }

    [HttpGet("{id}")]             //    /api/products11/edit/3
    public IActionResult Edit(int id)
    {
        return ControllerContext.MyDisplayRouteInfo(id);
    }
}
```

### Use a parameter transformer to customize token replacement

```csharp
using System.Text.RegularExpressions;

public class SlugifyParameterTransformer : IOutboundParameterTransformer
{
    public string? TransformOutbound(object? value)
    {
        if (value == null) { return null; }

        return Regex.Replace(value.ToString()!,
                             "([a-z])([A-Z])",
                             "$1-$2",
                             RegexOptions.CultureInvariant,
                             TimeSpan.FromMilliseconds(100)).ToLowerInvariant();
    }
}
```

 - Applies a parameter transformer to all attribute routes in an application.

 - Customizes the attribute route token values as they are replaced.

```csharp
public class SubscriptionManagementController : Controller
{
    [HttpGet("[controller]/[action]")]
    public IActionResult ListAll()
    {
        return ControllerContext.MyDisplayRouteInfo();
    }
}
```

```csharp
using Microsoft.AspNetCore.Mvc.ApplicationModels;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews(options =>
{
    options.Conventions.Add(new RouteTokenTransformerConvention(
                                 new SlugifyParameterTransformer()));
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(name: "default",
               pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
```

> Warning
When using System.Text.RegularExpressions to process untrusted input, pass a timeout. A malicious user can provide input to ```RegularExpressions``` causing a Denial-of-Service attack. ASP.NET Core framework APIs that use ```RegularExpressions``` pass a timeout.

### Multiple attribute routes

```csharp
[Route("[controller]")]
public class Products13Controller : Controller
{
    [Route("")]     // Matches 'Products13'
    [Route("Index")] // Matches 'Products13/Index'
    public IActionResult Index()
    {
        return ControllerContext.MyDisplayRouteInfo();
    }
```

```csharp
[Route("Store")]
[Route("[controller]")]
public class Products6Controller : Controller
{
    [HttpPost("Buy")]       // Matches 'Products6/Buy' and 'Store/Buy'
    [HttpPost("Checkout")]  // Matches 'Products6/Checkout' and 'Store/Checkout'
    public IActionResult Buy()
    {
        return ControllerContext.MyDisplayRouteInfo();
    }
}
```

 - Each action constraint combines with the route template applied to the controller.

```csharp
[Route("api/[controller]")]
public class Products7Controller : ControllerBase
{
    [HttpPut("Buy")]        // Matches PUT 'api/Products7/Buy'
    [HttpPost("Checkout")]  // Matches POST 'api/Products7/Checkout'
    public IActionResult Buy()
    {
        return ControllerContext.MyDisplayRouteInfo();
    }
}
```

### Specifying attribute route optional parameters, ```default``` values, and constraints

```csharp
public class Products14Controller : Controller
{
    [HttpPost("product14/{id:int}")]
    public IActionResult ShowProduct(int id)
    {
        return ControllerContext.MyDisplayRouteInfo(id);
    }
}
```

### Custom route attributes using ```IRouteTemplateProvider```

 - Looks for attributes on controller classes and action methods when the app starts.

 - Uses the attributes that implement ```IRouteTemplateProvider``` to build the initial set of routes.

```csharp
public class MyApiControllerAttribute : Attribute, IRouteTemplateProvider
{
    public string Template => "api/[controller]";
    public int? Order => 2;
    public string Name { get; set; } = string.Empty;
}

[MyApiController]
[ApiController]
public class MyTestApiController : ControllerBase
{
    // GET /api/MyTestApi
    [HttpGet]
    public IActionResult Get()
    {
        return ControllerContext.MyDisplayRouteInfo();
    }
}
```

### Use application model to customize attribute routes

 - Is an object model created at startup in ```Program.cs```.

 - Contains all of the metadata used by ASP.NET Core to route and execute the actions in an app.

 - Can be written to modify the application model to customize how routing behaves.

 - Are read at app startup.

```csharp
public class NamespaceRoutingConvention : Attribute, IControllerModelConvention
{
    private readonly string _baseNamespace;

    public NamespaceRoutingConvention(string baseNamespace)
    {
        _baseNamespace = baseNamespace;
    }

    public void Apply(ControllerModel controller)
    {
        var hasRouteAttributes = controller.Selectors.Any(selector =>
                                                selector.AttributeRouteModel != null);
        if (hasRouteAttributes)
        {
            return;
        }

        var namespc = controller.ControllerType.Namespace;
        if (namespc == null)
            return;
        var template = new StringBuilder();
        template.Append(namespc, _baseNamespace.Length + 1,
                        namespc.Length - _baseNamespace.Length - 1);
        template.Replace('.', '/');
        template.Append("/[controller]/[action]/{id?}");

        foreach (var selector in controller.Selectors)
        {
            selector.AttributeRouteModel = new AttributeRouteModel()
            {
                Template = template.ToString()
            };
        }
    }
}
```

```csharp
public void Apply(ControllerModel controller)
{
    var hasRouteAttributes = controller.Selectors.Any(selector =>
                                            selector.AttributeRouteModel != null);
    if (hasRouteAttributes)
    {
        return;
    }
```

```csharp
[Route("[controller]/[action]/{id?}")]
public class ManagersController : Controller
{
    // /managers/index
    public IActionResult Index()
    {
        var template = ControllerContext.ActionDescriptor.AttributeRouteInfo?.Template;
        return Content($"Index- template:{template}");
    }

    public IActionResult List(int? id)
    {
        var path = Request.Path.Value;
        return Content($"List- Path:{path}");
    }
}
```

 - Does nothing if the controller is attribute routed.

 - Sets the controllers template based on the ```namespace```, with the base ```namespace``` removed.

```csharp
using My.Application.Controllers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews(options =>
{
    options.Conventions.Add(
     new NamespaceRoutingConvention(typeof(HomeController).Namespace!));
});

var app = builder.Build();
```

```csharp
using Microsoft.AspNetCore.Mvc;

namespace My.Application.Admin.Controllers
{
    public class UsersController : Controller
    {
        // GET /admin/controllers/users/index
        public IActionResult Index()
        {
            var fullname = typeof(UsersController).FullName;
            var template = 
                ControllerContext.ActionDescriptor.AttributeRouteInfo?.Template;
            var path = Request.Path.Value;

            return Content($"Path: {path} fullname: {fullname}  template:{template}");
        }

        public IActionResult List(int? id)
        {
            var path = Request.Path.Value;
            return Content($"Path: {path} ID:{id}");
        }
    }
}
```

 - The base ```namespace``` is ```My.Application```.

 - The full name of the preceding controller is ```My.Application.Admin.Controllers.UsersController```.

 - The ```NamespaceRoutingConvention``` sets the controllers template to Admin/Controllers/Users/[action]/{id?.

```csharp
[NamespaceRoutingConvention("My.Application")]
public class TestController : Controller
{
    // /admin/controllers/test/index
    public IActionResult Index()
    {
        var template = ControllerContext.ActionDescriptor.AttributeRouteInfo?.Template;
        var actionname = ControllerContext.ActionDescriptor.ActionName;
        return Content($"Action- {actionname} template:{template}");
    }

    public IActionResult List(int? id)
    {
        var path = Request.Path.Value;
        return Content($"List- Path:{path}");
    }
}
```

## Mixed routing: Attribute routing vs conventional routing

## Routing with special characters

```csharp
[HttpGet("{id?}/name")]
public async Task<ActionResult<string>> GetName(string id)
{
    var todoItem = await _context.TodoItems.FindAsync(id);

    if (todoItem == null || todoItem.Name == null)
    {
        return NotFound();
    }

    return todoItem.Name;
}
```

<table><thead>
<tr>
<th>ASCII</th>
<th>Encoded</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>/</code></td>
<td><code>%2F</code></td>
</tr>
<tr>
<td><code> </code></td>
<td><code>+</code></td>
</tr>
</tbody></table>

## URL Generation and ambient values

```csharp
public class UrlGenerationController : Controller
{
    public IActionResult Source()
    {
        // Generates /UrlGeneration/Destination
        var url = Url.Action("Destination");
        return ControllerContext.MyDisplayRouteInfo("", $" URL = {url}");
    }

    public IActionResult Destination()
    {
        return ControllerContext.MyDisplayRouteInfo();
    }
}
```

 - The route values from the current request, which are called ambient values.

 - The values passed to ```Url.Action``` and substituting those values into the route template:

```text
ambient values: { controller = "UrlGeneration", action = "Source" }
values passed to Url.Action: { controller = "UrlGeneration", action = "Destination" }
route template: {controller}/{action}/{id?}

result: /UrlGeneration/Destination
```

 - Use a ```default``` value if it has one.

 - Be skipped if it's optional. For example, the id from the  route template {controller}/{action}/{id?}.

 - The route values are used to expand a template.

 - The route values for controller and action usually appear in that template. This works because the URLs matched by routing adhere to a convention.

```csharp
public class UrlGenerationAttrController : Controller
{
    [HttpGet("custom")]
    public IActionResult Source()
    {
        var url = Url.Action("Destination");
        return ControllerContext.MyDisplayRouteInfo("", $" URL = {url}");
    }

    [HttpGet("custom/url/to/destination")]
    public IActionResult Destination()
    {
       return ControllerContext.MyDisplayRouteInfo();
    }
}
```

### Generating URLs by action name

 - The value of controller and action are part of both ambient values and values. The method ```Url.Action``` always uses the current values of action and controller and generates a URL path that routes to the current action.

 - Routing has enough information to generate a URL without any additional values.

 - Routing has enough information because all route parameters have a value.

 - The value { ```d = David``` } is ignored.

 - The generated URL path is ```Alice/Bob/Carol/Donovan```.

 - Both of the values { ```c = Carol, d = David``` } are ignored.

 - There is no longer a value for ```d``` and URL generation fails.

 - The desired values of ```c``` and ```d``` must be specified to generate a URL.

 - By convention is usually an object of anonymous type.

 - Can be an IDictionary<> or a POCO).

```csharp
public IActionResult Index()
{
    var url = Url.Action("Buy", "Products", new { id = 17, color = "red" });
    return Content(url!);
}
```

```csharp
public IActionResult Index2()
{
    var url = Url.Action("Buy", "Products", new { id = 17 }, protocol: Request.Scheme);
    // Returns https://localhost:5001/Products/Buy/17
    return Content(url!);
}
```

 - An overload that accepts a ```protocol```. For example, the preceding code.

 - ```LinkGenerator.GetUriByAction```, which generates absolute URIs by ```default```.

### Generate URLs by route

 - Specifies a route name to generate the URL.

 - Generally doesn't specify a controller or action name.

```csharp
public class UrlGeneration2Controller : Controller
{
    [HttpGet("")]
    public IActionResult Source()
    {
        var url = Url.RouteUrl("Destination_Route");
        return ControllerContext.MyDisplayRouteInfo("", $" URL = {url}");
    }

    [HttpGet("custom/url/to/destination2", Name = "Destination_Route")]
    public IActionResult Destination()
    {
        return ControllerContext.MyDisplayRouteInfo();
    }
```

```cshtml
<h1>Test Links</h1>

<ul>
    <li><a href="@Url.RouteUrl("Destination_Route")">Test Destination_Route</a></li>
</ul>
```

### Generate URLs in HTML and Razor

### URL generation in Action Results

```csharp
[HttpPost]
[ValidateAntiForgeryToken]
public IActionResult Edit(int id, Customer customer)
{
    if (ModelState.IsValid)
    {
        // Update DB with new details.
        ViewData["Message"] = $"Successful edit of customer {id}";
        return RedirectToAction("Index");
    }
    return View(customer);
}
```

### Special case for dedicated conventional routes

```csharp
app.MapControllerRoute(name: "blog",
                pattern: "blog/{*article}",
                defaults: new { controller = "Blog", action = "Article" });
app.MapControllerRoute(name: "default",
               pattern: "{controller=Home}/{action=Index}/{id?}");
```

## Areas

 - Routing ```namespace``` for controller actions.

 - Folder structure for views.

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{    
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapAreaControllerRoute("blog_route", "Blog",
        "Manage/{controller}/{action}/{id?}");
app.MapControllerRoute("default_route", "{controller}/{action}/{id?}");

app.Run();
```

```csharp
app.MapControllerRoute("blog_route", "Manage/{controller}/{action}/{id?}",
        defaults: new { area = "Blog" }, constraints: new { area = "Blog" });
app.MapControllerRoute("default_route", "{controller}/{action}/{id?}");
```

```csharp
using Microsoft.AspNetCore.Mvc;

namespace MyApp.Namespace1
{
    [Area("Blog")]
    public class UsersController : Controller
    {
        // GET /manage/users/adduser
        public IActionResult AddUser()
        {
            var area = ControllerContext.ActionDescriptor.RouteValues["area"];
            var actionName = ControllerContext.ActionDescriptor.ActionName;
            var controllerName = ControllerContext.ActionDescriptor.ControllerName;

            return Content($"area name:{area}" +
                $" controller:{controllerName}  action name: {actionName}");
        }        
    }
}
```

```csharp
using Microsoft.AspNetCore.Mvc;

namespace MyApp.Namespace1
{
    [Area("Blog")]
    public class UsersController : Controller
    {
        // GET /manage/users/adduser
        public IActionResult AddUser()
        {
            var area = ControllerContext.ActionDescriptor.RouteValues["area"];
            var actionName = ControllerContext.ActionDescriptor.ActionName;
            var controllerName = ControllerContext.ActionDescriptor.ControllerName;

            return Content($"area name:{area}" +
                $" controller:{controllerName}  action name: {actionName}");
        }        
    }
}
```

```csharp
using Microsoft.AspNetCore.Mvc;

namespace MyApp.Namespace2
{
    // Matches { area = Zebra, controller = Users, action = AddUser }
    [Area("Zebra")]
    public class UsersController : Controller
    {
        // GET /zebra/users/adduser
        public IActionResult AddUser()
        {
            var area = ControllerContext.ActionDescriptor.RouteValues["area"];
            var actionName = ControllerContext.ActionDescriptor.ActionName;
            var controllerName = ControllerContext.ActionDescriptor.ControllerName;

            return Content($"area name:{area}" +
                $" controller:{controllerName}  action name: {actionName}");
        }        
    }
}
```

```csharp
using Microsoft.AspNetCore.Mvc;

namespace MyApp.Namespace3
{
    // Matches { area = string.Empty, controller = Users, action = AddUser }
    // Matches { area = null, controller = Users, action = AddUser }
    // Matches { controller = Users, action = AddUser }
    public class UsersController : Controller
    {
        // GET /users/adduser
        public IActionResult AddUser()
        {
            var area = ControllerContext.ActionDescriptor.RouteValues["area"];
            var actionName = ControllerContext.ActionDescriptor.ActionName;
            var controllerName = ControllerContext.ActionDescriptor.ControllerName;

            return Content($"area name:{area}" +
                $" controller:{controllerName}  action name: {actionName}");
        }
    }
}
```

```csharp
app.MapAreaControllerRoute(name: "duck_route",
                                     areaName: "Duck",
                                     pattern: "Manage/{controller}/{action}/{id?}");
app.MapControllerRoute(name: "default",
                             pattern: "Manage/{controller=Home}/{action=Index}/{id?}");
```

```csharp
using Microsoft.AspNetCore.Mvc;

namespace MyApp.Namespace4
{
    [Area("Duck")]
    public class UsersController : Controller
    {
        // GET /Manage/users/GenerateURLInArea
        public IActionResult GenerateURLInArea()
        {
            // Uses the 'ambient' value of area.
            var url = Url.Action("Index", "Home");
            // Returns /Manage/Home/Index
            return Content(url);
        }

        // GET /Manage/users/GenerateURLOutsideOfArea
        public IActionResult GenerateURLOutsideOfArea()
        {
            // Uses the empty value for area.
            var url = Url.Action("Index", "Home", new { area = "" });
            // Returns /Manage
            return Content(url);
        }
    }
}
```

```csharp
public class HomeController : Controller
{
    public IActionResult About()
    {
        var url = Url.Action("AddUser", "Users", new { Area = "Zebra" });
        return Content($"URL: {url}");
    }
```

## Action definition

## Sample code

 - MyDisplayRouteInfo is provided by the Rick.Docs.Samples.RouteInfo NuGet package and displays route information.

 - View or download sample code (how to download)

## ```Debug``` diagnostics

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Debug",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  }
}
```

 Ref: ```[```Routing to controller actions in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/routing?view=aspnetcore-8.0)