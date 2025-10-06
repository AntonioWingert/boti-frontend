import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <Logo size={36} />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 justify-center flex-1">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-boti-primary transition-colors duration-200 font-medium"
            >
              Início
            </Link>
            <a 
              href="/#features" 
              className="text-gray-700 hover:text-boti-primary transition-colors duration-200 font-medium"
            >
              Funcionalidades
            </a>
            <a 
              href="/#pricing" 
              className="text-gray-700 hover:text-boti-primary transition-colors duration-200 font-medium"
            >
              Preços
            </a>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login">
              <Button 
                variant="outline" 
                className="border-boti-primary text-boti-primary hover:bg-boti-primary hover:text-white transition-colors duration-200"
              >
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button 
                className="bg-boti-primary hover:bg-boti-primary/90 text-white transition-colors duration-200"
              >
                Começar Grátis
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-100">
              <Link
                href="/"
                className="block px-3 py-2 text-gray-700 hover:text-boti-primary transition-colors duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
              <a
                href="/#features"
                className="block px-3 py-2 text-gray-700 hover:text-boti-primary transition-colors duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Funcionalidades
              </a>
              <a
                href="/#pricing"
                className="block px-3 py-2 text-gray-700 hover:text-boti-primary transition-colors duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Preços
              </a>
              <div className="pt-4 space-y-4">
                <Link href="/login">
                  <Button 
                    variant="outline" 
                    className="w-full py-3 my-2 border-boti-primary text-boti-primary hover:bg-boti-primary hover:text-white transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Entrar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    className="w-full py-3 my-2 bg-boti-primary hover:bg-boti-primary/90 text-white transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Começar Grátis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
