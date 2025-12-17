import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, Building2 } from "lucide-react";

export default function EscolherTipoCadastro() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4">
            Bem-vindo ao Doutorizze
          </h1>
          <p className="text-xl text-gray-600">
            Escolha como deseja se cadastrar
          </p>
        </div>

        {/* Cards de Escolha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Card Profissional */}
          <Card
            className="border-2 border-blue-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
            onClick={() => navigate("/CadastroProfissional")}
          >
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <Stethoscope className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Sou Profissional
              </h2>
              <p className="text-gray-600 mb-6">
                Dentista ou Médico buscando oportunidades de trabalho
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Começar Cadastro
              </Button>
            </CardContent>
          </Card>

          {/* Card Clinica */}
          <Card
            className="border-2 border-green-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
            onClick={() => navigate("/CadastroClinica")}
          >
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <Building2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Sou Clínica
              </h2>
              <p className="text-gray-600 mb-6">
                Clínica Odontológica ou Médica buscando profissionais
              </p>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Começar Cadastro
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}