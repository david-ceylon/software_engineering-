import React, { useState } from 'react';

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/login' : '/register';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        try { localStorage.setItem('user', JSON.stringify(data.user)); } catch (e) {}
        onLogin(data.user);
        setMsg("");
      } else { setMsg(`❌ ${data.error}`); }
    } catch (err) { setMsg("Erreur serveur"); }
  };

  const handleForgot = async (e) => { 
      e.preventDefault();
      // Logique existante pour mot de passe oublié
      console.log("Forgot password logic here");
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center", border: "1px solid #ddd", padding: "20px" }}>
       {isForgot ? (
         <form onSubmit={handleForgot}>
             <input name="email" type="email" placeholder="Votre Email" value={formData.email} onChange={handleChange} required style={{display:"block", width:"90%", margin:"10px auto", padding:"8px"}} />
             <button type="submit" style={{background:"orange", color:"white", padding:"10px", width:"100%"}}>Envoyer Lien</button>
             <p style={{cursor:"pointer", color:"blue", marginTop:"10px"}} onClick={() => {setIsForgot(false); setMsg("");}}>Retour</p>
         </form>
       ) : (
         <form onSubmit={handleSubmit}>
             {!isLogin && <input name="name" type="text" placeholder="Nom" value={formData.name} onChange={handleChange} style={{display:"block", width:"90%", margin:"10px auto", padding:"8px"}} />}
             <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required style={{display:"block", width:"90%", margin:"10px auto", padding:"8px"}} />
             <input name="password" type="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} required style={{display:"block", width:"90%", margin:"10px auto", padding:"8px"}} />
             <button type="submit" style={{background:"blue", color:"white", padding:"10px", width:"100%"}}>{isLogin ? "Se Connecter" : "S'inscrire"}</button>
             <div style={{marginTop:"10px"}}>
                 <span onClick={() => {setIsLogin(!isLogin); setMsg("");}} style={{cursor:"pointer", color:"blue", marginRight:"15px"}}>
                     {isLogin ? "Créer un compte" : "J'ai déjà un compte"}
                 </span>
                 {isLogin && <span onClick={() => {setIsForgot(true); setMsg("");}} style={{cursor:"pointer", color:"grey"}}>Mot de passe oublié ?</span>}
             </div>
         </form>
       )}
       <p style={{color:"red", marginTop:"10px"}}>{msg}</p>
    </div>
  );
}

export default Auth;
