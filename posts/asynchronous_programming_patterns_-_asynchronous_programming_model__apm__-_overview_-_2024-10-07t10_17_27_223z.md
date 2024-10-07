---
title: Asynchronous programming patterns - Asynchronous programming model (APM) - Overview
published: true
date: 2024-10-07 10:17:27
tags: Summary, .Net, AdvancedProgramming
description: An asynchronous operation that uses the IAsyncResult design pattern is implemented as two methods named BeginOperationName and EndOperationName that begin and end the asynchronous operation OperationName respectively. For example, the FileStream class provides the BeginRead and EndRead methods to asynchronously read bytes from a file. These methods implement the asynchronous version of the Read method.
image:
---
- Article

  - 09/15/2021

  - 12 contributors

## In this article

An asynchronous operation that uses the IAsyncResult design pattern is implemented as two methods named ```BeginOperationName``` and ```EndOperationName``` that begin and end the asynchronous operation OperationName respectively. For example, the FileStream class provides the BeginRead and EndRead methods to asynchronously read bytes from a file. These methods implement the asynchronous version of the Read method.

> Note
Starting with the .NET Framework 4, the Task Parallel Library provides a new model for asynchronous and parallel programming. For more information, see Task Parallel Library (TPL) and Task-based Asynchronous Pattern (TAP)).

After calling ```BeginOperationName```, an application can continue executing instructions on the calling thread while the asynchronous operation takes place on a different thread. For each call to ```BeginOperationName```, the application should also call ```EndOperationName``` to get the results of the operation.

## Beginning an Asynchronous Operation

The ```BeginOperationName``` method begins asynchronous operation OperationName and returns an object that implements the IAsyncResult interface. IAsyncResult objects store information about an asynchronous operation. The following table shows information about an asynchronous operation.

<table><thead>
<tr>
<th>Member</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="/en-us/dotnet/api/system.iasyncresult.asyncstate" class="no-loc" data-linktype="absolute-path">AsyncState</a></td>
<td>An optional application-specific object that contains information about the asynchronous operation.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/system.iasyncresult.asyncwaithandle" class="no-loc" data-linktype="absolute-path">AsyncWaitHandle</a></td>
<td>A <a href="/en-us/dotnet/api/system.threading.waithandle" class="no-loc" data-linktype="absolute-path">WaitHandle</a> that can be used to block application execution until the asynchronous operation completes.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/system.iasyncresult.completedsynchronously" class="no-loc" data-linktype="absolute-path">CompletedSynchronously</a></td>
<td>A value that indicates whether the asynchronous operation completed on the thread used to call <code>BeginOperationName</code> instead of completing on a separate <a href="/en-us/dotnet/api/system.threading.threadpool" class="no-loc" data-linktype="absolute-path">ThreadPool</a> thread.</td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/system.iasyncresult.iscompleted" class="no-loc" data-linktype="absolute-path">IsCompleted</a></td>
<td>A value that indicates whether the asynchronous operation has completed.</td>
</tr>
</tbody></table>

A ```BeginOperationName``` method takes any parameters declared in the signature of the synchronous version of the method that are passed by value or by reference. Any out parameters are not part of the ```BeginOperationName``` method signature. The ```BeginOperationName``` method signature also includes two additional parameters. The first of these defines an AsyncCallback delegate that references a method that is called when the asynchronous operation completes. The caller can specify ```null``` (Nothing in Visual Basic) if it does not want a method invoked when the operation completes. The second additional parameter is a user-defined object. This object can be used to pass application-specific state information to the method invoked when the asynchronous operation completes. If a ```BeginOperationName``` method takes additional operation-specific parameters, such as a byte array to store bytes read from a file, the AsyncCallback and application state object are the last parameters in the ```BeginOperationName``` method signature.

 ```BeginOperationName``` returns control to the calling thread immediately. If the ```BeginOperationName``` method throws exceptions, the exceptions are thrown before the asynchronous operation is started. If the ```BeginOperationName``` method throws exceptions, the callback method is not invoked.

## Ending an Asynchronous Operation

The ```EndOperationName``` method ends asynchronous operation OperationName. The return value of the ```EndOperationName``` method is the same type returned by its synchronous counterpart and is specific to the asynchronous operation. For example, the EndRead method returns the number of bytes read from a FileStream and the EndGetHostByName method returns an IPHostEntry object that contains information about a host computer. The ```EndOperationName``` method takes any out or ref parameters declared in the signature of the synchronous version of the method. In addition to the parameters from the synchronous method, the ```EndOperationName``` method also includes an IAsyncResult parameter. Callers must pass the instance returned by the corresponding call to ```BeginOperationName```.

If the asynchronous operation represented by the IAsyncResult object has not completed when ```EndOperationName``` is called, ```EndOperationName``` blocks the calling thread until the asynchronous operation is complete. Exceptions thrown by the asynchronous operation are thrown from the ```EndOperationName``` method. The effect of calling the ```EndOperationName``` method multiple times with the same IAsyncResult is not defined. Likewise, calling the ```EndOperationName``` method with an IAsyncResult that was not returned by the related Begin method is also not defined.

> Note
For either of the undefined scenarios, implementers should consider throwing InvalidOperationException.

> Note
Implementers of this design pattern should notify the caller that the asynchronous operation completed by setting IsCompleted to true, calling the asynchronous callback method (if one was specified) and signaling the AsyncWaitHandle.

An asynchronous operation is an operation that is carried out asynchronously.

- Call ```EndOperationName``` from the application’s main thread, blocking application execution until the operation is complete. For an example that illustrates this technique, see Blocking Application Execution by Ending an Async Operation.

- Use the AsyncWaitHandle to block application execution until one or more operations are complete. For an example that illustrates this technique, see Blocking Application Execution Using an AsyncWaitHandle.

Applications that do not need to block while the asynchronous operation completes can use one of the following approaches:

- Poll for operation completion status by checking the IsCompleted property periodically and calling ```EndOperationName``` when the operation is complete. For an example that illustrates this technique, see Polling for the Status of an Asynchronous Operation.

- Use an AsyncCallback delegate to specify a method to be invoked when the operation is complete. For an example that illustrates this technique, see Using an AsyncCallback Delegate to End an Asynchronous Operation.

## See also

- Event-based Asynchronous Pattern (EAP)

- Calling Synchronous Methods Asynchronously

- Using an AsyncCallback Delegate and State Object

Ref: [Asynchronous Programming Model (APM)](https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/asynchronous-programming-model-apm)