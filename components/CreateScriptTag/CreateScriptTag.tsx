import React from "react";
import { useForm } from "react-hook-form";
import styles from "./styles.module.scss";
import { ToggleSwitch, Button } from "../index";
import TagInput from "../TagInput/TagInput";
import { useAppContext } from "../../hooks/useGlobal";
import { callToastify } from "../../utils/toastify";

interface ICreateScriptTag {
  closeModal?: () => void;
  script?: IScripts;
}

function toJsonTagString(val: string[] | string | undefined): string {
  if (!val) return "[]";
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? JSON.stringify(parsed) : "[]";
    } catch {
      return "[]";
    }
  }
  if (Array.isArray(val)) {
    return JSON.stringify(val);
  }
  return "[]";
}

const CreateScriptTag: React.FC<ICreateScriptTag> = ({
  closeModal,
  script,
}) => {
  const {
    register,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<IScripts>({
    defaultValues: {
      category: "Teste",
      isActive: false,
      nameTag: "",
      content: "",
      script: "",
      hook: "afterInit",
      urlFree: "[]",
      urlBlock: "[]",
    },
  });

  React.useEffect(() => {
    if (script) {
      setValue("nameTag", script.nameTag);
      setValue("category", script.category);
      setValue("script", script.script);
      setValue("isActive", script.isActive);
      setValue("content", script.content || "");
      setValue("hook", script.hook || "afterInit");
      setValue("urlFree", toJsonTagString(script.urlFree));
      setValue("urlBlock", toJsonTagString(script.urlBlock));
    }
  }, [script, setValue]);

  const { setRepositoryState } = useAppContext();

  const onSubmit = handleSubmit((data) => {
    if (!data.nameTag && !data.script) {
      callToastify({
        message: "Preencha o nome da Tag e insira o código Javascript!",
        status: "error",
      });
    } else if (!data.nameTag) {
      callToastify({
        message: "Preencha o nome da Tag!",
        status: "error",
      });
    } else if (!data.script) {
      callToastify({
        message: "Insira o código Javascript!",
        status: "error",
      });
    }

    // Se ambos os campos estiverem preenchidos, envia os dados
    if (data.nameTag && data.script) {
      const normalizedData: IScripts = {
        ...data,
        content: data.script,
        hook: data.hook || "afterInit",
        urlFree: toJsonTagString(data.urlFree),
        urlBlock: toJsonTagString(data.urlBlock),
      };

      if (script) {
        setRepositoryState((prev) => ({
          ...prev,
          tagsScripts: prev.tagsScripts.map((item) =>
            item.nameTag === script.nameTag ? { ...item, ...normalizedData } : item
          ),
        }));
        callToastify({
          message: "Tag atualizada com sucesso!",
          status: "success",
        });
      } else {
        setRepositoryState((prev) => ({
          ...prev,
          tagsScripts: [...prev.tagsScripts, normalizedData],
        }));
        callToastify({
          message: "Tag criada com sucesso!",
          status: "success",
        });
      }

      closeModal?.();
    }
  });

  return (
    <div className={styles.modal}>
      <div onClick={closeModal} className={styles.modal_overlay}></div>
      <div className={styles.content}>
        <header>
          <h1>{script ? "Editar Tag Script" : "Criar Tag Script"}</h1>
          <div className={styles.action_buttons}>
            <Button
              type="submit"
              form="formCreateScript"
              style={{ height: "35px", padding: "8px 13px", fontSize: "16px" }}
              mode="primary"
              text="Salvar Alterações"
            />
            <Button
              onClick={closeModal}
              style={{ height: "35px", padding: "8px 13px", fontSize: "16px" }}
              mode="tertiary"
              text="Cancelar"
            />
          </div>
        </header>
        <form
          id="formCreateScript"
          className={styles.form_create_script}
          onSubmit={onSubmit}
        >
          <p>Atributos principais</p>
          <div className={styles.main_attributes}>
            <div className={styles.main_inputs}>
              <div className={styles.input_container}>
                <label htmlFor="name">Nome</label>
                <div className={styles.name}>
                  <input
                    {...register("nameTag")}
                    id="name"
                    placeholder="Ex.: UOL Esportes"
                    type="text"
                  />
                  <span>
                    Escolha um nome curto, único e fácil de ser lembrado.
                  </span>
                  {errors.nameTag && (
                    <span className={styles.error_message}>
                      {errors.nameTag.message}
                    </span>
                  )}
                </div>
              </div>

              <span className={styles.line}></span>

              <div className={styles.input_container_radio}>
                <label>Categoria</label>
                <div className={styles.radio_group}>
                  <div className={styles.category_input}>
                    <input
                      {...register("category")}
                      type="radio"
                      id="teste"
                      value="Teste"
                      defaultChecked={true}
                    />
                    <span>Teste</span>
                  </div>

                  <div className={styles.category_input}>
                    <input
                      {...register("category")}
                      type="radio"
                      id="producao"
                      value="Produção"
                    />
                    <span>Produção</span>
                  </div>
                </div>
              </div>

              <span className={styles.line}></span>

              <div className={styles.input_container}>
                <label>Status</label>
                <ToggleSwitch
                  checked={watch("isActive")}
                  onChange={() => setValue("isActive", !watch("isActive"))}
                  onLabel="Ativado"
                  offLabel="Desativado"
                />
              </div>
            </div>
          </div>

          <p>Ciclo de Vida e Segmentação de URL</p>
          <div className={styles.rules}>
            <div className={styles.rules_input}>
              <div className={styles.input_container}>
                <label htmlFor="hook">Gatilho (Hook)</label>
                <select id="hook" {...register("hook")}>
                  <option value="afterInit">Após Inicialização (Padrão)</option>
                  <option value="beforeInit">Antes de Inicializar (beforeInit)</option>
                  <option value="beforeDefineSlots">Antes de Definir Slots (beforeDefineSlots)</option>
                  <option value="afterSlotRender">Após Renderizar Slot (afterSlotRender)</option>
                </select>
              </div>

              <span className={styles.line}></span>

              <div className={styles.input_container}>
                <label>URLs Permitidas (urlFree)</label>
                <TagInput
                  initialTags={toJsonTagString(watch("urlFree"))}
                  onTagsChange={(tags) => setValue("urlFree", JSON.stringify(tags))}
                />
              </div>

              <span className={styles.line}></span>

              <div className={styles.input_container}>
                <label>URLs Bloqueadas (urlBlock)</label>
                <TagInput
                  initialTags={toJsonTagString(watch("urlBlock"))}
                  onTagsChange={(tags) => setValue("urlBlock", JSON.stringify(tags))}
                />
              </div>
            </div>
          </div>

          <p>Adicionar código</p>
          <div className={styles.code}>
            <div className={styles.input_container}>
              <label htmlFor="code">Código de Javascript</label>
              <div className={styles.code_editor_wrapper}>
                <textarea {...register("script")} placeholder="Ex.: console.log(ctx.config);" id="code" />
                <span className={styles.code_hint}>
                  O objeto <code>ctx</code> (<code>{"{ config, slots, isMobile, isTestEnv, googletag, pbjs, event }"}</code>) está disponível no escopo. Não é necessário incluir tags <code>&lt;script&gt;</code>.
                </span>
              </div>
              {errors.script && (
                <span className={styles.error_message}>
                  {errors.script.message}
                </span>
              )}
            </div>
          </div>

          <div className={styles.action_buttons}>
            <Button
              type="submit"
              style={{ height: "35px", padding: "8px 13px", fontSize: "16px" }}
              mode="primary"
              text="Salvar Alterações"
            />
            <Button
              onClick={closeModal}
              style={{ height: "35px", padding: "8px 13px", fontSize: "16px" }}
              mode="tertiary"
              text="Cancelar"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateScriptTag;
