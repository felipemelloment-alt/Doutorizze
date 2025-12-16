import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useUserRole() {
  const [role, setRole] = useState(null);
  const [userWorld, setUserWorld] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [profileId, setProfileId] = useState(null);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const user = await base44.auth.me();
        setUserId(user.id);

        // Check if user is a CompanyOwner (has clinics)
        const owners = await base44.entities.CompanyOwner.filter({ user_id: user.id });

        if (owners.length > 0) {
          setRole("CLINICA");
          setProfileId(owners[0].id);

          // Get the first unit to determine the world
          const units = await base44.entities.CompanyUnit.filter({ owner_id: owners[0].id });
          if (units.length > 0) {
            setUserWorld(units[0].tipo_mundo); // ODONTOLOGIA, MEDICINA, or AMBOS
          }
        } else {
          // Check if user is a Professional
          const professionals = await base44.entities.Professional.filter({ user_id: user.id });

          if (professionals.length > 0) {
            const prof = professionals[0];
            setRole("PROFISSIONAL");
            setProfileId(prof.id);

            // Determine world based on tipo_profissional
            if (prof.tipo_profissional === "DENTISTA") {
              setUserWorld("ODONTOLOGIA");
            } else if (prof.tipo_profissional === "MEDICO") {
              setUserWorld("MEDICINA");
            }
          } else {
            // No profile yet - could be ADMIN or new user
            setRole("ADMIN");
            setUserWorld("AMBOS"); // Admin sees everything
          }
        }
      } catch (error) {
        console.error("Error checking role:", error);
        setRole(null);
        setUserWorld(null);
      }
      setLoading(false);
    };

    checkRole();
  }, []);

  return {
    role,
    userWorld,
    loading,
    userId,
    profileId,
    isAdmin: role === "ADMIN",
    isClinic: role === "CLINICA",
    isProfessional: role === "PROFISSIONAL",
    isDentist: role === "PROFISSIONAL" && userWorld === "ODONTOLOGIA",
    isDoctor: role === "PROFISSIONAL" && userWorld === "MEDICINA",
    isDentalClinic: role === "CLINICA" && userWorld === "ODONTOLOGIA",
    isMedicalClinic: role === "CLINICA" && userWorld === "MEDICINA",
    isOdonto: userWorld === "ODONTOLOGIA" || userWorld === "AMBOS",
    isMedical: userWorld === "MEDICINA" || userWorld === "AMBOS"
  };
}