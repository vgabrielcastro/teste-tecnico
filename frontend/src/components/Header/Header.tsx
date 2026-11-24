import React from 'react';
// import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

import styles from './styles.module.scss';
import logo from '/logo-adTags.png';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className={styles.container}>
      <div className={styles.content}>
        <Link to="/">
        <img src={logo} alt="logomarca UOL adTags" />
        </Link>


      <ul>
        <li><Link to="/">Home</Link></li>
        {/* <li><Link to="/contas">Contas</Link></li>
        <li><Link to="/templates">Templates</Link></li> */}
      </ul>
      </div>


      {/* <div className={styles.signOut}><LogoutRoundedIcon/> <p>Sair</p></div> */}

    </header>
  );
}

export default Header;