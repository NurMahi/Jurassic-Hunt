let gameState = {
    dnaPoints: 0,
    stability: 100,
    researchLevel: 1,
    placedSpecimens: [],
    specimenCounter: 0,
    researchProgress: 0,
    fusionQueue: []
};

const labArea = document.getElementById('labArea');
const fusionChamber = document.getElementById('fusionChamber');
const elements = {
    score: document.getElementById('score'),
    stability: document.getElementById('stability'),
    researchLevel: document.getElementById('researchLevel'),
    specimenCount: document.getElementById('specimenCount'),
    stabilityBar: document.getElementById('stabilityBar'),
    researchBar: document.getElementById('researchBar'),
    systemStatus: document.getElementById('systemStatus'),
    notification: document.getElementById('notification')
};

// Matrix rain effect
function createMatrixRain() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.className = 'matrix-bg';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = '01ACGT🧬⚡🔬';
    const drops = [];
    const columns = canvas.width / 20;
    
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * canvas.height;
    }
    
    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ffff';
        ctx.font = '15px Orbitron';
        
        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * 20, drops[i]);
            
            if (drops[i] > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    setInterval(draw, 100);
    document.body.appendChild(canvas);
}

// Initialize drag and drop functionality
function initializeDragAndDrop() {
    document.querySelectorAll('.dino-item').forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
    });

    labArea.addEventListener('dragover', handleDragOver);
    labArea.addEventListener('drop', handleDrop);
    labArea.addEventListener('dragenter', handleDragEnter);
    labArea.addEventListener('dragleave', handleDragLeave);
}

function handleDragStart(e) {
    const data = {
        dino: e.currentTarget.dataset.dino,
        points: parseInt(e.currentTarget.dataset.points),
        tier: parseInt(e.currentTarget.dataset.tier),
        emoji: e.currentTarget.querySelector('.dino-emoji').textContent,
        name: e.currentTarget.querySelector('.dino-name').textContent
    };
    e.dataTransfer.setData('text/plain', JSON.stringify(data));
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDragEnter(e) {
    e.preventDefault();
    labArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    if (!labArea.contains(e.relatedTarget)) {
        labArea.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    labArea.classList.remove('drag-over');
    
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const rect = labArea.getBoundingClientRect();
    const x = e.clientX - rect.left - 40;
    const y = e.clientY - rect.top - 40;
    
    // Check if dropped on fusion chamber
    const fusionRect = fusionChamber.getBoundingClientRect();
    const labRect = labArea.getBoundingClientRect();
    const relativeX = e.clientX - labRect.left;
    const relativeY = e.clientY - labRect.top;
    const fusionX = fusionRect.left - labRect.left;
    const fusionY = fusionRect.top - labRect.top;
    
    if (relativeX >= fusionX && relativeX <= fusionX + fusionRect.width &&
        relativeY >= fusionY && relativeY <= fusionY + fusionRect.height) {
        handleFusion(data);
    } else {
        placeSpecimen(data, x, y);
    }
}

function placeSpecimen(specimenData, x, y) {
    gameState.specimenCounter++;
    const specimenElement = document.createElement('div');
    specimenElement.className = 'placed-dino hologram-effect';
    specimenElement.id = `specimen-${gameState.specimenCounter}`;
    specimenElement.style.left = `${Math.max(0, Math.min(x, labArea.clientWidth - 80))}px`;
    specimenElement.style.top = `${Math.max(0, Math.min(y, labArea.clientHeight - 80))}px`;
    
    const level = Math.floor(gameState.researchLevel * specimenData.tier);
    
    specimenElement.innerHTML = `
        <div class="dino-emoji">${specimenData.emoji}</div>
        <div class="dino-level">LV.${level}</div>
    `;
    
    // Enhanced dragging within lab
    specimenElement.draggable = true;
    specimenElement.addEventListener('dragstart', (e) => {
        const specimenInfo = {
            id: specimenElement.id,
            ...specimenData,
            level: level,
            isPlaced: true
        };
        e.dataTransfer.setData('text/plain', JSON.stringify(specimenInfo));
    });
    
    labArea.appendChild(specimenElement);
    
    // Add to game state
    gameState.dnaPoints += specimenData.points * level;
    gameState.placedSpecimens.push({
        id: gameState.specimenCounter,
        type: specimenData.dino,
        name: specimenData.name,
        level: level,
        tier: specimenData.tier,
        x: x,
        y: y
    });
    
    updateGameState();
    showNotification(`${specimenData.name} Level ${level} deployed! +${specimenData.points * level} DNA`);
    
    // Advanced AI behavior
    setTimeout(() => {
        advancedSpecimenBehavior(specimenElement, specimenData);
    }, Math.random() * 3000 + 1000);
    
    // Create energy orbs around specimen
    createEnergyOrbs(specimenElement);
}

function handleFusion(specimenData) {
    gameState.fusionQueue.push(specimenData);
    fusionChamber.classList.add('fusion-active');
    
    if (gameState.fusionQueue.length >= 2) {
        performFusion();
    } else {
        showNotification('Specimen added to fusion chamber. Add another to fuse!');
    }
}

function performFusion() {
    const [spec1, spec2] = gameState.fusionQueue;
    gameState.fusionQueue = [];
    fusionChamber.classList.remove('fusion-active');
    
    // Create fusion effect
    const fusionEffect = document.createElement('div');
    fusionEffect.className = 'evolution-effect';
    fusionEffect.textContent = '🌟✨🔮✨🌟';
    fusionEffect.style.left = '50%';
    fusionEffect.style.top = '50%';
    fusionEffect.style.transform = 'translate(-50%, -50%)';
    labArea.appendChild(fusionEffect);
    
    setTimeout(() => {
        fusionEffect.remove();
        
        // Create fusion result
        const fusedSpecimen = {
            dino: `fused-${spec1.dino}-${spec2.dino}`,
            points: Math.floor((spec1.points + spec2.points) * 1.5),
            tier: Math.max(spec1.tier, spec2.tier) + 1,
            emoji: spec1.tier > spec2.tier ? spec1.emoji : spec2.emoji,
            name: `Hybrid ${spec1.name.split(' ')[1] || spec1.name}`
        };
        
        placeSpecimen(fusedSpecimen, Math.random() * (labArea.clientWidth - 100), Math.random() * (labArea.clientHeight - 100));
        showNotification(`Fusion successful! Created ${fusedSpecimen.name}!`);
        
        gameState.researchProgress += 25;
        if (gameState.researchProgress >= 100) {
            gameState.researchLevel++;
            gameState.researchProgress = 0;
            showNotification(`Research Level ${gameState.researchLevel} achieved!`);
        }
    }, 2000);
}

function advancedSpecimenBehavior(element, data) {
    if (!document.contains(element)) return;
    
    const behaviors = ['patrol', 'hunt', 'rest', 'interact'];
    const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
    
    switch(behavior) {
        case 'patrol':
            patrolBehavior(element);
            break;
        case 'hunt':
            huntBehavior(element);
            break;
        case 'interact':
            interactBehavior(element);
            break;
        default:
            restBehavior(element);
    }
    
    // Schedule next behavior
    setTimeout(() => {
        if (document.contains(element)) {
            advancedSpecimenBehavior(element, data);
        }
    }, Math.random() * 10000 + 5000);
}

function patrolBehavior(element) {
    element.classList.add('patrolling');
    const startX = parseInt(element.style.left);
    const startY = parseInt(element.style.top);
    const patrolRadius = 100;
    
    // Move in a patrol pattern
    const patrolPoints = [
        { x: startX + patrolRadius, y: startY },
        { x: startX + patrolRadius, y: startY + patrolRadius },
        { x: startX, y: startY + patrolRadius },
        { x: startX, y: startY }
    ];
    
    let currentPoint = 0;
    const patrolInterval = setInterval(() => {
        if (!document.contains(element)) {
            clearInterval(patrolInterval);
            return;
        }
        
        const point = patrolPoints[currentPoint];
        element.style.left = `${Math.max(0, Math.min(point.x, labArea.clientWidth - 80))}px`;
        element.style.top = `${Math.max(0, Math.min(point.y, labArea.clientHeight - 80))}px`;
        
        currentPoint = (currentPoint + 1) % patrolPoints.length;
        
        if (currentPoint === 0) {
            clearInterval(patrolInterval);
            element.classList.remove('patrolling');
        }
    }, 1000);
}

function huntBehavior(element) {
    element.classList.add('hunting');
    const otherSpecimens = labArea.querySelectorAll('.placed-dino:not(#' + element.id + ')');
    
    if (otherSpecimens.length > 0) {
        const target = otherSpecimens[Math.floor(Math.random() * otherSpecimens.length)];
        const targetRect = target.getBoundingClientRect();
        const labRect = labArea.getBoundingClientRect();
        
        const targetX = targetRect.left - labRect.left;
        const targetY = targetRect.top - labRect.top;
        
        // Move towards target
        element.style.transition = 'all 2s ease-in-out';
        element.style.left = `${Math.max(0, Math.min(targetX, labArea.clientWidth - 80))}px`;
        element.style.top = `${Math.max(0, Math.min(targetY, labArea.clientHeight - 80))}px`;
        
        setTimeout(() => {
            element.style.transition = '';
            element.classList.remove('hunting');
            
            // Small chance of interaction/conflict
            if (Math.random() > 0.8) {
                createConflictEffect(element, target);
            }
        }, 2000);
    } else {
        element.classList.remove('hunting');
    }
}

function interactBehavior(element) {
    element.classList.add('interacting');
    
    // Create interaction particles
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createInteractionParticle(element);
        }, i * 200);
    }
    
    // Generate DNA points from interaction
    gameState.dnaPoints += Math.floor(Math.random() * 10) + 5;
    updateGameState();
    
    setTimeout(() => {
        element.classList.remove('interacting');
    }, 3000);
}

function restBehavior(element) {
    element.classList.add('resting');
    
    // Slowly pulse the element
    element.style.animation = 'pulse 2s ease-in-out infinite';
    
    // Restore stability while resting
    gameState.stability = Math.min(100, gameState.stability + 2);
    updateGameState();
    
    setTimeout(() => {
        element.style.animation = '';
        element.classList.remove('resting');
    }, 4000);
}

function createEnergyOrbs(element) {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const orb = document.createElement('div');
            orb.className = 'energy-orb';
            orb.style.left = element.style.left;
            orb.style.top = element.style.top;
            orb.innerHTML = '⚡';
            
            labArea.appendChild(orb);
            
            // Animate orb
            setTimeout(() => {
                orb.style.transform = `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px)`;
                orb.style.opacity = '0';
            }, 100);
            
            setTimeout(() => {
                if (orb.parentNode) {
                    orb.remove();
                }
            }, 2000);
        }, i * 500);
    }
}

function createInteractionParticle(element) {
    const particle = document.createElement('div');
    particle.className = 'interaction-particle';
    particle.innerHTML = '✨';
    particle.style.left = element.style.left;
    particle.style.top = element.style.top;
    particle.style.transform = `translate(${Math.random() * 60 - 30}px, ${Math.random() * 60 - 30}px)`;
    
    labArea.appendChild(particle);
    
    setTimeout(() => {
        if (particle.parentNode) {
            particle.remove();
        }
    }, 1500);
}

function createConflictEffect(element1, element2) {
    const effect = document.createElement('div');
    effect.className = 'conflict-effect';
    effect.innerHTML = '💥⚡💥';
    
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    const labRect = labArea.getBoundingClientRect();
    
    const midX = (rect1.left + rect2.left) / 2 - labRect.left;
    const midY = (rect1.top + rect2.top) / 2 - labRect.top;
    
    effect.style.left = `${midX}px`;
    effect.style.top = `${midY}px`;
    
    labArea.appendChild(effect);
    
    // Conflict resolution
    gameState.stability -= Math.floor(Math.random() * 10) + 5;
    gameState.dnaPoints += Math.floor(Math.random() * 20) + 10;
    
    updateGameState();
    showNotification('Specimen conflict detected! Stability reduced, DNA gained.');
    
    setTimeout(() => {
        if (effect.parentNode) {
            effect.remove();
        }
    }, 2000);
}

function updateGameState() {
    if (elements.score) elements.score.textContent = gameState.dnaPoints;
    if (elements.stability) elements.stability.textContent = gameState.stability;
    if (elements.researchLevel) elements.researchLevel.textContent = gameState.researchLevel;
    if (elements.specimenCount) elements.specimenCount.textContent = gameState.placedSpecimens.length;
    
    // Update progress bars
    if (elements.stabilityBar) {
        elements.stabilityBar.style.width = `${gameState.stability}%`;
        elements.stabilityBar.style.backgroundColor = gameState.stability > 50 ? '#00ff00' : 
                                                      gameState.stability > 25 ? '#ffff00' : '#ff0000';
    }
    
    if (elements.researchBar) {
        elements.researchBar.style.width = `${gameState.researchProgress}%`;
    }
    
    // Update system status
    if (elements.systemStatus) {
        if (gameState.stability > 75) {
            elements.systemStatus.textContent = 'OPTIMAL';
            elements.systemStatus.className = 'status-optimal';
        } else if (gameState.stability > 50) {
            elements.systemStatus.textContent = 'STABLE';
            elements.systemStatus.className = 'status-stable';
        } else if (gameState.stability > 25) {
            elements.systemStatus.textContent = 'WARNING';
            elements.systemStatus.className = 'status-warning';
        } else {
            elements.systemStatus.textContent = 'CRITICAL';
            elements.systemStatus.className = 'status-critical';
        }
    }
    
    // Check for system failure
    if (gameState.stability <= 0) {
        systemFailure();
    }
}

function showNotification(message) {
    if (elements.notification) {
        elements.notification.textContent = message;
        elements.notification.classList.add('show');
        
        setTimeout(() => {
            elements.notification.classList.remove('show');
        }, 3000);
    }
}

function systemFailure() {
    showNotification('SYSTEM FAILURE! Lab containment breached!');
    
    // Remove all specimens
    gameState.placedSpecimens.forEach(specimen => {
        const element = document.getElementById(`specimen-${specimen.id}`);
        if (element) {
            element.classList.add('system-failure');
            setTimeout(() => {
                element.remove();
            }, 2000);
        }
    });
    
    // Reset game state
    setTimeout(() => {
        gameState.placedSpecimens = [];
        gameState.stability = 100;
        gameState.dnaPoints = Math.floor(gameState.dnaPoints * 0.5);
        updateGameState();
        showNotification('Emergency protocols activated. System restored.');
    }, 3000);
}

// Auto-save game state
function saveGameState() {
    try {
        // Note: Using in-memory storage instead of localStorage for Claude.ai compatibility
        window.savedGameState = JSON.stringify(gameState);
    } catch (e) {
        console.warn('Could not save game state');
    }
}

function loadGameState() {
    try {
        if (window.savedGameState) {
            const saved = JSON.parse(window.savedGameState);
            gameState = { ...gameState, ...saved };
            updateGameState();
        }
    } catch (e) {
        console.warn('Could not load game state');
    }
}

// Passive DNA generation
function passiveDNAGeneration() {
    if (gameState.placedSpecimens.length > 0) {
        const passiveDNA = gameState.placedSpecimens.reduce((total, specimen) => {
            return total + Math.floor(specimen.level * 0.1);
        }, 0);
        
        gameState.dnaPoints += passiveDNA;
        updateGameState();
    }
    
    // Stability degradation over time
    if (gameState.placedSpecimens.length > 5) {
        gameState.stability -= Math.floor(Math.random() * 2);
    }
    
    updateGameState();
}

// Random events
function triggerRandomEvent() {
    const events = [
        {
            name: 'DNA Surge',
            probability: 0.1,
            effect: () => {
                gameState.dnaPoints += Math.floor(Math.random() * 100) + 50;
                showNotification('DNA Surge detected! +' + (Math.floor(Math.random() * 100) + 50) + ' DNA points!');
            }
        },
        {
            name: 'System Glitch',
            probability: 0.05,
            effect: () => {
                gameState.stability -= Math.floor(Math.random() * 20) + 10;
                showNotification('System glitch detected! Stability compromised.');
            }
        },
        {
            name: 'Research Breakthrough',
            probability: 0.08,
            effect: () => {
                gameState.researchProgress += Math.floor(Math.random() * 30) + 20;
                showNotification('Research breakthrough achieved!');
            }
        }
    ];
    
    events.forEach(event => {
        if (Math.random() < event.probability) {
            event.effect();
        }
    });
}

// Initialize game
function initializeGame() {
    createMatrixRain();
    initializeDragAndDrop();
    loadGameState();
    updateGameState();
    
    // Game loops
    setInterval(passiveDNAGeneration, 5000);
    setInterval(triggerRandomEvent, 15000);
    setInterval(saveGameState, 10000);
    
    showNotification('Genetic Lab Systems Online. Begin specimen deployment.');
}

// Start game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}