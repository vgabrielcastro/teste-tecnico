import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import AccountsPage from './features/accounts/pages/AccountsPage';
import styles from './App.module.scss';

function AccountDetailsPage() {
  const { name } = useParams();

  return (
    <section className={styles.detailsPage}>
      <h1>{name}</h1>
      <p>Detalhes da conta.</p>
    </section>
  );
}

function App() {
  return (
    <div className={styles.appShell}>
      <Header />
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<AccountsPage />} />
          <Route path="/contas/:name/:id" element={<AccountDetailsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
