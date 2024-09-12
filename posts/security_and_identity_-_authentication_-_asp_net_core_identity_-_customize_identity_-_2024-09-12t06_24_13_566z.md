---
title: Security and Identity - Authentication - ASP.NET Core Identity - Customize Identity
published: true
date: 2024-09-12 06:24:13
tags: Summary, AspNetCore
description: By Arthur Vickers
image:
---

## In this article

ASP.NET Core Identity provides a framework for managing and storing user accounts in ASP.NET Core apps. Identity is added to your project when Individual ```User``` Accounts is selected as the authentication mechanism. By default, Identity makes use of an Entity Framework (EF) Core data model. This article describes how to customize the Identity model.

## Identity and EF Core Migrations

Before examining the model, it's useful to understand how Identity works with EF Core Migrations to create and update a database. At the top level, the process is:

- Define or update a data model in code.

- Add a Migration to translate this model into changes that can be applied to the database.

- Check that the Migration correctly represents your intentions.

- Apply the Migration to update the database to be in sync with the model.

- Repeat steps 1 through 4 to further refine the model and keep the database in sync.

Use one of the following approaches to add and apply Migrations:

- The Package Manager Console (PMC) window if using Visual Studio. For more information, see EF Core PMC tools.

- The .NET CLI if using the command line. For more information, see EF Core .NET command line tools.

- Clicking the Apply Migrations button on the error page when the app is run.

ASP.NET Core has a development-time error page handler that can apply database migrations when the app is run.

In this article, I'm going to walk you through the initial migration of an existing app using Identity.

- Run ```Update-Database``` in PMC.

- Run ```dotnet ef database update``` in a command shell.

- Click the Apply Migrations button on the error page when the app is run.

Repeat the preceding steps as changes are made to the model.

## The Identity model

### Entity types

The Identity model consists of the following entity types.

<table><thead>
<tr>
<th>Entity type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>User</code></td>
<td>Represents the user.</td>
</tr>
<tr>
<td><code>Role</code></td>
<td>Represents a role.</td>
</tr>
<tr>
<td><code>UserClaim</code></td>
<td>Represents a claim that a user possesses.</td>
</tr>
<tr>
<td><code>UserToken</code></td>
<td>Represents an authentication token for a user.</td>
</tr>
<tr>
<td><code>UserLogin</code></td>
<td>Associates a user with a login.</td>
</tr>
<tr>
<td><code>RoleClaim</code></td>
<td>Represents a claim that's granted to all users within a role.</td>
</tr>
<tr>
<td><code>UserRole</code></td>
<td>A join entity that associates users and roles.</td>
</tr>
</tbody></table>

### Entity type relationships

The entity types are related to each other in the following ways:

- Each ```User``` can have many ```UserClaims```.

- Each ```User``` can have many ```UserLogins```.

- Each ```User``` can have many ```UserTokens```.

- Each ```Role``` can have many associated ```RoleClaims```.

- Each ```User``` can have many associated ```Roles```, and each ```Role``` can be associated with many ```Users```. This is a many-to-many relationship that requires a join table in the database. The join table is represented by the ```UserRole``` entity.

### Default model configuration

Identity defines many context classes that inherit from ```DbContext``` to configure and use the model. This configuration is done using the EF Core Code First Fluent API in the ```OnModelCreating``` method of the context class. The default configuration is:

```csharp
builder.Entity<TUser>(b =>
{
    // Primary key
    b.HasKey(u => u.Id);

    // Indexes for "normalized" username and email, to allow efficient lookups
    b.HasIndex(u => u.NormalizedUserName).HasName("UserNameIndex").IsUnique();
    b.HasIndex(u => u.NormalizedEmail).HasName("EmailIndex");

    // Maps to the AspNetUsers table
    b.ToTable("AspNetUsers");

    // A concurrency token for use with the optimistic concurrency checking
    b.Property(u => u.ConcurrencyStamp).IsConcurrencyToken();

    // Limit the size of columns to use efficient database types
    b.Property(u => u.UserName).HasMaxLength(256);
    b.Property(u => u.NormalizedUserName).HasMaxLength(256);
    b.Property(u => u.Email).HasMaxLength(256);
    b.Property(u => u.NormalizedEmail).HasMaxLength(256);

    // The relationships between User and other entity types
    // Note that these relationships are configured with no navigation properties

    // Each User can have many UserClaims
    b.HasMany<TUserClaim>().WithOne().HasForeignKey(uc => uc.UserId).IsRequired();

    // Each User can have many UserLogins
    b.HasMany<TUserLogin>().WithOne().HasForeignKey(ul => ul.UserId).IsRequired();

    // Each User can have many UserTokens
    b.HasMany<TUserToken>().WithOne().HasForeignKey(ut => ut.UserId).IsRequired();

    // Each User can have many entries in the UserRole join table
    b.HasMany<TUserRole>().WithOne().HasForeignKey(ur => ur.UserId).IsRequired();
});

builder.Entity<TUserClaim>(b =>
{
    // Primary key
    b.HasKey(uc => uc.Id);

    // Maps to the AspNetUserClaims table
    b.ToTable("AspNetUserClaims");
});

builder.Entity<TUserLogin>(b =>
{
    // Composite primary key consisting of the LoginProvider and the key to use
    // with that provider
    b.HasKey(l => new { l.LoginProvider, l.ProviderKey });

    // Limit the size of the composite key columns due to common DB restrictions
    b.Property(l => l.LoginProvider).HasMaxLength(128);
    b.Property(l => l.ProviderKey).HasMaxLength(128);

    // Maps to the AspNetUserLogins table
    b.ToTable("AspNetUserLogins");
});

builder.Entity<TUserToken>(b =>
{
    // Composite primary key consisting of the UserId, LoginProvider and Name
    b.HasKey(t => new { t.UserId, t.LoginProvider, t.Name });

    // Limit the size of the composite key columns due to common DB restrictions
    b.Property(t => t.LoginProvider).HasMaxLength(maxKeyLength);
    b.Property(t => t.Name).HasMaxLength(maxKeyLength);

    // Maps to the AspNetUserTokens table
    b.ToTable("AspNetUserTokens");
});

builder.Entity<TRole>(b =>
{
    // Primary key
    b.HasKey(r => r.Id);

    // Index for "normalized" role name to allow efficient lookups
    b.HasIndex(r => r.NormalizedName).HasName("RoleNameIndex").IsUnique();

    // Maps to the AspNetRoles table
    b.ToTable("AspNetRoles");

    // A concurrency token for use with the optimistic concurrency checking
    b.Property(r => r.ConcurrencyStamp).IsConcurrencyToken();

    // Limit the size of columns to use efficient database types
    b.Property(u => u.Name).HasMaxLength(256);
    b.Property(u => u.NormalizedName).HasMaxLength(256);

    // The relationships between Role and other entity types
    // Note that these relationships are configured with no navigation properties

    // Each Role can have many entries in the UserRole join table
    b.HasMany<TUserRole>().WithOne().HasForeignKey(ur => ur.RoleId).IsRequired();

    // Each Role can have many associated RoleClaims
    b.HasMany<TRoleClaim>().WithOne().HasForeignKey(rc => rc.RoleId).IsRequired();
});

builder.Entity<TRoleClaim>(b =>
{
    // Primary key
    b.HasKey(rc => rc.Id);

    // Maps to the AspNetRoleClaims table
    b.ToTable("AspNetRoleClaims");
});

builder.Entity<TUserRole>(b =>
{
    // Primary key
    b.HasKey(r => new { r.UserId, r.RoleId });

    // Maps to the AspNetUserRoles table
    b.ToTable("AspNetUserRoles");
});
```

### Model generic types

Identity defines default Common Language Runtime (CLR) types for each of the entity types listed above. These types are all prefixed with Identity:

- ```IdentityUser```

- ```IdentityRole```

- ```IdentityUserClaim```

- ```IdentityUserToken```

- ```IdentityUserLogin```

- ```IdentityRoleClaim```

- ```IdentityUserRole```

Rather than using these types directly, the types can be used as base classes for the app's own types. The ```DbContext``` classes defined by Identity are generic, such that different CLR types can be used for one or more of the entity types in the model. These generic types also allow the ```User``` primary key (PK) data type to be changed.

When using Identity with support for roles, an ```IdentityDbContext``` class should be used. For example:

```csharp
// Uses all the built-in Identity types
// Uses `string` as the key type
public class IdentityDbContext
    : IdentityDbContext<IdentityUser, IdentityRole, string>
{
}

// Uses the built-in Identity types except with a custom User type
// Uses `string` as the key type
public class IdentityDbContext<TUser>
    : IdentityDbContext<TUser, IdentityRole, string>
        where TUser : IdentityUser
{
}

// Uses the built-in Identity types except with custom User and Role types
// The key type is defined by TKey
public class IdentityDbContext<TUser, TRole, TKey> : IdentityDbContext<
    TUser, TRole, TKey, IdentityUserClaim<TKey>, IdentityUserRole<TKey>,
    IdentityUserLogin<TKey>, IdentityRoleClaim<TKey>, IdentityUserToken<TKey>>
        where TUser : IdentityUser<TKey>
        where TRole : IdentityRole<TKey>
        where TKey : IEquatable<TKey>
{
}

// No built-in Identity types are used; all are specified by generic arguments
// The key type is defined by TKey
public abstract class IdentityDbContext<
    TUser, TRole, TKey, TUserClaim, TUserRole, TUserLogin, TRoleClaim, TUserToken>
    : IdentityUserContext<TUser, TKey, TUserClaim, TUserLogin, TUserToken>
         where TUser : IdentityUser<TKey>
         where TRole : IdentityRole<TKey>
         where TKey : IEquatable<TKey>
         where TUserClaim : IdentityUserClaim<TKey>
         where TUserRole : IdentityUserRole<TKey>
         where TUserLogin : IdentityUserLogin<TKey>
         where TRoleClaim : IdentityRoleClaim<TKey>
         where TUserToken : IdentityUserToken<TKey>
```

It's also possible to use Identity without roles (only claims), in which case an IdentityUserContext<TUser> class should be used:

```csharp
// Uses the built-in non-role Identity types except with a custom User type
// Uses `string` as the key type
public class IdentityUserContext<TUser>
    : IdentityUserContext<TUser, string>
        where TUser : IdentityUser
{
}

// Uses the built-in non-role Identity types except with a custom User type
// The key type is defined by TKey
public class IdentityUserContext<TUser, TKey> : IdentityUserContext<
    TUser, TKey, IdentityUserClaim<TKey>, IdentityUserLogin<TKey>,
    IdentityUserToken<TKey>>
        where TUser : IdentityUser<TKey>
        where TKey : IEquatable<TKey>
{
}

// No built-in Identity types are used; all are specified by generic arguments, with no roles
// The key type is defined by TKey
public abstract class IdentityUserContext<
    TUser, TKey, TUserClaim, TUserLogin, TUserToken> : DbContext
        where TUser : IdentityUser<TKey>
        where TKey : IEquatable<TKey>
        where TUserClaim : IdentityUserClaim<TKey>
        where TUserLogin : IdentityUserLogin<TKey>
        where TUserToken : IdentityUserToken<TKey>
{
}
```

## Customize the model

The starting point for model customization is to derive from the appropriate context type. See the Model generic types section. This context type is customarily called ```ApplicationDbContext``` and is created by the ASP.NET Core templates.

The context is used to configure the model in two ways:

- Supplying entity and key types for the generic type parameters.

- Overriding ```OnModelCreating``` to modify the mapping of these types.

When overriding ```OnModelCreating```, ```base.OnModelCreating``` should be called first; the overriding configuration should be called next. EF Core generally has a last-one-wins policy for configuration. For example, if the ```ToTable``` method for an entity type is called first with one table name and then again later with a different table name, the table name in the second call is used.

NOTE: If the ```DbContext``` doesn't derive from ```IdentityDbContext```, ```AddEntityFrameworkStores``` may not infer the correct POCO types for ```TUserClaim```, ```TUserLogin```, and ```TUserToken```. If ```AddEntityFrameworkStores``` doesn't infer the correct POCO types, a workaround is to directly add the correct types via `services.AddScoped<IUser/RoleStore<TUser>` and `UserStore<...>`.

### Custom user data

Custom user data is supported by inheriting from ```IdentityUser```. It's customary to name this type ```ApplicationUser```:

```csharp
public class ApplicationUser : IdentityUser
{
    public string CustomTag { get; set; }
}
```

Use the ```ApplicationUser``` type as a generic argument for the context:

```csharp
public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
    }
}
```

There's no need to override ```OnModelCreating``` in the ```ApplicationDbContext``` class. EF Core maps the ```CustomTag``` property by convention. However, the database needs to be updated to create a new ```CustomTag``` column. To create the column, add a migration, and then update the database as described in Identity and EF Core Migrations.

Update ```Pages/Shared/_LoginPartial.cshtml``` and replace ```IdentityUser``` with ```ApplicationUser```:

```cshtml
@using Microsoft.AspNetCore.Identity
@using WebApp1.Areas.Identity.Data
@inject SignInManager<ApplicationUser> SignInManager
@inject UserManager<ApplicationUser> UserManager
```

Update ```Areas/Identity/IdentityHostingStartup.cs``` or ```Startup.ConfigureServices``` and replace ```IdentityUser``` with ```ApplicationUser```.

```csharp
services.AddDefaultIdentity<ApplicationUser>(options => options.SignIn.RequireConfirmedAccount = true)
        .AddEntityFrameworkStores<ApplicationDbContext>();
```

Calling AddDefaultIdentity is equivalent to the following code:

```csharp
services.AddAuthentication(o =>
{
    o.DefaultScheme = IdentityConstants.ApplicationScheme;
    o.DefaultSignInScheme = IdentityConstants.ExternalScheme;
})
.AddIdentityCookies(o => { });

services.AddIdentityCore<TUser>(o =>
{
    o.Stores.MaxLengthForKeys = 128;
    o.SignIn.RequireConfirmedAccount = true;
})
.AddDefaultUI()
.AddDefaultTokenProviders();
```

Identity is provided as a Razor class library. For more information, see Scaffold Identity in ASP.NET Core projects. Consequently, the preceding code requires a call to ```AddDefaultUI```. If the Identity scaffolder was used to add Identity files to the project, remove the call to ```AddDefaultUI```. For more information, see:

- Scaffold Identity

- Add, download, and delete custom user data to Identity

### Change the primary key type

Key types should be specified in the initial migration when the database is created.

Follow these steps to change the PK type:

- If the database was created before the PK change, run ```Drop-Database``` (PMC) or ```dotnet ef database drop``` (.NET CLI) to delete it.

- After confirming deletion of the database, remove the initial migration with ```Remove-Migration``` (PMC) or ```dotnet ef migrations remove``` (.NET CLI).

- Update the ```ApplicationDbContext``` class to derive from ```IdentityDbContext<TUser,TRole,TKey>```. Specify the new key type for ```TKey```. For example, to use a ```Guid``` key type:

```csharp
public class ApplicationDbContext
    : IdentityDbContext<IdentityUser<Guid>, IdentityRole<Guid>, Guid>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
}
```
In the preceding code, the generic classes ```IdentityUser<TKey>``` and ```IdentityRole<TKey>``` must be specified to use the new key type.
Startup.ConfigureServices must be updated to use the generic user:

```csharp
services.AddDefaultIdentity<IdentityUser<Guid>>(options => options.SignIn.RequireConfirmedAccount = true)
        .AddEntityFrameworkStores<ApplicationDbContext>();
```

- If a custom ```ApplicationUser``` class is being used, update the class to inherit from ```IdentityUser```. For example:



```csharp
using System;
using Microsoft.AspNetCore.Identity;

public class ApplicationUser : IdentityUser<Guid>
{
    public string CustomTag { get; set; }
}
```

Register the custom database context class when adding the Identity service in ```Startup.ConfigureServices```:

```csharp
public class ApplicationDbContext
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
}
```

```csharp
services.AddDefaultIdentity<ApplicationUser>(options => options.SignIn.RequireConfirmedAccount = true)
        .AddEntityFrameworkStores<ApplicationDbContext>();
```
The primary key's data type is inferred by analyzing the ```DbContext``` object.
Identity is provided as a Razor class library. For more information, see Scaffold Identity in ASP.NET Core projects. Consequently, the preceding code requires a call to ```AddDefaultUI```. If the Identity scaffolder was used to add Identity files to the project, remove the call to ```AddDefaultUI```.

- If a custom ```ApplicationRole``` class is being used, update the class to inherit from ```IdentityRole<TKey>```. For example:
```csharp
using System;
using Microsoft.AspNetCore.Identity;

public class ApplicationRole : IdentityRole<Guid>
{
    public string Description { get; set; }
}
```

Update ```ApplicationDbContext``` to reference the custom ```ApplicationRole``` class. For example, the following class references a custom ```ApplicationUser``` and a custom ```ApplicationRole```:
```csharp
using System;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext :
    IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
}
```

Register the custom database context class when adding the Identity service in ```Startup.ConfigureServices```:
```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.Configure<CookiePolicyOptions>(options =>
    {
        options.CheckConsentNeeded = context => true;
        options.MinimumSameSitePolicy = SameSiteMode.None;
    });

    services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(
            Configuration.GetConnectionString("DefaultConnection")));

    services.AddIdentity<ApplicationUser, ApplicationRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultUI()
            .AddDefaultTokenProviders();

    services.AddMvc()
            .SetCompatibilityVersion(CompatibilityVersion.Version_2_1);
}
```

The primary key's data type is inferred by analyzing the ```DbContext``` object.
Identity is provided as a Razor class library. For more information, see Scaffold Identity in ASP.NET Core projects. Consequently, the preceding code requires a call to ```AddDefaultUI```. If the Identity scaffolder was used to add Identity files to the project, remove the call to ```AddDefaultUI```.

### Add navigation properties

Changing the model configuration for relationships can be more difficult than making other changes. Care must be taken to replace the existing relationships rather than create new, additional relationships. In particular, the changed relationship must specify the same foreign key (FK) property as the existing relationship. For example, the relationship between ```Users``` and ```UserClaims``` is, by default, specified as follows:

```csharp
builder.Entity<TUser>(b =>
{
    // Each User can have many UserClaims
    b.HasMany<TUserClaim>()
     .WithOne()
     .HasForeignKey(uc => uc.UserId)
     .IsRequired();
});
```

The FK for this relationship is specified as the ```UserClaim.UserId``` property. ```HasMany``` and ```WithOne``` are called without arguments to create the relationship without navigation properties.

Add a navigation property to ```ApplicationUser``` that allows associated ```UserClaims``` to be referenced from the user:

```csharp
public class ApplicationUser : IdentityUser
{
    public virtual ICollection<IdentityUserClaim<string>> Claims { get; set; }
}
```

The ```TKey``` for ```IdentityUserClaim<TKey>``` is the type specified for the PK of users. In this case, ```TKey``` is ```string``` because the defaults are being used. It's not the PK type for the ```UserClaim``` entity type.

Now that the navigation property exists, it must be configured in ```OnModelCreating```:

```csharp
public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ApplicationUser>(b =>
        {
            // Each User can have many UserClaims
            b.HasMany(e => e.Claims)
                .WithOne()
                .HasForeignKey(uc => uc.UserId)
                .IsRequired();
        });
    }
}
```

Notice that relationship is configured exactly as it was before, only with a navigation property specified in the call to ```HasMany```.

The navigation properties only exist in the EF model, not the database. Because the FK for the relationship hasn't changed, this kind of model change doesn't require the database to be updated. This can be checked by adding a migration after making the change. The ```Up``` and ```Down``` methods are empty.

### Add all ```User``` navigation properties

Using the section above as guidance, the following example configures unidirectional navigation properties for all relationships on ```User```:

```csharp
public class ApplicationUser : IdentityUser
{
    public virtual ICollection<IdentityUserClaim<string>> Claims { get; set; }
    public virtual ICollection<IdentityUserLogin<string>> Logins { get; set; }
    public virtual ICollection<IdentityUserToken<string>> Tokens { get; set; }
    public virtual ICollection<IdentityUserRole<string>> UserRoles { get; set; }
}
```

```csharp
public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ApplicationUser>(b =>
        {
            // Each User can have many UserClaims
            b.HasMany(e => e.Claims)
                .WithOne()
                .HasForeignKey(uc => uc.UserId)
                .IsRequired();

            // Each User can have many UserLogins
            b.HasMany(e => e.Logins)
                .WithOne()
                .HasForeignKey(ul => ul.UserId)
                .IsRequired();

            // Each User can have many UserTokens
            b.HasMany(e => e.Tokens)
                .WithOne()
                .HasForeignKey(ut => ut.UserId)
                .IsRequired();

            // Each User can have many entries in the UserRole join table
            b.HasMany(e => e.UserRoles)
                .WithOne()
                .HasForeignKey(ur => ur.UserId)
                .IsRequired();
        });
    }
}
```

### Add ```User``` and ```Role``` navigation properties

Using the section above as guidance, the following example configures navigation properties for all relationships on ```User``` and ```Role```:

```csharp
public class ApplicationUser : IdentityUser
{
    public virtual ICollection<IdentityUserClaim<string>> Claims { get; set; }
    public virtual ICollection<IdentityUserLogin<string>> Logins { get; set; }
    public virtual ICollection<IdentityUserToken<string>> Tokens { get; set; }
    public virtual ICollection<ApplicationUserRole> UserRoles { get; set; }
}

public class ApplicationRole : IdentityRole
{
    public virtual ICollection<ApplicationUserRole> UserRoles { get; set; }
}

public class ApplicationUserRole : IdentityUserRole<string>
{
    public virtual ApplicationUser User { get; set; }
    public virtual ApplicationRole Role { get; set; }
}
```

```csharp
public class ApplicationDbContext
    : IdentityDbContext<
        ApplicationUser, ApplicationRole, string,
        IdentityUserClaim<string>, ApplicationUserRole, IdentityUserLogin<string>,
        IdentityRoleClaim<string>, IdentityUserToken<string>>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ApplicationUser>(b =>
        {
            // Each User can have many UserClaims
            b.HasMany(e => e.Claims)
                .WithOne()
                .HasForeignKey(uc => uc.UserId)
                .IsRequired();

            // Each User can have many UserLogins
            b.HasMany(e => e.Logins)
                .WithOne()
                .HasForeignKey(ul => ul.UserId)
                .IsRequired();

            // Each User can have many UserTokens
            b.HasMany(e => e.Tokens)
                .WithOne()
                .HasForeignKey(ut => ut.UserId)
                .IsRequired();

            // Each User can have many entries in the UserRole join table
            b.HasMany(e => e.UserRoles)
                .WithOne(e => e.User)
                .HasForeignKey(ur => ur.UserId)
                .IsRequired();
        });

        modelBuilder.Entity<ApplicationRole>(b =>
        {
            // Each Role can have many entries in the UserRole join table
            b.HasMany(e => e.UserRoles)
                .WithOne(e => e.Role)
                .HasForeignKey(ur => ur.RoleId)
                .IsRequired();
        });

    }
}
```

Notes:

- This example also includes the ```UserRole``` join entity, which is needed to navigate the many-to-many relationship from ```Users``` to ```Roles```.

- Remember to change the types of the navigation properties to reflect that Application{...} types are now being used instead of Identity{...} types.

- Remember to use the Application{...} in the generic ```ApplicationContext``` definition.

### Add all navigation properties

Using the section above as guidance, the following example configures navigation properties for all relationships on all entity types:

```csharp
public class ApplicationUser : IdentityUser
{
    public virtual ICollection<ApplicationUserClaim> Claims { get; set; }
    public virtual ICollection<ApplicationUserLogin> Logins { get; set; }
    public virtual ICollection<ApplicationUserToken> Tokens { get; set; }
    public virtual ICollection<ApplicationUserRole> UserRoles { get; set; }
}

public class ApplicationRole : IdentityRole
{
    public virtual ICollection<ApplicationUserRole> UserRoles { get; set; }
    public virtual ICollection<ApplicationRoleClaim> RoleClaims { get; set; }
}

public class ApplicationUserRole : IdentityUserRole<string>
{
    public virtual ApplicationUser User { get; set; }
    public virtual ApplicationRole Role { get; set; }
}

public class ApplicationUserClaim : IdentityUserClaim<string>
{
    public virtual ApplicationUser User { get; set; }
}

public class ApplicationUserLogin : IdentityUserLogin<string>
{
    public virtual ApplicationUser User { get; set; }
}

public class ApplicationRoleClaim : IdentityRoleClaim<string>
{
    public virtual ApplicationRole Role { get; set; }
}

public class ApplicationUserToken : IdentityUserToken<string>
{
    public virtual ApplicationUser User { get; set; }
}
```

```csharp
public class ApplicationDbContext
    : IdentityDbContext<
        ApplicationUser, ApplicationRole, string,
        ApplicationUserClaim, ApplicationUserRole, ApplicationUserLogin,
        ApplicationRoleClaim, ApplicationUserToken>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ApplicationUser>(b =>
        {
            // Each User can have many UserClaims
            b.HasMany(e => e.Claims)
                .WithOne(e => e.User)
                .HasForeignKey(uc => uc.UserId)
                .IsRequired();

            // Each User can have many UserLogins
            b.HasMany(e => e.Logins)
                .WithOne(e => e.User)
                .HasForeignKey(ul => ul.UserId)
                .IsRequired();

            // Each User can have many UserTokens
            b.HasMany(e => e.Tokens)
                .WithOne(e => e.User)
                .HasForeignKey(ut => ut.UserId)
                .IsRequired();

            // Each User can have many entries in the UserRole join table
            b.HasMany(e => e.UserRoles)
                .WithOne(e => e.User)
                .HasForeignKey(ur => ur.UserId)
                .IsRequired();
        });

        modelBuilder.Entity<ApplicationRole>(b =>
        {
            // Each Role can have many entries in the UserRole join table
            b.HasMany(e => e.UserRoles)
                .WithOne(e => e.Role)
                .HasForeignKey(ur => ur.RoleId)
                .IsRequired();

            // Each Role can have many associated RoleClaims
            b.HasMany(e => e.RoleClaims)
                .WithOne(e => e.Role)
                .HasForeignKey(rc => rc.RoleId)
                .IsRequired();
        });
    }
}
```

### Use composite keys

This document describes how to change the type of key used in the Identity model.

### Change table/column names and facets

To change the names of tables and columns, call ```base.OnModelCreating```. Then, add configuration to override any of the defaults. For example, to change the name of all the Identity tables:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<IdentityUser>(b =>
    {
        b.ToTable("MyUsers");
    });

    modelBuilder.Entity<IdentityUserClaim<string>>(b =>
    {
        b.ToTable("MyUserClaims");
    });

    modelBuilder.Entity<IdentityUserLogin<string>>(b =>
    {
        b.ToTable("MyUserLogins");
    });

    modelBuilder.Entity<IdentityUserToken<string>>(b =>
    {
        b.ToTable("MyUserTokens");
    });

    modelBuilder.Entity<IdentityRole>(b =>
    {
        b.ToTable("MyRoles");
    });

    modelBuilder.Entity<IdentityRoleClaim<string>>(b =>
    {
        b.ToTable("MyRoleClaims");
    });

    modelBuilder.Entity<IdentityUserRole<string>>(b =>
    {
        b.ToTable("MyUserRoles");
    });
}
```

These examples use the default Identity types. If using an app type such as ```ApplicationUser```, configure that type instead of the default type.

The following example changes some column names:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<IdentityUser>(b =>
    {
        b.Property(e => e.Email).HasColumnName("EMail");
    });

    modelBuilder.Entity<IdentityUserClaim<string>>(b =>
    {
        b.Property(e => e.ClaimType).HasColumnName("CType");
        b.Property(e => e.ClaimValue).HasColumnName("CValue");
    });
}
```

Some types of database columns can be configured with certain facets (for example, the maximum ```string``` length allowed). The following example sets column maximum lengths for several ```string``` properties in the model:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<IdentityUser>(b =>
    {
        b.Property(u => u.UserName).HasMaxLength(128);
        b.Property(u => u.NormalizedUserName).HasMaxLength(128);
        b.Property(u => u.Email).HasMaxLength(128);
        b.Property(u => u.NormalizedEmail).HasMaxLength(128);
    });

    modelBuilder.Entity<IdentityUserToken<string>>(b =>
    {
        b.Property(t => t.LoginProvider).HasMaxLength(128);
        b.Property(t => t.Name).HasMaxLength(128);
    });
}
```

### Map to a different schema

Schemas can behave differently across database providers. For SQL Server, the default is to create all tables in the dbo schema. The tables can be created in a different schema. For example:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    modelBuilder.HasDefaultSchema("notdbo");
}
```

### Lazy loading

In this section, support for lazy-loading proxies in the Identity model is added. Lazy-loading is useful since it allows navigation properties to be used without first ensuring they're loaded.

Entity types can be made suitable for lazy-loading in several ways, as described in the EF Core documentation. For simplicity, use lazy-loading proxies, which requires:

- Installation of the Microsoft.EntityFrameworkCore.Proxies package.

- A call to ```UseLazyLoadingProxies``` inside AddDbContext.

- Public entity types with ```public virtual``` navigation properties.

The following example demonstrates calling ```UseLazyLoadingProxies``` in ```Startup.ConfigureServices```:

```csharp
services
    .AddDbContext<ApplicationDbContext>(
        b => b.UseSqlServer(connectionString)
              .UseLazyLoadingProxies())
    .AddDefaultIdentity<ApplicationUser>()
    .AddEntityFrameworkStores<ApplicationDbContext>();
```

Refer to the preceding examples for guidance on adding navigation properties to the entity types.

## Additional resources

- Scaffold Identity in ASP.NET Core projects

Ref: [Identity model customization in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/customize-identity-model?view=aspnetcore-8.0)