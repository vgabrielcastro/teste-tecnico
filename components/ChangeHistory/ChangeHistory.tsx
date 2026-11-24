import React, { useState, useEffect } from "react";
import styles from "./styles.module.scss";
import { Icons, Pagination } from "../../components";

interface IChangeHistoryProps {
  file: IChangeHistory[];
}

const ChangeHistory: React.FC<IChangeHistoryProps> = ({ file }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 10;
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredItems, setFilteredItems] = useState<IChangeHistory[]>(file);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const filtered = file.filter(item =>
      item.nameTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatDate(item.date).toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredItems(filtered);
    // Reset to first page on new search
    setCurrentPage(1);
  }, [searchQuery, file]);

  const currentItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section className={styles.container}>
      <header>
        <div className={styles.input_search}>
          {Icons["icSearch"]}
          <input
            type="search"
            placeholder="Pesquisar alterações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>
      <div className={styles.content}>
        <table cellSpacing="0" cellPadding="0">
          <thead>
            <tr>
              <th>Nome da tag</th>
              <th>Tipo</th>
              <th>Usuário</th>
              <th>Ação</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={index}>
                <td>{item.nameTag}</td>
                <td>{item.type}</td>
                <td>{item.user}</td>
                <td>{item.action}</td>
                <td>{formatDate(item.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredItems.length / ITEMS_PER_PAGE)}
        onPageChange={handlePageChange}
      />
    </section>
  );
};

export default ChangeHistory;
