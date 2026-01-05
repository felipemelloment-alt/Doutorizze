// Catálogo de categorias e subcategorias do Marketplace

export const catalogoOdonto = {
  categorias: [
    {
      id: "EQUIPAMENTOS",
      nome: "Equipamentos",
      subcategorias: [
        { id: "AUTOCLAVE", nome: "Autoclave" },
        { id: "CADEIRA", nome: "Cadeira Odontológica" },
        { id: "COMPRESSOR", nome: "Compressor" },
        { id: "RAIO_X", nome: "Aparelho de Raio-X" },
        { id: "FOTOPOLIMERIZADOR", nome: "Fotopolimerizador" },
        { id: "AMALGAMADOR", nome: "Amalgamador" },
        { id: "MICROMOTOR", nome: "Micromotor / Contra-ângulo" },
        { id: "ULTRASSOM", nome: "Ultrassom Odontológico" },
        { id: "LASER", nome: "Laser Odontológico" }
      ]
    },
    {
      id: "MOVEIS",
      nome: "Móveis e Mobiliário",
      subcategorias: [
        { id: "MOCHO", nome: "Mocho / Cadeira Auxiliar" },
        { id: "ARMARIO", nome: "Armário / Estante" },
        { id: "CARRINHO", nome: "Carrinho Auxiliar" },
        { id: "MESA", nome: "Mesa / Bancada" }
      ]
    },
    {
      id: "INSTRUMENTAIS",
      nome: "Instrumentais",
      subcategorias: [
        { id: "KIT_INSTRUMENTAL", nome: "Kit de Instrumentais" },
        { id: "PINCA", nome: "Pinças" },
        { id: "ESPELHO", nome: "Espelhos Bucais" },
        { id: "OUTROS", nome: "Outros Instrumentais" }
      ]
    }
  ],
  
  camposDinamicos: {
    AUTOCLAVE: [
      { campo: "litros", label: "Capacidade (litros)", tipo: "number", obrigatorio: true },
      { campo: "voltagem", label: "Voltagem", tipo: "select", opcoes: ["110V", "220V", "Bivolt"], obrigatorio: true },
      { campo: "ciclos", label: "Número de ciclos realizados", tipo: "number", obrigatorio: false },
      { campo: "revisada", label: "Foi revisada recentemente?", tipo: "boolean", obrigatorio: true },
      { campo: "garantia_meses", label: "Meses de garantia restante", tipo: "number", obrigatorio: false }
    ],
    CADEIRA: [
      { campo: "tipo", label: "Tipo", tipo: "select", opcoes: ["Cart", "Acoplada"], obrigatorio: true },
      { campo: "terminais", label: "Número de terminais", tipo: "number", obrigatorio: false },
      { campo: "refletor_led", label: "Refletor LED?", tipo: "boolean", obrigatorio: true },
      { campo: "estofamento", label: "Estado do estofamento", tipo: "select", opcoes: ["Excelente", "Bom", "Regular", "Necessita troca"], obrigatorio: true },
      { campo: "revisada", label: "Foi revisada recentemente?", tipo: "boolean", obrigatorio: true },
      { campo: "marca_modelo", label: "Marca e Modelo", tipo: "text", obrigatorio: false }
    ],
    COMPRESSOR: [
      { campo: "hp", label: "Potência (HP)", tipo: "number", obrigatorio: true },
      { campo: "litros", label: "Capacidade do reservatório (L)", tipo: "number", obrigatorio: false },
      { campo: "isento_oleo", label: "Isento de óleo?", tipo: "boolean", obrigatorio: true },
      { campo: "revisado", label: "Foi revisado recentemente?", tipo: "boolean", obrigatorio: true }
    ],
    RAIO_X: [
      { campo: "tipo", label: "Tipo", tipo: "select", opcoes: ["Periapical", "Panorâmico", "Tomógrafo (CBCT)", "Cefalométrico"], obrigatorio: true },
      { campo: "digital", label: "É digital?", tipo: "boolean", obrigatorio: true },
      { campo: "sensor_incluido", label: "Sensor incluído?", tipo: "boolean", obrigatorio: false },
      { campo: "laudo_anvisa", label: "Possui laudo ANVISA?", tipo: "boolean", obrigatorio: true }
    ],
    FOTOPOLIMERIZADOR: [
      { campo: "tipo_luz", label: "Tipo de luz", tipo: "select", opcoes: ["LED", "Halógena"], obrigatorio: true },
      { campo: "potencia_mw", label: "Potência (mW/cm²)", tipo: "number", obrigatorio: false },
      { campo: "sem_fio", label: "Sem fio?", tipo: "boolean", obrigatorio: true }
    ]
  }
};

export const catalogoMedicina = {
  categorias: [
    {
      id: "EQUIPAMENTOS",
      nome: "Equipamentos",
      subcategorias: [
        { id: "ULTRASSOM", nome: "Ultrassom" },
        { id: "MONITOR", nome: "Monitor Multiparamétrico" },
        { id: "ECG", nome: "Eletrocardiógrafo" },
        { id: "DESFIBRILADOR", nome: "Desfibrilador" },
        { id: "OXIMETRO", nome: "Oxímetro" },
        { id: "BISTURI_ELETRICO", nome: "Bisturi Elétrico" },
        { id: "VENTILADOR", nome: "Ventilador Pulmonar" },
        { id: "BOMBA_INFUSAO", nome: "Bomba de Infusão" }
      ]
    },
    {
      id: "MOVEIS",
      nome: "Móveis Hospitalares",
      subcategorias: [
        { id: "MACA", nome: "Maca Hospitalar" },
        { id: "CAMA", nome: "Cama Hospitalar" },
        { id: "MESA_CIRURGICA", nome: "Mesa Cirúrgica" },
        { id: "ARMARIO", nome: "Armário / Estante" }
      ]
    },
    {
      id: "INSTRUMENTAIS",
      nome: "Instrumentais Cirúrgicos",
      subcategorias: [
        { id: "KIT_CIRURGICO", nome: "Kit Cirúrgico" },
        { id: "PINCA", nome: "Pinças" },
        { id: "TESOURA", nome: "Tesouras" },
        { id: "OUTROS", nome: "Outros Instrumentais" }
      ]
    }
  ],
  
  camposDinamicos: {
    ULTRASSOM: [
      { campo: "tipo", label: "Tipo", tipo: "select", opcoes: ["Obstétrico", "Geral", "Doppler", "Portátil"], obrigatorio: true },
      { campo: "transdutores", label: "Transdutores incluídos", tipo: "text", obrigatorio: false },
      { campo: "tela_polegadas", label: "Tamanho da tela (polegadas)", tipo: "number", obrigatorio: false },
      { campo: "revisado", label: "Foi revisado recentemente?", tipo: "boolean", obrigatorio: true },
      { campo: "laudo_anvisa", label: "Possui laudo ANVISA?", tipo: "boolean", obrigatorio: true }
    ],
    MONITOR: [
      { campo: "parametros", label: "Parâmetros", tipo: "multiselect", opcoes: ["ECG", "SpO2", "PNI", "Temperatura", "Respiração", "Capnografia"], obrigatorio: true },
      { campo: "tela_polegadas", label: "Tamanho da tela", tipo: "number", obrigatorio: false },
      { campo: "bateria", label: "Possui bateria?", tipo: "boolean", obrigatorio: true },
      { campo: "revisado", label: "Foi revisado recentemente?", tipo: "boolean", obrigatorio: true }
    ],
    ECG: [
      { campo: "canais", label: "Número de canais", tipo: "select", opcoes: ["1 canal", "3 canais", "6 canais", "12 canais"], obrigatorio: true },
      { campo: "digital", label: "É digital?", tipo: "boolean", obrigatorio: true },
      { campo: "impressora", label: "Impressora incluída?", tipo: "boolean", obrigatorio: false },
      { campo: "revisado", label: "Foi revisado recentemente?", tipo: "boolean", obrigatorio: true }
    ],
    DESFIBRILADOR: [
      { campo: "tipo", label: "Tipo", tipo: "select", opcoes: ["DEA (Automático)", "Manual", "Semiautomático"], obrigatorio: true },
      { campo: "energia_max_joules", label: "Energia máxima (Joules)", tipo: "number", obrigatorio: false },
      { campo: "modo_pediatrico", label: "Modo pediátrico?", tipo: "boolean", obrigatorio: false },
      { campo: "revisado", label: "Foi revisado recentemente?", tipo: "boolean", obrigatorio: true },
      { campo: "laudo_anvisa", label: "Possui laudo ANVISA?", tipo: "boolean", obrigatorio: true }
    ]
  }
};

export const getCatalogo = (tipoMundo) => {
  return tipoMundo === "ODONTOLOGIA" ? catalogoOdonto : catalogoMedicina;
};

export const getCamposDinamicos = (tipoMundo, subcategoria) => {
  const catalogo = getCatalogo(tipoMundo);
  return catalogo.camposDinamicos[subcategoria] || [];
};