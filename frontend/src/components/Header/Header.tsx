import React from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.scss';

const Header: React.FC = () => {
  return (
    <header className={styles.container}>
      <div className={styles.content}>
        <Link to="/">
          <img src="/logo-adTags.png" alt="UOL adTags" />
        </Link>
        <nav aria-label="Navegação principal">
          <ul className={styles.navigation}>
            <li>
              <Link className={styles.navLink} to="/">
                Home
              </Link>
            </li>
            <li>
              <Link className={`${styles.navLink} ${styles.active}`} to="/">
                Contas
              </Link>
            </li>
            <li>
              <Link className={styles.navLink} to="/templates">
                Templates
              </Link>
            </li>
          </ul>
        </nav>
        <button className={styles.signOut} type="button" aria-label="Sair">
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M6 3H3.5A1.5 1.5 0 0 0 2 4.5v7A1.5 1.5 0 0 0 3.5 13H6m3-2 3-3-3-3m3 3H5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
