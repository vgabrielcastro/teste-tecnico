import React from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../Icons/Icons';
import styles from './styles.module.scss';

const CardProject: React.FC<ICardProjectProps> = ({ name, description, to, icon }) => {
  const resolvedIcon = icon ?? Icons['iconCard'];

  return (
    <Link to={to} className={styles.cardProject}>
      <header className={styles.cardHeader}>
        <div className={styles.cardContent}>
          {typeof resolvedIcon === 'string' ? (
            <img src={resolvedIcon} alt={`Ícone do projeto ${name}`} />
          ) : (
            <div className={styles.customIcon}>{resolvedIcon}</div>
          )}
          <div className={styles.textWrapper}>
            <p>{name}</p>
            <span>{description}</span>
          </div>
        </div>
      </header>
      <footer className={styles.cardFooter}>
        <span>Acessar</span>
        {Icons['iconArrowRight']}
      </footer>
    </Link>
  );
};

export default CardProject;
