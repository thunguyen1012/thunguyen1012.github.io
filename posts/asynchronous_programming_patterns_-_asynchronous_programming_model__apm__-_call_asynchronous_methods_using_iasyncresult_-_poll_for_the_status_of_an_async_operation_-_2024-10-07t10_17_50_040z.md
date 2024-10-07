---
title: Asynchronous programming patterns - Asynchronous programming model (APM) - Call asynchronous methods using IAsyncResult - Poll for the status of an async operation
published: true
date: 2024-10-07 10:17:50
tags: Summary, .Net, AdvancedProgramming
description: Applications that can do other work while waiting for the results of an asynchronous operation should not block waiting until the operation completes. Use one of the following options to continue executing instructions while waiting for an asynchronous operation to complete:
image:
---

## In this article

An asynchronous operation is a method that waits for the results of another operation to complete.

- Use the `IsCompleted` property of the `IAsyncResult` returned by the asynchronous operation's `BeginOperationName` method to determine whether the operation has completed. This approach is known as polling and is demonstrated in this topic.

- Use an `AsyncCallback` delegate to process the results of the asynchronous operation in a separate thread. For an example that demonstrates this approach, see Using an `AsyncCallback` Delegate to End an `Asynchronous` Operation.

## Example

asynchronous methods in the Dns class can be used to retrieve Domain Name System information for a user-specified computer.

```csharp
/*
The following example demonstrates using asynchronous methods to
get Domain Name System information for the specified host computer.
This example polls to detect the end of the asynchronous operation.
*/

using System;
using System.Net;
using System.Net.Sockets;
using System.Threading;

namespace Examples.AdvancedProgramming.AsynchronousOperations
{
    public class PollUntilOperationCompletes
    {
        static void UpdateUserInterface()
        {
            // Print a period to indicate that the application
            // is still working on the request.
            Console.Write(".");
        }
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
            IAsyncResult result = Dns.BeginGetHostEntry(args[0], null, null);
            Console.WriteLine("Processing request for information...");

            // Poll for completion information.
            // Print periods (".") until the operation completes.
            while (result.IsCompleted != true)
            {
                UpdateUserInterface();
            }
            // The operation is complete. Process the results.
            // Print a new line.
            Console.WriteLine();
            try
            {
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

Ref: [Polling for the Status of an Asynchronous Operation](https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/polling-for-the-status-of-an-asynchronous-operation)