---
title: Advanced - Request and response operations
published: true
date: 2024-09-24 04:35:58
tags: Summary, AspNetCore
description:
image:
---

## In this article

When writing a request body, you might want to write a response body as well.

There are two abstractions for the request and response bodies: Stream and Pipe. For request reading, ```HttpRequest.Body``` is a Stream, and ```HttpRequest.BodyReader``` is a ```PipeReader```. For response writing, ```HttpResponse```.Body is a Stream, and ```HttpResponse.BodyWriter``` is a PipeWriter.

ASP.NET Core is starting to use pipelines instead of streams.

- ```FormReader```

- ```TextReader```

- ```TextWriter```

- ```HttpResponse.WriteAsync```

Streams aren't being removed from the framework. Streams continue to be used throughout .NET, and many stream types don't have pipe equivalents, such as ```FileStreams``` and ```ResponseCompression```.

## Stream examples

Suppose the goal is to create a middleware that reads the entire request body as a list of strings, splitting on new lines. A simple stream implementation might look like the following example:

> Warning
The following code:

Is used to demonstrate the problems with not using a pipe to read the request body.
Is not intended to be used in production apps.

 - Is used to demonstrate the problems with not using a pipe to read the request body.

 - Is not intended to be used in production apps.

```csharp
private async Task<List<string>> GetListOfStringsFromStream(Stream requestBody)
{
    // Build up the request body in a string builder.
    StringBuilder builder = new StringBuilder();

    // Rent a shared buffer to write the request body into.
    byte[] buffer = ArrayPool<byte>.Shared.Rent(4096);

    while (true)
    {
        var bytesRemaining = await requestBody.ReadAsync(buffer, offset: 0, buffer.Length);
        if (bytesRemaining == 0)
        {
            break;
        }

        // Append the encoded string into the string builder.
        var encodedString = Encoding.UTF8.GetString(buffer, 0, bytesRemaining);
        builder.Append(encodedString);
    }

    ArrayPool<byte>.Shared.Return(buffer);

    var entireRequestBody = builder.ToString();

    // Split on \n in the string.
    return new List<string>(entireRequestBody.Split("\n"));
}
```

If you would like to see code comments translated to languages other than English, let us know in this GitHub discussion issue.

This code works, but there are some issues:

- Before appending to the ```StringBuilder```, the example creates another string (encodedString) that is thrown away immediately. This process occurs for all bytes in the stream, so the result is extra memory allocation the size of the entire request body.

- The example reads the entire string before splitting on new lines. It's more efficient to check for new lines in the byte array.

Here's an example that fixes some of the preceding issues:

> Warning
The following code:

Is used to demonstrate the solutions to some problems in the preceding code while not solving all the problems.
Is not intended to be used in production apps.

 - Is used to demonstrate the solutions to some problems in the preceding code while not solving all the problems.

 - Is not intended to be used in production apps.

```csharp
private async Task<List<string>> GetListOfStringsFromStreamMoreEfficient(Stream requestBody)
{
    StringBuilder builder = new StringBuilder();
    byte[] buffer = ArrayPool<byte>.Shared.Rent(4096);
    List<string> results = new List<string>();

    while (true)
    {
        var bytesRemaining = await requestBody.ReadAsync(buffer, offset: 0, buffer.Length);

        if (bytesRemaining == 0)
        {
            results.Add(builder.ToString());
            break;
        }

        // Instead of adding the entire buffer into the StringBuilder
        // only add the remainder after the last \n in the array.
        var prevIndex = 0;
        int index;
        while (true)
        {
            index = Array.IndexOf(buffer, (byte)'\n', prevIndex);
            if (index == -1)
            {
                break;
            }

            var encodedString = Encoding.UTF8.GetString(buffer, prevIndex, index - prevIndex);

            if (builder.Length > 0)
            {
                // If there was a remainder in the string buffer, include it in the next string.
                results.Add(builder.Append(encodedString).ToString());
                builder.Clear();
            }
            else
            {
                results.Add(encodedString);
            }

            // Skip past last \n
            prevIndex = index + 1;
        }

        var remainingString = Encoding.UTF8.GetString(buffer, prevIndex, bytesRemaining - prevIndex);
        builder.Append(remainingString);
    }

    ArrayPool<byte>.Shared.Return(buffer);

    return results;
}
```

This preceding example:

- Doesn't buffer the entire request body in a ```StringBuilder``` unless there aren't any newline characters.

- Doesn't call ```Split``` on the string.

However, there are still a few issues:

- If newline characters are sparse, much of the request body is buffered in the string.

- The code continues to create strings (remainingString) and adds them to the string buffer, which results in an extra allocation.

These issues are fixable, but the code is becoming progressively more complicated with little improvement. Pipelines provide a way to solve these problems with minimal code complexity.

## Pipelines

The following example shows how the same scenario can be handled using a ```PipeReader```:

```csharp
private async Task<List<string>> GetListOfStringFromPipe(PipeReader reader)
{
    List<string> results = new List<string>();

    while (true)
    {
        ReadResult readResult = await reader.ReadAsync();
        var buffer = readResult.Buffer;

        SequencePosition? position = null;

        do
        {
            // Look for a EOL in the buffer
            position = buffer.PositionOf((byte)'\n');

            if (position != null)
            {
                var readOnlySequence = buffer.Slice(0, position.Value);
                AddStringToList(results, in readOnlySequence);

                // Skip the line + the \n character (basically position)
                buffer = buffer.Slice(buffer.GetPosition(1, position.Value));
            }
        }
        while (position != null);


        if (readResult.IsCompleted && buffer.Length > 0)
        {
            AddStringToList(results, in buffer);
        }

        reader.AdvanceTo(buffer.Start, buffer.End);

        // At this point, buffer will be updated to point one byte after the last
        // \n character.
        if (readResult.IsCompleted)
        {
            break;
        }
    }

    return results;
}

private static void AddStringToList(List<string> results, in ReadOnlySequence<byte> readOnlySequence)
{
    // Separate method because Span/ReadOnlySpan cannot be used in async methods
    ReadOnlySpan<byte> span = readOnlySequence.IsSingleSegment ? readOnlySequence.First.Span : readOnlySequence.ToArray().AsSpan();
    results.Add(Encoding.UTF8.GetString(span));
}
```

This example fixes many issues that the streams implementations had:

- There's no need for a string buffer because the ```PipeReader``` handles bytes that haven't been used.

- Encoded strings are directly added to the list of returned strings.

- Other than the ```ToArray``` call, and the memory used by the string, string creation is allocation free.

## Adapters

The ```Body```, ```BodyReader```, and ```BodyWriter``` properties are available for ```HttpRequest``` and ```HttpResponse```. When you set ```Body``` to a different stream, a new set of adapters automatically adapt each type to the other. If you set ```HttpRequest.Body``` to a new stream, ```HttpRequest.BodyReader``` is automatically set to a new ```PipeReader``` that wraps ```HttpRequest.Body```.

## ```StartAsync```

 ```HttpResponse.StartAsync``` is used to indicate that headers are unmodifiable and to run ```OnStarting``` callbacks. When using Kestrel as a server, calling ```StartAsync``` before using the ```PipeReader``` guarantees that memory returned by ```GetMemory``` belongs to Kestrel's internal Pipe rather than an external buffer.

## Additional resources

- System.IO.Pipelines in .NET

- Write custom ASP.NET Core middleware

Ref: [Request and response operations in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/request-response?view=aspnetcore-8.0)