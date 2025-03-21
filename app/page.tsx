import * as React from "react";
import Topbar from "@/components/layout/Topbar";
import HomeCarousel from "@/components/home/homeCarousel";
const Home = () => {
  return (
    <div>
      <Topbar />

      <div className="flex flex-col items-center justify-start min-h-screen space-y-6">
        {/* Carousel Wrapper */}
        <div className="w-[70vw]">
          <HomeCarousel />
        </div>
      </div>
    </div>
  );
};

export default Home;
