// Comportamento da página de download: o filme do app em uso no topo (com as outras telas em arco), o passeio por
// formatos com os clipes, a barra de download e o download do sistema de quem visita.
// Sem JavaScript a página continua completa: o filme toca sozinho, o botão leva ao Windows e a lista tem os outros.
(function () {
  var reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fino = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (id) { return document.getElementById(id); };
  var todos = function (sel) { return [].slice.call(document.querySelectorAll(sel)); };

  // Arco: no centro o filme do app em uso; dos lados, telas de outros formatos que levam o filme até elas
  var arco = $('arco'), filme = $('filme'), legenda = $('legenda'), pausa = $('pausa');
  var marcas = JSON.parse(filme.dataset.marcas);
  var POSE = { 1: [62, -280, -32, 0.42], 2: [104, -560, -42, 0.68] }; // distância ao centro: [x %, z px, giro Y, sombra]
  todos('.janela.lado').forEach(function (el) {
    var k = +el.dataset.k, a = Math.abs(k), lado = k < 0 ? -1 : 1, p = POSE[a];
    el.style.transform = 'translate3d(' + (p[0] * lado) + '%,0,' + p[1] + 'px) rotateY(' + (p[2] * lado) + 'deg)';
    el.style.zIndex = 10 - a;
    el.style.setProperty('--sombra', p[3]);
    el.addEventListener('click', function () { irPara(marcas.findIndex(function (m) { return m.nome === el.dataset.ir; })); });
  });
  var atualMarca = -1;
  function marcaEm(t) { var i = 0; marcas.forEach(function (m, j) { if (t >= m.t) i = j; }); return i; }
  function mostrarLegenda(i) {
    if (i === atualMarca) return;
    atualMarca = i;
    legenda.style.opacity = 0;
    setTimeout(function () {
      var b = document.createElement('b'); b.textContent = marcas[i].arquivo;
      legenda.replaceChildren(b, ' ' + marcas[i].tipo); legenda.style.opacity = 1;
    }, 220);
  }
  filme.addEventListener('timeupdate', function () { mostrarLegenda(marcaEm(filme.currentTime)); });
  var parado = reduz;
  function tocar() { if (!parado) { filme.preload = 'auto'; filme.play().catch(function () {}); } }
  function irPara(i) {
    if (i < 0) return;
    var n = (i + marcas.length) % marcas.length;
    filme.currentTime = marcas[n].t + 0.05;
    mostrarLegenda(n);
    if (parado) { parado = false; pausa.textContent = 'Pausar'; }
    tocar();
  }
  $('anterior').addEventListener('click', function () { var i = marcaEm(filme.currentTime); irPara(filme.currentTime - marcas[i].t > 1.2 ? i : i - 1); });
  $('proxima').addEventListener('click', function () { irPara(marcaEm(filme.currentTime) + 1); });
  pausa.addEventListener('click', function () {
    parado = !parado;
    if (parado) filme.pause(); else tocar();
    pausa.textContent = parado ? 'Tocar' : 'Pausar';
  });
  // o filme só baixa para tocar: com movimento reduzido fica no pôster até a pessoa apertar Tocar
  if (reduz) pausa.textContent = 'Tocar';
  // fora da tela o filme para (economiza bateria) e volta de onde estava
  new IntersectionObserver(function (e) { if (e[0].isIntersecting) tocar(); else filme.pause(); }).observe(arco);
  document.addEventListener('visibilitychange', function () { if (document.hidden) filme.pause(); else tocar(); });

  if (!reduz && fino) {
    // o palco inclina na direção do mouse e a luz da mesa acompanha
    var palco = arco.parentNode, alvo = { x: 0, y: 0 }, agora = { x: 0, y: 0 }, girando = false;
    var passo = function () {
      agora.x += (alvo.x - agora.x) * 0.07; agora.y += (alvo.y - agora.y) * 0.07;
      arco.style.setProperty('--rx', (agora.y * -6).toFixed(2) + 'deg');
      arco.style.setProperty('--ry', (agora.x * 9).toFixed(2) + 'deg');
      palco.style.setProperty('--luz-x', (50 + agora.x * 24).toFixed(1) + '%');
      if (Math.abs(alvo.x - agora.x) + Math.abs(alvo.y - agora.y) > 0.002) requestAnimationFrame(passo); else girando = false;
    };
    var mexer = function () { if (!girando) { girando = true; requestAnimationFrame(passo); } };
    palco.addEventListener('pointermove', function (e) {
      var b = palco.getBoundingClientRect();
      alvo.x = (e.clientX - b.left) / b.width - 0.5; alvo.y = (e.clientY - b.top) / b.height - 0.5; mexer();
    });
    palco.addEventListener('pointerleave', function () { alvo.x = 0; alvo.y = 0; mexer(); });
  }

  // Passeio: a etapa no meio da tela troca o clipe do palco e toca do começo; o palco se endireita ao entrar
  var passos = todos('.passo'), telas = todos('#tela > *'), tela = $('tela'), atual = 0;
  var carregar = function (v) { if (v.dataset.poster) { v.poster = v.dataset.poster; delete v.dataset.poster; } };
  var tocarClipe = function (v) { if (reduz || !v) return; v.currentTime = 0; v.play().catch(function () {}); };
  var vigia = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var n = +e.target.dataset.tela;
      passos.forEach(function (p) {
        p.classList.toggle('ativo', p === e.target);
        var v = p.querySelector('video');
        if (Math.abs(+p.dataset.tela - n) <= 1) carregar(v);
        if (v.offsetParent) { if (p === e.target) tocarClipe(v); else v.pause(); } // celular: o clipe fica dentro do passo
      });
      if (n !== atual) {
        var velha = telas[atual], desce = n > atual;
        velha.classList.remove('ativo'); velha.classList.add(desce ? 'sai' : 'volta'); velha.pause();
        setTimeout(function () { velha.classList.remove('sai', 'volta'); }, 700);
        telas[n].classList.toggle('de-cima', !desce); void telas[n].offsetWidth; // aplica o ponto de partida antes de animar
        atual = n;
      }
      telas.forEach(function (t, i) { if (Math.abs(i - n) <= 1) carregar(t); t.classList.toggle('ativo', i === n); });
      if (telas[n].offsetParent) tocarClipe(telas[n]);
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  passos.forEach(function (p) { vigia.observe(p); });
  var lista = $('passos'), secao = $('formatos'), pedido = false;
  var rolagem = function () {
    pedido = false;
    var r = lista.getBoundingClientRect();
    lista.style.setProperty('--prog', Math.min(1, Math.max(0, (innerHeight / 2 - r.top) / r.height)).toFixed(4));
    if (reduz) return;
    var s = secao.getBoundingClientRect(), p = Math.min(1, Math.max(0, (innerHeight - s.top) / (innerHeight * 0.9))), e = 1 - Math.pow(1 - p, 3);
    tela.style.setProperty('--inclina', (14 * (1 - e)).toFixed(2) + 'deg');
    tela.style.setProperty('--escala', (0.9 + 0.1 * e).toFixed(3));
  };
  addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(rolagem); } }, { passive: true });
  rolagem();

  // Barra de download: aparece quando o botão do topo sai da tela; some na seção de download e no rodapé, e reserva
  // espaço no fim da página para nunca cobrir conteúdo
  var barra = $('barra'), topoFora = false, naSecao = false, noRodape = false;
  var mostrarBarra = function () {
    var celular = document.body.classList.contains('mobile');
    var ver = topoFora && !naSecao && !noRodape && !celular;
    barra.classList.toggle('visivel', ver);
    document.body.classList.toggle('com-barra', topoFora && !celular);
    barra.inert = !ver;
    if (ver) barra.removeAttribute('aria-hidden'); else barra.setAttribute('aria-hidden', 'true');
  };
  new IntersectionObserver(function (e) { topoFora = !e[0].isIntersecting && e[0].boundingClientRect.top < 0; mostrarBarra(); }).observe($('abertura'));
  new IntersectionObserver(function (e) { naSecao = e[0].isIntersecting; mostrarBarra(); }, { threshold: 0.15 }).observe($('baixar'));
  new IntersectionObserver(function (e) { noRodape = e[0].isIntersecting; mostrarBarra(); }, { rootMargin: '0px 0px 120px 0px' }).observe(document.querySelector('footer'));

  // Download do sistema de quem visita: o arquivo de cada sistema vem da lista do HTML (fonte única), os passos daqui
  var BASE = 'https://github.com/pedronvitoriano/folio-releases/releases/latest/download/';
  var MAC = ['Abra o arquivo baixado e arraste o Folio para a pasta <b>Aplicativos</b>.', 'Na primeira vez, clique no Folio com o botão direito e escolha <b>Abrir</b>.', 'Se o Mac ainda bloquear, vá em <b>Ajustes do Sistema</b>, <b>Privacidade e Segurança</b>, e clique em <b>Abrir Mesmo Assim</b>.'];
  var OPCOES = {
    windows: { nome: 'Windows 10 e 11', botao: 'Baixar para Windows', passos: ['Abra o arquivo baixado e clique em <b>Extrair tudo</b>.', 'Na pasta extraída, clique duas vezes em <b>Instalar</b>. Não pede senha de administrador.', 'Se aparecer <b>O Windows protegeu o computador</b>, clique em <b>Mais informações</b> e depois em <b>Executar assim mesmo</b>.'] },
    'mac-arm': { nome: 'Mac com chip Apple', botao: 'Baixar para Mac', passos: MAC },
    'mac-intel': { nome: 'Mac com Intel', botao: 'Baixar para Mac (Intel)', passos: MAC },
    'linux-deb': { nome: 'Ubuntu, Debian e Mint', botao: 'Baixar o pacote .deb', passos: ['Abra o arquivo baixado: a central de programas do sistema aparece.', 'Clique em <b>Instalar</b> e confirme com a sua senha.', 'Procure <b>Folio</b> no menu de aplicativos.'] },
    linux: { nome: 'Linux', botao: 'Baixar o AppImage', passos: ['Clique com o botão direito no arquivo baixado e abra <b>Propriedades</b>.', 'Marque <b>Permitir executar como programa</b>.', 'Clique duas vezes no arquivo para abrir o Folio.'] }
  };
  todos('#lista li').forEach(function (li) { OPCOES[li.dataset.so].arq = li.dataset.arq; });
  var ALTERNATIVA = {
    'mac-arm': ['Mac com chip Apple (M1 ou mais novo)? ', 'Baixe esta versão', '.'],
    'mac-intel': ['Mac com processador Intel? ', 'Baixe esta versão', '.'],
    linux: ['Outra distribuição? Use o ', 'AppImage', ', que roda em qualquer uma.'],
    'linux-deb': ['Ubuntu, Debian ou Mint? Prefira o ', 'pacote .deb', '.']
  };
  var detectado = null, nomeDetectado = null;
  var mb = function (n) { return Math.round(n / 1048576) + ' MB'; };
  function escolher(chave) {
    var o = OPCOES[chave], seu = chave === detectado;
    $('nome-sistema').textContent = seu && nomeDetectado ? nomeDetectado : o.nome;
    $('rotulo-sistema').textContent = seu ? 'Para o seu computador' : 'Versão para';
    $('baixar-painel').href = BASE + o.arq;
    $('baixar-painel-texto').textContent = o.botao;
    $('instalar').innerHTML = o.passos.map(function (p) { return '<li>' + p + '</li>'; }).join('');
    todos('#lista li').forEach(function (li) { li.querySelector('button').setAttribute('aria-pressed', li.dataset.so === chave ? 'true' : 'false'); });
  }
  todos('#lista li').forEach(function (li) { li.querySelector('button').addEventListener('click', function () { escolher(li.dataset.so); }); });

  // Depois do clique em baixar: o aviso aparece junto do botão clicado e aponta os passos de instalação
  function avisarDownload(idAviso) {
    var aviso = $(idAviso);
    if (idAviso === 'aviso-painel') aviso.textContent = 'O download começou. Quando terminar, siga os passos abaixo.';
    else {
      var ir = document.createElement('a'); ir.href = '#baixar'; ir.textContent = 'veja como instalar';
      aviso.replaceChildren('O download começou. Quando terminar, ', ir, '.');
    }
    $('instalar').classList.add('realce');
    setTimeout(function () { $('instalar').classList.remove('realce'); }, 2400);
  }
  [['principal', 'aviso-topo'], ['baixar-painel', 'aviso-painel'], ['fecho-baixar', 'aviso-fecho'], ['barra-baixar', 'aviso-barra']].forEach(function (par) {
    $(par[0]).addEventListener('click', function () { avisarDownload(par[1]); });
  });

  function roleta(el, nomes, final) {
    var caixa = el.closest('[aria-live]'), i = 0, espera = 55;
    if (caixa) caixa.setAttribute('aria-busy', 'true');
    var gira = function () {
      var ultimo = i >= nomes.length;
      el.textContent = ultimo ? final : nomes[i++];
      el.animate([{ transform: 'translateY(38%)', opacity: 0, filter: 'blur(6px)' }, { transform: 'none', opacity: 1, filter: 'none' }],
        { duration: ultimo ? 520 : espera * 1.6, easing: ultimo ? 'cubic-bezier(0.23, 1, 0.32, 1)' : 'linear' });
      if (ultimo) { if (caixa) caixa.removeAttribute('aria-busy'); return; }
      espera *= 1.24; setTimeout(gira, espera);
    };
    gira();
  }

  var d = navigator.userAgentData, ua = navigator.userAgent;
  var gpuDaApple = function () {
    try {
      var gl = document.createElement('canvas').getContext('webgl');
      var ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
      var r = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : '';
      return /Apple/.test(r) && !/Intel|AMD|Radeon/.test(r);
    } catch (e) { return false; }
  };
  (async function () {
    var info = { ua: ua, platform: d && d.platform, mobile: d && d.mobile, maxTouchPoints: navigator.maxTouchPoints };
    if (d && d.platform) {
      try { var h = await d.getHighEntropyValues(['architecture', 'platformVersion']); info.architecture = h.architecture; info.platformVersion = h.platformVersion; } catch (e) { /* sem detalhes: segue com o básico */ }
    }
    if (!info.architecture && /Mac OS X|Macintosh/.test(ua)) info.gpuApple = gpuDaApple();
    var r = FolioDetectar.escolher(info);

    if (r.celular) {
      // no celular todos os botões de baixar viram "enviar o link para o computador"
      document.body.classList.add('mobile'); mostrarBarra();
      var url = location.href.split('#')[0];
      todos('.enviar-link').forEach(function (b) {
        b.addEventListener('click', async function () {
          var msg = b.parentNode.querySelector('.copiado');
          try {
            if (navigator.share) { await navigator.share({ title: 'Folio', text: 'Baixar o Folio no computador', url: url }); return; }
            await navigator.clipboard.writeText(url); msg.textContent = 'Link copiado. Cole no e-mail ou na conversa e abra no computador.';
          } catch (e) { if (e && e.name !== 'AbortError') msg.textContent = 'Copie este endereço: ' + url; }
        });
      });
    } else if (r.chave) {
      detectado = r.chave; nomeDetectado = r.nome;
      $('principal').href = BASE + OPCOES[r.chave].arq;
      $('principal-texto').textContent = 'Baixar para ' + r.rotulo;
      ['fecho-baixar', 'barra-baixar'].forEach(function (id) { $(id).href = BASE + OPCOES[r.chave].arq; $(id).querySelector('.rotulo-baixar').textContent = 'Baixar para ' + r.rotulo; });
      var alt = $('alternativa');
      if (r.alternativa === 'chromeos') alt.textContent = 'No Chromebook, ligue o Linux nas configurações e abra o AppImage por lá. ';
      else if (r.alternativa) {
        var t = ALTERNATIVA[r.alternativa], a = document.createElement('a');
        a.href = BASE + OPCOES[r.alternativa].arq; a.textContent = t[1];
        alt.replaceChildren(t[0], a, t[2] + ' ');
      }
      if (r.alternativa) { var tds = document.createElement('a'); tds.href = '#baixar'; tds.textContent = 'Todas as versões'; alt.append(tds, '.'); }
      escolher(r.chave);
      if (!reduz) {
        var vigiaBaixar = new IntersectionObserver(function (es) {
          if (!es[0].isIntersecting) return;
          vigiaBaixar.disconnect();
          roleta($('nome-sistema'), ['Windows', 'Mac', 'Ubuntu', 'Linux', 'Windows 10', 'Mac com Intel', 'Debian'], $('nome-sistema').textContent);
        }, { threshold: 0.6 });
        vigiaBaixar.observe($('nome-sistema'));
      }
    }

    // versão e tamanho reais da última versão; guardados por 10 minutos (a API do GitHub aceita 60 consultas por hora por endereço)
    try {
      var cache = null;
      try { cache = JSON.parse(sessionStorage.getItem('folio-release') || 'null'); } catch (e) { /* armazenamento bloqueado */ }
      if (!cache || !cache.em || Date.now() - cache.em > 600000) {
        var resp = await fetch('https://api.github.com/repos/pedronvitoriano/folio-releases/releases/latest', { headers: { Accept: 'application/vnd.github+json' } });
        if (!resp.ok) return;
        cache = FolioDetectar.lerVersao(await resp.json()); cache.em = Date.now();
        try { sessionStorage.setItem('folio-release', JSON.stringify(cache)); } catch (e) { /* segue sem guardar */ }
      } else cache = Object.assign(FolioDetectar.lerVersao({ tag_name: 'v' + cache.versao, assets: Object.keys(cache.tam || {}).map(function (k) { return { name: k, size: cache.tam[k] }; }) }), { em: cache.em });
      todos('[data-tam]').forEach(function (s) { var n = cache.tam[s.dataset.tam]; if (n) s.textContent = mb(n); });
      if (cache.versao) {
        var tam = detectado && cache.tam[OPCOES[detectado].arq], b = document.createElement('b');
        b.textContent = cache.versao;
        $('principal-meta').replaceChildren('Versão ', b, (tam ? ', ' + mb(tam) : '') + '. Grátis e sem cadastro.');
        $('versao-nota').textContent = 'Versão ' + cache.versao + ', a mais recente. Os links levam sempre à última versão, e o Folio avisa quando houver uma nova.';
      }
    } catch (e) { /* sem rede: os links continuam apontando para a última versão */ }
  })();
})();
