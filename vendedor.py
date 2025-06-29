from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.vendedor import Vendedor

vendedor_bp = Blueprint('vendedor', __name__)

@vendedor_bp.route('/vendedores', methods=['GET'])
def listar_vendedores():
    """Lista todos os vendedores"""
    try:
        vendedores = Vendedor.query.all()
        return jsonify([vendedor.to_dict() for vendedor in vendedores]), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@vendedor_bp.route('/vendedores/<int:id>', methods=['GET'])
def obter_vendedor(id):
    """Obtém um vendedor específico"""
    try:
        vendedor = Vendedor.query.get_or_404(id)
        return jsonify(vendedor.to_dict()), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@vendedor_bp.route('/vendedores', methods=['POST'])
def criar_vendedor():
    """Cria um novo vendedor"""
    try:
        dados = request.get_json()
        
        # Validação dos campos obrigatórios
        if not dados.get('nome_vendedor'):
            return jsonify({'erro': 'Nome do vendedor é obrigatório'}), 400
        
        vendedor = Vendedor(
            nome_vendedor=dados['nome_vendedor']
        )
        
        db.session.add(vendedor)
        db.session.commit()
        
        return jsonify(vendedor.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500

@vendedor_bp.route('/vendedores/<int:id>', methods=['PUT'])
def atualizar_vendedor(id):
    """Atualiza um vendedor existente"""
    try:
        vendedor = Vendedor.query.get_or_404(id)
        dados = request.get_json()
        
        if 'nome_vendedor' in dados:
            vendedor.nome_vendedor = dados['nome_vendedor']
        
        db.session.commit()
        
        return jsonify(vendedor.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500

@vendedor_bp.route('/vendedores/<int:id>', methods=['DELETE'])
def excluir_vendedor(id):
    """Exclui um vendedor"""
    try:
        vendedor = Vendedor.query.get_or_404(id)
        
        # Verificar se há configurações de comissão associadas
        if vendedor.comissoes:
            return jsonify({'erro': 'Não é possível excluir vendedor com configurações de comissão associadas'}), 400
        
        db.session.delete(vendedor)
        db.session.commit()
        
        return jsonify({'mensagem': 'Vendedor excluído com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500

