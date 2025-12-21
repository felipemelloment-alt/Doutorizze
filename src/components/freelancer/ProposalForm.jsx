import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarIcon, 
  DollarSign, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Briefcase
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function ProposalForm({ job, freelancer, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    cover_letter: "",
    estimated_hours: "",
    proposed_budget: "",
    proposed_timeline: "",
    availability_start: null,
    portfolio_references: [],
    additional_notes: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPortfolioItems, setSelectedPortfolioItems] = useState([]);

  const portfolioItems = freelancer?.portfolio_items || [];
  const budgetRange = job?.project_details?.budget_range;
  const budgetType = job?.project_details?.budget_type;
  const isHourly = budgetType === "hourly";

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const togglePortfolioItem = (item) => {
    setSelectedPortfolioItems(prev => {
      const isSelected = prev.some(p => p.title === item.title);
      if (isSelected) {
        return prev.filter(p => p.title !== item.title);
      } else {
        if (prev.length >= 3) {
          toast.error("Você pode selecionar no máximo 3 itens do portfólio");
          return prev;
        }
        return [...prev, item];
      }
    });
  };

  const calculateTotal = () => {
    if (!isHourly || !formData.estimated_hours || !formData.proposed_budget) return null;
    return parseFloat(formData.estimated_hours) * parseFloat(formData.proposed_budget);
  };

  const validateForm = () => {
    const newErrors = {};

    // Cover letter
    if (!formData.cover_letter.trim()) {
      newErrors.cover_letter = "Carta de apresentação é obrigatória";
    } else if (formData.cover_letter.length < 50) {
      newErrors.cover_letter = "A carta deve ter no mínimo 50 caracteres";
    }

    // Proposed budget
    if (!formData.proposed_budget) {
      newErrors.proposed_budget = "Orçamento proposto é obrigatório";
    } else {
      const budget = parseFloat(formData.proposed_budget);
      if (budgetRange) {
        if (budget < budgetRange.min || budget > budgetRange.max) {
          newErrors.proposed_budget = `Orçamento deve estar entre R$ ${budgetRange.min.toLocaleString('pt-BR')} e R$ ${budgetRange.max.toLocaleString('pt-BR')}`;
        }
      }
    }

    // Estimated hours (se hourly)
    if (isHourly && !formData.estimated_hours) {
      newErrors.estimated_hours = "Horas estimadas são obrigatórias para trabalho por hora";
    }

    // Proposed timeline
    if (!formData.proposed_timeline.trim()) {
      newErrors.proposed_timeline = "Prazo proposto é obrigatório";
    } else if (formData.proposed_timeline.length < 5) {
      newErrors.proposed_timeline = "Prazo deve ter no mínimo 5 caracteres";
    }

    // Availability start
    if (!formData.availability_start) {
      newErrors.availability_start = "Data de disponibilidade é obrigatória";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (formData.availability_start < today) {
        newErrors.availability_start = "Data deve ser hoje ou no futuro";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

    setIsSubmitting(true);
    try {
      const proposalData = {
        ...formData,
        portfolio_references: selectedPortfolioItems.map(item => item.title),
        proposed_budget: parseFloat(formData.proposed_budget),
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        availability_start: formData.availability_start?.toISOString()
      };

      await onSubmit(proposalData);
    } catch (error) {
      toast.error("Erro ao enviar proposta: " + error.message);
      setIsSubmitting(false);
    }
  };

  const total = calculateTotal();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Budget Info */}
      {budgetRange && (
        <Alert className="bg-blue-50 border-blue-200">
          <DollarSign className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Orçamento sugerido:</strong> R$ {budgetRange.min.toLocaleString('pt-BR')} - R$ {budgetRange.max.toLocaleString('pt-BR')}
            {budgetType === "hourly" && " por hora"}
            {budgetType === "daily" && " por dia"}
          </AlertDescription>
        </Alert>
      )}

      {/* Cover Letter */}
      <div>
        <Label htmlFor="cover_letter" className="text-sm font-semibold text-gray-700 mb-2">
          Carta de Apresentação *
        </Label>
        <Textarea
          id="cover_letter"
          value={formData.cover_letter}
          onChange={(e) => handleInputChange("cover_letter", e.target.value)}
          placeholder="Explique por que você é o candidato ideal para este projeto..."
          className={`min-h-[150px] ${errors.cover_letter ? 'border-red-400' : ''}`}
          maxLength={1000}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">Mínimo 50 caracteres</span>
          <span className={`text-xs ${formData.cover_letter.length < 50 ? 'text-red-500' : 'text-green-600'}`}>
            {formData.cover_letter.length}/1000
          </span>
        </div>
        {errors.cover_letter && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.cover_letter}
          </p>
        )}
      </div>

      {/* Budget & Hours */}
      <div className="grid md:grid-cols-2 gap-4">
        {isHourly && (
          <div>
            <Label htmlFor="estimated_hours" className="text-sm font-semibold text-gray-700 mb-2">
              Horas Estimadas *
            </Label>
            <Input
              id="estimated_hours"
              type="number"
              value={formData.estimated_hours}
              onChange={(e) => handleInputChange("estimated_hours", e.target.value)}
              placeholder="Ex: 40"
              min="1"
              className={errors.estimated_hours ? 'border-red-400' : ''}
            />
            {errors.estimated_hours && (
              <p className="text-red-500 text-sm mt-1">{errors.estimated_hours}</p>
            )}
          </div>
        )}

        <div className={isHourly ? '' : 'md:col-span-2'}>
          <Label htmlFor="proposed_budget" className="text-sm font-semibold text-gray-700 mb-2">
            {isHourly ? "Valor por Hora *" : "Orçamento Total *"}
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
            <Input
              id="proposed_budget"
              type="number"
              value={formData.proposed_budget}
              onChange={(e) => handleInputChange("proposed_budget", e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={`pl-10 ${errors.proposed_budget ? 'border-red-400' : ''}`}
            />
          </div>
          {errors.proposed_budget && (
            <p className="text-red-500 text-sm mt-1">{errors.proposed_budget}</p>
          )}
          {isHourly && total && (
            <p className="text-sm text-green-600 mt-1 font-semibold">
              Total estimado: R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>
      </div>

      {/* Timeline & Availability */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="proposed_timeline" className="text-sm font-semibold text-gray-700 mb-2">
            Prazo Proposto *
          </Label>
          <Input
            id="proposed_timeline"
            value={formData.proposed_timeline}
            onChange={(e) => handleInputChange("proposed_timeline", e.target.value)}
            placeholder="Ex: 2 semanas, 1 mês"
            className={errors.proposed_timeline ? 'border-red-400' : ''}
          />
          {errors.proposed_timeline && (
            <p className="text-red-500 text-sm mt-1">{errors.proposed_timeline}</p>
          )}
        </div>

        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2">
            Disponível a partir de *
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal ${
                  !formData.availability_start && "text-muted-foreground"
                } ${errors.availability_start ? 'border-red-400' : ''}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.availability_start ? (
                  format(formData.availability_start, "PPP", { locale: ptBR })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.availability_start}
                onSelect={(date) => handleInputChange("availability_start", date)}
                disabled={(date) => date < new Date()}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
          {errors.availability_start && (
            <p className="text-red-500 text-sm mt-1">{errors.availability_start}</p>
          )}
        </div>
      </div>

      {/* Portfolio Selection */}
      {portfolioItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selecione Itens do Portfólio (máx 3)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {portfolioItems.map((item, idx) => {
                const isSelected = selectedPortfolioItems.some(p => p.title === item.title);
                return (
                  <div
                    key={idx}
                    onClick={() => togglePortfolioItem(item)}
                    className={`relative border-2 rounded-xl overflow-hidden cursor-pointer transition-all ${
                      isSelected ? 'border-purple-500 shadow-lg' : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-10 bg-purple-500 text-white rounded-full p-1">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                    {item.images && item.images[0] ? (
                      <div className="h-32 bg-gray-100">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-32 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <Briefcase className="w-8 h-8 text-purple-400" />
                      </div>
                    )}
                    <div className="p-3">
                      <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {selectedPortfolioItems.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedPortfolioItems.map((item, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-purple-100 text-purple-700">
                    {item.title}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Additional Notes */}
      <div>
        <Label htmlFor="additional_notes" className="text-sm font-semibold text-gray-700 mb-2">
          Observações Adicionais (opcional)
        </Label>
        <Textarea
          id="additional_notes"
          value={formData.additional_notes}
          onChange={(e) => handleInputChange("additional_notes", e.target.value)}
          placeholder="Alguma informação adicional que gostaria de compartilhar?"
          className="min-h-[100px]"
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1 text-right">
          {formData.additional_notes.length}/500
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isSubmitting ? "Enviando..." : "Enviar Proposta"}
        </Button>
      </div>
    </form>
  );
}