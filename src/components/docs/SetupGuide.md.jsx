# 🚀 GUIA DE SETUP - INTEGRAÇÕES EXTERNAS

## 📋 **CHECKLIST DE SETUP**

### ✅ **O QUE JÁ ESTÁ PRONTO:**
- [x] Hooks reutilizáveis (useCurrentUser, useProfessional, useClinica)
- [x] Componentes UI padronizados (Button, Card, Badge)
- [x] Sistema de paginação
- [x] Skeleton loaders
- [x] Error boundary
- [x] Analytics preparado (GA4)
- [x] SEO meta tags
- [x] Design system (tokens)
- [x] Validadores de formulário
- [x] Formatadores globais
- [x] Error tracking preparado
- [x] Performance utils

---

## 🔴 **SETUP NECESSÁRIO - INTEGRAÇÕES**

### **1. FIREBASE CLOUD MESSAGING (Push Notifications)**

**Status:** 🔴 Código pronto, precisa configurar

**Passos:**
```bash
1. Ir para Firebase Console (firebase.google.com)
2. Criar projeto "Doutorizze"
3. Adicionar Web App
4. Habilitar Cloud Messaging
5. Copiar configuração:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID

6. Gerar Server Key (Cloud Messaging → Settings)

7. Adicionar secrets no Base44:
   - FIREBASE_SERVER_KEY
   - FIREBASE_SENDER_ID
   - FIREBASE_API_KEY
   - FIREBASE_PROJECT_ID
```

**Arquivo criado:** `functions/sendPushNotification.js`
**Helper criado:** `components/utils/notifications.js`

---

### **2. GOOGLE ANALYTICS 4**

**Status:** 🟡 Código pronto, precisa ID

**Passos:**
```bash
1. Ir para Google Analytics (analytics.google.com)
2. Criar propriedade GA4
3. Copiar Measurement ID (G-XXXXXXXXXX)

4. No Layout.js, adicionar:
   import { initAnalytics } from '@/components/utils/analytics';
   
   useEffect(() => {
     initAnalytics('G-XXXXXXXXXX');
   }, []);
```

**Arquivo criado:** `components/utils/analytics.js`

---

### **3. WHATSAPP BUSINESS API**

**Status:** 🔴 Precisa conta Business

**Opções:**

**A) Evolution API (Recomendado - Open Source):**
```bash
1. Deploy Evolution API (evolutionapi.com)
2. Conectar WhatsApp Business
3. Criar instância
4. Copiar API Key e Instance Name

5. Adicionar secrets:
   - EVOLUTION_API_URL
   - EVOLUTION_API_KEY
   - EVOLUTION_INSTANCE_NAME
```

**B) Twilio WhatsApp:**
```bash
1. Criar conta Twilio
2. Ativar WhatsApp Sandbox
3. Copiar Account SID e Auth Token

4. Adicionar secrets:
   - TWILIO_ACCOUNT_SID
   - TWILIO_AUTH_TOKEN
   - TWILIO_WHATSAPP_NUMBER
```

**Entity já existe:** `WhatsAppNotification`
**Precisa criar:** Backend function para enviar

---

### **4. SENTRY (Error Tracking)**

**Status:** 🟡 Código preparado

**Passos:**
```bash
1. Criar conta Sentry (sentry.io)
2. Criar projeto React
3. Copiar DSN

4. Instalar SDK:
   npm install @sentry/react

5. No Layout.js:
   import * as Sentry from '@sentry/react';
   
   Sentry.init({
     dsn: "https://xxx@sentry.io/xxx",
     environment: 'production',
     tracesSampleRate: 1.0,
   });
```

**Arquivo preparado:** `components/utils/errorTracking.js`

---

### **5. PWA (Progressive Web App)**

**Status:** 🟡 Manifest criado, falta service worker

**O que falta:**
```javascript
// Criar: public/service-worker.js

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('doutorizze-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/Layout.js',
        '/globals.css',
        '/icon-192.png',
        '/icon-512.png'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

**Manifest criado:** ❌ (tentei criar mas path inválido no Base44)
**Precisa:** Criar manualmente em `public/manifest.json`

---

### **6. WEBSOCKET PARA CHAT**

**Status:** 🔴 Precisa backend WebSocket

**Opções:**

**A) Usar Deno Deploy + WebSocket:**
```javascript
// functions/chatWebSocket.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const connections = new Map();

Deno.serve((req) => {
  if (req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    socket.onopen = () => {
      // Autenticar e adicionar à sala
    };
    
    socket.onmessage = (event) => {
      // Broadcast para sala do chat
    };
    
    socket.onclose = () => {
      // Remover da sala
    };
    
    return response;
  }
  
  return new Response("WebSocket endpoint", { status: 200 });
});
```

**B) Usar Pusher (SaaS):**
```bash
1. Criar conta Pusher
2. Criar app
3. Copiar credenciais
4. Adicionar secrets:
   - PUSHER_APP_ID
   - PUSHER_KEY
   - PUSHER_SECRET
   - PUSHER_CLUSTER
```

---

### **7. PAGAMENTOS (Stripe ou Mercado Pago)**

**Status:** 🔴 Decisão de produto necessária

**Se escolher STRIPE:**
```bash
1. Criar conta Stripe
2. Copiar keys (test e production)
3. Adicionar secrets:
   - STRIPE_SECRET_KEY
   - STRIPE_PUBLIC_KEY
   - STRIPE_WEBHOOK_SECRET

4. Criar produtos no Stripe:
   - Plano Free
   - Plano Pro (R$ 29,90/mês)
   - Plano Premium (R$ 79,90/mês)
   - Destaque de vaga (R$ 19,90)
```

**Se escolher MERCADO PAGO:**
```bash
1. Criar conta Mercado Pago
2. Ir em Desenvolvedores
3. Copiar Access Token
4. Adicionar secret:
   - MERCADOPAGO_ACCESS_TOKEN
```

---

### **8. EMAIL TRANSACIONAL**

**Status:** ✅ Base44 já tem Core.SendEmail

**Melhorias sugeridas:**

**Se quiser templates bonitos:**
- Usar Resend (resend.com)
- Ou SendGrid
- Ou AWS SES

**Templates necessários:**
- Boas-vindas
- Verificação de email (com código)
- Recuperação de senha
- Nova candidatura
- Candidatura aceita
- Resumo semanal

---

### **9. GEOLOCALIZAÇÃO**

**Status:** 🟡 Código preparado

**Usar API do Browser:**
```javascript
// Já pode usar:
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    // Buscar cidade via reverse geocoding
  }
);
```

**Para reverse geocoding (lat/lng → cidade):**
- Usar Google Maps Geocoding API (precisa API key)
- Ou OpenCage Geocoder (grátis até 2.5k/dia)

---

### **10. VALIDAÇÃO DE DOCUMENTOS (OCR)**

**Status:** 🔴 Precisa serviço OCR

**Opções:**

**A) Google Cloud Vision API:**
```bash
1. Habilitar Vision API no GCP
2. Criar Service Account
3. Download JSON key
4. Adicionar secret: GOOGLE_CLOUD_CREDENTIALS
```

**B) AWS Textract:**
```bash
1. Criar conta AWS
2. Habilitar Textract
3. Copiar Access Key e Secret
4. Adicionar secrets
```

**C) Mindee (especializado em docs BR):**
```bash
1. Criar conta Mindee
2. API Key grátis até 250 docs/mês
3. Tem modelo específico pra RG/CNH BR
```

---

## 📊 **PRIORIZAÇÃO DE SETUP**

### **🔴 PRIORIDADE MÁXIMA (fazer primeiro):**
1. **Google Analytics** - 10 minutos
2. **Email verificação** - 1 hora (usar Core.SendEmail)
3. **Error tracking básico** - 30 minutos (console.error estruturado)
4. **Performance** - Já implementado ✅

### **🟡 PRIORIDADE ALTA (semana 1):**
5. **Push Notifications** - 3-4 horas
6. **Sentry** - 1 hora
7. **PWA Manifest** - 30 minutos

### **🟢 PRIORIDADE MÉDIA (semana 2-3):**
8. **WebSocket Chat** - 8-10 horas
9. **WhatsApp Business** - 4-6 horas
10. **Validação docs** - 6-8 horas

### **💎 PRIORIDADE BAIXA (quando tiver budget):**
11. **Pagamentos** - 2-3 dias
12. **Video calls** - 1 semana
13. **IA recomendações** - 1 semana

---

## ✅ **O QUE POSSO USAR AGORA (SEM SETUP):**

Tudo que criei está pronto para usar:

```javascript
// 1. Hooks
import { useCurrentUser } from '@/components/hooks/useCurrentUser';
import { useProfessional } from '@/components/hooks/useProfessional';
import { usePagination } from '@/components/utils/usePagination';

// 2. Components
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import Pagination from '@/components/shared/Pagination';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import SEOHead from '@/components/shared/SEOHead';

// 3. Utils
import { formatters, masks } from '@/components/utils/formatters';
import { validators } from '@/components/validation/schemas';
import { analytics } from '@/components/utils/analytics';

// 4. Features
import OnboardingTour from '@/components/features/OnboardingTour';
import ProgressBar from '@/components/features/ProgressBar';
import { confettiEffects } from '@/components/features/ConfettiEffect';
```

---

## 🎯 **PRÓXIMOS PASSOS PRÁTICOS:**

1. **Configurar Google Analytics** (10 min)
2. **Testar paginação** (já funcionando)
3. **Testar SEO** (compartilhar link)
4. **Decidir sobre Firebase** (push) ou deixar pra depois
5. **Decidir sobre pagamentos** (modelo de negócio)

Precisa de ajuda com algum setup específico?