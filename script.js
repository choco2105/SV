// Utilidades de animación
const animationUtils = {
    fadeIn(element, duration = 500) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.min(progress / duration, 1);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    },

    fadeOut(element, duration = 500) {
        let start = null;
        const initialOpacity = parseFloat(getComputedStyle(element).opacity);
        
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.max(initialOpacity - (progress / duration), 0);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    },

    shake(element, intensity = 5) {
        let start = null;
        const duration = 500;
        
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const phase = (progress / duration) * Math.PI * 4; // 2 ciclos completos
            
            if (progress < duration) {
                const offset = Math.sin(phase) * intensity;
                element.style.transform = `translateX(${offset}px)`;
                requestAnimationFrame(animate);
            } else {
                element.style.transform = '';
            }
        };
        
        requestAnimationFrame(animate);
    },

    pulse(element) {
        let start = null;
        const duration = 400;
        
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const phase = (progress / duration) * Math.PI;
            
            if (progress < duration) {
                const scale = 1 + Math.sin(phase) * 0.1;
                element.style.transform = `scale(${scale})`;
                requestAnimationFrame(animate);
            } else {
                element.style.transform = '';
            }
        };
        
        requestAnimationFrame(animate);
    },

    createParticles(container, count = 20, type = 'heart') {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = `particle ${type}`;
            
            const randomX = Math.random() * 100;
            const randomDelay = Math.random() * 2;
            const randomDuration = 2 + Math.random() * 2;
            
            particle.style.left = `${randomX}%`;
            particle.style.animationDelay = `${randomDelay}s`;
            particle.style.animationDuration = `${randomDuration}s`;
            
            container.appendChild(particle);
            
            // Limpieza automática
            setTimeout(() => particle.remove(), randomDuration * 1000);
        }
    },

    typeWriter(element, text, speed = 50) {
        return new Promise(resolve => {
            let i = 0;
            element.textContent = '';
            
            function type() {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                } else {
                    resolve();
                }
            }
            
            type();
        });
    },

    createHearts() {
        const container = document.querySelector('.floating-hearts');
        if (!container) return;

        setInterval(() => {
            const heart = document.createElement('div');
            heart.classList.add('floating-heart');
            heart.innerHTML = '❤️';
            heart.style.left = Math.random() * 100 + '%';
            heart.style.animationDuration = (Math.random() * 2 + 3) + 's';
            container.appendChild(heart);

            setTimeout(() => heart.remove(), 5000);
        }, 300);
    }
};

// Funciones auxiliares
const utils = {
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    isMobile() {
        return window.innerWidth <= 768;
    },

    preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = src;
        });
    }
};

// Funciones para el manejo del modal
function setupModal() {
    const modal = document.getElementById('moments-modal');
    const closeBtn = document.querySelector('.close-modal');
    
    if (modal && closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                modal.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });
    }
}

function showImageModal(imageSrc, description) {
    const modal = document.getElementById('moments-modal');
    const modalImage = document.getElementById('moment-image');
    const modalDescription = document.querySelector('.moment-description');
    
    if (modal && modalImage && modalDescription) {
        modalImage.src = imageSrc;
        modalDescription.textContent = description;
        modal.classList.add('active');
        document.body.classList.add('no-scroll');
    }
}

// Clase principal ValentineApp
class ValentineApp {
    constructor() {
        this.currentPage = 0;
        this.totalPages = 8;
        this.isTransitioning = false;
        this.preloadImages().then(() => {
            this.initializeElements();
            this.setupAudio();
            this.setupEventListeners();
            this.setupModal();
        });
    }

    async preloadImages() {
        const imagesToPreload = [
            'imagenes/1.jpg',
            'imagenes/7.jpg'
            // Agrega aquí todas las imágenes que necesites precargar
        ];

        try {
            await Promise.all(imagesToPreload.map(src => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = src;
                });
            }));
        } catch (error) {
            console.error('Error preloading images:', error);
        }
    }

    initializeElements() {
        // Elementos principales
        this.loader = document.getElementById('loader');
        this.progressBar = document.querySelector('.progress-bar');
        this.cover = document.getElementById('cover');
        this.book = document.getElementById('book');
        this.specialEnding = document.getElementById('special-ending');
        this.pages = document.querySelectorAll('.page');

        // Botones y controles
        this.startButton = document.getElementById('startButton');
        this.yesBtn = document.getElementById('yesBtn');
        this.noBtn = document.getElementById('noBtn');
        this.prevPage = document.getElementById('prevPage');
        this.nextPage = document.getElementById('nextPage');
        this.pageNumber = document.getElementById('pageNumber');

        // Inicializar estados
        if (this.cover) {
            this.cover.style.display = 'none';
            this.cover.style.opacity = '0';
        }

        if (this.book) {
            this.book.style.display = 'none';
            this.book.style.opacity = '0';
        }

        // Esconder todas las páginas excepto la primera
        this.pages.forEach(page => {
            page.style.display = 'none';
            page.style.opacity = '0';
        });

        // Memoria para la página 6
        this.memoryGame = new MemoryGame();

        // Iniciar loader
        this.startLoader();

        // Inicializar galería de videollamadas
        this.initializeGallery();
    }

    initializeGallery() {
        const galleryContainer = document.querySelector('.moments-gallery');
        if (!galleryContainer) return;

        const galleryItems = [
            {
                src: 'imagenes/2.jpg',
                description: 'Primera videollamada juntos'
            },
            {
                src: 'imagenes/3.jpg',
                description: 'Compartiendo sonrisas'
            },
            {
                src: 'imagenes/4.jpg',
                description: 'Momentos especiales'
            }
        ];

        galleryItems.forEach(item => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item animate__animated animate__fadeIn';
            
            galleryItem.innerHTML = `
                <img src="${item.src}" alt="${item.description}" class="gallery-image">
                <div class="gallery-overlay">
                    <p class="gallery-description">${item.description}</p>
                </div>
            `;

            galleryItem.addEventListener('click', () => {
                showImageModal(item.src, item.description);
            });

            galleryContainer.appendChild(galleryItem);
        });
    }

    setupAudio() {
        this.audio = document.getElementById('backgroundMusic');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.toggleMusicBtn = document.getElementById('toggleMusic');

        if (this.audio && this.volumeSlider && this.toggleMusicBtn) {
            this.audio.volume = 0.5;
            
            this.toggleMusicBtn.addEventListener('click', () => {
                if (this.audio.paused) {
                    this.audio.play().then(() => {
                        this.toggleMusicBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                    }).catch(console.error);
                } else {
                    this.audio.pause();
                    this.toggleMusicBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
                }
            });

            this.volumeSlider.addEventListener('input', (e) => {
                this.audio.volume = e.target.value;
            });
        }
    }

    setupEventListeners() {
        // Botón de inicio
        if (this.startButton) {
            this.startButton.addEventListener('click', () => this.startStory());
        }

        // Navegación
        if (this.prevPage) {
            this.prevPage.addEventListener('click', () => this.navigatePage('prev'));
        }
        if (this.nextPage) {
            this.nextPage.addEventListener('click', () => this.navigatePage('next'));
        }

        // Botones de decisión final
        const yesBtn = document.getElementById('yesBtn');
        const noBtn = document.getElementById('noBtn');
        
        if (yesBtn) {
            yesBtn.addEventListener('click', () => this.handleAcceptance());
        }
        
        if (noBtn) {
            this.setupEscapingButton(noBtn);
        }

        // Navegación por teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') this.navigatePage('next');
            if (e.key === 'ArrowLeft') this.navigatePage('prev');
        });
    }

    setupModal() {
        setupModal();
    }

    startLoader() {
        if (!this.loader || !this.progressBar) return;

        this.loader.style.display = 'flex';
        this.loader.style.opacity = '1';
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 1;
            this.progressBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => this.showCover(), 500);
            }
        }, 30);
    }

    showCover() {
        if (!this.loader || !this.cover) return;

        // Ocultar loader
        animationUtils.fadeOut(this.loader);

        // Mostrar cover
        setTimeout(() => {
            this.cover.style.display = 'flex';
            void this.cover.offsetWidth; // Forzar reflow
            this.cover.style.opacity = '1';
            this.createStarryBackground();
        }, 500);
    }

    createStarryBackground() {
        const container = document.querySelector('.stars-container');
        if (!container) return;

        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 3}s`;
            container.appendChild(star);
        }
    }

    startStory() {
        if (!this.cover || !this.book) return;

        // Iniciar música
        if (this.audio) {
            this.audio.play().catch(console.error);
        }

        // Ocultar cover con animación
        this.cover.style.opacity = '0';
        setTimeout(() => {
            this.cover.style.display = 'none';
            
            // Mostrar libro con animación
            this.book.style.display = 'block';
            requestAnimationFrame(() => {
                this.book.style.opacity = '1';
                
                // Mostrar primera página
                const firstPage = this.pages[0];
                if (firstPage) {
                    firstPage.style.display = 'block';
                    firstPage.style.opacity = '1';
                    firstPage.style.transform = 'translateX(0)';
                }
                
                this.updateNavigation();
            });
        }, 500);
    }

    async navigatePage(direction) {
        if (this.isTransitioning) return;

        const nextIndex = direction === 'next' ? 
            this.currentPage + 1 : 
            this.currentPage - 1;

        if (nextIndex >= 0 && nextIndex < this.totalPages) {
            await this.showPage(nextIndex);
        }
    }

    async showPage(index) {
        if (this.isTransitioning || index < 0 || index >= this.totalPages) return;
        
        try {
            this.isTransitioning = true;
            
            const currentPage = this.pages[this.currentPage];
            const nextPage = this.pages[index];
            
            if (!nextPage) return;

            // Ocultar página actual
            if (currentPage) {
                currentPage.style.transform = 'translateX(-100%)';
                currentPage.style.opacity = '0';
                await new Promise(resolve => setTimeout(resolve, 300));
                currentPage.style.display = 'none';
            }

            // Mostrar nueva página
            nextPage.style.display = 'block';
            nextPage.style.transform = 'translateX(100%)';
            await new Promise(resolve => setTimeout(resolve, 50));
            nextPage.style.transform = 'translateX(0)';
            nextPage.style.opacity = '1';

            // Actualizar estado
            this.currentPage = index;
            this.updateNavigation();

            // Inicializar juego si es la página correspondiente
            if (index === 5) {
                this.memoryGame.initialize();
            }

            await new Promise(resolve => setTimeout(resolve, 300));
        } finally {
            this.isTransitioning = false;
        }
    }

    updateNavigation() {
        if (this.pageNumber) {
            this.pageNumber.textContent = `${this.currentPage + 1}/${this.totalPages}`;
        }
        if (this.prevPage) {
            this.prevPage.style.visibility = this.currentPage === 0 ? 'hidden' : 'visible';
        }
        if (this.nextPage) {
            this.nextPage.style.visibility = 
                this.currentPage === this.totalPages - 1 ? 'hidden' : 'visible';
        }
    }

    setupEscapingButton(noBtn) {
        const phrases = [
            "No",
            "¿Estás segura?",
            "¿De verdad?",
            "Piénsalo bien...",
            "¡Última oportunidad!",
            "¿Segura segura?",
            "¡Me vas a hacer llorar!",
            "¡No seas así! 🥺",
            "¡Coquito, por favor!",
            "¡Te necesito!"
        ];
        
        let count = 0;
        let isMoving = false;

        noBtn.addEventListener('mouseover', () => {
            if (isMoving) return;
            isMoving = true;

            count = (count + 1) % phrases.length;
            noBtn.textContent = phrases[count];

            const maxX = window.innerWidth - noBtn.offsetWidth - 50;
            const maxY = window.innerHeight - noBtn.offsetHeight - 50;
            
            const randomX = Math.max(50, Math.random() * maxX);
            const randomY = Math.max(50, Math.random() * maxY);

            noBtn.style.position = 'fixed';
            noBtn.style.left = `${randomX}px`;
            noBtn.style.top = `${randomY}px`;

            setTimeout(() => {
                isMoving = false;
            }, 300);
        });
    }

    handleAcceptance() {
        Swal.fire({
            title: '¡Gracias mi Coquito! ❤️',
            html: `
                <p>Me haces la persona más feliz del mundo...</p>
                <p>En 7 días te veré por primera vez, y no puedo estar más emocionado.</p>
            `,
            imageUrl: 'imagenes/7.jpg',
            imageWidth: 400,
            imageHeight: 300,
            imageAlt: 'Nuestra foto especial',
            confirmButtonText: 'Te Amo ❤️',
            showClass: {
                popup: 'animate__animated animate__fadeInDown',
                backdrop: 'animate__animated animate__fadeIn'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            },
            backdrop: `
                rgba(147, 51, 234, 0.15)
                url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%239333ea' d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E")
                center/120px no-repeat
            `
        }).then((result) => {
            if (result.isConfirmed) {
                this.showSpecialEnding();
            }
        });
    }

    showSpecialEnding() {
        if (!this.specialEnding || !this.book) return;
        
        // Ocultar el libro primero
        this.book.style.opacity = '0';
        this.book.style.display = 'none';

        // Asegurar que el contenedor especial esté preparado
        this.specialEnding.style.display = 'flex';
        this.specialEnding.style.opacity = '0';
        this.specialEnding.style.visibility = 'visible';
        
        // Mostrar con animación
        setTimeout(() => {
            this.specialEnding.style.opacity = '1';
            
            // Crear y añadir corazones
            const createHeart = () => {
                const heart = document.createElement('div');
                heart.className = 'falling-heart';
                heart.innerHTML = '❤️';
                heart.style.left = `${Math.random() * 100}vw`;
                heart.style.animationDuration = `${Math.random() * 3 + 2}s`;
                heart.style.fontSize = `${Math.random() * 1 + 1}rem`;
                this.specialEnding.querySelector('.falling-hearts-container').appendChild(heart);
                heart.addEventListener('animationend', () => heart.remove());
            };

            // Iniciar la creación de corazones
            setInterval(createHeart, 300);
        }, 100);
    }

    createFloatingHearts() {
        const container = document.querySelector('.floating-hearts');
        if (!container) return;

        setInterval(() => {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.innerHTML = '❤️';
            heart.style.left = `${Math.random() * 100}%`;
            heart.style.animationDuration = `${Math.random() * 2 + 3}s`;
            container.appendChild(heart);
            setTimeout(() => heart.remove(), 5000);
        }, 300);
    }

    updateFinalCountdown() {
        const targetDate = new Date('2025-02-21T00:00:00');
        const timer = document.getElementById('final-timer');
        
        if (!timer) return;

        const updateTimer = () => {
            const now = new Date();
            const difference = targetDate - now;

            if (difference <= 0) {
                timer.innerHTML = '<p>¡El día ha llegado! 💖</p>';
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            timer.innerHTML = `
                <div class="countdown-item">
                    <span class="number">${days}</span>
                    <span class="label">días</span>
                </div>
                <div class="countdown-item">
                    <span class="number">${hours}</span>
                    <span class="label">horas</span>
                </div>
                <div class="countdown-item">
                    <span class="number">${minutes}</span>
                    <span class="label">minutos</span>
                </div>
                <div class="countdown-item">
                    <span class="number">${seconds}</span>
                    <span class="label">segundos</span>
                </div>
            `;
        };

        updateTimer();
        setInterval(updateTimer, 1000);
    }
}

// Clase del juego de memoria
class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.isLocked = false;
    }

    initialize() {
        this.reset();
        this.createCards();
        this.setupEventListeners();
        this.updateCardStyles();
    }

    reset() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.isLocked = false;
    }

    createCards() {
        const container = document.querySelector('.memory-cards');
        if (!container) return;

        container.innerHTML = '';
        
        const cardData = [
            { id: 1, emoji: '💝', description: 'Nuestro primer mensaje' },
            { id: 2, emoji: '💌', description: 'Días de pandemia juntos' },
            { id: 3, emoji: '💕', description: 'Reencuentro en Navidad' }
        ];

        // Duplicar las cartas para crear pares
        const cards = [...cardData, ...cardData];
        
        // Mezclar las cartas
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }

        cards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            this.cards.push(cardElement);
            container.appendChild(cardElement);
        });
    }

    createCardElement(card, index) {
        const cardElement = document.createElement('div');
        cardElement.className = 'memory-card';
        cardElement.dataset.cardId = card.id;
        cardElement.dataset.index = index;
        
        cardElement.innerHTML = `
            <div class="card-front">
                <div class="card-content">❤️</div>
            </div>
            <div class="card-back">
                <div class="card-content">
                    <span class="card-emoji">${card.emoji}</span>
                    <span class="card-description">${card.description}</span>
                </div>
            </div>
        `;

        return cardElement;
    }

    setupEventListeners() {
        this.cards.forEach(card => {
            card.addEventListener('click', () => this.handleCardClick(card));
        });

        const resetButton = document.getElementById('resetGame');
        if (resetButton) {
            resetButton.addEventListener('click', () => this.reset());
        }
    }

    handleCardClick(card) {
        if (this.isLocked || 
            this.flippedCards.includes(card) || 
            card.classList.contains('matched')) {
            return;
        }

        card.classList.add('flipped');
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateMovesDisplay();
            this.checkMatch();
        }
    }

    checkMatch() {
        this.isLocked = true;
        const [card1, card2] = this.flippedCards;
        const match = card1.dataset.cardId === card2.dataset.cardId;

        if (match) {
            this.handleMatch(card1, card2);
        } else {
            this.handleMismatch(card1, card2);
        }
    }

    handleMatch(card1, card2) {
        this.matchedPairs++;
        
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            
            this.createParticles(card1);
            this.createParticles(card2);
        }, 200);

        this.updatePairsDisplay();

        if (this.matchedPairs === 3) {
            setTimeout(() => {
                this.handleGameComplete();
            }, 1000);
        }
        
        this.resetTurn();
    }

    handleMismatch(card1, card2) {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            this.resetTurn();
        }, 1000);
    }

    resetTurn() {
        this.flippedCards = [];
        this.isLocked = false;
    }

    updateMovesDisplay() {
        const movesDisplay = document.getElementById('moves');
        if (movesDisplay) {
            movesDisplay.textContent = `Movimientos: ${this.moves}`;
        }
    }

    updatePairsDisplay() {
        const pairsDisplay = document.getElementById('pairs');
        if (pairsDisplay) {
            pairsDisplay.textContent = `Pares: ${this.matchedPairs}/3`;
        }
    }

    createParticles(card) {
        const container = card.parentElement;
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle heart';
            particle.innerHTML = '❤️';
            
            const angle = (i / 10) * Math.PI * 2;
            const distance = 50;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            particle.style.setProperty('--random-x', `${(Math.random() - 0.5) * 100}px`);
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            
            container.appendChild(particle);
            
            setTimeout(() => particle.remove(), 1500);
        }
    }

    updateCardStyles() {
        const cards = document.querySelectorAll('.memory-card');
        cards.forEach(card => {
            card.style.transformStyle = 'preserve-3d';
            card.style.perspective = '1000px';
            card.style.transition = 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)';
        });
    }

    handleGameComplete() {
        setTimeout(() => {
            Swal.fire({
                title: '¡Lo Lograste! 🎉',
                html: `
                    <p>Has encontrado todos nuestros momentos especiales</p>
                    <p>Movimientos: ${this.moves}</p>
                `,
                icon: 'success',
                confirmButtonText: 'Continuar nuestra historia ❤️'
            }).then((result) => {
                if (result.isConfirmed) {
                    const nextPageBtn = document.getElementById('nextPage');
                    if (nextPageBtn) nextPageBtn.click();
                }
            });
        }, 500);
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.valentineApp = new ValentineApp();
    
    // Hacer las instancias disponibles globalmente de manera segura
    window.valentineApp = valentineApp;

    // Iniciar la aplicación
    valentineApp.startLoader();
});

// Función para destruir la aplicación al cerrar
window.addEventListener('beforeunload', () => {
    if (window.valentineApp) {
        if (window.valentineApp.audio) {
            window.valentineApp.audio.pause();
        }
        // Limpiar otras referencias si es necesario
        window.valentineApp = null;
    }
});