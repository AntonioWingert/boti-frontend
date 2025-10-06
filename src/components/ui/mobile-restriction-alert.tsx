import { AlertTriangle, Monitor, Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MobileRestrictionAlertProps {
  title?: string;
  message?: string;
  onDismiss?: () => void;
}

export function MobileRestrictionAlert({ 
  title = "Edição não disponível em dispositivos móveis",
  message = "Para uma melhor experiência de edição, acesse esta funcionalidade em um computador ou tablet.",
  onDismiss 
}: MobileRestrictionAlertProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Smartphone className="h-12 w-12 text-boti-primary" />
              <AlertTriangle className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1" />
            </div>
          </div>
          <CardTitle className="text-xl text-boti-text font-poppins">{title}</CardTitle>
          <CardDescription className="text-gray-600">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-boti-primary/10 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Monitor className="h-8 w-8 text-boti-primary" />
              <div>
                <p className="font-medium text-boti-text">Recomendamos usar:</p>
                <p className="text-sm text-gray-600">Desktop ou tablet (tela maior que 1024px)</p>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Por que esta restrição?</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Interface complexa com muitos elementos</li>
              <li>Precisão necessária para edição de fluxos</li>
              <li>Melhor experiência em telas maiores</li>
            </ul>
          </div>

          {onDismiss && (
            <Button 
              onClick={onDismiss}
              className="w-full bg-boti-primary hover:bg-boti-primary/90 text-white"
            >
              Entendi
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
