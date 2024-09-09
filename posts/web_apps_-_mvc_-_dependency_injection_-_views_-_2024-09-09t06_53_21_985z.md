---
title: Web apps - MVC - Dependency injection - views
published: true
date: 2024-09-09 06:53:21
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## Configuration injection

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "MyRoot": {
    "MyParent": {
      "MyChildName": "Joe"
    }
  }
}
```

```cshtml
@page
@model PrivacyModel
@using Microsoft.Extensions.Configuration
@inject IConfiguration Configuration
@{
    ViewData["Title"] = "Privacy RP";
}
<h1>@ViewData["Title"]</h1>

<p>PR Privacy</p>

<h2>
   MyRoot:MyParent:MyChildName: @Configuration["MyRoot:MyParent:MyChildName"]
</h2>
```

```cshtml
@using Microsoft.Extensions.Configuration
@inject IConfiguration Configuration
@{
    ViewData["Title"] = "Privacy MVC";
}
<h1>@ViewData["Title"]</h1>

<p>MVC Use this page to detail your site's privacy policy.</p>

<h2>
   MyRoot:MyParent:MyChildName: @Configuration["MyRoot:MyParent:MyChildName"]
</h2>
```

## Service injection

```cshtml
@using System.Threading.Tasks
@using ViewInjectSample.Model
@using ViewInjectSample.Model.Services
@model IEnumerable<ToDoItem>
@inject StatisticsService StatsService
<!DOCTYPE html>
<html>
<head>
    <title>To Do Items</title>
</head>
<body>
    <div>
        <h1>To Do Items</h1>
        <ul>
            <li>Total Items: @StatsService.GetCount()</li>
            <li>Completed: @StatsService.GetCompletedCount()</li>
            <li>Avg. Priority: @StatsService.GetAveragePriority()</li>
        </ul>
        <table>
            <tr>
                <th>Name</th>
                <th>Priority</th>
                <th>Is Done?</th>
            </tr>
            @foreach (var item in Model)
            {
                <tr>
                    <td>@item.Name</td>
                    <td>@item.Priority</td>
                    <td>@item.IsDone</td>
                </tr>
            }
        </table>
    </div>
</body>
</html>
```

```csharp
using ViewInjectSample.Helpers;
using ViewInjectSample.Infrastructure;
using ViewInjectSample.Interfaces;
using ViewInjectSample.Model.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages();

builder.Services.AddTransient<IToDoItemRepository, ToDoItemRepository>();
builder.Services.AddTransient<StatisticsService>();
builder.Services.AddTransient<ProfileOptionsService>();
builder.Services.AddTransient<MyHtmlHelper>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.MapRazorPages();

app.MapDefaultControllerRoute();


app.Run();
```

```csharp
using System.Linq;
using ViewInjectSample.Interfaces;

namespace ViewInjectSample.Model.Services
{
    public class StatisticsService
    {
        private readonly IToDoItemRepository _toDoItemRepository;

        public StatisticsService(IToDoItemRepository toDoItemRepository)
        {
            _toDoItemRepository = toDoItemRepository;
        }

        public int GetCount()
        {
            return _toDoItemRepository.List().Count();
        }

        public int GetCompletedCount()
        {
            return _toDoItemRepository.List().Count(x => x.IsDone);
        }

        public double GetAveragePriority()
        {
            if (_toDoItemRepository.List().Count() == 0)
            {
                return 0.0;
            }

            return _toDoItemRepository.List().Average(x => x.Priority);
        }
    }
}
```

![To Do view listing total items, completed items, average priority, and a list of tasks with their priority levels and boolean values indicating completion.!](https://learn.microsoft.com/en-us/aspnet/core/mvc/views/dependency-injection/_static/screenshot.png?view=aspnetcore-8.0 "To Do view listing total items, completed items, average priority, and a list of tasks with their priority levels and boolean values indicating completion.")

## Populating Lookup Data

 - Request data access services for each of the sets of options.

 - Populate a model or ```ViewBag``` with each set of options to be bound.

```csharp
using Microsoft.AspNetCore.Mvc;
using ViewInjectSample.Model;

namespace ViewInjectSample.Controllers;

public class ProfileController : Controller
{
    public IActionResult Index()
    {
        // A real app would up profile based on the user.
        var profile = new Profile()
        {
            Name = "Rick",
            FavColor = "Blue",
            Gender = "Male",
            State = new State("Ohio","OH")
        };
        return View(profile);
    }
}
```

![Update Profile view with a form allowing the entry of name, gender, state, and favorite Color.!](https://learn.microsoft.com/en-us/aspnet/core/mvc/views/dependency-injection/_static/updateprofile.png?view=aspnetcore-8.0 "Update Profile view with a form allowing the entry of name, gender, state, and favorite Color.")

```cshtml
@using System.Threading.Tasks
@using ViewInjectSample.Model.Services
@model ViewInjectSample.Model.Profile
@inject ProfileOptionsService Options
<!DOCTYPE html>
<html>
<head>
    <title>Update Profile</title>
</head>
<body>
<div>
    <h1>Update Profile</h1>
    Name: @Html.TextBoxFor(m => m.Name)
    <br/>
    Gender: @Html.DropDownList("Gender",
           Options.ListGenders().Select(g => 
                new SelectListItem() { Text = g, Value = g }))
    <br/>

    State: @Html.DropDownListFor(m => m.State!.Code,
           Options.ListStates().Select(s => 
                new SelectListItem() { Text = s.Name, Value = s.Code}))
    <br />

    Fav. Color: @Html.DropDownList("FavColor",
           Options.ListColors().Select(c => 
                new SelectListItem() { Text = c, Value = c }))
    </div>
</body>
</html>
```

```csharp
namespace ViewInjectSample.Model.Services;

public class ProfileOptionsService
{
    public List<string> ListGenders()
    {
        // Basic sample
        return new List<string>() {"Female", "Male"};
    }

    public List<State> ListStates()
    {
        // Add a few states
        return new List<State>()
        {
            new State("Alabama", "AL"),
            new State("Alaska", "AK"),
            new State("Ohio", "OH")
        };
    }

    public List<string> ListColors()
    {
        return new List<string>() { "Blue","Green","Red","Yellow" };
    }
}
```

## Overriding Services

![Intellisense contextual menu on a typed @ symbol listing Html, Component, StatsService, and Url fields!](https://learn.microsoft.com/en-us/aspnet/core/mvc/views/dependency-injection/_static/razor-fields.png?view=aspnetcore-8.0 "Intellisense contextual menu on a typed @ symbol listing Html, Component, StatsService, and Url fields")

```cshtml
@using System.Threading.Tasks
@using ViewInjectSample.Helpers
@inject MyHtmlHelper Html
<!DOCTYPE html>
<html>
<head>
    <title>My Helper</title>
</head>
<body>
    <div>
        Test: @Html.Value
    </div>
</body>
</html>
```

## See Also

 - Simon Timms Blog: Getting Lookup Data Into Your View

Ref: [Dependency injection into views in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/mvc/views/dependency-injection?view=aspnetcore-8.0)