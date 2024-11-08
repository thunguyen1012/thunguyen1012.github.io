---
title: Entity Framework - Entity Framework Core - Database providers - Overview
published: true
date: 2024-08-26 04:20:08
tags: Summary, EFCore
description: Entity Framework Core can access many different databases through plug-in libraries called database providers.
image:
---

## In this article

Entity Framework Core can access many different databases through plug-in libraries called database providers.

## Current providers

> Important
EF Core providers are built by a variety of sources. Not all providers are maintained as part of the Microsoft Entity Framework Core Project. When considering a provider, be sure to evaluate quality, licensing, support, etc. to ensure they meet your requirements. Also make sure you review each provider's documentation for detailed version compatibility information.

> Important
EF Core providers typically do not work across major versions. For example, a provider released for EF Core 7 will not work with EF Core 8.

<table><thead>
<tr>
<th>NuGet Package</th>
<th>Supported database engines</th>
<th>Maintainer / Vendor</th>
<th>Notes / Requirements</th>
<th>For EF Core</th>
<th>Useful links</th>
</tr>
</thead>
<tbody>
<tr>
<td><a href="https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.SqlServer" data-linktype="external">Microsoft.EntityFrameworkCore.SqlServer</a></td>
<td>Azure SQL and SQL Server 2012 onwards</td>
<td><a href="https://github.com/dotnet/efcore/" data-linktype="external">EF Core Project</a> (Microsoft)</td>
<td></td>
<td>6, 7, 8</td>
<td><a href="sql-server/" data-linktype="relative-path">docs</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.Sqlite" data-linktype="external">Microsoft.EntityFrameworkCore.Sqlite</a></td>
<td>SQLite 3.7 onwards</td>
<td><a href="https://github.com/dotnet/efcore/" data-linktype="external">EF Core Project</a> (Microsoft)</td>
<td></td>
<td>6, 7, 8</td>
<td><a href="sqlite/" data-linktype="relative-path">docs</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.InMemory" data-linktype="external">Microsoft.EntityFrameworkCore.InMemory</a></td>
<td>EF Core in-memory database</td>
<td><a href="https://github.com/dotnet/efcore/" data-linktype="external">EF Core Project</a> (Microsoft)</td>
<td><a href="../testing/testing-without-the-database#inmemory-provider" data-linktype="relative-path">Limitations</a></td>
<td>6, 7, 8</td>
<td><a href="in-memory/" data-linktype="relative-path">docs</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.Cosmos" data-linktype="external">Microsoft.EntityFrameworkCore.Cosmos</a></td>
<td>Azure Cosmos DB SQL API</td>
<td><a href="https://github.com/dotnet/efcore/" data-linktype="external">EF Core Project</a> (Microsoft)</td>
<td></td>
<td>6, 7, 8</td>
<td><a href="cosmos/" data-linktype="relative-path">docs</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/Npgsql.EntityFrameworkCore.PostgreSQL" data-linktype="external">Npgsql.EntityFrameworkCore.PostgreSQL</a></td>
<td>PostgreSQL</td>
<td><a href="https://github.com/npgsql" data-linktype="external">Npgsql Development Team</a></td>
<td></td>
<td>6, 7, 8</td>
<td><a href="https://www.npgsql.org/efcore/index.html" data-linktype="external">docs</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/Pomelo.EntityFrameworkCore.MySql" data-linktype="external">Pomelo.EntityFrameworkCore.MySql</a></td>
<td>MySQL, MariaDB</td>
<td><a href="https://github.com/PomeloFoundation" data-linktype="external">Pomelo Foundation Project</a></td>
<td></td>
<td>6, 7, 8</td>
<td><a href="https://github.com/PomeloFoundation/Pomelo.EntityFrameworkCore.MySql/blob/master/README.md" data-linktype="external">readme</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/MySql.EntityFrameworkCore" data-linktype="external">MySql.EntityFrameworkCore</a></td>
<td>MySQL</td>
<td><a href="https://dev.mysql.com" data-linktype="external">MySQL project</a> (Oracle)</td>
<td></td>
<td>6, 7</td>
<td><a href="https://dev.mysql.com/doc/connector-net/en/connector-net-entityframework-core.html" data-linktype="external">docs</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/Oracle.EntityFrameworkCore/" data-linktype="external">Oracle.EntityFrameworkCore</a></td>
<td>Oracle DB 11.2 onwards</td>
<td><a href="https://www.oracle.com/technetwork/topics/dotnet/" data-linktype="external">Oracle</a></td>
<td></td>
<td>6, 7</td>
<td><a href="https://www.oracle.com/technetwork/topics/dotnet/" data-linktype="external">website</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/MongoDB.EntityFrameworkCore/" data-linktype="external">MongoDB.EntityFrameworkCore</a></td>
<td>MongoDB</td>
<td><a href="https://www.mongodb.com/" data-linktype="external">MongoDB</a></td>
<td></td>
<td>8</td>
<td><a href="https://www.mongodb.com/docs/entity-framework/current/" data-linktype="external">docs</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/Devart.Data.MySql.EFCore/" data-linktype="external">Devart.Data.MySql.EFCore</a></td>
<td>MySQL 5 onwards</td>
<td><a href="https://www.devart.com/dotconnect/mysql/" data-linktype="external">DevArt</a></td>
<td>Paid</td>
<td>6, 7, 8</td>
<td><a href="https://docs.devart.com/dotconnect/mysql/GettingStarted.html" data-linktype="external">docs</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/Devart.Data.Oracle.EFCore/" data-linktype="external">Devart.Data.Oracle.EFCore</a></td>
<td>Oracle DB 9.2.0.4 onwards</td>
<td><a href="https://www.devart.com/dotconnect/oracle/" data-linktype="external">DevArt</a></td>
<td>Paid</td>
<td>6, 7, 8</td>
<td><a href="https://docs.devart.com/dotconnect/oracle/GettingStarted.html" data-linktype="external">docs</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/Devart.Data.PostgreSql.EFCore/" data-linktype="external">Devart.Data.PostgreSql.EFCore</a></td>
<td>PostgreSQL 8.0 onwards</td>
<td><a href="https://www.devart.com/dotconnect/postgresql/" data-linktype="external">DevArt</a></td>
<td>Paid</td>
<td>6, 7, 8</td>
<td><a href="https://docs.devart.com/dotconnect/postgresql/GettingStarted.html" data-linktype="external">docs</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/Devart.Data.SQLite.EFCore/" data-linktype="external">Devart.Data.SQLite.EFCore</a></td>
<td>SQLite 3 onwards</td>
<td><a href="https://www.devart.com/dotconnect/sqlite/" data-linktype="external">DevArt</a></td>
<td>Paid</td>
<td>6, 7, 8</td>
<td><a href="https://docs.devart.com/dotconnect/sqlite/GettingStarted.html" data-linktype="external">docs</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/Devart.Data.DB2.EFCore" data-linktype="external">Devart.Data.DB2.EFCore</a></td>
<td>DB2</td>
<td><a href="https://www.devart.com/dotconnect/db2/" data-linktype="external">DevArt</a></td>
<td>Paid</td>
<td>6, 7, 8</td>
<td><a href="https://docs.devart.com/dotconnect/db2/GettingStarted.html" data-linktype="external">docs</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/Devart.Data.Bigcommerce.EFCore" data-linktype="external">Devart.Data.Bigcommerce.EFCore</a></td>
<td>BigCommerce</td>
<td><a href="https://www.devart.com/dotconnect/bigcommerce/" data-linktype="external">DevArt</a></td>
<td>Paid</td>
<td>6, 7, 8</td>
<td><a href="https://docs.devart.com/dotconnect/bigcommerce/GettingStarted.html" data-linktype="external">docs</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/Devart.Data.Dynamics.EFCore" data-linktype="external">Devart.Data.Dynamics.EFCore</a></td>
<td>Microsoft Dynamics 365</td>
<td><a href="https://www.devart.com/dotconnect/dynamicscrm/" data-linktype="external">DevArt</a></td>
<td>Paid</td>
<td>6, 7, 8</td>
<td><a href="https://docs.devart.com/dotconnect/dynamics/GettingStarted.html" data-linktype="external">docs</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/Devart.Data.FreshBooks.EFCore" data-linktype="external">Devart.Data.FreshBooks.EFCore</a></td>
<td>FreshBooks</td>
<td><a href="https://www.devart.com/dotconnect/freshbooks/" data-linktype="external">DevArt</a></td>
<td>Paid</td>
<td>6, 7, 8</td>
<td><a href="https://docs.devart.com/dotconnect/freshbooks/GettingStarted.html" data-linktype="external">docs</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/Devart.Data.Magento.EFCore" data-linktype="external">Devart.Data.Magento.EFCore</a></td>
<td>Magento</td>
<td><a href="https://www.devart.com/dotconnect/magento/" data-linktype="external">DevArt</a></td>
<td>Paid</td>
<td>6, 7, 8</td>
<td><a href="https://docs.devart.com/dotconnect/magento/GettingStarted.html" data-linktype="external">docs</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/Devart.Data.MailChimp.EFCore" data-linktype="external">Devart.Data.MailChimp.EFCore</a></td>
<td>Mailchimp</td>
<td><a href="https://www.devart.com/dotconnect/mailchimp/" data-linktype="external">DevArt</a></td>
<td>Paid</td>
<td>6, 7, 8</td>
<td><a href="https://docs.devart.com/dotconnect/mailchimp/GettingStarted.html" data-linktype="external">docs</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/Devart.Data.QuickBooks.EFCore" data-linktype="external">Devart.Data.QuickBooks.EFCore</a></td>
<td>QuickBooks</td>
<td><a href="https://www.devart.com/dotconnect/quickbooks/" data-linktype="external">DevArt</a></td>
<td>Paid</td>
<td>6, 7, 8</td>
<td><a href="https://docs.devart.com/dotconnect/quickbooks/GettingStarted.html" data-linktype="external">docs</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/Devart.Data.Salesforce.EFCore" data-linktype="external">Devart.Data.Salesforce.EFCore</a></td>
<td>Salesforce</td>
<td><a href="https://www.devart.com/dotconnect/salesforce/" data-linktype="external">DevArt</a></td>
<td>Paid</td>
<td>6, 7, 8</td>
<td><a href="https://docs.devart.com/dotconnect/salesforce/GettingStarted.html" data-linktype="external">docs</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/Devart.Data.ExactTarget.EFCore" data-linktype="external">Devart.Data.ExactTarget.EFCore</a></td>
<td>Salesforce MC (ExactTarget)</td>
<td><a href="https://www.devart.com/dotconnect/exacttarget/" data-linktype="external">DevArt</a></td>
<td>Paid</td>
<td>6, 7, 8</td>
<td><a href="https://docs.devart.com/dotconnect/salesforcemc/GettingStarted.html" data-linktype="external">docs</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/Devart.Data.Sugar.EFCore" data-linktype="external">Devart.Data.Sugar.EFCore</a></td>
<td>SugarCRM</td>
<td><a href="https://www.devart.com/dotconnect/sugarcrm/" data-linktype="external">DevArt</a></td>
<td>Paid</td>
<td>6, 7, 8</td>
<td><a href="https://docs.devart.com/dotconnect/sugarcrm/GettingStarted.html" data-linktype="external">docs</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/Devart.Data.Zoho.EFCore" data-linktype="external">Devart.Data.Zoho.EFCore</a></td>
<td>Zoho CRM</td>
<td><a href="https://www.devart.com/dotconnect/zohocrm/" data-linktype="external">DevArt</a></td>
<td>Paid</td>
<td>6, 7, 8</td>
<td><a href="https://docs.devart.com/dotconnect/zohocrm/GettingStarted.html" data-linktype="external">docs</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/MASES.EntityFrameworkCore.KNet/" data-linktype="external">MASES.EntityFrameworkCore.KNet</a></td>
<td>Apache Kafka</td>
<td><a href="https://masesgroup.com" data-linktype="external">MASES Group</a></td>
<td>Trial, Subscription</td>
<td>6, 7, 8</td>
<td><a href="https://kefcore.masesgroup.com/" data-linktype="external">docs</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/InterBaseSql.EntityFrameworkCore.InterBase/" data-linktype="external">InterBase</a></td>
<td>InterBase</td>
<td><a href="https://interbase.com/" data-linktype="external">InterBase</a></td>
<td></td>
<td>6</td>
<td><a href="https://docwiki.embarcadero.com/InterBase/2020/en/Entity_Framework" data-linktype="external">docs</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/FirebirdSql.EntityFrameworkCore.Firebird/" data-linktype="external">FirebirdSql.EntityFrameworkCore.Firebird</a></td>
<td>Firebird 3.0 onwards</td>
<td><a href="https://github.com/cincuranet" data-linktype="external">Jiří Činčura</a></td>
<td></td>
<td>8</td>
<td><a href="https://github.com/FirebirdSQL/NETProvider/blob/master/docs/entity-framework-core.md" data-linktype="external">docs</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/IBM.EntityFrameworkCore" data-linktype="external">IBM.EntityFrameworkCore</a></td>
<td>Db2, Informix</td>
<td><a href="https://ibm.com" data-linktype="external">IBM</a></td>
<td>Paid, Windows</td>
<td>6</td>
<td><a href="https://community.ibm.com/community/user/hybriddatamanagement/blogs/michelle-betbadal1/2020/04/29/getting-started-with-ibm-net-provider-for-net-core" data-linktype="external">getting started</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/IBM.EntityFrameworkCore-lnx" data-linktype="external">IBM.EntityFrameworkCore-lnx</a></td>
<td>Db2, Informix</td>
<td><a href="https://ibm.com" data-linktype="external">IBM</a></td>
<td>Paid, Linux</td>
<td>6</td>
<td><a href="https://community.ibm.com/community/user/hybriddatamanagement/blogs/michelle-betbadal1/2020/04/29/getting-started-with-ibm-net-provider-for-net-core" data-linktype="external">getting started</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/IBM.EntityFrameworkCore-osx" data-linktype="external">IBM.EntityFrameworkCore-osx</a></td>
<td>Db2, Informix</td>
<td><a href="https://ibm.com" data-linktype="external">IBM</a></td>
<td>Paid, macOS</td>
<td>6</td>
<td><a href="https://community.ibm.com/community/user/hybriddatamanagement/blogs/michelle-betbadal1/2020/04/29/getting-started-with-ibm-net-provider-for-net-core" data-linktype="external">getting started</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/EntityFrameworkCore.Jet/" data-linktype="external">EntityFrameworkCore.Jet</a></td>
<td>Microsoft Access files</td>
<td><a href="https://github.com/CirrusRedOrg" data-linktype="external">CirrusRedOrg</a></td>
<td>Windows</td>
<td>6, 7, 8 (Preview)</td>
<td><a href="https://github.com/CirrusRedOrg/EntityFrameworkCore.Jet/blob/master/docs/README.md" data-linktype="external">readme</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/Google.Cloud.EntityFrameworkCore.Spanner" data-linktype="external">Google.Cloud.EntityFrameworkCore.Spanner</a></td>
<td>Google Cloud Spanner</td>
<td><a href="https://github.com/cloudspannerecosystem" data-linktype="external">Cloud Spanner Ecosystem</a></td>
<td>Currently in preview</td>
<td>6</td>
<td><a href="https://medium.com/google-cloud/google-cloud-spanner-with-entity-framework-core-2ddd16d2b252" data-linktype="external">tutorial</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/Teradata.EntityFrameworkCore/" data-linktype="external">Teradata.EntityFrameworkCore</a></td>
<td>Teradata Database 16.10 onwards</td>
<td><a href="https://downloads.teradata.com/download/connectivity/net-data-provider-for-teradata" data-linktype="external">Teradata</a></td>
<td></td>
<td>3</td>
<td><a href="https://www.nuget.org/packages/Teradata.EntityFrameworkCore/" data-linktype="external">website</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/FileContextCore/" data-linktype="external">FileContextCore</a></td>
<td>Stores data in files</td>
<td><a href="https://github.com/morrisjdev" data-linktype="external">Morris Janatzek</a></td>
<td>For development purposes</td>
<td>3</td>
<td><a href="https://github.com/morrisjdev/FileContextCore/blob/master/README.md" data-linktype="external">readme</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/FileBaseContext/" data-linktype="external">FileBaseContext</a></td>
<td>Store tables in files</td>
<td><a href="https://github.com/dualbios" data-linktype="external">k.D.g</a></td>
<td>For development purposes</td>
<td>7, 8</td>
<td><a href="https://github.com/dualbios/FileBaseContext/blob/main/README.md" data-linktype="external">readme</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/EntityFrameworkCore.SqlServerCompact35" data-linktype="external">EntityFrameworkCore.SqlServerCompact35</a></td>
<td>SQL Server Compact 3.5</td>
<td><a href="https://github.com/ErikEJ/" data-linktype="external">Erik Ejlskov Jensen</a></td>
<td>.NET Framework</td>
<td>2</td>
<td><a href="https://github.com/ErikEJ/EntityFramework.SqlServerCompact/wiki/Using-EF-Core-with-SQL-Server-Compact-in-Traditional-.NET-Applications" data-linktype="external">wiki</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/EntityFrameworkCore.SqlServerCompact40" data-linktype="external">EntityFrameworkCore.SqlServerCompact40</a></td>
<td>SQL Server Compact 4.0</td>
<td><a href="https://github.com/ErikEJ/" data-linktype="external">Erik Ejlskov Jensen</a></td>
<td>.NET Framework</td>
<td>2</td>
<td><a href="https://github.com/ErikEJ/EntityFramework.SqlServerCompact/wiki/Using-EF-Core-with-SQL-Server-Compact-in-Traditional-.NET-Applications" data-linktype="external">wiki</a></td>
</tr>
<tr>
<td><a href="https://www.nuget.org/packages/EntityFrameworkCore.OpenEdge/" data-linktype="external">EntityFrameworkCore.OpenEdge</a></td>
<td>Progress OpenEdge</td>
<td><a href="https://github.com/alexwiese" data-linktype="external">Alex Wiese</a></td>
<td></td>
<td>2</td>
<td><a href="https://github.com/alexwiese/EntityFrameworkCore.OpenEdge/blob/master/README.md" data-linktype="external">readme</a></td>
</tr>
</tbody></table>

## Adding a database provider to your application

Most database providers for EF Core are distributed as NuGet packages, and can be installed as follows:

 - .NET Core CLI


```dotnetcli
dotnet add package provider_package_name
```

 - Visual Studio
```powershell
install-package provider_package_name
```

Once installed, you will configure the provider in your ```DbContext```, either in the ```OnConfiguring``` method or in the ```AddDbContext``` method if you are using a dependency injection container.
For example, the following line configures the SQL Server provider with the passed connection string:

```csharp
optionsBuilder.UseSqlServer(
    @"Server=(localdb)\mssqllocaldb;Database=MyDatabase;Trusted_Connection=True;");
```

Database providers can extend EF Core to enable functionality unique to specific databases. Some concepts are common to most databases, and are included in the primary EF Core components. Such concepts include expressing queries in LINQ, transactions, and tracking changes to objects once they are loaded from the database.
Some concepts are specific to a particular provider. For example, the SQL Server provider allows you to configure memory-optimized tables (a feature specific to SQL Server). Other concepts are specific to a class of providers.
For example, EF Core providers for relational databases build on the common ```Microsoft.EntityFrameworkCore.Relational``` library, which provides APIs for configuring table and column mappings, foreign key constraints, etc. Providers are usually distributed as NuGet packages.

> Important
When a new patch version of EF Core is released, it often includes updates to the ```Microsoft.EntityFrameworkCore.Relational``` package.
When you add a relational database provider, this package becomes a transitive dependency of your application.
But many providers are released independently from EF Core and may not be updated to depend on the newer patch version of that package.
In order to make sure you will get all bug fixes, it is recommended that you add the patch version of ```Microsoft.EntityFrameworkCore.Relational``` as a direct dependency of your application.

Ref: [Database Providers](https://learn.microsoft.com/en-us/ef/core/providers/)