---
title: Advanced - High performance logging
published: true
date: 2024-09-25 09:34:20
tags: Summary, AspNetCore
description: The LoggerMessage class exposes functionality to create cacheable delegates that require fewer object allocations and reduced computational overhead compared to logger extension methods, such as LogInformation and LogDebug. For high-performance logging scenarios, use the LoggerMessage pattern.
image:
---

## In this article

The LoggerMessage class exposes functionality to create cacheable delegates that require fewer ```object``` allocations and reduced computational overhead compared to logger extension methods, such as LogInformation and LogDebug. For high-performance logging scenarios, use the LoggerMessage pattern.

LoggerMessage provides the following performance advantages over logger extension methods:

- Logger extension methods require "boxing" (converting) value types, such as ```int```, into ```object```. The LoggerMessage pattern avoids boxing by using static Action fields and extension methods with strongly typed parameters.

- Logger extension methods must parse the message template (named format string) every time a log message is written. LoggerMessage only requires parsing a template once when the message is defined.

> Important
Instead of using the LoggerMessage class to create high-performance logs, you can use the LoggerMessage attribute in .NET 6 and later versions. The ```LoggerMessageAttribute``` provides source-generation logging support designed to deliver a highly usable and highly performant logging solution for modern .NET applications. For more information, see Compile-time logging source generation (.NET Fundamentals).

This sample app demonstrates the use of the LoggerMessage pattern to generate log messages from a queue service.

> Tip
All of the logging example source code is available in the Samples Browser for download. For more information, see Browse code samples: Logging in .NET.

## Define a logger message

Use Define(LogLevel, EventId, String) to create an Action delegate for logging a message. Define overloads permit passing up to six type parameters to a named format string (template).

The string provided to the Define method is a template and not an interpolated string. Placeholders are filled in the order that the types are specified. Placeholder names in the template should be descriptive and consistent across templates. They serve as property names within structured log data. We recommend Pascal casing for placeholder names. For example, {Item}, {DateTime}.

Each log message is an Action held in a static field created by LoggerMessage.Define. For example, the sample app creates a field to describe a log message for the processing of work items:

```csharp
private static readonly Action<ILogger, Exception> s_failedToProcessWorkItem;
```

For the Action, specify:

- The log level.

- A unique event identifier (EventId) with the name of the static extension method.

- The message template (named format string).

As work items are dequeued for processing, the worker service app sets the:

- Log level to ```LogLevel```.Critical.

- Event ID to ```13``` with the name of the ```FailedToProcessWorkItem``` method.

- Message template (named format string) to a string.

```csharp
s_failedToProcessWorkItem = LoggerMessage.Define(
    LogLevel.Critical,
    new EventId(13, nameof(FailedToProcessWorkItem)),
    "Epic failure processing item!");
```

The LoggerMessage.Define method is used to configure and define an Action delegate, which represents a log message.

Structured logging stores may use the event name when it's supplied with the event ID to enrich logging. For example, Serilog uses the event name.

The Action is invoked through a strongly typed extension method. The ```PriorityItemProcessed``` method logs a message every time a work item is processed. ```FailedToProcessWorkItem``` is called if and when an exception occurs:

```csharp
protected override async Task ExecuteAsync(
    CancellationToken stoppingToken)
{
    using (IDisposable? scope = logger.ProcessingWorkScope(DateTime.Now))
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                WorkItem? nextItem = priorityQueue.ProcessNextHighestPriority();

                if (nextItem is not null)
                {
                    logger.PriorityItemProcessed(nextItem);
                }
            }
            catch (Exception ex)
            {
                logger.FailedToProcessWorkItem(ex);
            }

            await Task.Delay(1_000, stoppingToken);
        }
    }
}
```

Inspect the app's console output:

```console
crit: WorkerServiceOptions.Example.Worker[13]
      Epic failure processing item!
      System.Exception: Failed to verify communications.
         at WorkerServiceOptions.Example.Worker.ExecuteAsync(CancellationToken stoppingToken) in
         ..\Worker.cs:line 27
```

To pass parameters to a log message, define up to six types when creating the static field. The sample app logs the work item details when processing items by defining a ```WorkItem``` type for the Action field:

```csharp
private static readonly Action<ILogger, WorkItem, Exception> s_processingPriorityItem;
```

The delegate's log message template receives its placeholder values from the types provided. The sample app defines a delegate for adding a work item where the item parameter is a ```WorkItem```:

```csharp
s_processingPriorityItem = LoggerMessage.Define<WorkItem>(
    LogLevel.Information,
    new EventId(1, nameof(PriorityItemProcessed)),
    "Processing priority item: {Item}");
```

The static extension method for logging that a work item is being processed, ```PriorityItemProcessed```, receives the work item argument value and passes it to the Action delegate:

```csharp
public static void PriorityItemProcessed(
    this ILogger logger, WorkItem workItem) =>
    s_processingPriorityItem(logger, workItem, default!);
```

In the worker service's ```ExecuteAsync``` method, ```PriorityItemProcessed``` is called to log the message:

```csharp
protected override async Task ExecuteAsync(
    CancellationToken stoppingToken)
{
    using (IDisposable? scope = logger.ProcessingWorkScope(DateTime.Now))
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                WorkItem? nextItem = priorityQueue.ProcessNextHighestPriority();

                if (nextItem is not null)
                {
                    logger.PriorityItemProcessed(nextItem);
                }
            }
            catch (Exception ex)
            {
                logger.FailedToProcessWorkItem(ex);
            }

            await Task.Delay(1_000, stoppingToken);
        }
    }
}
```

Inspect the app's console output:

```console
info: WorkerServiceOptions.Example.Worker[1]
      Processing priority item: Priority-Extreme (50db062a-9732-4418-936d-110549ad79e4): 'Verify communications'
```

## Define logger message scope

The `DefineScope(string)` method creates a `Func<TResult>` delegate for defining a log scope. DefineScope overloads permit passing up to six type parameters to a named format string (template).

As is the case with the Define method, the string provided to the DefineScope method is a template and not an interpolated string. Placeholders are filled in the order that the types are specified. Placeholder names in the template should be descriptive and consistent across templates. They serve as property names within structured log data. We recommend Pascal casing for placeholder names. For example, {Item}, {DateTime}.

Define a log scope to apply to a series of log messages using the DefineScope method. Enable ```IncludeScopes``` in the console logger section of appsettings.json:

```json
{
    "Logging": {
        "Console": {
            "IncludeScopes": true
        },
        "LogLevel": {
            "Default": "Information",
            "Microsoft": "Warning",
            "Microsoft.Hosting.Lifetime": "Information"
        }
    }
}
```

To create a log scope, add a field to hold a `Func<TResult>` delegate for the scope. The sample app creates a field named ```s_processingWorkScope``` (Internal/LoggerExtensions.cs):

```csharp
private static readonly Func<ILogger, DateTime, IDisposable?> s_processingWorkScope;
```

This sample app shows how to create a delegate that can be invoked when a message is sent.

```csharp
s_processingWorkScope =
    LoggerMessage.DefineScope<DateTime>(
        "Processing scope, started at: {DateTime}");
```

Provide a static extension method for the log message. Include any type parameters for named properties that appear in the message template. The sample app takes in a ```DateTime``` for a custom time stamp to log and returns ```_processingWorkScope```:

```csharp
public static IDisposable? ProcessingWorkScope(
    this ILogger logger, DateTime time) =>
    s_processingWorkScope(logger, time);
```

The scope wraps the logging extension calls in a using block:

```csharp
protected override async Task ExecuteAsync(
    CancellationToken stoppingToken)
{
    using (IDisposable? scope = logger.ProcessingWorkScope(DateTime.Now))
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                WorkItem? nextItem = priorityQueue.ProcessNextHighestPriority();

                if (nextItem is not null)
                {
                    logger.PriorityItemProcessed(nextItem);
                }
            }
            catch (Exception ex)
            {
                logger.FailedToProcessWorkItem(ex);
            }

            await Task.Delay(1_000, stoppingToken);
        }
    }
}
```

Inspect the log messages in the app's console output. The following result shows priority ordering of log messages with the log scope message included:

```console
info: WorkerServiceOptions.Example.Worker[1]
      => Processing scope, started at: 04/11/2024 11:27:52
      Processing priority item: Priority-Extreme (7d153ef9-8894-4282-836a-8e5e38319fb3): 'Verify communications'
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
info: Microsoft.Hosting.Lifetime[0]
      Hosting environment: Development
info: Microsoft.Hosting.Lifetime[0]
      Content root path: D:\source\repos\dotnet-docs\docs\core\extensions\snippets\logging\worker-service-options
info: WorkerServiceOptions.Example.Worker[1]
      => Processing scope, started at: 04/11/2024 11:27:52
      Processing priority item: Priority-High (dbad6558-60cd-4eb1-8531-231e90081f62): 'Validate collection'
info: WorkerServiceOptions.Example.Worker[1]
      => Processing scope, started at: 04/11/2024 11:27:52
      Processing priority item: Priority-Medium (1eabe213-dc64-4e3a-9920-f67fe1dfb0f6): 'Propagate selections'
info: WorkerServiceOptions.Example.Worker[1]
      => Processing scope, started at: 04/11/2024 11:27:52
      Processing priority item: Priority-Medium (1142688d-d4dc-4f78-95c5-04ec01cbfac7): 'Enter pooling [contention]'
info: WorkerServiceOptions.Example.Worker[1]
      => Processing scope, started at: 04/11/2024 11:27:52
      Processing priority item: Priority-Low (e85e0c4d-0840-476e-b8b0-22505c08e913): 'Health check network'
info: WorkerServiceOptions.Example.Worker[1]
      => Processing scope, started at: 04/11/2024 11:27:52
      Processing priority item: Priority-Deferred (07571363-d559-4e72-bc33-cd8398348786): 'Ping weather service'
info: WorkerServiceOptions.Example.Worker[1]
      => Processing scope, started at: 04/11/2024 11:27:52
      Processing priority item: Priority-Deferred (2bf74f2f-0198-4831-8138-03368e60bd6b): 'Set process state'
info: Microsoft.Hosting.Lifetime[0]
      Application is shutting down...
```

## Log level guarded optimizations

Another performance optimization can be made by checking the ```LogLevel```, with `ILogger.IsEnabled(LogLevel)` before an invocation to the corresponding Log* method. When logging isn't configured for the given ```LogLevel```, the following statements are true:

- ILogger.Log isn't called.

- An allocation of ```object[]``` representing the parameters is avoided.

- Value type boxing is avoided.

For more information:

- Micro benchmarks in the .NET runtime

- Background and motivation for log level checks

## See also

- Logging in .NET

Ref: [High-performance logging in .NET](https://learn.microsoft.com/en-us/dotnet/core/extensions/high-performance-logging?toc=%2Faspnet%2Fcore%2Ftoc.json&bc=%2Faspnet%2Fcore%2Fbreadcrumb%2Ftoc.json&view=aspnetcore-8.0)