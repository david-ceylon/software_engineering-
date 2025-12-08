import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5001/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Mot de passe modifié !");
        navigate('/');
      } else { setMessage(`❌ ${data.error}`); }
    } catch (err) { setMessage("Erreur serveur"); }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Nouveau mot de passe</h2>
      <form onSubmit={handleReset}>
        <input type="password" placeholder="Nouveau mot de passe" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Valider</button>
      </form>
      <p style={{color:"red"}}>{message}</p>
    </div>
  );
}

export default ResetPassword;
