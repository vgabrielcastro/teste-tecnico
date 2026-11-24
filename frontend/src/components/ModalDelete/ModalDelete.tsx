import { Icons } from '../Icons/Icons'; 
import icCancelFilled from "/ic-cancel-filled.png";
 
import styles from './styles.module.scss';
import Button from '../Button/button';

interface IModalDeleteProps {
  closeConfirmModal: () => void;
  handleDelete: () => unknown;
  selectedName?: string | null;
  isTag?: boolean;
  headerName?: string;
  question?: string;

}

const ModalDelete: React.FC<IModalDeleteProps> = ({
  closeConfirmModal,
  handleDelete,
  selectedName,
  isTag = false,
  headerName,
  question
}) => {
  return (
    <div className={styles.modal_delete}>
      <div
        onClick={closeConfirmModal}
        className={styles.modal_overlay}
      ></div>
      <div className={styles.confirm_delete}>
        <div className={styles.header_modal}>

          <div className={styles.header_text}>
              <img src={icCancelFilled} alt="ícone de excluir" />
              <h4>{headerName ?? 'Excluir item Permanentemente'}</h4>
          </div>
   
          <span style={{cursor:"pointer"}} onClick={closeConfirmModal}>{Icons['IcClose']}</span>
        </div>
        <div className={styles.text}>
          <p>
            {question ?? `Tem certeza que deseja excluir ${isTag ? 'a tag' : 'a conta'} "${selectedName}"?`}
          </p>
          <p>Essa ação não poderá ser desfeita.</p>
        </div>
        <div className={styles.modal_buttons}>
          <Button
            onClick={closeConfirmModal}
            mode="quarternary"
            text="Voltar"
            style={{color: "#3255e2",width: "67px",height: "35px",border: "1px solid #3256e2"}}
          />
          <Button
            onClick={handleDelete}
            mode="primary"
            text="Confirmar"
            style={{width: "97px",height: "35px",border: "1px solid #3256e2"}}
          />
        </div>
      </div>
    </div>
  );
}

export default ModalDelete;
