import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet';
import { useStore } from '../state/store';
import { formatTemperature } from './format';
import type { Location } from '../types';

const SINGAPORE_CENTER: [number, number] = [1.3521, 103.8198];
const OPEN_STREET_MAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function markerIcon(isSelected: boolean) {
  return L.divIcon({
    className: 'weather-map-marker-icon',
    html: `<span class="weather-map-pin${isSelected ? ' weather-map-pin-selected' : ''}"><span></span></span>`,
    iconSize: [26, 34],
    iconAnchor: [13, 32],
    tooltipAnchor: [0, -30],
  });
}

function MapCamera({ locations }: { locations: Location[] }) {
  const map = useMap();
  const locationsRef = useRef(locations);
  locationsRef.current = locations;
  const locationsKey = locations
    .map(({ id, latitude, longitude }) => `${id}:${latitude},${longitude}`)
    .join('|');

  useEffect(() => {
    const currentLocations = locationsRef.current;
    if (currentLocations.length === 0) {
      map.setView(SINGAPORE_CENTER, 11);
      return;
    }

    if (currentLocations.length === 1) {
      const [location] = currentLocations;
      map.setView([location.latitude, location.longitude], 12);
      return;
    }

    const bounds = L.latLngBounds(
      currentLocations.map(({ latitude, longitude }) => L.latLng(latitude, longitude)),
    );
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 12 });
  }, [locationsKey, map]);

  return null;
}

function MapSizeSync({ expanded }: { expanded: boolean }) {
  const map = useMap();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      map.invalidateSize({ pan: false });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [expanded, map]);

  return null;
}

function ScrollWheelZoomSync({ expanded }: { expanded: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (expanded) map.scrollWheelZoom.enable();
    else map.scrollWheelZoom.disable();
  }, [expanded, map]);

  return null;
}

export function WeatherMapCard() {
  const { locations, selectedId, select } = useStore();
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const expandButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasExpanded = useRef(false);

  const center = useMemo<[number, number]>(() => {
    const selected = locations.find((location) => location.id === selectedId);
    return selected
      ? [selected.latitude, selected.longitude]
      : SINGAPORE_CENTER;
  }, [locations, selectedId]);

  useEffect(() => {
    if (expanded) {
      wasExpanded.current = true;
      closeButtonRef.current?.focus();
    } else if (wasExpanded.current) {
      wasExpanded.current = false;
      expandButtonRef.current?.focus();
    }
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;

    const previousOverflow = document.body.style.overflow;
    const dashboardScroller = cardRef.current?.closest('main');
    const previousDashboardOverflow = dashboardScroller?.style.overflow;
    document.body.style.overflow = 'hidden';
    if (dashboardScroller) dashboardScroller.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setExpanded(false);
        return;
      }

      if (event.key !== 'Tab' || !cardRef.current) return;
      const focusable = cardRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dashboardScroller && previousDashboardOverflow !== undefined) {
        dashboardScroller.style.overflow = previousDashboardOverflow;
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [expanded]);

  const hasLocations = locations.length > 0;

  return (
    <section
      ref={cardRef}
      role={expanded ? 'dialog' : undefined}
      aria-modal={expanded ? true : undefined}
      aria-label={expanded ? 'Fullscreen location map' : 'Saved locations map'}
      className={`weather-map-card ${expanded ? 'weather-map-card-expanded' : ''}`}
    >
      <header className="weather-map-card-header">
        <div>
          <p className="weather-map-eyebrow">Your places</p>
          <h2 className="weather-map-title">Weather map</h2>
        </div>
        {expanded ? (
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close fullscreen map"
            title="Close map"
            onClick={() => setExpanded(false)}
            className="weather-map-action"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        ) : (
          <button
            ref={expandButtonRef}
            type="button"
            disabled={!hasLocations}
            aria-label="Expand map to fullscreen"
            title="Expand map"
            onClick={() => setExpanded(true)}
            className="weather-map-action disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 4H4v4M16 4h4v4M4 16v4h4m12-4v4h-4M4 8l6-6m10 6-6-6M4 16l6 6m10-6-6 6" />
            </svg>
          </button>
        )}
      </header>

      {hasLocations ? (
        <div className={`weather-map-viewport ${expanded ? 'weather-map-viewport-expanded' : ''}`}>
          <MapContainer
            center={center}
            zoom={11}
            scrollWheelZoom={false}
            className="weather-map"
          >
            <TileLayer
              attribution={OPEN_STREET_MAP_ATTRIBUTION}
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapCamera locations={locations} />
            <MapSizeSync expanded={expanded} />
            <ScrollWheelZoomSync expanded={expanded} />
            {locations.map((location) => {
              const condition = location.weather.condition || 'Weather unavailable';
              const temperature = formatTemperature(location.weather.temperature_c);
              const area =
                location.weather.area ||
                `${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}`;
              const isSelected = location.id === selectedId;

              return (
                <Marker
                  key={location.id}
                  position={[location.latitude, location.longitude]}
                  icon={markerIcon(isSelected)}
                  title={`${area}: ${temperature}, ${condition}`}
                  zIndexOffset={isSelected ? 1000 : 0}
                  eventHandlers={{ click: () => select(location.id) }}
                >
                  <Tooltip direction="top" offset={[0, -8]} permanent>
                    <span className="weather-map-label">
                      <strong>{temperature}</strong>
                      <span>{condition}</span>
                    </span>
                  </Tooltip>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      ) : (
        <div className="weather-map-empty">
          <p className="text-sm font-medium text-slate-700">Your map is ready</p>
          <p className="mt-1 text-xs text-slate-500">Add a location to see its weather here.</p>
        </div>
      )}
    </section>
  );
}
