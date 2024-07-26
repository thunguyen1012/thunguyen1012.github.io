---
title: Entity Framework - Entity Framework Core - Manage database schemas - Migrations - Team environments
published: true
date: 2024-07-26 09:58:19
tags: EFCore, Summary
description: In this article, I'll show you how to use Migrations in a team environment.
image:
---

## In this article

In this article, I'll show you how to use Migrations in a team environment.

## Merging

In this article, I'm going to show you how to merge migrations from teammates.

```output
<<<<<<< Mine
b.Property<bool>("Deactivated");
=======
b.Property<int>("LoyaltyPoints");
>>>>>>> Theirs
```

Since both of these properties need to exist in the final model, complete the merge by adding both properties. In many
cases, your version control system may automatically merge such changes for you.

```csharp
b.Property<bool>("Deactivated");
b.Property<int>("LoyaltyPoints");
```

In some cases, you may want to share your migration with a team member.

## Resolving conflicts

Sometimes you encounter a true conflict when merging the model snapshot model. For example, you and your teammate may each have renamed the same property.

```output
<<<<<<< Mine
b.Property<string>("Username");
=======
b.Property<string>("Alias");
>>>>>>> Theirs
```

If you encounter this kind of conflict, resolve it by re-creating your migration. Follow these steps:

- Abort the merge and rollback to your working directory before the merge

- Remove your migration (but keep your model changes)

- Merge your teammate's changes into your working directory

- Re-add your migration

After doing this, the two migrations can be applied in the correct order. Their migration is applied first, renaming
the column to Alias, thereafter your migration renames it to Username.

Your migration can safely be shared with the rest of the team.

Ref: [Migrations in Team Environments](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/teams)