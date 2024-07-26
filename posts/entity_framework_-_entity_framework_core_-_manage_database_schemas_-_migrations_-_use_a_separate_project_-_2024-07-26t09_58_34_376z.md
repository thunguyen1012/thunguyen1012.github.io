---
title: Entity Framework - Entity Framework Core - Manage database schemas - Migrations - Use a separate project
published: true
date: 2024-07-26 09:58:34
tags: EFCore, Summary
description: DbContexts can be used to store migrations between projects.
image:
---

## In this article

DbContexts can be used to store migrations between projects.

> Tip
You can view this article's sample on GitHub.

## Steps

- Create a new class library.

- Add a reference to your ```DbContext``` project.

- Move the migrations and model snapshot files to the class library.

Tip
If you have no existing migrations, generate one in the project containing the ```DbContext``` then move it.
This is important because if the migrations project does not contain an existing migration, the Add-Migration command will be unable to find the ```DbContext```.

> Tip
If you have no existing migrations, generate one in the project containing the ```DbContext``` then move it.
This is important because if the migrations project does not contain an existing migration, the Add-Migration command will be unable to find the ```DbContext```.

- Configure the migrations assembly:
services.AddDbContext<ApplicationDbContext>(
    options =>
        options.UseSqlServer(
            Configuration.GetConnectionString("DefaultConnection"),
            x => x.MigrationsAssembly("WebApplication1.Migrations")));

```csharp
services.AddDbContext<ApplicationDbContext>(
    options =>
        options.UseSqlServer(
            Configuration.GetConnectionString("DefaultConnection"),
            x => x.MigrationsAssembly("WebApplication1.Migrations")));
```

- Add a reference to your migrations project from the startup project.
<ItemGroup>
  <ProjectReference Include="..\WebApplication1.Migrations\WebApplication1.Migrations.csproj" />
</ItemGroup>

If this causes a circular dependency, you can update the base output path of the migrations project instead:
<PropertyGroup>
  <BaseOutputPath>..\WebApplication1\bin\</BaseOutputPath>
</PropertyGroup>

```xml
<ItemGroup>
  <ProjectReference Include="..\WebApplication1.Migrations\WebApplication1.Migrations.csproj" />
</ItemGroup>
```

```xml
<PropertyGroup>
  <BaseOutputPath>..\WebApplication1\bin\</BaseOutputPath>
</PropertyGroup>
```

If you did everything correctly, you should be able to add new migrations to the project.

 - .NET Core CLI

 - Visual Studio

```dotnetcli
dotnet ef migrations add NewMigration --project WebApplication1.Migrations
```

```powershell
Add-Migration NewMigration -Project WebApplication1.Migrations
```

Ref: [Using a Separate Migrations Project](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/projects)