import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Search,
  User,
  Briefcase,
  ShoppingBag,
  CreditCard,
  AlertCircle,
  Flag,
  MessageCircle,
  Mail,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Phone
} from "lucide-react";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

// FAQ por categoria
const faqData = {
  conta: {
    titulo: "Conta e Perfil",
    icone: User,
    cor: "from-blue-400 to-blue-600",
    perguntas: [
      {
        pergunta: "Como alterar minha senha?",
        resposta: "Vá em Configurações > Conta > Alterar Senha. Digite sua senha atual e a nova senha duas vezes para confirmar."
      },
      {
        pergunta: "Como editar meu perfil?",
        resposta: "Acesse Meu Perfil e clique no botão 'Editar Perfil'. Você pode alterar suas informações pessoais, especialidade, cidades de atendimento e muito mais."
      },
      {
        pergunta: "Como excluir minha conta?",
        resposta: "Em Configurações > Conta > Excluir Conta. Esta ação é irreversível e todos os seus dados serão permanentemente removidos."
      },
      {
        pergunta: "Por que meu cadastro está pendente?",
        resposta: "Todos os cadastros passam por análise da nossa equipe para garantir a segurança da plataforma. O processo leva até 48 horas úteis. Você receberá uma notificação assim que for aprovado."
      }
    ]
  },
  vagas: {
    titulo: "Vagas e Candidaturas",
    icone: Briefcase,
    cor: "from-yellow-400 to-orange-500",
    perguntas: [
      {
        pergunta: "Como me candidatar a uma vaga?",
        resposta: "Na página da vaga, clique no botão 'Candidatar-se'. Sua candidatura será enviada automaticamente para a clínica, que poderá visualizar seu perfil completo."
      },
      {
        pergunta: "Como cancelar uma candidatura?",
        resposta: "Acesse 'Minhas Candidaturas', encontre a vaga desejada e clique em 'Cancelar Candidatura'. Você não poderá se candidatar novamente à mesma vaga."
      },
      {
        pergunta: "O que é um Super Match?",
        resposta: "Super Match acontece quando seu perfil é 100% compatível com os requisitos da vaga (cidade, especialidade, dias disponíveis e tempo de formado). Você recebe notificação imediata no app e por WhatsApp."
      },
      {
        pergunta: "Como funciona o sistema de avaliação?",
        resposta: "Após a conclusão de um trabalho, tanto o profissional quanto a clínica recebem um link único para avaliar uns aos outros. As avaliações são anônimas e aparecem no perfil público."
      }
    ]
  },
  marketplace: {
    titulo: "Marketplace",
    icone: ShoppingBag,
    cor: "from-purple-400 to-purple-600",
    perguntas: [
      {
        pergunta: "Como anunciar um produto?",
        resposta: "Clique no botão '+' no menu inferior e selecione 'Criar Anúncio'. Preencha as informações do produto, adicione fotos e publique. Anúncios ficam ativos por 60 dias."
      },
      {
        pergunta: "Quais produtos são permitidos?",
        resposta: "Equipamentos odontológicos e médicos, materiais, instrumentais, mobiliário de consultório e itens relacionados à área da saúde. Não são permitidos medicamentos controlados."
      },
      {
        pergunta: "Como denunciar um anúncio?",
        resposta: "Na página do produto, clique no ícone de bandeira (denunciar) no canto superior direito. Descreva o motivo e envie. Nossa equipe analisará em até 24 horas."
      }
    ]
  },
  pagamentos: {
    titulo: "Pagamentos",
    icone: CreditCard,
    cor: "from-green-400 to-green-600",
    perguntas: [
      {
        pergunta: "O NEW JOBS cobra alguma taxa?",
        resposta: "A plataforma é 100% gratuita para profissionais. Clínicas possuem planos gratuitos e premium com recursos adicionais."
      },
      {
        pergunta: "Como funcionam os pagamentos entre clínica e profissional?",
        resposta: "Os valores e formas de pagamento são combinados diretamente entre clínica e profissional. O NEW JOBS não intermedia pagamentos."
      },
      {
        pergunta: "Como funciona a simulação de crédito?",
        resposta: "A simulação de crédito é uma ferramenta para profissionais que desejam financiar equipamentos. Parceiros financeiros entrarão em contato após a simulação."
      }
    ]
  },
  tecnicos: {
    titulo: "Problemas Técnicos",
    icone: AlertCircle,
    cor: "from-red-400 to-red-600",
    perguntas: [
      {
        pergunta: "O app está travando, o que fazer?",
        resposta: "Tente fechar completamente o app e abrir novamente. Se persistir, limpe o cache do navegador ou reinstale o app. Entre em contato com suporte se o problema continuar."
      },
      {
        pergunta: "Não recebi o email de confirmação",
        resposta: "Verifique sua caixa de spam. Caso não encontre, entre em contato com suporte informando seu email cadastrado."
      },
      {
        pergunta: "Minhas notificações não estão chegando",
        resposta: "Verifique se você deu permissão para notificações do NEW JOBS nas configurações do seu dispositivo. Confira também suas preferências de notificação no app."
      }
    ]
  },
  denuncias: {
    titulo: "Denúncias",
    icone: Flag,
    cor: "from-pink-400 to-red-500",
    perguntas: [
      {
        pergunta: "Como fazer uma denúncia?",
        resposta: "Clique no ícone de bandeira na página do perfil, vaga ou produto que deseja denunciar. Preencha o formulário descrevendo o motivo e envie."
      },
      {
        pergunta: "O que acontece após fazer uma denúncia?",
        resposta: "Nossa equipe analisa todas as denúncias em até 48 horas. Você receberá uma notificação sobre o resultado da análise."
      },
      {
        pergunta: "Posso fazer denúncias anônimas?",
        resposta: "Não, todas as denúncias são identificadas para evitar abusos. Suas informações são confidenciais e não são compartilhadas com o denunciado."
      }
    ]
  }
};

export default function Ajuda() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [categoriaAberta, setCategoriaAberta] = useState(null);
  const [perguntaAberta, setPerguntaAberta] = useState(null);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      }
    };
    loadUser();
  }, []);

  // Filtrar FAQs baseado na busca
  const faqsFiltrados = React.useMemo(() => {
    if (!busca.trim()) return null;

    const resultados = [];
    const termoBusca = busca.toLowerCase();

    Object.entries(faqData).forEach(([key, categoria]) => {
      categoria.perguntas.forEach((faq, index) => {
        if (
          faq.pergunta.toLowerCase().includes(termoBusca) ||
          faq.resposta.toLowerCase().includes(termoBusca)
        ) {
          resultados.push({
            categoriaKey: key,
            categoriaTitulo: categoria.titulo,
            ...faq,
            index
          });
        }
      });
    });

    return resultados;
  }, [busca]);

  const handleCategoriaClick = (key) => {
    setCategoriaAberta(categoriaAberta === key ? null : key);
    setPerguntaAberta(null);
    setBusca(""); // Limpar busca ao abrir categoria
  };

  const handlePerguntaClick = (categoriaKey, index) => {
    const id = `${categoriaKey}-${index}`;
    setPerguntaAberta(perguntaAberta === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-pink-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Central de Ajuda</h1>
          <p className="text-gray-600">Encontre respostas para suas dúvidas</p>
        </div>

        {/* Busca */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Como podemos ajudar?"
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-yellow-400 outline-none text-lg transition-all"
            />
          </div>
        </motion.div>

        {/* Resultados da Busca */}
        {faqsFiltrados && faqsFiltrados.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-6 mb-6"
          >
            <h2 className="text-xl font-black text-gray-900 mb-4">
              {faqsFiltrados.length} resultado{faqsFiltrados.length !== 1 && "s"} encontrado{faqsFiltrados.length !== 1 && "s"}
            </h2>
            <div className="space-y-4">
              {faqsFiltrados.map((faq, idx) => (
                <div key={idx} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <p className="text-xs text-gray-500 mb-1">{faq.categoriaTitulo}</p>
                  <button
                    onClick={() => handlePerguntaClick(faq.categoriaKey, faq.index)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-gray-900">{faq.pergunta}</h3>
                      {perguntaAberta === `${faq.categoriaKey}-${faq.index}` ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                  {perguntaAberta === `${faq.categoriaKey}-${faq.index}` && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 text-gray-700 leading-relaxed"
                    >
                      {faq.resposta}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {faqsFiltrados && faqsFiltrados.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-12 text-center mb-6"
          >
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold">Nenhum resultado encontrado para "{busca}"</p>
            <p className="text-sm text-gray-500 mt-2">Tente usar outros termos ou entre em contato conosco</p>
          </motion.div>
        )}

        {/* Categorias - apenas se não houver busca */}
        {!busca.trim() && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-black text-gray-900 mb-4">Categorias de Ajuda</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(faqData).map(([key, categoria], index) => {
                  const Icon = categoria.icone;
                  return (
                    <motion.button
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleCategoriaClick(key)}
                      className={`bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-all text-left ${
                        categoriaAberta === key ? "ring-4 ring-yellow-400" : ""
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${categoria.cor} flex items-center justify-center text-white mb-3`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-black text-gray-900 text-sm">{categoria.titulo}</h3>
                      <p className="text-xs text-gray-500 mt-1">{categoria.perguntas.length} perguntas</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* FAQ da Categoria Aberta */}
            {categoriaAberta && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-xl p-6 mb-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  {React.createElement(faqData[categoriaAberta].icone, {
                    className: "w-6 h-6 text-gray-600"
                  })}
                  <h2 className="text-xl font-black text-gray-900">
                    {faqData[categoriaAberta].titulo}
                  </h2>
                </div>
                <div className="space-y-4">
                  {faqData[categoriaAberta].perguntas.map((faq, index) => (
                    <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <button
                        onClick={() => handlePerguntaClick(categoriaAberta, index)}
                        className="w-full text-left"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-bold text-gray-900">{faq.pergunta}</h3>
                          {perguntaAberta === `${categoriaAberta}-${index}` ? (
                            <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                      {perguntaAberta === `${categoriaAberta}-${index}` && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 text-gray-700 leading-relaxed"
                        >
                          {faq.resposta}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Contato Direto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-6"
        >
          <h2 className="text-xl font-black text-gray-900 mb-4">Ainda precisa de ajuda?</h2>
          <p className="text-gray-600 mb-6">
            Nossa equipe está pronta para te ajudar
          </p>

          <div className="space-y-4">
            {/* WhatsApp */}
            <WhatsAppButton
              phone="62999999999"
              context="SUPORTE"
              contextData={{ userEmail: user?.email || "" }}
              className="w-full justify-center"
            />

            {/* Email */}
            <a
              href="mailto:suporte@newjobs.com.br"
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:border-yellow-400 transition-all"
            >
              <Mail className="w-5 h-5" />
              suporte@newjobs.com.br
            </a>

            {/* Horário */}
            <div className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 rounded-2xl">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="text-gray-600 font-medium">
                Seg-Sex, 9h-18h
              </span>
            </div>
          </div>
        </motion.div>

        {/* Links Úteis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl p-6"
        >
          <h2 className="text-xl font-black text-gray-900 mb-4">Links Úteis</h2>
          <div className="space-y-3">
            <a
              href="https://newjobs.com.br/termos"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-yellow-400 transition-all"
            >
              <span className="font-semibold text-gray-900">Termos de Uso</span>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </a>
            <a
              href="https://newjobs.com.br/privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-yellow-400 transition-all"
            >
              <span className="font-semibold text-gray-900">Política de Privacidade</span>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </a>
            <a
              href="https://newjobs.com.br/sobre"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-yellow-400 transition-all"
            >
              <span className="font-semibold text-gray-900">Sobre o NEW JOBS</span>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}