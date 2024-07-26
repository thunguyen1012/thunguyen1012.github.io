---
title: Entity Framework - Entity Framework Core - Manage database schemas - Overview
published: true
date: 2024-07-25 03:07:45
tags: EFCore, Summary
description: EF Core provides two primary ways of keeping your EF Core model and database schema in sync. To choose between the two,
decide whether your EF Core model or the database schema is the source of truth.
image:
---

## In this article

EF Core provides two primary ways of keeping your EF Core model and database schema in sync. To choose between the two,
decide whether your EF Core model or the database schema is the source of truth.

If you want your EF Core model to be the source of truth, use Database Migrations.

In this course, we will learn how to use Reverse Engineering to scaffold a DbContext and the entity type classes by reverse engineering your database schema into an EF Core model.

> Note
The create and drop APIs can also create the database schema from your EF Core model. However, they are primarily
for testing, prototyping, and other scenarios where dropping the database is acceptable.

Ref: [Managing Database Schemas](https://learn.microsoft.com/en-us/ef/core/managing-schemas/)