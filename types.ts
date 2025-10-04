export interface EventDetails {
  location: string;
  date: string;
  time: string;
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
}

export interface WeatherAPIResponse {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    weather_code: number[];
    wind_speed_10m: number[];
  };
}

export interface HistoricalWeatherAPIResponse {
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_mean: number[];
    precipitation_sum: number[];
    wind_speed_10m_mean: number[];
  };
}

export interface AggregatedHistoricalData {
  rainyYears: number;
  totalYears: number;
  avgTemp: number;
  avgWind: number;
  conditions: string;
  mostCommonCode: number;
}

export interface WeatherData {
  time: string;
  temperature_2m: number;
  precipitation_probability: number;
  weather_code: number;

  wind_speed_10m: number;
}

export interface GeminiForecast {
  condition: string; // "very hot", "hot", "standard", "cold", "very cold", "very windy", or "very wet"
  rainProbability: number; // A percentage from 0 to 100
}

export interface HourlyWeatherData {
    time: string;
    precipitation: number;
}

export type ForecastType = 'daily' | 'historical';

export interface ForecastResult {
  forecastType: ForecastType;
  gemini: GeminiForecast;
  weather: WeatherData | AggregatedHistoricalData;
  hourly?: HourlyWeatherData[];
}