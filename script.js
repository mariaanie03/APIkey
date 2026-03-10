
// AVISO IMPORTANTE: Cole sua API Key aqui dentro das aspas!
const API_KEY = '189d11b2569e9dc749b6bd952cbdf02f';

// ==========================================
// FASE 4: O "Pulo do Gato" (LocalStorage)
// Dispara automaticamente quando a página carrega
// ==========================================
window.onload = function() {
    const climaSalvo = localStorage.getItem('clima_salvo');
    
    // Se existir memória guardada, converte de volta pra Objeto e exibe sem requisição
    if (climaSalvo) {
        const dadosSalvos = JSON.parse(climaSalvo);
        exibirCardClima(dadosSalvos);
    }
};

// ==========================================
// FASE 3: Conexão Global (Fetch)
// ==========================================
function buscarClima() {
    const inputCidade = document.getElementById('cidadeInput').value.trim();
    const resultadoDiv = document.getElementById('resultado');
    const erroDiv = document.getElementById('erro');

    // Validação básica
    if (inputCidade === "") {
        mostrarErro("Por favor, digite o nome de uma cidade.");
        return;
    }

    // Feedback visual e limpa mensagens de erro antigas
    erroDiv.classList.add('hidden');
    resultadoDiv.innerHTML = '<p style="margin-top: 20px; font-weight: bold; color: #666;">Buscando nos satélites... 🛰️</p>';
    resultadoDiv.classList.remove('hidden');

    // URL com as "Dicas de Ouro": units=metric (Celsius) e lang=pt_br (Português)
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${inputCidade}&appid=${API_KEY}&units=metric&lang=pt_br`;

    fetch(url)
        .then(response => {
            // Tratamento de Erro de Cidade Inventada (Ex: 404 Not Found)
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Cidade não encontrada. Verifique o nome e tente novamente.");
                } else if (response.status === 401) {
                    throw new Error("Chave de API inválida ou ainda não ativada (aguarde 15min se for nova).");
                } else {
                    throw new Error("Erro na comunicação com a API.");
                }
            }
            return response.json();
        })
        .then(dados => {
            // FASE 4: Salvar com Sucesso (Memória)
            localStorage.setItem('clima_salvo', JSON.stringify(dados));
            
            // Exibe os dados na tela
            exibirCardClima(dados);
        })
        .catch(error => {
            mostrarErro(error.message);
        });
}

// ==========================================
// FUNÇÕES AUXILIARES DE DOM
// ==========================================
function exibirCardClima(dados) {
    const resultadoDiv = document.getElementById('resultado');
    const erroDiv = document.getElementById('erro');
    
    erroDiv.classList.add('hidden'); // Esconde erro, se houver
    
    // Extraindo dados do JSON
    const nome = dados.name;
    const pais = dados.sys.country;
    const temp = Math.round(dados.main.temp); // Arredonda a temperatura
    const descricao = dados.weather[0].description;
    const iconeCodigo = dados.weather[0].icon;
    
    // URL dinâmica do Ícone Oficial da API
    const iconeUrl = `https://openweathermap.org/img/wn/${iconeCodigo}@2x.png`;

    // Injeta o HTML estruturado
    resultadoDiv.innerHTML = `
        <div class="card-clima">
            <div class="cidade-nome">${nome}, ${pais}</div>
            <img class="icone" src="${iconeUrl}" alt="${descricao}">
            <div class="temperatura">${temp}°C</div>
            <div class="descricao">${descricao}</div>
        </div>
    `;
    resultadoDiv.classList.remove('hidden');
}

function mostrarErro(mensagem) {
    const resultadoDiv = document.getElementById('resultado');
    const erroDiv = document.getElementById('erro');
    
    resultadoDiv.classList.add('hidden'); // Oculta o card
    
    erroDiv.innerHTML = `<div class="erro-container"><strong>Ops!</strong> ${mensagem}</div>`;
    erroDiv.classList.remove('hidden');
}