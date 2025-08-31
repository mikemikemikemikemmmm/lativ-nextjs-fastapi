'use client'
import { ModalContainer } from "@/components/modalContainer";
import { useGetData } from "@/hook/useGetData";
import { useModalMethod } from "@/hook/useModalMethod";
import { FAKE_ID_FOR_CREATE } from "@/utils/constant";
import { GenderModal } from "./modal";
import { IconBtnGroup } from "@/components/iconBtn";
import { GenderRead } from "@/types/gender";

export default function () {
  const [getGenders, genders] = useGetData<GenderRead>("gender")
  const { handleCreate, handleEdit,  isModalOpen, modalProps, closeModal } = useModalMethod({
    id: FAKE_ID_FOR_CREATE, name: ""
  } as GenderRead, "gender", getGenders)
  const handleDelete = (s: GenderRead) => {
    //TODO
  }
  if (genders === "loading") {
    return null
  }
  return (
    <>
      {isModalOpen &&
        <ModalContainer closeFn={closeModal} isOpen={isModalOpen}>
          <GenderModal
            genders={genders}
            modalProps={modalProps as GenderRead}
            closeModal={closeModal}
            refresh={getGenders}
          />
        </ModalContainer>
      }
      <div>
        <div className="btn inline-block mp2" onClick={handleCreate}>
          新增性別
        </div>
        <div className="flex flex-wrap">
          {genders.length === 0 &&
            <div className="text-center text-2xl m-2">沒有任何性別</div>
          }
          {genders.map(g => <div
            className="w-1/6" key={g.id}>
            <div className="mp2 border text-center">
              <div
              >{g.name}</div>
              <div>
                <IconBtnGroup
                  onDelete={() => handleDelete(g)}
                  onEdit={() => handleEdit(g)} />
              </div>
            </div>
          </div>)}
        </div>
      </div>
    </>
  );
}
