---
title: APIs - Controller-based APIs - Test with HttpRepl - Telemetry
published: true
date: 2024-09-09 08:41:25
tags: Summary, AspNetCore
description: The HttpRepl includes a telemetry feature that collects usage data. It's important that the HttpRepl team understands how the tool is used so it can be improved.
image:
---
- Article

  - 04/11/2023

  - 4 contributors

## In this article

The HttpRepl includes a telemetry feature that collects usage data. It's important that the HttpRepl team understands how the tool is used so it can be improved.

## How to opt out

The HttpRepl telemetry feature is enabled by default. To opt out of the telemetry feature, ```set``` the ```DOTNET_HTTPREPL_TELEMETRY_OPTOUT``` environment variable to ```1``` or ```true```.

## Disclosure

The HttpRepl displays text similar to the following when you first ```run``` the tool. Text may vary slightly depending on the version of the tool you're running. This "first ```run```" experience is how Microsoft notifies you about data collection.

```console
Telemetry
---------
The .NET tools collect usage data in order to help us improve your experience. It is collected by Microsoft and shared with the community. You can opt-out of telemetry by setting the DOTNET_HTTPREPL_TELEMETRY_OPTOUT environment variable to '1' or 'true' using your favorite shell.
```

To suppress the "first ```run```" experience text, ```set``` the ```DOTNET_HTTPREPL_SKIP_FIRST_TIME_EXPERIENCE``` environment variable to ```1``` or ```true```.

## Data points

The telemetry feature doesn't:

- Collect personal data, such as usernames, email addresses, or URLs.

- Scan your HTTP requests or responses.

The data is sent securely to Microsoft servers and held under restricted access.

If you have any concerns about the security of your personal data, please contact us.

- File an issue in the dotnet/httprepl repository.

- Send an email to dotnet@microsoft.com for investigation.

The telemetry feature collects the following data.

<table><thead>
<tr>
<th>.NET SDK versions</th>
<th>Data</th>
</tr>
</thead>
<tbody>
<tr>
<td>&gt;=5.0</td>
<td>Timestamp of invocation.</td>
</tr>
<tr>
<td>&gt;=5.0</td>
<td>Three-octet IP address used to determine the geographical location.</td>
</tr>
<tr>
<td>&gt;=5.0</td>
<td>Operating system and version.</td>
</tr>
<tr>
<td>&gt;=5.0</td>
<td>Runtime ID (RID) the tool is running on.</td>
</tr>
<tr>
<td>&gt;=5.0</td>
<td>Whether the tool is running in a container.</td>
</tr>
<tr>
<td>&gt;=5.0</td>
<td>Hashed Media Access Control (MAC) address: a cryptographically (SHA256) hashed and unique ID for a machine.</td>
</tr>
<tr>
<td>&gt;=5.0</td>
<td>Kernel version.</td>
</tr>
<tr>
<td>&gt;=5.0</td>
<td>HttpRepl version.</td>
</tr>
<tr>
<td>&gt;=5.0</td>
<td>Whether the tool was started with <code>help</code>, <code>run</code>, or <code>connect</code> arguments. Actual argument values aren't collected.</td>
</tr>
<tr>
<td>&gt;=5.0</td>
<td>Command invoked (for example, <code>get</code>) and whether it succeeded.</td>
</tr>
<tr>
<td>&gt;=5.0</td>
<td>For the <code>connect</code> command, whether the <code>root</code>, <code>base</code>, or <code>openapi</code> arguments were supplied. Actual argument values aren't collected.</td>
</tr>
<tr>
<td>&gt;=5.0</td>
<td>For the <code>pref</code> command, whether a <code>get</code> or <code>set</code> was issued and which preference was accessed. If not a well-known preference, the name is hashed. The value isn't collected.</td>
</tr>
<tr>
<td>&gt;=5.0</td>
<td>For the <code>set header</code> command, the header name being ```set```. If not a well-known header, the name is hashed. The value isn't collected.</td>
</tr>
<tr>
<td>&gt;=5.0</td>
<td>For the <code>connect</code> command, whether a special case for <code>dotnet new webapi</code> was used and, whether it was bypassed via preference.</td>
</tr>
<tr>
<td>&gt;=5.0</td>
<td>For all HTTP commands (for example, GET, POST, PUT), whether each of the options was specified. The values of the options aren't collected.</td>
</tr>
</tbody></table>

## Additional resources

- .NET Core SDK telemetry

- .NET CLI telemetry data

Ref: [HttpRepl telemetry](https://learn.microsoft.com/en-us/aspnet/core/web-api/http-repl/telemetry?view=aspnetcore-8.0)