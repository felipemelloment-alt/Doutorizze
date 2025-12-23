import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Copy, FileText } from "lucide-react";
import { toast } from "sonner";

export default function TermosUso() {
  const navigate = useNavigate();
  
  const handleCopyText = () => {
    const content = document.querySelector('.termos-content').innerText;
    navigator.clipboard.writeText(content);
    toast.success("Texto copiado!");
  };
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-6 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-4 hover:opacity-80">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <h1 className="text-3xl font-black">📜 Termos de Uso</h1>
          <p className="text-sm opacity-90 mt-1">Última atualização: 22/12/2024</p>
        </div>
      </div>

      {/* AÇÕES */}
      <div className="max-w-4xl mx-auto px-4 py-4 flex gap-3">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all">
          <Download className="w-5 h-5" />
          Baixar PDF
        </button>
        <button
          onClick={handleCopyText}
          className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all">
          <Copy className="w-5 h-5" />
          Copiar Texto
        </button>
      </div>

      {/* CONTEÚDO */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 termos-content">

          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            1. Aceitação dos Termos
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Ao acessar e utilizar o Doutorizze ("Plataforma"), você concorda em cumprir e estar vinculado aos 
            presentes Termos de Uso. Se você não concorda com estes termos, não deve utilizar a Plataforma.
          </p>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Estes Termos de Uso constituem um acordo legal entre você ("Usuário") e o Doutorizze, regulando 
            o acesso e uso dos serviços oferecidos pela Plataforma.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            2. Descrição do Serviço
          </h2>
          <p className="text-gray-700 mb-3 leading-relaxed">
            O Doutorizze é uma plataforma digital que conecta profissionais de saúde (dentistas e médicos) 
            com clínicas, hospitais e oportunidades de trabalho. A Plataforma também oferece:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li>Sistema de matching inteligente entre profissionais e vagas</li>
            <li>Marketplace para compra e venda de equipamentos médicos e odontológicos</li>
            <li>Sistema de avaliações e reputação</li>
            <li>Ferramentas de comunicação entre usuários</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            3. Cadastro e Conta
          </h2>
          <p className="text-gray-700 mb-3 leading-relaxed">
            Para usar determinadas funcionalidades do Doutorizze, você deve criar uma conta. Ao criar uma conta, você concorda em:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li>Fornecer informações verdadeiras, precisas, atuais e completas</li>
            <li>Manter e atualizar prontamente suas informações de cadastro</li>
            <li>Manter a segurança e confidencialidade de sua senha</li>
            <li>Notificar imediatamente sobre qualquer uso não autorizado de sua conta</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            4. Uso Aceitável
          </h2>
          <p className="text-gray-700 mb-3 leading-relaxed">
            Você concorda em usar o Doutorizze apenas para fins legais e de acordo com estes Termos. É proibido:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li>Usar o serviço de qualquer maneira que viole leis locais, estaduais, nacionais ou internacionais</li>
            <li>Publicar conteúdo falso, enganoso, difamatório ou fraudulento</li>
            <li>Fazer-se passar por outra pessoa ou entidade</li>
            <li>Enviar spam, correntes ou comunicações não solicitadas</li>
            <li>Interferir ou interromper o funcionamento do aplicativo</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            5. Propriedade Intelectual
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Todo o conteúdo do Doutorizze, incluindo textos, gráficos, logos, ícones, imagens e software, é propriedade da Doutorizze ou de seus licenciadores e está protegido por leis de direitos autorais.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            6. Limitação de Responsabilidade
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            O Doutorizze não será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos resultantes do seu acesso ou uso do serviço.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            7. Modificações dos Termos
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Reservamo-nos o direito de modificar estes Termos a qualquer momento. Notificaremos os usuários sobre alterações significativas.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            8. Contato
          </h2>
          <p className="text-gray-700 mb-2 leading-relaxed">
            Para questões sobre estes Termos:
          </p>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mt-4">
            <p className="text-gray-800 font-medium">📧 E-mail: contato@doutorizze.com.br</p>
            <p className="text-gray-800 font-medium">📱 WhatsApp: (62) 99999-9999</p>
          </div>

        </div>
      </div>
    </div>
  );
}