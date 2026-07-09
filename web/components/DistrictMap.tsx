"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { localePath, type Locale } from "@/lib/i18n";

export interface MapStore {
  slug: string;
  name: string;
  line1: string;
  lat: number;
  lng: number;
}

// district outline derived from real store coordinates (pipeline data)
const DISTRICT_RING: [number, number][] = [
  [-118.2462, 34.049],
  [-118.2412, 34.047],
  [-118.244, 34.0441],
  [-118.2489, 34.0462],
  [-118.2462, 34.049],
];

export default function DistrictMap({ stores, locale }: { stores: MapStore[]; locale: Locale }) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!el.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: el.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: [-118.2448, 34.0462],
      zoom: 15.4,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.on("load", () => {
      map.addSource("district", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "Polygon", coordinates: [DISTRICT_RING] },
        },
      });
      map.addLayer({
        id: "district-fill",
        type: "fill",
        source: "district",
        paint: { "fill-color": "#d6452c", "fill-opacity": 0.07 },
      });
      map.addLayer({
        id: "district-line",
        type: "line",
        source: "district",
        paint: { "line-color": "#d6452c", "line-width": 2, "line-dasharray": [2, 1.5] },
      });
    });
    for (const s of stores) {
      const popup = new maplibregl.Popup({ offset: 18 }).setHTML(
        `<a href="${localePath(locale, `/stores/${s.slug}`)}">${s.name}</a><br/>${s.line1}`,
      );
      new maplibregl.Marker({ color: "#d6452c", scale: 0.72 })
        .setLngLat([s.lng, s.lat])
        .setPopup(popup)
        .addTo(map);
    }
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [stores, locale]);

  return <div ref={el} style={{ height: "100%", width: "100%" }} />;
}
