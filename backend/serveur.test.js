const request = require('supertest');
const API_URL = 'http://localhost:5001'; // Assurez-vous que le serveur tourne sur ce port !

// On augmente le délai à 30 secondes pour la DB Cloud
jest.setTimeout(30000);

describe('Scénarios Système de Mariage', () => {
    let adminTokenUser; 
    let collabUser;

    // SCÉNARIO 1 : Inscription
    it('Doit inscrire un nouvel utilisateur (Admin)', async () => {
        console.log("TEST 1: Tentative d'inscription...");
        const uniqueEmail = `test_${Date.now()}@auto.com`;
        
        const res = await request(API_URL)
            .post('/register')
            .send({
                name: 'Auto Tester',
                email: uniqueEmail,
                password: 'password123'
            });
        
        // Debug: Si ça échoue, on veut voir pourquoi
        if (res.statusCode !== 200) {
            console.error("❌ Erreur Inscription:", res.body);
        }

        expect(res.statusCode).toEqual(200);
        expect(res.body.user).toHaveProperty('id');
        expect(res.body.user.role).toEqual('admin');
        
        adminTokenUser = res.body.user; 
        console.log("✅ TEST 1 OK : User ID", adminTokenUser.id);
    });

    // SCÉNARIO 2 : Connexion
    it('Doit connecter l’utilisateur créé', async () => {
        if (!adminTokenUser) throw new Error("⚠️ Test annulé car l'inscription a échoué");

        const res = await request(API_URL)
            .post('/login')
            .send({
                email: adminTokenUser.email,
                password: 'password123'
            });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.user.email).toEqual(adminTokenUser.email);
    });

    // SCÉNARIO 3 : Création de Tâche
    it('Doit créer une tâche pour ce mariage', async () => {
        if (!adminTokenUser) throw new Error("⚠️ Test annulé");

        const res = await request(API_URL)
            .post('/tasks')
            .send({
                user_id: adminTokenUser.id,
                title: 'Tâche Automatisée',
                description: 'Créée par Jest'
            });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toEqual('Tâche Automatisée');
    });

    // SCÉNARIO 4 : Invitation Partenaire
    it('Doit pouvoir inviter un collaborateur', async () => {
        if (!adminTokenUser) throw new Error("⚠️ Test annulé");

        // 1. Créer le collaborateur (SDF au début)
        const emailCollab = `collab_${Date.now()}@auto.com`;
        await request(API_URL).post('/register').send({ name: 'Collab', email: emailCollab, password: '123' });
        
        // 2. L'inviter
        const res = await request(API_URL)
            .post('/invite')
            .send({
                email: emailCollab,
                currentUserId: adminTokenUser.id,
                role: 'collaborator'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toContain('invité en tant que collaborator');
    });

    // SCÉNARIO 5 : Suppression Tâche
    it('Doit supprimer la tâche', async () => {
        if (!adminTokenUser) throw new Error("⚠️ Test annulé");

        // 1. Récupérer les tâches pour avoir un ID valide
        const tasksRes = await request(API_URL).get(`/tasks/${adminTokenUser.id}`);
        // Vérifier qu'on a bien des tâches
        expect(tasksRes.body.length).toBeGreaterThan(0);
        
        const taskId = tasksRes.body[0].id;

        // 2. Supprimer
        const delRes = await request(API_URL).delete(`/tasks/${taskId}`);
        expect(delRes.statusCode).toEqual(200);
    });
});