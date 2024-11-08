---
title: Parallel programming - Task Parallel Library (TPL) - Dataflow - Dataflow
published: true
date: 2024-11-08 09:45:10
tags: Summary, .Net, AdvancedProgramming
description: The Task Parallel Library (TPL) provides dataflow components to help increase the robustness of concurrency-enabled applications. These dataflow components are collectively referred to as the TPL Dataflow Library. This dataflow model promotes actor-based programming by providing in-process message passing for coarse-grained dataflow and pipelining tasks. The dataflow components build on the types and scheduling infrastructure of the TPL and integrate with the C#, Visual Basic, and F# language support for asynchronous programming. These dataflow components are useful when you have multiple operations that must communicate with one another asynchronously or when you want to process data as it becomes available. For example, consider an application that processes image data from a web camera. By using the dataflow model, the application can process image frames as they become available. If the application enhances image frames, for example, by performing light correction or red-eye reduction, you can create a pipeline of dataflow components. Each stage of the pipeline might use more coarse-grained parallelism functionality, such as the functionality that is provided by the TPL, to transform the image.
image:
---

## In this article

The Task Parallel Library (TPL) provides dataflow components to help increase the robustness of concurrency-enabled applications.

The TPL Dataflow Library (TPL) is a collection of libraries designed to simplify the development and deployment of dataflow-based applications.

> Note
The TPL Dataflow Library (the ```System.Threading.Tasks.Dataflow``` namespace) is not distributed with .NET. To install the ```System.Threading.Tasks.Dataflow``` namespace in Visual Studio, open your project, choose Manage NuGet Packages from the Project menu, and search online for the ```System.Threading.Tasks.Dataflow``` package. Alternatively, to install it using the .NET Core CLI, run ```dotnet add package System.Threading.Tasks.Dataflow```.

## Programming Model

The TPL Dataflow Library provides a foundation for message passing and parallelizing CPU-intensive and I/O-intensive applications that have high throughput and low latency. The TPL Dataflow Library provides a foundation for message passing and parallelizing CPU-intensive and I/O-intensive applications that have high throughput

### Sources and Targets

The TPL Dataflow Library consists of dataflow blocks, which are data structures that buffer and process data. The TPL defines three kinds of dataflow blocks: source blocks, target blocks, and propagator blocks. A source block acts as a source of data and can be read from. A target block acts as a receiver of data and can be written to. A propagator block acts as both a source block and a target block, and can be read from and written to. The TPL defines the ```System.Threading.Tasks.Dataflow.ISourceBlock<TOutput>``` interface to represent sources, ```System.Threading.Tasks.Dataflow.ITargetBlock<TInput>``` to represent targets, and ```System.Threading.Tasks.Dataflow.IPropagatorBlock<TInput,TOutput>``` to represent propagators. `IPropagatorBlock<TInput,TOutput>` inherits from both `ISourceBlock<TOutput>`, and `ITargetBlock<TInput>`.

The TPL Dataflow Library provides several predefined dataflow block types that implement the `ISourceBlock<TOutput>`, `ITargetBlock<TInput>`, and `IPropagatorBlock<TInput,TOutput>` interfaces. These dataflow block types are described in this document in the section Predefined Dataflow Block Types.

### Connecting Blocks

You can connect dataflow blocks to form pipelines, which are linear sequences of dataflow blocks, or networks, which are graphs of dataflow blocks. A pipeline is one form of network. In a pipeline or network, sources asynchronously propagate data to targets as that data becomes available. The `ISourceBlock<TOutput>.LinkTo` method links a source dataflow block to a target block. A source can be linked to zero or more targets; targets can be linked from zero or more sources. You can add or remove dataflow blocks to or from a pipeline or network concurrently. The predefined dataflow block types handle all thread-safety aspects of linking and unlinking.

The following examples show how to use dataflow in Windows Forms.

#### Filtering

When you call the `ISourceBlock<TOutput>.LinkTo` method to link a source to a target, you can supply a delegate that determines whether the target block accepts or rejects a message based on the value of that message. This filtering mechanism is a useful way to guarantee that a dataflow block receives only certain values. For most of the predefined dataflow block types, if a source block is connected to multiple target blocks, when a target block rejects a message, the source offers that message to the next target. The order in which a source offers messages to targets is defined by the source and can vary according to the type of the source. Most source block types stop offering a message after one target accepts that message. One exception to this rule is the `BroadcastBlock<T>` class, which offers each message to all targets, even if some targets reject the message. For an example that uses filtering to process only certain messages, see Walkthrough: Using Dataflow in a Windows Forms Application.

> Important
Because each predefined source dataflow block type guarantees that messages are propagated out in the order in which they are received, every message must be read from the source block before the source block can process the next message. Therefore, when you use filtering to connect multiple targets to a source, make sure that at least one target block receives each message. Otherwise, your application might deadlock.

### Message Passing

The dataflow programming model is related to the concept of message passing, where independent components of a program communicate with one another by sending messages. One way to propagate messages among application components is to call the `Post` (synchronous) and `SendAsync` (asynchronous) methods to send messages to target dataflow blocks, and the `Receive`, `ReceiveAsync`, and `TryReceive` methods to receive messages from source blocks. You can combine these methods with dataflow pipelines or networks by sending input data to the head node (a target block), and by receiving output data from the terminal node of the pipeline or the terminal nodes of the network (one or more source blocks). You can also use the Choose method to read from the first of the provided sources that has data available and perform action on that data.

source blocks offer data to target blocks by calling the `ITargetBlockT>.OfferMessage` method.

When a target block postpones the message for later use, the `OfferMessage` method returns Postponed. A target block that postpones a message can later call the `ISourceBlock<TOutput>.ReserveMessage` method to try to reserve the offered message. At this point, the message is either still available and can be used by the target block, or the message has been taken by another target. When the target block later requires the message or no longer needs the message, it calls the `ISourceBlock<TOutput>.ConsumeMessage` or `ReleaseReservation` method, respectively. Message reservation is typically used by the dataflow block types that operate in non-greedy mode. Non-greedy mode is explained later in this document. Instead of reserving a postponed message, a target block can also use the `ISourceBlock<TOutput>.ConsumeMessage` method to attempt to directly consume the postponed message.

### Dataflow Block Completion

Dataflow blocks also support the concept of completion. A dataflow block that is in the completed state does not perform any further work. Each dataflow block has an associated `System.Threading.Tasks.Task` object, known as a completion task, that represents the completion status of the block. Because you can wait for a `Task` object to finish, by using completion tasks, you can wait for one or more terminal nodes of a dataflow network to finish. The `IDataflowBlock` interface defines the `Complete` method, which informs the dataflow block of a request for it to complete, and the `Completion` property, which returns the completion task for the dataflow block. Both `ISourceBlock<TOutput>` and `ITargetBlock<TInput>` inherit the `IDataflowBlock` interface.

There are two ways to determine whether a dataflow block completed without error, encountered one or more errors, or was canceled. The first way is to call the `Task.Wait` method on the completion task in a ```try-catch``` block. The following example creates an `ActionBlock<TInput>` object that throws `ArgumentOutOfRangeException` if its input value is less than zero. `AggregateException` is thrown when this example calls Wait on the completion task. The `ArgumentOutOfRangeException` is accessed through the `InnerExceptions` property of the `AggregateException` object.

```csharp
// Create an ActionBlock<int> object that prints its input
// and throws ArgumentOutOfRangeException if the input
// is less than zero.
var throwIfNegative = new ActionBlock<int>(n =>
{
   Console.WriteLine("n = {0}", n);
   if (n < 0)
   {
      throw new ArgumentOutOfRangeException();
   }
});

// Post values to the block.
throwIfNegative.Post(0);
throwIfNegative.Post(-1);
throwIfNegative.Post(1);
throwIfNegative.Post(-2);
throwIfNegative.Complete();

// Wait for completion in a try/catch block.
try
{
   throwIfNegative.Completion.Wait();
}
catch (AggregateException ae)
{
   // If an unhandled exception occurs during dataflow processing, all
   // exceptions are propagated through an AggregateException object.
   ae.Handle(e =>
   {
      Console.WriteLine("Encountered {0}: {1}",
         e.GetType().Name, e.Message);
      return true;
   });
}

/* Output:
n = 0
n = -1
Encountered ArgumentOutOfRangeException: Specified argument was out of the range
 of valid values.
*/
```

This example shows how to handle exceptions in the delegate of an execution dataflow block.

`OperationCanceledException` occurs when a dataflow block is explicitly cancelled.

The first way to determine the completion status of a dataflow block is to use a completion task.

```csharp
// Create an ActionBlock<int> object that prints its input
// and throws ArgumentOutOfRangeException if the input
// is less than zero.
var throwIfNegative = new ActionBlock<int>(n =>
{
   Console.WriteLine("n = {0}", n);
   if (n < 0)
   {
      throw new ArgumentOutOfRangeException();
   }
});

// Create a continuation task that prints the overall
// task status to the console when the block finishes.
throwIfNegative.Completion.ContinueWith(task =>
{
   Console.WriteLine("The status of the completion task is '{0}'.",
      task.Status);
});

// Post values to the block.
throwIfNegative.Post(0);
throwIfNegative.Post(-1);
throwIfNegative.Post(1);
throwIfNegative.Post(-2);
throwIfNegative.Complete();

// Wait for completion in a try/catch block.
try
{
   throwIfNegative.Completion.Wait();
}
catch (AggregateException ae)
{
   // If an unhandled exception occurs during dataflow processing, all
   // exceptions are propagated through an AggregateException object.
   ae.Handle(e =>
   {
      Console.WriteLine("Encountered {0}: {1}",
         e.GetType().Name, e.Message);
      return true;
   });
}

/* Output:
n = 0
n = -1
The status of the completion task is 'Faulted'.
Encountered ArgumentOutOfRangeException: Specified argument was out of the range
 of valid values.
*/
```

You can use properties such as IsCompleted in the body of a continuation task to determine the completion status of a dataflow block.

## Predefined Dataflow Block Types

The following sections describe the block types that make up the TPL Dataflow Library.

### Buffering Blocks

Buffering blocks hold data for use by data consumers. The TPL Dataflow Library provides three buffering block types: ```System.Threading.Tasks.Dataflow.BufferBlock<T>```, ```System.Threading.Tasks.Dataflow.BroadcastBlock<T>```, and ```System.Threading.Tasks.Dataflow.WriteOnceBlock<T>```.

#### BufferBlock<T>

The `BufferBlockT>` class stores a first in, first out (FIFO) queue of messages that can be written to by multiple sources or read from by multiple targets.

The following basic example posts several Int32 values to a `BufferBlock<T>` object and then reads those values back from that object.

```csharp
// Create a BufferBlock<int> object.
var bufferBlock = new BufferBlock<int>();

// Post several messages to the block.
for (int i = 0; i < 3; i++)
{
   bufferBlock.Post(i);
}

// Receive the messages back from the block.
for (int i = 0; i < 3; i++)
{
   Console.WriteLine(bufferBlock.Receive());
}

/* Output:
   0
   1
   2
 */
```

For a complete example that demonstrates how to write messages to and read messages from a `BufferBlock<T>` object, see How to: Write Messages to and Read Messages from a Dataflow Block.

#### BroadcastBlock<T>

The` BroadcastBlockT>` class is useful when you must pass multiple messages to another component, but that component needs only the most recent value.

`BroadcastBlockT>` reads Double values from `BroadcastBlockT>` objects.

```csharp
// Create a BroadcastBlock<double> object.
var broadcastBlock = new BroadcastBlock<double>(null);

// Post a message to the block.
broadcastBlock.Post(Math.PI);

// Receive the messages back from the block several times.
for (int i = 0; i < 3; i++)
{
   Console.WriteLine(broadcastBlock.Receive());
}

/* Output:
   3.14159265358979
   3.14159265358979
   3.14159265358979
 */
```

For a complete example that demonstrates how to use `BroadcastBlock<T>` to broadcast a message to multiple target blocks, see How to: Specify a Task Scheduler in a Dataflow Block.

#### WriteOnceBlock<T>

The `WriteOnceBlock<T>` class propagates messages from one `WriteOnceBlock<T>` object to another.

A `WriteOnceBlock<T>` object can be written to one time only, after a `WriteOnceBlock<T>` object receives a message, it discards subsequent messages.

```csharp
// Create a WriteOnceBlock<string> object.
var writeOnceBlock = new WriteOnceBlock<string>(null);

// Post several messages to the block in parallel. The first
// message to be received is written to the block.
// Subsequent messages are discarded.
Parallel.Invoke(
   () => writeOnceBlock.Post("Message 1"),
   () => writeOnceBlock.Post("Message 2"),
   () => writeOnceBlock.Post("Message 3"));

// Receive the message from the block.
Console.WriteLine(writeOnceBlock.Receive());

/* Sample output:
   Message 2
 */
```

For a complete example that demonstrates how to use `WriteOnceBlock<T>` to receive the value of the first operation that finishes, see How to: Unlink Dataflow Blocks.

### Execution Blocks

Execution blocks call a user-provided delegate for each piece of received data. The TPL Dataflow Library provides three execution block types: `ActionBlock<TInput>`, ```System.Threading.Tasks.Dataflow.TransformBlock<TInput,TOutput>```, and ```System.Threading.Tasks.Dataflow.TransformManyBlock<TInput,TOutput>```.

#### ActionBlock<T>

The `ActionBlock<TInput>` class is a target block that calls a delegate when it receives data. Think of a `ActionBlock<TInput>` object as a delegate that runs asynchronously when data becomes available. The delegate that you provide to an `ActionBlock<TInput>` object can be of type `Action<T>` or type `System.Func<TInput, Task>`. When you use an `ActionBlock<TInput>` object with `Action<T>`, processing of each input element is considered completed when the delegate returns. When you use an `ActionBlock<TInput>` object with `System.Func<TInput, Task>`, processing of each input element is considered completed only when the returned Task object is completed. By using these two mechanisms, you can use `ActionBlock<TInput>` for both synchronous and asynchronous processing of each input element.

An `ActionBlockTInput>` object prints an `Int32` value to the console and waits for all dataflow tasks to finish.

```csharp
// Create an ActionBlock<int> object that prints values
// to the console.
var actionBlock = new ActionBlock<int>(n => Console.WriteLine(n));

// Post several messages to the block.
for (int i = 0; i < 3; i++)
{
   actionBlock.Post(i * 10);
}

// Set the block to the completed state and wait for all
// tasks to finish.
actionBlock.Complete();
actionBlock.Completion.Wait();

/* Output:
   0
   10
   20
 */
```

For complete examples that demonstrate how to use delegates with the `ActionBlock<TInput>` class, see How to: Perform Action When a Dataflow Block Receives Data.

#### TransformBlock<TInput, TOutput>

The `TransformBlock<TInput,TOutput>` class resembles the `ActionBlock<TInput>` class, except that it acts as both a source and as a target. The delegate that you pass to a `TransformBlock<TInput,TOutput>` object returns a value of type ```TOutput```. The delegate that you provide to a `TransformBlock<TInput,TOutput>` object can be of type ```System.Func<TInput, TOutput>``` or type `System.Func<TInput, Task<TOutput>>`. When you use a `TransformBlock<TInput,TOutput>` object with ```System.Func<TInput, TOutput>```, processing of each input element is considered completed when the delegate returns. When you use a `TransformBlock<TInput,TOutput>` object used with `System.Func<TInput, Task<TOutput>>`, processing of each input element is considered completed only when the returned `Task<TResult>` object is completed. As with `ActionBlock<TInput>`, by using these two mechanisms, you can use `TransformBlock<TInput,TOutput>` for both synchronous and asynchronous processing of each input element.

The following basic example creates a `TransformBlock<TInput,TOutput>` object that computes the square root of its input. The `TransformBlock<TInput,TOutput>` object takes Int32 values as input and produces Double values as output.

```csharp
// Create a TransformBlock<int, double> object that
// computes the square root of its input.
var transformBlock = new TransformBlock<int, double>(n => Math.Sqrt(n));

// Post several messages to the block.
transformBlock.Post(10);
transformBlock.Post(20);
transformBlock.Post(30);

// Read the output messages from the block.
for (int i = 0; i < 3; i++)
{
   Console.WriteLine(transformBlock.Receive());
}

/* Output:
   3.16227766016838
   4.47213595499958
   5.47722557505166
 */
```

For complete examples that uses `TransformBlock<TInput,TOutput>` in a network of dataflow blocks that performs image processing in a Windows Forms application, see Walkthrough: Using Dataflow in a Windows Forms Application.

#### TransformManyBlock<TInput, TOutpu>

The `TransformManyBlock<TInput,TOutput>` class resembles the `TransformBlock<TInput,TOutput>` class, except that `TransformManyBlock<TInput,TOutput>` produces zero or more output values for each input value, instead of only one output value for each input value. The delegate that you provide to a `TransformManyBlock<TInput,TOutput>` object can be of type `System.Func<TInput, IEnumerable<TOutput>>` or type `System.Func<TInput, Task<IEnumerable<TOutput>>>`. When you use a `TransformManyBlock<TInput,TOutput>` object with `System.Func<TInput, IEnumerable<TOutput>>`, processing of each input element is considered completed when the delegate returns. When you use a `TransformManyBlock<TInput,TOutput>` object with `System.Func<TInput, Task<IEnumerable<TOutput>>>`, processing of each input element is considered complete only when the returned System.Threading.Tasks.Task<IEnumerable<TOutput>> object is completed.

The following basic example creates a `TransformManyBlock<TInput,TOutput>` object that splits strings into their individual character sequences. The `TransformManyBlock<TInput,TOutput>` object takes String values as input and produces Char values as output.

```csharp
// Create a TransformManyBlock<string, char> object that splits
// a string into its individual characters.
var transformManyBlock = new TransformManyBlock<string, char>(
   s => s.ToCharArray());

// Post two messages to the first block.
transformManyBlock.Post("Hello");
transformManyBlock.Post("World");

// Receive all output values from the block.
for (int i = 0; i < ("Hello" + "World").Length; i++)
{
   Console.WriteLine(transformManyBlock.Receive());
}

/* Output:
   H
   e
   l
   l
   o
   W
   o
   r
   l
   d
 */
```
For complete examples that use `TransformManyBlock<TInput,TOutput>` to produce multiple independent outputs for each input in a dataflow pipeline, see Walkthrough: Creating a Dataflow Pipeline.

#### Degree of Parallelism

Every `ActionBlock<TInput>`, `TransformBlock<TInput,TOutput>`, and `TransformManyBlock<TInput,TOutput>` object buffers input messages until the block is ready to process them. By default, these classes process messages in the order in which they are received, one message at a time. You can also specify the degree of parallelism to enable `ActionBlock<TInput>`, `TransformBlock<TInput,TOutput>` and `TransformManyBlock<TInput,TOutput>` objects to process multiple messages concurrently. For more information about concurrent execution, see the section Specifying the Degree of Parallelism later in this document. For an example that sets the degree of parallelism to enable an execution dataflow block to process more than one message at a time, see How to: Specify the Degree of Parallelism in a Dataflow Block.

#### Summary of Delegate Types

The following table summarizes the delegate types that you can provide to `ActionBlock<TInput>`, `TransformBlock<TInput,TOutput>`, and `TransformManyBlock<TInput,TOutput>` objects. This table also specifies whether the delegate type operates synchronously or asynchronously.

<table><thead>
<tr>
<th>Type</th>
<th>Synchronous Delegate Type</th>
<th>Asynchronous Delegate Type</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.actionblock-1" class="no-loc" data-linktype="absolute-path">ActionBlock&lt;TInput&gt;</a></td>
<td><code>System.Action</code></td>
<td><code>System.Func&lt;TInput, Task&gt;</code></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.transformblock-2" class="no-loc" data-linktype="absolute-path">TransformBlock&lt;TInput,TOutput&gt;</a></td>
<td><code>System.Func&lt;TInput, ```TOutput```&gt;</code></td>
<td><code>System.Func&lt;TInput, Task&lt;TOutput&gt;&gt;</code></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.transformmanyblock-2" class="no-loc" data-linktype="absolute-path">TransformManyBlock&lt;TInput,TOutput&gt;</a></td>
<td><code>System.Func&lt;TInput, IEnumerable&lt;TOutput&gt;&gt;</code></td>
<td><code>System.Func&lt;TInput, Task&lt;IEnumerable&lt;TOutput&gt;&gt;&gt;</code></td>
</tr>
</tbody></table>

You can use expressions when you work with dataflows.

### Grouping Blocks

The TPL Dataflow Library provides three join block types: `BatchBlock<T>`, `JoinBlock<T1,T2>`, and `BatchedJoinBlock<T1,T2>`.

#### BatchBlock<T>

The `BatchBlock<T>` class combines sets of input data, which are known as batches, into arrays of output data.

The `BatchBlock<T>` class operates in either greedy or non-greedy mode. In greedy mode, which is the default, a `BatchBlock<T>` object accepts every message that it is offered and propagates out an array after it receives the specified count of elements. In non-greedy mode, a `BatchBlock<T>` object postpones all incoming messages until enough sources have offered messages to the block to form a batch. Greedy mode typically performs better than non-greedy mode because it requires less processing overhead. However, you can use non-greedy mode when you must coordinate consumption from multiple sources in an atomic fashion. Specify non-greedy mode by setting Greedy to ```False``` in the ```dataflowBlockOptions``` parameter in the `BatchBlock<T>` constructor.

`Int32` has a `BatchBlock<T>` object that holds elements in a batch.

```csharp
// Create a BatchBlock<int> object that holds ten
// elements per batch.
var batchBlock = new BatchBlock<int>(10);

// Post several values to the block.
for (int i = 0; i < 13; i++)
{
   batchBlock.Post(i);
}
// Set the block to the completed state. This causes
// the block to propagate out any remaining
// values as a final batch.
batchBlock.Complete();

// Print the sum of both batches.

Console.WriteLine("The sum of the elements in batch 1 is {0}.",
   batchBlock.Receive().Sum());

Console.WriteLine("The sum of the elements in batch 2 is {0}.",
   batchBlock.Receive().Sum());

/* Output:
   The sum of the elements in batch 1 is 45.
   The sum of the elements in batch 2 is 33.
 */
```

For a complete example that uses `BatchBlock<T>` to improve the efficiency of database insert operations, see Walkthrough: Using `BatchBlock` and `BatchedJoinBlock` to Improve Efficiency.

#### JoinBlock<T1, T2, ...>

The `JoinBlock<T1,T2>` and `JoinBlock<T1,T2,T3>` classes collect input elements and propagate out `System.Tuple<T1,T2>` or `System.Tuple<T1,T2,T3>` objects that contain those elements.

`JoinBlock<T1,T2>` or `JoinBlock<T1,T2,T3>` is a subclass of `BatchBlock<T>`.

The `JoinBlock<T1,T2,T3>` method creates a `JoinBlock<T1,T2,T3>` object that requires two Int32 values and a Char value to perform an arithmetic operation.

```csharp
// Create a JoinBlock<int, int, char> object that requires
// two numbers and an operator.
var joinBlock = new JoinBlock<int, int, char>();

// Post two values to each target of the join.

joinBlock.Target1.Post(3);
joinBlock.Target1.Post(6);

joinBlock.Target2.Post(5);
joinBlock.Target2.Post(4);

joinBlock.Target3.Post('+');
joinBlock.Target3.Post('-');

// Receive each group of values and apply the operator part
// to the number parts.

for (int i = 0; i < 2; i++)
{
   var data = joinBlock.Receive();
   switch (data.Item3)
   {
      case '+':
         Console.WriteLine("{0} + {1} = {2}",
            data.Item1, data.Item2, data.Item1 + data.Item2);
         break;
      case '-':
         Console.WriteLine("{0} - {1} = {2}",
            data.Item1, data.Item2, data.Item1 - data.Item2);
         break;
      default:
         Console.WriteLine("Unknown operator '{0}'.", data.Item3);
         break;
   }
}

/* Output:
   3 + 5 = 8
   6 - 4 = 2
 */
```

For a complete example that uses `JoinBlock<T1,T2>` objects in non-greedy mode to cooperatively share a resource, see How to: Use JoinBlock to Read Data From Multiple Sources.

#### BatchedJoinBlock<T1, T2, ...>

The `BatchedJoinBlock<T1,T2>` and `BatchedJoinBlock<T1,T2,T3>` classes collect batches of input elements and propagate out `System.Tuple(IList(T1), IList(T2))` or `System.Tuple(IList(T1), IList(T2), IList(T3))` objects that contain those elements. Think of `BatchedJoinBlock<T1,T2>` as a combination of `BatchBlock<T>` and `JoinBlock<T1,T2>`. Specify the size of each batch when you create a `BatchedJoinBlock<T1,T2>` object. `BatchedJoinBlock<T1,T2>` also provides properties, `Target1` and `Target2`, that implement `ITargetBlock<TInput>`. When the specified count of input elements are received from across all targets, the `BatchedJoinBlock<T1,T2>` object asynchronously propagates out a `System.Tuple(IList(T1), IList(T2))` object that contains those elements.

The `BatchedJoinBlock<T1,T2>` object holds results, Int32 values, and errors that are `Exception` objects.

```csharp
// For demonstration, create a Func<int, int> that
// returns its argument, or throws ArgumentOutOfRangeException
// if the argument is less than zero.
Func<int, int> DoWork = n =>
{
   if (n < 0)
      throw new ArgumentOutOfRangeException();
   return n;
};

// Create a BatchedJoinBlock<int, Exception> object that holds
// seven elements per batch.
var batchedJoinBlock = new BatchedJoinBlock<int, Exception>(7);

// Post several items to the block.
foreach (int i in new int[] { 5, 6, -7, -22, 13, 55, 0 })
{
   try
   {
      // Post the result of the worker to the
      // first target of the block.
      batchedJoinBlock.Target1.Post(DoWork(i));
   }
   catch (ArgumentOutOfRangeException e)
   {
      // If an error occurred, post the Exception to the
      // second target of the block.
      batchedJoinBlock.Target2.Post(e);
   }
}

// Read the results from the block.
var results = batchedJoinBlock.Receive();

// Print the results to the console.

// Print the results.
foreach (int n in results.Item1)
{
   Console.WriteLine(n);
}
// Print failures.
foreach (Exception e in results.Item2)
{
   Console.WriteLine(e.Message);
}

/* Output:
   5
   6
   13
   55
   0
   Specified argument was out of the range of valid values.
   Specified argument was out of the range of valid values.
 */
```

`BatchedJoinBlock<T1,T2>` captures all the results and any exceptions that occur while the program reads from a database.

## Configuring Dataflow  Block Behavior

You can enable additional options by providing a ```System.Threading.Tasks.Dataflow.DataflowBlockOptions``` object to the constructor of dataflow block types. These options control behavior such the scheduler that manages the underlying task and the degree of parallelism. The `DataflowBlockOptions` also has derived types that specify behavior that is specific to certain dataflow block types. The following table summarizes which options type is associated with each dataflow block type.

<table><thead>
<tr>
<th>Dataflow Block Type</th>
<th><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.dataflowblockoptions" class="no-loc" data-linktype="absolute-path">DataflowBlockOptions</a> type</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.bufferblock-1" class="no-loc" data-linktype="absolute-path">BufferBlock&lt;T&gt;</a></td>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.dataflowblockoptions" class="no-loc" data-linktype="absolute-path">DataflowBlockOptions</a></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.broadcastblock-1" class="no-loc" data-linktype="absolute-path">BroadcastBlock&lt;T&gt;</a></td>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.dataflowblockoptions" class="no-loc" data-linktype="absolute-path">DataflowBlockOptions</a></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.writeonceblock-1" class="no-loc" data-linktype="absolute-path">WriteOnceBlock&lt;T&gt;</a></td>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.dataflowblockoptions" class="no-loc" data-linktype="absolute-path">DataflowBlockOptions</a></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.actionblock-1" class="no-loc" data-linktype="absolute-path">ActionBlock&lt;TInput&gt;</a></td>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.executiondataflowblockoptions" class="no-loc" data-linktype="absolute-path">ExecutionDataflowBlockOptions</a></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.transformblock-2" class="no-loc" data-linktype="absolute-path">TransformBlock&lt;TInput,TOutput&gt;</a></td>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.executiondataflowblockoptions" class="no-loc" data-linktype="absolute-path">ExecutionDataflowBlockOptions</a></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.transformmanyblock-2" class="no-loc" data-linktype="absolute-path">TransformManyBlock&lt;TInput,TOutput&gt;</a></td>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.executiondataflowblockoptions" class="no-loc" data-linktype="absolute-path">ExecutionDataflowBlockOptions</a></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.batchblock-1" class="no-loc" data-linktype="absolute-path">BatchBlock&lt;T&gt;</a></td>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.groupingdataflowblockoptions" class="no-loc" data-linktype="absolute-path">GroupingDataflowBlockOptions</a></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.joinblock-2" class="no-loc" data-linktype="absolute-path">JoinBlock&lt;T1,T2&gt;</a></td>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.groupingdataflowblockoptions" class="no-loc" data-linktype="absolute-path">GroupingDataflowBlockOptions</a></td>
</tr>
<tr>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.batchedjoinblock-2" class="no-loc" data-linktype="absolute-path">BatchedJoinBlock&lt;T1,T2&gt;</a></td>
<td><a href="/en-us/dotnet/api/system.threading.tasks.dataflow.groupingdataflowblockoptions" class="no-loc" data-linktype="absolute-path">GroupingDataflowBlockOptions</a></td>
</tr>
</tbody></table>

The following sections provide additional information about the important kinds of dataflow block options that are available through the ```System.Threading.Tasks.Dataflow.DataflowBlockOptions```, ```System.Threading.Tasks.Dataflow.ExecutionDataflowBlockOptions```, and ```System.Threading.Tasks.Dataflow.GroupingDataflowBlockOptions``` classes.

### Specifying the Task Scheduler

The Thread Pool Library (TPL) implements a task scheduler that queues tasks onto threads.

The TaskScheduler class defines task schedulers that can enforce policies across dataflow blocks.

### Specifying the Degree of Parallelism

By default, the three execution block types that the TPL Dataflow Library provides, `ActionBlock<TInput>`, `TransformBlock<TInput,TOutput>`, and `TransformManyBlock<TInput,TOutput>`, process one message at a time. These dataflow block types also process messages in the order in which they are received. To enable these dataflow blocks to process messages concurrently, set the `ExecutionDataflowBlockOptions.MaxDegreeOfParallelism` property when you construct the dataflow block object.

The `MaxDegreeOfParallelism` property sets the maximum degree of concurrency for a dataflow block.

> Important
When you specify a maximum degree of parallelism that is larger than 1, multiple messages are processed simultaneously, and therefore messages might not be processed in the order in which they are received. The order in which the messages are output from the block is, however, the same one in which they are received.

The `MaxDegreeOfParallelism` property represents the maximum degree of parallelism that a dataflow block might execute.

The `MaxDegreeOfParallelism` property specifies the maximum degree of parallelism that dataflow block objects can potentially run in.

For an example that sets the maximum degree of parallelism to enable lengthy operations to occur in parallel, see How to: Specify the Degree of Parallelism in a Dataflow Block.

### Specifying the Number of Messages per Task

This article describes how to increase fairness among dataflow tasks by setting the `MaxMessagesPerTask` property.

### Enabling Cancellation

The TPL provides a mechanism that enables tasks to coordinate cancellation in a cooperative manner.

For an example that demonstrates how to use cancellation in a Windows Forms application, see How to: Cancel a Dataflow Block. For more information about cancellation in the TPL, see Task Cancellation.

### Specifying Greedy Versus Non-Greedy Behavior

Several grouping dataflow block types can operate in either greedy or non-greedy mode. By default, the predefined dataflow block types operate in greedy mode.

The join and BatchBlock classes have two modes of operation: greedy and non-greedy.

To specify non-greedy mode for a dataflow block, set Greedy to ```False```. For an example that demonstrates how to use non-greedy mode to enable multiple join blocks to share a data source more efficiently, see How to: Use JoinBlock to Read Data From Multiple Sources.

## Custom Dataflow Blocks

Although the TPL Dataflow Library provides many predefined block types, you can create additional block types that perform custom behavior. Implement the `ISourceBlock<TOutput>` or `ITargetBlock<TInput>` interfaces directly or use the  Encapsulate method to build a complex block that encapsulates the behavior of existing block types. For examples that show how to implement custom dataflow block functionality, see Walkthrough: Creating a Custom Dataflow Block Type.

## Related Topics

<table><thead>
<tr>
<th>Title</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="how-to-write-messages-to-and-read-messages-from-a-dataflow-block" data-linktype="relative-path">How to: Write Messages to and Read Messages from a Dataflow Block</a></td>
<td>Demonstrates how to write messages to and read messages from a <a href="/en-us/dotnet/api/system.threading.tasks.dataflow.bufferblock-1" class="no-loc" data-linktype="absolute-path">BufferBlock&lt;T&gt;</a> object.</td>
</tr>
<tr>
<td><a href="how-to-implement-a-producer-consumer-dataflow-pattern" data-linktype="relative-path">How to: Implement a Producer-Consumer Dataflow Pattern</a></td>
<td>Describes how to use the dataflow model to implement a producer-consumer pattern, where the producer sends messages to a dataflow block, and the consumer reads messages from that block.</td>
</tr>
<tr>
<td><a href="how-to-perform-action-when-a-dataflow-block-receives-data" data-linktype="relative-path">How to: Perform Action When a Dataflow Block Receives Data</a></td>
<td>Describes how to provide delegates to the execution dataflow block types, <a href="/en-us/dotnet/api/system.threading.tasks.dataflow.actionblock-1" class="no-loc" data-linktype="absolute-path">ActionBlock&lt;TInput&gt;</a>, <a href="/en-us/dotnet/api/system.threading.tasks.dataflow.transformblock-2" class="no-loc" data-linktype="absolute-path">TransformBlock&lt;TInput,TOutput&gt;</a>, and <a href="/en-us/dotnet/api/system.threading.tasks.dataflow.transformmanyblock-2" class="no-loc" data-linktype="absolute-path">TransformManyBlock&lt;TInput,TOutput&gt;</a>.</td>
</tr>
<tr>
<td><a href="walkthrough-creating-a-dataflow-pipeline" data-linktype="relative-path">Walkthrough: Creating a Dataflow Pipeline</a></td>
<td>Describes how to create a dataflow pipeline that downloads text from the web and performs operations on that text.</td>
</tr>
<tr>
<td><a href="how-to-unlink-dataflow-blocks" data-linktype="relative-path">How to: Unlink Dataflow Blocks</a></td>
<td>Demonstrates how to use the <a href="/en-us/dotnet/api/system.threading.tasks.dataflow.isourceblock-1.linkto" class="no-loc" data-linktype="absolute-path">LinkTo</a> method to unlink a target block from its source after the source offers a message to the target.</td>
</tr>
<tr>
<td><a href="walkthrough-using-dataflow-in-a-windows-forms-application" data-linktype="relative-path">Walkthrough: Using Dataflow in a Windows Forms Application</a></td>
<td>Demonstrates how to create a network of dataflow blocks that perform image processing in a Windows Forms application.</td>
</tr>
<tr>
<td><a href="how-to-cancel-a-dataflow-block" data-linktype="relative-path">How to: Cancel a Dataflow Block</a></td>
<td>Demonstrates how to use cancellation in a Windows Forms application.</td>
</tr>
<tr>
<td><a href="how-to-use-joinblock-to-read-data-from-multiple-sources" data-linktype="relative-path">How to: Use JoinBlock to Read Data From Multiple Sources</a></td>
<td>Explains how to use the <a href="/en-us/dotnet/api/system.threading.tasks.dataflow.joinblock-2" class="no-loc" data-linktype="absolute-path">JoinBlock&lt;T1,T2&gt;</a> class to perform an operation when data is available from multiple sources, and how to use non-greedy mode to enable multiple join blocks to share a data source more efficiently.</td>
</tr>
<tr>
<td><a href="how-to-specify-the-degree-of-parallelism-in-a-dataflow-block" data-linktype="relative-path">How to: Specify the Degree of Parallelism in a Dataflow Block</a></td>
<td>Describes how to set the <a href="/en-us/dotnet/api/system.threading.tasks.dataflow.executiondataflowblockoptions.maxdegreeofparallelism" class="no-loc" data-linktype="absolute-path">MaxDegreeOfParallelism</a> property to enable an execution dataflow block to process more than one message at a time.</td>
</tr>
<tr>
<td><a href="how-to-specify-a-task-scheduler-in-a-dataflow-block" data-linktype="relative-path">How to: Specify a Task Scheduler in a Dataflow Block</a></td>
<td>Demonstrates how to associate a specific task scheduler when you use dataflow in your application.</td>
</tr>
<tr>
<td><a href="walkthrough-using-batchblock-and-batchedjoinblock-to-improve-efficiency" data-linktype="relative-path">Walkthrough: Using BatchBlock and BatchedJoinBlock to Improve Efficiency</a></td>
<td>Describes how to use the <a href="/en-us/dotnet/api/system.threading.tasks.dataflow.batchblock-1" class="no-loc" data-linktype="absolute-path">BatchBlock&lt;T&gt;</a> class to improve the efficiency of database insert operations, and how to use the <a href="/en-us/dotnet/api/system.threading.tasks.dataflow.batchedjoinblock-2" class="no-loc" data-linktype="absolute-path">BatchedJoinBlock&lt;T1,T2&gt;</a> class to capture both the results and any exceptions that occur while the program reads from a database.</td>
</tr>
<tr>
<td><a href="walkthrough-creating-a-custom-dataflow-block-type" data-linktype="relative-path">Walkthrough: Creating a Custom Dataflow Block Type</a></td>
<td>Demonstrates two ways to create a dataflow block type that implements custom behavior.</td>
</tr>
<tr>
<td><a href="task-parallel-library-tpl" data-linktype="relative-path">Task Parallel Library (TPL)</a></td>
<td>Introduces the TPL, a library that simplifies parallel and concurrent programming in .NET Framework applications.</td>
</tr>
</tbody></table>

Ref: [Dataflow (Task Parallel Library)](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/dataflow-task-parallel-library)