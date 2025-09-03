'use client'
import { ColorRead } from "@/types/color";
import { ModalContainer } from "@/components/modalContainer";
import { FAKE_ID_FOR_CREATE, IMG_SIZE } from "@/utils/constant";
import { ColorModal } from "./modal";
import { useGetData } from "@/hook/useGetData";
import { IconBtnGroup } from "@/components/iconBtn";
import { getImgUrl } from "@/utils/env";
import { useCommonMethods } from "@/hook/useCommonMethods";
import { useState } from "react";
import { ProductCardRead } from "@/types/product";
import { ProductCard } from "@/components/productCard";
import { getApi } from "@/api/base";
import { errorHandler } from "@/utils/errorHandler";

export default function Color() {
  const [getColors, colors] = useGetData<ColorRead>("color")
  const { handleCreate, handleEdit, isModalOpen, modalProps, closeModal, handleDelete } = useCommonMethods({
    id: FAKE_ID_FOR_CREATE, name: "", img_url: ""
  } as ColorRead, "color", getColors)
  const _handleDelete = async (c: ColorRead) => {
    handleDelete(c.id)
  }
  const getProductCards = async (colorId: number) => {
    const { data, error } = await getApi<ProductCardRead[]>(`product_card/?color_id=${colorId}`)
    if (error) {
      return errorHandler(error)
    }
    setCards(data)
  }
  const [cards, setCards] = useState<ProductCardRead[]>([])
  if (colors === "loading") {
    return null
  }
  return (
    <>
      {isModalOpen &&
        <ModalContainer closeFn={closeModal} isOpen={isModalOpen}>
          <ColorModal
            colors={colors}
            modalProps={modalProps as ColorRead}
            closeModal={closeModal}
            refresh={getColors}
          />
        </ModalContainer>
      }
      <div>
        <button onClick={handleCreate} className="btn inline-block mp2">
          新增顏色
        </button>
      </div>
      <div>
        {
          colors.map(c => <div onClick={() => getProductCards(c.id)} className="mp2 btn inline-block w-1/10" key={c.id}>
            <div className="text-center">
              <div>
                <img className="inline-block" style={{
                  width: IMG_SIZE.color.w,
                  height: IMG_SIZE.color.h
                }} src={getImgUrl(c.img_url)} alt={c.name} />
              </div>
              <div>{c.name}</div>
              <div>被使用次數{c.sub_product_count}</div>
              <div>
                <IconBtnGroup
                  onEdit={() => handleEdit(c)}
                  onDelete={() => _handleDelete(c)} />
              </div>
            </div>
          </div>)
        }
      </div>
      <div className="">
        <div className="mp2 border inline-block">
          下列為使用此顏色的產品
        </div>
        {
          cards.length !== 0 &&
          <button className="mp2 btn inline-block" onClick={() => setCards([])}>
            清空產品資料
          </button>
        }
      </div>
      <div>
        {
          cards.map(c => <div key={c.id} className="inline-block w-1/8">
            <ProductCard pc={c} />
          </div>)
        }
      </div>
    </>
  )
}
