'use client'
import { Button, Grid } from "@mui/material";
import { ColorRead } from "@/types/color";
import { ModalContainer } from "@/components/modalContainer";
import { FAKE_ID_FOR_CREATE, IMG_SIZE } from "@/utils/constant";
import { ColorModal } from "./modal";
import { useGetData } from "@/hook/useGetData";
import { useModalMethod } from "@/hook/useModalMethod";
import { IconBtnGroup } from "@/components/iconBtn";
import { deleteApi } from "@/api/base";
import { errorHandler } from "@/utils/errorHandler";
import { dispatchError, dispatchSuccess } from "@/store/method";
import { imgUrlPrefix } from "@/utils/env";
const emptyColor = {
  id: FAKE_ID_FOR_CREATE,
  name: "",
  img_url: ""
}

export default function Color() {
  const [getColors, colors] = useGetData<ColorRead>("color")
  const { handleCreate, handleEdit, isModalOpen, modalProps, closeModal } = useModalMethod({
    id: FAKE_ID_FOR_CREATE, name: "", img_url: ""
  } as ColorRead, "color", getColors)
  const handleDelete = async (c: ColorRead) => {
    const { error } = await deleteApi(`color/${c.id}`)
    if (error) {
      return errorHandler(error)
    }
    dispatchSuccess("刪除成功")
    getColors()
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
          colors.map(c => <div className="mp2 border inline-block w-1/9" key={c.id}>
            <div className="text-center">
              <div>
                <img className="inline-block" style={{
                  width: IMG_SIZE.color.w,
                  height: IMG_SIZE.color.h
                }} src={imgUrlPrefix + c.img_url} alt={c.name} />
              </div>
              <div>{c.name}</div>
              <div>
                <IconBtnGroup
                  onEdit={() => handleEdit(c)}
                  onDelete={() => handleDelete(c)} />
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
