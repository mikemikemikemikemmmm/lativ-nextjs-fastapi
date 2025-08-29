'use client'
import { Stack, Button, Grid, Container, CircularProgress } from "@mui/material";
import { deleteApi, getApi, postApi, putApi } from "@/api/base";
import { ColorRead } from "@/types/color";
import { errorHandler } from "@/utils/errorHandler";
import { useEffect, useState } from "react";
import { ModalContainer } from "@/components/modalContainer";
import { FAKE_ID_FOR_CREATE } from "@/utils/constant";
import { ColorModal } from "./modal";
import { ProductCard } from "@/types/product";
import { AdminProductCardComponent } from "@/components/productCard";
const emptyColor = {
  id: FAKE_ID_FOR_CREATE,
  name: "",
  img_url: ""
}

export default function AdminColor() {
  const [colors, setColors] = useState<ColorRead[]>([])
  const getAllColors = async () => {
    const { data, error } = await getApi<ColorRead[]>("colors")
    if (error) {
      return errorHandler(error)
    }
    setColors(data)
  }
  useEffect(() => {
    getAllColors()
  }, [])
  const [modalProps, setModalProps] = useState<ColorRead | undefined>(undefined)
  const isModalOpen = !!modalProps
  const handleEdit = (color: ColorRead) => {
    setModalProps({ ...color })
  }
  const handleCreate = () => {
    setModalProps({ ...emptyColor })
  }
  const handleDelete = async (c: ColorRead) => {
    if (!confirm(`確定刪除"${c.name}"?`)) {
      return
    }
    const { error } = await deleteApi("colors/" + c.id)
    if (error) {
      return errorHandler(error)
    }
  }
  const closeModal = () => {
    setModalProps(undefined)
  }

  const [productCards, setProductCards] = useState<ProductCard[]>([])
  const handleSelect = async (c: ColorRead) => {
    const { data, error } = await getApi<ProductCard[]>(`product_cards/?color_id=${c.id}`)
    if (error) {
      return errorHandler(error)
    }
    setProductCards(data)
  }
  return (
    <>
      {isModalOpen &&
        <ModalContainer closeFn={closeModal} isOpen={isModalOpen}>
          <ColorModal
            colorsData={colors}
            modalProps={modalProps}
            closeModal={closeModal}
          />
        </ModalContainer>
      }
      <Grid container sx={{ margin: 1 }} spacing={2}>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <Button sx={{ height: '100%' }} variant="contained" fullWidth onClick={() => handleCreate()}>新增顏色</Button>
        </Grid>
        <Grid size={{ xs: 6, sm: 8, md: 10 }}>
        </Grid>
        {
          (colors.length === 0) ?
            <Grid size={{ xs: 12 }}>無顏色</Grid>
            :
            colors.map(c => <div key={c.id}>
              <div onClick={() => handleSelect(c)}>
                <img src={c.img_url} alt={c.name} />
                <div>{c.name}</div>
              </div>
              <div>
                <button onClick={() => handleEdit(c)}>修改</button>
                <button onClick={() => handleDelete(c)}>刪除</button>
              </div>
            </div>)
        }
      </Grid>
      <Grid container sx={{ margin: 1 }} spacing={2}>
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
      </Grid>
    </>
  )
}
