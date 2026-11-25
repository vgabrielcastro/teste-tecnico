import React from "react";

import styles from "./styles.module.scss";
import { Icons } from "../Icons/Icons";
import Button from "../Button/button";
import { useForm } from "react-hook-form";
import type { UseMutationResult } from "@tanstack/react-query";
import type {
  IAccount,
  ICreateAccountInput,
  IUpdateAccountInput,
} from "../../types";

interface IAccountModalProps {
  closeModal: () => void;
  createAccount: UseMutationResult<IAccount, Error, ICreateAccountInput>;
  editAccount: UseMutationResult<IAccount, Error, IUpdateAccountInput>;
  editedAccount?: IAccount | null;
}

const AccountModal: React.FC<IAccountModalProps> = ({
  closeModal,
  createAccount,
  editAccount,
  editedAccount,
}) => {
  const {
    register,
    handleSubmit,
  } = useForm<ICreateAccountInput>({
    defaultValues: {
      name: editedAccount?.name ?? '',
      description: editedAccount?.description ?? '',
    },
  });

  const isPending = editedAccount
    ? editAccount.isPending
    : createAccount.isPending;
  const error = editedAccount ? editAccount.error : createAccount.error;

  const onSubmit = (data: ICreateAccountInput) => {
    if (editedAccount) {
      editAccount.mutate({
        ...data,
        id: editedAccount.id,
      });
    } else {
      createAccount.mutate(data);
    }
  };

  return (
    <div className={styles.addAccountModal}>
      <div className={styles.container}>
        <header className={styles.headerModal}>
          {Icons["iconPersonAdd"]}
          <h2>{editedAccount ? "Editar conta" : "Adicionar nova conta"}</h2>
          <button
            type="button"
            aria-label="Fechar modal"
            onClick={closeModal}
            disabled={isPending}
          >
            {Icons["IcClose"]}
          </button>
        </header>
        <form
          id="account-form"
          className={styles.bodyModal}
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className={styles.input_wrapper}>
            <label htmlFor="name">Nome da Conta</label>
            <input
              type="text"
              id="name"
              required
              {...register("name", { required: true })}
              placeholder="Ex: AdOps"
              disabled={isPending}
            />
            <span>Escolha um nome único, simples e fácil de ser lembrado.</span>
          </div>
          <div className={styles.input_wrapper}>
            <label htmlFor="description">Descrição da conta</label>
            <input
              type="text"
              id="description"
              required
              maxLength={40}
              {...register("description", { required: true, maxLength: 40 })}
              placeholder="Ex: Conta que gerencia tais repositórios"
              disabled={isPending}
            />
            <span>A descrição deve ser curta. Máximo de 40 caracteres.</span>
          </div>
        </form>
        <footer className={styles.footerModal}>
          <Button
            mode="tertiary"
            text="Voltar"
            onClick={closeModal}
            disabled={isPending}
            style={{ height: "28px", padding: "4px 10px", fontSize: "14px" }}
          />
          <Button
            mode="primary"
            text={
              isPending
                ? "Salvando..."
                : editedAccount
                  ? "Salvar alterações"
                  : "Criar conta"
            }
            type="submit"
            form="account-form"
            disabled={isPending}
            style={{ height: "28px", padding: "4px 10px", fontSize: "14px" }}
          />
        </footer>
        {error && (
          <p className={styles.errorMessage} role="alert">
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default AccountModal;
