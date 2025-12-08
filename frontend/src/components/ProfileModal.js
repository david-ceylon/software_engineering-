import React, { useState } from 'react';

function ProfileModal({ user, onClose, onDeleteAccount, onInvite }) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('admin');
  const [message, setMessage] = useState(null);

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5001/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          currentUserId: user.id,
          role: inviteRole
        }),
      });
      const data = await res.json();
      if (!res.ok) setMessage({ type: 'error', text: data.error || 'Erreur' });
      else {
        setMessage({ type: 'success', text: data.message || 'Invité' });
        // notify parent to refresh members if provided
        if (onInvite) onInvite();
      }
      setInviteEmail('');
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur serveur' });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer votre compte supprimera vos accès. Continuer ?')) return;
    try {
      const res = await fetch(`http://localhost:5001/users/${user.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUserId: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Compte supprimé');
        onDeleteAccount();
      } else {
        alert(data.error || 'Erreur suppression');
      }
    } catch (err) {
      alert('Erreur serveur');
    }
  };

  const isCollaborator = user?.role === 'collaborator';

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3>Profile</h3>
          <button onClick={onClose} style={styles.close}>×</button>
        </div>

        <div style={styles.body}>
          <p><strong>{user.name}</strong> ({user.email})</p>

          {!isCollaborator && (
            <div style={{marginTop: 12}}>
              <h4>Inviter</h4>
              <form onSubmit={handleInvite} style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                <input
                  placeholder="email@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  style={styles.input}
                  required
                />
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} style={styles.select}>
                  <option value="admin">Partner (Admin)</option>
                  <option value="collaborator">Collaborator (guest)</option>
                </select>
                <button style={styles.inviteBtn} type="submit">Invite</button>
              </form>
              {message && (
                <div style={{marginTop:8, color: message.type === 'error' ? '#b00020' : '#0a7a0a'}}>{message.text}</div>
              )}
              <p style={{fontSize:12, color:'#666', marginTop:8}}>Note: maximum 2 admins per wedding. Collaborators can view and validate only their assigned tasks.</p>
            </div>
          )}

          <div style={{marginTop: 20}}>
            <h4>Supprimer le compte</h4>
            <p style={{fontSize:12, color:'#666'}}>Supprimer votre compte vous déconnectera et supprimera vos accès.</p>
            <button style={styles.deleteBtn} onClick={handleDelete}>Delete account</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', top:0, left:0, right:0, bottom:0,
    backgroundColor: 'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1100
  },
  modal: { background:'#fff', padding:20, borderRadius:8, width:420, boxShadow:'0 8px 24px rgba(0,0,0,0.18)' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 },
  close: { background:'none', border:'none', fontSize:20, cursor:'pointer' },
  body: { },
  input: { padding:8, borderRadius:4, border:'1px solid #ccc' },
  select: { padding:8, borderRadius:4, border:'1px solid #ccc' },
  inviteBtn: { backgroundColor:'#4CAF50', color:'#fff', border:'none', padding:'8px 12px', borderRadius:4, cursor:'pointer' },
  deleteBtn: { marginTop:8, backgroundColor:'#f44336', color:'#fff', border:'none', padding:'8px 12px', borderRadius:4, cursor:'pointer' }
};

export default ProfileModal;
