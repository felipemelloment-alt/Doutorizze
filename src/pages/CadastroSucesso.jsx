import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CadastroSucesso() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4 md:p-8">
      <Card className="max-w-lg w-full border-2 border-green-200 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Cadastro Enviado!
          </h1>

          <p className="text-gray-600 mb-6">
            Seu cadastro foi recebido com sucesso e será analisado pela nossa equipe.
          </p>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-blue-700 mb-2">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Prazo de Análise</span>
            </div>
            <p className="text-blue-600">
              Até 48 horas úteis
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-gray-700 mb-2">
              <Mail className="w-5 h-5" />
              <span className="font-semibold">Fique Atento</span>
            </div>
            <p className="text-gray-600 text-sm">
              Você receberá uma notificação por email e WhatsApp assim que seu cadastro for aprovado.
            </p>
          </div>

          <Button
            onClick={() => navigate("/")}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Voltar para o Início
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}