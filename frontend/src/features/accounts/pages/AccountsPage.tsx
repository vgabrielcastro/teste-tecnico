import { useRef, useState } from 'react';
import Button from '../../../components/Button/button';
import CardAccount from '../../../components/CardAccount/CardAccount';
import { Icons } from '../../../components/Icons/Icons';
import AccountModal from '../../../components/CreateAccountModal/CreateAccountModal';
import ModalDelete from '../../../components/ModalDelete/ModalDelete';
import type { IAccount, IFormProps } from '../../../types';
// @ts-ignore CSS module typings are supplied by the bundler.
import styles from './AccountsPage.module.scss';

const initialAccounts: IAccount[] = [
  { id: 1, name: 'Time UX', description: 'Descrição da conta.' },
  { id: 2, name: 'AdOps', description: 'Descrição da conta.' },
  { id: 3, name: 'TechOps', description: 'Descrição da conta.' },
  { id: 4, name: 'Time Dev', description: 'Descrição da conta.' },
];

const AccountsPage = () => {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editedAccount, setEditedAccount] = useState<IAccount | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<IAccount | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const nextAccountId = useRef(5);

  const openCreateModal = () => {
    setEditedAccount(null);
    setSelectedId(null);
    setIsAccountModalOpen(true);
  };

  const openEditModal = (id: number) => {
    const account = accounts.find((item) => item.id === id);

    if (!account) {
      return;
    }

    setEditedAccount(account);
    setSelectedId(null);
    setIsAccountModalOpen(true);
  };

  const openDeleteModal = (id: number) => {
    const account = accounts.find((item) => item.id === id);

    if (!account) {
      return;
    }

    setAccountToDelete(account);
    setSelectedId(null);
  };

  const createAccount = {
    mutate: (account: IFormProps) => {
      setAccounts((currentAccounts) => [
        ...currentAccounts,
        { ...account, id: nextAccountId.current++ },
      ]);
    },
  };

  const editAccount = {
    mutate: (account: IFormProps & { id: number }) => {
      setAccounts((currentAccounts) =>
        currentAccounts.map((currentAccount) =>
          currentAccount.id === account.id
            ? account
            : currentAccount,
        ),
      );
    },
  };

  const confirmDelete = () => {
    if (!accountToDelete) {
      return;
    }

    setAccounts((currentAccounts) =>
      currentAccounts.filter((account) => account.id !== accountToDelete.id),
    );
    setAccountToDelete(null);
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

      {isAccountModalOpen && (
        <AccountModal
          closeModal={() => setIsAccountModalOpen(false)}
          createAccount={createAccount}
          editAccount={editAccount}
          editedAccount={editedAccount}
        />
      )}

      {accountToDelete && (
        <ModalDelete
          closeConfirmModal={() => setAccountToDelete(null)}
          handleDelete={confirmDelete}
          selectedName={accountToDelete.name}
          headerName="Excluir conta permanentemente"
        />
      )}
    </section>
  );
};

export default AccountsPage;
