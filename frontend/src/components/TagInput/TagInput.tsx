import { useState, useEffect } from "react";
import styles from "./styles.module.scss";
import { Icons } from "../Icons/Icons";

type TagInputProps = {
  initialTags?: string;
  onTagsChange?: (tags: string[]) => void;
};

function safeParseTags(value: string | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function TagInput({
  initialTags = '[]',
  onTagsChange,
}: TagInputProps) {
  const [tags, setTags] = useState<string[]>(safeParseTags(initialTags));
  const [inputValue, setInputValue] = useState<string>("");
  
  useEffect(() => {
    setTags(safeParseTags(initialTags));
  }, [initialTags]);

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      const trimmedValue = inputValue.trim();

      if (
        !tags.includes(trimmedValue) &&
        trimmedValue.length > 0
      ) {
        const newTags = [...tags, trimmedValue];
        setTags(newTags);
        onTagsChange?.(newTags);
        setInputValue("");
      }

      e.preventDefault();
    }
  };

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
    onTagsChange?.(newTags);
  };

  const removeAllTags = () => {
    setTags([]);
    onTagsChange?.([]);
  };
  const isRemoveAllDisabled = tags.length === 0;
  
  return (
    <div className={styles.container}>
      <div className={styles.tagsList}>
        {tags.length > 0 && tags.map((tag, index) => (
          tag && (
            <div key={index} className={styles.tag}>
            {tag}
            <button
              className={styles.removeButton}
              onClick={() => removeTag(index)}
            >
              {Icons["IcCloseTag"]}
            </button>
          </div>
          )
        ))}
      </div>

      <div className={styles.buttons}>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={addTag}
          placeholder="Digite e pressione ENTER para adicionar a tag."
          className={styles.inputTag}
        />
        
        <span
          className={`${styles.removeAllButton} ${isRemoveAllDisabled ? styles.disabled : styles.enabled}`}
          onClick={isRemoveAllDisabled ? undefined : removeAllTags}
        >
                 {Icons["IcDelete"]} Remover todas
                 </span>
      </div>
    </div>
  );
}
