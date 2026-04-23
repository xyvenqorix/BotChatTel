const tg = window.Telegram.WebApp;
let tonConnectUI;

// Objeto de juego para mantener todo organizado
const game = {
    points: 0,
    playerHP: 100,
    enemyHP: 100,
    
    init() {
        tg.expand();
        tg.ready();
        
        const user = tg.initDataUnsafe?.user;
        document.getElementById('player-name').innerText = user ? `@${user.username || user.first_name}` : "@Gamer";
        
        this.setupTon();
        this.drawMonsters();
    },

    setupTon() {
        // Inicialización con el manifest oficial de demo para asegurar compatibilidad
        tonConnectUI = new TONConnectUI.TonConnectUI({
            manifestUrl: 'https://raw.githubusercontent.com/ton-connect/demo-dapp/main/public/tonconnect-manifest.json',
            buttonRootId: 'ton-connect-hidden'
        });

        // Evento directo al botón
        document.getElementById('btn-vincular').onclick = async () => {
            tg.HapticFeedback.impactOccurred('medium');
            try {
                // Forzamos la apertura del modal nativo de Telegram
                await tonConnectUI.openModal();
            } catch (err) {
                console.error("Error al conectar:", err);
            }
        };

        // Escuchar el estado de conexión
        tonConnectUI.onStatusChange(wallet => {
            if (wallet) {
                document.getElementById('auth-overlay').style.display = 'none';
                document.getElementById('wallet-status').style.background = '#22c55e';
                this.log("¡Wallet conectada correctamente!");
            }
        });
    },

    drawMonsters() {
        const svg = (clr) => `<svg viewBox="0 0 24 24" width="80" height="80" style="shape-rendering:crispEdges"><rect x="6" y="8" width="12" height="10" fill="${clr}"/><rect x="13" y="10" width="2" height="2" fill="white"/></svg>`;
        document.getElementById('player-sprite').innerHTML = svg('#4ecca3');
        document.getElementById('enemy-sprite').innerHTML = svg('#ff4b5c');
    },

    attack() {
        tg.HapticFeedback.impactOccurred('light');
        let dmg = Math.floor(Math.random() * 20) + 10;
        this.enemyHP = Math.max(0, this.enemyHP - dmg);
        this.updateUI();
        this.log(`Atacaste: -${dmg} HP`);
        if(this.enemyHP <= 0) {
            this.points += 20;
            this.log("¡Enemigo derrotado! +20 PTS");
            setTimeout(() => this.reset(), 2000);
        }
    },

    heal() {
        this.playerHP = Math.min(100, this.playerHP + 15);
        this.updateUI();
        this.log("Te has curado +15 HP");
    },

    updateUI() {
        document.getElementById('enemy-hp').style.width = this.enemyHP + "%";
        document.getElementById('player-hp').style.width = this.playerHP + "%";
        document.getElementById('user-points').innerText = this.points;
    },

    log(msg) {
        const div = document.getElementById('battle-log');
        div.innerHTML = `> ${msg}<br>` + div.innerHTML;
    },

    reset() {
        this.enemyHP = 100;
        this.playerHP = 100;
        this.updateUI();
    }
};

// Arrancamos el juego
game.init();