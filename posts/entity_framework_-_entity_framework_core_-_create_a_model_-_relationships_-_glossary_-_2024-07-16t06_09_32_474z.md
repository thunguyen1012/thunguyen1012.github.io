---
title: Entity Framework - Entity Framework Core - Create a model - Relationships - Glossary
published: true
date: 2024-07-16 06:09:32
tags: EFCore, Summary
description: There are a number of terms used to describe relationships. It is not necessary to understand all these terms up-front. Refer back here as needed when reading the relationships documentation pages.
image:
---
  - Article

  - 03/30/2023

  - 1 contributor

## In this article

There are a number of terms used to describe relationships. It is not necessary to understand all these terms up-front. Refer back here as needed when reading the relationships documentation pages.

- Dependent entity: This is the entity that contains the foreign key property or properties. A dependent is sometimes called a "child".

- Principal entity: This is the entity that contains the primary/alternate key property or properties. A principal is sometimes called the "parent".

- Principal key: The property or properties whose values uniquely identify the principal entity. The principal key may be the primary key or an alternate key.

- Foreign key: The property or properties of the dependent entity type that are used to store the key values that match the principal key values of the related principal entity.

- Navigation: A property on the entity on one side of the relationship that references the related entity or entities at the other end of the relationship.

  - Collection navigation: A navigation that contains references to many related entities. Used to reference the "many" side(s) of one-to-many and many-to-many relationships.

  - Reference navigation: A navigation that holds a reference to a single related entity. Used to reference the "one" side(s) of one-to-one and one-to-many relationships.

  - Inverse navigation: When discussing a particular navigation, this term refers to the navigation on the other end of the relationship.

- Self-referencing relationship: A relationship in which the dependent and the principal entity types are the same.

- Required relationship A relationship represented by a non-nullable foreign key. A dependent entity in a required relationship cannot exist without a principal entity to which it refers.

- Optional relationship A relationship represented by a nullable foreign key. A dependent entity in an optional relationship can exist without referring to any principal entity.

- Bidirectional relationship A relationship that has navigations on both sides of the relationship.

- Unidirectional relationship A relationship that has a navigation on one side of the relationship, but no navigation on the other side.

Ref: [Glossary of relationship terms](https://learn.microsoft.com/en-us/ef/core/modeling/relationships/glossary)