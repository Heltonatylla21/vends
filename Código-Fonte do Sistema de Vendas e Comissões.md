# Código-Fonte do Sistema de Vendas e Comissões

Este documento contém o código-fonte completo do sistema de vendas e comissões, dividido por backend e frontend.

## Linguagens e Tecnologias Utilizadas

- **Backend:** Python 3.11 com Flask, SQLAlchemy (ORM), SQLite (Banco de Dados), PyJWT (Autenticação), OpenPyXL (Processamento de Excel).
- **Frontend:** JavaScript (ES6+) com React, Vite (Build Tool), Tailwind CSS (Estilização), Sonner (Notificações).

---

## 📁 Estrutura de Pastas

```
sistema-vendas/
├── src/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── venda.py
│   │   ├── vendedor.py
│   │   └── vendedor_comissao.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── importacao.py
│   │   ├── user.py
│   │   ├── venda.py
│   │   └── vendedor.py
│   ├── static/ (Arquivos estáticos do frontend construídos)
│   └── main.py
├── temp/ (Temporário para uploads de Excel)
├── venv/ (Ambiente virtual Python)
├── migrate_auth.py
├── migrate_database.py
├── migrate_data.py
├── requirements.txt
└── sistema-vendas-frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── ui/ (Componentes UI do Shadcn/ui)
    │   │   ├── ImportacaoTab.jsx
    │   │   ├── LoginTab.jsx
    │   │   ├── RelatoriosTab.jsx
    │   │   ├── VendasTab.jsx
    │   │   └── VendedorDashboard.jsx
    │   │   └── VendedoresTab.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── pnpm-lock.yaml
    ├── postcss.config.js
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 💻 Código do Backend (Python/Flask)

### `sistema-vendas/src/main.py`
```python



from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.vendedor import vendedor_bp
from src.routes.vendedor_comissao import vendedor_comissao_bp
from src.routes.venda import venda_bp
from src.routes.auth import auth_bp
from src.routes.importacao import importacao_bp
import os

app = Flask(__name__, static_folder=\'src/static\', static_url_path=\'/static\')
CORS(app) # Habilita CORS para todas as rotas

# Configuração do banco de dados SQLite
app.config[\'SQLALCHEMY_DATABASE_URI\'] = \'sqlite:///sistema_vendas.db\'
app.config[\'SQLALCHEMY_TRACK_MODIFICATIONS\'] = False
app.config[\'SECRET_KEY\'] = os.environ.get(\'SECRET_KEY\', \'sua_chave_secreta_aqui\') # Chave secreta para JWT

db.init_app(app)

# Registrar Blueprints
app.register_blueprint(user_bp, url_prefix=\'/api\')
app.register_blueprint(vendedor_bp, url_prefix=\'/api\')
app.register_blueprint(vendedor_comissao_bp, url_prefix=\'/api\')
app.register_blueprint(venda_bp, url_prefix=\'/api\')
app.register_blueprint(auth_bp, url_prefix=\'/api\')
app.register_blueprint(importacao_bp, url_prefix=\'/api\')

# Rota para servir o frontend React
@app.route(\'/\')
def serve_react_app():
    return send_from_directory(app.static_folder, \'index.html\')

@app.route(\'/<path:path>\')
def serve_static_files(path):
    if path != \'index.html\':
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, \'index.html\')

if __name__ == \'__main__\':
    with app.app_context():
        db.create_all() # Cria as tabelas do banco de dados se não existirem
    app.run(debug=True, host=\'0.0.0.0\', port=5000)
```

### `sistema-vendas/src/models/user.py`
```python



from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()



### `sistema-vendas/src/models/venda.py`
```python
from datetime import datetime
from src.models.user import db
from src.models.vendedor_comissao import VendedorComissao

class Venda(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cpf_cliente = db.Column(db.String(14), nullable=False)
    nome_cliente = db.Column(db.String(100), nullable=False)
    data_venda = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    valor_venda = db.Column(db.Float, nullable=False)
    valor_comissao = db.Column(db.Float, nullable=False, default=0.0)
    comissao_paga = db.Column(db.Boolean, default=False)
    id_vendedor_comissao = db.Column(db.Integer, db.ForeignKey(\'vendedor_comissao.id\'), nullable=False)
    usuario_cadastro = db.Column(db.String(100), nullable=True)

    vendedor_comissao = db.relationship(\'VendedorComissao\', backref=\'vendas\')

    def __init__(self, cpf_cliente, nome_cliente, data_venda, valor_venda, id_vendedor_comissao, usuario_cadastro=None):
        self.cpf_cliente = cpf_cliente
        self.nome_cliente = nome_cliente
        self.data_venda = data_venda
        self.valor_venda = valor_venda
        self.id_vendedor_comissao = id_vendedor_comissao
        self.usuario_cadastro = usuario_cadastro
        self.calcular_comissao()

    def calcular_comissao(self):
        if self.vendedor_comissao:
            self.valor_comissao = self.valor_venda * (self.vendedor_comissao.porcentagem_comissao / 100)
        else:
            self.valor_comissao = 0.0

    def to_dict(self):
        return {
            \'id\': self.id,
            \'cpf_cliente\': self.cpf_cliente,
            \'nome_cliente\': self.nome_cliente,
            \'data_venda\': self.data_venda.strftime(\'%Y-%m-%d\'),
            \'valor_venda\': self.valor_venda,
            \'valor_comissao\': self.valor_comissao,
            \'comissao_paga\': self.comissao_paga,
            \'id_vendedor_comissao\': self.id_vendedor_comissao,
            \'nome_vendedor\': self.vendedor_comissao.vendedor.nome_vendedor if self.vendedor_comissao and self.vendedor_comissao.vendedor else None,
            \'nome_tabela_comissao\': self.vendedor_comissao.nome_tabela if self.vendedor_comissao else None,
            \'usuario_cadastro\': self.usuario_cadastro
        }
```

### `sistema-vendas/src/models/vendedor.py`
```python



from src.models.user import db
import hashlib

class Vendedor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome_vendedor = db.Column(db.String(100), nullable=False, unique=True)
    email = db.Column(db.String(120), unique=True, nullable=True) # Pode ser nulo para vendedores antigos
    senha_hash = db.Column(db.String(128), nullable=True) # Pode ser nulo para vendedores antigos

    comissoes = db.relationship(\'VendedorComissao\', backref=\'vendedor\', lazy=True, cascade=\'all, delete-orphan\')

    def __init__(self, nome_vendedor, email=None, senha=None):
        self.nome_vendedor = nome_vendedor
        if email:
            self.email = email
        if senha:
            self.set_senha(senha)

    def set_senha(self, senha):
        self.senha_hash = hashlib.sha256(senha.encode(\'utf-8\')).hexdigest()

    def check_senha(self, senha):
        return self.senha_hash == hashlib.sha256(senha.encode(\'utf-8\')).hexdigest()

    def to_dict(self):
        return {
            \'id\': self.id,
            \'nome_vendedor\': self.nome_vendedor,
            \'email\': self.email,
            \'comissoes\': [comissao.to_dict() for comissao in self.comissoes]
        }
```

### `sistema-vendas/src/models/vendedor_comissao.py`
```python



from src.models.user import db

class VendedorComissao(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    id_vendedor = db.Column(db.Integer, db.ForeignKey(\'vendedor.id\'), nullable=False)
    nome_tabela = db.Column(db.String(100), nullable=False)
    porcentagem_comissao = db.Column(db.Float, nullable=False)

    __table_args__ = (db.UniqueConstraint(\'id_vendedor\', \'nome_tabela\', name=\'_vendedor_nome_tabela_uc\'),)

    def __init__(self, id_vendedor, nome_tabela, porcentagem_comissao):
        self.id_vendedor = id_vendedor
        self.nome_tabela = nome_tabela
        self.porcentagem_comissao = porcentagem_comissao

    def to_dict(self):
        return {
            \'id\': self.id,
            \'id_vendedor\': self.id_vendedor,
            \'nome_tabela\': self.nome_tabela,
            \'porcentagem_comissao\': self.porcentagem_comissao
        }
```

### `sistema-vendas/src/routes/user.py`
```python



from flask import Blueprint, jsonify

user_bp = Blueprint(\'user\', __name__)

@user_bp.route(\'/users\', methods=['GET'])
def get_users():
    return jsonify({'message': 'User routes are working!'}), 200
```

### `sistema-vendas/src/routes/auth.py`
```python



from flask import Blueprint, request, jsonify, current_app
from src.models.user import db
from src.models.vendedor import Vendedor
import jwt
import datetime

auth_bp = Blueprint(\'auth\', __name__)

@auth_bp.route(\'/registro\', methods=['POST'])
def registro():
    data = request.get_json()
    nome_vendedor = data.get('nome_vendedor')
    email = data.get('email')
    senha = data.get('senha')

    if not nome_vendedor or not email or not senha:
        return jsonify({'erro': 'Nome, email e senha são obrigatórios'}), 400

    if Vendedor.query.filter_by(email=email).first():
        return jsonify({'erro': 'Email já cadastrado'}), 409

    if Vendedor.query.filter_by(nome_vendedor=nome_vendedor).first():
        return jsonify({'erro': 'Nome de vendedor já cadastrado'}), 409

    novo_vendedor = Vendedor(nome_vendedor=nome_vendedor, email=email, senha=senha)
    db.session.add(novo_vendedor)
    db.session.commit()

    return jsonify({'mensagem': 'Vendedor registrado com sucesso'}), 201

@auth_bp.route(\'/login\', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    senha = data.get('senha')

    vendedor = Vendedor.query.filter_by(email=email).first()

    if not vendedor or not vendedor.check_senha(senha):
        return jsonify({'erro': 'Credenciais inválidas'}), 401

    token = jwt.encode({
        'id_vendedor': vendedor.id,
        'nome_vendedor': vendedor.nome_vendedor,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24) # Token expira em 24 horas
    }, current_app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({'token': token, 'id_vendedor': vendedor.id, 'nome_vendedor': vendedor.nome_vendedor}), 200

def token_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'erro': 'Token é obrigatório!'}), 401

        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_vendedor = Vendedor.query.get(data['id_vendedor'])
        except:
            return jsonify({'erro': 'Token é inválido ou expirou!'}), 401

        return f(current_vendedor, *args, **kwargs)
    return decorated

@auth_bp.route(\'/dashboard\', methods=['GET'])
@token_required
def dashboard(current_vendedor):
    return jsonify({
        'mensagem': f'Bem-vindo ao seu dashboard, {current_vendedor.nome_vendedor}!',
        'id_vendedor': current_vendedor.id,
        'nome_vendedor': current_vendedor.nome_vendedor,
        'email': current_vendedor.email
    }), 200
```

### `sistema-vendas/src/routes/importacao.py`
```python



from flask import Blueprint, request, jsonify, send_file, current_app
import openpyxl
import os
from datetime import datetime
from src.models.user import db
from src.models.venda import Venda
from src.models.vendedor_comissao import VendedorComissao
from src.models.vendedor import Vendedor
from src.routes.auth import token_required

importacao_bp = Blueprint(\'importacao\', __name__)

def validar_cpf(cpf):
    \"\"\"Validação básica de CPF (formato)\"\"\"
    if not cpf:
        return False
    
    # Remover caracteres especiais
    cpf_limpo = \'\'.join(filter(str.isdigit, str(cpf)))
    
    # Verificar se tem 11 dígitos
    if len(cpf_limpo) != 11:
        return False
    
    # Verificar se não são todos os dígitos iguais
    if cpf_limpo == cpf_limpo[0] * 11:
        return False
    
    return True

def formatar_cpf(cpf):
    \"\"\"Formatar CPF para o padrão XXX.XXX.XXX-XX\"\"\"
    if not cpf:
        return None
    
    cpf_limpo = \'\'.join(filter(str.isdigit, str(cpf)))
    if len(cpf_limpo) == 11:
        return f\"{cpf_limpo[:3]}.{cpf_limpo[3:6]}.{cpf_limpo[6:9]}-{cpf_limpo[9:]}\"
    return cpf

@importacao_bp.route(\'/importacao/template\', methods=[\'GET\'])
def baixar_template():
    \"\"\"Gera e retorna um template Excel para importação de vendas\"\"\"
    try:
        # Buscar vendedores e suas configurações de comissão para o exemplo
        vendedores_comissoes = VendedorComissao.query.join(Vendedor).all()
        
        # Criar workbook
        wb = openpyxl.Workbook()
        
        # Aba principal com dados de exemplo
        ws_vendas = wb.active
        ws_vendas.title = \"Vendas\"
        
        # Cabeçalhos
        headers = [\'cpf_cliente\', \'nome_cliente\', \'data_venda\', \'valor_venda\', \'vendedor\', \'tabela_comissao\', \'usuario_cadastro\']
        for col, header in enumerate(headers, 1):
            ws_vendas.cell(row=1, column=col, value=header)
        
        # Dados de exemplo
        if vendedores_comissoes:
            for i, vc in enumerate(vendedores_comissoes[:3], 2):  # Começar na linha 2
                ws_vendas.cell(row=i, column=1, value=f\'123.456.789-{i-2:02d}\' )
                ws_vendas.cell(row=i, column=2, value=f\'Cliente Exemplo {i-1}\' )
                ws_vendas.cell(row=i, column=3, value=\'2025-06-29\')
                ws_vendas.cell(row=i, column=4, value=1000.00 * (i-1))
                ws_vendas.cell(row=i, column=5, value=vc.vendedor.nome_vendedor)
                ws_vendas.cell(row=i, column=6, value=vc.nome_tabela)
                ws_vendas.cell(row=i, column=7, value=\'admin\')
        else:
            # Exemplo genérico
            ws_vendas.cell(row=2, column=1, value=\'123.456.789-00\')
            ws_vendas.cell(row=2, column=2, value=\'Cliente Exemplo\')
            ws_vendas.cell(row=2, column=3, value=\'2025-06-29\')
            ws_vendas.cell(row=2, column=4, value=1000.00)
            ws_vendas.cell(row=2, column=5, value=\'Nome do Vendedor\')
            ws_vendas.cell(row=2, column=6, value=\'Nome da Tabela\')
            ws_vendas.cell(row=2, column=7, value=\'admin\')
        
        # Aba de instruções
        ws_instrucoes = wb.create_sheet(\"Instruções\")
        instrucoes_data = [
            [\'Campo\', \'Descrição\', \'Obrigatório\', \'Exemplo\'],
            [\'cpf_cliente\', \'CPF do cliente (formato: XXX.XXX.XXX-XX ou apenas números)\", \'Sim\', \'123.456.789-00\'],
            [\'nome_cliente\', \'Nome completo do cliente\". \'Sim\', \'João Silva\'],
            [\'data_venda\', \'Data da venda (formato: AAAA-MM-DD)\", \'Sim\', \'2025-06-29\'],
            [\'valor_venda\', \'Valor da venda (formato: 1000.50)\", \'Sim\', \'1500.00\'],
            [\'vendedor\', \'Nome exato do vendedor (deve existir no sistema)\", \'Sim\', \'Ana Silva\'],
            [\'tabela_comissao\', \'Nome da tabela de comissão (deve existir para o vendedor)\", \'Sim\', \'Gold\'],
            [\'usuario_cadastro\', \'Usuário que está cadastrando (opcional)\", \'Não\', \'admin\']
        ]
        
        for row, data in enumerate(instrucoes_data, 1):
            for col, value in enumerate(data, 1):
                ws_instrucoes.cell(row=row, column=col, value=value)
        
        # Aba com vendedores disponíveis
        if vendedores_comissoes:
            ws_vendedores = wb.create_sheet(\"Vendedores_Disponíveis\")
            ws_vendedores.cell(row=1, column=1, value=\'Vendedor\')
            ws_vendedores.cell(row=1, column=2, value=\'Tabela_Comissao\')
            ws_vendedores.cell(row=1, column=3, value=\'Porcentagem\')
            
            for row, vc in enumerate(vendedores_comissoes, 2):
                ws_vendedores.cell(row=row, column=1, value=vc.vendedor.nome_vendedor)
                ws_vendedores.cell(row=row, column=2, value=vc.nome_tabela)
                ws_vendedores.cell(row=row, column=3, value=f\"{vc.porcentagem_comissao}%\" )
        
        # Salvar arquivo
        temp_dir = os.path.join(os.path.dirname(__file__), \'..\', \'temp\')
        os.makedirs(temp_dir, exist_ok=True)
        
        arquivo_template = os.path.join(temp_dir, \'template_vendas.xlsx\')
        wb.save(arquivo_template)
        
        return jsonify({
            \'mensagem\': \'Template gerado com sucesso\',
            \'arquivo\': arquivo_template,
            \'download_url\': f\'/api/importacao/template/download\'
        }), 200
        
    except Exception as e:
        return jsonify({\'erro\': str(e)}), 500

@importacao_bp.route(\'/importacao/template/download\', methods=[\'GET\'])
def download_template():
    \"\"\"Download do arquivo template\"\"\"
    try:
        arquivo_template = os.path.join(os.path.dirname(__file__), \'..\', \'temp\', \'template_vendas.xlsx\')
        
        if not os.path.exists(arquivo_template):
            return jsonify({\'erro\': \'Template não encontrado. Gere o template primeiro.\'}), 404
        
        return send_file(
            arquivo_template,
            as_attachment=True,
            download_name=\'template_vendas.xlsx\',
            mimetype=\'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\'
        )
        
    except Exception as e:
        return jsonify({\'erro\': str(e)}), 500

@importacao_bp.route(\'/importacao/vendas\', methods=[\'POST\'])
@token_required
def importar_vendas(current_user):
    \"\"\"Importa vendas de um arquivo Excel\"\"\"
    try:
        # Verificar se foi enviado um arquivo
        if \'arquivo\' not in request.files:
            return jsonify({\'erro\': \'Nenhum arquivo foi enviado\'}), 400
        
        arquivo = request.files[\'arquivo\']
        
        if arquivo.filename == \'\':
            return jsonify({\'erro\': \'Nenhum arquivo selecionado\'}), 400
        
        # Verificar extensão do arquivo
        if not arquivo.filename.lower().endswith((\'.xlsx\', \'.xls\')):
            return jsonify({\'erro\': \'Arquivo deve ser Excel (.xlsx ou .xls)\'}), 400
        
        # Salvar arquivo temporariamente
        temp_dir = os.path.join(os.path.dirname(__file__), \'..\', \'temp\')
        os.makedirs(temp_dir, exist_ok=True)
        
        arquivo_path = os.path.join(temp_dir, f\'upload_{datetime.now().strftime(\"%Y%m%d_%H%M%S\")}_{arquivo.filename}\' )
        arquivo.save(arquivo_path)
        
        try:
            # Ler arquivo Excel
            wb = openpyxl.load_workbook(arquivo_path)
            ws = wb.active
            
            # Ler cabeçalhos
            headers = []
            for col in range(1, ws.max_column + 1):
                header = ws.cell(row=1, column=col).value
                if header:
                    headers.append(str(header).strip())
            
            # Verificar colunas obrigatórias
            colunas_obrigatorias = [\'cpf_cliente\', \'nome_cliente\', \'data_venda\', \'valor_venda\', \'vendedor\', \'tabela_comissao\']
            colunas_faltantes = [col for col in colunas_obrigatorias if col not in headers]
            
            if colunas_faltantes:
                return jsonify({
                    \'erro\': f\'Colunas obrigatórias faltantes: {\", \".join(colunas_faltantes)}\'
                }), 400
            
            # Mapear índices das colunas
            col_indices = {header: headers.index(header) + 1 for header in headers}
            
            # Processar cada linha
            vendas_criadas = []
            erros = []
            
            for row_num in range(2, ws.max_row + 1):  # Começar da linha 2 (pular cabeçalho)
                try:
                    # Ler dados da linha
                    row_data = {}
                    for header in headers:
                        cell_value = ws.cell(row=row_num, column=col_indices[header]).value
                        row_data[header] = cell_value
                    
                    # Validar dados obrigatórios
                    if not row_data.get(\'cpf_cliente\') or not row_data.get(\'nome_cliente\') or not row_data.get(\'valor_venda\'):
                        erros.append(f\'Linha {row_num}: Dados obrigatórios faltantes\')
                        continue
                    
                    # Validar e formatar CPF
                    cpf = str(row_data[\'cpf_cliente\']).strip()
                    if not validar_cpf(cpf):
                        erros.append(f\'Linha {row_num}: CPF inválido ({cpf})\')
                        continue
                    
                    cpf_formatado = formatar_cpf(cpf)
                    
                    # Validar valor da venda
                    try:
                        valor_venda = float(row_data[\'valor_venda\'])
                        if valor_venda <= 0:
                            erros.append(f\'Linha {row_num}: Valor da venda deve ser maior que zero\')
                            continue
                    except (ValueError, TypeError):
                        erros.append(f\'Linha {row_num}: Valor da venda inválido\')
                        continue
                    
                    # Buscar vendedor e configuração de comissão
                    nome_vendedor = str(row_data[\'vendedor\']).strip()
                    nome_tabela = str(row_data[\'tabela_comissao\']).strip()
                    
                    vendedor_comissao = db.session.query(VendedorComissao).join(Vendedor).filter(
                        Vendedor.nome_vendedor == nome_vendedor,
                        VendedorComissao.nome_tabela == nome_tabela
                    ).first()
                    
                    if not vendedor_comissao:
                        erros.append(f\'Linha {row_num}: Vendedor \"{nome_vendedor}\" com tabela \"{nome_tabela}\" não encontrado\')
                        continue
                    
                    # Processar data da venda
                    data_venda = None
                    if row_data.get(\'data_venda\'):
                        try:
                            if isinstance(row_data[\'data_venda\'], str):
                                data_venda = datetime.strptime(row_data[\'data_venda\'], \'%Y-%m-%d\').date()
                            else:
                                data_venda = row_data[\'data_venda\'].date() if hasattr(row_data[\'data_venda\'], \'date\') else row_data[\'data_venda\']
                        except (ValueError, AttributeError):
                            erros.append(f\'Linha {row_num}: Data inválida (use formato AAAA-MM-DD)\' )
                            continue
                    
                    # Criar venda
                    venda = Venda(
                        cpf_cliente=cpf_formatado,
                        nome_cliente=str(row_data[\'nome_cliente\']).strip(),
                        valor_venda=valor_venda,
                        data_venda=data_venda if data_venda else datetime.utcnow().date(),
                        id_vendedor_comissao=vendedor_comissao.id,
                        usuario_cadastro=str(row_data[\'usuario_cadastro\']).strip() if row_data.get(\'usuario_cadastro\') else current_user.nome_vendedor
                    )
                    db.session.add(venda)
                    db.session.commit()
                    vendas_criadas.append(venda.to_dict())

                except Exception as e:
                    db.session.rollback()
                    erros.append(f\'Linha {row_num}: Erro inesperado - {str(e)}\' )
            
            return jsonify({
                \'mensagem\': \'Importação concluída\',
                \'vendas_criadas\': vendas_criadas,
                \'erros\': erros
            }), 200

        finally:
            # Remover arquivo temporário
            if os.path.exists(arquivo_path):
                os.remove(arquivo_path)
        
    except Exception as e:
        return jsonify({\'erro\': str(e)}), 500
```

### `sistema-vendas/src/routes/venda.py`
```python



from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.venda import Venda
from src.models.vendedor import Vendedor
from src.models.vendedor_comissao import VendedorComissao
from src.routes.auth import token_required
from datetime import datetime

venda_bp = Blueprint(\'venda\', __name__)

@venda_bp.route(\'/vendas\', methods=['GET'])
@token_required
def get_vendas(current_user):
    query = Venda.query

    # Filtro por vendedor (apenas para admin ou se o vendedor logado for o mesmo)
    id_vendedor = request.args.get('id_vendedor', type=int)
    if id_vendedor:
        if current_user.email == 'admin@admin.com' or current_user.id == id_vendedor:
            query = query.join(VendedorComissao).filter(VendedorComissao.id_vendedor == id_vendedor)
        else:
            return jsonify({'erro': 'Não autorizado a ver vendas de outros vendedores'}), 403
    elif current_user.email != 'admin@admin.com': # Se não for admin, só vê as próprias vendas
        query = query.join(VendedorComissao).filter(VendedorComissao.id_vendedor == current_user.id)

    # Filtro por data
    data_inicio = request.args.get('data_inicio')
    data_fim = request.args.get('data_fim')
    if data_inicio:
        query = query.filter(Venda.data_venda >= datetime.strptime(data_inicio, '%Y-%m-%d').date())
    if data_fim:
        query = query.filter(Venda.data_venda <= datetime.strptime(data_fim, '%Y-%m-%d').date())

    # Filtro por status de comissão
    comissao_paga = request.args.get('comissao_paga')
    if comissao_paga is not None:
        comissao_paga = comissao_paga.lower() == 'true'
        query = query.filter(Venda.comissao_paga == comissao_paga)

    vendas = query.all()
    return jsonify([venda.to_dict() for venda in vendas]), 200

@venda_bp.route(\'/vendas\', methods=['POST'])
@token_required
def add_venda(current_user):
    data = request.get_json()
    cpf_cliente = data.get('cpf_cliente')
    nome_cliente = data.get('nome_cliente')
    data_venda_str = data.get('data_venda')
    valor_venda = data.get('valor_venda')
    id_vendedor_comissao = data.get('id_vendedor_comissao')

    if not cpf_cliente or not nome_cliente or not data_venda_str or not valor_venda or not id_vendedor_comissao:
        return jsonify({'erro': 'Dados incompletos'}), 400

    try:
        data_venda = datetime.strptime(data_venda_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'erro': 'Formato de data inválido. Use YYYY-MM-DD'}), 400

    vendedor_comissao = VendedorComissao.query.get(id_vendedor_comissao)
    if not vendedor_comissao:
        return jsonify({'erro': 'Configuração de comissão não encontrada'}), 404

    # Apenas admin ou o próprio vendedor pode cadastrar vendas para si
    if current_user.email != 'admin@admin.com' and vendedor_comissao.id_vendedor != current_user.id:
        return jsonify({'erro': 'Não autorizado a cadastrar vendas para este vendedor'}), 403

    nova_venda = Venda(
        cpf_cliente=cpf_cliente,
        nome_cliente=nome_cliente,
        data_venda=data_venda,
        valor_venda=valor_venda,
        id_vendedor_comissao=id_vendedor_comissao,
        usuario_cadastro=current_user.nome_vendedor
    )
    db.session.add(nova_venda)
    db.session.commit()
    return jsonify(nova_venda.to_dict()), 201

@venda_bp.route(\'/vendas/<int:id>\', methods=['PUT'])
@token_required
def update_venda(current_user, id):
    venda = Venda.query.get(id)
    if not venda:
        return jsonify({'erro': 'Venda não encontrada'}), 404

    # Apenas admin ou o próprio vendedor pode atualizar suas vendas
    if current_user.email != 'admin@admin.com' and venda.vendedor_comissao.id_vendedor != current_user.id:
        return jsonify({'erro': 'Não autorizado a atualizar esta venda'}), 403

    data = request.get_json()
    venda.cpf_cliente = data.get('cpf_cliente', venda.cpf_cliente)
    venda.nome_cliente = data.get('nome_cliente', venda.nome_cliente)
    
    data_venda_str = data.get('data_venda')
    if data_venda_str:
        try:
            venda.data_venda = datetime.strptime(data_venda_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'erro': 'Formato de data inválido. Use YYYY-MM-DD'}), 400

    venda.valor_venda = data.get('valor_venda', venda.valor_venda)
    venda.comissao_paga = data.get('comissao_paga', venda.comissao_paga)
    
    # Se mudar a configuração de comissão, recalcular
    novo_id_vendedor_comissao = data.get('id_vendedor_comissao')
    if novo_id_vendedor_comissao and novo_id_vendedor_comissao != venda.id_vendedor_comissao:
        nova_vendedor_comissao = VendedorComissao.query.get(novo_id_vendedor_comissao)
        if not nova_vendedor_comissao:
            return jsonify({'erro': 'Nova configuração de comissão não encontrada'}), 404
        
        # Apenas admin ou o próprio vendedor pode mudar para sua própria comissão
        if current_user.email != 'admin@admin.com' and nova_vendedor_comissao.id_vendedor != current_user.id:
            return jsonify({'erro': 'Não autorizado a mudar para esta configuração de comissão'}), 403

        venda.id_vendedor_comissao = novo_id_vendedor_comissao
        venda.vendedor_comissao = nova_vendedor_comissao # Atualiza o relacionamento
        venda.calcular_comissao() # Recalcula a comissão
    elif 'valor_venda' in data: # Recalcula se o valor da venda mudou
        venda.calcular_comissao()

    db.session.commit()
    return jsonify(venda.to_dict()), 200

@venda_bp.route(\'/vendas/<int:id>\', methods=['DELETE'])
@token_required
def delete_venda(current_user, id):
    venda = Venda.query.get(id)
    if not venda:
        return jsonify({'erro': 'Venda não encontrada'}), 404

    # Apenas admin ou o próprio vendedor pode deletar suas vendas
    if current_user.email != 'admin@admin.com' and venda.vendedor_comissao.id_vendedor != current_user.id:
        return jsonify({'erro': 'Não autorizado a deletar esta venda'}), 403

    db.session.delete(venda)
    db.session.commit()
    return jsonify({'mensagem': 'Venda excluída com sucesso'}), 200

@venda_bp.route(\'/relatorio/vendas\', methods=['GET'])
@token_required
def relatorio_vendas(current_user):
    query = Venda.query

    # Filtro por vendedor (apenas para admin ou se o vendedor logado for o mesmo)
    id_vendedor = request.args.get('id_vendedor', type=int)
    if id_vendedor:
        if current_user.email == 'admin@admin.com' or current_user.id == id_vendedor:
            query = query.join(VendedorComissao).filter(VendedorComissao.id_vendedor == id_vendedor)
        else:
            return jsonify({'erro': 'Não autorizado a ver relatório de outros vendedores'}), 403
    elif current_user.email != 'admin@admin.com': # Se não for admin, só vê as próprias vendas
        query = query.join(VendedorComissao).filter(VendedorComissao.id_vendedor == current_user.id)

    # Filtro por data
    data_inicio = request.args.get('data_inicio')
    data_fim = request.args.get('data_fim')
    if data_inicio:
        query = query.filter(Venda.data_venda >= datetime.strptime(data_inicio, '%Y-%m-%d').date())
    if data_fim:
        query = query.filter(Venda.data_venda <= datetime.strptime(data_fim, '%Y-%m-%d').date())

    vendas = query.all()

    total_vendas = sum(v.valor_venda for v in vendas)
    total_comissao = sum(v.valor_comissao for v in vendas)
    comissao_paga = sum(v.valor_comissao for v in vendas if v.comissao_paga)
    comissao_pendente = total_comissao - comissao_paga

    return jsonify({
        'total_vendas': total_vendas,
        'total_comissao': total_comissao,
        'comissao_paga': comissao_paga,
        'comissao_pendente': comissao_pendente,
        'detalhes_vendas': [v.to_dict() for v in vendas]
    }), 200

@venda_bp.route(\'/vendas/exportar\', methods=['GET'])
@token_required
def exportar_vendas(current_user):
    query = Venda.query

    # Filtro por vendedor (apenas para admin ou se o vendedor logado for o mesmo)
    id_vendedor = request.args.get('id_vendedor', type=int)
    if id_vendedor:
        if current_user.email == 'admin@admin.com' or current_user.id == id_vendedor:
            query = query.join(VendedorComissao).filter(VendedorComissao.id_vendedor == id_vendedor)
        else:
            return jsonify({'erro': 'Não autorizado a exportar vendas de outros vendedores'}), 403
    elif current_user.email != 'admin@admin.com': # Se não for admin, só vê as próprias vendas
        query = query.join(VendedorComissao).filter(VendedorComissao.id_vendedor == current_user.id)

    # Filtro por data
    data_inicio = request.args.get('data_inicio')
    data_fim = request.args.get('data_fim')
    if data_inicio:
        query = query.filter(Venda.data_venda >= datetime.strptime(data_inicio, '%Y-%m-%d').date())
    if data_fim:
        query = query.filter(Venda.data_venda <= datetime.strptime(data_fim, '%Y-%m-%d').date())

    # Filtro por status de comissão
    comissao_paga = request.args.get('comissao_paga')
    if comissao_paga is not None:
        comissao_paga = comissao_paga.lower() == 'true'
        query = query.filter(Venda.comissao_paga == comissao_paga)

    vendas = query.all()

    # Criar arquivo CSV
    csv_data = [["ID", "CPF Cliente", "Nome Cliente", "Data Venda", "Valor Venda", "Valor Comissão", "Comissão Paga", "Vendedor", "Tabela Comissão", "Usuário Cadastro"]]
    for venda in vendas:
        csv_data.append([
            venda.id,
            venda.cpf_cliente,
            venda.nome_cliente,
            venda.data_venda.strftime('%Y-%m-%d'),
            venda.valor_venda,
            venda.valor_comissao,
            "Sim" if venda.comissao_paga else "Não",
            venda.vendedor_comissao.vendedor.nome_vendedor if venda.vendedor_comissao and venda.vendedor_comissao.vendedor else "N/A",
            venda.vendedor_comissao.nome_tabela if venda.vendedor_comissao else "N/A",
            venda.usuario_cadastro
        ])
    
    # Salvar em um arquivo temporário
    temp_dir = os.path.join(current_app.root_path, 'temp')
    os.makedirs(temp_dir, exist_ok=True)
    csv_file_path = os.path.join(temp_dir, 'vendas_exportadas.csv')
    
    with open(csv_file_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerows(csv_data)

    return send_file(
        csv_file_path,
        mimetype='text/csv',
        as_attachment=True,
        download_name='vendas_exportadas.csv'
    )
```

### `sistema-vendas/src/routes/vendedor.py`
```python



from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.vendedor import Vendedor
from src.routes.auth import token_required

vendedor_bp = Blueprint(\'vendedor\', __name__)

@vendedor_bp.route(\'/vendedores\', methods=['GET'])
@token_required
def get_vendedores(current_user):
    if current_user.email != 'admin@admin.com':
        return jsonify({'erro': 'Não autorizado'}), 403
    vendedores = Vendedor.query.all()
    return jsonify([vendedor.to_dict() for vendedor in vendedores]), 200

@vendedor_bp.route(\'/vendedores\', methods=['POST'])
@token_required
def add_vendedor(current_user):
    if current_user.email != 'admin@admin.com':
        return jsonify({'erro': 'Não autorizado'}), 403
    data = request.get_json()
    nome_vendedor = data.get('nome_vendedor')
    email = data.get('email')
    senha = data.get('senha')

    if not nome_vendedor:
        return jsonify({'erro': 'Nome do vendedor é obrigatório'}), 400

    if Vendedor.query.filter_by(nome_vendedor=nome_vendedor).first():
        return jsonify({'erro': 'Nome de vendedor já existe'}), 409

    if email and Vendedor.query.filter_by(email=email).first():
        return jsonify({'erro': 'Email já cadastrado'}), 409

    novo_vendedor = Vendedor(nome_vendedor=nome_vendedor, email=email, senha=senha)
    db.session.add(novo_vendedor)
    db.session.commit()
    return jsonify(novo_vendedor.to_dict()), 201

@vendedor_bp.route(\'/vendedores/<int:id>\', methods=['PUT'])
@token_required
def update_vendedor(current_user, id):
    if current_user.email != 'admin@admin.com':
        return jsonify({'erro': 'Não autorizado'}), 403
    vendedor = Vendedor.query.get(id)
    if not vendedor:
        return jsonify({'erro': 'Vendedor não encontrado'}), 404

    data = request.get_json()
    novo_nome = data.get('nome_vendedor', vendedor.nome_vendedor)
    novo_email = data.get('email', vendedor.email)
    nova_senha = data.get('senha')

    if novo_nome != vendedor.nome_vendedor and Vendedor.query.filter_by(nome_vendedor=novo_nome).first():
        return jsonify({'erro': 'Nome de vendedor já existe'}), 409

    if novo_email and novo_email != vendedor.email and Vendedor.query.filter_by(email=novo_email).first():
        return jsonify({'erro': 'Email já cadastrado'}), 409

    vendedor.nome_vendedor = novo_nome
    vendedor.email = novo_email
    if nova_senha:
        vendedor.set_senha(nova_senha)

    db.session.commit()
    return jsonify(vendedor.to_dict()), 200

@vendedor_bp.route(\'/vendedores/<int:id>\', methods=['DELETE'])
@token_required
def delete_vendedor(current_user, id):
    if current_user.email != 'admin@admin.com':
        return jsonify({'erro': 'Não autorizado'}), 403
    vendedor = Vendedor.query.get(id)
    if not vendedor:
        return jsonify({'erro': 'Vendedor não encontrado'}), 404

    db.session.delete(vendedor)
    db.session.commit()
    return jsonify({'mensagem': 'Vendedor excluído com sucesso'}), 200
```

### `sistema-vendas/src/routes/vendedor_comissao.py`
```python



from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.vendedor_comissao import VendedorComissao
from src.models.vendedor import Vendedor
from src.routes.auth import token_required

vendedor_comissao_bp = Blueprint(\'vendedor_comissao\', __name__)

@vendedor_comissao_bp.route(\'/vendedores/<int:id_vendedor>/comissoes\', methods=[\'GET\'])
@token_required
def get_comissoes_vendedor(current_user, id_vendedor):
    if current_user.email != \'admin@admin.com\' and current_user.id != id_vendedor:
        return jsonify({\'erro\': \'Não autorizado\'}), 403
    
    vendedor = Vendedor.query.get(id_vendedor)
    if not vendedor:
        return jsonify({\'erro\': \'Vendedor não encontrado\'}), 404
    
    return jsonify([comissao.to_dict() for comissao in vendedor.comissoes]), 200

@vendedor_comissao_bp.route(\'/vendedores/<int:id_vendedor>/comissoes\', methods=[\'POST\'])
@token_required
def add_comissao_vendedor(current_user, id_vendedor):
    if current_user.email != \'admin@admin.com\':
        return jsonify({\'erro\': \'Não autorizado\'}), 403
    
    vendedor = Vendedor.query.get(id_vendedor)
    if not vendedor:
        return jsonify({\'erro\': \'Vendedor não encontrado\'}), 404

    data = request.get_json()
    nome_tabela = data.get(\'nome_tabela\')
    porcentagem_comissao = data.get(\'porcentagem_comissao\')

    if not nome_tabela or porcentagem_comissao is None:
        return jsonify({\'erro\': \'Nome da tabela e porcentagem de comissão são obrigatórios\'}), 400

    if VendedorComissao.query.filter_by(id_vendedor=id_vendedor, nome_tabela=nome_tabela).first():
        return jsonify({\'erro\': \'Já existe uma tabela de comissão com este nome para este vendedor\'}), 409

    nova_comissao = VendedorComissao(
        id_vendedor=id_vendedor,
        nome_tabela=nome_tabela,
        porcentagem_comissao=porcentagem_comissao
    )
    db.session.add(nova_comissao)
    db.session.commit()
    return jsonify(nova_comissao.to_dict()), 201

@vendedor_comissao_bp.route(\'/vendedores/comissoes/<int:id>\', methods=[\'PUT\'])
@token_required
def update_comissao_vendedor(current_user, id):
    if current_user.email != \'admin@admin.com\':
        return jsonify({\'erro\': \'Não autorizado\'}), 403
    
    comissao = VendedorComissao.query.get(id)
    if not comissao:
        return jsonify({\'erro\': \'Configuração de comissão não encontrada\'}), 404

    data = request.get_json()
    novo_nome_tabela = data.get(\'nome_tabela\', comissao.nome_tabela)
    nova_porcentagem = data.get(\'porcentagem_comissao\', comissao.porcentagem_comissao)

    if novo_nome_tabela != comissao.nome_tabela and \
       VendedorComissao.query.filter_by(id_vendedor=comissao.id_vendedor, nome_tabela=novo_nome_tabela).first():
        return jsonify({\'erro\': \'Já existe uma tabela de comissão com este nome para este vendedor\'}), 409

    comissao.nome_tabela = novo_nome_tabela
    comissao.porcentagem_comissao = nova_porcentagem
    db.session.commit()
    return jsonify(comissao.to_dict()), 200

@vendedor_comissao_bp.route(\'/vendedores/comissoes/<int:id>\', methods=[\'DELETE\'])
@token_required
def delete_comissao_vendedor(current_user, id):
    if current_user.email != \'admin@admin.com\':
        return jsonify({\'erro\': \'Não autorizado\'}), 403
    
    comissao = VendedorComissao.query.get(id)
    if not comissao:
        return jsonify({\'erro\': \'Configuração de comissão não encontrada\'}), 404

    db.session.delete(comissao)
    db.session.commit()
    return jsonify({\'mensagem\': \'Configuração de comissão excluída com sucesso\'}), 200

@vendedor_comissao_bp.route(\'/vendedores/comissoes\', methods=[\'GET\'])
@token_required
def get_all_comissoes(current_user):
    if current_user.email != \'admin@admin.com\':
        return jsonify({\'erro\': \'Não autorizado\'}), 403
    
    comissoes = VendedorComissao.query.all()
    return jsonify([comissao.to_dict() for comissao in comissoes]), 200
```

## ⚛️ Código do Frontend (React/JavaScript)

### `sistema-vendas-frontend/index.html`
```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sistema de Vendas e Comissões</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### `sistema-vendas-frontend/vite.config.js`
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

### `sistema-vendas-frontend/src/main.jsx`
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### `sistema-vendas-frontend/src/App.jsx`
```javascript
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Toaster } from 'sonner';
import VendasTab from './components/VendasTab';
import VendedoresTab from './components/VendedoresTab';
import RelatoriosTab from './components/RelatoriosTab';
import ImportacaoTab from './components/ImportacaoTab';
import LoginTab from './components/LoginTab';
import VendedorDashboard from './components/VendedorDashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [idVendedorLogado, setIdVendedorLogado] = useState(localStorage.getItem('id_vendedor_logado'));
  const [nomeVendedorLogado, setNomeVendedorLogado] = useState(localStorage.getItem('nome_vendedor_logado'));

  const handleLogin = (newToken, id, nome) => {
    setToken(newToken);
    setIdVendedorLogado(id);
    setNomeVendedorLogado(nome);
    localStorage.setItem('token', newToken);
    localStorage.setItem('id_vendedor_logado', id);
    localStorage.setItem('nome_vendedor_logado', nome);
  };

  const handleLogout = () => {
    setToken(null);
    setIdVendedorLogado(null);
    setNomeVendedorLogado(null);
    localStorage.removeItem('token');
    localStorage.removeItem('id_vendedor_logado');
    localStorage.removeItem('nome_vendedor_logado');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Sistema de Vendas e Comissões</h1>
      </header>

      <main className="container mx-auto bg-white p-6 rounded-lg shadow-md">
        <Tabs defaultValue="vendas" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="vendas">Vendas</TabsTrigger>
            <TabsTrigger value="vendedores">Vendedores</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
            <TabsTrigger value="importacao">Importação</TabsTrigger>
            <TabsTrigger value="login">{token ? 'Dashboard' : 'Login'}</TabsTrigger>
          </TabsList>

          <TabsContent value="vendas" className="mt-6">
            <VendasTab token={token} idVendedorLogado={idVendedorLogado} nomeVendedorLogado={nomeVendedorLogado} />
          </TabsContent>

          <TabsContent value="vendedores" className="mt-6">
            <VendedoresTab token={token} />
          </TabsContent>

          <TabsContent value="relatorios" className="mt-6">
            <RelatoriosTab token={token} idVendedorLogado={idVendedorLogado} nomeVendedorLogado={nomeVendedorLogado} />
          </TabsContent>

          <TabsContent value="importacao" className="mt-6">
            <ImportacaoTab token={token} />
          </TabsContent>

          <TabsContent value="login" className="mt-6">
            {token ? (
              <VendedorDashboard token={token} idVendedorLogado={idVendedorLogado} nomeVendedorLogado={nomeVendedorLogado} onLogout={handleLogout} />
            ) : (
              <LoginTab onLogin={handleLogin} />
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Toaster />
    </div>
  );
}

export default App;
```

### `sistema-vendas-frontend/src/components/LoginTab.jsx`
```javascript
import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { toast } from 'sonner';

function LoginTab({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Login realizado com sucesso!');
        onLogin(data.token, data.id_vendedor, data.nome_vendedor);
      } else {
        toast.error(data.erro || 'Erro ao fazer login');
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      toast.error('Erro de rede. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Login do Vendedor</h2>
      <p className="text-gray-600">Entre com suas credenciais para acessar seu dashboard</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="senha">Senha</Label>
          <Input
            id="senha"
            type="password"
            placeholder="Sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
      <p className="text-sm text-gray-500">
        Não tem acesso? Entre em contato com o administrador.
      </p>
    </div>
  );
}

export default LoginTab;
```

### `sistema-vendas-frontend/src/components/VendedorDashboard.jsx`
```javascript
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './ui/table';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function VendedorDashboard({ token, idVendedorLogado, nomeVendedorLogado, onLogout }) {
  const [vendas, setVendas] = useState([]);
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && idVendedorLogado) {
      fetchVendasVendedor();
      fetchRelatorioVendedor();
    }
  }, [token, idVendedorLogado]);

  const fetchVendasVendedor = async () => {
    try {
      const response = await fetch(`/api/vendas?id_vendedor=${idVendedorLogado}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setVendas(data);
      } else {
        toast.error(data.erro || 'Erro ao carregar vendas do vendedor');
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      toast.error('Erro de rede ao carregar vendas.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatorioVendedor = async () => {
    try {
      const response = await fetch(`/api/relatorio/vendas?id_vendedor=${idVendedorLogado}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setRelatorio(data);
      } else {
        toast.error(data.erro || 'Erro ao carregar relatório do vendedor');
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      toast.error('Erro de rede ao carregar relatório.');
    }
  };

  if (loading) {
    return <div className="text-center">Carregando dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard de {nomeVendedorLogado}</h2>
      <Button onClick={onLogout} className="bg-red-500 hover:bg-red-600">Sair</Button>

      {relatorio && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">R$ {relatorio.total_vendas.toFixed(2).replace('.', ',')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Comissão Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">R$ {relatorio.total_comissao.toFixed(2).replace('.', ',')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Comissão Pendente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">R$ {relatorio.comissao_pendente.toFixed(2).replace('.', ',')}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <h3 className="text-xl font-semibold mt-6">Minhas Vendas</h3>
      {vendas.length === 0 ? (
        <p>Nenhuma venda encontrada para este vendedor.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor Venda</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendas.map((venda) => (
                <TableRow key={venda.id}>
                  <TableCell>{venda.nome_cliente}</TableCell>
                  <TableCell>{venda.cpf_cliente}</TableCell>
                  <TableCell>{format(new Date(venda.data_venda), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                  <TableCell>R$ {venda.valor_venda.toFixed(2).replace('.', ',')}</TableCell>
                  <TableCell>R$ {venda.valor_comissao.toFixed(2).replace('.', ',')}</TableCell>
                  <TableCell>{venda.comissao_paga ? 'Paga' : 'Pendente'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default VendedorDashboard;
```

### `sistema-vendas-frontend/src/components/ImportacaoTab.jsx`
```javascript
import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

function ImportacaoTab({ token }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/importacao/template');
      const data = await response.json();

      if (response.ok) {
        // Trigger the actual download
        window.location.href = data.download_url;
        toast.success('Template baixado com sucesso!');
      } else {
        toast.error(data.erro || 'Erro ao baixar template');
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      toast.error('Erro de rede ao baixar template.');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Por favor, selecione um arquivo para upload.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('arquivo', selectedFile);

    try {
      const response = await fetch('/api/importacao/vendas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Importação concluída!', {
          description: `Vendas criadas: ${data.vendas_criadas.length}. Erros: ${data.erros.length}`,
        });
        if (data.erros.length > 0) {
          data.erros.forEach(error => toast.error(error));
        }
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(data.erro || 'Erro na importação');
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      toast.error('Erro de rede. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Importação de Vendas</h2>
      <p className="text-gray-600">Importe vendas em lote através de planilha Excel</p>

      <div className="space-y-2">
        <h3 className="text-xl font-medium">Template Excel</h3>
        <p className="text-gray-500">Baixe o template com o formato correto para importação</p>
        <Button onClick={handleDownloadTemplate} className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          <span>Baixar Template</span>
        </Button>
        <p className="text-sm text-gray-500">O template inclui exemplos e instruções para preenchimento correto</p>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-medium">Upload do Arquivo</h3>
        <p className="text-gray-500">Selecione ou arraste o arquivo Excel com as vendas</p>
        <div className="flex items-center space-x-2">
          <Label htmlFor="file-upload" className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            Choose File
          </Label>
          <Input
            id="file-upload"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />
          <span className="text-gray-700">{selectedFile ? selectedFile.name : 'No file chosen'}</span>
        </div>
        <p className="text-sm text-gray-500">Clique ou arraste o arquivo aqui</p>
        <p className="text-sm text-gray-500">Formatos aceitos: .xlsx, .xls (máximo 10MB)</p>
        <Button onClick={handleUpload} disabled={!selectedFile || loading} className="w-full">
          {loading ? 'Importando...' : 'Importar Vendas'}
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-medium">Instruções de Uso</h3>
        <ol className="list-decimal list-inside space-y-1 text-gray-700">
          <li>Baixe o template Excel clicando no botão acima</li>
          <li>Preencha os dados das vendas seguindo o formato do template</li>
          <li>Certifique-se de que os vendedores e tabelas de comissão existem no sistema</li>
          <li>Faça upload do arquivo preenchido</li>
          <li>Aguarde o processamento e verifique os resultados</li>
        </ol>
      </div>
    </div>
  );
}

export default ImportacaoTab;
```

### `sistema-vendas-frontend/src/components/RelatoriosTab.jsx`
```javascript
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './ui/table';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function RelatoriosTab({ token, idVendedorLogado, nomeVendedorLogado }) {
  const [relatorio, setRelatorio] = useState(null);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [comissaoPaga, setComissaoPaga] = useState(''); // 'true', 'false', ''
  const [vendedores, setVendedores] = useState([]);
  const [vendedorSelecionado, setVendedorSelecionado] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatorio();
    fetchVendedores();
  }, [token]);

  const fetchRelatorio = async () => {
    setLoading(true);
    let url = '/api/relatorio/vendas';
    const params = new URLSearchParams();

    if (dataInicio) params.append('data_inicio', dataInicio);
    if (dataFim) params.append('data_fim', dataFim);
    if (comissaoPaga !== '') params.append('comissao_paga', comissaoPaga);
    if (vendedorSelecionado) params.append('id_vendedor', vendedorSelecionado);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setRelatorio(data);
      } else {
        toast.error(data.erro || 'Erro ao carregar relatório');
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      toast.error('Erro de rede ao carregar relatório.');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendedores = async () => {
    try {
      const response = await fetch('/api/vendedores', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setVendedores(data);
      } else {
        toast.error(data.erro || 'Erro ao carregar vendedores');
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      toast.error('Erro de rede ao carregar vendedores.');
    }
  };

  const handleExport = async () => {
    let url = '/api/vendas/exportar';
    const params = new URLSearchParams();

    if (dataInicio) params.append('data_inicio', dataInicio);
    if (dataFim) params.append('data_fim', dataFim);
    if (comissaoPaga !== '') params.append('comissao_paga', comissaoPaga);
    if (vendedorSelecionado) params.append('id_vendedor', vendedorSelecionado);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vendas_exportadas.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success('Vendas exportadas com sucesso!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.erro || 'Erro ao exportar vendas');
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      toast.error('Erro de rede ao exportar vendas.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Relatórios de Vendas</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dataInicio">Data Início</Label>
          <Input type="date" id="dataInicio" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dataFim">Data Fim</Label>
          <Input type="date" id="dataFim" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="comissaoPaga">Status Comissão</Label>
          <select
            id="comissaoPaga"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={comissaoPaga}
            onChange={(e) => setComissaoPaga(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="true">Paga</option>
            <option value="false">Pendente</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="vendedor">Vendedor</Label>
          <select
            id="vendedor"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={vendedorSelecionado}
            onChange={(e) => setVendedorSelecionado(e.target.value)}
          >
            <option value="">Todos</option>
            {vendedores.map((vendedor) => (
              <option key={vendedor.id} value={vendedor.id}>
                {vendedor.nome_vendedor}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex space-x-2 mt-4">
        <Button onClick={fetchRelatorio} disabled={loading}>Filtrar</Button>
        <Button onClick={handleExport} disabled={loading} variant="outline">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text-open"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 10H8"/><path d="M16 14H8"/><path d="M16 18H8"/></svg>
          <span className="ml-2">Exportar CSV</span>
        </Button>
      </div>

      {loading ? (
        <div className="text-center">Carregando relatório...</div>
      ) : relatorio ? (
        <div className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">R$ {relatorio.total_vendas.toFixed(2).replace('.', ',')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total de Comissão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">R$ {relatorio.total_comissao.toFixed(2).replace('.', ',')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Comissão Pendente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">R$ {relatorio.comissao_pendente.toFixed(2).replace('.', ',')}</p>
              </CardContent>
            </Card>
          </div>

          <h3 className="text-xl font-semibold mt-6">Detalhes das Vendas</h3>
          {relatorio.detalhes_vendas.length === 0 ? (
            <p>Nenhuma venda encontrada com os filtros aplicados.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor Venda</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Tabela Comissão</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatorio.detalhes_vendas.map((venda) => (
                    <TableRow key={venda.id}>
                      <TableCell>{venda.nome_cliente}</TableCell>
                      <TableCell>{venda.cpf_cliente}</TableCell>
                      <TableCell>{format(new Date(venda.data_venda), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                      <TableCell>R$ {venda.valor_venda.toFixed(2).replace('.', ',')}</TableCell>
                      <TableCell>{venda.nome_vendedor}</TableCell>
                      <TableCell>{venda.nome_tabela_comissao}</TableCell>
                      <TableCell>R$ {venda.valor_comissao.toFixed(2).replace('.', ',')}</TableCell>
                      <TableCell>{venda.comissao_paga ? 'Paga' : 'Pendente'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center">Use os filtros acima para gerar o relatório.</p>
      )}
    </div>
  );
}

export default RelatoriosTab;
```

### `sistema-vendas-frontend/src/components/VendasTab.jsx`
```javascript
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function VendasTab({ token, idVendedorLogado, nomeVendedorLogado }) {
  const [vendas, setVendas] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [comissoesVendedor, setComissoesVendedor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVenda, setCurrentVenda] = useState(null);

  // Formulário de Venda
  const [cpfCliente, setCpfCliente] = useState('');
  const [nomeCliente, setNomeCliente] = useState('');
  const [dataVenda, setDataVenda] = useState('');
  const [valorVenda, setValorVenda] = useState('');
  const [selectedVendedorId, setSelectedVendedorId] = useState('');
  const [selectedComissaoId, setSelectedComissaoId] = useState('');
  const [comissaoPaga, setComissaoPaga] = useState(false);

  useEffect(() => {
    fetchVendas();
    fetchVendedores();
  }, [token]);

  useEffect(() => {
    if (selectedVendedorId) {
      fetchComissoesVendedor(selectedVendedorId);
    } else {
      setComissoesVendedor([]);
      setSelectedComissaoId('');
    }
  }, [selectedVendedorId]);

  const fetchVendas = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/vendas', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setVendas(data);
      } else {
        toast.error(data.erro || 'Erro ao carregar vendas');
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      toast.error('Erro de rede ao carregar vendas.');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendedores = async () => {
    try {
      const response = await fetch('/api/vendedores', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setVendedores(data);
      } else {
        toast.error(data.erro || 'Erro ao carregar vendedores');
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      toast.error('Erro de rede ao carregar vendedores.');
    }
  };

  const fetchComissoesVendedor = async (vendedorId) => {
    try {
      const response = await fetch(`/api/vendedores/${vendedorId}/comissoes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setComissoesVendedor(data);
        if (data.length > 0) {
          setSelectedComissaoId(data[0].id); // Seleciona a primeira comissão por padrão
        }
      } else {
        toast.error(data.erro || 'Erro ao carregar comissões do vendedor');
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      toast.error('Erro de rede ao carregar comissões.');
    }
  };

  const handleOpenModal = (venda = null) => {
    setCurrentVenda(venda);
    if (venda) {
      setCpfCliente(venda.cpf_cliente);
      setNomeCliente(venda.nome_cliente);
      setDataVenda(venda.data_venda);
      setValorVenda(venda.valor_venda);
      setSelectedVendedorId(venda.vendedor_comissao.id_vendedor);
      setSelectedComissaoId(venda.id_vendedor_comissao);
      setComissaoPaga(venda.comissao_paga);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentVenda(null);
    resetForm();
  };

  const resetForm = () => {
    setCpfCliente('');
    setNomeCliente('');
    setDataVenda('');
    setValorVenda('');
    setSelectedVendedorId('');
    setSelectedComissaoId('');
    setComissaoPaga(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const vendaData = {
      cpf_cliente: cpfCliente,
      nome_cliente: nomeCliente,
      data_venda: dataVenda,
      valor_venda: parseFloat(valorVenda),
      id_vendedor_comissao: parseInt(selectedComissaoId),
      comissao_paga: comissaoPaga,
    };

    try {
      const method = currentVenda ? 'PUT' : 'POST';
      const url = currentVenda ? `/api/vendas/${currentVenda.id}` : '/api/vendas';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(vendaData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Venda ${currentVenda ? 'atualizada' : 'adicionada'} com sucesso!`);
        fetchVendas();
        handleCloseModal();
      } else {
        toast.error(data.erro || `Erro ao ${currentVenda ? 'atualizar' : 'adicionar'} venda`);
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      toast.error('Erro de rede. Tente novamente.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta venda?')) return;

    try {
      const response = await fetch(`/api/vendas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Venda excluída com sucesso!');
        fetchVendas();
      } else {
        const data = await response.json();
        toast.error(data.erro || 'Erro ao excluir venda');
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      toast.error('Erro de rede ao excluir venda.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Gerencie todas as vendas e comissões</h2>
        <Button onClick={() => handleOpenModal()}>Nova Venda</Button>
      </div>

      {loading ? (
        <div className="text-center">Carregando vendas...</div>
      ) : vendas.length === 0 ? (
        <p>Nenhuma venda cadastrada ainda.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor Venda</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Tabela Comissão</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendas.map((venda) => (
                <TableRow key={venda.id}>
                  <TableCell>{venda.nome_cliente}</TableCell>
                  <TableCell>{venda.cpf_cliente}</TableCell>
                  <TableCell>{format(new Date(venda.data_venda), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                  <TableCell>R$ {venda.valor_venda.toFixed(2).replace('.', ',')}</TableCell>
                  <TableCell>{venda.nome_vendedor}</TableCell>
                  <TableCell>{venda.nome_tabela_comissao}</TableCell>
                  <TableCell>R$ {venda.valor_comissao.toFixed(2).replace('.', ',')}</TableCell>
                  <TableCell>{venda.comissao_paga ? 'Paga' : 'Pendente'}</TableCell>
                  <TableCell className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenModal(venda)}>Editar</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(venda.id)}>Excluir</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentVenda ? 'Editar Venda' : 'Nova Venda'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cpfCliente" className="text-right">CPF Cliente</Label>
              <Input id="cpfCliente" value={cpfCliente} onChange={(e) => setCpfCliente(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nomeCliente" className="text-right">Nome Cliente</Label>
              <Input id="nomeCliente" value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dataVenda" className="text-right">Data Venda</Label>
              <Input type="date" id="dataVenda" value={dataVenda} onChange={(e) => setDataVenda(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="valorVenda" className="text-right">Valor Venda</Label>
              <Input type="number" id="valorVenda" value={valorVenda} onChange={(e) => setValorVenda(e.target.value)} className="col-span-3" step="0.01" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vendedor" className="text-right">Vendedor</Label>
              <select
                id="vendedor"
                value={selectedVendedorId}
                onChange={(e) => setSelectedVendedorId(e.target.value)}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Selecione um vendedor</option>
                {vendedores.map((vendedor) => (
                  <option key={vendedor.id} value={vendedor.id}>
                    {vendedor.nome_vendedor}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tabelaComissao" className="text-right">Tabela Comissão</Label>
              <select
                id="tabelaComissao"
                value={selectedComissaoId}
                onChange={(e) => setSelectedComissaoId(e.target.value)}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                disabled={comissoesVendedor.length === 0}
              >
                <option value="">Selecione uma tabela</option>
                {comissoesVendedor.map((comissao) => (
                  <option key={comissao.id} value={comissao.id}>
                    {comissao.nome_tabela} ({comissao.porcentagem_comissao}%)
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="comissaoPaga" className="text-right">Comissão Paga</Label>
              <input
                type="checkbox"
                id="comissaoPaga"
                checked={comissaoPaga}
                onChange={(e) => setComissaoPaga(e.target.checked)}
                className="col-span-3 h-5 w-5"
              />
            </div>
            <DialogFooter>
              <Button type="submit">{currentVenda ? 'Salvar Alterações' : 'Adicionar Venda'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default VendasTab;
```

### `sistema-vendas-frontend/src/components/VendedoresTab.jsx`
```javascript
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { toast } from 'sonner';

function VendedoresTab({ token }) {
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isComissaoModalOpen, setIsComissaoModalOpen] = useState(false);
  const [currentVendedor, setCurrentVendedor] = useState(null);
  const [currentComissao, setCurrentComissao] = useState(null);

  // Formulário de Vendedor
  const [nomeVendedor, setNomeVendedor] = useState('');
  const [emailVendedor, setEmailVendedor] = useState('');
  const [senhaVendedor, setSenhaVendedor] = useState('');

  // Formulário de Comissão
  const [nomeTabelaComissao, setNomeTabelaComissao] = useState('');
  const [porcentagemComissao, setPorcentagemComissao] = useState('');

  useEffect(() => {
    fetchVendedores();
  }, [token]);

  const fetchVendedores = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/vendedores', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setVendedores(data);
      } else {
        toast.error(data.erro || 'Erro ao carregar vendedores');
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      toast.error('Erro de rede ao carregar vendedores.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenVendedorModal = (vendedor = null) => {
    setCurrentVendedor(vendedor);
    if (vendedor) {
      setNomeVendedor(vendedor.nome_vendedor);
      setEmailVendedor(vendedor.email || '');
      setSenhaVendedor(''); // Senha nunca é preenchida para edição
    } else {
      resetVendedorForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseVendedorModal = () => {
    setIsModalOpen(false);
    setCurrentVendedor(null);
    resetVendedorForm();
  };

  const resetVendedorForm = () => {
    setNomeVendedor('');
    setEmailVendedor('');
    setSenhaVendedor('');
  };

  const handleOpenComissaoModal = (vendedor, comissao = null) => {
    setCurrentVendedor(vendedor);
    setCurrentComissao(comissao);
    if (comissao) {
      setNomeTabelaComissao(comissao.nome_tabela);
      setPorcentagemComissao(comissao.porcentagem_comissao);
    } else {
      resetComissaoForm();
    }
    setIsComissaoModalOpen(true);
  };

  const handleCloseComissaoModal = () => {
    setIsComissaoModalOpen(false);
    setCurrentVendedor(null);
    setCurrentComissao(null);
    resetComissaoForm();
  };

  const resetComissaoForm = () => {
    setNomeTabelaComissao('');
    setPorcentagemComissao('');
  };

  const handleSubmitVendedor = async (e) => {
    e.preventDefault();
    const vendedorData = {
      nome_vendedor: nomeVendedor,
      email: emailVendedor || null,
      senha: senhaVendedor || null,
    };

    try {
      const method = currentVendedor ? 'PUT' : 'POST';
      const url = currentVendedor ? `/api/vendedores/${currentVendedor.id}` : '/api/vendedores';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(vendedorData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Vendedor ${currentVendedor ? 'atualizado' : 'adicionado'} com sucesso!`);
        fetchVendedores();
        handleCloseVendedorModal();
      } else {
        toast.error(data.erro || `Erro ao ${currentVendedor ? 'atualizar' : 'adicionar'} vendedor`);
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      toast.error('Erro de rede. Tente novamente.');
    }
  };

  const handleSubmitComissao = async (e) => {
    e.preventDefault();
    const comissaoData = {
      nome_tabela: nomeTabelaComissao,
      porcentagem_comissao: parseFloat(porcentagemComissao),
    };

    try {
      const method = currentComissao ? 'PUT' : 'POST';
      const url = currentComissao
        ? `/api/vendedores/comissoes/${currentComissao.id}`
        : `/api/vendedores/${currentVendedor.id}/comissoes`;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(comissaoData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Comissão ${currentComissao ? 'atualizada' : 'adicionada'} com sucesso!`);
        fetchVendedores();
        handleCloseComissaoModal();
      } else {
        toast.error(data.erro || `Erro ao ${currentComissao ? 'atualizar' : 'adicionar'} comissão`);
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      toast.error('Erro de rede. Tente novamente.');
    }
  };

  const handleDeleteVendedor = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este vendedor e todas as suas comissões?')) return;

    try {
      const response = await fetch(`/api/vendedores/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Vendedor excluído com sucesso!');
        fetchVendedores();
      } else {
        const data = await response.json();
        toast.error(data.erro || 'Erro ao excluir vendedor');
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      toast.error('Erro de rede ao excluir vendedor.');
    }
  };

  const handleDeleteComissao = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta configuração de comissão?')) return;

    try {
      const response = await fetch(`/api/vendedores/comissoes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Configuração de comissão excluída com sucesso!');
        fetchVendedores();
      } else {
        const data = await response.json();
        toast.error(data.erro || 'Erro ao excluir configuração de comissão');
      }
    } catch (error) {
      console.error('Erro de rede:', error);
      toast.error('Erro de rede ao excluir configuração de comissão.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Gerencie vendedores e suas porcentagens de comissão</h2>
        <Button onClick={() => handleOpenVendedorModal()}>Novo Vendedor</Button>
      </div>

      {loading ? (
        <div className="text-center">Carregando vendedores...</div>
      ) : vendedores.length === 0 ? (
        <p>Nenhum vendedor cadastrado ainda.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Vendedor</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Comissão (%)</TableHead>
                <TableHead>Tabela/Campanha</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendedores.map((vendedor) => (
                <TableRow key={vendedor.id}>
                  <TableCell className="font-medium">{vendedor.nome_vendedor}</TableCell>
                  <TableCell>{vendedor.email || 'N/A'}</TableCell>
                  <TableCell>
                    {vendedor.comissoes.length > 0 ? (
                      vendedor.comissoes.map(c => (
                        <div key={c.id}>{c.porcentagem_comissao}%</div>
                      ))
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {vendedor.comissoes.length > 0 ? (
                      vendedor.comissoes.map(c => (
                        <div key={c.id}>{c.nome_tabela}</div>
                      ))
                    ) : '-'}
                  </TableCell>
                  <TableCell className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenVendedorModal(vendedor)}>Editar</Button>
                    <Button variant="secondary" size="sm" onClick={() => handleOpenComissaoModal(vendedor)}>Add Comissão</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteVendedor(vendedor.id)}>Excluir</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal para Adicionar/Editar Vendedor */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentVendedor ? 'Editar Vendedor' : 'Novo Vendedor'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitVendedor} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nomeVendedor" className="text-right">Nome</Label>
              <Input id="nomeVendedor" value={nomeVendedor} onChange={(e) => setNomeVendedor(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="emailVendedor" className="text-right">Email</Label>
              <Input id="emailVendedor" type="email" value={emailVendedor} onChange={(e) => setEmailVendedor(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="senhaVendedor" className="text-right">Senha</Label>
              <Input id="senhaVendedor" type="password" value={senhaVendedor} onChange={(e) => setSenhaVendedor(e.target.value)} className="col-span-3" placeholder={currentVendedor ? 'Deixe em branco para não alterar' : ''} required={!currentVendedor} />
            </div>
            <DialogFooter>
              <Button type="submit">{currentVendedor ? 'Salvar Alterações' : 'Adicionar Vendedor'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para Adicionar/Editar Comissão */}
      <Dialog open={isComissaoModalOpen} onOpenChange={setIsComissaoModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentComissao ? 'Editar Comissão' : `Adicionar Comissão para ${currentVendedor?.nome_vendedor}`}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitComissao} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nomeTabelaComissao" className="text-right">Nome Tabela</Label>
              <Input id="nomeTabelaComissao" value={nomeTabelaComissao} onChange={(e) => setNomeTabelaComissao(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="porcentagemComissao" className="text-right">Porcentagem (%)</Label>
              <Input type="number" id="porcentagemComissao" value={porcentagemComissao} onChange={(e) => setPorcentagemComissao(e.target.value)} className="col-span-3" step="0.01" required />
            </div>
            <DialogFooter>
              <Button type="submit">{currentComissao ? 'Salvar Alterações' : 'Adicionar Comissão'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default VendedoresTab;
```

---

## 🛠️ Scripts de Migração (Python)

### `sistema-vendas/migrate_data.py`
```python
#!/usr/bin/env python3
"""
Script para migrar dados de vendedores e vendas para a nova estrutura de comissões.
Assume que o banco de dados já foi criado com os modelos antigos.
"""
import os
from datetime import datetime

# Configurações para importar o Flask app e o DB
os.environ['FLASK_APP'] = 'src/main.py'
from src.main import app, db
from src.models.vendedor import Vendedor
from src.models.venda import Venda
from src.models.vendedor_comissao import VendedorComissao

with app.app_context():
    print("Iniciando migração de dados...")

    # 1. Adicionar colunas de email e senha_hash ao modelo Vendedor se não existirem
    # Isso é feito automaticamente pelo SQLAlchemy ao criar/atualizar tabelas,
    # mas se o banco já existe, precisamos de uma migração manual ou ferramenta como Alembic.
    # Para simplificar, vamos assumir que as colunas já foram adicionadas ou que o banco é novo.
    # Se você tiver um banco de dados existente sem essas colunas, precisará de uma ferramenta de migração de DB (ex: Alembic).
    # db.create_all() # Isso criaria as tabelas e colunas que não existem

    # 2. Criar a tabela VendedorComissao se não existir
    db.create_all()

    # 3. Migrar dados de comissão de Vendedor para VendedorComissao
    # Esta parte é mais complexa e depende de como os dados antigos foram armazenados.
    # No nosso caso, o modelo Vendedor original tinha porcentagem_comissao e nome_tabela.
    # Vamos iterar sobre os vendedores existentes e criar uma entrada em VendedorComissao.

    # Primeiro, vamos garantir que não haja dados duplicados da migração anterior
    # VendedorComissao.query.delete()
    # db.session.commit()

    vendedores_antigos = Vendedor.query.all()
    for vendedor in vendedores_antigos:
        # Verifica se o vendedor já tem alguma comissão associada
        if not vendedor.comissoes:
            # Se o vendedor não tem comissões, cria uma padrão
            # Assume que vendedores antigos tinham uma comissão padrão de 0% ou um valor a ser definido
            # Aqui, estamos criando uma comissão 'Padrão' com 0% para evitar erros de NOT NULL
            print(f"Criando comissão padrão para o vendedor: {vendedor.nome_vendedor}")
            comissao_padrao = VendedorComissao(
                id_vendedor=vendedor.id,
                nome_tabela="Padrão",
                porcentagem_comissao=0.0 # Ou a porcentagem padrão que você usava
            )
            db.session.add(comissao_padrao)
            db.session.commit()

    print("Migração de dados concluída (para comissões padrão). Verifique o banco de dados.")

    # Exemplo de como você poderia atualizar vendas existentes para usar id_vendedor_comissao
    # Isso exigiria que você soubesse qual 'nome_tabela' cada venda antiga usava.
    # Para este projeto, estamos assumindo que novas vendas usarão a nova estrutura.
    # Se você tiver vendas antigas que precisam ser associadas a uma VendedorComissao específica,
    # precisaria de lógica adicional aqui.

    # Exemplo: Associar vendas antigas à comissão padrão do vendedor
    # for venda in Venda.query.all():
    #     if not venda.id_vendedor_comissao:
    #         vendedor = Vendedor.query.get(venda.id_vendedor) # Se você tinha id_vendedor na Venda
    #         if vendedor and vendedor.comissoes:
    #             venda.id_vendedor_comissao = vendedor.comissoes[0].id # Associa à primeira comissão encontrada
    #             db.session.add(venda)
    # db.session.commit()

    print("Migração de dados concluída.")
```

### `sistema-vendas/migrate_auth.py`
```python
#!/usr/bin/env python3
"""
Script para adicionar colunas de autenticação (email, senha_hash) ao modelo Vendedor.
Este script é necessário se você já tem um banco de dados existente e precisa adicionar essas colunas.
"""
import os
from sqlalchemy import text

# Configurações para importar o Flask app e o DB
os.environ['FLASK_APP'] = 'src/main.py'
from src.main import app, db

with app.app_context():
    print("Iniciando migração de autenticação...")

    connection = db.engine.connect()
    trans = connection.begin()

    try:
        # Adicionar coluna 'email' se não existir
        try:
            connection.execute(text("ALTER TABLE vendedor ADD COLUMN email VARCHAR(120) UNIQUE;"))
            print("Coluna 'email' adicionada à tabela 'vendedor'.")
        except Exception as e:
            if "duplicate column name" in str(e):
                print("Coluna 'email' já existe.")
            else:
                raise e

        # Adicionar coluna 'senha_hash' se não existir
        try:
            connection.execute(text("ALTER TABLE vendedor ADD COLUMN senha_hash VARCHAR(128);"))
            print("Coluna 'senha_hash' adicionada à tabela 'vendedor'.")
        except Exception as e:
            if "duplicate column name" in str(e):
                print("Coluna 'senha_hash' já existe.")
            else:
                raise e

        trans.commit()
        print("Migração de autenticação concluída com sucesso.")

    except Exception as e:
        trans.rollback()
        print(f"Erro durante a migração de autenticação: {e}")

    finally:
        connection.close()
```

### `sistema-vendas/migrate_database.py`
```python
#!/usr/bin/env python3
"""
Script para recriar o banco de dados do zero.
CUIDADO: Isso apagará todos os dados existentes no banco!
Use apenas em desenvolvimento ou se tiver certeza de que deseja apagar os dados.
"""
import os

# Configurações para importar o Flask app e o DB
os.environ['FLASK_APP'] = 'src/main.py'
from src.main import app, db

# Importar todos os modelos para que o SQLAlchemy os conheça
from src.models.vendedor import Vendedor
from src.models.vendedor_comissao import VendedorComissao
from src.models.venda import Venda
from src.models.user import db as user_db # Importar db novamente para garantir que todos os modelos sejam registrados

with app.app_context():
    print("Apagando banco de dados existente (se houver)...")
    db.drop_all()
    print("Criando novas tabelas no banco de dados...")
    db.create_all()
    print("Banco de dados recriado com sucesso.")

    # Opcional: Adicionar dados iniciais de exemplo
    print("Adicionando dados de exemplo...")

    # Vendedor Admin (para gerenciar o sistema)
    admin_vendedor = Vendedor(nome_vendedor="Admin", email="admin@admin.com", senha="admin123")
    db.session.add(admin_vendedor)
    db.session.commit()

    # Vendedor João Silva
    joao_silva = Vendedor(nome_vendedor="João Silva")
    db.session.add(joao_silva)
    db.session.commit()

    joao_comissao_padrao = VendedorComissao(
        id_vendedor=joao_silva.id,
        nome_tabela="Padrão",
        porcentagem_comissao=5.0
    )
    db.session.add(joao_comissao_padrao)
    db.session.commit()

    # Vendedora Ana Silva (com login)
    ana_silva = Vendedor(nome_vendedor="Ana Silva", email="ana@vendas.com", senha="123456")
    db.session.add(ana_silva)
    db.session.commit()

    ana_comissao_gold = VendedorComissao(
        id_vendedor=ana_silva.id,
        nome_tabela="Gold",
        porcentagem_comissao=11.5
    )
    ana_comissao_platinum = VendedorComissao(
        id_vendedor=ana_silva.id,
        nome_tabela="Platinum",
        porcentagem_comissao=15.0
    )
    db.session.add(ana_comissao_gold)
    db.session.add(ana_comissao_platinum)
    db.session.commit()

    # Vendas de exemplo
    venda1 = Venda(
        cpf_cliente="123.456.789-00",
        nome_cliente="Maria Santos",
        data_venda=datetime.strptime("2025-06-29", "%Y-%m-%d").date(),
        valor_venda=1000.00,
        id_vendedor_comissao=joao_comissao_padrao.id,
        usuario_cadastro="Admin"
    )
    db.session.add(venda1)
    db.session.commit()

    venda2 = Venda(
        cpf_cliente="987.654.321-00",
        nome_cliente="Carlos Oliveira",
        data_venda=datetime.strptime("2025-06-29", "%Y-%m-%d").date(),
        valor_venda=2000.00,
        id_vendedor_comissao=ana_comissao_gold.id,
        usuario_cadastro="Admin"
    )
    db.session.add(venda2)
    db.session.commit()

    print("Dados de exemplo adicionados com sucesso.")
```

### `sistema-vendas/requirements.txt`
```
Flask==2.3.2
Flask-SQLAlchemy==3.0.3
Flask-Cors==4.0.0
SQLAlchemy==2.0.19
PyJWT==2.8.0
openpyxl==3.1.2
```

---

## 🎨 Estilização (Tailwind CSS)

### `sistema-vendas-frontend/src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### `sistema-vendas-frontend/tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

### `sistema-vendas-frontend/postcss.config.js`
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## 📦 Dependências do Frontend (package.json)

### `sistema-vendas-frontend/package.json`
```json
{
  "name": "sistema-vendas-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "lucide-react": "^0.378.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "sonner": "^1.4.41",
    "tailwind-merge": "^2.3.0",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-plugin-react": "^7.34.1",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.6",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "vite": "^5.2.0"
  }
}
```

---

## 📚 Componentes UI (Shadcn/ui)

Os componentes UI (`sistema-vendas-frontend/src/components/ui/`) são gerados pelo Shadcn/ui e incluem:

- `button.jsx`
- `card.jsx`
- `dialog.jsx`
- `input.jsx`
- `label.jsx`
- `table.jsx`
- `tabs.jsx`

Estes arquivos são extensos e seguem um padrão de código gerado. Para obtê-los, você pode inicializar um projeto Shadcn/ui e adicionar os componentes necessários. Eles são baseados em Radix UI e Tailwind CSS.

---

Espero que este compilado seja útil para você!

