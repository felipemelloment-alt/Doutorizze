import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export function useUserArea() {
  const [userArea, setUserArea] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectUserArea = async () => {
      try {
        const user = await base44.auth.me();
        
        // PRIORIDADE 1: Admin pode ver tudo (modo AMBOS)
        if (user.role === "admin") {
          setIsAdmin(true);
          setUserArea("AMBOS");
          setLoading(false);
          return;
        }

        // PRIORIDADE 2: user.vertical (campo obrigatório do onboarding)
        if (user.vertical) {
          setUserArea(user.vertical); // "ODONTOLOGIA" ou "MEDICINA"
          setLoading(false);
          return;
        }

        // FALLBACK 3: Verificar entidades específicas
        // Profissional
        const professionals = await base44.entities.Professional.filter({ user_id: user.id });
        if (professionals.length > 0) {
          const tipo = professionals[0].tipo_profissional;
          const areaOdonto = ["DENTISTA", "AUXILIAR", "TECNICO", "PROTETICO", "ASB", "TSB"];
          setUserArea(areaOdonto.includes(tipo) ? "ODONTOLOGIA" : "MEDICINA");
          setLoading(false);
          return;
        }

        // Clínica
        const owners = await base44.entities.CompanyOwner.filter({ user_id: user.id });
        if (owners.length > 0) {
          const units = await base44.entities.CompanyUnit.filter({ owner_id: owners[0].id });
          if (units.length > 0) {
            setUserArea(units[0].tipo_mundo);
            setLoading(false);
            return;
          }
        }

        // Fornecedor
        const suppliers = await base44.entities.Supplier.filter({ user_id: user.id });
        if (suppliers.length > 0) {
          setUserArea(suppliers[0].area_atuacao || "ODONTOLOGIA");
          setLoading(false);
          return;
        }

        // Hospital
        const hospitals = await base44.entities.Hospital.filter({ user_id: user.id });
        if (hospitals.length > 0) {
          const areas = hospitals[0].areas_atuacao || [];
          setUserArea(areas.includes("ODONTOLOGIA") ? "ODONTOLOGIA" : "MEDICINA");
          setLoading(false);
          return;
        }

        // Instituição
        const institutions = await base44.entities.EducationInstitution.filter({ user_id: user.id });
        if (institutions.length > 0) {
          const areas = institutions[0].areas || [];
          setUserArea(areas.includes("ODONTOLOGIA") ? "ODONTOLOGIA" : "MEDICINA");
          setLoading(false);
          return;
        }

        // Default (não deveria chegar aqui se onboarding está correto)
        console.warn("useUserArea: usuário sem vertical definida, usando ODONTOLOGIA como fallback");
        setUserArea("ODONTOLOGIA");
        setLoading(false);
      } catch (error) {
        console.error("Erro ao detectar área do usuário:", error);
        setUserArea("ODONTOLOGIA");
        setLoading(false);
      }
    };

    detectUserArea();
  }, []);

  return { userArea, isAdmin, loading };
}