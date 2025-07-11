import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import VotingDetails from './pages/VotingDetails';
import CreateVoting from './pages/CreateVoting';
import MyVotings from './pages/MyVotings';
import About from './pages/About';

// Providers
import { WalletProvider } from './contexts/WalletContext';
import { FHEVMProvider } from './contexts/FHEVMContext';

// Styles
import './App.css';

function App() {
  return (
    <div className="App min-h-screen bg-gray-50">
      <WalletProvider>
        <FHEVMProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              {/* Header */}
              <Header />
              
              {/* Main Content */}
              <main className="flex-grow container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/voting/:address" element={<VotingDetails />} />
                  <Route path="/create" element={<CreateVoting />} />
                  <Route path="/my-votings" element={<MyVotings />} />
                  <Route path="/about" element={<About />} />
                </Routes>
              </main>
              
              {/* Footer */}
              <Footer />
            </div>
          </Router>
          
          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            className="mt-16"
          />
        </FHEVMProvider>
      </WalletProvider>
    </div>
  );
}

export default App;
