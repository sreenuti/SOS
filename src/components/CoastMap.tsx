"use client";

import { useState, useCallback, useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { useStation } from "@/context/StationContext";
import InfoIcon from "./InfoIcon";

const MAP_CONTAINER_STYLE = { width: "100%", height: "340px", borderRadius: "0.5rem" };
const DEFAULT_CENTER = { lat: 39.5, lng: -95.5 };
const DEFAULT_ZOOM = 4;

export default function CoastMap() {
  const { stations, selectedStationId, setSelectedStationId } = useStation();
  const [open, setOpen] = useState(true);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
  });

  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      if (stations.length === 0) return;
      const bounds = new google.maps.LatLngBounds();
      stations.forEach((s) => bounds.extend({ lat: s.lat, lng: s.lon }));
      map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
    },
    [stations]
  );

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      mapTypeId: "satellite",
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: true,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: true,
      styles: [
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#0e7490" }, { lightness: 20 }],
        },
        {
          featureType: "landscape.natural",
          elementType: "geometry",
          stylers: [{ color: "#0f172a" }, { lightness: 5 }],
        },
      ],
    }),
    []
  );

  return (
    <div className="glass-card border border-ocean-border/60 bg-ocean-card/40 backdrop-blur-sm overflow-visible">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 p-4 text-left hover:bg-ocean-border/10 transition-colors rounded-t-lg"
        aria-expanded={open}
        aria-controls="coast-map-content"
        id="coast-map-heading"
      >
        <h3 className="text-ocean-cyan text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
          National SOS Marine Network
          <span onClick={(e) => e.stopPropagation()}>
            <InfoIcon
              ariaLabel="About the map"
              placement="below"
              content="NOAA CO-OPS stations along the U.S. coast. Click a marker to load live water temperature, turbidity, and vessel data for that station. The selected station drives all real-time metrics and regional baselines."
            />
          </span>
        </h3>
        <span
          className="text-ocean-cyan shrink-0 transition-transform duration-200"
          aria-hidden
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>
      <div
        id="coast-map-content"
        role="region"
        aria-labelledby="coast-map-heading"
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: open ? "420px" : "0" }}
      >
        <div className="px-4 pb-4 pt-0">
          <p className="text-ocean-muted text-xs mb-3">
            Click a marker to load real-time data for that station.
          </p>
          {loadError && (
            <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-amber-200 text-sm">
              Could not load Google Maps. Check your connection or API key.
            </div>
          )}
          {!apiKey && (
            <div className="rounded-lg border border-ocean-border bg-ocean-card/60 px-4 py-4 text-ocean-muted text-sm">
              Add <code className="text-ocean-cyan">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to{" "}
              <code className="text-ocean-cyan">.env.local</code> to show the map.
            </div>
          )}
          {apiKey && !isLoaded && !loadError && (
            <div className="rounded-lg border border-ocean-border bg-ocean-card/60 px-4 py-8 text-ocean-muted text-sm text-center">
              Loading map…
            </div>
          )}
          {apiKey && isLoaded && !loadError && (
            <GoogleMap
              mapContainerStyle={MAP_CONTAINER_STYLE}
              center={DEFAULT_CENTER}
              zoom={DEFAULT_ZOOM}
              onLoad={onMapLoad}
              options={mapOptions}
            >
              {stations.map((station) => (
                <Marker
                  key={station.id}
                  position={{ lat: station.lat, lng: station.lon }}
                  title={`${station.name} (${station.zone})`}
                  label={{
                    text: station.name,
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "600",
                  }}
                  onClick={() => setSelectedStationId(station.id)}
                  zIndex={station.id === selectedStationId ? 10 : 1}
                />
              ))}
            </GoogleMap>
          )}
        </div>
      </div>
    </div>
  );
}
