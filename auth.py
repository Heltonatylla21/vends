from flask import Blueprint, request, jsonify
from functools import wraps
from src.models.user import db
from src.models.vendedor import Vendedor
from src.models.venda import Venda
from src.models.vendedor_comissao import VendedorComissao

auth_bp = Blueprint('auth', __name__)

def token_required(f):
    """Decorator para proteger rotas que requerem autenticação"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Verificar se o token está no header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'erro': 'Token malformado'}), 401
        
        if not token:
            return jsonify({'erro': 'Token de acesso necessário'}), 401
        
        try:
            # Verificar e decodificar o token
            payload = Vendedor.verificar_token(token)
            if not payload:
                return jsonify({'erro': 'Token inválido ou expirado'}), 401
            
            # Buscar o vendedor
            vendedor_atual = Vendedor.query.get(payload['vendedor_id'])
            if not vendedor_atual or not vendedor_atual.ativo:
                return jsonify({'erro': 'Vendedor não encontrado ou inativo'}), 401
            
        except Exception as e:
            return jsonify({'erro': 'Token inválido'}), 401
        
        # Passar o vendedor atual para a função
        return f(vendedor_atual, *args, **kwargs)
    
    return decorated

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    """Login do vendedor"""
    try:
        dados = request.get_json()
        
        if not dados.get('email') or not dados.get('senha'):
            return jsonify({'erro': 'Email e senha são obrigatórios'}), 400
        
        # Buscar vendedor por email
        vendedor = Vendedor.query.filter_by(email=dados['email']).first()
        
        if not vendedor or not vendedor.verificar_senha(dados['senha']):
            return jsonify({'erro': 'Email ou senha incorretos'}), 401
        
        if not vendedor.ativo:
            return jsonify({'erro': 'Conta desativada. Entre em contato com o administrador'}), 401
        
        # Gerar token
        token = vendedor.gerar_token()
        
        return jsonify({
            'token': token,
            'vendedor': vendedor.to_dict_publico(),
            'mensagem': 'Login realizado com sucesso'
        }), 200
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@auth_bp.route('/auth/registro', methods=['POST'])
def registro():
    """Registro de novo vendedor (apenas admin pode criar)"""
    try:
        dados = request.get_json()
        
        # Validação dos campos obrigatórios
        campos_obrigatorios = ['nome_vendedor', 'email', 'senha']
        for campo in campos_obrigatorios:
            if not dados.get(campo):
                return jsonify({'erro': f'{campo} é obrigatório'}), 400
        
        # Verificar se email já existe
        vendedor_existente = Vendedor.query.filter_by(email=dados['email']).first()
        if vendedor_existente:
            return jsonify({'erro': 'Email já cadastrado'}), 400
        
        # Criar novo vendedor
        vendedor = Vendedor(
            nome_vendedor=dados['nome_vendedor'],
            email=dados['email']
        )
        vendedor.definir_senha(dados['senha'])
        
        db.session.add(vendedor)
        db.session.commit()
        
        return jsonify({
            'vendedor': vendedor.to_dict_publico(),
            'mensagem': 'Vendedor cadastrado com sucesso'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500

@auth_bp.route('/auth/perfil', methods=['GET'])
@token_required
def perfil(vendedor_atual):
    """Obter perfil do vendedor logado"""
    try:
        return jsonify(vendedor_atual.to_dict()), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@auth_bp.route('/auth/dashboard', methods=['GET'])
@token_required
def dashboard(vendedor_atual):
    """Dashboard do vendedor com suas vendas e comissões"""
    try:
        # Buscar vendas do vendedor através das configurações de comissão
        vendas_query = db.session.query(Venda).join(VendedorComissao).filter(
            VendedorComissao.id_vendedor == vendedor_atual.id
        )
        
        # Filtros opcionais
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')
        comissao_paga = request.args.get('comissao_paga')
        
        if data_inicio:
            from datetime import datetime
            data_inicio_obj = datetime.strptime(data_inicio, '%Y-%m-%d').date()
            vendas_query = vendas_query.filter(Venda.data_venda >= data_inicio_obj)
        
        if data_fim:
            from datetime import datetime
            data_fim_obj = datetime.strptime(data_fim, '%Y-%m-%d').date()
            vendas_query = vendas_query.filter(Venda.data_venda <= data_fim_obj)
        
        if comissao_paga is not None:
            paga = comissao_paga.lower() == 'true'
            vendas_query = vendas_query.filter(Venda.comissao_paga == paga)
        
        vendas = vendas_query.all()
        
        # Calcular estatísticas
        total_vendas = len(vendas)
        total_valor_vendas = sum(venda.valor_venda for venda in vendas)
        total_comissoes = sum(venda.valor_comissao for venda in vendas)
        comissoes_pagas = sum(venda.valor_comissao for venda in vendas if venda.comissao_paga)
        comissoes_pendentes = total_comissoes - comissoes_pagas
        
        return jsonify({
            'vendedor': vendedor_atual.to_dict_publico(),
            'vendas': [venda.to_dict() for venda in vendas],
            'estatisticas': {
                'total_vendas': total_vendas,
                'total_valor_vendas': total_valor_vendas,
                'total_comissoes': total_comissoes,
                'comissoes_pagas': comissoes_pagas,
                'comissoes_pendentes': comissoes_pendentes
            }
        }), 200
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@auth_bp.route('/auth/alterar-senha', methods=['PUT'])
@token_required
def alterar_senha(vendedor_atual):
    """Alterar senha do vendedor logado"""
    try:
        dados = request.get_json()
        
        if not dados.get('senha_atual') or not dados.get('nova_senha'):
            return jsonify({'erro': 'Senha atual e nova senha são obrigatórias'}), 400
        
        # Verificar senha atual
        if not vendedor_atual.verificar_senha(dados['senha_atual']):
            return jsonify({'erro': 'Senha atual incorreta'}), 400
        
        # Definir nova senha
        vendedor_atual.definir_senha(dados['nova_senha'])
        db.session.commit()
        
        return jsonify({'mensagem': 'Senha alterada com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500

