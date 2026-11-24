import React, { useState } from "react";

import styles from "./styles.module.scss";

interface ITabListProps {
    tablist: ITabProps[]
}

const Tabs: React.FC<ITabListProps> = ({tablist}) => {

  const [activeTab, setActiveTab] = useState<number>(0);
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <ul>
          {tablist.map((tab, index) => (
            <li key={`tab-${index}`}>
              <button className={activeTab == index ? styles.active : ''} onClick={() => setActiveTab(index)}><img src={tab.icon} /> {tab.label}</button>
            </li>
          ))}
        </ul>
      </header>
      {tablist[activeTab].content}
    </div>
  );
};

export default Tabs;
