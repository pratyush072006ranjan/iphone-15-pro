
'use client';

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

import { hightlightsSlides } from "../constants";
import { pauseImg, playImg, replayImg } from "../utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const VideoCarousel = () => {
  const sliderRef = useRef(null);
  const videoRef = useRef([]);
  const videoSpanRef = useRef([]);
  const videoDivRef = useRef([]);
  const progressTweenRef = useRef(null);
  const hasStartedRef = useRef(false);

  // Video state
  const [video, setVideo] = useState({
    isEnd: false,
    startPlay: false,
    videoId: 0,
    isLastVideo: false,
    isPlaying: false,
  });

  // Track videos whose metadata has loaded
  const [loadedData, setLoadedData] = useState([]);

  const {
    isEnd,
    isLastVideo,
    startPlay,
    videoId,
    isPlaying,
  } = video;



// Slide the carousel whenever the active video changes
useGSAP(() => {
  gsap.to(sliderRef.current, {
    x: `-${100 * videoId}vw`,
    duration: 1.5,
    ease: "power2.inOut",
  });
}, [videoId]);

// Register the scroll trigger once
useGSAP(() => {
  ScrollTrigger.create({
    trigger: sliderRef.current,
    start: "top 80%",
    once: true,
    onEnter: () => {
      hasStartedRef.current = true;

      setVideo((prev) => ({
        ...prev,
        startPlay: true,
        isPlaying: true,
      }));
    },
  });
}, []);

  // Play or pause the current video
  useEffect(() => {
    const currentVideo = videoRef.current[videoId];

    if (!currentVideo || !loadedData.includes(videoId)) {
      return;
    }

    if (!startPlay || !isPlaying || isLastVideo) {
      currentVideo.pause();
      return;
    }

    const playPromise = currentVideo.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn("Unable to play video:", error);
      });
    }
  }, [startPlay, videoId, isPlaying, isLastVideo, loadedData]);

  // Reset and synchronize the progress indicator
  useEffect(() => {
    const currentVideo = videoRef.current[videoId];
    const progressSpan = videoSpanRef.current[videoId];
    const progressContainer = videoDivRef.current[videoId];

    if (!currentVideo || !progressSpan || !progressContainer) {
      return;
    }

    // Stop the previous progress animation
    if (progressTweenRef.current) {
      progressTweenRef.current.kill();
      progressTweenRef.current = null;
    }

    // Reset the active indicator
    gsap.set(progressSpan, {
      width: "0%",
      backgroundColor: "#ffffff",
    });

    gsap.set(progressContainer, {
      width: "12px",
    });

    const updateProgress = () => {
      if (!currentVideo.duration || !Number.isFinite(currentVideo.duration)) {
        return;
      }

      const progress = Math.min(
        currentVideo.currentTime / currentVideo.duration,
        1
      );

      // Expand the active progress indicator
      gsap.to(progressContainer, {
        width:
          window.innerWidth < 760
            ? "10vw"
            : window.innerWidth < 1200
            ? "10vw"
            : "4vw",
        duration: 0.2,
        overwrite: "auto",
      });

      // Update the progress bar
      gsap.set(progressSpan, {
        width: `${progress * 100}%`,
      });
    };

    const handleVideoEnded = () => {
      gsap.set(progressSpan, {
        width: "100%",
      });

      gsap.to(progressContainer, {
        width: "12px",
        duration: 0.3,
      });

      gsap.set(progressSpan, {
        backgroundColor: "#afafaf",
      });
    };

    currentVideo.addEventListener("timeupdate", updateProgress);
    currentVideo.addEventListener("ended", handleVideoEnded);

    // Immediately reflect the current playback position
    updateProgress();

    return () => {
      currentVideo.removeEventListener("timeupdate", updateProgress);
      currentVideo.removeEventListener("ended", handleVideoEnded);

      if (progressTweenRef.current) {
        progressTweenRef.current.kill();
        progressTweenRef.current = null;
      }
    };
  }, [videoId, loadedData]);

  // Handle metadata loading
  const handleLoadedMetadata = (index) => {
    setLoadedData((prev) => {
      if (prev.includes(index)) {
        return prev;
      }

      return [...prev, index];
    });
  };

  // Handle video controls and progression
  const handleProcess = (type, index) => {
    switch (type) {
      case "video-end": {
        if (index < hightlightsSlides.length - 1) {
          setVideo((prev) => ({
            ...prev,
            isEnd: true,
            videoId: index + 1,
            isLastVideo: false,
            isPlaying: true,
          }));
        } else {
          setVideo((prev) => ({
            ...prev,
            isEnd: true,
            isLastVideo: true,
            isPlaying: false,
          }));
        }

        break;
      }

      case "video-last": {
        setVideo((prev) => ({
          ...prev,
          isEnd: true,
          isLastVideo: true,
          isPlaying: false,
        }));

        break;
      }

      case "video-reset": {
        videoRef.current.forEach((currentVideo) => {
          if (currentVideo) {
            currentVideo.pause();
            currentVideo.currentTime = 0;
          }
        });

        setVideo((prev) => ({
          ...prev,
          isEnd: false,
          videoId: 0,
          isLastVideo: false,
          startPlay: true,
          isPlaying: true,
        }));

        break;
      }

      case "pause": {
        setVideo((prev) => ({
          ...prev,
          isPlaying: false,
        }));

        break;
      }

      case "play": {
        hasStartedRef.current = true;

        setVideo((prev) => ({
          ...prev,
          startPlay: true,
          isPlaying: true,
          isEnd: false,
        }));

        break;
      }

      default:
        break;
    }
  };

  return (
    <>
     {/* Video slider */}
<div className="video-carousel-slider relative left-1/2 w-screen -translate-x-1/2 overflow-hidden">
  <div
    ref={sliderRef}
    className="flex w-max"
  >
    {hightlightsSlides.map((list, i) => (
      <div
        key={list.id}
        className="video-slide w-screen flex-shrink-0"
      >
        <div className="video-carousel_container">
          <video
            id={`video-${i}`}
            playsInline
            preload="auto"
            muted
            className="pointer-events-none"
            ref={(el) => {
              videoRef.current[i] = el;
            }}
            onEnded={() => {
              if (i < hightlightsSlides.length - 1) {
                handleProcess("video-end", i);
              } else {
                handleProcess("video-last");
              }
            }}
            onPlay={() => {
              setVideo((prev) => ({
                ...prev,
                isPlaying: true,
              }));
            }}
            onPause={() => {
              setVideo((prev) => {
                if (prev.videoId !== i || prev.isLastVideo) {
                  return prev;
                }

                return {
                  ...prev,
                  isPlaying: false,
                };
              });
            }}
            onLoadedMetadata={() => handleLoadedMetadata(i)}
          >
            <source src={list.video} type="video/mp4" />
          </video>

          <div className="absolute top-12 left-[5%] z-10">
            {list.textLists.map((text, textIndex) => (
              <p
                key={`${list.id}-${textIndex}`}
                className="md:text-2xl text-xl font-medium"
              >
                {text}
              </p>
            ))}
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

      {/* Progress indicators and playback controls */}
      <div className="relative flex-center mt-10 gap-6">
        <div className="flex-center py-5 px-7 bg-gray-700 backdrop-blur rounded-full gap-1.5 ">
          {hightlightsSlides.map((_, i) => (
            <span
              key={i}
              className="mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer"
              ref={(el) => {
                videoDivRef.current[i] = el;
              }}
              onClick={() => {
                videoRef.current.forEach((currentVideo) => {
                  if (currentVideo) {
                    currentVideo.pause();
                  }
                });

                setVideo((prev) => ({
                  ...prev,
                  videoId: i,
                  isEnd: false,
                  isLastVideo: false,
                  startPlay: true,
                  isPlaying: true,
                }));
              }}
            >
              <span
                className="absolute top-0 left-0 h-full w-0 rounded-full"
                ref={(el) => {
                  videoSpanRef.current[i] = el;
                }}
              />
            </span>
          ))}
        </div>

        <button
          type="button"
          className="control-btn"
          aria-label={
            isLastVideo
              ? "Replay videos"
              : isPlaying
              ? "Pause video"
              : "Play video"
          }
          onClick={() => {
            if (isLastVideo) {
              handleProcess("video-reset");
            } else if (isPlaying) {
              handleProcess("pause");
            } else {
              handleProcess("play");
            }
          }}
        >
          <img
            src={
              isLastVideo
                ? replayImg
                : isPlaying
                ? pauseImg
                : playImg
            }
            alt={
              isLastVideo
                ? "Replay"
                : isPlaying
                ? "Pause"
                : "Play"
            }
          />
        </button>
      </div>
    </>
  );
};

export default VideoCarousel;
