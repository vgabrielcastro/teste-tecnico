import React from "react";
import styles from "./styles.module.scss";

interface IToggleSwitch {
  checked: boolean;
  onChange: () => void;
  onLabel?: string;
  offLabel?: string;
}

const ToggleSwitch: React.FC<IToggleSwitch> = ({
  checked,
  onChange,
  onLabel = "Ligado",
  offLabel = "Desligado",
}) => {
  return (
    <div className={styles.toggleContainer}>
      <button
        type="button"
        className={styles.buttonSwitch}
        style={
          checked
            ? { backgroundColor: "#3BB861" }
            : { backgroundColor: "#C1CAD3" }
        }
        onClick={onChange}
      >
        <div
          style={
            checked
              ? { transform: "translateX(130%)" }
              : { transform: "translateX(0px)" }
          }
          className={styles.rounded}
        ></div>
      </button>
      <span className={styles.toggleText}>
        {checked ? onLabel : offLabel}
      </span>
    </div>
  );
};

export default ToggleSwitch;
