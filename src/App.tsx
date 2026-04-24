/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './components/LanguageContext';
import { ThemeProvider } from './components/ThemeContext';
import { Layout } from './components/Layout';
import { Web3Provider } from './components/Web3Provider';
import { MatrixProvider } from './context/MatrixContext';
import Home from './pages/Home';
import System from './pages/System';
import Account from './pages/Account';
import Team from './pages/Team';
import Earnings from './pages/Earnings';
import Invite from './pages/Invite';
import Transactions from './pages/Transactions';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <Web3Provider>
          <MatrixProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/system" element={<System />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/earnings" element={<Earnings />} />
                  <Route path="/invite" element={<Invite />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  {/* Fallback to Home for now for other links */}
                  <Route path="*" element={<Home />} />
                </Routes>
              </Layout>
            </Router>
          </MatrixProvider>
        </Web3Provider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
