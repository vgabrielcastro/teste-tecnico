import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Button from '../../../components/Button/button';
import CardAccount from '../../../components/CardAccount/CardAccount';
import { Icons } from '../../../components/Icons/Icons';
import AccountModal from '../../../components/CreateAccountModal/CreateAccountModal';
import ModalDelete from '../../../components/ModalDelete/ModalDelete';
import type { IAccount } from '../../../types';
import {
  ACCOUNTS_QUERY_KEY,
  createAccount,
  deleteAccount,
  getAccounts,
  getApiErrorMessage,
  updateAccount,
} from '../services/accountsApi';
import styles from './AccountsPage.module.scss';

const AccountsPage = () => {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editedAccount, setEditedAccount] = useState<IAccount | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<IAccount | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const accountsQuery = useQuery({
    queryKey: ACCOUNTS_QUERY_KEY,
    queryFn: getAccounts,
  });

  const createAccountMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });
      setIsAccountModalOpen(false);
      setEditedAccount(null);
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: updateAccount,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });
      setIsAccountModalOpen(false);
      setEditedAccount(null);
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });
      setAccountToDelete(null);
    },
  });

  const accounts = accountsQuery.data ?? [];

  const openCreateModal = () => {
    createAccountMutation.reset();
    updateAccountMutation.reset();
    setEditedAccount(null);
    setSelectedId(null);
    setIsAccountModalOpen(true);
  };

  const openEditModal = (id: number) => {
    const account = accounts.find((item) => item.id === id);

    if (!account) {
      return;
    }

    updateAccountMutation.reset();
    setEditedAccount(account);
    setSelectedId(null);
    setIsAccountModalOpen(true);
  };

  const openDeleteModal = (id: number) => {
    const account = accounts.find((item) => item.id === id);

    if (!account) {
      return;
    }

    deleteAccountMutation.reset();
    setAccountToDelete(account);
    setSelectedId(null);
  };

  return (
    <section className={styles.accountsPage} aria-labelledby="accounts-title">
      <div className={styles.pageHeading}>
        <div>
          <h1 id="accounts-title">Contas</h1>
          <p>Selecione uma conta para começar.</p>
        </div>
        <Button
          mode="tertiary"
          text="Adicionar conta"
          icon={Icons.icPlus}
          style={{ height: '35px', padding: '7px 12px', fontSize: '14px' }}
          type="button"
          onClick={openCreateModal}
        />
      </div>

      <div className={styles.divider} />

      {accountsQuery.isPending && (
        <p className={styles.accountState} role="status">
          Carregando contas...
        </p>
      )}

      {accountsQuery.isError && (
        <div className={styles.accountState} role="alert">
          <p>{getApiErrorMessage(accountsQuery.error)}</p>
          <Button
            mode="tertiary"
            text="Tentar novamente"
            onClick={() => void accountsQuery.refetch()}
          />
        </div>
      )}

      {!accountsQuery.isPending && !accountsQuery.isError && accounts.length === 0 && (
        <p className={styles.accountState}>Nenhuma conta cadastrada.</p>
      )}

      {accounts.length > 0 && (
        <div className={styles.accountGrid}>
          {accounts.map((account) => (
            <CardAccount
              key={account.id}
              {...account}
              selectedId={selectedId}
              handleEditAccount={(id) =>
                setSelectedId((currentId) => (currentId === id ? null : id))
              }
              editModal={openEditModal}
              handleDeleteAccount={openDeleteModal}
            />
          ))}
        </div>
      )}

      {isAccountModalOpen && (
        <AccountModal
          closeModal={() => setIsAccountModalOpen(false)}
          createAccount={createAccountMutation}
          editAccount={updateAccountMutation}
          editedAccount={editedAccount}
        />
      )}

      {accountToDelete && (
        <ModalDelete
          closeConfirmModal={() => setAccountToDelete(null)}
          handleDelete={() => deleteAccountMutation.mutate(accountToDelete.id)}
          selectedName={accountToDelete.name}
          headerName="Excluir conta permanentemente"
          isPending={deleteAccountMutation.isPending}
          errorMessage={
            deleteAccountMutation.error
              ? getApiErrorMessage(deleteAccountMutation.error)
              : null
          }
        />
      )}
    </section>
  );
};

export default AccountsPage;
