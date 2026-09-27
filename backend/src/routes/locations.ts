import type { Router } from 'express';
import { Router as createRouter } from 'express';
import {
  createLocation,
  deleteLocation,
  getLocation,
  listLocations,
  updateWeather,
} from '../db.js';
import type { LocationRecord } from '../db.js';
import { SingaporeWeatherClient, WeatherProviderError, type WeatherSnapshot } from '../weather.js';
import { logger } from '../logger.js';

export interface WeatherClient {
  getCurrentWeather(latitude: number, longitude: number): Promise<WeatherSnapshot>;
}

interface LocationsRouterOptions {
  weatherClient?: WeatherClient;
}

export function createLocationsRouter(options: LocationsRouterOptions = {}): Router {
  const router: Router = createRouter();
  const weatherClient =
    options.weatherClient ?? new SingaporeWeatherClient({ apiKey: process.env.WEATHER_API_KEY });

  router.get('/locations', async (_request, response, next) => {
    try {
      response.json({ locations: await listLocations() });
    } catch (error) {
      next(error);
    }
  });

  router.post('/locations', async (request, response, next) => {
    try {
      const latitude = Number(request.body?.latitude);
      const longitude = Number(request.body?.longitude);

      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        response.status(422).json({ detail: 'latitude and longitude are required' });
        return;
      }
      if (!(1.1 <= latitude && latitude <= 1.5 && 103.6 <= longitude && longitude <= 104.1)) {
        response.status(422).json({
          detail: 'Coordinates must be within Singapore (lat 1.1-1.5, lon 103.6-104.1)',
        });
        return;
      }

      const location = await createLocation(latitude, longitude);

      try {
        const snapshot = await weatherClient.getCurrentWeather(
          location.latitude,
          location.longitude,
        );
        const updated = await updateWeather(location.id, snapshot);
        response.status(201).json(updated ?? location);
      } catch (error) {
        if (!(error instanceof WeatherProviderError)) throw error;
        logger.warn(
          { err: error, locationId: location.id },
          'weather refresh failed after location create',
        );
        response.status(201).json(location);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'DuplicateLocationError') {
        logger.warn({ err: error }, 'duplicate location rejected');
        response.status(409).json({ detail: error.message });
        return;
      }
      next(error);
    }
  });

  router.get('/locations/:locationId', async (request, response, next) => {
    try {
      const location = await getLocation(Number(request.params.locationId));
      if (!location) {
        response.status(404).json({ detail: 'Location not found' });
        return;
      }
      response.json(location);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/locations/:locationId', async (request, response, next) => {
    try {
      const deleted = await deleteLocation(Number(request.params.locationId));
      if (!deleted) {
        response.status(404).json({ detail: 'Location not found' });
        return;
      }
      response.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  router.post('/locations/:locationId/refresh', async (request, response, next) => {
    try {
      const locationId = Number(request.params.locationId);
      const location = await getLocation(locationId);
      if (!location) {
        response.status(404).json({ detail: 'Location not found' });
        return;
      }

      const freshSnapshot = await weatherClient.getCurrentWeather(
        location.latitude,
        location.longitude,
      );
      const snapshot = keepLastKnownWeather(freshSnapshot, location.weather);
      const updated = await updateWeather(locationId, snapshot);
      response.json(updated);
    } catch (error) {
      if (error instanceof WeatherProviderError) {
        response.status(502).json({ detail: error.message });
        return;
      }
      next(error);
    }
  });

  return router;
}

function keepLastKnownWeather(
  fresh: WeatherSnapshot,
  previous: LocationRecord['weather'],
): LocationRecord['weather'] {
  return {
    ...fresh,
    condition:
      fresh.condition === 'Unavailable' && previous.condition !== 'Not refreshed'
        ? previous.condition
        : fresh.condition,
    observed_at: fresh.observed_at || previous.observed_at,
    area: fresh.area ?? previous.area,
    valid_period_text: fresh.valid_period_text ?? previous.valid_period_text,
    temperature_c: fresh.temperature_c ?? previous.temperature_c,
    humidity_percent: fresh.humidity_percent ?? previous.humidity_percent,
    rainfall_mm: fresh.rainfall_mm ?? previous.rainfall_mm,
    wind_speed_knots: fresh.wind_speed_knots ?? previous.wind_speed_knots,
    wind_direction_degrees: fresh.wind_direction_degrees ?? previous.wind_direction_degrees,
    forecast_low_c: fresh.forecast_low_c ?? previous.forecast_low_c,
    forecast_high_c: fresh.forecast_high_c ?? previous.forecast_high_c,
    uv_index: fresh.uv_index ?? previous.uv_index,
    psi_twenty_four_hourly: fresh.psi_twenty_four_hourly ?? previous.psi_twenty_four_hourly,
    pm25_one_hourly: fresh.pm25_one_hourly ?? previous.pm25_one_hourly,
    air_quality_region: fresh.air_quality_region ?? previous.air_quality_region,
    forecast_periods:
      fresh.forecast_periods.length > 0 ? fresh.forecast_periods : previous.forecast_periods,
    daily_forecast:
      fresh.daily_forecast.length > 0 ? fresh.daily_forecast : previous.daily_forecast,
  };
}
