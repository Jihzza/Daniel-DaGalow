// src/components/MainSections/OtherWins.jsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeOff,
  FaExpand,
  FaCompress,
  FaEllipsisV,
  FaVolumeMute,
} from "react-icons/fa";
import bodyTransformation from "../../assets//vids/Body Transformation.mp4";
import socialMedia1 from "../../assets/img/Tiktok/TikTok13.png";
import socialMedia2 from "../../assets/img/Tiktok/TikTok19.png";
import socialMedia3 from "../../assets/img/Tiktok/TikTok3.png";
import socialMedia4 from "../../assets/img/Tiktok/TikTok4.png";
import socialMedia5 from "../../assets/img/Tiktok/TikTok5.png";
import socialMedia6 from "../../assets/img/Tiktok/TikTok6.png";
import socialMedia7 from "../../assets/img/Tiktok/TikTok7.png";
import socialMedia8 from "../../assets/img/Tiktok/TikTok8.png";
import socialMedia9 from "../../assets/img/Tiktok/TikTok9.png";
import socialMedia10 from "../../assets/img/Tiktok/TikTok10.png";
import socialMedia11 from "../../assets/img/Tiktok/TikTok11.png";
import socialMedia12 from "../../assets/img/Tiktok/TikTok12.png";
import socialMedia13 from "../../assets/img/Tiktok/TikTok1.png";
import socialMedia14 from "../../assets/img/Tiktok/TikTok14.png";
import socialMedia15 from "../../assets/img/Tiktok/TikTok15.png";
import socialMedia16 from "../../assets/img/Tiktok/TikTok16.png";
import socialMedia17 from "../../assets/img/Tiktok/TikTok17.png";
import socialMedia18 from "../../assets/img/Tiktok/TikTok18.png";
import socialMedia19 from "../../assets/img/Tiktok/TikTok2.png";
import socialMedia20 from "../../assets/img/Twitter/Twitter37.png";
import socialMedia21 from "../../assets/img/Twitter/Twitter1.png";
import socialMedia22 from "../../assets/img/Twitter/Twitter2.png";
import socialMedia23 from "../../assets/img/Twitter/Twitter3.png";
import socialMedia24 from "../../assets/img/Twitter/Twitter4.png";
import socialMedia25 from "../../assets/img/Twitter/Twitter5.png";
import socialMedia26 from "../../assets/img/Twitter/Twitter6.png";
import socialMedia27 from "../../assets/img/Twitter/Twitter7.png";
import socialMedia28 from "../../assets/img/Twitter/Twitter8.png";
import socialMedia29 from "../../assets/img/Twitter/Twitter9.png";
import socialMedia30 from "../../assets/img/Twitter/Twitter10.png";
import socialMedia31 from "../../assets/img/Twitter/Twitter11.png";
import socialMedia32 from "../../assets/img/Twitter/Twitter12.png";
import socialMedia33 from "../../assets/img/Twitter/Twitter13.png";
import socialMedia34 from "../../assets/img/Twitter/Twitter14.png";
import socialMedia35 from "../../assets/img/Twitter/Twitter15.png";
import socialMedia36 from "../../assets/img/Twitter/Twitter16.png";
import socialMedia37 from "../../assets/img/Twitter/Twitter17.png";
import socialMedia38 from "../../assets/img/Twitter/Twitter18.png";
import socialMedia39 from "../../assets/img/Twitter/Twitter19.png";
import socialMedia40 from "../../assets/img/Twitter/Twitter20.png";
import socialMedia41 from "../../assets/img/Twitter/Twitter21.png";
import socialMedia42 from "../../assets/img/Twitter/Twitter22.png";
import socialMedia43 from "../../assets/img/Twitter/Twitter23.png";
import socialMedia44 from "../../assets/img/Twitter/Twitter24.png";
import socialMedia45 from "../../assets/img/Twitter/Twitter25.png";
import socialMedia46 from "../../assets/img/Twitter/Twitter26.png";
import socialMedia47 from "../../assets/img/Twitter/Twitter27.png";
import socialMedia48 from "../../assets/img/Twitter/Twitter28.png";
import socialMedia49 from "../../assets/img/Twitter/Twitter29.png";
import socialMedia50 from "../../assets/img/Twitter/Twitter30.png";
import socialMedia51 from "../../assets/img/Twitter/Twitter31.png";
import socialMedia52 from "../../assets/img/Twitter/Twitter32.png";
import socialMedia53 from "../../assets/img/Twitter/Twitter33.png";
import socialMedia54 from "../../assets/img/Twitter/Twitter34.png";
import socialMedia55 from "../../assets/img/Twitter/Twitter35.png";
import socialMedia56 from "../../assets/img/Twitter/Twitter36.png";
import socialMedia57 from "../../assets/img/Tiktok/TikTok20.png";

const socialMediaImages = [
  {
    image: socialMedia1,
    link: "https://www.tiktok.com/@galo_portugues/video/7172247525540334854",
  },
  {
    image: socialMedia2,
    link: "https://www.tiktok.com/@galo_portugues/video/7188496959748001030",
  },
  {
    image: socialMedia3,
    link: "https://www.tiktok.com/@galo_portugues/video/7149949788912504069",
  },
  {
    image: socialMedia4,
    link: "https://www.tiktok.com/@galo_portugues/video/7319997405875719456",
  },
  {
    image: socialMedia5,
    link: "https://www.tiktok.com/@galo_portugues/video/7069121685437566213",
  },
  {
    image: socialMedia6,
    link: "https://www.tiktok.com/@galo_portugues/video/7172986842680233222",
  },
  {
    image: socialMedia7,
    link: "https://www.tiktok.com/@galo_portugues/video/7086223291626622214",
  },
  {
    image: socialMedia8,
    link: "https://www.tiktok.com/@galo_portugues/video/7188941851527744774",
  },
  {
    image: socialMedia9,
    link: "https://www.tiktok.com/@galo_portugues/video/7172852623224130821",
  },
  {
    image: socialMedia10,
    link: "https://www.tiktok.com/@galo_portugues/video/7152008606173515014",
  },
  {
    image: socialMedia11,
    link: "https://www.tiktok.com/@galo_portugues/video/7346480566998469920",
  },
  {
    image: socialMedia12,
    link: "https://www.tiktok.com/@galo_portugues/video/7172269860284550405",
  },
  {
    image: socialMedia13,
    link: "https://www.tiktok.com/@galo_portugues/video/7069126152278854918",
  },
  {
    image: socialMedia14,
    link: "https://www.tiktok.com/@galo_portugues/video/7172250969269472517",
  },
  {
    image: socialMedia15,
    link: "https://www.tiktok.com/@galo_portugues/video/7189354490376523013",
  },
  {
    image: socialMedia16,
    link: "https://www.tiktok.com/@galo_portugues/video/7158439224776117510",
  },
  {
    image: socialMedia17,
    link: "https://www.tiktok.com/@galo_portugues/video/7202375791575829766",
  },
  {
    image: socialMedia18,
    link: "https://www.tiktok.com/@galo_portugues/video/7150561631989222661",
  },
  {
    image: socialMedia19,
    link: "https://www.tiktok.com/@galo_portugues/video/7344661288200457505",
  },
  {
    image: socialMedia20,
    link: "https://x.com/galo_portugues/status/1774914680693084319",
  },
  {
    image: socialMedia21,
    link: "https://x.com/galo_portugues/status/1610017119252389888",
  },
  {
    image: socialMedia22,
    link: "https://x.com/galo_portugues/status/1610780921111740424",
  },
  {
    image: socialMedia23,
    link: "https://x.com/galo_portugues/status/1612519780547706880",
  },
  {
    image: socialMedia24,
    link: "https://x.com/galo_portugues/status/1612540968967741449",
  },
  {
    image: socialMedia25,
    link: "https://x.com/galo_portugues/status/1612924472088219648",
  },
  {
    image: socialMedia26,
    link: "https://x.com/galo_portugues/status/1612870732031135759",
  },
  {
    image: socialMedia27,
    link: "https://x.com/galo_portugues/status/1613169414412668928",
  },
  {
    image: socialMedia28,
    link: "https://x.com/galo_portugues/status/1613199908579713024",
  },
  {
    image: socialMedia29,
    link: "https://x.com/galo_portugues/status/1613293969831612457",
  },
  {
    image: socialMedia30,
    link: "https://x.com/galo_portugues/status/1613259352953221120",
  },
  {
    image: socialMedia31,
    link: "https://x.com/galo_portugues/status/1613315107605610502",
  },
  {
    image: socialMedia32,
    link: "https://x.com/galo_portugues/status/1613530446381592578",
  },
  {
    image: socialMedia33,
    link: "https://x.com/galo_portugues/status/1613600934952865794",
  },
  {
    image: socialMedia34,
    link: "https://x.com/galo_portugues/status/1613925034225016833",
  },
  {
    image: socialMedia35,
    link: "https://x.com/galo_portugues/status/1614251694577291266",
  },
  {
    image: socialMedia36,
    link: "https://x.com/galo_portugues/status/1614346875175424002",
  },
  {
    image: socialMedia37,
    link: "https://x.com/galo_portugues/status/1614619031134248962",
  },
  {
    image: socialMedia38,
    link: "https://x.com/galo_portugues/status/1615076490336501782",
  },
  {
    image: socialMedia39,
    link: "https://x.com/galo_portugues/status/1615088749943160848",
  },
  {
    image: socialMedia40,
    link: "https://x.com/galo_portugues/status/1614669875586437122",
  },
  {
    image: socialMedia41,
    link: "https://x.com/galo_portugues/status/1616209812357877763",
  },
  {
    image: socialMedia42,
    link: "https://x.com/galo_portugues/status/1622966814954393601",
  },
  {
    image: socialMedia43,
    link: "https://x.com/galo_portugues/status/1623075900047720449",
  },
  {
    image: socialMedia44,
    link: "https://x.com/galo_portugues/status/1623111519088136197",
  },
  {
    image: socialMedia45,
    link: "https://x.com/galo_portugues/status/1623419940643434496",
  },
  {
    image: socialMedia46,
    link: "https://x.com/galo_portugues/status/1627804993184010241",
  },
  {
    image: socialMedia47,
    link: "https://x.com/galo_portugues/status/1627653957291069441",
  },
  {
    image: socialMedia48,
    link: "https://x.com/galo_portugues/status/1627812951112445954",
  },
  {
    image: socialMedia49,
    link: "https://x.com/galo_portugues/status/1629456908590481410",
  },
  {
    image: socialMedia50,
    link: "https://x.com/galo_portugues/status/1628031737094631424",
  },
  {
    image: socialMedia51,
    link: "https://x.com/galo_portugues/status/1629859496607531014",
  },
  {
    image: socialMedia52,
    link: "https://x.com/galo_portugues/status/1628096895200493568",
  },
  {
    image: socialMedia53,
    link: "https://x.com/galo_portugues/status/1633180612642103298",
  },
  {
    image: socialMedia54,
    link: "https://x.com/galo_portugues/status/1740650460871324145",
  },
  {
    image: socialMedia55,
    link: "https://x.com/galo_portugues/status/1771953368732205323",
  },
  {
    image: socialMedia56,
    link: "https://x.com/galo_portugues/status/1629883089626320897",
  },
  {
    image: socialMedia57,
    link: "https://www.tiktok.com/@galo_portugues/video/7188901762542128389",
  },
];

function OtherWins() {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);

  // State for video player
  const [isPlaying, setIsPlaying] = useState(false); // Will be set by onPlay due to autoPlay
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true); // Video tag starts muted
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [areControlsVisible, setAreControlsVisible] = useState(false);
  const [hideControlsTimeout, setHideControlsTimeout] = useState(null);

  // Auto-hide controls in fullscreen after 2s of no interaction
  useEffect(() => {
    if (!isFullscreen) return;
    // Show controls initially
    setAreControlsVisible(true);

    const resetHideControlsTimer = () => {
      setAreControlsVisible(true);
      if (hideControlsTimeout) clearTimeout(hideControlsTimeout);
      const timeout = setTimeout(() => {
        setAreControlsVisible(false);
      }, 2000);
      setHideControlsTimeout(timeout);
    };

    // Listen for user interaction
    const container = videoContainerRef.current;
    if (container) {
      container.addEventListener('mousemove', resetHideControlsTimer);
      container.addEventListener('click', resetHideControlsTimer);
      container.addEventListener('touchstart', resetHideControlsTimer);
    }
    // Start timer immediately
    resetHideControlsTimer();

    return () => {
      if (container) {
        container.removeEventListener('mousemove', resetHideControlsTimer);
        container.removeEventListener('click', resetHideControlsTimer);
        container.removeEventListener('touchstart', resetHideControlsTimer);
      }
      if (hideControlsTimeout) clearTimeout(hideControlsTimeout);
    };
    // eslint-disable-next-line
  }, [isFullscreen]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, []);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
  };

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      // If unmuting and volume was 0, set a sensible volume
      if (!videoRef.current.muted && videoRef.current.volume === 0) {
        videoRef.current.volume = 0.5;
      }
    }
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      // Reflect initial muted state from the video tag
      setIsMuted(videoRef.current.muted);
      setVolume(videoRef.current.volume);
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current) {
      const seekTime = parseFloat(e.target.value);
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const toggleFullScreen = useCallback(() => {
    const videoElemContainer = videoContainerRef.current;
    if (!videoElemContainer) return;
    if (!document.fullscreenElement) {
      if (videoElemContainer.requestFullscreen)
        videoElemContainer.requestFullscreen();
      else if (videoElemContainer.webkitRequestFullscreen)
        videoElemContainer.webkitRequestFullscreen();
      else if (videoElemContainer.msRequestFullscreen)
        videoElemContainer.msRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
      if (!isCurrentlyFullscreen) {
        setAreControlsVisible(true);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  useEffect(() => {
    if (isFullscreen) {
      setAreControlsVisible(true);
    }
  }, [isFullscreen]);

  // Handles click on the video area itself
  const handleVideoElementClick = () => {
    if (!isFullscreen) {
      // If not in fullscreen, clicking the video makes it go fullscreen
      toggleFullScreen();
    } else {
      // If in fullscreen, clicking the video area (not the controls) toggles play/pause
      togglePlayPause();
    }
  };

  // --- Styles Adjustment ---
  const controlBarStyle = {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: "5px", // Reduced padding for a smaller bar
    display: "flex",
    alignItems: "center",
    color: "white",
    opacity: areControlsVisible ? 1 : 0,
    transition: "opacity 0.3s ease-in-out",
    zIndex: 2147483647,
  };

  const buttonStyle = {
    background: "none",
    border: "none",
    color: "white",
    fontSize: "1.2rem", // Slightly smaller icons
    cursor: "pointer",
    padding: "2px", // Added padding for better click area
    margin: "0 2px", // Reduced margin
  };

  // Styles for the timeline (seek bar) to make it simpler and smaller
  const timelineSeekStyle = {
    flexGrow: 1,
    margin: "0 4px", // Adjusted margin
    height: "8px", // Make the track thinner
    cursor: "pointer",
    // Basic appearance, for deeper customization use ::-webkit-slider-thumb etc. in CSS
    WebkitAppearance:
      "none" /* Hides the default slider look in Chrome/Safari */,
    appearance: "none",
    backgroundColor: "rgba(255, 255, 255, 0.3)" /* Light track */,
    borderRadius: "4px",
  };

  // Styles for time display to make it smaller
  const timeDisplayStyle = {
    fontSize: "0.75rem", // Smaller font for time
    margin: "0 2px",
    minWidth: "80px", // Ensure enough space for HH:MM:SS / HH:MM:SS
    textAlign: "center",
  };

  return (
    <section id="other-wins" className="py-8 px-4 text-black overflow-hidden">
      <div className="max-w-3xl mx-auto text-center space-y-8 px-4 overflow-visible">
        <div className="flex flex-col justify-center space-y-6 items-center">
          <h1 className="text-2xl md:text-4xl text-black font-bold">
            {t("other_wins.other_wins_title")}
          </h1>
          <p className="text-lg md:text-2xl text-black">
            {t("other_wins.body_transformation_title")}
          </p>
          <div
            ref={videoContainerRef}
            className={`relative w-[50%] self-center cursor-pointer${
              isFullscreen ? " fullscreen-container" : ""
            }`}
          >
            {/* Aspect ratio box for fullscreen */}
            <div
              style={
                isFullscreen
                  ? {
                      position: 'relative',
                      width: '56.25vh', // 9/16 of viewport height
                      height: '100vh',
                      maxWidth: '100vw',
                      maxHeight: '100vh',
                      margin: '0 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'black',
                    }
                  : {}
              }
            >
              <video
                ref={videoRef}
                src={bodyTransformation}
                autoPlay
                muted
                loop
                onClick={handleVideoElementClick}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onVolumeChange={() => {
                  if (videoRef.current) {
                    setIsMuted(videoRef.current.muted);
                    setVolume(videoRef.current.volume);
                  }
                }}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                className={
                  isFullscreen
                    ? 'w-full h-full object-contain fullscreen-video'
                    : 'w-full object-cover rounded-xl shadow-lg block'
                }
              />
              {isFullscreen && videoRef.current && (
                <div style={controlBarStyle} className="custom-video-controls">
                  <button
                    onClick={togglePlayPause}
                    style={buttonStyle}
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <FaPause /> : <FaPlay />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    style={timelineSeekStyle}
                    title="Seek"
                  />
                  <span style={timeDisplayStyle}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                  <button
                    onClick={toggleMute}
                    style={buttonStyle}
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>
                  <button
                    onClick={toggleFullScreen}
                    style={buttonStyle}
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? <FaCompress /> : <FaExpand />}
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="text-lg md:text-2xl text-black">
            {t("other_wins.high_reach_content_title")}
          </p>
          <Swiper
            modules={[Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            centeredSlides={true}
            pagination={{ clickable: true }}
            autoplay={{ delay: 2000, disableOnInteraction: false }}
            loop={true} // This is where the warning from your screenshot might be coming from
            loopAdditionalSlides={5} // Ensure you have enough actual slides for loop to work
            watchSlidesProgress={true}
            className="w-[40%] testimonial-swiper overflow-visible mx-auto"
            breakpoints={{
              768: {
                slidesPerView: 1.3,
                spaceBetween: 50,
              },
            }}
            observer={true}
            observeParents={true}
            updateOnWindowResize={true}
          >
            {socialMediaImages.map((item, index) => (
              <SwiperSlide key={index} className="flex justify-center">
                <div className="w-full h-full rounded-xl">
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    <img
                      src={item.image}
                      alt={`Social Media Content ${index + 1}`}
                      className="w-full h-full object-cover rounded-xl shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  </a>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>{" "}
        </div>
      </div>
    </section>
  );
}

export default OtherWins;
