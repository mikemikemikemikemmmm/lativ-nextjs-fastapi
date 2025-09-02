'use client'
import { ColorRead } from "@/types/color";
import { ModalContainer } from "@/components/modalContainer";
import { FAKE_ID_FOR_CREATE, IMG_SIZE } from "@/utils/constant";
import { ColorModal } from "./modal";
import { useGetData } from "@/hook/useGetData";
import { IconBtnGroup } from "@/components/iconBtn";
import { getImgUrl } from "@/utils/env";
import { useCommonMethods } from "@/hook/useCommonMethods";

export default function Color() {
  const [getColors, colors] = useGetData<ColorRead>("color")
  const { handleCreate, handleEdit, isModalOpen, modalProps, closeModal, handleDelete } = useCommonMethods({
    id: FAKE_ID_FOR_CREATE, name: "", img_url: ""
  } as ColorRead, "color", getColors)
  const _handleDelete = async (c: ColorRead) => {
    handleDelete(c.id)
  }
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
        <div onClick={handleCreate} className="btn inline-block mp2">
          新增顏色
        </div>
      </div>
      <div>
        {
          colors.map(c => <div className="mp2 border inline-block w-1/13" key={c.id}>
            <div className="text-center">
              <div>
                <img className="inline-block" style={{
                  width: IMG_SIZE.color.w,
                  height: IMG_SIZE.color.h
                }} src={getImgUrl(c.img_url)} alt={c.name} />
              </div>
              <div>{c.name}</div>
              <div>
                <IconBtnGroup
                  onEdit={() => handleEdit(c)}
                  onDelete={() => _handleDelete(c)} />
              </div>
            </div>
          </div>)
        }
      </div>
      {/* <Grid container sx={{ margin: 1 }} spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Button variant="contained" onClick={() => setProductCards([])}>
            清空產品資料
          </Button>
        </Grid>
        {productCards.length === 0 ?
          <Grid size={{ xs: 12 }} >無產品資料</Grid>
          :
          productCards.map(pc => (
            <Grid size={{ xs: 2 }} key={pc.id} >
              <AdminProductCardComponent productCard={pc} />
            </Grid>)
          )
        }
      </Grid> */}
    </>
  )
}
