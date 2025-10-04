import React from 'react';
import type { ForecastResult, EventDetails, WeatherData, AggregatedHistoricalData, HourlyWeatherData } from '../types';
import { getWeatherCodeDescription } from '../services/weatherService';
import DownloadJsonIcon from './icons/DownloadJsonIcon';
import DownloadCsvIcon from './icons/DownloadCsvIcon';
import DownloadImageIcon from './icons/DownloadImageIcon';

interface DownloadButtonsProps {
    forecast: ForecastResult;
    eventDetails: EventDetails;
    chartRef: React.RefObject<HTMLDivElement>;
}

const DownloadButtons: React.FC<DownloadButtonsProps> = ({ forecast, eventDetails, chartRef }) => {
    const isHistorical = forecast.forecastType === 'historical';
    const locationFilename = eventDetails.location.replace(/[^a-zA-Z0-9]/g, '_');
    const dateFilename = eventDetails.date;

    const createExportData = () => {
        const baseData = {
            query: { ...eventDetails, forecastType: forecast.forecastType },
            forecast: forecast.gemini,
        };

        if (isHistorical) {
            const weather = forecast.weather as AggregatedHistoricalData;
            return {
                ...baseData,
                data: weather,
                metadata: {
                    units: { avgTemp: '°C', avgWind: 'km/h' },
                    dataSource: {
                        name: "Open-Meteo Historical Weather API",
                        url: "https://open-meteo.com/en/docs/historical-weather-api"
                    }
                }
            };
        } else {
            const weather = forecast.weather as WeatherData;
            return {
                ...baseData,
                data: {
                    forEventTime: {
                        time: weather.time,
                        temperature_2m: weather.temperature_2m,
                        precipitation_probability: weather.precipitation_probability,
                        wind_speed_10m: weather.wind_speed_10m,
                        weather: getWeatherCodeDescription(weather.weather_code)
                    },
                    hourlyOutlook: forecast.hourly,
                },
                metadata: {
                    units: { temperature_2m: '°C', precipitation_probability: '%', wind_speed_10m: 'km/h' },
                    dataSource: {
                        name: "Open-Meteo Weather Forecast API",
                        url: "https://open-meteo.com/en/docs"
                    }
                }
            };
        }
    };

    const downloadFile = (content: string, filename: string, contentType: string) => {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleJsonDownload = () => {
        const data = createExportData();
        const jsonString = JSON.stringify(data, null, 2);
        downloadFile(jsonString, `forecast_${locationFilename}_${dateFilename}.json`, 'application/json');
    };

    const handleCsvDownload = () => {
        const data = createExportData();
        let csvContent = "";

        if (isHistorical) {
            const weather = data.data as AggregatedHistoricalData;
            const headers = "location,date,forecast_type,forecast_condition,forecast_rain_probability_percent,historical_avg_temp_c,historical_avg_wind_kmh,historical_rainy_years,historical_total_years,historical_common_conditions\n";
            const row = [
                `"${eventDetails.location}"`, eventDetails.date, "historical", data.forecast.condition,
                data.forecast.rainProbability, weather.avgTemp.toFixed(1), weather.avgWind.toFixed(1),
                weather.rainyYears, weather.totalYears, `"${weather.conditions}"`
            ].join(',');
            csvContent = headers + row;
        } else {
            // FIX: Add type assertion as TypeScript cannot infer the data shape within this block.
            const dailyData = data.data as {
                forEventTime: {
                    time: string;
                    temperature_2m: number;
                    precipitation_probability: number;
                    wind_speed_10m: number;
                    weather: string;
                };
                hourlyOutlook?: HourlyWeatherData[];
            };
            const weather = dailyData.forEventTime;
            const hourly = dailyData.hourlyOutlook || [];
            const headers = "location,date,time,forecast_condition,forecast_rain_probability_percent,event_time_temp_c,event_time_precip_prob_percent,event_time_wind_kmh,event_time_weather_desc,hourly_time,hourly_precip_prob_percent\n";
            
            const mainRowPart = [
                 `"${eventDetails.location}"`, eventDetails.date, eventDetails.time, data.forecast.condition,
                 data.forecast.rainProbability, weather.temperature_2m, weather.precipitation_probability,
                 weather.wind_speed_10m, `"${weather.weather}"`
            ].join(',');

            if (hourly.length > 0) {
                 csvContent = headers + hourly.map(h => `${mainRowPart},${h.time},${h.precipitation}`).join('\n');
            } else {
                 csvContent = headers + mainRowPart + ",,"; // No hourly data
            }
        }

        downloadFile(csvContent, `forecast_${locationFilename}_${dateFilename}.csv`, 'text/csv;charset=utf-8;');
    };

    const handleChartDownload = () => {
        const svgElement = chartRef.current?.querySelector('svg');
        if (!svgElement) {
            alert('Could not find the chart to download.');
            return;
        }
        
        // FIX: The fallback to `window` was incorrect, causing type errors. Using `window.URL`
        // with a fallback for older browsers and checking for its existence is safer.
        const URL_API = window.URL || window.webkitURL;
        if (!URL_API) {
            alert('Your browser does not support this feature.');
            return;
        }

        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL_API.createObjectURL(svgBlob);

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
            URL_API.revokeObjectURL(url);
            return;
        }
        
        const svgSize = svgElement.getBoundingClientRect();
        canvas.width = svgSize.width * 2; // Render at 2x for better quality
        canvas.height = svgSize.height * 2;
        context.scale(2, 2);

        const img = new Image();
        img.onload = function() {
            context.fillStyle = '#111827'; // Set a background color similar to the theme
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0);
            
            const pngUrl = canvas.toDataURL('image/png');
            
            // FIX: Data URLs can be used directly for downloads. Calling downloadFile was incorrect.
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = `chart_${locationFilename}_${dateFilename}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL_API.revokeObjectURL(url);
        };
        img.onerror = function() {
            URL_API.revokeObjectURL(url);
            alert('An error occurred while preparing the chart image for download.');
        };
        img.src = url;
    };


    return (
        <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-purple-300 mb-4 text-center">Download Options</h3>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <button onClick={handleJsonDownload} className="flex items-center gap-2 w-full sm:w-auto justify-center py-2 px-4 border border-white/20 rounded-lg text-sm font-medium text-white bg-gray-700/50 hover:bg-gray-600/50 transition">
                    <DownloadJsonIcon />
                    <span>Data (JSON)</span>
                </button>
                <button onClick={handleCsvDownload} className="flex items-center gap-2 w-full sm:w-auto justify-center py-2 px-4 border border-white/20 rounded-lg text-sm font-medium text-white bg-gray-700/50 hover:bg-gray-600/50 transition">
                    <DownloadCsvIcon />
                    <span>Data (CSV)</span>
                </button>
                {!isHistorical && (
                    <button onClick={handleChartDownload} className="flex items-center gap-2 w-full sm:w-auto justify-center py-2 px-4 border border-white/20 rounded-lg text-sm font-medium text-white bg-gray-700/50 hover:bg-gray-600/50 transition">
                        <DownloadImageIcon />
                        <span>Chart (PNG)</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default DownloadButtons;
