import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verificar autenticação
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se API key está configurada
    if (!ANTHROPIC_API_KEY) {
      return Response.json({ 
        error: 'ANTHROPIC_API_KEY não configurada' 
      }, { status: 500 });
    }

    const { action, params } = await req.json();

    if (action === 'sendMessage') {
      const { 
        messages, 
        model = 'claude-3-5-sonnet-20241022', 
        maxTokens = 1024,
        temperature = 1.0,
        systemPrompt
      } = params;

      // Validar mensagens
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return Response.json({ 
          error: 'Mensagens inválidas ou ausentes' 
        }, { status: 400 });
      }

      // Preparar payload para API da Anthropic
      const payload = {
        model,
        max_tokens: maxTokens,
        temperature,
        messages
      };

      // Adicionar system prompt se fornecido
      if (systemPrompt) {
        payload.system = systemPrompt;
      }

      // Fazer requisição para API da Anthropic
      const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return Response.json({ 
          error: 'Erro ao se comunicar com Claude AI',
          details: errorData 
        }, { status: response.status });
      }

      const data = await response.json();

      // Extrair texto da resposta
      const messageContent = data.content[0]?.text || '';

      return Response.json({
        success: true,
        message: messageContent,
        fullResponse: data,
        usage: {
          inputTokens: data.usage?.input_tokens || 0,
          outputTokens: data.usage?.output_tokens || 0
        }
      });
    }

    return Response.json({ 
      error: 'Ação não suportada' 
    }, { status: 400 });

  } catch (error) {
    return Response.json({ 
      error: 'Erro interno',
      message: error.message 
    }, { status: 500 });
  }
});