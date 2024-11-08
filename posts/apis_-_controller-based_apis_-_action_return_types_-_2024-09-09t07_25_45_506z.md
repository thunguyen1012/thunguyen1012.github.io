---
title: APIs - Controller-based APIs - Action return types
published: true
date: 2024-09-09 07:25:45
tags: Summary, AspNetCore
description: 
image:
---

## In this article

 - Specific type

 - ```IActionResult```

 - ```ActionResult<T>```

 - ```HttpResults```

## Specific type

```csharp
[HttpGet]
public Task<List<Product>> Get() =>
    _productContext.Products.OrderBy(p => p.Name).ToListAsync();
```

### Return ```IEnumerable```<T> or IAsyncEnumerable<T>

 - When using ```System.Text.Json``` formatter, MVC relies on the support that ```System.Text.Json``` added to stream the result.

 - When using ```Newtonsoft.Json``` or with ```XML-based``` formatters the result is buffered.

```csharp
[HttpGet("syncsale")]
public IEnumerable<Product> GetOnSaleProducts()
{
    var products = _productContext.Products.OrderBy(p => p.Name).ToList();

    foreach (var product in products)
    {
        if (product.IsOnSale)
        {
            yield return product;
        }
    }
}
```

```csharp
[HttpGet("asyncsale")]
public async IAsyncEnumerable<Product> GetOnSaleProductsAsync()
{
    var products = _productContext.Products.OrderBy(p => p.Name).AsAsyncEnumerable();

    await foreach (var product in products)
    {
        if (product.IsOnSale)
        {
            yield return product;
        }
    }
}
```

## ```IActionResult``` type

### Synchronous action

```csharp
[HttpGet("{id}")]
[ProducesResponseType<Product>(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public IActionResult GetById_IActionResult(int id)
{
    var product = _productContext.Products.Find(id);
    return product == null ? NotFound() : Ok(product);
}
```

 - A 404 status code is returned when the product represented by ```id``` doesn't exist in the underlying data store. The NotFound convenience method is invoked as shorthand for return new NotFoundResult();.

 - A 200 status code is returned with the ```Product``` object when the product does exist. The Ok convenience method is invoked as shorthand for return new OkObjectResult(product);.

### Asynchronous action

```csharp
[HttpPost()]
[Consumes(MediaTypeNames.Application.Json)]
[ProducesResponseType(StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
public async Task<IActionResult> CreateAsync_IActionResult(Product product)
{
    if (product.Description.Contains("XYZ Widget"))
    {
        return BadRequest();
    }

    _productContext.Products.Add(product);
    await _productContext.SaveChangesAsync();

    return CreatedAtAction(nameof(CreateAsync_IActionResult), new { id = product.Id }, product);
}
```

 - A 400 status code is returned when the product description contains "XYZ Widget". The BadRequest convenience method is invoked as shorthand for return new BadRequestResult();.

 - A 201 status code is generated by the ```CreatedAtAction``` convenience method when a product is created. The following code is an alternative to calling

```csharp
return new CreatedAtActionResult(nameof(CreateAsync), 
                                "Products", 
                                new { id = product.Id }, 
                                product);
```

In the preceding code path, the ```Product``` object is provided in the response body. A ```Location``` response header containing the newly created product's URL is provided.

```csharp
public class Product
{
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    public bool IsOnSale { get; set; }
}
```

## ```ActionResult``` vs ```IActionResult```

### ```ActionResult<T>``` type

 - The `[ProducesResponseType]` attribute's ```Type``` property can be excluded. For example, `[ProducesResponseType(200, Type = typeof(Product))]` is simplified to `[ProducesResponseType(200)]`. The action's expected return type is inferred from the ```T``` in ```ActionResult<T>```.

 - Implicit cast operators support the conversion of both ```T``` and ```ActionResult``` to ```ActionResult<T>```. ```T``` converts to ObjectResult, which means return new ObjectResult(T); is simplified to return ```T```;.

```csharp
[HttpGet]
public ActionResult<IEnumerable<Product>> Get() =>
    _repository.GetProducts();
```

### Synchronous action

```csharp
[HttpGet("{id}")]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public ActionResult<Product> GetById_ActionResultOfT(int id)
{
    var product = _productContext.Products.Find(id);
    return product == null ? NotFound() : product;
}
```

 - A 404 status code is returned when the product doesn't exist in the database.

 - A 200 status code is returned with the corresponding ```Product``` object when the product does exist.

### Asynchronous action

```csharp
[HttpPost()]
[Consumes(MediaTypeNames.Application.Json)]
[ProducesResponseType(StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
public async Task<ActionResult<Product>> CreateAsync_ActionResultOfT(Product product)
{
    if (product.Description.Contains("XYZ Widget"))
    {
        return BadRequest();
    }

    _productContext.Products.Add(product);
    await _productContext.SaveChangesAsync();

    return CreatedAtAction(nameof(CreateAsync_ActionResultOfT), new { id = product.Id }, product);
}
```

 - A 400 status code (BadRequest) is returned by the ASP.NET Core runtime when:

   - The `[ApiController]` attribute has been applied and model validation fails.

   - The product description contains "XYZ Widget".

 - A 201 status code is generated by the ```CreatedAtAction``` method when a product is created. In this code path, the ```Product``` object is provided in the response body. A ```Location``` response header containing the newly created product's URL is provided.

## ```HttpResults``` type

 - Are a results implementation that is processed by a call to ```IResult```.ExecuteAsync.

 - Does not leverage the configured Formatters. Not leveraging the configured formatters means:

   - Some features like ```Content negotiation``` aren't available.

   - The produced ```Content-Type``` is decided by the ```HttpResults``` implementation.

### ```IResult``` type

```csharp
[HttpGet("{id}")]
[ProducesResponseType<Product>(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public IResult GetById(int id)
{
    var product = _productContext.Products.Find(id);
    return product == null ? Results.NotFound() : Results.Ok(product);
}
```

 - A 404 status code is returned when the product doesn't exist in the database.

 - A 200 status code is returned with the corresponding ```Product``` object when the product does exist, generated by the `Results.Ok<T>()`.

```csharp
[HttpPost]
[Consumes(MediaTypeNames.Application.Json)]
[ProducesResponseType<Product>(StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
public async Task<IResult> CreateAsync(Product product)
{
    if (product.Description.Contains("XYZ Widget"))
    {
        return Results.BadRequest();
    }

    _productContext.Products.Add(product);
    await _productContext.SaveChangesAsync();

    var location = Url.Action(nameof(CreateAsync), new { id = product.Id }) ?? $"/{product.Id}";
    return Results.Created(location, product);
}
```

 - A 400 status code is returned when:

   - The `[ApiController]` attribute has been applied and model validation fails.

   - The product description contains "XYZ Widget".

 - A 201 status code is generated by the ```Results.Create``` method when a product is created. In this code path, the ```Product``` object is provided in the response body. A ```Location``` response header containing the newly created product's URL is provided.

### `Results<TResult1, TResultN>` type

 - All the `[ProducesResponseType]` attributes can be excluded, since the ```HttpResult``` implementation contributes automatically to the endpoint metadata.

```csharp
[HttpGet("{id}")]
public Results<NotFound, Ok<Product>> GetById(int id)
{
    var product = _productContext.Products.Find(id);
    return product == null ? TypedResults.NotFound() : TypedResults.Ok(product);
}
```

 - A 404 status code is returned when the product doesn't exist in the database.

 - A 200 status code is returned with the corresponding ```Product``` object when the product does exist, generated by the `TypedResults.Ok<T>`.

```csharp
[HttpPost]
public async Task<Results<BadRequest, Created<Product>>> CreateAsync(Product product)
{
    if (product.Description.Contains("XYZ Widget"))
    {
        return TypedResults.BadRequest();
    }

    _productContext.Products.Add(product);
    await _productContext.SaveChangesAsync();

    var location = Url.Action(nameof(CreateAsync), new { id = product.Id }) ?? $"/{product.Id}";
    return TypedResults.Created(location, product);
}
```

 - A 400 status code is returned when:

   - The `[ApiController]` attribute was applied and model validation fails.

   - The product description contains "XYZ Widget".

 - A 201 status code is generated by the ```TypedResults.Created``` method when a product is created. In this code path, the ```Product``` object is provided in the response body. A ```Location``` response header containing the newly created product's URL is provided.

## Additional resources

 - Handle requests with controllers in ASP.NET Core MVC

 - Model validation in ASP.NET Core MVC

 - ASP.NET Core web API documentation with Swagger / OpenAPI

Ref: [Controller action return types in ASP.NET Core web API](https://learn.microsoft.com/en-us/aspnet/core/web-api/action-return-types?view=aspnetcore-8.0)