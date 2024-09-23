---
title: Security and Identity - Host Docker with HTTPS
published: true
date: 2024-09-20 02:56:07
tags: Summary, AspNetCore
description: 
image:
---

## In this article

## Prerequisites

## Certificates

 - The ```dotnet dev-certs``` tool is not required.

 - Certificates do not need to be stored in the location used in the instructions. Any location should work, although storing certs within your site directory is not recommended.

 - It's difficult to use the same image for testing with developer certificates.

 - It's difficult to use the same image for Hosting with production certificates.

 - There is significant risk of certificate disclosure.

## Running pre-built container images with HTTPS

### Windows using Linux containers

```dotnetcli
dotnet dev-certs https -ep %USERPROFILE%\.aspnet\https\aspnetapp.pfx -p <CREDENTIAL_PLACEHOLDER>
dotnet dev-certs https --trust
```

```console
docker pull mcr.microsoft.com/dotnet/samples:aspnetapp
docker run --rm -it -p 8000:80 -p 8001:443 -e ASPNETCORE_URLS="https://+;http://+" -e ASPNETCORE_HTTPS_PORTS=8001 -e ASPNETCORE_Kestrel__Certificates__Default__Password="<CREDENTIAL_PLACEHOLDER>" -e ASPNETCORE_Kestrel__Certificates__Default__Path=/https/aspnetapp.pfx -v %USERPROFILE%\.aspnet\https:/https/ mcr.microsoft.com/dotnet/samples:aspnetapp
```

### macOS or Linux

```dotnetcli
dotnet dev-certs https -ep ${HOME}/.aspnet/https/aspnetapp.pfx -p <CREDENTIAL_PLACEHOLDER>
dotnet dev-certs https --trust
```

```console
docker pull mcr.microsoft.com/dotnet/samples:aspnetapp
docker run --rm -it -p 8000:80 -p 8001:443 -e ASPNETCORE_URLS="https://+;http://+" -e ASPNETCORE_HTTPS_PORTS=8001 -e ASPNETCORE_Kestrel__Certificates__Default__Password="<CREDENTIAL_PLACEHOLDER>" -e ASPNETCORE_Kestrel__Certificates__Default__Path=/https/aspnetapp.pfx -v ${HOME}/.aspnet/https:/https/ mcr.microsoft.com/dotnet/samples:aspnetapp
```

### Windows using Windows containers

```dotnetcli
dotnet dev-certs https -ep %USERPROFILE%\.aspnet\https\aspnetapp.pfx -p <CREDENTIAL_PLACEHOLDER>
dotnet dev-certs https --trust
```

```console
docker pull mcr.microsoft.com/dotnet/samples:aspnetapp
docker run --rm -it -p 8000:80 -p 8001:443 -e ASPNETCORE_URLS="https://+;http://+" -e ASPNETCORE_HTTPS_PORTS=8001 -e ASPNETCORE_Kestrel__Certificates__Default__Password="<CREDENTIAL_PLACEHOLDER>" -e ASPNETCORE_Kestrel__Certificates__Default__Path=c:\https\aspnetapp.pfx -v %USERPROFILE%\.aspnet\https:C:\https\ --user ContainerAdministrator mcr.microsoft.com/dotnet/samples:aspnetapp
```

## Developing ASP.NET Core Applications with Docker over HTTPS

## See also

 - Developing ASP.NET Core Applications with Docker over HTTPS

 - ```dotnet dev-certs```

Ref: [Hosting ASP.NET Core images with Docker over HTTPS](https://learn.microsoft.com/en-us/aspnet/core/security/docker-https?view=aspnetcore-8.0)