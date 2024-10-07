---
title: Asynchronous programming patterns - Asynchronous programming model (APM) - Call asynchronous methods using IAsyncResult - Block execution by ending an async operation
published: true
date: 2024-10-07 10:17:44
tags: Summary, .Net, AdvancedProgramming
description: Applications that cannot continue to do other work while waiting for the results of an asynchronous operation must block until the operation completes. Use one of the following options to block your application's main thread while waiting for an asynchronous operation to complete:
image:
---

## In this article

An application cannot continue to do other work while waiting for the results of an asynchronous operation.

- Call the asynchronous operations `EndOperationName` method. This approach is demonstrated in this topic.

- Use the `AsyncWaitHandle` property of the IAsyncResult returned by the asynchronous operation's `BeginOperationName` method. For an example that demonstrates this approach, see Blocking Application Execution Using an `AsyncWaitHandle`.

The `BeginOperationName` method returns the name of the asynchronous operation that is being performed.

## Example

The following code example demonstrates using asynchronous methods in the Dns class to retrieve Domain Name System information for a user-specified computer. Note that ```null``` (Nothing in Visual Basic) is passed for the `BeginGetHostByNamerequestCallback` and ```stateObject``` parameters because these arguments are not required when using this approach.

```csharp
/*
The following example demonstrates using asynchronous methods to
get Domain Name System information for the specified host computer.
*/

using System;
using System.Net;
using System.Net.Sockets;

namespace Examples.AdvancedProgramming.AsynchronousOperations
{
    public class BlockUntilOperationCompletes
    {
        public static void Main(string[] args)
        {
            // Make sure the caller supplied a host name.
            if (args.Length == 0 || args[0].Length == 0)
            {
                // Print a message and exit.
                Console.WriteLine("You must specify the name of a host computer.");
                return;
            }
            // Start the asynchronous request for DNS information.
            // This example does not use a delegate or user-supplied object
            // so the last two arguments are null.
            IAsyncResult result = Dns.BeginGetHostEntry(args[0], null, null);
            Console.WriteLine("Processing your request for information...");
            // Do any additional work that can be done here.
            try
            {
                // EndGetHostEntry blocks until the process completes.
                IPHostEntry host = Dns.EndGetHostEntry(result);
                string[] aliases = host.Aliases;
                IPAddress[] addresses = host.AddressList;
                if (aliases.Length > 0)
                {
                    Console.WriteLine("Aliases");
                    for (int i = 0; i < aliases.Length; i++)
                    {
                        Console.WriteLine("{0}", aliases[i]);
                    }
                }
                if (addresses.Length > 0)
                {
                    Console.WriteLine("Addresses");
                    for (int i = 0; i < addresses.Length; i++)
                    {
                        Console.WriteLine("{0}",addresses[i].ToString());
                    }
                }
            }
            catch (SocketException e)
            {
                Console.WriteLine("An exception occurred while processing the request: {0}", e.Message);
            }
        }
    }
}
```

## See also

- Event-based Asynchronous Pattern (EAP)

- Event-based Asynchronous Pattern Overview

Ref: [Blocking Application Execution by Ending an Async Operation](https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/blocking-application-execution-by-ending-an-async-operation)