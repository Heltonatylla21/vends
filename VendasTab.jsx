import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Plus, Search } from 'lucide-react'
import { toast } from 'sonner'

const VendasTab = () => {
  const [vendas, setVendas] = useState([])
  const [carregando, setCarregando] = useState(false)

  // Carregar vendas ao montar o componente
  useEffect(() => {
    carregarVendas()
  }, [])

  const carregarVendas = async () => {
    try {
      setCarregando(true)
      const response = await fetch('/api/vendas')
      const data = await response.json()
      setVendas(data)
    } catch (error) {
      console.error('Erro ao carregar vendas:', error)
      toast.error('Erro ao carregar vendas')
    } finally {
      setCarregando(false)
    }
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

  return (
    <div className="space-y-6">
      {/* Lista de Vendas */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Vendas</CardTitle>
              <CardDescription>Gerencie todas as vendas e comissões</CardDescription>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Venda
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
                ) : vendas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Nenhuma venda encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  vendas.map((venda) => (
                    <TableRow key={venda.id}>
                      <TableCell className="font-medium">{venda.nome_cliente}</TableCell>
                      <TableCell>{venda.cpf_cliente}</TableCell>
                      <TableCell>{formatarData(venda.data_venda)}</TableCell>
                      <TableCell>{formatarMoeda(venda.valor_venda)}</TableCell>
                      <TableCell>{venda.nome_vendedor}</TableCell>
                      <TableCell>{formatarMoeda(venda.valor_comissao)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${venda.comissao_paga ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {venda.comissao_paga ? "Paga" : "Pendente"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VendasTab

