import React from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../Icons/Icons';
import type { ICardAccountProps } from '../../types';
import styles from './styles.module.scss';

const CardAccount: React.FC<ICardAccountProps> = ({
  name,
  description,
  id,
  selectedId,
  handleEditAccount,
  editModal,
  handleDeleteAccount,
}) => {
  return (
    <div className={styles.cardAccount}>
      <header className={styles.cardHeader}>
        <div className={styles.accountDetails}>
          <img src={Icons.iconCard} alt="" />
          <div className={styles.textWrapper}>
            <p>{name}</p>
            <span>{description}</span>
          </div>
        </div>
        <button
          type="button"
          aria-label={`Opções da conta ${name}`}
          aria-expanded={selectedId === id}
          onClick={() => handleEditAccount(id, name, description)}
          className={styles.dropdown}
        >
          {Icons.iconMoreVertical}
        </button>
        {selectedId === id && (
          <div className={styles.dropdownContent}>
            <button type="button" onClick={() => editModal?.(id, name, description)}>
              {Icons.IcEdit} Editar
            </button>
            <button type="button" onClick={() => handleDeleteAccount?.(id)}>
              {Icons.IcDelete} Excluir
            </button>
          </div>
        )}
      </header>
      <Link className={styles.accountLink} to={`/contas/${name}/${id}`}>
        Acessar {Icons.iconArrowRight}
      </Link>
    </div>
  );
};

export default CardAccount;