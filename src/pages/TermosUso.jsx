import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function TermosUso() {
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
          <h1 className="text-4xl font-black text-gray-900 mb-2">Termos de Uso</h1>
          <p className="text-gray-600">Última atualização: 18 de Dezembro de 2025</p>
        </div>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          {/* 1. Aceitação dos Termos */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
            <p className="mb-4">
              Ao acessar e utilizar o Doutorizze ("Plataforma"), você concorda em cumprir e estar vinculado aos 
              presentes Termos de Uso. Se você não concorda com estes termos, não deve utilizar a Plataforma.
            </p>
            <p>
              Estes Termos de Uso constituem um acordo legal entre você ("Usuário") e o Doutorizze, regulando 
              o acesso e uso dos serviços oferecidos pela Plataforma.
            </p>
          </section>

          {/* 2. Descrição do Serviço */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Descrição do Serviço</h2>
            <p className="mb-4">
              O Doutorizze é uma plataforma digital que conecta profissionais de saúde (dentistas e médicos) 
              com clínicas, hospitais e oportunidades de trabalho. A Plataforma também oferece:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sistema de matching inteligente entre profissionais e vagas</li>
              <li>Marketplace para compra e venda de equipamentos médicos e odontológicos</li>
              <li>Sistema de avaliações e reputação</li>
              <li>Ferramentas de comunicação entre usuários</li>
            </ul>
          </section>

          {/* 3. Cadastro e Conta */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cadastro e Conta</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Requisitos de Cadastro</h3>
            <p className="mb-4">
              Para utilizar a Plataforma, você deve criar uma conta fornecendo informações verdadeiras, 
              precisas e completas. É necessário ter 18 anos ou mais para se cadastrar.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Verificação de Cadastro</h3>
            <p className="mb-4">
              Profissionais de saúde devem fornecer documentos comprobatórios de registro profissional 
              (CRO/CRM) válidos. Clínicas e hospitais devem apresentar documentação corporativa válida.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Segurança da Conta</h3>
            <p>
              Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas 
              as atividades realizadas em sua conta. Notifique-nos imediatamente sobre qualquer uso não 
              autorizado de sua conta.
            </p>
          </section>

          {/* 4. Regras de Uso */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Regras de Uso</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Uso Permitido</h3>
            <p className="mb-4">
              A Plataforma destina-se exclusivamente a uso profissional para fins de recrutamento, 
              networking e transações comerciais legítimas no setor de saúde.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Condutas Proibidas</h3>
            <p className="mb-2">É expressamente proibido:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fornecer informações falsas ou enganosas</li>
              <li>Utilizar a Plataforma para fins ilícitos ou fraudulentos</li>
              <li>Publicar conteúdo ofensivo, difamatório ou discriminatório</li>
              <li>Assediar, ameaçar ou intimidar outros usuários</li>
              <li>Violar direitos de propriedade intelectual de terceiros</li>
              <li>Coletar dados de outros usuários sem autorização</li>
              <li>Utilizar bots, scripts ou ferramentas automatizadas</li>
              <li>Tentar acessar áreas restritas da Plataforma</li>
            </ul>
          </section>

          {/* 5. Conteúdo do Usuário */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Conteúdo do Usuário</h2>
            <p className="mb-4">
              Você é responsável por todo o conteúdo que publica na Plataforma, incluindo perfis profissionais, 
              anúncios de vagas, ofertas de produtos e avaliações.
            </p>
            <p className="mb-4">
              Ao publicar conteúdo, você concede ao Doutorizze uma licença não exclusiva, mundial e livre de 
              royalties para usar, reproduzir, modificar e distribuir esse conteúdo no contexto da operação 
              da Plataforma.
            </p>
            <p>
              Reservamo-nos o direito de remover qualquer conteúdo que viole estes Termos ou seja considerado 
              inadequado, a nosso critério exclusivo.
            </p>
          </section>

          {/* 6. Propriedade Intelectual */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Propriedade Intelectual</h2>
            <p className="mb-4">
              Todos os direitos de propriedade intelectual relacionados à Plataforma, incluindo mas não 
              limitado a software, design, logos, marcas e conteúdo, são de propriedade exclusiva do 
              Doutorizze ou de seus licenciadores.
            </p>
            <p>
              É proibida a reprodução, distribuição, modificação ou criação de obras derivadas sem 
              autorização prévia por escrito.
            </p>
          </section>

          {/* 7. Limitação de Responsabilidade */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitação de Responsabilidade</h2>
            <p className="mb-4">
              A Plataforma é fornecida "como está" e "conforme disponível". O Doutorizze não garante que 
              o serviço será ininterrupto, livre de erros ou completamente seguro.
            </p>
            <p className="mb-4">
              O Doutorizze atua como intermediário entre profissionais e empregadores/compradores. Não somos 
              responsáveis por:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Qualidade ou veracidade das informações fornecidas pelos usuários</li>
              <li>Resultado de contratações ou transações realizadas através da Plataforma</li>
              <li>Disputas entre usuários</li>
              <li>Danos diretos ou indiretos resultantes do uso da Plataforma</li>
            </ul>
          </section>

          {/* 8. Modificações dos Termos */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Modificações dos Termos</h2>
            <p className="mb-4">
              Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. As alterações 
              serão publicadas nesta página com a data de atualização.
            </p>
            <p>
              O uso continuado da Plataforma após a publicação de alterações constitui aceitação dos 
              novos termos.
            </p>
          </section>

          {/* 9. Lei Aplicável */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Lei Aplicável</h2>
            <p>
              Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Quaisquer 
              disputas serão submetidas à jurisdição exclusiva dos tribunais brasileiros.
            </p>
          </section>

          {/* 10. Contato */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contato</h2>
            <p className="mb-2">
              Para questões sobre estes Termos de Uso, entre em contato conosco:
            </p>
            <div className="pl-4 space-y-1">
              <p><strong>Email:</strong> contato@doutorizze.com.br</p>
              <p><strong>WhatsApp:</strong> (62) 99999-9999</p>
              <p><strong>Endereço:</strong> Goiânia - GO, Brasil</p>
            </div>
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