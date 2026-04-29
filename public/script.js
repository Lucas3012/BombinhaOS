const API_BASE_URL = "https://certified-navy-civilian-pockets.trycloudflare.com";

// Função que abre o formulário usando SweetAlert2
async function abrirFormulario() {
    const { value: formValues } = await Swal.fire({
        title: 'Nova Ordem de Serviço',
        html:
            '<input id="swal-input1" class="swal2-input" placeholder="Endereço">' +
            '<input id="swal-input2" class="swal2-input" placeholder="Tipo de Serviço">' +
            '<input id="swal-input3" class="swal2-input" placeholder="WhatsApp (ex: 739...)">',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Salvar OS',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            return {
                endereco: document.getElementById('swal-input1').value,
                tipoServico: document.getElementById('swal-input2').value,
                whatsapp: document.getElementById('swal-input3').value
            }
        }
    });

    if (formValues) {
        if (!formValues.endereco || !formValues.whatsapp) {
            Swal.fire('Erro', 'Preencha os campos obrigatórios!', 'error');
            return;
        }
        enviarOS(formValues);
    }
}

// Envia os dados para o servidor no Termux
async function enviarOS(dados) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/notas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (res.ok) {
            Swal.fire('Sucesso!', 'Ordem de Serviço registrada.', 'success');
            carregarOS(); // Atualiza a lista
        }
    } catch (e) {
        Swal.fire('Erro', 'Não foi possível conectar ao servidor.', 'error');
    }
}

// Carrega as OS do servidor
async function carregarOS() {
    if(API_BASE_URL === "AGUARDANDO_LINK") return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/notas`);
        const notas = await res.json();
        const container = document.getElementById('lista-os');
        
        container.innerHTML = notas.slice().reverse().map(os => `
            <div class="card">
                <div style="display:flex; justify-content:space-between;">
                    <h3>${os.tipoServico || 'Serviço'}</h3>
                    <span style="font-size:10px; color:#999;">#${os.id.toString().slice(-4)}</span>
                </div>
                <p>📍 ${os.endereco}</p>
                <div class="actions">
                    <a href="https://wa.me/${os.whatsapp}" class="btn-zap">
                        <i class="fab fa-whatsapp"></i> ZAP
                    </a>
                    ${os.status === 'Concluído' ? 
                        '<span class="status-ok">✓ FINALIZADA</span>' : 
                        `<button class="btn-fin" onclick="finalizar(${os.id})">FINALIZAR</button>`}
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.log("Servidor Offline");
    }
}

// Finaliza uma OS
async function finalizar(id) {
    const confirm = await Swal.fire({
        title: 'Finalizar?',
        text: "Deseja concluir este serviço?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não'
    });

    if (confirm.isConfirmed) {
        await fetch(`${API_BASE_URL}/api/notas/${id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ status: 'Concluído' })
        });
        carregarOS();
    }
}

document.addEventListener('DOMContentLoaded', carregarOS);
