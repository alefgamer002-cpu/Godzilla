const monstro = document.querySelector('.monstro-player');
const cenarioItem = document.querySelector('.ameaca-cidade');
const placarMoedas = document.querySelector('.contador-moedas');
const efeitoFogo = document.querySelector('.efeito-fogo');
const telaGameOver = document.querySelector('.tela-game-over');
const arenaClick = document.querySelector('.zona-batalha');

let totalMoedas = 0;
let executandoAcao = false;
let jogoAtivo = true; 
let jaPontuouNessePredio = false;
let loopJogo; 

// SISTEMA DE DISTÂNCIA / PROGRESSÃO
let prediosPassados = 0; // Conta quantos prédios você passou ou destruiu
let velocidadeAtual = 1.8; // Começa na velocidade normal

const modelosPredio = [
    'img/1.png', 'img/2.png', 'img/3.png', 'img/4.png', 'img/5.png',
    'img/6.png', 'img/7.png', 'img/8.png', 'img/9.png', 'img/10.png'
];

function pular() {
    if (executandoAcao || !jogoAtivo) return;

    executandoAcao = true;
    monstro.classList.add('animacao-pulo');

    setTimeout(() => {
        monstro.classList.remove('animacao-pulo');
        executandoAcao = false;
    }, 800); 
}

function destruirComLaser() {
    if (executandoAcao || !jogoAtivo) return;

    executandoAcao = true;
    monstro.classList.add('animacao-ataque');

    const distanciaPredio = cenarioItem.offsetLeft;

    if (distanciaPredio > 220 && distanciaPredio < 600 && cenarioItem.style.visibility !== 'hidden' && !jaPontuouNessePredio) {
        totalMoedas += 10;
        placarMoedas.textContent = `Moedas: ${totalMoedas}`;
        jaPontuouNessePredio = true; 
        
        efeitoFogo.style.left = `${distanciaPredio}px`;
        efeitoFogo.style.display = 'block';
        cenarioItem.style.visibility = 'hidden';

        setTimeout(() => {
            efeitoFogo.style.display = 'none';
        }, 300);

        // Contabiliza o prédio destruído na distância e checa a velocidade
        contarProgresso();
        puxarProximoPredio();
    }

    setTimeout(() => {
        monstro.classList.remove('animacao-ataque');
        executandoAcao = false;
    }, 200);
}

function puxarProximoPredio() {
    const sorteio = Math.floor(Math.random() * modelosPredio.length);
    cenarioItem.src = modelosPredio[sorteio];
    
    cenarioItem.classList.remove('predio-correndo');
    cenarioItem.style.left = '100%';
    cenarioItem.offsetHeight; 
    
    // Aplica a velocidade baseada na distância atual
    cenarioItem.style.animationDuration = `${velocidadeAtual}s`;
    
    cenarioItem.classList.add('predio-correndo');
    cenarioItem.style.visibility = 'visible';
    
    jaPontuouNessePredio = false; 
}

// LOGICA DE DIFICULDADE POR DISTÂNCIA (A cada 10 prédios)
function contarProgresso() {
    prediosPassados++;
    console.log(`Prédios superados: ${prediosPassados}`);

    // Se chegou em 200, para de acelerar para esperar o Boss!
    if (prediosPassados >= 200) {
        console.log("Distância 200 atingida! Hora do Boss (Em breve)!");
        return; 
    }

    // A cada 10 prédios, diminui o tempo da animação (fica mais rápido)
    if (prediosPassados % 10 === 0 && velocidadeAtual > 0.6) {
        velocidadeAtual -= 0.12; 
        console.log(`Dificuldade aumentou! Nova velocidade: ${velocidadeAtual.toFixed(2)}s`);
    }
}

function reiniciarJogo() {
    if (jogoAtivo) return; 

    jogoAtivo = true; 
    totalMoedas = 0;
    prediosPassados = 0; // Reseta a contagem de distância
    velocidadeAtual = 1.8; // Reseta a velocidade para o início
    jaPontuouNessePredio = false;
    executandoAcao = false;
    
    placarMoedas.textContent = `Moedas: ${totalMoedas}`;

    telaGameOver.style.display = 'none';
    efeitoFogo.style.display = 'none';

    monstro.style.bottom = '0px';
    monstro.style.left = '10px';
    monstro.style.animation = '';
    monstro.classList.remove('animacao-pulo', 'animacao-ataque');

    cenarioItem.style.left = '';
    puxarProximoPredio();

    clearInterval(loopJogo);
    loopJogo = setInterval(monitorarJogo, 10);
}

// CONTROLE DO TECLADO
document.addEventListener('keydown', (evento) => {
    if (evento.code === 'ArrowUp') {
        evento.preventDefault();
    }

    if (jogoAtivo) {
        if (evento.code === 'ArrowUp') {
            pular();
        } else if (evento.code === 'Space') {
            destruirComLaser();
        }
    } else {
        if (evento.code === 'Space' || evento.code === 'Enter') {
            reiniciarJogo();
        }
    }
});

arenaClick.addEventListener('click', () => {
    if (!jogoAtivo) {
        reiniciarJogo();
    }
});

function monitorarJogo() {
    if (!jogoAtivo) return;

    const distanciaPredio = cenarioItem.offsetLeft;
    const alturaGodzilla = parseInt(window.getComputedStyle(monstro).bottom);

    // Se o prédio passou direto pelo canto esquerdo (você pulou com sucesso)
    if (distanciaPredio < -250) {
        contarProgresso(); // Ganha +1 na distância
        puxarProximoPredio();
    }

    if (distanciaPredio < 200 && distanciaPredio > 50 && alturaGodzilla > 140 && !jaPontuouNessePredio && cenarioItem.style.visibility !== 'hidden') {
        totalMoedas += 10;
        placarMoedas.textContent = `Moedas: ${totalMoedas}`;
        jaPontuouNessePredio = true; 
    }

    // GAME OVER
    if (distanciaPredio <= 210 && distanciaPredio >= 60 && alturaGodzilla < 140 && cenarioItem.style.visibility !== 'hidden') {
        jogoAtivo = false;

        clearInterval(loopJogo); 

        cenarioItem.classList.remove('predio-correndo');
        cenarioItem.style.left = `${distanciaPredio}px`;
        
        monstro.style.animation = 'none';
        monstro.style.bottom = `${alturaGodzilla}px`;

        efeitoFogo.style.left = `${distanciaPredio}px`;
        efeitoFogo.style.display = 'block';

        telaGameOver.style.display = 'block';
    }
}

cenarioItem.classList.add('predio-correndo');
loopJogo = setInterval(monitorarJogo, 10);