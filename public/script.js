const API_BASE_URL = "https://matched-correlation-knitting-tale.trycloudflare.com";

async function carregarOS() {
    if(API_BASE_URL === "AGUARDANDO_LINK") return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/notas`);
        const notas = await res.json();
        const container = document.getElementById('lista-os');
        
        container.innerHTML = notas.slice().reverse().map(os => `
            <div class="card">
                <h3>${os.tipoServico || 'Serviço'}</h3>
                <p>📍 ${os.endereco}</p>
                <div class="actions">
                    <a href="https://wa.me/${os.whatsapp}" class="btn-zap">WHATSAPP</a>
                    ${os.status === 'Concluído' ? 
                        '<span class="status-ok">✓ FINALIZADA</span>' : 
                        `<button class="btn-fin" onclick="finalizar(${os.id})">FINALIZAR</button>`}
                </div>
            </div>
        `).join('');
    } catch (e) { console.log("Erro ao buscar dados"); }
}

async function finalizar(id) {
    await fetch(`${API_BASE_URL}/api/notas/${id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ status: 'Concluído' })
    });
    carregarOS();
}

document.addEventListener('DOMContentLoaded', carregarOS);
