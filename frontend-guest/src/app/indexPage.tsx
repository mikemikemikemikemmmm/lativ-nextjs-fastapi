'use client'
import { Image } from "@/components/image";

import { Swiper, SwiperSlide } from 'swiper/react';
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