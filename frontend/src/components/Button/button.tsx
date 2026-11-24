import type {
  ButtonHTMLAttributes,
  FC,
  ReactNode,
} from 'react';
import styles from './styles.module.scss';

type IButtonProps = 'primary' | 'secondary' | 'tertiary' | 'quarternary';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  mode: IButtonProps
  text: string;
  icon?: ReactNode;
}

const Button: FC<ButtonProps> = ({ mode, text, icon, onClick, style, type, disabled, ...rest }) => {

  return (
    <button
      {...rest}
      type={type ? type : 'button'}
      disabled={disabled}
      style={style}
      className={`${styles.button} ${styles[mode]}`}
      onClick={onClick}
    >
      {icon ? icon : ''}
      <span style={{ fontSize: style?.fontSize, fontWeight: style?.fontWeight }} className={styles.text}>{text}</span>
    </button>
  );
};

export default Button;
