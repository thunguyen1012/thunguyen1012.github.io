---
title: Web apps - Blazor - Tooling
published: true
date: 2024-09-09 06:53:22
tags: Summary, AspNetCore
description: This article describes tools for building Blazor apps using several tools:
image:
---

## In this article

This article describes tools for building Blazor apps using several tools:

- Visual Studio (VS): The most comprehensive integrated development environment (IDE) for .NET developers on Windows. Includes an array of tools and features to elevate and enhance every stage of software development.

- Visual Studio Code (VS Code) is an open source, cross-platform code editor that can be used to develop Blazor apps.

- .NET CLI: The .NET command-line interface (CLI) is a cross-platform toolchain for developing, building, running, and publishing .NET applications. The .NET CLI is included with the .NET SDK and runs on any platform supported by the SDK.

Select the pivot of this article that matches your tooling choice.

  - Install the latest version of Visual Studio with the ASP.NET and web development workload.

  - Create a new project using one of the available Blazor templates:

    - Blazor Web App: Creates a Blazor web app that supports interactive server-side rendering (interactive SSR) and client-side rendering (CSR). The Blazor Web App template is recommended for getting started with Blazor to learn about server-side and client-side Blazor features.

    - Blazor WebAssembly Standalone App: Creates a standalone client web app that can be deployed as a static site.

 - Provide a Project name and confirm that the Location is correct.

 - For more information on the options in the Additional information dialog, see the Blazor project templates and template options section.

> Note
The hosted Blazor WebAssembly project template isn't available in ASP.NET Core 8.0 or later. To create a hosted Blazor WebAssembly app, a Framework option earlier than .NET 8.0 must be selected with the ASP.NET Core Hosted checkbox.

 - Select Create.

 - Open VS Code.

 - Go to the Explorer view and select the Create .NET Project button. Alternatively, you can bring up the Command Palette using Ctrl+Shift+P, and then type ".NET" and find and select the .NET: New Project command.

 - Select the Blazor project template from the list.

 - In the Project Location dialog, create or select a folder for the project.

 - In the Command Palette, provide a name for the project or accept the default name.

 - Select Create project to create the project or adjust the project's options by selecting Show all template options. For more information on the templates and options, see the Blazor project templates and template options section.

 - Press F5 on the keyboard to run the app with the debugger or Ctrl+F5 to run the app without the debugger.
The Command Palette asks you to select a debugger. Select C# from the list.
Next, select the ```https``` launch configuration.

 - To stop the app, press Shift+F5 on the keyboard.

```dotnetcli
dotnet --version
```

  - Change to the directory using the ```cd``` command to where you want to create the project folder (for example, ```cd c:/users/Bernie_Kopell/Documents```).

  - For a Blazor Web App experience with default interactive server-side rendering (interactive SSR), execute the following command:

```dotnetcli
dotnet new blazor -o BlazorApp
```

  - For a standalone Blazor WebAssembly experience, execute the following command in a command shell that uses the ```blazorwasm``` template:

```dotnetcli
dotnet new blazorwasm -o BlazorApp
```

## Run the app

> Important
When executing a Blazor Web App, run the app from the solution's server project, which is the project with a name that doesn't end in ```.Client```.

![Trust self-signed certificate dialog!](https://learn.microsoft.com/en-us/aspnet/core/blazor/tooling/tooling/_static/trust-certificate.png?view=aspnetcore-8.0 "Trust self-signed certificate dialog")

![Security warning dialog!](https://learn.microsoft.com/en-us/aspnet/core/blazor/tooling/tooling/_static/install-certificate.png?view=aspnetcore-8.0 "Security warning dialog")

 - Compiles and runs the app.

 - Launches the default browser at ```https```://localhost:{PORT}, which displays the app's UI. The {PORT} placeholder is the random port assigned at app creation. If you need to change the port due to a local port conflict, change the port in the project's ```Properties/launchSettings.json``` file.

```dotnetcli
dotnet watch
```

```dotnetcli
dotnet watch -lp https
```

## Stop the app

 - Close the browser window.

 - In Visual Studio, either:

   - Use the Stop button in Visual Studio's menu bar:

![Stop button in Visual Studio's menu bar!](https://learn.microsoft.com/en-us/aspnet/core/blazor/tooling/tooling/_static/stop-button.png?view=aspnetcore-8.0 "Stop button in Visual Studio's menu bar")

   - Press Shift+F5 on the keyboard.

 - Close the browser window.

 - In VS Code, either:

   - From the Run menu, select Stop Debugging.

   - Press Shift+F5 on the keyboard.

 - Close the browser window.

 - In the command shell, press Ctrl+C (Windows) or ⌘+C (macOS).

## Visual Studio solution file (.sln)

A solution is a container to organize one or more related code projects. Solution files use a unique format and aren't intended to be edited directly.

Visual Studio and Visual Studio Code (VS Code) use a solution file (.sln) to store settings for a solution. The .NET CLI doesn't organize projects using a solution file, but it can create solution files and list/modify the projects in solution files via the ```dotnet sln``` command. Other .NET CLI commands use the path of the solution file for various publishing, testing, and packaging commands.

For more information, see the following resources:

- Introduction to projects and solutions (Visual Studio documentation)

- What are solutions and projects in Visual Studio? (Visual Studio documentation)

- Project management (VS Code documentation)

## Blazor project templates and template options

The Blazor framework provides project templates for creating new apps. The templates are used to create new Blazor projects and solutions regardless of the tooling that you select for Blazor development (Visual Studio, Visual Studio Code, or the .NET command-line interface (CLI)):

 - Blazor Web App project template: ```blazor```

 - Standalone Blazor WebAssembly app project template: ```blazorwasm```

For more information on Blazor project templates, see ASP.NET Core Blazor project structure.

 - Client and server rendering concepts

 - Static and interactive rendering concepts

 - Render modes

### Interactive render mode

 - Interactive server-side rendering (interactive SSR) is enabled by default with the Server option.

 - To only enable interactivity with client-side rendering (CSR), use the WebAssembly option.

 - To enable both interactive rendering modes and the ability to automatically switch between them at runtime, use the Auto (Server and WebAssembly) (automatic) render mode option.

 - If interactivity is set to ```None```, the generated app has no interactivity. The app is only configured for static server-side rendering.

> Important
When using a Blazor Web App, most of the Blazor documentation example components require interactivity to function and demonstrate the concepts covered by the articles. When you test an example component provided by an article, make sure that either the app adopts global interactivity or the component adopts an interactive render mode.

### Interactivity location

 - Per page/component: The default sets up interactivity per page or per component.

 - Global: Using this option sets up interactivity globally for the entire app.

### Sample pages

### Additional guidance on template options

 - ASP.NET Core Blazor render modes

 - The .NET default templates for ```dotnet new``` article in the .NET Core documentation:

   - ```blazor```

   - ```blazorwasm```

 - Passing the help option (-h or ```--help```) to the ```dotnet new``` CLI command in a command shell:

   - ```dotnet new ```blazor``` ```-h``````

   - ```dotnet new ```blazorwasm``` ```-h``````

## Additional resources

 - Visual Studio

 - Visual Studio Code

 - ASP.NET Core Blazor WebAssembly build tools and ahead-of-time (AOT) compilation

 - .NET command-line interface (CLI)

 - .NET SDK

 - .NET Hot Reload support for ASP.NET Core

 - ASP.NET Core Blazor hosting models

 - ASP.NET Core Blazor project structure

 - ASP.NET Core Blazor Hybrid tutorials

Ref: [Tooling for ASP.NET Core Blazor](https://learn.microsoft.com/en-us/aspnet/core/blazor/tooling?view=aspnetcore-8.0)