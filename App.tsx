
import React, { useState, useCallback } from 'react';
import type { EventDetails, WeatherData, ForecastResult, HourlyWeatherData, AggregatedHistoricalData } from './types';
import EventForm from './components/EventForm';
import ForecastDisplay from './components/ForecastDisplay';
import Loader from './components/Loader';
import { getCoordinates, getWeather, getHistoricalWeather } from './services/weatherService';
import { getForecastSummary } from './services/geminiService';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);

  const handleFormSubmit = useCallback(async (details: EventDetails) => {
    setIsLoading(true);
    setError(null);
    setForecast(null);
    setEventDetails(details);

    try {
      const coordinates = await getCoordinates(details.location);
      if (!coordinates) {
        throw new Error("Could not find location. Please try a more specific address or city.");
      }

      const eventDate = new Date(details.date + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 15) {
        // --- Daily Forecast Logic (within 16 days) ---
        const weather = await getWeather(coordinates.latitude, coordinates.longitude, details.date);
        if (!weather || weather.hourly.time.length === 0) {
          throw new Error("Could not retrieve weather data for the specified date.");
        }
        
        const eventDateTime = new Date(`${details.date}T${details.time}`);
        const eventHourIndex = weather.hourly.time.findIndex(t => new Date(t).getHours() === eventDateTime.getHours());

        if (eventHourIndex === -1) {
          throw new Error("Weather data for the specific time is not available. Please try an earlier time on the same day.");
        }
        
        const relevantWeatherData: WeatherData = {
          time: weather.hourly.time[eventHourIndex],
          temperature_2m: weather.hourly.temperature_2m[eventHourIndex],
          precipitation_probability: weather.hourly.precipitation_probability[eventHourIndex],
          weather_code: weather.hourly.weather_code[eventHourIndex],
          wind_speed_10m: weather.hourly.wind_speed_10m[eventHourIndex],
        };

        const chartDataStart = Math.max(0, eventHourIndex - 3);
        const chartDataEnd = Math.min(weather.hourly.time.length, eventHourIndex + 4);
        const hourlyChartData: HourlyWeatherData[] = weather.hourly.time.slice(chartDataStart, chartDataEnd).map((time, i) => ({
          time: new Date(time).toLocaleTimeString([], { hour: 'numeric', hour12: true }),
          precipitation: weather.hourly.precipitation_probability[chartDataStart + i],
        }));

        const geminiResponse = await getForecastSummary(relevantWeatherData);
        
        setForecast({
          forecastType: 'daily',
          gemini: geminiResponse,
          weather: relevantWeatherData,
          hourly: hourlyChartData
        });

      } else {
        // --- Historical Forecast Logic (beyond 16 days) ---
        const historicalData: AggregatedHistoricalData = await getHistoricalWeather(coordinates.latitude, coordinates.longitude, details.date);
        const geminiResponse = await getForecastSummary(historicalData);

        setForecast({
          forecastType: 'historical',
          gemini: geminiResponse,
          weather: historicalData,
        });
      }

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <main className="container mx-auto px-4 py-8 md:py-16">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-white">
            Will It Rain on My Düğün?
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            An intelligent forecaster for your outdoor events, powered by NASA data and AI.
          </p>
        </header>

        <div className="max-w-2xl mx-auto">
            <div className="bg-white/5 p-8 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-sm">
                <EventForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            </div>

            {isLoading && <Loader />}
            
            {error && (
                <div className="mt-8 bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-center">
                    <p className="font-semibold">Oh no! An error occurred.</p>
                    <p>{error}</p>
                </div>
            )}
            
            {forecast && eventDetails && !isLoading && (
              <ForecastDisplay forecast={forecast} eventDetails={eventDetails} />
            )}
        </div>

        <footer className="text-center mt-16 text-gray-500 text-sm">
          <p>This project utilizes data derived from sources like the NASA GPM mission, aggregated through open meteorological APIs.</p>
          <p>© Lemniscate, 2025</p>
        </footer>
      </main>
    </div>
  );
};

export default App;