// Escolhe o pacote do Folio para quem visita. Funções puras: o navegador passa o que sabe e recebe a decisão,
// e test/site.test.js confere cada caso sem navegador.
(function (raiz) {
  // info: { ua, platform, mobile, maxTouchPoints, architecture, platformVersion, gpuApple }
  function escolher(info) {
    var ua = info.ua || '';
    if (/Android|iPhone|iPad|iPod/.test(ua) || info.mobile || (/Macintosh/.test(ua) && info.maxTouchPoints > 1)) return { celular: true };
    var so = { Windows: 'windows', macOS: 'mac', Linux: 'linux', 'Chrome OS': 'chromeos' }[info.platform] || null;
    if (!so) so = /Windows/.test(ua) ? 'windows' : /Mac OS X|Macintosh/.test(ua) ? 'mac' : /CrOS/.test(ua) ? 'chromeos' : /Linux|X11/.test(ua) ? 'linux' : null;
    if (!so) return { chave: null };
    if (so === 'windows') {
      // Windows 11 informa platformVersion 13 ou mais (Client Hints); o mesmo pacote serve aos dois
      var onze = info.platformVersion && parseInt(info.platformVersion, 10) >= 13;
      return { chave: 'windows', rotulo: onze ? 'Windows 11' : 'Windows', nome: onze ? 'Windows 11' : null, alternativa: null };
    }
    if (so === 'mac') {
      // Safari não diz a arquitetura: placa de vídeo da Apple indica chip Apple; na dúvida, chip Apple e o Intel ao lado
      var arq = info.architecture || (info.gpuApple ? 'arm' : null);
      var intel = arq === 'x86';
      return { chave: intel ? 'mac-intel' : 'mac-arm', rotulo: intel ? 'Mac (Intel)' : 'Mac', nome: null, alternativa: intel ? 'mac-arm' : 'mac-intel' };
    }
    if (so === 'chromeos') return { chave: 'linux', rotulo: 'Linux', nome: null, alternativa: 'chromeos' };
    var debian = /Ubuntu|Debian|Mint/i.test(ua);
    return { chave: debian ? 'linux-deb' : 'linux', rotulo: debian ? 'Ubuntu e Debian' : 'Linux', nome: null, alternativa: debian ? 'linux' : 'linux-deb' };
  }

  // resposta de /releases/latest do GitHub → { versao, tam: { arquivo: bytes } }; ignora o que não for texto ou número
  function lerVersao(rel) {
    var tam = {};
    (rel && Array.isArray(rel.assets) ? rel.assets : []).forEach(function (a) { if (a && typeof a.name === 'string' && typeof a.size === 'number') tam[a.name] = a.size; });
    var versao = rel && typeof rel.tag_name === 'string' ? rel.tag_name.replace(/^v/, '') : '';
    return { versao: /^[0-9][0-9A-Za-z.\-]{0,30}$/.test(versao) ? versao : '', tam: tam };
  }

  var api = { escolher: escolher, lerVersao: lerVersao };
  if (typeof module === 'object' && module.exports) module.exports = api; else raiz.FolioDetectar = api;
})(this);
