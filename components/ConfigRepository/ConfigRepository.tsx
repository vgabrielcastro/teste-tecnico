import React, { useState, useEffect } from "react";
import styles from "./styles.module.scss";
import TagInput from "../TagInput/TagInput";
import ToggleSwitch from "../ToggleSwitch/ToggleSwitch";
import { useAppContext } from "../../hooks/useGlobal";

function parseModules(rawModules: IRepositoryModules | string | undefined): IRepositoryModules {
  const defaultModules: IRepositoryModules = {
    videoInArticle: false,
    anchorAds: false,
    selo: false,
  };
  if (!rawModules) return defaultModules;
  if (typeof rawModules === "string") {
    try {
      const parsed = JSON.parse(rawModules);
      if (parsed && typeof parsed === "object") {
        return {
          videoInArticle: Boolean(parsed.videoInArticle),
          anchorAds: Boolean(parsed.anchorAds),
          selo: Boolean(parsed.selo),
        };
      }
    } catch {
      return defaultModules;
    }
    return defaultModules;
  }
  if (typeof rawModules === "object") {
    return {
      videoInArticle: Boolean(rawModules.videoInArticle),
      anchorAds: Boolean(rawModules.anchorAds),
      selo: Boolean(rawModules.selo),
    };
  }
  return defaultModules;
}

const ConfigRepository: React.FC = () => {
  const { repositoryState, setRepositoryState } = useAppContext();
  const generalConfig = repositoryState.generalConfig;

  const [localConfig, setLocalConfig] = useState<IGeneralConfig>(generalConfig);

  useEffect(() => {
    setLocalConfig(generalConfig);
  }, [generalConfig]);

  const modules = parseModules(localConfig.modules);

  const handleInputChange = (field: keyof IGeneralConfig, value: string) => {
    setLocalConfig((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleInputBlur = () => {
    setRepositoryState((prev) => ({
      ...prev,
      generalConfig: {
        ...prev.generalConfig,
        ...localConfig,
        modules: parseModules(localConfig.modules),
      },
    }));
  };

  const handleTagsChange = (tags: string[]) => {
    const serialized = JSON.stringify(tags);
    setLocalConfig((prev) => ({
      ...prev,
      tagsParaSelo: serialized,
    }));
    setRepositoryState((prev) => ({
      ...prev,
      generalConfig: {
        ...prev.generalConfig,
        tagsParaSelo: serialized,
      },
    }));
  };

  const handleModuleToggle = (moduleKey: keyof IRepositoryModules) => {
    const currentModules = parseModules(localConfig.modules);
    const updatedModules: IRepositoryModules = {
      ...currentModules,
      [moduleKey]: !currentModules[moduleKey],
    };

    setLocalConfig((prev) => ({
      ...prev,
      modules: updatedModules,
    }));

    setRepositoryState((prev) => ({
      ...prev,
      generalConfig: {
        ...prev.generalConfig,
        modules: updatedModules,
      },
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Configurações de Path do GAM</h1>
      </div>
      <div className={styles.form_container}>
        <form>
          <div className={styles.input_container}>
            <label>adUnitGeral</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Ex.: /8804/uol/esporte"
              value={localConfig.adUnitGeral || ""}
              onChange={(e) => handleInputChange("adUnitGeral", e.target.value)}
              onBlur={handleInputBlur}
            />
          </div>
          <div className={styles.input_container}>
            <label>adUnitVideo</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Ex.: /8804/uol/esporte/inarticle"
              value={localConfig.adUnitVideo || ""}
              onChange={(e) => handleInputChange("adUnitVideo", e.target.value)}
              onBlur={handleInputBlur}
            />
          </div>
          <div className={styles.input_container}>
            <label>adUnitMagazineCover</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Ex.: /8804/uol/esporte"
              value={localConfig.adUnitMagazine || ""}
              onChange={(e) =>
                handleInputChange("adUnitMagazine", e.target.value)
              }
              onBlur={handleInputBlur}
            />
          </div>
          <div className={styles.input_container}>
            <label>TagsParaSelo</label>
            <TagInput
              initialTags={localConfig.tagsParaSelo || '[]'}
              onTagsChange={handleTagsChange}
            />
          </div>

          <div className={styles.modules_section}>
            <h2>Módulos Opcionais do Motor</h2>
            <p>
              Ative apenas os módulos utilizados por este repositório (incluídos sob demanda via tree-shaking).
            </p>
            <div className={styles.input_container}>
              <label>Video InArticle</label>
              <ToggleSwitch
                checked={Boolean(modules.videoInArticle)}
                onChange={() => handleModuleToggle("videoInArticle")}
                onLabel="Ativado"
                offLabel="Desativado"
              />
            </div>
            <div className={styles.input_container}>
              <label>Anchor Ads (Sticky Footer)</label>
              <ToggleSwitch
                checked={Boolean(modules.anchorAds)}
                onChange={() => handleModuleToggle("anchorAds")}
                onLabel="Ativado"
                offLabel="Desativado"
              />
            </div>
            <div className={styles.input_container}>
              <label>Selos</label>
              <ToggleSwitch
                checked={Boolean(modules.selo)}
                onChange={() => handleModuleToggle("selo")}
                onLabel="Ativado"
                offLabel="Desativado"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigRepository;
