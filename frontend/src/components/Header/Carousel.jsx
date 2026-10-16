import React, { useEffect, useRef, useState } from "react";
import { Carousel } from "react-bootstrap";
import "./Carousel.css";

// Promotional images
import Slide1 from "../../assets/Slideimage1.jpg";
import Slide2 from "../../assets/Slideimage2.jpg";
import Slide3 from "../../assets/Slideimage3.jpg";

// Promotional video
import SlideVideo from "../../assets/Slidevid4.mp4";
import videoPoster from "../../assets/video-poster.jpg";

const HeroCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRef = useRef(null);

  // Total number of slides
  const totalSlides = 4;

  // Slide durations
  const IMAGE_DURATION = 4000;
  const VIDEO_DURATION = 12000;

  // ==========================================
  // AUTOMATIC SLIDING
  // ==========================================

  useEffect(() => {
    // Keep the video visible longer
    const duration =
      activeIndex === 3
        ? VIDEO_DURATION
        : IMAGE_DURATION;

    const timer = window.setTimeout(() => {
      setActiveIndex((previousIndex) => {
        return (previousIndex + 1) % totalSlides;
      });
    }, duration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeIndex]);

  // ==========================================
  // MANUAL SLIDE SELECTION
  // ==========================================

  const handleSelect = (selectedIndex) => {
    setActiveIndex(selectedIndex);
  };

  // ==========================================
  // VIDEO PLAYBACK CONTROL
  // ==========================================

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (activeIndex === 3) {
      // Start video when its slide appears
      video.currentTime = 0;

      const playPromise = video.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn(
            "Video autoplay was prevented:",
            error
          );
        });
      }
    } else {
      // Stop video when leaving its slide
      video.pause();
      video.currentTime = 0;
    }
  }, [activeIndex]);

  return (
    <section
      className="rb-carousel-section"
      aria-label="Ridwan Business promotional offers"
    >

      {/* ======================================
          SECTION HEADING
      ====================================== */}

      <div className="rb-carousel-heading">

        <span className="rb-carousel-label">
          EXCLUSIVE COLLECTION
        </span>

        <h2>Explore What's New</h2>

        <p>
          Discover exciting products and the latest
          technology at Ridwan Business.
        </p>

      </div>

      {/* ======================================
          CAROUSEL WRAPPER
      ====================================== */}

      <div className="rb-carousel-wrapper">

        <Carousel
          activeIndex={activeIndex}
          onSelect={handleSelect}

          // Automatic sliding is handled by our timer
          interval={null}

          // Navigation
          controls={true}
          indicators={true}

          // Allow continuous looping
          wrap={true}

          // Enable mobile swipe
          touch={true}

          // Smooth fade transition
          fade={true}

          // Do not pause on mouse hover
          pause={false}

          className="rb-promo-carousel"
        >

          {/* ==================================
              SLIDE 1
          ================================== */}

          <Carousel.Item>

            <img
              className="rb-carousel-media"
              src={Slide1}
              alt="Ridwan Business promotional collection one"
              loading="lazy"
            />

          </Carousel.Item>

          {/* ==================================
              SLIDE 2
          ================================== */}

          <Carousel.Item>

            <img
              className="rb-carousel-media"
              src={Slide2}
              alt="Ridwan Business promotional collection two"
              loading="lazy"
            />

          </Carousel.Item>

          {/* ==================================
              SLIDE 3
          ================================== */}

          <Carousel.Item>

            <img
              className="rb-carousel-media"
              src={Slide3}
              alt="Ridwan Business promotional collection three"
              loading="lazy"
            />

          </Carousel.Item>

          {/* ==================================
              SLIDE 4 - PROMOTIONAL VIDEO
          ================================== */}

          <Carousel.Item>

            <video
              ref={videoRef}
              className="rb-carousel-media"

              muted
              playsInline

              preload="metadata"
              poster={videoPoster}
            >

              <source
                src={SlideVideo}
                type="video/mp4"
              />

              Your browser does not support
              video playback.

            </video>

          </Carousel.Item>

        </Carousel>

      </div>

    </section>
  );
};

export default HeroCarousel;