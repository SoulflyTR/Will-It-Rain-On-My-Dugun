import React from 'react';
import SunIcon from './icons/SunIcon';
import PartlyCloudyIcon from './icons/PartlyCloudyIcon';
import CloudyIcon from './icons/CloudyIcon';
import FogIcon from './icons/FogIcon';
import RainIcon from './icons/RainIcon';
import SnowIcon from './icons/SnowIcon';
import ThunderstormIcon from './icons/ThunderstormIcon';
import ConditionsIcon from './icons/ConditionsIcon';

interface WeatherIconProps {
  code: number;
  className?: string;
}

const WeatherIcon: React.FC<WeatherIconProps> = ({ code, className = "h-8 w-8" }) => {
  const props = { className };
  switch (code) {
    case 0:
    case 1:
      return <SunIcon {...props} />;
    case 2:
      return <PartlyCloudyIcon {...props} />;
    case 3:
      return <CloudyIcon {...props} />;
    case 45:
    case 48:
      return <FogIcon {...props} />;
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
    case 80:
    case 81:
    case 82:
      return <RainIcon {...props} />;
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return <SnowIcon {...props} />;
    case 95:
    case 96:
    case 99:
      return <ThunderstormIcon {...props} />;
    default:
      return <ConditionsIcon {...props} />;
  }
};

export default WeatherIcon;
