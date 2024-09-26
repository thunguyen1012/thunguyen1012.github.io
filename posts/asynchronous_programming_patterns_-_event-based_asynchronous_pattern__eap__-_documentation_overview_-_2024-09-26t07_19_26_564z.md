---
title: Asynchronous programming patterns - Event-based asynchronous pattern (EAP) - Documentation overview
published: true
date: 2024-09-26 07:19:26
tags: Summary, .Net, AdvancedProgramming
description: There are a number of ways to expose asynchronous features to client code. The Event-based Asynchronous Pattern prescribes one way for classes to present asynchronous behavior.
image:
---

## In this article

There are a number of ways to expose asynchronous features to client code. The Event-based Asynchronous Pattern prescribes one way for classes to present asynchronous behavior.

> Note
Starting with .NET Framework 4, the Task Parallel Library provides a new model for asynchronous and parallel programming. For more information, see Task Parallel Library (TPL) and Task-based Asynchronous Pattern (TAP).

## In This Section

The Event-based Asynchronous Pattern is an event-based pattern language designed for use in multithreaded applications.

Implementing the Event-based Asynchronous Pattern
Describes the standardized way to package a class that has asynchronous features.

Best Practices for Implementing the Event-based Asynchronous Pattern
Describes the requirements for exposing asynchronous features according to the Event-based Asynchronous Pattern.

This article explains how to implement the Event-based Asynchronous Pattern instead of the IAsyncResult pattern represented by the Asynchronous Programming Model (APM).

In this article, you will learn how to implement an Event-based Asynchronous Pattern.

How to: Implement a Client of the Event-based Asynchronous Pattern
Describes how to create a client that uses a component that implements the Event-based Asynchronous Pattern.

How to: Use Components That Support the Event-based Asynchronous Pattern
Describes how to use a component that supports the Event-based Asynchronous Pattern.

## Reference

`AsyncOperation`
Describes the AsyncOperation class and has links to all its members.

`AsyncOperationManager`
Describes the AsyncOperationManager class and has links to all its members.

`BackgroundWorker`
Describes the BackgroundWorker component and has links to all its members.

## Related Sections

Task Parallel Library (TPL)
Describes a programming model for asynchronous and parallel operations.

Threading
Describes multithreading features in .NET.

## See also

- Managed Threading Best Practices

- Events

- Asynchronous Programming Design Patterns

Ref: [Event-based Asynchronous Pattern (EAP)](https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/event-based-asynchronous-pattern-eap)