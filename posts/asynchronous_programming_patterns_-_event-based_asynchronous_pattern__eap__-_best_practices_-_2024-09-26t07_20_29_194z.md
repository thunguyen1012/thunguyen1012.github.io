---
title: Asynchronous programming patterns - Event-based asynchronous pattern (EAP) - Best practices
published: true
date: 2024-09-26 07:20:29
tags: Summary, .Net, AdvancedProgramming
description: The Event-based Asynchronous Pattern provides you with an effective way to expose asynchronous behavior in classes, with familiar event and delegate semantics. To implement Event-based Asynchronous Pattern, you need to follow some specific behavioral requirements. The following sections describe requirements and guidelines you should consider when you implement a class that follows the Event-based Asynchronous Pattern.
image:
---

## In this article

The Event-based Asynchronous Pattern provides you with an effective way to expose asynchronous behavior in classes, with familiar event and delegate semantics.

For an overview, see Implementing the Event-based Asynchronous Pattern.

## Required Behavioral Guarantees

If you implement the Event-based Asynchronous Pattern, you must provide a number of guarantees to ensure that your class will behave properly and clients of your class can rely on such behavior.

### Completion

asynchronous operations should never be completed.

### Completed Event and EventArgs

For each separate MethodNameAsync method, apply the following design requirements:

- Define a MethodNameCompleted event on the same class as the method.

- Define an EventArgs class and accompanying delegate for the MethodNameCompleted event that derives from the AsyncCompletedEventArgs class. The default class name should be of the form MethodNameCompletedEventArgs.

- Ensure that the EventArgs class is specific to the return values of the MethodName method. When you use the EventArgs class, you should never require developers to cast the result.
The following code example shows good and bad implementation of this design requirement respectively.

```csharp
// Good design
private void Form1_MethodNameCompleted(object sender, xxxCompletedEventArgs e)
{
    DemoType result = e.Result;
}

// Bad design
private void Form1_MethodNameCompleted(object sender, MethodNameCompletedEventArgs e)
{
    DemoType result = (DemoType)(e.Result);
}
```

- Do not define an EventArgs class for returning methods that return ```void```. Instead, use an instance of the AsyncCompletedEventArgs class.

- Ensure that you always raise the MethodNameCompleted event. This event should be raised on successful completion, on an error, or on cancellation. Applications should never encounter a situation where they remain idle and completion never occurs.

- Ensure that you catch any exceptions that occur in the asynchronous operation and assign the caught exception to the Error property.

- If there was an error completing the task, the results should not be accessible. When the Error property is not ```null```, ensure that accessing any property in the EventArgs structure raises an exception. Use the RaiseExceptionIfNecessary method to perform this verification.

- Model a time out as an error. When a time out occurs, raise the MethodNameCompleted event and assign a TimeoutException to the Error property.

- If your class supports multiple concurrent invocations, ensure that the MethodNameCompleted event contains the appropriate ```userSuppliedState``` object.

- Ensure that the MethodNameCompleted event is raised on the appropriate thread and at the appropriate time in the application lifecycle. For more information, see the Threading and Contexts section.

### Simultaneously Executing Operations

- If your class supports multiple concurrent invocations, enable the developer to track each invocation separately by defining the MethodNameAsync overload that takes an object-valued state parameter, or task ID, called ```userSuppliedState```. This parameter should always be the last parameter in the MethodNameAsync method's signature.

- If your class defines the MethodNameAsync overload that takes an object-valued state parameter, or task ID, be sure to track the lifetime of the operation with that task ID, and be sure to provide it back into the completion handler. There are helper classes available to assist. For more information on concurrency management, see How to: Implement a Component That Supports the Event-based Asynchronous Pattern.

- If your class defines the MethodNameAsync method without the state parameter, and it does not support multiple concurrent invocations, ensure that any attempt to invoke MethodNameAsync before the prior MethodNameAsync invocation has completed raises an InvalidOperationException.

- In general, do not raise an exception if the MethodNameAsync method without the ```userSuppliedState``` parameter is invoked multiple times so that there are multiple outstanding operations. You can raise an exception when your class explicitly cannot handle that situation, but assume that developers can handle these multiple indistinguishable callbacks

### Accessing Results

- If there was an error during execution of the asynchronous operation, the results should not be accessible. Ensure that accessing any property in the AsyncCompletedEventArgs when Error is not ```null``` raises the exception referenced by Error. The AsyncCompletedEventArgs class provides the RaiseExceptionIfNecessary method for this purpose.

- Ensure that any attempt to access the result raises an InvalidOperationException stating that the operation was canceled. Use the AsyncCompletedEventArgs.RaiseExceptionIfNecessary method to perform this verification.

### Progress Reporting

- Support progress reporting, if possible. This enables developers to provide a better application user experience when they use your class.

- If you implement a ```ProgressChanged``` or MethodNameProgressChanged event, ensure that there are no such events raised for a particular asynchronous operation after that operation's MethodNameCompleted event has been raised.

- If the standard ProgressChangedEventArgs is being populated, ensure that the ProgressPercentage can always be interpreted as a percentage. The percentage does not need to be accurate, but it should represent a percentage. If your progress reporting metric must be something other than a percentage, derive a class from the ProgressChangedEventArgs class and leave ProgressPercentage at 0. Avoid using a reporting metric other than a percentage.

- Ensure that the ```ProgressChanged``` event is raised on the appropriate thread and at the appropriate time in the application lifecycle. For more information, see the Threading and Contexts section.

### ```IsBusy``` Implementation

- Do not expose an ```IsBusy``` property if your class supports multiple concurrent invocations. For example, XML Web service proxies do not expose an ```IsBusy``` property because they support multiple concurrent invocations of asynchronous methods.

- The ```IsBusy``` property should return ```true``` after the MethodNameAsync method has been called and before the MethodNameCompleted event has been raised. Otherwise it should return ```false```. The BackgroundWorker and WebClient components are examples of classes that expose an ```IsBusy``` property.

### Cancellation

- Support cancellation, if possible. This enables developers to provide a better application user experience when they use your class.

- In the case of cancellation, set the Cancelled flag in the AsyncCompletedEventArgs object.

- Ensure that any attempt to access the result raises an InvalidOperationException stating that the operation was canceled. Use the AsyncCompletedEventArgs.RaiseExceptionIfNecessary method to perform this verification.

- Ensure that calls to a cancellation method always return successfully, and never raise an exception. In general, a client is not notified as to whether an operation is truly cancelable at any given time, and is not notified as to whether a previously issued cancellation has succeeded. However, the application will always be given notification when a cancellation succeeded, because the application takes part in the completion status.

- Raise the MethodNameCompleted event when the operation is canceled.

### Errors and Exceptions

- Catch any exceptions that occur in the asynchronous operation and set the value of the AsyncCompletedEventArgs.Error property to that exception.

### Threading and Contexts

In this tutorial, you will learn how to create and run an asynchronous class.

You can use AsyncOperationManager to track the lifetime of a task.

AsyncOperation is responsible for marshalling calls to the client's event handlers to the proper thread or context.

> Note
You can circumvent these rules if you explicitly want to go against the policy of the application model, but still benefit from the other advantages of using the Event-based Asynchronous Pattern. For example, you may want a class operating in Windows Forms to be free threaded. You can create a free threaded class, as long as developers understand the implied restrictions. Console applications do not synchronize the execution of Post calls. This can cause ```ProgressChanged``` events to be raised out of order. If you wish to have serialized execution of Post calls, implement and install a System.Threading.SynchronizationContext class.

For more information about using AsyncOperation and AsyncOperationManager to enable your asynchronous operations, see How to: Implement a Component That Supports the Event-based Asynchronous Pattern.

## Guidelines

- Ideally, each method invocation should be independent of others. You should avoid coupling invocations with shared resources. If resources are to be shared among invocations, you will need to provide a proper synchronization mechanism in your implementation.

- Designs that require the client to implement synchronization are discouraged. For example, you could have an asynchronous method that receives a global static object as a parameter; multiple concurrent invocations of such a method could result in data corruption or deadlocks.

- If you implement a method with the multiple-invocation overload (userState in the signature), your class will need to manage a collection of user states, or task IDs, and their corresponding pending operations. This collection should be protected with ```lock``` regions, because the various invocations add and remove ```userState``` objects in the collection.

- Consider reusing ```CompletedEventArgs``` classes where feasible and appropriate. In this case, the naming is not consistent with the method name, because a given delegate and EventArgs type are not tied to a single method. However, forcing developers to cast the value retrieved from a property on the EventArgs is never acceptable.

- If you are authoring a class that derives from Component, do not implement and install your own SynchronizationContext class. Application models, not components, control the SynchronizationContext that is used.

- When you use multithreading of any sort, you potentially expose yourself to very serious and complex bugs. Before implementing any solution that uses multithreading, see Managed Threading Best Practices.

## See also

- AsyncOperation

- AsyncOperationManager

- AsyncCompletedEventArgs

- ProgressChangedEventArgs

- BackgroundWorker

- Implementing the Event-based Asynchronous Pattern

- Event-based Asynchronous Pattern (EAP)

- Deciding When to Implement the Event-based Asynchronous Pattern

- Best Practices for Implementing the Event-based Asynchronous Pattern

- How to: Use Components That Support the Event-based Asynchronous Pattern

- How to: Implement a Component That Supports the Event-based Asynchronous Pattern

Ref: [Best Practices for Implementing the Event-based Asynchronous Pattern](https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/best-practices-for-implementing-the-event-based-asynchronous-pattern)