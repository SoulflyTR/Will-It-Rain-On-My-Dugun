
import { GoogleGenAI, Type } from "@google/genai";
import type { WeatherData, GeminiForecast, AggregatedHistoricalData } from "../types";
import { getWeatherCodeDescription } from "./weatherService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const isHistoricalData = (data: WeatherData | AggregatedHistoricalData): data is AggregatedHistoricalData => {
  return (data as AggregatedHistoricalData).totalYears !== undefined;
}

export const getForecastSummary = async (data: WeatherData | AggregatedHistoricalData): Promise<GeminiForecast> => {
  
  let prompt: string;

  if (isHistoricalData(data)) {
    // Prompt for historical/climatological forecast
    prompt = `
      You are a climatologist for the 'Will It Rain on My Düğün?' app.
      You are providing a long-range climatological forecast based on historical data for this date over the past ${data.totalYears} years.
      
      Historical Data Summary:
      - It has rained on this day in ${data.rainyYears} out of the last ${data.totalYears} years.
      - Average Temperature: ${data.avgTemp.toFixed(1)}°C
      - Average Wind Speed: ${data.avgWind.toFixed(1)} km/h
      - Most Common Condition: "${data.conditions}"

      Please analyze this historical data and provide a JSON response.
      - The 'rainProbability' should be the percentage of years it has rained, calculated as (${data.rainyYears} / ${data.totalYears}) * 100, rounded to the nearest integer.
      - The 'condition' must be ONE of the following strings based on a strict hierarchical analysis: 'very wet', 'very windy', 'very hot', 'hot', 'standard', 'cold', or 'very cold'.

      Follow these rules in order:
      1. If it has rained in 40% or more of the past years, the condition is 'very wet'.
      2. If the condition is not 'very wet', and 'Average Wind Speed' is above 40 km/h, the condition is 'very windy'.
      3. If neither of the above, determine the condition based on 'Average Temperature':
          - Above 25°C: 'very hot'
          - 18°C to 25°C: 'hot'
          - 8°C to 17.9°C: 'standard'
          - 0°C to 7.9°C: 'cold'
          - Below 0°C: 'very cold'
    `;
  } else {
    // Prompt for daily forecast
    const weatherDescription = getWeatherCodeDescription(data.weather_code);
    prompt = `
      You are a weather analyst for the 'Will It Rain on My Düğün?' app.
      Based on the following weather data for an event at a specific time:
      - Precipitation Probability: ${data.precipitation_probability}%
      - Temperature: ${data.temperature_2m}°C
      - Weather Description: "${weatherDescription}"
      - Wind Speed: ${data.wind_speed_10m} km/h

      Please analyze this data and provide a JSON response.
      - The 'rainProbability' must be exactly the 'Precipitation Probability' from the input data.
      - The 'condition' must be ONE of the following strings based on a strict hierarchical analysis: 'very wet', 'very windy', 'very hot', 'hot', 'standard', 'cold', or 'very cold'.

      Follow these rules in order:
      1. If 'Precipitation Probability' is 40% or higher, the condition is 'very wet'.
      2. If the condition is not 'very wet', and 'Wind Speed' is above 50 km/h, the condition is 'very windy'.
      3. If neither of the above, determine the condition based on 'Temperature':
          - Above 30°C: 'very hot'
          - 20°C to 30°C: 'hot'
          - 10°C to 19.9°C: 'standard'
          - 0°C to 9.9°C: 'cold'
          - Below 0°C: 'very cold'
    `;
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            condition: {
                type: Type.STRING,
                description: "A single descriptor for the weather: 'very hot', 'hot', 'standard', 'cold', 'very cold', 'very windy', or 'very wet'."
            },
            rainProbability: {
                type: Type.NUMBER,
                description: "The probability of rain as a percentage (0-100)."
            },
          },
          required: ["condition", "rainProbability"],
        },
      },
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);
    
    return parsedResponse as GeminiForecast;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get a forecast summary from the AI. Please try again.");
  }
};