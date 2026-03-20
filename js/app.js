const USERS_KEY = "droplet_users";
const SESSION_KEY = "droplet_session";
const REMEMBER_KEY = "droplet_remember_email";

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession() {
  return localStorage.getItem(SESSION_KEY);
}

function setSession(email) {
  localStorage.setItem(SESSION_KEY, email);
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function getCurrentUser() {
  const email = getSession();
  if (!email) return null;
  return getUsers().find(user => user.email === email) || null;
}

function updateCurrentUser(updatedUser) {
  const users = getUsers().map(user =>
    user.email === updatedUser.email ? updatedUser : user
  );
  saveUsers(users);
}

function calcularMetaDiaria(peso) {
  if (!peso || peso <= 0) return 0;
  return Math.round(peso * 35);
}

function formatarNumero(valor) {
  return Number(valor).toLocaleString("pt-BR");
}

function gerarHorarioAtual() {
  const agora = new Date();
  const horas = String(agora.getHours()).padStart(2, "0");
  const minutos = String(agora.getMinutes()).padStart(2, "0");
  return `${horas}:${minutos}`;
}

function gerarDataAtual() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function atualizarAvatar(nome, elementoId) {
  const el = document.getElementById(elementoId);
  if (!el) return;
  const inicial = nome && nome.trim() ? nome.trim().charAt(0).toUpperCase() : "U";
  el.textContent = inicial;
}

function voltarInicio() {
  window.location.href = "inicio.html";
}

function logout() {
  clearSession();
  window.location.href = "login.html";
}

function exigirLogin() {
  const paginaLogin = document.getElementById("loginForm") || document.getElementById("cadastroForm");
  const usuario = getCurrentUser();

  if (!paginaLogin && !usuario) {
    window.location.href = "login.html";
  }

  if (paginaLogin && usuario) {
    window.location.href = "inicio.html";
  }
}

function mostrarMensagemAuth(texto, tipo = "info") {
  const box = document.getElementById("authMensagem");
  if (!box) return;

  box.textContent = texto;
  box.classList.remove("hidden");
  box.style.background = tipo === "erro" ? "#fff0f0" : "#eef6ff";
  box.style.color = tipo === "erro" ? "#b94c4c" : "#31527a";
}

function esconderMensagemAuth() {
  const box = document.getElementById("authMensagem");
  if (!box) return;
  box.classList.add("hidden");
  box.textContent = "";
}

function mostrarLogin() {
  document.getElementById("blocoLogin")?.classList.remove("hidden");
  document.getElementById("blocoCadastro")?.classList.add("hidden");
  document.getElementById("btnMostrarLogin")?.classList.add("active");
  document.getElementById("btnMostrarCadastro")?.classList.remove("active");
  esconderMensagemAuth();
}

function mostrarCadastro() {
  document.getElementById("blocoCadastro")?.classList.remove("hidden");
  document.getElementById("blocoLogin")?.classList.add("hidden");
  document.getElementById("btnMostrarCadastro")?.classList.add("active");
  document.getElementById("btnMostrarLogin")?.classList.remove("active");
  esconderMensagemAuth();
}

function iniciarAuth() {
  const btnMostrarLogin = document.getElementById("btnMostrarLogin");
  const btnMostrarCadastro = document.getElementById("btnMostrarCadastro");
  const loginForm = document.getElementById("loginForm");
  const cadastroForm = document.getElementById("cadastroForm");
  const btnEsqueciSenha = document.getElementById("btnEsqueciSenha");

  if (btnMostrarLogin) btnMostrarLogin.addEventListener("click", mostrarLogin);
  if (btnMostrarCadastro) btnMostrarCadastro.addEventListener("click", mostrarCadastro);

  const emailLembrado = localStorage.getItem(REMEMBER_KEY);
  const emailLoginInput = document.getElementById("emailLogin");
  const lembrarLogin = document.getElementById("lembrarLogin");

  if (emailLembrado && emailLoginInput) {
    emailLoginInput.value = emailLembrado;
    if (lembrarLogin) lembrarLogin.checked = true;
  }

  if (cadastroForm) {
    cadastroForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const nome = document.getElementById("nomeCadastro").value.trim();
      const email = document.getElementById("emailCadastro").value.trim().toLowerCase();
      const senha = document.getElementById("senhaCadastro").value;
      const confirmar = document.getElementById("confirmarSenhaCadastro").value;

      if (!nome || !email || !senha || !confirmar) {
        mostrarMensagemAuth("Preencha todos os campos.", "erro");
        return;
      }

      if (senha !== confirmar) {
        mostrarMensagemAuth("As senhas não coincidem.", "erro");
        return;
      }

      const users = getUsers();
      const jaExiste = users.some(user => user.email === email);

      if (jaExiste) {
        mostrarMensagemAuth("Já existe uma conta com esse e-mail.", "erro");
        return;
      }

      const novoUsuario = {
        nome,
        email,
        senha,
        peso: 0,
        altura: 0,
        metaDiaria: 0,
        historico: []
      };

      users.push(novoUsuario);
      saveUsers(users);

      mostrarMensagemAuth("Conta criada com sucesso. Agora faça login.");
      cadastroForm.reset();
      mostrarLogin();
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const email = document.getElementById("emailLogin").value.trim().toLowerCase();
      const senha = document.getElementById("senhaLogin").value;
      const lembrar = document.getElementById("lembrarLogin").checked;

      const user = getUsers().find(user => user.email === email && user.senha === senha);

      if (!user) {
        mostrarMensagemAuth("E-mail ou senha inválidos.", "erro");
        return;
      }

      if (lembrar) {
        localStorage.setItem(REMEMBER_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      setSession(user.email);
      window.location.href = "inicio.html";
    });
  }

  if (btnEsqueciSenha) {
    btnEsqueciSenha.addEventListener("click", (event) => {
      event.preventDefault();

      const email = prompt("Digite o e-mail cadastrado:");
      if (!email) return;

      const users = getUsers();
      const user = users.find(u => u.email === email.trim().toLowerCase());

      if (!user) {
        mostrarMensagemAuth("Nenhuma conta encontrada com esse e-mail.", "erro");
        return;
      }

      const novaSenha = prompt("Digite a nova senha:");
      if (!novaSenha) return;

      user.senha = novaSenha;
      saveUsers(users);
      mostrarMensagemAuth("Senha redefinida com sucesso.");
    });
  }
}

function getHistoricoDoDia(user, data) {
  return (user.historico || []).filter(item => item.data === data);
}

function getConsumoHoje(user) {
  const hoje = gerarDataAtual();
  return getHistoricoDoDia(user, hoje).reduce((acc, item) => {
    if (item.tipo === "adicao") return acc + item.quantidade;
    if (item.tipo === "remocao") return acc - item.quantidade;
    return acc;
  }, 0);
}

function atualizarMarcacoesEscala(meta) {
  const mark1 = document.getElementById("mark1");
  const mark2 = document.getElementById("mark2");
  const mark3 = document.getElementById("mark3");
  const mark4 = document.getElementById("mark4");
  const mark5 = document.getElementById("mark5");
  const mark6 = document.getElementById("mark6");

  if (!mark1) return;

  if (!meta || meta <= 0) {
    mark1.textContent = "2500ml";
    mark2.textContent = "2000ml";
    mark3.textContent = "1500ml";
    mark4.textContent = "1000ml";
    mark5.textContent = "500ml";
    mark6.textContent = "0ml";
    return;
  }

  mark1.textContent = `${meta}ml`;
  mark2.textContent = `${Math.round(meta * 0.8)}ml`;
  mark3.textContent = `${Math.round(meta * 0.6)}ml`;
  mark4.textContent = `${Math.round(meta * 0.4)}ml`;
  mark5.textContent = `${Math.round(meta * 0.2)}ml`;
  mark6.textContent = `0ml`;
}

function carregarInicio() {
  exigirLogin();

  const user = getCurrentUser();
  if (!user) return;

  const nomeUsuario = document.getElementById("nomeUsuario");
  const pesoUsuario = document.getElementById("pesoUsuario");
  const alturaUsuario = document.getElementById("alturaUsuario");
  const metaDiariaTopo = document.getElementById("metaDiariaTopo");
  const consumoHojeTexto = document.getElementById("consumoHojeTexto");
  const metaHojeTexto = document.getElementById("metaHojeTexto");
  const metaDiariaLabel = document.getElementById("metaDiariaLabel");
  const barraProgresso = document.getElementById("barraProgresso");
  const aguaGarrafa = document.getElementById("aguaGarrafa");
  const listaHistoricoHoje = document.getElementById("listaHistoricoHoje");
  const nomeHeader = document.getElementById("nomeHeader");

  if (!nomeUsuario) return;

  const consumoHoje = Math.max(0, getConsumoHoje(user));

  nomeUsuario.textContent = user.nome || "Usuário";
  pesoUsuario.textContent = `${user.peso || 0} kg`;
  alturaUsuario.textContent = `${Number(user.altura || 0).toFixed(2)} m`;
  metaDiariaTopo.textContent = `${user.metaDiaria || 0} ml`;

  consumoHojeTexto.textContent = `${consumoHoje}ml`;
  metaHojeTexto.textContent = `${user.metaDiaria || 0}ml`;
  metaDiariaLabel.textContent = `${user.metaDiaria || 0}ml`;

  if (nomeHeader) {
    nomeHeader.textContent = `Olá, ${user.nome || "usuário"}`;
  }

  atualizarAvatar(user.nome, "avatarUsuario");
  atualizarMarcacoesEscala(user.metaDiaria || 0);

  const percentual = user.metaDiaria > 0
    ? Math.min((consumoHoje / user.metaDiaria) * 100, 100)
    : 0;

  barraProgresso.style.width = `${percentual}%`;
  aguaGarrafa.style.height = `${percentual}%`;

  const historicoHoje = getHistoricoDoDia(user, gerarDataAtual());
  listaHistoricoHoje.innerHTML = "";

  if (!historicoHoje.length) {
    listaHistoricoHoje.innerHTML = `
      <div class="item-historico">
        <span>Nenhum consumo registrado ainda.</span>
        <strong>0ml</strong>
      </div>
    `;
    return;
  }

  historicoHoje
    .slice()
    .reverse()
    .forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "item-historico fade-in-up";
      div.style.animationDelay = `${index * 0.06}s`;

      let texto = "";
      if (item.tipo === "adicao") texto = `+ ${item.quantidade}ml`;
      if (item.tipo === "remocao") texto = `- ${item.quantidade}ml`;
      if (item.tipo === "reset") texto = `Resetou o dia`;

      div.innerHTML = `
        <span>${texto}</span>
        <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
          <small>${item.horario}</small>
          ${item.tipo !== "reset" ? `<button class="btn-outline" onclick="desfazerRegistro('${item.id}')">Desfazer</button>` : ""}
        </div>
      `;
      listaHistoricoHoje.appendChild(div);
    });
}

function adicionarRegistroNoUsuario(tipo, quantidade) {
  const user = getCurrentUser();
  if (!user) return;

  user.historico = user.historico || [];
  user.historico.push({
    id: crypto.randomUUID(),
    horario: gerarHorarioAtual(),
    data: gerarDataAtual(),
    quantidade,
    tipo
  });

  updateCurrentUser(user);
}

function adicionarConsumo(valor) {
  adicionarRegistroNoUsuario("adicao", valor);
  carregarInicio();
}

function removerConsumoRapido(valor) {
  const user = getCurrentUser();
  if (!user) return;

  const consumoAtual = getConsumoHoje(user);
  const quantidadeReal = Math.min(consumoAtual, valor);

  if (quantidadeReal <= 0) return;

  adicionarRegistroNoUsuario("remocao", quantidadeReal);
  carregarInicio();
}

function adicionarConsumoPersonalizado() {
  const valorTexto = prompt("Digite a quantidade em ml. Use valor positivo para somar ou negativo para remover.\nEx.: 300 ou -150");

  if (valorTexto === null) return;

  const valor = Number(valorTexto);

  if (isNaN(valor) || valor === 0) {
    alert("Digite um valor válido.");
    return;
  }

  if (valor > 0) {
    adicionarConsumo(valor);
  } else {
    removerConsumoRapido(Math.abs(valor));
  }
}

function resetarConsumoDia() {
  const user = getCurrentUser();
  if (!user) return;

  const consumoAtual = getConsumoHoje(user);
  if (consumoAtual <= 0) {
    alert("Não há consumo para resetar hoje.");
    return;
  }

  const confirmar = confirm("Deseja resetar todo o consumo de água de hoje?");
  if (!confirmar) return;

  user.historico = user.historico || [];
  user.historico.push({
    id: crypto.randomUUID(),
    horario: gerarHorarioAtual(),
    data: gerarDataAtual(),
    quantidade: 0,
    tipo: "reset"
  });

  user.historico = user.historico.filter(item => item.data !== gerarDataAtual() || item.tipo === "reset");
  updateCurrentUser(user);
  carregarInicio();
}

function desfazerRegistro(id) {
  const user = getCurrentUser();
  if (!user) return;

  const index = (user.historico || []).findIndex(item => item.id === id);
  if (index === -1) return;

  user.historico.splice(index, 1);
  updateCurrentUser(user);
  carregarInicio();
}

/* modal perfil */
function abrirModalPerfil() {
  const modal = document.getElementById("modalPerfil");
  const user = getCurrentUser();
  if (!modal || !user) return;

  document.getElementById("inputNome").value = user.nome || "";
  document.getElementById("inputPeso").value = user.peso || "";
  document.getElementById("inputAltura").value = user.altura || "";

  modal.classList.remove("hidden");
}

function fecharModalPerfil() {
  const modal = document.getElementById("modalPerfil");
  if (modal) modal.classList.add("hidden");
}

function salvarPerfil() {
  const nome = document.getElementById("inputNome").value.trim();
  const peso = Number(document.getElementById("inputPeso").value);
  const altura = Number(document.getElementById("inputAltura").value);

  if (!nome) {
    alert("Digite o nome.");
    return;
  }

  if (isNaN(peso) || peso < 0) {
    alert("Digite um peso válido.");
    return;
  }

  if (isNaN(altura) || altura < 0) {
    alert("Digite uma altura válida.");
    return;
  }

  const user = getCurrentUser();
  if (!user) return;

  user.nome = nome;
  user.peso = peso;
  user.altura = altura;
  user.metaDiaria = calcularMetaDiaria(peso);

  updateCurrentUser(user);
  fecharModalPerfil();
  carregarInicio();
}

/* histórico */
function obterInicioDaSemana(data) {
  const d = new Date(data);
  const dia = d.getDay();
  const ajuste = dia === 0 ? -6 : 1 - dia;
  d.setDate(d.getDate() + ajuste);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatarDataISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function calcularTotalDia(user, dataIso) {
  return (user.historico || []).reduce((acc, item) => {
    if (item.data !== dataIso) return acc;
    if (item.tipo === "adicao") return acc + item.quantidade;
    if (item.tipo === "remocao") return acc - item.quantidade;
    if (item.tipo === "reset") return 0;
    return acc;
  }, 0);
}

function carregarHistorico() {
  exigirLogin();

  const user = getCurrentUser();
  if (!user) return;

  atualizarAvatar(user.nome, "avatarHistorico");

  const textoComparativo = document.getElementById("textoComparativo");
  const metaSemanalTexto = document.getElementById("metaSemanalTexto");
  const totalSemanaAtual = document.getElementById("totalSemanaAtual");
  const totalSemanaPassada = document.getElementById("totalSemanaPassada");
  const rodapeSemanaAtual = document.getElementById("rodapeSemanaAtual");
  const rodapeSemanaPassada = document.getElementById("rodapeSemanaPassada");
  const grafico = document.getElementById("graficoSemana");
  const resumoBarra = document.getElementById("resumoBarra");

  if (!grafico) return;

  const hoje = new Date();
  const inicioSemanaAtual = obterInicioDaSemana(hoje);
  const inicioSemanaPassada = new Date(inicioSemanaAtual);
  inicioSemanaPassada.setDate(inicioSemanaPassada.getDate() - 7);

  const labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const dadosSemanaAtual = [];
  const dadosSemanaPassada = [];

  for (let i = 0; i < 7; i++) {
    const dataAtual = new Date(inicioSemanaAtual);
    dataAtual.setDate(inicioSemanaAtual.getDate() + i);

    const dataPassada = new Date(inicioSemanaPassada);
    dataPassada.setDate(inicioSemanaPassada.getDate() + i);

    dadosSemanaAtual.push({
      dia: labels[i],
      quantidade: Math.max(0, calcularTotalDia(user, formatarDataISO(dataAtual)))
    });

    dadosSemanaPassada.push({
      dia: labels[i],
      quantidade: Math.max(0, calcularTotalDia(user, formatarDataISO(dataPassada)))
    });
  }

  const estaSemanaTotal = dadosSemanaAtual.reduce((acc, item) => acc + item.quantidade, 0);
  const semanaPassadaTotal = dadosSemanaPassada.reduce((acc, item) => acc + item.quantidade, 0);
  const metaSemanal = (user.metaDiaria || 0) * 7;

  metaSemanalTexto.textContent = `${formatarNumero(metaSemanal)}ml`;
  totalSemanaAtual.textContent = `${formatarNumero(estaSemanaTotal)}ml`;
  totalSemanaPassada.textContent = `${formatarNumero(semanaPassadaTotal)}ml`;
  rodapeSemanaAtual.textContent = `${formatarNumero(estaSemanaTotal)}ml`;
  rodapeSemanaPassada.textContent = `${formatarNumero(semanaPassadaTotal)}ml`;

  const diferenca = estaSemanaTotal - semanaPassadaTotal;

  if (diferenca > 0) {
    textoComparativo.textContent = `Você bebeu ${formatarNumero(diferenca)}ml a mais que na semana passada.`;
  } else if (diferenca < 0) {
    textoComparativo.textContent = `Você bebeu ${formatarNumero(Math.abs(diferenca))}ml a menos que na semana passada.`;
  } else {
    textoComparativo.textContent = "Você consumiu a mesma quantidade que na semana passada.";
  }

  const percentualResumo = metaSemanal > 0
    ? Math.min((estaSemanaTotal / metaSemanal) * 100, 100)
    : 0;

  resumoBarra.style.width = `${percentualResumo}%`;

  grafico.innerHTML = "";

  const maiorValor = Math.max(...dadosSemanaAtual.map(item => item.quantidade), 1);

  dadosSemanaAtual.forEach((item, index) => {
    const alturaBarra = (item.quantidade / maiorValor) * 230 + 20;

    const barItem = document.createElement("div");
    barItem.className = "bar-item fade-in-up";
    barItem.style.animationDelay = `${index * 0.08}s`;

    barItem.innerHTML = `
      <div class="bar-value">${item.quantidade}ml</div>
      <div class="bar-visual" style="height:${alturaBarra}px;"></div>
      <div class="bar-label">${item.dia}</div>
    `;

    grafico.appendChild(barItem);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  exigirLogin();
  iniciarAuth();
});