import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Plus, Percent } from 'lucide-react'
import { toast } from 'sonner'

const VendedoresTab = () => {
  const [vendedores, setVendedores] = useState([])
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    carregarVendedores()
  }, [])

  const carregarVendedores = async () => {
    try {
      setCarregando(true)
      const response = await fetch('/api/vendedores')
      const data = await response.json()
      setVendedores(data)
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error)
      toast.error('Erro ao carregar vendedores')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Configuração de Comissões
              </CardTitle>
              <CardDescription>Gerencie vendedores e suas porcentagens de comissão</CardDescription>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Vendedor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Vendedor</TableHead>
                  <TableHead>Comissão (%)</TableHead>
                  <TableHead>Tabela/Campanha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carregando ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : vendedores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      Nenhum vendedor cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  vendedores.map((vendedor) => (
                    <TableRow key={vendedor.id}>
                      <TableCell className="font-medium">{vendedor.nome_vendedor}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                          {vendedor.porcentagem_comissao}%
                        </span>
                      </TableCell>
                      <TableCell>{vendedor.nome_tabela || '-'}</TableCell>
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

export default VendedoresTab

