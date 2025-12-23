import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Copy, Shield } from "lucide-react";
import { toast } from "sonner";

export default function PoliticaPrivacidade() {
  const navigate = useNavigate();
  
  const handleCopyText = () => {
    const content = document.querySelector('.politica-content').innerText;
    navigator.clipboard.writeText(content);
    toast.success("Texto copiado!");
  };
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-6 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-4 hover:opacity-80">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <h1 className="text-3xl font-black">🔒 Política de Privacidade</h1>
          <p className="text-sm opacity-90 mt-1">Última atualização: 22/12/2024</p>
        </div>
      </div>

      {/* AÇÕES */}
      <div className="max-w-4xl mx-auto px-4 py-4 flex gap-3">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all">
          <Download className="w-5 h-5" />
          Baixar PDF
        </button>
        <button
          onClick={handleCopyText}
          className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:border-green-500 hover:text-green-600 transition-all">
          <Copy className="w-5 h-5" />
          Copiar Texto
        </button>
      </div>

      {/* CONTEÚDO */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 politica-content">

          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-600" />
            Introdução
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            O Doutorizze está comprometido em proteger a privacidade e os dados pessoais de nossos usuários, em conformidade com a LGPD (Lei nº 13.709/2018).
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-600" />
            1. Dados Coletados
          </h2>
          <p className="text-gray-700 mb-3 leading-relaxed">Coletamos:</p>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li><strong>Profissionais:</strong> Nome, CPF, CRO/CRM, especialidade, contatos</li>
            <li><strong>Clínicas:</strong> CNPJ, razão social, endereço, responsável técnico</li>
            <li><strong>Dados automáticos:</strong> IP, navegador, localização</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-600" />
            2. Como Usamos seus Dados
          </h2>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li>Criar e gerenciar sua conta</li>
            <li>Matching inteligente de vagas e profissionais</li>
            <li>Enviar notificações e comunicações</li>
            <li>Prevenir fraudes e garantir segurança</li>
            <li>Melhorar nossos serviços</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-600" />
            3. Compartilhamento de Dados
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            <strong>NÃO VENDEMOS SEUS DADOS.</strong> Compartilhamos apenas quando necessário para operação da plataforma ou exigências legais.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-600" />
            4. Segurança dos Dados
          </h2>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li>Criptografia de dados</li>
            <li>Controles de acesso rigorosos</li>
            <li>Monitoramento contínuo</li>
            <li>Backups regulares</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-600" />
            5. Seus Direitos (LGPD)
          </h2>
          <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-2">
            <li>Acesso aos seus dados</li>
            <li>Correção de dados incorretos</li>
            <li>Exclusão de dados</li>
            <li>Portabilidade de dados</li>
            <li>Revogação de consentimento</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-600" />
            6. Contato
          </h2>
          <p className="text-gray-700 mb-2 leading-relaxed">
            Para questões sobre privacidade ou exercer seus direitos:
          </p>
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mt-4">
            <p className="text-gray-800 font-medium">📧 E-mail: dpo@doutorizze.com.br</p>
            <p className="text-gray-800 font-medium">📱 WhatsApp: (62) 99999-9999</p>
            <p className="text-gray-800 font-medium mt-2">⏱️ Resposta em até 15 dias</p>
          </div>

        </div>
      </div>
    </div>
  );
}