import React, { useState, useEffect } from 'react';
import { Carousel } from "react-bootstrap";

// Import images and video
import slide1 from '../../assets/slide1.jpg';
import slide2 from '../../assets/slide2.jpg';
import slide3 from '../../assets/slide3.jpg';
import slideVideo from '../../assets/slide4.mp4';
import videoPoster from '../../assets/video-poster.jpg';

const HeroCarousel = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Responsive height: full screen on desktop, smaller on mobile
  const fitStyle = {
    height: isMobile ? "100vh" : "100vh", // full viewport height
    width: "100%",
    objectFit: "contain",                 // show full image/video
    backgroundColor: "black",             // fills any empty space
  };

  return (
    <Carousel interval={3000} controls={true} indicators={true} pause={false}>
      {/* Slide 1 */}
      <Carousel.Item>
        <img className="d-block w-100" src={slide1} alt="Slide 1" style={fitStyle} />
      </Carousel.Item>

      {/* Slide 2 */}
      <Carousel.Item>
        <img className="d-block w-100" src={slide2} alt="Slide 2" style={fitStyle} />
      </Carousel.Item>

      {/* Slide 3 */}
      <Carousel.Item>
        <img className="d-block w-100" src={slide3} alt="Slide 3" style={fitStyle} />
      </Carousel.Item>

      {/* Slide 4 (Video) */}
      <Carousel.Item>
        <video
          className="d-block w-100"
          autoPlay
          muted
          loop
          playsInline
          poster={videoPoster}
          style={fitStyle}
        >
          <source src={slideVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </Carousel.Item>
    </Carousel>
  );
};

export default HeroCarousel;
