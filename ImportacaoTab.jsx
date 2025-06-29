import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

export default function ImportacaoTab() {
  const [arquivo, setArquivo] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [downloadingTemplate, setDownloadingTemplate] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Verificar se é arquivo Excel
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ]
      
      if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
        toast.error('Por favor, selecione um arquivo Excel (.xlsx ou .xls)')
        return
      }
      
      setArquivo(file)
      setResultado(null)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      const event = { target: { files: [file] } }
      handleFileSelect(event)
    }
  }

  const downloadTemplate = async () => {
    setDownloadingTemplate(true)
    try {
      // Primeiro gerar o template
      const response = await fetch('/api/importacao/template', {
        method: 'GET'
      })

      if (response.ok) {
        // Depois fazer download
        const downloadResponse = await fetch('/api/importacao/template/download')
        
        if (downloadResponse.ok) {
          const blob = await downloadResponse.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.style.display = 'none'
          a.href = url
          a.download = 'template_vendas.xlsx'
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
          
          toast.success('Template baixado com sucesso!')
        } else {
          throw new Error('Erro ao baixar template')
        }
      } else {
        throw new Error('Erro ao gerar template')
      }
    } catch (error) {
      toast.error('Erro ao baixar template: ' + error.message)
      console.error('Erro ao baixar template:', error)
    } finally {
      setDownloadingTemplate(false)
    }
  }

  const uploadFile = async () => {
    if (!arquivo) {
      toast.error('Selecione um arquivo primeiro')
      return
    }

    setUploading(true)
    setResultado(null)

    try {
      const formData = new FormData()
      formData.append('arquivo', arquivo)

      const response = await fetch('/api/importacao/vendas', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setResultado(data)
        toast.success(`Importação concluída! ${data.vendas_criadas} vendas criadas.`)
      } else {
        toast.error(data.erro || 'Erro na importação')
        setResultado({ erro: data.erro })
      }
    } catch (error) {
      toast.error('Erro de conexão durante a importação')
      console.error('Erro na importação:', error)
      setResultado({ erro: 'Erro de conexão' })
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setArquivo(null)
    setResultado(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Importação de Vendas</h2>
        <p className="text-gray-600">Importe vendas em lote através de planilha Excel</p>
      </div>

      {/* Download do Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="mr-2 h-5 w-5" />
            Template Excel
          </CardTitle>
          <CardDescription>
            Baixe o template com o formato correto para importação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={downloadTemplate} 
            disabled={downloadingTemplate}
            variant="outline"
          >
            {downloadingTemplate ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando template...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Baixar Template
              </>
            )}
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            O template inclui exemplos e instruções para preenchimento correto
          </p>
        </CardContent>
      </Card>

      {/* Upload de Arquivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Upload do Arquivo
          </CardTitle>
          <CardDescription>
            Selecione ou arraste o arquivo Excel com as vendas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {arquivo ? (
              <div className="space-y-2">
                <FileSpreadsheet className="h-12 w-12 text-green-600 mx-auto" />
                <p className="font-medium">{arquivo.name}</p>
                <p className="text-sm text-gray-500">
                  {(arquivo.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className="flex justify-center space-x-2 mt-4">
                  <Button onClick={uploadFile} disabled={uploading}>
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Importar Vendas
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={resetForm} disabled={uploading}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="text-lg font-medium">Clique ou arraste o arquivo aqui</p>
                <p className="text-sm text-gray-500">
                  Formatos aceitos: .xlsx, .xls (máximo 10MB)
                </p>
              </div>
            )}
          </div>

          {uploading && (
            <div className="mt-4">
              <Progress value={50} className="w-full" />
              <p className="text-sm text-center mt-2">Processando arquivo...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultado da Importação */}
      {resultado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {resultado.erro ? (
                <XCircle className="mr-2 h-5 w-5 text-red-600" />
              ) : (
                <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
              )}
              Resultado da Importação
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resultado.erro ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{resultado.erro}</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {resultado.vendas_criadas}
                    </div>
                    <div className="text-sm text-green-700">Vendas Criadas</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {resultado.erros_encontrados}
                    </div>
                    <div className="text-sm text-red-700">Erros Encontrados</div>
                  </div>
                </div>

                {resultado.detalhes?.vendas?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-green-700">Vendas Criadas com Sucesso:</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {resultado.detalhes.vendas.map((venda, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-sm">
                            Linha {venda.linha}: {venda.cliente} - R$ {venda.valor.toFixed(2)}
                          </span>
                          <Badge variant="outline" className="text-green-700">
                            {venda.vendedor} - {venda.tabela}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {resultado.detalhes?.erros?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-red-700">Erros Encontrados:</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {resultado.detalhes.erros.map((erro, index) => (
                        <div key={index} className="p-2 bg-red-50 rounded text-sm text-red-700">
                          {erro}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={resetForm} className="w-full">
                  Importar Novo Arquivo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Instruções de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>1.</strong> Baixe o template Excel clicando no botão acima</p>
            <p><strong>2.</strong> Preencha os dados das vendas seguindo o formato do template</p>
            <p><strong>3.</strong> Certifique-se de que os vendedores e tabelas de comissão existem no sistema</p>
            <p><strong>4.</strong> Faça upload do arquivo preenchido</p>
            <p><strong>5.</strong> Aguarde o processamento e verifique os resultados</p>
          </div>
          
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Vendas com erros não serão importadas. 
              Corrija os erros no arquivo e importe novamente apenas as linhas com problema.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

