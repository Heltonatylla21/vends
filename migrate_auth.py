#!/usr/bin/env python3
"""
Script para adicionar colunas de autenticação ao modelo Vendedor
"""
import os
import sys
import sqlite3
from datetime import datetime

# Adicionar o diretório do projeto ao path
sys.path.insert(0, os.path.dirname(__file__))

def migrate_auth():
    """Adiciona colunas de autenticação ao modelo Vendedor"""
    
    # Caminho do banco de dados
    db_path = os.path.join(os.path.dirname(__file__), 'src', 'database', 'app.db')
    
    if not os.path.exists(db_path):
        print("Banco de dados não encontrado.")
        return
    
    print("Iniciando migração de autenticação...")
    
    # Conectar ao banco
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Verificar se as colunas já existem
        cursor.execute("PRAGMA table_info(vendedor)")
        colunas = [col[1] for col in cursor.fetchall()]
        
        # Adicionar colunas se não existirem
        if 'email' not in colunas:
            cursor.execute('ALTER TABLE vendedor ADD COLUMN email VARCHAR(120)')
            print("Coluna 'email' adicionada")
        
        if 'senha_hash' not in colunas:
            cursor.execute('ALTER TABLE vendedor ADD COLUMN senha_hash VARCHAR(128)')
            print("Coluna 'senha_hash' adicionada")
        
        if 'ativo' not in colunas:
            cursor.execute('ALTER TABLE vendedor ADD COLUMN ativo BOOLEAN DEFAULT 1')
            print("Coluna 'ativo' adicionada")
        
        if 'data_criacao' not in colunas:
            cursor.execute('ALTER TABLE vendedor ADD COLUMN data_criacao DATETIME')
            # Atualizar registros existentes com data atual
            cursor.execute('UPDATE vendedor SET data_criacao = ? WHERE data_criacao IS NULL', (datetime.utcnow(),))
            print("Coluna 'data_criacao' adicionada")
        
        # Commit das mudanças
        conn.commit()
        print("Migração de autenticação concluída com sucesso!")
        
    except Exception as e:
        print(f"Erro durante a migração: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == '__main__':
    migrate_auth()

