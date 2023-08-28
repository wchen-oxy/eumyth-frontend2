import React from "react";
// import function to register Swiper custom elements
import { register } from 'swiper/element/bundle';
// register Swiper custom elements
register();

const SwiperSlider = (props) => {

    return (
        <swiper-container
           
            slides-per-view="3"
            navigation="true"
            pagination="true"
        >
            <swiper-slide>Slide 1</swiper-slide>
            <swiper-slide>Slide 2</swiper-slide>
            <swiper-slide>Slide 3</swiper-slide>
            ...
        </swiper-container>
    );
}

export default SwiperSlider;