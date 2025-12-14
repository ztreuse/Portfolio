import React, { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "./Slider.css";
import Certifications_Data from "../../assets/certifications_data";

const Slider = () => {
  const swiperRef = useRef(null);
  const resizeTimeoutRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (!swiperRef.current) return;
      const swiper = swiperRef.current;

      // debounce quick resizes
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        // make sure Swiper recalculates sizes
        // updateSlides() recalculates sizes, update() recalculates translate/etc
        swiper.updateSlides();
        swiper.update();

        // do the re-centering in the next frame so layout has settled
        requestAnimationFrame(() => {
          // use slideToLoop to keep the same slide centered in loop mode
          swiper.slideToLoop(swiper.realIndex, 0, false);
        });
      }, 80); // small delay - adjust if needed
    };

    window.addEventListener("resize", handleResize);
    // also handle visibility change (devtools sometimes toggles visibility)
    document.addEventListener("visibilitychange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleResize);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    };
  }, []);

  return (
    <main>
      <div className="cert">
        <div 
                    id="certifications" 
                    className="scroll-target-buffer" 
                    aria-hidden="true"
                    style={{     
                        visibility: 'hidden',               
                        pointerEvents: 'none',              
                        height: '0'                         
                    }}>
        </div>
        <h3>Certifications</h3>
        <div className="container">
          <Swiper 
            modules={[Pagination]}
            grabCursor
            initialSlide={0}
            centeredSlides={true}
            slidesPerView={1}
            speed={800}
            slideToClickedSlide
            pagination={{ clickable: true }}
            spaceBetween={20}
            breakpoints={{
              320: { spaceBetween: 20 },
              650: { spaceBetween: 20 },
              1000: { spaceBetween: 20 },
            }}
            observer={true}
            observeParents={true}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            onResize={(swiper) => {
              // also try to realign right after Swiper's internal resize
              // run in RAF to ensure layout done
              requestAnimationFrame(() => {
                swiper.updateSlides();
                swiper.update();
                swiper.slideToLoop(swiper.realIndex, 0, false);
              });
            }}
          >
            {Certifications_Data.map((cert, index) => (
              <SwiperSlide key={index}>
                <div className="slide-left">
                  <div className="title">
                    <h1>{cert.c_name}</h1>
                  </div>
                  <div className="content">
                    <div className="text-box">
                      <p>{cert.c_org}</p>
                      <p>{cert.c_issuedate}</p>
                    </div>
                  </div>
                  <div className="footer">
                    <button>
                      <span className="label">See More...</span>
                    </button>
                  </div>
                </div>
                <div className="slide-right">
                  <img src={cert.c_img} alt={cert.c_name} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </main>
  );
};

export default Slider;
