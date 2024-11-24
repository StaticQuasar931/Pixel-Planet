// Utility function to format numbers
function formatNumber(num) {
    if (num >= 1e9) {
        return (num / 1e9).toFixed(1) + 'B';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(1) + 'M';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(1) + 'K';
    } else {
        return num.toFixed(0);
    }
}

// Function to show notifications with queuing to prevent overlap
let notificationQueue = [];
let isNotificationVisible = false;
const MAX_NOTIFICATION_QUEUE = 10;

function showNotification(messageKey, params = []) {
    if (notificationQueue.length >= MAX_NOTIFICATION_QUEUE) {
        notificationQueue.shift(); // Remove the oldest notification
    }
    notificationQueue.push({ messageKey, params });
    if (!isNotificationVisible) {
        displayNextNotification();
    }
}

function displayNextNotification() {
    if (notificationQueue.length === 0) {
        isNotificationVisible = false;
        return;
    }
    isNotificationVisible = true;
    const { messageKey, params } = notificationQueue.shift();
    const notification = document.getElementById('notification');
    let message = notificationMessages[currentLanguage][messageKey] || messageKey;

    // Replace placeholders with actual parameters
    params.forEach((param, index) => {
        message = message.replace(`{${index}}`, param);
    });

    notification.innerText = message;
    notification.style.display = 'block';
    notification.style.opacity = '1';
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.style.display = 'none';
            isNotificationVisible = false;
            displayNextNotification();
        }, 500);
    }, 3000);
}

// Function to update social sharing URLs
function updateSocialSharing() {
    const currentPlayer = {
        name: sanitizeInput(localStorage.getItem('PixelPlanetPlayerName')) || 'Player',
        totalResources: calculateTotalResources()
    };
    const shareText = encodeURIComponent(`I'm playing Pixel Planet! My total resources: ${formatNumber(currentPlayer.totalResources)}. Check it out: https://sites.google.com/view/staticquasar931/static-gmes/pixel-planet`);
    const twitterURL = `https://twitter.com/intent/tweet?text=${shareText}`;
    const facebookURL = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://sites.google.com/view/staticquasar931/static-gmes/pixel-planet')}`;
    const redditURL = `https://www.reddit.com/submit?url=${encodeURIComponent('https://sites.google.com/view/staticquasar931/static-gmes/pixel-planet')}&title=${shareText}`;

    // Assign secure attributes
    document.getElementById('share-twitter').href = twitterURL;
    document.getElementById('share-facebook').href = facebookURL;
    document.getElementById('share-reddit').href = redditURL;

    document.getElementById('share-twitter-game').href = twitterURL;
    document.getElementById('share-facebook-game').href = facebookURL;
    document.getElementById('share-reddit-game').href = redditURL;
}

// Leaderboard Functions
function showLeaderboard() {
    updateLeaderboard();
    openModal('leaderboard');
}

function closeLeaderboard() {
    closeModal('leaderboard');
}

function updateLeaderboard() {
    const leaderboardBody = document.querySelector('#leaderboard-table tbody');
    leaderboardBody.innerHTML = ''; // Clear existing entries

    // Retrieve leaderboard data from localStorage
    let leaderboard = JSON.parse(localStorage.getItem('PixelPlanetLeaderboard')) || [];

    // Current player data
    const currentPlayer = {
        name: sanitizeInput(localStorage.getItem('PixelPlanetPlayerName')) || 'Player',
        totalResources: calculateTotalResources()
    };

    // Add current player to leaderboard if not already present
    if (!leaderboard.some(player => player.name === currentPlayer.name)) {
        leaderboard.push(currentPlayer);
    } else {
        // Update totalResources if player already exists
        leaderboard = leaderboard.map(player => {
            if (player.name === currentPlayer.name) {
                return currentPlayer;
            }
            return player;
        });
    }

    // Sort leaderboard by totalResources descending
    leaderboard.sort((a, b) => b.totalResources - a.totalResources);

    // Keep top 10
    leaderboard = leaderboard.slice(0, 10);

    // Save updated leaderboard
    localStorage.setItem('PixelPlanetLeaderboard', JSON.stringify(leaderboard));

    // Populate leaderboard table
    leaderboard.forEach((player, index) => {
        const row = document.createElement('tr');

        const rankCell = document.createElement('td');
        rankCell.innerText = index + 1;
        row.appendChild(rankCell);

        const nameCell = document.createElement('td');
        nameCell.innerText = player.name;
        row.appendChild(nameCell);

        const resourcesCell = document.createElement('td');
        resourcesCell.innerText = formatNumber(player.totalResources);
        row.appendChild(resourcesCell);

        leaderboardBody.appendChild(row);
    });
}

// Notification Messages
const notificationMessages = {
    en: {
        "ResourceGenerated": "🔄 Resources generated!",
        "AchievementUnlocked": "🏆 Achievement Unlocked: {0} - Reward: {1}",
        "QuestCompleted": "🎯 Quest Completed: {0} - Reward: {1}",
        "GameSaved": "💾 Game saved!",
        "SaveError": "⚠️ Error saving game.",
        "LoadError": "⚠️ Error loading game. Starting a new game.",
        "UpgradePurchased": "🔧 Upgrade Purchased: {0} - Level {1}",
        "UpgradePurchaseFailed": "❌ Not enough Water to purchase this upgrade!",
        "TerraformSuccess": "🌍 Planet terraformed! New biome unlocked.",
        "TerraformFailed": "❌ Not enough Water to terraform the planet!",
        "ShareReward": "🎁 Thanks for sharing! Energy +10.",
        "SolarFlareImpact": "⚡ Solar Flare! Energy production decreased.",
        "SolarFlareRestored": "⚡ Energy production restored after Solar Flare.",
        "MeteorShowerImpact": "⛏ Meteor Shower! Mineral production increased.",
        "MeteorShowerNormalized": "⛏ Mineral production normalized after Meteor Shower.",
        "EventTriggered": "🎉 Event: {0} - {1}",
        "NewGameStarted": "🚀 New game started! Welcome to Pixel Planet.",
        "NoSavedGame": "❌ No saved game found.",
        "ThemeChanged": "🖌️ Theme changed to {0}.",
        "VersionMismatch": "🔄 Game version mismatch. Starting a new game.",
        "GameReset": "🗑️ Game has been reset.",
        "OfflineResources": "⏰ You were offline for {0}. Resources have been updated.",
        "InsufficientResources": "❌ Not enough {0} to purchase this upgrade!",
        "LanguageUnsupported": "⚠️ The selected language '{0}' is unsupported. Defaulting to English.",
        "InvalidPlayerName": "❌ Invalid name entered. Using default name 'Player'.",
        "AllBiomesUnlocked": "🌟 Congratulations! You've unlocked all available biomes!",
        "AlienEncounterReward": "👽 Alien technology received! Energy +100.",
        "ResourcePlundered": "🚨 Pirates plundered your resources! Water -50, Minerals -30.",
        "FeedbackSubmitted": "✅ Thank you for your feedback!",
        "SaveLimitExceeded": "⚠️ Save limit exceeded. Could not save the game.",
        "OK": "OK",
        "Yes": "Yes",
        "No": "No",
        "PlayerNameSet": "✅ Player name set to {0}.",
        "DuplicatePlayerName": "❌ This name is already taken. Please choose another name.",
        "EmptyFeedback": "❌ Feedback cannot be empty.",
        "FeedbackTooLong": "❌ Feedback exceeds the maximum allowed length.",
        "FeedbackSubmissionFailed": "❌ Failed to submit feedback. Please try again later.",
        "StoryMilestone": "📖 Story Milestone Achieved!",
        "GameLoaded": "✅ Game loaded successfully!",
    },
    es: {
        "ResourceGenerated": "🔄 ¡Recursos generados!",
        "AchievementUnlocked": "🏆 Logro Desbloqueado: {0} - Recompensa: {1}",
        "QuestCompleted": "🎯 Misión Completada: {0} - Recompensa: {1}",
        "GameSaved": "💾 ¡Juego guardado!",
        "SaveError": "⚠️ Error al guardar el juego.",
        "LoadError": "⚠️ Error al cargar el juego. Iniciando un nuevo juego.",
        "UpgradePurchased": "🔧 Actualización Comprada: {0} - Nivel {1}",
        "UpgradePurchaseFailed": "❌ ¡No tienes suficiente Agua para comprar esta actualización!",
        "TerraformSuccess": "🌍 ¡Planeta terraformado! Nuevo bioma desbloqueado.",
        "TerraformFailed": "❌ ¡No tienes suficiente Agua para terraformar el planeta!",
        "ShareReward": "🎁 ¡Gracias por compartir! Energía +10.",
        "SolarFlareImpact": "⚡ ¡Explosión Solar! La producción de energía disminuyó.",
        "SolarFlareRestored": "⚡ La producción de energía se restauró después de la Explosión Solar.",
        "MeteorShowerImpact": "⛏ ¡Lluvia de Meteoros! La producción de minerales aumentó.",
        "MeteorShowerNormalized": "⛏ La producción de minerales se normalizó después de la Lluvia de Meteoros.",
        "EventTriggered": "🎉 Evento: {0} - {1}",
        "NewGameStarted": "🚀 ¡Nuevo juego iniciado! Bienvenido a Pixel Planet.",
        "NoSavedGame": "❌ No se encontró un juego guardado.",
        "ThemeChanged": "🖌️ Tema cambiado a {0}.",
        "VersionMismatch": "🔄 Incompatibilidad de versión del juego. Iniciando un nuevo juego.",
        "GameReset": "🗑️ El juego ha sido reiniciado.",
        "OfflineResources": "⏰ Estuviste desconectado por {0}. Los recursos se han actualizado.",
        "InsufficientResources": "❌ ¡No tienes suficiente {0} para comprar esta actualización!",
        "LanguageUnsupported": "⚠️ El idioma seleccionado '{0}' no está soportado. Se usa Inglés por defecto.",
        "InvalidPlayerName": "❌ Nombre inválido ingresado. Usando el nombre predeterminado 'Player'.",
        "AllBiomesUnlocked": "🌟 ¡Felicidades! ¡Has desbloqueado todos los biomas disponibles!",
        "AlienEncounterReward": "👽 ¡Tecnología alienígena recibida! Energía +100.",
        "ResourcePlundered": "🚨 ¡Piratas saquearon tus recursos! Agua -50, Minerales -30.",
        "FeedbackSubmitted": "✅ ¡Gracias por tus comentarios!",
        "SaveLimitExceeded": "⚠️ Límite de guardado excedido. No se pudo guardar el juego.",
        "OK": "OK",
        "Yes": "Sí",
        "No": "No",
        "PlayerNameSet": "✅ Nombre de jugador establecido a {0}.",
        "DuplicatePlayerName": "❌ Este nombre ya está en uso. Por favor, elige otro nombre.",
        "EmptyFeedback": "❌ El feedback no puede estar vacío.",
        "FeedbackTooLong": "❌ El feedback excede la longitud máxima permitida.",
        "FeedbackSubmissionFailed": "❌ No se pudo enviar el feedback. Por favor, inténtalo de nuevo más tarde.",
        "StoryMilestone": "📖 ¡Hito de la Historia Alcanzado!",
        "GameLoaded": "✅ ¡Juego cargado con éxito!",
    }
    // Add more languages as needed
};

let currentLanguage = 'en';

// Function to change language
function changeLanguage(lang) {
    if (!notificationMessages.hasOwnProperty(lang)) {
        showNotification("LanguageUnsupported", [lang]);
        lang = 'en';
    }
    currentLanguage = lang;
    localStorage.setItem('PixelPlanetLanguage', lang);
    applyTranslations();
    updateDynamicContentLanguage();
    updateSocialSharing();
}

// Function to apply translations
function applyTranslations() {
    // Translate button texts and labels
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        const ariaLabel = button.getAttribute('aria-label');
        if (ariaLabel && notificationMessages[currentLanguage][ariaLabel]) {
            button.innerText = notificationMessages[currentLanguage][ariaLabel];
        }
    });

    // Translate labels
    const labels = document.querySelectorAll('label');
    labels.forEach(label => {
        const text = label.innerText.replace(':', '').trim();
        if (notificationMessages[currentLanguage][text]) {
            label.innerText = `${notificationMessages[currentLanguage][text]}:`;
        }
    });

    // Translate main menu title
    const mainMenuTitle = document.querySelector('#main-menu h1');
    if (notificationMessages[currentLanguage]["Pixel Planet"]) {
        mainMenuTitle.innerText = `🌍 ${notificationMessages[currentLanguage]["Pixel Planet"]}`;
    }

    // Translate tutorial modal title and content
    const tutorialTitle = document.getElementById('tutorial-modal-title');
    if (notificationMessages[currentLanguage]["Pixel Planet Tutorial"]) {
        tutorialTitle.innerText = `📖 ${notificationMessages[currentLanguage]["Pixel Planet Tutorial"]}`;
    }

    // Translate feedback modal title
    const feedbackTitle = document.getElementById('feedback-modal-title');
    if (notificationMessages[currentLanguage]["Feedback"]) {
        feedbackTitle.innerText = `📝 ${notificationMessages[currentLanguage]["Feedback"]}`;
    }

    // Translate other static texts as needed
}

// Function to update dynamic content language
function updateDynamicContentLanguage() {
    // Update modals if they are open
    const openModals = document.querySelectorAll('.modal');
    openModals.forEach(modal => {
        const messagePara = modal.querySelector('p');
        if (messagePara && messagePara.dataset.translationKey) {
            const key = messagePara.dataset.translationKey;
            messagePara.innerText = notificationMessages[currentLanguage][key] || key;
        }

        const buttons = modal.querySelectorAll('button');
        buttons.forEach(button => {
            const ariaLabel = button.getAttribute('aria-label');
            if (ariaLabel && notificationMessages[currentLanguage][ariaLabel]) {
                button.innerText = notificationMessages[currentLanguage][ariaLabel];
            }
        });
    });
}

// Load Language on Init
function loadLanguage() {
    const savedLanguage = localStorage.getItem('PixelPlanetLanguage') || 'en';
    currentLanguage = savedLanguage;
    document.getElementById('language-select').value = savedLanguage;
    applyTranslations();
}

// Function to sanitize inputs
function sanitizeInput(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Game State
let resources = {
    water: 0,
    minerals: 0,
    plants: 0,
    energy: 0
};

let storage = {
    water: 1000,
    minerals: 500,
    plants: 300,
    energy: 200
};

let biomes = [];

let upgrades = {
    // Existing Upgrades
    waterBoost: {
        name: "🔧 Improve Water Collection",
        description: "+10 Water per second",
        baseCost: 100,
        cost: 100,
        effect: (level) => { waterPerSecond = Math.min(waterPerSecond + 10, MAX_RESOURCE_RATE.waterPerSecond); },
        level: 0,
        category: "Resource Boost"
    },
    mineralsBoost: {
        name: "🔧 Improve Mineral Extraction",
        description: "+5 Minerals per second",
        baseCost: 200,
        cost: 200,
        effect: (level) => { mineralsPerSecond = Math.min(mineralsPerSecond + 5, MAX_RESOURCE_RATE.mineralsPerSecond); },
        level: 0,
        category: "Resource Boost"
    },
    plantBoost: {
        name: "🔧 Enhance Plant Growth",
        description: "+3 Plants per second",
        baseCost: 150,
        cost: 150,
        effect: (level) => { plantsPerSecond = Math.min(plantsPerSecond + 3, MAX_RESOURCE_RATE.plantsPerSecond); },
        level: 0,
        category: "Resource Boost"
    },
    energyBoost: {
        name: "🔧 Boost Energy Generation",
        description: "+2 Energy per second",
        baseCost: 120,
        cost: 120,
        effect: (level) => { energyPerSecond = Math.min(energyPerSecond + 2, MAX_RESOURCE_RATE.energyPerSecond); },
        level: 0,
        category: "Resource Boost"
    },
    waterEfficiency: {
        name: "⚙️ Water Efficiency",
        description: "Reduce Water consumption by 10%",
        baseCost: 300,
        cost: 300,
        effect: (level) => { 
            waterConsumption = Math.max(waterConsumption * 0.9, 0.1); 
        },
        level: 0,
        category: "Efficiency Improvement"
    },
    mineralEfficiency: {
        name: "⚙️ Mineral Efficiency",
        description: "Reduce Mineral consumption by 10%",
        baseCost: 350,
        cost: 350,
        effect: (level) => { 
            mineralConsumption = Math.max(mineralConsumption * 0.9, 0.1); 
        },
        level: 0,
        category: "Efficiency Improvement"
    },
    waterStorage: {
        name: "🏗️ Expand Water Storage",
        description: "Increase Water storage capacity by 500",
        baseCost: 300,
        cost: 300,
        effect: (level) => { storage.water += 500; },
        level: 0,
        category: "Storage Upgrade"
    },
    mineralsStorage: {
        name: "🏗️ Expand Minerals Storage",
        description: "Increase Minerals storage capacity by 250",
        baseCost: 350,
        cost: 350,
        effect: (level) => { storage.minerals += 250; },
        level: 0,
        category: "Storage Upgrade"
    },
    plantsStorage: {
        name: "🏗️ Expand Plants Storage",
        description: "Increase Plants storage capacity by 150",
        baseCost: 250,
        cost: 250,
        effect: (level) => { storage.plants += 150; },
        level: 0,
        category: "Storage Upgrade"
    },
    energyStorage: {
        name: "🏗️ Expand Energy Storage",
        description: "Increase Energy storage capacity by 100",
        baseCost: 200,
        cost: 200,
        effect: (level) => { storage.energy += 100; },
        level: 0,
        category: "Storage Upgrade"
    },
    // New Upgrades
    autoWater: {
        name: "🤖 Automate Water Collection",
        description: "Automatically collect 1 Water per second",
        baseCost: 500,
        cost: 500,
        effect: (level) => { waterPerSecond = Math.min(waterPerSecond + 1 * level, MAX_RESOURCE_RATE.waterPerSecond); },
        level: 0,
        category: "Automation"
    },
    autoMinerals: {
        name: "🤖 Automate Mineral Extraction",
        description: "Automatically collect 0.5 Minerals per second",
        baseCost: 600,
        cost: 600,
        effect: (level) => { mineralsPerSecond = Math.min(mineralsPerSecond + 0.5 * level, MAX_RESOURCE_RATE.mineralsPerSecond); },
        level: 0,
        category: "Automation"
    },
    autoPlants: {
        name: "🤖 Automate Plant Growth",
        description: "Automatically collect 0.3 Plants per second",
        baseCost: 550,
        cost: 550,
        effect: (level) => { plantsPerSecond = Math.min(plantsPerSecond + 0.3 * level, MAX_RESOURCE_RATE.plantsPerSecond); },
        level: 0,
        category: "Automation"
    },
    autoEnergy: {
        name: "🤖 Automate Energy Generation",
        description: "Automatically collect 0.2 Energy per second",
        baseCost: 650,
        cost: 650,
        effect: (level) => { energyPerSecond = Math.min(energyPerSecond + 0.2 * level, MAX_RESOURCE_RATE.energyPerSecond); },
        level: 0,
        category: "Automation"
    }
    // Add more upgrades as needed
};

let waterPerSecond = 1;
let mineralsPerSecond = 0;
let plantsPerSecond = 0;
let energyPerSecond = 0;

let waterConsumption = 1; // Example usage
let mineralConsumption = 1; // Example usage

let resourceGenerationInterval;
let autosaveInterval;
let eventInterval;
let resourceConsumptionInterval;

let achievements = {
    firstWater: {
        name: "First Water",
        description: "Collect 100 Water",
        condition: () => resources.water >= 100,
        unlocked: false,
        reward: () => { resources.water = Math.min(resources.water + 50, storage.water, MAX_RESOURCES.water); },
        rewardDescription: "Water +50",
    },
    firstMineral: {
        name: "First Mineral",
        description: "Collect 50 Minerals",
        condition: () => resources.minerals >= 50,
        unlocked: false,
        reward: () => { resources.minerals = Math.min(resources.minerals + 25, storage.minerals, MAX_RESOURCES.minerals); },
        rewardDescription: "Minerals +25",
    },
    reach1000Water: {
        name: "Water Master",
        description: "Collect 1,000 Water",
        condition: () => resources.water >= 1000,
        unlocked: false,
        reward: () => { resources.water = Math.min(resources.water + 200, storage.water, MAX_RESOURCES.water); },
        rewardDescription: "Water +200",
    },
    reach500Minerals: {
        name: "Mineral Tycoon",
        description: "Collect 500 Minerals",
        condition: () => resources.minerals >= 500,
        unlocked: false,
        reward: () => { resources.energy = Math.min(resources.energy + 50, storage.energy, MAX_RESOURCES.energy); },
        rewardDescription: "Energy +50",
    },
    // Add more achievements as needed
};

let quests = {
    dailyHarvest: {
        name: "Daily Harvest",
        description: "Collect 50 Plants today",
        condition: () => resources.plants >= 50,
        reward: () => { resources.water = Math.min(resources.water + 100, storage.water, MAX_RESOURCES.water); },
        rewardDescription: "Water +100",
        completed: false,
    },
    mineralMastery: {
        name: "Mineral Mastery",
        description: "Collect 300 Minerals this week",
        condition: () => resources.minerals >= 300,
        reward: () => { resources.energy = Math.min(resources.energy + 50, storage.energy, MAX_RESOURCES.energy); },
        rewardDescription: "Energy +50",
        completed: false,
    },
    weeklyEnergyBoost: {
        name: "Weekly Energy Boost",
        description: "Collect 500 Energy this week",
        condition: () => resources.energy >= 500,
        reward: () => { energyPerSecond = Math.min(energyPerSecond + 5, MAX_RESOURCE_RATE.energyPerSecond); },
        rewardDescription: "Energy Production +5/sec",
        completed: false,
    },
    dailyMineralDrive: {
        name: "Daily Mineral Drive",
        description: "Collect 100 Minerals today",
        condition: () => resources.minerals >= 100,
        reward: () => { mineralsPerSecond = Math.min(mineralsPerSecond + 2, MAX_RESOURCE_RATE.mineralsPerSecond); },
        rewardDescription: "Minerals Production +2/sec",
        completed: false,
    },
    // Add more quests as needed
};

let storyMilestones = {
    unlockFirstBiome: {
        condition: () => biomes.length >= 1,
        text: "🌟 You've unlocked your first biome! Explore and harness its resources to expand your planet.",
        unlocked: false
    },
    reach500Water: {
        condition: () => resources.water >= 500,
        text: "💧 With ample water, your planet begins to flourish. New possibilities emerge!",
        unlocked: false
    },
    reach1000Energy: {
        condition: () => resources.energy >= 1000,
        text: "⚡ Energy is abundant! Your planet is now powering advanced technologies.",
        unlocked: false
    },
    // Add more story milestones as needed
};

// Maximum Resource Rates
const MAX_RESOURCE_RATE = {
    waterPerSecond: 100,
    mineralsPerSecond: 50,
    plantsPerSecond: 30,
    energyPerSecond: 20
};

// Maximum Resources
const MAX_RESOURCES = {
    water: 1000000,
    minerals: 500000,
    plants: 300000,
    energy: 200000
};

// Events
const eventTypes = [
    {
        name: "Resource Boom",
        description: "A sudden boom increases your Water and Minerals!",
        effect: () => {
            safeAddResource('water', 50);
            safeAddResource('minerals', 25);
        },
        duration: 0 // Permanent effect
    },
    {
        name: "Drought",
        description: "A drought decreases your Water supply!",
        effect: () => {
            safeSubtractResource('water', 30);
            updateResourcesUI();
            checkAchievements();
            checkQuests();
        },
        duration: 0
    },
    {
        name: "Mineral Surge",
        description: "Mineral Surge! You received an extra 40 Minerals!",
        effect: () => {
            safeAddResource('minerals', 40);
        },
        duration: 0
    },
    {
        name: "Plant Overgrowth",
        description: "Plant Overgrowth! You received an extra 20 Plants!",
        effect: () => {
            safeAddResource('plants', 20);
        },
        duration: 0
    },
    {
        name: "Energy Boost",
        description: "Energy Boost! You received an extra 10 Energy!",
        effect: () => {
            safeAddResource('energy', 10);
        },
        duration: 0
    },
    {
        name: "Solar Flare",
        description: "A solar flare disrupts energy generation temporarily.",
        effect: () => {
            energyPerSecond = Math.max(0, energyPerSecond - 2);
            showNotification("SolarFlareImpact");
            updateResourcesUI();
            setTimeout(() => {
                energyPerSecond = Math.min(energyPerSecond + 2, MAX_RESOURCE_RATE.energyPerSecond);
                showNotification("SolarFlareRestored");
                updateResourcesUI();
            }, 300000); // Restore after 5 minutes
        },
        duration: 300000 // 5 minutes
    },
    {
        name: "Meteor Shower",
        description: "Meteor shower increases mineral collection.",
        effect: () => {
            mineralsPerSecond = Math.min(mineralsPerSecond + 3, MAX_RESOURCE_RATE.mineralsPerSecond);
            showNotification("MeteorShowerImpact");
            updateResourcesUI();
            setTimeout(() => {
                mineralsPerSecond = Math.max(mineralsPerSecond - 3, 0);
                showNotification("MeteorShowerNormalized");
                updateResourcesUI();
            }, 300000); // Normalize after 5 minutes
        },
        duration: 300000
    },
    {
        name: "Alien Encounter",
        description: "Aliens visit your planet, offering advanced technology for free.",
        effect: () => {
            resources.energy = Math.min(resources.energy + 100, storage.energy, MAX_RESOURCES.energy);
            showNotification("AlienEncounterReward");
        },
        duration: 0
    },
    {
        name: "Resource Plunder",
        description: "Pirates attack your planet, stealing some resources.",
        effect: () => {
            safeSubtractResource('water', 50);
            safeSubtractResource('minerals', 30);
            showNotification("ResourcePlundered");
            updateResourcesUI();
            checkAchievements();
            checkQuests();
        },
        duration: 0
    }
    // Add more unique events as desired
];

// Quests Completion and Reset
function checkQuests() {
    for (let key in quests) {
        const quest = quests[key];
        if (!quest.completed && quest.condition()) {
            quest.completed = true;
            if (quest.reward) quest.reward();
            showNotification("QuestCompleted", [quest.name, quest.rewardDescription]);
            generateQuestsUI();
            trackGAEvent('quest_completed', {
                'event_category': 'Quest',
                'event_label': quest.name,
                'value': quest.rewardDescription
            });
            debouncedSaveGame();
        }
    }
}

function resetQuests() {
    for (let key in quests) {
        quests[key].completed = false;
    }
    generateQuestsUI();
}

// Save Game
function saveGame() {
    if (isSaving) return;
    isSaving = true;
    try {
        const saveData = {
            version: "0.6", // Updated version
            resources,
            storage,
            biomes,
            upgrades,
            waterPerSecond,
            mineralsPerSecond,
            plantsPerSecond,
            energyPerSecond,
            achievements,
            quests,
            storyMilestones,
            lastUpdateTime: Date.now(),
            activeEvents
        };
        localStorage.setItem('PixelPlanetSave_Temp', JSON.stringify(saveData));
        localStorage.setItem('PixelPlanetSave', JSON.stringify(saveData));
        localStorage.removeItem('PixelPlanetSave_Temp');
        showNotification("GameSaved");
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            showNotification("SaveLimitExceeded");
        } else {
            showNotification("SaveError");
        }
        console.error("Error saving game:", error);
    } finally {
        isSaving = false;
    }
}

// Debounce Save Function to Prevent Rapid Saves
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    }
}

const debouncedSaveGame = debounce(saveGame, 500); // 500ms delay
let isSaving = false;

// Load from Save Data
function loadFromSave(gameState) {
    try {
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('game').style.display = 'block';
        resources = gameState.resources;
        storage = gameState.storage;
        biomes = gameState.biomes;
        upgrades = gameState.upgrades;
        waterPerSecond = gameState.waterPerSecond;
        mineralsPerSecond = gameState.mineralsPerSecond;
        plantsPerSecond = gameState.plantsPerSecond;
        energyPerSecond = gameState.energyPerSecond;
        achievements = gameState.achievements;
        quests = gameState.quests;
        storyMilestones = gameState.storyMilestones;
        activeEvents = gameState.activeEvents || [];
        updateResourcesUI();
        generateUpgradesUI();
        generateAchievementsUI();
        generateQuestsUI();
        displayBiomes();
        handleOfflineResourceGeneration(gameState.lastUpdateTime);
        startResourceGeneration();
        startResourceConsumption();
        startAutosave();
        startEventSystem();
        scheduleQuestReset();
        checkAchievements();
        checkQuests();
        generateStoryUI();
        loadTheme();
        updateSocialSharing();
        showNotification("GameLoaded");
        // Show Continue button only if there is a saved game
        document.getElementById('continue-button').style.display = 'none';
        // Update version number display
        document.getElementById('version').innerText = `Version ${gameState.version}`;
    } catch (error) {
        console.error("Error loading game:", error);
        showNotification("LoadError");
        startNewGame(false);
    }
}

// Start New Game
function startNewGame(confirmStart=true) {
    if (confirmStart) {
        confirmAction("ConfirmNewGame", () => {
            initializeNewGame();
        });
    } else {
        initializeNewGame();
    }
}

function initializeNewGame() {
    clearAllIntervals();
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    resources = { water: 0, minerals: 0, plants: 0, energy: 0 };
    storage = { water: 1000, minerals: 500, plants: 300, energy: 200 };
    biomes = [];
    resetUpgrades();
    resetAchievements();
    resetQuests();
    waterPerSecond = 1;
    mineralsPerSecond = 0;
    plantsPerSecond = 0;
    energyPerSecond = 0;
    waterConsumption = 1;
    mineralConsumption = 1;
    updateResourcesUI();
    generateUpgradesUI();
    generateAchievementsUI();
    generateQuestsUI();
    displayBiomes();
    generateStoryUI();
    startResourceGeneration();
    startResourceConsumption();
    startAutosave();
    startEventSystem();
    scheduleQuestReset();
    updateSocialSharing();
    loadTheme();
    showNotification("NewGameStarted");
    debouncedSaveGame();
}

// Continue Game
function continueGame() {
    const savedGame = localStorage.getItem('PixelPlanetSave');
    if (savedGame) {
        const parsedSave = JSON.parse(savedGame);
        loadFromSave(parsedSave);
    } else {
        showNotification("NoSavedGame");
    }
}

// Generate Resources Manually
function generateResources() {
    safeAddResource('water', 10);
    safeAddResource('minerals', 5);
    safeAddResource('plants', 3);
    safeAddResource('energy', 2);
    updateResourcesUI();
    checkAchievements();
    checkQuests();
    showNotification("ResourceGenerated");
    debouncedSaveGame();
}

// Safe Add Resource Function
function safeAddResource(resource, amount) {
    if (!MAX_RESOURCES.hasOwnProperty(resource)) return;
    resources[resource] = Math.min(resources[resource] + amount, storage[resource], MAX_RESOURCES[resource]);
}

// Safe Subtract Resource Function
function safeSubtractResource(resource, amount) {
    if (!resources.hasOwnProperty(resource)) return;
    resources[resource] = Math.max(resources[resource] - amount, 0);
}

// Update Resources UI
function updateResourcesUI() {
    const waterElem = document.getElementById('water');
    const mineralsElem = document.getElementById('minerals');
    const plantsElem = document.getElementById('plants');
    const energyElem = document.getElementById('energy');

    waterElem.innerHTML = `💧 Water: ${formatNumber(resources.water)} / ${formatNumber(storage.water)} (Per Second: <span id="water-rate">${waterPerSecond.toFixed(1)}</span>)`;
    mineralsElem.innerHTML = `⛏ Minerals: ${formatNumber(resources.minerals)} / ${formatNumber(storage.minerals)} (Per Second: <span id="minerals-rate">${mineralsPerSecond.toFixed(1)}</span>)`;
    plantsElem.innerHTML = `🌱 Plants: ${formatNumber(resources.plants)} / ${formatNumber(storage.plants)} (Per Second: <span id="plants-rate">${plantsPerSecond.toFixed(1)}</span>)`;
    energyElem.innerHTML = `⚡ Energy: ${formatNumber(resources.energy)} / ${formatNumber(storage.energy)} (Per Second: <span id="energy-rate">${energyPerSecond.toFixed(1)}</span>)`;

    generateUpgradesUI(); // Update upgrade button states based on new resource counts

    checkStoryMilestones(); // Check for story milestones
}

// Generate Upgrades UI
function generateUpgradesUI() {
    const upgradesDiv = document.getElementById('upgrades');
    upgradesDiv.innerHTML = ''; // Clear existing upgrades

    // Sort upgrades by category
    const categories = {};
    for (let key in upgrades) {
        const upgrade = upgrades[key];
        if (!categories[upgrade.category]) {
            categories[upgrade.category] = [];
        }
        categories[upgrade.category].push({ key, ...upgrade });
    }

    for (let category in categories) {
        const categoryDiv = document.createElement('div');
        categoryDiv.style.width = '100%';
        categoryDiv.style.textAlign = 'left';
        categoryDiv.style.marginBottom = '10px';
        const categoryTitle = document.createElement('h4');
        categoryTitle.innerText = category;
        categoryDiv.appendChild(categoryTitle);

        // Create a flex container for upgrades to align left to right
        const upgradesRow = document.createElement('div');
        upgradesRow.style.display = 'flex';
        upgradesRow.style.flexWrap = 'wrap';
        upgradesRow.style.gap = '20px';
        upgradesRow.style.justifyContent = 'flex-start';

        categories[category].forEach(upgrade => {
            // Only display upgrade if affordable or already purchased
            const isAffordable = resources.water >= upgrade.cost;
            const upgradeDiv = document.createElement('div');
            upgradeDiv.className = 'upgrade';

            const name = document.createElement('span');
            name.innerText = `${upgrade.name}`;
            upgradeDiv.appendChild(name);

            const description = document.createElement('span');
            description.innerText = `${upgrade.description}`;
            upgradeDiv.appendChild(description);

            const cost = document.createElement('span');
            cost.innerText = `Cost: ${formatNumber(upgrade.cost)} 💧`;
            upgradeDiv.appendChild(cost);

            const button = document.createElement('button');
            button.className = 'upgrade-button';
            button.innerText = `Buy (Level ${upgrade.level})`;
            button.disabled = !isAffordable;
            button.style.backgroundColor = isAffordable ? getComputedStyle(document.documentElement).getPropertyValue('--button-bg-color') : '#888';
            button.style.cursor = isAffordable ? 'pointer' : 'not-allowed';
            button.setAttribute('aria-label', `Buy upgrade ${upgrade.name}`);

            // Add tooltip
            const tooltip = document.createElement('span');
            tooltip.className = 'tooltip';
            tooltip.innerText = upgrade.description;
            button.appendChild(tooltip);

            // Assign unique ID for the button
            button.id = `upgrade-button-${upgrade.key}`;

            // Attach event listener
            button.addEventListener('click', () => buyUpgrade(upgrade.key));

            upgradeDiv.appendChild(button);

            upgradesRow.appendChild(upgradeDiv);
        });

        categoryDiv.appendChild(upgradesRow);
        upgradesDiv.appendChild(categoryDiv);
    }
}

// Buy Upgrade
function buyUpgrade(upgradeKey) {
    const upgrade = upgrades[upgradeKey];
    if (!upgrade) return;

    if (resources.water >= upgrade.cost) {
        resources.water -= upgrade.cost;
        upgrade.level += 1;
        upgrade.effect(upgrade.level);
        upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(1.5, upgrade.level));
        updateResourcesUI();
        generateAchievementsUI();
        checkAchievements();
        showNotification("UpgradePurchased", [upgrade.name, `Level ${upgrade.level}`]);
        trackGAEvent('purchase_upgrade', {
            'event_category': 'Upgrade',
            'event_label': upgrade.name,
            'value': upgrade.cost
        });
        debouncedSaveGame();
    } else {
        showNotification("UpgradePurchaseFailed");
    }
}

// Reset Upgrades (for new game)
function resetUpgrades() {
    for (let key in upgrades) {
        upgrades[key].level = 0;
        upgrades[key].cost = upgrades[key].baseCost;
    }
}

// Achievements UI
function generateAchievementsUI() {
    const achievementsDiv = document.getElementById('achievements');
    achievementsDiv.innerHTML = ''; // Clear existing achievements

    for (let key in achievements) {
        const achievement = achievements[key];
        const achievementDiv = document.createElement('div');
        achievementDiv.className = 'achievement';
        if (achievement.unlocked) {
            achievementDiv.classList.add('unlocked');
        }

        const name = document.createElement('span');
        name.innerText = `${achievement.name}`;
        achievementDiv.appendChild(name);

        const description = document.createElement('span');
        description.innerText = `${achievement.description}`;
        achievementDiv.appendChild(description);

        achievementsDiv.appendChild(achievementDiv);
    }
}

// Check and Unlock Achievements
function checkAchievements() {
    for (let key in achievements) {
        const achievement = achievements[key];
        if (!achievement.unlocked && achievement.condition()) {
            achievement.unlocked = true;
            if (achievement.reward) achievement.reward();
            showNotification("AchievementUnlocked", [achievement.name, achievement.rewardDescription]);
            generateAchievementsUI();
            trackGAEvent('achievement_unlocked', {
                'event_category': 'Achievement',
                'event_label': achievement.name
            });
            debouncedSaveGame();
        }
    }
}

// Reset Achievements (for new game)
function resetAchievements() {
    for (let key in achievements) {
        achievements[key].unlocked = false;
    }
}

// Quests UI
function generateQuestsUI() {
    const questsDiv = document.getElementById('quests');
    questsDiv.innerHTML = ''; // Clear existing quests

    for (let key in quests) {
        const quest = quests[key];
        const questDiv = document.createElement('div');
        questDiv.className = 'quest';
        questDiv.innerHTML = `<strong>${quest.name}:</strong> ${quest.description} - ${quest.completed ? '✅ Completed' : '❌ Incomplete'}`;
        questsDiv.appendChild(questDiv);
    }
}

// Display Story Milestones
function generateStoryUI() {
    const storyDiv = document.getElementById('story');
    storyDiv.innerHTML = ''; // Reset story section

    for (let key in storyMilestones) {
        const milestone = storyMilestones[key];
        if (milestone.unlocked) {
            const paragraph = document.createElement('p');
            paragraph.innerText = milestone.text;
            storyDiv.appendChild(paragraph);
        }
    }
}

// Check and Unlock Story Milestones
function checkStoryMilestones() {
    for (let key in storyMilestones) {
        const milestone = storyMilestones[key];
        if (!milestone.unlocked && milestone.condition()) {
            milestone.unlocked = true;
            showNotification("StoryMilestone", [milestone.text]);
            generateStoryUI();
            trackGAEvent('story_milestone_unlocked', {
                'event_category': 'Story',
                'event_label': milestone.text
            });
            debouncedSaveGame();
        }
    }
}

// Display Biomes
function displayBiomes() {
    const biomesDiv = document.getElementById('biomes');
    biomesDiv.innerHTML = ''; // Clear existing biomes

    biomes.forEach((biome, index) => {
        const biomeDiv = document.createElement('div');
        biomeDiv.className = 'biome';
        biomeDiv.innerText = `${biome.name} Biome\n${formatBiomeBonuses(biome.bonuses)}`;

        if (index === biomes.length - 1 && biome.highlight) { // Newly unlocked biome
            biomeDiv.style.animation = 'highlightBiome 2s ease-in-out';
            delete biome.highlight; // Remove highlight after animation
        }

        biomesDiv.appendChild(biomeDiv);
    });
}

// Format Biome Bonuses
function formatBiomeBonuses(bonuses) {
    let bonusText = '';
    for (let key in bonuses) {
        bonusText += `+${bonuses[key]} ${key.replace('PerSecond', '')} / sec\n`;
    }
    return bonusText;
}

// Unlock Terraform (New Biome)
function unlockTerraform() {
    const terraformBaseCost = 500;
    const terraformCost = terraformBaseCost * (biomes.length + 1);
    if (resources.water >= terraformCost) {
        confirmAction("TerraformConfirm", () => {
            resources.water -= terraformCost;
            unlockNewBiome();
            updateResourcesUI();
            showNotification("TerraformSuccess");
            trackGAEvent('terraform_planet', {
                'event_category': 'Terraform',
                'event_label': 'Planet terraformed'
            });
            debouncedSaveGame();
        });
    } else {
        showNotification("TerraformFailed");
    }
}

// Unlock New Biome
function unlockNewBiome() {
    const newBiome = generateRandomBiome();
    if (newBiome.name !== "No New Biome") {
        newBiome.highlight = true; // Add highlight flag
        biomes.push(newBiome);
        displayBiomes();
        generateStoryUI();
        checkQuests();
    } else {
        showNotification("AllBiomesUnlocked");
        // Optionally, display a message in the biomes section
        const biomesDiv = document.getElementById('biomes');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'biome';
        messageDiv.innerText = "🌟 All available biomes have been unlocked!";
        biomesDiv.appendChild(messageDiv);
    }
}

// Generate Random Biome
function generateRandomBiome() {
    const biomeNames = ["Forest", "Desert", "Ocean", "Mountain", "Swamp", "Tundra", "Savanna", "Volcano", "Jungle", "Iceberg", "Canyon"];
    let availableBiomes = biomeNames.filter(name => !biomes.some(biome => biome.name === name));

    if (availableBiomes.length === 0) {
        // All biomes unlocked, notify player
        showNotification("AllBiomesUnlocked");
        return { name: "No New Biome", id: biomes.length + 1, bonuses: {} };
    }

    const randomName = availableBiomes[Math.floor(Math.random() * availableBiomes.length)];
    let resourceBonus = {};

    switch(randomName) {
        case "Forest":
            resourceBonus = { plantsPerSecond: 2 };
            break;
        case "Desert":
            resourceBonus = { mineralsPerSecond: 3 };
            break;
        case "Ocean":
            resourceBonus = { waterPerSecond: 5 };
            break;
        case "Mountain":
            resourceBonus = { mineralsPerSecond: 4 };
            break;
        case "Swamp":
            resourceBonus = { plantsPerSecond: 3, waterPerSecond: 2 };
            break;
        case "Tundra":
            resourceBonus = { energyPerSecond: 2 };
            break;
        case "Savanna":
            resourceBonus = { plantsPerSecond: 2, mineralsPerSecond: 2 };
            break;
        case "Volcano":
            resourceBonus = { energyPerSecond: 5 };
            break;
        case "Jungle":
            resourceBonus = { plantsPerSecond: 4, waterPerSecond: 3 };
            break;
        case "Iceberg":
            resourceBonus = { waterPerSecond: 6 };
            break;
        case "Canyon":
            resourceBonus = { mineralsPerSecond: 5 };
            break;
        default:
            resourceBonus = {};
    }

    // Apply bonuses with caps
    for (let key in resourceBonus) {
        if (key === "waterPerSecond") {
            waterPerSecond = Math.min(waterPerSecond + resourceBonus[key], MAX_RESOURCE_RATE.waterPerSecond);
        }
        if (key === "mineralsPerSecond") {
            mineralsPerSecond = Math.min(mineralsPerSecond + resourceBonus[key], MAX_RESOURCE_RATE.mineralsPerSecond);
        }
        if (key === "plantsPerSecond") {
            plantsPerSecond = Math.min(plantsPerSecond + resourceBonus[key], MAX_RESOURCE_RATE.plantsPerSecond);
        }
        if (key === "energyPerSecond") {
            energyPerSecond = Math.min(energyPerSecond + resourceBonus[key], MAX_RESOURCE_RATE.energyPerSecond);
        }
    }

    return { name: randomName, id: biomes.length + 1, bonuses: resourceBonus };
}

// Event System
let activeEvents = []; // Array to track active events

function startEventSystem() {
    if (eventInterval) clearInterval(eventInterval);
    eventInterval = setInterval(() => {
        triggerRandomEvent();
    }, 600000); // Trigger an event every 10 minutes
}

function triggerRandomEvent() {
    if (document.hidden) return; // Prevent triggering when the game is not visible
    const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    // Check if event is already active
    if (activeEvents.includes(randomEvent.name)) {
        return; // Skip triggering the same event again
    }

    randomEvent.effect();
    activeEvents.push(randomEvent.name);
    showNotification("EventTriggered", [randomEvent.name, randomEvent.description]);
    displayEvents(randomEvent);
    updateResourcesUI();
    checkAchievements();
    checkQuests();
    trackGAEvent('event_triggered', {
        'event_category': 'Event',
        'event_label': randomEvent.name
    });
    debouncedSaveGame();

    // Remove event from activeEvents after its duration
    if (randomEvent.duration > 0) {
        setTimeout(() => {
            activeEvents = activeEvents.filter(event => event !== randomEvent.name);
        }, randomEvent.duration);
    }
}

function displayEvents(event) {
    const eventsDiv = document.getElementById('events');
    const eventDiv = document.createElement('div');
    eventDiv.className = 'event';
    eventDiv.innerText = `${event.name}: ${event.description}`;
    eventsDiv.prepend(eventDiv); // Add to top

    // Limit the number of displayed events to 5
    while (eventsDiv.children.length > 5) {
        eventsDiv.removeChild(eventsDiv.lastChild);
    }
}

// Notifications and Modals
async function openConfirmationModal(messageKey, onConfirm) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        // Store reference to the element that opened the modal
        const opener = document.activeElement;

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-modal';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => { document.body.removeChild(modal); };
        closeBtn.setAttribute('aria-label', 'Close Confirmation Modal');

        const messagePara = document.createElement('p');
        messagePara.innerText = notificationMessages[currentLanguage][messageKey] || messageKey;
        messagePara.dataset.translationKey = messageKey;

        const buttonsDiv = document.createElement('div');
        buttonsDiv.style.display = 'flex';
        buttonsDiv.style.justifyContent = 'space-between';
        buttonsDiv.style.marginTop = '20px';

        const confirmBtn = document.createElement('button');
        confirmBtn.innerText = notificationMessages[currentLanguage]["Yes"] || "Yes";
        confirmBtn.onclick = () => {
            onConfirm();
            document.body.removeChild(modal);
            opener.focus();
            resolve(true);
        };
        confirmBtn.setAttribute('aria-label', 'Confirm');

        const cancelBtn = document.createElement('button');
        cancelBtn.innerText = notificationMessages[currentLanguage]["No"] || "No";
        cancelBtn.onclick = () => { document.body.removeChild(modal); opener.focus(); resolve(false); };
        cancelBtn.setAttribute('aria-label', 'Cancel');

        buttonsDiv.appendChild(confirmBtn);
        buttonsDiv.appendChild(cancelBtn);

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(messagePara);
        modalContent.appendChild(buttonsDiv);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Focus management
        confirmBtn.focus();

        // Add event listener for focus trapping
        modal.addEventListener('keydown', function(e) {
            const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
            const focusableContent = modal.querySelectorAll(focusableElements);
            const firstElement = focusableContent[0];
            const lastElement = focusableContent[focusableContent.length - 1];

            if (e.key === 'Tab') {
                if (e.shiftKey) { // Shift + Tab
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else { // Tab
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }

            if (e.key === 'Escape') {
                e.preventDefault();
                document.body.removeChild(modal);
                opener.focus();
                resolve(false);
            }
        });

        // Add click outside to close
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                document.body.removeChild(modal);
                opener.focus();
                resolve(false);
            }
        });
    });
}

function confirmModal(messageKey, onConfirm) {
    return openConfirmationModal(messageKey, onConfirm);
}

function openAlertModal(messageKey) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-modal';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => { document.body.removeChild(modal); };
    closeBtn.setAttribute('aria-label', 'Close Alert Modal');

    const messagePara = document.createElement('p');
    messagePara.innerText = notificationMessages[currentLanguage][messageKey] || messageKey;
    messagePara.dataset.translationKey = messageKey;

    const okBtn = document.createElement('button');
    okBtn.innerText = notificationMessages[currentLanguage]["OK"] || "OK";
    okBtn.onclick = () => { document.body.removeChild(modal); };
    okBtn.setAttribute('aria-label', 'OK');

    modalContent.appendChild(closeBtn);
    modalContent.appendChild(messagePara);
    modalContent.appendChild(okBtn);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);

    // Focus management
    okBtn.focus();

    // Add event listener for focus trapping
    modal.addEventListener('keydown', function(e) {
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusableContent = modal.querySelectorAll(focusableElements);
        const firstElement = focusableContent[0];
        const lastElement = focusableContent[focusableContent.length - 1];

        if (e.key === 'Tab') {
            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else { // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }

        if (e.key === 'Escape') {
            e.preventDefault();
            document.body.removeChild(modal);
        }
    });

    // Add click outside to close
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function alertMessage(messageKey) {
    openAlertModal(messageKey);
}

// Generic Modal Functions
function openModal(modalId) {
    closeAllModals();
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex';
    const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();

    // Add event listener for focus trapping
    modal.addEventListener('keydown', trapTabKey);

    // Add click outside to close
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal(modalId);
        }
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
    modal.removeEventListener('keydown', trapTabKey);
    modal.removeEventListener('click', () => {});
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
        modal.removeEventListener('keydown', trapTabKey);
        modal.removeEventListener('click', () => {});
    });
}

function trapTabKey(e) {
    const modal = e.currentTarget;
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableContent = modal.querySelectorAll(focusableElements);
    const firstElement = focusableContent[0];
    const lastElement = focusableContent[focusableContent.length - 1];

    if (e.key === 'Tab') {
        if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else { // Tab
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    if (e.key === 'Escape') {
        e.preventDefault();
        closeAllModals();
    }
}

// Function to confirm action and get response
async function confirmAction(messageKey, onConfirm) {
    await confirmModal(messageKey, onConfirm);
}

// Function to open help modal
function openHelp() {
    openModal('tutorial-modal');
}

// Function to close help modal
function closeTutorial() {
    closeModal('tutorial-modal');
}

// Function to open feedback modal
function openFeedback() {
    openModal('feedback-modal');
}

// Function to close feedback modal
function closeFeedback() {
    closeModal('feedback-modal');
}

// Function to buy upgrades already handled

// Function to reset upgrades already handled

// Function to reset achievements already handled

// Function to reset quests already handled

// Function to generate biomes already handled

// Function to handle offline resource generation
function handleOfflineResourceGeneration(lastSaveTime) {
    const currentTime = Date.now();
    const offlineDuration = Math.floor((currentTime - lastSaveTime) / 1000); // in seconds
    const maxOfflineSeconds = 86400; // 24 hours
    const effectiveDuration = Math.min(offlineDuration, maxOfflineSeconds);
    if (effectiveDuration > 0) {
        safeAddResource('water', effectiveDuration * waterPerSecond);
        safeAddResource('minerals', effectiveDuration * mineralsPerSecond);
        safeAddResource('plants', effectiveDuration * plantsPerSecond);
        safeAddResource('energy', effectiveDuration * energyPerSecond);
        updateResourcesUI();
        showNotification("OfflineResources", [formatNumber(effectiveDuration)]);
        checkAchievements();
        checkQuests();
        trackGAEvent('offline_resources_generated', {
            'event_category': 'Offline',
            'event_label': `${formatNumber(effectiveDuration)} seconds`
        });
        debouncedSaveGame();
    }
}

// Start Resource Generation
function startResourceGeneration() {
    if (resourceGenerationInterval) clearInterval(resourceGenerationInterval);
    resourceGenerationInterval = setInterval(() => {
        safeAddResource('water', waterPerSecond);
        safeAddResource('minerals', mineralsPerSecond);
        safeAddResource('plants', plantsPerSecond);
        safeAddResource('energy', energyPerSecond);
        updateResourcesUI();
        checkAchievements();
        checkQuests();
        trackGAEvent('resource_generated', {
            'event_category': 'Resources',
            'event_label': 'Auto-generated resources'
        });
        debouncedSaveGame();
    }, 1000);
}

// Start Resource Consumption
function startResourceConsumption() {
    if (resourceConsumptionInterval) clearInterval(resourceConsumptionInterval);
    resourceConsumptionInterval = setInterval(() => {
        consumeResources();
    }, 5000); // Consume resources every 5 seconds
}

function consumeResources() {
    safeSubtractResource('water', waterConsumption);
    safeSubtractResource('minerals', mineralConsumption);
    updateResourcesUI();
    checkAchievements();
    checkQuests();
    trackGAEvent('resource_consumed', {
        'event_category': 'Resources',
        'event_label': 'Periodic consumption'
    });
    debouncedSaveGame();
}

// Start Autosave Functionality
function startAutosave() {
    if (autosaveInterval) clearInterval(autosaveInterval);
    autosaveInterval = setInterval(() => {
        saveGame();
    }, 30000); // Autosave every 30 seconds
}

// Schedule Quest Reset (Daily)
function scheduleQuestReset() {
    const now = new Date();
    const millisTillMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 0,0,0,0) - now;
    setTimeout(function(){
        resetQuests();
        scheduleQuestReset();
    }, millisTillMidnight);
}

// Function to reset all temporary effects
function clearAllTemporaryEffects() {
    waterPerSecond = 1;
    mineralsPerSecond = 0;
    plantsPerSecond = 0;
    energyPerSecond = 0;
    // Reset any other temporary variables or states
}

// Function to reset all intervals
function clearAllIntervals() {
    clearInterval(resourceGenerationInterval);
    clearInterval(resourceConsumptionInterval);
    clearInterval(autosaveInterval);
    clearInterval(eventInterval);
}

// Tracking GA Events
function trackGAEvent(eventName, eventParams) {
    if (typeof gtag === 'function') {
        gtag('event', eventName, eventParams);
    }
}

// Function to open help modal already handled

// Function to close help modal already handled

// Function to handle feedback modal
function handleFeedbackSubmission(event) {
    event.preventDefault();
    const feedbackInput = document.getElementById('feedback-input');
    let feedback = feedbackInput.value.trim();
    if (feedback.length === 0) {
        showNotification("EmptyFeedback");
        return;
    }
    if (feedback.length > 1000) {
        showNotification("FeedbackTooLong");
        return;
    }
    const sanitizedFeedback = sanitizeInput(feedback);
    // Send feedback via EmailJS or similar service
    // Replace 'YOUR_EMAILJS_USER_ID', 'YOUR_SERVICE_ID', and 'YOUR_TEMPLATE_ID' with actual values
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
        user_name: localStorage.getItem('PixelPlanetPlayerName') || 'Player',
        message: sanitizedFeedback
    })
    .then((response) => {
        showNotification("FeedbackSubmitted");
        closeFeedback();
        feedbackInput.value = '';
    }, (error) => {
        console.error('FAILED...', error);
        showNotification("FeedbackSubmissionFailed");
    });
}

// Function to buy upgrades already handled

// Function to reset upgrades already handled

// Function to reset achievements already handled

// Function to reset quests already handled

// Function to generate biomes already handled

// Function to handle offline resource generation already handled

// Function to start resource generation already handled

// Function to start resource consumption already handled

// Function to start autosave already handled

// Function to schedule quest reset already handled

// Function to reset all temporary effects already handled

// Function to reset all intervals already handled

// Function to track GA event already handled

// Function to open help modal already handled

// Function to close help modal already handled

// Function to handle feedback modal already handled

// Function to share game already handled

// Player Name Input Handling
function setPlayerName() {
    const nameInput = document.getElementById('player-name-input').value.trim();
    if (nameInput.length === 0) {
        showNotification("InvalidPlayerName");
        return;
    }
    // Check for duplicate names
    const leaderboard = JSON.parse(localStorage.getItem('PixelPlanetLeaderboard')) || [];
    if (leaderboard.some(player => player.name === nameInput)) {
        showNotification("DuplicatePlayerName");
        return;
    }
    const sanitizedInput = sanitizeInput(nameInput);
    localStorage.setItem('PixelPlanetPlayerName', sanitizedInput);
    showNotification("PlayerNameSet", [sanitizedInput]);
    // Proceed to start or continue game
    startNewGame();
}

// Function to reset temporary effects already handled

// Function to unlock new biomes already handled

// Function to generate random biomes already handled

// Function to handle resource plunder already handled

// Function to handle resource consumption already handled

// Function to generate achievements already handled

// Function to generate quests already handled

// Function to generate story milestones already handled

// Theme Management
function toggleTheme() {
    const currentTheme = localStorage.getItem('PixelPlanetTheme') || 'default';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    changeTheme(newTheme);
}

function changeTheme(theme) {
    document.body.classList.remove('dark-theme', 'light-theme'); // Remove existing themes
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else if (theme === 'light') {
        document.body.classList.add('light-theme');
    } else {
        // Default theme settings
        // No class added
    }
    showNotification("ThemeChanged", [capitalizeFirstLetter(theme)]);
    // Save theme selection
    localStorage.setItem('PixelPlanetTheme', theme);
    trackGAEvent('theme_changed', {
        'event_category': 'Theme',
        'event_label': theme
    });
}

function loadTheme() {
    const savedTheme = localStorage.getItem('PixelPlanetTheme') || 'default';
    changeTheme(savedTheme);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Reset Game
function resetGame() {
    confirmAction("ConfirmResetGame", () => {
        clearAllIntervals();
        localStorage.removeItem('PixelPlanetSave');
        localStorage.removeItem('PixelPlanetLeaderboard');
        localStorage.removeItem('PixelPlanetVersion');
        localStorage.removeItem('PixelPlanetPlayerName');
        startNewGame(false); // Pass false to avoid double confirmation
        showNotification("GameReset");
        trackGAEvent('game_reset', {
            'event_category': 'Game',
            'event_label': 'Game reset by player'
        });
    });
}

// Leaderboard and Social Sharing Integration
// Already handled in updateSocialSharing()

// Function to buy upgrades already handled

// Function to reset upgrades already handled

// Function to reset achievements already handled

// Function to reset quests already handled

// Function to generate biomes already handled

// Function to handle offline resource generation already handled

// Function to start resource generation already handled

// Function to start resource consumption already handled

// Function to start autosave already handled

// Function to schedule quest reset already handled

// Function to reset all temporary effects already handled

// Function to reset all intervals already handled

// Function to track GA event already handled

// Function to apply translations already handled

// Function to update dynamic content language already handled

// Function to load language already handled

// Initialize Device Detection
function detectDevice() {
    const ua = navigator.userAgent;
    if (/Mobi|Android/i.test(ua)) {
        document.body.style.fontSize = '1em';
    } else if (/iPad|Tablet/i.test(ua)) {
        document.body.style.fontSize = '1.1em';
    } else {
        document.body.style.fontSize = '1.2em';
    }
}

// Initialize Game
function initGame() {
    loadLanguage();
    updateSocialSharing();
    detectDevice();

    const savedGame = localStorage.getItem('PixelPlanetSave');
    if (savedGame) {
        const parsedSave = JSON.parse(savedGame);
        if (parsedSave.version !== "0.6") {
            // Handle version upgrades if necessary
            showNotification("VersionMismatch");
            startNewGame(false);
        } else {
            loadFromSave(parsedSave);
        }
    } else {
        startNewGame();
    }

    // Show Continue button if a saved game exists
    if (savedGame) {
        document.getElementById('continue-button').style.display = 'inline-block';
    }

    // Update version number display
    const savedVersion = localStorage.getItem('PixelPlanetVersion') || '0.6';
    document.getElementById('version').innerText = `Version ${savedVersion}`;
}

// Calculate Total Resources
function calculateTotalResources() {
    return resources.water + resources.minerals + resources.plants + resources.energy;
}

// Localization Setup
document.addEventListener("DOMContentLoaded", function() {
    // Load Language and Social Sharing
    initGame();

    // Attach Event Listeners
    attachEventListeners();
});

// Function to attach all event listeners
function attachEventListeners() {
    // Help Button
    const helpButton = document.getElementById('help-button');
    helpButton.addEventListener('click', openHelp);

    // Share Button
    const shareButton = document.getElementById('share-button');
    shareButton.addEventListener('click', shareGame);

    // Tutorial Close Button
    const tutorialCloseButton = document.getElementById('tutorial-close-button');
    tutorialCloseButton.addEventListener('click', closeTutorial);

    // Leaderboard Close Button
    const leaderboardCloseButton = document.getElementById('leaderboard-close-button');
    leaderboardCloseButton.addEventListener('click', closeLeaderboard);

    // Start New Game Button
    const startNewGameButton = document.getElementById('start-new-game-button');
    startNewGameButton.addEventListener('click', () => startNewGame(true));

    // Continue Game Button
    const continueButton = document.getElementById('continue-button');
    continueButton.addEventListener('click', continueGame);

    // Show Leaderboard Button
    const showLeaderboardButton = document.getElementById('show-leaderboard-button');
    showLeaderboardButton.addEventListener('click', showLeaderboard);

    // Language Selector
    const languageSelect = document.getElementById('language-select');
    languageSelect.addEventListener('change', (e) => {
        changeLanguage(e.target.value);
    });

    // Generate Resources Button
    const generateResourcesButton = document.getElementById('generate-resources-button');
    generateResourcesButton.addEventListener('click', generateResources);

    // Save Game Button
    const saveGameButton = document.getElementById('save-game-button');
    saveGameButton.addEventListener('click', saveGame);

    // Terraform Planet Button
    const terraformPlanetButton = document.getElementById('terraform-planet-button');
    terraformPlanetButton.addEventListener('click', unlockTerraform);

    // Reset Game Button
    const resetGameButton = document.getElementById('reset-game-button');
    resetGameButton.addEventListener('click', resetGame);

    // Toggle Theme Button
    const toggleThemeButton = document.getElementById('toggle-theme-button');
    toggleThemeButton.addEventListener('click', toggleTheme);

    // Feedback Button
    const feedbackButton = document.getElementById('feedback-button');
    feedbackButton.addEventListener('click', openFeedback);

    // Feedback Modal Close Buttons
    const feedbackCloseButtons = document.querySelectorAll('#feedback-modal .close-modal');
    feedbackCloseButtons.forEach(btn => {
        btn.addEventListener('click', () => closeFeedback());
    });

    // Feedback Form Submission
    const feedbackForm = document.getElementById('feedback-form');
    feedbackForm.addEventListener('submit', handleFeedbackSubmission);

    // Set Player Name Button
    const setPlayerNameButton = document.getElementById('set-player-name-button');
    setPlayerNameButton.addEventListener('click', setPlayerName);

    // Social Sharing Buttons (Already handled in updateSocialSharing)
    // No need to attach event listeners here since window.open is handled in shareGame()
}

// Function to share game
function shareGame() {
    const currentPlayer = {
        name: sanitizeInput(localStorage.getItem('PixelPlanetPlayerName')) || 'Player',
        totalResources: calculateTotalResources()
    };
    const shareText = encodeURIComponent(`I'm playing Pixel Planet! My total resources: ${formatNumber(currentPlayer.totalResources)}. Check it out: https://sites.google.com/view/staticquasar931/static-gmes/pixel-planet`);
    const twitterURL = `https://twitter.com/intent/tweet?text=${shareText}`;
    const facebookURL = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://sites.google.com/view/staticquasar931/static-gmes/pixel-planet')}`;
    const redditURL = `https://www.reddit.com/submit?url=${encodeURIComponent('https://sites.google.com/view/staticquasar931/static-gmes/pixel-planet')}&title=${shareText}`;

    // Open social sharing links in new tabs with security attributes
    window.open(twitterURL, '_blank', 'noopener,noreferrer');
    window.open(facebookURL, '_blank', 'noopener,noreferrer');
    window.open(redditURL, '_blank', 'noopener,noreferrer');

    // Reward player for sharing
    resources.energy = Math.min(resources.energy + 10, storage.energy, MAX_RESOURCES.energy);
    updateResourcesUI();
    showNotification("ShareReward");
    trackGAEvent('share_game', {
        'event_category': 'Share',
        'event_label': 'Game shared on social media'
    });
    debouncedSaveGame();
}

// Feedback Modal Submission Handling
function handleFeedbackSubmission(event) {
    event.preventDefault();
    const feedbackInput = document.getElementById('feedback-input');
    let feedback = feedbackInput.value.trim();
    if (feedback.length === 0) {
        showNotification("EmptyFeedback");
        return;
    }
    if (feedback.length > 1000) {
        showNotification("FeedbackTooLong");
        return;
    }
    const sanitizedFeedback = sanitizeInput(feedback);
    // Send feedback via EmailJS or similar service
    // Replace 'YOUR_EMAILJS_USER_ID', 'YOUR_SERVICE_ID', and 'YOUR_TEMPLATE_ID' with actual values
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
        user_name: localStorage.getItem('PixelPlanetPlayerName') || 'Player',
        message: sanitizedFeedback
    })
    .then((response) => {
        showNotification("FeedbackSubmitted");
        closeFeedback();
        feedbackInput.value = '';
    }, (error) => {
        console.error('FAILED...', error);
        showNotification("FeedbackSubmissionFailed");
    });
}

// Function to confirm action and get response already handled

// Function to open help modal already handled

// Function to close help modal already handled

// Function to handle feedback modal already handled

// Function to buy upgrades already handled

// Function to reset upgrades already handled

// Function to reset achievements already handled

// Function to reset quests already handled

// Function to generate biomes already handled

// Function to handle offline resource generation already handled

// Function to start resource generation already handled

// Function to start resource consumption already handled

// Function to start autosave already handled

// Function to schedule quest reset already handled

// Function to reset all temporary effects already handled

// Function to reset all intervals already handled

// Function to track GA event already handled

// Function to apply translations already handled

// Function to update dynamic content language already handled

// Function to load language already handled

// Function to detect device already handled

// Player Name Input Handling already handled

// Theme Management already handled

// Reset Game already handled

// Initialize Language and Social Sharing already handled

// Function to buy upgrades already handled

// Function to reset upgrades already handled

// Function to reset achievements already handled

// Function to reset quests already handled

// Function to generate biomes already handled

// Function to handle offline resource generation already handled

// Function to start resource generation already handled

// Function to start resource consumption already handled

// Function to start autosave already handled

// Function to schedule quest reset already handled

// Function to reset all temporary effects already handled

// Function to reset all intervals already handled

// Function to track GA event already handled

// Function to share game already handled

// Function to handle confirmation already handled

// Function to handle feedback modal already handled

// Function to handle player name already handled

// Function to handle theme already handled

// Function to reset game already handled

// Initialize Device Detection and Game on DOMContentLoaded already handled

// Function to initialize the game
function initGame() {
    loadLanguage();
    updateSocialSharing();
    detectDevice();

    const savedGame = localStorage.getItem('PixelPlanetSave');
    if (savedGame) {
        const parsedSave = JSON.parse(savedGame);
        if (parsedSave.version !== "0.6") {
            // Handle version upgrades if necessary
            showNotification("VersionMismatch");
            startNewGame(false);
        } else {
            loadFromSave(parsedSave);
        }
    } else {
        startNewGame();
    }

    // Show Continue button if a saved game exists
    if (savedGame) {
        document.getElementById('continue-button').style.display = 'inline-block';
    }

    // Update version number display
    const savedVersion = localStorage.getItem('PixelPlanetVersion') || '0.6';
    document.getElementById('version').innerText = `Version ${savedVersion}`;
}

// Function to initialize the game already handled

// Initialize Device Detection and Game on DOMContentLoaded already handled

// Function to set player name already handled

// Function to change language already handled

// Function to apply translations already handled

// Function to handle dynamic content language already handled

// Function to detect device already handled

// Function to load language already handled

// Function to update social sharing already handled

// Function to share game already handled

// Function to show notifications already handled

// Function to handle resource generation already handled

// Function to handle resource consumption already handled

// Function to handle upgrades already handled

// Function to handle achievements already handled

// Function to handle quests already handled

// Function to handle story milestones already handled

// Function to handle biomes already handled

// Function to handle events already handled

// Function to handle feedback already handled

// Function to handle saving and loading already handled

// Function to handle resetting the game already handled

// Initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", function() {
    // Initialize EmailJS if used
    // emailjs.init('YOUR_EMAILJS_USER_ID');

    // Initialize the game
    initGame();
});