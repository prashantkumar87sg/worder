class WordReaderGame {
    constructor() {
        this.wordBlocks = document.querySelectorAll('.word-block');
        this.recordingIndicator = document.getElementById('recordingIndicator');
        this.countdownElement = document.getElementById('countdown');
        this.successSound = document.getElementById('successSound');
        this.confettiCanvas = document.getElementById('confetti');
        this.recognition = null;
        this.isRecording = false;
        this.currentBlock = null;
        this.successCount = 0;
        this.microphonePermissionGranted = false;
        
        this.initSpeechRecognition();
        this.initConfetti();
        this.setupEventListeners();
        this.loadNewWords();
        this.requestMicrophonePermission();
    }

    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase().trim();
                this.handleSpeechResult(transcript);
            };
            
            this.recognition.onerror = (event) => {
                console.log('Speech recognition error:', event.error);
                if (event.error === 'not-allowed') {
                    this.microphonePermissionGranted = false;
                    this.showPermissionMessage();
                }
                this.stopRecording();
            };
            
            this.recognition.onend = () => {
                this.stopRecording();
            };
        } else {
            alert('Speech recognition is not supported in this browser. Please use Chrome.');
        }
    }

    requestMicrophonePermission() {
        // Check if we already have permission
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'microphone' }).then(permissionStatus => {
                if (permissionStatus.state === 'granted') {
                    this.microphonePermissionGranted = true;
                } else if (permissionStatus.state === 'denied') {
                    this.showPermissionMessage();
                } else {
                    // Permission not determined yet, request it
                    this.requestPermissionOnce();
                }
                
                // Listen for permission changes
                permissionStatus.onchange = () => {
                    this.microphonePermissionGranted = permissionStatus.state === 'granted';
                };
            });
        } else {
            // Fallback for browsers that don't support permissions API
            this.requestPermissionOnce();
        }
    }

    requestPermissionOnce() {
        // Create a temporary recognition instance to request permission
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const tempRecognition = new SpeechRecognition();
            tempRecognition.continuous = false;
            tempRecognition.interimResults = false;
            tempRecognition.lang = 'en-US';
            
            tempRecognition.onstart = () => {
                this.microphonePermissionGranted = true;
                tempRecognition.stop();
            };
            
            tempRecognition.onerror = (event) => {
                if (event.error === 'not-allowed') {
                    this.microphonePermissionGranted = false;
                    this.showPermissionMessage();
                }
            };
            
            tempRecognition.onend = () => {
                // Clean up temporary recognition
            };
            
            // Start and immediately stop to request permission
            tempRecognition.start();
            setTimeout(() => {
                tempRecognition.stop();
            }, 100);
        }
    }

    showPermissionMessage() {
        const message = document.createElement('div');
        message.className = 'permission-message';
        message.innerHTML = `
            <div class="permission-content">
                <h3>🎤 Microphone Permission Needed</h3>
                <p>This app needs microphone access to hear you read the words.</p>
                <p>Please allow microphone access when prompted by your browser.</p>
                <button onclick="this.parentElement.parentElement.remove()">Got it!</button>
            </div>
        `;
        document.body.appendChild(message);
    }

    initConfetti() {
        this.confettiCanvas.width = window.innerWidth;
        this.confettiCanvas.height = window.innerHeight;
        this.confettiCtx = this.confettiCanvas.getContext('2d');
    }

    setupEventListeners() {
        this.wordBlocks.forEach(block => {
            block.addEventListener('click', () => {
                if (!this.isRecording && !block.classList.contains('success')) {
                    this.startRecording(block);
                }
            });
        });

        // Handle window resize for confetti canvas
        window.addEventListener('resize', () => {
            this.confettiCanvas.width = window.innerWidth;
            this.confettiCanvas.height = window.innerHeight;
        });
    }

    loadNewWords() {
        const newWords = getRandomWords(6);
        this.wordBlocks.forEach((block, index) => {
            const word = newWords[index];
            block.dataset.word = word;
            block.querySelector('.word').textContent = word;
            block.classList.remove('success', 'error', 'recording');
        });
        this.successCount = 0;
    }

    startRecording(block) {
        if (!this.recognition) return;
        
        // Check if we have microphone permission
        if (!this.microphonePermissionGranted) {
            this.requestPermissionOnce();
            return;
        }
        
        this.currentBlock = block;
        this.isRecording = true;
        
        // Visual feedback
        block.classList.add('recording');
        this.recordingIndicator.classList.add('show');
        
        // Start countdown
        let countdown = 3;
        this.countdownElement.textContent = countdown;
        
        const countdownInterval = setInterval(() => {
            countdown--;
            this.countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                this.stopRecording();
            }
        }, 1000);
        
        // Start speech recognition
        this.recognition.start();
    }

    stopRecording() {
        if (this.recognition) {
            this.recognition.stop();
        }
        
        this.isRecording = false;
        
        if (this.currentBlock) {
            this.currentBlock.classList.remove('recording');
        }
        
        this.recordingIndicator.classList.remove('show');
        this.currentBlock = null;
    }

    handleSpeechResult(transcript) {
        if (!this.currentBlock) return;
        
        const expectedWord = this.currentBlock.dataset.word.toLowerCase();
        const isCorrect = transcript.includes(expectedWord) || expectedWord.includes(transcript);
        
        if (isCorrect) {
            this.handleSuccess();
        } else {
            this.handleError();
        }
    }

    handleSuccess() {
        this.currentBlock.classList.add('success');
        this.successCount++;
        
        // Check if all words are completed
        if (this.successCount === 6) {
            setTimeout(() => {
                this.playSuccessSound();
                this.showConfetti();
                setTimeout(() => {
                    this.loadNewWords();
                }, 3000);
            }, 500);
        }
    }

    handleError() {
        this.currentBlock.classList.add('error');
        
        // Remove error class after animation
        setTimeout(() => {
            this.currentBlock.classList.remove('error');
        }, 500);
    }

    playSuccessSound() {
        if (this.successSound) {
            this.successSound.currentTime = 0;
            this.successSound.play().catch(e => console.log('Audio play failed:', e));
        }
    }

    showConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
        const confettiCount = 200;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                this.createConfetti(colors[Math.floor(Math.random() * colors.length)]);
            }, i * 10);
        }
    }

    createConfetti(color) {
        const x = Math.random() * this.confettiCanvas.width;
        const y = -10;
        const size = Math.random() * 10 + 5;
        const speedX = Math.random() * 6 - 3;
        const speedY = Math.random() * 3 + 2;
        const rotation = Math.random() * 360;
        const rotationSpeed = Math.random() * 10 - 5;
        
        let currentY = y;
        let currentX = x;
        let currentRotation = rotation;
        
        const animate = () => {
            this.confettiCtx.save();
            this.confettiCtx.translate(currentX, currentY);
            this.confettiCtx.rotate(currentRotation * Math.PI / 180);
            this.confettiCtx.fillStyle = color;
            this.confettiCtx.fillRect(-size/2, -size/2, size, size);
            this.confettiCtx.restore();
            
            currentY += speedY;
            currentX += speedX;
            currentRotation += rotationSpeed;
            
            if (currentY < this.confettiCanvas.height) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WordReaderGame();
}); 