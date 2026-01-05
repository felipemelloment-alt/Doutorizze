import { useMemo } from 'react';

// Campos obrigatórios e opcionais para cada tipo de perfil
const profileFields = {
  profissional: {
    required: [
      { field: 'nome_completo', label: 'Nome completo', weight: 10 },
      { field: 'cpf', label: 'CPF', weight: 10 },
      { field: 'data_nascimento', label: 'Data de nascimento', weight: 5 },
      { field: 'whatsapp', label: 'WhatsApp', weight: 10 },
      { field: 'tipo_profissional', label: 'Tipo de profissional', weight: 5 },
      { field: 'registro_conselho', label: 'Registro CRO/CRM', weight: 10 },
      { field: 'uf_conselho', label: 'UF do conselho', weight: 5 },
      { field: 'especialidade_principal', label: 'Especialidade', weight: 10 },
      { field: 'cidades_atendimento', label: 'Cidades de atendimento', weight: 10, isArray: true }
    ],
    optional: [
      { field: 'selfie_documento_url', label: 'Foto de perfil', weight: 5 },
      { field: 'email', label: 'Email', weight: 3 },
      { field: 'instagram', label: 'Instagram', weight: 2 },
      { field: 'experiencias_profissionais', label: 'Experiências', weight: 5, isArray: true },
      { field: 'cursos_aperfeicoamento', label: 'Cursos', weight: 5, isArray: true },
      { field: 'observacoes', label: 'Sobre mim', weight: 5 }
    ]
  },
  clinica: {
    required: [
      { field: 'razao_social', label: 'Razão social', weight: 10 },
      { field: 'nome_fantasia', label: 'Nome fantasia', weight: 10 },
      { field: 'cnpj', label: 'CNPJ', weight: 10 },
      { field: 'email', label: 'Email', weight: 5 },
      { field: 'whatsapp', label: 'WhatsApp', weight: 10 },
      { field: 'cidade', label: 'Cidade', weight: 10 },
      { field: 'uf', label: 'Estado', weight: 5 },
      { field: 'endereco', label: 'Endereço', weight: 10 },
      { field: 'nome_responsavel', label: 'Responsável', weight: 10 }
    ],
    optional: [
      { field: 'foto_fachada_url', label: 'Foto da fachada', weight: 5 },
      { field: 'foto_recepcao_url', label: 'Foto da recepção', weight: 3 },
      { field: 'instagram_clinica', label: 'Instagram', weight: 2 },
      { field: 'google_maps_link', label: 'Link Google Maps', weight: 5 },
      { field: 'ponto_referencia', label: 'Ponto de referência', weight: 2 }
    ]
  }
};

// Verifica se um campo está preenchido
function isFieldFilled(value, isArray = false) {
  if (value === null || value === undefined) return false;
  if (isArray) return Array.isArray(value) && value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'boolean') return true;
  if (typeof value === 'number') return !isNaN(value);
  return Boolean(value);
}

export function useProfileCompletion(profile, type = 'profissional') {
  return useMemo(() => {
    if (!profile) {
      return {
        percentage: 0,
        missingRequired: [],
        missingOptional: [],
        isComplete: false,
        score: 0
      };
    }

    const fields = profileFields[type] || profileFields.profissional;
    const required = fields.required;
    const optional = fields.optional;

    // Calcular campos obrigatórios preenchidos
    const filledRequired = required.filter(f => 
      isFieldFilled(profile[f.field], f.isArray)
    );
    const missingRequired = required.filter(f => 
      !isFieldFilled(profile[f.field], f.isArray)
    );

    // Calcular campos opcionais preenchidos
    const filledOptional = optional.filter(f => 
      isFieldFilled(profile[f.field], f.isArray)
    );
    const missingOptional = optional.filter(f => 
      !isFieldFilled(profile[f.field], f.isArray)
    );

    // Calcular score baseado em peso
    const totalWeight = [...required, ...optional].reduce((sum, f) => sum + f.weight, 0);
    const filledWeight = [...filledRequired, ...filledOptional].reduce((sum, f) => sum + f.weight, 0);
    const score = Math.round((filledWeight / totalWeight) * 100);

    // Porcentagem simples (baseada em campos, não peso)
    const totalFields = required.length + optional.length;
    const filledFields = filledRequired.length + filledOptional.length;
    const percentage = Math.round((filledFields / totalFields) * 100);

    // Está completo se todos obrigatórios estão preenchidos
    const isComplete = missingRequired.length === 0;

    // Próximo campo a completar (prioridade: obrigatórios primeiro)
    const nextField = missingRequired[0] || missingOptional[0] || null;

    // Mensagem de progresso
    let message = '';
    if (percentage < 50) {
      message = 'Complete seu perfil para aparecer nas buscas!';
    } else if (percentage < 75) {
      message = 'Bom progresso! Continue completando seu perfil.';
    } else if (percentage < 100) {
      message = 'Quase lá! Finalize para destacar seu perfil.';
    } else {
      message = 'Perfil completo! Parabéns!';
    }

    return {
      percentage,
      score,
      isComplete,
      missingRequired: missingRequired.map(f => f.label),
      missingOptional: missingOptional.map(f => f.label),
      filledCount: filledFields,
      totalCount: totalFields,
      nextField: nextField?.label,
      message
    };
  }, [profile, type]);
}

// Componente de barra de progresso do perfil
export function ProfileCompletionBar({ percentage, message, className = '' }) {
  const getBarColor = () => {
    if (percentage < 50) return 'from-red-400 to-orange-500';
    if (percentage < 75) return 'from-yellow-400 to-orange-500';
    if (percentage < 100) return 'from-green-400 to-emerald-500';
    return 'from-green-500 to-emerald-600';
  };

  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">Perfil</span>
        <span className="text-sm font-bold text-gray-900">{percentage}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${getBarColor()} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {message && (
        <p className="text-xs text-gray-500 mt-2">{message}</p>
      )}
    </div>
  );
}

export default useProfileCompletion;