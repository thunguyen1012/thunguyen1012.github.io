---
title: Entity Framework - Entity Framework Core - Database providers - Microsoft SQL Server and Azure SQL - Spatial data
published: true
date: 2024-08-26 04:52:20
tags: Summary, EFCore
description: This page includes additional information about using spatial data with the Microsoft SQL Server database provider. For general information about using spatial data in EF Core, see the main Spatial Data documentation.
image:
---

## In this article

EF Core uses Microsoft SQL Server to store spatial data.

## Geography or ```geometry```

By default, spatial properties are mapped to ```geography``` columns in SQL Server. To use ```geometry```, configure the column type in your model.

## Geography polygon rings

When using the ```geography``` column type, SQL Server imposes additional requirements on the exterior ring (or shell) and interior rings (or holes). The exterior ring must be oriented counterclockwise and the interior rings clockwise. NetTopologySuite (NTS) validates this before sending values to the database.

## FullGlobe

SQL Server has a non-standard ```geometry``` type to represent the full globe when using the ```geography``` column type. It also has a way to represent polygons based on the full globe (without an exterior ring). Neither of these are supported by NTS.

> Warning
FullGlobe and polygons based on it aren't supported by NTS.

## Curves

In this tutorial, we'll be looking at how to use the NTS curve representation in EF Core.

> Warning
CircularString, CompoundCurve, and CurePolygon aren't supported by NTS.

## Spatial function mappings

This table shows which NTS members are translated into which SQL functions. Note that the translations vary depending on whether the column is of type ```geography``` or ```geometry```.

<table><thead>
<tr>
<th>.NET</th>
<th>SQL (geography)</th>
<th>SQL (geometry)</th>
<th>Added in</th>
</tr>
</thead>
<tbody>
<tr>
<td>EF.Functions.CurveToLine(geometry)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STCurveToLine()</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STCurveToLine()</span></td>
<td>EF Core 7.0</td>
</tr>
<tr>
<td>geometry.Area</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STArea()</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STArea()</span></td>
<td></td>
</tr>
<tr>
<td>geometry.AsBinary()</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STAsBinary()</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STAsBinary()</span></td>
<td></td>
</tr>
<tr>
<td>geometry.AsText()</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.AsTextZM()</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.AsTextZM()</span></td>
<td></td>
</tr>
<tr>
<td>geometry.Boundary</td>
<td></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STBoundary()</span></td>
<td></td>
</tr>
<tr>
<td>geometry.Buffer(distance)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STBuffer(@distance)</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STBuffer(@distance)</span></td>
<td></td>
</tr>
<tr>
<td>geometry.Centroid</td>
<td></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STCentroid()</span></td>
<td></td>
</tr>
<tr>
<td>geometry.Contains(g)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STContains(@g)</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STContains(@g)</span></td>
<td></td>
</tr>
<tr>
<td>geometry.ConvexHull()</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STConvexHull()</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STConvexHull()</span></td>
<td></td>
</tr>
<tr>
<td>geometry.Crosses(g)</td>
<td></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STCrosses(@g)</span></td>
<td></td>
</tr>
<tr>
<td>geometry.Difference(other)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STDifference(@other)</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STDifference(@other)</span></td>
<td></td>
</tr>
<tr>
<td>geometry.Dimension</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STDimension()</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STDimension()</span></td>
<td></td>
</tr>
<tr>
<td>geometry.Disjoint(g)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STDisjoint(@g)</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STDisjoint(@g)</span></td>
<td></td>
</tr>
<tr>
<td>geometry.Distance(g)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STDistance(@g)</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STDistance(@g)</span></td>
<td></td>
</tr>
<tr>
<td>geometry.Envelope</td>
<td></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STEnvelope()</span></td>
<td></td>
</tr>
<tr>
<td>geometry.EqualsTopologically(g)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STEquals(@g)</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STEquals(@g)</span></td>
<td></td>
</tr>
<tr>
<td>geometry.GeometryType</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STGeometryType()</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STGeometryType()</span></td>
<td></td>
</tr>
<tr>
<td>geometry.GetGeometryN(n)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STGeometryN(@n</span> + 1)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STGeometryN(@n</span> + 1)</td>
<td></td>
</tr>
<tr>
<td>geometry.InteriorPoint</td>
<td></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STPointOnSurface()</span></td>
<td></td>
</tr>
<tr>
<td>geometry.Intersection(other)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STIntersection(@other)</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STIntersection(@other)</span></td>
<td></td>
</tr>
<tr>
<td>geometry.Intersects(g)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STIntersects(@g)</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STIntersects(@g)</span></td>
<td></td>
</tr>
<tr>
<td>geometry.IsEmpty</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STIsEmpty()</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STIsEmpty()</span></td>
<td></td>
</tr>
<tr>
<td>geometry.IsSimple</td>
<td></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STIsSimple()</span></td>
<td></td>
</tr>
<tr>
<td>geometry.IsValid</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STIsValid()</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STIsValid()</span></td>
<td></td>
</tr>
<tr>
<td>geometry.IsWithinDistance(geom, distance)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STDistance(@geom)</span> &lt;= <span class="no-loc" dir="ltr" lang="en-us">@distance</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STDistance(@geom)</span> &lt;= <span class="no-loc" dir="ltr" lang="en-us">@distance</span></td>
<td></td>
</tr>
<tr>
<td>geometry.Length</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STLength()</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STLength()</span></td>
<td></td>
</tr>
<tr>
<td>geometry.NumGeometries</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STNumGeometries()</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STNumGeometries()</span></td>
<td></td>
</tr>
<tr>
<td>geometry.NumPoints</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STNumPoints()</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STNumPoints()</span></td>
<td></td>
</tr>
<tr>
<td>geometry.OgcGeometryType</td>
<td>CASE <span class="no-loc" dir="ltr" lang="en-us">@geometry.STGeometryType()</span> WHEN N'Point' THEN 1 ... END</td>
<td>CASE <span class="no-loc" dir="ltr" lang="en-us">@geometry.STGeometryType()</span> WHEN N'Point' THEN 1 ... END</td>
<td></td>
</tr>
<tr>
<td>geometry.Overlaps(g)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STOverlaps(@g)</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STOverlaps(@g)</span></td>
<td></td>
</tr>
<tr>
<td>geometry.PointOnSurface</td>
<td></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STPointOnSurface()</span></td>
<td></td>
</tr>
<tr>
<td>geometry.Relate(g, intersectionPattern)</td>
<td></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STRelate(@g</span>, <span class="no-loc" dir="ltr" lang="en-us">@intersectionPattern)</span></td>
<td></td>
</tr>
<tr>
<td>geometry.SRID</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STSrid</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STSrid</span></td>
<td></td>
</tr>
<tr>
<td>geometry.SymmetricDifference(other)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STSymDifference(@other)</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STSymDifference(@other)</span></td>
<td></td>
</tr>
<tr>
<td>geometry.ToBinary()</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STAsBinary()</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STAsBinary()</span></td>
<td></td>
</tr>
<tr>
<td>geometry.ToText()</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.AsTextZM()</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.AsTextZM()</span></td>
<td></td>
</tr>
<tr>
<td>geometry.Touches(g)</td>
<td></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STTouches(@g)</span></td>
<td></td>
</tr>
<tr>
<td>geometry.Union(other)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STUnion(@other)</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STUnion(@other)</span></td>
<td></td>
</tr>
<tr>
<td>geometry.Within(g)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STWithin(@g)</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometry.STWithin(@g)</span></td>
<td></td>
</tr>
<tr>
<td>geometryCollection[i]</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometryCollection.STGeometryN(@i</span> + 1)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometryCollection.STGeometryN(@i</span> + 1)</td>
<td></td>
</tr>
<tr>
<td>geometryCollection.Count</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometryCollection.STNumGeometries()</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@geometryCollection.STNumGeometries()</span></td>
<td></td>
</tr>
<tr>
<td>lineString.Count</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@lineString.STNumPoints()</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@lineString.STNumPoints()</span></td>
<td></td>
</tr>
<tr>
<td>lineString.EndPoint</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@lineString.STEndPoint()</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@lineString.STEndPoint()</span></td>
<td></td>
</tr>
<tr>
<td>lineString.GetPointN(n)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@lineString.STPointN(@n</span> + 1)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@lineString.STPointN(@n</span> + 1)</td>
<td></td>
</tr>
<tr>
<td>lineString.IsClosed</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@lineString.STIsClosed()</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@lineString.STIsClosed()</span></td>
<td></td>
</tr>
<tr>
<td>lineString.IsRing</td>
<td></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@lineString.IsRing()</span></td>
<td></td>
</tr>
<tr>
<td>lineString.StartPoint</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@lineString.STStartPoint()</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@lineString.STStartPoint()</span></td>
<td></td>
</tr>
<tr>
<td>multiLineString.IsClosed</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@multiLineString.STIsClosed()</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@multiLineString.STIsClosed()</span></td>
<td></td>
</tr>
<tr>
<td>point.M</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@point.M</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@point.M</span></td>
<td></td>
</tr>
<tr>
<td>point.X</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@point.Long</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@point.STX</span></td>
<td></td>
</tr>
<tr>
<td>point.Y</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@point.Lat</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@point.STY</span></td>
<td></td>
</tr>
<tr>
<td>point.Z</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@point.Z</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@point.Z</span></td>
<td></td>
</tr>
<tr>
<td>polygon.ExteriorRing</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@polygon.RingN(1)</span></td>
<td><span class="no-loc" dir="ltr" lang="en-us">@polygon.STExteriorRing()</span></td>
<td></td>
</tr>
<tr>
<td>polygon.GetInteriorRingN(n)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@polygon.RingN(@n</span> + 2)</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@polygon.STInteriorRingN(@n</span> + 1)</td>
<td></td>
</tr>
<tr>
<td>polygon.NumInteriorRings</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@polygon.NumRings()</span> - 1</td>
<td><span class="no-loc" dir="ltr" lang="en-us">@polygon.STNumInteriorRing()</span></td>
<td></td>
</tr>
</tbody></table>

### Aggregate functions

<table><thead>
<tr>
<th>.NET</th>
<th>SQL</th>
<th>Added in</th>
</tr>
</thead>
<tbody>
<tr>
<td>GeometryCombiner.Combine(group.Select(x =&gt; x.Property))</td>
<td>CollectionAggregate(Property)</td>
<td>EF Core 7.0</td>
</tr>
<tr>
<td>ConvexHull.Create(group.Select(x =&gt; x.Property))</td>
<td>ConvexHullAggregate(Property)</td>
<td>EF Core 7.0</td>
</tr>
<tr>
<td>UnaryUnionOp.Union(group.Select(x =&gt; x.Property))</td>
<td>UnionAggregate(Property)</td>
<td>EF Core 7.0</td>
</tr>
<tr>
<td>EnvelopeCombiner.CombineAsGeometry(group.Select(x =&gt; x.Property))</td>
<td>EnvelopeAggregate(Property)</td>
<td>EF Core 7.0</td>
</tr>
</tbody></table>

## Additional resources

- Spatial Data in SQL Server

- NetTopologySuite Docs

Ref: [Spatial Data in the SQL Server EF Core Provider](https://learn.microsoft.com/en-us/ef/core/providers/sql-server/spatial)