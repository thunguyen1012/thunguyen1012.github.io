---
title: Asynchronous programming patterns - Event-based asynchronous pattern (EAP) - Use components that support the EAP
published: true
date: 2024-10-07 10:17:22
tags: Summary, .Net, AdvancedProgramming
description: Many components provide you with the option of performing their work asynchronously. The SoundPlayer and PictureBox components, for example, enable you to load sounds and images "in the background" while your main thread continues running without interruption.
image:
---

## In this article

In this section, you'll find out more about the components that make up the BBC iPlayer app.

Asynchronous methods on a class that supports the Event-based Asynchronous Pattern Overview can be as simple as attaching an event handler to the component's MethodName event, just as you would for any other event.

For more information about using event handlers, see Event Handlers Overview.

The following procedure shows how to use the asynchronous image-loading capability of a PictureBox control.

### To enable a PictureBox control to asynchronously load an image

- Create an instance of the PictureBox component in your form.

- Assign an event handler to the LoadCompleted event.
Check for any errors that may have occurred during the asynchronous download here. This is also where you check for cancellation.

```csharp
public Form1()
{
    InitializeComponent();

    this.pictureBox1.LoadCompleted +=
        new System.ComponentModel.AsyncCompletedEventHandler(this.pictureBox1_LoadCompleted);
}
```

```csharp
private void pictureBox1_LoadCompleted(object sender, AsyncCompletedEventArgs e)
{
    if (e.Error != null)
    {
        MessageBox.Show(e.Error.Message, "Load Error");
    }
    else if (e.Cancelled)
    {
        MessageBox.Show("Load canceled", "Canceled");
    }
    else
    {
        MessageBox.Show("Load completed", "Completed");
    }
}
```

- Add two buttons, called ```loadButton``` and ```cancelLoadButton```, to your form. Add Click event handlers to start and cancel the download.

```csharp
private void loadButton_Click(object sender, EventArgs e)
{
    // Replace with a real url.
    pictureBox1.LoadAsync("https://unsplash.com/photos/qhixfmpqN8s/download?force=true&w=1920");
}
```

```csharp
private void cancelLoadButton_Click(object sender, EventArgs e)
{
    pictureBox1.CancelAsync();
}
```

- Run your application.
As the image download proceeds, you can move the form freely, minimize it, and maximize it.

## See also

- How to: Run an Operation in the Background

- Event-based Asynchronous Pattern Overview

Ref: [How to: Use Components That Support the Event-based Asynchronous Pattern](https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/how-to-use-components-that-support-the-event-based-asynchronous-pattern)