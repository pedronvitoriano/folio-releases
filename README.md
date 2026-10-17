# Folio — versões

Instaladores do **Folio** e o manifesto de atualização (`latest.json`) que o app instalado lê para se atualizar sozinho.
O código-fonte não fica aqui; este repositório só recebe os arquivos de cada versão.

**Baixar a última versão:** [Releases → Latest](https://github.com/pedronvitoriano/folio-releases/releases/latest)

| Sistema | Arquivo |
|---|---|
| Windows 10/11 | `Folio-windows-x64.zip` → descompacte e abra `Instalar.cmd` |
| Linux (Debian, Ubuntu, Mint) | `Folio-linux-amd64.deb` → `sudo apt install ./Folio-linux-amd64.deb` |
| Linux (qualquer distro) | `Folio-linux-x86_64.AppImage` ou `Folio-linux.tar.gz` (`./install.sh`, sem sudo) |
| macOS 11+ | `Folio-macos-arm64.dmg` (Apple Silicon) ou `Folio-macos-intel.dmg` (Intel) |

Cada versão traz `SHA256SUMS` e `latest.json` (versão, notas e, por sistema, endereço, tamanho e SHA256 do instalador).
O app só instala o que bate com o SHA256 do manifesto.
