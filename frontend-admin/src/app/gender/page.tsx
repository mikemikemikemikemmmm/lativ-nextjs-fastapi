'use client'
import { ModalContainer } from "@/components/modalContainer";
import { useGetData } from "@/hook/useGetData";
import { useCommonMethods } from "@/hook/useCommonMethods";
import { FAKE_ID_FOR_CREATE } from "@/utils/constant";
import { GenderModal } from "./modal";
import { IconBtnGroup } from "@/components/iconBtn";
import { GenderRead } from "@/types/gender";

export default function () {
  const [getGenders, genders] = useGetData<GenderRead>("gender")
  const { handleCreate, handleEdit, isModalOpen, modalProps, closeModal, handleDelete } = useCommonMethods({
    id: FAKE_ID_FOR_CREATE, name: ""
  } as GenderRead, "gender", getGenders)
  const _handleDelete = async (g: GenderRead) => {
    handleDelete(g.id)
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
        <button className="btn inline-block mp2" onClick={handleCreate}>
          新增性別
        </button>
        <div className="flex flex-wrap">
          {genders.length === 0 &&
            <div className="text-center text-2xl m-2">沒有任何性別</div>
          }
          {genders.map(g => <div
            className="w-1/13" key={g.id}>
            <div className="mp2 border text-center">
              <div
              >{g.name}</div>
              <div>
                <IconBtnGroup
                  onDelete={() => _handleDelete(g)}
                  onEdit={() => handleEdit(g)} />
              </div>
            </div>
          </div>)}
        </div>
      </div>
    </>
  );
}
