import React, { useState, useEffect, useCallback } from 'react'
import { PrevButton, NextButton } from './sub-components/button';
import useEmblaCarousel from 'embla-carousel-react'

export const EmblaCarousel = (props) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
    const [prevBtnEnabled, setPrevBtnEnabled] = useState(true);
    const [nextBtnEnabled, setNextBtnEnabled] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState([]);


    const onInit = useCallback((emblaApi) => {
        setScrollSnaps(emblaApi.scrollSnapList())
    }, []);

    const scrollPrev = useCallback(
        () => emblaApi && emblaApi.scrollPrev(),
        [emblaApi],
    );

    const scrollNext = useCallback(
        () => emblaApi && emblaApi.scrollNext(),
        [emblaApi],
    );

    const onSelect = useCallback((emblaApi) => {
        setSelectedIndex(emblaApi.selectedScrollSnap())
        setPrevBtnEnabled(emblaApi.canScrollPrev())
        setNextBtnEnabled(emblaApi.canScrollNext())
    }, [])

    useEffect(() => {
        if (!emblaApi) return

        onInit(emblaApi)
        onSelect(emblaApi)
        emblaApi.on('reInit', onInit)
        emblaApi.on('reInit', onSelect)
        emblaApi.on('select', onSelect)
    }, [emblaApi, onInit, onSelect]);

    console.log(props.images);

    const images = props.images.map(
        (image) => {
           
            return (
            <div className="embla__slide">
                <img src={image} />
            </div>)
        }
    )  ;
    return (
        <div className="embla">
            <div className="embla__viewport" ref={emblaRef}>
                <div className="embla__container">

                    {images}
                    {/* <div className="embla__slide">Slide 1</div>
                    <div className="embla__slide">Slide 2</div>
                    <div className="embla__slide">Slide 3</div> */}
                </div>
            </div>
            <div className='emblacarousel-button-container'>
                <PrevButton onClick={scrollPrev} enabled={prevBtnEnabled} />
                <NextButton onClick={scrollNext} enabled={nextBtnEnabled} />
            </div>

        </div>
    )
}
