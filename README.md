# Folio

**Abre, mostra e edita quase todo arquivo — no Windows, no Linux e no macOS.**

Documentos do Word, PDFs, planilhas, apresentações, fotos, vídeos, músicas, Markdown, código, modelos 3D e centenas de
outros formatos (mais de 700 extensões) numa janela só com abas, com editor para os mais usados. Leve, bonito e em português.

**[Baixar a última versão](https://github.com/pedronvitoriano/folio-releases/releases/latest)**

## O que ele faz

- **Ver e editar sem trocar de programa:** Word (.docx) fiel ao original, PDF (editar texto, assinar, juntar e dividir),
  planilhas (xlsx, csv, ods) com fórmulas e gráficos, apresentações (pptx, odp), Markdown, código e notebooks.
- **Clicou, editou:** em texto, Markdown, Word e CSV, clique no ponto que quer mudar e escreva.
- **Fotos, vídeo e música:** recorte e filtros, cortes e legendas no vídeo, gravação de tela e câmera, estúdio de música.
- **Documento do Folio (.fdoc):** texto, vídeo, música, fotos, 3D, planilhas e PDFs lado a lado num arquivo só.
- **Converter:** de um formato para outro pelo próprio app (documentos, imagens, áudio e vídeo).
- **Arquivos:** gerenciador de arquivos dentro do app, olhada rápida, dois arquivos lado a lado, organizar a pasta.
- **Assistente:** converse com a IA sobre o arquivo aberto (com o Claude Code ou o Codex da sua conta).
- **Atualiza sozinho:** avisa quando há versão nova, baixa, confere e reinicia; se algo der errado, volta à anterior.

## Baixar

| Sistema | Arquivo | Como instalar |
|---|---|---|
| **Windows 10/11** (64 bits) | [Folio-windows-x64.zip](https://github.com/pedronvitoriano/folio-releases/releases/latest/download/Folio-windows-x64.zip) | Descompacte e clique duas vezes em `Instalar.cmd` (não precisa de administrador). |
| **Linux** Debian, Ubuntu, Mint | [Folio-linux-amd64.deb](https://github.com/pedronvitoriano/folio-releases/releases/latest/download/Folio-linux-amd64.deb) | `sudo apt install ./Folio-linux-amd64.deb` |
| **Linux** qualquer distro | [Folio-linux-x86_64.AppImage](https://github.com/pedronvitoriano/folio-releases/releases/latest/download/Folio-linux-x86_64.AppImage) · [Folio-linux.tar.gz](https://github.com/pedronvitoriano/folio-releases/releases/latest/download/Folio-linux.tar.gz) | AppImage: torne executável e abra. Tarball: `./install.sh` (instala em `~/.local`, sem sudo). |
| **macOS 11+** Apple Silicon | [Folio-macos-arm64.dmg](https://github.com/pedronvitoriano/folio-releases/releases/latest/download/Folio-macos-arm64.dmg) | Arraste para Aplicativos. Veja a primeira abertura abaixo. |
| **macOS 11+** Intel | [Folio-macos-intel.dmg](https://github.com/pedronvitoriano/folio-releases/releases/latest/download/Folio-macos-intel.dmg) | Idem. |

Todas as versões: [Releases](https://github.com/pedronvitoriano/folio-releases/releases).

### Primeira abertura

Os apps ainda não têm assinatura digital.

- **Windows:** se aparecer "O Windows protegeu o computador", clique em "Mais informações" → "Executar assim mesmo".
- **macOS:** no primeiro clique duplo o sistema bloqueia. Vá em Ajustes do Sistema → Privacidade e Segurança →
  "Abrir Mesmo Assim" (no macOS 14 ou anterior: botão direito no app → Abrir).

### Linux: o que precisa estar instalado

O Folio usa o WebKitGTK da sua distro (as correções de segurança chegam pelas atualizações do sistema). O `.deb` instala
tudo sozinho pelo `apt`; no AppImage e no tarball, instale antes:

| Para | Debian/Ubuntu | Fedora | Arch |
|---|---|---|---|
| abrir o app (obrigatório) | `python3-gi gir1.2-gtk-3.0 gir1.2-webkit2-4.1` | `python3-gobject webkit2gtk4.1` | `python-gobject webkit2gtk-4.1` |
| tocar mp4, mp3, m4a | `gstreamer1.0-plugins-good gstreamer1.0-libav` | `gstreamer1-plugins-good gstreamer1-libav` | `gst-plugins-good gst-libav` |
| converter áudio e vídeo | `ffmpeg` | `ffmpeg-free` | `ffmpeg` |

Depois de instalado, o Folio aparece no menu e em "Abrir com" para os formatos que abre, sem virar o padrão de nenhum
(isso você escolhe dentro do app).

## Atualização dentro do app

O Folio consulta o arquivo [`latest.json`](https://github.com/pedronvitoriano/folio-releases/releases/latest/download/latest.json)
desta página: versão, novidades e, para cada sistema, o endereço, o tamanho e o SHA256 do instalador. Ele só instala o
que bate com o SHA256 publicado. Cada versão também traz o `SHA256SUMS` para conferir à mão:

```bash
sha256sum -c SHA256SUMS --ignore-missing
```

O código-fonte não fica neste repositório; aqui ficam só os instaladores de cada versão.
