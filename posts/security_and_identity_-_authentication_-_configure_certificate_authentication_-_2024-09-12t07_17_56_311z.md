---
title: Security and Identity - Authentication - Configure certificate authentication
published: true
date: 2024-09-12 07:17:56
tags: Summary, AspNetCore
description: Leave questions, comments, and other feedback on optional client certificates in this GitHub discussion issue.
image:
---

## In this article

## Proxy and load balancer scenarios

 - Handles the authentication.

 - Passes the user authentication information to the app (for example, in a request header), which acts on the authentication information.

## Get started

 - Add a reference to the ```Microsoft.AspNetCore.Authentication.Certificate``` NuGet package.

 - In ```Program.cs```, call
builder.Services.AddAuthentication(CertificateAuthenticationDefaults.AuthenticationScheme).AddCertificate(...);. Provide a delegate for ```OnCertificateValidated``` to do any supplementary validation on the client certificate sent with requests. Turn that information into a ```ClaimsPrincipal``` and set it on the ```context.Principal``` property.

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(
        CertificateAuthenticationDefaults.AuthenticationScheme)
    .AddCertificate();

var app = builder.Build();

app.UseAuthentication();

app.MapGet("/", () => "Hello World!");

app.Run();
```

## Configure certificate validation

### AllowedCertificateTypes = Chained, SelfSigned, or All (Chained | SelfSigned)

### ChainTrustValidationMode

### ```CustomTrustStore```

### ValidateCertificateUse

### ValidateValidityPeriod

### RevocationFlag

### RevocationMode

### Can I configure my app to require a certificate only on certain paths?

## Handler events

 - ```OnAuthenticationFailed```: Called if an exception happens during authentication and allows you to react.

 - ```OnCertificateValidated```: Called after the certificate has been validated, passed validation and a default principal has been created. This event allows you to perform your own validation and augment or replace the principal. For examples include:

   - Determining if the certificate is known to your services.

   - Constructing your own principal. Consider the following example:

```csharp
builder.Services.AddAuthentication(
        CertificateAuthenticationDefaults.AuthenticationScheme)
    .AddCertificate(options =>
    {
        options.Events = new CertificateAuthenticationEvents
        {
            OnCertificateValidated = context =>
            {
                var claims = new[]
                {
                    new Claim(
                        ClaimTypes.NameIdentifier,
                        context.ClientCertificate.Subject,
                        ClaimValueTypes.String, context.Options.ClaimsIssuer),
                    new Claim(
                        ClaimTypes.Name,
                        context.ClientCertificate.Subject,
                        ClaimValueTypes.String, context.Options.ClaimsIssuer)
                };

                context.Principal = new ClaimsPrincipal(
                    new ClaimsIdentity(claims, context.Scheme.Name));
                context.Success();

                return Task.CompletedTask;
            }
        };
    });
```

```csharp
builder.Services.AddAuthentication(
        CertificateAuthenticationDefaults.AuthenticationScheme)
    .AddCertificate(options =>
    {
        options.Events = new CertificateAuthenticationEvents
        {
            OnCertificateValidated = context =>
            {
                var validationService = context.HttpContext.RequestServices
                    .GetRequiredService<ICertificateValidationService>();

                if (validationService.ValidateCertificate(context.ClientCertificate))
                {
                    var claims = new[]
                    {
                        new Claim(
                            ClaimTypes.NameIdentifier,
                            context.ClientCertificate.Subject,
                            ClaimValueTypes.String, context.Options.ClaimsIssuer),
                        new Claim(
                            ClaimTypes.Name,
                            context.ClientCertificate.Subject,
                            ClaimValueTypes.String, context.Options.ClaimsIssuer)
                    };

                    context.Principal = new ClaimsPrincipal(
                        new ClaimsIdentity(claims, context.Scheme.Name));
                    context.Success();
                }

                return Task.CompletedTask;
            }
        };
    });
```

## Configure your server to require certificates

### Kestrel

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.ConfigureHttpsDefaults(options =>
        options.ClientCertificateMode = ClientCertificateMode.RequireCertificate);
});
```

> Note
Endpoints created by calling Listen before calling ConfigureHttpsDefaults won't have the defaults applied.

### IIS

 - Select your site from the Connections tab.

 - Double-click the SSL Settings option in the Features View window.

 - Check the Require SSL checkbox, and select the Require radio button in the Client certificates section.

![Client certificate settings in IIS!](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/certauth/_static/readme-iisconfig.png?view=aspnetcore-8.0 "Client certificate settings in IIS")

### Azure and custom web proxies

### Use certificate authentication in Azure Web Apps

> Note
Certificate Forwarding Middleware is required for this scenario.

### Use certificate authentication in custom web proxies

 - The client header name.

 - How the certificate is to be loaded (using the ```HeaderConverter``` property).

```csharp
builder.Services.AddCertificateForwarding(options =>
{
    options.CertificateHeader = "X-SSL-CERT";

    options.HeaderConverter = headerValue =>
    {
        X509Certificate2? clientCertificate = null;

        if (!string.IsNullOrWhiteSpace(headerValue))
        {
            clientCertificate = new X509Certificate2(StringToByteArray(headerValue));
        }

        return clientCertificate!;

        static byte[] StringToByteArray(string hex)
        {
            var numberChars = hex.Length;
            var bytes = new byte[numberChars / 2];

            for (int i = 0; i < numberChars; i += 2)
            {
                bytes[i / 2] = Convert.ToByte(hex.Substring(i, 2), 16);
            }

            return bytes;
        }
    };
});
```

```csharp
builder.Services.AddCertificateForwarding(options =>
{
    options.CertificateHeader = "ssl-client-cert";

    options.HeaderConverter = (headerValue) =>
    {
        X509Certificate2? clientCertificate = null;

        if (!string.IsNullOrWhiteSpace(headerValue))
        {
            clientCertificate = X509Certificate2.CreateFromPem(
                WebUtility.UrlDecode(headerValue));
        }

        return clientCertificate!;
    };
});
```

```csharp
var app = builder.Build();

app.UseCertificateForwarding();

app.UseAuthentication();
app.UseAuthorization();
```

```csharp
using System.Security.Cryptography.X509Certificates;

namespace CertAuthSample.Snippets;

public class SampleCertificateValidationService : ICertificateValidationService
{
    public bool ValidateCertificate(X509Certificate2 clientCertificate)
    {
        // Don't hardcode passwords in production code.
        // Use a certificate thumbprint or Azure Key Vault.
        var expectedCertificate = new X509Certificate2(
            Path.Combine("/path/to/pfx"), "1234");

        return clientCertificate.Thumbprint == expectedCertificate.Thumbprint;
    }
}
```

#### Implement an ```HttpClient``` using a certificate and ```IHttpClientFactory```

```csharp
var clientCertificate =
    new X509Certificate2(
      Path.Combine(_environment.ContentRootPath, "sts_dev_cert.pfx"), "1234");

builder.Services.AddHttpClient("namedClient", c =>
{
}).ConfigurePrimaryHttpMessageHandler(() =>
{
    var handler = new HttpClientHandler();
    handler.ClientCertificates.Add(clientCertificate);
    return handler;
});
```

```csharp
public class SampleHttpService
{
    private readonly IHttpClientFactory _httpClientFactory;

    public SampleHttpService(IHttpClientFactory httpClientFactory)
        => _httpClientFactory = httpClientFactory;

    public async Task<JsonDocument> GetAsync()
    {
        var httpClient = _httpClientFactory.CreateClient("namedClient");
        var httpResponseMessage = await httpClient.GetAsync("https://example.com");

        if (httpResponseMessage.IsSuccessStatusCode)
        {
            return JsonDocument.Parse(
                await httpResponseMessage.Content.ReadAsStringAsync());
        }

        throw new ApplicationException($"Status code: {httpResponseMessage.StatusCode}");
    }
}
```

### Create certificates in PowerShell

#### Create root CA

```powershell
New-SelfSignedCertificate -DnsName "root_ca_dev_damienbod.com", "root_ca_dev_damienbod.com" -CertStoreLocation "cert:\LocalMachine\My" -NotAfter (Get-Date).AddYears(20) -FriendlyName "root_ca_dev_damienbod.com" -KeyUsageProperty All -KeyUsage CertSign, CRLSign, DigitalSignature

$mypwd = ConvertTo-SecureString -String "1234" -Force -AsPlainText

Get-ChildItem -Path cert:\localMachine\my\"The thumbprint..." | Export-PfxCertificate -FilePath C:\git\root_ca_dev_damienbod.pfx -Password $mypwd

Export-Certificate -Cert cert:\localMachine\my\"The thumbprint..." -FilePath root_ca_dev_damienbod.crt
```

> Note
The ```-DnsName``` parameter value must match the deployment target of the app. For example, "localhost" for development.

#### Install in the trusted root

#### Intermediate certificate

```powershell
$mypwd = ConvertTo-SecureString -String "1234" -Force -AsPlainText

$parentcert = ( Get-ChildItem -Path cert:\LocalMachine\My\"The thumbprint of the root..." )

New-SelfSignedCertificate -certstorelocation cert:\localmachine\my -dnsname "intermediate_dev_damienbod.com" -Signer $parentcert -NotAfter (Get-Date).AddYears(20) -FriendlyName "intermediate_dev_damienbod.com" -KeyUsageProperty All -KeyUsage CertSign, CRLSign, DigitalSignature -TextExtension @("2.5.29.19={text}CA=1&pathlength=1")

Get-ChildItem -Path cert:\localMachine\my\"The thumbprint..." | Export-PfxCertificate -FilePath C:\git\AspNetCoreCertificateAuth\Certs\intermediate_dev_damienbod.pfx -Password $mypwd

Export-Certificate -Cert cert:\localMachine\my\"The thumbprint..." -FilePath intermediate_dev_damienbod.crt
```

#### Create child certificate from intermediate certificate

```powershell
$parentcert = ( Get-ChildItem -Path cert:\LocalMachine\My\"The thumbprint from the Intermediate certificate..." )

New-SelfSignedCertificate -certstorelocation cert:\localmachine\my -dnsname "child_a_dev_damienbod.com" -Signer $parentcert -NotAfter (Get-Date).AddYears(20) -FriendlyName "child_a_dev_damienbod.com"

$mypwd = ConvertTo-SecureString -String "1234" -Force -AsPlainText

Get-ChildItem -Path cert:\localMachine\my\"The thumbprint..." | Export-PfxCertificate -FilePath C:\git\AspNetCoreCertificateAuth\Certs\child_a_dev_damienbod.pfx -Password $mypwd

Export-Certificate -Cert cert:\localMachine\my\"The thumbprint..." -FilePath child_a_dev_damienbod.crt
```

#### Create child certificate from root certificate

```powershell
$rootcert = ( Get-ChildItem -Path cert:\LocalMachine\My\"The thumbprint from the root cert..." )

New-SelfSignedCertificate -certstorelocation cert:\localmachine\my -dnsname "child_a_dev_damienbod.com" -Signer $rootcert -NotAfter (Get-Date).AddYears(20) -FriendlyName "child_a_dev_damienbod.com"

$mypwd = ConvertTo-SecureString -String "1234" -Force -AsPlainText

Get-ChildItem -Path cert:\localMachine\my\"The thumbprint..." | Export-PfxCertificate -FilePath C:\git\AspNetCoreCertificateAuth\Certs\child_a_dev_damienbod.pfx -Password $mypwd

Export-Certificate -Cert cert:\localMachine\my\"The thumbprint..." -FilePath child_a_dev_damienbod.crt
```

#### Example root - intermediate certificate - certificate

```powershell
$mypwdroot = ConvertTo-SecureString -String "1234" -Force -AsPlainText
$mypwd = ConvertTo-SecureString -String "1234" -Force -AsPlainText

New-SelfSignedCertificate -DnsName "root_ca_dev_damienbod.com", "root_ca_dev_damienbod.com" -CertStoreLocation "cert:\LocalMachine\My" -NotAfter (Get-Date).AddYears(20) -FriendlyName "root_ca_dev_damienbod.com" -KeyUsageProperty All -KeyUsage CertSign, CRLSign, DigitalSignature

Get-ChildItem -Path cert:\localMachine\my\0C89639E4E2998A93E423F919B36D4009A0F9991 | Export-PfxCertificate -FilePath C:\git\root_ca_dev_damienbod.pfx -Password $mypwdroot

Export-Certificate -Cert cert:\localMachine\my\0C89639E4E2998A93E423F919B36D4009A0F9991 -FilePath root_ca_dev_damienbod.crt

$rootcert = ( Get-ChildItem -Path cert:\LocalMachine\My\0C89639E4E2998A93E423F919B36D4009A0F9991 )

New-SelfSignedCertificate -certstorelocation cert:\localmachine\my -dnsname "child_a_dev_damienbod.com" -Signer $rootcert -NotAfter (Get-Date).AddYears(20) -FriendlyName "child_a_dev_damienbod.com" -KeyUsageProperty All -KeyUsage CertSign, CRLSign, DigitalSignature -TextExtension @("2.5.29.19={text}CA=1&pathlength=1")

Get-ChildItem -Path cert:\localMachine\my\BA9BF91ED35538A01375EFC212A2F46104B33A44 | Export-PfxCertificate -FilePath C:\git\AspNetCoreCertificateAuth\Certs\child_a_dev_damienbod.pfx -Password $mypwd

Export-Certificate -Cert cert:\localMachine\my\BA9BF91ED35538A01375EFC212A2F46104B33A44 -FilePath child_a_dev_damienbod.crt

$parentcert = ( Get-ChildItem -Path cert:\LocalMachine\My\BA9BF91ED35538A01375EFC212A2F46104B33A44 )

New-SelfSignedCertificate -certstorelocation cert:\localmachine\my -dnsname "child_b_from_a_dev_damienbod.com" -Signer $parentcert -NotAfter (Get-Date).AddYears(20) -FriendlyName "child_b_from_a_dev_damienbod.com" 

Get-ChildItem -Path cert:\localMachine\my\141594A0AE38CBBECED7AF680F7945CD51D8F28A | Export-PfxCertificate -FilePath C:\git\AspNetCoreCertificateAuth\Certs\child_b_from_a_dev_damienbod.pfx -Password $mypwd

Export-Certificate -Cert cert:\localMachine\my\141594A0AE38CBBECED7AF680F7945CD51D8F28A -FilePath child_b_from_a_dev_damienbod.crt
```

```csharp
using System.Security.Cryptography.X509Certificates;

namespace CertAuthSample.Snippets;

public class SampleCertificateThumbprintsValidationService : ICertificateValidationService
{
    private readonly string[] validThumbprints = new[]
    {
        "141594A0AE38CBBECED7AF680F7945CD51D8F28A",
        "0C89639E4E2998A93E423F919B36D4009A0F9991",
        "BA9BF91ED35538A01375EFC212A2F46104B33A44"
    };

    public bool ValidateCertificate(X509Certificate2 clientCertificate)
        => validThumbprints.Contains(clientCertificate.Thumbprint);
}
```

## Certificate validation caching

```csharp
builder.Services.AddAuthentication(
        CertificateAuthenticationDefaults.AuthenticationScheme)
    .AddCertificate()
    .AddCertificateCache(options =>
    {
        options.CacheSize = 1024;
        options.CacheEntryExpiration = TimeSpan.FromMinutes(2);
    });
```

## Optional client certificates

 - Are a TLS feature, not an HTTP feature.

 - Are negotiated per-connection and usually at the start of the connection before any HTTP data is available.

 - Using separate host names (SNI) and redirecting. While more work to configure, this is recommended because it works in most environments and protocols.

 - Renegotiation during an HTTP request. This has several limitations and is not recommended.

### Separate Hosts (SNI)

 - Set up binding for the domain and subdomain:

   - For example, set up bindings on ```contoso.com``` and ```myClient.contoso.com```. The ```contoso.com``` host doesn't require a client certificate but ```myClient.contoso.com``` does.

   - For more information, see:

     - Kestrel web server in ASP.NET Core:

       - ListenOptions.UseHttps

       - ClientCertificateMode

     - IIS

       - Hosting IIS

       - Configure security on IIS

     - HTTP.sys: Configure Windows Server

 - For requests to the web app that require a client certificate and don't have one:

   - Redirect to the same page using the client certificate protected subdomain.

   - For example, redirect to ```myClient.contoso.com/requestedPage```. Because the request to ```myClient.contoso.com/requestedPage``` is a different hostname than ```contoso.com/requestedPage```, the client establishes a different connection and the client certificate is provided.

   - For more information, see Introduction to authorization in ASP.NET Core.

### Renegotiation

 - In HTTP/1.1 the server must first buffer or consume any HTTP data that is in flight such as POST request bodies to make sure the connection is clear for the renegotiation. Otherwise the renegotiation can stop responding or fail.

 - HTTP/2 and HTTP/3 explicitly prohibit renegotiation.

 - There are security risks associated with renegotiation. TLS 1.3 removed renegotiation of the whole connection and replaced it with a new extension for requesting only the client certificate after the start of the connection. This mechanism is exposed via the same APIs and is still subject to the prior constraints of buffering and HTTP protocol versions.

#### IIS

#### HttpSys

#### Kestrel

Leave questions, comments, and other feedback on optional client certificates in this GitHub discussion issue.

Ref: [Configure certificate authentication in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/certauth?view=aspnetcore-8.0)