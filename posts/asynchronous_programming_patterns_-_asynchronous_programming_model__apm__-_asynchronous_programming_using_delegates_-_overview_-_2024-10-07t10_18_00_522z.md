---
title: Asynchronous programming patterns - Asynchronous programming model (APM) - Asynchronous programming using delegates - Overview
published: true
date: 2024-10-07 10:18:00
tags: Summary, .Net, AdvancedProgramming
description: Delegates enable you to call a synchronous method in an asynchronous manner. When you call a delegate synchronously, the Invoke method calls the target method directly on the current thread. If the BeginInvoke method is called, the common language runtime (CLR) queues the request and returns immediately to the caller. The target method is called asynchronously on a thread from the thread pool. The original thread, which submitted the request, is free to continue executing in parallel with the target method. If a callback method has been specified in the call to the BeginInvoke method, the callback method is called when the target method ends. In the callback method, the EndInvoke method obtains the return value and any input/output or output-only parameters. If no callback method is specified when calling BeginInvoke, EndInvoke can be called from the thread that called BeginInvoke.
image:
---
- Article

  - 09/15/2021

  - 11 contributors

## In this article

Delegates enable you to call a synchronous method in an asynchronous manner. When you call a delegate synchronously, the ```Invoke``` method calls the target method directly on the current thread. If the ```BeginInvoke``` method is called, the common language runtime (CLR) queues the request and returns immediately to the caller. The target method is called asynchronously on a thread from the thread pool. The original thread, which submitted the request, is free to continue executing in parallel with the target method. If a callback method has been specified in the call to the ```BeginInvoke``` method, the callback method is called when the target method ends. In the callback method, the ```EndInvoke``` method obtains the return value and any input/output or output-only parameters. If no callback method is specified when calling ```BeginInvoke```, ```EndInvoke``` can be called from the thread that called ```BeginInvoke```.

> Important
Compilers should emit delegate classes with ```Invoke```, ```BeginInvoke```, and ```EndInvoke``` methods using the delegate signature specified by the user. The ```BeginInvoke``` and ```EndInvoke``` methods should be decorated as native. Because these methods are marked as native, the CLR automatically provides the implementation at class load time. The loader ensures that they are not overridden.

## In This Section

In this course, you will learn how to make asynchronous calls to ordinary methods, and how to wait for an asynchronous call to return.

## Related Sections

Event-based Asynchronous Pattern (EAP)
Describes asynchronous programming in .NET.

## See also

- Delegate

Ref: [Asynchronous Programming Using Delegates](https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/asynchronous-programming-using-delegates)