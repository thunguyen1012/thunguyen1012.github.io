---
title: Servers - Kestrel - Endpoints
published: true
date: 2024-09-11 03:05:09
tags: Summary, AspNetCore
description: 
image:
---

## In this article

 - The address specifies the network interface that the server listens on for incoming requests, such as a TCP port.

 - The protocol specifies the communication between the client and server, such as HTTP/1.1, HTTP/2, or HTTP/3.

 - An endpoint can be secured using the ```https``` URL scheme or ```UseHttps``` method.

 - Configure endpoints

 - Configure ```HTTPS```

 - Configure HTTP protocols

## Default endpoint

## Configure endpoints

 - Configure endpoints with URLs

 - Specify ports only

 - Configure endpoints in ```appsettings.json```

 - Configure endpoints in code

### Configure endpoints with URLs

 - ```ASPNETCORE_URLS``` environment variable.

 - ```--urls``` command-line argument.

 - ```urls``` host configuration key.

 - ```UseUrls``` extension method.

 - WebApplication.Urls property.

#### URL formats

 - IPv4 address with port number
http://65.55.39.10:80/

0.0.0.0 is a special case that binds to all IPv4 addresses.

 - IPv6 address with port number
http://[0:0:0:0:0:ffff:4137:270a]:80/

[::] is the IPv6 equivalent of IPv4 ```0.0.0.0```.

 - Wildcard host with port number
http://contoso.com:80/
http://*:80/

Anything not recognized as a valid IP address or ```localhost``` is treated as a wildcard that binds to all IPv4 and IPv6 addresses. Some people like to use * or + to be more explicit. To bind different host names to different ASP.NET Core apps on the same port, use HTTP.sys or a reverse proxy server.
Reverse proxy server examples include IIS, YARP, Nginx, and Apache.

 - Host name ```localhost``` with port number or loopback IP with port number
http://localhost:5000/
http://127.0.0.1:5000/
http://[::1]:5000/

When ```localhost``` is specified, ```Kestrel``` attempts to bind to both IPv4 and IPv6 loopback interfaces. If the requested port is in use by another service on either loopback interface, ```Kestrel``` fails to start. If either loopback interface is unavailable for any other reason (most commonly because IPv6 isn't supported), ```Kestrel``` logs a warning.

#### ```HTTPS``` URL prefixes

### Specify ports only

### Configure endpoints in ```appsettings.json```

```json
{
  "Kestrel": {
    "Endpoints": {
      "MyHttpEndpoint": {
        "Url": "http://localhost:8080"
      }
    }
  }
}
```

 - Uses ```appsettings.json``` as the configuration source. However, any ```IConfiguration``` source can be used.

 - Adds an endpoint named ```MyHttpEndpoint``` on port 8080.

#### Reloading endpoints from configuration

 - The new configuration is compared to the old one, and any endpoint without configuration changes isn't modified.

 - Removed or modified endpoints are given 5 seconds to complete processing requests and shut down.

 - New or modified endpoints are started.

#### ConfigurationLoader

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel((context, serverOptions) =>
{
    var kestrelSection = context.Configuration.GetSection("Kestrel");

    serverOptions.Configure(kestrelSection)
        .Endpoint("HTTPS", listenOptions =>
        {
            // ...
        });
});
```

 - The configuration section for each endpoint is available on the options in the ```Endpoint``` method so that custom settings may be read.

 - ```KestrelServerOptions.Configure(IConfiguration)``` can be called multiple times, but only the last configuration is used unless ```Load``` is explicitly called on prior instances. The default host doesn't call ```Load``` so that its default configuration section may be replaced.

 - ```KestrelConfigurationLoader``` mirrors the ```Listen``` family of APIs from ```KestrelServerOptions``` as ```Endpoint``` overloads, so code and config endpoints can be configured in the same place. These overloads don't use names and only consume default settings from configuration.

### Configure endpoints in code

 - ```Listen```

 - ListenLocalhost

 - ListenAnyIP

 - ListenUnixSocket

 - ListenNamedPipe

#### Bind to a TCP socket

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel((context, serverOptions) =>
{
    serverOptions.Listen(IPAddress.Loopback, 5000);
    serverOptions.Listen(IPAddress.Loopback, 5001, listenOptions =>
    {
        listenOptions.UseHttps("testCert.pfx", "testPassword");
    });
});
```

 - Configures endpoints that listen on port 5000 and 5001.

 - Configures ```HTTPS``` for an endpoint with the ```UseHttps``` extension method on ```ListenOptions```. For more information, see Configure ```HTTPS``` in code.

#### Bind to a Unix socket

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel((context, serverOptions) =>
{
    serverOptions.ListenUnixSocket("/tmp/kestrel-test.sock");
});
```

 - In the Nginx configuration file, set the ```server > location > proxy_pass``` entry to http://unix:/tmp/{KESTREL SOCKET}:/;. {KESTREL SOCKET} is the name of the socket provided to ListenUnixSocket (for example, ```kestrel-test.sock``` in the preceding example).

 - Ensure that the socket is writeable by Nginx (for example, ```chmod go+w /tmp/kestrel-test.sock```).

#### Configure endpoint defaults

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ConfigureEndpointDefaults(listenOptions =>
    {
        // ...
    });
});
```

> Note
Endpoints created by calling ```Listen``` before calling ```ConfigureEndpointDefaults``` won't have the defaults applied.

### Dynamic port binding

```csharp
app.Run(async (context) =>
{
    var serverAddressFeature = context.Features.Get<IServerAddressesFeature>();

    if (serverAddressFeature is not null)
    {
        var listenAddresses = string.Join(", ", serverAddressFeature.Addresses);

        // ...
    }
});
```

 - ```KestrelServerOptions.ListenLocalhost```

 - Binding TCP-based HTTP/1.1 or HTTP/2, and QUIC-based HTTP/3 together.

## Configure ```HTTPS```

 - If URL prefixes or specify ports only are used to define endpoints, ```HTTPS``` can be used only if a default certificate is provided in ```HTTPS``` endpoint configuration. A default certificate can be configured with one of the following options:

 - Configure ```HTTPS``` in ```appsettings.json```

 - Configure ```HTTPS``` in code

### Configure ```HTTPS``` in ```appsettings.json```

```json
{
  "Kestrel": {
    "Endpoints": {
      "Http": {
        "Url": "http://localhost:5000"
      },
      "HttpsInlineCertFile": {
        "Url": "https://localhost:5001",
        "Certificate": {
          "Path": "<path to .pfx file>",
          "Password": "$CREDENTIAL_PLACEHOLDER$"
        }
      },
      "HttpsInlineCertAndKeyFile": {
        "Url": "https://localhost:5002",
        "Certificate": {
          "Path": "<path to .pem/.crt file>",
          "KeyPath": "<path to .key file>",
          "Password": "$CREDENTIAL_PLACEHOLDER$"
        }
      },
      "HttpsInlineCertStore": {
        "Url": "https://localhost:5003",
        "Certificate": {
          "Subject": "<subject; required>",
          "Store": "<certificate store; required>",
          "Location": "<location; defaults to CurrentUser>",
          "AllowInvalid": "<true or false; defaults to false>"
        }
      },
      "HttpsDefaultCert": {
        "Url": "https://localhost:5004"
      }
    },
    "Certificates": {
      "Default": {
        "Path": "<path to .pfx file>",
        "Password": "$CREDENTIAL_PLACEHOLDER$"
      }
    }
  }
}
```

> Warning
In the preceding example, the certificate password is stored in plain-text in ```appsettings.json```. The $CREDENTIAL_PLACEHOLDER$ token is used as a placeholder for the certificate's password. To store certificate passwords securely in development environments, see Protect secrets in development. To store certificate passwords securely in production environments, see Azure Key Vault configuration provider. Development secrets shouldn't be used for production or test.

#### Schema notes

 - ```Endpoint``` names are case-insensitive. For example, ```HTTPS``` and ```Https``` are equivalent.

 - The ```Url``` parameter is required for each endpoint. The format for this parameter is the same as the top-level ```Urls``` configuration parameter except that it's limited to a single value. See URL formats earlier in this article.

 - These endpoints replace the ones defined in the top-level ```Urls``` configuration rather than adding to them. Endpoints defined in code via ```Listen``` are cumulative with the endpoints defined in the configuration section.

 - The ```Certificate``` section is optional. If the ```Certificate``` section isn't specified, the defaults defined in ```Certificates:Default``` are used. If no defaults are available, the development certificate is used. If there are no defaults and the development certificate isn't present, the server throws an exception and fails to start.

 - The ```Certificate``` section supports multiple certificate sources.

 - Any number of endpoints may be defined in ```Configuration```, as long as they don't cause port conflicts.

#### ```Certificate``` sources

 - ```Path``` and ```Password``` to load .pfx files.

 - ```Path```, ```KeyPath``` and ```Password``` to load .pem/.crt and .key files.

 - ```Subject``` and ```Store``` to load from the certificate store.

```json
"Default": {
  "Subject": "<subject; required>",
  "Store": "<cert store; required>",
  "Location": "<location; defaults to CurrentUser>",
  "AllowInvalid": "<true or false; defaults to false>"
}
```

#### Configure client certificates in ```appsettings.json```

```json
{
  "Kestrel": {
    "Endpoints": {
      "MyHttpsEndpoint": {
        "Url": "https://localhost:5001",
        "ClientCertificateMode": "AllowCertificate",
        "Certificate": {
          "Path": "<path to .pfx file>",
          "Password": "$CREDENTIAL_PLACEHOLDER$"
        }
      }
    }
  }
}
```

> Warning
In the preceding example, the certificate password is stored in plain-text in ```appsettings.json```. The `$CREDENTIAL_PLACEHOLDER$` token is used as a placeholder for the certificate's password. To store certificate passwords securely in development environments, see Protect secrets in development. To store certificate passwords securely in production environments, see Azure Key Vault configuration provider. Development secrets shouldn't be used for production or test.

#### Configure SSL/TLS protocols in ```appsettings.json```

```json
{
  "Kestrel": {
    "Endpoints": {
      "MyHttpsEndpoint": {
        "Url": "https://localhost:5001",
        "SslProtocols": ["Tls12", "Tls13"],
        "Certificate": {
          "Path": "<path to .pfx file>",
          "Password": "$CREDENTIAL_PLACEHOLDER$"
        }
      }
    }
  }
}
```

> Warning
In the preceding example, the certificate password is stored in plain-text in ```appsettings.json```. The `$CREDENTIAL_PLACEHOLDER$` token is used as a placeholder for the certificate's password. To store certificate passwords securely in development environments, see Protect secrets in development. To store certificate passwords securely in production environments, see Azure Key Vault configuration provider. Development secrets shouldn't be used for production or test.

### Configure ```HTTPS``` in code

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel((context, serverOptions) =>
{
    serverOptions.Listen(IPAddress.Loopback, 5000);
    serverOptions.Listen(IPAddress.Loopback, 5001, listenOptions =>
    {
        listenOptions.UseHttps("testCert.pfx", "testPassword");
    });
});
```

 - ```filename``` is the path and file name of a certificate file, relative to the directory that contains the app's content files.

 - password is the password required to access the X.509 certificate data.

 - ```configureOptions``` is an ```Action``` to configure the ```HttpsConnectionAdapterOptions```. Returns the ```ListenOptions```.

 - ```storeName``` is the certificate store from which to load the certificate.

 - ```subject``` is the ```subject``` name for the certificate.

 - ```allowInvalid``` indicates if invalid certificates should be considered, such as self-signed certificates.

 - ```location``` is the store ```location``` to load the certificate from.

 - ```serverCertificate``` is the X.509 certificate.

#### Configure client certificates in code

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ConfigureHttpsDefaults(listenOptions =>
    {
        listenOptions.ClientCertificateMode = ClientCertificateMode.AllowCertificate;
    });
});
```

#### Configure ```HTTPS``` defaults in code

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ConfigureHttpsDefaults(listenOptions =>
    {
        // ...
    });
});
```

> Note
Endpoints created by calling ```Listen``` before calling ```ConfigureHttpsDefaults``` won't have the defaults applied.

#### Configure SSL/TLS protocols in code

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ConfigureHttpsDefaults(listenOptions =>
    {
        listenOptions.SslProtocols = SslProtocols.Tls13;
    });
});
```

#### Configure TLS cipher suites filter in code

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel((context, serverOptions) =>
{
    serverOptions.ConfigureHttpsDefaults(listenOptions =>
    {
        listenOptions.OnAuthenticate = (context, sslOptions) =>
        {
            sslOptions.CipherSuitesPolicy = new CipherSuitesPolicy(
                new[]
                {
                    TlsCipherSuite.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,
                    TlsCipherSuite.TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,
                    // ...
                });
        };
    });
});
```

## Configure Server Name Indication

 - Configure a mapping between host names and ```HTTPS``` options in ```Configuration```. For example, JSON in  the ```appsettings.json``` file.

 - Create an endpoint in code and select a certificate using the host name with the ```ServerCertificateSelector``` callback.

### Configure SNI in ```appsettings.json```

```json
{
  "Kestrel": {
    "Endpoints": {
      "MySniEndpoint": {
        "Url": "https://*",
        "SslProtocols": ["Tls11", "Tls12"],
        "Sni": {
          "a.example.org": {
            "Protocols": "Http1AndHttp2",
            "SslProtocols": ["Tls11", "Tls12", "Tls13"],
            "Certificate": {
              "Subject": "<subject; required>",
              "Store": "<certificate store; required>",
            },
            "ClientCertificateMode" : "NoCertificate"
          },
          "*.example.org": {
            "Certificate": {
              "Path": "<path to .pfx file>",
              "Password": "$CREDENTIAL_PLACEHOLDER$"
            }
          },
          "*": {
            // At least one subproperty needs to exist per SNI section or it
            // cannot be discovered via IConfiguration
            "Protocols": "Http1",
          }
        }
      }
    },
    "Certificates": {
      "Default": {
        "Path": "<path to .pfx file>",
        "Password": "$CREDENTIAL_PLACEHOLDER$"
      }
    }
  }
}
```

> Warning
In the preceding example, the certificate password is stored in plain-text in ```appsettings.json```. The `$CREDENTIAL_PLACEHOLDER$` token is used as a placeholder for the certificate's password. To store certificate passwords securely in development environments, see Protect secrets in development. To store certificate passwords securely in production environments, see Azure Key Vault configuration provider. Development secrets shouldn't be used for production or test.

 - ```Certificate``` configures the certificate source.

 - ```Protocols``` configures the allowed HTTP protocols.

 - ```SslProtocols``` configures the allowed SSL protocols.

 - ```ClientCertificateMode``` configures the client certificate requirements.

 - Exact match. For example, ```a.example.org``` matches ```a.example.org```.

 - Wildcard prefix. If there are multiple wildcard matches, then the longest pattern is chosen. For example, ```*.example.org``` matches ```b.example.org``` and ```c.example.org```.

 - Full wildcard. * matches everything else, including clients that aren't using SNI and don't send a host name.

### Configure SNI with code

 - ```ServerCertificateSelector```

 - ```ServerOptionsSelectionCallback```

 - ```TlsHandshakeCallbackOptions```

#### SNI with ```ServerCertificateSelector```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ListenAnyIP(5005, listenOptions =>
    {
        listenOptions.UseHttps(httpsOptions =>
        {
            var localhostCert = CertificateLoader.LoadFromStoreCert(
                "localhost", "My", StoreLocation.CurrentUser,
                allowInvalid: true);
            var exampleCert = CertificateLoader.LoadFromStoreCert(
                "example.com", "My", StoreLocation.CurrentUser,
                allowInvalid: true);
            var subExampleCert = CertificateLoader.LoadFromStoreCert(
                "sub.example.com", "My", StoreLocation.CurrentUser,
                allowInvalid: true);
            var certs = new Dictionary<string, X509Certificate2>(
                StringComparer.OrdinalIgnoreCase)
            {
                ["localhost"] = localhostCert,
                ["example.com"] = exampleCert,
                ["sub.example.com"] = subExampleCert
            };

            httpsOptions.ServerCertificateSelector = (connectionContext, name) =>
            {
                if (name is not null && certs.TryGetValue(name, out var cert))
                {
                    return cert;
                }

                return exampleCert;
            };
        });
    });
});
```

#### SNI with ```ServerOptionsSelectionCallback```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ListenAnyIP(5005, listenOptions =>
    {
        listenOptions.UseHttps(httpsOptions =>
        {
            var localhostCert = CertificateLoader.LoadFromStoreCert(
                "localhost", "My", StoreLocation.CurrentUser,
                allowInvalid: true);
            var exampleCert = CertificateLoader.LoadFromStoreCert(
                "example.com", "My", StoreLocation.CurrentUser,
                allowInvalid: true);

            listenOptions.UseHttps((stream, clientHelloInfo, state, cancellationToken) =>
            {
                if (string.Equals(clientHelloInfo.ServerName, "localhost",
                    StringComparison.OrdinalIgnoreCase))
                {
                    return new ValueTask<SslServerAuthenticationOptions>(
                        new SslServerAuthenticationOptions
                        {
                            ServerCertificate = localhostCert,
                            // Different TLS requirements for this host
                            ClientCertificateRequired = true
                        });
                }

                return new ValueTask<SslServerAuthenticationOptions>(
                    new SslServerAuthenticationOptions
                    {
                        ServerCertificate = exampleCert
                    });
            }, state: null!);
        });
    });
});
```

#### SNI with ```TlsHandshakeCallbackOptions```

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ListenAnyIP(5005, listenOptions =>
    {
        listenOptions.UseHttps(httpsOptions =>
        {
            var localhostCert = CertificateLoader.LoadFromStoreCert(
                "localhost", "My", StoreLocation.CurrentUser,
                allowInvalid: true);
            var exampleCert = CertificateLoader.LoadFromStoreCert(
                "example.com", "My", StoreLocation.CurrentUser,
                allowInvalid: true);

            listenOptions.UseHttps(new TlsHandshakeCallbackOptions
            {
                OnConnection = context =>
                {
                    if (string.Equals(context.ClientHelloInfo.ServerName, "localhost",
                        StringComparison.OrdinalIgnoreCase))
                    {
                        // Different TLS requirements for this host
                        context.AllowDelayedClientCertificateNegotation = true;

                        return new ValueTask<SslServerAuthenticationOptions>(
                            new SslServerAuthenticationOptions
                            {
                                ServerCertificate = localhostCert
                            });
                    }

                    return new ValueTask<SslServerAuthenticationOptions>(
                        new SslServerAuthenticationOptions
                        {
                            ServerCertificate = exampleCert
                        });
                }
            });
        });
    });
});
```

## Configure HTTP protocols

<table><thead>
<tr>
<th><code>HttpProtocols</code> value</th>
<th>Connection protocol permitted</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>Http1</code></td>
<td>HTTP/1.1 only. Can be used with or without TLS.</td>
</tr>
<tr>
<td><code>Http2</code></td>
<td>HTTP/2 only. May be used without TLS only if the client supports a <a href="https://tools.ietf.org/html/rfc7540#section-3.4" data-linktype="external">Prior Knowledge mode</a>.</td>
</tr>
<tr>
<td><code>Http3</code></td>
<td>HTTP/3 only. Requires TLS. The client may need to be configured to use HTTP/3 only.</td>
</tr>
<tr>
<td><code>Http1AndHttp2</code></td>
<td>HTTP/1.1 and HTTP/2. HTTP/2 requires the client to select HTTP/2 in the TLS <a href="https://tools.ietf.org/html/rfc7301#section-3" data-linktype="external">Application-Layer Protocol Negotiation (ALPN)</a> handshake; otherwise, the connection defaults to HTTP/1.1.</td>
</tr>
<tr>
<td><code>Http1AndHttp2AndHttp3</code></td>
<td>HTTP/1.1, HTTP/2 and HTTP/3. The first client request normally uses HTTP/1.1 or HTTP/2, and the <a href="http3?view=aspnetcore-8.0#alt-svc" data-linktype="relative-path"><code>alt-svc</code> response header</a> prompts the client to upgrade to HTTP/3. HTTP/2 and HTTP/3 requires TLS; otherwise, the connection defaults to HTTP/1.1.</td>
</tr>
</tbody></table>

 - TLS version 1.2 or later

 - Renegotiation disabled

 - Compression disabled

 - Minimum ephemeral key exchange sizes:

   - Elliptic curve Diffie-Hellman (ECDHE) [RFC4492]: 224 bits minimum

   - Finite field Diffie-Hellman (DHE) [TLS12]: 2048 bits minimum

 - Cipher suite not prohibited.

### Configure HTTP protocols in ```appsettings.json```

```json
{
  "Kestrel": {
    "Endpoints": {
      "HttpsDefaultCert": {
        "Url": "https://localhost:5001",
        "Protocols": "Http1"
      }
    }
  }
}
```

```json
{
  "Kestrel": {
    "EndpointDefaults": {
      "Protocols": "Http1"
    }
  }
}
```

### Configure HTTP protocols in code

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel((context, serverOptions) =>
{
    serverOptions.Listen(IPAddress.Any, 8000, listenOptions =>
    {
        listenOptions.UseHttps("testCert.pfx", "testPassword");
        listenOptions.Protocols = HttpProtocols.Http1AndHttp2AndHttp3;
    });
});
```

## See also

 - ```Kestrel``` web server in ASP.NET Core

 - Configure options for the ASP.NET Core ```Kestrel``` web server

Ref: [Configure endpoints for the ASP.NET Core ```Kestrel``` web server](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/endpoints?view=aspnetcore-8.0)