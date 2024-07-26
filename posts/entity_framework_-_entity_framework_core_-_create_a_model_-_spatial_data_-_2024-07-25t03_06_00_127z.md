---
title: Entity Framework - Entity Framework Core - Create a model - Spatial data
published: true
date: 2024-07-25 03:06:00
tags: EFCore, Summary
description: EF Core supports querying spatial data types using the NetTopologySuite spatial library.
image:
---

## In this article

EF Core supports querying spatial data types using the NetTopologySuite spatial library.

## Installing

In order to use spatial data with EF Core, you need to install the appropriate supporting NuGet package. Which package you need to install depends on the provider you're using.

<table><thead>
<tr>
<th>EF Core Provider</th>
<th>Spatial NuGet Package</th>
</tr>
</thead>
<tbody>
<tr>
<td>Microsoft.EntityFrameworkCore.SqlServer</td>
<td><a href="https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.SqlServer.NetTopologySuite" data-linktype="external">Microsoft.EntityFrameworkCore.SqlServer.NetTopologySuite</a></td>
</tr>
<tr>
<td>Microsoft.EntityFrameworkCore.Sqlite</td>
<td><a href="https://www.nuget.org/packages/Microsoft.EntityFrameworkCore.Sqlite.NetTopologySuite" data-linktype="external">Microsoft.EntityFrameworkCore.Sqlite.NetTopologySuite</a></td>
</tr>
<tr>
<td>Microsoft.EntityFrameworkCore.InMemory</td>
<td><a href="https://www.nuget.org/packages/NetTopologySuite" data-linktype="external">NetTopologySuite</a></td>
</tr>
<tr>
<td>Npgsql.EntityFrameworkCore.PostgreSQL</td>
<td><a href="https://www.nuget.org/packages/Npgsql.EntityFrameworkCore.PostgreSQL.NetTopologySuite" data-linktype="external">Npgsql.EntityFrameworkCore.PostgreSQL.NetTopologySuite</a></td>
</tr>
<tr>
<td>Pomelo.EntityFrameworkCore.MySql</td>
<td><a href="https://www.nuget.org/packages/Pomelo.EntityFrameworkCore.MySql.NetTopologySuite" data-linktype="external">Pomelo.EntityFrameworkCore.MySql.NetTopologySuite</a></td>
</tr>
<tr>
<td>Devart.Data.MySql.EFCore</td>
<td><a href="https://www.nuget.org/packages/Devart.Data.MySql.EFCore.NetTopologySuite" data-linktype="external">Devart.Data.MySql.EFCore.NetTopologySuite</a></td>
</tr>
<tr>
<td>Devart.Data.Oracle.EFCore</td>
<td><a href="https://www.nuget.org/packages/Devart.Data.Oracle.EFCore.NetTopologySuite" data-linktype="external">Devart.Data.Oracle.EFCore.NetTopologySuite</a></td>
</tr>
<tr>
<td>Devart.Data.PostgreSql.EFCore</td>
<td><a href="https://www.nuget.org/packages/Devart.Data.PostgreSql.EFCore.NetTopologySuite" data-linktype="external">Devart.Data.PostgreSql.EFCore.NetTopologySuite</a></td>
</tr>
<tr>
<td>Devart.Data.SQLite.EFCore</td>
<td><a href="https://www.nuget.org/packages/Devart.Data.SQLite.EFCore.NetTopologySuite" data-linktype="external">Devart.Data.SQLite.EFCore.NetTopologySuite</a></td>
</tr>
<tr>
<td>Teradata.EntityFrameworkCore</td>
<td><a href="https://www.nuget.org/packages/Teradata.EntityFrameworkCore.NetTopologySuite" data-linktype="external">Teradata.EntityFrameworkCore.NetTopologySuite</a></td>
</tr>
</tbody></table>

## NetTopologySuite

NetTopologySuite (NTS) is a spatial library for .NET. EF Core enables mapping to spatial data types in the database by using NTS types in your model.

To enable mapping to spatial types via NTS, call the ```UseNetTopologySuite``` method on the provider's ```DbContext``` options builder. For example, with SQL Server you'd call it like this.

```csharp
options.UseSqlServer(
    @"Data Source=(localdb)\MSSQLLocalDB;Initial Catalog=WideWorldImporters;ConnectRetryCount=0",
    x => x.UseNetTopologySuite());
```

The NetTopology Suite (NTS) allows you to store and manipulate spatial data.

```
- Geometry

  - Point

  - LineString

  - Polygon

  - GeometryCollection

    - MultiPoint

    - MultiLineString

    - MultiPolygon
```

> Warning
```CircularString```, ```CompoundCurve```, and ```CurePolygon``` aren't supported by NTS.

Using the base Geometry type allows any type of shape to be specified by the property.

## Longitude and Latitude

The following table shows the coordinates of the North and South Poles using the National Geographic Satellite (NTS) service.

## Querying Data

The following entity classes could be used to map to tables in the Wide World Importers sample database.

```csharp
[Table("Cities", Schema = "Application")]
public class City
{
    public int CityID { get; set; }

    public string CityName { get; set; }

    public Point Location { get; set; }
}
```

```csharp
[Table("Countries", Schema = "Application")]
public class Country
{
    public int CountryID { get; set; }

    public string CountryName { get; set; }

    // Database includes both Polygon and MultiPolygon values
    public Geometry Border { get; set; }
}
```

All methods and properties available as database functions will be translated to SQL.

```csharp
// Find the nearest city
var nearestCity = db.Cities
    .OrderBy(c => c.Location.Distance(currentLocation))
    .FirstOrDefault();
```

```csharp
// Find the containing country
var currentCountry = db.Countries
    .FirstOrDefault(c => c.Border.Contains(currentLocation));
```

## Reverse engineering

Spatial packages for dotnet efcontext scaffold allow you to map the columns of a dbcontext scaffold to a Cartesian coordinate system.

## SRID Ignored during client operations

The National Geographic Survey (NTS) uses a coordinate system based on the Cartesian coordinate system.

> Note
Use the newer ProjNet NuGet package, not the older package called ProjNet4GeoAPI.

If an operation is server-evaluated by EF Core via SQL, the result's unit will be determined by the database.

Here is an example of using ProjNet to calculate the distance between two cities.

```csharp
public static class GeometryExtensions
{
    private static readonly CoordinateSystemServices _coordinateSystemServices
        = new CoordinateSystemServices(
            new Dictionary<int, string>
            {
                // Coordinate systems:

                [4326] = GeographicCoordinateSystem.WGS84.WKT,

                // This coordinate system covers the area of our data.
                // Different data requires a different coordinate system.
                [2855] =
                    @"
                        PROJCS[""NAD83(HARN) / Washington North"",
                            GEOGCS[""NAD83(HARN)"",
                                DATUM[""NAD83_High_Accuracy_Regional_Network"",
                                    SPHEROID[""GRS 1980"",6378137,298.257222101,
                                        AUTHORITY[""EPSG"",""7019""]],
                                    AUTHORITY[""EPSG"",""6152""]],
                                PRIMEM[""Greenwich"",0,
                                    AUTHORITY[""EPSG"",""8901""]],
                                UNIT[""degree"",0.01745329251994328,
                                    AUTHORITY[""EPSG"",""9122""]],
                                AUTHORITY[""EPSG"",""4152""]],
                            PROJECTION[""Lambert_Conformal_Conic_2SP""],
                            PARAMETER[""standard_parallel_1"",48.73333333333333],
                            PARAMETER[""standard_parallel_2"",47.5],
                            PARAMETER[""latitude_of_origin"",47],
                            PARAMETER[""central_meridian"",-120.8333333333333],
                            PARAMETER[""false_easting"",500000],
                            PARAMETER[""false_northing"",0],
                            UNIT[""metre"",1,
                                AUTHORITY[""EPSG"",""9001""]],
                            AUTHORITY[""EPSG"",""2855""]]
                    "
            });

    public static Geometry ProjectTo(this Geometry geometry, int srid)
    {
        var transformation = _coordinateSystemServices.CreateTransformation(geometry.SRID, srid);

        var result = geometry.Copy();
        result.Apply(new MathTransformFilter(transformation.MathTransform));

        return result;
    }

    private class MathTransformFilter : ICoordinateSequenceFilter
    {
        private readonly MathTransform _transform;

        public MathTransformFilter(MathTransform transform)
            => _transform = transform;

        public bool Done => false;
        public bool GeometryChanged => true;

        public void Filter(CoordinateSequence seq, int i)
        {
            var x = seq.GetX(i);
            var y = seq.GetY(i);
            var z = seq.GetZ(i);
            _transform.Transform(ref x, ref y, ref z);
            seq.SetX(i, x);
            seq.SetY(i, y);
            seq.SetZ(i, z);
        }
    }
}
```

```csharp
var seattle = new Point(-122.333056, 47.609722) { SRID = 4326 };
var redmond = new Point(-122.123889, 47.669444) { SRID = 4326 };

// In order to get the distance in meters, we need to project to an appropriate
// coordinate system. In this case, we're using SRID 2855 since it covers the
// geographic area of our data
var distanceInDegrees = seattle.Distance(redmond);
var distanceInMeters = seattle.ProjectTo(2855).Distance(redmond.ProjectTo(2855));
```

> Note
4326 refers to WGS 84, a standard used in GPS and other geographic systems.

## Additional resources

### Database-specific information

Be sure to read your provider's documentation for additional information on working with spatial data.

- Spatial Data in the SQL Server Provider

- Spatial Data in the SQLite Provider

- Spatial Data in the Npgsql Provider

### Other resources

- NetTopologySuite Docs

- .NET Data Community Standup session, focusing on spatial data and NetTopologySuite.

Ref: [Spatial Data](https://learn.microsoft.com/en-us/ef/core/modeling/spatial)