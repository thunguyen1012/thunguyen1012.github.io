---
title: Asynchronous programming patterns - Event-based asynchronous pattern (EAP) - Implement the EAP
published: true
date: 2024-09-26 07:20:06
tags: Summary, .Net, AdvancedProgramming
description: If you are writing a class with some operations that may incur noticeable delays, consider giving it asynchronous functionality by implementing the Event-based Asynchronous Pattern.
image:
---

## In this article

If you are writing a class with some operations that may incur noticeable delays, consider giving it asynchronous functionality by implementing the Event-based Asynchronous Pattern.

This tutorial shows how to implement the Event-based Asynchronous Pattern in your ASP.NET application.

For an example that implements the Event-based Asynchronous Pattern, see How to: Implement a Component That Supports the Event-based Asynchronous Pattern.

For simple asynchronous operations, you may find the BackgroundWorker component suitable. For more information about BackgroundWorker, see How to: Run an Operation in the Background.

The following list describes the features of the Event-based Asynchronous Pattern discussed in this topic.

- Opportunities for Implementing the Event-based Asynchronous Pattern

- Naming Asynchronous Methods

- Optionally Support Cancellation

- Optionally Support the ```IsBusy``` Property

- Optionally Provide Support for Progress Reporting

- Optionally Provide Support for Returning Incremental Results

- Handling Out and Ref Parameters in Methods

## Opportunities for Implementing the Event-based Asynchronous Pattern

Consider implementing the Event-based Asynchronous Pattern when:

- Clients of your class do not need WaitHandle and IAsyncResult objects available for asynchronous operations, meaning that polling and WaitAll or WaitAny will need to be built up by the client.

- You want asynchronous operations to be managed by the client with the familiar event/delegate model.

An asynchronous operation is one in which a method is called but no further action is required.

For more information on deciding when to support the Event-based Asynchronous Pattern, see Deciding When to Implement the Event-based Asynchronous Pattern.

## Naming Asynchronous Methods

For each synchronous method MethodName for which you want to provide an asynchronous counterpart:

Define a MethodNameAsync method that:

- Returns ```void```.

- Takes the same parameters as the MethodName method.

- Accepts multiple invocations.

Optionally define a MethodNameAsync overload, identical to MethodNameAsync, but with an additional object-valued parameter called ```userState```. Do this if you're prepared to manage multiple concurrent invocations of your method, in which case the ```userState``` value will be delivered back to all event handlers to distinguish invocations of the method. You may also choose to do this simply as a place to store user state for later retrieval.

For each separate MethodNameAsync method signature:

- Define the following event in the same class as the method:

```csharp
public event MethodNameCompletedEventHandler MethodNameCompleted;
```

- Define the following delegate and AsyncCompletedEventArgs. These will likely be defined outside of the class itself, but in the same namespace.

```csharp
public delegate void MethodNameCompletedEventHandler(object sender,
    MethodNameCompletedEventArgs e);

public class MethodNameCompletedEventArgs : System.ComponentModel.AsyncCompletedEventArgs
{
    public MyReturnType Result { get; }
}
```

  - Ensure that the MethodNameCompletedEventArgs class exposes its members as read-only properties, and not fields, as fields prevent data binding.

  - Do not define any AsyncCompletedEventArgs-derived classes for methods that do not produce results. Simply use an instance of AsyncCompletedEventArgs itself.

Note
It is perfectly acceptable, when feasible and appropriate, to reuse delegate and AsyncCompletedEventArgs types. In this case, the naming will not be as consistent with the method name, since a given delegate and AsyncCompletedEventArgs won't be tied to a single method.

> Note
It is perfectly acceptable, when feasible and appropriate, to reuse delegate and AsyncCompletedEventArgs types. In this case, the naming will not be as consistent with the method name, since a given delegate and AsyncCompletedEventArgs won't be tied to a single method.

## Optionally Support Cancellation

If your class will support cancelling asynchronous operations, cancellation should be exposed to the client as described below.

- Does your class, including future anticipated additions to it, have only one asynchronous operation that supports cancellation?

- Can the asynchronous operations that support cancellation support multiple pending operations? That is, does the MethodNameAsync method take a ```userState``` parameter, and does it allow multiple invocations before waiting for any to finish?

Use the answers to these two questions in the table below to determine what the signature for your cancellation method should be.

### Visual Basic

<table><thead>
<tr>
<th></th>
<th>Multiple Simultaneous Operations Supported</th>
<th>Only One Operation at a Time</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>One Async Operation in entire class</strong></td>
<td><code>Sub MethodNameAsyncCancel(ByVal userState As Object)</code></td>
<td><code>Sub MethodNameAsyncCancel()</code></td>
</tr>
<tr>
<td><strong>Multiple Async Operations in class</strong></td>
<td><code>Sub CancelAsync(ByVal userState As Object)</code></td>
<td><code>Sub CancelAsync()</code></td>
</tr>
</tbody></table>

### C#

<table><thead>
<tr>
<th></th>
<th>Multiple Simultaneous Operations Supported</th>
<th>Only One Operation at a Time</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>One Async Operation in entire class</strong></td>
<td><code>void MethodNameAsyncCancel(object userState);</code></td>
<td><code>void MethodNameAsyncCancel();</code></td>
</tr>
<tr>
<td><strong>Multiple Async Operations in class</strong></td>
<td><code>void CancelAsync(object userState);</code></td>
<td><code>void CancelAsync();</code></td>
</tr>
</tbody></table>

If you define the ```CancelAsync(object userState)``` method, clients must be careful when choosing their state values to make them capable of distinguishing among all asynchronous methods invoked on the object, and not just between all invocations of a single asynchronous method.

The decision to name the single-async-operation version MethodNameAsyncCancel is based on being able to more easily discover the method in a design environment like Visual Studio's IntelliSense. This groups the related members and distinguishes them from other members that have nothing to do with asynchronous functionality. If you expect that there may be additional asynchronous operations added in subsequent versions, it is better to define ```CancelAsync```.

Do not define multiple methods from the table above in the same class. That will not make sense, or it will clutter the class interface with a proliferation of methods.

These methods typically will return immediately, and the operation may or may not actually cancel. In the event handler for the MethodNameCompleted event, the MethodNameCompletedEventArgs object contains a ```Cancelled``` field, which clients can use to determine whether the cancellation occurred.

Abide by the cancellation semantics described in Best Practices for Implementing the Event-based Asynchronous Pattern.

## Optionally Support the ```IsBusy``` Property

If your class does not support multiple concurrent invocations, consider exposing an ```IsBusy``` property. This allows developers to determine whether a MethodNameAsync method is running without catching an exception from the MethodNameAsync method.

Abide by the ```IsBusy``` semantics described in Best Practices for Implementing the Event-based Asynchronous Pattern.

## Optionally Provide Support for Progress Reporting

It is frequently desirable for an asynchronous operation to report progress during its operation. The Event-based Asynchronous Pattern provides a guideline for doing so.

- Optionally define an event to be raised by the asynchronous operation and invoked on the appropriate thread. The ProgressChangedEventArgs object carries an integer-valued progress indicator that is expected to be between 0 and 100.

- Name this event as follows:

This naming choice parallels that made for the cancellation method, as described in the Optionally Support Cancellation section.

  - ```ProgressChanged``` if the class has multiple asynchronous operations (or is expected to grow to include multiple asynchronous operations in future versions);

  - MethodNameProgressChanged if the class has a single asynchronous operation.

This event should use the ProgressChangedEventHandler delegate signature and the ProgressChangedEventArgs class. Alternatively, if a more domain-specific progress indicator can be provided (for instance, bytes read and total bytes for a download operation), then you should define a derived class of ProgressChangedEventArgs.

Note that there is only one ```ProgressChanged``` or MethodNameProgressChanged event for the class, regardless of the number of asynchronous methods it supports. Clients are expected to use the ```userState``` object that is passed to the MethodNameAsync methods to distinguish among progress updates on multiple concurrent operations.

There may be situations in which multiple operations support progress and each returns a different indicator for progress. In this case, a single ```ProgressChanged``` event is not appropriate, and you may consider supporting multiple ```ProgressChanged``` events. In this case use a naming pattern of MethodNameProgressChanged for each MethodNameAsync method.

Abide by the progress-reporting semantics described Best Practices for Implementing the Event-based Asynchronous Pattern.

## Optionally Provide Support for Returning Incremental Results

Sometimes an asynchronous operation can return incremental results prior to completion. There are a number of options that can be used to support this scenario. Some examples follow.

### Single-operation Class

If your class only supports a single asynchronous operation, and that operation is able to return incremental results, then:

- Extend the ProgressChangedEventArgs type to carry the incremental result data, and define a MethodNameProgressChanged event with this extended data.

- Raise this MethodNameProgressChanged event when there is an incremental result to report.

This solution applies specifically to a single-async-operation class because there is no problem with the same event occurring to return incremental results on "all operations", as the MethodNameProgressChanged event does.

### Multiple-operation Class with Homogeneous Incremental Results

In this case, your class supports multiple asynchronous methods, each capable of returning incremental results, and these incremental results all have the same type of data.

Follow the model described above for single-operation classes, as the same EventArgs structure will work for all incremental results. Define a ```ProgressChanged``` event instead of a MethodNameProgressChanged event, since it applies to multiple asynchronous methods.

### Multiple-operation Class with Heterogeneous Incremental Results

If your class supports multiple asynchronous methods, each returning a different type of data, you should:

- Separate your incremental result reporting from your progress reporting.

- Define a separate MethodNameProgressChanged event with appropriate EventArgs for each asynchronous method to handle that method's incremental result data.

Invoke that event handler on the appropriate thread as described in Best Practices for Implementing the Event-based Asynchronous Pattern.

## Handling Out and Ref Parameters in Methods

Although the use of ```out``` and ```ref``` is, in general, discouraged in .NET, here are the rules to follow when they are present:

Given a synchronous method MethodName:

- ```out``` parameters to MethodName should not be part of MethodNameAsync. Instead, they should be part of MethodNameCompletedEventArgs with the same name as its parameter equivalent in MethodName (unless there is a more appropriate name).

- ```ref``` parameters to MethodName should appear as part of MethodNameAsync, and as part of MethodNameCompletedEventArgs with the same name as its parameter equivalent in MethodName (unless there is a more appropriate name).

For example, given:

```csharp
public int MethodName(string arg1, ref string arg2, out string arg3);
```

Your asynchronous method and its AsyncCompletedEventArgs class would look like this:

```csharp
public void MethodNameAsync(string arg1, string arg2);

public class MethodNameCompletedEventArgs : System.ComponentModel.AsyncCompletedEventArgs
{
    public int Result { get; };
    public string Arg2 { get; };
    public string Arg3 { get; };
}
```

## See also

- ProgressChangedEventArgs

- AsyncCompletedEventArgs

- How to: Implement a Component That Supports the Event-based Asynchronous Pattern

- How to: Run an Operation in the Background

- How to: Implement a Form That Uses a Background Operation

- Deciding When to Implement the Event-based Asynchronous Pattern

- Best Practices for Implementing the Event-based Asynchronous Pattern

- Event-based Asynchronous Pattern (EAP)

Ref: [Implementing the Event-based Asynchronous Pattern](https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/implementing-the-event-based-asynchronous-pattern)