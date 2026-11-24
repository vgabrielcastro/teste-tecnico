import { useEffect, useRef, useState } from "react";
import { Icons } from "../Icons/Icons";
import styles from "./styles.module.scss";

type FilterProps = {
  filters: {
    type: string;
    category: string;
    status: string;
  };
  onFilterChange: (category: keyof IFilterTags, value: string) => void;
  searchQuery: string,
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>,
  buttonClick?: () => void
 };

const FilterData = ({ filters, onFilterChange, searchQuery, setSearchQuery }: FilterProps) => {  
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
      setShowTooltip(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.filter}>
          <div className={styles.input_search}>
            {Icons["icSearch"]}
            <input
              type="search"
              placeholder="Pesquisar repositórios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
      <div ref={tooltipRef}>
        <button
        className={styles.button_filter}
          onClick={() => setShowTooltip(!showTooltip)}
        >
        {Icons['IcFilterList']}
          Filtros
        {Icons['IcArrowDown']}
        </button>
        {showTooltip && (
          <div className={styles.filter_tooltip}>
            <h3>Filtros</h3>
            <div className={styles.filter_tooltip_group}>
              <p>Tipo</p>
              <div className={styles.group_inputs}>
              <label><input type="radio" name="type" value="Todos" checked={filters.type === "Todos"} onChange={() => onFilterChange("type", "Todos")} /> Todos</label>
              <label><input type="radio" name="type" value="Banner Assíncrono" checked={filters.type === "Banner Assíncrono"} onChange={() => onFilterChange("type", "Banner Assíncrono")} /> Banner Assíncrono</label>
              <label><input type="radio" name="type" value="Script" checked={filters.type === "Script"} onChange={() => onFilterChange("type", "Script")} /> Script</label>
              </div>
            
            </div>
            <div className={styles.filter_tooltip_group}>
              <p>Categoria</p>
             <div className={styles.group_inputs}>
             <label><input type="radio" name="category" value="Todos" checked={filters.category === "Todos"} onChange={() => onFilterChange("category", "Todos")} /> Todos</label>
              <label><input type="radio" name="category" value="Teste" checked={filters.category === "Teste"} onChange={() => onFilterChange("category", "Teste")} /> Teste</label>
              <label><input type="radio" name="category" value="Produção" checked={filters.category === "Produção"} onChange={() => onFilterChange("category", "Produção")} /> Produção</label>
             </div>
            </div>
            <div className={styles.filter_tooltip_group}>
              <p>Status</p>
            <div className={styles.group_inputs}>
            <label><input type="radio" name="status" value="Todos" checked={filters.status === "Todos"} onChange={() => onFilterChange("status", "Todos")} /> Todos</label>
              <label><input type="radio" name="status" value="Ativado" checked={filters.status === "Ativado"} onChange={() => onFilterChange("status", "Ativado")} /> Ativado</label>
              <label><input type="radio" name="status" value="Desativado" checked={filters.status === "Desativado"} onChange={() => onFilterChange("status", "Desativado")} /> Desativado</label>
            </div>
            </div>
            {/* <Button onClick={buttonClick ? () => buttonClick() : undefined}  mode="primary" form="repository" text="Aplicar Filtros" /> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterData;
