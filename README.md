# Berci Catálogo

Sistema de catálogo digital e painel de administração desenvolvido para a Berci Gráfica. A aplicação permite a visualização pública de produtos e uma gestão dinâmica de categorias, subcategorias, fatores e matrizes de preços.

---

## Sobre o Projeto

O Berci Catálogo é uma solução web dividida em duas frentes principais:

1. **Catálogo Público (index.html):** Uma montra digital orientada para o cliente, focada na experiência do utilizador (UX/UI), com transições suaves e carregamento reativo de produtos.
2. **Painel de Administração (admin.html):** Um painel restrito e interativo onde os administradores podem gerir toda a estrutura comercial da gráfica, definir preços fixos ou dinâmicos (baseados em matrizes de fatores) e aplicar atualizações de preço em lote.

O design visual utiliza uma paleta de cores baseada em tons suaves, cremes, cinzas quentes e apontamentos dourados ou terrosos, garantindo uma identidade altamente profissional e corporativa.

---

## Funcionalidades Principais

### Área Pública (Catálogo)
* **Navegação Fluida:** Menu lateral em formato acordeão para categorias e subcategorias.
* **Preços Dinâmicos:** Atualização automática da tag de preço no cartão do produto conforme o utilizador altera as opções (fatores) do produto (ex: Dimensão, Quantidade).
* **Design Responsivo:** Otimização total para dispositivos móveis, tablets e computadores.
* **Experiência Visual Elevada:** Inclui preloader de carregamento personalizado com animações fluidas e efeitos de hover nos cartões de produtos.

### Painel de Administração (Modo Edição)
* **Gestão Estrutural CRUD:** Criação, edição e eliminação de Categorias, Subcategorias e Produtos em tempo real.
* **Arquitetura de Pastas Inteligente:** O sistema de uploads organiza de forma autónoma os ficheiros de imagem em pastas no servidor baseadas nos nomes (slugs) das categorias e subcategorias (ex: `/uploads/categoria_nome/subcategoria_nome/produto.png`).
* **Motor de Preços Flexível:**
  * **Preço Fixo:** Atribuição de um valor estático ao produto.
  * **Preço Variável / Matriz Dinâmica:** Criação de variantes de preços cruzando múltiplos fatores JSON.
* **Gestão de Fatores Dinâmicos:** Definição de fatores (Dimensão, Papel, Quantidade) aplicáveis a diferentes escopos: Global, Categoria, Subcategoria ou Produto específico.
* **Atualização de Preços em Lote:** Módulo avançado que permite aplicar um aumento ou desconto percentual (ex: `+5%` ou `-3%`) selecionando os alvos através de uma árvore interativa de Categorias, Subcategorias e Produtos.

---

## Tecnologias Utilizadas

* **Frontend:**
  * HTML5 (Estruturação semântica)
  * CSS3 Avançado (Variáveis nativas :root, Flexbox, Grid Layout, Animações e Backdrop Blur)
  * JavaScript Vanilla (Manipulação de DOM, requisições assíncronas Fetch API e gestão de modais)
  * Google Fonts - Família Inter

* **Backend:**
  * PHP 7.4+ (API RESTful estruturada via rotas de ação, tratamento de ficheiros/diretórios e conexões PDO)

* **Base de Dados:**
  * MySQL / MariaDB (Suporte a transações ACID, chaves estrangeiras com eliminação em cascata e tipos de dados nativos JSON e ENUM)

---

## Estrutura da Base de Dados

A base de dados `grafica_db` está normalizada e otimizada com índices para garantir performance em consultas complexas de catálogo:

* **`categorias`:** Armazena o agrupamento principal dos produtos.
* **`subcategorias`:** Relacionada inversamente com as categorias (`ON DELETE CASCADE`).
* **`produtos`:** Contém a informação base do artigo, o tipo de preço (`fixo`/`variavel`) e o caminho da imagem correspondente.
* **`produto_variantes`:** Guarda as combinações dinâmicas de preços estruturadas em formato JSON dentro da coluna `atributos_json`.
* **`fatores`:** Define os critérios de seleção (escopo, ordem, tipo de input e opções disponíveis).

---

## Como Instalar e Executar

### Pré-requisitos
* Servidor Web (Apache/Nginx) com suporte a PHP 7.4 ou superior.
* Servidor de Base de Dados MySQL.
* Recomendado o uso de ambientes locais como XAMPP, WampServer, Laragon ou Docker.

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone [https://github.com/dinismonteiroscp-maker/Estagio-Berci-2026](https://github.com/dinismonteiroscp-maker/Estagio-Berci-2026)
   cd berci-catalogo

# Licença
Este projeto é de uso exclusivo e proprietário para a Berci, Lda. Todos os direitos reservados.