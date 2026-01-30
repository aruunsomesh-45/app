
import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Loader2, MapPin } from 'lucide-react';

interface WeatherData {
    temperature: number;
    weathercode: number;
    is_day: number;
}

const WeatherWidget: React.FC = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [locationName, setLocationName] = useState('Mumbai, India');

    const getWeatherIcon = (code: number) => {
        // WMO Weather interpretation codes (WW)
        if (code <= 1) return <Sun className="w-8 h-8 text-yellow-500" />;
        if (code <= 3) return <Cloud className="w-8 h-8 text-gray-500" />;
        if (code <= 67) return <CloudRain className="w-8 h-8 text-blue-500" />;
        return <Cloud className="w-8 h-8 text-gray-500" />;
    };

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Default to Mumbai, India for stability if geo fails or blocked
                let lat = 19.0760;
                let lon = 72.8777;

                // Try to get current location
                if (navigator.geolocation) {
                    await new Promise<void>((resolve) => {
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                lat = position.coords.latitude;
                                lon = position.coords.longitude;
                                setLocationName('Local');
                                resolve();
                            },
                            (err) => {
                                console.log("Geo blocked/failed", err);
                                resolve();
                            }
                        );
                    });
                }

                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
                );
                const data = await response.json();
                setWeather(data.current_weather);
            } catch (error) {
                console.error("Failed to fetch weather", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, []);

    if (loading) {
        return (
            <div className="bg-white/90 dark:bg-[#252525]/90 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-[#333] h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="bg-white/90 dark:bg-[#252525]/90 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-[#333] h-full flex flex-col justify-between group hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                    {weather ? getWeatherIcon(weather.weathercode) : <Sun className="w-5 h-5" />}
                </div>
                <div className="flex items-center text-xs text-gray-400 font-medium bg-gray-100 dark:bg-[#333] px-2 py-1 rounded-full">
                    <MapPin className="w-3 h-3 mr-1" />
                    {locationName}
                </div>
            </div>

            <div>
                <h2 className="text-4xl font-bold text-gray-800 dark:text-white tracking-tight">
                    {weather?.temperature}°
                </h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
                    {weather && weather.weathercode <= 3 ? 'Clear Sky' : 'Cloudy'}
                </p>
            </div>
        </div>
    );
};

export default WeatherWidget;
