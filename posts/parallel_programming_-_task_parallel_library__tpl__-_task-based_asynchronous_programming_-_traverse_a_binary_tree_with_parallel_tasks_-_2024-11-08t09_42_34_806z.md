---
title: Parallel programming - Task Parallel Library (TPL) - Task-based asynchronous programming - Traverse a binary tree with parallel tasks
published: true
date: 2024-11-08 09:42:34
tags: Summary, .Net, AdvancedProgramming
description: The following example shows two ways in which parallel tasks can be used to traverse a tree data structure. The creation of the tree itself is left as an exercise.
image:
---

## In this article

The following example shows two ways in which parallel tasks can be used to traverse a tree data structure. The creation of the tree itself is left as an exercise.

## Example

```csharp
public class TreeWalk
{
    static void Main()
    {
        Tree<MyClass> tree = new Tree<MyClass>();

        // ...populate tree (left as an exercise)

        // Define the Action to perform on each node.
        Action<MyClass> myAction = x => Console.WriteLine("{0} : {1}", x.Name, x.Number);

        // Traverse the tree with parallel tasks.
        DoTree(tree, myAction);
    }

    public class MyClass
    {
        public string Name { get; set; }
        public int Number { get; set; }
    }
    public class Tree<T>
    {
        public Tree<T> Left;
        public Tree<T> Right;
        public T Data;
    }

    // By using tasks explicitly.
    public static void DoTree<T>(Tree<T> tree, Action<T> action)
    {
        if (tree == null) return;
        var left = Task.Factory.StartNew(() => DoTree(tree.Left, action));
        var right = Task.Factory.StartNew(() => DoTree(tree.Right, action));
        action(tree.Data);

        try
        {
            Task.WaitAll(left, right);
        }
        catch (AggregateException )
        {
            //handle exceptions here
        }
    }

    // By using Parallel.Invoke
    public static void DoTree2<T>(Tree<T> tree, Action<T> action)
    {
        if (tree == null) return;
        Parallel.Invoke(
            () => DoTree2(tree.Left, action),
            () => DoTree2(tree.Right, action),
            () => action(tree.Data)
        );
    }
}
```

In this tutorial, we will be looking at how to create and run tasks.

## See also

- Task Parallel Library (TPL)

Ref: [How to: Traverse a Binary Tree with Parallel Tasks](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/how-to-traverse-a-binary-tree-with-parallel-tasks)