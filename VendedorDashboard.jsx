import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  LogOut, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Filter,
  User,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

export default function VendedorDashboard({ vendedor, token, onLogout }) {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({
    data_inicio: '',
    data_fim: '',
    comissao_paga: ''
  })

  const carregarDashboard = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio)
      if (filtros.data_fim) params.append('data_fim', filtros.data_fim)
      if (filtros.comissao_paga) params.append('comissao_paga', filtros.comissao_paga)

      const response = await fetch(`/api/auth/dashboard?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else if (response.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.')
        onLogout()
      } else {
        const errorData = await response.json()
        toast.error(errorData.erro || 'Erro ao carregar dashboard')
      }
    } catch (error) {
      toast.error('Erro de conexão')
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDashboard()
  }, [])

  const aplicarFiltros = () => {
    carregarDashboard()
  }

  const limparFiltros = () => {
    setFiltros({
      data_inicio: '',
      data_fim: '',
      comissao_paga: ''
    })
    setTimeout(() => {
      carregarDashboard()
    }, 100)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <Alert>
        <AlertDescription>
          Erro ao carregar dados do dashboard. Tente novamente.
        </AlertDescription>
      </Alert>
    )
  }

  const { estatisticas, vendas } = dashboardData

  return (
    <div className="space-y-6">
      {/* Header do Dashboard */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Dashboard do Vendedor</h2>
            <p className="text-gray-600">Bem-vindo, {vendedor.nome_vendedor}!</p>
          </div>
        </div>
        <Button variant="outline" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.total_vendas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(estatisticas.total_valor_vendas)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões Pagas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatarMoeda(estatisticas.comissoes_pagas)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões Pendentes</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatarMoeda(estatisticas.comissoes_pendentes)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="data_inicio">Data Início</Label>
              <Input
                id="data_inicio"
                type="date"
                value={filtros.data_inicio}
                onChange={(e) => setFiltros(prev => ({ ...prev, data_inicio: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="data_fim">Data Fim</Label>
              <Input
                id="data_fim"
                type="date"
                value={filtros.data_fim}
                onChange={(e) => setFiltros(prev => ({ ...prev, data_fim: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="comissao_paga">Status Comissão</Label>
              <Select value={filtros.comissao_paga} onValueChange={(value) => setFiltros(prev => ({ ...prev, comissao_paga: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="true">Pagas</SelectItem>
                  <SelectItem value="false">Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end space-x-2">
              <Button onClick={aplicarFiltros}>Aplicar</Button>
              <Button variant="outline" onClick={limparFiltros}>Limpar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Vendas */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Vendas</CardTitle>
          <CardDescription>
            Histórico de todas as suas vendas e comissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vendas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma venda encontrada com os filtros aplicados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor Venda</TableHead>
                    <TableHead>Tabela</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendas.map((venda) => (
                    <TableRow key={venda.id}>
                      <TableCell className="font-medium">{venda.nome_cliente}</TableCell>
                      <TableCell>{venda.cpf_cliente}</TableCell>
                      <TableCell>{formatarData(venda.data_venda)}</TableCell>
                      <TableCell>{formatarMoeda(venda.valor_venda)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{venda.nome_tabela}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{formatarMoeda(venda.valor_comissao)}</TableCell>
                      <TableCell>
                        <Badge variant={venda.comissao_paga ? "default" : "secondary"}>
                          {venda.comissao_paga ? "Paga" : "Pendente"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

