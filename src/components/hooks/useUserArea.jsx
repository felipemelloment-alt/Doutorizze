import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export function useUserArea() {
  const [userArea, setUserArea] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectUserArea = async () => {
      try {
        const user = await base44.auth.me();
        
        // Verificar se é profissional
        const professionals = await base44.entities.Professional.filter({ user_id: user.id });
        if (professionals.length > 0) {
          const tipo = professionals[0].tipo_profissional;
          const areaOdonto = ["DENTISTA", "AUXILIAR", "TECNICO", "PROTETICO", "ASB", "TSB"];
          setUserArea(areaOdonto.includes(tipo) ? "ODONTOLOGIA" : "MEDICINA");
          setLoading(false);
          return;
        }

        // Verificar se é clínica
        const owners = await base44.entities.CompanyOwner.filter({ user_id: user.id });
        if (owners.length > 0) {
          const units = await base44.entities.CompanyUnit.filter({ owner_id: owners[0].id });
          if (units.length > 0) {
            const tipo = units[0].tipo_mundo;
            setUserArea(tipo);
            setLoading(false);
            return;
          }
        }

        // Verificar se é fornecedor
        const suppliers = await base44.entities.Supplier.filter({ user_id: user.id });
        if (suppliers.length > 0) {
          setUserArea(suppliers[0].area_atuacao || "ODONTOLOGIA");
          setLoading(false);
          return;
        }

        // Verificar se é hospital
        const hospitals = await base44.entities.Hospital.filter({ user_id: user.id });
        if (hospitals.length > 0) {
          const areas = hospitals[0].areas_atuacao || [];
          setUserArea(areas.includes("ODONTOLOGIA") ? "ODONTOLOGIA" : "MEDICINA");
          setLoading(false);
          return;
        }

        // Verificar se é instituição
        const institutions = await base44.entities.EducationInstitution.filter({ user_id: user.id });
        if (institutions.length > 0) {
          const areas = institutions[0].areas || [];
          setUserArea(areas.includes("ODONTOLOGIA") ? "ODONTOLOGIA" : "MEDICINA");
          setLoading(false);
          return;
        }

        // Default
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

  return { userArea, loading };
}