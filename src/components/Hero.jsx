import gsap from "gsap";
import React, { useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { heroVideo, smallHeroVideo } from "../utils";

const Hero = () => {
  const [videoSrc, setVideoSrc] = useState(
    window.innerWidth < 760 ? smallHeroVideo : heroVideo
  );

  const handleVideoSrcSet = () => {
    if (window.innerWidth < 760) {
      setVideoSrc(smallHeroVideo);
    } else {
      setVideoSrc(heroVideo);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleVideoSrcSet);

    return () => {
      window.removeEventListener("resize", handleVideoSrcSet);
    };
  }, []);

  useGSAP(() => {
    gsap.to("#hero", {
      opacity: 1,
      delay: 1.5,
      duration: 1,
    });

    gsap.to("#cta", {
      opacity: 1,
      y: -20,
      delay: 1.5,
      duration: 1,
    });
  }, []);

  return (
    <section className="relative w-full nav-height bg-black">
      <div className="flex h-5/6 w-full flex-col items-center justify-center">
        <p id="hero" className="hero-title">
          iPhone 15 Pro
        </p>

        <div className="w-9/12 md:w-10/12">
          <video
            key={videoSrc}
            autoPlay
            muted
            playsInline
            className="pointer-events-none h-full w-full object-cover"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </div>
      </div>

      <div
        id="cta"
        className="flex translate-y-20 flex-col items-center opacity-0"
      >
        <a href="#highlights" className="btn" >
          Buy
        </a>

        <p className="mt-3 text-xl font-normal text-white " style={{ marginTop: "10px" }}>
          From $199/month or $999
        </p>
      </div>
    </section>
  );
};

export default Hero;