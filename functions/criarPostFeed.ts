import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const {
      tipo_post,
      tipo_midia,
      titulo,
      descricao,
      imagem_url,
      video_url,
      video_duracao,
      fonte_nome,
      fonte_url,
      fonte_logo,
      fonte_tipo,
      area,
      tags,
      cidade,
      uf,
      score_ia,
      expires_hours = 48
    } = await req.json();

    if (!tipo_post || !titulo || !descricao || !area) {
      return Response.json({ 
        error: 'tipo_post, titulo, descricao e area são obrigatórios' 
      }, { status: 400 });
    }

    // Calcular expiração
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expires_hours);

    // Criar post usando service role para permitir chamadas do n8n
    const post = await base44.asServiceRole.entities.FeedPost.create({
      tipo_post,
      tipo_midia: tipo_midia || 'IMAGEM',
      titulo,
      descricao,
      imagem_url,
      video_url,
      video_duracao,
      fonte_nome,
      fonte_url,
      fonte_logo,
      fonte_tipo,
      area,
      tags: tags || [],
      cidade,
      uf,
      autor_tipo: 'IA',
      score_ia: score_ia || 7,
      aprovado: (score_ia || 7) >= 7,
      ativo: (score_ia || 7) >= 7,
      destaque: false,
      expires_at: expiresAt.toISOString(),
      visualizacoes: 0,
      curtidas: 0
    });

    return Response.json({ 
      success: true, 
      postId: post.id,
      aprovado: (score_ia || 7) >= 7
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});