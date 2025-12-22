import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Send, Bot } from "lucide-react";
import { toast } from "sonner";

export default function TestClaudeAI() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState(null);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Digite uma mensagem");
      return;
    }

    setLoading(true);
    setResponse("");
    setUsage(null);

    try {
      const result = await base44.functions.invoke('claudeAI', {
        action: 'sendMessage',
        params: {
          messages: [
            { role: 'user', content: message }
          ],
          model: 'claude-3-5-sonnet-20241022',
          maxTokens: 2000,
          temperature: 1.0
        }
      });

      if (result.data.success) {
        setResponse(result.data.message);
        setUsage(result.data.usage);
        toast.success("Resposta recebida!");
      } else {
        toast.error("Erro: " + (result.data.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro ao chamar Claude AI:", error);
      toast.error("Erro ao se comunicar com Claude AI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Test Claude AI
          </h1>
          <p className="text-gray-600">
            Teste sua integração com a API da Anthropic
          </p>
        </div>

        {/* Input */}
        <Card className="p-6 mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Sua mensagem para o Claude:
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua pergunta ou mensagem..."
            className="min-h-[120px] mb-4"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !message.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Enviar para Claude
              </>
            )}
          </Button>
        </Card>

        {/* Response */}
        {response && (
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Claude AI</p>
                <p className="text-xs text-gray-600">claude-3-5-sonnet-20241022</p>
              </div>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-800 whitespace-pre-wrap">{response}</p>
            </div>
            {usage && (
              <div className="mt-4 pt-4 border-t border-purple-200 flex gap-4 text-sm text-gray-600">
                <span>📥 Input: {usage.inputTokens} tokens</span>
                <span>📤 Output: {usage.outputTokens} tokens</span>
                <span>💰 Total: {usage.inputTokens + usage.outputTokens} tokens</span>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}