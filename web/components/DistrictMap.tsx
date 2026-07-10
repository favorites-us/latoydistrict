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

const BRAND = "#d6452c";

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}

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

    const features: GeoJSON.Feature<GeoJSON.Point>[] = stores.map((s) => ({
      type: "Feature",
      properties: { slug: s.slug, name: s.name, line1: s.line1 },
      geometry: { type: "Point", coordinates: [s.lng, s.lat] },
    }));
    const data: GeoJSON.FeatureCollection<GeoJSON.Point> = {
      type: "FeatureCollection",
      features,
    };

    const storeLink = (slug: string, name: string) =>
      `<a href="${localePath(locale, `/stores/${slug}`)}">${escapeHtml(name)}</a>`;

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
        paint: { "fill-color": BRAND, "fill-opacity": 0.07 },
      });
      map.addLayer({
        id: "district-line",
        type: "line",
        source: "district",
        paint: { "line-color": BRAND, "line-width": 2, "line-dasharray": [2, 1.5] },
      });

      // clustered store source — collapses same-building tenants into one bubble
      map.addSource("stores", {
        type: "geojson",
        data,
        cluster: true,
        clusterRadius: 40,
        clusterMaxZoom: 18,
      });

      // single (unclustered) store dots
      map.addLayer({
        id: "store-point",
        type: "circle",
        source: "stores",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": BRAND,
          "circle-radius": 7,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });

      // cluster bubbles, sized by how many stores they hold
      map.addLayer({
        id: "store-cluster",
        type: "circle",
        source: "stores",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": BRAND,
          "circle-opacity": 0.9,
          "circle-radius": ["step", ["get", "point_count"], 15, 5, 19, 15, 24],
          "circle-stroke-width": 3,
          "circle-stroke-color": "rgba(214,69,44,0.25)",
        },
      });
      // Cluster counts as HTML markers — a raster style ships no glyphs, so a
      // symbol/text layer can't render. pointer-events:none lets clicks fall
      // through to the circle layer below.
      const countMarkers: Record<number, maplibregl.Marker> = {};
      const renderCounts = () => {
        if (!map.getLayer("store-cluster")) return;
        const feats = map.queryRenderedFeatures({ layers: ["store-cluster"] });
        const seen = new Set<number>();
        for (const f of feats) {
          const props = f.properties as { cluster_id: number; point_count_abbreviated: string };
          const id = props.cluster_id;
          if (seen.has(id)) continue;
          seen.add(id);
          const coords = (f.geometry as GeoJSON.Point).coordinates as [number, number];
          const label = String(props.point_count_abbreviated);
          let marker = countMarkers[id];
          if (!marker) {
            const div = document.createElement("div");
            div.style.cssText =
              "color:#fff;font-weight:700;font-size:12px;line-height:1;pointer-events:none;font-family:system-ui,sans-serif;";
            div.textContent = label;
            marker = new maplibregl.Marker({ element: div }).setLngLat(coords).addTo(map);
            countMarkers[id] = marker;
          } else {
            marker.setLngLat(coords);
            marker.getElement().textContent = label;
          }
        }
        for (const key of Object.keys(countMarkers)) {
          const id = Number(key);
          if (!seen.has(id)) {
            countMarkers[id].remove();
            delete countMarkers[id];
          }
        }
      };
      map.on("render", renderCounts);

      map.on("mouseenter", "store-cluster", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "store-cluster", () => (map.getCanvas().style.cursor = ""));
      map.on("mouseenter", "store-point", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "store-point", () => (map.getCanvas().style.cursor = ""));

      // single store → its listing
      map.on("click", "store-point", (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const p = f.properties as { slug: string; name: string; line1: string };
        new maplibregl.Popup({ offset: 14 })
          .setLngLat((f.geometry as GeoJSON.Point).coordinates as [number, number])
          .setHTML(`${storeLink(p.slug, p.name)}<br/>${escapeHtml(p.line1)}`)
          .addTo(map);
      });

      // cluster → zoom to split when the stores sit at different spots;
      // if they share a building (same coord), list every tenant instead.
      map.on("click", "store-cluster", (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const clusterId = (f.properties as { cluster_id: number }).cluster_id;
        const src = map.getSource("stores") as maplibregl.GeoJSONSource;
        const center = (f.geometry as GeoJSON.Point).coordinates as [number, number];
        void src.getClusterLeaves(clusterId, Infinity, 0).then((leaves) => {
          const coordKeys = new Set(
            leaves.map((l) => (l.geometry as GeoJSON.Point).coordinates.join(",")),
          );
          const separable = coordKeys.size > 1 && map.getZoom() < 18;
          if (separable) {
            void src.getClusterExpansionZoom(clusterId).then((zoom) => {
              map.easeTo({ center, zoom: Math.min(zoom, 18.5) });
            });
          } else {
            const list = leaves
              .map((l) => {
                const p = l.properties as { slug: string; name: string; line1: string };
                return `<li>${storeLink(p.slug, p.name)}</li>`;
              })
              .join("");
            new maplibregl.Popup({ offset: 14, maxWidth: "260px" })
              .setLngLat(center)
              .setHTML(
                `<strong>${leaves.length} businesses here</strong>` +
                  `<ul class="map-tenants">${list}</ul>`,
              )
              .addTo(map);
          }
        });
      });
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [stores, locale]);

  return <div ref={el} style={{ height: "100%", width: "100%" }} />;
}
