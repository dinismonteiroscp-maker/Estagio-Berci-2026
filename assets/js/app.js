// ==================== BERCI - APP.JS (LOJA PÚBLICA) ====================
// Design Premium - Versão Clara e Elegante

window.todasAsVariantes = {};

// ===== PRELOADER =====
document.addEventListener('DOMContentLoaded', function() {
    // Criar e adicionar o preloader premium
    const preloader = document.createElement('div');
    preloader.className = 'preloader';
    preloader.innerHTML = `
        <div class="preloader-container">
            <div class="preloader-logo">
                <img src="image/Logo.png" alt="Berci Gráfica">
            </div>
            <div class="preloader-brand">Berci</div>
            <div class="preloader-track">
                <div class="preloader-track-inner"></div>
            </div>
            <div class="preloader-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    document.body.prepend(preloader);

    // Remover preloader após carregamento
    window.addEventListener('load', function() {
        setTimeout(function() {
            preloader.classList.add('hidden');
            setTimeout(function() {
                preloader.remove();
            }, 800);
        }, 1000);
    });

    // Inicializar
    carregarEstruturaCliente();

    // Header scroll effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});

// ===== UTILITARIOS =====
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getPlaceholderSVG() {
    return 'data:image/svg+xml,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="280" height="200" viewBox="0 0 280 200">
            <rect width="280" height="200" fill="#f7f2ec"/>
            <rect x="85" y="55" width="110" height="90" rx="4" fill="#ede6de" stroke="#d9d0c8" stroke-width="1.5"/>
            <text x="140" y="110" font-family="Inter, sans-serif" font-size="13" fill="#b5aaa0" text-anchor="middle" dominant-baseline="middle">Sem Imagem</text>
            <text x="140" y="128" font-family="Inter, sans-serif" font-size="10" fill="#c9a87c" text-anchor="middle" dominant-baseline="middle">Berci</text>
        </svg>
    `);
}

// ===== CARREGAR ESTRUTURA =====
async function carregarEstruturaCliente() {
    try {
        const res = await fetch('api/api.php?acao=listar_estrutura');
        const estrutura = await res.json();
        const menu = document.getElementById("menu-categorias");
        if (!menu) return;

        menu.innerHTML = "";

        estrutura.forEach(cat => {
            const divItem = document.createElement("div");
            divItem.className = "accordion-item";
            
            let subsHtml = "";
            if (cat.subcategorias && Array.isArray(cat.subcategorias)) {
                cat.subcategorias.forEach(sub => {
                    subsHtml += `
                        <div class="subcat-container">
                            <button class="subcat-btn" data-subcat-id="${sub.id}">${escapeHtml(sub.nome)}</button>
                        </div>
                    `;
                });
            }

            divItem.innerHTML = `
                <button class="accordion-header" data-cat-id="${cat.id}" data-cat-nome="${escapeHtml(cat.nome)}">${escapeHtml(cat.nome)}</button>
                <div class="accordion-content">
                    ${subsHtml}
                </div>
            `;

            menu.appendChild(divItem);
        });

        // Event listeners
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', function(e) {
                const content = this.nextElementSibling;
                const categoriaId = parseInt(this.dataset.catId);
                const categoriaNome = this.dataset.catNome;
                
                if (content.classList.contains('closed')) {
                    content.classList.remove('closed');
                    this.classList.add('open');
                    carregarProdutosCategoria(categoriaId, categoriaNome);
                } else {
                    content.classList.add('closed');
                    this.classList.remove('open');
                    const grid = document.getElementById("grelha-produtos");
                    if (grid) {
                        grid.innerHTML = "<p class='mensagem-inicial'>Selecione uma categoria ou subcategoria para visualizar os produtos.</p>";
                    }
                }
            });
        });

        document.querySelectorAll('.subcat-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const subcatId = parseInt(this.dataset.subcatId);
                carregarProdutosCliente(subcatId);
            });
        });

        // Abrir primeira categoria por padrão
        const primeiroHeader = document.querySelector('.accordion-header');
        if (primeiroHeader) {
            const content = primeiroHeader.nextElementSibling;
            content.classList.remove('closed');
            primeiroHeader.classList.add('open');
            const categoriaId = parseInt(primeiroHeader.dataset.catId);
            const categoriaNome = primeiroHeader.dataset.catNome;
            carregarProdutosCategoria(categoriaId, categoriaNome);
        }

    } catch (error) {
        console.error("Erro ao carregar menu:", error);
    }
}

// ===== CARREGAR PRODUTOS =====
async function carregarProdutosCategoria(categoriaId, categoriaNome) {
    const grid = document.getElementById("grelha-produtos");
    if (!grid) return;
    
    grid.innerHTML = `
        <div class="loading-produtos">
            <div class="spinner"></div>
            <p>A carregar produtos da categoria "${escapeHtml(categoriaNome)}"...</p>
        </div>
    `;
    
    try {
        const res = await fetch('api/api.php?acao=listar_estrutura');
        const estrutura = await res.json();
        
        const categoria = estrutura.find(c => c.id == categoriaId);
        if (!categoria) {
            grid.innerHTML = "<p class='mensagem-inicial'>Categoria não encontrada.</p>";
            return;
        }
        
        if (!categoria.subcategorias || categoria.subcategorias.length === 0) {
            grid.innerHTML = "<p class='mensagem-inicial'>Esta categoria não tem subcategorias.</p>";
            return;
        }
        
        const promessas = categoria.subcategorias.map(sub => 
            fetch(`api/api.php?acao=produtos&subcategoria_id=${sub.id}`)
                .then(res => res.ok ? res.json() : [])
                .catch(() => [])
        );
        
        const resultados = await Promise.all(promessas);
        const todosProdutos = resultados.flat();
        
        if (todosProdutos.length === 0) {
            grid.innerHTML = "<p class='mensagem-inicial'>Esta categoria não tem produtos disponíveis.</p>";
            return;
        }
        
        renderizarProdutosNaGrelha(todosProdutos);
        
    } catch (error) {
        console.error("Erro ao carregar produtos da categoria:", error);
        grid.innerHTML = "<p class='mensagem-inicial'>Erro ao carregar produtos. Tente novamente.</p>";
    }
}

async function carregarProdutosCliente(subcatId) {
    try {
        const grid = document.getElementById("grelha-produtos");
        if (grid) {
            grid.innerHTML = `
                <div class="loading-produtos">
                    <div class="spinner"></div>
                    <p>A carregar produtos...</p>
                </div>
            `;
        }
        
        const res = await fetch(`api/api.php?acao=produtos&subcategoria_id=${subcatId}`);
        const produtos = await res.json();
        renderizarProdutosNaGrelha(produtos);
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        const grid = document.getElementById("grelha-produtos");
        if (grid) grid.innerHTML = "<p class='mensagem-inicial'>Erro ao carregar produtos.</p>";
    }
}

// ===== RENDERIZAR PRODUTOS =====
function renderizarProdutosNaGrelha(produtos) {
    const grid = document.getElementById("grelha-produtos");
    if (!grid) return;
    grid.innerHTML = "";

    if (!produtos || produtos.length === 0) {
        grid.innerHTML = "<p class='mensagem-inicial'>Nenhum produto disponível nesta categoria.</p>";
        return;
    }

    produtos.forEach(prod => {
        const card = document.createElement("div");
        card.className = "card-produto";

        let imgUrl = prod.imagem_url;
        if (!imgUrl || imgUrl === '') {
            imgUrl = getPlaceholderSVG();
        }
        
        let seccaoOpcoes = "";
        if (prod.tipo_preco === 'variavel' && prod.variantes && prod.variantes.length > 0) {
            seccaoOpcoes = `<div class="opcoes-container" data-prodid="${prod.id}">`;
            
            let atributosMapeados = {};
            
            prod.variantes.forEach(v => {
                let atributos = v.atributos_json ? JSON.parse(v.atributos_json) : v;
                Object.keys(atributos).forEach(chave => {
                    if (chave !== 'id' && chave !== 'produto_id' && chave !== 'preco' && chave !== 'atributos_json' && chave !== 'created_at' && atributos[chave]) {
                        if (!atributosMapeados[chave]) atributosMapeados[chave] = [];
                        if (!atributosMapeados[chave].includes(atributos[chave])) {
                            atributosMapeados[chave].push(atributos[chave]);
                        }
                    }
                });
            });

            Object.keys(atributosMapeados).forEach(fator => {
                seccaoOpcoes += `
                    <div style="margin-bottom: 0.5rem;">
                        <label style="font-size:0.8rem; font-weight:500;">${escapeHtml(fator)}:</label>
                        <select class="select-opcao-publica" data-fator="${fator}" onchange="recalcularPrecoPublico(${prod.id})">
                            ${atributosMapeados[fator].map(op => `<option value="${escapeHtml(op)}">${escapeHtml(op)}</option>`).join('')}
                        </select>
                    </div>
                `;
            });
            seccaoOpcoes += `</div>`;
        }

        let precoInicial = prod.tipo_preco === 'fixo' 
            ? parseFloat(prod.preco_fixo).toLocaleString('pt-PT', { minimumFractionDigits: 2 }) + ' €' 
            : 'Selecione as opções';

        card.innerHTML = `
            <img src="${imgUrl}" alt="${escapeHtml(prod.nome)}" onerror="this.src='${getPlaceholderSVG()}'">
            <h3>${escapeHtml(prod.nome)}</h3>
            ${seccaoOpcoes}
            <div class="preco-tag" id="preco-prod-${prod.id}">
                ${precoInicial}
            </div>
        `;
        grid.appendChild(card);

        if (prod.tipo_preco === 'variavel' && prod.variantes && prod.variantes.length > 0) {
            const variantesNormalizadas = prod.variantes.map(v => {
                if (v.atributos_json) {
                    const atributos = JSON.parse(v.atributos_json);
                    return { ...atributos, preco: v.preco };
                }
                return v;
            });
            window.todasAsVariantes[prod.id] = variantesNormalizadas;
            recalcularPrecoPublico(prod.id);
        }
    });
}

// ===== RECALCULAR PREÇO =====
function recalcularPrecoPublico(produtoId) {
    const variantes = window.todasAsVariantes[produtoId];
    const precoTag = document.getElementById(`preco-prod-${produtoId}`);
    if (!variantes || !precoTag) return;

    const container = document.querySelector(`.opcoes-container[data-prodid="${produtoId}"]`);
    if (!container) return;

    const selects = container.querySelectorAll('.select-opcao-publica');
    let selecaoAtual = {};

    selects.forEach(sel => {
        selecaoAtual[sel.dataset.fator] = sel.value;
    });

    let varianteCorrespondente = variantes.find(v => {
        let condicao = true;
        Object.keys(selecaoAtual).forEach(fator => {
            if (v[fator] !== selecaoAtual[fator]) {
                condicao = false;
            }
        });
        return condicao;
    });

    if (varianteCorrespondente && varianteCorrespondente.preco) {
        let precoVariavelFormatado = parseFloat(varianteCorrespondente.preco).toLocaleString('pt-PT', { minimumFractionDigits: 2 });
        precoTag.innerText = precoVariavelFormatado + " €";
    } else {
        precoTag.innerText = "Sob Consulta";
    }
}