const { Builder, By, Key, until } = require('selenium-webdriver');

(async function testWeddingApp() {
  let driver = await new Builder().forBrowser('chrome').build();

  try {
    console.log("🔵 Démarrage du test Selenium...");
    await driver.get('http://localhost:3000');

    // 1. Aller sur Inscription
    // Utilisation de guillemets doubles pour éviter le bug de l'apostrophe
    await driver.findElement(By.xpath("//span[contains(text(), \"Créer un compte\")]")).click();

    // 2. Remplir le formulaire
    const uniqueName = "SelUser" + Math.floor(Math.random() * 10000);
    const uniqueEmail = uniqueName + "@test.com";
    
    console.log(`📝 Tentative d'inscription avec : ${uniqueName} / ${uniqueEmail}`);

    await driver.findElement(By.css('input[placeholder="Nom"]')).sendKeys(uniqueName);
    await driver.findElement(By.css('input[placeholder="Email"]')).sendKeys(uniqueEmail);
    await driver.findElement(By.css('input[placeholder="Mot de passe"]')).sendKeys("123456");
    
    // Cliquer sur S'inscrire
    await driver.findElement(By.xpath("//button[contains(text(), \"S'inscrire\")]")).click();

    // 3. VÉRIFICATION INTELLIGENTE
    try {
        // On attend soit le succès, soit un message d'erreur
        // On augmente le délai à 10 secondes (10000ms)
        // On remplace 'text()' par '.' pour lire tout le contenu du H1
        await driver.wait(until.elementLocated(By.xpath(`//h1[contains(., 'Bienvenue ${uniqueName}')]`)), 10000);
        console.log("✅ Inscription et Connexion réussies !");
    } catch (e) {
        // Si on ne trouve pas "Bienvenue", on cherche une erreur rouge
        try {
            let errorMsg = await driver.findElement(By.css('p[style*="color: red"]')).getText();
            console.error("❌ ÉCHEC : Le site a affiché cette erreur :", errorMsg);
        } catch (err2) {
            console.error("❌ ÉCHEC : Délai dépassé et aucun message d'erreur trouvé.");
            // Affiche le HTML de la page pour comprendre où on est bloqué
            let body = await driver.findElement(By.tagName('body')).getText();
            console.log("--- Contenu de la page ---");
            console.log(body);
            console.log("--------------------------");
        }
        throw e; // On arrête le test ici
    }

    // 4. Ajouter une tâche (Suite du test...)
    await driver.findElement(By.css('input[placeholder="Titre"]')).sendKeys("Tâche Selenium");
    await driver.findElement(By.css('input[placeholder="Desc"]')).sendKeys("Test auto");
    await driver.findElement(By.xpath("//button[text()='+']")).click();

    await driver.wait(until.elementLocated(By.xpath("//strong[contains(text(),'Tâche Selenium')]")), 5000);
    console.log("✅ Ajout de tâche réussi !");

    // 5. Déconnexion
    await driver.findElement(By.xpath("//button[text()='Déconnexion']")).click();
    console.log("✅ Déconnexion réussie !");

  } catch (err) {
    console.error("\n💥 ERREUR FATALE DU TEST :");
    console.error(err.message);
  } finally {
    await driver.quit();
  }
})();