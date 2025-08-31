'use client'
import { ModalContainer } from "@/components/modalContainer";
import { useGetData } from "@/hook/useGetData";
import { useModalMethod } from "@/hook/useModalMethod";
import { SizeRead } from "@/types/size";
import { FAKE_ID_FOR_CREATE } from "@/utils/constant";
import { SizeModal } from "./modal";
import { SeriesRead } from "@/types/series";
import { IconBtnGroup } from "@/components/iconBtn";

export default function () {
  const [getSizes, sizes] = useGetData<SizeRead>("size")
  const { handleCreate, handleEdit, handleDragOver, handleDragStart, handleDrop, isModalOpen, modalProps, closeModal } = useModalMethod({
    id: FAKE_ID_FOR_CREATE, name: ""
  } as SizeRead, "size", getSizes)
  const handleDelete = (s: SizeRead) => {
    //TODO
  }
  if (sizes === "loading") {
    return <div className="text-center text-2xl m-6">loading...</div>
  }
  return (
    <>
      {isModalOpen &&
        <ModalContainer closeFn={closeModal} isOpen={isModalOpen}>
          <SizeModal
            sizes={sizes}
            modalProps={modalProps as SeriesRead}
            closeModal={closeModal}
            refresh={getSizes}
          />
        </ModalContainer>
      }
      <div>
        <div className="btn inline-block mp2" onClick={handleCreate}>
          新增尺寸
        </div>
        <div className="flex flex-wrap">
          {sizes.length === 0 &&
            <div className="text-center text-2xl m-2">沒有任何尺寸</div>
          }
          {sizes.map(s => <div
            draggable
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(s.id)}
            className="w-1/6" key={s.id}>
            <div className="mp2 border text-center">
              <div
              >{s.name}</div>
              <div>
                <IconBtnGroup
                  onDelete={() => handleDelete(s)}
                  onEdit={() => handleEdit(s)}
                  onDragStart={() => handleDragStart(s.id)} />
              </div>
            </div>
          </div>)}
        </div>
      </div>
    </>
  );
}
