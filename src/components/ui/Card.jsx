/**
 * Componente Card - Padrao shadcn/ui
 *
 * Uso:
 * import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
 *
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Titulo</CardTitle>
 *   </CardHeader>
 *   <CardContent>
 *     Conteudo aqui
 *   </CardContent>
 * </Card>
 */

function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className = "", children, ...props }) {
  return (
    <div
      className={`flex flex-col space-y-1.5 p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function CardTitle({ className = "", children, ...props }) {
  return (
    <h3
      className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

function CardDescription({ className = "", children, ...props }) {
  return (
    <p
      className={`text-sm text-muted-foreground ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

function CardContent({ className = "", children, ...props }) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ className = "", children, ...props }) {
  return (
    <div
      className={`flex items-center p-6 pt-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };