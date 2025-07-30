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
                const transcript = event.results[0][0].transcript;
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
        this.recordedTranscript = ''; // Store the transcript
        
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
                this.evaluateResult(); // Evaluate after full 3 seconds
                setTimeout(() => {
                    this.stopRecording();
                }, 100); // Small delay to ensure evaluation completes
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

    evaluateResult() {
        if (!this.currentBlock || !this.recordedTranscript) {
            // No speech detected, treat as incorrect
            const blockToUpdate = this.currentBlock;
            this.handleError(blockToUpdate);
            return;
        }
        
        // Store reference to current block before it gets nulled
        const blockToUpdate = this.currentBlock;
        const expectedWord = this.currentBlock.dataset.word.toLowerCase();
        const cleanTranscript = this.recordedTranscript.toLowerCase().trim();
        
        // Debug: Log what was heard vs expected
        console.log(`Expected: "${expectedWord}", Heard: "${cleanTranscript}"`);
        
        // Show debug info on screen (temporary)
        this.showDebugInfo(expectedWord, cleanTranscript);
        
        // More flexible matching logic
        const isCorrect = this.matchWord(cleanTranscript, expectedWord);
        
        if (isCorrect) {
            this.handleSuccess(blockToUpdate);
        } else {
            this.handleError(blockToUpdate);
        }
    }

    handleSpeechResult(transcript) {
        if (!this.currentBlock) return;
        
        // Store the transcript for evaluation after 3 seconds
        this.recordedTranscript = transcript;
        
        // Don't evaluate immediately - wait for the full 3 seconds
        console.log(`Speech detected: "${transcript}" - waiting for full 3 seconds...`);
    }

    showDebugInfo(expected, heard) {
        // Create or update debug display
        let debugDiv = document.getElementById('debug-info');
        if (!debugDiv) {
            debugDiv = document.createElement('div');
            debugDiv.id = 'debug-info';
            debugDiv.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px;
                border-radius: 5px;
                font-family: monospace;
                font-size: 12px;
                z-index: 10000;
                max-width: 300px;
            `;
            document.body.appendChild(debugDiv);
        }
        
        debugDiv.innerHTML = `
            <strong>Debug Info:</strong><br>
            Expected: "${expected}"<br>
            Heard: "${heard}"<br>
            Match: ${this.matchWord(heard, expected) ? '✅' : '❌'}
        `;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (debugDiv) debugDiv.remove();
        }, 3000);
    }

    matchWord(transcript, expectedWord) {
        // Direct match
        if (transcript === expectedWord) return true;
        
        // Contains match (for partial recognition)
        if (transcript.includes(expectedWord) || expectedWord.includes(transcript)) return true;
        
        // Split transcript into words and check each
        const words = transcript.split(/\s+/);
        for (let word of words) {
            if (word === expectedWord) return true;
            if (word.includes(expectedWord) || expectedWord.includes(word)) return true;
        }
        
        // Handle common speech recognition variations
        const variations = {
            'cat': ['cat', 'kat', 'khat', 'caught'],
            'dog': ['dog', 'dawg', 'dogg'],
            'run': ['run', 'ran', 'running'],
            'sit': ['sit', 'sat', 'sitting'],
            'hat': ['hat', 'hut', 'hot'],
            'map': ['map', 'mop', 'mapp'],
            'pig': ['pig', 'pigg'],
            'cow': ['cow', 'coww'],
            'fox': ['fox', 'foks'],
            'rat': ['rat', 'ratt'],
            'bat': ['bat', 'batt'],
            'hen': ['hen', 'hhen'],
            'duck': ['duck', 'duk'],
            'eye': ['eye', 'i', 'aye'],
            'ear': ['ear', 'eer'],
            'arm': ['arm', 'armm'],
            'leg': ['leg', 'legg'],
            'lip': ['lip', 'lipp'],
            'toe': ['toe', 'tow'],
            'egg': ['egg', 'eg'],
            'jam': ['jam', 'jamm'],
            'pie': ['pie', 'pai'],
            'nut': ['nut', 'nutt'],
            'cup': ['cup', 'cupp'],
            'mug': ['mug', 'mugg'],
            'sun': ['sun', 'sunn'],
            'moon': ['moon', 'mun'],
            'star': ['star', 'starr'],
            'tree': ['tree', 'tre'],
            'leaf': ['leaf', 'leef'],
            'rock': ['rock', 'rok'],
            'sand': ['sand', 'sann'],
            'red': ['red', 'redd'],
            'blue': ['blue', 'blu'],
            'pink': ['pink', 'pinkk'],
            'gray': ['gray', 'grey'],
            'brown': ['brown', 'braun'],
            'jump': ['jump', 'jumpp'],
            'hop': ['hop', 'hopp'],
            'walk': ['walk', 'wok'],
            'talk': ['talk', 'tok'],
            'look': ['look', 'luk'],
            'see': ['see', 'sea'],
            'cap': ['cap', 'capp'],
            'bag': ['bag', 'bagg'],
            'box': ['box', 'boks'],
            'book': ['book', 'buk'],
            'pen': ['pen', 'penn'],
            'key': ['key', 'kee'],
            'door': ['door', 'dor'],
            'wall': ['wall', 'woll'],
            'mom': ['mom', 'mum', 'mother'],
            'dad': ['dad', 'daddy', 'father'],
            'boy': ['boy', 'boi'],
            'girl': ['girl', 'gurl'],
            'man': ['man', 'mann'],
            'woman': ['woman', 'women'],
            'one': ['one', '1', 'won'],
            'two': ['two', '2', 'too', 'to'],
            'ten': ['ten', '10'],
            'the': ['the', 'da', 'duh'],
            'and': ['and', 'an', '&'],
            'for': ['for', '4', 'four'],
            'can': ['can', 'kan'],
            'get': ['get', 'git'],
            'put': ['put', 'putt'],
            'let': ['let', 'lett'],
            'big': ['big', 'bigg'],
            'small': ['small', 'smoll'],
            'hot': ['hot', 'hott'],
            'cold': ['cold', 'kold'],
            'wet': ['wet', 'wett'],
            'dry': ['dry', 'drai'],
            'new': ['new', 'nu'],
            'old': ['old', 'ol'],
            'good': ['good', 'gud'],
            'bad': ['bad', 'badd'],
            'yes': ['yes', 'yess'],
            'no': ['no', 'know'],
            'up': ['up', 'upp'],
            'down': ['down', 'daun'],
            'in': ['in', 'inn'],
            'out': ['out', 'owt'],
            'on': ['on', 'onn'],
            'off': ['off', 'of'],
            'at': ['at', 'att'],
            'to': ['to', 'too', '2'],
            'of': ['of', 'ov'],
            'is': ['is', 'iz'],
            'it': ['it', 'itt'],
            'he': ['he', 'hee'],
            'she': ['she', 'shee'],
            'we': ['we', 'wee'],
            'me': ['me', 'mee'],
            'my': ['my', 'mai'],
            'you': ['you', 'u', 'yoo']
        };
        
        // Check if expected word has variations
        if (variations[expectedWord]) {
            for (let variation of variations[expectedWord]) {
                if (transcript.includes(variation) || variation.includes(transcript)) return true;
                for (let word of transcript.split(/\s+/)) {
                    if (word === variation || variation.includes(word) || word.includes(variation)) return true;
                }
            }
        }
        
        return false;
    }

    handleSuccess(block) {
        if (block) {
            block.classList.add('success');
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
    }

    handleError(block) {
        if (block) {
            block.classList.add('error');
            
            // Remove error class after animation
            setTimeout(() => {
                if (block) {
                    block.classList.remove('error');
                }
            }, 500);
        }
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