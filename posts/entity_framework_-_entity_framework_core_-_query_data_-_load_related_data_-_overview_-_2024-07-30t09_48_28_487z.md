---
title: Entity Framework - Entity Framework Core - Query data - Load related data - Overview
published: true
date: 2024-07-30 09:48:28
tags: EFCore, Summary
description: Entity Framework Core allows you to use the navigation properties in your model to load related entities. There are three common O/RM patterns used to load related data.
image:
---

## In this article

Entity Framework Core allows you to use the navigation properties in your model to load related entities. There are three common O/RM patterns used to load related data.

- Eager loading means that the related data is loaded from the database as part of the initial query.

- Explicit loading means that the related data is explicitly loaded from the database at a later time.

- Lazy loading means that the related data is transparently loaded from the database when the navigation property is accessed.

> Tip
You can view the samples under this section on GitHub.

Ref: [Loading Related Data](https://learn.microsoft.com/en-us/ef/core/querying/related-data/)