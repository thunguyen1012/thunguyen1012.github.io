---
title: Security and Identity - Enforce HTTPS
published: true
date: 2024-09-20 02:56:07
tags: Summary, AspNetCore
description:
image:
---

## In this article

this article shows how to:

- Require HTTPS for all requests.

- Redirect all HTTP requests to HTTPS.

No API can prevent a client from sending sensitive data on the first request.

> Note
If you're using .NET 9 SDK or later, see the updated Linux procedures in the .NET 9 version of this article.

> Warning
API projects
Do not use ```RequireHttpsAttribute``` on Web APIs that receive sensitive information. ```RequireHttpsAttribute``` uses HTTP status codes to redirect browsers from HTTP to HTTPS. API clients may not understand or obey redirects from HTTP to HTTPS. Such clients may send information over HTTP. Web APIs should either:

Not listen on HTTP.
Close the connection with status code 400 (Bad Request) and not serve the request.

To disable HTTP redirection in an API, set the ```ASPNETCORE_URLS``` environment variable or use the ```--urls``` command line flag. For more information, see Use multiple environments in ASP.NET Core and 8 ways to set the URLs for an ASP.NET Core app by Andrew Lock.
HSTS and API projects
The default API projects don't include HSTS because HSTS is generally a browser only instruction. Other callers, such as phone or desktop apps, do not obey the instruction. Even within browsers, a single authenticated call to an API over HTTP has risks on insecure networks. The secure approach is to configure API projects to only listen to and respond over HTTPS.

## API projects

  - Not listen on HTTP.

  - Close the connection with status code 400 (Bad Request) and not serve the request.

## HSTS and API projects

### HTTP redirection to HTTPS causes ```ERR_INVALID_REDIRECT``` on the CORS preflight request

## Require HTTPS

 - HTTPS Redirection Middleware (UseHttpsRedirection) to redirect HTTP requests to HTTPS.

 - HSTS Middleware (UseHsts) to send HTTP Strict Transport Security Protocol (HSTS) headers to clients.

> Note
Apps deployed in a reverse proxy configuration allow the proxy to handle connection security (HTTPS). If the proxy also handles HTTPS redirection, there's no need to use HTTPS Redirection Middleware. If the proxy server also handles writing HSTS headers (for example, native HSTS support in IIS 10.0 (1709) or later), HSTS Middleware isn't required by the app. For more information, see Opt-out of HTTPS/HSTS on project creation.

### ```UseHttpsRedirection```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

app.Run();
```

 - Uses the default HttpsRedirectionOptions.RedirectStatusCode (Status307TemporaryRedirect).

 - Uses the default HttpsRedirectionOptions.HttpsPort (null) unless overridden by the ```ASPNETCORE_HTTPS_PORT``` environment variable or IServerAddressesFeature.

### Port configuration

 - Redirection to HTTPS doesn't occur.

 - The middleware logs the warning "Failed to determine the https port for redirect."

 - Set HttpsRedirectionOptions.HttpsPort.

 - Set the ```https_port``` host setting:

   - In host configuration.

   - By setting the ```ASPNETCORE_HTTPS_PORT``` environment variable.

   - By adding a top-level entry in ```appsettings.json```:

```json
{
  "https_port": 443,
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

 - Indicate a port with the secure scheme using the ```ASPNETCORE_URLS``` environment variable. The environment variable configures the server. The middleware indirectly discovers the HTTPS port via IServerAddressesFeature. This approach doesn't work in reverse proxy deployments.

 - The ASP.NET Core web templates set an HTTPS URL in ```Properties/launchsettings.json``` for both Kestrel and IIS Express. ```launchsettings.json``` is only used on the local machine.

 - Configure an HTTPS URL endpoint for a public-facing edge deployment of Kestrel server or HTTP.sys server. Only one HTTPS port is used by the app. The middleware discovers the port via IServerAddressesFeature.

> Note
When an app is run in a reverse proxy configuration, IServerAddressesFeature isn't available. Set the port using one of the other approaches described in this section.

### Edge deployments

 - The secure port where the client is redirected (typically, 443 in production and 5001 in development).

 - The insecure port (typically, 80 in production and 5000 in development).

### Deployment scenarios

### Options

```csharp
using static Microsoft.AspNetCore.Http.StatusCodes;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

builder.Services.AddHsts(options =>
{
    options.Preload = true;
    options.IncludeSubDomains = true;
    options.MaxAge = TimeSpan.FromDays(60);
    options.ExcludedHosts.Add("example.com");
    options.ExcludedHosts.Add("www.example.com");
});

builder.Services.AddHttpsRedirection(options =>
{
    options.RedirectStatusCode = Status307TemporaryRedirect;
    options.HttpsPort = 5001;
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

app.Run();
```

 - Sets HttpsRedirectionOptions.RedirectStatusCode to Status307TemporaryRedirect, which is the default value. Use the fields of the StatusCodes class for assignments to ```RedirectStatusCode```.

 - Sets the HTTPS port to 5001.

#### Configure permanent redirects in production

```csharp
using static Microsoft.AspNetCore.Http.StatusCodes;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

if (!builder.Environment.IsDevelopment())
{
    builder.Services.AddHttpsRedirection(options =>
    {
        options.RedirectStatusCode = Status308PermanentRedirect;
        options.HttpsPort = 443;
    });
}

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");

    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

app.Run();
```

## HTTPS Redirection Middleware alternative approach

## HTTP Strict Transport Security Protocol (HSTS)

 - The browser stores configuration for the domain that prevents sending any communication over HTTP. The browser forces all communication over HTTPS.

 - The browser prevents the user from using untrusted or invalid certificates. The browser disables prompts that allow a user to temporarily trust such a certificate.

 - The client must support HSTS.

 - HSTS requires at least one successful HTTPS request to establish the HSTS policy.

 - The application must check every HTTP request and redirect or reject the HTTP request.

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

app.Run();
```

```csharp
using static Microsoft.AspNetCore.Http.StatusCodes;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

builder.Services.AddHsts(options =>
{
    options.Preload = true;
    options.IncludeSubDomains = true;
    options.MaxAge = TimeSpan.FromDays(60);
    options.ExcludedHosts.Add("example.com");
    options.ExcludedHosts.Add("www.example.com");
});

builder.Services.AddHttpsRedirection(options =>
{
    options.RedirectStatusCode = Status307TemporaryRedirect;
    options.HttpsPort = 5001;
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

app.Run();
```

 - Sets the preload parameter of the ```Strict-Transport-Security``` header. Preload isn't part of the RFC HSTS specification, but is supported by web browsers to preload HSTS sites on fresh install. For more information, see https://hstspreload.org/.

 - Enables includeSubDomain, which applies the HSTS policy to Host subdomains.

 - Explicitly sets the ```max-age``` parameter of the ```Strict-Transport-Security``` header to 60 days. If not set, defaults to 30 days. For more information, see the ```max-age``` directive.

 - Adds ```example.com``` to the list of hosts to exclude.

 - ```localhost``` : The IPv4 loopback address.

 - ```127.0.0.1``` : The IPv4 loopback address.

 - [::1] : The IPv6 loopback address.

## Opt-out of HTTPS/HSTS on project creation

  - Visual Studio

  - .NET CLI

![New ASP.NET Core Web Application dialog showing the Configure for HTTPS checkbox unselected.!](https://learn.microsoft.com/en-us/aspnet/core/security/enforcing-ssl/enforcing-ssl/_static/out-vs2019.png?view=aspnetcore-8.0 "New ASP.NET Core Web Application dialog showing the Configure for HTTPS checkbox unselected.")

```dotnetcli
dotnet new webapp --no-https
```

## Trust the ```ASP.NET Core HTTPS development certificate``` on Windows and macOS

```cli
ASP.NET Core
------------
Successfully installed the ASP.NET Core HTTPS Development Certificate.
To trust the certificate run 'dotnet dev-certs https --trust' (Windows and macOS only).
For establishing trust on other platforms refer to the platform specific documentation.
For more information on configuring HTTPS see https://go.microsoft.com/fwlink/?linkid=848054.
```

```dotnetcli
dotnet dev-certs https --trust
```

```dotnetcli
dotnet dev-certs https --help
```

> Warning
Do not create a development certificate in an environment that will be redistributed, such as a container image or virtual machine. Doing so can lead to spoofing and elevation of privilege. To help prevent this, set the ```DOTNET_GENERATE_ASPNET_CERTIFICATE``` environment variable to ```false``` prior to calling the .NET CLI for the first time. This will skip the automatic generation of the ASP.NET Core development certificate during the CLI's first-run experience.

### Trust the HTTPS certificate with Firefox to prevent SEC_ERROR_INADEQUATE_KEY_USAGE error

#### Create a policy file to trust HTTPS certificate with Firefox

 - Windows: %PROGRAMFILES%\Mozilla Firefox\distribution\

 - MacOS: ```Firefox.app/Contents/Resources/distribution```

 - Linux: See Trust the certificate with Firefox on Linux in this article.

```json
{
  "policies": {
    "Certificates": {
      "ImportEnterpriseRoots": true
    }
  }
}
```

### Configure trust of HTTPS certificate using Firefox browser

 - Enter ```about:config``` in the FireFox browser.

 - Select Accept the Risk and Continue if you accept the risk.

 - Select Show All

 - Set ```security.enterprise_roots.enabled``` = ```true```

 - Exit and restart Firefox

## How to set up a developer certificate for Docker

## Trust HTTPS certificate on Linux

### Trust HTTPS certificate on Linux with linux-dev-certs

```cli
dotnet tool update -g linux-dev-certs
dotnet linux-dev-certs install
```

### Ubuntu trust the certificate for service-to-service communication

 - Install OpenSSL 1.1.1h or later. See your distribution for instructions on how to update OpenSSL.

 - Run the following commands:

```cli
dotnet dev-certs https
sudo -E dotnet dev-certs https -ep /usr/local/share/ca-certificates/aspnet/https.crt --format PEM
sudo update-ca-certificates
```

 - Ensure the current user's developer certificate is created.

 - Exports the certificate with elevated permissions needed for the ```ca-certificates``` folder, using the current user's environment.

 - Removing the ```-E```  flag exports the root user certificate, generating it if necessary. Each newly generated certificate has a different thumbprint. When running as root, ```sudo```  and  ```-E``` are not needed.

### Trust HTTPS certificate on Linux using Edge or Chrome

  - Ubuntu

  - Red Hat Enterprise Linux

  - SUSE Linux Enterprise Server

   - Install the ```libnss3-tools``` for your distribution.

   - Create or verify the ```$HOME/.pki/nssdb``` folder exists on the machine.

   - Export the certificate with the following command:
```cli
dotnet dev-certs https
sudo -E dotnet dev-certs https -ep /usr/local/share/ca-certificates/aspnet/https.crt --format PEM
```
The path in the preceding command is specific for Ubuntu. For other distributions, select an appropriate path or use the path for the Certificate Authorities (CAs).
   - Run the following commands:

```cli
certutil -d sql:$HOME/.pki/nssdb -A -t "P,," -n localhost -i /usr/local/share/ca-certificates/aspnet/https.crt
```

   - Exit and restart the browser.

#### Trust the certificate with Firefox on Linux

   - Export the certificate with the following command:


```vstscli
dotnet dev-certs https
sudo -E dotnet dev-certs https -ep /usr/local/share/ca-certificates/aspnet/https.crt --format PEM
```
The path in the preceding command is specific for Ubuntu. For other distributions, select an appropriate path or use the path for the Certificate Authorities (CAs).
   - Create a JSON file at ```/usr/lib/firefox/distribution/policies.json``` with the following command:

```sh
cat <<EOF | sudo tee /usr/lib/firefox/distribution/policies.json
{
    "policies": {
        "Certificates": {
            "Install": [
                "/usr/local/share/ca-certificates/aspnet/https.crt"
            ]
        }
    }
}
EOF
```

> Warning
The following instructions are intended for development purposes only. Do not use the certificates generated in these instructions for a production environment.

> Caution
Improper use of TLS certificates could lead to spoofing.

> Tip
Instructions for valid production certificates can be found in the RHEL Documentation.
RHEL8 TLS Certificates
RHEL9 TLS Certificates
RHEL9 Certificate System

### Install Dependencies

```sh
dnf install nss-tools
```

### Export The ASP.NET Core Development Certificate

> Important
Replace ${ProjectDirectory} with your projects directory.
Replace ${CertificateName} with a name you'll be able to identify in the future.

```sh
cd ${ProjectDirectory}
dotnet dev-certs https -ep ${ProjectDirectory}/${CertificateName}.crt --format PEM
```

> Caution
If using git, add your certificate to your ```${ProjectDirectory}/.gitignore``` or ```${ProjectDirectory}/.git/info/exclude```.
View the git documentation for information about these files.

> Tip
You can move your exported certificate outside of your Git repository and replace the occurrences of ${ProjectDirectory}, in the following instructions, with the new location.

### Import The ASP.NET Core Development Certificate

> Important
Replace ${UserProfile} with the profile you intend to use.
Do not replace ```$HOME```, it is the environment variable to your user directory.

#### Chromium-based Browsers

```sh
certutil -d sql:$HOME/.pki/nssdb -A -t "P,," -n ${CertificateName} -i ${ProjectDirectory}/${CertificateName}.crt
certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n ${CertificateName} -i ${ProjectDirectory}/${CertificateName}.crt
```

#### Mozilla Firefox

```sh
certutil -d sql:$HOME/.mozilla/firefox/${UserProfile}/ -A -t "P,," -n ${CertificateName} -i ${ProjectDirectory}/${CertificateName}.crt
certutil -d sql:$HOME/.mozilla/firefox/${UserProfile}/ -A -t "C,," -n ${CertificateName} -i ${ProjectDirectory}/${CertificateName}.crt
```

#### Create An Alias To Test With Curl

> Important
Don't delete the exported certificate if you plan to test with curl.
You'll need to create an alias referencing it in your ```$SHELL```'s profile

```sh
alias curl="curl --cacert ${ProjectDirectory}/${CertificateName}.crt"
```

### Cleaning up the Development Certificates

```sh
certutil -d sql:$HOME/.pki/nssdb -D -n ${CertificateName}
certutil -d sql:$HOME/.mozilla/firefox/${UserProfile}/ -D -n ${CertificateName}
rm ${ProjectDirectory}/${CertificateName}.crt
dotnet dev-certs https --clean
```

> Note
Remove the curl alias you created earlier

### Trust the certificate with Fedora 34

 - This GitHub comment

 - Fedora: Using Shared System Certificates

 - Set up a .NET development environment on Fedora.

### Trust the certificate with other distros

## Trust HTTPS certificate from Windows Subsystem for Linux

 - On Windows, export the developer certificate to a file:
dotnet dev-certs https -ep https.pfx -p $CREDENTIAL_PLACEHOLDER$ --trust

Where $CREDENTIAL_PLACEHOLDER$ is a password.

 - In a WSL window, import the exported certificate on the WSL instance:
dotnet dev-certs https --clean --import <<path-to-pfx>> --password $CREDENTIAL_PLACEHOLDER$

## Troubleshoot certificate problems such as certificate not trusted

### All platforms - certificate not trusted

```dotnetcli
dotnet dev-certs https --clean
dotnet dev-certs https --trust
```

### ```dotnet dev-certs https --clean``` Fails

### Docker - certificate not trusted

 - Delete the C:\Users{USER}\AppData\Roaming\ASP.NET\Https folder.

 - Clean the solution. Delete the bin and obj folders.

 - Restart the development tool. For example, Visual Studio or Visual Studio Code.

### Windows - certificate not trusted

 - Check the certificates in the certificate store. There should be a ```localhost``` certificate with the ```ASP.NET Core HTTPS development certificate``` friendly name both under ```Current User > Personal > Certificates``` and ```Current User > Trusted root certification authorities > Certificates```

 - Remove all the found certificates from both Personal and Trusted root certification authorities. Do not remove the IIS Express ```localhost``` certificate.

 - Run the following commands:

```dotnetcli
dotnet dev-certs https --clean
dotnet dev-certs https --trust
```

### OS X - certificate not trusted

 - Open KeyChain Access.

 - Select the System keychain.

 - Check for the presence of a ```localhost``` certificate.

 - Check that it contains a + symbol on the icon to indicate it's trusted for all users.

 - Remove the certificate from the system keychain.

 - Run the following commands:

```dotnetcli
dotnet dev-certs https --clean
dotnet dev-certs https --trust
```

### Linux certificate not trusted

 - An old certificate.

 - An exported a developer certificate for the root user. For this case, export the  certificate.

### IIS Express SSL certificate used with Visual Studio

### Group policy prevents self-signed certificates from being trusted

## Additional information

 - Configure ASP.NET Core to work with proxy servers and load balancers

 - Host ASP.NET Core on Linux with Nginx: HTTPS configuration

 - How to Set Up SSL on IIS

 - Configure endpoints for the ASP.NET Core Kestrel web server

 - OWASP HSTS browser support

Ref: [Enforce HTTPS in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/enforcing-ssl?view=aspnetcore-8.0)