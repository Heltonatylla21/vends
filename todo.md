## Tarefas do Projeto

### Fase 1: Planejamento e estruturação do sistema
- [ ] Definir a estrutura do banco de dados
- [ ] Escolher as tecnologias a serem utilizadas (Flask para backend, React para frontend)
- [ ] Esboçar as rotas da API

### Fase 2: Desenvolvimento do backend Flask
- [x] Configurar o ambiente Flask
- [x] Criar o modelo de dados (SQLAlchemy)
- [x] Implementar as rotas da API para vendas (CRUD)
- [x] Implementar as rotas da API para configuração de comissão (CRUD)
- [x] Adicionar lógica para cálculo automático de comissão
- [x] Implementar filtros por nome do vendedor, data da venda e status da comissão
- [x] Implementar controle de usuário logado (autenticação/autorização)
- [x] Testar todas as APIs do backend

### Fase 3: Desenvolvimento do frontend React
- [x] Configurar o ambiente React
- [x] Criar componentes para cadastro e consulta de vendas
- [x] Criar componentes para configuração de comissão
- [x] Implementar a interface de usuário para filtros
- [x] Integrar com as APIs do backend
- [x] Criar componente de relatórios com gráficos
- [x] Implementar funcionalidade de exportação CSV

### Fase 4: Integração e testes do sistema
- [x] Realizar testes de integração entre frontend e backend
- [x] Testar todas as funcionalidades
- [x] Corrigir bugs
- [x] Configurar proxy no Vite para comunicação com backend
- [x] Testar carregamento de dados de vendas
- [x] Testar carregamento de dados de vendedores

### Fase 5: Deploy e entrega do sistema
- [x] Preparar o ambiente para deploy
- [x] Realizar o deploy do backend
- [x] Realizar o deploy do frontend
- [x] Fornecer instruções de uso e acesso ao sistema
- [x] Testar sistema em produção



### Estrutura do Banco de Dados (SQLite com SQLAlchemy):

**Tabela `Vendedor`:**
- `id` (Integer, Primary Key)
- `nome_vendedor` (String)

**Tabela `Vendedor_Comissao`:**
- `id` (Integer, Primary Key)
- `id_vendedor` (Integer, Foreign Key para `Vendedor`)
- `nome_tabela` (String)
- `porcentagem_comissao` (Float)

**Tabela `Venda`:**
- `id` (Integer, Primary Key)
- `cpf_cliente` (String, nullable=False)
- `nome_cliente` (String, nullable=False)
- `data_venda` (Date, nullable=False)
- `valor_venda` (Float, nullable=False)
- `valor_comissao` (Float, nullable=False)
- `comissao_paga` (Boolean, nullable=False)
- `id_vendedor_comissao` (Integer, Foreign Key para `Vendedor_Comissao`)
- `usuario_cadastro` (String)


### Rotas da API (Flask):

**Vendas:**
- `GET /vendas`: Listar todas as vendas (com filtros opcionais)
- `GET /vendas/<id>`: Obter detalhes de uma venda específica
- `POST /vendas`: Cadastrar nova venda
- `PUT /vendas/<id>`: Atualizar venda existente
- `DELETE /vendas/<id>`: Excluir venda

**Vendedores:**
- `GET /vendedores`: Listar todos os vendedores
- `GET /vendedores/<id>`: Obter detalhes de um vendedor específico
- `POST /vendedores`: Cadastrar novo vendedor
- `PUT /vendedores/<id>`: Atualizar vendedor existente
- `DELETE /vendedores/<id>`: Excluir vendedor

**Vendedor_Comissao (Nova):**
- `GET /vendedores/<id_vendedor>/comissoes`: Listar configurações de comissão de um vendedor
- `POST /vendedores/<id_vendedor>/comissoes`: Adicionar nova configuração de comissão para um vendedor
- `PUT /vendedores/comissoes/<id_comissao>`: Atualizar configuração de comissão
- `DELETE /vendedores/comissoes/<id_comissao>`: Excluir configuração de comissão

**Relatórios:**
- `GET /relatorio/vendas`: Gerar relatório de vendas com totalizadores

### Fase 7: Implementar Autenticação e Autorização para Vendedores (Backend)
- [ ] Criar modelo de Usuário/Vendedor para autenticação
- [ ] Implementar rotas de registro e login
- [ ] Gerar e validar tokens JWT para autenticação
- [ ] Proteger rotas da API com autenticação
- [ ] Associar vendas e comissões ao usuário logado

### Fase 8: Desenvolver Interface de Login e Dashboard do Vendedor (Frontend)
- [ ] Criar tela de login
- [ ] Implementar autenticação no frontend
- [ ] Desenvolver dashboard para o vendedor visualizar suas vendas e comissões
- [ ] Adaptar componentes existentes para exibir dados do vendedor logado

### Fase 9: Implementar Importação de Vendas em Lote por Excel (Backend)
- [ ] Criar rota para upload de arquivo Excel
- [ ] Processar arquivo Excel e extrair dados de vendas
- [ ] Validar dados da planilha
- [ ] Inserir vendas em lote no banco de dados

### Fase 10: Desenvolver Interface de Importação de Excel (Frontend)
- [ ] Criar tela para upload de arquivo Excel
- [ ] Implementar lógica de upload e feedback para o usuário
- [ ] Exibir resultados da importação (sucesso/erro)

### Fase 11: Testes Finais e Deploy da Versão Atualizada
- [ ] Realizar testes completos de todas as novas funcionalidades
- [ ] Otimizar performance
- [ ] Fazer deploy do backend e frontend atualizados
- [ ] Fornecer documentação atualizada

