import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function PoliticaPrivacidade() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Política de Privacidade</h1>
          <p className="text-gray-600">Última atualização: 18 de Dezembro de 2025</p>
        </div>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          {/* Introdução */}
          <section>
            <p className="mb-4">
              O Doutorizze ("nós", "nosso" ou "Plataforma") está comprometido em proteger a privacidade 
              e os dados pessoais de nossos usuários. Esta Política de Privacidade explica como coletamos, 
              usamos, armazenamos e compartilhamos suas informações pessoais, em conformidade com a Lei Geral 
              de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
          </section>

          {/* 1. Dados Coletados */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Dados Coletados</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">1.1 Dados Fornecidos por Você</h3>
            <p className="mb-2">Coletamos as seguintes informações quando você se cadastra e usa nossa Plataforma:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Profissionais de Saúde:</strong> Nome completo, CPF, data de nascimento, email, telefone, 
              WhatsApp, registro profissional (CRO/CRM), especialidade, cidades de atendimento, foto de documentos</li>
              <li><strong>Clínicas/Hospitais:</strong> Razão social, nome fantasia, CNPJ, endereço completo, 
              telefones de contato, email, dados do responsável técnico, fotos do estabelecimento</li>
              <li><strong>Fornecedores:</strong> Dados empresariais, CNPJ, contatos, áreas de atuação</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">1.2 Dados Coletados Automaticamente</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Endereço IP</li>
              <li>Tipo de navegador e dispositivo</li>
              <li>Data e hora de acesso</li>
              <li>Páginas visitadas e ações realizadas na Plataforma</li>
              <li>Localização aproximada (baseada em IP)</li>
            </ul>
          </section>

          {/* 2. Como Usamos seus Dados */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Como Usamos seus Dados</h2>
            <p className="mb-2">Utilizamos seus dados pessoais para os seguintes propósitos:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Prestação de Serviços:</strong> Criar e gerenciar sua conta, processar candidaturas 
              a vagas, facilitar conexões entre profissionais e empregadores</li>
              <li><strong>Matching Inteligente:</strong> Analisar seu perfil para sugerir vagas compatíveis 
              e profissionais adequados</li>
              <li><strong>Comunicação:</strong> Enviar notificações sobre vagas, mensagens, atualizações 
              importantes e marketing (com seu consentimento)</li>
              <li><strong>Segurança:</strong> Prevenir fraudes, verificar identidades e garantir a segurança 
              da Plataforma</li>
              <li><strong>Melhorias:</strong> Analisar o uso da Plataforma para aprimorar nossos serviços 
              e desenvolver novos recursos</li>
              <li><strong>Cumprimento Legal:</strong> Cumprir obrigações legais e regulatórias</li>
            </ul>
          </section>

          {/* 3. Compartilhamento de Dados */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Compartilhamento de Dados</h2>
            <p className="mb-2">Podemos compartilhar seus dados nas seguintes situações:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Com Outros Usuários:</strong> Informações do seu perfil profissional são visíveis 
              para empregadores quando você se candidata a vagas. Clínicas e hospitais têm seus dados visíveis 
              para profissionais</li>
              <li><strong>Prestadores de Serviços:</strong> Compartilhamos dados com fornecedores de 
              infraestrutura, armazenamento, análise e comunicação que nos auxiliam na operação da Plataforma</li>
              <li><strong>Exigências Legais:</strong> Podemos divulgar informações quando exigido por lei, 
              ordem judicial ou autoridade competente</li>
              <li><strong>Transações Corporativas:</strong> Em caso de fusão, aquisição ou venda de ativos, 
              seus dados podem ser transferidos</li>
            </ul>
            <p>
              <strong>Não vendemos seus dados pessoais a terceiros.</strong>
            </p>
          </section>

          {/* 4. Armazenamento e Segurança */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Armazenamento e Segurança</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Armazenamento</h3>
            <p className="mb-4">
              Seus dados são armazenados em servidores seguros localizados no Brasil e/ou em provedores de 
              cloud computing certificados. Mantemos seus dados pelo tempo necessário para cumprir os fins 
              descritos nesta política ou conforme exigido por lei.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Medidas de Segurança</h3>
            <p className="mb-2">Implementamos medidas técnicas e organizacionais para proteger seus dados:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Criptografia de dados em trânsito e em repouso</li>
              <li>Controles de acesso rigorosos</li>
              <li>Monitoramento contínuo de segurança</li>
              <li>Backups regulares</li>
              <li>Treinamento de equipe em proteção de dados</li>
            </ul>
          </section>

          {/* 5. Seus Direitos (LGPD) */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Seus Direitos (LGPD)</h2>
            <p className="mb-2">De acordo com a LGPD, você tem os seguintes direitos:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Confirmação e Acesso:</strong> Confirmar se tratamos seus dados e acessá-los</li>
              <li><strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li><strong>Anonimização, Bloqueio ou Eliminação:</strong> Solicitar anonimização, bloqueio 
              ou eliminação de dados desnecessários</li>
              <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado e 
              interoperável</li>
              <li><strong>Eliminação:</strong> Solicitar a exclusão de dados tratados com seu 
              consentimento</li>
              <li><strong>Revogação do Consentimento:</strong> Revogar consentimento a qualquer momento</li>
              <li><strong>Oposição:</strong> Opor-se a tratamento de dados em certas circunstâncias</li>
            </ul>
            <p>
              Para exercer seus direitos, entre em contato através dos canais indicados na seção 8.
            </p>
          </section>

          {/* 6. Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies</h2>
            <p className="mb-4">
              Utilizamos cookies e tecnologias similares para melhorar sua experiência, personalizar conteúdo, 
              analisar o tráfego e lembrar suas preferências.
            </p>
            <p className="mb-2">Tipos de cookies utilizados:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Cookies Essenciais:</strong> Necessários para o funcionamento básico da Plataforma</li>
              <li><strong>Cookies de Funcionalidade:</strong> Lembram suas preferências e configurações</li>
              <li><strong>Cookies de Performance:</strong> Coletam informações sobre como você usa a Plataforma</li>
              <li><strong>Cookies de Marketing:</strong> Personalizam anúncios e medem campanhas 
              (apenas com consentimento)</li>
            </ul>
            <p>
              Você pode gerenciar cookies através das configurações do seu navegador.
            </p>
          </section>

          {/* 7. Alterações na Política */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Alterações na Política</h2>
            <p className="mb-4">
              Podemos atualizar esta Política de Privacidade periodicamente. A versão mais recente sempre 
              estará disponível nesta página com a data de atualização.
            </p>
            <p>
              Alterações significativas serão comunicadas por email ou através de notificações na Plataforma.
            </p>
          </section>

          {/* 8. Contato do DPO */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contato do DPO</h2>
            <p className="mb-4">
              Para questões relacionadas à privacidade, proteção de dados ou para exercer seus direitos, 
              entre em contato com nosso Encarregado de Proteção de Dados (DPO):
            </p>
            <div className="pl-4 space-y-1 bg-gray-50 p-4 rounded-xl">
              <p><strong>Email:</strong> dpo@doutorizze.com.br</p>
              <p><strong>WhatsApp:</strong> (62) 99999-9999</p>
              <p><strong>Endereço:</strong> Goiânia - GO, Brasil</p>
            </div>
            <p className="mt-4">
              Responderemos às suas solicitações dentro do prazo legal de 15 dias.
            </p>
          </section>

          {/* Informações Adicionais */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Informações Importantes</h2>
            <p className="mb-4">
              <strong>Menores de Idade:</strong> Nossa Plataforma não é destinada a menores de 18 anos. 
              Não coletamos intencionalmente dados de menores.
            </p>
            <p className="mb-4">
              <strong>Links Externos:</strong> Nossa Plataforma pode conter links para sites de terceiros. 
              Não somos responsáveis pelas práticas de privacidade desses sites.
            </p>
            <p>
              <strong>Consentimento:</strong> Ao usar nossa Plataforma, você consente com a coleta e uso 
              de informações conforme descrito nesta política.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p>© 2025 Doutorizze. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}