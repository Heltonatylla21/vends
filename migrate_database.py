#!/usr/bin/env python3
"""
Script para migrar completamente o banco de dados para a nova estrutura
"""
import os
import sys
import sqlite3
import shutil
from datetime import datetime

# Adicionar o diretório do projeto ao path
sys.path.insert(0, os.path.dirname(__file__))

def migrate_database():
    """Migra o banco de dados para a nova estrutura"""
    
    # Caminho do banco de dados
    db_path = os.path.join(os.path.dirname(__file__), 'src', 'database', 'app.db')
    backup_path = db_path + '.backup_' + datetime.now().strftime('%Y%m%d_%H%M%S')
    
    print("Iniciando migração completa do banco de dados...")
    
    # Fazer backup do banco atual
    if os.path.exists(db_path):
        shutil.copy2(db_path, backup_path)
        print(f"Backup criado: {backup_path}")
    
    # Conectar ao banco
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Buscar dados existentes antes da migração
        print("Coletando dados existentes...")
        
        # Vendedores
        cursor.execute("SELECT id, nome_vendedor, porcentagem_comissao, nome_tabela FROM vendedor")
        vendedores_antigos = cursor.fetchall()
        
        # Vendas
        cursor.execute("SELECT id, cpf_cliente, nome_cliente, data_venda, valor_venda, valor_comissao, comissao_paga, id_vendedor, usuario_cadastro FROM venda")
        vendas_antigas = cursor.fetchall()
        
        print(f"Encontrados {len(vendedores_antigos)} vendedores e {len(vendas_antigas)} vendas")
        
        # Recriar todas as tabelas
        print("Recriando estrutura do banco...")
        
        # Dropar tabelas existentes
        cursor.execute("DROP TABLE IF EXISTS venda")
        cursor.execute("DROP TABLE IF EXISTS vendedor_comissao")
        cursor.execute("DROP TABLE IF EXISTS vendedor")
        
        # Criar nova estrutura
        cursor.execute('''
            CREATE TABLE vendedor (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome_vendedor VARCHAR(100) NOT NULL
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE vendedor_comissao (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                id_vendedor INTEGER NOT NULL,
                nome_tabela VARCHAR(100) NOT NULL,
                porcentagem_comissao FLOAT NOT NULL,
                FOREIGN KEY (id_vendedor) REFERENCES vendedor (id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE venda (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cpf_cliente VARCHAR(14) NOT NULL,
                nome_cliente VARCHAR(100) NOT NULL,
                data_venda DATE NOT NULL,
                valor_venda FLOAT NOT NULL,
                valor_comissao FLOAT NOT NULL DEFAULT 0.0,
                comissao_paga BOOLEAN NOT NULL DEFAULT 0,
                id_vendedor_comissao INTEGER NOT NULL,
                usuario_cadastro VARCHAR(100),
                FOREIGN KEY (id_vendedor_comissao) REFERENCES vendedor_comissao (id)
            )
        ''')
        
        # Migrar dados dos vendedores
        print("Migrando vendedores...")
        vendedor_map = {}  # Mapear id_vendedor antigo para novo
        comissao_map = {}  # Mapear id_vendedor antigo para id_vendedor_comissao
        
        for vendedor_antigo in vendedores_antigos:
            id_antigo, nome_vendedor, porcentagem_comissao, nome_tabela = vendedor_antigo
            
            # Inserir vendedor
            cursor.execute('INSERT INTO vendedor (nome_vendedor) VALUES (?)', (nome_vendedor,))
            id_novo = cursor.lastrowid
            vendedor_map[id_antigo] = id_novo
            
            # Inserir configuração de comissão
            nome_tabela_final = nome_tabela if nome_tabela else "Padrão"
            cursor.execute('''
                INSERT INTO vendedor_comissao (id_vendedor, nome_tabela, porcentagem_comissao)
                VALUES (?, ?, ?)
            ''', (id_novo, nome_tabela_final, porcentagem_comissao))
            
            id_comissao = cursor.lastrowid
            comissao_map[id_antigo] = id_comissao
            
            print(f"Migrado: {nome_vendedor} - {porcentagem_comissao}% ({nome_tabela_final})")
        
        # Migrar vendas
        print("Migrando vendas...")
        for venda_antiga in vendas_antigas:
            id_venda, cpf_cliente, nome_cliente, data_venda, valor_venda, valor_comissao, comissao_paga, id_vendedor_antigo, usuario_cadastro = venda_antiga
            
            # Buscar id_vendedor_comissao correspondente
            id_vendedor_comissao = comissao_map.get(id_vendedor_antigo)
            
            if id_vendedor_comissao:
                cursor.execute('''
                    INSERT INTO venda (cpf_cliente, nome_cliente, data_venda, valor_venda, valor_comissao, comissao_paga, id_vendedor_comissao, usuario_cadastro)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (cpf_cliente, nome_cliente, data_venda, valor_venda, valor_comissao, comissao_paga, id_vendedor_comissao, usuario_cadastro))
                
                print(f"Migrada venda: {nome_cliente} - R$ {valor_venda}")
        
        # Commit das mudanças
        conn.commit()
        print("Migração concluída com sucesso!")
        
        # Verificar dados migrados
        cursor.execute("SELECT COUNT(*) FROM vendedor")
        count_vendedores = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM vendedor_comissao")
        count_comissoes = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM venda")
        count_vendas = cursor.fetchone()[0]
        
        print(f"Resultado: {count_vendedores} vendedores, {count_comissoes} configurações de comissão, {count_vendas} vendas")
        
    except Exception as e:
        print(f"Erro durante a migração: {e}")
        conn.rollback()
        
        # Restaurar backup em caso de erro
        if os.path.exists(backup_path):
            shutil.copy2(backup_path, db_path)
            print("Backup restaurado devido ao erro")
        
        raise
    finally:
        conn.close()

if __name__ == '__main__':
    migrate_database()

