---
title: Security and Identity - Secrets management - Azure Key Vault Configuration Provider
published: true
date: 2024-09-20 02:56:06
tags: Summary, AspNetCore
description: 
image:
---

## In this article

 - Controlling access to sensitive configuration data.

 - Meeting the requirement for FIPS 140-2 Level 2 validated Hardware Security Modules (HSMs) when storing configuration data.

## Packages

 - Azure.Extensions.AspNetCore.Configuration.Secrets

 - Azure.Identity

## Sample app

 - ```Certificate```: Demonstrates using an Azure Key Vault Client ID and X.509 certificate to access secrets stored in Azure Key Vault. This sample can be run from any location, whether deployed to Azure App Service or any host that can serve an ASP.NET Core app.

 - ```Managed```: Demonstrates how to use ```Managed``` identities for Azure resources. The managed identity authenticates the app to Azure Key Vault with ```Managed``` identities for Azure resources without storing credentials in the app's code or configuration. The ```Managed``` version of the sample must be deployed to Azure. Follow the guidance in the Use the managed identities for Azure resources section.

## Secret storage in the Development environment

```xml
<PropertyGroup>
  <UserSecretsId>{GUID}</UserSecretsId>
</PropertyGroup>
```

```dotnetcli
dotnet user-secrets set "{SECRET NAME}" "{SECRET VALUE}"
```

```dotnetcli
dotnet user-secrets set "SecretName" "secret_value_1_dev"
dotnet user-secrets set "Section:SecretName" "secret_value_2_dev"
```

## Secret storage in the Production environment with Azure Key Vault

 - Open Azure Cloud Shell using any one of the following methods in the Azure portal:

For more information, see Azure CLI and Overview of Azure Cloud Shell.

   - Select Try It in the upper-right corner of a code block. Use the search string "Azure CLI" in the text box.

   - Open Cloud Shell in your browser with the Launch Cloud Shell button.

   - Select the Cloud Shell button on the menu in the upper-right corner of the Azure portal.

 - If you aren't already authenticated, sign in with the ```az login``` command.

 - Create a resource group with the following command, where {RESOURCE GROUP NAME} is the new resource group's name and {LOCATION} is the Azure region:

```azurecli
az group create --name "{RESOURCE GROUP NAME}" --location {LOCATION}
```

 - Create a Key Vault in the resource group with the following command, where {KEY VAULT NAME} is the new vault's name and {LOCATION} is the Azure region:

```azurecli
az keyvault create --name {KEY VAULT NAME} --resource-group "{RESOURCE GROUP NAME}" --location {LOCATION}
```

 - Create secrets in the vault as name-value pairs.
Azure Key Vault secret names are limited to alphanumeric characters and dashes. Hierarchical values (configuration sections) use -- (two dashes) as a delimiter, as colons aren't allowed in Key Vault secret names. Colons delimit a section from a subkey in ASP.NET Core configuration. The two-dash sequence is replaced with a colon when the secrets are loaded into the app's configuration.
The following secrets are for use with the sample app. The values include a ```_prod``` suffix to distinguish them from the ```_dev``` suffix values loaded in the Development environment from Secret Manager. Replace {KEY VAULT NAME} with the name of the Key Vault you created in the prior step:

```azurecli
az keyvault secret set --vault-name {KEY VAULT NAME} --name "SecretName" --value "secret_value_1_prod"
az keyvault secret set --vault-name {KEY VAULT NAME} --name "Section--SecretName" --value "secret_value_2_prod"
```

## Use Application ID and X.509 certificate for non-Azure-hosted apps

> Note
Although using an Application ID and X.509 certificate is supported for apps hosted in Azure, it's not recommended. Instead, use ```Managed``` identities for Azure resources when hosting an app in Azure. ```Managed``` identities don't require storing a certificate in the app or in the development environment.

 - Create a PKCS#12 archive (.pfx) certificate. Options for creating certificates include New-SelfSignedCertificate on Windows and OpenSSL.

 - Install the certificate into the current user's personal certificate store. Marking the key as exportable is optional. Note the certificate's thumbprint, which is used later in this process.

 - Export the PKCS#12 archive (.pfx) certificate as a DER-encoded certificate (.cer).

 - Register the app with Microsoft Entra ID (App registrations).

 - Upload the DER-encoded certificate (.cer) to Microsoft Entra ID:

Select the app in Microsoft Entra ID.
Navigate to Certificates & secrets.
Select Upload certificate to upload the certificate, which contains the public key. A .cer, .pem, or .crt certificate is acceptable.

   - Select the app in Microsoft Entra ID.

   - Navigate to Certificates & secrets.

   - Select Upload certificate to upload the certificate, which contains the public key. A .cer, .pem, or .crt certificate is acceptable.

 - Store the Key Vault name, Application ID, and certificate thumbprint in the app's ```appsettings.json``` file.

 - Navigate to Key Vaults in the Azure portal.

 - Select the Key Vault you created in the Secret storage in the Production environment with Azure Key Vault section.

 - Select Access policies.

 - Select Add Access Policy.

 - Open Secret permissions and provide the app with ```Get``` and ```List``` permissions.

 - Select Select principal and select the registered app by name. Select the Select button.

 - Select OK.

 - Select Save.

 - Deploy the app.

 - Non-hierarchical values: The value for ```SecretName``` is obtained with config["SecretName"].

 - Hierarchical values (sections): Use : (colon) notation or the GetSection method. Use either of these approaches to obtain the configuration value:

   - config["Section:SecretName"]

   - config.GetSection("Section")["SecretName"]

```csharp
using System.Security.Cryptography.X509Certificates;
using Azure.Identity;

var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsProduction())
{
    using var x509Store = new X509Store(StoreLocation.CurrentUser);

    x509Store.Open(OpenFlags.ReadOnly);

    var x509Certificate = x509Store.Certificates
        .Find(
            X509FindType.FindByThumbprint,
            builder.Configuration["AzureADCertThumbprint"],
            validOnly: false)
        .OfType<X509Certificate2>()
        .Single();

    builder.Configuration.AddAzureKeyVault(
        new Uri($"https://{builder.Configuration["KeyVaultName"]}.vault.azure.net/"),
        new ClientCertificateCredential(
            builder.Configuration["AzureADDirectoryId"],
            builder.Configuration["AzureADApplicationId"],
            x509Certificate));
}

var app = builder.Build();
```

 - Key Vault name: ```contosovault```

 - Application ID: ```627e911e-43cc-61d4-992e-12db9c81b413```

 - ```Certificate``` thumbprint: ```fe14593dd66b2406c5269d742d04b6e1ab03adb1```

```json
{
  "KeyVaultName": "Key Vault Name",
  "AzureADApplicationId": "Azure AD Application ID",
  "AzureADCertThumbprint": "Azure AD Certificate Thumbprint",
  "AzureADDirectoryId": "Azure AD Directory ID"
}
```

## Use managed identities for Azure resources

```azurecli
az keyvault set-policy --name {KEY VAULT NAME} --object-id {OBJECT ID} --secret-permissions get list
```

```csharp
using Azure.Identity;

var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsProduction())
{
    builder.Configuration.AddAzureKeyVault(
        new Uri($"https://{builder.Configuration["KeyVaultName"]}.vault.azure.net/"),
        new DefaultAzureCredential());
}
```

```json
{
  "KeyVaultName": "Key Vault Name"
}
```

 - Set the ```AZURE_CLIENT_ID``` environment variable.

 - Set the DefaultAzureCredentialOptions.ManagedIdentityClientId property when calling ```AddAzureKeyVault```:

```csharp
builder.Configuration.AddAzureKeyVault(
    new Uri($"https://{builder.Configuration["KeyVaultName"]}.vault.azure.net/"),
    new DefaultAzureCredential(new DefaultAzureCredentialOptions
    {
        ManagedIdentityClientId = builder.Configuration["AzureADManagedIdentityClientId"]
    }));
```

## Configuration options

```csharp
// using Azure.Extensions.AspNetCore.Configuration.Secrets;

builder.Configuration.AddAzureKeyVault(
    new Uri($"https://{builder.Configuration["KeyVaultName"]}.vault.azure.net/"),
    new DefaultAzureCredential(),
    new AzureKeyVaultConfigurationOptions
    {
        // ...
    });
```

<table><thead>
<tr>
<th>Property</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="/en-us/dotnet/api/azure.extensions.aspnetcore.configuration.secrets.azurekeyvaultconfigurationoptions.manager" class="no-loc" data-linktype="absolute-path">Manager</a></td>
<td><a href="/en-us/dotnet/api/azure.extensions.aspnetcore.configuration.secrets.keyvaultsecretmanager" class="no-loc" data-linktype="absolute-path">KeyVaultSecretManager</a> instance used to control secret loading.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/azure.extensions.aspnetcore.configuration.secrets.azurekeyvaultconfigurationoptions.reloadinterval" class="no-loc" data-linktype="absolute-path">ReloadInterval</a></td>
<td><code>TimeSpan</code> to wait between attempts at polling the vault for changes. The default value is <code>null</code> (configuration isn't reloaded).</td>
</tr>
</tbody></table>

## Use a key name prefix

> Warning
Don't use prefixes on Key Vault secrets to:

Place secrets for multiple apps into the same vault.
Place environmental secrets (for example, development versus production secrets) into the same vault.

Different apps and development/production environments should use separate Key Vaults to isolate app environments for the highest level of security.

  - Place secrets for multiple apps into the same vault.

  - Place environmental secrets (for example, development versus production secrets) into the same vault.

```csharp
// using Azure.Extensions.AspNetCore.Configuration.Secrets;

builder.Configuration.AddAzureKeyVault(
    new Uri($"https://{builder.Configuration["KeyVaultName"]}.vault.azure.net/"),
    new DefaultAzureCredential(),
    new SamplePrefixKeyVaultSecretManager("5000"));
```

 - ```Load``` loads a secret when its name starts with the prefix. Other secrets aren't loaded.

 - ```GetKey```:

   - Removes the prefix from the secret name.

   - Replaces two dashes in any name with the ```KeyDelimiter```, which is the delimiter used in configuration (usually a colon). Azure Key Vault doesn't allow a colon in secret names.

```csharp
public class SamplePrefixKeyVaultSecretManager : KeyVaultSecretManager
{
    private readonly string _prefix;

    public SamplePrefixKeyVaultSecretManager(string prefix)
        => _prefix = $"{prefix}-";

    public override bool Load(SecretProperties properties)
        => properties.Name.StartsWith(_prefix);

    public override string GetKey(KeyVaultSecret secret)
        => secret.Name[_prefix.Length..].Replace("--", ConfigurationPath.KeyDelimiter);
}
```

 - The app's version specified in the app's project file. In the following example, the app's version is set to ```5.0.0.0```:

```xml
<PropertyGroup>
  <Version>5.0.0.0</Version>
</PropertyGroup>
```

 - Confirm that a <UserSecretsId> property is present in the app's project file, where {GUID} is a user-supplied GUID:

```xml
<PropertyGroup>
  <UserSecretsId>{GUID}</UserSecretsId>
</PropertyGroup>
```
Save the following secrets locally with Secret Manager:
```dotnetcli
dotnet user-secrets set "5000-AppSecret" "5.0.0.0_secret_value_dev"
dotnet user-secrets set "5100-AppSecret" "5.1.0.0_secret_value_dev"
```

 - Secrets are saved in Azure Key Vault using the following Azure CLI commands:

```azurecli
az keyvault secret set --vault-name {KEY VAULT NAME} --name "5000-AppSecret" --value "5.0.0.0_secret_value_prod"
az keyvault secret set --vault-name {KEY VAULT NAME} --name "5100-AppSecret" --value "5.1.0.0_secret_value_prod"
```

 - When the app is run, the Key Vault secrets are loaded. The string secret for ```5000-AppSecret``` is matched to the app's version specified in the app's project file (5.0.0.0).

 - The version, ```5000``` (with the dash), is stripped from the key name. Throughout the app, reading configuration with the key ```AppSecret``` loads the secret value.

 - If the app's version is changed in the project file to ```5.1.0.0``` and the app is run again, the secret value returned is ```5.1.0.0_secret_value_dev``` in the Development environment and ```5.1.0.0_secret_value_prod``` in Production.

> Note
You can also provide your own SecretClient implementation to ```AddAzureKeyVault```. A custom client permits sharing a single instance of the client across the app.

## Bind an array to a class

```json
"Serilog": {
  "WriteTo": [
    {
      "Name": "AzureTableStorage",
      "Args": {
        "storageTableName": "logs",
        "connectionString": "DefaultEnd...ountKey=Eby8...GMGw=="
      }
    },
    {
      "Name": "AzureDocumentDB",
      "Args": {
        "endpointUrl": "https://contoso.documents.azure.com:443",
        "authorizationKey": "Eby8...GMGw=="
      }
    }
  ]
}
```

<table><thead>
<tr>
<th>Key</th>
<th>Value</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>Serilog--WriteTo--0--Name</code></td>
<td><code>AzureTableStorage</code></td>
</tr>
<tr>
<td><code>Serilog--WriteTo--0--Args--storageTableName</code></td>
<td><code>logs</code></td>
</tr>
<tr>
<td><code>Serilog--WriteTo--0--Args--connectionString</code></td>
<td><code>DefaultEnd...ountKey=Eby8...GMGw==</code></td>
</tr>
<tr>
<td><code>Serilog--WriteTo--1--Name</code></td>
<td><code>AzureDocumentDB</code></td>
</tr>
<tr>
<td><code>Serilog--WriteTo--1--Args--endpointUrl</code></td>
<td><code>https://contoso.documents.azure.com:443</code></td>
</tr>
<tr>
<td><code>Serilog--WriteTo--1--Args--authorizationKey</code></td>
<td><code>Eby8...GMGw==</code></td>
</tr>
</tbody></table>

## Reload secrets

```csharp
config.Reload();
```

## Disabled and expired secrets

```csharp
class SampleKeyVaultSecretManager : KeyVaultSecretManager
{
  public override bool Load(SecretProperties properties) =>
    properties.ExpiresOn.HasValue &&
    properties.ExpiresOn.Value > DateTimeOffset.Now;
}
```

```csharp
// using Azure.Extensions.AspNetCore.Configuration.Secrets;

builder.Configuration.AddAzureKeyVault(
    new Uri($"https://{builder.Configuration["KeyVaultName"]}.vault.azure.net/"),
    new DefaultAzureCredential(),
    new SampleKeyVaultSecretManager());
```

## Troubleshoot

 - The app or certificate isn't configured correctly in Microsoft Entra ID.

 - The vault doesn't exist in Azure Key Vault.

 - The app isn't authorized to access the vault.

 - The access policy doesn't include ```Get``` and ```List``` permissions.

 - In the vault, the configuration data (name-value pair) is incorrectly named, missing, or disabled.

 - The app has the wrong Key Vault name (KeyVaultName), Microsoft Entra ID Application ID (AzureADApplicationId), or Microsoft Entra ID certificate thumbprint (AzureADCertThumbprint), or Microsoft Entra ID Directory ID (AzureADDirectoryId).

 - When adding the Key Vault access policy for the app, the policy was created, but the Save button wasn't selected in the Access policies UI.

## Additional resources

 - View or download sample code (how to download)

 - Configuration in ASP.NET Core

 - Microsoft Azure: Key Vault Documentation

 - How to generate and transfer HSM-protected keys for Azure Key Vault

 - Quickstart: Set and retrieve a secret from Azure Key Vault by using a .NET web app

 - Tutorial: How to use Azure Key Vault with Azure Windows Virtual Machine in .NET

Ref: [Azure Key Vault configuration provider in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/key-vault-configuration?view=aspnetcore-8.0)