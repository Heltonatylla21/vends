from datetime import datetime
from src.models.user import db

class Venda(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cpf_cliente = db.Column(db.String(14), nullable=False)  # CPF com máscara XXX.XXX.XXX-XX
    nome_cliente = db.Column(db.String(100), nullable=False)
    data_venda = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    valor_venda = db.Column(db.Float, nullable=False)
    valor_comissao = db.Column(db.Float, nullable=False, default=0.0)
    comissao_paga = db.Column(db.Boolean, nullable=False, default=False)
    id_vendedor_comissao = db.Column(db.Integer, db.ForeignKey('vendedor_comissao.id'), nullable=False)
    usuario_cadastro = db.Column(db.String(100), nullable=True)  # Para controle de quem cadastrou
    
    def __repr__(self):
        return f'<Venda {self.id} - {self.nome_cliente}>'

    def calcular_comissao(self):
        """Calcula o valor da comissão baseado na porcentagem da configuração de comissão"""
        if self.vendedor_comissao:
            self.valor_comissao = self.valor_venda * (self.vendedor_comissao.porcentagem_comissao / 100)
        return self.valor_comissao

    def to_dict(self):
        return {
            'id': self.id,
            'cpf_cliente': self.cpf_cliente,
            'nome_cliente': self.nome_cliente,
            'data_venda': self.data_venda.isoformat() if self.data_venda else None,
            'valor_venda': self.valor_venda,
            'valor_comissao': self.valor_comissao,
            'comissao_paga': self.comissao_paga,
            'id_vendedor_comissao': self.id_vendedor_comissao,
            'nome_vendedor': self.vendedor_comissao.vendedor.nome_vendedor if self.vendedor_comissao and self.vendedor_comissao.vendedor else None,
            'nome_tabela': self.vendedor_comissao.nome_tabela if self.vendedor_comissao else None,
            'porcentagem_comissao': self.vendedor_comissao.porcentagem_comissao if self.vendedor_comissao else None,
            'usuario_cadastro': self.usuario_cadastro
        }

