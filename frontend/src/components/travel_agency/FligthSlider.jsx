import { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useTranslation } from "react-i18next";

const flightsData = [
  {
    id: 1,
    airline: "Emirates",
    logo: "/assets/img/brands/emirates.png",
    flightNumber: "EK204 (AK98)",
    from: "RIG",
    to: "LAX",
  },
  {
    id: 2,
    airline: "Phoenix Firelines",
    logo: "/assets/img/brands/phoenix-firelines.png",
    flightNumber: "EK204 (AK98)",
    from: "RIG",
    to: "LAX",
  },
  {
    id: 3,
    airline: "Qatar Airways",
    logo: "/assets/img/brands/qatar-airways.png",
    flightNumber: "EK204 (AK98)",
    from: "RIG",
    to: "LAX",
  },
  {
    id: 4,
    airline: "JAL",
    logo: "/assets/img/brands/jal.png",
    flightNumber: "EK204 (AK98)",
    from: "RIG",
    to: "LAX",
  },
  {
    id: 5,
    airline: "JAL",
    logo: "/assets/img/brands/jal.png",
    flightNumber: "EK204 (AK98)",
    from: "RIG",
    to: "LAX",
  },
];

const FligthSlider = () => {
  const { t } = useTranslation();
  return (
    <div className="position-absolute top-0 w-100 mt-3 mt-md-5 px-3 px-md-5 px-xl-7">
      <div
        className="d-flex align-items-center bg-secondary overflow-hidden rounded-1"
        style={{ height: 46 }}
      >
        <div className="h-100 px-3 d-flex align-items-center bg-danger-subtle position-relative z-5">
          <span className="fa-solid fa-circle text-danger me-md-2" />
          <h3 className="mb-0 fw-bold text-nowrap d-none d-md-block">
            {t("travelAgency.liveTracking")}
          </h3>
        </div>
        <div className="swiper-theme-container w-100">
          <Swiper
            modules={[Autoplay]}
            loop={true}
            allowTouchMove={false}
            spaceBetween={40}
            centeredSlides={true}
            slidesPerView="auto"
            speed={4000}
            autoplay={{
              delay: 0,
              disableOnInteraction: false,
            }}
            grabCursor={true}
            className="theme-slider"
          >
            {[...flightsData, ...flightsData].map((flight, index) => (
              <SwiperSlide key={index} className="w-auto">
                <div className="d-flex align-items-center">
                  <h6 className="px-3 py-2 bg-primary-subtle mb-0 fs-10 rounded-1 me-2">
                    {flight.id}
                  </h6>
                  <img
                    className="me-1"
                    src={flight.logo}
                    alt={flight.airline}
                    width={16}
                  />
                  <h6 className="mb-0 text-white fw-semibold me-3 text-nowrap">
                    {flight.flightNumber}
                  </h6>
                  <h6 className="mb-0 fw-semibold text-white">{flight.from}</h6>
                  <span className="fa-solid fa-plane text-primary mx-2" />
                  <h6 className="mb-0 fw-semibold text-white border-end pe-6">
                    {flight.to}
                  </h6>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};

export default FligthSlider;
