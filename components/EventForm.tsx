import React, { useState } from 'react';
import type { EventDetails } from '../types';
import CalendarIcon from './icons/CalendarIcon';
import ClockIcon from './icons/ClockIcon';
import LocationIcon from './icons/LocationIcon';

interface EventFormProps {
  onSubmit: (details: EventDetails) => void;
  isLoading: boolean;
}

const groupedCities = [
    {
        country: "Turkey",
        cities: [
            { name: "Istanbul", value: "Istanbul, Turkey" },
            { name: "Ankara", value: "Ankara, Turkey" },
            { name: "İzmir", value: "Izmir, Turkey" },
            { name: "Adana", value: "Adana, Turkey" },
        ]
    },
    {
        country: "USA",
        cities: [
            { name: "New York", value: "New York, USA" }
        ]
    },
    {
        country: "UK",
        cities: [
            { name: "London", value: "London, UK" }
        ]
    },
    {
        country: "France",
        cities: [
            { name: "Paris", value: "Paris, France" }
        ]
    },
    {
        country: "Switzerland",
        cities: [
            { name: "Zurich", value: "Zurich, Switzerland" }
        ]
    },
    {
        country: "Japan",
        cities: [
            { name: "Tokyo", value: "Tokyo, Japan" }
        ]
    },
    {
        country: "Australia",
        cities: [
            { name: "Sydney", value: "Sydney, Australia" }
        ]
    },
    {
        country: "UAE",
        cities: [
            { name: "Dubai", value: "Dubai, UAE" }
        ]
    },
    {
        country: "Brazil",
        cities: [
            { name: "Rio de Janeiro", value: "Rio de Janeiro, Brazil" }
        ]
    },
    {
        country: "Singapore",
        cities: [
            { name: "Singapore", value: "Singapore" }
        ]
    }
];


const EventForm: React.FC<EventFormProps> = ({ onSubmit, isLoading }) => {
  const [location, setLocation] = useState<string>(groupedCities[0].cities[0].value);
  
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const [date, setDate] = useState<string>(nextWeek.toISOString().split('T')[0]);
  const [time, setTime] = useState<string>('14:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !date || !time) {
        alert("Please fill in all fields.");
        return;
    }
    onSubmit({ location, date, time });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-300">
          Location
        </label>
        <div className="mt-1 relative">
            <LocationIcon />
            <select
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-gray-900/50 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition appearance-none"
                required
            >
                {groupedCities.map(group => (
                    <optgroup key={group.country} label={group.country} className="font-bold text-purple-300">
                        {group.cities.map(city => (
                            <option key={city.value} value={city.value} className="bg-gray-800 text-white font-normal">
                                {city.name}
                            </option>
                        ))}
                    </optgroup>
                ))}
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-300">
            Date
          </label>
          <div className="mt-1 relative">
            <CalendarIcon />
            <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-900/50 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                min={new Date().toISOString().split('T')[0]}
                required
            />
          </div>
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-300">
            Time
          </label>
          <div className="mt-1 relative">
            <ClockIcon />
            <input
                type="time"
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-gray-900/50 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                required
            />
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
        >
          {isLoading ? 'Consulting the Cosmos...' : 'Check Forecast'}
        </button>
      </div>
    </form>
  );
};

export default EventForm;