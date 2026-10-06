import React from "react";
import { BallTriangle, Rings, FallingLines } from "react-loader-spinner";

const MainLoader = () => {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <FallingLines color="#2563eb" width="100" visible={true} />
    </div>
  );
};

export default MainLoader;
