import { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize, Minimize, Move, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMobileDetection } from '@/hooks/use-mobile-detection';

interface MobileFlowControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onFitView: () => void;
  onAddNode: (type: string) => void;
  onTogglePan: () => void;
  isPanMode: boolean;
  currentZoom: number;
}

export function MobileFlowControls({
  onZoomIn,
  onZoomOut,
  onResetView,
  onFitView,
  onAddNode,
  onTogglePan,
  isPanMode,
  currentZoom
}: MobileFlowControlsProps) {
  const { isMobile } = useMobileDetection();
  const [showAddMenu, setShowAddMenu] = useState(false);

  if (!isMobile) return null;

  const nodeTypes = [
    { type: 'message', label: 'Mensagem', icon: '💬' },
    { type: 'choice', label: 'Escolha', icon: '🔀' },
    { type: 'action', label: 'Ação', icon: '⚡' },
    { type: 'end', label: 'Fim', icon: '🏁' }
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-10">
      <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
        <CardContent className="p-2">
          {/* Controles principais */}
          <div className="flex items-center justify-between mb-2">
            {/* Zoom controls */}
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={onZoomOut}
                className="h-8 w-8 p-0"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs font-medium px-2">
                {Math.round(currentZoom * 100)}%
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={onZoomIn}
                className="h-8 w-8 p-0"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            {/* View controls */}
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={onResetView}
                className="h-8 w-8 p-0"
                title="Resetar visualização"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onFitView}
                className="h-8 w-8 p-0"
                title="Ajustar ao conteúdo"
              >
                <Maximize className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={isPanMode ? "default" : "outline"}
                onClick={onTogglePan}
                className="h-8 w-8 p-0"
                title="Modo pan"
              >
                <Move className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Add node controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="h-8 px-3"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>

            <div className="text-xs text-gray-500">
              Toque e arraste para navegar
            </div>
          </div>

          {/* Add node menu */}
          {showAddMenu && (
            <div className="mt-2 p-2 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                {nodeTypes.map((nodeType) => (
                  <Button
                    key={nodeType.type}
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onAddNode(nodeType.type);
                      setShowAddMenu(false);
                    }}
                    className="h-8 text-xs justify-start"
                  >
                    <span className="mr-2">{nodeType.icon}</span>
                    {nodeType.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
