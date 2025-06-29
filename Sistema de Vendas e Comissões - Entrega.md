# Sistema de Vendas e Comissões - Entrega

## 🎯 Resumo do Projeto

Foi desenvolvido um sistema web completo de acompanhamento de vendas e comissões conforme solicitado, com todas as funcionalidades requisitadas e algumas funcionalidades extras.

## 🌐 Acesso ao Sistema

**URL do Sistema:** https://y0h0i3cyz588.manus.space

O sistema está disponível 24/7 e pode ser acessado de qualquer dispositivo com navegador web.

## ✅ Funcionalidades Implementadas

### 1. Cadastro e Consulta de Vendas
- ✅ Cadastro de vendas com todos os campos solicitados:
  - CPF do cliente
  - Nome do cliente
  - Data da venda
  - Valor da venda
  - Valor da comissão (calculado automaticamente)
  - Status da comissão (Paga/Não Paga)
- ✅ Listagem de todas as vendas em formato de tabela
- ✅ Cálculo automático da comissão baseado na porcentagem do vendedor

### 2. Configuração de Comissão
- ✅ Cadastro de vendedores com:
  - Nome do vendedor
  - Porcentagem de comissão
  - Nome da tabela/campanha (opcional)
- ✅ Listagem de todos os vendedores
- ✅ Edição e exclusão de vendedores

### 3. Funcionalidades Extras Implementadas
- ✅ **Filtros avançados** por:
  - Nome do vendedor
  - Data da venda (período)
  - Status da comissão (paga/não paga)
- ✅ **Relatórios com gráficos** mostrando:
  - Vendas por vendedor
  - Status das comissões
  - Totalizadores (total de vendas, valor total, comissões pagas/pendentes)
- ✅ **Exportação em CSV** dos relatórios
- ✅ **Controle de usuário** (campo usuario_cadastro)
- ✅ **Interface moderna e responsiva** com design profissional
- ✅ **Notificações** de sucesso/erro para todas as operações

## 🛠 Tecnologias Utilizadas

### Backend
- **Flask** (Python) - Framework web
- **SQLAlchemy** - ORM para banco de dados
- **SQLite** - Banco de dados
- **Flask-CORS** - Suporte a CORS

### Frontend
- **React** - Framework JavaScript
- **Tailwind CSS** - Framework de CSS
- **shadcn/ui** - Componentes de interface
- **Lucide React** - Ícones
- **Recharts** - Gráficos
- **Sonner** - Notificações

## 📊 Estrutura do Banco de Dados

### Tabela `Vendedor`
- `id` (Integer, Primary Key)
- `nome_vendedor` (String)
- `porcentagem_comissao` (Float)
- `nome_tabela` (String, opcional)

### Tabela `Venda`
- `id` (Integer, Primary Key)
- `cpf_cliente` (String)
- `nome_cliente` (String)
- `data_venda` (Date)
- `valor_venda` (Float)
- `valor_comissao` (Float) - Calculado automaticamente
- `comissao_paga` (Boolean)
- `id_vendedor` (Integer, Foreign Key)
- `usuario_cadastro` (String)

## 🔧 APIs Disponíveis

### Vendedores
- `GET /api/vendedores` - Listar vendedores
- `POST /api/vendedores` - Criar vendedor
- `PUT /api/vendedores/{id}` - Atualizar vendedor
- `DELETE /api/vendedores/{id}` - Excluir vendedor

### Vendas
- `GET /api/vendas` - Listar vendas (com filtros opcionais)
- `POST /api/vendas` - Criar venda
- `PUT /api/vendas/{id}` - Atualizar venda
- `DELETE /api/vendas/{id}` - Excluir venda
- `PUT /api/vendas/{id}/marcar-comissao-paga` - Marcar comissão como paga

### Relatórios
- `GET /api/relatorio/vendas` - Relatório completo com totalizadores

## 📱 Como Usar o Sistema

### 1. Configurar Vendedores
1. Acesse a aba "Vendedores"
2. Clique em "Novo Vendedor"
3. Preencha nome, porcentagem de comissão e tabela (opcional)
4. Clique em "Salvar Vendedor"

### 2. Cadastrar Vendas
1. Acesse a aba "Vendas"
2. Clique em "Nova Venda"
3. Preencha os dados do cliente e selecione o vendedor
4. A comissão será calculada automaticamente
5. Clique em "Salvar Venda"

### 3. Gerenciar Comissões
1. Na aba "Vendas", visualize o status das comissões
2. Clique em "Marcar Paga" para alterar o status da comissão

### 4. Visualizar Relatórios
1. Acesse a aba "Relatórios"
2. Use os filtros para personalizar a visualização
3. Visualize gráficos e totalizadores
4. Exporte os dados em CSV se necessário

## 📈 Dados de Exemplo

O sistema já vem com dados de exemplo para demonstração:
- **Vendedor:** João Silva (5% de comissão)
- **Venda:** Maria Santos - R$ 1.000,00 (Comissão: R$ 50,00)

## 🔒 Segurança e Confiabilidade

- Sistema hospedado em infraestrutura segura
- Banco de dados SQLite para simplicidade e confiabilidade
- Validações de dados no frontend e backend
- Tratamento de erros com mensagens amigáveis

## 📞 Suporte

O sistema foi desenvolvido seguindo as melhores práticas de desenvolvimento web e está pronto para uso em produção. Todas as funcionalidades solicitadas foram implementadas com funcionalidades extras que agregam valor ao sistema.

---

**Sistema desenvolvido pela equipe Manus**
**Data de entrega:** 29/06/2025

