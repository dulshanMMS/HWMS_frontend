import React from "react";
import carimage from "../../assets/car for animation.png";

const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-green-100 text-4xl animate-bounce transition-all duration-700">
    <img
      src={carimage}
      alt="car"
      className="w-20 h-20" // Adjust size of car image
    />
    <p className="text-lg mt-2 animate-pulse">Stop your engine...</p>
  </div>
);

export default LoadingScreen;
