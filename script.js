// 1. Sua Chave de API da OpenWeatherMap
const apiKey = "189d11b2569e9dc749b6bd952cbdf02f";

// Selecionando os elementos do HTML (DOM)
const btnBuscar = document.getElementById('search-btn');
const inputCidade = document.getElementById('city-input');

const campoCidade = document.getElementById('city-name');
const campoTemperatura = document.getElementById('temperature');
const campoDescricao = document.getElementById('description');
const campoIcone = document.getElementById('weather-icon');
const placeholderIcone = document.getElementById('icon-placeholder');

/**
 * FASE 4: O Pulo do Gato (LocalStorage)
 * Esta função roda assim que a página é carregada.
 * Ela verifica se existe algum clima salvo no navegador.
 */
window.onload = function() {
    const climaSalvo = localStorage.getItem('clima_salvo');

    if (climaSalvo) {
        // Converte de texto (string) de volta para objeto
        const dadosObjeto = JSON.parse(climaSalvo);
        console.log("Recuperando clima da memória...");
        exibirDados(dadosObjeto); // Mostra no HTML imediatamente
    }
};

/**
 * FASE 3: Conexão com a Rede Global (Fetch API)
 * Busca os dados na API baseada no nome da cidade.
 */
function buscarClima() {
    const cidade = inputCidade.value;

    if (cidade === "") {
        alert("Por favor, digite o nome de uma cidade.");
        return;
    }

    // URL com parâmetros: units=metric (Celsius) e lang=pt_br (Português)
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;

    fetch(url)
        .then(res => {
            if (!res.ok) {
                throw new Error("Cidade não encontrada");
            }
            return res.json();
        })
        .then(dados => {
            // FASE 4: Salva o JSON no navegador transformando em string
            localStorage.setItem('clima_salvo', JSON.stringify(dados));
            
            // Exibe na tela
            exibirDados(dados);
        })
        .catch(erro => {
            alert(erro.message);
            console.error("Erro na requisição: ", erro);
        });
}

/**
 * Injeta os dados no HTML (Manipulação de DOM)
 */
function exibirDados(dados) {
    // Nome da cidade e país
    campoCidade.innerHTML = `${dados.name}, ${dados.sys.country}`;
    
    // Temperatura arredondada
    campoTemperatura.innerHTML = `${Math.floor(dados.main.temp)}°C`;
    
    // Descrição do clima
    campoDescricao.innerHTML = dados.weather[0].description;

    // Lógica do Ícone (URL oficial da OpenWeatherMap)
    const iconCode = dados.weather[0].icon;
    campoIcone.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    
    // Mostra a imagem e esconde o ícone de carregamento/emoji
    campoIcone.style.display = "inline-block";
    placeholderIcone.style.display = "none";
}

// Eventos de interação
btnBuscar.addEventListener('click', buscarClima);

inputCidade.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        buscarClima();
    }
});