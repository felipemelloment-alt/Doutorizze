import React from "react";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackError } from "@/components/utils/analytics";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState(prev => ({ 
      errorInfo,
      errorCount: prev.errorCount + 1
    }));
    
    // Track error in analytics
    trackError(error, {
      component: this.props.name || 'Unknown',
      componentStack: errorInfo?.componentStack
    });
    
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught:', error);
      console.error('Component stack:', errorInfo?.componentStack);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      // Se o erro persistir após múltiplas tentativas
      if (this.state.errorCount > 3) {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-md">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-2">
                Erro Persistente
              </h1>
              <p className="text-gray-600 mb-6">
                Estamos tendo problemas técnicos. Por favor, tente novamente mais tarde ou entre em contato com o suporte.
              </p>
              <Button
                onClick={this.handleGoHome}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold rounded-xl"
              >
                <Home className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </div>
          </div>
        );
      }

      // Fallback UI padrão
      return (
        <div className="min-h-[400px] bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-md">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Ops! Algo deu errado
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Encontramos um problema ao carregar esta seção. Tente recarregar.
            </p>
            
            <div className="flex gap-3">
              <Button
                onClick={this.handleGoBack}
                variant="outline"
                className="flex-1 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button
                onClick={this.handleRetry}
                className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold rounded-xl"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
            </div>

            {/* Detalhes do erro em desenvolvimento */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  Detalhes técnicos
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded-lg text-xs text-red-600 overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC para facilitar uso
export function withErrorBoundary(Component, name) {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary name={name || Component.displayName || Component.name}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;