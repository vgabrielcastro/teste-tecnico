import React from "react";
import { useParams } from "react-router-dom";

import styles from "./styles.module.scss";
import { Button, ToggleSwitch, TagInput } from "../index";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useAppContext } from "../../hooks/useGlobal";
import { callToastify } from "../../utils/toastify";
import { getAccounts } from "../../services/account";
import { getRepositoriesByAccountId, createSlotBatch } from "../../services/repository";

interface IAsyncBannerModalProps {
  slot?: ISlots;
  closeModal: React.Dispatch<React.SetStateAction<boolean>>;
}

interface IRepositoryWithAccount extends IRepository {
  contaId?: number;
  accountName?: string;
}

type ISlotForm = Omit<ISlots, 'sizeMaping'> & {
  sizeMaping: IsizeMaping[];
};

const defaultSlot: ISlotForm = {
  nameTag: "",
  id: 9,
  tagId: "",
  defineMapping: "",
  pos: "",
  native: "",
  refresh: "",
  adUnit: "",
  isInfinite: false,
  modelo: "",
  isActive: true,
  category: "Produção",
  sizeMaping: [],
  keyword: '[]',  
  campaign: "",
  label: "",
  urlBlock: '[]',
  urlFree: '[]',
};

const AsyncBannerModal: React.FC<IAsyncBannerModalProps> = ({
  slot,
  closeModal,
}) => {
  const { accountId, repositoryId } = useParams();

  const [accounts, setAccounts] = React.useState<ICardAccountProps[]>([]);
  const [repositories, setRepositories] = React.useState<IRepositoryWithAccount[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = React.useState<number[]>(() =>
    accountId ? [Number(accountId)] : []
  );
  const [selectedRepositoryIds, setSelectedRepositoryIds] = React.useState<number[]>(() =>
    repositoryId ? [Number(repositoryId)] : []
  );
  const initialRepoAppliedRef = React.useRef(false);

  React.useEffect(() => {
    if (slot) return;
    let active = true;
    getAccounts().then((accList) => {
      if (!active) return;
      setAccounts(accList || []);
    });
    return () => {
      active = false;
    };
  }, [slot]);

  React.useEffect(() => {
    if (slot) return;
    if (selectedAccountIds.length === 0) {
      setRepositories([]);
      setSelectedRepositoryIds([]);
      return;
    }

    let active = true;
    Promise.all(
      selectedAccountIds.map(async (accId) => {
        const repos = await getRepositoriesByAccountId(accId);
        const acc = accounts.find((a) => Number(a.id) === Number(accId));
        return (repos || []).map((r) => ({
          ...r,
          contaId: accId,
          accountName: acc?.name,
        }));
      })
    ).then((results) => {
      if (!active) return;
      const merged = results.flat();
      const uniqueRepos = Array.from(
        new Map(merged.map((item) => [Number(item.id), item])).values()
      );
      setRepositories(uniqueRepos);

      const validRepoIds = new Set(uniqueRepos.map((r) => Number(r.id)));
      setSelectedRepositoryIds((prev) => {
        const filtered = prev.filter((id) => validRepoIds.has(Number(id)));
        if (
          !initialRepoAppliedRef.current &&
          repositoryId &&
          validRepoIds.has(Number(repositoryId)) &&
          filtered.length === 0
        ) {
          initialRepoAppliedRef.current = true;
          return [Number(repositoryId)];
        }
        initialRepoAppliedRef.current = true;
        return filtered;
      });
    });

    return () => {
      active = false;
    };
  }, [selectedAccountIds, accounts, slot, repositoryId]);

  const handleAccountSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value || value === "multiple") return;

    if (value === "all") {
      const allIds = accounts.map((acc) => Number(acc.id));
      setSelectedAccountIds(allIds);
      return;
    }

    const numericId = Number(value);
    setSelectedAccountIds((prev) =>
      prev.includes(numericId) ? prev : [...prev, numericId]
    );
  };

  const handleRemoveAccount = (idToRemove: number) => {
    setSelectedAccountIds((prev) => prev.filter((id) => id !== idToRemove));
  };

  const handleRepositorySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value || value === "multiple") return;

    if (value === "all") {
      const allRepoIds = repositories.map((repo) => Number(repo.id));
      setSelectedRepositoryIds(allRepoIds);
      return;
    }

    const numericId = Number(value);
    setSelectedRepositoryIds((prev) =>
      prev.includes(numericId) ? prev : [...prev, numericId]
    );
  };

  const handleRemoveRepository = (idToRemove: number) => {
    setSelectedRepositoryIds((prev) => prev.filter((id) => id !== idToRemove));
  };

  const accountSelectValue = React.useMemo(() => {
    if (accounts.length > 0 && selectedAccountIds.length === accounts.length) {
      return "all";
    }
    if (selectedAccountIds.length > 1) {
      return "multiple";
    }
    if (selectedAccountIds.length === 1) {
      return String(selectedAccountIds[0]);
    }
    return "";
  }, [accounts.length, selectedAccountIds]);

  const repositorySelectValue = React.useMemo(() => {
    if (
      repositories.length > 0 &&
      selectedRepositoryIds.length === repositories.length
    ) {
      return "all";
    }
    if (selectedRepositoryIds.length > 1) {
      return "multiple";
    }
    if (selectedRepositoryIds.length === 1) {
      return String(selectedRepositoryIds[0]);
    }
    return "";
  }, [repositories.length, selectedRepositoryIds]);

  const parseSlot = React.useCallback((slotData?: ISlots): ISlotForm => {
    if (!slotData) {
      return defaultSlot;
    }
    
    try {
      let sizeMaping: IsizeMaping[] = [];
      
      if (Array.isArray(slotData.sizeMaping)) {
        sizeMaping = slotData.sizeMaping as any;
      }
      else if (typeof slotData.sizeMaping === 'string' && slotData.sizeMaping) {
        try {
          let parsed = JSON.parse(slotData.sizeMaping);
          if (typeof parsed === 'string') {
            parsed = JSON.parse(parsed);
          }
          sizeMaping = Array.isArray(parsed) ? parsed : [];
        } catch {
          sizeMaping = [];
        }
      }
      
      const parsed = {
        ...slotData,
        sizeMaping,
      };
      
      return parsed;
    } catch {
      return { ...slotData, sizeMaping: [] };
    }
  }, []);

  const parsedSlotData = React.useMemo(() => parseSlot(slot), [slot, parseSlot]);

  const {
    register,
    watch,
    setValue,
    control,
    reset,
  } = useForm<ISlotForm>({
    defaultValues: parsedSlotData,
  });
  
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "sizeMaping",
  });

  React.useEffect(() => {
    const data = parseSlot(slot);
    reset(data);
    replace(data.sizeMaping);
  }, [slot, reset, replace, parseSlot]);

  const { setRepositoryState } = useAppContext();

  function handleTagsChange(tags: string[]) {
    setValue("keyword", JSON.stringify(tags));
  }

  function handleUrlBlockChange(tags: string[]) {
    setValue("urlBlock", JSON.stringify(tags));
  }

  function handleUrlFreeChange(tags: string[]) {
    setValue("urlFree", JSON.stringify(tags));
  }  

  async function handleSaveAsyncBanner() {
    const data = watch();

    if (!data.nameTag?.trim()) {
      callToastify({
        message: "Preencha o nome do banner!",
        status: "error",
      });
      return;
    }
    
    const dataToSave: ISlots = {
      ...data,
      sizeMaping: JSON.stringify(data.sizeMaping || []),
    };

    if (slot && slot.id) {
      setRepositoryState((file) => ({
        ...file,
        slots: file.slots.map((s) =>
          s.id === slot.id ? { ...s, ...dataToSave } : s
        ),
      }));
      callToastify({
        message: "Slot atualizado com sucesso!",
        status: "success",
      });
      closeModal(false);
      return;
    }

    if (selectedAccountIds.length === 0) {
      callToastify({
        message: "Selecione pelo menos uma conta!",
        status: "error",
      });
      return;
    }

    if (selectedRepositoryIds.length === 0) {
      callToastify({
        message: "Selecione pelo menos um repositório!",
        status: "error",
      });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...rest } = dataToSave;
    const createdSlots = await createSlotBatch(
      rest,
      selectedAccountIds,
      selectedRepositoryIds
    );

    const currentRepoId = Number(repositoryId);
    if (!repositoryId || selectedRepositoryIds.includes(currentRepoId)) {
      const matchedSlot = createdSlots.find(
        (s) => Number(s.jsonFileId) === currentRepoId
      );
      setRepositoryState((file) => {
        const fallbackId = Math.max(0, ...file.slots.map((s) => s.id ?? 0)) + 1;
        const newSlot: ISlots = matchedSlot?.id
          ? {
              ...rest,
              id: matchedSlot.id,
            }
          : {
              ...rest,
              id: fallbackId,
              accountIds: selectedAccountIds,
              repositoryIds: selectedRepositoryIds,
            };
        return {
          ...file,
          slots: [...file.slots, newSlot],
        };
      });
    }

    callToastify({
      message: "Slot criado com sucesso!",
      status: "success",
    });

    closeModal(false);
  }

  return (
    <section className={styles.modalSection} key={slot?.id ?? 'new-slot'}>
      <header>
        <div className={styles.text_wrapper}>
          <h1>{slot ? "Editar Banner Assíncrono" : "Criar Banner Assíncrono"}</h1>
          <p>
            Use os campos abaixo para configurar a {slot ? "edição" : "nova"} tag a ser {slot ? "editada" : "adicionada"}.
          </p>
        </div>

        <div className={styles.buttons_wrapper}>
          <Button
            mode="tertiary"
            text="Cancel"
            onClick={() => closeModal(false)}
          />
          <Button
            mode="primary"
            text="Salvar Alterações"
            onClick={handleSaveAsyncBanner}
          />
        </div>
      </header>

      <form className={styles.content}>
        <div className={styles.box}>
          <h3>Atributos principais</h3>
          <div className={styles.box_wrapper}>
            <div className={styles.input_wrapper}>
              <p>Nome</p>
              <input
                {...register("nameTag")}
                type="text"
                placeholder="Ex: Banner Anchor"
              />
            </div>
            <div className={styles.input_wrapper}>
              <p>Categoria</p>
              <label>
                <input
                  type="radio"
                  value="Teste"
                  checked={watch("category") === "Teste"}
                  {...register("category")}
                />
                Teste
              </label>
              <label>
                <input
                  type="radio"
                  value="Produção"
                  checked={watch("category") === "Produção"}
                  {...register("category")}
                />
                Produção
              </label>
            </div>
            <div className={styles.input_wrapper}>
              <p>Status</p>
              <ToggleSwitch
                checked={watch("isActive")}
                onChange={() => setValue("isActive", !watch("isActive"))}
                onLabel="Ativado"
                offLabel="Desativado"
              />
            </div>
          </div>
        </div>
        {!slot && (
          <div className={styles.box}>
            <h3>Regras</h3>
            <div className={styles.box_wrapper}>
              <div className={`${styles.input_wrapper} ${styles.rule_row}`}>
                <p className={styles.rule_label}>
                  Selecionar conta
                  <svg
                    className={styles.info_icon}
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="7"
                      cy="7"
                      r="6"
                      stroke="#3255E2"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M7 6.3V9.8"
                      stroke="#3255E2"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                    <circle cx="7" cy="4.4" r="0.75" fill="#3255E2" />
                  </svg>
                </p>
                <div className={styles.select_group}>
                  <select
                    className={
                      accountSelectValue === ""
                        ? styles.placeholder_selected
                        : ""
                    }
                    value={accountSelectValue}
                    onChange={handleAccountSelectChange}
                  >
                    <option value="">Selecione uma conta</option>
                    <option value="all">Selecionar todos</option>
                    {selectedAccountIds.length > 1 &&
                      selectedAccountIds.length < accounts.length && (
                        <option value="multiple" hidden>
                          {selectedAccountIds.length} contas selecionadas
                        </option>
                      )}
                    {accounts.map((acc) => (
                      <option key={acc.id} value={String(acc.id)}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                  <span className={styles.helper_text}>
                    Selecione a conta em que essa tag será hospedada.
                  </span>
                  {selectedAccountIds.length > 0 && (
                    <div className={styles.selected_tags}>
                      {selectedAccountIds.map((accId) => {
                        const acc = accounts.find(
                          (a) => Number(a.id) === Number(accId)
                        );
                        return (
                          <span key={accId} className={styles.selected_tag}>
                            {acc ? acc.name : `Conta #${accId}`}
                            <button
                              type="button"
                              onClick={() => handleRemoveAccount(accId)}
                              title="Remover conta"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className={`${styles.input_wrapper} ${styles.rule_row}`}>
                <p className={styles.rule_label}>
                  Selecionar repositórios
                  <svg
                    className={styles.info_icon}
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="7"
                      cy="7"
                      r="6"
                      stroke="#3255E2"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M7 6.3V9.8"
                      stroke="#3255E2"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                    <circle cx="7" cy="4.4" r="0.75" fill="#3255E2" />
                  </svg>
                </p>
                <div className={styles.select_group}>
                  <select
                    className={
                      repositorySelectValue === ""
                        ? styles.placeholder_selected
                        : ""
                    }
                    value={repositorySelectValue}
                    onChange={handleRepositorySelectChange}
                    disabled={selectedAccountIds.length === 0}
                  >
                    <option value="">Selecione os repositórios</option>
                    <option value="all">Selecionar todos</option>
                    {selectedRepositoryIds.length > 1 &&
                      selectedRepositoryIds.length < repositories.length && (
                        <option value="multiple" hidden>
                          {selectedRepositoryIds.length} repositórios
                          selecionados
                        </option>
                      )}
                    {repositories.map((repo) => (
                      <option key={repo.id} value={String(repo.id)}>
                        {repo.name}
                      </option>
                    ))}
                  </select>
                  <span className={styles.helper_text}>
                    Selecione os repositórios em que essa tag será hospedada.
                  </span>
                  {selectedRepositoryIds.length > 0 && (
                    <div className={styles.selected_tags}>
                      {selectedRepositoryIds.map((repoId) => {
                        const repo = repositories.find(
                          (r) => Number(r.id) === Number(repoId)
                        );
                        return (
                          <span key={repoId} className={styles.selected_tag}>
                            {repo ? repo.name : `Repositório #${repoId}`}
                            <button
                              type="button"
                              onClick={() => handleRemoveRepository(repoId)}
                              title="Remover repositório"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className={styles.box}>
          <h3>Configurações da tag</h3>
          <div className={styles.box_wrapper}>
            <div className={styles.input_wrapper}>
              <p>Banner infinito</p>
              <ToggleSwitch
                checked={watch("isInfinite")}
                onChange={() => setValue("isInfinite", !watch("isInfinite"))}
                onLabel="Ativado"
                offLabel="Desativado"
              />
            </div>
            <div className={styles.input_wrapper}>
              <p>ID da div</p>
              <input
                type="text"
                {...register("tagId")}
                placeholder="Ex: banner-anchor-area"
                disabled={!!slot?.id}
              />
            </div>
            <div className={styles.input_wrapper}>
              <p>keywords</p>
              <TagInput
                key={slot?.id ?? 'new'}
                initialTags={watch("keyword") || '[]'}
                onTagsChange={handleTagsChange}
              />
            </div>
            <div className={styles.input_wrapper}>
              <p>Url bloqueada</p>
              <TagInput
                key={`urlBlock-${slot?.id ?? 'new'}`}
                initialTags={watch("urlBlock") || '[]'}
                onTagsChange={handleUrlBlockChange}
              />
            </div>
            <div className={styles.input_wrapper}>
              <p>Url permitida</p>
              <TagInput
                key={`urlFree-${slot?.id ?? 'new'}`}
                initialTags={watch("urlFree") || '[]'}
                onTagsChange={handleUrlFreeChange}
              />
            </div>
            <div className={styles.input_wrapper}>
              <p>Path do GAM</p>
              <input
                type="text"
                {...register("adUnit")}
                placeholder="Ex: /8804/parceiro/achor"
              />
            </div>
            <div className={styles.input_wrapper}>
              <p>Número da campanha</p>
              <input
                type="text"
                {...register("campaign")}
                placeholder="Ex: 0"
              />
            </div>
            <div className={styles.input_wrapper}>
              <p>Size Mapping</p>
              <p className={styles.plus} onClick={() => append({ mapping: "", size: "" })}>
                + Adicionar Size
              </p>
              <div className={styles.size_mapping_list_inputs}>
                {fields.map((field, map) => (
                  <div key={field.id}>
                    <Controller
                      name={`sizeMaping.${map}.size`}
                      control={control}
                      render={({ field: fieldProps }) => (
                        <div className="groupInput">
                          <span>Tamanho da tela</span>
                          <input
                            type="text"
                            placeholder="Ex: [970, 0]"
                            {...fieldProps}
                          />
                        </div>
                      )}
                    />
                    <Controller
                      name={`sizeMaping.${map}.mapping`}
                      control={control}
                      render={({ field: fieldProps }) => (
                        <div className="groupInput">
                          <span>Tamanho de banners</span>
                          <input
                            type="text"
                            placeholder="Ex: [970, 90],[728, 90]"
                            {...fieldProps}
                          />
                        </div>
                      )}
                    />
                    <Button
                      mode="tertiary"
                      text="Remover"
                      onClick={() => remove(map)}
                      className={styles.remove_button}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.input_wrapper}>
              <p>Define Mapping</p>
              <input
                type="text"
                placeholder="Ex: [[970, 90],[728, 90], [320, 100],[300, 100],[320, 50],[300, 50]]"
                {...register("defineMapping")}
              />
            </div>
            <div className={styles.input_wrapper}>
              <p>Tipo de Native</p>
              <input
                type="text"
                {...register("native")}
                placeholder="Ex: 0"
              />
            </div>
            <div className={styles.input_wrapper}>
              <p>Label</p>
              <input
                type="text"
                {...register("label")}
                placeholder="Ex: Defina um Label"
              />
            </div>
            <div className={styles.input_wrapper}>
              <p>Position</p>
              <input
                type="text"
                {...register("pos")}
                placeholder="Ex: anchor"
              />
            </div>
          </div>
        </div>
        <div className={styles.buttons_content}>
          <Button
            mode="tertiary"
            text="Cancel"
            onClick={() => closeModal(false)}
          />
          <Button
            mode="primary"
            text="Salvar Alterações"
            onClick={handleSaveAsyncBanner}
          />
        </div>
      </form>
    </section>
  );
};

export default AsyncBannerModal;