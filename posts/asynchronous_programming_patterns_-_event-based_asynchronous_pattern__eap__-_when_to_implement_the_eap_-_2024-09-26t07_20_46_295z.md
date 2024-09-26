---
title: Asynchronous programming patterns - Event-based asynchronous pattern (EAP) - When to implement the EAP
published: true
date: 2024-09-26 07:20:46
tags: Summary, .Net, AdvancedProgramming
description: The Event-based Asynchronous Pattern provides a pattern for exposing the asynchronous behavior of a class. With the introduction of this pattern, .NET defines two patterns for exposing asynchronous behavior: the Asynchronous Pattern based on the System.IAsyncResult interface, and the event-based pattern. This article describes when it's appropriate for you to implement both patterns.
image:
---

## In this article

This article describes when it is appropriate to implement both the Event-based Asynchronous Pattern and the Asynchronous Pattern based on the System.IAsyncResult interface.

For more information about asynchronous programming with the IAsyncResult interface, see Asynchronous Programming Model (APM).

## General Principles

In this section, you will learn how to expose asynchronous features using the Event-based Asynchronous Pattern.

> Note
It is rare for the IAsyncResult pattern to be implemented without the event-based pattern also being implemented.

## Guidelines

The following list describes the guidelines for when you should implement Event-based Asynchronous Pattern:

- Use the event-based pattern as the default API to expose asynchronous behavior for your class.

- Do not expose the IAsyncResult pattern when your class is primarily used in a client application, for example Windows Forms.

- Only expose the IAsyncResult pattern when it is necessary for meeting your requirements. For example, compatibility with an existing API may require you to expose the IAsyncResult pattern.

- Do not expose the IAsyncResult pattern without also exposing the event-based pattern.

- If you must expose the IAsyncResult pattern, do so as an advanced option. For example, if you generate a proxy object, generate the event-based pattern by default, with an option to generate the IAsyncResult pattern.

- Build your event-based pattern implementation on your IAsyncResult pattern implementation.

- Avoid exposing both the event-based pattern and the IAsyncResult pattern on the same class. Expose the event-based pattern on "higher level" classes and the IAsyncResult pattern on "lower level" classes. For example, compare the event-based pattern on the WebClient component with the IAsyncResult pattern on the HttpRequest class.

  - Expose the event-based pattern and the IAsyncResult pattern on the same class when compatibility requires it. For example, if you have already released an API that uses the IAsyncResult pattern, you would need to retain the IAsyncResult pattern for backward compatibility.

  - Expose the event-based pattern and the IAsyncResult pattern on the same class if the resulting object model complexity outweighs the benefit of separating the implementations. It is better to expose both patterns on a single class than to avoid exposing the event-based pattern.

  - If you must expose both the event-based pattern and IAsyncResult pattern on a single class, use EditorBrowsableAttribute set to Advanced to mark the IAsyncResult pattern implementation as an advanced feature. This indicates to design environments, such as Visual Studio IntelliSense, not to display the IAsyncResult properties and methods. These properties and methods are still fully usable, but the developer working through IntelliSense has a clearer view of the API.

## Criteria for Exposing the IAsyncResult Pattern in Addition to the Event-based Pattern

The Event-based Asynchronous Pattern has many benefits under the previously mentioned scenarios, and it does have some drawbacks, which you should be aware of if performance is your most important requirement.

There are three scenarios that the event-based pattern does not address as well as the IAsyncResult pattern:

- Blocking wait on one IAsyncResult

- Blocking wait on many IAsyncResult objects

- Polling for completion on the IAsyncResult

You can address these scenarios by using the event-based pattern, but doing so is more cumbersome than using the IAsyncResult pattern.

The IAsyncResult pattern can be used in a variety of ways.

Additionally, the event-based pattern is less efficient than the IAsyncResult pattern because it creates more objects, especially EventArgs, and because it synchronizes across threads.

The following list shows some recommendations to follow if you decide to use the IAsyncResult pattern:

- Only expose the IAsyncResult pattern when you specifically require support for WaitHandle or IAsyncResult objects.

- Only expose the IAsyncResult pattern when you have an existing API that uses the IAsyncResult pattern.

- If you have an existing API based on the IAsyncResult pattern, consider also exposing the event-based pattern in your next release.

- Only expose IAsyncResult pattern if you have high performance requirements which you have verified cannot be met by the event-based pattern but can be met by the IAsyncResult pattern.

## See also

- How to: Implement a Component That Supports the Event-based Asynchronous Pattern

- Event-based Asynchronous Pattern (EAP)

- Implementing the Event-based Asynchronous Pattern

- Best Practices for Implementing the Event-based Asynchronous Pattern

- Event-based Asynchronous Pattern Overview

Ref: [Deciding When to Implement the Event-based Asynchronous Pattern](https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/deciding-when-to-implement-the-event-based-asynchronous-pattern)