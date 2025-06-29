from src.models.user import db

class VendedorComissao(db.Model):
    __tablename__ = 'vendedor_comissao'
    
    id = db.Column(db.Integer, primary_key=True)
    id_vendedor = db.Column(db.Integer, db.ForeignKey('vendedor.id'), nullable=False)
    nome_tabela = db.Column(db.String(100), nullable=False)
    porcentagem_comissao = db.Column(db.Float, nullable=False)
    
    # Relacionamento com vendas
    vendas = db.relationship('Venda', backref='vendedor_comissao', lazy=True)

    def __repr__(self):
        return f'<VendedorComissao {self.nome_tabela} - {self.porcentagem_comissao}%>'

    def to_dict(self):
        return {
            'id': self.id,
            'id_vendedor': self.id_vendedor,
            'nome_vendedor': self.vendedor.nome_vendedor if self.vendedor else None,
            'nome_tabela': self.nome_tabela,
            'porcentagem_comissao': self.porcentagem_comissao
        }

