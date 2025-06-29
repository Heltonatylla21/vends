# Sistema de Vendas e Comissões - Versão Atualizada
## Múltiplas Tabelas de Comissão por Vendedor

## 🎯 Nova Funcionalidade Implementada

O sistema foi atualizado para permitir que **cada vendedor tenha múltiplas configurações de comissão** com diferentes porcentagens e nomes de tabela/campanha.

## 🌐 Acesso ao Sistema Atualizado

**Nova URL do Sistema:** https://g8h3ilc7y65d.manus.space

## ✨ Como Funciona a Nova Estrutura

### Antes (Sistema Antigo)
- 1 vendedor = 1 porcentagem de comissão fixa

### Agora (Sistema Novo)
- 1 vendedor = múltiplas configurações de comissão
- Cada configuração tem:
  - Nome da tabela/campanha (ex: "Gold", "Platinum", "Padrão")
  - Porcentagem específica de comissão

## 📋 Como Começar a Usar o Sistema

### 1. **Cadastrar Vendedores**
1. Acesse a aba "Vendedores"
2. Clique em "Novo Vendedor"
3. Preencha apenas o **nome do vendedor**
4. Clique em "Salvar"

### 2. **Configurar Múltiplas Comissões para um Vendedor**
Exemplo prático com a vendedora Ana:

1. **Primeira configuração (Gold):**
   - Acesse a aba "Vendedores"
   - Clique em "Adicionar Comissão" para Ana
   - Nome da tabela: "Gold"
   - Porcentagem: 11,5%
   - Salvar

2. **Segunda configuração (Platinum):**
   - Clique novamente em "Adicionar Comissão" para Ana
   - Nome da tabela: "Platinum"
   - Porcentagem: 15,0%
   - Salvar

3. **Terceira configuração (Padrão):**
   - Nome da tabela: "Padrão"
   - Porcentagem: 8,0%
   - Salvar

### 3. **Cadastrar Vendas com Tabela Específica**
1. Acesse a aba "Vendas"
2. Clique em "Nova Venda"
3. Preencha os dados do cliente
4. **Selecione o vendedor E a tabela de comissão desejada**
   - Exemplo: Ana Silva - Gold (11,5%)
   - Ou: Ana Silva - Platinum (15,0%)
5. A comissão será calculada automaticamente com a porcentagem correta

## 🔧 Exemplo Prático Já Configurado

O sistema já possui dados de exemplo:

### Vendedores e Configurações:
- **João Silva:**
  - Padrão: 5,0%

- **Ana Silva:**
  - Gold: 11,5%
  - Platinum: 15,0%

### Vendas de Exemplo:
- **Maria Santos** - R$ 1.000,00 (João Silva - Padrão) = **R$ 50,00 comissão**
- **Carlos Oliveira** - R$ 2.000,00 (Ana Silva - Gold) = **R$ 230,00 comissão**

## 🆕 Novas APIs Disponíveis

### Configurações de Comissão
- `GET /api/vendedores/{id}/comissoes` - Listar comissões de um vendedor
- `POST /api/vendedores/{id}/comissoes` - Criar nova configuração de comissão
- `PUT /api/vendedores/comissoes/{id}` - Atualizar configuração
- `DELETE /api/vendedores/comissoes/{id}` - Excluir configuração
- `GET /api/vendedores/comissoes` - Listar todas as configurações

### Exemplo de Uso da API

**Criar configuração Gold para vendedora Ana (ID 2):**
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"nome_tabela": "Gold", "porcentagem_comissao": 11.5}' \
  http://localhost:5000/api/vendedores/2/comissoes
```

**Criar venda usando configuração específica:**
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "cpf_cliente": "987.654.321-00",
    "nome_cliente": "Carlos Oliveira", 
    "valor_venda": 2000.0,
    "id_vendedor_comissao": 2
  }' \
  http://localhost:5000/api/vendas
```

## 💡 Vantagens da Nova Estrutura

1. **Flexibilidade Total:** Cada vendedor pode ter quantas configurações de comissão quiser
2. **Campanhas Específicas:** Diferentes tabelas para diferentes produtos/períodos
3. **Histórico Preservado:** Vendas antigas mantêm suas configurações originais
4. **Cálculo Automático:** Sistema calcula automaticamente com a porcentagem correta
5. **Controle Granular:** Possibilidade de ativar/desativar tabelas específicas

## 🔄 Migração Automática

- Dados existentes foram migrados automaticamente
- Vendedores antigos receberam configuração "Padrão" com suas porcentagens originais
- Vendas existentes foram associadas às configurações corretas
- Backup automático foi criado antes da migração

## 📞 Suporte

O sistema está totalmente funcional e pronto para uso. A nova funcionalidade permite total flexibilidade na gestão de comissões por vendedor.

---

**Sistema atualizado em:** 29/06/2025
**Nova URL:** https://g8h3ilc7y65d.manus.space

