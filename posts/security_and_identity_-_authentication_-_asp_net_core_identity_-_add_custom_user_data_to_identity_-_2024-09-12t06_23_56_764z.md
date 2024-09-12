---
title: Security and Identity - Authentication - ASP.NET Core Identity - Add custom user data to Identity
published: true
date: 2024-09-12 06:23:56
tags: Summary, AspNetCore
description:
image:
---

## In this article

This article shows how to:

- Add custom user data to an ASP.NET Core web app.

- Mark the custom user data model with the PersonalDataAttribute attribute so it's automatically available for download and deletion. Making the data able to be downloaded and deleted helps meet GDPR requirements.

The project sample is created from a Razor Pages web app, but the instructions are similar for an ASP.NET Core MVC web app.

View or download sample code (how to download)

## Prerequisites

## Create a Razor web app

  - Visual Studio

  - .NET CLI

   - From the Visual Studio File menu, select New > Project. Name the project WebApp1 if you want to it match the namespace of the download sample code.

   - Select ASP.NET Core Web Application > OK

   - Select Web Application > OK

   - Build and run the project.

```dotnetcli
dotnet new webapp -o WebApp1
```

## Run the Identity scaffolder

  - Visual Studio

  - .NET CLI

   - From Solution Explorer, right-click on the project > Add > New Scaffolded Item.

   - From the left pane of the Add Scaffold dialog, select Identity > Add.

   - In the Add Identity dialog, the following options:

     - Select the existing layout  file  ```~/Pages/Shared/_Layout.cshtml```

     - Select the following files to override:

       - Account/Register

       - Account/Manage/Index

     - Select the + button to create a new Data context class. Accept the type (WebApp1.Models.WebApp1Context if the project is named WebApp1).

     - Select the + button to create a new User class. Accept the type (WebApp1User if the project is named WebApp1) > Add.

   - Select Add.

```dotnetcli
dotnet tool install -g dotnet-aspnet-codegenerator
```

> Note
By default the architecture of the .NET binaries to install represents the currently running OS architecture. To specify a different OS architecture, see dotnet tool install, --arch option.
For more information, see GitHub issue dotnet/AspNetCore.Docs #29262.

```dotnetcli
dotnet add package Microsoft.VisualStudio.Web.CodeGeneration.Design
dotnet restore
```

```dotnetcli
dotnet aspnet-codegenerator identity -h
```

```dotnetcli
dotnet aspnet-codegenerator identity -u WebApp1User -fi Account.Register;Account.Manage.Index
```

 - Create a migration and update the database.

 - Add ```UseAuthentication``` to ```Program.cs```

 - Add <partial name="_LoginPartial" /> to the layout file.

 - Test the app:

   - Register a user

   - Select the new user name (next to the Logout link). You might need to expand the window or select the navigation bar icon to show the user name and other links.

   - Select the Personal Data tab.

   - Select the Download button and examined the ```PersonalData.json``` file.

   - Test the Delete button, which deletes the logged on user.

## Add custom user data to the Identity DB

```csharp
using Microsoft.AspNetCore.Identity;

namespace WebApp1.Areas.Identity.Data;

public class WebApp1User : IdentityUser
{
    [PersonalData]
    public string? Name { get; set; }
    [PersonalData]
    public DateTime DOB { get; set; }
}
```

 - Deleted when the ```Areas/Identity/Pages/Account/Manage/DeletePersonalData.cshtml``` Razor Page calls ```UserManager.Delete```.

 - Included in the downloaded data by the ```Areas/Identity/Pages/Account/Manage/DownloadPersonalData.cshtml``` Razor Page.

### Update the ```Account/Manage/Index.cshtml``` page

```csharp
public class IndexModel : PageModel
{
    private readonly UserManager<WebApp1User> _userManager;
    private readonly SignInManager<WebApp1User> _signInManager;

    public IndexModel(
        UserManager<WebApp1User> userManager,
        SignInManager<WebApp1User> signInManager)
    {
        _userManager = userManager;
        _signInManager = signInManager;
    }

    /// <summary>
    ///     This API supports the ASP.NET Core Identity default UI infrastructure and is not intended to be used
    ///     directly from your code. This API may change or be removed in future releases.
    /// </summary>
    public string Username { get; set; }

    // Remaining API warnings ommited.

    [TempData]
    public string StatusMessage { get; set; }

    [BindProperty]
    public InputModel Input { get; set; }

    public class InputModel
    {
        [Required]
        [DataType(DataType.Text)]
        [Display(Name = "Full name")]
        public string Name { get; set; }

        [Required]
        [Display(Name = "Birth Date")]
        [DataType(DataType.Date)]
        public DateTime DOB { get; set; }

        [Phone]
        [Display(Name = "Phone number")]
        public string PhoneNumber { get; set; }
    }

    private async Task LoadAsync(WebApp1User user)
    {
        var userName = await _userManager.GetUserNameAsync(user);
        var phoneNumber = await _userManager.GetPhoneNumberAsync(user);

        Username = userName;

        Input = new InputModel
        {
            Name = user.Name,
            DOB = user.DOB,
            PhoneNumber = phoneNumber
        };
    }

    public async Task<IActionResult> OnGetAsync()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return NotFound($"Unable to load user with ID '{_userManager.GetUserId(User)}'.");
        }

        await LoadAsync(user);
        return Page();
    }

    public async Task<IActionResult> OnPostAsync()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return NotFound($"Unable to load user with ID '{_userManager.GetUserId(User)}'.");
        }

        if (!ModelState.IsValid)
        {
            await LoadAsync(user);
            return Page();
        }

        var phoneNumber = await _userManager.GetPhoneNumberAsync(user);
        if (Input.PhoneNumber != phoneNumber)
        {
            var setPhoneResult = await _userManager.SetPhoneNumberAsync(user, Input.PhoneNumber);
            if (!setPhoneResult.Succeeded)
            {
                StatusMessage = "Unexpected error when trying to set phone number.";
                return RedirectToPage();
            }
        }

        if (Input.Name != user.Name)
        {
            user.Name = Input.Name;
        }

        if (Input.DOB != user.DOB)
        {
            user.DOB = Input.DOB;
        }

        await _userManager.UpdateAsync(user);
        await _signInManager.RefreshSignInAsync(user);
        StatusMessage = "Your profile has been updated";
        return RedirectToPage();
    }
}
```

```cshtml
@page
@model IndexModel
@{
    ViewData["Title"] = "Profile";
    ViewData["ActivePage"] = ManageNavPages.Index;
}

<h3>@ViewData["Title"]</h3>
<partial name="_StatusMessage" for="StatusMessage" />
<div class="row">
    <div class="col-md-6">
        <form id="profile-form" method="post">
            <div asp-validation-summary="ModelOnly" class="text-danger"></div>
            <div class="form-floating">
                <input asp-for="Username" class="form-control" disabled />
                <label asp-for="Username" class="form-label"></label>
            </div>
            <div class="form-floating">
                <input asp-for="Input.Name" class="form-control" />
                <label asp-for="Input.Name" class="form-label"></label>
            </div>
            <div class="form-floating">
                <input asp-for="Input.DOB" class="form-control" />
                <label asp-for="Input.DOB" class="form-label"></label>
            </div>
            <div class="form-floating">
                <input asp-for="Input.PhoneNumber" class="form-control" />
                <label asp-for="Input.PhoneNumber" class="form-label"></label>
                <span asp-validation-for="Input.PhoneNumber" class="text-danger"></span>
            </div>
            <button id="update-profile-button" type="submit" class="w-100 btn btn-lg btn-primary">Save</button>
        </form>
    </div>
</div>

@section Scripts {
    <partial name="_ValidationScriptsPartial" />
}
```

### Update the ```Account/Register.cshtml``` page

```csharp
public class RegisterModel : PageModel
    {
        private readonly SignInManager<WebApp1User> _signInManager;
        private readonly UserManager<WebApp1User> _userManager;
        private readonly IUserStore<WebApp1User> _userStore;
        private readonly IUserEmailStore<WebApp1User> _emailStore;
        private readonly ILogger<RegisterModel> _logger;
        private readonly IEmailSender _emailSender;

        public RegisterModel(
            UserManager<WebApp1User> userManager,
            IUserStore<WebApp1User> userStore,
            SignInManager<WebApp1User> signInManager,
            ILogger<RegisterModel> logger,
            IEmailSender emailSender)
        {
            _userManager = userManager;
            _userStore = userStore;
            _emailStore = GetEmailStore();
            _signInManager = signInManager;
            _logger = logger;
            _emailSender = emailSender;
        }

        /// <summary>
        ///     This API supports the ASP.NET Core Identity default UI infrastructure and is not intended to be used
        ///     directly from your code. This API may change or be removed in future releases.
        /// </summary>
        [BindProperty]
        public InputModel Input { get; set; }

        // Remaining API warnings ommited.
        public string ReturnUrl { get; set; }

        public IList<AuthenticationScheme> ExternalLogins { get; set; }

        public class InputModel
        {
            [Required]
            [DataType(DataType.Text)]
            [Display(Name = "Full name")]
            public string Name { get; set; }

            [Required]
            [Display(Name = "Birth Date")]
            [DataType(DataType.Date)]
            public DateTime DOB { get; set; }

            [Required]
            [EmailAddress]
            [Display(Name = "Email")]
            public string Email { get; set; }

            [Required]
            [StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
            [DataType(DataType.Password)]
            [Display(Name = "Password")]
            public string Password { get; set; }

            [DataType(DataType.Password)]
            [Display(Name = "Confirm password")]
            [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
            public string ConfirmPassword { get; set; }
        }


        public async Task OnGetAsync(string returnUrl = null)
        {
            ReturnUrl = returnUrl;
            ExternalLogins = (await _signInManager.GetExternalAuthenticationSchemesAsync()).ToList();
        }

        public async Task<IActionResult> OnPostAsync(string returnUrl = null)
        {
            returnUrl ??= Url.Content("~/");
            ExternalLogins = (await _signInManager.GetExternalAuthenticationSchemesAsync()).ToList();
            if (ModelState.IsValid)
            {
                var user = CreateUser();

                user.Name = Input.Name;
                user.DOB = Input.DOB;

                await _userStore.SetUserNameAsync(user, Input.Email, CancellationToken.None);
                await _emailStore.SetEmailAsync(user, Input.Email, CancellationToken.None);
                var result = await _userManager.CreateAsync(user, Input.Password);

                if (result.Succeeded)
                {
                    _logger.LogInformation("User created a new account with password.");

                    var userId = await _userManager.GetUserIdAsync(user);
                    var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                    code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
                    var callbackUrl = Url.Page(
                        "/Account/ConfirmEmail",
                        pageHandler: null,
                        values: new { area = "Identity", userId = userId, code = code, returnUrl = returnUrl },
                        protocol: Request.Scheme);

                    await _emailSender.SendEmailAsync(Input.Email, "Confirm your email",
                        $"Please confirm your account by <a href='{HtmlEncoder.Default.Encode(callbackUrl)}'>clicking here</a>.");

                    if (_userManager.Options.SignIn.RequireConfirmedAccount)
                    {
                        return RedirectToPage("RegisterConfirmation", new { email = Input.Email, returnUrl = returnUrl });
                    }
                    else
                    {
                        await _signInManager.SignInAsync(user, isPersistent: false);
                        return LocalRedirect(returnUrl);
                    }
                }
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }
            }

            // If we got this far, something failed, redisplay form
            return Page();
        }

        private WebApp1User CreateUser()
        {
            try
            {
                return Activator.CreateInstance<WebApp1User>();
            }
            catch
            {
                throw new InvalidOperationException($"Can't create an instance of '{nameof(WebApp1User)}'. " +
                    $"Ensure that '{nameof(WebApp1User)}' is not an abstract class and has a parameterless constructor, or alternatively " +
                    $"override the register page in /Areas/Identity/Pages/Account/Register.cshtml");
            }
        }

        private IUserEmailStore<WebApp1User> GetEmailStore()
        {
            if (!_userManager.SupportsUserEmail)
            {
                throw new NotSupportedException("The default UI requires a user store with email support.");
            }
            return (IUserEmailStore<WebApp1User>)_userStore;
        }
    }
}
```

```cshtml
@page
@model RegisterModel
@{
    ViewData["Title"] = "Register";
}

<h1>@ViewData["Title"]</h1>

<div class="row">
    <div class="col-md-4">
        <form id="registerForm" asp-route-returnUrl="@Model.ReturnUrl" method="post">
            <h2>Create a new account.</h2>
            <hr />
            <div asp-validation-summary="ModelOnly" class="text-danger"></div>

            <div class="form-floating">
                <input asp-for="Input.Name" class="form-control" />
                <label asp-for="Input.Name"></label>
                <span asp-validation-for="Input.Name" class="text-danger"></span>
            </div>
            <div class="form-floating">
                <input asp-for="Input.DOB" class="form-control" />
                <label asp-for="Input.DOB"></label>
                <span asp-validation-for="Input.DOB" class="text-danger"></span>
            </div>

            <div class="form-floating">
                <input asp-for="Input.Email" class="form-control" autocomplete="username" aria-required="true" />
                <label asp-for="Input.Email"></label>
                <span asp-validation-for="Input.Email" class="text-danger"></span>
            </div>
            <div class="form-floating">
                <input asp-for="Input.Password" class="form-control" autocomplete="new-password" aria-required="true" />
                <label asp-for="Input.Password"></label>
                <span asp-validation-for="Input.Password" class="text-danger"></span>
            </div>
            <div class="form-floating">
                <input asp-for="Input.ConfirmPassword" class="form-control" autocomplete="new-password" aria-required="true" />
                <label asp-for="Input.ConfirmPassword"></label>
                <span asp-validation-for="Input.ConfirmPassword" class="text-danger"></span>
            </div>
            <button id="registerSubmit" type="submit" class="w-100 btn btn-lg btn-primary">Register</button>
        </form>
    </div>
    <div class="col-md-6 col-md-offset-2">
        <section>
            <h3>Use another service to register.</h3>
            <hr />
            @{
                if ((Model.ExternalLogins?.Count ?? 0) == 0)
                {
                    <div>
                        <p>
                            There are no external authentication services configured. See this <a href="https://go.microsoft.com/fwlink/?LinkID=532715">article
                            about setting up this ASP.NET application to support logging in via external services</a>.
                        </p>
                    </div>
                }
                else
                {
                    <form id="external-account" asp-page="./ExternalLogin" asp-route-returnUrl="@Model.ReturnUrl" method="post" class="form-horizontal">
                        <div>
                            <p>
                                @foreach (var provider in Model.ExternalLogins!)
                                {
                                    <button type="submit" class="btn btn-primary" name="provider" value="@provider.Name" title="Log in using your @provider.DisplayName account">@provider.DisplayName</button>
                                }
                            </p>
                        </div>
                    </form>
                }
            }
        </section>
    </div>
</div>

@section Scripts {
    <partial name="_ValidationScriptsPartial" />
}
```

### Update the layout

### Add a migration for the custom user data

  - Visual Studio

  - .NET CLI

```powershell
Add-Migration CustomUserData
Update-Database
```

```dotnetcli
dotnet ef migrations add CustomUserData
dotnet ef database update
```

## Test create, view, download, delete custom user data

 - Register a new user.

 - View the custom user data on the ```/Identity/Account/Manage``` page.

 - Download and view the users personal data from the ```/Identity/Account/Manage/PersonalData``` page.

Ref: [Add, download, and delete custom user data to Identity in an ASP.NET Core project](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/add-user-data?view=aspnetcore-8.0)