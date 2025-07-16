import React from "react";
import LeftSidebar from "../components/LeftSidebar";
import FloorLayoutComponent from "../components/FloorLayout";

const FloorLayout = () => {
  return (
    <div className="w-full h-screen m-0 p-0 bg-green-50">
      <LeftSidebar>
        <FloorLayoutComponent />
      </LeftSidebar>
    </div>
  );
};

export default FloorLayout;