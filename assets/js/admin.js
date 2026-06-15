// ==================== VARIÁVEIS GLOBAIS ====================
let subcatAtiva = null;
let estruturaLocal = [];
let contextoAtual = null;

// ==================== INICIALIZAÇÃO ====================
document.addEventListener("DOMContentLoaded", () => {
    carregarEstruturaAdmin();
});

// ==================== UTILITÁRIOS ====================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function fecharModais() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('open'));
}

// ==================== CATEGORIAS ====================
async function carregarEstruturaAdmin() {
    try {
        const res = await fetch('api/api.php?acao=listar_estrutura');
        estruturaLocal = await res.json();
        const menu = document.getElementById("menu-admin");
        if (!menu) return;
        
        const itensAntigos = menu.querySelectorAll('.accordion-item');
        itensAntigos.forEach(item => item.remove());

        estruturaLocal.forEach(cat => {
            const div = document.createElement("div");
            div.className = "accordion-item";
            
            let subsHtml = "";
            if (cat.subcategorias && Array.isArray(cat.subcategorias)) {
                cat.subcategorias.forEach(sub => {
                    subsHtml += `
                        <div class="subcat-container">
                            <button class="subcat-btn" onclick="carregarProdutosAdmin(${sub.id})">${escapeHtml(sub.nome)}</button>
                            <div class="menu-row-actions">
                                <button class="btn-action btn-edit" onclick="abrirModalEditarSubcategoria(${cat.id}, ${sub.id}, '${escapeHtml(sub.nome)}')">✎</button>
                                <button class="btn-action btn-delete" onclick="eliminarSubcategoria(${sub.id})">✕</button>
                            </div>
                        </div>
                    `;
                });
            }

            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <button class="accordion-header" onclick="toggleAccordion(this)">${escapeHtml(cat.nome)}</button>
                    <div class="menu-row-actions">
                        <button class="btn-action btn-edit" onclick="abrirModalEditarCategoria(${cat.id}, '${escapeHtml(cat.nome)}')">✎</button>
                        <button class="btn-action btn-delete" onclick="eliminarCategoria(${cat.id})">✕</button>
                    </div>
                </div>
                <div class="accordion-content" style="display:none; padding-left:0.5rem; margin-top:0.5rem;">
                    ${subsHtml}
                    <button class="btn-dashed" onclick="abrirModalSubcategoria(${cat.id})">+ Subcategoria</button>
                </div>
            `;
            menu.appendChild(div);
        });
    } catch (erro) {
        console.error("Erro ao carregar estrutura:", erro);
    }
}

function toggleAccordion(btn) {
    const content = btn.closest('.accordion-item').querySelector('.accordion-content');
    if (content.style.display === 'none') {
        content.style.display = 'block';
    } else {
        content.style.display = 'none';
    }
}

function abrirModalCategoria() {
    document.getElementById('form-categoria').reset();
    document.getElementById('cat-id').value = '';
    document.getElementById('modal-cat-titulo').innerText = "Nova Categoria";
    document.getElementById('modal-categoria').classList.add('open');
}

function abrirModalEditarCategoria(id, nome) {
    abrirModalCategoria();
    document.getElementById('cat-id').value = id;
    document.getElementById('cat-nome').value = nome;
    document.getElementById('modal-cat-titulo').innerText = "Editar Categoria";
}

async function guardarCategoria(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('id', document.getElementById('cat-id').value);
    fd.append('nome', document.getElementById('cat-nome').value);
    await fetch('api/api.php?acao=guardar_categoria', { method: 'POST', body: fd });
    fecharModais();
    carregarEstruturaAdmin();
}

async function eliminarCategoria(id) {
    if(confirm("Eliminar esta categoria?")) {
        const fd = new FormData();
        fd.append('id', id);
        await fetch('api/api.php?acao=eliminar_categoria', { method: 'POST', body: fd });
        carregarEstruturaAdmin();
        const grid = document.getElementById("grid-produtos-admin");
        if (grid) grid.innerHTML = "<p class='mensagem-inicial'>Selecione uma subcategoria.</p>";
    }
}

// ==================== SUBCATEGORIAS ====================
function abrirModalSubcategoria(catId) {
    document.getElementById('form-subcategoria').reset();
    document.getElementById('subcat-id').value = '';
    document.getElementById('subcat-cat-id').value = catId;
    document.getElementById('modal-subcat-titulo').innerText = "Nova Subcategoria";
    document.getElementById('modal-subcategoria').classList.add('open');
}

function abrirModalEditarSubcategoria(catId, subcatId, nome) {
    abrirModalSubcategoria(catId);
    document.getElementById('subcat-id').value = subcatId;
    document.getElementById('subcat-nome').value = nome;
    document.getElementById('modal-subcat-titulo').innerText = "Editar Subcategoria";
}

async function guardarSubcategoria(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('id', document.getElementById('subcat-id').value);
    fd.append('categoria_id', document.getElementById('subcat-cat-id').value);
    fd.append('nome', document.getElementById('subcat-nome').value);
    await fetch('api/api.php?acao=guardar_subcategoria', { method: 'POST', body: fd });
    fecharModais();
    carregarEstruturaAdmin();
}

async function eliminarSubcategoria(id) {
    if(confirm("Eliminar esta subcategoria?")) {
        const fd = new FormData();
        fd.append('id', id);
        await fetch('api/api.php?acao=eliminar_subcategoria', { method: 'POST', body: fd });
        carregarEstruturaAdmin();
        const grid = document.getElementById("grid-produtos-admin");
        if (grid) grid.innerHTML = "<p class='mensagem-inicial'>Selecione uma subcategoria.</p>";
    }
}

// ==================== PRODUTOS ====================
async function carregarProdutosAdmin(subcatId) {
    try {
        subcatAtiva = subcatId;
        const res = await fetch(`api/api.php?acao=produtos&subcategoria_id=${subcatId}`);
        const produtos = await res.json();
        
        const grid = document.getElementById("grid-produtos-admin");
        if (!grid) return;
        grid.innerHTML = "";

        if (Array.isArray(produtos) && produtos.length > 0) {
            produtos.forEach(prod => {
                const card = document.createElement("div");
                card.className = "card-produto";
                let img = prod.imagem_url ? `<img src="${prod.imagem_url}">` : `<img src="https://via.placeholder.com/260x180?text=Sem+Imagem">`;
                
                const prodData = encodeURIComponent(JSON.stringify(prod));
                card.innerHTML = `
                    <div class="quick-actions">
                        <button class="btn-action btn-edit" onclick="abrirModalEditarProduto('${prodData}')">✎</button>
                        <button class="btn-action btn-delete" onclick="eliminarProduto(${prod.id})">✕</button>
                    </div>
                    ${img}
                    <h3>${escapeHtml(prod.nome)}</h3>
                    <div class="preco-tag">${prod.tipo_preco === 'fixo' ? prod.preco_fixo + ' €' : 'Preco Dinamico'}</div>
                `;
                grid.appendChild(card);
            });
        }

        const addCard = document.createElement("div");
        addCard.className = "card-produto dashed-card";
        addCard.innerHTML = `<div>+ Adicionar Produto</div>`;
        addCard.onclick = () => abrirModalProduto(subcatId, null);
        grid.appendChild(addCard);
    } catch (e) {
        console.error("Erro ao carregar produtos:", e);
    }
}

function abrirModalProduto(subcatId, produtoId = null) {
    document.getElementById('form-produto').reset();
    document.getElementById('prod-id').value = produtoId || '';
    document.getElementById('prod-subcat-id').value = subcatId;
    document.getElementById('prod-img-atual').value = '';
    document.getElementById('container-tabela-matriz').innerHTML = '';
    document.getElementById('inputs-valores-fatores').innerHTML = '';
    document.getElementById('seccao-tabela-matriz').style.display = 'none';
    document.getElementById('modal-prod-titulo').innerText = produtoId ? "Editar Produto" : "Novo Produto";
    toggleTipoPreco();
    
    carregarFatoresDisponiveis(subcatId, produtoId);
    
    document.getElementById('modal-produto').classList.add('open');
}

function toggleTipoPreco() {
    const isVariavel = document.getElementById('prod-tipo-preco').checked;
    const blocoFixo = document.getElementById('bloco-preco-fixo');
    const blocoVariavel = document.getElementById('bloco-preco-variavel');
    
    if (blocoFixo) blocoFixo.style.display = isVariavel ? 'none' : 'block';
    if (blocoVariavel) blocoVariavel.style.display = isVariavel ? 'block' : 'none';
    
    if (!isVariavel) {
        document.getElementById('seccao-tabela-matriz').style.display = 'none';
    }
}

function gerarMatriz() {
    const chks = document.querySelectorAll('.chk-fator:checked');
    const containerInputs = document.getElementById('inputs-valores-fatores');
    
    if (containerInputs) containerInputs.innerHTML = "";
    
    if (chks.length === 0) {
        document.getElementById('seccao-tabela-matriz').style.display = 'none';
        return;
    }
    
    chks.forEach(chk => {
        const fatorNome = chk.dataset.nome;
        const opcoes = JSON.parse(chk.dataset.opcoes);
        
        const div = document.createElement('div');
        div.className = "fator-input-box";
        div.innerHTML = `
            <label style="display:block; margin-bottom:0.4rem;">${fatorNome}:</label>
            <select class="input-valores-fator" data-fator-nome="${fatorNome}" onchange="renderizarTabelaCombinatoria()">
                ${opcoes.map(op => `<option value="${op}">${op}</option>`).join('')}
            </select>
            <button type="button" class="btn-dashed" style="margin-top:5px;" onclick="adicionarOpcao(this)">+ Adicionar opcao</button>
        `;
        containerInputs.appendChild(div);
    });
    
    renderizarTabelaCombinatoria();
}

function adicionarOpcao(btn) {
    const select = btn.previousElementSibling;
    const novaOpcao = prompt("Nova opcao:");
    if (novaOpcao) {
        const option = document.createElement('option');
        option.value = novaOpcao;
        option.text = novaOpcao;
        select.appendChild(option);
        renderizarTabelaCombinatoria();
    }
}

function renderizarTabelaCombinatoria() {
    const inputs = document.querySelectorAll('.input-valores-fator');
    const seccaoTabela = document.getElementById('seccao-tabela-matriz');
    let listas = [];
    let nomesFatores = [];

    inputs.forEach(inp => {
        const valores = Array.from(inp.options).map(opt => opt.value);
        if (valores.length > 0) {
            listas.push(valores);
            nomesFatores.push(inp.dataset.fatorNome);
        }
    });

    if (listas.length === 0) {
        if (seccaoTabela) seccaoTabela.style.display = 'none';
        return;
    }

    if (seccaoTabela) seccaoTabela.style.display = 'block';

    const cartesiano = (a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));
    let combinacoes = listas.length > 1 ? cartesiano(listas) : listas[0].map(x => [x]);

    let tableHtml = `<table style="width:100%; border-collapse:collapse;"><thead><tr>`;
    nomesFatores.forEach(n => tableHtml += `<th style="padding:8px;">${n}</th>`);
    tableHtml += `<th style="padding:8px;">Preco (€)</th></tr></thead><tbody>`;

    combinacoes.forEach((combo) => {
        let arrCombo = Array.isArray(combo) ? combo : [combo];
        tableHtml += `<tr class="linha-matriz" data-combo='${JSON.stringify(arrCombo)}'>`;
        arrCombo.forEach(v => tableHtml += `<td style="padding:8px;">${escapeHtml(v)}</td>`);
        tableHtml += `<td style="padding:8px;"><input type="number" step="0.01" class="preco-variante-input" placeholder="0.00" style="width:100px;"></td>`;
    });

    tableHtml += `</tbody></table>`;
    document.getElementById('container-tabela-matriz').innerHTML = tableHtml;
}

async function guardarProduto(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('id', document.getElementById('prod-id').value);
    fd.append('subcategoria_id', document.getElementById('prod-subcat-id').value);
    fd.append('nome', document.getElementById('prod-nome').value);
    fd.append('imagem_url_atual', document.getElementById('prod-img-atual').value);
    
    const isVariavel = document.getElementById('prod-tipo-preco').checked;
    fd.append('tipo_preco', isVariavel ? 'variavel' : 'fixo');
    fd.append('preco_fixo', document.getElementById('prod-preco-fixo').value || '0');
    
    const imgFile = document.getElementById('prod-imagem').files[0];
    if (imgFile) fd.append('imagem', imgFile);

    if (isVariavel) {
        let variantes = [];
        const inputsFatores = document.querySelectorAll('.input-valores-fator');
        let nomesFatores = Array.from(inputsFatores).map(i => i.dataset.fatorNome);
        
        const linhas = document.querySelectorAll('.linha-matriz');
        if (linhas.length === 0) {
            alert('Selecione fatores e preencha os valores antes de salvar.');
            return;
        }
        
        linhas.forEach(tr => {
            let valoresCombo = JSON.parse(tr.dataset.combo);
            let precoInput = tr.querySelector('.preco-variante-input');
            let precoVal = precoInput ? precoInput.value : '';
            
            if (precoVal && precoVal !== '') {
                let atributos = {};
                nomesFatores.forEach((nome, i) => {
                    atributos[nome] = valoresCombo[i];
                });
                variantes.push({
                    preco: parseFloat(precoVal),
                    atributos: atributos
                });
            }
        });
        
        if (variantes.length === 0) {
            alert('Preencha pelo menos um preco na matriz!');
            return;
        }
        fd.append('variantes', JSON.stringify(variantes));
    }

    const res = await fetch('api/api.php?acao=guardar_produto', { method: 'POST', body: fd });
    const result = await res.json();
    
    if (result.sucesso) {
        const produtoId = result.produto_id;
        const produtoNome = document.getElementById('prod-nome').value;
        
        await fetch('api/api.php?acao=converter_fatores_pendentes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                produto_id: produtoId, 
                produto_nome: produtoNome 
            })
        });
        
        fecharModais();
        if (subcatAtiva) carregarProdutosAdmin(subcatAtiva);
    } else {
        alert('Erro: ' + (result.erro || 'Tente novamente'));
    }
}

async function eliminarProduto(id) {
    if(confirm("Eliminar este produto?")) {
        const fd = new FormData();
        fd.append('id', id);
        await fetch('api/api.php?acao=eliminar_produto', { method: 'POST', body: fd });
        if (subcatAtiva) carregarProdutosAdmin(subcatAtiva);
    }
}

function abrirModalEditarProduto(prodStringEncoded) {
    try {
        const prod = JSON.parse(decodeURIComponent(prodStringEncoded));
        abrirModalProduto(prod.subcategoria_id, prod.id);
        document.getElementById('prod-id').value = prod.id;
        document.getElementById('prod-nome').value = prod.nome;
        document.getElementById('prod-img-atual').value = prod.imagem_url || '';
        document.getElementById('modal-prod-titulo').innerText = "Editar Produto";

        if (prod.tipo_preco === 'fixo') {
            document.getElementById('prod-tipo-preco').checked = false;
            document.getElementById('prod-preco-fixo').value = prod.preco_fixo;
            toggleTipoPreco();
        } else {
            document.getElementById('prod-tipo-preco').checked = true;
            toggleTipoPreco();
            
            setTimeout(async () => {
                if (prod.variantes && prod.variantes.length > 0) {
                    let fatoresUsados = new Set();
                    prod.variantes.forEach(v => {
                        let atributos = v.atributos_json ? JSON.parse(v.atributos_json) : v;
                        Object.keys(atributos).forEach(key => {
                            if (key !== 'preco' && key !== 'id' && key !== 'produto_id') {
                                fatoresUsados.add(key);
                            }
                        });
                    });
                    
                    await new Promise(r => setTimeout(r, 500));
                    
                    document.querySelectorAll('.chk-fator').forEach(chk => {
                        const nome = chk.dataset.nome;
                        if (fatoresUsados.has(nome)) {
                            chk.checked = true;
                        }
                    });
                    
                    gerarMatriz();
                    
                    setTimeout(() => {
                        const inputs = document.querySelectorAll('.input-valores-fator');
                        inputs.forEach(input => {
                            const nome = input.dataset.fatorNome;
                            const valoresUnicos = [...new Set(prod.variantes.map(v => {
                                let atributos = v.atributos_json ? JSON.parse(v.atributos_json) : v;
                                return atributos[nome];
                            }))];
                            if (valoresUnicos.length > 0 && valoresUnicos[0]) {
                                valoresUnicos.forEach(val => {
                                    if (!Array.from(input.options).some(opt => opt.value === val)) {
                                        const opt = document.createElement('option');
                                        opt.value = val;
                                        opt.text = val;
                                        input.appendChild(opt);
                                    }
                                });
                            }
                        });
                        renderizarTabelaCombinatoria();
                        
                        setTimeout(() => {
                            document.querySelectorAll('.linha-matriz').forEach(tr => {
                                let comboValores = JSON.parse(tr.dataset.combo);
                                let varianteMatch = prod.variantes.find(v => {
                                    let atributos = v.atributos_json ? JSON.parse(v.atributos_json) : v;
                                    let match = true;
                                    comboValores.forEach((valor, idx) => {
                                        const nomeFator = document.querySelectorAll('.input-valores-fator')[idx]?.dataset.fatorNome;
                                        if (atributos[nomeFator] !== valor) match = false;
                                    });
                                    return match;
                                });
                                if (varianteMatch) {
                                    const precoInput = tr.querySelector('.preco-variante-input');
                                    if (precoInput) precoInput.value = varianteMatch.preco;
                                }
                            });
                        }, 100);
                    }, 100);
                }
            }, 500);
        }
    } catch(e) {
        console.error("Erro ao editar produto:", e);
    }
}

// ==================== FATORES ====================

function abrirModalFatorFromProduto() {
    const subcatId = document.getElementById('prod-subcat-id').value;
    if (!subcatId) {
        alert('Selecione uma subcategoria primeiro.');
        return;
    }
    
    const produtoId = document.getElementById('prod-id').value;
    const produtoNome = document.getElementById('prod-nome').value || 'Novo Produto (ainda não guardado)';
    
    fetch(`api/api.php?acao=listar_estrutura`)
        .then(res => res.json())
        .then(categorias => {
            let subcatNome = '';
            let catId = null;
            let catNome = '';
            
            for (let cat of categorias) {
                for (let sub of cat.subcategorias) {
                    if (sub.id == subcatId) {
                        subcatNome = sub.nome;
                        catId = cat.id;
                        catNome = cat.nome;
                        break;
                    }
                }
            }
            
            contextoAtual = {
                subcategoria_id: subcatId,
                subcategoria_nome: subcatNome,
                categoria_id: catId,
                categoria_nome: catNome,
                produto_id: produtoId || 'novo',
                produto_nome: produtoNome
            };
            
            const infoDiv = document.getElementById('fator-info');
            infoDiv.innerHTML = `
                <strong>Contexto atual:</strong><br>
                📁 Categoria: ${catNome}<br>
                📂 Subcategoria: ${subcatNome}
                ${produtoId ? `<br>📄 Produto: ${produtoNome}` : '<br>📄 Produto: (será criado depois)'}
            `;
            
            document.getElementById('form-fator').reset();
            document.getElementById('fator-id').value = '';
            document.getElementById('fator-escopo').value = 'subcategoria';
            document.getElementById('modal-fator-titulo').innerText = 'Novo Fator';
            document.getElementById('modal-fator').classList.add('open');
        });
}

async function guardarFator(e) {
    e.preventDefault();
    
    const opcoesStr = document.getElementById('fator-opcoes').value;
    const opcoes = opcoesStr.split(',').map(s => s.trim()).filter(s => s !== '');
    
    if (opcoes.length === 0) {
        alert('Por favor, insira pelo menos uma opcao.');
        return;
    }
    
    const nome = document.getElementById('fator-nome').value;
    if (!nome) {
        alert('Por favor, insira o nome do fator.');
        return;
    }
    
    let escopo = document.getElementById('fator-escopo').value;
    let entidade_id = null;
    let entidade_nome = '';
    
    if (!contextoAtual) {
        alert('Erro: contexto não definido.');
        return;
    }
    
    switch (escopo) {
        case 'categoria':
            entidade_id = contextoAtual.categoria_id;
            entidade_nome = contextoAtual.categoria_nome;
            break;
        case 'subcategoria':
            entidade_id = contextoAtual.subcategoria_id;
            entidade_nome = contextoAtual.subcategoria_nome;
            break;
        case 'produto':
            if (!contextoAtual.produto_id || contextoAtual.produto_id === 'novo') {
                escopo = 'produto_pendente';
                entidade_id = null;
                entidade_nome = contextoAtual.produto_nome || 'Produto (será associado)';
            } else {
                entidade_id = contextoAtual.produto_id;
                entidade_nome = contextoAtual.produto_nome;
            }
            break;
    }
    
    const fator = {
        id: document.getElementById('fator-id').value || null,
        nome: nome,
        tipo: 'select',
        escopo: escopo,
        entidade_id: entidade_id,
        opcoes: opcoes,
        obrigatorio: false,
        ordem: 0
    };
    
    const res = await fetch('api/api.php?acao=guardar_fator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fator)
    });
    
    const result = await res.json();
    if (result.sucesso) {
        fecharModais();
        
        let mensagem = `Fator "${nome}" guardado com sucesso!`;
        if (escopo === 'produto_pendente') {
            mensagem += `\n\n⚠️ Este fator será associado ao produto quando for guardado.`;
        }
        alert(mensagem);
        
        const subcatId = document.getElementById('prod-subcat-id').value;
        const produtoId = document.getElementById('prod-id').value;
        if (subcatId) {
            await carregarFatoresDisponiveis(subcatId, produtoId || null);
        }
    } else {
        alert('Erro ao guardar fator: ' + (result.erro || 'Tente novamente'));
    }
}

async function carregarFatoresDisponiveis(subcategoriaId, produtoId = null) {
    let url = `api/api.php?acao=listar_fatores&subcategoria_id=${subcategoriaId}`;
    if (produtoId && produtoId !== '') {
        url += `&produto_id=${produtoId}`;
    }
    
    const res = await fetch(url);
    const fatores = await res.json();
    
    const container = document.getElementById('fatores-checkboxes');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (fatores.length === 0) {
        container.innerHTML = '<div class="info-box">Nenhum fator disponivel. Clique em "+ Criar Fator" para adicionar.</div>';
        return;
    }
    
    fatores.forEach(fator => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        
        let escopoTexto = '';
        let estiloExtra = '';
        
        if (fator.escopo === 'categoria') {
            escopoTexto = ' (categoria)';
        } else if (fator.escopo === 'subcategoria') {
            escopoTexto = ' (subcategoria)';
        } else if (fator.escopo === 'produto') {
            escopoTexto = ' (produto)';
        } else if (fator.escopo === 'produto_pendente') {
            escopoTexto = ' (pendente - será associado ao guardar)';
            estiloExtra = ' style="color:#eab308;"';
        }
        
        div.innerHTML = `
            <input type="checkbox" class="chk-fator" value="${fator.id}" 
                   data-nome="${fator.nome}" 
                   data-opcoes='${JSON.stringify(fator.opcoes)}'
                   onchange="gerarMatriz()">
            <label${estiloExtra}>${escapeHtml(fator.nome)}<span style="color:#64748b; font-size:0.7rem;">${escopoTexto}</span></label>
        `;
        container.appendChild(div);
    });
}