#!/usr/bin/env python3
"""
Script para migrar dados da estrutura antiga para a nova estrutura com múltiplas comissões por vendedor
"""
import os
import sys
import sqlite3
from datetime import datetime

# Adicionar o diretório do projeto ao path
sys.path.insert(0, os.path.dirname(__file__))

def migrate_data():
    """Migra os dados da estrutura antiga para a nova"""
    
    # Caminho do banco de dados
    db_path = os.path.join(os.path.dirname(__file__), 'src', 'database', 'app.db')
    
    if not os.path.exists(db_path):
        print("Banco de dados não encontrado. Criando novo banco...")
        return
    
    print("Iniciando migração de dados...")
    
    # Conectar ao banco
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Verificar se a tabela vendedor_comissao já existe
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='vendedor_comissao'")
        if cursor.fetchone():
            print("Tabela vendedor_comissao já existe. Migração já foi executada.")
            return
        
        # Criar a nova tabela vendedor_comissao
        cursor.execute('''
            CREATE TABLE vendedor_comissao (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                id_vendedor INTEGER NOT NULL,
                nome_tabela VARCHAR(100) NOT NULL,
                porcentagem_comissao FLOAT NOT NULL,
                FOREIGN KEY (id_vendedor) REFERENCES vendedor (id)
            )
        ''')
        
        # Buscar vendedores existentes
        cursor.execute("SELECT id, nome_vendedor, porcentagem_comissao, nome_tabela FROM vendedor")
        vendedores = cursor.fetchall()
        
        # Migrar cada vendedor para a nova estrutura
        for vendedor in vendedores:
            id_vendedor, nome_vendedor, porcentagem_comissao, nome_tabela = vendedor
            
            # Criar configuração de comissão para cada vendedor
            nome_tabela_final = nome_tabela if nome_tabela else "Padrão"
            cursor.execute('''
                INSERT INTO vendedor_comissao (id_vendedor, nome_tabela, porcentagem_comissao)
                VALUES (?, ?, ?)
            ''', (id_vendedor, nome_tabela_final, porcentagem_comissao))
            
            print(f"Migrado vendedor: {nome_vendedor} - {porcentagem_comissao}% ({nome_tabela_final})")
        
        # Buscar vendas existentes
        cursor.execute("SELECT id, id_vendedor FROM venda")
        vendas = cursor.fetchall()
        
        # Atualizar vendas para usar a nova estrutura
        for venda in vendas:
            id_venda, id_vendedor = venda
            
            # Buscar a configuração de comissão padrão para este vendedor
            cursor.execute('''
                SELECT id FROM vendedor_comissao 
                WHERE id_vendedor = ? 
                ORDER BY id LIMIT 1
            ''', (id_vendedor,))
            
            resultado = cursor.fetchone()
            if resultado:
                id_vendedor_comissao = resultado[0]
                
                # Adicionar coluna id_vendedor_comissao se não existir
                try:
                    cursor.execute('ALTER TABLE venda ADD COLUMN id_vendedor_comissao INTEGER')
                except sqlite3.OperationalError:
                    pass  # Coluna já existe
                
                # Atualizar a venda
                cursor.execute('''
                    UPDATE venda 
                    SET id_vendedor_comissao = ? 
                    WHERE id = ?
                ''', (id_vendedor_comissao, id_venda))
                
                print(f"Migrada venda ID {id_venda}")
        
        # Remover colunas antigas da tabela vendedor (SQLite não suporta DROP COLUMN diretamente)
        # Vamos criar uma nova tabela e copiar os dados
        cursor.execute('''
            CREATE TABLE vendedor_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome_vendedor VARCHAR(100) NOT NULL
            )
        ''')
        
        # Copiar dados para a nova tabela
        cursor.execute('INSERT INTO vendedor_new (id, nome_vendedor) SELECT id, nome_vendedor FROM vendedor')
        
        # Renomear tabelas
        cursor.execute('DROP TABLE vendedor')
        cursor.execute('ALTER TABLE vendedor_new RENAME TO vendedor')
        
        # Commit das mudanças
        conn.commit()
        print("Migração concluída com sucesso!")
        
    except Exception as e:
        print(f"Erro durante a migração: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == '__main__':
    migrate_data()

