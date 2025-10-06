import { useState, useEffect } from 'react';
import { X, Save, Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MobileNodeEditorProps {
  node: any;
  onSave: (node: any) => void;
  onClose: () => void;
  onDelete: (nodeId: string) => void;
}

export function MobileNodeEditor({ node, onSave, onClose, onDelete }: MobileNodeEditorProps) {
  const [editedNode, setEditedNode] = useState(node);
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    setEditedNode(node);
  }, [node]);

  const handleSave = () => {
    onSave(editedNode);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este nó?')) {
      onDelete(node.id);
      onClose();
    }
  };

  const addOption = () => {
    if (newOption.trim()) {
      const option = {
        id: `option-${Date.now()}`,
        text: newOption.trim(),
        label: newOption.trim(),
        actionType: 'message',
        targetNodeId: null,
        transferMessage: null,
        waitTime: null
      };

      setEditedNode({
        ...editedNode,
        data: {
          ...editedNode.data,
          options: [...(editedNode.data.options || []), option]
        }
      });
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    const newOptions = editedNode.data.options.filter((_: any, i: number) => i !== index);
    setEditedNode({
      ...editedNode,
      data: {
        ...editedNode.data,
        options: newOptions
      }
    });
  };

  const updateOption = (index: number, field: string, value: string) => {
    const newOptions = [...editedNode.data.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setEditedNode({
      ...editedNode,
      data: {
        ...editedNode.data,
        options: newOptions
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <Card className="w-full max-h-[80vh] overflow-y-auto">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Editar {node.type === 'start' ? 'Início' : 
                     node.type === 'end' ? 'Fim' :
                     node.type === 'message' ? 'Mensagem' :
                     node.type === 'choice' ? 'Escolha' : 'Nó'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Título do nó */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Título
            </label>
            <Input
              value={editedNode.data.label || ''}
              onChange={(e) => setEditedNode({
                ...editedNode,
                data: { ...editedNode.data, label: e.target.value }
              })}
              placeholder="Título do nó"
              className="w-full"
            />
          </div>

          {/* Mensagem (para nós de mensagem) */}
          {(node.type === 'message' || node.type === 'start') && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Mensagem
              </label>
              <Textarea
                value={editedNode.data.message || ''}
                onChange={(e) => setEditedNode({
                  ...editedNode,
                  data: { ...editedNode.data, message: e.target.value }
                })}
                placeholder="Digite a mensagem..."
                rows={3}
                className="w-full"
              />
            </div>
          )}

          {/* Opções (para nós de escolha) */}
          {node.type === 'choice' && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Opções de Escolha
              </label>
              
              {/* Lista de opções existentes */}
              <div className="space-y-2 mb-3">
                {editedNode.data.options?.map((option: any, index: number) => (
                  <div key={option.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    <Input
                      value={option.text}
                      onChange={(e) => updateOption(index, 'text', e.target.value)}
                      placeholder="Texto da opção"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="h-8 w-8 p-0 text-red-500"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Adicionar nova opção */}
              <div className="flex space-x-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Nova opção"
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && addOption()}
                />
                <Button
                  onClick={addOption}
                  disabled={!newOption.trim()}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex space-x-2 pt-4 border-t">
            <Button
              onClick={handleSave}
              className="flex-1 bg-boti-primary hover:bg-boti-primary/90 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            
            {node.type !== 'start' && (
              <Button
                onClick={handleDelete}
                variant="outline"
                className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
