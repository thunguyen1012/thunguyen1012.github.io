---
title: Parallel programming - Task Parallel Library (TPL) - Task-based asynchronous programming - Create pre-computed tasks
published: true
date: 2024-11-08 09:42:31
tags: Summary, .Net, AdvancedProgramming
description: In this article, you'll learn how to use the Task.FromResult method to retrieve the results of asynchronous download operations that are held in a cache. The FromResult method returns a finished Task<TResult> object that holds the provided value as its Result property. This method is useful when you perform an asynchronous operation that returns a Task<TResult> object, and the result of that Task<TResult> object is already computed.
image:
---
- Article

  - 09/15/2021

  - 14 contributors

## In this article

In this article, you'll learn how to use the Task.FromResult method to retrieve the results of asynchronous download operations that are held in a cache.

## Example

The following example downloads strings from the web. It defines the ```DownloadStringAsync``` method. This method downloads strings from the web asynchronously. This example also uses a ConcurrentDictionary<TKey,TValue> object to cache the results of previous operations. If the input address is held in this cache, ```DownloadStringAsync``` uses the FromResult method to produce a Task<TResult> object that holds the content at that address. Otherwise, ```DownloadStringAsync``` downloads the file from the web and adds the result to the cache.

```csharp
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

public static class DownloadCache
{
    private static readonly ConcurrentDictionary<string, string> s_cachedDownloads = new();
    private static readonly HttpClient s_httpClient = new();

    public static Task<string> DownloadStringAsync(string address)
    {
        if (s_cachedDownloads.TryGetValue(address, out string? content))
        {
            return Task.FromResult(content);
        }

        return Task.Run(async () =>
        {
            content = await s_httpClient.GetStringAsync(address);
            s_cachedDownloads.TryAdd(address, content);

            return content;
        });
    }

    public static async Task Main()
    {
        string[] urls = new[]
        {
            "https://learn.microsoft.com/aspnet/core",
            "https://learn.microsoft.com/dotnet",
            "https://learn.microsoft.com/dotnet/architecture/dapr-for-net-developers",
            "https://learn.microsoft.com/dotnet/azure",
            "https://learn.microsoft.com/dotnet/desktop/wpf",
            "https://learn.microsoft.com/dotnet/devops/create-dotnet-github-action",
            "https://learn.microsoft.com/dotnet/machine-learning",
            "https://learn.microsoft.com/xamarin",
            "https://dotnet.microsoft.com/",
            "https://www.microsoft.com"
        };

        Stopwatch stopwatch = Stopwatch.StartNew();
        IEnumerable<Task<string>> downloads = urls.Select(DownloadStringAsync);

        static void StopAndLogElapsedTime(
            int attemptNumber, Stopwatch stopwatch, Task<string[]> downloadTasks)
        {
            stopwatch.Stop();

            int charCount = downloadTasks.Result.Sum(result => result.Length);
            long elapsedMs = stopwatch.ElapsedMilliseconds;

            Console.WriteLine(
                $"Attempt number: {attemptNumber}\n" +
                $"Retrieved characters: {charCount:#,0}\n" +
                $"Elapsed retrieval time: {elapsedMs:#,0} milliseconds.\n");
        }

        await Task.WhenAll(downloads).ContinueWith(
            downloadTasks => StopAndLogElapsedTime(1, stopwatch, downloadTasks));

        // Perform the same operation a second time. The time required
        // should be shorter because the results are held in the cache.
        stopwatch.Restart();

        downloads = urls.Select(DownloadStringAsync);

        await Task.WhenAll(downloads).ContinueWith(
            downloadTasks => StopAndLogElapsedTime(2, stopwatch, downloadTasks));
    }
    // Sample output:
    //     Attempt number: 1
    //     Retrieved characters: 754,585
    //     Elapsed retrieval time: 2,857 milliseconds.

    //     Attempt number: 2
    //     Retrieved characters: 754,585
    //     Elapsed retrieval time: 1 milliseconds.
}
```

```vb
Imports System.Collections.Concurrent
Imports System.Net.Http

Module Snippets
    Class DownloadCache
        Private Shared ReadOnly s_cachedDownloads As ConcurrentDictionary(Of String, String) =
            New ConcurrentDictionary(Of String, String)()
        Private Shared ReadOnly s_httpClient As HttpClient = New HttpClient()

        Public Function DownloadStringAsync(address As String) As Task(Of String)
            Dim content As String = Nothing

            If s_cachedDownloads.TryGetValue(address, content) Then
                Return Task.FromResult(Of String)(content)
            End If

            Return Task.Run(
                Async Function()
                    content = Await s_httpClient.GetStringAsync(address)
                    s_cachedDownloads.TryAdd(address, content)
                    Return content
                End Function)
        End Function
    End Class

    Public Sub StopAndLogElapsedTime(
            attemptNumber As Integer,
            stopwatch As Stopwatch,
            downloadTasks As Task(Of String()))

        stopwatch.Stop()

        Dim charCount As Integer = downloadTasks.Result.Sum(Function(result) result.Length)
        Dim elapsedMs As Long = stopwatch.ElapsedMilliseconds

        Console.WriteLine(
            $"Attempt number: {attemptNumber}{vbCrLf}" &
            $"Retrieved characters: {charCount:#,0}{vbCrLf}" &
            $"Elapsed retrieval time: {elapsedMs:#,0} milliseconds.{vbCrLf}")
    End Sub

    Sub Main()
        Dim cache As DownloadCache = New DownloadCache()
        Dim urls As String() = {
                "https://learn.microsoft.com/aspnet/core",
                "https://learn.microsoft.com/dotnet",
                "https://learn.microsoft.com/dotnet/architecture/dapr-for-net-developers",
                "https://learn.microsoft.com/dotnet/azure",
                "https://learn.microsoft.com/dotnet/desktop/wpf",
                "https://learn.microsoft.com/dotnet/devops/create-dotnet-github-action",
                "https://learn.microsoft.com/dotnet/machine-learning",
                "https://learn.microsoft.com/xamarin",
                "https://dotnet.microsoft.com/",
                "https://www.microsoft.com"
            }
        Dim stopwatch As Stopwatch = Stopwatch.StartNew()
        Dim downloads As IEnumerable(Of Task(Of String)) =
                urls.Select(AddressOf cache.DownloadStringAsync)
        Task.WhenAll(downloads).ContinueWith(
                Sub(downloadTasks)
                    StopAndLogElapsedTime(1, stopwatch, downloadTasks)
                End Sub).Wait()

        stopwatch.Restart()
        downloads = urls.Select(AddressOf cache.DownloadStringAsync)
        Task.WhenAll(downloads).ContinueWith(
                Sub(downloadTasks)
                    StopAndLogElapsedTime(2, stopwatch, downloadTasks)
                End Sub).Wait()
    End Sub
    ' Sample output:
    '     Attempt number 1
    '     Retrieved characters: 754,585
    '     Elapsed retrieval time: 2,857 milliseconds.
    '
    '     Attempt number 2
    '     Retrieved characters: 754,585
    '     Elapsed retrieval time: 1 milliseconds.
End Module
```

In the preceding example, the first time each url is downloaded, its value is stored in the cache. The FromResult method enables the ```DownloadStringAsync``` method to create Task<TResult> objects that hold these pre-computed results. Subsequent calls to download the string return the cached values, and is much faster.

## See also

- Task-based asynchronous programming

Ref: [Create pre-computed tasks](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/how-to-create-pre-computed-tasks)