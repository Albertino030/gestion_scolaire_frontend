// Home.jsx - Version complète avec fond transparent pour le formulaire de réinitialisation
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

const cardData = [
  { img: image1, title: 'Maçon Polyvalent', desc: 'Formation aux techniques de construction et maçonnerie', btn: 'Voir la Filière' },
  { img: image2, title: 'Hôtellerie', desc: 'Formation aux métiers de l\'accueil et de la restauration', btn: 'Voir la Filière' },
  { img: image3, title: 'Ouvrage Métallique', desc: 'Formation en soudure, ferronnerie et structures métalliques', btn: 'Voir la Filière' },
  { img: image4, title: 'Mécanique Automobile', desc: 'Formation en maintenance et réparation de véhicules', btn: 'Voir la Filière' },
  { img: image5, title: 'Électrotechnique', desc: 'Formation en installations et systèmes électriques', btn: 'Voir la Filière' },
  { img: image6, title: 'Bâtiment', desc: 'Formation aux métiers du bâtiment et travaux publics', btn: 'Voir la Filière' },
  { img: image7, title: 'Ouvrage Bois', desc: 'Formation en menuiserie, ébénisterie et charpente', btn: 'Voir la Filière' },
];

// Composant ResetPassword intégré avec fond transparent
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
      const response = await fetch('http://localhost:8000/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Erreur lors de la réinitialisation');
      }
      
      setSuccess('Mot de passe réinitialisé avec succès ! Vous allez être redirigé vers la page de connexion.');
      
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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: `url(${fondImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="bg-white bg-opacity-90 rounded-lg p-8 max-w-md w-full text-center">
          <img src={logoCFP} alt="Logo" className="h-20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-4">Lien invalide</h2>
          <p className="text-gray-700 mb-6">Ce lien de réinitialisation est invalide ou a expiré.</p>
          <button
            onClick={onBackToHome}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${fondImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay sombre pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      {/* Formulaire avec fond transparent et effet glassmorphism */}
      <div className="relative backdrop-blur-md bg-white bg-opacity-10 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white border-opacity-30">
        <div className="text-center mb-8">
          <img src={logoCFP} alt="Logo CFP Don Bosco" className="h-20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Réinitialiser le mot de passe</h2>
          <p className="text-gray-200 mt-2">Entrez votre nouveau mot de passe</p>
        </div>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-200 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500 bg-opacity-20 border border-green-400 text-green-200 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full pr-10 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-300"
                placeholder="Au moins 6 caractères"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pr-10 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-300"
                placeholder="Confirmez votre mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition duration-200"
          >
            {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={onBackToHome}
            className="text-sm text-blue-300 hover:text-white hover:underline transition duration-200"
          >
            Retour à la page de connexion
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant Home principal
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

  // Vérifier si on doit afficher la page de réinitialisation
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
      const response = await fetch('http://localhost:8000/auth/register', {
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
      const response = await fetch('http://localhost:8000/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();
      console.log('Réponse:', data);
      if (!response.ok) throw new Error(data.detail || 'Email non trouvé');
      setForgotSuccess('Un lien de réinitialisation a été envoyé à votre adresse email.');
      if (data.reset_link) {
        console.log('🔗 Lien de réinitialisation:', data.reset_link);
      }
      setTimeout(() => { setShowForgotPasswordModal(false); setForgotEmail(''); setForgotSuccess(''); }, 3000);
    } catch (err) { setForgotError(err.message); } finally { setForgotLoading(false); }
  };

  // Si on est sur la page de réinitialisation, afficher le composant ResetPassword
  if (showResetPassword) {
    return <ResetPasswordComponent onBackToHome={() => navigate('/')} />;
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{
        backgroundImage: `url(${fondImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Navbar */}
      <div className="relative z-10 w-full">
        <div style={{
          background: 'linear-gradient(90deg, rgba(20,40,80,0.92) 0%, rgba(10,25,60,0.88) 100%)',
          borderBottom: '2px solid rgba(255,200,50,0.5)',
          backdropFilter: 'blur(8px)',
          padding: '10px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo + Nom */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src={logoCFP} alt="Logo CFP Don Bosco" style={{ height: 54, width: 54, objectFit: 'contain', borderRadius: 8 }} />
            <span style={{ color: '#FFD700', fontWeight: 800, fontSize: 20, letterSpacing: 1, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
              CFP DON BOSCO
            </span>
          </div>

          {/* Boutons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setShowLoginModal(true)}
              style={{
                background: 'rgba(255,255,255,0.92)',
                color: '#1a3a6e',
                border: 'none',
                borderRadius: 25,
                padding: '8px 24px',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#FFD700'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.92)'}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Connexion
            </button>
            <button
              onClick={() => setShowRegisterModal(true)}
              style={{
                background: 'transparent',
                color: '#fff',
                border: '2px solid rgba(255,255,255,0.7)',
                borderRadius: 25,
                padding: '8px 24px',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                backdropFilter: 'blur(4px)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.borderColor = '#FFD700'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)'; }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Inscription
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center" style={{ padding: '40px 20px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          {/* Logo central */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, marginBottom: 18 }}>
            <img src={logoCFP} alt="Logo CFP Don Bosco" style={{
              height: 90, width: 90, objectFit: 'contain',
              filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.5))',
            }} />
          </div>

          <h1 style={{
            color: '#fff',
            fontSize: 'clamp(24px, 4vw, 46px)',
            fontWeight: 900,
            textShadow: '0 3px 20px rgba(0,0,0,0.7)',
            marginBottom: 14,
            letterSpacing: 1,
            lineHeight: 1.2
          }}>
            Bienvenue dans le Système de Gestion Scolaire
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 'clamp(14px, 2vw, 18px)',
            maxWidth: 700,
            margin: '0 auto 28px',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            lineHeight: 1.6
          }}>
            Accédez facilement aux étudiants, paiements, présences, examens et au suivi de formation.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowLoginModal(true)}
              style={{
                background: 'linear-gradient(135deg, #1a3a6e, #2563eb)',
                color: '#fff',
                border: 'none',
                borderRadius: 30,
                padding: '13px 38px',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(37,99,235,0.5)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Commencer maintenant →
            </button>
          </div>
        </div>

        {/* 7 Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 12,
          width: '100%',
          maxWidth: 1300,
          padding: '0 16px',
        }}>
          {cardData.map((card, i) => (
            <div
              key={i}
              onClick={() => setShowLoginModal(true)}
              style={{
                position: 'relative',
                borderRadius: 14,
                overflow: 'hidden',
                cursor: 'pointer',
                border: '2px solid rgba(255,215,0,0.4)',
                boxShadow: '0 6px 24px rgba(0,0,0,0.5)',
                transition: 'transform 0.25s, box-shadow 0.25s',
                minHeight: 220,
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'; e.currentTarget.style.border = '2px solid #FFD700'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.border = '2px solid rgba(255,215,0,0.4)'; }}
            >
              {/* Image de fond de la carte */}
              <img
                src={card.img}
                alt={card.title}
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'cover', zIndex: 0,
                }}
              />
              {/* Gradient overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, rgba(10,25,60,0.45) 0%, rgba(10,25,60,0.82) 70%, rgba(10,25,60,0.95) 100%)',
                zIndex: 1,
              }} />

              {/* Contenu */}
              <div style={{
                position: 'relative', zIndex: 2, padding: '12px 10px 14px',
                display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end',
              }}>
                <h3 style={{
                  color: '#FFD700', fontWeight: 800, fontSize: 13,
                  marginBottom: 5, textAlign: 'center', textShadow: '0 2px 6px rgba(0,0,0,0.7)',
                  letterSpacing: 0.5,
                }}>
                  {card.title}
                </h3>
                <p style={{
                  color: 'rgba(255,255,255,0.88)', fontSize: 11, textAlign: 'center',
                  marginBottom: 10, lineHeight: 1.4, textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                }}>
                  {card.desc}
                </p>
                <button
                  style={{
                    background: 'linear-gradient(135deg, #1a3a6e, #2563eb)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 20,
                    padding: '6px 10px',
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                    width: '100%',
                    letterSpacing: 0.3,
                  }}
                >
                  {card.btn}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10" style={{
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        borderTop: '1px solid rgba(255,215,0,0.3)',
        padding: '12px 0',
        marginTop: 24,
      }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', fontSize: 13 }}>
          © 2025 CFP Don Bosco - Centre de Formation Professionnelle | Tous droits réservés
        </p>
      </div>

      {/* ===== MODALE CONNEXION ===== */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 backdrop-blur-sm bg-black bg-opacity-50" onClick={() => setShowLoginModal(false)}></div>
          <div className="relative backdrop-blur-xl bg-white bg-opacity-10 rounded-2xl shadow-2xl w-full max-w-md border border-white border-opacity-20" style={{ animation: 'modalSlideUp 0.3s ease-out' }}>
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-white hover:text-gray-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="text-center pt-8 px-8">
              <div className="mx-auto h-16 w-16 bg-indigo-600 bg-opacity-80 rounded-full flex items-center justify-center mb-4">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Connexion</h2>
              <p className="text-gray-200 mt-2">Connectez-vous à votre compte</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 p-8">
              {error && <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-200 px-4 py-3 rounded-lg">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-300" placeholder="admin@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Mot de passe</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pr-10 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-300" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
              </div>
              <div className="text-right">
                <button type="button" onClick={() => { setShowLoginModal(false); setShowForgotPasswordModal(true); }} className="text-sm text-indigo-200 hover:text-white hover:underline">Mot de passe oublié ?</button>
              </div>
              <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
            <div className="px-8 pb-8 text-center">
              <p className="text-sm text-gray-200">Pas encore de compte ?{' '}
                <button onClick={() => { setShowLoginModal(false); setShowRegisterModal(true); }} className="text-indigo-200 hover:text-white font-semibold hover:underline">Créer un compte</button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODALE INSCRIPTION ===== */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 backdrop-blur-sm bg-black bg-opacity-50" onClick={() => setShowRegisterModal(false)}></div>
          <div className="relative backdrop-blur-xl bg-white bg-opacity-10 rounded-2xl shadow-2xl w-full max-w-md border border-white border-opacity-20" style={{ animation: 'modalSlideUp 0.3s ease-out', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowRegisterModal(false)} className="absolute top-4 right-4 text-white hover:text-gray-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="text-center pt-8 px-8">
              <div className="mx-auto h-16 w-16 bg-green-600 bg-opacity-80 rounded-full flex items-center justify-center mb-4">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Inscription</h2>
              <p className="text-gray-200 mt-2">Créez votre compte</p>
            </div>
            <form onSubmit={handleRegister} className="space-y-4 p-8">
              {registerError && <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-200 px-4 py-3 rounded-lg">{registerError}</div>}
              {registerSuccess && <div className="bg-green-500 bg-opacity-20 border border-green-400 text-green-200 px-4 py-3 rounded-lg">{registerSuccess}</div>}
              {['nom', 'prenom', 'email'].map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium text-white mb-2 capitalize">{field === 'nom' ? 'Nom' : field === 'prenom' ? 'Prénom' : 'Email'}</label>
                  <input type={field === 'email' ? 'email' : 'text'} value={registerData[field]} onChange={(e) => setRegisterData({ ...registerData, [field]: e.target.value })} className="block w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-300" placeholder={field === 'nom' ? 'Votre nom' : field === 'prenom' ? 'Votre prénom' : 'exemple@email.com'} />
                </div>
              ))}
              {[['password', showRegisterPassword, setShowRegisterPassword, 'Mot de passe', 'Min 6 caractères'], ['confirmPassword', showRegisterConfirmPassword, setShowRegisterConfirmPassword, 'Confirmer le mot de passe', 'Confirmez votre mot de passe']].map(([field, show, setShow, label, ph]) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-white mb-2">{label}</label>
                  <div className="relative">
                    <input type={show ? "text" : "password"} value={registerData[field]} onChange={(e) => setRegisterData({ ...registerData, [field]: e.target.value })} className="block w-full pr-10 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-300" placeholder={ph} />
                    <button type="button" onClick={() => setShow(!show)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" disabled={registerLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
                {registerLoading ? 'Inscription...' : "S'inscrire"}
              </button>
            </form>
            <div className="px-8 pb-8 text-center">
              <p className="text-sm text-gray-200">Déjà un compte ?{' '}
                <button onClick={() => { setShowRegisterModal(false); setShowLoginModal(true); }} className="text-green-200 hover:text-white font-semibold hover:underline">Se connecter</button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODALE MOT DE PASSE OUBLIÉ ===== */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 backdrop-blur-sm bg-black bg-opacity-50" onClick={() => setShowForgotPasswordModal(false)}></div>
          <div className="relative backdrop-blur-xl bg-white bg-opacity-10 rounded-2xl shadow-2xl w-full max-w-md border border-white border-opacity-20" style={{ animation: 'modalSlideUp 0.3s ease-out' }}>
            <button onClick={() => setShowForgotPasswordModal(false)} className="absolute top-4 right-4 text-white hover:text-gray-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="text-center pt-8 px-8">
              <div className="mx-auto h-16 w-16 bg-yellow-600 bg-opacity-80 rounded-full flex items-center justify-center mb-4">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Mot de passe oublié</h2>
              <p className="text-gray-200 mt-2">Entrez votre email pour réinitialiser votre mot de passe</p>
            </div>
            <form onSubmit={handleForgotPassword} className="space-y-6 p-8">
              {forgotError && <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-200 px-4 py-3 rounded-lg">{forgotError}</div>}
              {forgotSuccess && <div className="bg-green-500 bg-opacity-20 border border-green-400 text-green-200 px-4 py-3 rounded-lg">{forgotSuccess}</div>}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Email</label>
                <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="block w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white placeholder-gray-300" placeholder="votre@email.com" />
              </div>
              <button type="submit" disabled={forgotLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50">
                {forgotLoading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
              </button>
            </form>
            <div className="px-8 pb-8 text-center">
              <button onClick={() => { setShowForgotPasswordModal(false); setShowLoginModal(true); }} className="text-sm text-yellow-200 hover:text-white hover:underline">
                Retour à la connexion
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(50px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 900px) {
          .cards-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
};

export default Home;