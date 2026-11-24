// src/components/Breadcrumb.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from './styles.module.scss';

// Componente Breadcrumb Dinâmico
const Breadcrumb: React.FC = () => {
  const location = useLocation();

  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbs = [];

    // Contas sempre vai para /contas
    if (pathnames[0]) {
      breadcrumbs.push({ label: "Contas", path: "/contas" });
    }

    // Adops (ou nome da conta) vai para /contas/[nome]/[id]
    if (pathnames[1] && pathnames[2]) {
      breadcrumbs.push({ label: pathnames[1].charAt(0).toUpperCase() + pathnames[1].slice(1), path: `/contas/${pathnames[1]}/${pathnames[2]}` });
    }

    // Repositório (se existir) vai para /contas/[nome]/[id]/[repo]/[repoId]
    if (pathnames[3] && pathnames[4]) {
      breadcrumbs.push({ label: pathnames[3].charAt(0).toUpperCase() + pathnames[3].slice(1), path: `/contas/${pathnames[1]}/${pathnames[2]}/${pathnames[3]}/${pathnames[4]}` });
    }

    // Se houver mais níveis, adiciona como texto sem link
    for (let i = 5; i < pathnames.length; i++) {
      breadcrumbs.push({ label: pathnames[i].charAt(0).toUpperCase() + pathnames[i].slice(1), path: null });
    }
    return breadcrumbs;
  };

  const breadcrumbItems = generateBreadcrumbs();

  return (
    <nav aria-label="breadcrumb">
      <ol className={styles.breadcrumb}>
        {breadcrumbItems.map((item, index) => (
          <li
            key={index}
            className={`${styles['breadcrumb-item']} ${index === breadcrumbItems.length - 1 ? styles.active : ""}`}
            aria-current={index === breadcrumbItems.length - 1 ? "page" : undefined}
          >
            {item.path && index !== breadcrumbItems.length - 1 ? (
              <Link to={item.path}>{item.label}</Link>
            ) : (
              item.label
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
