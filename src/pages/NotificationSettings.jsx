import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Bell, 
  BellOff, 
  Briefcase, 
  MessageSquare, 
  CheckCircle, 
  Star, 
  Image, 
  ShoppingBag, 
  Newspaper,
  Moon,
  Volume2,
  Smartphone
} from "lucide-react";

export default function NotificationSettings() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
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

  const { data: preferences, isLoading } = useQuery({
    queryKey: ["notificationPreferences", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const prefs = await base44.entities.NotificationPreference.filter({ created_by: user.email });
      if (prefs.length > 0) return prefs[0];
      
      // Criar preferências padrão
      return await base44.entities.NotificationPreference.create({
        usuario_tipo: user.role === "admin" ? "CLINICA" : "DENTISTA"
      });
    },
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.NotificationPreference.update(preferences.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notificationPreferences"]);
      toast.success("Preferências atualizadas com sucesso!");
    },
  });

  const handleUpdate = (field, value) => {
    updateMutation.mutate({ [field]: value });
  };

  if (isLoading || !preferences) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando preferências...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notificações</h1>
            <p className="text-gray-600">Personalize como você quer ser notificado</p>
          </div>
        </div>

        {/* Vagas & Matching */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle>Vagas & Oportunidades</CardTitle>
                <CardDescription>Notificações sobre vagas compatíveis com seu perfil</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Super Jobs */}
            <div className="space-y-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500 rounded-lg">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <Label className="text-base font-semibold text-gray-900">SUPER JOBS 🌟</Label>
                    <p className="text-sm text-gray-600">Vagas perfeitas para você (100% compatível)</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.vagas_super_jobs?.ativo ?? true}
                  onCheckedChange={(checked) =>
                    handleUpdate("vagas_super_jobs", { ...preferences.vagas_super_jobs, ativo: checked })
                  }
                />
              </div>
              
              {preferences.vagas_super_jobs?.ativo && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-12">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={preferences.vagas_super_jobs?.canal_push ?? true}
                      onCheckedChange={(checked) =>
                        handleUpdate("vagas_super_jobs", { ...preferences.vagas_super_jobs, canal_push: checked })
                      }
                    />
                    <Label className="text-sm">Push</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={preferences.vagas_super_jobs?.canal_email ?? true}
                      onCheckedChange={(checked) =>
                        handleUpdate("vagas_super_jobs", { ...preferences.vagas_super_jobs, canal_email: checked })
                      }
                    />
                    <Label className="text-sm">Email</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={preferences.vagas_super_jobs?.canal_whatsapp ?? false}
                      onCheckedChange={(checked) =>
                        handleUpdate("vagas_super_jobs", { ...preferences.vagas_super_jobs, canal_whatsapp: checked })
                      }
                    />
                    <Label className="text-sm">WhatsApp</Label>
                  </div>
                </div>
              )}
            </div>

            {/* Jobs Semelhante */}
            <div className="space-y-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <Label className="text-base font-semibold text-gray-900">Jobs Semelhante ⭐</Label>
                    <p className="text-sm text-gray-600">Vagas compatíveis (75% de match)</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.vagas_semelhante?.ativo ?? true}
                  onCheckedChange={(checked) =>
                    handleUpdate("vagas_semelhante", { ...preferences.vagas_semelhante, ativo: checked })
                  }
                />
              </div>
              
              {preferences.vagas_semelhante?.ativo && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-12">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={preferences.vagas_semelhante?.canal_push ?? true}
                      onCheckedChange={(checked) =>
                        handleUpdate("vagas_semelhante", { ...preferences.vagas_semelhante, canal_push: checked })
                      }
                    />
                    <Label className="text-sm">Push</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={preferences.vagas_semelhante?.canal_email ?? false}
                      onCheckedChange={(checked) =>
                        handleUpdate("vagas_semelhante", { ...preferences.vagas_semelhante, canal_email: checked })
                      }
                    />
                    <Label className="text-sm">Email</Label>
                  </div>
                </div>
              )}
            </div>

            {/* Vagas Normais */}
            <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <Label className="text-base font-semibold text-gray-900">Outras Vagas</Label>
                    <p className="text-sm text-gray-600">Vagas com menor compatibilidade</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.vagas_normais?.ativo ?? false}
                  onCheckedChange={(checked) =>
                    handleUpdate("vagas_normais", { ...preferences.vagas_normais, ativo: checked })
                  }
                />
              </div>
              
              {preferences.vagas_normais?.ativo && (
                <div className="space-y-4 pl-12">
                  <div className="flex items-center gap-4">
                    <Label className="text-sm">Frequência:</Label>
                    <Select
                      value={preferences.vagas_normais?.frequencia ?? "DIARIO"}
                      onValueChange={(value) =>
                        handleUpdate("vagas_normais", { ...preferences.vagas_normais, frequencia: value })
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IMEDIATO">Imediato</SelectItem>
                        <SelectItem value="DIARIO">Diário</SelectItem>
                        <SelectItem value="SEMANAL">Semanal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={preferences.vagas_normais?.canal_push ?? false}
                        onCheckedChange={(checked) =>
                          handleUpdate("vagas_normais", { ...preferences.vagas_normais, canal_push: checked })
                        }
                      />
                      <Label className="text-sm">Push</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={preferences.vagas_normais?.canal_email ?? false}
                        onCheckedChange={(checked) =>
                          handleUpdate("vagas_normais", { ...preferences.vagas_normais, canal_email: checked })
                        }
                      />
                      <Label className="text-sm">Email</Label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Atualizações de Match */}
            <div className="space-y-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <Label className="text-base font-semibold text-gray-900">Atualizações de Match</Label>
                    <p className="text-sm text-gray-600">Quando clínicas visualizam ou contatam você</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.atualizacoes_match?.canal_push ?? true}
                  onCheckedChange={(checked) =>
                    handleUpdate("atualizacoes_match", { ...preferences.atualizacoes_match, canal_push: checked })
                  }
                />
              </div>
              
              {preferences.atualizacoes_match?.canal_push && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={preferences.atualizacoes_match?.profissional_visualizou ?? true}
                      onCheckedChange={(checked) =>
                        handleUpdate("atualizacoes_match", { ...preferences.atualizacoes_match, profissional_visualizou: checked })
                      }
                    />
                    <Label className="text-sm">Visualizações</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={preferences.atualizacoes_match?.profissional_contatou ?? true}
                      onCheckedChange={(checked) =>
                        handleUpdate("atualizacoes_match", { ...preferences.atualizacoes_match, profissional_contatou: checked })
                      }
                    />
                    <Label className="text-sm">Contatos</Label>
                  </div>
                </div>
              )}
            </div>

          </CardContent>
        </Card>

        {/* Mensagens & Chat */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-green-600" />
              <div>
                <CardTitle>Mensagens & Chat</CardTitle>
                <CardDescription>Notificações de novas mensagens</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold">Novas Mensagens no Chat</Label>
                <p className="text-sm text-gray-600">Seja notificado quando recebernovas mensagens</p>
              </div>
              <Switch
                checked={preferences.mensagens_chat?.ativo ?? true}
                onCheckedChange={(checked) =>
                  handleUpdate("mensagens_chat", { ...preferences.mensagens_chat, ativo: checked })
                }
              />
            </div>
            
            {preferences.mensagens_chat?.ativo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={preferences.mensagens_chat?.canal_push ?? true}
                    onCheckedChange={(checked) =>
                      handleUpdate("mensagens_chat", { ...preferences.mensagens_chat, canal_push: checked })
                    }
                  />
                  <Label className="text-sm">Push</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={preferences.mensagens_chat?.canal_email ?? false}
                    onCheckedChange={(checked) =>
                      handleUpdate("mensagens_chat", { ...preferences.mensagens_chat, canal_email: checked })
                    }
                  />
                  <Label className="text-sm">Email</Label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status & Avaliações */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
              <div>
                <CardTitle>Status & Avaliações</CardTitle>
                <CardDescription>Atualizações importantes sobre seu cadastro</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Status Cadastro */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Status do Cadastro</Label>
                  <p className="text-sm text-gray-600">Aprovação ou reprovação do seu perfil</p>
                </div>
                <Switch
                  checked={preferences.status_cadastro?.ativo ?? true}
                  onCheckedChange={(checked) =>
                    handleUpdate("status_cadastro", { ...preferences.status_cadastro, ativo: checked })
                  }
                />
              </div>
              
              {preferences.status_cadastro?.ativo && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={preferences.status_cadastro?.canal_push ?? true}
                      onCheckedChange={(checked) =>
                        handleUpdate("status_cadastro", { ...preferences.status_cadastro, canal_push: checked })
                      }
                    />
                    <Label className="text-sm">Push</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={preferences.status_cadastro?.canal_email ?? true}
                      onCheckedChange={(checked) =>
                        handleUpdate("status_cadastro", { ...preferences.status_cadastro, canal_email: checked })
                      }
                    />
                    <Label className="text-sm">Email</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={preferences.status_cadastro?.canal_whatsapp ?? true}
                      onCheckedChange={(checked) =>
                        handleUpdate("status_cadastro", { ...preferences.status_cadastro, canal_whatsapp: checked })
                      }
                    />
                    <Label className="text-sm">WhatsApp</Label>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Lembretes Avaliação */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Lembretes de Avaliação</Label>
                  <p className="text-sm text-gray-600">Lembrar de avaliar após finalizar uma vaga</p>
                </div>
                <Switch
                  checked={preferences.lembrete_avaliacao?.ativo ?? true}
                  onCheckedChange={(checked) =>
                    handleUpdate("lembrete_avaliacao", { ...preferences.lembrete_avaliacao, ativo: checked })
                  }
                />
              </div>
              
              {preferences.lembrete_avaliacao?.ativo && (
                <div className="space-y-4 pl-6">
                  <div className="flex items-center gap-4">
                    <Label className="text-sm">Lembrar após:</Label>
                    <Input
                      type="number"
                      min="1"
                      max="30"
                      value={preferences.lembrete_avaliacao?.dias_apos_contrato ?? 7}
                      onChange={(e) =>
                        handleUpdate("lembrete_avaliacao", { ...preferences.lembrete_avaliacao, dias_apos_contrato: parseInt(e.target.value) })
                      }
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600">dias</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={preferences.lembrete_avaliacao?.canal_push ?? true}
                        onCheckedChange={(checked) =>
                          handleUpdate("lembrete_avaliacao", { ...preferences.lembrete_avaliacao, canal_push: checked })
                        }
                      />
                      <Label className="text-sm">Push</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={preferences.lembrete_avaliacao?.canal_email ?? true}
                        onCheckedChange={(checked) =>
                          handleUpdate("lembrete_avaliacao", { ...preferences.lembrete_avaliacao, canal_email: checked })
                        }
                      />
                      <Label className="text-sm">Email</Label>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </CardContent>
        </Card>

        {/* Feed & Marketplace */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Image className="w-6 h-6 text-pink-600" />
              <div>
                <CardTitle>Feed Social & Marketplace</CardTitle>
                <CardDescription>Notificações sobre posts e produtos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Novos Posts */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Novos Posts no Feed</Label>
                  <p className="text-sm text-gray-600">Quando colegas publicam novos posts</p>
                </div>
                <Switch
                  checked={preferences.novos_posts_feed?.ativo ?? false}
                  onCheckedChange={(checked) =>
                    handleUpdate("novos_posts_feed", { ...preferences.novos_posts_feed, ativo: checked })
                  }
                />
              </div>
              
              {preferences.novos_posts_feed?.ativo && (
                <div className="space-y-3 pl-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={preferences.novos_posts_feed?.apenas_minha_regiao ?? true}
                      onCheckedChange={(checked) =>
                        handleUpdate("novos_posts_feed", { ...preferences.novos_posts_feed, apenas_minha_regiao: checked })
                      }
                    />
                    <Label className="text-sm">Apenas da minha região</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={preferences.novos_posts_feed?.canal_push ?? false}
                      onCheckedChange={(checked) =>
                        handleUpdate("novos_posts_feed", { ...preferences.novos_posts_feed, canal_push: checked })
                      }
                    />
                    <Label className="text-sm">Notificações Push</Label>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Interações */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Interações nos Meus Posts</Label>
                  <p className="text-sm text-gray-600">Curtidas e comentários</p>
                </div>
                <Switch
                  checked={preferences.interacoes_posts?.canal_push ?? true}
                  onCheckedChange={(checked) =>
                    handleUpdate("interacoes_posts", { ...preferences.interacoes_posts, canal_push: checked })
                  }
                />
              </div>
              
              {preferences.interacoes_posts?.canal_push && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={preferences.interacoes_posts?.curtidas ?? true}
                      onCheckedChange={(checked) =>
                        handleUpdate("interacoes_posts", { ...preferences.interacoes_posts, curtidas: checked })
                      }
                    />
                    <Label className="text-sm">Curtidas</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={preferences.interacoes_posts?.comentarios ?? true}
                      onCheckedChange={(checked) =>
                        handleUpdate("interacoes_posts", { ...preferences.interacoes_posts, comentarios: checked })
                      }
                    />
                    <Label className="text-sm">Comentários</Label>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Marketplace */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Novos Itens no Marketplace</Label>
                  <p className="text-sm text-gray-600">Equipamentos e materiais novos</p>
                </div>
                <Switch
                  checked={preferences.marketplace_novos_itens?.ativo ?? false}
                  onCheckedChange={(checked) =>
                    handleUpdate("marketplace_novos_itens", { ...preferences.marketplace_novos_itens, ativo: checked })
                  }
                />
              </div>
              
              {preferences.marketplace_novos_itens?.ativo && (
                <div className="space-y-3 pl-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={preferences.marketplace_novos_itens?.apenas_minha_regiao ?? true}
                      onCheckedChange={(checked) =>
                        handleUpdate("marketplace_novos_itens", { ...preferences.marketplace_novos_itens, apenas_minha_regiao: checked })
                      }
                    />
                    <Label className="text-sm">Apenas da minha região</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={preferences.marketplace_novos_itens?.canal_push ?? false}
                      onCheckedChange={(checked) =>
                        handleUpdate("marketplace_novos_itens", { ...preferences.marketplace_novos_itens, canal_push: checked })
                      }
                    />
                    <Label className="text-sm">Notificações Push</Label>
                  </div>
                </div>
              )}
            </div>

          </CardContent>
        </Card>

        {/* Notícias */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Newspaper className="w-6 h-6 text-indigo-600" />
              <div>
                <CardTitle>Notícias</CardTitle>
                <CardDescription>Atualizações e novidades da área</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <Label className="text-base font-semibold">Novas Notícias</Label>
                <p className="text-sm text-gray-600">Mantenha-se atualizado</p>
              </div>
              <Switch
                checked={preferences.noticias?.ativo ?? true}
                onCheckedChange={(checked) =>
                  handleUpdate("noticias", { ...preferences.noticias, ativo: checked })
                }
              />
            </div>
            
            {preferences.noticias?.ativo && (
              <div className="space-y-4 pl-6">
                <div className="flex items-center gap-4">
                  <Label className="text-sm">Frequência:</Label>
                  <Select
                    value={preferences.noticias?.frequencia ?? "IMEDIATO"}
                    onValueChange={(value) =>
                      handleUpdate("noticias", { ...preferences.noticias, frequencia: value })
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IMEDIATO">Imediato</SelectItem>
                      <SelectItem value="DIARIO">Diário</SelectItem>
                      <SelectItem value="SEMANAL">Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={preferences.noticias?.canal_push ?? true}
                      onCheckedChange={(checked) =>
                        handleUpdate("noticias", { ...preferences.noticias, canal_push: checked })
                      }
                    />
                    <Label className="text-sm">Push</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={preferences.noticias?.canal_email ?? false}
                      onCheckedChange={(checked) =>
                        handleUpdate("noticias", { ...preferences.noticias, canal_email: checked })
                      }
                    />
                    <Label className="text-sm">Email</Label>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configurações Gerais */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-gray-600" />
              <div>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>Personalize a experiência de notificações</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Modo Não Perturbe */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-gray-600" />
                  <div>
                    <Label className="text-base font-semibold">Modo Não Perturbe</Label>
                    <p className="text-sm text-gray-600">Silenciar notificações em horários específicos</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.modo_nao_perturbe?.ativo ?? false}
                  onCheckedChange={(checked) =>
                    handleUpdate("modo_nao_perturbe", { ...preferences.modo_nao_perturbe, ativo: checked })
                  }
                />
              </div>
              
              {preferences.modo_nao_perturbe?.ativo && (
                <div className="grid grid-cols-2 gap-4 pl-12">
                  <div>
                    <Label className="text-sm">Das:</Label>
                    <Input
                      type="time"
                      value={preferences.modo_nao_perturbe?.horario_inicio ?? "22:00"}
                      onChange={(e) =>
                        handleUpdate("modo_nao_perturbe", { ...preferences.modo_nao_perturbe, horario_inicio: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Até:</Label>
                    <Input
                      type="time"
                      value={preferences.modo_nao_perturbe?.horario_fim ?? "08:00"}
                      onChange={(e) =>
                        handleUpdate("modo_nao_perturbe", { ...preferences.modo_nao_perturbe, horario_fim: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Outras Configurações */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Agrupar Notificações</Label>
                  <p className="text-sm text-gray-600">Combinar notificações similares</p>
                </div>
                <Switch
                  checked={preferences.agrupar_notificacoes ?? true}
                  onCheckedChange={(checked) => handleUpdate("agrupar_notificacoes", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-gray-600" />
                  <div>
                    <Label className="text-base">Som de Notificação</Label>
                    <p className="text-sm text-gray-600">Tocar som ao receber notificações</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.som_notificacao ?? true}
                  onCheckedChange={(checked) => handleUpdate("som_notificacao", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Vibração</Label>
                  <p className="text-sm text-gray-600">Vibrar ao receber notificações</p>
                </div>
                <Switch
                  checked={preferences.vibracao ?? true}
                  onCheckedChange={(checked) => handleUpdate("vibracao", checked)}
                />
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.history.back()}
          >
            Voltar
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={() => toast.success("Todas as preferências foram salvas!")}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Salvar Tudo
          </Button>
        </div>

      </div>
    </div>
  );
}