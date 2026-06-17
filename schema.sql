-- Criar base de dados
CREATE DATABASE IF NOT EXISTS grafica_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE grafica_db;

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabela de subcategorias
CREATE TABLE IF NOT EXISTS subcategorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
    INDEX idx_categoria (categoria_id)
) ENGINE=InnoDB;

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subcategoria_id INT NOT NULL,
    nome VARCHAR(150) NOT NULL,
    imagem_url VARCHAR(255) DEFAULT NULL,
    tipo_preco ENUM('fixo', 'variavel') DEFAULT 'fixo',
    preco_fixo DECIMAL(10, 2) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subcategoria_id) REFERENCES subcategorias(id) ON DELETE CASCADE,
    INDEX idx_subcategoria (subcategoria_id)
) ENGINE=InnoDB;

-- Tabela de variantes de produtos
CREATE TABLE IF NOT EXISTS produto_variantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produto_id INT NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    atributos_json JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    INDEX idx_produto (produto_id)
) ENGINE=InnoDB;

-- Tabela de fatores dinâmicos
CREATE TABLE IF NOT EXISTS fatores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo ENUM('select', 'checkbox', 'text', 'numero') DEFAULT 'select',
    escopo ENUM('global', 'categoria', 'subcategoria', 'produto', 'produto_pendente') DEFAULT 'global',
    entidade_id INT NULL COMMENT 'ID da categoria/subcategoria/produto dependendo do escopo',
    opcoes JSON NULL COMMENT 'Opções disponíveis para selects',
    obrigatorio BOOLEAN DEFAULT FALSE,
    ordem INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_escopo (escopo, entidade_id),
    INDEX idx_ordem (ordem)
) ENGINE=InnoDB;