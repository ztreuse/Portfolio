import React, { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import './Slider.css';
import Certifications_Data from '../../assets/certifications_data';

const Slider = () => {
    const swiperRef = useRef(null); 
    const activeIndexRef = useRef(0); // Store the active index

    useEffect(() => {
        const handleResize = () => {
            if (swiperRef.current) {
                // Save the current active index
                swiperRef.current.wrapperEl.style.transitionDuration = '0s';
                activeIndexRef.current = swiperRef.current.realIndex;
                swiperRef.current.update();

                // Restore the active slide and ensure it's centered
                setTimeout(() => {
                    swiperRef.current.slideTo(activeIndexRef.current, 0, false); 
                    swiperRef.current.wrapperEl.style.transitionDuration = '';
                }, 0);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <main>
            <div className="cert">
            <h3>Certifications</h3>
            <div className="container">
                <Swiper 
                    modules={[Pagination]}
                    grabCursor
                    initialSlide={0}
                    centeredSlides
                    slidesPerView="auto"
                    speed={800}
                    slideToClickedSlide
                    pagination={{ clickable: true }}
                    spaceBetween={20}
                    breakpoints={{
                        320: { spaceBetween: 40 },
                        650: { spaceBetween: 30 },
                        1000: { spaceBetween: 20 },
                    }}
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper; 
                    }}
                >
                    {Certifications_Data.map((cert, index) => (
                        <SwiperSlide key={index}>
                            <img src={cert.c_img} alt={cert.c_name} />
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
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
            </div>
        </main>
    );
}

export default Slider;