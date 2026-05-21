// Home.jsx - Version complète responsive
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import fondImage from '../logo/fond.png';
import logoCFP from '../logo/LOGO CFP DON BOSCO.png';
import image1 from '../logo/image 1.png';
import image2 from '../logo/image 2.png';
import image3 from '../logo/image 3.png';
import image4 from '../logo/image 4.png';
import image5 from '../logo/image 5.png';
import image6 from '../logo/image 6.png';
import image7 from '../logo/image 7.png';
import { login } from '../api/auth';

const API_URL = import.meta.env.VITE_API_URL || 'https://gestion-scolaire-backend-is34.onrender.com';

const cardData = [
  { img: image1, title: 'Maçon Polyvalent', desc: 'Formation aux techniques de construction et maçonnerie' },
  { img: image2, title: 'Hôtellerie', desc: 'Formation aux métiers de l\'accueil et de la restauration' },
  { img: image3, title: 'Ouvrage Métallique', desc: 'Formation en soudure, ferronnerie et structures métalliques' },
  { img: image4, title: 'Mécanique Automobile', desc: 'Formation en maintenance et réparation de véhicules' },
  { img: image5, title: 'Électrotechnique', desc: 'Formation en installations et systèmes électriques' },
  { img: image6, title: 'Bâtiment', desc: 'Formation aux métiers du bâtiment et travaux publics' },
  { img: image7, title: 'Ouvrage Bois', desc: 'Formation en menuiserie, ébénisterie et charpente' },
];

// Composant ResetPassword
const ResetPasswordComponent = ({ onBackToHome }) => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      setError('Token de réinitialisation manquant');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!newPassword || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Erreur lors de la réinitialisation');
      }
      
      setSuccess('Mot de passe réinitialisé avec succès ! Vous allez être redirigé.');
      
      setTimeout(() => {
        onBackToHome();
      }, 3000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${fondImage})` }}>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 text-center">
          <img src={logoCFP} alt="Logo" className="h-16 sm:h-20 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">Lien invalide</h2>
          <p className="text-gray-700 mb-6 text-sm">Ce lien de réinitialisation est invalide ou a expiré.</p>
          <button onClick={onBackToHome} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto">
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${fondImage})` }}>
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative backdrop-blur-md bg-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-white/30">
        <div className="text-center mb-6 sm:mb-8">
          <img src={logoCFP} alt="Logo" className="h-16 sm:h-20 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">Réinitialiser le mot de passe</h2>
          <p className="text-gray-200 text-sm mt-2">Entrez votre nouveau mot de passe</p>
        </div>
        
        {error && <div className="bg-red-500/20 border border-red-400 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-500/20 border border-green-400 text-green-200 px-4 py-3 rounded-lg mb-4 text-sm">{success}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Nouveau mot de passe</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} 
                className="block w-full pr-10 py-2.5 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Au moins 6 caractères" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">Confirmer le mot de passe</label>
            <div className="relative">
              <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} 
                className="block w-full pr-10 py-2.5 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Confirmez votre mot de passe" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </button>
            </div>
          </div>
          
          <button type="submit" disabled={loading} 
            className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition duration-200">
            {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button onClick={onBackToHome} className="text-sm text-blue-300 hover:text-white hover:underline">Retour à la page de connexion</button>
        </div>
      </div>
    </div>
  );
};

// Composant Home principal (RESPONSIVE)
const Home = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showResetPassword = searchParams.get('reset') === 'true' && searchParams.get('token');
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [registerData, setRegisterData] = useState({ nom: '', prenom: '', email: '', password: '', confirmPassword: '', role: 'user' });
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    if (showResetPassword) {
      setShowLoginModal(false);
      setShowRegisterModal(false);
      setShowForgotPasswordModal(false);
    }
  }, [showResetPassword]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowLoginModal(false);
        setShowRegisterModal(false);
        setShowForgotPasswordModal(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!email || !password) { setError('Veuillez remplir tous les champs'); setLoading(false); return; }
    try {
      const result = await login(email, password);
      setShowLoginModal(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Email ou mot de passe incorrect');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError(''); setRegisterSuccess(''); setRegisterLoading(true);
    if (!registerData.nom || !registerData.prenom || !registerData.email || !registerData.password) { setRegisterError('Veuillez remplir tous les champs'); setRegisterLoading(false); return; }
    if (registerData.password !== registerData.confirmPassword) { setRegisterError('Les mots de passe ne correspondent pas'); setRegisterLoading(false); return; }
    if (registerData.password.length < 6) { setRegisterError('Le mot de passe doit contenir au moins 6 caractères'); setRegisterLoading(false); return; }
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: registerData.nom, prenom: registerData.prenom, email: registerData.email, password: registerData.password, role: registerData.role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Erreur lors de l\'inscription');
      setRegisterSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      setTimeout(() => {
        setShowRegisterModal(false);
        setRegisterData({ nom: '', prenom: '', email: '', password: '', confirmPassword: '', role: 'user' });
        setRegisterSuccess('');
        setShowLoginModal(true);
      }, 2000);
    } catch (err) { setRegisterError(err.message); } finally { setRegisterLoading(false); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError(''); setForgotSuccess(''); setForgotLoading(true);
    if (!forgotEmail) { setForgotError('Veuillez entrer votre email'); setForgotLoading(false); return; }
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Email non trouvé');
      setForgotSuccess('Un lien de réinitialisation a été envoyé à votre adresse email.');
      setTimeout(() => { setShowForgotPasswordModal(false); setForgotEmail(''); setForgotSuccess(''); }, 3000);
    } catch (err) { setForgotError(err.message); } finally { setForgotLoading(false); }
  };

  if (showResetPassword) {
    return <ResetPasswordComponent onBackToHome={() => navigate('/')} />;
  }

  return (
    <div className="min-h-screen relative flex flex-col bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${fondImage})` }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Navbar Responsive */}
      <div className="relative z-10 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-900/90 to-blue-800/90 backdrop-blur-md border-b-2 border-yellow-500/50">
          <div className="flex items-center gap-3">
            <img src={logoCFP} alt="Logo CFP Don Bosco" className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 object-contain rounded-lg" />
            <span className="text-yellow-400 font-extrabold text-base sm:text-lg md:text-xl tracking-wide">CFP DON BOSCO</span>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button onClick={() => setShowLoginModal(true)} 
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 bg-white text-blue-800 rounded-full font-bold text-xs sm:text-sm hover:bg-yellow-400 transition-all shadow-md">
              <svg width="14" height="14" sm="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
              Connexion
            </button>
            <button onClick={() => setShowRegisterModal(true)} 
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 bg-transparent border-2 border-white text-white rounded-full font-bold text-xs sm:text-sm hover:bg-white hover:text-blue-800 transition-all">
              <svg width="14" height="14" sm="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              Inscription
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section Responsive */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-8 md:py-12">
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <img src={logoCFP} alt="Logo CFP Don Bosco" className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 mx-auto mb-4 drop-shadow-lg" />
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white text-center drop-shadow-lg px-2">
            Bienvenue dans le Système de Gestion Scolaire
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-white/90 text-center max-w-2xl mx-auto mt-3 px-4">
            Accédez facilement aux étudiants, paiements, présences, examens et au suivi de formation.
          </p>
          <button onClick={() => setShowLoginModal(true)} 
            className="mt-6 px-6 sm:px-7 md:px-8 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold text-sm sm:text-base shadow-lg hover:scale-105 transition-transform">
            Commencer maintenant →
          </button>
        </div>

        {/* Cards Grid Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4 w-full max-w-7xl px-2 sm:px-4">
          {cardData.map((card, i) => (
            <div key={i} onClick={() => setShowLoginModal(true)} 
              className="group relative rounded-xl overflow-hidden cursor-pointer border-2 border-yellow-400/40 hover:border-yellow-400 transition-all duration-300 hover:-translate-y-1 shadow-lg" style={{ minHeight: '160px', height: 'auto' }}>
              <img src={card.img} alt={card.title} className="absolute inset-0 w-full h-full object-cover z-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent z-10"></div>
              <div className="relative z-20 p-2 sm:p-3 flex flex-col justify-end h-full text-center">
                <h3 className="text-yellow-400 font-extrabold text-[10px] xs:text-xs sm:text-sm mb-1 drop-shadow-md">{card.title}</h3>
                <p className="text-white text-[8px] xs:text-[9px] sm:text-[10px] mb-1.5 sm:mb-2 drop-shadow-md line-clamp-2">{card.desc}</p>
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[8px] xs:text-[9px] sm:text-[10px] font-bold py-1 px-1.5 sm:py-1.5 sm:px-2 rounded-full hover:opacity-90 transition">
                  Voir la Filière
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Responsive */}
      <div className="relative z-10 bg-black/50 backdrop-blur-sm border-t border-yellow-400/30 py-2 sm:py-3 mt-auto">
        <p className="text-white/70 text-center text-[10px] xs:text-xs sm:text-sm px-4">
          © 2025 CFP Don Bosco - Centre de Formation Professionnelle | Tous droits réservés
        </p>
      </div>

      {/* ===== MODALE CONNEXION (Responsive) ===== */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 backdrop-blur-sm bg-black/50" onClick={() => setShowLoginModal(false)}></div>
          <div className="relative backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl w-full max-w-[90%] sm:max-w-md border border-white/20 animate-modal-slide-up">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white hover:text-gray-200 z-10">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="text-center pt-6 sm:pt-8 px-4 sm:px-8">
              <div className="mx-auto h-14 w-14 sm:h-16 sm:w-16 bg-indigo-600/80 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <svg className="h-8 w-8 sm:h-10 sm:w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Connexion</h2>
              <p className="text-gray-200 text-sm mt-1 sm:mt-2">Connectez-vous à votre compte</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 p-4 sm:p-8">
              {error && <div className="bg-red-500/20 border border-red-400 text-red-200 px-3 py-2 rounded-lg text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-white mb-1 sm:mb-2">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
                  className="block w-full px-3 py-2 sm:py-2.5 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  placeholder="admin@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1 sm:mb-2">Mot de passe</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} 
                    className="block w-full pr-10 py-2 sm:py-2.5 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
              </div>
              <div className="text-right">
                <button type="button" onClick={() => { setShowLoginModal(false); setShowForgotPasswordModal(true); }} 
                  className="text-xs sm:text-sm text-indigo-200 hover:text-white hover:underline">Mot de passe oublié ?</button>
              </div>
              <button type="submit" disabled={loading} 
                className="w-full flex justify-center py-2 px-4 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
            <div className="px-4 sm:px-8 pb-6 sm:pb-8 text-center">
              <p className="text-xs sm:text-sm text-gray-200">Pas encore de compte ?{' '}
                <button onClick={() => { setShowLoginModal(false); setShowRegisterModal(true); }} 
                  className="text-indigo-200 hover:text-white font-semibold hover:underline">Créer un compte</button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODALE INSCRIPTION (Responsive) ===== */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 backdrop-blur-sm bg-black/50" onClick={() => setShowRegisterModal(false)}></div>
          <div className="relative backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl w-full max-w-[90%] sm:max-w-md border border-white/20 animate-modal-slide-up max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowRegisterModal(false)} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white hover:text-gray-200 z-10">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="text-center pt-6 sm:pt-8 px-4 sm:px-8">
              <div className="mx-auto h-14 w-14 sm:h-16 sm:w-16 bg-green-600/80 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <svg className="h-8 w-8 sm:h-10 sm:w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Inscription</h2>
              <p className="text-gray-200 text-sm mt-1 sm:mt-2">Créez votre compte</p>
            </div>
            <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4 p-4 sm:p-8">
              {registerError && <div className="bg-red-500/20 border border-red-400 text-red-200 px-3 py-2 rounded-lg text-sm">{registerError}</div>}
              {registerSuccess && <div className="bg-green-500/20 border border-green-400 text-green-200 px-3 py-2 rounded-lg text-sm">{registerSuccess}</div>}
              <div>
                <label className="block text-sm font-medium text-white mb-1">Nom</label>
                <input type="text" value={registerData.nom} onChange={(e) => setRegisterData({ ...registerData, nom: e.target.value })} 
                  className="block w-full px-3 py-2 sm:py-2.5 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" 
                  placeholder="Votre nom" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">Prénom</label>
                <input type="text" value={registerData.prenom} onChange={(e) => setRegisterData({ ...registerData, prenom: e.target.value })} 
                  className="block w-full px-3 py-2 sm:py-2.5 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" 
                  placeholder="Votre prénom" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">Email</label>
                <input type="email" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} 
                  className="block w-full px-3 py-2 sm:py-2.5 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" 
                  placeholder="exemple@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">Mot de passe</label>
                <div className="relative">
                  <input type={showRegisterPassword ? "text" : "password"} value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} 
                    className="block w-full pr-10 py-2 sm:py-2.5 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" 
                    placeholder="Min 6 caractères" />
                  <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">Confirmer le mot de passe</label>
                <div className="relative">
                  <input type={showRegisterConfirmPassword ? "text" : "password"} value={registerData.confirmPassword} onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })} 
                    className="block w-full pr-10 py-2 sm:py-2.5 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" 
                    placeholder="Confirmez votre mot de passe" />
                  <button type="button" onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
              </div>
              <button type="submit" disabled={registerLoading} 
                className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
                {registerLoading ? 'Inscription...' : "S'inscrire"}
              </button>
            </form>
            <div className="px-4 sm:px-8 pb-6 sm:pb-8 text-center">
              <p className="text-xs sm:text-sm text-gray-200">Déjà un compte ?{' '}
                <button onClick={() => { setShowRegisterModal(false); setShowLoginModal(true); }} 
                  className="text-green-200 hover:text-white font-semibold hover:underline">Se connecter</button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODALE MOT DE PASSE OUBLIÉ (Responsive) ===== */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 backdrop-blur-sm bg-black/50" onClick={() => setShowForgotPasswordModal(false)}></div>
          <div className="relative backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl w-full max-w-[90%] sm:max-w-md border border-white/20 animate-modal-slide-up">
            <button onClick={() => setShowForgotPasswordModal(false)} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white hover:text-gray-200 z-10">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="text-center pt-6 sm:pt-8 px-4 sm:px-8">
              <div className="mx-auto h-14 w-14 sm:h-16 sm:w-16 bg-yellow-600/80 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <svg className="h-8 w-8 sm:h-10 sm:w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Mot de passe oublié</h2>
              <p className="text-gray-200 text-sm mt-1 sm:mt-2">Entrez votre email pour réinitialiser votre mot de passe</p>
            </div>
            <form onSubmit={handleForgotPassword} className="space-y-4 sm:space-y-6 p-4 sm:p-8">
              {forgotError && <div className="bg-red-500/20 border border-red-400 text-red-200 px-3 py-2 rounded-lg text-sm">{forgotError}</div>}
              {forgotSuccess && <div className="bg-green-500/20 border border-green-400 text-green-200 px-3 py-2 rounded-lg text-sm">{forgotSuccess}</div>}
              <div>
                <label className="block text-sm font-medium text-white mb-1 sm:mb-2">Email</label>
                <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} 
                  className="block w-full px-3 py-2 sm:py-2.5 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500" 
                  placeholder="votre@email.com" />
              </div>
              <button type="submit" disabled={forgotLoading} 
                className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50">
                {forgotLoading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
              </button>
            </form>
            <div className="px-4 sm:px-8 pb-6 sm:pb-8 text-center">
              <button onClick={() => { setShowForgotPasswordModal(false); setShowLoginModal(true); }} 
                className="text-xs sm:text-sm text-yellow-200 hover:text-white hover:underline">Retour à la connexion</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(50px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-modal-slide-up {
          animation: modalSlideUp 0.3s ease-out forwards;
        }
        @media (max-width: 640px) {
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;