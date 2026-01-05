export const especialidadesOdontologia = [
  "Clinico Geral",
  "Endodontia",
  "Implantodontia",
  "Ortodontia",
  "Periodontia",
  "Protese",
  "Odontopediatria",
  "Cirurgia Bucomaxilofacial",
  "Radiologia Odontologica",
  "Harmonizacao Orofacial",
  "Dentistica",
  "Estetica Dental",
  "DTM/Dor Orofacial",
  "Odontogeriatria",
  "Odontologia do Trabalho",
];

export const especialidadesMedicina = [
  "Clinico Geral",
  "Cardiologia",
  "Dermatologia",
  "Endocrinologia",
  "Gastroenterologia",
  "Ginecologia e Obstetricia",
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
  "Medicina de Familia",
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
  "Cirurgia Vascular",
  "Cirurgia Plastica",
  "Cirurgia Pediatrica",
  "Cirurgia Oncologica",
  "Coloproctologia",
  "Cirurgia Cardiovascular",
  "Angiologia",
  "Acupuntura",
  "Clinica Medica",
  "Endocrinologia e Metabologia",
  "Hematologia e Hemoterapia",
  "Homeopatia",
  "Mastologia",
  "Medicina Intensiva",
  "Neurocirurgia",
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
  if (mundo === "MEDICINA") return "Medico";
  return "Profissional";
}

export function getClinicaLabel(mundo) {
  if (mundo === "ODONTOLOGIA") return "Clinica Odontologica";
  if (mundo === "MEDICINA") return "Clinica Medica";
  return "Clinica";
}