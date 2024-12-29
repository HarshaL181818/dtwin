package com.dtwin.backend;

import java.awt.geom.Path2D;
import java.util.List;

public class GeometryUtils {

    public static boolean isPointInPolygon(List<Double> point, List<List<Double>> polygon) {
        Path2D.Double poly = new Path2D.Double();
        List<Double> firstPoint = polygon.getFirst();
        poly.moveTo(firstPoint.get(0), firstPoint.get(1));

        for (int i = 1; i < polygon.size(); i++) {
            List<Double> p = polygon.get(i);
            poly.lineTo(p.get(0), p.get(1));
        }

        poly.closePath();
        return poly.contains(point.get(0), point.get(1));
    }
}