import type { GeocodeResult, WeatherAPIResponse, HistoricalWeatherAPIResponse, AggregatedHistoricalData } from '../types';

// WMO Weather interpretation codes (WW)
const WEATHER_CODE_MAP: { [key: number]: string } = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
};

export const getWeatherCodeDescription = (code: number): string => {
    return WEATHER_CODE_MAP[code] || 'Unknown weather condition';
}

export const getCoordinates = async (location: string): Promise<GeocodeResult | null> => {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Geocoding API error:", response.statusText);
      return null;
    }
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const { latitude, longitude } = data.results[0];
      return { latitude, longitude };
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch coordinates:", error);
    return null;
  }
};

export const getWeather = async (lat: number, lon: number, date: string): Promise<WeatherAPIResponse | null> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m&models=gfs_global&start_date=${date}&end_date=${date}&timezone=auto`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
        console.error("Weather API error:", response.statusText);
      return null;
    }
    const data: WeatherAPIResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    return null;
  }
};

export const getHistoricalWeather = async (lat: number, lon: number, date: string): Promise<AggregatedHistoricalData> => {
    const targetDate = new Date(date);
    const month = targetDate.getMonth() + 1;
    const day = targetDate.getDate();
    const currentYear = new Date().getFullYear();
    const yearsToFetch = 20;

    const promises: Promise<HistoricalWeatherAPIResponse>[] = [];

    for (let i = 1; i <= yearsToFetch; i++) {
        const year = currentYear - i;
        const historicalDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${historicalDate}&end_date=${historicalDate}&daily=weather_code,temperature_2m_mean,precipitation_sum,wind_speed_10m_mean&timezone=auto`;
        promises.push(fetch(url).then(res => res.json()));
    }

    const results = await Promise.all(promises);

    let rainyYears = 0;
    const temps: number[] = [];
    const winds: number[] = [];
    const weatherCodes: number[] = [];
    let validYears = 0;

    results.forEach(res => {
        if (res.daily && res.daily.precipitation_sum && res.daily.precipitation_sum[0] != null) {
            validYears++;
            if (res.daily.precipitation_sum[0] > 0.1) { // More than 0.1mm is a rainy day
                rainyYears++;
            }
            temps.push(res.daily.temperature_2m_mean[0]);
            winds.push(res.daily.wind_speed_10m_mean[0]);
            weatherCodes.push(res.daily.weather_code[0]);
        }
    });

    if (validYears === 0) {
        throw new Error("Could not retrieve any historical weather data for this location and date.");
    }
    
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const avgWind = winds.reduce((a, b) => a + b, 0) / winds.length;

    // Find most common weather condition
    const codeFrequency = weatherCodes.reduce((acc, code) => {
        acc[code] = (acc[code] || 0) + 1;
        return acc;
    }, {} as {[key: number]: number});

    const mostCommonCode = Object.keys(codeFrequency).reduce((a, b) => codeFrequency[parseInt(a)] > codeFrequency[parseInt(b)] ? a : b);
    const conditions = getWeatherCodeDescription(parseInt(mostCommonCode));

    return {
        rainyYears,
        totalYears: validYears,
        avgTemp,
        avgWind,
        conditions,
        mostCommonCode: parseInt(mostCommonCode),
    };
};