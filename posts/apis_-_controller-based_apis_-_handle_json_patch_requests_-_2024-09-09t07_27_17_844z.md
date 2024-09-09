---
title: APIs - Controller-based APIs - Handle JSON Patch requests
published: true
date: 2024-09-09 07:27:17
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## Package installation

 - Install the ```Microsoft.AspNetCore.Mvc.NewtonsoftJson``` NuGet package.

 - Call ```AddNewtonsoftJson```. For example:
```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddNewtonsoftJson();

var app = builder.Build();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
```

 - AddRazorPages

 - AddControllersWithViews

 - AddControllers

## Add support for JSON Patch when using ```System.Text.Json```

 - Install the ```Microsoft.AspNetCore.Mvc.NewtonsoftJson``` NuGet package.

 - Update ```Program.cs```:

```csharp
using JsonPatchSample;
using Microsoft.AspNetCore.Mvc.Formatters;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(options =>
{
    options.InputFormatters.Insert(0, MyJPIF.GetJsonPatchInputFormatter());
});

var app = builder.Build();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
```

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Extensions.Options;

namespace JsonPatchSample;

public static class MyJPIF
{
    public static NewtonsoftJsonPatchInputFormatter GetJsonPatchInputFormatter()
    {
        var builder = new ServiceCollection()
            .AddLogging()
            .AddMvc()
            .AddNewtonsoftJson()
            .Services.BuildServiceProvider();

        return builder
            .GetRequiredService<IOptions<MvcOptions>>()
            .Value
            .InputFormatters
            .OfType<NewtonsoftJsonPatchInputFormatter>()
            .First();
    }
}
```

 - ```NewtonsoftJsonPatchInputFormatter``` processes JSON Patch requests.

 - The existing ```System.Text.Json```-based input and formatters process all other JSON requests and responses.

## ```PATCH``` HTTP request method

## JSON Patch

### Resource example

```json
{
  "customerName": "John",
  "orders": [
    {
      "orderName": "Order0",
      "orderType": null
    },
    {
      "orderName": "Order1",
      "orderType": null
    }
  ]
}
```

### JSON patch example

```json
[
  {
    "op": "add",
    "path": "/customerName",
    "value": "Barry"
  },
  {
    "op": "add",
    "path": "/orders/-",
    "value": {
      "orderName": "Order2",
      "orderType": null
    }
  }
]
```

 - The ```op``` property indicates the type of operation.

 - The ```path``` property indicates the element to update.

 - The ```value``` property provides the new ```value```.

### Resource after patch

```json
{
  "customerName": "Barry",
  "orders": [
    {
      "orderName": "Order0",
      "orderType": null
    },
    {
      "orderName": "Order1",
      "orderType": null
    },
    {
      "orderName": "Order2",
      "orderType": null
    }
  ]
}
```

## Path syntax

### Operations

<table><thead>
<tr>
<th>Operation</th>
<th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>add</code></td>
<td>Add a property or array element. For existing property: set ```value```.</td>
</tr>
<tr>
<td><code>remove</code></td>
<td>Remove a property or array element.</td>
</tr>
<tr>
<td><code>replace</code></td>
<td>Same as <code>remove</code> followed by <code>add</code> at same location.</td>
</tr>
<tr>
<td><code>move</code></td>
<td>Same as <code>remove</code> ```from``` source followed by <code>add</code> to destination using ```value``` ```from``` source.</td>
</tr>
<tr>
<td><code>copy</code></td>
<td>Same as <code>add</code> to destination using ```value``` ```from``` source.</td>
</tr>
<tr>
<td><code>test</code></td>
<td>Return success status code if ```value``` at <code>path</code> = provided <code>value</code>.</td>
</tr>
</tbody></table>

## JSON Patch in ASP.NET Core

## Action method code

 - Is annotated with the ```HttpPatch``` attribute.

 - Accepts a `JsonPatchDocument<TModel>`, typically with [FromBody].

 - Calls ```ApplyTo(Object)``` on the patch document to apply the changes.

```csharp
[HttpPatch]
public IActionResult JsonPatchWithModelState(
    [FromBody] JsonPatchDocument<Customer> patchDoc)
{
    if (patchDoc != null)
    {
        var customer = CreateCustomer();

        patchDoc.ApplyTo(customer, ModelState);

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        return new ObjectResult(customer);
    }
    else
    {
        return BadRequest(ModelState);
    }
}
```

```csharp
namespace JsonPatchSample.Models;

public class Customer
{
    public string? CustomerName { get; set; }
    public List<Order>? Orders { get; set; }
}
```

```csharp
namespace JsonPatchSample.Models;

public class Order
{
    public string OrderName { get; set; }
    public string OrderType { get; set; }
}
```

 - Constructs a ```Customer```.

 - Applies the patch.

 - Returns the result in the body of the response.

### Model state

```json
{
  "Customer": [
    "The current value 'John' at path 'customerName' != test value 'Nancy'."
  ]
}
```

### Dynamic objects

```csharp
[HttpPatch]
public IActionResult JsonPatchForDynamic([FromBody]JsonPatchDocument patch)
{
    dynamic obj = new ExpandoObject();
    patch.ApplyTo(obj);

    return Ok(obj);
}
```

## The ```add``` operation

 - If ```path``` points to an array element: inserts new element before the one specified by ```path```.

 - If ```path``` points to a property: sets the property ```value```.

 - If ```path``` points to a nonexistent location:

   - If the resource to patch is a dynamic object: adds a property.

   - If the resource to patch is a static object: the request fails.

```json
[
  {
    "op": "add",
    "path": "/customerName",
    "value": "Barry"
  },
  {
    "op": "add",
    "path": "/orders/-",
    "value": {
      "orderName": "Order2",
      "orderType": null
    }
  }
]
```

## The ```remove``` operation

 - If ```path``` points to an array element: removes the element.

 - If ```path``` points to a property:

   - If resource to patch is a dynamic object: removes the property.

   - If resource to patch is a static object:

     - If the property is nullable: sets it to null.

     - If the property is non-nullable, sets it to default<T>.

```json
[
  {
    "op": "remove",
    "path": "/customerName"
  },
  {
    "op": "remove",
    "path": "/orders/0"
  }
]
```

## The ```replace``` operation

```json
[
  {
    "op": "replace",
    "path": "/customerName",
    "value": "Barry"
  },
  {
    "op": "replace",
    "path": "/orders/0",
    "value": {
      "orderName": "Order2",
      "orderType": null
    }
  }
]
```

## The ```move``` operation

 - If ```path``` points to an array element: copies ```from``` element to location of ```path``` element, then runs a ```remove``` operation on the ```from``` element.

 - If ```path``` points to a property: copies ```value``` of ```from``` property to ```path``` property, then runs a ```remove``` operation on the ```from``` property.

 - If ```path``` points to a nonexistent property:

   - If the resource to patch is a static object: the request fails.

   - If the resource to patch is a dynamic object: copies ```from``` property to location indicated by ```path```, then runs a ```remove``` operation on the ```from``` property.

 - Copies the ```value``` of ```Orders[0].OrderName``` to ```CustomerName```.

 - Sets ```Orders[0].OrderName``` to null.

 - Moves ```Orders```[1] to before ```Orders```[0].

```json
[
  {
    "op": "move",
    "from": "/orders/0/orderName",
    "path": "/customerName"
  },
  {
    "op": "move",
    "from": "/orders/1",
    "path": "/orders/0"
  }
]
```

## The ```copy``` operation

 - Copies the ```value``` of ```Orders[0].OrderName``` to ```CustomerName```.

 - Inserts a ```copy``` of ```Orders[1]``` before ```Orders[0]```.

```json
[
  {
    "op": "copy",
    "from": "/orders/0/orderName",
    "path": "/customerName"
  },
  {
    "op": "copy",
    "from": "/orders/1",
    "path": "/orders/0"
  }
]
```

## The ```test``` operation

```json
[
  {
    "op": "test",
    "path": "/customerName",
    "value": "Nancy"
  },
  {
    "op": "add",
    "path": "/customerName",
    "value": "Barry"
  }
]
```

## Get the code

 - URL: ```http://localhost:{port}/jsonpatch/jsonpatchwithmodelstate```

 - HTTP method: ```PATCH```

 - Header: ```Content-Type: application/json-patch+json```

 - Body: Copy and paste one of the JSON patch document samples ```from``` the JSON project folder.

## Additional resources

 - IETF RFC 5789 ```PATCH``` method specification

 - IETF RFC 6902 JSON Patch specification

 - IETF RFC 6901 JSON Pointer

 - JSON Patch documentation. Includes links to resources for creating JSON Patch documents.

 - ASP.NET Core JSON Patch source code

Ref: [JsonPatch in ASP.NET Core web API](https://learn.microsoft.com/en-us/aspnet/core/web-api/jsonpatch?view=aspnetcore-8.0)