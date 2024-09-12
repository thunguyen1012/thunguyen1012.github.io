---
title: Data access - Azure Storage with Visual Studio - Table storage
published: true
date: 2024-09-12 03:42:19
tags: Summary, AspNetCore
description: Azure Table storage is a service that stores non-relational structured data (also known as structured NoSQL data) in the cloud, providing a key/attribute store with a schemaless design. Because Table storage is schemaless, it's easy to adapt your data as the needs of your application evolve. Access to Table storage data is fast and cost-effective for many types of applications, and is typically lower in cost than traditional SQL for similar volumes of data.
image:
---

## In this article

> Tip
The content in this article applies to the original Azure Table storage. However, the same concepts apply to the newer Azure Cosmos DB for Table, which offers higher performance and availability, global distribution, and automatic secondary indexes. It is also available in a consumption-based serverless mode. There are some feature differences between Table API in Azure Cosmos DB and Azure Table storage. For more information, see Azure Cosmos DB for Table. For ease of development, we now provide a unified Azure Tables SDK that can be used to target both Azure Table storage and Azure Cosmos DB for Table.

Azure Table storage is a service that stores non-relational structured data (also known as structured data) in the cloud, providing a key/attribute store with a schemaless design.

You can use Table storage to store flexible datasets like user data for web applications, address books, device information, or other types of metadata your service requires.

## What is Table storage

Microsoft has released a new version of its Azure Table storage service.

- Storing TBs of structured data capable of serving web scale applications

- Storing datasets that don't require complex joins, foreign keys, or stored procedures and can be denormalized for fast access

- Quickly querying data using a clustered index

- Accessing data using the OData protocol and LINQ queries with WCF Data Service .NET Libraries

You can use Table storage to store and query huge sets of structured, non-relational data, and your tables will scale as demand increases.

## Table storage concepts

Table storage contains the following components:

![Tables storage component diagram!](https://learn.microsoft.com/en-us/azure/visual-studio/vs-storage-aspnet5-getting-started-tables/../../includes/media/storage-table-concepts-include/table1.png "Tables storage component diagram")

- URL format: Azure Table Storage accounts use this format: http://<storage account>.table.core.windows.net/<table>
You can address Azure tables directly using this address with the OData protocol. For more information, see OData.org.

- Accounts: All access to Azure Storage is done through a storage account. For more information about storage accounts, see Storage account overview.
All access to Azure Cosmos DB is done through an Azure Cosmos DB for Table account. For more information, see Create an Azure Cosmos DB for Table account.

- Table: A table is a collection of entities. Tables don't enforce a schema on entities, which means a single table can contain entities that have different sets of properties.

- Entity: An entity is a set of properties, similar to a database row. An entity in Azure Storage can be up to 1MB in size. An entity in Azure Cosmos DB can be up to 2MB in size.

- Properties: A property is a name-value pair. Each entity can include up to 252 properties to store data. Each entity also has three system properties that specify a partition key, a row key, and a timestamp. Entities with the same partition key can be queried more quickly, and inserted/updated in atomic operations. An entity's row key is its unique identifier within a partition.

For details about naming tables and properties, see Understanding the Table Service Data Model.

## Next steps

- Microsoft Azure Storage Explorer is a free, standalone app from Microsoft that enables you to work visually with Azure Storage data on Windows, macOS, and Linux.

- Get started with Azure Table Storage in .NET

- View the Table service reference documentation for complete details about available APIs:

  - Storage Client Library for .NET reference

  - REST API reference

Ref: [What is Azure Table storage?](https://learn.microsoft.com/en-us/azure/visual-studio/vs-storage-aspnet5-getting-started-tables?toc=%2Faspnet%2Fcore%2Ftoc.json&bc=%2Faspnet%2Fcore%2Fbreadcrumb%2Ftoc.json&view=aspnetcore-8.0)