---
title: Asynchronous programming patterns - Asynchronous programming model (APM) - Asynchronous programming using delegates - Call synchronous methods asynchronously
published: true
date: 2024-10-07 10:18:03
tags: Summary, .Net, AdvancedProgramming
description: .NET enables you to call any method asynchronously. To do this, you define a delegate with the same signature as the method you want to call. The common language runtime automatically defines BeginInvoke and EndInvoke methods for this delegate, with the appropriate signatures.
image:
---

## In this article

.NET enables you to call any method asynchronously. To do this, you define a delegate with the same signature as the method you want to call. The common language runtime automatically defines ```BeginInvoke``` and ```EndInvoke``` methods for this delegate, with the appropriate signatures.

> Note
Asynchronous delegate calls, specifically the ```BeginInvoke``` and ```EndInvoke``` methods, are not supported in the .NET Compact Framework.

The ```BeginInvoke``` method initiates the asynchronous call. It has the same parameters as the method that you want to execute asynchronously, plus two additional optional parameters. The first parameter is an AsyncCallback delegate that references a method to be called when the asynchronous call completes. The second parameter is a user-defined object that passes information into the callback method. ```BeginInvoke``` returns immediately and does not wait for the asynchronous call to complete. ```BeginInvoke``` returns an IAsyncResult, which can be used to monitor the progress of the asynchronous call.

The ```EndInvoke``` method retrieves the results of the asynchronous call. It can be called any time after ```BeginInvoke```. If the asynchronous call has not completed, ```EndInvoke``` blocks the calling thread until it completes. The parameters of ```EndInvoke``` include the ```out``` and ```ref``` parameters (```<Out> ByRef``` and ```ByRef``` in Visual Basic) of the method that you want to execute asynchronously, plus the IAsyncResult returned by ```BeginInvoke```.

> Note
The IntelliSense feature in Visual Studio displays the parameters of ```BeginInvoke``` and ```EndInvoke```. If you're not using Visual Studio or a similar tool, or if you're using C# with Visual Studio, see Asynchronous Programming Model (APM) for a description of the parameters defined for these methods.

The code examples in this topic demonstrate four common ways to use ```BeginInvoke``` and ```EndInvoke``` to make asynchronous calls. After calling ```BeginInvoke``` you can do the following:

- Do some work and then call ```EndInvoke``` to block until the call completes.

- Obtain a WaitHandle using the IAsyncResult.AsyncWaitHandle property, use its WaitOne method to block execution until the WaitHandle is signaled, and then call ```EndInvoke```.

- Poll the IAsyncResult returned by ```BeginInvoke``` to determine when the asynchronous call has completed, and then call ```EndInvoke```.

- Pass a delegate for a callback method to ```BeginInvoke```. The method is executed on a ThreadPool thread when the asynchronous call completes. The callback method calls ```EndInvoke```.

> Important
No matter which technique you use, always call ```EndInvoke``` to complete your asynchronous call.

## Defining the Test Method and Asynchronous Delegate

The code examples that follow demonstrate various ways of calling the same long-running method, ```TestMethod```, asynchronously. The ```TestMethod``` method displays a console message to show that it has begun processing, sleeps for a few seconds, and then ends. ```TestMethod``` has an ```out``` parameter to demonstrate the way such parameters are added to the signatures of ```BeginInvoke``` and ```EndInvoke```. You can handle ```ref``` parameters similarly.

The following code example shows the definition of ```TestMethod``` and the delegate named ```AsyncMethodCaller``` that can be used to call ```TestMethod``` asynchronously. To compile the code examples, you must include the definitions for ```TestMethod``` and the ```AsyncMethodCaller``` delegate.

```csharp
using System;
using System.Threading;

namespace Examples.AdvancedProgramming.AsynchronousOperations
{
    public class AsyncDemo
    {
        // The method to be executed asynchronously.
        public string TestMethod(int callDuration, out int threadId)
        {
            Console.WriteLine("Test method begins.");
            Thread.Sleep(callDuration);
            threadId = Thread.CurrentThread.ManagedThreadId;
            return String.Format("My call time was {0}.", callDuration.ToString());
        }
    }
    // The delegate must have the same signature as the method
    // it will call asynchronously.
    public delegate string AsyncMethodCaller(int callDuration, out int threadId);
}
```

## Waiting for an Asynchronous Call with ```EndInvoke```

The simplest way to execute a method asynchronously is to start executing the method by calling the delegate's ```BeginInvoke``` method, do some work on the main thread, and then call the delegate's ```EndInvoke``` method. ```EndInvoke``` might block the calling thread because it does not return until the asynchronous call completes. This is a good technique to use with file or network operations.

> Important
Because ```EndInvoke``` might block, you should never call it from threads that service the user interface.

```csharp
using System;
using System.Threading;

namespace Examples.AdvancedProgramming.AsynchronousOperations
{
    public class AsyncMain
    {
        public static void Main()
        {
            // The asynchronous method puts the thread id here.
            int threadId;

            // Create an instance of the test class.
            AsyncDemo ad = new AsyncDemo();

            // Create the delegate.
            AsyncMethodCaller caller = new AsyncMethodCaller(ad.TestMethod);

            // Initiate the asynchronous call.
            IAsyncResult result = caller.BeginInvoke(3000,
                out threadId, null, null);

            Thread.Sleep(0);
            Console.WriteLine("Main thread {0} does some work.",
                Thread.CurrentThread.ManagedThreadId);

            // Call EndInvoke to wait for the asynchronous call to complete,
            // and to retrieve the results.
            string returnValue = caller.EndInvoke(out threadId, result);

            Console.WriteLine("The call executed on thread {0}, with return value \"{1}\".",
                threadId, returnValue);
        }
    }
}

/* This example produces output similar to the following:

Main thread 1 does some work.
Test method begins.
The call executed on thread 3, with return value "My call time was 3000.".
 */
```

## Waiting for an Asynchronous Call with WaitHandle

You can obtain a WaitHandle by using the AsyncWaitHandle property of the IAsyncResult returned by ```BeginInvoke```. The WaitHandle is signaled when the asynchronous call completes, and you can wait for it by calling the WaitOne method.

If you use a WaitHandle, you can perform additional processing before or after the asynchronous call completes, but before calling ```EndInvoke``` to retrieve the results.

> Note
The wait handle is not closed automatically when you call ```EndInvoke```. If you release all references to the wait handle, system resources are freed when garbage collection reclaims the wait handle. To free the system resources as soon as you are finished using the wait handle, dispose of it by calling the WaitHandle.Close method. Garbage collection works more efficiently when disposable objects are explicitly disposed.

```csharp
using System;
using System.Threading;

namespace Examples.AdvancedProgramming.AsynchronousOperations
{
    public class AsyncMain
    {
        static void Main()
        {
            // The asynchronous method puts the thread id here.
            int threadId;

            // Create an instance of the test class.
            AsyncDemo ad = new AsyncDemo();

            // Create the delegate.
            AsyncMethodCaller caller = new AsyncMethodCaller(ad.TestMethod);

            // Initiate the asynchronous call.
            IAsyncResult result = caller.BeginInvoke(3000,
                out threadId, null, null);

            Thread.Sleep(0);
            Console.WriteLine("Main thread {0} does some work.",
                Thread.CurrentThread.ManagedThreadId);

            // Wait for the WaitHandle to become signaled.
            result.AsyncWaitHandle.WaitOne();

            // Perform additional processing here.
            // Call EndInvoke to retrieve the results.
            string returnValue = caller.EndInvoke(out threadId, result);

            // Close the wait handle.
            result.AsyncWaitHandle.Close();

            Console.WriteLine("The call executed on thread {0}, with return value \"{1}\".",
                threadId, returnValue);
        }
    }
}

/* This example produces output similar to the following:

Main thread 1 does some work.
Test method begins.
The call executed on thread 3, with return value "My call time was 3000.".
 */
```

## Polling for Asynchronous Call Completion

You can use the IsCompleted property of the IAsyncResult returned by ```BeginInvoke``` to discover when the asynchronous call completes. You might do this when making the asynchronous call from a thread that services the user interface. Polling for completion allows the calling thread to continue executing while the asynchronous call executes on a ThreadPool thread.

```csharp
using System;
using System.Threading;

namespace Examples.AdvancedProgramming.AsynchronousOperations
{
    public class AsyncMain
    {
        static void Main() {
            // The asynchronous method puts the thread id here.
            int threadId;

            // Create an instance of the test class.
            AsyncDemo ad = new AsyncDemo();

            // Create the delegate.
            AsyncMethodCaller caller = new AsyncMethodCaller(ad.TestMethod);

            // Initiate the asynchronous call.
            IAsyncResult result = caller.BeginInvoke(3000,
                out threadId, null, null);

            // Poll while simulating work.
            while(result.IsCompleted == false) {
                Thread.Sleep(250);
                Console.Write(".");
            }

            // Call EndInvoke to retrieve the results.
            string returnValue = caller.EndInvoke(out threadId, result);

            Console.WriteLine("\nThe call executed on thread {0}, with return value \"{1}\".",
                threadId, returnValue);
        }
    }
}

/* This example produces output similar to the following:

Test method begins.
.............
The call executed on thread 3, with return value "My call time was 3000.".
 */
```

## Executing a Callback Method When an Asynchronous Call Completes

asynchronous calls are executed on the thread that initiates the call.

To use a callback method, you must pass ```BeginInvoke``` an AsyncCallback delegate that represents the callback method. You can also pass an object that contains information to be used by the callback method. In the callback method, you can cast the IAsyncResult, which is the only parameter of the callback method, to an AsyncResult object. You can then use the AsyncResult.AsyncDelegate property to get the delegate that was used to initiate the call so that you can call ```EndInvoke```.

Notes on the example:

- The ```threadId``` parameter of ```TestMethod``` is an ```out``` parameter (```[<Out> ByRef``` in Visual Basic), so its input value is never used by ```TestMethod```. A dummy variable is passed to the ```BeginInvoke``` call. If the ```threadId``` parameter were a ```ref``` parameter (ByRef in Visual Basic), the variable would have to be a class-level field so that it could be passed to both ```BeginInvoke``` and ```EndInvoke```.

- The state information that is passed to ```BeginInvoke``` is a format string, which the callback method uses to format an output message. Because it is passed as type Object, the state information must be cast to its proper type before it can be used.

- The callback is made on a ThreadPool thread. ThreadPool threads are background threads, which do not keep the application running if the main thread ends, so the main thread of the example has to sleep long enough for the callback to finish.

```csharp
using System;
using System.Threading;
using System.Runtime.Remoting.Messaging;

namespace Examples.AdvancedProgramming.AsynchronousOperations
{
    public class AsyncMain
    {
        static void Main()
        {
            // Create an instance of the test class.
            AsyncDemo ad = new AsyncDemo();

            // Create the delegate.
            AsyncMethodCaller caller = new AsyncMethodCaller(ad.TestMethod);

            // The threadId parameter of TestMethod is an out parameter, so
            // its input value is never used by TestMethod. Therefore, a dummy
            // variable can be passed to the BeginInvoke call. If the threadId
            // parameter were a ref parameter, it would have to be a class-
            // level field so that it could be passed to both BeginInvoke and
            // EndInvoke.
            int dummy = 0;

            // Initiate the asynchronous call, passing three seconds (3000 ms)
            // for the callDuration parameter of TestMethod; a dummy variable
            // for the out parameter (threadId); the callback delegate; and
            // state information that can be retrieved by the callback method.
            // In this case, the state information is a string that can be used
            // to format a console message.
            IAsyncResult result = caller.BeginInvoke(3000,
                out dummy,
                new AsyncCallback(CallbackMethod),
                "The call executed on thread {0}, with return value \"{1}\".");

            Console.WriteLine("The main thread {0} continues to execute...",
                Thread.CurrentThread.ManagedThreadId);

            // The callback is made on a ThreadPool thread. ThreadPool threads
            // are background threads, which do not keep the application running
            // if the main thread ends. Comment out the next line to demonstrate
            // this.
            Thread.Sleep(4000);

            Console.WriteLine("The main thread ends.");
        }

        // The callback method must have the same signature as the
        // AsyncCallback delegate.
        static void CallbackMethod(IAsyncResult ar)
        {
            // Retrieve the delegate.
            AsyncResult result = (AsyncResult) ar;
            AsyncMethodCaller caller = (AsyncMethodCaller) result.AsyncDelegate;

            // Retrieve the format string that was passed as state
            // information.
            string formatString = (string) ar.AsyncState;

            // Define a variable to receive the value of the out parameter.
            // If the parameter were ref rather than out then it would have to
            // be a class-level field so it could also be passed to BeginInvoke.
            int threadId = 0;

            // Call EndInvoke to retrieve the results.
            string returnValue = caller.EndInvoke(out threadId, ar);

            // Use the format string to format the output message.
            Console.WriteLine(formatString, threadId, returnValue);
        }
    }
}

/* This example produces output similar to the following:

The main thread 1 continues to execute...
Test method begins.
The call executed on thread 3, with return value "My call time was 3000.".
The main thread ends.
 */
```

## See also

- Delegate

- Event-based Asynchronous Pattern (EAP)

Ref: [Calling Synchronous Methods Asynchronously](https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/calling-synchronous-methods-asynchronously)