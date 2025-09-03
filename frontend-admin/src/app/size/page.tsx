'use client'
import { ModalContainer } from "@/components/modalContainer";
import { useGetData } from "@/hook/useGetData";
import { useCommonMethods } from "@/hook/useCommonMethods";
import { SizeRead } from "@/types/size";
import { FAKE_ID_FOR_CREATE } from "@/utils/constant";
import { SizeModal } from "./modal";
import { SeriesRead } from "@/types/series";
import { IconBtnGroup } from "@/components/iconBtn";

export default function () {
  const [getSizes, sizes] = useGetData<SizeRead>("size")
  const { handleCreate, handleEdit, handleDragOver, handleDragStart, handleDelete,handleDrop, isModalOpen, modalProps, closeModal } = useCommonMethods({
    id: FAKE_ID_FOR_CREATE, name: ""
  } as SizeRead, "size", getSizes)
  const _handleDelete = async (s: SizeRead) => {
    handleDelete(s.id)
  }
  if (sizes === "loading") {
    return null
  }
  return (
    <>
      {isModalOpen &&
        <ModalContainer closeFn={closeModal} isOpen={isModalOpen}>
          <SizeModal
            sizes={sizes}
            modalProps={modalProps as SizeRead}
            closeModal={closeModal}
            refresh={getSizes}
          />
        </ModalContainer>
      }
      <div>
        <button className="btn inline-block mp2" onClick={handleCreate}>
          新增尺寸
        </button>
        <div className="flex flex-wrap">
          {sizes.length === 0 &&
            <div className="text-center text-2xl m-2">沒有任何尺寸</div>
          }
          {sizes.map(s => <div
            draggable
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(s.id)}
            className="w-1/10" key={s.id}>
            <div className="mp2 border text-center">
              <div
              >{s.name}</div>
              <div>
                <IconBtnGroup
                  onDelete={() => _handleDelete(s)}
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
