const { Builder, By, Key, until } = require('selenium-webdriver');

// Fonction utilitaire pour créer une pause (utile pour voir ce qui se passe)
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async function testAdvancedScenarios() {
  // --- INITIALISATION ---
  // On crée DEUX navigateurs distincts pour simuler deux personnes
  let driver1 = await new Builder().forBrowser('chrome').build();
  let driver2 = await new Builder().forBrowser('chrome').build();

  try {
    console.log("🔵 --- DÉBUT DES TESTS AVANCÉS ---");

    // ====================================================
    // SCÉNARIO 1 : Gestion des Erreurs (Email Doublon)
    // ====================================================
    console.log("\n🧪 SCÉNARIO 1 : Inscription avec email existant");
    
    // 1. On crée un utilisateur "Admin" sur le Navigateur 1
    await driver1.get('http://localhost:3000');
    const adminName = "Admin" + Math.floor(Math.random() * 1000);
    const adminEmail = adminName + "@test.com";
    
    // Inscription Admin
    await registerUser(driver1, adminName, adminEmail, "123456");
    console.log(`✅ Admin inscrit : ${adminEmail}`);

    // 2. On se déconnecte
    await driver1.findElement(By.xpath("//button[contains(., 'Déconnexion')]")).click();

    await sleep(1000);

   // 3. On essaie de se réinscrire avec le MÊME email
    // On ajoute 'false' pour dire : "N'attends pas le message de succès !"
    await registerUser(driver1, "Hacker", adminEmail, "123456", false);

    // 4. Vérification : On doit voir un message d'erreur rouge
    try {
        // On cherche un paragraphe rouge contenant "Erreur" ou le texte spécifique du backend
        // Note: Adaptez le texte "Email déjà pris" selon ce que renvoie votre serveur
        let errorMsg = await driver1.wait(until.elementLocated(By.xpath("//p[contains(., 'Email déjà pris') or contains(., 'Erreur')]")), 5000);
        console.log("✅ SUCCÈS : Le message d'erreur est bien apparu !");
    } catch (e) {
        console.error("❌ ÉCHEC : Le message d'erreur n'est pas apparu pour l'email doublon.");
        throw e;
    }

    // ====================================================
    // SCÉNARIO 2 : Validation (Tâche vide)
    // ====================================================
    console.log("\n🧪 SCÉNARIO 2 : Tentative d'ajout d'une tâche vide");
    
    // On se reconnecte avec le bon compte
    await loginUser(driver1, adminEmail, "123456");

    // 1. On compte les tâches actuelles
    let tasksBefore = await driver1.findElements(By.css('li'));
    
    // 2. On essaie d'ajouter sans titre
    await driver1.findElement(By.css('input[placeholder="Titre"]')).sendKeys(""); // Vide
    await driver1.findElement(By.xpath("//button[text()='+']")).click();
    
    // 3. Vérification : Le nombre de tâches ne doit pas avoir changé
    let tasksAfter = await driver1.findElements(By.css('li'));
    
    if (tasksBefore.length === tasksAfter.length) {
        console.log("✅ SUCCÈS : La tâche vide n'a pas été ajoutée.");
    } else {
        console.error("❌ ÉCHEC : Une tâche vide a été créée !");
    }

    // ====================================================
    // SCÉNARIO 3 : Collaboration Temps Réel (Le Grand Final)
    // ====================================================
    console.log("\n🧪 SCÉNARIO 3 : Collaboration Multi-Utilisateurs");

    // 1. Préparer le Partenaire sur le Navigateur 2
    await driver2.get('http://localhost:3000');
    const partnerName = "Partenaire" + Math.floor(Math.random() * 1000);
    const partnerEmail = partnerName + "@test.com";
    await registerUser(driver2, partnerName, partnerEmail, "123456");
    console.log(`✅ Partenaire inscrit sur Navigateur 2 : ${partnerEmail}`);

    // 2. L'Admin (Nav 1) invite le Partenaire
    console.log("➡️ Admin invite Partenaire...");
    await driver1.findElement(By.css('input[placeholder="Email..."]')).sendKeys(partnerEmail);
    // Sélectionner le rôle "Partenaire"
    await driver1.findElement(By.css('select')).sendKeys("Partenaire"); 
    await driver1.findElement(By.xpath("//button[text()='Inviter']")).click();
    
    // Gérer l'alerte "Invitation envoyée"
    await driver1.wait(until.alertIsPresent(), 5000);
    let alert = await driver1.switchTo().alert();
    await alert.accept();
    console.log("✅ Invitation acceptée par le système.");

    // 3. L'Admin crée une tâche pour le Partenaire
    console.log("➡️ Admin crée une tâche partagée...");
    await driver1.findElement(By.css('input[placeholder="Titre"]')).sendKeys("Acheter fleurs");
    await driver1.findElement(By.xpath("//button[text()='+']")).click();
    await sleep(3000);
    // 4. Le Partenaire (Nav 2) doit voir la tâche
    // Note: Comme on n'a pas de WebSockets, le partenaire doit rafraîchir
    console.log("🔄 Partenaire rafraîchit sa page...");
    await driver2.navigate().refresh();
    await sleep(1000);
    await loginUser(driver2, partnerEmail, "123456");
    await sleep(2000);
    try {
        await driver2.wait(until.elementLocated(By.xpath("//li[contains(., 'Acheter fleurs')]")), 10000);
        console.log("✅ SUCCÈS : Le partenaire voit la tâche créée par l'Admin !");
    } catch (e) {
        console.error("❌ ÉCHEC : La tâche n'est pas apparue chez le partenaire.");
        throw e;
    }

    // 5. Le Partenaire (Nav 2) complète la tâche
    console.log("➡️ Partenaire valide la tâche...");
    // On cherche le bouton '⬜' (To Do) associé à cette tâche et on clique
    // Astuce XPath : Trouver le LI qui contient le texte, puis le bouton dedans
    let taskItem = await driver2.findElement(By.xpath("//li[contains(., 'Acheter fleurs')]"));
    await taskItem.findElement(By.xpath(".//button[contains(., '⬜')]")).click();

    // 6. L'Admin (Nav 1) vérifie que c'est fait
    // 6. L'Admin (Nav 1) vérifie que c'est fait
    console.log("🔄 Admin rafraîchit pour voir le statut...");
    await driver1.navigate().refresh();
    await loginUser(driver1, adminEmail, "123456",10000);
    
    // CORRECTION : On attend que la tâche apparaisse (au lieu de la chercher tout de suite)
    let adminTask = await driver1.wait(
        until.elementLocated(By.xpath("//li[contains(., 'Acheter fleurs')]")), 
        10000 // On laisse 10s pour que la liste charge
    );

    let statusBtn = await adminTask.findElement(By.xpath(".//button"));
    let statusText = await statusBtn.getText();

    if (statusText.includes("✅")) {
        console.log("✅ SUCCÈS FINAL : L'Admin voit que la tâche est terminée !");
    } else {
        console.error("❌ ÉCHEC : Le statut n'est pas à jour chez l'Admin.");
    }

  } catch (err) {
    console.error("\n💥 ERREUR FATALE :", err);
  } finally {
    // Fermeture des deux navigateurs
    await driver1.quit();
    await driver2.quit();
  }
})();

// --- FONCTIONS D'AIDE ---

// On ajoute un 5ème paramètre : expectSuccess (vrai par défaut)
async function registerUser(driver, name, email, password, expectSuccess = true) {
    console.log(`   ... Tentative inscription pour ${name}`);

    // 1. Est-ce que le champ "Nom" est déjà là ?
    let isRegisterMode = false;
    try {
        await driver.wait(until.elementLocated(By.css('input[placeholder="Nom"]')), 1000);
        isRegisterMode = true;
    } catch (e) { isRegisterMode = false; }

    // 2. Clic sur le lien si besoin
    if (!isRegisterMode) {
        try {
            let createLink = await driver.wait(
                until.elementLocated(By.xpath("//span[contains(., 'Créer un compte')]")), 
                5000
            );
            await driver.executeScript("arguments[0].click();", createLink);
        } catch (e) {}
    }

    // 3. Remplissage
    try {
        let nameInput = await driver.wait(until.elementLocated(By.css('input[placeholder="Nom"]')), 10000);
        await driver.wait(until.elementIsVisible(nameInput), 5000);

        await nameInput.sendKeys(name);
        await driver.findElement(By.css('input[placeholder="Email"]')).sendKeys(email);
        await driver.findElement(By.css('input[placeholder="Mot de passe"]')).sendKeys(password);
        
        let submitBtn = await driver.findElement(By.xpath("//button[contains(., \"S'inscrire\")]"));
        await driver.executeScript("arguments[0].click();", submitBtn);
        
        // --- LA MODIFICATION EST ICI ---
        if (expectSuccess) {
            // Si on attend un succès, on attend "Bienvenue"
            await sleep(1000);
            await driver.wait(until.elementLocated(By.xpath(`//h1[contains(., 'Bienvenue ${name}')]`)), 10000);
        } else {
            // Si on attend une erreur, on attend juste un peu que le serveur réponde
            console.log("   (On n'attend pas 'Bienvenue' car on s'attend à une erreur)");
            await driver.sleep(2000); 
        }

    } catch (err) {
        console.error("❌ Échec dans registerUser.");
        throw err;
    }
}

async function loginUser(driver, email, password) {
    console.log(`   ... Tentative de connexion pour ${email}`);

    // Si on est sur l'écran d'inscription, passer au login
    try {
        let loginLink = await driver.findElement(By.xpath("//span[contains(., \"J'ai déjà un compte\")]"));
        if(await loginLink.isDisplayed()) await loginLink.click();
    } catch(e) {}

    // 1. Gérer l'EMAIL (Vider + Écrire)
    await sleep(3000);
    let emailInput = await driver.findElement(By.css('input[placeholder="Email"]'),10000);
    // Astuce : Parfois .clear() ne suffit pas sur React, on envoie CTRL+A puis DELETE
    await emailInput.sendKeys(Key.CONTROL, "a"); // Sélectionner tout
    await emailInput.sendKeys(Key.DELETE);       // Effacer
    await emailInput.sendKeys(email);            // Écrire le bon email

    // 2. Gérer le MOT DE PASSE (Vider + Écrire)
    let passInput = await driver.findElement(By.css('input[placeholder="Mot de passe"]'));
    await passInput.sendKeys(Key.CONTROL, "a");
    await passInput.sendKeys(Key.DELETE);
    await passInput.sendKeys(password);

    // 3. Valider
    let loginBtn = await driver.findElement(By.xpath("//button[contains(., 'Se Connecter')]"));
    await driver.executeScript("arguments[0].click();", loginBtn); // Clic forcé par sécurité
    
    // 4. Attendre le succès
    await driver.wait(until.elementLocated(By.xpath("//h1[contains(., 'Bienvenue')]")), 5000);
}