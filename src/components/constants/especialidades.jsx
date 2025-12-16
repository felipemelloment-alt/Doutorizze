export const especialidadesOdontologia = [
  "Clínico Geral",
  "Endodontia",
  "Implantodontia",
  "Ortodontia",
  "Periodontia",
  "Prótese",
  "Odontopediatria",
  "Cirurgia Bucomaxilofacial",
  "Radiologia Odontológica",
  "Harmonização Orofacial",
  "Dentística",
  "Estética Dental",
  "DTM/Dor Orofacial",
  "Odontogeriatria",
  "Odontologia do Trabalho",
];

export const especialidadesMedicina = [
  "Clínico Geral",
  "Cardiologia",
  "Dermatologia",
  "Endocrinologia",
  "Gastroenterologia",
  "Ginecologia e Obstetrícia",
  "Neurologia",
  "Oftalmologia",
  "Ortopedia e Traumatologia",
  "Otorrinolaringologia",
  "Pediatria",
  "Psiquiatria",
  "Urologia",
  "Cirurgia Geral",
  "Anestesiologia",
  "Medicina do Trabalho",
  "Medicina de Família",
  "Geriatria",
  "Reumatologia",
  "Pneumologia",
  "Nefrologia",
  "Infectologia",
  "Oncologia",
  "Hematologia",
  "Nutrologia",
  "Medicina Esportiva",
  "Radioterapia",
  "Reumatologia",
  "Cirurgia vascular",
  "Cirurgia plástica",
  "Cirurgia pediátrica",
  "Cirurgia oncológica",
  "Coloproctologia",
  "Cirurgia cardiovascular",
  "Angiologia",
  "Anestesiologia",
  "Acupuntura",
  "Clínica médica",
  "Endocrinologia e metabologia",
  "Ginecologia e obstetrícia",
  "Hematologia e hemoterapia",
  "Homeopatia",
  "Mastologia",
  "Medicina intensiva",
  "Neurocirurgia",
  "Ortopedia e traumatologia",
  "Patologia"
];

export function getEspecialidades(mundo) {
  if (mundo === "ODONTOLOGIA") return especialidadesOdontologia;
  if (mundo === "MEDICINA") return especialidadesMedicina;
  return [...especialidadesOdontologia, ...especialidadesMedicina];
}

export function getRegistroLabel(mundo) {
  if (mundo === "ODONTOLOGIA") return "CRO";
  if (mundo === "MEDICINA") return "CRM";
  return "Registro";
}

export function getProfissionalLabel(mundo) {
  if (mundo === "ODONTOLOGIA") return "Dentista";
  if (mundo === "MEDICINA") return "Médico";
  return "Profissional";
}

export function getClinicaLabel(mundo) {
  if (mundo === "ODONTOLOGIA") return "Clínica Odontológica";
  if (mundo === "MEDICINA") return "Clínica Médica";
  return "Clínica";
}