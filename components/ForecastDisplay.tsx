import React, { useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ForecastResult, EventDetails, WeatherData, AggregatedHistoricalData } from '../types';
import { getWeatherCodeDescription } from '../services/weatherService';
import DownloadButtons from './DownloadButtons';
import WeatherIcon from './WeatherIcon';

interface ForecastDisplayProps {
  forecast: ForecastResult;
  eventDetails: EventDetails;
}

const HistoricalInfoBanner: React.FC = () => (
    <div className="bg-purple-900/40 border border-purple-700 text-purple-200 px-4 py-3 rounded-lg text-center mb-6">
        <p className="font-semibold">Climatological Forecast</p>
        <p className="text-sm">This long-range forecast is based on historical weather trends over the past 20 years for this date.</p>
    </div>
);

const DailyStats: React.FC<{ weather: WeatherData }> = ({ weather }) => (
    <>
        <div>
            <p className="text-sm text-gray-400">Probability</p>
            <p className="text-2xl font-semibold">{weather.precipitation_probability}%</p>
        </div>
        <div>
            <p className="text-sm text-gray-400">Temperature</p>
            <p className="text-2xl font-semibold">{Math.round(weather.temperature_2m)}°C</p>
        </div>
        <div>
            <p className="text-sm text-gray-400">Wind Speed</p>
            <p className="text-2xl font-semibold">{Math.round(weather.wind_speed_10m)} km/h</p>
        </div>
        <div>
            <p className="text-sm text-gray-400">Conditions</p>
            <div className="flex items-center justify-center gap-2 mt-1">
                <WeatherIcon code={weather.weather_code} className="h-7 w-7 text-gray-300" />
                <p className="text-xl font-semibold">{getWeatherCodeDescription(weather.weather_code)}</p>
            </div>
        </div>
    </>
);

const HistoricalStats: React.FC<{ weather: AggregatedHistoricalData }> = ({ weather }) => (
     <>
        <div>
            <p className="text-sm text-gray-400">Rainy Days</p>
            <p className="text-2xl font-semibold">{weather.rainyYears} / {weather.totalYears} yrs</p>
        </div>
        <div>
            <p className="text-sm text-gray-400">Avg. Temp</p>
            <p className="text-2xl font-semibold">{Math.round(weather.avgTemp)}°C</p>
        </div>
        <div>
            <p className="text-sm text-gray-400">Avg. Wind</p>
            <p className="text-2xl font-semibold">{Math.round(weather.avgWind)} km/h</p>
        </div>
        <div>
            <p className="text-sm text-gray-400">Commonly</p>
            <div className="flex items-center justify-center gap-2 mt-1">
                <WeatherIcon code={weather.mostCommonCode} className="h-7 w-7 text-gray-300" />
                <p className="text-xl font-semibold">{weather.conditions}</p>
            </div>
        </div>
    </>
);


const ForecastDisplay: React.FC<ForecastDisplayProps> = ({ forecast, eventDetails }) => {
  const { gemini, weather, hourly, forecastType } = forecast;
  const isHistorical = forecastType === 'historical';
  const chartRef = useRef<HTMLDivElement>(null);

  const eventTime = new Date(`${eventDetails.date}T${eventDetails.time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const eventDate = new Date(eventDetails.date + 'T00:00:00').toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const getBackgroundColor = (condition: string, probability: number): string => {
    if (condition === 'very wet' || probability >= 40) return 'bg-blue-900/40';
    if (condition === 'very hot') return 'bg-red-900/40';
    if (condition === 'hot') return 'bg-orange-900/40';
    if (condition === 'standard') return 'bg-green-900/40';
    if (condition === 'cold') return 'bg-cyan-900/40';
    if (condition === 'very cold') return 'bg-sky-900/40';
    if (condition === 'very windy') return 'bg-teal-900/40';
    return 'bg-green-900/40'; // Default for pleasant conditions
  };

  return (
    <div className="mt-8 animate-fade-in">
        <div className={`text-center p-8 rounded-t-2xl border-x border-t border-white/10 ${getBackgroundColor(gemini.condition, gemini.rainProbability)}`}>
            <p className="text-xl text-gray-300">Forecast for {eventDetails.location} on</p>
            <p className="text-xl text-gray-300">{eventDate}</p>
            <div className="flex justify-center items-center gap-4 mt-4 mb-2">
                <WeatherIcon 
                    code={isHistorical ? (weather as AggregatedHistoricalData).mostCommonCode : (weather as WeatherData).weather_code} 
                    className="h-16 w-16 text-white" 
                />
                <h2 className="text-5xl font-bold tracking-tight capitalize">
                    {gemini.condition}
                </h2>
            </div>
            <p className="text-6xl font-bold">{Math.round(gemini.rainProbability)}%</p>
            <p className="text-lg text-gray-300">Chance of Rain</p>
        </div>
        <div className="bg-white/5 p-8 rounded-b-2xl shadow-2xl border border-white/10 backdrop-blur-sm space-y-8">
            {isHistorical && <HistoricalInfoBanner />}
            
            {!isHistorical && hourly && (
                <div>
                    <h3 className="text-lg font-semibold text-purple-300 mb-4">Hourly Precipitation Outlook (around {eventTime})</h3>
                    <div className="h-64 w-full" ref={chartRef}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={hourly} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                                <YAxis unit="%" stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(30, 41, 59, 0.8)',
                                        borderColor: 'rgba(255, 255, 255, 0.2)',
                                        borderRadius: '0.5rem',
                                    }}
                                    labelStyle={{ color: '#d1d5db' }}
                                />
                                <Legend wrapperStyle={{fontSize: "14px"}}/>
                                <Line type="monotone" dataKey="precipitation" name="Chance of Rain" stroke="#a78bfa" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t border-white/10 pt-6">
                {isHistorical 
                    ? <HistoricalStats weather={weather as AggregatedHistoricalData} /> 
                    : <DailyStats weather={weather as WeatherData} />}
            </div>

            <DownloadButtons 
                forecast={forecast}
                eventDetails={eventDetails}
                chartRef={chartRef}
            />
        </div>
    </div>
  );
};

export default ForecastDisplay;