import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Download, TrendingUp, DollarSign, Users, ShoppingCart, Filter } from 'lucide-react'
import { toast } from 'sonner'

const RelatoriosTab = () => {
  const [relatorio, setRelatorio] = useState(null)
  const [vendedores, setVendedores] = useState([])
  const [filtros, setFiltros] = useState({
    nome_vendedor: '',
    data_inicio: '',
    data_fim: '',
    comissao_paga: ''
  })
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    carregarRelatorio()
    carregarVendedores()
  }, [])

  const carregarRelatorio = async () => {
    try {
      setCarregando(true)
      const params = new URLSearchParams()
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      
      const response = await fetch(`/api/relatorio/vendas?${params}`)
      const data = await response.json()
      setRelatorio(data)
    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
      toast.error('Erro ao carregar relatório')
    } finally {
      setCarregando(false)
    }
  }

  const carregarVendedores = async () => {
    try {
      const response = await fetch('/api/vendedores')
      const data = await response.json()
      setVendedores(data)
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error)
    }
  }

  const exportarCSV = () => {
    if (!relatorio || !relatorio.vendas.length) {
      toast.error('Nenhum dado para exportar')
      return
    }

    const headers = ['Cliente', 'CPF', 'Data', 'Valor Venda', 'Vendedor', 'Comissão', 'Status']
    const csvContent = [
      headers.join(','),
      ...relatorio.vendas.map(venda => [
        venda.nome_cliente,
        venda.cpf_cliente,
        formatarData(venda.data_venda),
        venda.valor_venda,
        venda.nome_vendedor,
        venda.valor_comissao,
        venda.comissao_paga ? 'Paga' : 'Pendente'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio_vendas_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Relatório exportado com sucesso!')
  }

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  // Preparar dados para gráficos
  const dadosVendedores = vendedores.map(vendedor => {
    const vendasVendedor = relatorio?.vendas.filter(v => v.id_vendedor === vendedor.id) || []
    return {
      nome: vendedor.nome_vendedor,
      vendas: vendasVendedor.length,
      valor: vendasVendedor.reduce((acc, v) => acc + v.valor_venda, 0),
      comissao: vendasVendedor.reduce((acc, v) => acc + v.valor_comissao, 0)
    }
  }).filter(d => d.vendas > 0)

  const dadosStatus = relatorio ? [
    { name: 'Comissões Pagas', value: relatorio.resumo.comissoes_pagas, color: '#10b981' },
    { name: 'Comissões Pendentes', value: relatorio.resumo.comissoes_pendentes, color: '#f59e0b' }
  ] : []

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="nome_vendedor">Nome do Vendedor</Label>
              <Select value={filtros.nome_vendedor} onValueChange={(value) => setFiltros({...filtros, nome_vendedor: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os vendedores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os vendedores</SelectItem>
                  {vendedores.map((vendedor) => (
                    <SelectItem key={vendedor.id} value={vendedor.nome_vendedor}>
                      {vendedor.nome_vendedor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="data_inicio">Data Início</Label>
              <Input
                id="data_inicio"
                type="date"
                value={filtros.data_inicio}
                onChange={(e) => setFiltros({...filtros, data_inicio: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="data_fim">Data Fim</Label>
              <Input
                id="data_fim"
                type="date"
                value={filtros.data_fim}
                onChange={(e) => setFiltros({...filtros, data_fim: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="comissao_paga">Status Comissão</Label>
              <Select value={filtros.comissao_paga} onValueChange={(value) => setFiltros({...filtros, comissao_paga: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="true">Paga</SelectItem>
                  <SelectItem value="false">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={carregarRelatorio} className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Gerar Relatório
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setFiltros({nome_vendedor: '', data_inicio: '', data_fim: '', comissao_paga: ''})
                carregarRelatorio()
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      {relatorio && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{relatorio.resumo.total_vendas}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatarMoeda(relatorio.resumo.total_valor_vendas)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comissões Pagas</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatarMoeda(relatorio.resumo.comissoes_pagas)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comissões Pendentes</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatarMoeda(relatorio.resumo.comissoes_pendentes)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Vendedor</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosVendedores}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatarMoeda(value)} />
                    <Bar dataKey="valor" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status das Comissões</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dadosStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${formatarMoeda(value)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dadosStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatarMoeda(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Vendas */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Detalhes das Vendas</CardTitle>
                  <CardDescription>Lista completa das vendas no período selecionado</CardDescription>
                </div>
                <Button onClick={exportarCSV} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor Venda</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Comissão</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {carregando ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : relatorio.vendas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Nenhuma venda encontrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      relatorio.vendas.map((venda) => (
                        <TableRow key={venda.id}>
                          <TableCell className="font-medium">{venda.nome_cliente}</TableCell>
                          <TableCell>{venda.cpf_cliente}</TableCell>
                          <TableCell>{formatarData(venda.data_venda)}</TableCell>
                          <TableCell>{formatarMoeda(venda.valor_venda)}</TableCell>
                          <TableCell>{venda.nome_vendedor}</TableCell>
                          <TableCell>{formatarMoeda(venda.valor_comissao)}</TableCell>
                          <TableCell>
                            <Badge variant={venda.comissao_paga ? "default" : "secondary"}>
                              {venda.comissao_paga ? "Paga" : "Pendente"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default RelatoriosTab

