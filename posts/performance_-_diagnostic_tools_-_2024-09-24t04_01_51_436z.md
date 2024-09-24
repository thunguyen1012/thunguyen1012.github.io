---
title: Performance - Diagnostic tools
published: true
date: 2024-09-24 04:01:51
tags: Summary, AspNetCore
description:
image:
---

## In this article

This article lists tools for diagnosing performance issues in ASP.NET Core.

## Visual Studio Diagnostic Tools

If your ASP.NET Core app is experiencing performance problems, it may be time to investigate the cause.

More information is available in Visual Studio documentation.

## Application Insights

With Application Insights, you can monitor and improve the performance of your app.

Azure Application Insights provides multiple ways to give insights on monitored apps:

- Application Map – helps spot performance bottlenecks or failure hot-spots across all components of distributed apps.

- Azure Metrics Explorer is a component of the Microsoft Azure portal that allows plotting charts, visually correlating trends, and investigating spikes and dips in metrics' values.

- Performance blade in Application Insights portal:

  - Shows performance details for different operations in the monitored app.

  - Allows drilling into a single operation to check all parts/dependencies that contribute to a long duration.

  - Profiler can be invoked from here to collect performance traces on-demand.

- Azure Application Insights Profiler allows regular and on-demand profiling of .NET apps.  Azure portal shows captured performance traces with call stacks and hot paths. The trace files can also be downloaded for deeper analysis using PerfView.

Application Insights can be used in a variety of environments:

- Optimized to work in Azure.

- Works in production, development, and staging.

- Works locally from Visual Studio or in other hosting environments.

For more information on code-based monitoring, see Application Insights for ASP.NET Core. For more information on codeless monitoring, see Monitor Azure App Service performance.

## PerfView

PerfView is a performance analysis tool created by the .NET team specifically for diagnosing .NET performance issues.

For more about PerfView, see the user's guide available in the tool or on GitHub.

## Windows Performance Toolkit

The PerfView team has released a new version of its Windows performance tool.

## PerfCollect

While PerfView is a useful performance analysis tool for .NET scenarios, it only runs on Windows, so you can't use it to collect traces from ASP.NET Core apps running in Linux environments.

PerfView is a tool that can be used to monitor the performance of .NET Core apps on Windows computers.

More information about how to install and get started with PerfCollect is available on GitHub.

## Other Third-party Performance Tools

The following lists some third-party performance tools that are useful in performance investigation of .NET Core applications.

- MiniProfiler

- dotTrace and dotMemory from JetBrains

- VTune from Intel

Ref: [Performance Diagnostic Tools](https://learn.microsoft.com/en-us/aspnet/core/performance/diagnostic-tools?view=aspnetcore-8.0)