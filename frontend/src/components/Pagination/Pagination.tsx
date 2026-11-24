import React from 'react';
import styles from './styles.module.scss';
import { Icons } from '../Icons/Icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const goToBackPage = () => {
    if(currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const goToLastPage = () => {
    onPageChange(totalPages);
  };

  return (
    <div className={styles.pagination}>
      <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
        {Icons['IcArrowLeft']}
      </button>
      <button onClick={goToBackPage} disabled={currentPage === 1}>
        {Icons['IcArrowBack']}
      </button>
      <div className={styles['page-numbers']}>
        {pageNumbers.map((page) => (
          <span
          key={page}
          onClick={() => handlePageChange(page)}
          className={currentPage === page ? styles.active : ''}>
            {page}
          </span>
        ))}
      </div>
      <button onClick={goToNextPage} disabled={currentPage === totalPages}>
        {Icons['IcArrowFoward']}
      </button>
      <button onClick={goToLastPage} disabled={currentPage === totalPages}>
      {Icons['IcArrowRight']}
      </button>


    </div>
  );
};

export default Pagination;
