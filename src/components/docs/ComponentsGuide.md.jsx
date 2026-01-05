# 📚 GUIA DE COMPONENTES E UTILS

## 🎨 **COMPONENTES UI CRIADOS**

### **Button** (`components/ui/Button.js`)
```jsx
import Button from '@/components/ui/Button';
import { Save } from 'lucide-react';

// Variantes
<Button variant="primary">Salvar</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="success">Confirmar</Button>
<Button variant="danger">Excluir</Button>

// Com ícone
<Button icon={Save} iconPosition="left">Salvar</Button>

// Loading
<Button loading={isSubmitting}>Enviando</Button>

// Tamanhos
<Button size="sm">Pequeno</Button>
<Button size="md">Médio</Button>
<Button size="lg">Grande</Button>

// Full width
<Button fullWidth>Botão Completo</Button>
```

---

### **Card** (`components/ui/Card.js`)
```jsx
import Card from '@/components/ui/Card';
import { Briefcase } from 'lucide-react';

<Card
  title="Minhas Vagas"
  subtitle="Gerencie suas oportunidades"
  icon={Briefcase}
  gradient="from-yellow-400 to-orange-500"
  delay={0.1}
>
  {/* Conteúdo */}
</Card>
```

---

### **Badge** (`components/ui/Badge.js`)
```jsx
import Badge from '@/components/ui/Badge';
import { Star } from 'lucide-react';

<Badge variant="success">Ativo</Badge>
<Badge variant="danger">Cancelado</Badge>
<Badge variant="primary" icon={Star}>Destaque</Badge>
```

---

### **EmptyState** (`components/shared/EmptyState.js`)
```jsx
import EmptyState from '@/components/shared/EmptyState';
import { Briefcase } from 'lucide-react';

<EmptyState
  icon={Briefcase}
  // ou emoji="📄"
  title="Nenhuma vaga ainda"
  description="Você ainda não criou nenhuma vaga. Comece agora!"
  actionLabel="Criar Primeira Vaga"
  onAction={() => navigate('/CriarVaga')}
  secondaryActionLabel="Buscar Profissionais"
  onSecondaryAction={() => navigate('/BuscarProfissionais')}
/>
```

---

### **LoadingSpinner** (`components/shared/LoadingSpinner.js`)
```jsx
import LoadingSpinner from '@/components/shared/LoadingSpinner';

// Inline
<LoadingSpinner size="sm" text="Carregando..." />

// Full screen
<LoadingSpinner fullScreen text="Carregando vagas..." />

// Sizes: sm, md, lg
```

---

### **Pagination** (`components/shared/Pagination.js`)
```jsx
import Pagination from '@/components/shared/Pagination';

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={goToPage}
  itemsPerPage={12}
  totalItems={totalItems}
/>
```

---

### **SkeletonCard** (`components/shared/SkeletonCard.js`)
```jsx
import { VagaCardSkeleton, ProfissionalCardSkeleton, MarketplaceCardSkeleton } from '@/components/shared/SkeletonCard';

{isLoading ? (
  <>
    <VagaCardSkeleton />
    <VagaCardSkeleton />
  </>
) : (
  vagas.map(vaga => <VagaCard {...vaga} />)
)}
```

---

### **PageHeader** (`components/shared/PageHeader.js`)
```jsx
import PageHeader from '@/components/shared/PageHeader';
import { Briefcase, Plus } from 'lucide-react';

<PageHeader
  title="Minhas Vagas"
  subtitle="12 vagas ativas"
  icon={Briefcase}
  // ou emoji="💼"
  stats={['12 Ativas', '5 Pausadas', '3 Preenchidas']}
  actions={
    <>
      <Button icon={Plus}>Criar Vaga</Button>
    </>
  }
  onBack={() => navigate(-1)}
  gradient="from-pink-500 to-purple-600"
/>
```

---

### **SEOHead** (`components/shared/SEOHead.js`)
```jsx
import SEOHead from '@/components/shared/SEOHead';

// Em cada página:
<SEOHead
  title="Vagas para Dentistas"
  description="150 oportunidades de emprego em todo Brasil"
  keywords="vagas dentista, emprego odontologia"
  image="/og-vagas.png"
  canonical="https://doutorizze.com/vagas"
/>
```

---

### **ErrorBoundary** (`components/shared/ErrorBoundary.js`)
```jsx
// Já adicionado no Layout.js automaticamente
// Captura erros e mostra tela amigável
```

---

## 🪝 **HOOKS CRIADOS**

### **useCurrentUser** (`components/hooks/useCurrentUser.js`)
```jsx
import { useCurrentUser } from '@/components/hooks/useCurrentUser';

function MyPage() {
  const { user, loading, error, refresh } = useCurrentUser();

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Erro</div>;

  return <div>Olá {user.full_name}</div>;
}
```

---

### **useProfessional** (`components/hooks/useProfessional.js`)
```jsx
import { useProfessional } from '@/components/hooks/useProfessional';

function ProfilePage() {
  const { user } = useCurrentUser();
  const { data: professional, isLoading } = useProfessional(user?.id);

  if (isLoading) return <LoadingSpinner />;

  return <div>{professional.nome_completo}</div>;
}
```

---

### **useClinica** (`components/hooks/useClinica.js`)
```jsx
import { useClinica } from '@/components/hooks/useClinica';

function ClinicaPage() {
  const { user } = useCurrentUser();
  const { owner, units, primaryUnit, isLoading } = useClinica(user?.id);

  if (isLoading) return <LoadingSpinner />;

  return <div>{primaryUnit.nome_fantasia}</div>;
}
```

---

### **usePagination** (`components/utils/usePagination.js`)
```jsx
import { usePagination } from '@/components/utils/usePagination';

function ListaPage() {
  const { data: items = [] } = useQuery(...);
  
  const {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
    hasNext,
    hasPrev,
    totalItems
  } = usePagination(items, 12); // 12 por página

  return (
    <>
      {currentItems.map(item => <ItemCard {...item} />)}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        itemsPerPage={12}
        totalItems={totalItems}
      />
    </>
  );
}
```

---

## 🛠️ **UTILS CRIADOS**

### **Formatters** (`components/utils/formatters.js`)
```jsx
import { formatters, masks } from '@/components/utils/formatters';

// Formatação
formatters.currency(5000) // "R$ 5.000,00"
formatters.cpf("12345678900") // "123.456.789-00"
formatters.phone("62999998888") // "(62) 99999-8888"
formatters.date("2025-01-15") // "15/01/2025"
formatters.truncate("Texto longo...", 50) // "Texto lon..."

// Máscaras de input
<input 
  value={cpf}
  onChange={(e) => setCpf(masks.cpf(e.target.value))}
/>
```

---

### **Validators** (`components/validation/schemas.js`)
```jsx
import { validators, validateForm } from '@/components/validation/schemas';

// Validação individual
const error = validators.cpf(cpf);
if (error) toast.error(error);

// Validação de form completo
const schema = {
  nome: [
    (v) => validators.required(v, 'Nome'),
    (v) => validators.minLength(v, 3, 'Nome')
  ],
  email: [validators.required, validators.email],
  cpf: [validators.required, validators.cpf],
  senha: [validators.required, validators.password]
};

const { isValid, errors } = validateForm(formData, schema);
if (!isValid) {
  Object.entries(errors).forEach(([field, error]) => {
    toast.error(error);
  });
}
```

---

### **Analytics** (`components/utils/analytics.js`)
```jsx
import { analytics } from '@/components/utils/analytics';

// Trackear eventos
analytics.vagaVisualizada(vagaId, titulo, cidade);
analytics.candidaturaEnviada(vagaId, titulo, matchScore);
analytics.perfilVisualizado(professionalId, especialidade);
analytics.contatoIniciado('whatsapp', destino);
analytics.cadastroCompleto('PROFISSIONAL', 'ODONTOLOGIA');
```

---

### **Error Tracking** (`components/utils/errorTracking.js`)
```jsx
import { errorTracker, withErrorTracking } from '@/components/utils/errorTracking';

// Log manual
try {
  await fazerAlgo();
} catch (error) {
  errorTracker.logError(error, { 
    component: 'VagasPage',
    action: 'criar_vaga' 
  });
}

// Wrapper automático
const fetchData = withErrorTracking(
  async () => {
    return await base44.entities.Job.list();
  },
  { component: 'JobsList' }
);
```

---

### **Performance** (`components/utils/performance.js`)
```jsx
import { useDebounce, useLazyLoad, LazyImage } from '@/components/utils/performance';

// Debounce em search
const searchTerm = useDebounce(inputValue, 500);

// Lazy load ao scroll
const loadMoreRef = useLazyLoad(() => {
  loadMore();
});

<div ref={loadMoreRef}>Carregar mais...</div>

// Lazy load de imagens
<LazyImage 
  src={vaga.foto} 
  alt={vaga.titulo}
  className="w-full h-48 object-cover"
/>
```

---

## 🎨 **DESIGN SYSTEM** (`components/design/tokens.js`)
```jsx
import { colors, spacing, typography, shadows, borders } from '@/components/design/tokens';

// Usar tokens
<div className={`${spacing.cardPadding} ${borders.card} ${shadows.card}`}>
  <h1 className={typography.h1}>Título</h1>
</div>

// Gradientes
<div className={`bg-gradient-to-r ${colors.gradients.primary}`}>
  {/* Conteúdo */}
</div>
```

---

## 🎁 **FEATURES EXTRAS**

### **ProgressBar** (`components/features/ProgressBar.js`)
```jsx
import ProgressBar from '@/components/features/ProgressBar';

<ProgressBar
  steps={[
    { label: 'Dados Pessoais', description: 'Nome, email, telefone' },
    { label: 'Documentos', description: 'RG, CRO/CRM' },
    { label: 'Experiência', description: 'Formação e cursos' },
    { label: 'Preferências', description: 'Cidades e horários' }
  ]}
  currentStep={2}
/>
```

---

### **OnboardingTour** (`components/features/OnboardingTour.js`)
```jsx
import OnboardingTour from '@/components/features/OnboardingTour';

<OnboardingTour
  steps={[
    {
      title: 'Bem-vindo!',
      description: 'Vamos fazer um tour rápido',
      emoji: '👋'
    },
    {
      title: 'Vagas Perfeitas',
      description: 'Receba vagas compatíveis com seu perfil',
      icon: Briefcase
    }
  ]}
  onComplete={() => console.log('Tour completo')}
/>
```

---

### **Confetti** (`components/features/ConfettiEffect.js`)
```jsx
import { confettiEffects } from '@/components/features/ConfettiEffect';

// Ao conseguir vaga
confettiEffects.superMatch();

// Primeira contratação
confettiEffects.firstHire();

// Cadastro aprovado
confettiEffects.approved();
```

---

### **ImageUpload** (`components/features/ImageUpload.js`)
```jsx
import ImageUpload from '@/components/features/ImageUpload';

<ImageUpload
  value={formData.foto}
  onChange={(url) => setFormData({ ...formData, foto: url })}
  label="Foto do Documento"
  required
  maxSize={5} // MB
  compressQuality={0.8}
/>
```

---

## 🔍 **ONDE USAR CADA COISA**

### **Todas as páginas devem ter:**
```jsx
import SEOHead from '@/components/shared/SEOHead';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

function MinhaPage() {
  const { data, isLoading } = useQuery(...);

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <>
      <SEOHead 
        title="Título da Página"
        description="Descrição SEO"
      />
      {/* Conteúdo */}
    </>
  );
}
```

---

### **Listas com muitos itens:**
```jsx
import { usePagination } from '@/components/utils/usePagination';
import Pagination from '@/components/shared/Pagination';
import { VagaCardSkeleton } from '@/components/shared/SkeletonCard';

const { currentItems, ...pagination } = usePagination(items, 12);

{isLoading ? (
  <VagaCardSkeleton />
) : (
  currentItems.map(item => <ItemCard {...item} />)
)}

<Pagination {...pagination} itemsPerPage={12} />
```

---

### **Empty states:**
```jsx
import EmptyState from '@/components/shared/EmptyState';

{items.length === 0 && (
  <EmptyState
    emoji="📄"
    title="Nenhum item"
    description="Descrição do que fazer"
    actionLabel="Criar Agora"
    onAction={() => {}}
  />
)}
```

---

## 📊 **PERFORMANCE**

### **Otimizar queries:**
```jsx
import { fetchInParallel } from '@/components/utils/apiOptimizer';

// ANTES (sequencial - lento)
const profs = await base44.entities.Professional.list();
const jobs = await base44.entities.Job.list();
const units = await base44.entities.CompanyUnit.list();

// DEPOIS (paralelo - rápido)
const [profs, jobs, units] = await fetchInParallel([
  base44.entities.Professional.list(),
  base44.entities.Job.list(),
  base44.entities.CompanyUnit.list()
]);
```

---

### **Debounce em search:**
```jsx
import { useDebounce } from '@/components/utils/performance';

const [searchInput, setSearchInput] = useState('');
const debouncedSearch = useDebounce(searchInput, 500);

// Só faz query quando parar de digitar
useEffect(() => {
  if (debouncedSearch) {
    buscar(debouncedSearch);
  }
}, [debouncedSearch]);
```

---

## 🎯 **EXEMPLOS PRÁTICOS**

### **Página de Lista Completa:**
```jsx
import { useCurrentUser } from '@/components/hooks/useCurrentUser';
import { useProfessional } from '@/components/hooks/useProfessional';
import { usePagination } from '@/components/utils/usePagination';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import Pagination from '@/components/shared/Pagination';
import SEOHead from '@/components/shared/SEOHead';
import { VagaCardSkeleton } from '@/components/shared/SkeletonCard';

function VagasPage() {
  const { user, loading: loadingUser } = useCurrentUser();
  const { data: professional } = useProfessional(user?.id);
  
  const { data: vagas = [], isLoading } = useQuery({
    queryKey: ['vagas'],
    queryFn: () => base44.entities.Job.list()
  });

  const { currentItems, ...pagination } = usePagination(vagas, 12);

  if (loadingUser) return <LoadingSpinner fullScreen />;

  return (
    <>
      <SEOHead title="Vagas Disponíveis" />
      
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          <VagaCardSkeleton />
          <VagaCardSkeleton />
          <VagaCardSkeleton />
        </div>
      ) : vagas.length === 0 ? (
        <EmptyState
          emoji="💼"
          title="Nenhuma vaga"
          description="Ainda não há vagas disponíveis"
          actionLabel="Ver Marketplace"
          onAction={() => navigate('/Marketplace')}
        />
      ) : (
        <>
          {currentItems.map(vaga => (
            <VagaCard key={vaga.id} {...vaga} />
          ))}
          <Pagination {...pagination} itemsPerPage={12} />
        </>
      )}
    </>
  );
}
```

---

**Tudo pronto para usar! 🚀**