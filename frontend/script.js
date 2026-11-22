'use strict';

let workouts = [];
let ranking = [];
let editingId = null;
let idParaExcluir = null;

const usuarioLogado = JSON.parse(localStorage.getItem('raia4_usuario'));
if (!usuarioLogado) {
    window.location.href = 'login.html';
}

const API_URL = 'http://localhost:3000/api/treinos';
const RANKING_URL = 'http://localhost:3000/api/ranking';

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

function mostrarAviso(mensagem, ehErro = false) {
    const toast = document.getElementById('toastAviso');
    if (!toast) return;

    toast.textContent = mensagem;
    toast.classList.toggle('erro', ehErro);
    toast.hidden = false;

    setTimeout(() => {
        toast.hidden = true;
    }, 3500);
}

const form = document.getElementById('formTreino');
const distanceInput = document.getElementById('distancia');
const timeInput = document.getElementById('tempo');
const dateInput = document.getElementById('data');
const typeInput = document.getElementById('tipo');
const noteInput = document.getElementById('observacoes');
const historyList = document.getElementById('listaHistorico');
const rankingList = document.getElementById('listaRanking');
const formTitle = document.getElementById('form-title');
const submitButton = form.querySelector('.submit-button');

// aqui configura o perfil e o botão de sair
const profileBtn = document.querySelector('.profile-button');
if (profileBtn && usuarioLogado) {
    const iniciais = usuarioLogado.nome
        .split(' ')
        .map(n => n)
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const userControls = document.createElement('div');
    userControls.className = 'user-controls';
    userControls.innerHTML = `
        <div class="user-badge">
            <span class="user-avatar">${iniciais}</span>
            <span class="user-name-text">${usuarioLogado.nome}</span>
        </div>
        <button type="button" id="btnSair" class="logout-button" title="Sair da conta">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sair
        </button>
    `;

    profileBtn.replaceWith(userControls);

         document.addEventListener('click', (event) => {
        const modalSair = document.getElementById('modalSair');
        if (!modalSair) return;

        if (event.target.closest('#btnSair')) {
            modalSair.hidden = false;
        }

        if (event.target.id === 'btnCancelarSair' || event.target === modalSair) {
            modalSair.hidden = true;
        }

        if (event.target.id === 'btnConfirmarSair') {
            localStorage.removeItem('raia4_usuario');
            window.location.href = 'login.html';
        }

                const modalExcluir = document.getElementById('modalExcluir');
        if (modalExcluir) {
            if (event.target.id === 'btnCancelarExcluir' || event.target === modalExcluir) {
                modalExcluir.hidden = true;
                idParaExcluir = null;
            }

            if (event.target.id === 'btnConfirmarExcluir' && idParaExcluir) {
                modalExcluir.hidden = true;
                fetch(`${API_URL}/${idParaExcluir}`, { method: 'DELETE' })
                    .then((res) => {
                        if (!res.ok) throw new Error('Erro ao excluir');
                        mostrarAviso('Treino excluído com sucesso!');
                        carregarTreinos();
                    })
                    .catch((erro) => mostrarAviso('Erro ao excluir: ' + erro.message, true))
                    .finally(() => {
                        idParaExcluir = null;
                    });
            }
        }
    });
}

// busca os treinos no mongodb
async function carregarTreinos() {
    try {
        const resposta = await fetch(API_URL);
        if (!resposta.ok) throw new Error('Erro ao carregar treinos');
        const todosTreinos = await resposta.json();

        workouts = usuarioLogado
            ? todosTreinos.filter(
                (w) => String(w.nadador || '').toLowerCase() === usuarioLogado.nome.toLowerCase()
              )
            : todosTreinos;
    } catch (erro) {
        console.error('Erro ao conectar com MongoDB:', erro);
        workouts = [];
    }
    renderStats();
    renderHistory();
}


// busca o ranking do redis
async function carregarRanking() {
    try {
        const resposta = await fetch(RANKING_URL);
        if (!resposta.ok) throw new Error('Erro ao carregar ranking');
        ranking = await resposta.json();
    } catch (erro) {
        console.error('Erro ao conectar com Redis:', erro);
        ranking = [];
    }
    renderRanking();
    renderStats();
}

function renderStats() {
    const totalDistance = workouts.reduce((sum, w) => sum + Number(w.distancia || 0), 0);
    const elDist = document.getElementById('distanciaTotal');
    if (elDist) elDist.innerHTML = `${totalDistance.toLocaleString('pt-BR')} <span>m</span>`;

    const elTreinos = document.getElementById('treinosRealizados');
    if (elTreinos) elTreinos.innerHTML = `${workouts.length}<span class="unit-label"> sessões</span>`;

    let totalSegundos = 0;
    workouts.forEach((w) => {
        if (!w.tempo) return;
        const partes = String(w.tempo).split(':').map(Number);
        if (partes.length === 3) {
            totalSegundos += (partes[0] * 3600) + (partes[1] * 60) + partes[2];
        } else if (partes.length === 2) {
            totalSegundos += (partes[0] * 60) + partes[1];
        }
    });
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const elTempo = document.getElementById('tempoTotal');
    if (elTempo) elTempo.innerHTML = `${horas}<span>h</span>${String(minutos).padStart(2, '0')}<span>min</span>`;

    const elPosicao = document.getElementById('posicaoRanking');
    if (elPosicao && usuarioLogado) {
        const idx = ranking.findIndex(
            (swimmer) => swimmer.nome.toLowerCase() === usuarioLogado.nome.toLowerCase()
        );
        const pos = idx !== -1 ? idx + 1 : 0;
        elPosicao.innerHTML = `#<span class="rank-number">${pos}</span> <span class="unit-label">no ranking</span>`;
    }
}

function renderHistory() {
    if (!workouts.length) {
        historyList.innerHTML = '<p class="empty-state">Ainda não há treinos no banco. Registre sua próxima sessão.</p>';
        return;
    }

    historyList.innerHTML = workouts.map((workout) => {
        const dataStr = String(workout.data).slice(0, 10);
        const formattedDate = new Date(`${dataStr}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

        return `
        <article class="workout-card" data-workout-id="${workout._id}">
            <div class="workout-info">
                <div class="workout-title-row">
                    <h3>${Number(workout.distancia).toLocaleString('pt-BR')} <span>m</span></h3>
                    <span class="workout-tag">${escapeHTML(workout.tipo)}</span>
                </div>
                <p class="workout-meta">
                    <span class="workout-time numeric-value">${escapeHTML(workout.tempo)}</span>
                    <span class="workout-date numeric-value">${escapeHTML(formattedDate)}</span>
                </p>
                ${workout.observacoes ? `<p class="workout-note">${escapeHTML(workout.observacoes)}</p>` : ''}
            </div>
            <div class="workout-actions">
                <button type="button" data-action="edit" aria-label="Editar treino">${editIcon()}</button>
                <button type="button" data-action="delete" aria-label="Excluir treino">${trashIcon()}</button>
            </div>
        </article>`;
    }).join('');
}

function renderRanking() {
    if (!ranking.length) {
        rankingList.innerHTML = '<p class="empty-state">Nenhum nadador pontuou no Redis ainda.</p>';
        return;
    }

    rankingList.innerHTML = ranking.map((swimmer, index) => {
        const iniciais = swimmer.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        const souEu = usuarioLogado && swimmer.nome.toLowerCase() === usuarioLogado.nome.toLowerCase();

        return `
        <div class="ranking-row rank-${index + 1}">
            <span class="ranking-position numeric-value">${String(index + 1).padStart(2, '0')}</span>
            <span class="avatar">${escapeHTML(iniciais)}</span>
            <span class="swimmer-name">${escapeHTML(swimmer.nome)}${souEu ? '<small>Você</small>' : ''}</span>
            <span class="points numeric-value ${index === 0 ? 'positive-value' : ''}">${Number(swimmer.pontos).toLocaleString('pt-BR')} <small>pts</small></span>
        </div>`;
    }).join('');
}

function editIcon() {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15z"/></svg>';
}

function trashIcon() {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/></svg>';
}

function resetForm() {
    form.reset();
    typeInput.value = 'Livre';
    editingId = null;
    if (formTitle) formTitle.textContent = 'Registrar treino';
    submitButton.textContent = 'Salvar treino';
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const treinoPayload = {
        nadador: usuarioLogado ? usuarioLogado.nome : 'Ana Bonfim',
        distancia: Number(distanceInput.value),
        tempo: timeInput.value.trim(),
        data: dateInput.value,
        tipo: typeInput.value,
        observacoes: noteInput.value.trim()
    };

    try {
        let resposta;
        if (editingId !== null) {
            resposta = await fetch(`${API_URL}/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(treinoPayload)
            });
        } else {
            resposta = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(treinoPayload)
            });
        }

        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.erro || 'Erro ao salvar treino');
        }

        resetForm();
        await carregarTreinos();
        await carregarRanking();
        mostrarAviso('Treino salvo no MongoDB e pontos atualizados no Redis!');
    } catch (erro) {
        mostrarAviso('Erro ao salvar: ' + erro.message, true);
    }
});

historyList.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const card = button.closest('[data-workout-id]');
    const id = card.dataset.workoutId;
    const workout = workouts.find((item) => item._id === id);
    if (!workout) return;

    if (button.dataset.action === 'delete') {
        idParaExcluir = id;
        const modalExcluir = document.getElementById('modalExcluir');
        if (modalExcluir) modalExcluir.hidden = false;
        return;
    }


    editingId = workout._id;
    distanceInput.value = String(workout.distancia);
    timeInput.value = workout.tempo;
    dateInput.value = String(workout.data).slice(0, 10);
    typeInput.value = workout.tipo;
    noteInput.value = workout.observacoes || '';

    if (formTitle) formTitle.textContent = 'Editar treino';
    submitButton.textContent = 'Atualizar treino';
    activateTab('register');
    distanceInput.focus();
});

// controle de abas
function activateTab(tabName) {
    const tabs = [
        { name: 'register', button: document.getElementById('tab-register'), panel: document.getElementById('painel-cadastro') },
        { name: 'history', button: document.getElementById('tab-history'), panel: document.getElementById('historico') },
        { name: 'ranking', button: document.getElementById('tab-ranking'), panel: document.getElementById('secao-ranking') }
    ];
    tabs.forEach(({ name, button, panel }) => {
        if (!button || !panel) return;
        const isActive = name === tabName;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-selected', String(isActive));
        panel.hidden = !isActive;
    });
}

const tabsWrap = document.querySelector('.tabs-wrap');
if (tabsWrap) {
    tabsWrap.addEventListener('click', (event) => {
        const tab = event.target.closest('[role="tab"]');
        if (!tab) return;
        activateTab(tab.id.replace('tab-', ''));
    });
}

carregarTreinos();
carregarRanking();
