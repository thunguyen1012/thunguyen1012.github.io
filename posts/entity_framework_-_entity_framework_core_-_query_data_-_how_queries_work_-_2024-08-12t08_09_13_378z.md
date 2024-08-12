---
title: Entity Framework - Entity Framework Core - Query data - How queries work
published: true
date: 2024-08-12 08:09:13
tags: Summary, EFCore
description: Entity Framework Core allows you to write queries based on your derived context entity classes.
image:
---

## In this article

Entity Framework Core allows you to write queries based on your derived context entity classes.

> Note
This article is out of date and some parts of it needs to be updated to account for changes happened in design of query pipeline. If you have any doubts about any behavior mentioned here, please ask a question.

## The life of a query

The following description is a high-level overview of the process each query goes through.

- The LINQ query is processed by Entity Framework Core to build a representation that is ready to be processed by the database provider

The result is cached so that this processing does not need to be done every time the query is executed

  - The result is cached so that this processing does not need to be done every time the query is executed

- The result is passed to the database provider

The database provider identifies which parts of the query can be evaluated in the database
These parts of the query are translated to database-specific query language (for example, SQL for a relational database)
A query is sent to the database and the result set returned (results are values from the database, not entity instances)

  - The database provider identifies which parts of the query can be evaluated in the database

  - These parts of the query are translated to database-specific query language (for example, SQL for a relational database)

  - A query is sent to the database and the result set returned (results are values from the database, not entity instances)

- For each item in the result set

If the query is a tracking query, EF checks if the data represents an entity already in the change tracker for the context instance

If so, the existing entity is returned
If not, a new entity is created, change tracking is set up, and the new entity is returned


If the query is a no-tracking query, then a new entity is always created and returned

  - If the query is a tracking query, EF checks if the data represents an entity already in the change tracker for the context instance

    - If so, the existing entity is returned

    - If not, a new entity is created, change tracking is set up, and the new entity is returned

  - If the query is a no-tracking query, then a new entity is always created and returned

## When queries are executed

When you call LINQ operators, you're simply building up an in-memory representation of the query. The query is only sent to the database when the results are consumed.

The most common operations that result in the query being sent to the database are:

- Iterating the results in a for loop

- Using an operator such as ```ToList```, ```ToArray```, ```Single```, ```Count```, or the equivalent async overloads

> Warning
Always validate user input: While EF Core protects against SQL injection attacks by using parameters and escaping literals in queries, it does not validate inputs. Appropriate validation, per the application's requirements, should be performed before values from un-trusted sources are used in LINQ queries, assigned to entity properties, or passed to other EF Core APIs. This includes any user input used to dynamically construct queries. Even when using LINQ, if you are accepting user input to build expressions, you need to make sure that only intended expressions can be constructed.

Ref: [How Queries Work](https://learn.microsoft.com/en-us/ef/core/querying/how-query-works)