---
title: Entity Framework - Entity Framework Core - Save data - Concurrency conflicts
published: true
date: 2024-08-13 08:04:29
tags: Summary, EFCore
description: This page discusses mechanisms for ensuring that your data stays consistent in the face of such concurrent changes.
image:
---

## In this article

> Tip
You can view this article's sample on GitHub.

This page discusses mechanisms for ensuring that your data stays consistent in the face of such concurrent changes.

## Optimistic concurrency

We present a new approach for dealing with concurrency problems in relational databases.

optimistic concurrency is a key feature of EF Core.

To understand how this works, let's assume we're on SQL Server, and define a typical ```Person``` entity type with a special ```Version``` property:

```csharp
public class Person
{
    public int PersonId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }

    [Timestamp]
    public byte[] Version { get; set; }
}
```

In this article, I'm going to show you how to update a row in a database.

```csharp
var person = context.People.Single(b => b.FirstName == "John");
person.FirstName = "Paul";
context.SaveChanges();
```

- In the first step, a ```Person``` is loaded from the database; this includes the concurrency token, which is now tracked as usual by EF along with the rest of the properties.

- The ```Person``` instance is then modified in some way - we change the ```FirstName``` property.

- We then instruct EF Core to persist the modification. Since a concurrency token is configured, EF Core sends the following SQL to the database:

```sql
UPDATE [People] SET [FirstName] = @p0
WHERE [PersonId] = @p1 AND [Version] = @p2;
```

EF Core has added a condition to the ```PersonId``` in the WHERE clause to make it easier to query the row if the ```Version``` column hasn't changed since the moment we queried it.

EF Core's ```DbUpdateConcurrencyException``` throws when there is a concurrent update to a row in the database.

EF throws ```DbUpdateConcurrencyException``` when attempting to update a row that has been concurrently modified.

## Native database-generated concurrency tokens

In this article, I'm going to show you how to use concurrency tokens to protect SQL Server data.

 - Data Annotations
```c#
public class Person
{
    public int PersonId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }

    [Timestamp]
    public byte[] Version { get; set; }
}
```

 - Fluent API
```c#
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Person>()
        .Property(p => p.Version)
        .IsRowVersion();
}
```

This article shows how to set up an automatically-updating concurrency token for a row in a database.

## Application-managed concurrency tokens

An application-managed concurrency token allows you to control which changes to a database trigger a conflict.

The following configures a GUID property to be a concurrency token:

 - Data Annotations

```c#
public class Person
{
    public int PersonId { get; set; }
    public string FirstName { get; set; }

    [ConcurrencyCheck]
    public Guid Version { get; set; }
}
```

 - Fluent API
```c#
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Person>()
        .Property(p => p.Version)
        .IsConcurrencyToken();
}
```

Since this property isn't database-generated, you must assign it in application whenever persisting changes:

```c#
var person = context.People.Single(b => b.FirstName == "John");
person.FirstName = "Paul";
person.Version = Guid.NewGuid();
context.SaveChanges();
```

The concurrency token is a value that is assigned to every change to a GUID.

## Resolving concurrency conflicts

optimistic concurrency is defined in the DbUpdateConcurrency class.

If your application has an update that fails, what should you do?

concurrency is a problem when two values in a database are updated at the same time.

There are three sets of values available to help resolve a concurrency conflict:

- Current values are the values that the application was attempting to write to the database.

- Original values are the values that were originally retrieved from the database, before any edits were made.

- Database values are the values currently stored in the database.

The general approach to handle a concurrency conflicts is:

- Catch ```DbUpdateConcurrencyException``` during ```SaveChanges```.

- Use ```DbUpdateConcurrencyException.Entries``` to prepare a new set of changes for the affected entities.

- Refresh the original values of the concurrency token to reflect the current values in the database.

- Retry the process until no conflicts occur.

In this article we are going to look at how you can use tokens to control the behaviour of an application.

```csharp
using var context = new PersonContext();
// Fetch a person from database and change phone number
var person = context.People.Single(p => p.PersonId == 1);
person.PhoneNumber = "555-555-5555";

// Change the person's name in the database to simulate a concurrency conflict
context.Database.ExecuteSqlRaw(
    "UPDATE dbo.People SET FirstName = 'Jane' WHERE PersonId = 1");

var saved = false;
while (!saved)
{
    try
    {
        // Attempt to save changes to the database
        context.SaveChanges();
        saved = true;
    }
    catch (DbUpdateConcurrencyException ex)
    {
        foreach (var entry in ex.Entries)
        {
            if (entry.Entity is Person)
            {
                var proposedValues = entry.CurrentValues;
                var databaseValues = entry.GetDatabaseValues();

                foreach (var property in proposedValues.Properties)
                {
                    var proposedValue = proposedValues[property];
                    var databaseValue = databaseValues[property];

                    // TODO: decide which value should be written to database
                    // proposedValues[property] = <value to be saved>;
                }

                // Refresh original values to bypass next concurrency check
                entry.OriginalValues.SetValues(databaseValues);
            }
            else
            {
                throw new NotSupportedException(
                    "Don't know how to handle concurrency conflicts for "
                    + entry.Metadata.Name);
            }
        }
    }
}
```

## Using isolation levels for concurrency control

Optimistic concurrency via concurrency tokens isn't the only way to ensure that data stays consistent in the face of concurrent changes.

Consistency is one of the most important considerations when implementing a database.

- When the row is queried, your transaction takes a shared lock on it. Any external transaction attempting to update the row will block until your transaction completes. This is a form of pessimistic locking, and is implemented by the SQL Server "repeatable read" isolation level.

- Rather than locking, the database allows the external transaction to update the row, but when your own transaction attempts to do the update, a "serialization" error will be raised, indicating that a concurrency conflict occurred. This is a form of optimistic locking - not unlike EF's concurrency token feature - and is implemented by the SQL Server snapshot isolation level, as well as by the PostgreSQL repeatable reads isolation level.

Note that the "serializable" isolation level provides the same guarantees as repeatable read (and adds additional ones), so it functions in the same way with respect to the above.

concurrency is one of the biggest challenges facing modern web developers.

There are a couple of things to keep in mind when implementing isolation levels in SQL Server.

In this article, I'm going to show you how to query an object in order to display its details to a user.

## Additional resources

See Conflict detection in EF Core for an ASP.NET Core sample with conflict detection.

Ref: [Handling Concurrency Conflicts](https://learn.microsoft.com/en-us/ef/core/saving/concurrency)