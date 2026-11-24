import Button from '../../../components/Button/button';
import CardAccount from '../../../components/CardAccount/CardAccount';
import { Icons } from '../../../components/Icons/Icons';
import type { IAccount } from '../../../types';
import styles from './AccountsPage.module.scss';

const accounts: IAccount[] = [
  { id: 1, name: 'Time UX', description: 'Descrição da conta.' },
  { id: 2, name: 'AdOps', description: 'Descrição da conta.' },
  { id: 3, name: 'TechOps', description: 'Descrição da conta.' },
  { id: 4, name: 'Time Dev', description: 'Descrição da conta.' },
];

const AccountsPage = () => {
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
        />
      </div>

      <div className={styles.divider} />

      <div className={styles.accountGrid}>
        {accounts.map((account) => (
          <CardAccount
            key={account.id}
            {...account}
            selectedId={null}
            handleEditAccount={() => undefined}
          />
        ))}
      </div>
    </section>
  );
};

export default AccountsPage;
