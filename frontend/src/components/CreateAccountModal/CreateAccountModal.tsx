import React from "react";

// @ts-ignore SCSS modules are resolved by the bundler.
import styles from "./styles.module.scss";
import { Icons } from "../Icons/Icons";
import Button from "../Button/button";
import { useForm } from "react-hook-form";
import type { IFormProps } from "../../types";

type AccountMutation<TVariables> = {
  mutate: (variables: TVariables) => void;
};

interface IAccountModalProps {
  closeModal: () => void;
  createAccount: AccountMutation<IFormProps>;
  editAccount: AccountMutation<IFormProps & { id: number }>;
  editedAccount?: { id: number; name: string; description: string } | null;
}

const AccountModal: React.FC<IAccountModalProps> = ({
  closeModal,
  createAccount,
  editAccount,
  editedAccount
}) => {

  const {
    register, handleSubmit
  } = useForm<IFormProps>({
    defaultValues: {
      name: editedAccount ? editedAccount.name : '',
      description: editedAccount ? editedAccount.description : ''
    }
  })

  const onSubmit = (data: IFormProps) => {
    if (editedAccount) {
      editAccount.mutate({
        name: data.name,
        description: data.description,
        id: editedAccount.id
      });
    } else {
      createAccount.mutate({
        name: data.name,
        description: data.description
      });
    }
    closeModal();
  }

  return (
    <div className={styles.addAccountModal}>
      <div className={styles.container}>
        <header className={styles.headerModal}>
          {Icons["iconPersonAdd"]}
          <h2>{editedAccount ? "Editar conta" : "Adicionar nova conta"}</h2>
          <span aria-label="close-button" onClick={closeModal}>{Icons["IcClose"]}</span>
        </header>
        <form className={styles.bodyModal}>
          <div className={styles.input_wrapper}>
            <label htmlFor="name">Nome da Conta</label>
            <input type="text" id="name" {...register("name")} placeholder="Ex: AdOps" />
            <span>Escolha um nome único, simples e fácil de ser lembrado.</span>
          </div>
          <div className={styles.input_wrapper}>
            <label htmlFor="description">Descrição da conta</label>
            <input type="text" id="description" {...register("description")} maxLength={40} placeholder="Ex: Conta que gerencia tais repositórios" />
            <span>A descrição deve ser curta. Máximo de 40 caracteres.</span>
          </div>
        </form>
        <footer className={styles.footerModal}>
          <Button
            mode="tertiary"
            text="Voltar"
            onClick={closeModal}
            style={{ height: "28px", padding: "4px 10px", fontSize: "14px" }}
          />
          <Button
            mode="primary"
            text={editedAccount ? "Salvar alterações" : "Criar conta"}
            type="submit"
            onClick={handleSubmit(onSubmit)}
            style={{ height: "28px", padding: "4px 10px", fontSize: "14px" }}
          />

        </footer>
      </div>
    </div>
  );
};

export default AccountModal;
