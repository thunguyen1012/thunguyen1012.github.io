---
title: Entity Framework - Entity Framework Core - Database providers - Microsoft SQL Server and Azure SQL - Function mappings
published: true
date: 2024-08-26 04:20:22
tags: Summary, EFCore
description: This page shows which .NET members are translated into which SQL functions when using the SQL Server provider.
image:
---

## In this article

This page shows which .NET members are translated into which SQL functions when using the SQL Server provider.

## Aggregate functions

<table><thead>
<tr>
<th>.NET</th>
<th>SQL</th>
<th>Added in</th>
</tr>
</thead>
<tbody>
<tr>
<td>EF.Functions.StandardDeviationSample(group.Select(x =&gt; x.Property))</td>
<td>STDEV(Property)</td>
<td>EF Core 7.0</td>
</tr>
<tr>
<td>EF.Functions.StandardDeviationPopulation(group.Select(x =&gt; x.Property))</td>
<td>STDEVP(Property)</td>
<td>EF Core 7.0</td>
</tr>
<tr>
<td>EF.Functions.VarianceSample(group.Select(x =&gt; x.Property))</td>
<td>VAR(Property)</td>
<td>EF Core 7.0</td>
</tr>
<tr>
<td>EF.Functions.VariancePopulation(group.Select(x =&gt; x.Property))</td>
<td>VARP(Property)</td>
<td>EF Core 7.0</td>
</tr>
<tr>
<td>group.Average(x =&gt; x.Property)</td>
<td>AVG(Property)</td>
<td></td>
</tr>
<tr>
<td>group.Count()</td>
<td>COUNT(*)</td>
<td></td>
</tr>
<tr>
<td>group.LongCount()</td>
<td>COUNT_BIG(*)</td>
<td></td>
</tr>
<tr>
<td>group.Max(x =&gt; x.Property)</td>
<td>MAX(Property)</td>
<td></td>
</tr>
<tr>
<td>group.Min(x =&gt; x.Property)</td>
<td>MIN(Property)</td>
<td></td>
</tr>
<tr>
<td>group.Sum(x =&gt; x.Property)</td>
<td>SUM(Property)</td>
<td></td>
</tr>
<tr>
<td>string.Concat(group.Select(x =&gt; x.Property))</td>
<td>STRING_AGG(Property, N'')</td>
<td>EF Core 7.0</td>
</tr>
<tr>
<td>string.Join(separator, group.Select(x =&gt; x.Property))</td>
<td>STRING_AGG(Property, <span class="no-loc" dir="ltr" lang="en-us">@separator)</span></td>
<td>EF Core 7.0</td>
</tr>
</tbody></table>

## Binary functions

<table><thead>
<tr>
<th>.NET</th>
<th>SQL</th>
<th>Added in</th>
</tr>
</thead>
<tbody>
<tr>
<td>bytes.Contains(value)</td>
<td>CHARINDEX(@value, <span class="no-loc" dir="ltr" lang="en-us">@bytes)</span> &gt; 0</td>
<td></td>
</tr>
<tr>
<td>bytes.ElementAt(i)</td>
<td>SUBSTRING(@bytes, <span class="no-loc" dir="ltr" lang="en-us">@i</span> + 1, 1)</td>
<td>EF Core 8.0</td>
</tr>
<tr>
<td>bytes.First()</td>
<td>SUBSTRING(@bytes, 1, 1)</td>
<td></td>
</tr>
<tr>
<td>bytes.Length</td>
<td>DATALENGTH(@bytes)</td>
<td></td>
</tr>
<tr>
<td>bytes.SequenceEqual(second)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@bytes</span> = <span class="no-loc" dir="ltr" lang="en-us">@second</span></td>
<td></td>
</tr>
<tr>
<td>bytes[i]</td>
<td>SUBSTRING(@bytes, <span class="no-loc" dir="ltr" lang="en-us">@i</span> + 1, 1)</td>
<td></td>
</tr>
<tr>
<td>EF.Functions.DataLength(arg)</td>
<td>DATALENGTH(@arg)</td>
<td></td>
</tr>
</tbody></table>

## Conversion functions

<table><thead>
<tr>
<th>.NET</th>
<th>SQL</th>
<th>Added in</th>
</tr>
</thead>
<tbody>
<tr>
<td>bytes.ToString()</td>
<td>CONVERT(varchar(100), <span class="no-loc" dir="ltr" lang="en-us">@bytes)</span></td>
<td></td>
</tr>
<tr>
<td>byteValue.ToString()</td>
<td>CONVERT(varchar(3), <span class="no-loc" dir="ltr" lang="en-us">@byteValue)</span></td>
<td></td>
</tr>
<tr>
<td>charValue.ToString()</td>
<td>CONVERT(varchar(1), <span class="no-loc" dir="ltr" lang="en-us">@charValue)</span></td>
<td></td>
</tr>
<tr>
<td>Convert.ToBoolean(value)</td>
<td>CONVERT(bit, <span class="no-loc" dir="ltr" lang="en-us">@value)</span></td>
<td></td>
</tr>
<tr>
<td>Convert.ToByte(value)</td>
<td>CONVERT(tinyint, <span class="no-loc" dir="ltr" lang="en-us">@value)</span></td>
<td></td>
</tr>
<tr>
<td>Convert.ToDecimal(value)</td>
<td>CONVERT(decimal(18, 2), <span class="no-loc" dir="ltr" lang="en-us">@value)</span></td>
<td></td>
</tr>
<tr>
<td>Convert.ToDouble(value)</td>
<td>CONVERT(float, <span class="no-loc" dir="ltr" lang="en-us">@value)</span></td>
<td></td>
</tr>
<tr>
<td>Convert.ToInt16(value)</td>
<td>CONVERT(smallint, <span class="no-loc" dir="ltr" lang="en-us">@value)</span></td>
<td></td>
</tr>
<tr>
<td>Convert.ToInt32(value)</td>
<td>CONVERT(int, <span class="no-loc" dir="ltr" lang="en-us">@value)</span></td>
<td></td>
</tr>
<tr>
<td>Convert.ToInt64(value)</td>
<td>CONVERT(bigint, <span class="no-loc" dir="ltr" lang="en-us">@value)</span></td>
<td></td>
</tr>
<tr>
<td>Convert.ToString(value)</td>
<td>CONVERT(nvarchar(max), <span class="no-loc" dir="ltr" lang="en-us">@value)</span></td>
<td></td>
</tr>
<tr>
<td>dateOnly.ToString()</td>
<td>CONVERT(varchar(100), <span class="no-loc" dir="ltr" lang="en-us">@dateOnly)</span></td>
<td>EF Core 8.0</td>
</tr>
<tr>
<td>dateTime.ToString()</td>
<td>CONVERT(varchar(100), <span class="no-loc" dir="ltr" lang="en-us">@dateTime)</span></td>
<td></td>
</tr>
<tr>
<td>dateTimeOffset.ToString()</td>
<td>CONVERT(varchar(100), <span class="no-loc" dir="ltr" lang="en-us">@dateTimeOffset)</span></td>
<td></td>
</tr>
<tr>
<td>decimalValue.ToString()</td>
<td>CONVERT(varchar(100), <span class="no-loc" dir="ltr" lang="en-us">@decimalValue)</span></td>
<td></td>
</tr>
<tr>
<td>doubleValue.ToString()</td>
<td>CONVERT(varchar(100), <span class="no-loc" dir="ltr" lang="en-us">@doubleValue)</span></td>
<td></td>
</tr>
<tr>
<td>floatValue.ToString()</td>
<td>CONVERT(varchar(100), <span class="no-loc" dir="ltr" lang="en-us">@floatValue)</span></td>
<td></td>
</tr>
<tr>
<td>guid.ToString()</td>
<td>CONVERT(varchar(36), <span class="no-loc" dir="ltr" lang="en-us">@guid)</span></td>
<td></td>
</tr>
<tr>
<td>intValue.ToString()</td>
<td>CONVERT(varchar(11), <span class="no-loc" dir="ltr" lang="en-us">@intValue)</span></td>
<td></td>
</tr>
<tr>
<td>longValue.ToString()</td>
<td>CONVERT(varchar(20), <span class="no-loc" dir="ltr" lang="en-us">@longValue)</span></td>
<td></td>
</tr>
<tr>
<td>sbyteValue.ToString()</td>
<td>CONVERT(varchar(4), <span class="no-loc" dir="ltr" lang="en-us">@sbyteValue)</span></td>
<td></td>
</tr>
<tr>
<td>shortValue.ToString()</td>
<td>CONVERT(varchar(6), <span class="no-loc" dir="ltr" lang="en-us">@shortValue)</span></td>
<td></td>
</tr>
<tr>
<td>timeOnly.ToString()</td>
<td>CONVERT(varchar(100), <span class="no-loc" dir="ltr" lang="en-us">@timeOnly)</span></td>
<td>EF Core 8.0</td>
</tr>
<tr>
<td>timeSpan.ToString()</td>
<td>CONVERT(varchar(100), <span class="no-loc" dir="ltr" lang="en-us">@timeSpan)</span></td>
<td></td>
</tr>
<tr>
<td>uintValue.ToString()</td>
<td>CONVERT(varchar(10), <span class="no-loc" dir="ltr" lang="en-us">@uintValue)</span></td>
<td></td>
</tr>
<tr>
<td>ulongValue.ToString()</td>
<td>CONVERT(varchar(19), <span class="no-loc" dir="ltr" lang="en-us">@ulongValue)</span></td>
<td></td>
</tr>
<tr>
<td>ushortValue.ToString()</td>
<td>CONVERT(varchar(5), <span class="no-loc" dir="ltr" lang="en-us">@ushortValue)</span></td>
<td></td>
</tr>
</tbody></table>

## Date and time functions

<table><thead>
<tr>
<th>.NET</th>
<th>SQL</th>
<th>Added in</th>
</tr>
</thead>
<tbody>
<tr>
<td>DateTime.Now</td>
<td>GETDATE()</td>
<td></td>
</tr>
<tr>
<td>DateTime.Today</td>
<td>CONVERT(date, GETDATE())</td>
<td></td>
</tr>
<tr>
<td>DateTime.UtcNow</td>
<td>GETUTCDATE()</td>
<td></td>
</tr>
<tr>
<td>dateTime.AddDays(value)</td>
<td>DATEADD(day, <span class="no-loc" dir="ltr" lang="en-us">@value</span>, <span class="no-loc" dir="ltr" lang="en-us">@dateTime)</span></td>
<td></td>
</tr>
<tr>
<td>dateTime.AddHours(value)</td>
<td>DATEADD(hour, <span class="no-loc" dir="ltr" lang="en-us">@value</span>, <span class="no-loc" dir="ltr" lang="en-us">@dateTime)</span></td>
<td></td>
</tr>
<tr>
<td>dateTime.AddMilliseconds(value)</td>
<td>DATEADD(millisecond, <span class="no-loc" dir="ltr" lang="en-us">@value</span>, <span class="no-loc" dir="ltr" lang="en-us">@dateTime)</span></td>
<td></td>
</tr>
<tr>
<td>dateTime.AddMinutes(value)</td>
<td>DATEADD(minute, <span class="no-loc" dir="ltr" lang="en-us">@value</span>, <span class="no-loc" dir="ltr" lang="en-us">@dateTime)</span></td>
<td></td>
</tr>
<tr>
<td>dateTime.AddMonths(months)</td>
<td>DATEADD(month, <span class="no-loc" dir="ltr" lang="en-us">@months</span>, <span class="no-loc" dir="ltr" lang="en-us">@dateTime)</span></td>
<td></td>
</tr>
<tr>
<td>dateTime.AddSeconds(value)</td>
<td>DATEADD(second, <span class="no-loc" dir="ltr" lang="en-us">@value</span>, <span class="no-loc" dir="ltr" lang="en-us">@dateTime)</span></td>
<td></td>
</tr>
<tr>
<td>dateTime.AddYears(value)</td>
<td>DATEADD(year, <span class="no-loc" dir="ltr" lang="en-us">@value</span>, <span class="no-loc" dir="ltr" lang="en-us">@dateTime)</span></td>
<td></td>
</tr>
<tr>
<td>dateTime.Date</td>
<td>CONVERT(date, <span class="no-loc" dir="ltr" lang="en-us">@dateTime)</span></td>
<td></td>
</tr>
<tr>
<td>dateTime.Day</td>
<td>DATEPART(day, <span class="no-loc" dir="ltr" lang="en-us">@dateTime)</span></td>
<td></td>
</tr>
<tr>
<td>dateTime.DayOfYear</td>
<td>DATEPART(dayofyear, <span class="no-loc" dir="ltr" lang="en-us">@dateTime)</span></td>
<td></td>
</tr>
<tr>
<td>dateTime.Hour</td>
<td>DATEPART(hour, <span class="no-loc" dir="ltr" lang="en-us">@dateTime)</span></td>
<td></td>
</tr>
<tr>
<td>dateTime.Millisecond</td>
<td>DATEPART(millisecond, <span class="no-loc" dir="ltr" lang="en-us">@dateTime)</span></td>
<td></td>
</tr>
<tr>
<td>dateTime.Minute</td>
<td>DATEPART(minute, <span class="no-loc" dir="ltr" lang="en-us">@dateTime)</span></td>
<td></td>
</tr>
<tr>
<td>dateTime.Month</td>
<td>DATEPART(month, <span class="no-loc" dir="ltr" lang="en-us">@dateTime)</span></td>
<td></td>
</tr>
<tr>
<td>dateTime.Second</td>
<td>DATEPART(second, <span class="no-loc" dir="ltr" lang="en-us">@dateTime)</span></td>
<td></td>
</tr>
<tr>
<td>dateTime.TimeOfDay</td>
<td>CONVERT(time, <span class="no-loc" dir="ltr" lang="en-us">@dateTime)</span></td>
<td></td>
</tr>
<tr>
<td>dateTime.Year</td>
<td>DATEPART(year, <span class="no-loc" dir="ltr" lang="en-us">@dateTime)</span></td>
<td></td>
</tr>
<tr>
<td>DateTimeOffset.Now</td>
<td>SYSDATETIMEOFFSET()</td>
<td></td>
</tr>
<tr>
<td>DateTimeOffset.UtcNow</td>
<td>SYSUTCDATETIME()</td>
<td></td>
</tr>
<tr>
<td>dateTimeOffset.AddDays(days)</td>
<td>DATEADD(day, <span class="no-loc" dir="ltr" lang="en-us">@days</span>, <span class="no-loc" dir="ltr" lang="en-us">@dateTimeOffset)</span></td>
<td></td>
</tr>
<tr>
<td>dateTimeOffset.AddHours(hours)</td>
<td>DATEADD(hour, <span class="no-loc" dir="ltr" lang="en-us">@hours</span>, <span class="no-loc" dir="ltr" lang="en-us">@dateTimeOffset)</span></td>
<td></td>
</tr>
<tr>
<td>dateTimeOffset.AddMilliseconds(milliseconds)</td>
<td>DATEADD(millisecond, <span class="no-loc" dir="ltr" lang="en-us">@milliseconds</span>, <span class="no-loc" dir="ltr" lang="en-us">@dateTimeOffset)</span></td>
<td></td>
</tr>
<tr>
<td>dateTimeOffset.AddMinutes(minutes)</td>
<td>DATEADD(minute, <span class="no-loc" dir="ltr" lang="en-us">@minutes</span>, <span class="no-loc" dir="ltr" lang="en-us">@dateTimeOffset)</span></td>
<td></td>
</tr>
<tr>
<td>dateTimeOffset.AddMonths(months)</td>
<td>DATEADD(month, <span class="no-loc" dir="ltr" lang="en-us">@months</span>, <span class="no-loc" dir="ltr" lang="en-us">@dateTimeOffset)</span></td>
<td></td>
</tr>
<tr>
<td>dateTimeOffset.AddSeconds(seconds)</td>
<td>DATEADD(second, <span class="no-loc" dir="ltr" lang="en-us">@seconds</span>, <span class="no-loc" dir="ltr" lang="en-us">@dateTimeOffset)</span></td>
<td></td>
</tr>
<tr>
<td>dateTimeOffset.AddYears(years)</td>
<td>DATEADD(year, <span class="no-loc" dir="ltr" lang="en-us">@years</span>, <span class="no-loc" dir="ltr" lang="en-us">@dateTimeOffset)</span></td>
<td></td>
</tr>
<tr>
<td>dateTimeOffset.Date</td>
<td>CONVERT(date, <span class="no-loc" dir="ltr" lang="en-us">@dateTimeOffset)</span></td>
<td></td>
</tr>
<tr>
<td>dateTimeOffset.Day</td>
<td>DATEPART(day, <span class="no-loc" dir="ltr" lang="en-us">@dateTimeOffset)</span></td>
<td></td>
</tr>
<tr>
<td>dateTimeOffset.DayOfYear</td>
<td>DATEPART(dayofyear, <span class="no-loc" dir="ltr" lang="en-us">@dateTimeOffset)</span></td>
<td></td>
</tr>
<tr>
<td>dateTimeOffset.Hour</td>
<td>DATEPART(hour, <span class="no-loc" dir="ltr" lang="en-us">@dateTimeOffset)</span></td>
<td></td>
</tr>
<tr>
<td>dateTimeOffset.Millisecond</td>
<td>DATEPART(millisecond, <span class="no-loc" dir="ltr" lang="en-us">@dateTimeOffset)</span></td>
<td></td>
</tr>
<tr>
<td>dateTimeOffset.Minute</td>
<td>DATEPART(minute, <span class="no-loc" dir="ltr" lang="en-us">@dateTimeOffset)</span></td>
<td></td>
</tr>
<tr>
<td>dateTimeOffset.Month</td>
<td>DATEPART(month, <span class="no-loc" dir="ltr" lang="en-us">@dateTimeOffset)</span></td>
<td></td>
</tr>
<tr>
<td>dateTimeOffset.Second</td>
<td>DATEPART(second, <span class="no-loc" dir="ltr" lang="en-us">@dateTimeOffset)</span></td>
<td></td>
</tr>
<tr>
<td>dateTimeOffset.TimeOfDay</td>
<td>CONVERT(time, <span class="no-loc" dir="ltr" lang="en-us">@dateTimeOffset)</span></td>
<td></td>
</tr>
<tr>
<td>dateTimeOffset.ToUnixTimeSeconds()</td>
<td>DATEDIFF_BIG(second, '1970-01-01T00:00:00.0000000+00:00', <span class="no-loc" dir="ltr" lang="en-us">@dateTimeOffset)</span></td>
<td>EF Core 8.0</td>
</tr>
<tr>
<td>dateTimeOffset.ToUnixTimeMilliseconds()</td>
<td>DATEDIFF_BIG(millisecond, '1970-01-01T00:00:00.0000000+00:00', <span class="no-loc" dir="ltr" lang="en-us">@dateTimeOffset)</span></td>
<td>EF Core 8.0</td>
</tr>
<tr>
<td>dateTimeOffset.Year</td>
<td>DATEPART(year, <span class="no-loc" dir="ltr" lang="en-us">@dateTimeOffset)</span></td>
<td></td>
</tr>
<tr>
<td>dateOnly.AddDays(value)</td>
<td>DATEADD(day, <span class="no-loc" dir="ltr" lang="en-us">@value</span>, <span class="no-loc" dir="ltr" lang="en-us">@dateOnly)</span></td>
<td>EF Core 8.0</td>
</tr>
<tr>
<td>dateOnly.AddMonths(months)</td>
<td>DATEADD(month, <span class="no-loc" dir="ltr" lang="en-us">@months</span>, <span class="no-loc" dir="ltr" lang="en-us">@dateOnly)</span></td>
<td>EF Core 8.0</td>
</tr>
<tr>
<td>dateOnly.AddYears(value)</td>
<td>DATEADD(year, <span class="no-loc" dir="ltr" lang="en-us">@value</span>, <span class="no-loc" dir="ltr" lang="en-us">@dateOnly)</span></td>
<td>EF Core 8.0</td>
</tr>
<tr>
<td>dateOnly.Day</td>
<td>DATEPART(day, <span class="no-loc" dir="ltr" lang="en-us">@dateOnly)</span></td>
<td>EF Core 8.0</td>
</tr>
<tr>
<td>dateOnly.DayOfYear</td>
<td>DATEPART(dayofyear, <span class="no-loc" dir="ltr" lang="en-us">@dateOnly)</span></td>
<td>EF Core 8.0</td>
</tr>
<tr>
<td>DateOnly.FromDateTime(dateTime)</td>
<td>CONVERT(date, <span class="no-loc" dir="ltr" lang="en-us">@dateTime)</span></td>
<td>EF Core 8.0</td>
</tr>
<tr>
<td>dateOnly.Month</td>
<td>DATEPART(month, <span class="no-loc" dir="ltr" lang="en-us">@dateOnly)</span></td>
<td>EF Core 8.0</td>
</tr>
<tr>
<td>dateOnly.Year</td>
<td>DATEPART(year, <span class="no-loc" dir="ltr" lang="en-us">@dateOnly)</span></td>
<td>EF Core 8.0</td>
</tr>
<tr>
<td>EF.Functions.AtTimeZone(dateTime, timeZone)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@dateTime</span> AT TIME ZONE <span class="no-loc" dir="ltr" lang="en-us">@timeZone</span></td>
<td>EF Core 7.0</td>
</tr>
<tr>
<td>EF.Functions.DateDiffDay(start, end)</td>
<td>DATEDIFF(day, <span class="no-loc" dir="ltr" lang="en-us">@start</span>, <span class="no-loc" dir="ltr" lang="en-us">@end)</span></td>
<td></td>
</tr>
<tr>
<td>EF.Functions.DateDiffHour(start, end)</td>
<td>DATEDIFF(hour, <span class="no-loc" dir="ltr" lang="en-us">@start</span>, <span class="no-loc" dir="ltr" lang="en-us">@end)</span></td>
<td></td>
</tr>
<tr>
<td>EF.Functions.DateDiffMicrosecond(start, end)</td>
<td>DATEDIFF(microsecond, <span class="no-loc" dir="ltr" lang="en-us">@start</span>, <span class="no-loc" dir="ltr" lang="en-us">@end)</span></td>
<td></td>
</tr>
<tr>
<td>EF.Functions.DateDiffMillisecond(start, end)</td>
<td>DATEDIFF(millisecond, <span class="no-loc" dir="ltr" lang="en-us">@start</span>, <span class="no-loc" dir="ltr" lang="en-us">@end)</span></td>
<td></td>
</tr>
<tr>
<td>EF.Functions.DateDiffMinute(start, end)</td>
<td>DATEDIFF(minute, <span class="no-loc" dir="ltr" lang="en-us">@start</span>, <span class="no-loc" dir="ltr" lang="en-us">@d2)</span></td>
<td></td>
</tr>
<tr>
<td>EF.Functions.DateDiffMonth(start, end)</td>
<td>DATEDIFF(month, <span class="no-loc" dir="ltr" lang="en-us">@start</span>, <span class="no-loc" dir="ltr" lang="en-us">@end)</span></td>
<td></td>
</tr>
<tr>
<td>EF.Functions.DateDiffNanosecond(start, end)</td>
<td>DATEDIFF(nanosecond, <span class="no-loc" dir="ltr" lang="en-us">@start</span>, <span class="no-loc" dir="ltr" lang="en-us">@end)</span></td>
<td></td>
</tr>
<tr>
<td>EF.Functions.DateDiffSecond(start, end)</td>
<td>DATEDIFF(second, <span class="no-loc" dir="ltr" lang="en-us">@start</span>, <span class="no-loc" dir="ltr" lang="en-us">@end)</span></td>
<td></td>
</tr>
<tr>
<td>EF.Functions.DateDiffWeek(start, end)</td>
<td>DATEDIFF(week, <span class="no-loc" dir="ltr" lang="en-us">@start</span>, <span class="no-loc" dir="ltr" lang="en-us">@end)</span></td>
<td></td>
</tr>
<tr>
<td>EF.Functions.DateDiffYear(start, end)</td>
<td>DATEDIFF(year, <span class="no-loc" dir="ltr" lang="en-us">@start</span>, <span class="no-loc" dir="ltr" lang="en-us">@end)</span></td>
<td></td>
</tr>
<tr>
<td>EF.Functions.DateFromParts(year, month, day)</td>
<td>DATEFROMPARTS(@year, <span class="no-loc" dir="ltr" lang="en-us">@month</span>, <span class="no-loc" dir="ltr" lang="en-us">@day)</span></td>
<td></td>
</tr>
<tr>
<td>EF.Functions.DateTime2FromParts(year, month, day, ...)</td>
<td>DATETIME2FROMPARTS(@year, <span class="no-loc" dir="ltr" lang="en-us">@month</span>, <span class="no-loc" dir="ltr" lang="en-us">@day</span>, ...)</td>
<td></td>
</tr>
<tr>
<td>EF.Functions.DateTimeFromParts(year, month, day, ...)</td>
<td>DATETIMEFROMPARTS(@year, <span class="no-loc" dir="ltr" lang="en-us">@month</span>, <span class="no-loc" dir="ltr" lang="en-us">@day</span>, ...)</td>
<td></td>
</tr>
<tr>
<td>EF.Functions.DateTimeOffsetFromParts(year, month, day, ...)</td>
<td>DATETIMEOFFSETFROMPARTS(@year, <span class="no-loc" dir="ltr" lang="en-us">@month</span>, <span class="no-loc" dir="ltr" lang="en-us">@day</span>, ...)</td>
<td></td>
</tr>
<tr>
<td>EF.Functions.IsDate(expression)</td>
<td>ISDATE(@expression)</td>
<td></td>
</tr>
<tr>
<td>EF.Functions.SmallDateTimeFromParts(year, month, day, ...)</td>
<td>SMALLDATETIMEFROMPARTS(@year, <span class="no-loc" dir="ltr" lang="en-us">@month</span>, <span class="no-loc" dir="ltr" lang="en-us">@day</span>, ...)</td>
<td></td>
</tr>
<tr>
<td>EF.Functions.TimeFromParts(hour, minute, second, ...)</td>
<td>TIMEFROMPARTS(@hour, <span class="no-loc" dir="ltr" lang="en-us">@minute</span>, <span class="no-loc" dir="ltr" lang="en-us">@second</span>, ...)</td>
<td></td>
</tr>
<tr>
<td>timeOnly.AddHours(value)</td>
<td>DATEADD(hour, <span class="no-loc" dir="ltr" lang="en-us">@value</span>, <span class="no-loc" dir="ltr" lang="en-us">@timeOnly)</span></td>
<td>EF Core 8.0</td>
</tr>
<tr>
<td>timeOnly.AddMinutes(value)</td>
<td>DATEADD(minute, <span class="no-loc" dir="ltr" lang="en-us">@value</span>, <span class="no-loc" dir="ltr" lang="en-us">@timeOnly)</span></td>
<td>EF Core 8.0</td>
</tr>
<tr>
<td>timeOnly.Hours</td>
<td>DATEPART(hour, <span class="no-loc" dir="ltr" lang="en-us">@timeOnly)</span></td>
<td>EF Core 8.0</td>
</tr>
<tr>
<td>timeOnly.IsBetween(start, end)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@timeOnly</span> &gt;= <span class="no-loc" dir="ltr" lang="en-us">@start</span> AND <span class="no-loc" dir="ltr" lang="en-us">@timeOnly</span> &lt; <span class="no-loc" dir="ltr" lang="en-us">@end</span></td>
<td>EF Core 8.0</td>
</tr>
<tr>
<td>timeOnly.Milliseconds</td>
<td>DATEPART(millisecond, <span class="no-loc" dir="ltr" lang="en-us">@timeOnly)</span></td>
<td>EF Core 8.0</td>
</tr>
<tr>
<td>timeOnly.Minutes</td>
<td>DATEPART(minute, <span class="no-loc" dir="ltr" lang="en-us">@timeOnly)</span></td>
<td>EF Core 8.0</td>
</tr>
<tr>
<td>timeOnly.Seconds</td>
<td>DATEPART(second, <span class="no-loc" dir="ltr" lang="en-us">@timeOnly)</span></td>
<td>EF Core 8.0</td>
</tr>
<tr>
<td>timeSpan.Hours</td>
<td>DATEPART(hour, <span class="no-loc" dir="ltr" lang="en-us">@timeSpan)</span></td>
<td></td>
</tr>
<tr>
<td>timeSpan.Milliseconds</td>
<td>DATEPART(millisecond, <span class="no-loc" dir="ltr" lang="en-us">@timeSpan)</span></td>
<td></td>
</tr>
<tr>
<td>timeSpan.Minutes</td>
<td>DATEPART(minute, <span class="no-loc" dir="ltr" lang="en-us">@timeSpan)</span></td>
<td></td>
</tr>
<tr>
<td>timeSpan.Seconds</td>
<td>DATEPART(second, <span class="no-loc" dir="ltr" lang="en-us">@timeSpan)</span></td>
<td></td>
</tr>
</tbody></table>

## Numeric functions

<table><thead>
<tr>
<th>.NET</th>
<th>SQL</th>
<th>Added in</th>
</tr>
</thead>
<tbody>
<tr>
<td>double.DegreesToRadians(x)</td>
<td>RADIANS(@x)</td>
<td>EF Core 8.0</td>
</tr>
<tr>
<td>double.RadiansToDegrees(x)</td>
<td>DEGREES(@x)</td>
<td>EF Core 8.0</td>
</tr>
<tr>
<td>EF.Functions.Random()</td>
<td>RAND()</td>
<td></td>
</tr>
<tr>
<td>Math.Abs(value)</td>
<td>ABS(@value)</td>
<td></td>
</tr>
<tr>
<td>Math.Acos(d)</td>
<td>ACOS(@d)</td>
<td></td>
</tr>
<tr>
<td>Math.Asin(d)</td>
<td>ASIN(@d)</td>
<td></td>
</tr>
<tr>
<td>Math.Atan(d)</td>
<td>ATAN(@d)</td>
<td></td>
</tr>
<tr>
<td>Math.Atan2(y, x)</td>
<td>ATN2(@y, <span class="no-loc" dir="ltr" lang="en-us">@x)</span></td>
<td></td>
</tr>
<tr>
<td>Math.Ceiling(d)</td>
<td>CEILING(@d)</td>
<td></td>
</tr>
<tr>
<td>Math.Cos(d)</td>
<td>COS(@d)</td>
<td></td>
</tr>
<tr>
<td>Math.Exp(d)</td>
<td>EXP(@d)</td>
<td></td>
</tr>
<tr>
<td>Math.Floor(d)</td>
<td>FLOOR(@d)</td>
<td></td>
</tr>
<tr>
<td>Math.Log(d)</td>
<td>LOG(@d)</td>
<td></td>
</tr>
<tr>
<td>Math.Log(a, newBase)</td>
<td>LOG(@a, <span class="no-loc" dir="ltr" lang="en-us">@newBase)</span></td>
<td></td>
</tr>
<tr>
<td>Math.Log10(d)</td>
<td>LOG10(@d)</td>
<td></td>
</tr>
<tr>
<td>Math.Pow(x, y)</td>
<td>POWER(@x, <span class="no-loc" dir="ltr" lang="en-us">@y)</span></td>
<td></td>
</tr>
<tr>
<td>Math.Round(d)</td>
<td>ROUND(@d, 0)</td>
<td></td>
</tr>
<tr>
<td>Math.Round(d, decimals)</td>
<td>ROUND(@d, <span class="no-loc" dir="ltr" lang="en-us">@decimals)</span></td>
<td></td>
</tr>
<tr>
<td>Math.Sign(value)</td>
<td>SIGN(@value)</td>
<td></td>
</tr>
<tr>
<td>Math.Sin(a)</td>
<td>SIN(@a)</td>
<td></td>
</tr>
<tr>
<td>Math.Sqrt(d)</td>
<td>SQRT(@d)</td>
<td></td>
</tr>
<tr>
<td>Math.Tan(a)</td>
<td>TAN(@a)</td>
<td></td>
</tr>
<tr>
<td>Math.Truncate(d)</td>
<td>ROUND(@d, 0, 1)</td>
<td></td>
</tr>
</tbody></table>

> Tip
In addition to the methods listed here, corresponding generic math implementations
and MathF methods are also translated. For example, ```Math.Sin```, ```MathF.Sin```, ```double.Sin```,
and ```float.Sin``` all map to the ```SIN``` function in SQL.

## String functions

<table><thead>
<tr>
<th>.NET</th>
<th>SQL</th>
<th>Added in</th>
</tr>
</thead>
<tbody>
<tr>
<td>EF.Functions.Collate(operand, collation)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@operand</span> COLLATE <span class="no-loc" dir="ltr" lang="en-us">@collation</span></td>
<td></td>
</tr>
<tr>
<td>EF.Functions.Contains(propertyReference, searchCondition)</td>
<td>CONTAINS(@propertyReference, <span class="no-loc" dir="ltr" lang="en-us">@searchCondition)</span></td>
<td></td>
</tr>
<tr>
<td>EF.Functions.Contains(propertyReference, searchCondition, languageTerm)</td>
<td>CONTAINS(@propertyReference, <span class="no-loc" dir="ltr" lang="en-us">@searchCondition</span>, LANGUAGE <span class="no-loc" dir="ltr" lang="en-us">@languageTerm)</span></td>
<td></td>
</tr>
<tr>
<td>EF.Functions.FreeText(propertyReference, freeText)</td>
<td>FREETEXT(@propertyReference, <span class="no-loc" dir="ltr" lang="en-us">@freeText)</span></td>
<td></td>
</tr>
<tr>
<td>EF.Functions.FreeText(propertyReference, freeText, languageTerm)</td>
<td>FREETEXT(@propertyReference, <span class="no-loc" dir="ltr" lang="en-us">@freeText</span>, LANGUAGE <span class="no-loc" dir="ltr" lang="en-us">@languageTerm)</span></td>
<td></td>
</tr>
<tr>
<td>EF.Functions.IsNumeric(expression)</td>
<td>ISNUMERIC(@expression)</td>
<td></td>
</tr>
<tr>
<td>EF.Functions.Like(matchExpression, pattern)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@matchExpression</span> LIKE <span class="no-loc" dir="ltr" lang="en-us">@pattern</span></td>
<td></td>
</tr>
<tr>
<td>EF.Functions.Like(matchExpression, pattern, escapeCharacter)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@matchExpression</span> LIKE <span class="no-loc" dir="ltr" lang="en-us">@pattern</span> ESCAPE <span class="no-loc" dir="ltr" lang="en-us">@escapeCharacter</span></td>
<td></td>
</tr>
<tr>
<td>string.Compare(strA, strB)</td>
<td>CASE WHEN <span class="no-loc" dir="ltr" lang="en-us">@strA</span> = <span class="no-loc" dir="ltr" lang="en-us">@strB</span> THEN 0 ... END</td>
<td></td>
</tr>
<tr>
<td>string.Concat(str0, str1)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@str0</span> + <span class="no-loc" dir="ltr" lang="en-us">@str1</span></td>
<td></td>
</tr>
<tr>
<td>string.IsNullOrEmpty(value)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@value</span> IS NULL OR <span class="no-loc" dir="ltr" lang="en-us">@value</span> LIKE N''</td>
<td></td>
</tr>
<tr>
<td>string.IsNullOrWhiteSpace(value)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@value</span> IS NULL OR <span class="no-loc" dir="ltr" lang="en-us">@value</span> = N''</td>
<td></td>
</tr>
<tr>
<td>stringValue.CompareTo(strB)</td>
<td>CASE WHEN <span class="no-loc" dir="ltr" lang="en-us">@stringValue</span> = <span class="no-loc" dir="ltr" lang="en-us">@strB</span> THEN 0 ... END</td>
<td></td>
</tr>
<tr>
<td>stringValue.Contains(value)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@stringValue</span> LIKE N'%' + <span class="no-loc" dir="ltr" lang="en-us">@value</span> + N'%'</td>
<td></td>
</tr>
<tr>
<td>stringValue.EndsWith(value)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@stringValue</span> LIKE N'%' + <span class="no-loc" dir="ltr" lang="en-us">@value</span></td>
<td></td>
</tr>
<tr>
<td>stringValue.FirstOrDefault()</td>
<td>SUBSTRING(@stringValue, 1, 1)</td>
<td></td>
</tr>
<tr>
<td>stringValue.IndexOf(value)</td>
<td>CHARINDEX(@value, <span class="no-loc" dir="ltr" lang="en-us">@stringValue)</span> - 1</td>
<td></td>
</tr>
<tr>
<td>stringValue.IndexOf(value, startIndex)</td>
<td>CHARINDEX(@value, <span class="no-loc" dir="ltr" lang="en-us">@stringValue</span>, <span class="no-loc" dir="ltr" lang="en-us">@startIndex)</span> - 1</td>
<td>EF Core 7.0</td>
</tr>
<tr>
<td>stringValue.LastOrDefault()</td>
<td>SUBSTRING(@stringValue, LEN(@stringValue), 1)</td>
<td></td>
</tr>
<tr>
<td>stringValue.Length</td>
<td>LEN(@stringValue)</td>
<td></td>
</tr>
<tr>
<td>stringValue.Replace(@oldValue, <span class="no-loc" dir="ltr" lang="en-us">@newValue)</span></td>
<td>REPLACE(@stringValue, <span class="no-loc" dir="ltr" lang="en-us">@oldValue</span>, <span class="no-loc" dir="ltr" lang="en-us">@newValue)</span></td>
<td></td>
</tr>
<tr>
<td>stringValue.StartsWith(value)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@stringValue</span> LIKE <span class="no-loc" dir="ltr" lang="en-us">@value</span> + N'%'</td>
<td></td>
</tr>
<tr>
<td>stringValue.Substring(startIndex)</td>
<td>SUBSTRING(@stringValue, <span class="no-loc" dir="ltr" lang="en-us">@startIndex</span> + 1, LEN(@stringValue))</td>
<td></td>
</tr>
<tr>
<td>stringValue.Substring(startIndex, length)</td>
<td>SUBSTRING(@stringValue, <span class="no-loc" dir="ltr" lang="en-us">@startIndex</span> + 1, <span class="no-loc" dir="ltr" lang="en-us">@length)</span></td>
<td></td>
</tr>
<tr>
<td>stringValue.ToLower()</td>
<td>LOWER(@stringValue)</td>
<td></td>
</tr>
<tr>
<td>stringValue.ToUpper()</td>
<td>UPPER(@stringValue)</td>
<td></td>
</tr>
<tr>
<td>stringValue.Trim()</td>
<td>LTRIM(RTRIM(@stringValue))</td>
<td></td>
</tr>
<tr>
<td>stringValue.TrimEnd()</td>
<td>RTRIM(@stringValue)</td>
<td></td>
</tr>
<tr>
<td>stringValue.TrimStart()</td>
<td>LTRIM(@stringValue)</td>
<td></td>
</tr>
</tbody></table>

## Miscellaneous functions

<table><thead>
<tr>
<th>.NET</th>
<th>SQL</th>
</tr>
</thead>
<tbody>
<tr>
<td>collection.Contains(item)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@item</span> IN <span class="no-loc" dir="ltr" lang="en-us">@collection</span></td>
</tr>
<tr>
<td>enumValue.HasFlag(flag)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@enumValue</span> &amp; <span class="no-loc" dir="ltr" lang="en-us">@flag</span> = <span class="no-loc" dir="ltr" lang="en-us">@flag</span></td>
</tr>
<tr>
<td>Guid.NewGuid()</td>
<td>NEWID()</td>
</tr>
<tr>
<td>nullable.GetValueOrDefault()</td>
<td>COALESCE(@nullable, 0)</td>
</tr>
<tr>
<td>nullable.GetValueOrDefault(defaultValue)</td>
<td>COALESCE(@nullable, <span class="no-loc" dir="ltr" lang="en-us">@defaultValue)</span></td>
</tr>
</tbody></table>

> Note
Some SQL has been simplified for illustration purposes. The actual SQL is more complex to handle a wider range of values.

## See also

- Spatial Function Mappings

- HierarchyId Function Mappings

Ref: [Function Mappings of the Microsoft SQL Server Provider](https://learn.microsoft.com/en-us/ef/core/providers/sql-server/functions)