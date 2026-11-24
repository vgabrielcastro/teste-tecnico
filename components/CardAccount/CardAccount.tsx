import React from 'react';
import { Icons } from '../';
import styles from './styles.module.scss'
import { Link } from 'react-router-dom';

const CardAccount: React.FC<ICardAccountProps> = ({ name, description, id, selectedId,handleEditAccount, editModal, handleDeleteAccount }) => {
  return (
    <div className={styles.cardAccount}>
        <header>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem', width: '100%'}}>
                <img src={Icons['iconCard']} alt="Ícone do card" />
                <div className={styles.textWrapper}>
                    <p>{name}</p>
                    <span>{description}</span>
                </div>
            </div>
           <div onClick={() => handleEditAccount(id, name, description)} className={styles.dropdown}>
             {Icons['iconMoreVertical']}

             {
                selectedId === id && (
             <div className={styles.dropdownContent}>
              <p onClick={() => editModal?.(id, name, description)}>{Icons['IcEdit']} Editar</p>
              <p onClick={() => handleDeleteAccount?.(id)}>{Icons['IcDelete']} Excluir</p>

             </div>
                )
             }


           </div>

        </header>
        <Link to={`/contas/${name}/${id}`}>Acessar {Icons['iconArrowRight']}</Link>
    </div>
  );
}

export default CardAccount;