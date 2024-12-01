import * as React from "react";
import HomeCarousel from "@/components/home/homeCarousel";

const Home = () => {
  return (
    <div>
      <div className="flex flex-col items-center justify-start min-h-screen space-y-6">
        <div className="w-[70vw]">
          <HomeCarousel />
        </div>
      </div>
    </div>
  );
};

export default Home;
