
import React, { useMemo, useState } from "react";
import { useAppContext } from "../../hooks/useGlobal";
import {
  Pagination,
  Icons,
  Button,
  ToggleSwitch,
  FilterData,
  AsyncBannerModal,
  CreateScriptTag,
  ModalDelete,
} from "../index";
import styles from "./styles.module.scss";
import icDelete from "/ic-delete.png";
import icContentCopy from "/ic-content-copy.png";


const ListTags: React.FC = () => {
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [selectedScript, setSelectedScript] = useState<IScripts | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ISlots | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState<{ nameTag: string; isSlot: boolean } | undefined>(undefined);
  const [filters, setFilters] = useState<IFilterTags>({
    type: "Todos",
    category: "Todos",
    status: "Todos",
  });
  const [showModalCreateScriptTag, setShowModalCreateScriptTag] = useState(false);
  const [showModalCreateAsyncBanner, setShowModalCreateAsyncBanner] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const { repositoryState, setRepositoryState } = useAppContext();
  const combinedItems = useMemo(() => {
    return [
      ...repositoryState.slots.map((slot) => ({ ...slot, type: "slot" })),
      ...repositoryState.tagsScripts.map((script) => ({ ...script, type: "script" })),
    ];
  }, [repositoryState.slots, repositoryState.tagsScripts]);

  const filteredItems = useMemo(() => {
    return combinedItems.filter((item) => {
      const matchesSearch = item.nameTag.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filters.category === "Todos" || item.category === filters.category;
      const matchesStatus =
        filters.status === "Todos" ||
        (filters.status === "Ativado" && item.isActive) ||
        (filters.status === "Desativado" && !item.isActive);
      const matchesType =
        filters.type === "Todos" ||
        (filters.type === "Banner Assíncrono" && item.type === "slot") ||
        (filters.type === "Script" && item.type === "script");

      return matchesSearch && matchesCategory && matchesStatus && matchesType;
    });
  }, [combinedItems, searchQuery, filters]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  React.useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredItems.length, totalPages, currentPage]);

  const handleFilterChange = (category: keyof IFilterTags, value: string) => {
    setFilters((prev) => ({ ...prev, [category]: value }));
  };

  const handleToggle = (nameTag: string, isSlot: boolean) => {
    if (isSlot) {
      setRepositoryState((prev) => ({
        ...prev,
        slots: prev.slots.map((slot) =>
          slot.nameTag === nameTag ? { ...slot, isActive: !slot.isActive } : slot
        ),
      }));
    } else {
      setRepositoryState((prev) => ({
        ...prev,
        tagsScripts: prev.tagsScripts.map((script) =>
          script.nameTag === nameTag ? { ...script, isActive: !script.isActive } : script
        ),
      }));
    }
  };

  const handleEditScript = (script: IScripts) => {
    setSelectedScript(script);
    setShowModalCreateScriptTag(true);
  };

  const handleEditSlot = (slot: ISlots) => {    
    setSelectedSlot(slot);
    setShowModalCreateAsyncBanner(true);
  };

  const handleCloseModal = () => {
    setShowModalCreateScriptTag(false);
    setSelectedScript(null);
  };

  function clickOutsideMenu() {
    setShowOptionsMenu(false);
  }

  function openConfirmModal() {
    setSelectedScript(null);
    setShowModalCreateScriptTag(true);
    setShowOptionsMenu(false);
  }

  function openCreateAsyncBannerModal() {
    setSelectedSlot(null);
    setShowModalCreateAsyncBanner(true);
    setShowOptionsMenu(false);
  }

  function openDeleteModalConfirmation({ nameTag, isSlot }: { nameTag: string; isSlot: boolean }) {
    setSelectedTag({ nameTag, isSlot });
    setShowConfirmModal(true);
    setShowOptionsMenu(false);
  }

  function handleDelete(nameTag: string, isSlot: boolean) {
    if (isSlot) {
      setRepositoryState((prev) => ({
        ...prev,
        slots: prev.slots.filter((slot) => slot.nameTag !== nameTag),
      }));
    } else {
      setRepositoryState((prev) => ({
        ...prev,
        tagsScripts: prev.tagsScripts.filter((script) => script.nameTag !== nameTag),
      }));
    }
    setShowConfirmModal(false);
    setSelectedTag({
      isSlot: true,
      nameTag: "",
    });
  }

  function handleCopyTag(item: any) {
    if (item.type === "slot") {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = item;
      const maxId = Math.max(0, ...repositoryState.slots.map(s => Number(s.id) || 0));
      const newId = maxId + 1;
      setRepositoryState((prev) => ({
        ...prev,
        slots: [
          ...prev.slots,
          {
            ...rest,
            id: newId,
            nameTag: `${item.nameTag}_copy`,
          },
        ],
      }));
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = item;
      
      setRepositoryState((prev) => ({
        ...prev,
        tagsScripts: [
          ...prev.tagsScripts,
          {
            ...rest,
            nameTag: `${item.nameTag}_copy`,
          },
        ],
      }));
    }
  }
  return (
    <>
      {showOptionsMenu && (
        <div
          onClick={clickOutsideMenu}
          style={{
            width: "100%",
            height: "100vh",
            position: "absolute",
            zIndex: "10",
            left: "0",
            top: "0",
          }}
        ></div>
      )}
      <section className={styles.container}>
        <div className={styles.container_filter_menu}>
          <FilterData
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          <Button
            icon={Icons["icPlus"]}
            mode="tertiary"
            text="Criar Tag"
            onClick={() => {
              setSelectedScript(null);
              setShowOptionsMenu(true);
            }}
          />
        </div>

        <div className={styles.container_content}>
          <header className={styles.header_tags}>
            <ul>
              <li>
                <p>Nome da tag</p>
              </li>
              <li>
                <p>Tipo</p>
              </li>
              <li>
                <p>Categoria</p>
              </li>
              <li>
                <p>Status</p>
              </li>
              <li>
                <p>Ações</p>
              </li>
            </ul>
          </header>

          <section id="repository">
            {paginatedItems.map((item, index) => (
              <div key={`tag-${index}`} className={styles.content}>
                <ul>
                  <li>
                    <p>
                      <span
                        className={styles.link}
                        onClick={() => {
                          if (item.type === "script") {
                            handleEditScript(item as IScripts);
                          }
                          if (item.type === "slot") {
                            handleEditSlot(item as ISlots);
                          }
                        }}
                      >
                        {item.nameTag}
                      </span>
                    </p>
                  </li>
                  <li>
                    <p>
                      {item.type === "slot" ? "Banner Assíncrono" : "Script"}
                    </p>
                  </li>
                  <li>
                    <p
                      className={`${styles.badge} ${item.category === "Produção"
                          ? styles.production
                          : styles.testing
                        }`}
                    >
                      {item.category}
                    </p>
                  </li>
                  <li>
                    <ToggleSwitch
                      checked={item.isActive}
                      onChange={() =>
                        handleToggle(item.nameTag, item.type === "slot")
                      }
                      onLabel="Ligado"
                      offLabel="Desligado"
                    />
                  </li>
                  <li>
                    <img
                      src={icContentCopy}
                      alt="copiar"
                      title="copiar"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleCopyTag(item)}
                    />
                    <img
                      onClick={() =>
                        openDeleteModalConfirmation({
                          nameTag: item.nameTag,
                          isSlot: item.type === "slot" ? true : false,
                        })
                      }
                      src={icDelete}
                      alt="deletar"
                      title="deletar"
                      style={{ cursor: "pointer" }}
                    />
                  </li>
                </ul>
              </div>
            ))}
          </section>
        </div>

        {totalPages > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {showOptionsMenu && (
          <div className={styles.optionsMenu}>
            <button
              style={{
                content: "",
                width: "100%",
                borderBottom: "1px solid #E2E8ED",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                paddingTop: "20px",
              }}
              onClick={() => openCreateAsyncBannerModal()}
              type="button"
            >
              {Icons["IcAsyncBanner"]} Banner Assincrono
            </button>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                borderBottom: "1px solid #E2E8ED",
                gap: "16px",
                paddingTop: "20px",
              }}
              onClick={() => openConfirmModal()}
              type="button"
            >
              {Icons["IcScript"]}{" "}
              <span style={{ paddingTop: "1px" }}>Script</span>
            </button>

            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                paddingTop: "20px",
              }}
              type="button"
            >
              {Icons["IcPaper"]}{" "}
              <span style={{ paddingTop: "1px" }}>
                Criar a partir de um template
              </span>
            </button>
          </div>
        )}

        {showModalCreateScriptTag && (
          <CreateScriptTag
            closeModal={handleCloseModal}
            script={selectedScript ?? undefined}
          />
        )}
        {showModalCreateAsyncBanner && (
          <AsyncBannerModal
            closeModal={() => setShowModalCreateAsyncBanner(false)}
            slot={selectedSlot ?? undefined}
          />
        )}

        {showConfirmModal && (
          <ModalDelete
            closeConfirmModal={() => setShowConfirmModal(false)}
            isTag={true}
            handleDelete={() =>
              handleDelete(selectedTag!.nameTag, selectedTag!.isSlot)
            }
            selectedName={selectedTag!.nameTag}
          />
        )}
      </section>
    </>
  );
};

export default ListTags;