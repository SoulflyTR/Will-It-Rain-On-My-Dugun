
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center my-12 text-center">
      <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-300">Consulting cosmic archives & weather models...</p>
    </div>
  );
};

export default Loader;
