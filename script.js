// 1. Chave da API
const apiKey = "189d11b2569e9dc749b6bd952cbdf02f";

// Selecionando elementos do HTML
const inputCidade = document.getElementById('cidadeInput');
const divResultado = document.getElementById('resultado');
const divErro = document.getElementById('erro');
const historicoContainer = document.getElementById('historico-container');

/**
 * FASE 4 e HISTÓRICO: Executa ao carregar a página
 */
window.onload = function() {
    renderizarHistorico(); // Desenha os botões das cidades salvas
    
    // Recupera a última cidade visualizada
    const ultimoClima = localStorage.getItem('clima_salvo');
    if (ultimoClima) {
        exibirDados(JSON.parse(ultimoClima));
    }
};

/**
 * DESAFIO NÍVEL 2: Geolocation API (Busca por GPS)
 */
function buscarPorLocalizacao() {
    if ("geolocation" in navigator) {
        // Feedback visual de carregamento
        divErro.innerHTML = `<div class="erro-container" style="color: #2563eb; background: #eff6ff;">Obtendo sua localização...</div>`;
        divErro.classList.remove('hidden');

        const opcoesGeo = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            (posicao) => {
                const lat = posicao.coords.latitude;
                const lon = posicao.coords.longitude;
                
                // URL configurada para latitude e longitude
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`;
                
                chamadaApi(url);
            },
            (erro) => {
                // TRATAMENTO DO ERRO DE GPS (GeolocationPositionError)
                let mensagem = "";
                switch(erro.code) {
                    case erro.PERMISSION_DENIED:
                        mensagem = "Localização negada. Ative a permissão no cadeado da barra de endereço.";
                        break;
                    case erro.POSITION_UNAVAILABLE:
                        mensagem = "Informações de localização indisponíveis.";
                        break;
                    case erro.TIMEOUT:
                        mensagem = "Tempo esgotado ao obter localização.";
                        break;
                    default:
                        mensagem = "Erro desconhecido ao obter localização.";
                        break;
                }
                divErro.innerHTML = `<div class="erro-container">${mensagem}</div>`;
                console.error("Erro GPS:", erro.message);
            },
            opcoesGeo
        );
    } else {
        alert("Seu navegador não suporta geolocalização.");
    }
}

/**
 * FASE 3: Busca por nome de cidade (Input)
 */
function buscarClima() {
    const cidade = inputCidade.value.trim();
    
    if (cidade === "") {
        alert("Por favor, digite o nome de uma cidade.");
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;
    chamadaApi(url);
}

/**
 * FUNÇÃO CENTRAL DE API (Fetch)
 * Utilizada tanto por nome quanto por GPS
 */
function chamadaApi(url) {
    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error("Cidade não encontrada ou erro na API.");
            return res.json();
        })
        .then(dados => {
            divErro.classList.add('hidden'); // Esconde erros se deu certo
            
            salvarNoHistorico(dados);
            exibirDados(dados);
            
            inputCidade.value = ""; // Limpa o campo
        })
        .catch(err => {
            divErro.innerHTML = `<div class="erro-container">${err.message}</div>`;
            divErro.classList.remove('hidden');
            divResultado.classList.add('hidden');
        });
}

/**
 * DESAFIO NÍVEL 1: Salvar e Gerenciar Histórico (Últimas 5)
 */
function salvarNoHistorico(novosDados) {
    let lista = JSON.parse(localStorage.getItem('historico_clima')) || [];

    // Remove a cidade se ela já existir (para não repetir)
    lista = lista.filter(item => item.name.toLowerCase() !== novosDados.name.toLowerCase());

    // Adiciona no topo da lista
    lista.unshift(novosDados);

    // Mantém apenas as 5 mais recentes
    lista = lista.slice(0, 5);

    // Salva no navegador
    localStorage.setItem('historico_clima', JSON.stringify(lista));
    localStorage.setItem('clima_salvo', JSON.stringify(novosDados));

    renderizarHistorico();
}

/**
 * DESAFIO NÍVEL 1: Desenhar botões do Histórico
 */
function renderizarHistorico() {
    if (!historicoContainer) return;

    const lista = JSON.parse(localStorage.getItem('historico_clima')) || [];
    historicoContainer.innerHTML = ""; 

    lista.forEach(cidade => {
        const btn = document.createElement('button');
        btn.className = "btn-historico";
        btn.innerHTML = `📍 ${cidade.name}`;
        
        // Ao clicar no botão, mostra os dados salvos instantaneamente
        btn.onclick = () => {
            exibirDados(cidade);
            localStorage.setItem('clima_salvo', JSON.stringify(cidade));
        };

        historicoContainer.appendChild(btn);
    });
}

/**
 * FASE 2 e 3: Mostrar Card na Tela
 */
function exibirDados(dados) {
    divResultado.classList.remove('hidden');
    
    divResultado.innerHTML = `
        <div class="card-clima">
            <div class="cidade-nome">${dados.name}, ${dados.sys.country}</div>
            <img class="icone" src="https://openweathermap.org/img/wn/${dados.weather[0].icon}@2x.png" alt="Clima">
            <div class="temperatura">${Math.floor(dados.main.temp)}°C</div>
            <div class="descricao">${dados.weather[0].description}</div>
        </div>
    `;
}

// Atalho: Pesquisar ao apertar Enter
inputCidade.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') buscarClima();
});