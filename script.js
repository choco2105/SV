// Utilidades de animación
const animationUtils = {
    fadeIn(element, duration = 500) {
        return gsap.from(element, {
            opacity: 0,
            duration: duration / 1000,
            ease: "power2.out"
        });
    },

    fadeOut(element, duration = 500) {
        return gsap.to(element, {
            opacity: 0,
            duration: duration / 1000,
            ease: "power2.in"
        });
    },

    shake(element, intensity = 5) {
        return gsap.to(element, {
            x: intensity,
            duration: 0.1,
            repeat: 3,
            yoyo: true,
            ease: "power2.inOut"
        });
    },

    pulse(element) {
        return gsap.to(element, {
            scale: 1.1,
            duration: 0.2,
            repeat: 1,
            yoyo: true,
            ease: "power2.out"
        });
    },

    createParticles(container, count = 20, type = 'heart') {
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = `particle ${type}`;
            
            const randomX = Math.random() * 100;
            const randomDelay = Math.random() * 2;
            const randomDuration = 2 + Math.random() * 2;
            
            Object.assign(particle.style, {
                left: `${randomX}%`,
                animationDelay: `${randomDelay}s`,
                animationDuration: `${randomDuration}s`
            });
            
            particle.addEventListener('animationend', () => {
                particle.remove();
            }, { once: true });
            
            fragment.appendChild(particle);
        }
        
        container.appendChild(fragment);
    },

    typeWriter(element, text, speed = 50) {
        let i = 0;
        element.textContent = '';
        
        return new Promise(resolve => {
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

// Gestor de estado
class StateManager {
    constructor() {
        this.state = {
            currentPage: 0,
            bookStarted: false,
            loadingProgress: 0,
            gameState: {
                moves: 0,
                pairs: 0,
                time: 0
            }
        };
        
        this.observers = new Set();
    }

    setState(newState) {
        const oldState = {...this.state};
        this.state = {
            ...this.state,
            ...newState,
            gameState: {
                ...this.state.gameState,
                ...(newState.gameState || {})
            }
        };
        this.notifyObservers(oldState);
    }

    getState() {
        return {...this.state};
    }

    subscribe(observer) {
        this.observers.add(observer);
        return () => this.observers.delete(observer);
    }

    notifyObservers(oldState) {
        this.observers.forEach(observer => {
            try {
                observer(this.state, oldState);
            } catch (error) {
                console.error('Error en observer:', error);
            }
        });
    }
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.valentineApp = new ValentineApp();
    } catch (error) {
        console.error('Error al iniciar la aplicación:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo iniciar la aplicación correctamente',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
});
// Clase del juego de memoria
class MemoryGame {
    constructor() {
        this.reset();
    }

    reset() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.isLocked = false;
    }

    initialize() {
        this.reset();
        this.createCards();
        this.shuffleCards();
        
        // Mostrar los símbolos al inicio
        this.cards.forEach(card => {
            card.classList.add('flipped');
        });
        
        // Después de 2 segundos, voltear las cartas
        setTimeout(() => {
            this.cards.forEach(card => {
                card.classList.remove('flipped');
            });
            this.setupEventListeners();
            this.startTimer();
        }, 2000);
    }

    createCards() {
        // Cambiar a 3 pares de cartas (6 en total)
        const cardImages = [1, 2, 3]; // Solo 3 imágenes diferentes
        const cardPairs = [...cardImages, ...cardImages];
        const container = document.querySelector('.memory-cards');
        
        if (!container) return;
        
        container.innerHTML = '';
        
        utils.shuffle(cardPairs).forEach((imgNumber, index) => {
            const card = this.createCardElement(imgNumber, index);
            this.cards.push(card);
            container.appendChild(card);
        });
    }

    createCardElement(imgNumber, index) {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.value = imgNumber;
        card.dataset.index = index;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', 'Carta de memoria');
        
        // Estructura actualizada de la carta
        card.innerHTML = `
            <div class="card-front"></div>
            <div class="card-back">
                <span class="card-symbol">${this.getSymbolForCard(imgNumber)}</span>
            </div>
        `;
        return card;
    }

    getSymbolForCard(value) {
        const symbols = {
            1: '🌟',
            2: '💖',
            3: '🎀'
        };
        return symbols[value] || '❤️';
    }

    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
            this.cards[i].style.order = i;
        }
    }

    setupEventListeners() {
        this.cards.forEach(card => {
            card.addEventListener('click', () => {
                if (!card.classList.contains('flipped') && !this.isLocked) {
                    this.flipCard(card);
                }
            });
        });

        const resetButton = document.getElementById('resetGame');
        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetGame());
        }
    }

    flipCard(card) {
        if (
            this.isLocked || 
            this.flippedCards.length === 2 || 
            this.flippedCards.includes(card) ||
            card.classList.contains('matched')
        ) {
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
        const match = card1.dataset.value === card2.dataset.value;

        if (match) {
            this.handleMatch(card1, card2);
        } else {
            this.handleMismatch(card1, card2);
        }
    }

    handleMatch(card1, card2) {
        this.matchedPairs++;
        card1.classList.add('matched');
        card2.classList.add('matched');
        this.updatePairsDisplay();

        if (this.matchedPairs === 3) { // Corregido a 3 pares
            this.handleGameComplete();
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
            pairsDisplay.textContent = `Pares: ${this.matchedPairs}/3`; // Corregido a 3 pares
        }
    }

    startTimer() {
        const timerDisplay = document.getElementById('timer');
        this.timerInterval = setInterval(() => {
            this.timer++;
            if (timerDisplay) {
                const minutes = Math.floor(this.timer / 60);
                const seconds = this.timer % 60;
                timerDisplay.textContent = `Tiempo: ${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    handleGameComplete() {
        this.stopTimer();
        
        setTimeout(() => {
            Swal.fire({
                title: '¡Felicitaciones! 🎉',
                html: `
                    ¡Has encontrado todos los pares!<br>
                    Tiempo: ${document.getElementById('timer').textContent}<br>
                    Movimientos: ${this.moves}
                `,
                icon: 'success',
                confirmButtonText: 'Continuar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Avanzar a la siguiente página
                    window.valentineApp.navigatePage('next');
                }
            });
        }, 500);
    }

    resetGame() {
        this.stopTimer();
        this.reset();
        this.createCards();
        this.shuffleCards();
        this.updateMovesDisplay();
        this.updatePairsDisplay();
        this.startTimer();
        
        const timerDisplay = document.getElementById('timer');
        if (timerDisplay) {
            timerDisplay.textContent = 'Tiempo: 0:00';
        }
    }
}

// La clase principal ValentineApp
class ValentineApp {
    constructor() {
        this.currentSection = 'loader';
        this.initializeElements();
        if (this.elementsLoaded) {
            this.setupAudio();
            this.setupEventListeners();
            this.loadResources();
        }
    }

    initializeElements() {
        try {
            this.loader = document.getElementById('loader');
            this.progressBar = this.loader?.querySelector('.progress-bar');
            this.cover = document.getElementById('cover');
            this.book = document.getElementById('book');
            this.specialEnding = document.getElementById('special-ending');

            this.startButton = document.getElementById('startButton');
            this.yesBtn = document.getElementById('yesBtn');
            this.noBtn = document.getElementById('noBtn');
            this.prevPage = document.getElementById('prevPage');
            this.nextPage = document.getElementById('nextPage');
            this.pageNumber = document.getElementById('pageNumber');

            this.currentPage = 0;
            this.pages = document.querySelectorAll('.page');
            this.totalPages = this.pages.length;
            
            this.memoryGame = new MemoryGame();
            this.stateManager = new StateManager();
            
            this.elementsLoaded = true;
        } catch (error) {
            console.error('Error inicializando elementos:', error);
            this.elementsLoaded = false;
            this.showError('Error al cargar la aplicación');
        }
    }

    initializePages() {
        // Asegurarse de que todas las páginas empiecen ocultas
        this.pages.forEach((page, index) => {
            if (index === 0) {
                page.classList.remove('hidden');
            } else {
                page.classList.add('hidden');
            }
            // Resetear cualquier transformación previa
            page.style.transform = '';
            page.style.opacity = '';
        });
    }

    loadResources() {
        const resources = [
            { type: 'image', path: 'imagenes/1.jpg' },
            { type: 'image', path: 'imagenes/2.jpg' },
            { type: 'image', path: 'imagenes/3.jpg' },
            { type: 'image', path: 'imagenes/4.jpg' },
            { type: 'image', path: 'imagenes/5.jpg' },
            { type: 'image', path: 'imagenes/6.jpg' },
            { type: 'image', path: 'imagenes/7.jpg' }
        ];

        let loadedCount = 0;
        const totalResources = resources.length;

        const updateProgress = () => {
            loadedCount++;
            const progress = (loadedCount / totalResources) * 100;
            if (this.progressBar) {
                this.progressBar.style.width = `${progress}%`;
            }
            
            if (loadedCount === totalResources) {
                this.finishLoading();
            }
        };

        resources.forEach(resource => {
            if (resource.type === 'image') {
                const img = new Image();
                img.onload = () => updateProgress();
                img.onerror = () => {
                    console.error(`Error cargando imagen: ${resource.path}`);
                    updateProgress();
                };
                img.src = resource.path;
            }
        });
    }

    setupEventListeners() {
        // Asegurar que los botones de navegación funcionen
        if (this.startButton) {
            this.startButton.addEventListener('click', () => {
                this.startStory();
                // Intentar reproducir música al hacer clic
                if (this.audio && this.audio.paused) {
                    this.audio.play().catch(console.log);
                }
            });
        }

        // Navegación mejorada
        if (this.prevPage) {
            this.prevPage.addEventListener('click', () => {
                if (this.currentPage > 0) {
                    this.navigatePage('prev');
                }
            });
        }

        if (this.nextPage) {
            this.nextPage.addEventListener('click', () => {
                if (this.currentPage < this.totalPages - 1) {
                    this.navigatePage('next');
                }
            });
        }

        // Teclas de navegación
        document.addEventListener('keydown', (e) => this.handleKeyNavigation(e));

        // Botón que se escapa
        if (this.noBtn) {
            this.setupEscapingButton();
        }

        if (this.yesBtn) {
            this.yesBtn.addEventListener('click', () => {
                Swal.fire({
                    title: '¡Gracias por decir sí! ❤️',
                    text: 'Te amo muchísimo...',
                    imageUrl: 'imagenes/7.jpg',
                    imageWidth: 'auto',
                    imageHeight: 'auto',
                    imageAlt: 'Imagen final especial',
                    confirmButtonText: 'Te Amo ❤️',
                    customClass: {
                        image: 'swal-responsive-image',
                        popup: 'swal-wide'
                    },
                    showClass: {
                        popup: 'animate__animated animate__fadeInDown'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOutUp'
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        this.showSpecialEnding();
                    }
                });
            });
        }
    }

    startStory() {
        if (!this.cover || !this.book) return;

        gsap.timeline()
            .to(this.cover, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    this.cover.style.display = 'none';
                    this.book.style.display = 'block';
                    gsap.to(this.book, {
                        opacity: 1,
                        duration: 0.5,
                        onComplete: () => {
                            this.book.classList.add('active');
                            this.showPage(0);
                        }
                    });
                }
            });
    }

    showPage(index) {
        // Ocultar página actual
        const currentPage = document.querySelector('.page.active');
        if (currentPage) {
            currentPage.classList.remove('active');
            currentPage.classList.add('previous');
        }

        // Mostrar nueva página
        const nextPage = this.pages[index];
        if (nextPage) {
            nextPage.classList.remove('previous');
            nextPage.style.visibility = 'visible';
            nextPage.classList.add('active');
            
            // Actualizar navegación
            this.currentPage = index;
            this.updateNavigation();
            
            // Manejar animaciones específicas
            this.handlePageSpecificAnimations(index);
        }
    }

    navigatePage(direction) {
        const nextIndex = direction === 'next' ? 
            this.currentPage + 1 : 
            this.currentPage - 1;

        if (nextIndex >= 0 && nextIndex < this.totalPages) {
            const currentPage = this.pages[this.currentPage];
            const nextPage = this.pages[nextIndex];
            
            // Asegurarse de que la página siguiente sea visible antes de la animación
            nextPage.style.display = 'block';
            nextPage.style.visibility = 'visible';
            
            gsap.timeline()
                .to(currentPage, {
                    opacity: 0,
                    x: direction === 'next' ? -100 : 100,
                    duration: 0.3,
                    onComplete: () => {
                        currentPage.style.visibility = 'hidden';
                        currentPage.classList.add('hidden');
                    }
                })
                .fromTo(nextPage, 
                    {
                        opacity: 0,
                        x: direction === 'next' ? 100 : -100
                    },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.3,
                        onComplete: () => {
                            this.currentPage = nextIndex;
                            this.updateNavigation();
                            nextPage.classList.remove('hidden');
                            this.handlePageSpecificAnimations(nextIndex);
                        }
                    }
                );
        }
    }

    handleKeyNavigation(e) {
        if (e.key === 'ArrowRight') {
            this.navigatePage('next');
        } else if (e.key === 'ArrowLeft') {
            this.navigatePage('prev');
        }
    }

    updatePageVisibility(pageIndex) {
        if (pageIndex === this.currentPage) return;

        const currentPage = this.pages[this.currentPage];
        const nextPage = this.pages[pageIndex];
        const direction = pageIndex > this.currentPage ? 1 : -1;

        // Asegurarse de que ambas páginas estén en el DOM
        currentPage.classList.remove('hidden');
        nextPage.classList.remove('hidden');

        gsap.timeline()
            .to(currentPage, {
                opacity: 0,
                x: -20 * direction,
                duration: 0.3,
                onComplete: () => {
                    currentPage.classList.add('hidden');
                    gsap.set(currentPage, { clearProps: "all" });
                }
            })
            .set(nextPage, {
                opacity: 0,
                x: 20 * direction,
                immediate: true
            })
            .to(nextPage, {
                opacity: 1,
                x: 0,
                duration: 0.3,
                onComplete: () => {
                    this.currentPage = pageIndex;
                    this.handlePageSpecificAnimations(pageIndex);
                    this.updateNavigation();
                }
            });

        this.stateManager.setState({ currentPage: pageIndex });
    }

    handlePageSpecificAnimations(pageIndex) {
        const currentPage = this.pages[pageIndex];
        if (currentPage.classList.contains('hidden')) {
            currentPage.classList.remove('hidden');
        }

        switch(pageIndex) {
            case 3:
                if (this.memoryGame) {
                    this.memoryGame.initialize();
                }
                break;
            case 4:
                this.animateFuturePage();
                break;
            case 5:
                this.animateFinalPage();
                break;
        }
    }

    animateFuturePage() {
        const futurePage = this.pages[4];
        if (!futurePage) return;

        // Asegurar que la página sea visible
        futurePage.style.display = 'block';
        futurePage.style.visibility = 'visible';
        futurePage.style.opacity = '1';

        const futureGallery = futurePage.querySelector('.future-gallery');
        if (futureGallery) {
            futureGallery.style.opacity = '0';
            gsap.to(futureGallery, {
                opacity: 1,
                y: 0,
                duration: 1
            });
        }
    }

    animateFinalPage() {
        const finalPage = this.pages[5];
        if (!finalPage) return;

        // Asegurar que la página sea visible
        finalPage.style.display = 'block';
        finalPage.style.visibility = 'visible';
        finalPage.style.opacity = '1';

        const finalGallery = finalPage.querySelector('.final-gallery');
        if (finalGallery) {
            finalGallery.style.opacity = '0';
            gsap.to(finalGallery, {
                opacity: 1,
                duration: 1
            });
        }
    }

    updateNavigation() {
        if (this.pageNumber) {
            this.pageNumber.textContent = `${this.currentPage + 1}/${this.totalPages}`;
        }
        if (this.prevPage) {
            this.prevPage.style.visibility = this.currentPage === 0 ? 'hidden' : 'visible';
            this.prevPage.disabled = this.currentPage === 0;
        }
        if (this.nextPage) {
            this.nextPage.style.visibility = this.currentPage === this.totalPages - 1 ? 'hidden' : 'visible';
            this.nextPage.disabled = this.currentPage === this.totalPages - 1;
        }
    }

    setupEscapingButton() {
        let count = 0;
        const phrases = [
            "No",
            "¿Estás segur@?",
            "¿De verdad?",
            "Piénsalo bien...",
            "¡Última oportunidad!",
            "¿Segur@ segur@?",
            "¡Me vas a hacer llorar!",
            "¡No seas así! 🥺"
        ];

        let isMoving = false;

        this.noBtn.addEventListener('mouseover', () => {
            if (isMoving) return;
            isMoving = true;

            count = (count + 1) % phrases.length;
            this.noBtn.textContent = phrases[count];
            
            const maxX = window.innerWidth - this.noBtn.offsetWidth - 50;
            const maxY = window.innerHeight - this.noBtn.offsetHeight - 50;
            
            const randomX = 50 + Math.random() * maxX;
            const randomY = 50 + Math.random() * maxY;
            
            gsap.to(this.noBtn, {
                left: randomX,
                top: randomY,
                duration: 0.3,
                ease: "power2.out",
                onComplete: () => {
                    isMoving = false;
                }
            });
        });
    }

    // Continuación de la clase ValentineApp
    showSpecialEnding() {
        if (!this.specialEnding) return;

        // Ocultar el libro con una animación suave
        gsap.to(this.book, {
            opacity: 0,
            scale: 0.95,
            duration: 0.5,
            onComplete: () => {
                this.book.style.display = 'none';
                
                // Mostrar el final especial
                this.specialEnding.style.display = 'flex';
                this.specialEnding.style.opacity = '0';
                
                gsap.timeline()
                    .to(this.specialEnding, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.5
                    })
                    .from('.ending-content', {
                        y: 30,
                        opacity: 0,
                        duration: 0.5
                    })
                    .from('.final-image-container', {
                        scale: 0,
                        opacity: 0,
                        duration: 0.5,
                        ease: "back.out(1.7)"
                    });

                this.createConfetti();
                this.startEndingAnimations();
            }
        });
    }

    createConfetti() {
        const container = document.querySelector('.celebration-effects');
        if (!container) return;

        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.animationDelay = `${Math.random() * 3}s`;
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            container.appendChild(confetti);
        }
    }

    startEndingAnimations() {
        // Crear corazones flotantes
        const createFloatingHearts = () => {
            const container = document.querySelector('.floating-hearts');
            if (!container) return;

            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.innerHTML = '❤️';
            heart.style.left = `${Math.random() * 100}%`;
            heart.style.animationDuration = `${2 + Math.random() * 3}s`;
            container.appendChild(heart);

            setTimeout(() => heart.remove(), 5000);
        };

        // Iniciar intervalo de corazones
        const heartInterval = setInterval(createFloatingHearts, 300);

        // Animación del mensaje final
        const endingMessage = document.querySelector('.ending-message');
        if (endingMessage) {
            gsap.from(endingMessage, {
                y: 30,
                opacity: 0,
                duration: 1,
                delay: 0.5
            });
        }

        // Animación de la imagen final
        const finalImage = document.querySelector('.final-image-container');
        if (finalImage) {
            gsap.from(finalImage, {
                scale: 0,
                rotation: -10,
                duration: 1,
                delay: 1,
                ease: "back.out(1.7)"
            });
        }

        // Animación del marco
        const frame = document.querySelector('.image-frame');
        if (frame) {
            gsap.to(frame, {
                rotation: 360,
                duration: 20,
                repeat: -1,
                ease: "none"
            });
        }

        // Limpiar intervalo cuando se desmonte
        this.stateManager.setState({ 
            endingAnimationsStarted: true,
            cleanupFunction: () => clearInterval(heartInterval)
        });
    }

    finishLoading() {
        if (this.loader) {
            gsap.to(this.loader, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    this.loader.style.display = 'none';
                    this.showCover(); // Cambiar a mostrar la portada primero
                }
            });
        }
    }

    showCover() {
        if (this.cover) {
            this.cover.style.display = 'flex';
            this.cover.style.visibility = 'visible';
            this.cover.style.opacity = '0';
            
            gsap.to(this.cover, {
                opacity: 1,
                duration: 0.5,
                onComplete: () => {
                    // Asegurarse de que el botón de inicio sea visible
                    if (this.startButton) {
                        gsap.from(this.startButton, {
                            y: 30,
                            opacity: 0,
                            duration: 0.5
                        });
                    }
                }
            });
        }
    }

    setupAudio() {
        this.audio = document.getElementById('backgroundMusic');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.toggleMusicBtn = document.getElementById('toggleMusic');

        if (this.audio && this.volumeSlider && this.toggleMusicBtn) {
            this.audio.volume = 0.5;
            
            // Manejar reproducción automática
            document.addEventListener('click', () => {
                if (this.audio.paused) {
                    this.audio.play().catch(console.log);
                }
            }, { once: true });

            this.toggleMusicBtn.addEventListener('click', () => {
                if (this.audio.paused) {
                    this.audio.play().then(() => {
                        this.toggleMusicBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                    }).catch(() => {
                        console.log('Error al reproducir el audio');
                    });
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

    startApp() {
        if (this.cover) {
            this.cover.style.display = 'flex';
            gsap.to(this.cover, {
                opacity: 1,
                duration: 0.5,
                delay: 0.2
            });
        }
        
        this.startInitialAnimations();
    }

    startInitialAnimations() {
        // Animación del corazón inicial
        gsap.from('.heart-container', {
            scale: 0,
            rotation: 180,
            duration: 1.5,
            ease: "elastic.out(1, 0.3)"
        });

        // Animación del título
        gsap.from('.main-title', {
            y: 50,
            opacity: 0,
            duration: 1,
            delay: 0.5
        });

        // Animación del botón de inicio
        gsap.from('#startButton', {
            y: 30,
            opacity: 0,
            duration: 1,
            delay: 1
        });

        // Crear efecto de estrellas en el fondo
        this.createStarryBackground();
    }

    createStarryBackground() {
        const starsContainer = document.querySelector('.stars-container');
        if (!starsContainer) return;

        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 3}s`;
            starsContainer.appendChild(star);
        }
    }

    showError(message) {
        Swal.fire({
            title: 'Error',
            text: message,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }

    // Método para limpiar recursos y eventos
    destroy() {
        // Limpiar eventos
        window.removeEventListener('keydown', this.handleKeyNavigation);
        
        // Detener animaciones
        gsap.killTweensOf('*');
        
        // Limpiar intervalos y timeouts
        const state = this.stateManager.getState();
        if (state.cleanupFunction) {
            state.cleanupFunction();
        }
        
        // Limpiar el juego de memoria si existe
        if (this.memoryGame) {
            this.memoryGame.stopTimer();
        }
    }
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.valentineApp = new ValentineApp();
    } catch (error) {
        console.error('Error al iniciar la aplicación:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo iniciar la aplicación correctamente',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
});

// Limpieza al cerrar la ventana
window.addEventListener('beforeunload', () => {
    if (window.valentineApp) {
        window.valentineApp.destroy();
    }
});