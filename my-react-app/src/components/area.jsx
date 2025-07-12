import React from "react";
import Seat from "./seat";

const Area = ({ title }) => {
  return (
    <div className="bg-white shadow-lg p-4 rounded-lg min-w-[200px]">
      <h3 className="text-center font-semibold mb-3">{title}</h3>
      <div className="grid grid-cols-5 gap-2 justify-items-center">
        {Array.from({ length: 10 }).map((_, idx) => (
          <Seat key={idx} />
        ))}
      </div>
    </div>
  );
};

export default Area;
