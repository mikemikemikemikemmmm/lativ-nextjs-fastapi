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
import { useGetData } from "@/hook/useGetData";
import { useModalMethod } from "@/hook/useModalMethod";
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
  const handleDelete = (c: ColorRead) => {
    //TODO
  }
  if (colors === "loading") {
    return <div className="text-center text-2xl m-6">loading...</div>
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
              {/* <div onClick={() => handleSelect(c)}> */}
              <div>
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
