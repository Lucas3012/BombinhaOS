#!/bin/bash

# 1. Manter o Termux ativo em segundo plano
termux-wake-lock

echo "------------------------------------------"
echo "🧹 LIMPANDO PROCESSOS E LOGS..."
echo "------------------------------------------"
fuser -k 3000/tcp > /dev/null 2>&1
pkill -f cloudflared
pkill -f node
rm -f cloudflare.log
sleep 2

# 2. Garantir que os arquivos de banco de dados existam
[ ! -f "notas.json" ] && echo "[]" > notas.json
[ ! -f "tecnicos.json" ] && echo "[]" > tecnicos.json
[ ! -f "login.json" ] && echo "[]" > login.json

echo "🚀 INICIANDO SERVIDOR NODE.JS..."
node server.js > server.log 2>&1 &
sleep 5

echo "☁️ GERANDO LINK CLOUDFLARE..."
cloudflared tunnel --url http://localhost:3000 > cloudflare.log 2>&1 &

echo "⏳ Aguardando link estabilizar (20 segundos)..."
sleep 20

# Extrair o link limpo do log
LINK=$(grep -o 'https://[-a-z0-9.]*\.trycloudflare\.com' cloudflare.log | head -n 1 | tr -d '\r\n ')

if [ -z "$LINK" ]; then
    echo "❌ ERRO: Não foi possível capturar o link do Cloudflare."
    exit 1
fi

echo "✅ LINK GERADO: $LINK"

echo "📝 ATUALIZANDO ARQUIVOS DA PASTA PUBLIC..."
# Atualiza o link na API_BASE_URL do script principal
sed -i "s|const API_BASE_URL = .*|const API_BASE_URL = \"$LINK\";|" public/script.js

# Atualiza o link na API_URL da aba administrativa (Logins)
sed -i "s|const API_URL = .*|const API_URL = \"$LINK\";|" public/admin.html

echo "📤 SINCRONIZANDO COM GITHUB..."
# Adiciona as alterações
git add .

# Faz o commit (se não houver mudanças, o '|| true' evita que o script pare)
git commit -m "Deploy automático: $(date +'%d/%m/%Y %H:%M:%S') - Link: $LINK" || true

# Empurra para o GitHub forçando a atualização do site
# Certifique-se de ter configurado: git config --global credential.helper store
git push origin main --force

echo "------------------------------------------"
echo "✨ SISTEMA REINICIADO COM SUCESSO!"
echo "🔗 SERVIDOR (API): $LINK"
echo "🌐 ACESSE O SISTEMA NO GITHUB PAGES"
echo "------------------------------------------"
