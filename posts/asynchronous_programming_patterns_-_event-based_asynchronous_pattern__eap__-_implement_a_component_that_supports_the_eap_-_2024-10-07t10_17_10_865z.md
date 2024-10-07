---
title: Asynchronous programming patterns - Event-based asynchronous pattern (EAP) - Implement a component that supports the EAP
published: true
date: 2024-10-07 10:17:10
tags: Summary, .Net, AdvancedProgramming
description: If you are writing a class with some operations that may incur noticeable delays, consider giving it asynchronous functionality by implementing the Event-based Asynchronous Pattern.
image:
---

## In this article

If you are writing a class with some operations that may incur noticeable delays, consider giving it asynchronous functionality by implementing the Event-based Asynchronous Pattern.

How to create a component that implements the Event-based Asynchronous Pattern.

If you want to test whether a large number is prime, you will need to complete the form below.

Tasks illustrated in this walkthrough include:

- Creating the Component

- Defining Public Asynchronous Events and Delegates

- Defining Private Delegates

- Implementing Public Events

- Implementing the Completion Method

- Implementing the Worker Methods

- Implementing Start and Cancel Methods

To copy the code in this topic as a single listing, see How to: Implement a Client of the Event-based Asynchronous Pattern.

## Creating the Component

The first step is to create the component that will implement the Event-based Asynchronous Pattern.

### To create the component

- Create a class called ```PrimeNumberCalculator``` that inherits from Component.

## Defining Public Asynchronous Events and Delegates

Your component communicates to clients using events. The MethodNameCompleted event alerts clients to the completion of an asynchronous task, and the MethodNameProgressChanged event informs clients of the progress of an asynchronous task.

### To define asynchronous events for clients of your component:

- Import the System.Threading and System.Collections.Specialized namespaces at the top of your file.

```csharp
using System;
using System.Collections;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Globalization;
using System.Threading;
using System.Windows.Forms;
```

- Before the ```PrimeNumberCalculator``` class definition, declare delegates for progress and completion events.

```csharp
public delegate void ProgressChangedEventHandler(
    ProgressChangedEventArgs e);

public delegate void CalculatePrimeCompletedEventHandler(
    object sender,
    CalculatePrimeCompletedEventArgs e);
```

- In the ```PrimeNumberCalculator``` class definition, declare events for reporting progress and completion to clients.
```csharp
public event ProgressChangedEventHandler ProgressChanged;
public event CalculatePrimeCompletedEventHandler CalculatePrimeCompleted;
```

- After the ```PrimeNumberCalculator``` class definition, derive the ```CalculatePrimeCompletedEventArgs``` class for reporting the outcome of each calculation to the client's event handler for the ```CalculatePrimeCompleted```.event. In addition to the ```AsyncCompletedEventArgs``` properties, this class enables the client to determine what number was tested, whether it is prime, and what the first divisor is if it is not prime.

```csharp
public class CalculatePrimeCompletedEventArgs :
    AsyncCompletedEventArgs
{
    private int numberToTestValue = 0;
    private int firstDivisorValue = 1;
    private bool isPrimeValue;

    public CalculatePrimeCompletedEventArgs(
        int numberToTest,
        int firstDivisor,
        bool isPrime,
        Exception e,
        bool canceled,
        object state) : base(e, canceled, state)
    {
        this.numberToTestValue = numberToTest;
        this.firstDivisorValue = firstDivisor;
        this.isPrimeValue = isPrime;
    }

    public int NumberToTest
    {
        get
        {
            // Raise an exception if the operation failed or
            // was canceled.
            RaiseExceptionIfNecessary();

            // If the operation was successful, return the
            // property value.
            return numberToTestValue;
        }
    }

    public int FirstDivisor
    {
        get
        {
            // Raise an exception if the operation failed or
            // was canceled.
            RaiseExceptionIfNecessary();

            // If the operation was successful, return the
            // property value.
            return firstDivisorValue;
        }
    }

    public bool IsPrime
    {
        get
        {
            // Raise an exception if the operation failed or
            // was canceled.
            RaiseExceptionIfNecessary();

            // If the operation was successful, return the
            // property value.
            return isPrimeValue;
        }
    }
}
```

## Checkpoint 1

At this point, you can build the component.

### To test your component

- Compile the component.
You will receive two compiler warnings:
```console
warning CS0067: The event 'AsynchronousPatternExample.PrimeNumberCalculator.ProgressChanged' is never used  
warning CS0067: The event 'AsynchronousPatternExample.PrimeNumberCalculator.CalculatePrimeCompleted' is never used
```
These warnings will be cleared in the next section.


## Defining Private Delegates

The asynchronous aspects of the ```PrimeNumberCalculator``` component are implemented internally with a special delegate known as a SendOrPostCallback. A SendOrPostCallback represents a callback method that executes on a ThreadPool thread. The callback method must have a signature that takes a single parameter of type Object, which means you will need to pass state among delegates in a wrapper class. For more information, see SendOrPostCallback.

### To implement your component's internal asynchronous behavior:

- Declare and create the SendOrPostCallback delegates in the ```PrimeNumberCalculator``` class. Create the SendOrPostCallback objects in a utility method called ```InitializeDelegates```.
You will need two delegates: one for reporting progress to the client, and one for reporting completion to the client.

```csharp
private SendOrPostCallback onProgressReportDelegate;
private SendOrPostCallback onCompletedDelegate;
```


```csharp
protected virtual void InitializeDelegates()
{
    onProgressReportDelegate =
        new SendOrPostCallback(ReportProgress);
    onCompletedDelegate =
        new SendOrPostCallback(CalculateCompleted);
}
```

- Call the ```InitializeDelegates``` method in your component's constructor.


```csharp
public PrimeNumberCalculator()
{
    InitializeComponent();

    InitializeDelegates();
}
```

- Declare a delegate in the ```PrimeNumberCalculator``` class that handles the actual work to be done asynchronously. This delegate wraps the worker method that tests whether a number is prime. The delegate takes an AsyncOperation parameter, which will be used to track the lifetime of the asynchronous operation.

```csharp
private delegate void WorkerEventHandler(
    int numberToCheck,
    AsyncOperation asyncOp);
```

- Create a collection for managing lifetimes of pending asynchronous operations. The client needs a way to track operations as they are executed and completed, and this tracking is done by requiring the client to pass a unique token, or task ID, when the client makes the call to the asynchronous method. The ```PrimeNumberCalculator``` component must keep track of each call by associating the task ID with its corresponding invocation. If the client passes a task ID that is not unique, the ```PrimeNumberCalculator``` component must raise an exception.
The ```PrimeNumberCalculator``` component keeps track of task ID by using a special collection class called a HybridDictionary. In the class definition, create a HybridDictionary called ```userStateToLifetime```.

```csharp
private HybridDictionary userStateToLifetime =
    new HybridDictionary();
```

## Implementing Public Events

Components that implement the Event-based Asynchronous Pattern communicate to clients using events. These events are invoked on the proper thread with the help of the AsyncOperation class.

### To raise events to your component's clients:

- Implement public events for reporting to clients. You will need an event for reporting progress and one for reporting completion.

```csharp
// This method is invoked via the AsyncOperation object,
// so it is guaranteed to be executed on the correct thread.
private void CalculateCompleted(object operationState)
{
    CalculatePrimeCompletedEventArgs e =
        operationState as CalculatePrimeCompletedEventArgs;

    OnCalculatePrimeCompleted(e);
}

// This method is invoked via the AsyncOperation object,
// so it is guaranteed to be executed on the correct thread.
private void ReportProgress(object state)
{
    ProgressChangedEventArgs e =
        state as ProgressChangedEventArgs;

    OnProgressChanged(e);
}

protected void OnCalculatePrimeCompleted(
    CalculatePrimeCompletedEventArgs e)
{
    if (CalculatePrimeCompleted != null)
    {
        CalculatePrimeCompleted(this, e);
    }
}

protected void OnProgressChanged(ProgressChangedEventArgs e)
{
    if (ProgressChanged != null)
    {
        ProgressChanged(e);
    }
}
```

## Implementing the Completion Method

The completion delegate is the method that the underlying, free-threaded asynchronous behavior will invoke when the asynchronous operation ends by successful completion, error, or cancellation.

This method ends the lifetime of an asynchronous operation by calling the PostOperationCompleted method on the corresponding AsyncOperation.

The ```CompletionMethod``` signature must hold all state necessary to describe the outcome of the asynchronous operation. It holds state for the number that was tested by this particular asynchronous operation, whether the number is prime, and the value of its first divisor if it is not a prime number. It also holds state describing any exception that occurred, and the AsyncOperation corresponding to this particular task.

### To complete an asynchronous operation:

- Implement the completion method. It takes six parameters, which it uses to populate a ```CalculatePrimeCompletedEventArgs``` that is returned to the client through the client's ```CalculatePrimeCompletedEventHandler```. It removes the client's task ID token from the internal collection, and it ends the asynchronous operation's lifetime with a call to PostOperationCompleted. The AsyncOperation marshals the call to the thread or context that is appropriate for the application model.

```csharp
// This is the method that the underlying, free-threaded
// asynchronous behavior will invoke.  This will happen on
// an arbitrary thread.
private void CompletionMethod(
    int numberToTest,
    int firstDivisor,
    bool isPrime,
    Exception exception,
    bool canceled,
    AsyncOperation asyncOp )

{
    // If the task was not previously canceled,
    // remove the task from the lifetime collection.
    if (!canceled)
    {
        lock (userStateToLifetime.SyncRoot)
        {
            userStateToLifetime.Remove(asyncOp.UserSuppliedState);
        }
    }

    // Package the results of the operation in a
    // CalculatePrimeCompletedEventArgs.
    CalculatePrimeCompletedEventArgs e =
        new CalculatePrimeCompletedEventArgs(
        numberToTest,
        firstDivisor,
        isPrime,
        exception,
        canceled,
        asyncOp.UserSuppliedState);

    // End the task. The asyncOp object is responsible
    // for marshaling the call.
    asyncOp.PostOperationCompleted(onCompletedDelegate, e);

    // Note that after the call to OperationCompleted,
    // asyncOp is no longer usable, and any attempt to use it
    // will cause an exception to be thrown.
}
```

## Checkpoint 2

At this point, you can build the component.

### To test your component

- Compile the component.
You will receive one compiler warning: 
```console
warning CS0169: The private field 'AsynchronousPatternExample.PrimeNumberCalculator.workerDelegate' is never used
```
This warning will be resolved in the next section.


## Implementing the Worker Methods

So far, you have implemented the supporting asynchronous code for the ```PrimeNumberCalculator``` component. Now you can implement the code that does the actual work. You will implement three methods: ```CalculateWorker```, ```BuildPrimeNumberList```, and ```IsPrime```. Together, ```BuildPrimeNumberList``` and ```IsPrime``` comprise a well-known algorithm called the Sieve of Eratosthenes, which determines if a number is prime by finding all the prime numbers up to the square root of the test number. If no divisors are found by that point, the test number is prime.

This example shows how to write a component that remembers all the prime numbers discovered by invocations for different test numbers.

The ```CalculateWorker``` method is wrapped in a delegate and is invoked asynchronously with a call to ```BeginInvoke```.

> Note
Progress reporting is implemented in the ```BuildPrimeNumberList``` method. On fast computers, ```ProgressChanged``` events can be raised in rapid succession. The client thread, on which these events are raised, must be able to handle this situation. User interface code may be flooded with messages and unable to keep up, resulting in unresponsiveness. For an example user interface that handles this situation, see How to: Implement a Client of the Event-based Asynchronous Pattern.

### To execute the prime number calculation asynchronously:

- Implement the ```TaskCanceled``` utility method. This checks the task lifetime collection for the given task ID, and returns ```true``` if the task ID is not found.

```csharp
// Utility method for determining if a
// task has been canceled.
private bool TaskCanceled(object taskId)
{
    return( userStateToLifetime[taskId] == null );
}
```

- Implement the ```CalculateWorker``` method. It takes two parameters: a number to test, and an AsyncOperation.

```csharp
// This method performs the actual prime number computation.
// It is executed on the worker thread.
private void CalculateWorker(
    int numberToTest,
    AsyncOperation asyncOp)
{
    bool isPrime = false;
    int firstDivisor = 1;
    Exception e = null;

    // Check that the task is still active.
    // The operation may have been canceled before
    // the thread was scheduled.
    if (!TaskCanceled(asyncOp.UserSuppliedState))
    {
        try
        {
            // Find all the prime numbers up to
            // the square root of numberToTest.
            ArrayList primes = BuildPrimeNumberList(
                numberToTest,
                asyncOp);

            // Now we have a list of primes less than
            // numberToTest.
            isPrime = IsPrime(
                primes,
                numberToTest,
                out firstDivisor);
        }
        catch (Exception ex)
        {
            e = ex;
        }
    }

    //CalculatePrimeState calcState = new CalculatePrimeState(
    //        numberToTest,
    //        firstDivisor,
    //        isPrime,
    //        e,
    //        TaskCanceled(asyncOp.UserSuppliedState),
    //        asyncOp);

    //this.CompletionMethod(calcState);

    this.CompletionMethod(
        numberToTest,
        firstDivisor,
        isPrime,
        e,
        TaskCanceled(asyncOp.UserSuppliedState),
        asyncOp);

    //completionMethodDelegate(calcState);
}
```

- Implement ```BuildPrimeNumberList```. It takes two parameters: the number to test, and an AsyncOperation. It uses the AsyncOperation to report progress and incremental results. This assures that the client's event handlers are called on the proper thread or context for the application model. When ```BuildPrimeNumberList``` finds a prime number, it reports this as an incremental result to the client's event handler for the ```ProgressChanged``` event. This requires a class derived from ProgressChangedEventArgs, called ```CalculatePrimeProgressChangedEventArgs```, which has one added property called ```LatestPrimeNumber```.
The ```BuildPrimeNumberList``` method also periodically calls the ```TaskCanceled``` method and exits if the method returns ```true```.

```csharp
// This method computes the list of prime numbers used by the
// IsPrime method.
private ArrayList BuildPrimeNumberList(
    int numberToTest,
    AsyncOperation asyncOp)
{
    ProgressChangedEventArgs e = null;
    ArrayList primes = new ArrayList();
    int firstDivisor;
    int n = 5;

    // Add the first prime numbers.
    primes.Add(2);
    primes.Add(3);

    // Do the work.
    while (n < numberToTest &&
           !TaskCanceled( asyncOp.UserSuppliedState ) )
    {
        if (IsPrime(primes, n, out firstDivisor))
        {
            // Report to the client that a prime was found.
            e = new CalculatePrimeProgressChangedEventArgs(
                n,
                (int)((float)n / (float)numberToTest * 100),
                asyncOp.UserSuppliedState);

            asyncOp.Post(this.onProgressReportDelegate, e);

            primes.Add(n);

            // Yield the rest of this time slice.
            Thread.Sleep(0);
        }

        // Skip even numbers.
        n += 2;
    }

    return primes;
}
```

- Implement ```IsPrime```. It takes three parameters: a list of known prime numbers, the number to test, and an output parameter for the first divisor found. Given the list of prime numbers, it determines if the test number is prime.

```csharp
// This method tests n for primality against the list of
// prime numbers contained in the primes parameter.
private bool IsPrime(
    ArrayList primes,
    int n,
    out int firstDivisor)
{
    bool foundDivisor = false;
    bool exceedsSquareRoot = false;

    int i = 0;
    int divisor = 0;
    firstDivisor = 1;

    // Stop the search if:
    // there are no more primes in the list,
    // there is a divisor of n in the list, or
    // there is a prime that is larger than
    // the square root of n.
    while (
        (i < primes.Count) &&
        !foundDivisor &&
        !exceedsSquareRoot)
    {
        // The divisor variable will be the smallest
        // prime number not yet tried.
        divisor = (int)primes[i++];

        // Determine whether the divisor is greater
        // than the square root of n.
        if (divisor * divisor > n)
        {
            exceedsSquareRoot = true;
        }
        // Determine whether the divisor is a factor of n.
        else if (n % divisor == 0)
        {
            firstDivisor = divisor;
            foundDivisor = true;
        }
    }

    return !foundDivisor;
}
```

- Derive ```CalculatePrimeProgressChangedEventArgs``` from ProgressChangedEventArgs. This class is necessary for reporting incremental results to the client's event handler for the ```ProgressChanged``` event. It has one added property called ```LatestPrimeNumber```.

```csharp
public class CalculatePrimeProgressChangedEventArgs :
        ProgressChangedEventArgs
{
    private int latestPrimeNumberValue = 1;

    public CalculatePrimeProgressChangedEventArgs(
        int latestPrime,
        int progressPercentage,
        object userToken) : base( progressPercentage, userToken )
    {
        this.latestPrimeNumberValue = latestPrime;
    }

    public int LatestPrimeNumber
    {
        get
        {
            return latestPrimeNumberValue;
        }
    }
}
```

## Checkpoint 3

At this point, you can build the component.

### To test your component

- Compile the component.
All that remains to be written are the methods to start and cancel asynchronous operations, ```CalculatePrimeAsync``` and ```CancelAsync```.

## Implementing the Start and Cancel Methods

You start the worker method on its own thread by calling ```BeginInvoke``` on the delegate that wraps it. To manage the lifetime of a particular asynchronous operation, you call the CreateOperation method on the AsyncOperationManager helper class. This returns an AsyncOperation, which marshals calls on the client's event handlers to the proper thread or context.

You can cancel a pending operation by calling PostCompleted on its corresponding AsyncOperation.

### To implement Start and Cancel functionality:

- Implement the ```CalculatePrimeAsync``` method. Make sure the client-supplied token (task ID) is unique with respect to all the tokens representing currently pending tasks. If the client passes in a non-unique token, ```CalculatePrimeAsync``` raises an exception. Otherwise, the token is added to the task ID collection.

```csharp
// This method starts an asynchronous calculation.
// First, it checks the supplied task ID for uniqueness.
// If taskId is unique, it creates a new WorkerEventHandler
// and calls its BeginInvoke method to start the calculation.
public virtual void CalculatePrimeAsync(
    int numberToTest,
    object taskId)
{
    // Create an AsyncOperation for taskId.
    AsyncOperation asyncOp =
        AsyncOperationManager.CreateOperation(taskId);

    // Multiple threads will access the task dictionary,
    // so it must be locked to serialize access.
    lock (userStateToLifetime.SyncRoot)
    {
        if (userStateToLifetime.Contains(taskId))
        {
            throw new ArgumentException(
                "Task ID parameter must be unique",
                "taskId");
        }

        userStateToLifetime[taskId] = asyncOp;
    }

    // Start the asynchronous operation.
    WorkerEventHandler workerDelegate = new WorkerEventHandler(CalculateWorker);
    workerDelegate.BeginInvoke(
        numberToTest,
        asyncOp,
        null,
        null);
}
```

- Implement the ```CancelAsync``` method. If the ```taskId``` parameter exists in the token collection, it is removed. This prevents canceled tasks that have not started from running. If the task is running, the ```BuildPrimeNumberList``` method exits when it detects that the task ID has been removed from the lifetime collection.

```csharp
// This method cancels a pending asynchronous operation.
public void CancelAsync(object taskId)
{
    AsyncOperation asyncOp = userStateToLifetime[taskId] as AsyncOperation;
    if (asyncOp != null)
    {
        lock (userStateToLifetime.SyncRoot)
        {
            userStateToLifetime.Remove(taskId);
        }
    }
}
```

## Checkpoint 4

At this point, you can build the component.

### To test your component

- Compile the component.

The ```PrimeNumberCalculator``` component is now complete and ready to use.

For an example client that uses the ```PrimeNumberCalculator``` component, see How to: Implement a Client of the Event-based Asynchronous Pattern.

## Next Steps

You can fill out this example by writing ```CalculatePrime```, the synchronous equivalent of ```CalculatePrimeAsync``` method. This will make the ```PrimeNumberCalculator``` component fully compliant with the Event-based Asynchronous Pattern.

You can improve this example by retaining the list of all the prime numbers discovered by various invocations for different test numbers. Using this approach, each task will benefit from the work done by previous tasks. Be careful to protect this list with ```lock``` regions, so access to the list by different threads is serialized.

You can also improve this example by testing for trivial divisors, like 2, 3, and 5.

## See also

- How to: Run an Operation in the Background

- Event-based Asynchronous Pattern Overview

- Event-based Asynchronous Pattern (EAP)

Ref: [How to: Implement a Component That Supports the Event-based Asynchronous Pattern](https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/component-that-supports-the-event-based-asynchronous-pattern)