---
title: Asynchronous programming patterns - Event-based asynchronous pattern (EAP) - EAP overview
published: true
date: 2024-09-26 07:19:53
tags: Summary, .Net, AdvancedProgramming
description: Applications that perform many tasks simultaneously, yet remain responsive to user interaction, often require a design that uses multiple threads. The System.Threading namespace provides all the tools necessary to create high-performance multithreaded applications, but using these tools effectively requires significant experience with multithreaded software engineering. For relatively simple multithreaded applications, the BackgroundWorker component provides a straightforward solution. For more sophisticated asynchronous applications, consider implementing a class that adheres to the Event-based Asynchronous Pattern.
image:
---

## In this article

This paper presents a system-wide approach to creating high-performance multithreaded applications.

The AsynchronousPattern class allows you to write multithreaded applications with minimal overhead.

- Perform time-consuming tasks, such as downloads and database operations, "in the background," without interrupting your application.

- Execute multiple operations simultaneously, receiving notifications when each completes.

- Wait for resources to become available without stopping ("blocking") your application.

- Communicate with pending asynchronous operations using the familiar events-and-delegates model. For more information on using event handlers and delegates, see Events.

A class that supports the Event-based Asynchronous Pattern will have one or more methods named MethodNameAsync. These methods may mirror synchronous versions, which perform the same operation on the current thread. The class may also have a MethodNameCompleted event and it may have a MethodNameAsyncCancel (or simply ```CancelAsync```) method.

You can download an image synchronously by calling its Load method, but if the image is large, or if the network connection is slow, your application will stop responding until the download operation is completed and the call to Load returns.

In this example, we are running an application while an image is loading.

The Event-based Asynchronous Pattern requires that an asynchronous operation can be canceled, and the PictureBox control supports this requirement with its ```CancelAsync``` method. Calling ```CancelAsync``` submits a request to stop the pending download, and when the task is canceled, the LoadCompleted event is raised.

> Caution
It is possible that the download will finish just as the ```CancelAsync``` request is made, so Cancelled may not reflect the request to cancel. This is called a race condition and is a common issue in multithreaded programming. For more information on issues in multithreaded programming, see Managed Threading Best Practices.

## Characteristics of the Event-based Asynchronous Pattern

The Event-based Asynchronous Pattern supports asynchronous operations between classes.

An asynchronous method can be used to call another method asynchronously.

### Examples of the Event-based Asynchronous Pattern

The SoundPlayer, PictureBox, WebClient, and BackgroundWorker components represent simple implementations of the Event-based Asynchronous Pattern.

Below is an example class declaration that conforms to the pattern:

```csharp
public class AsyncExample  
{  
    // Synchronous methods.  
    public int Method1(string param);  
    public void Method2(double param);  
  
    // Asynchronous methods.  
    public void Method1Async(string param);  
    public void Method1Async(string param, object userState);  
    public event Method1CompletedEventHandler Method1Completed;  
  
    public void Method2Async(double param);  
    public void Method2Async(double param, object userState);  
    public event Method2CompletedEventHandler Method2Completed;  
  
    public void CancelAsync(object userState);  
  
    public bool IsBusy { get; }  
  
    // Class implementation not shown.  
}
```

The fictitious ```AsyncExample``` class has two methods, both of which support synchronous and asynchronous invocations. The synchronous overloads behave like any method call and execute the operation on the calling thread; if the operation is time-consuming, there may be a noticeable delay before the call returns. The asynchronous overloads will start the operation on another thread and then return immediately, allowing the calling thread to continue while the operation executes "in the background."

### Asynchronous Method Overloads

There are potentially two overloads for the asynchronous operations: single-invocation and multiple-invocation. You can distinguish these two forms by their method signatures: the multiple-invocation form has an extra parameter called ```userState```. This form makes it possible for your code to call `Method1Async(string param, object userState)` multiple times without waiting for any pending asynchronous operations to finish. If, on the other hand, you try to call `Method1Async(string param)` before a previous invocation has completed, the method raises an InvalidOperationException.

The ```userState``` parameter for the multiple-invocation overloads allows you to distinguish among asynchronous operations. You provide a unique value (for example, a GUID or hash code) for each call to ```Method1Async(string param, object userState)```, and when each operation is completed, your event handler can determine which instance of the operation raised the completion event.

### Tracking Pending Operations

If you use the multiple-invocation overloads, your code will need to keep track of the ```userState``` objects (task IDs) for pending tasks. For each call to ```Method1Async(string param, object userState)```, you will typically generate a new, unique ```userState``` object and add it to a collection. When the task corresponding to this ```userState``` object raises the completion event, your completion method implementation will examine `AsyncCompletedEventArgs.UserState` and remove it from your collection. Used this way, the ```userState``` parameter takes the role of a task ID.

> Note
You must be careful to provide a unique value for ```userState``` in your calls to multiple-invocation overloads. Non-unique task IDs will cause the asynchronous class throw an ArgumentException.

### Canceling Pending Operations

It is important to be able to cancel asynchronous operations at any time before their completion. Classes that implement the Event-based Asynchronous Pattern will have a ```CancelAsync``` method (if there is only one asynchronous method) or a MethodNameAsyncCancel method (if there are multiple asynchronous methods).

Methods that allow multiple invocations take a ```userState``` parameter, which can be used to track the lifetime of each task. ```CancelAsync``` takes a ```userState``` parameter, which allows you to cancel particular pending tasks.

Methods that support only a single pending operation at a time, like Method1Async(string param), are not cancelable.

### Receiving Progress Updates and Incremental Results

A class that adheres to the Event-based Asynchronous Pattern may optionally provide an event for tracking progress and incremental results. This will typically be named ```ProgressChanged``` or MethodNameProgressChanged, and its corresponding event handler will take a ProgressChangedEventArgs parameter.

The event handler for the ```ProgressChanged``` event can examine the ProgressChangedEventArgs.ProgressPercentage property to determine what percentage of an asynchronous task has been completed. This property will range from 0 to 100, and it can be used to update the Value property of a ProgressBar. If multiple asynchronous operations are pending, you can use the ProgressChangedEventArgs.UserState property to distinguish which operation is reporting progress.

Some classes may report incremental results as asynchronous operations proceed. These results will be stored in a class that derives from ProgressChangedEventArgs and they will appear as properties in the derived class. You can access these results in the event handler for the ```ProgressChanged``` event, just as you would access the ProgressPercentage property. If multiple asynchronous operations are pending, you can use the UserState property to distinguish which operation is reporting incremental results.

## See also

- ProgressChangedEventArgs

- BackgroundWorker

- AsyncCompletedEventArgs

- How to: Use Components That Support the Event-based Asynchronous Pattern

- How to: Run an Operation in the Background

- How to: Implement a Form That Uses a Background Operation

- Event-based Asynchronous Pattern (EAP)

- Best Practices for Implementing the Event-based Asynchronous Pattern

- Deciding When to Implement the Event-based Asynchronous Pattern

Ref: [Event-based Asynchronous Pattern Overview](https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/event-based-asynchronous-pattern-overview)