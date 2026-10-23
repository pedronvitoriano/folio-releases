// Comportamento da página de download: entrada, pilha de capturas, passeio por formatos e o download do sistema
// de quem visita. Sem JavaScript a página continua completa: o botão leva ao Windows e a lista tem os outros.
(function () {
  var reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };
  requestAnimationFrame(function () { $('abertura').classList.add('entrou'); });

  // Arco: as janelas do app em 3D; a do centro mostra um tipo de arquivo e o arco gira a cada 3,2 s
  var janelas = [].slice.call(document.querySelectorAll('.janela')), N = janelas.length, centro = 0;
  var arco = $('arco'), legenda = $('legenda'), pausa = $('pausa');
  // posição pela distância ao centro: [x %, z px, giro Y graus, opacidade, sombra]
  var POSE = { 0: [0, 0, 0, 1, 0], 1: [62, -280, -32, 1, 0.42], 2: [104, -560, -42, 0.7, 0.7], 3: [130, -760, -48, 0, 0.85] };
  function dist(i) { var k = ((i - centro) % N + N) % N; return k > N / 2 ? k - N : k; }
  function posicionar() {
    janelas.forEach(function (el, i) {
      var k = dist(i), a = Math.min(Math.abs(k), 3), lado = k < 0 ? -1 : 1, p = POSE[a];
      el.style.transform = 'translate3d(' + (p[0] * lado) + '%,0,' + p[1] + 'px) rotateY(' + (p[2] * lado) + 'deg)';
      el.style.opacity = p[3];
      el.style.zIndex = 10 - a;
      el.style.setProperty('--sombra', p[4]);
      el.setAttribute('aria-hidden', 'true');
      // a janela só baixa quando chega perto da frente
      var img = el.querySelector('img[data-srcset]');
      if (img && a <= 2) { img.srcset = img.dataset.srcset; img.removeAttribute('data-srcset'); }
    });
    var el = janelas[centro];
    legenda.style.opacity = 0;
    setTimeout(function () {
      var b = document.createElement('b'); b.textContent = el.dataset.nome;
      legenda.replaceChildren(b, ' ' + el.dataset.tipo); legenda.style.opacity = 1;
    }, 260);
  }
  function ir(n) { centro = ((n % N) + N) % N; posicionar(); }
  posicionar();
  janelas.forEach(function (el, i) { el.addEventListener('click', function () { if (i !== centro) { ir(i); agendar(); } }); });

  var parado = false, visivel = true, dentro = false, timer = null;
  function agendar() {
    clearTimeout(timer);
    if (reduz || parado || !visivel || dentro || document.hidden) return;
    timer = setTimeout(function () { ir(centro + 1); agendar(); }, 3200);
  }
  $('controles').hidden = false;
  $('anterior').addEventListener('click', function () { ir(centro - 1); agendar(); });
  $('proxima').addEventListener('click', function () { ir(centro + 1); agendar(); });
  if (reduz) pausa.hidden = true;
  pausa.addEventListener('click', function () { parado = !parado; pausa.textContent = parado ? 'Continuar' : 'Pausar'; agendar(); });
  [arco, $('controles')].forEach(function (el) {
    el.addEventListener('mouseenter', function () { dentro = true; agendar(); });
    el.addEventListener('mouseleave', function () { dentro = false; agendar(); });
    el.addEventListener('focusin', function () { dentro = true; agendar(); });
    el.addEventListener('focusout', function () { dentro = false; agendar(); });
  });
  new IntersectionObserver(function (e) { visivel = e[0].isIntersecting; agendar(); }).observe(arco);
  document.addEventListener('visibilitychange', agendar);

  if (!reduz) {
    // entrada única: as janelas sobem da mesa uma a uma, de trás para a frente
    janelas.map(function (el, i) { return [Math.abs(dist(i)), el]; }).filter(function (x) { return x[0] <= 2; })
      .sort(function (a, b) { return b[0] - a[0]; }).forEach(function (x, ordem) {
        x[1].animate([{ transform: x[1].style.transform + ' translateY(46%) rotateX(-18deg)', opacity: 0 }, { transform: x[1].style.transform, opacity: x[1].style.opacity }],
          { duration: 1300, delay: 260 + ordem * 120, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'backwards' });
      });
    setTimeout(agendar, 2200);
    // o palco inclina na direção do mouse e a luz da mesa acompanha
    var palco = arco.parentNode, alvo = { x: 0, y: 0 }, agora = { x: 0, y: 0 }, girando = false;
    var passo = function () {
      agora.x += (alvo.x - agora.x) * 0.07; agora.y += (alvo.y - agora.y) * 0.07;
      arco.style.setProperty('--rx', (agora.y * -6).toFixed(2) + 'deg');
      arco.style.setProperty('--ry', (agora.x * 9).toFixed(2) + 'deg');
      palco.style.setProperty('--luz-x', (50 + agora.x * 24).toFixed(1) + '%');
      if (Math.abs(alvo.x - agora.x) + Math.abs(alvo.y - agora.y) > 0.002) requestAnimationFrame(passo); else girando = false;
    };
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      palco.addEventListener('pointermove', function (e) {
        var b = palco.getBoundingClientRect();
        alvo.x = (e.clientX - b.left) / b.width - 0.5; alvo.y = (e.clientY - b.top) / b.height - 0.5;
        if (!girando) { girando = true; requestAnimationFrame(passo); }
      });
      palco.addEventListener('pointerleave', function () { alvo.x = 0; alvo.y = 0; if (!girando) { girando = true; requestAnimationFrame(passo); } });
    }
  }

  // Barra de download: aparece quando o botão do topo sai da tela e some na seção de download e no rodapé
  // (perto do fim ela cobriria os links de privacidade e termos)
  var barra = $('barra'), topoFora = false, naSecao = false, noRodape = false;
  var mostrarBarra = function () {
    var ver = topoFora && !naSecao && !noRodape && !document.body.classList.contains('mobile');
    barra.classList.toggle('visivel', ver);
    if (ver) { barra.removeAttribute('aria-hidden'); barra.inert = false; } else { barra.setAttribute('aria-hidden', 'true'); barra.inert = true; }
  };
  new IntersectionObserver(function (e) { topoFora = !e[0].isIntersecting && e[0].boundingClientRect.top < 0; mostrarBarra(); }).observe($('principal'));
  new IntersectionObserver(function (e) { naSecao = e[0].isIntersecting; mostrarBarra(); }, { threshold: 0.15 }).observe($('baixar'));
  new IntersectionObserver(function (e) { noRodape = e[0].isIntersecting; mostrarBarra(); }, { rootMargin: '0px 0px 120px 0px' }).observe(document.querySelector('footer'));

  // Passeio: a etapa no meio da tela troca o arquivo do palco; o palco se endireita ao entrar
  var passos = [].slice.call(document.querySelectorAll('.passo')), telas = [].slice.call(document.querySelectorAll('#tela > *')), tela = $('tela'), atual = 0;
  var vigia = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var n = +e.target.dataset.tela;
      passos.forEach(function (p) {
        p.classList.toggle('ativo', p === e.target);
        var v = p.querySelector('video');
        if (v && v.dataset.poster && Math.abs(+p.dataset.tela - +e.target.dataset.tela) <= 1) { v.poster = v.dataset.poster; delete v.dataset.poster; }
        if (v && v.offsetParent) { if (p === e.target && !reduz) v.play().catch(function () {}); else v.pause(); }
      });
      if (n !== atual) {
        var velha = telas[atual], desce = n > atual;
        velha.classList.remove('ativo'); velha.classList.add(desce ? 'sai' : 'volta');
        setTimeout(function () { velha.classList.remove('sai', 'volta'); }, 700);
        telas[n].classList.toggle('de-cima', !desce); void telas[n].offsetWidth; // aplica o ponto de partida antes de animar
        atual = n;
      }
      telas.forEach(function (t, i) {
        t.classList.toggle('ativo', i === n);
        if (Math.abs(i - n) <= 1) { if (t.loading) t.loading = 'eager'; if (t.dataset.poster) { t.poster = t.dataset.poster; delete t.dataset.poster; } }
        if (t.tagName === 'VIDEO') { if (i === n && !reduz) t.play().catch(function () {}); else t.pause(); }
      });
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  passos.forEach(function (p) { vigia.observe(p); });
  if (!reduz) {
    var secao = $('formatos'), pedido = false;
    var inclinar = function () {
      pedido = false;
      var r = secao.getBoundingClientRect(), p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * 0.9)));
      var e = 1 - Math.pow(1 - p, 3);
      tela.style.setProperty('--inclina', (14 * (1 - e)).toFixed(2) + 'deg');
      tela.style.setProperty('--escala', (0.9 + 0.1 * e).toFixed(3));
    };
    var lista = $('passos');
    var trilho = function () {
      var r2 = lista.getBoundingClientRect();
      lista.style.setProperty('--prog', Math.min(1, Math.max(0, (innerHeight / 2 - r2.top) / r2.height)).toFixed(4));
    };
    addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(function () { inclinar(); trilho(); }); } }, { passive: true });
    inclinar(); trilho();
  }

  // Download do sistema de quem visita
  var BASE = 'https://github.com/pedronvitoriano/folio-releases/releases/latest/download/';
  var MAC = ['Abra o arquivo baixado e arraste o Folio para a pasta <b>Aplicativos</b>.', 'Na primeira vez, clique no Folio com o botão direito e escolha <b>Abrir</b>.', 'Se o Mac ainda bloquear, vá em <b>Ajustes do Sistema</b>, <b>Privacidade e Segurança</b>, e clique em <b>Abrir Mesmo Assim</b>.'];
  var OPCOES = {
    windows: { arq: 'Folio-windows-x64.zip', nome: 'Windows 10 e 11', botao: 'Baixar para Windows', passos: ['Abra o arquivo baixado e clique em <b>Extrair tudo</b>.', 'Na pasta extraída, clique duas vezes em <b>Instalar</b>. Não pede senha de administrador.', 'Se aparecer <b>O Windows protegeu o computador</b>, clique em <b>Mais informações</b> e depois em <b>Executar assim mesmo</b>.'] },
    'mac-arm': { arq: 'Folio-macos-arm64.dmg', nome: 'Mac com chip Apple', botao: 'Baixar para Mac', passos: MAC },
    'mac-intel': { arq: 'Folio-macos-intel.dmg', nome: 'Mac com Intel', botao: 'Baixar para Mac (Intel)', passos: MAC },
    'linux-deb': { arq: 'Folio-linux-amd64.deb', nome: 'Ubuntu, Debian e Mint', botao: 'Baixar o pacote .deb', passos: ['Abra o arquivo baixado: a central de programas do sistema aparece.', 'Clique em <b>Instalar</b> e confirme com a sua senha.', 'Procure <b>Folio</b> no menu de aplicativos.'] },
    linux: { arq: 'Folio-linux-x86_64.AppImage', nome: 'Linux', botao: 'Baixar o AppImage', passos: ['Clique com o botão direito no arquivo baixado e abra <b>Propriedades</b>.', 'Marque <b>Permitir executar como programa</b>.', 'Clique duas vezes no arquivo para abrir o Folio.'] }
  };
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
    document.querySelectorAll('#lista button').forEach(function (b) { if (b.dataset.so === chave) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
  }
  document.querySelectorAll('#lista button').forEach(function (b) { b.addEventListener('click', function () { escolher(b.dataset.so); }); });

  // Depois do clique em baixar: diz que começou e aponta o próximo passo
  function avisarDownload(ondeAviso) {
    var aviso = $(ondeAviso);
    if (ondeAviso === 'aviso-topo') {
      var ir = document.createElement('a'); ir.href = '#baixar'; ir.textContent = 'veja como instalar';
      aviso.replaceChildren('O download começou. Quando terminar, ', ir, '.');
    } else aviso.textContent = 'O download começou. Quando terminar, siga os passos abaixo.';
    $('instalar').classList.add('realce');
    setTimeout(function () { $('instalar').classList.remove('realce'); }, 2400);
  }
  $('principal').addEventListener('click', function () { avisarDownload('aviso-topo'); });
  $('baixar-painel').addEventListener('click', function () { avisarDownload('aviso-painel'); });
  ['fecho-baixar', 'barra-baixar'].forEach(function (id) { $(id).addEventListener('click', function () { avisarDownload('aviso-painel'); }); });

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
      document.body.classList.add('mobile');
      var url = location.href.split('#')[0];
      $('enviar-link').addEventListener('click', async function () {
        try {
          if (navigator.share) { await navigator.share({ title: 'Folio', text: 'Baixar o Folio no computador', url: url }); return; }
          await navigator.clipboard.writeText(url); $('copiado').textContent = 'Link copiado. Cole no e-mail ou na conversa e abra no computador.';
        } catch (e) { if (e && e.name !== 'AbortError') $('copiado').textContent = 'Copie este endereço: ' + url; }
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
      if (r.alternativa) { var todas = document.createElement('a'); todas.href = '#baixar'; todas.textContent = 'Todas as versões'; alt.append(todas, '.'); }
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
      document.querySelectorAll('[data-tam]').forEach(function (s) { var n = cache.tam[s.dataset.tam]; if (n) s.textContent = mb(n); });
      if (cache.versao) {
        var tam = detectado && cache.tam[OPCOES[detectado].arq], b = document.createElement('b');
        b.textContent = cache.versao;
        $('principal-meta').replaceChildren('Versão ', b, (tam ? ', ' + mb(tam) : '') + '. Grátis e sem cadastro.');
        $('versao-nota').textContent = 'Versão ' + cache.versao + ', a mais recente. Os links levam sempre à última versão, e o Folio avisa quando houver uma nova.';
      }
    } catch (e) { /* sem rede: os links continuam apontando para a última versão */ }
  })();
})();
