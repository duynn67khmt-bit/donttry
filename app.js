/* ==========================================================================
   TÀI XỈU PREMIUM - CORE APPLICATION SCRIPT
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. WEB AUDIO API SYNTHESIZER CLASS
// --------------------------------------------------------------------------
class AudioSynth {
    constructor() {
        this.ctx = null;
        this.masterVolume = null;
        this.isMuted = false;
        this.noiseBuffer = null;
    }

    init() {
        if (this.ctx) return;
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContextClass();
            this.masterVolume = this.ctx.createGain();
            this.masterVolume.gain.value = 0.4;
            this.masterVolume.connect(this.ctx.destination);
            this.createNoiseBuffer();
            
            // Resume context if suspended (browser auto-play policies)
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        } catch (e) {
            console.warn("Trình duyệt không hỗ trợ Web Audio API:", e);
        }
    }

    createNoiseBuffer() {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * 1.5; // 1.5 seconds of noise
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        this.noiseBuffer = buffer;
    }

    playTone(freq, type, duration, gainStart, decayType = 'exponential') {
        if (!this.ctx || this.isMuted) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gainNode.gain.setValueAtTime(gainStart, this.ctx.currentTime);
        if (decayType === 'exponential') {
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        } else {
            gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);
        }

        osc.connect(gainNode);
        gainNode.connect(this.masterVolume);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playChipSound() {
        // High pitch short click
        this.playTone(1800, 'sine', 0.05, 0.3);
        setTimeout(() => {
            this.playTone(1200, 'sine', 0.03, 0.15);
        }, 15);
    }

    playLoginSound() {
        const now = this.ctx ? this.ctx.currentTime : 0;
        this.playTone(392, 'triangle', 0.15, 0.3, 'linear'); // G4
        setTimeout(() => this.playTone(523.25, 'triangle', 0.15, 0.3, 'linear'), 120); // C5
        setTimeout(() => this.playTone(659.25, 'triangle', 0.15, 0.3, 'linear'), 240); // E5
        setTimeout(() => this.playTone(783.99, 'triangle', 0.3, 0.4, 'exponential'), 360); // G5
    }

    playCupLiftSound() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);

        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.linearRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gainNode);
        gainNode.connect(this.masterVolume);
        osc.start();
        osc.stop(now + 0.35);
    }

    playShakeSound(durationSecs) {
        if (!this.ctx || this.isMuted || !this.noiseBuffer) return;
        
        const now = this.ctx.currentTime;
        const interval = 130; // Milliseconds between shake sounds
        const pulsesCount = Math.floor((durationSecs * 1000) / interval);
        
        for (let i = 0; i < pulsesCount; i++) {
            setTimeout(() => {
                if (game.gameStage !== 'SHAKING' || this.isMuted) return;
                this.playSingleShakePulse();
            }, i * interval);
        }
    }

    playSingleShakePulse() {
        if (!this.ctx || !this.noiseBuffer) return;
        const now = this.ctx.currentTime;
        const noiseNode = this.ctx.createBufferSource();
        noiseNode.buffer = this.noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800 + Math.random() * 600, now);
        filter.Q.setValueAtTime(3.0, now);

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        noiseNode.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterVolume);

        noiseNode.start(now);
        noiseNode.stop(now + 0.1);
        
        // Add a low metallic clank tone under noise
        this.playTone(180 + Math.random() * 80, 'triangle', 0.08, 0.15, 'linear');
    }

    playWinSound() {
        if (!this.ctx || this.isMuted) return;
        const tempo = 120; // Fast win arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5 E5 G5 C6 E6 G6
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, 'triangle', 0.25, 0.35);
            }, index * tempo);
        });
    }

    playLoseSound() {
        if (!this.ctx || this.isMuted) return;
        const tempo = 150;
        const notes = [293.66, 246.94, 220.00, 164.81]; // D4 B3 A3 E3 (Descending gloomy minor vibe)
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, 'sawtooth', 0.3, 0.2, 'linear');
            }, index * tempo);
        });
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        const icon = document.getElementById('sound-icon');
        if (this.isMuted) {
            icon.className = 'fa-solid fa-volume-xmark text-muted';
        } else {
            icon.className = 'fa-solid fa-volume-high text-gold';
            this.init(); // Init if not already initialized
            this.playTone(440, 'sine', 0.1, 0.2); // Feedback sound
        }
        return this.isMuted;
    }
}

const audioSynth = new AudioSynth();

// --------------------------------------------------------------------------
// 2. SIMULATED BOTS DATA & DICTIONARY
// --------------------------------------------------------------------------
const BOTS = [
    { name: "Thần Bài Bến Tre", vip: 4, balance: 142000000 },
    { name: "Tài Xỉu Phù Thủy", vip: 2, balance: 28500000 },
    { name: "Đại Gia Quận 7", vip: 6, balance: 890000000 },
    { name: "Lão Hạc Đánh Bạc", vip: 1, balance: 4500000 },
    { name: "Kiều Trang VIP", vip: 3, balance: 52000000 },
    { name: "Bẻ Cầu Vô Địch", vip: 5, balance: 184000000 },
    { name: "Hắc Công Tử", vip: 4, balance: 95000000 },
    { name: "Bạch Công Tử", vip: 5, balance: 220000000 },
    { name: "Cái Bang Trưởng", vip: 2, balance: 800000 },
    { name: "Gamer Số Đỏ", vip: 3, balance: 12500000 },
    { name: "Triệu Phú 9x", vip: 6, balance: 550000000 },
    { name: "Độc Cô Cầu Bại", vip: 5, balance: 340000000 },
    { name: "Bà Năm Bán Vé Số", vip: 1, balance: 2300000 },
    { name: "Dũng Khùng", vip: 2, balance: 18000000 }
];

const BOT_MESSAGES = {
    BETTING: [
        "Ván này nghiêng về Xỉu anh em ơi, cầu đang đẹp kìa!",
        "Tài đi, tôi vừa ngủ mơ thấy 3 con 5 ra Tài 15 điểm ngon lành.",
        "Cầu bệt Xỉu ván thứ 4 rồi, bẻ cầu ván này đi cưng.",
        "Gấp đôi cửa Tài ván này, không tin là nó không ra!",
        "Ai theo tôi cửa Xỉu điểm danh phát nào.",
        "Làm tí cược Bão 1 ăn 30 đổi đời đi anh em.",
        "Sắp hết giờ rồi kìa cược nhanh đi chứ.",
        "Mới nạp thêm ít tiền ảo, ván này khô máu luôn.",
        "Cầu chạy 1-1 rõ ràng thế này không đánh hơi phí.",
        "Hôm nay đen quá, bám càng Đại Gia Quận 7 phát xem sao."
    ],
    SHAKING: [
        "Lắc đều tay đi admin đẹp trai ơi.",
        "Hồi hộp quá ván này cược to dã man.",
        "Nín thở chờ kết quả...",
        "Tài đi... Tài đi... Tài đi...",
        "Xỉu chắc chắn luôn khỏi cãi.",
        "Có ai cược bão không, ra bão phát ăn ngập mồm.",
        "Lắc mạnh lên nào sếp!"
    ],
    WIN: [
        "Húp ngon lành cành đào rồi anh em ơi!",
        "Đã bảo rồi mà, theo tôi chỉ có ăn thịt thôi.",
        "Lên đỉnh luôn, bú đậm ván này!",
        "May quá bẻ cầu thành công phát tài rồi.",
        "Uầy, lại thắng nữa, đỏ không tưởng được.",
        "Tuyệt vời ông mặt trời haha.",
        "Cảm ơn admin nhé, cầu thơm quá."
    ],
    LOSE: [
        "Toang rồi ông giáo ạ, gãy cầu cay thế.",
        "Trời ơi Tài 11 điểm vừa khít, mất oan quả cược Xỉu.",
        "Khóc tiếng Mán luôn, lại xa bờ rồi.",
        "Cứ bẻ cầu là vỡ nợ, biết thế đánh bệt cho xong.",
        "Hết tiền rồi, ai cho xin ít vốn với cứu net...",
        "Đúng là cờ bạc đãi tay mới, đen thế không biết.",
        "Game lừa thế nhở, sao ra Tài mãi thế."
    ]
};

// --------------------------------------------------------------------------
// 3. APPLICATION STATE MANAGEMENT
// --------------------------------------------------------------------------
class GameController {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('tx_users')) || [];
        this.activeUsername = localStorage.getItem('tx_active_user') || null;
        this.currentUser = null;

        // Stage configurations: 'BETTING' (30s) -> 'SHAKING' (3s) -> 'BOWL_REVEAL' (drag) -> 'REVEALING' (2s) -> 'PAYOUT' (4s) -> 'REST' (20s)
        this.gameStage = 'BETTING'; 
        this.timer = 30;
        this.timerInterval = null;
        this.bowlRevealTimeout = null;
        this.botInterval = null;
        this.chatInterval = null;

        // Bowl drag state
        this.isDraggingBowl = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;

        // Current round states
        this.currentDice = [1, 1, 1];
        this.activeChipValue = 10000; // Default: 10K
        
        // Placed Bets
        this.userBets = { xiu: 0, tai: 0, bao: 0 }; // Actual placed bets
        this.botBets = { xiu: 0, tai: 0, bao: 0 };
        this.botUsersCount = { xiu: 0, tai: 0 };

        // History
        this.history = []; // Array of { dice: [x,y,z], sum: N, result: 'tai'/'xiu'/'bao' }
        
        // Rigged Cycle Settings (Win 2, Lose 1)
        this.isRiggedMode = true;
        this.userCycleIndex = 0;
        
        // DOM Nodes cache
        this.dom = {};
    }

    init() {
        this.cacheDomElements();
        this.bindEvents();
        this.initDemoAccount();
        this.checkLoginStatus();
        this.setupAudioTriggerOnFirstInteraction();
    }

    cacheDomElements() {
        // Auth screens
        this.dom.authOverlay = document.getElementById('auth-overlay');
        this.dom.loginWrapper = document.getElementById('login-form-wrapper');
        this.dom.registerWrapper = document.getElementById('register-form-wrapper');
        this.dom.loginUsernameInput = document.getElementById('login-username');
        this.dom.loginPasswordInput = document.getElementById('login-password');
        this.dom.registerUsernameInput = document.getElementById('register-username');
        this.dom.registerPasswordInput = document.getElementById('register-password');
        this.dom.registerConfirmPasswordInput = document.getElementById('register-confirm-password');
        this.dom.loginError = document.getElementById('login-error');
        this.dom.registerError = document.getElementById('register-error');
        this.dom.btnAutologinDemo = document.getElementById('demo-account-btn');
        this.dom.btnToRegister = document.getElementById('switch-to-register');
        this.dom.btnToLogin = document.getElementById('switch-to-login');
        this.dom.btnLogin = document.getElementById('btn-login');
        this.dom.btnRegister = document.getElementById('btn-register');

        // Game main view
        this.dom.gameApp = document.getElementById('game-app');
        this.dom.profileName = document.getElementById('profile-display-name');
        this.dom.userBalance = document.getElementById('user-balance');
        this.dom.onlineCounter = document.getElementById('online-counter');
        this.dom.btnSoundToggle = document.getElementById('btn-sound-toggle');
        this.dom.btnLogout = document.getElementById('btn-logout');

        // Shaker & Dice Table
        this.dom.timerNumber = document.getElementById('timer-number');
        this.dom.timerProgress = document.getElementById('timer-progress');
        this.dom.statusBanner = document.getElementById('game-status-banner');
        this.dom.diceCup = document.getElementById('dice-cup');
        this.dom.dicePlate = document.getElementById('dice-plate');
        this.dom.dice1 = document.getElementById('dice-1');
        this.dom.dice2 = document.getElementById('dice-2');
        this.dom.dice3 = document.getElementById('dice-3');
        this.dom.historyStrip = document.getElementById('history-strip');
        this.dom.bowlPeekHint = document.getElementById('bowl-peek-hint');
        this.dom.restOverlay = document.getElementById('rest-overlay');

        // Betting Board
        this.dom.betXiu = document.getElementById('bet-area-xiu');
        this.dom.betTai = document.getElementById('bet-area-tai');
        this.dom.betBao = document.getElementById('bet-area-bao');
        this.dom.totalBetXiu = document.getElementById('total-bet-xiu');
        this.dom.totalBetTai = document.getElementById('total-bet-tai');
        this.dom.totalBetBao = document.getElementById('total-bet-bao');
        this.dom.usersCountXiu = document.getElementById('users-count-xiu');
        this.dom.usersCountTai = document.getElementById('users-count-tai');
        this.dom.userBetIndicatorXiu = document.getElementById('user-bet-indicator-xiu');
        this.dom.userBetIndicatorTai = document.getElementById('user-bet-indicator-tai');
        this.dom.userBetIndicatorBao = document.getElementById('user-bet-indicator-bao');
        this.dom.userBetValXiu = document.getElementById('user-bet-val-xiu');
        this.dom.userBetValTai = document.getElementById('user-bet-val-tai');
        this.dom.userBetValBao = document.getElementById('user-bet-val-bao');
        this.dom.chipsTray = document.querySelector('.chips-tray');
        
        // Bet Controls
        this.dom.btnBetClear = document.getElementById('btn-bet-clear');
        this.dom.btnBetDouble = document.getElementById('btn-bet-double');
        this.dom.btnBetAllin = document.getElementById('btn-bet-allin');
        this.dom.btnBetConfirm = document.getElementById('btn-bet-confirm'); // Kept for layout compatibility but logic will cược direct

        // Tabs & Charts
        this.dom.tabBtns = document.querySelectorAll('.tab-btn');
        this.dom.tabPanes = document.querySelectorAll('.tab-pane');
        this.dom.beadPlateContainer = document.getElementById('bead-plate-container');
        this.dom.trendSvg = document.getElementById('trend-svg');
        this.dom.txtPercentXiu = document.getElementById('txt-percent-xiu');
        this.dom.txtPercentTai = document.getElementById('txt-percent-tai');
        this.dom.barPercentXiu = document.getElementById('bar-percent-xiu');
        this.dom.barPercentTai = document.getElementById('bar-percent-tai');
        this.dom.totalRoundsCount = document.getElementById('total-rounds-count');
        this.dom.totalBaosCount = document.getElementById('total-baos-count');
        this.dom.longestStreak = document.getElementById('longest-streak');

        // Chat
        this.dom.chatMessages = document.getElementById('chat-messages');
        this.dom.chatForm = document.getElementById('chat-form');
        this.dom.chatInputMsg = document.getElementById('chat-input-msg');

        // Audio overlays
        this.dom.audioOverlay = document.getElementById('audio-init-overlay');
        this.dom.btnAudioEnable = document.getElementById('btn-audio-enable');
        this.dom.btnAudioSkip = document.getElementById('btn-audio-skip');

        // Admin Cheat Controls
        this.dom.headerLogo = document.querySelector('.header-logo');

        // Deposit Simulated Elements
        this.dom.btnOpenDeposit = document.getElementById('btn-open-deposit');
        this.dom.depositModal = document.getElementById('deposit-modal');
        this.dom.btnCloseDeposit = document.getElementById('btn-close-deposit');
        this.dom.depositTabBtns = document.querySelectorAll('.deposit-tab-btn');
        this.dom.depositTabPanes = document.querySelectorAll('.deposit-tab-pane');
        this.dom.btnQuickDep100M = document.getElementById('btn-quick-deposit-100m');
        this.dom.btnQuickDep50M = document.getElementById('btn-quick-deposit-50m');
        this.dom.cardCarrier = document.getElementById('card-carrier');
        this.dom.cardAmount = document.getElementById('card-amount');
        this.dom.cardSerial = document.getElementById('card-serial');
        this.dom.cardPin = document.getElementById('card-pin');
        this.dom.btnCardSubmit = document.getElementById('btn-card-deposit-submit');
        this.dom.cardLoading = document.getElementById('card-deposit-loading');
        this.dom.cardStatus = document.getElementById('card-deposit-status');
        this.dom.depositHistoryList = document.getElementById('deposit-history-list');
        this.dom.bankDepositMemo = document.getElementById('bank-deposit-memo');
        this.dom.momoDepositMemo = document.getElementById('momo-deposit-memo');

        // Visa Cached Elements
        this.dom.visaCardNumInput = document.getElementById('visa-card-num-input');
        this.dom.visaCardNameInput = document.getElementById('visa-card-name-input');
        this.dom.visaCardExpiryInput = document.getElementById('visa-card-expiry-input');
        this.dom.visaCardCvvInput = document.getElementById('visa-card-cvv-input');
        this.dom.visaAmountInput = document.getElementById('visa-amount-input');
        this.dom.btnVisaSubmit = document.getElementById('btn-visa-deposit-submit');
        this.dom.visaLoading = document.getElementById('visa-deposit-loading');
        this.dom.visaStatus = document.getElementById('visa-deposit-status');
        this.dom.previewVisaNumber = document.getElementById('preview-visa-number');
        this.dom.previewVisaName = document.getElementById('preview-visa-name');
        this.dom.previewVisaExpiry = document.getElementById('preview-visa-expiry');
    }

    bindEvents() {
        // Switch between Auth Forms
        this.dom.btnToRegister.addEventListener('click', () => {
            this.dom.loginWrapper.classList.add('hidden');
            this.dom.registerWrapper.classList.remove('hidden');
            this.dom.loginError.textContent = '';
        });
        this.dom.btnToLogin.addEventListener('click', () => {
            this.dom.registerWrapper.classList.add('hidden');
            this.dom.loginWrapper.classList.remove('hidden');
            this.dom.registerError.textContent = '';
        });

        // Quick login demo button
        this.dom.btnAutologinDemo.addEventListener('click', () => {
            this.dom.loginUsernameInput.value = 'demo';
            this.dom.loginPasswordInput.value = '123456';
            this.handleLogin();
        });

        // Form submits
        this.dom.btnLogin.addEventListener('click', () => this.handleLogin());
        this.dom.btnRegister.addEventListener('click', () => this.handleRegister());
        
        // Log out
        this.dom.btnLogout.addEventListener('click', () => this.handleLogout());

        // Header Sound Toggle
        this.dom.btnSoundToggle.addEventListener('click', () => {
            audioSynth.toggleMute();
        });

        // Select active chip value
        this.dom.chipsTray.addEventListener('click', (e) => {
            const chipBtn = e.target.closest('.chip');
            if (!chipBtn) return;
            document.querySelectorAll('.chip').forEach(c => c.classList.remove('active-chip'));
            chipBtn.classList.add('active-chip');
            this.activeChipValue = parseInt(chipBtn.dataset.value, 10);
            audioSynth.playChipSound();
        });

        // Click Bet Areas
        this.dom.betXiu.addEventListener('click', () => this.placeUserBet('xiu'));
        this.dom.betTai.addEventListener('click', () => this.placeUserBet('tai'));
        this.dom.betBao.addEventListener('click', () => this.placeUserBet('bao'));

        // Bowl Drag (Kéo Bát) - Pointer events for free-drag reveal
        this.dom.diceCup.addEventListener('pointerdown', (e) => this.onBowlDragStart(e));
        document.addEventListener('pointermove', (e) => this.onBowlDragMove(e));
        document.addEventListener('pointerup', (e) => this.onBowlDragEnd(e));

        // Bet controls
        this.dom.btnBetClear.addEventListener('click', () => this.clearUserBets());
        this.dom.btnBetDouble.addEventListener('click', () => this.doubleUserBets());
        this.dom.btnBetAllin.addEventListener('click', () => this.allinUserBets());

        // Chat Form Submit
        this.dom.chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUserSendChatMessage();
        });

        // Soi Cau tabs switching
        this.dom.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.dom.tabBtns.forEach(b => b.classList.remove('active-tab'));
                this.dom.tabPanes.forEach(p => p.classList.remove('active-pane'));
                
                btn.classList.add('active-tab');
                const targetPane = document.getElementById(btn.dataset.tab);
                if (targetPane) targetPane.classList.add('active-pane');
            });
        });

        // Audio initialization buttons
        this.dom.btnAudioEnable.addEventListener('click', () => {
            audioSynth.toggleMute(); // Will unmute and play confirmation sound
            this.dom.audioOverlay.classList.add('hidden');
        });
        this.dom.btnAudioSkip.addEventListener('click', () => {
            this.dom.audioOverlay.classList.add('hidden');
        });

        // Admin Rigged Toggles (Double-clicking the Casino logo toggles Rigged mode silently)
        if (this.dom.headerLogo) {
            this.dom.headerLogo.addEventListener('dblclick', () => {
                this.isRiggedMode = !this.isRiggedMode;
                audioSynth.playChipSound();
                console.log(`[Admin Toggle] Chế độ cược BỊP: ${this.isRiggedMode}`);
            });
        }

        // Deposit Events binding
        if (this.dom.btnOpenDeposit) {
            this.dom.btnOpenDeposit.addEventListener('click', () => {
                this.openDepositModal();
            });
        }

        if (this.dom.btnCloseDeposit) {
            this.dom.btnCloseDeposit.addEventListener('click', () => {
                this.dom.depositModal.classList.add('hidden');
                audioSynth.playChipSound();
            });
        }

        if (this.dom.depositModal) {
            this.dom.depositModal.addEventListener('click', (e) => {
                if (e.target === this.dom.depositModal) {
                    this.dom.depositModal.classList.add('hidden');
                }
            });
        }

        this.dom.depositTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.dom.depositTabBtns.forEach(b => b.classList.remove('active-tab'));
                this.dom.depositTabPanes.forEach(p => p.classList.remove('active-pane'));
                
                btn.classList.add('active-tab');
                const targetPane = document.getElementById(btn.dataset.tab);
                if (targetPane) targetPane.classList.add('active-pane');
                audioSynth.playChipSound();
            });
        });

        if (this.dom.btnQuickDep100M) {
            this.dom.btnQuickDep100M.addEventListener('click', () => {
                this.executeDeposit(100000000, 'Chuyển Khoản Techcombank');
            });
        }

        if (this.dom.btnQuickDep50M) {
            this.dom.btnQuickDep50M.addEventListener('click', () => {
                this.executeDeposit(50000000, 'Ví Điện Tử MoMo');
            });
        }

        if (this.dom.btnCardSubmit) {
            this.dom.btnCardSubmit.addEventListener('click', () => {
                this.executeCardDeposit();
            });
        }

        // Visa Events Binding
        if (this.dom.visaCardNumInput) {
            this.dom.visaCardNumInput.addEventListener('input', (e) => {
                let val = e.target.value.replace(/\D/g, '');
                let formatted = val.match(/.{1,4}/g)?.join(' ') || '';
                e.target.value = formatted;
                this.dom.previewVisaNumber.textContent = formatted || '•••• •••• •••• ••••';
            });
        }

        if (this.dom.visaCardNameInput) {
            this.dom.visaCardNameInput.addEventListener('input', (e) => {
                let val = e.target.value
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-zA-Z\s]/g, '')
                    .toUpperCase();
                e.target.value = val;
                this.dom.previewVisaName.textContent = val || 'YOUR NAME';
            });
        }

        if (this.dom.visaCardExpiryInput) {
            this.dom.visaCardExpiryInput.addEventListener('input', (e) => {
                let val = e.target.value.replace(/\D/g, '');
                if (val.length > 2) {
                    val = val.substring(0, 2) + '/' + val.substring(2, 4);
                }
                e.target.value = val;
                this.dom.previewVisaExpiry.textContent = val || 'MM/YY';
            });
        }

        if (this.dom.visaCardCvvInput) {
            this.dom.visaCardCvvInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
            });
        }

        // Quick amount buttons for Visa
        document.querySelectorAll('.btn-quick-amount-visa').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.dom.visaAmountInput) {
                    this.dom.visaAmountInput.value = btn.dataset.val;
                    audioSynth.playChipSound();
                }
            });
        });

        if (this.dom.btnVisaSubmit) {
            this.dom.btnVisaSubmit.addEventListener('click', () => {
                this.executeVisaDeposit();
            });
        }
    }

    setupAudioTriggerOnFirstInteraction() {
        const initAudio = () => {
            if (audioSynth && !audioSynth.ctx) {
                audioSynth.init();
            }
        };
        window.addEventListener('click', initAudio, { once: false });
        window.addEventListener('keydown', initAudio, { once: false });
    }

    initDemoAccount() {
        const demoExists = this.users.find(u => u.username === 'demo');
        if (!demoExists) {
            this.users.push({
                username: 'demo',
                password: '123456',
                balance: 100000000, // 100 million
                history: []
            });
            localStorage.setItem('tx_users', JSON.stringify(this.users));
        }
    }

    checkLoginStatus() {
        if (this.activeUsername) {
            const user = this.users.find(u => u.username === this.activeUsername);
            if (user) {
                this.currentUser = user;
                this.showMainGameScreen();
                return;
            }
        }
        // Show auth panel
        this.dom.authOverlay.classList.remove('hidden');
        this.dom.gameApp.classList.add('hidden');
    }

    showMainGameScreen() {
        this.dom.authOverlay.classList.add('hidden');
        this.dom.gameApp.classList.remove('hidden');
        this.dom.profileName.textContent = this.currentUser.username;
        this.updateUserBalanceUI();

        // Load personal history
        this.history = this.currentUser.history || [];
        if (this.history.length === 0) {
            // Generate some mock historical games for statistics visualization
            this.generateMockHistory(40);
        }

        // Draw graphs & strips
        this.renderHistoryDotsStrip();
        this.renderBeadPlateGrid();
        this.renderTrendLineSvg();
        this.calculateHistoryPercentages();

        // Start active loop
        this.startMainGameLoop();
        this.simulateActiveOnlineUsers();
        
        // Show audio modal on first login if context not loaded
        setTimeout(() => {
            if (!audioSynth.ctx || audioSynth.isMuted) {
                this.dom.audioOverlay.classList.remove('hidden');
            }
        }, 1200);

        // Welcoming chat message
        this.addChatMessage("Hệ Thống", "Chào mừng bạn đến với Sòng Bạc Hoàng Gia! Chúc bạn chơi vui vẻ và gặp nhiều may mắn.", "sys", true);
        
        // Add random existing messages to chat box
        this.generateInitialChatLogs();
    }

    updateUserBalanceUI() {
        this.dom.userBalance.textContent = this.formatCurrency(this.currentUser.balance) + 'đ';
    }

    openDepositModal() {
        if (!this.currentUser) return;
        
        // Reset Card input states
        this.dom.cardSerial.value = '';
        this.dom.cardPin.value = '';
        this.dom.cardStatus.textContent = '';
        this.dom.cardStatus.className = 'card-deposit-status';
        this.dom.cardLoading.classList.add('hidden');
        this.dom.btnCardSubmit.disabled = false;

        // Load Visa card details
        if (this.currentUser.visaCardNumber) {
            this.dom.visaCardNumInput.value = this.currentUser.visaCardNumber;
            this.dom.previewVisaNumber.textContent = this.currentUser.visaCardNumber;
        } else {
            this.dom.visaCardNumInput.value = '';
            this.dom.previewVisaNumber.textContent = '•••• •••• •••• ••••';
        }

        if (this.currentUser.visaCardHolder) {
            this.dom.visaCardNameInput.value = this.currentUser.visaCardHolder;
            this.dom.previewVisaName.textContent = this.currentUser.visaCardHolder;
        } else {
            this.dom.visaCardNameInput.value = '';
            this.dom.previewVisaName.textContent = 'YOUR NAME';
        }

        if (this.currentUser.visaCardExpiry) {
            this.dom.visaCardExpiryInput.value = this.currentUser.visaCardExpiry;
            this.dom.previewVisaExpiry.textContent = this.currentUser.visaCardExpiry;
        } else {
            this.dom.visaCardExpiryInput.value = '';
            this.dom.previewVisaExpiry.textContent = 'MM/YY';
        }

        this.dom.visaCardCvvInput.value = ''; // Always clear CVV
        this.dom.visaStatus.textContent = '';
        this.dom.visaStatus.className = 'visa-deposit-status';
        this.dom.visaLoading.classList.add('hidden');
        this.dom.btnVisaSubmit.disabled = false;

        // Generate dynamic memo code for this transaction
        const memoStr = `ROYAL_${this.currentUser.username.toUpperCase()}_${Math.floor(Math.random() * 9000 + 1000)}`;
        if (this.dom.bankDepositMemo) this.dom.bankDepositMemo.textContent = memoStr;
        if (this.dom.momoDepositMemo) this.dom.momoDepositMemo.textContent = memoStr;

        // Render current user's deposit history
        this.renderDepositHistory();

        // Show modal
        this.dom.depositModal.classList.remove('hidden');
        audioSynth.playChipSound();
    }

    executeDeposit(amount, method) {
        if (!this.currentUser) return;

        // Update balance
        this.currentUser.balance += amount;
        this.updateUserBalanceUI();

        // Push transaction record
        const time = new Date();
        const timeStr = `${String(time.getDate()).padStart(2, '0')}/${String(time.getMonth() + 1).padStart(2, '0')} ${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
        
        this.currentUser.deposits = this.currentUser.deposits || [];
        this.currentUser.deposits.push({
            method: method,
            amount: amount,
            time: timeStr,
            status: 'Thành công'
        });

        // Limit list to last 5
        if (this.currentUser.deposits.length > 5) {
            this.currentUser.deposits.shift();
        }

        // Save
        this.saveUsersToLocalStorage();

        // Audio & Visual feedback
        audioSynth.playWinSound();
        this.showWinFloatingText(amount);
        this.renderDepositHistory();

        // Push to Chat
        this.addChatMessage("Hệ Thống", `Giao dịch nạp tiền thành công! Bạn đã được cộng +${this.formatCurrency(amount)}đ (Kênh: ${method}).`, "sys");
    }

    executeCardDeposit() {
        const serial = this.dom.cardSerial.value.trim();
        const pin = this.dom.cardPin.value.trim();
        const carrier = this.dom.cardCarrier.value;
        const amountVal = parseInt(this.dom.cardAmount.value, 10);

        if (!serial || !pin) {
            this.dom.cardStatus.textContent = 'Vui lòng nhập đầy đủ Số Seri và Mã Thẻ Cào.';
            this.dom.cardStatus.className = 'card-deposit-status text-red';
            audioSynth.playLoseSound();
            return;
        }

        if (serial.length < 6 || pin.length < 6) {
            this.dom.cardStatus.textContent = 'Số Seri hoặc Mã Thẻ không hợp lệ (ít nhất 6 ký tự).';
            this.dom.cardStatus.className = 'card-deposit-status text-red';
            audioSynth.playLoseSound();
            return;
        }

        // Processing state
        this.dom.btnCardSubmit.disabled = true;
        this.dom.cardLoading.classList.remove('hidden');
        this.dom.cardStatus.textContent = '';
        audioSynth.playChipSound();

        // 2 seconds simulated loading
        setTimeout(() => {
            this.dom.cardLoading.classList.add('hidden');
            this.dom.btnCardSubmit.disabled = false;

            // Success
            this.executeDeposit(amountVal, `Thẻ Cào ${carrier.toUpperCase()}`);
            
            this.dom.cardStatus.textContent = `Nạp thẻ ${carrier.toUpperCase()} ${this.formatCurrency(amountVal)}đ thành công!`;
            this.dom.cardStatus.className = 'card-deposit-status text-cyan';
            
            // Clear inputs
            this.dom.cardSerial.value = '';
            this.dom.cardPin.value = '';
        }, 2000);
    }

    executeVisaDeposit() {
        const cardNum = this.dom.visaCardNumInput.value.replace(/\s/g, '');
        const cardHolder = this.dom.visaCardNameInput.value.trim();
        const expiry = this.dom.visaCardExpiryInput.value.trim();
        const cvv = this.dom.visaCardCvvInput.value.trim();
        const amountVal = parseInt(this.dom.visaAmountInput.value, 10);

        if (!cardNum || !cardHolder || !expiry || !cvv || isNaN(amountVal)) {
            this.dom.visaStatus.textContent = 'Vui lòng nhập đầy đủ thông tin thẻ VISA và số tiền.';
            this.dom.visaStatus.className = 'visa-deposit-status text-red';
            audioSynth.playLoseSound();
            return;
        }

        if (cardNum.length !== 16) {
            this.dom.visaStatus.textContent = 'Số thẻ VISA không hợp lệ (phải đủ 16 chữ số).';
            this.dom.visaStatus.className = 'visa-deposit-status text-red';
            audioSynth.playLoseSound();
            return;
        }

        if (cardHolder.length < 3) {
            this.dom.visaStatus.textContent = 'Tên chủ thẻ không hợp lệ.';
            this.dom.visaStatus.className = 'visa-deposit-status text-red';
            audioSynth.playLoseSound();
            return;
        }

        if (!/^\d{2}\/\d{2}$/.test(expiry)) {
            this.dom.visaStatus.textContent = 'Hạn dùng không đúng định dạng MM/YY.';
            this.dom.visaStatus.className = 'visa-deposit-status text-red';
            audioSynth.playLoseSound();
            return;
        }

        const [month, year] = expiry.split('/');
        const m = parseInt(month, 10);
        if (m < 1 || m > 12) {
            this.dom.visaStatus.textContent = 'Tháng hết hạn không hợp lệ (01-12).';
            this.dom.visaStatus.className = 'visa-deposit-status text-red';
            audioSynth.playLoseSound();
            return;
        }

        if (cvv.length !== 3) {
            this.dom.visaStatus.textContent = 'Mã CVV không hợp lệ (phải đúng 3 chữ số).';
            this.dom.visaStatus.className = 'visa-deposit-status text-red';
            audioSynth.playLoseSound();
            return;
        }

        if (amountVal < 10000) {
            this.dom.visaStatus.textContent = 'Số tiền nạp tối thiểu là 10.000đ.';
            this.dom.visaStatus.className = 'visa-deposit-status text-red';
            audioSynth.playLoseSound();
            return;
        }

        // Processing state
        this.dom.btnVisaSubmit.disabled = true;
        this.dom.visaLoading.classList.remove('hidden');
        this.dom.visaStatus.textContent = '';
        audioSynth.playChipSound();

        // 2 seconds simulated loading
        setTimeout(() => {
            this.dom.visaLoading.classList.add('hidden');
            this.dom.btnVisaSubmit.disabled = false;

            // Credit balance and record history
            this.executeDeposit(amountVal, `VISA (đuôi ${cardNum.slice(-4)})`);

            // Retain user card details for persistence (CVV is omitted for safety)
            this.currentUser.visaCardNumber = this.dom.visaCardNumInput.value.trim();
            this.currentUser.visaCardHolder = this.dom.visaCardNameInput.value.trim();
            this.currentUser.visaCardExpiry = this.dom.visaCardExpiryInput.value.trim();
            this.saveUsersToLocalStorage();

            this.dom.visaStatus.textContent = `Thanh toán VISA thành công! Đã nạp +${this.formatCurrency(amountVal)}đ.`;
            this.dom.visaStatus.className = 'visa-deposit-status text-cyan';

            // Clear CVV
            this.dom.visaCardCvvInput.value = '';
        }, 2000);
    }

    renderDepositHistory() {
        if (!this.currentUser || !this.dom.depositHistoryList) return;

        this.dom.depositHistoryList.innerHTML = '';
        const deposits = this.currentUser.deposits || [];

        if (deposits.length === 0) {
            this.dom.depositHistoryList.innerHTML = '<p class="no-history-text">Chưa có lịch sử giao dịch nạp tiền.</p>';
            return;
        }

        // Render backwards (newest first)
        const reversedDeposits = [...deposits].reverse();
        reversedDeposits.forEach(dep => {
            const item = document.createElement('div');
            item.className = 'history-deposit-item';

            item.innerHTML = `
                <div class="history-dep-info">
                    <span class="history-dep-method text-gold">${dep.method}</span>
                    <span class="history-dep-time">${dep.time}</span>
                </div>
                <div class="history-dep-value">
                    <span class="history-dep-amount text-cyan">+${this.formatCurrency(dep.amount)}đ</span>
                    <span class="history-dep-status text-gold">${dep.status}</span>
                </div>
            `;
            this.dom.depositHistoryList.appendChild(item);
        });
    }

    // --------------------------------------------------------------------------
    // 4. USER AUTHENTICATION HANDLERS
    // --------------------------------------------------------------------------
    handleLogin() {
        const username = this.dom.loginUsernameInput.value.trim().toLowerCase();
        const password = this.dom.loginPasswordInput.value;

        if (!username || !password) {
            this.dom.loginError.textContent = 'Vui lòng điền đầy đủ tên đăng nhập và mật khẩu.';
            return;
        }

        const user = this.users.find(u => u.username === username && u.password === password);
        if (!user) {
            this.dom.loginError.textContent = 'Tên đăng nhập hoặc mật khẩu không chính xác.';
            return;
        }

        // Login success
        this.currentUser = user;
        this.activeUsername = username;
        localStorage.setItem('tx_active_user', username);
        this.dom.loginError.textContent = '';
        
        // Init Audio Synth on click
        audioSynth.init();
        audioSynth.playLoginSound();

        // Screen transitioning
        this.showMainGameScreen();
    }

    handleRegister() {
        const username = this.dom.registerUsernameInput.value.trim().toLowerCase();
        const password = this.dom.registerPasswordInput.value;
        const confirmPass = this.dom.registerConfirmPasswordInput.value;

        if (!username || !password || !confirmPass) {
            this.dom.registerError.textContent = 'Vui lòng nhập đầy đủ thông tin.';
            return;
        }

        if (username.length < 4) {
            this.dom.registerError.textContent = 'Tên đăng nhập phải chứa ít nhất 4 ký tự.';
            return;
        }

        if (password.length < 6) {
            this.dom.registerError.textContent = 'Mật khẩu phải chứa ít nhất 6 ký tự.';
            return;
        }

        if (password !== confirmPass) {
            this.dom.registerError.textContent = 'Mật khẩu xác nhận không khớp.';
            return;
        }

        const userExists = this.users.find(u => u.username === username);
        if (userExists) {
            this.dom.registerError.textContent = 'Tên đăng nhập này đã tồn tại trên hệ thống.';
            return;
        }

        // Create user
        const newUser = {
            username: username,
            password: password,
            balance: 50000000, // 50 million initial
            history: []
        };

        this.users.push(newUser);
        localStorage.setItem('tx_users', JSON.stringify(this.users));

        this.currentUser = newUser;
        this.activeUsername = username;
        localStorage.setItem('tx_active_user', username);
        this.dom.registerError.textContent = '';

        audioSynth.init();
        audioSynth.playLoginSound();

        this.showMainGameScreen();
    }

    handleLogout() {
        this.activeUsername = null;
        this.currentUser = null;
        localStorage.removeItem('tx_active_user');

        // Stop all timers
        clearInterval(this.timerInterval);
        clearInterval(this.botInterval);
        clearInterval(this.chatInterval);

        // Reset display
        this.dom.loginUsernameInput.value = '';
        this.dom.loginPasswordInput.value = '';
        this.dom.registerUsernameInput.value = '';
        this.dom.registerPasswordInput.value = '';
        this.dom.registerConfirmPasswordInput.value = '';
        this.dom.loginError.textContent = '';
        this.dom.registerError.textContent = '';

        this.dom.authOverlay.classList.remove('hidden');
        this.dom.gameApp.classList.add('hidden');
    }

    // --------------------------------------------------------------------------
    // 5. CORE GAME LOOP & STATE SWITCHING
    // --------------------------------------------------------------------------
    startMainGameLoop() {
        this.setGameStage('BETTING');
        
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            // BOWL_REVEAL stage waits for user click, don't count down
            if (this.gameStage === 'BOWL_REVEAL') return;

            this.timer--;
            
            if (this.timer < 0) {
                this.advanceGameStage();
            } else {
                this.updateTimerUI();
            }
        }, 1000);
    }

    setGameStage(stage) {
        this.gameStage = stage;
        
        switch (stage) {
            case 'BETTING':
                this.timer = 30;
                this.updateTimerUI();
                this.dom.statusBanner.innerHTML = '<span class="pulse-dot"></span> ĐANG ĐẶT CƯỢC...';
                this.dom.statusBanner.className = 'game-status-banner text-gold';
                
                // Reset dice cup state fully
                this.dom.diceCup.classList.remove('lift-up', 'shake-animation', 'draggable', 'dragging', 'dragged-away');
                this.dom.diceCup.style.transform = '';
                this.dom.diceCup.style.opacity = '';
                this.isDraggingBowl = false;

                // Hide overlays/hints
                this.dom.bowlPeekHint.classList.remove('visible');
                this.dom.restOverlay.classList.remove('visible');

                // Clear bets counters
                this.resetPlacedBetsData();
                this.enableBettingControls(true);
                
                // Clear highlights
                this.dom.betXiu.classList.remove('win-flash', 'active-glow');
                this.dom.betTai.classList.remove('win-flash', 'active-glow');
                this.dom.betBao.classList.remove('win-flash', 'active-glow');

                // Bot betting simulation
                this.startBotBettingSimulation();
                break;

            case 'SHAKING':
                this.timer = 3;
                this.updateTimerUI();
                this.dom.statusBanner.textContent = 'ĐANG XÓC XÚC XẮC...';
                this.dom.statusBanner.className = 'game-status-banner text-muted';
                
                this.enableBettingControls(false);

                // Hide hints & reset drag state
                this.dom.bowlPeekHint.classList.remove('visible');
                this.dom.restOverlay.classList.remove('visible');
                this.dom.diceCup.classList.remove('draggable', 'dragging', 'dragged-away');
                this.dom.diceCup.style.transform = '';
                this.dom.diceCup.style.opacity = '';

                // Add shake classes and play sound
                this.dom.diceCup.classList.add('shake-animation');
                audioSynth.playShakeSound(3);
                
                // Clean bots betting interval
                clearInterval(this.botInterval);
                break;

            case 'BOWL_REVEAL':
                // Pause the timer - wait for user to drag the bowl
                this.timer = 0;
                this.updateTimerUI();
                this.dom.statusBanner.innerHTML = '<span class="text-gold">🖐️ KÉO BÁT ĐỂ SOI XÚC XẮC</span>';
                this.dom.statusBanner.className = 'game-status-banner text-gold';

                // Core Algorithm: Generate dice rolls NOW (before user peeks)
                this.rollDiceAlgorithm();

                // Stop shake, make cup draggable
                this.dom.diceCup.classList.remove('shake-animation');
                this.dom.diceCup.classList.add('draggable');

                // Show drag hint on the cup
                this.dom.bowlPeekHint.classList.add('visible');

                // Auto-advance fallback after 10 seconds if user doesn't drag
                this.bowlRevealTimeout = setTimeout(() => {
                    if (this.gameStage === 'BOWL_REVEAL') {
                        this.setGameStage('REVEALING');
                    }
                }, 10000);
                break;

            case 'REVEALING':
                this.timer = 2;
                this.updateTimerUI();
                this.dom.statusBanner.textContent = 'MỞ BÁT KẾT QUẢ!';
                this.dom.statusBanner.className = 'game-status-banner text-gold';

                // Clear auto-reveal timeout
                if (this.bowlRevealTimeout) {
                    clearTimeout(this.bowlRevealTimeout);
                    this.bowlRevealTimeout = null;
                }

                // Hide drag hint
                this.dom.bowlPeekHint.classList.remove('visible');

                // CSS 3D Rotations transition trigger (dice already rolled in BOWL_REVEAL)
                this.apply3DDiceTransitions();
                
                // Mark cup as dragged away (fade out at current drag position)
                this.dom.diceCup.classList.remove('draggable', 'dragging');
                this.dom.diceCup.classList.add('dragged-away');
                audioSynth.playCupLiftSound();
                break;

            case 'PAYOUT':
                this.timer = 4;
                this.updateTimerUI();
                
                const sum = this.currentDice.reduce((a, b) => a + b, 0);
                const rollValuesText = `(${this.currentDice.join(', ')})`;
                let resultType = 'xiu';
                
                if (this.currentDice[0] === this.currentDice[1] && this.currentDice[1] === this.currentDice[2]) {
                    resultType = 'bao';
                } else if (sum >= 11) {
                    resultType = 'tai';
                }

                // Highlight winning cell
                const winName = resultType === 'tai' ? 'TÀI' : (resultType === 'xiu' ? 'XỈU' : 'BÃO');
                const winColorClass = resultType === 'tai' ? 'text-red' : (resultType === 'xiu' ? 'text-cyan' : 'text-gold');
                
                this.dom.statusBanner.innerHTML = `<span class="${winColorClass}">${winName}</span> - ${sum} Điểm ${rollValuesText}`;
                
                if (resultType === 'tai') {
                    this.dom.betTai.classList.add('win-flash');
                } else if (resultType === 'xiu') {
                    this.dom.betXiu.classList.add('win-flash');
                } else {
                    this.dom.betBao.classList.add('win-flash');
                }

                // Calculate User Win/Loss and payout
                this.processUserPayout(resultType, sum);
                break;

            case 'REST':
                this.timer = 20;
                this.updateTimerUI();
                this.dom.statusBanner.innerHTML = '<span class="text-muted">⏳ NGHỈ GIỮA HIỆP</span>';
                this.dom.statusBanner.className = 'game-status-banner text-muted';

                // Reset cup position for next round
                this.dom.diceCup.classList.remove('lift-up', 'draggable', 'dragging', 'dragged-away');
                this.dom.diceCup.style.transform = '';
                this.dom.diceCup.style.opacity = '';

                // Show rest overlay on the plate
                this.dom.restOverlay.classList.add('visible');

                // Clear winning highlights
                this.dom.betXiu.classList.remove('win-flash', 'active-glow');
                this.dom.betTai.classList.remove('win-flash', 'active-glow');
                this.dom.betBao.classList.remove('win-flash', 'active-glow');
                break;
        }
    }

    advanceGameStage() {
        if (this.gameStage === 'BETTING') {
            this.setGameStage('SHAKING');
        } else if (this.gameStage === 'SHAKING') {
            this.setGameStage('BOWL_REVEAL');
        } else if (this.gameStage === 'BOWL_REVEAL') {
            // This should not be called by timer - BOWL_REVEAL advances via user drag
            this.setGameStage('REVEALING');
        } else if (this.gameStage === 'REVEALING') {
            this.setGameStage('PAYOUT');
        } else if (this.gameStage === 'PAYOUT') {
            this.setGameStage('REST');
        } else if (this.gameStage === 'REST') {
            this.dom.restOverlay.classList.remove('visible');
            this.setGameStage('BETTING');
        }
    }

    updateTimerUI() {
        this.dom.timerNumber.textContent = this.timer;
        
        // Map stage to total duration
        const stageDurations = {
            'BETTING': 30,
            'SHAKING': 3,
            'BOWL_REVEAL': 1, // No countdown, just show 0
            'REVEALING': 2,
            'PAYOUT': 4,
            'REST': 20
        };
        const totalDuration = stageDurations[this.gameStage] || 1;
        const progressPercent = this.timer / totalDuration;
        const circumference = 283; // 2 * PI * 45
        const offset = circumference * (1 - progressPercent);
        this.dom.timerProgress.style.strokeDashoffset = offset;

        // Change timer color based on stage
        if (this.gameStage === 'BETTING') {
            if (this.timer <= 5) {
                this.dom.timerProgress.style.stroke = 'var(--error)';
                this.dom.timerNumber.classList.add('text-red');
            } else {
                this.dom.timerProgress.style.stroke = 'var(--gold)';
                this.dom.timerNumber.classList.remove('text-red');
            }
        } else if (this.gameStage === 'SHAKING') {
            this.dom.timerProgress.style.stroke = '#64748b'; // slate gray
        } else if (this.gameStage === 'BOWL_REVEAL') {
            this.dom.timerProgress.style.stroke = 'var(--gold)';
        } else if (this.gameStage === 'REST') {
            this.dom.timerProgress.style.stroke = '#475569'; // dark slate
            this.dom.timerNumber.classList.remove('text-red');
        } else {
            this.dom.timerProgress.style.stroke = 'var(--success)';
        }
    }

    // --------------------------------------------------------------------------
    // 5b. BOWL DRAG HANDLERS (KÉO BÁT)
    // --------------------------------------------------------------------------
    onBowlDragStart(e) {
        if (this.gameStage !== 'BOWL_REVEAL') return;
        
        e.preventDefault();
        this.isDraggingBowl = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;

        this.dom.diceCup.classList.add('dragging');
        this.dom.diceCup.setPointerCapture(e.pointerId);

        // Hide hint once user starts dragging
        this.dom.bowlPeekHint.classList.remove('visible');
    }

    onBowlDragMove(e) {
        if (!this.isDraggingBowl) return;
        
        e.preventDefault();
        this.dragOffsetX = e.clientX - this.dragStartX;
        this.dragOffsetY = e.clientY - this.dragStartY;

        // Calculate distance from start
        const distance = Math.sqrt(this.dragOffsetX ** 2 + this.dragOffsetY ** 2);

        // Calculate rotation angle based on drag direction (subtle tilt)
        const angle = Math.atan2(this.dragOffsetY, this.dragOffsetX);
        const tiltDeg = Math.min(distance * 0.15, 25);

        // Dynamic opacity: fades as cup is dragged further
        const opacity = Math.max(0.1, 1 - distance / 150);

        // Apply transform: translate + rotate based on drag direction
        this.dom.diceCup.style.transform = `translate(${this.dragOffsetX}px, ${this.dragOffsetY}px) rotate(${tiltDeg * Math.sign(this.dragOffsetX)}deg)`;
        this.dom.diceCup.style.opacity = opacity;

        // Update status text based on drag distance
        if (distance > 50) {
            this.dom.statusBanner.innerHTML = '<span class="text-gold">🔥 THẢ ĐỂ MỞ BÁT!</span>';
        }
    }

    onBowlDragEnd(e) {
        if (!this.isDraggingBowl) return;
        
        this.isDraggingBowl = false;
        this.dom.diceCup.classList.remove('dragging');

        // Calculate total distance dragged
        const distance = Math.sqrt(this.dragOffsetX ** 2 + this.dragOffsetY ** 2);

        // Threshold: 80px from center to reveal
        if (distance >= 80) {
            // Success! Reveal the dice - cup stays at dragged position
            this.setGameStage('REVEALING');
        } else {
            // Snap back to center with smooth transition
            this.dom.diceCup.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease';
            this.dom.diceCup.style.transform = '';
            this.dom.diceCup.style.opacity = '';
            
            // Re-show the hint
            this.dom.bowlPeekHint.classList.add('visible');

            // Re-update status
            this.dom.statusBanner.innerHTML = '<span class="text-gold">🖐️ KÉO BÁT ĐỂ SOI XÚC XẮC</span>';

            // Remove transition after snap-back completes
            setTimeout(() => {
                if (this.gameStage === 'BOWL_REVEAL') {
                    this.dom.diceCup.style.transition = '';
                }
            }, 400);
        }
    }

    enableBettingControls(enable) {
        const updateClass = (el, val) => {
            if (val) el.classList.remove('disabled-area');
            else el.classList.add('disabled-area');
        };
        
        updateClass(this.dom.betXiu, enable);
        updateClass(this.dom.betTai, enable);
        updateClass(this.dom.betBao, enable);

        this.dom.btnBetClear.disabled = !enable || (this.userBets.xiu === 0 && this.userBets.tai === 0 && this.userBets.bao === 0);
        this.dom.btnBetDouble.disabled = !enable || (this.userBets.xiu === 0 && this.userBets.tai === 0 && this.userBets.bao === 0);
        this.dom.btnBetAllin.disabled = !enable;
    }

    resetPlacedBetsData() {
        this.userBets = { xiu: 0, tai: 0, bao: 0 };
        this.botBets = { xiu: 0, tai: 0, bao: 0 };
        
        this.dom.totalBetXiu.textContent = '0đ';
        this.dom.totalBetTai.textContent = '0đ';
        this.dom.totalBetBao.textContent = '0đ';

        this.dom.userBetIndicatorXiu.classList.add('hidden');
        this.dom.userBetIndicatorTai.classList.add('hidden');
        this.dom.userBetIndicatorBao.classList.add('hidden');

        // Clear chip visuals inside board grids
        this.dom.betXiu.querySelector('.chips-container-grid').innerHTML = '';
        this.dom.betTai.querySelector('.chips-container-grid').innerHTML = '';
        this.dom.betBao.querySelector('.chips-container-grid').innerHTML = '';
    }

    // --------------------------------------------------------------------------
    // 6. CORE DICE ROLL ALGORITHM (THE ENGINE)
    // --------------------------------------------------------------------------
    rollDiceAlgorithm() {
        const totalUserBet = this.userBets.xiu + this.userBets.tai + this.userBets.bao;
        
        // If rigged mode is ON and the player has active bets, intercept the result!
        if (this.isRiggedMode && totalUserBet > 0) {
            // Determine the player's primary bet direction (where they put the most money)
            let primaryBet = 'xiu';
            let maxBet = this.userBets.xiu;
            
            if (this.userBets.tai > maxBet) {
                primaryBet = 'tai';
                maxBet = this.userBets.tai;
            }
            if (this.userBets.bao > maxBet) {
                primaryBet = 'bao';
                maxBet = this.userBets.bao;
            }

            // Cycle state logic: 0: Win, 1: Win, 2: Lose
            const shouldWin = (this.userCycleIndex < 2);
            
            // Advance cycle
            this.userCycleIndex = (this.userCycleIndex + 1) % 3;

            console.log(`[Rigged Active] Chu kỳ ván thứ ${this.userCycleIndex === 0 ? 3 : this.userCycleIndex} - Mục tiêu: ${shouldWin ? 'THẮNG' : 'THUA'} - Cửa chính: ${primaryBet.toUpperCase()}`);

            let dice = [];
            let sum = 0;
            let isTriple = false;

            if (shouldWin) {
                // Force WIN
                if (primaryBet === 'bao') {
                    // Force a Triple (Any Triple)
                    const val = Math.floor(Math.random() * 6) + 1;
                    dice = [val, val, val];
                } else if (primaryBet === 'tai') {
                    // Force Tài (sum 11-17, not triple)
                    do {
                        dice = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
                        sum = dice[0] + dice[1] + dice[2];
                        isTriple = (dice[0] === dice[1] && dice[1] === dice[2]);
                    } while (sum < 11 || isTriple);
                } else {
                    // Force Xỉu (sum 4-10, not triple)
                    do {
                        dice = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
                        sum = dice[0] + dice[1] + dice[2];
                        isTriple = (dice[0] === dice[1] && dice[1] === dice[2]);
                    } while (sum > 10 || isTriple);
                }
            } else {
                // Force LOSE
                if (this.userBets.tai > 0 && this.userBets.xiu > 0) {
                    // Anti-hedging cheat: If they bet on both Tai & Xiu, force a Triple so they lose both!
                    const val = Math.floor(Math.random() * 6) + 1;
                    dice = [val, val, val];
                } else if (primaryBet === 'bao') {
                    // Force non-triple
                    do {
                        dice = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
                        isTriple = (dice[0] === dice[1] && dice[1] === dice[2]);
                    } while (isTriple);
                } else if (primaryBet === 'tai') {
                    // Force Xỉu (sum 4-10, no triple or occasionally a triple to bust them)
                    if (Math.random() < 0.1) {
                        const val = Math.floor(Math.random() * 6) + 1;
                        dice = [val, val, val];
                    } else {
                        do {
                            dice = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
                            sum = dice[0] + dice[1] + dice[2];
                            isTriple = (dice[0] === dice[1] && dice[1] === dice[2]);
                        } while (sum > 10 || isTriple);
                    }
                } else {
                    // Force Tài (sum 11-17, no triple)
                    if (Math.random() < 0.1) {
                        const val = Math.floor(Math.random() * 6) + 1;
                        dice = [val, val, val];
                    } else {
                        do {
                            dice = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
                            sum = dice[0] + dice[1] + dice[2];
                            isTriple = (dice[0] === dice[1] && dice[1] === dice[2]);
                        } while (sum < 11 || isTriple);
                    }
                }
            }

            this.currentDice = dice;
        } else {
            // Fair Mode / No player bet
            this.currentDice[0] = Math.floor(Math.random() * 6) + 1;
            this.currentDice[1] = Math.floor(Math.random() * 6) + 1;
            this.currentDice[2] = Math.floor(Math.random() * 6) + 1;
        }

        console.log(`[Result Roll] Kết quả xúc xắc: ${this.currentDice.join(', ')} (Tổng: ${this.currentDice[0] + this.currentDice[1] + this.currentDice[2]} - ${this.isRiggedMode ? 'Chế độ BỊP' : 'Công bằng'})`);
    }

    apply3DDiceTransitions() {
        const setDiceRotation = (diceNode, val) => {
            // Clear previous show classes
            diceNode.className = 'dice-cube';
            
            // Add a small rotation offset to make the 3D look slightly tilted on the table
            const randOffsetX = (Math.random() * 15 - 7.5);
            const randOffsetY = (Math.random() * 15 - 7.5);
            const randOffsetZ = (Math.random() * 15 - 7.5);

            let baseTransform = '';
            switch (val) {
                case 1: baseTransform = 'rotateX(0deg) rotateY(0deg)'; break;
                case 6: baseTransform = 'rotateY(180deg) rotateX(0deg)'; break;
                case 3: baseTransform = 'rotateY(-90deg) rotateX(0deg)'; break;
                case 4: baseTransform = 'rotateY(90deg) rotateX(0deg)'; break;
                case 5: baseTransform = 'rotateX(-90deg) rotateY(0deg)'; break;
                case 2: baseTransform = 'rotateX(90deg) rotateY(0deg)'; break;
            }

            // Combine rotation with random offsets to look natural on physics landing
            diceNode.style.transform = `${baseTransform} rotateX(${randOffsetX}deg) rotateY(${randOffsetY}deg) rotateZ(${randOffsetZ}deg)`;
        };

        // Give a fast spinning visual before applying results to simulate tumble rolling
        [this.dom.dice1, this.dom.dice2, this.dom.dice3].forEach((diceNode, index) => {
            const val = this.currentDice[index];
            
            // Simulate wild spin
            diceNode.style.transition = 'none';
            const spinRotX = Math.random() * 720 + 360;
            const spinRotY = Math.random() * 720 + 360;
            diceNode.style.transform = `rotateX(${spinRotX}deg) rotateY(${spinRotY}deg)`;
            
            // Forces reflow
            diceNode.offsetHeight;
            
            // Smoothly settle into final face rotation
            diceNode.style.transition = 'transform 1.2s cubic-bezier(0.18, 0.89, 0.32, 1.15)';
            setDiceRotation(diceNode, val);
        });
    }

    // --------------------------------------------------------------------------
    // 7. USER BETTING LOGIC & ANIMATIONS
    // --------------------------------------------------------------------------
    placeUserBet(areaType) {
        if (this.gameStage !== 'BETTING') return;

        const betAmount = this.activeChipValue;
        if (this.currentUser.balance < betAmount) {
            this.addChatMessage("Hệ Thống", "Số dư tài khoản không đủ để đặt cược!", "sys");
            audioSynth.playLoseSound();
            return;
        }

        // Deduct from balance
        this.currentUser.balance -= betAmount;
        this.updateUserBalanceUI();

        // Increment user bets
        this.userBets[areaType] += betAmount;
        
        // Play chip audio
        audioSynth.playChipSound();

        // Visual animations
        this.showFlyingChipAnimation(areaType, this.activeChipValue);
        this.updateUserBetIndicatorUI(areaType);
        this.updateBoardTotalBetsUI();
        
        // Save current user stats locally
        this.saveUsersToLocalStorage();

        // Enable buttons
        this.dom.btnBetClear.disabled = false;
        this.dom.btnBetDouble.disabled = false;
    }

    updateUserBetIndicatorUI(areaType) {
        const totalBetOnArea = this.userBets[areaType];
        let indicator, valNode;
        
        if (areaType === 'xiu') {
            indicator = this.dom.userBetIndicatorXiu;
            valNode = this.dom.userBetValXiu;
        } else if (areaType === 'tai') {
            indicator = this.dom.userBetIndicatorTai;
            valNode = this.dom.userBetValTai;
        } else {
            indicator = this.dom.userBetIndicatorBao;
            valNode = this.dom.userBetValBao;
        }

        valNode.textContent = this.formatCurrency(totalBetOnArea) + 'đ';
        indicator.classList.remove('hidden');
    }

    updateBoardTotalBetsUI() {
        const totalXiu = this.userBets.xiu + this.botBets.xiu;
        const totalTai = this.userBets.tai + this.botBets.tai;
        const totalBao = this.userBets.bao + this.botBets.bao;

        this.dom.totalBetXiu.textContent = this.formatCurrency(totalXiu) + 'đ';
        this.dom.totalBetTai.textContent = this.formatCurrency(totalTai) + 'đ';
        this.dom.totalBetBao.textContent = this.formatCurrency(totalBao) + 'đ';
    }

    clearUserBets() {
        if (this.gameStage !== 'BETTING') return;
        
        const refundAmount = this.userBets.xiu + this.userBets.tai + this.userBets.bao;
        if (refundAmount === 0) return;

        // Refund balance
        this.currentUser.balance += refundAmount;
        this.updateUserBalanceUI();

        // Reset round bets
        this.userBets = { xiu: 0, tai: 0, bao: 0 };

        // Hide indicators
        this.dom.userBetIndicatorXiu.classList.add('hidden');
        this.dom.userBetIndicatorTai.classList.add('hidden');
        this.dom.userBetIndicatorBao.classList.add('hidden');

        // Remove only user chips (we can identify them, but simpler to clear and let bots redraw, or just clear HTML of user chips. Let's clear and rebuild bot chips)
        this.dom.betXiu.querySelector('.chips-container-grid').innerHTML = '';
        this.dom.betTai.querySelector('.chips-container-grid').innerHTML = '';
        this.dom.betBao.querySelector('.chips-container-grid').innerHTML = '';
        
        this.updateBoardTotalBetsUI();
        audioSynth.playTone(300, 'triangle', 0.15, 0.2); // clear sound effect

        this.dom.btnBetClear.disabled = true;
        this.dom.btnBetDouble.disabled = true;
        
        this.saveUsersToLocalStorage();
    }

    doubleUserBets() {
        if (this.gameStage !== 'BETTING') return;
        
        const extraRequired = this.userBets.xiu + this.userBets.tai + this.userBets.bao;
        if (extraRequired === 0) return;

        if (this.currentUser.balance < extraRequired) {
            this.addChatMessage("Hệ Thống", "Số dư tài khoản không đủ để gấp đôi cược!", "sys");
            audioSynth.playLoseSound();
            return;
        }

        // Deduct
        this.currentUser.balance -= extraRequired;
        this.updateUserBalanceUI();

        // Double values
        ['xiu', 'tai', 'bao'].forEach(type => {
            if (this.userBets[type] > 0) {
                this.showFlyingChipAnimation(type, this.userBets[type]); // animate massive chips
                this.userBets[type] *= 2;
                this.updateUserBetIndicatorUI(type);
            }
        });

        this.updateBoardTotalBetsUI();
        audioSynth.playChipSound();
        this.saveUsersToLocalStorage();
    }

    allinUserBets() {
        if (this.gameStage !== 'BETTING') return;

        const balance = this.currentUser.balance;
        if (balance <= 0) {
            this.addChatMessage("Hệ Thống", "Hết tiền rồi cược Tất Tay làm sao được!", "sys");
            audioSynth.playLoseSound();
            return;
        }

        // Determine active side user bets mostly, or default to Xỉu if empty
        let targetArea = 'xiu';
        if (this.userBets.tai > this.userBets.xiu) targetArea = 'tai';
        else if (this.userBets.bao > this.userBets.tai && this.userBets.bao > this.userBets.xiu) targetArea = 'bao';
        else {
            // Select active tab highlighting or mouse hover, otherwise default to Tài
            targetArea = 'tai';
        }

        this.currentUser.balance = 0;
        this.updateUserBalanceUI();

        this.userBets[targetArea] += balance;
        this.updateUserBetIndicatorUI(targetArea);
        this.showFlyingChipAnimation(targetArea, balance);

        this.updateBoardTotalBetsUI();
        
        // Heavy bass drops for ALL-IN!
        audioSynth.playTone(120, 'triangle', 0.5, 0.6);
        setTimeout(() => audioSynth.playTone(180, 'sine', 0.3, 0.4), 100);

        this.dom.btnBetClear.disabled = false;
        this.dom.btnBetDouble.disabled = false;

        this.saveUsersToLocalStorage();
    }

    showFlyingChipAnimation(areaType, value) {
        let areaNode;
        if (areaType === 'xiu') areaNode = this.dom.betXiu;
        else if (areaType === 'tai') areaNode = this.dom.betTai;
        else areaNode = this.dom.betBao;

        const gridNode = areaNode.querySelector('.chips-container-grid');
        
        // Chip color styles
        let color = '#f59e0b';
        let label = '10K';
        if (value >= 5000000) { color = '#ef4444'; label = '5M'; }
        else if (value >= 1000000) { color = '#ec4899'; label = '1M'; }
        else if (value >= 500000) { color = '#f59e0b'; label = '500K'; }
        else if (value >= 100000) { color = '#10b981'; label = '100K'; }
        else if (value >= 50000) { color = '#06b6d4'; label = '50K'; }
        else { color = '#6366f1'; label = '10K'; }

        // Create chip element
        const chip = document.createElement('div');
        chip.className = 'placed-chip';
        chip.textContent = label;
        chip.style.setProperty('--placed-color', color);
        
        // Random position inside betting card
        const randX = 15 + Math.random() * 70; // Percentages
        const randY = 15 + Math.random() * 70;
        chip.style.left = `${randX}%`;
        chip.style.top = `${randY}%`;

        // Add 3D rotation randomly to chips to make stack look natural
        const randomRot = Math.random() * 360;
        chip.style.transform = `translate(-50%, -50%) rotate(${randomRot}deg)`;

        gridNode.appendChild(chip);
    }

    // --------------------------------------------------------------------------
    // 8. PAYOUT PROCESSING (FINANCIAL ENGINE)
    // --------------------------------------------------------------------------
    processUserPayout(resultType, diceSum) {
        let winAmount = 0;
        let totalInvested = this.userBets.xiu + this.userBets.tai + this.userBets.bao;

        if (totalInvested === 0) {
            // User did not bet, do nothing
            this.advancePayoutCycle(resultType, diceSum, 0, 0);
            return;
        }

        // Calculate payout
        if (resultType === 'bao') {
            // Triple: Tài and Xỉu bets lose.
            if (this.userBets.bao > 0) {
                // Triple cược payout is 1 to 30 (pays original bet + 30x)
                winAmount += this.userBets.bao * 31;
            }
        } else if (resultType === 'tai') {
            if (this.userBets.tai > 0) {
                winAmount += this.userBets.tai * 2; // payout 1:1
            }
        } else if (resultType === 'xiu') {
            if (this.userBets.xiu > 0) {
                winAmount += this.userBets.xiu * 2; // payout 1:1
            }
        }

        const netProfit = winAmount - totalInvested;

        // Apply to User balance
        this.currentUser.balance += winAmount;
        this.updateUserBalanceUI();

        // Broadcast notifications
        if (netProfit > 0) {
            audioSynth.playWinSound();
            this.addChatMessage("Hệ Thống", `Chúc mừng! Bạn đã thắng lớn +${this.formatCurrency(netProfit)}đ`, "sys");
            this.showWinFloatingText(netProfit);
        } else {
            audioSynth.playLoseSound();
            this.addChatMessage("Hệ Thống", `Rất tiếc! Bạn đã thua -${this.formatCurrency(totalInvested)}đ. Chúc bạn may mắn lần sau.`, "sys");
        }

        this.advancePayoutCycle(resultType, diceSum, netProfit, winAmount);
    }

    advancePayoutCycle(resultType, diceSum, netProfit, winAmount) {
        // Add to statistics history
        const roundData = {
            dice: [...this.currentDice],
            sum: diceSum,
            result: resultType
        };

        this.history.push(roundData);
        if (this.history.length > 100) this.history.shift(); // Keep last 100 rounds

        // Save history in current user profile
        this.currentUser.history = this.history;
        this.saveUsersToLocalStorage();

        // Re-render SOI CAU charts
        this.renderHistoryDotsStrip();
        this.renderBeadPlateGrid();
        this.renderTrendLineSvg();
        this.calculateHistoryPercentages();

        // Trigger bot reactions based on win or loss
        this.triggerBotsReactionsAfterResult(resultType);
    }

    showWinFloatingText(amount) {
        // Spawn floating text on center of screen
        const text = document.createElement('div');
        text.className = 'floating-win-text';
        text.innerHTML = `<i class="fa-solid fa-trophy"></i> +${this.formatCurrency(amount)}đ`;
        
        // Append to dice plate area
        this.dom.dicePlate.appendChild(text);
        
        // Remove after animation finishes
        setTimeout(() => {
            text.remove();
        }, 2200);
    }

    // --------------------------------------------------------------------------
    // 9. BOTS BETTING & CHAT SIMULATOR
    // --------------------------------------------------------------------------
    startBotBettingSimulation() {
        // Randomize bot users count
        this.botUsersCount.xiu = 50 + Math.floor(Math.random() * 120);
        this.botUsersCount.tai = 50 + Math.floor(Math.random() * 120);
        
        this.dom.usersCountXiu.textContent = `${this.botUsersCount.xiu} người đặt`;
        this.dom.usersCountTai.textContent = `${this.botUsersCount.tai} người đặt`;

        // Every 0.4s to 1.2s, bots place chips
        if (this.botInterval) clearInterval(this.botInterval);
        
        this.botInterval = setInterval(() => {
            if (this.gameStage !== 'BETTING') return;

            const sides = ['xiu', 'tai', 'bao'];
            // Bots bet weights: 48% Tai, 48% Xiu, 4% Bao
            const rand = Math.random();
            const chosenSide = rand < 0.48 ? 'xiu' : (rand < 0.96 ? 'tai' : 'bao');
            
            // Random chips values
            const chipValues = [10000, 50000, 100000, 500000, 1000000];
            const randVal = chipValues[Math.floor(Math.random() * chipValues.length)];

            this.botBets[chosenSide] += randVal;
            this.updateBoardTotalBetsUI();

            // Sometime animate chip flying for bots to look alive (but limit counts to prevent lag)
            if (Math.random() < 0.3) {
                this.showFlyingChipAnimation(chosenSide, randVal);
            }
        }, 350);
    }

    simulateActiveOnlineUsers() {
        let baseCount = 1248;
        this.dom.onlineCounter.textContent = this.formatNumber(baseCount + Math.floor(Math.random() * 100 - 50));
        
        setInterval(() => {
            const jitter = Math.floor(Math.random() * 10 - 5);
            baseCount += jitter;
            this.dom.onlineCounter.textContent = this.formatNumber(baseCount);
        }, 4000);
    }

    generateInitialChatLogs() {
        // Prefill some messages so chat isn't blank
        for (let i = 0; i < 6; i++) {
            const bot = BOTS[Math.floor(Math.random() * BOTS.length)];
            const msgs = BOT_MESSAGES.BETTING;
            const text = msgs[Math.floor(Math.random() * msgs.length)];
            this.addChatMessage(bot.name, text, bot.vip, false);
        }

        // Set interval for ongoing chat comments
        if (this.chatInterval) clearInterval(this.chatInterval);
        this.chatInterval = setInterval(() => {
            const bot = BOTS[Math.floor(Math.random() * BOTS.length)];
            
            let pool = BOT_MESSAGES.BETTING;
            if (this.gameStage === 'SHAKING') pool = BOT_MESSAGES.SHAKING;
            
            const text = pool[Math.floor(Math.random() * pool.length)];
            this.addChatMessage(bot.name, text, bot.vip);
        }, 5500);
    }

    triggerBotsReactionsAfterResult(resultType) {
        // Trigger 2-3 bots reacting to the round result
        const count = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const bot = BOTS[Math.floor(Math.random() * BOTS.length)];
                
                // Determine if bot won (simplified random allocation)
                const won = Math.random() < 0.45;
                const pool = won ? BOT_MESSAGES.WIN : BOT_MESSAGES.LOSE;
                const text = pool[Math.floor(Math.random() * pool.length)];
                
                this.addChatMessage(bot.name, text, bot.vip);
            }, 600 + i * 800);
        }
    }

    handleUserSendChatMessage() {
        const text = this.dom.chatInputMsg.value.trim();
        if (!text) return;

        // Post user message
        this.addChatMessage(this.currentUser.username, text, "VIP 3 (Hội Viên)", true);
        this.dom.chatInputMsg.value = '';

        // Auto Bot replies sometimes to user! (Extremely high-quality feel)
        setTimeout(() => {
            const bot = BOTS[Math.floor(Math.random() * BOTS.length)];
            const replies = [
                `Chào bác @${this.currentUser.username}, cầu ván tới đánh gì thế?`,
                `Chuẩn luôn bác @${this.currentUser.username}!`,
                `Tôi lại nghĩ khác bác @${this.currentUser.username} mất rồi.`,
                `Chúc bác @${this.currentUser.username} húp đậm nhé!`,
                `Bác @${this.currentUser.username} uy tín vãi haha.`
            ];
            const botText = replies[Math.floor(Math.random() * replies.length)];
            this.addChatMessage(bot.name, botText, bot.vip);
        }, 1500 + Math.random() * 1000);
    }

    addChatMessage(sender, message, badgeInfo = null, isUser = false) {
        const msgItem = document.createElement('div');
        msgItem.className = 'chat-message-item';
        if (isUser) msgItem.classList.add('self-msg');
        if (badgeInfo === 'sys') msgItem.classList.add('system-msg');

        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Header Row (Name & badges & Time)
        const headerRow = document.createElement('div');
        headerRow.className = 'msg-header-row';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'msg-username';
        
        // Add badges
        if (badgeInfo) {
            const badge = document.createElement('span');
            if (badgeInfo === 'sys') {
                badge.className = 'msg-badge badge-sys';
                badge.textContent = 'Hệ Thống';
                nameSpan.appendChild(badge);
                nameSpan.appendChild(document.createTextNode(' ' + sender));
            } else if (typeof badgeInfo === 'number') {
                badge.className = 'msg-badge badge-vip';
                badge.textContent = `VIP ${badgeInfo}`;
                badge.style.background = `linear-gradient(135deg, var(--gold) 0%, #d97706 100%)`;
                nameSpan.appendChild(badge);
                nameSpan.appendChild(document.createTextNode(' ' + sender));
            } else {
                badge.className = 'msg-badge badge-vip';
                badge.textContent = badgeInfo; // String badge
                nameSpan.appendChild(badge);
                nameSpan.appendChild(document.createTextNode(' ' + sender));
            }
        } else {
            nameSpan.textContent = sender;
        }

        const timeSpan = document.createElement('span');
        timeSpan.className = 'msg-time';
        timeSpan.textContent = timeStr;

        headerRow.appendChild(nameSpan);
        headerRow.appendChild(timeSpan);

        // Content Row
        const contentDiv = document.createElement('div');
        contentDiv.className = 'msg-content';
        contentDiv.textContent = message;

        msgItem.appendChild(headerRow);
        msgItem.appendChild(contentDiv);

        this.dom.chatMessages.appendChild(msgItem);

        // Scroll to bottom
        this.dom.chatMessages.scrollTop = this.dom.chatMessages.scrollHeight;

        // Cleanup messages if too many (keep last 50)
        if (this.dom.chatMessages.children.length > 50) {
            this.dom.chatMessages.removeChild(this.dom.chatMessages.firstChild);
        }
    }

    // --------------------------------------------------------------------------
    // 10. STATISTICS & CHART SOI CẦU RENDERERS
    // --------------------------------------------------------------------------
    generateMockHistory(count) {
        const outcomes = [];
        let curTime = Date.now();
        for (let i = 0; i < count; i++) {
            const dice = [
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1
            ];
            const sum = dice.reduce((a, b) => a + b, 0);
            let result = 'xiu';
            
            if (dice[0] === dice[1] && dice[1] === dice[2]) {
                result = 'bao';
            } else if (sum >= 11) {
                result = 'tai';
            }

            outcomes.push({ dice, sum, result });
        }
        this.history = outcomes;
        this.currentUser.history = this.history;
        this.saveUsersToLocalStorage();
    }

    renderHistoryDotsStrip() {
        this.dom.historyStrip.innerHTML = '';
        
        // Take latest 12 entries
        const latest = this.history.slice(-12);
        
        latest.forEach(item => {
            const dot = document.createElement('div');
            dot.className = `history-strip-dot ${item.result}`;
            
            const isBao = item.result === 'bao';
            dot.textContent = isBao ? 'B' : (item.result === 'tai' ? 'T' : 'X');
            dot.title = `Tổng: ${item.sum} điểm (Mặt: ${item.dice.join(', ')})`;
            
            this.dom.historyStrip.appendChild(dot);
        });
    }

    renderBeadPlateGrid() {
        this.dom.beadPlateContainer.innerHTML = '';
        
        // Grid size is 6 rows, 14 columns
        const rowsCount = 6;
        const colsCount = 14;
        const totalCells = rowsCount * colsCount;
        
        // Take LATEST 84 items to fill the bead plate
        const latestHistory = this.history.slice(-totalCells);
        
        const matrix = Array(rowsCount).fill(null).map(() => Array(colsCount).fill(null));
        
        let currentHistoryIndex = 0;
        
        for (let col = 0; col < colsCount; col++) {
            for (let row = 0; row < rowsCount; row++) {
                if (currentHistoryIndex < latestHistory.length) {
                    matrix[row][col] = latestHistory[currentHistoryIndex];
                    currentHistoryIndex++;
                } else {
                    break;
                }
            }
        }

        // Render matrix elements
        for (let row = 0; row < rowsCount; row++) {
            for (let col = 0; col < colsCount; col++) {
                const cellData = matrix[row][col];
                const cell = document.createElement('div');
                cell.className = 'bead-cell';
                
                if (cellData) {
                    const bead = document.createElement('div');
                    bead.className = `bead-item ${cellData.result}`;
                    bead.textContent = cellData.sum;
                    bead.title = `Tổng: ${cellData.sum} (${cellData.dice.join(', ')})`;
                    cell.appendChild(bead);
                }
                
                this.dom.beadPlateContainer.appendChild(cell);
            }
        }
    }

    renderTrendLineSvg() {
        this.dom.trendSvg.innerHTML = '';

        // Render trend lines for the last 15 games
        const last15 = this.history.slice(-15);
        if (last15.length === 0) return;

        const width = 450;
        const height = 150;
        const padding = 20;

        // Distribute coordinates dynamically based on the actual count
        const xStep = last15.length > 1 ? (width - padding * 2) / (last15.length - 1) : 0;
        const yMin = 3;  // Minimum total dice score
        const yMax = 18; // Maximum score
        const yScale = (height - padding * 2) / (yMax - yMin);

        // Build path coordinates string
        let pointsCoords = [];
        let pathsString = '';

        last15.forEach((item, index) => {
            const x = padding + index * xStep;
            const y = height - padding - (item.sum - yMin) * yScale;
            pointsCoords.push({ x, y, data: item });
        });

        // 1. Draw horizontal dividing line at 10.5 (Tài/Xỉu divider line)
        const lineY10_5 = height - padding - (10.5 - yMin) * yScale;
        const dividerLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        dividerLine.setAttribute("x1", padding);
        dividerLine.setAttribute("y1", lineY10_5);
        dividerLine.setAttribute("x2", width - padding);
        dividerLine.setAttribute("y2", lineY10_5);
        dividerLine.setAttribute("stroke", "rgba(255,255,255,0.06)");
        dividerLine.setAttribute("stroke-width", "2");
        dividerLine.setAttribute("stroke-dasharray", "4 4");
        this.dom.trendSvg.appendChild(dividerLine);

        // 2. Draw trend line paths
        if (pointsCoords.length > 1) {
            let pathD = `M ${pointsCoords[0].x} ${pointsCoords[0].y}`;
            for (let i = 1; i < pointsCoords.length; i++) {
                pathD += ` L ${pointsCoords[i].x} ${pointsCoords[i].y}`;
            }
            
            const polyline = document.createElementNS("http://www.w3.org/2000/svg", "path");
            polyline.setAttribute("d", pathD);
            polyline.setAttribute("fill", "none");
            polyline.setAttribute("stroke", "rgba(245, 158, 11, 0.45)");
            polyline.setAttribute("stroke-width", "3");
            polyline.setAttribute("stroke-linecap", "round");
            polyline.setAttribute("stroke-linejoin", "round");
            this.dom.trendSvg.appendChild(polyline);
        }

        // 3. Draw glowing circles at result nodes
        pointsCoords.forEach(pt => {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", pt.x);
            circle.setAttribute("cy", pt.y);
            circle.setAttribute("r", "5");

            let color = 'var(--xiu-cyan)';
            if (pt.data.result === 'tai') color = 'var(--tai-red)';
            else if (pt.data.result === 'bao') color = 'var(--gold)';

            circle.setAttribute("fill", color);
            circle.setAttribute("stroke", "#090d16");
            circle.setAttribute("stroke-width", "1.5");
            circle.setAttribute("style", `filter: drop-shadow(0 0 4px ${color}); cursor: pointer;`);
            
            // Add SVG title tooltips
            const tooltip = document.createElementNS("http://www.w3.org/2000/svg", "title");
            tooltip.textContent = `${pt.data.result === 'tai' ? 'Tài' : (pt.data.result === 'xiu' ? 'Xỉu' : 'Bão')} - ${pt.data.sum} điểm (${pt.data.dice.join(',')})`;
            circle.appendChild(tooltip);

            this.dom.trendSvg.appendChild(circle);

            // Add small text of score above node
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", pt.x);
            text.setAttribute("y", pt.y - 8);
            text.setAttribute("fill", "rgba(255,255,255,0.7)");
            text.setAttribute("font-size", "8");
            text.setAttribute("font-family", "var(--font-digital)");
            text.setAttribute("text-anchor", "middle");
            text.textContent = pt.data.sum;
            this.dom.trendSvg.appendChild(text);
        });
    }

    calculateHistoryPercentages() {
        if (this.history.length === 0) return;

        let taiCount = 0;
        let xiuCount = 0;
        let baoCount = 0;

        this.history.forEach(item => {
            if (item.result === 'tai') taiCount++;
            else if (item.result === 'xiu') xiuCount++;
            else if (item.result === 'bao') {
                baoCount++;
            }
        });

        const total = this.history.length;
        const xiuPercent = Math.round((xiuCount / total) * 100);
        const taiPercent = Math.round((taiCount / total) * 100);

        this.dom.txtPercentXiu.textContent = xiuPercent;
        this.dom.txtPercentTai.textContent = taiPercent;

        this.dom.barPercentXiu.style.width = `${xiuPercent}%`;
        this.dom.barPercentTai.style.width = `${taiPercent}%`;

        // Update card stats footer info
        this.dom.totalRoundsCount.textContent = total;
        this.dom.totalBaosCount.textContent = baoCount;

        // Calculate longest streak (bệt cầu)
        let longest = 0;
        let currentStreak = 0;
        let streakType = null;

        this.history.forEach(item => {
            if (item.result === streakType) {
                currentStreak++;
            } else {
                streakType = item.result;
                currentStreak = 1;
            }
            if (currentStreak > longest) longest = currentStreak;
        });

        this.dom.longestStreak.textContent = longest;
    }

    // --------------------------------------------------------------------------
    // 11. LOCAL DATA PERSISTENCE & HELPERS
    // --------------------------------------------------------------------------
    saveUsersToLocalStorage() {
        if (this.currentUser) {
            const index = this.users.findIndex(u => u.username === this.currentUser.username);
            if (index !== -1) {
                this.users[index] = this.currentUser;
                localStorage.setItem('tx_users', JSON.stringify(this.users));
            }
        }
    }

    formatCurrency(val) {
        return new Intl.NumberFormat('vi-VN').format(val);
    }

    formatNumber(val) {
        return new Intl.NumberFormat('en-US').format(val);
    }
}

// Instantiate and initialize the app
const game = new GameController();
document.addEventListener('DOMContentLoaded', () => {
    game.init();
});
