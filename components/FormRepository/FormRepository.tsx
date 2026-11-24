import React from "react";
import styles from "./styles.module.scss";
import { Icons } from "../Icons/Icons";
import { Button } from "../index";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRepository, editRepository } from "../../services/repository";
import { callToastify } from "../../utils/toastify";

interface IFormRepository {
  name: string;
}

interface FormRepositoryProps {
  closeModal: () => void;
  accountId: number;
  repository?: IRepository;
}

const FormRepository: React.FC<FormRepositoryProps> = ({
  closeModal,
  accountId,
  repository,
}) => {
  const { register, handleSubmit, watch } = useForm<IFormRepository>({
    defaultValues: { name: repository?.name || "" },
  });

  const queryClient = useQueryClient();

  // Mutation para criar repositório
  const createMutation = useMutation({
    mutationFn: async ({
      name,
      accountId,
    }: {
      name: string;
      accountId: number;
    }) => await createRepository(name, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repositories", accountId] });
      callToastify({
        message: "Repositório criado com sucesso!",
        status: "success",
      });
      closeModal();
    },
  });

  // Mutation para editar repositório
  const editMutation = useMutation({
    mutationFn: async ({
      name,
      accountId,
      repositoryId,
    }: {
      name: string;
      accountId: number;
      repositoryId: number;
    }) => await editRepository(name, accountId, repositoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repositories", accountId] });
      callToastify({
        message: "Repositório editado com sucesso!",
        status: "success",
      });
      closeModal();
    },
  });

  const exampleCode = `
        //inserir no head da página
        <script type='text/javascript'>
        window.pushAds = window.pushAds || [];
        </script>
        <script type='text/javascript' src='https://tm.jsuol.com.br/modules/external/admanager/${
          watch("name") || "example"
        }_ads.js' async />
    `;

  const onSubmit = handleSubmit(({ name }) => {
    if (repository) {
      editMutation.mutate({ name, accountId, repositoryId: repository.id! });
    } else {
      createMutation.mutate({ name, accountId });
    }
  });

  return (
    <div className={styles.modal}>
      <div onClick={closeModal} className={styles.modal_overlay}></div>
      <div className={styles.content}>
        <header>
          <p>
            {Icons["IcArchive"]}{" "}
            {repository ? "Editar Repositório" : "Adicionar repositório"}
          </p>
          <span style={{ cursor: "pointer" }} onClick={closeModal}>
            {Icons["IcClose"]}
          </span>
        </header>
        <form id="formRepository" onSubmit={onSubmit}>
          <div className={styles.input_container}>
            <label htmlFor="name">Nome do repositório</label>
            <input
              placeholder="Ex.: UOL"
              type="text"
              {...register("name", { required: true })}
              disabled={createMutation.isPending || editMutation.isPending}
            />
            <p>Escolha um nome único, simples e fácil de ser lembrado.</p>
          </div>
          <div className={styles.code_container}>
            <p>Código do repositório</p>
            <pre>
              <code>{exampleCode}</code>
            </pre>
          </div>
          {(createMutation.isError || editMutation.isError) && (
            <div className={styles.error_message}>
              <p>Ocorreu um erro ao salvar. Tente novamente.</p>
            </div>
          )}
        </form>
        <div className={styles.action_buttons}>
          <Button
            onClick={closeModal}
            style={{ height: "35px", padding: "8px 13px", fontSize: "16px" }}
            mode="tertiary"
            text="Voltar"
            disabled={createMutation.isPending || editMutation.isPending}
          />
          <Button
            onClick={onSubmit}
            type="submit"
            style={{ fontSize: "16px", fontWeight: "400", height: "35px" }}
            mode="primary"
            text={repository ? "Salvar Alterações" : "Criar Repositório"}
            disabled={createMutation.isPending || editMutation.isPending}
          />
        </div>
        {(createMutation.isPending || editMutation.isPending) && (
          <div className={styles.loading_message}>
            <p>Salvando...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormRepository;
