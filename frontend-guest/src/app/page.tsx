'use client'
// import carouselImg0 from "/indexPage/carousel/0.jpg"
// import carouselImg1 from "/indexPage/carousel/1.jpg"
// import carouselImg2 from "/indexPage/carousel/2.jpg"
// import carouselImg3 from "/indexPage/carousel/3.jpg"
// import commentImg1 from "/indexPage/comment1.gif"
// import commentImg2 from "/indexPage/comment2.gif"
// import commentImg3 from "/indexPage/comment3.gif"
// import commentImg4 from "/indexPage/comment4.gif"
// import commentImg5 from "/indexPage/comment5.gif"
// import streamImg1 from "/indexPage/stream1.jpg"
// import streamImg2 from "/indexPage/stream2.jpg"
// import streamImg3 from "/indexPage/stream3.jpg"
// import streamImg4 from "/indexPage/stream4.jpg"
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import React from 'react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

// import './styles.css';

// import required modules
import { Navigation } from 'swiper/modules';
 function IndexPage()  {
  return (
    <>
      <div className="w-full">
        <Swiper navigation={true} modules={[Navigation]} className="mySwiper">
          <SwiperSlide><Image src={"/indexPage/carousel/0.jpg"} height={630} width={1180} alt="" /></SwiperSlide>
          <SwiperSlide><Image src={"/indexPage/carousel/1.jpg"} height={630} width={1180} alt="" /></SwiperSlide>
          <SwiperSlide><Image src={"/indexPage/carousel/2.jpg"} height={630} width={1180} alt="" /></SwiperSlide>
          <SwiperSlide><Image src={"/indexPage/carousel/3.jpg"} height={630} width={1180} alt="" /></SwiperSlide>
        </Swiper>
      </div>
      <div className="mt-5 mb-2 text-center" >
        <span className="inline-block w-1/5">
          <Image src={"/indexPage/comment1.gif"} height={70} width={220} alt="" />
        </span>
        <span className="inline-block w-1/5">
          <Image src={"/indexPage/comment2.gif"} height={70} width={220} alt="" />
        </span>
        <span className="inline-block w-1/5">
          <Image src={"/indexPage/comment3.gif"} height={70} width={220} alt="" />
        </span>
        <span className="inline-block w-1/5">
          <Image src={"/indexPage/comment4.gif"} height={70} width={220} alt="" />
        </span>
        <span className="inline-block w-1/5 ">
          <Image src={"/indexPage/comment5.gif"} height={70} width={220} alt="" />
        </span>
      </div>
      <div className="mb-5" >
        <span className="inline-block w-1/2 pr-3">
          <div className="py-3">
            <Image src={"/indexPage/stream1.jpg"} height={580} width={580} alt="" />
          </div>
          <div className="py-3">
            <Image src={"/indexPage/stream2.jpg"} height={725} width={580} alt="" />
          </div>
        </span>
        <span className="inline-block w-1/2 pl-3">
          <div className="py-3">
            <Image src={"/indexPage/stream3.jpg"} height={725} width={580} alt="" />
          </div>
          <div className="py-3">
            <Image src={"/indexPage/stream4.jpg"} height={580} width={580} alt="" />
          </div>
        </span>
      </div>
    </>
  )
}
export default IndexPage