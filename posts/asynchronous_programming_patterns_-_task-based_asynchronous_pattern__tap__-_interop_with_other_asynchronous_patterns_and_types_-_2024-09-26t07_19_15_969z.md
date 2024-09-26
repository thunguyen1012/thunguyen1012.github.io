---
title: Asynchronous programming patterns - Task-based asynchronous pattern (TAP) - Interop with other asynchronous patterns and types
published: true
date: 2024-09-26 07:19:15
tags: Summary, .Net, AdvancedProgramming
description: A brief history of asynchronous patterns in .NET:
image:
---

## In this article

A brief history of asynchronous patterns in .NET:

- .NET Framework 1.0 introduced the IAsyncResult pattern, otherwise known as the Asynchronous Programming Model (APM), or the ```Begin/End``` pattern.

- .NET Framework 2.0 added the Event-based Asynchronous Pattern (EAP).

- .NET Framework 4 introduced the Task-based Asynchronous Pattern (TAP), which supersedes both APM and EAP and provides the ability to easily build migration routines from the earlier patterns.

## Tasks and the Asynchronous Programming Model (APM)

### From APM to TAP

In this paper, we show how to implement the Asynchronous Programming Model (APM) as a TAP implementation in .NET Framework 4.

Consider the Stream class and its BeginRead and EndRead methods, which represent the APM counterpart to the synchronous Read method:

```csharp
public int Read(byte[] buffer, int offset, int count)
```

```csharp
public IAsyncResult BeginRead(byte[] buffer, int offset,
                              int count, AsyncCallback callback,
                              object state)
```


```csharp
public int EndRead(IAsyncResult asyncResult)
```


You can use the `TaskFactory<TResult>.FromAsync` method to implement a TAP wrapper for this operation as follows:

```csharp
public static Task<int> ReadAsync(this Stream stream,
                                  byte[] buffer, int offset,
                                  int count)
{
    if (stream == null)
       throw new ArgumentNullException("stream");

    return Task<int>.Factory.FromAsync(stream.BeginRead,
                                       stream.EndRead, buffer,
                                       offset, count, null);
}
```

This implementation is similar to the following:

```csharp
public static Task<int> ReadAsync(this Stream stream,
                                   byte [] buffer, int offset,
                                   int count)
 {
    if (stream == null)
        throw new ArgumentNullException("stream");

    var tcs = new TaskCompletionSource<int>();
    stream.BeginRead(buffer, offset, count, iar =>
                     {
                        try {
                           tcs.TrySetResult(stream.EndRead(iar));
                        }
                        catch(OperationCanceledException) {
                           tcs.TrySetCanceled();
                        }
                        catch(Exception exc) {
                           tcs.TrySetException(exc);
                        }
                     }, null);
    return tcs.Task;
}
```


### From TAP to APM

In this article, I'll show you how to take the APM pattern and use it to compose tasks.

```csharp
public static IAsyncResult AsApm<T>(this Task<T> task,
                                    AsyncCallback callback,
                                    object state)
{
    if (task == null)
        throw new ArgumentNullException("task");

    var tcs = new TaskCompletionSource<T>(state);
    task.ContinueWith(t =>
                      {
                         if (t.IsFaulted)
                            tcs.TrySetException(t.Exception.InnerExceptions);
                         else if (t.IsCanceled)
                            tcs.TrySetCanceled();
                         else
                            tcs.TrySetResult(t.Result);

                         if (callback != null)
                            callback(tcs.Task);
                      }, TaskScheduler.Default);
    return tcs.Task;
}
```


Now, consider a case where you have the following TAP implementation:

```csharp
public static Task<String> DownloadStringAsync(Uri url)
```


and you want to provide this APM implementation:

```csharp
public IAsyncResult BeginDownloadString(Uri url,
                                        AsyncCallback callback,
                                        object state)
```


```csharp
public string EndDownloadString(IAsyncResult asyncResult)
```


The following example demonstrates one migration to APM:

```csharp
public IAsyncResult BeginDownloadString(Uri url,
                                        AsyncCallback callback,
                                        object state)
{
   return DownloadStringAsync(url).AsApm(callback, state);
}

public string EndDownloadString(IAsyncResult asyncResult)
{
   return ((Task<string>)asyncResult).Result;
}
```


## Tasks and the Event-based Asynchronous Pattern (EAP)

Wrapping an Event-based Asynchronous Pattern (EAP) implementation is more involved than wrapping an APM pattern, because the EAP pattern has more variation and less structure than the APM pattern.  To demonstrate, the following code wraps the ```DownloadStringAsync``` method.  ```DownloadStringAsync``` accepts a URI, raises the ```DownloadProgressChanged``` event while downloading in order to report multiple statistics on progress, and raises the ```DownloadStringCompleted``` event when it's done.  The final result is a string that contains the contents of the page at the specified URI.

```csharp
public static Task<string> DownloadStringAsync(Uri url)
 {
     var tcs = new TaskCompletionSource<string>();
     var wc = new WebClient();
     wc.DownloadStringCompleted += (s,e) =>
         {
             if (e.Error != null)
                tcs.TrySetException(e.Error);
             else if (e.Cancelled)
                tcs.TrySetCanceled();
             else
                tcs.TrySetResult(e.Result);
         };
     wc.DownloadStringAsync(url);
     return tcs.Task;
}
```


## Tasks and Wait Handles

### From Wait Handles to TAP

asynchronous notifications on a wait handle can be achieved using the `WaitPool` class and the `ThreadHandle.RegisterWaitForSingleObject` method.

```csharp
public static Task WaitOneAsync(this WaitHandle waitHandle)
{
    if (waitHandle == null)
        throw new ArgumentNullException("waitHandle");

    var tcs = new TaskCompletionSource<bool>();
    var rwh = ThreadPool.RegisterWaitForSingleObject(waitHandle,
        delegate { tcs.TrySetResult(true); }, null, -1, true);
    var t = tcs.Task;
    t.ContinueWith( (antecedent) => rwh.Unregister(null));
    return t;
}
```


In this article, I'm going to show you how to use the WaitHandle method in an asynchronous manner.

```csharp
static int N = 3;

static SemaphoreSlim m_throttle = new SemaphoreSlim(N, N);

static async Task DoOperation()
{
    await m_throttle.WaitAsync();
    // do work
    m_throttle.Release();
}
```


In this tutorial, you will learn how to build an asynchronous semaphore that does not rely on wait handles.

### From TAP to Wait Handles

In our previous post on the IAsyncResult method, we looked at how to get a wait handle for a task.

```csharp
WaitHandle wh = ((IAsyncResult)task).AsyncWaitHandle;
```


## See also

- Task-based Asynchronous Pattern (TAP)

- Implementing the Task-based Asynchronous Pattern

- Consuming the Task-based Asynchronous Pattern

Ref: [Interop with Other Asynchronous Patterns and Types](https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/interop-with-other-asynchronous-patterns-and-types)