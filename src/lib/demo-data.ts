// ---------------------------------------------------------------------------
// MarketingHub AI — Datos DEMO (ficticios)
// Todos los registros están marcados con `demo: true`.
// Esta capa simula el futuro backend (Supabase) y los conectores externos
// (Firecrawl, Apify, Google CSE, CRM, enriquecimiento de leads).
// ---------------------------------------------------------------------------

export type ValidationStatus =
  | "Nuevo"
  | "Pendiente de validar"
  | "Validado"
  | "No válido"
  | "Duplicado"
  | "Enriquecido"
  | "Apto para investigación comercial"
  | "No apto para campaña directa"
  | "Pendiente de consentimiento"
  | "Consentimiento obtenido"
  | "Excluido"
  | "Convertido en cliente";

export type Tri = "sí" | "no" | "pendiente";
export type RiskLevel = "bajo" | "medio" | "alto";
export type FitLevel = "alto" | "medio" | "bajo";

export interface BusinessIdea {
  id: string;
  name: string;
  description: string;
  problem_solved: string;
  main_benefit: string;
  differentiator: string;
  target_customer: string;
  sector: string;
  geography: string;
  company_size: string;
  target_role: string;
  keywords: string[];
  excluded_keywords: string[];
  language: string;
  channel: string;
  maturity_level: string;
  objective: string;
  legal_constraints: string;
  competitors: string;
  status: "En curso" | "Finalizada" | "Borrador";
  archived?: boolean;
  archived_at?: string | null;
  created_at: string;
  created_by: string;
  demo: true;
}

export interface ViabilityAnalysis {
  id: string;
  business_idea_id: string;
  executive_summary: string;
  viability_score: number;
  clarity_score: number;
  product_market_fit_score: number;
  lead_identification_score: number;
  legal_risk_level: RiskLevel;
  commercial_risk_level: RiskLevel;
  initial_potential: RiskLevel;
  hypotheses: string[];
  barriers: string[];
  sales_arguments: string[];
  objections: string[];
  positioning: string[];
  channels: string[];
  recommendation: "Seguir" | "Ajustar" | "Descartar";
  recommendation_reason: string;
  next_steps: string[];
  segments: Segment[];
  ai_model: string;
  prompt_version: string;
  created_at: string;
  demo: true;
}

export interface Segment {
  name: string;
  description: string;
  icp: string;
  priority_sectors: string[];
  company_types: string[];
  roles: string[];
  fit_score: number;
  preliminary_message: string;
}

export interface LeadContact {
  id: string;
  potential_lead_id: string;
  contact_name: string;
  job_title: string;
  corporate_email: string | null;
  corporate_phone: string | null;
  profile_url: string | null;
  source_url: string;
  source_type: string;
  confidence_level: "alta" | "media" | "baja";
  consent_status: "Sin consentimiento" | "Pendiente" | "Obtenido";
  legal_status: string;
  contact_allowed: Tri;
  decision_reason: string;
  demo: true;
}

export interface AiDraft {
  id: string;
  potential_lead_id: string;
  business_idea_id: string;
  channel: "Email" | "LinkedIn" | "Llamada" | "WhatsApp";
  message_type: string;
  draft_text: string;
  status: "borrador";
  risk_warning: string | null;
  prompt_id: string;
  prompt_version: string;
  ai_model: string;
  created_at: string;
  demo: true;
}

export interface HistoryEntry {
  action: string;
  previous_status: string;
  new_status: string;
  user: string;
  created_at: string;
}

export interface PotentialLead {
  id: string;
  business_idea_id: string;
  company_name: string;
  commercial_name: string;
  sector: string;
  subsector: string;
  country: string;
  city: string;
  website: string;
  linkedin_url: string | null;
  company_description: string;
  fit_reason: string;
  detected_need: string;
  company_size: string;
  customer_type: string;
  fit_level: FitLevel;
  opportunity_score: number;
  source_name: string;
  source_url: string;
  source_type: string;
  retrieved_at: string;
  validation_status: ValidationStatus;
  legal_basis: string;
  purpose: string;
  requires_consent: Tri;
  consent_available: "sí" | "no";
  email_marketing_allowed: Tri;
  whatsapp_marketing_allowed: Tri;
  contact_allowed: Tri;
  risk_level: RiskLevel;
  legal_recommendation: string;
  notes: string;
  region?: string;
  province?: string;
  postal_code?: string;
  archived?: boolean;
  contacts: LeadContact[];
  ai_analysis: {
    why_fits: string;
    probable_need: string;
    objections: string[];
    next_action: string;
  };
  history: HistoryEntry[];
  demo: true;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  requires_api_key: boolean;
  status: "Conectado (demo)" | "No configurado" | "Planificado";
  usage_policy: string;
  demo: true;
}

export interface AiPrompt {
  id: string;
  nombre: string;
  categoria: string;
  tipo: string;
  version: string;
  sistema: string;
  plantilla: string;
  variables: string[];
  modelo: string;
  estado: "borrador" | "produccion";
  owner: string;
  fecha_actualizacion: string;
  versions: { version: string; cambios: string; autor: string; fecha: string; activo: boolean }[];
  demo: true;
}

// --- Ideas de negocio -------------------------------------------------------

export const businessIdeas: BusinessIdea[] = [
  {
    id: "idea-1",
    name: "Plataforma de mantenimiento predictivo industrial",
    description:
      "SaaS que conecta sensores IoT existentes en planta y predice fallos de maquinaria antes de que ocurran.",
    problem_solved: "Paradas de producción no planificadas con alto coste horario.",
    main_benefit: "Reducción estimada del 30% de paradas no planificadas.",
    differentiator: "No requiere sustituir sensores ni cambiar el SCADA existente.",
    target_customer: "Empresa industrial con planta propia",
    sector: "Industria manufacturera",
    geography: "España, Portugal",
    company_size: "50-500 empleados",
    target_role: "Director de Operaciones / Jefe de Mantenimiento",
    keywords: ["mantenimiento predictivo", "IoT industrial", "OEE", "paradas de planta"],
    excluded_keywords: ["consultoría genérica", "formación"],
    language: "Español",
    channel: "Email",
    maturity_level: "MVP",
    objective: "Captar leads",
    legal_constraints: "Solo contactos corporativos con fuente trazable. No usar WhatsApp.",
    competitors: "Senseye, Augury",
    status: "Finalizada",
    created_at: "2026-07-14",
    created_by: "marta.lopez@demo.local",
    demo: true,
  },
  {
    id: "idea-2",
    name: "Gestor de cumplimiento RGPD para pymes",
    description:
      "Herramienta que automatiza el registro de actividades de tratamiento y las solicitudes de derechos.",
    problem_solved: "Las pymes no tienen recursos para mantener la documentación RGPD al día.",
    main_benefit: "Cumplimiento documentado en horas, no en semanas.",
    differentiator: "Plantillas sectoriales y auditoría continua automatizada.",
    target_customer: "Pyme con datos de clientes",
    sector: "Servicios profesionales",
    geography: "España",
    company_size: "10-200 empleados",
    target_role: "Responsable de Compliance / Gerencia",
    keywords: ["RGPD", "compliance", "protección de datos", "DPO externo"],
    excluded_keywords: ["despacho de abogados"],
    language: "Español",
    channel: "LinkedIn",
    maturity_level: "Producto definido",
    objective: "Validar interés",
    legal_constraints: "Sin envíos masivos. Solicitud previa de consentimiento.",
    competitors: "Pridatect, Grupo Adaptalia",
    status: "En curso",
    created_at: "2026-07-28",
    created_by: "marta.lopez@demo.local",
    demo: true,
  },
  {
    id: "idea-3",
    name: "Marketplace de logística de última milla sostenible",
    description: "Conecta e-commerce con flotas eléctricas locales verificadas.",
    problem_solved: "Coste y huella de carbono de la última milla en zonas urbanas ZBE.",
    main_benefit: "Entrega urbana sin emisiones y con menor coste por pedido.",
    differentiator: "Red verificada y reporte de huella listo para auditoría.",
    target_customer: "E-commerce con volumen medio",
    sector: "Retail / E-commerce",
    geography: "España, Francia",
    company_size: "20-300 empleados",
    target_role: "Head of Logistics / Supply Chain Manager",
    keywords: ["última milla", "ZBE", "logística sostenible", "reparto eléctrico"],
    excluded_keywords: ["mudanzas", "paquetería internacional"],
    language: "Español",
    channel: "Email",
    maturity_level: "Idea inicial",
    objective: "Analizar mercado",
    legal_constraints: "Solo datos empresariales públicos.",
    competitors: "Paack, Vaimo Green",
    status: "En curso",
    created_at: "2026-08-01",
    created_by: "javier.ruiz@demo.local",
    demo: true,
  },
];

// --- Análisis de viabilidad -------------------------------------------------

export const viabilityAnalyses: ViabilityAnalysis[] = [
  {
    id: "va-1",
    business_idea_id: "idea-1",
    executive_summary:
      "Propuesta clara con dolor cuantificable y presupuesto identificable en planta. El encaje es alto en manufactura discreta de 50-500 empleados con maquinaria crítica. La principal barrera es la desconfianza ante proyectos IoT previos fallidos.",
    viability_score: 78,
    clarity_score: 84,
    product_market_fit_score: 72,
    lead_identification_score: 88,
    legal_risk_level: "bajo",
    commercial_risk_level: "medio",
    initial_potential: "alto",
    hypotheses: [
      "El coste hora de parada supera los 2.000 € en el segmento objetivo.",
      "El jefe de mantenimiento influye pero no firma; decide operaciones o dirección.",
      "Un piloto de 8 semanas es suficiente para demostrar valor.",
    ],
    barriers: [
      "Ciclo de venta largo (4-9 meses).",
      "Integración con SCADA heredado.",
      "Escepticismo por proyectos IoT anteriores.",
    ],
    sales_arguments: [
      "Sin sustituir sensores: aprovecha la instrumentación existente.",
      "Piloto medible sobre una línea concreta.",
      "Retorno expresado en horas de parada evitadas.",
    ],
    objections: [
      "Ya tenemos un plan de mantenimiento preventivo.",
      "Nuestros datos no están normalizados.",
      "¿Quién mantiene esto internamente?",
    ],
    positioning: [
      "No es un proyecto IoT: es una capa de predicción sobre lo que ya tiene.",
      "Hablar de OEE y horas de parada, no de machine learning.",
    ],
    channels: ["Email corporativo", "LinkedIn", "Ferias sectoriales", "Asociaciones industriales"],
    recommendation: "Seguir",
    recommendation_reason:
      "Dolor cuantificable, comprador identificable y datos empresariales fácilmente localizables por fuentes públicas.",
    next_steps: [
      "Validar coste/hora de parada con 5 entrevistas.",
      "Definir el alcance del piloto de 8 semanas.",
      "Priorizar el segmento de automoción y componentes.",
    ],
    segments: [
      {
        name: "Manufactura discreta con líneas críticas",
        description:
          "Fabricantes de componentes con líneas de producción continuas donde una parada afecta directamente a la entrega.",
        icp: "Empresa de 80-400 empleados, 1-3 plantas en España, con SCADA instalado y responsable de mantenimiento propio.",
        priority_sectors: ["Automoción", "Componentes metálicos", "Plásticos técnicos"],
        company_types: ["Fabricante Tier 2", "Fabricante Tier 3"],
        roles: ["Director de Operaciones", "Jefe de Mantenimiento", "Plant Manager"],
        fit_score: 86,
        preliminary_message:
          "Trabajamos con plantas Tier 2 que ya tienen sensórica instalada y quieren anticipar fallos sin sustituir equipos. ¿Tiene sentido comentar cómo medís hoy las paradas no planificadas?",
      },
      {
        name: "Industria alimentaria con envasado continuo",
        description: "Plantas con líneas de envasado 24/7 y alta penalización por parada.",
        icp: "Empresa de 100-500 empleados con turnos continuos y certificaciones de calidad exigentes.",
        priority_sectors: ["Alimentación", "Bebidas"],
        company_types: ["Envasador", "Fabricante de marca propia"],
        roles: ["Director Industrial", "Responsable de Mantenimiento"],
        fit_score: 74,
        preliminary_message:
          "En líneas de envasado continuo, cada parada tiene coste directo. ¿Cómo estáis anticipando hoy los fallos de los equipos críticos?",
      },
      {
        name: "Operadores de servicios técnicos externalizados",
        description: "Empresas que gestionan el mantenimiento de terceros y pueden revender la capa predictiva.",
        icp: "Empresa de servicios de mantenimiento con cartera de 10+ plantas.",
        priority_sectors: ["Servicios industriales"],
        company_types: ["Partner", "Integrador"],
        roles: ["Director de Servicio", "Responsable de Desarrollo de Negocio"],
        fit_score: 61,
        preliminary_message:
          "Estamos explorando acuerdos con empresas de mantenimiento que quieran añadir predicción a su servicio actual.",
      },
    ],
    ai_model: "google/gemini-3.6-flash (simulado)",
    prompt_version: "viabilidad_v1.2",
    created_at: "2026-07-14",
    demo: true,
  },
  {
    id: "va-2",
    business_idea_id: "idea-2",
    executive_summary:
      "Mercado amplio pero con baja urgencia percibida hasta que existe inspección o incidente. La propuesta es clara; el reto es la disposición a pagar de la pyme pequeña.",
    viability_score: 61,
    clarity_score: 78,
    product_market_fit_score: 55,
    lead_identification_score: 70,
    legal_risk_level: "medio",
    commercial_risk_level: "medio",
    initial_potential: "medio",
    hypotheses: [
      "La pyme paga solo tras un aviso o auditoría.",
      "El canal asesoría/gestoría es más eficiente que la venta directa.",
    ],
    barriers: ["Baja urgencia", "Competencia con despachos y consultoras low-cost"],
    sales_arguments: ["Documentación lista para inspección", "Coste inferior a un DPO externo"],
    objections: ["Ya lo lleva mi gestoría", "No nos han inspeccionado nunca"],
    positioning: ["Seguro documental, no software legal"],
    channels: ["LinkedIn", "Partners: gestorías y asesorías", "Contenido"],
    recommendation: "Ajustar",
    recommendation_reason: "Reenfocar hacia canal partner (asesorías) en lugar de venta directa a pyme.",
    next_steps: ["Entrevistar 10 gestorías", "Probar oferta de marca blanca"],
    segments: [
      {
        name: "Gestorías y asesorías como canal",
        description: "Despachos que gestionan compliance de decenas de pymes.",
        icp: "Asesoría de 5-50 empleados con más de 100 clientes pyme.",
        priority_sectors: ["Servicios profesionales"],
        company_types: ["Asesoría fiscal-laboral", "Consultora de compliance"],
        roles: ["Socio director", "Responsable de compliance"],
        fit_score: 79,
        preliminary_message:
          "Estamos validando una herramienta de RGPD en marca blanca para asesorías. ¿Os interesaría revisarla?",
      },
      {
        name: "Clínicas y centros sanitarios privados",
        description: "Tratan datos de salud y tienen exposición alta.",
        icp: "Centro sanitario privado de 10-100 empleados.",
        priority_sectors: ["Salud privada"],
        company_types: ["Clínica", "Centro médico"],
        roles: ["Gerente", "Responsable de calidad"],
        fit_score: 68,
        preliminary_message:
          "En centros sanitarios el tratamiento de datos de salud exige documentación específica. ¿Cómo la mantenéis hoy?",
      },
    ],
    ai_model: "google/gemini-3.6-flash (simulado)",
    prompt_version: "viabilidad_v1.2",
    created_at: "2026-07-28",
    demo: true,
  },
  {
    id: "va-3",
    business_idea_id: "idea-3",
    executive_summary:
      "Tendencia regulatoria favorable (ZBE) pero modelo marketplace intensivo en oferta. Alto riesgo de arranque por doble mercado.",
    viability_score: 52,
    clarity_score: 64,
    product_market_fit_score: 48,
    lead_identification_score: 66,
    legal_risk_level: "bajo",
    commercial_risk_level: "alto",
    initial_potential: "medio",
    hypotheses: ["El e-commerce medio prioriza coste sobre huella", "Existe flota eléctrica ociosa en grandes ciudades"],
    barriers: ["Arranque de doble mercado", "Márgenes logísticos estrechos"],
    sales_arguments: ["Cumplimiento ZBE", "Reporte de huella auditable"],
    objections: ["Ya tengo acuerdo con mi operador", "El coste es superior"],
    positioning: ["Cumplimiento urbano, no solo sostenibilidad"],
    channels: ["Email", "Eventos e-commerce"],
    recommendation: "Ajustar",
    recommendation_reason: "Empezar por una única ciudad y un vertical concreto antes de abrir marketplace.",
    next_steps: ["Elegir ciudad piloto", "Cerrar 3 flotas antes de captar demanda"],
    segments: [
      {
        name: "E-commerce urbano de alta rotación",
        description: "Tiendas online con entrega same-day en capitales.",
        icp: "E-commerce de 20-200 empleados con >500 pedidos/día en área urbana.",
        priority_sectors: ["Retail", "Alimentación online"],
        company_types: ["E-commerce puro", "Retail omnicanal"],
        roles: ["Head of Logistics", "Supply Chain Manager"],
        fit_score: 70,
        preliminary_message:
          "Estamos analizando cómo afectan las ZBE al reparto urbano. ¿Cómo estáis cubriendo hoy la última milla en centro ciudad?",
      },
    ],
    ai_model: "google/gemini-3.6-flash (simulado)",
    prompt_version: "viabilidad_v1.2",
    created_at: "2026-08-01",
    demo: true,
  },
];

// --- Leads ------------------------------------------------------------------

const sectors = [
  "Automoción",
  "Componentes metálicos",
  "Plásticos técnicos",
  "Alimentación",
  "Servicios industriales",
  "Servicios profesionales",
  "Salud privada",
  "Retail / E-commerce",
];
const cities: Record<string, string[]> = {
  España: ["Barcelona", "Madrid", "Valencia", "Zaragoza", "Bilbao", "Sevilla", "Vigo"],
  Portugal: ["Lisboa", "Oporto", "Braga"],
  Francia: ["Lyon", "Toulouse", "Burdeos"],
};
const sizes = ["10-49", "50-199", "200-499", "500+"];

function makeLead(i: number): PotentialLead {
  const ideaId = i < 16 ? "idea-1" : i < 24 ? "idea-2" : "idea-3";
  const sector =
    ideaId === "idea-1"
      ? sectors[i % 5]!
      : ideaId === "idea-2"
        ? sectors[5 + (i % 2)]!
        : "Retail / E-commerce";
  const country = i % 9 === 0 ? "Portugal" : i % 11 === 0 ? "Francia" : "España";
  const cityList = cities[country] ?? cities['España']!;
  const city = cityList[i % cityList.length]!;
  const slug = `demo-empresa-${i + 1}`;
  const score = 42 + ((i * 13) % 55);
  const fit: FitLevel = score >= 78 ? "alto" : score >= 60 ? "medio" : "bajo";

  // Distribución de estados de validación y legales (ver spec §17)
  let validation: ValidationStatus = "Nuevo";
  let consent: "Sin consentimiento" | "Pendiente" | "Obtenido" = "Sin consentimiento";
  let risk: RiskLevel = "bajo";
  let notes = "Registro de demostración generado por el modo Datos simulados.";
  if (i < 5) {
    validation = "No apto para campaña directa";
    consent = "Sin consentimiento";
    risk = "alto";
    notes = "Sin base jurídica válida para comunicación comercial directa.";
  } else if (i < 10) {
    validation = "Pendiente de validar";
    consent = "Pendiente";
    risk = "medio";
    notes = "Fuente localizada pero pendiente de comprobación manual.";
  } else if (i < 15) {
    validation = "Validado";
    consent = "Obtenido";
    risk = "bajo";
    notes = "Fuente corporativa verificada y consentimiento documentado.";
  } else if (i < 18) {
    validation = "Enriquecido";
    consent = "Pendiente";
    risk = "medio";
  } else if (i === 18) {
    validation = "Duplicado";
    notes = "Coincide con demo-empresa-4 (mismo CIF simulado).";
  } else if (i === 19) {
    validation = "No válido";
    risk = "alto";
    notes = "Dato sin fuente trazable: descartado automáticamente.";
  } else if (i === 20) {
    validation = "Convertido en cliente";
    consent = "Obtenido";
  } else if (i < 25) {
    validation = "Apto para investigación comercial";
  } else {
    validation = "Nuevo";
  }

  const hasContact = i % 2 === 0 && validation !== "No válido";
  const consentOk = consent === "Obtenido";
  const emailAllowed: Tri = consentOk ? "sí" : consent === "Pendiente" ? "pendiente" : "no";
  const contactAllowed: Tri =
    validation === "No válido" || validation === "No apto para campaña directa"
      ? "no"
      : consentOk
        ? "sí"
        : "pendiente";

  const sourceNames = [
    "Registro Mercantil (demo)",
    "Web corporativa (demo)",
    "Directorio sectorial (demo)",
    "Google Custom Search (demo)",
    "Carga manual",
  ];
  const sourceName = validation === "No válido" ? "Sin fuente" : sourceNames[i % sourceNames.length]!;

  const contacts: LeadContact[] = hasContact
    ? [
        {
          id: `contact-${i + 1}`,
          potential_lead_id: `lead-${i + 1}`,
          contact_name: `Contacto Demo ${i + 1}`,
          job_title:
            ideaId === "idea-1"
              ? ["Director de Operaciones", "Jefe de Mantenimiento", "Plant Manager"][i % 3]!
              : ideaId === "idea-2"
                ? ["Socio director", "Responsable de Compliance"][i % 2]!
                : ["Head of Logistics", "Supply Chain Manager"][i % 2]!,
          corporate_email: `contacto${i + 1}@${slug}.example`,
          corporate_phone: i % 4 === 0 ? "+34 900 000 000 (centralita demo)" : null,
          profile_url: i % 3 === 0 ? `https://www.linkedin.com/company/${slug}` : null,
          source_url: `https://${slug}.example/contacto`,
          source_type: "Página corporativa pública",
          confidence_level: consentOk ? "alta" : i % 3 === 0 ? "media" : "baja",
          consent_status: consent,
          legal_status: consentOk ? "Base jurídica documentada" : "Pendiente de base jurídica",
          contact_allowed: contactAllowed,
          decision_reason: consentOk
            ? "Email corporativo genérico con fuente pública y finalidad B2B documentada."
            : "Sin consentimiento registrado para comunicaciones comerciales.",
          demo: true,
        },
      ]
    : [];

  return {
    id: `lead-${i + 1}`,
    business_idea_id: ideaId,
    company_name: `Demo Empresa ${i + 1}, S.L. (ficticia)`,
    commercial_name: `DemoCorp ${i + 1}`,
    sector,
    subsector: ideaId === "idea-1" ? "Fabricación Tier 2" : ideaId === "idea-2" ? "Asesoría" : "Comercio online",
    country,
    city,
    website: `https://${slug}.example`,
    linkedin_url: i % 3 === 0 ? `https://www.linkedin.com/company/${slug}` : null,
    company_description:
      "Empresa ficticia creada para demostración del módulo. No corresponde a ninguna organización real.",
    fit_reason:
      ideaId === "idea-1"
        ? "Opera líneas de producción continuas con maquinaria crítica y ya dispone de sensórica instalada."
        : ideaId === "idea-2"
          ? "Gestiona datos de clientes de terceros y publica política de privacidad desactualizada."
          : "Realiza envíos urbanos diarios en una ciudad con zona de bajas emisiones activa.",
    detected_need:
      ideaId === "idea-1"
        ? "Reducir paradas no planificadas en la línea principal."
        : ideaId === "idea-2"
          ? "Actualizar el registro de actividades de tratamiento."
          : "Cubrir reparto en centro urbano sin penalización por emisiones.",
    company_size: sizes[i % sizes.length]!,
    customer_type: ideaId === "idea-3" ? "E-commerce" : "Empresa B2B",
    fit_level: fit,
    opportunity_score: score,
    source_name: sourceName,
    source_url: validation === "No válido" ? "" : `https://${slug}.example/quienes-somos`,
    source_type: validation === "No válido" ? "Desconocida" : "Fuente pública empresarial",
    retrieved_at: `2026-07-${String(10 + (i % 20)).padStart(2, "0")}`,
    validation_status: validation,
    legal_basis: consentOk ? "Interés legítimo B2B documentado" : "Pendiente de determinar",
    purpose: "Investigación comercial y evaluación de encaje de producto",
    requires_consent: consentOk ? "no" : "sí",
    consent_available: consentOk ? "sí" : "no",
    email_marketing_allowed: emailAllowed,
    whatsapp_marketing_allowed: "no",
    contact_allowed: contactAllowed,
    risk_level: risk,
    legal_recommendation:
      validation === "No válido"
        ? "Descartar el registro: no existe fuente trazable."
        : consentOk
          ? "Apto para contacto comercial inicial B2B con derecho de oposición visible."
          : "Solicitar consentimiento previo antes de cualquier campaña directa.",
    notes,
    contacts,
    ai_analysis: {
      why_fits:
        "El perfil de la empresa coincide con el segmento prioritario detectado en el análisis de viabilidad (tamaño, sector y actividad declarada en su web pública).",
      probable_need:
        ideaId === "idea-1"
          ? "Anticipar fallos en equipos críticos sin sustituir instrumentación."
          : ideaId === "idea-2"
            ? "Documentar el cumplimiento sin dedicar recursos internos."
            : "Reducir coste y penalizaciones del reparto urbano.",
      objections: ["Ya tenemos una solución interna", "No es prioridad este trimestre", "Presupuesto cerrado"],
      next_action:
        contactAllowed === "sí"
          ? "Preparar email de exploración en borrador y revisar antes de enviar."
          : "Solicitar validación legal antes de cualquier acción de contacto.",
    },
    history: [
      {
        action: "Lead creado (modo datos simulados)",
        previous_status: "—",
        new_status: "Nuevo",
        user: "sistema",
        created_at: "2026-07-14 09:12",
      },
      {
        action: "Validación automática de fuente",
        previous_status: "Nuevo",
        new_status: validation,
        user: "sistema",
        created_at: "2026-07-14 09:13",
      },
    ],
    demo: true,
  };
}

export const potentialLeads: PotentialLead[] = Array.from({ length: 30 }, (_, i) => makeLead(i));

// --- Borradores de mensajes -------------------------------------------------

export const aiDrafts: AiDraft[] = [
  {
    id: "draft-1",
    potential_lead_id: "lead-11",
    business_idea_id: "idea-1",
    channel: "Email",
    message_type: "Email inicial de exploración",
    draft_text:
      "Asunto: Paradas no planificadas en línea de producción\n\nBuenos días,\n\nTrabajamos con plantas industriales que ya tienen sensórica instalada y quieren anticipar fallos sin sustituir equipos.\n\n¿Tiene sentido una conversación de 15 minutos para ver cómo medís hoy las paradas no planificadas?\n\nPuede oponerse a recibir más comunicaciones respondiendo BAJA.",
    status: "borrador",
    risk_warning: null,
    prompt_id: "prompt-1",
    prompt_version: "1.2",
    ai_model: "google/gemini-3.6-flash (simulado)",
    created_at: "2026-07-30",
    demo: true,
  },
  {
    id: "draft-2",
    potential_lead_id: "lead-12",
    business_idea_id: "idea-1",
    channel: "LinkedIn",
    message_type: "Mensaje de LinkedIn",
    draft_text:
      "Hola, estoy hablando con responsables de mantenimiento sobre cómo anticipan fallos en equipos críticos. ¿Te interesaría comparar enfoques?",
    status: "borrador",
    risk_warning: null,
    prompt_id: "prompt-2",
    prompt_version: "1.0",
    ai_model: "google/gemini-3.6-flash (simulado)",
    created_at: "2026-07-30",
    demo: true,
  },
  {
    id: "draft-3",
    potential_lead_id: "lead-2",
    business_idea_id: "idea-1",
    channel: "Email",
    message_type: "Mensaje de solicitud de consentimiento",
    draft_text:
      "Buenos días,\n\nHemos localizado su empresa en una fuente pública empresarial. Antes de enviarle cualquier información comercial, le pedimos su autorización expresa.\n\nSi desea recibirla, responda AUTORIZO. En caso contrario no volveremos a contactarle.",
    status: "borrador",
    risk_warning: "Lead marcado como NO APTO para campaña directa: solo puede usarse para solicitar consentimiento.",
    prompt_id: "prompt-4",
    prompt_version: "1.1",
    ai_model: "google/gemini-3.6-flash (simulado)",
    created_at: "2026-07-31",
    demo: true,
  },
  {
    id: "draft-4",
    potential_lead_id: "lead-13",
    business_idea_id: "idea-1",
    channel: "Llamada",
    message_type: "Guion de llamada",
    draft_text:
      "Apertura: identificarse y motivo de la llamada.\nPregunta 1: ¿Cuántas paradas no planificadas tuvisteis el último trimestre?\nPregunta 2: ¿Cómo las detectáis hoy?\nCierre: proponer piloto de 8 semanas en una línea.",
    status: "borrador",
    risk_warning: null,
    prompt_id: "prompt-3",
    prompt_version: "1.0",
    ai_model: "google/gemini-3.6-flash (simulado)",
    created_at: "2026-07-31",
    demo: true,
  },
  {
    id: "draft-5",
    potential_lead_id: "lead-21",
    business_idea_id: "idea-2",
    channel: "Email",
    message_type: "Mensaje de validación de interés",
    draft_text:
      "Buenos días,\n\nEstamos validando una herramienta de cumplimiento RGPD en marca blanca para asesorías. ¿Le interesaría revisarla y darnos su opinión?",
    status: "borrador",
    risk_warning: "Consentimiento pendiente: no utilizar para campaña masiva.",
    prompt_id: "prompt-1",
    prompt_version: "1.2",
    ai_model: "google/gemini-3.6-flash (simulado)",
    created_at: "2026-08-01",
    demo: true,
  },
];

// --- Fuentes de datos -------------------------------------------------------

export const dataSources: DataSource[] = [
  {
    id: "src-1",
    name: "Datos simulados (demo)",
    type: "Interno",
    enabled: true,
    requires_api_key: false,
    status: "Conectado (demo)",
    usage_policy: "Genera empresas y contactos ficticios etiquetados como datos demo.",
    demo: true,
  },
  {
    id: "src-2",
    name: "Carga manual / lista de URLs",
    type: "Interno",
    enabled: true,
    requires_api_key: false,
    status: "Conectado (demo)",
    usage_policy: "El usuario aporta la fuente y asume la trazabilidad del origen.",
    demo: true,
  },
  {
    id: "src-3",
    name: "Firecrawl",
    type: "Extracción web controlada",
    enabled: false,
    requires_api_key: true,
    status: "No configurado",
    usage_policy: "Respetar robots.txt y términos de uso. Sin datos personales sensibles. Frecuencia limitada.",
    demo: true,
  },
  {
    id: "src-4",
    name: "Apify",
    type: "Actores de búsqueda y enriquecimiento",
    enabled: false,
    requires_api_key: true,
    status: "No configurado",
    usage_policy: "Solo actores autorizados. Registro obligatorio de fuente y fecha.",
    demo: true,
  },
  {
    id: "src-5",
    name: "Google Custom Search",
    type: "Buscador",
    enabled: false,
    requires_api_key: true,
    status: "No configurado",
    usage_policy: "Solo resultados públicos indexados. Registro de URL de origen.",
    demo: true,
  },
  {
    id: "src-6",
    name: "LinkedIn / Sales Navigator",
    type: "Red profesional",
    enabled: false,
    requires_api_key: true,
    status: "Planificado",
    usage_policy: "Solo con acceso autorizado y conforme a los términos de la plataforma. Sin scraping.",
    demo: true,
  },
  {
    id: "src-7",
    name: "Proveedor de validación de email",
    type: "Enriquecimiento",
    enabled: false,
    requires_api_key: true,
    status: "Planificado",
    usage_policy: "Verificación técnica de buzones corporativos. No genera datos personales nuevos.",
    demo: true,
  },
  {
    id: "src-8",
    name: "CRM corporativo",
    type: "Sistema interno",
    enabled: false,
    requires_api_key: true,
    status: "Planificado",
    usage_policy: "Sincronización bidireccional de leads validados y estados de consentimiento.",
    demo: true,
  },
  {
    id: "src-9",
    name: "Supabase (base de datos del módulo)",
    type: "Persistencia",
    enabled: false,
    requires_api_key: false,
    status: "Planificado",
    usage_policy: "Persistencia de ideas, análisis, leads, logs de validación y catálogo de prompts.",
    demo: true,
  },
];

// --- Catálogo de prompts (gobierno IA) --------------------------------------

export const aiPrompts: AiPrompt[] = [
  {
    id: "prompt-1",
    nombre: "Email_Exploracion_B2B",
    categoria: "Marketing › Captación",
    tipo: "email",
    version: "1.2",
    sistema:
      "Eres un experto en ventas consultivas B2B. No inventes información sobre la empresa. Usa un tono ejecutivo y breve. Incluye siempre mecanismo de oposición.",
    plantilla:
      "Genera un email de exploración para:\n\nEmpresa: {{empresa}}\nSector: {{sector}}\nCargo: {{cargo}}\n\nProducto:\n{{producto}}\n\nObjetivo:\n{{objetivo}}",
    variables: ["empresa", "sector", "cargo", "producto", "objetivo"],
    modelo: "google/gemini-3.6-flash",
    estado: "produccion",
    owner: "marketing@demo.local",
    fecha_actualizacion: "2026-07-30",
    versions: [
      { version: "1.0", cambios: "Versión inicial", autor: "marta.lopez", fecha: "2026-06-02", activo: false },
      { version: "1.1", cambios: "Se añade cláusula de oposición", autor: "legal", fecha: "2026-06-28", activo: false },
      { version: "1.2", cambios: "Tono más breve y ejecutivo", autor: "marta.lopez", fecha: "2026-07-30", activo: true },
    ],
    demo: true,
  },
  {
    id: "prompt-2",
    nombre: "LinkedIn_Primer_Contacto",
    categoria: "Marketing › Captación",
    tipo: "linkedin",
    version: "1.0",
    sistema: "Redacta mensajes cortos de LinkedIn. Máximo 300 caracteres. Sin promesas comerciales.",
    plantilla: "Mensaje de conexión para {{cargo}} de {{empresa}} sobre {{producto}}.",
    variables: ["cargo", "empresa", "producto"],
    modelo: "google/gemini-3.6-flash",
    estado: "produccion",
    owner: "marketing@demo.local",
    fecha_actualizacion: "2026-07-12",
    versions: [{ version: "1.0", cambios: "Versión inicial", autor: "marta.lopez", fecha: "2026-07-12", activo: true }],
    demo: true,
  },
  {
    id: "prompt-3",
    nombre: "Guion_Llamada_Descubrimiento",
    categoria: "Ventas › Descubrimiento",
    tipo: "llamada",
    version: "1.0",
    sistema: "Genera guiones de llamada con preguntas abiertas. No uses argumentos de cierre agresivo.",
    plantilla: "Guion de descubrimiento para {{sector}} sobre {{necesidad}}.",
    variables: ["sector", "necesidad"],
    modelo: "google/gemini-3.6-flash",
    estado: "produccion",
    owner: "ventas@demo.local",
    fecha_actualizacion: "2026-07-05",
    versions: [{ version: "1.0", cambios: "Versión inicial", autor: "javier.ruiz", fecha: "2026-07-05", activo: true }],
    demo: true,
  },
  {
    id: "prompt-4",
    nombre: "Solicitud_Consentimiento_RGPD",
    categoria: "Compliance › Consentimiento",
    tipo: "email",
    version: "1.1",
    sistema:
      "Redacta solicitudes de consentimiento conformes al RGPD y la LSSI-CE. No incluyas argumentos comerciales ni oferta de producto.",
    plantilla: "Solicitud de consentimiento para {{empresa}} indicando la fuente {{fuente}} y la finalidad {{finalidad}}.",
    variables: ["empresa", "fuente", "finalidad"],
    modelo: "google/gemini-3.6-flash",
    estado: "produccion",
    owner: "legal@demo.local",
    fecha_actualizacion: "2026-07-18",
    versions: [
      { version: "1.0", cambios: "Versión inicial", autor: "legal", fecha: "2026-06-15", activo: false },
      { version: "1.1", cambios: "Se explicita el origen del dato", autor: "legal", fecha: "2026-07-18", activo: true },
    ],
    demo: true,
  },
  {
    id: "prompt-5",
    nombre: "Analisis_Viabilidad_Idea",
    categoria: "Evaluación › Viabilidad",
    tipo: "analisis",
    version: "1.2",
    sistema:
      "Eres analista de negocio. Devuelve un diagnóstico estructurado y marca las puntuaciones como estimaciones orientativas.",
    plantilla:
      "Analiza la viabilidad de:\n\nIdea: {{idea}}\nProblema: {{problema}}\nCliente objetivo: {{cliente}}\nSector: {{sector}}\nGeografía: {{geografia}}",
    variables: ["idea", "problema", "cliente", "sector", "geografia"],
    modelo: "google/gemini-3.6-flash",
    estado: "produccion",
    owner: "producto@demo.local",
    fecha_actualizacion: "2026-07-14",
    versions: [
      { version: "1.1", cambios: "Se añaden hipótesis a validar", autor: "producto", fecha: "2026-07-01", activo: false },
      { version: "1.2", cambios: "Se añade recomendación seguir/ajustar/descartar", autor: "producto", fecha: "2026-07-14", activo: true },
    ],
    demo: true,
  },
  {
    id: "prompt-6",
    nombre: "Compliance_Validacion_Lead",
    categoria: "Compliance › Validación",
    tipo: "analisis",
    version: "1.0",
    sistema: "Evalúa la trazabilidad y la base jurídica de un lead. Ante la duda, marca como no apto.",
    plantilla: "Evalúa el lead {{empresa}} con fuente {{fuente}} y dato {{tipo_dato}}.",
    variables: ["empresa", "fuente", "tipo_dato"],
    modelo: "google/gemini-3.6-flash",
    estado: "borrador",
    owner: "legal@demo.local",
    fecha_actualizacion: "2026-08-01",
    versions: [{ version: "1.0", cambios: "Versión inicial", autor: "legal", fecha: "2026-08-01", activo: true }],
    demo: true,
  },
];

// --- Roles ------------------------------------------------------------------

export const roles = [
  { name: "Administrador", description: "Configura fuentes, revisa todo y exporta." },
  { name: "Marketing", description: "Crea ideas, lanza exploraciones y genera leads." },
  { name: "Comercial", description: "Revisa leads, edita datos y genera mensajes borrador." },
  { name: "Legal / Compliance", description: "Revisa consentimiento, riesgo legal y bloquea leads." },
  { name: "Solo lectura", description: "Consulta resultados sin modificar." },
];

// --- Utilidades -------------------------------------------------------------

export const getIdea = (id: string) => businessIdeas.find((b) => b.id === id);
export const getAnalysisByIdea = (id: string) => viabilityAnalyses.find((a) => a.business_idea_id === id);
export const getLead = (id: string) => potentialLeads.find((l) => l.id === id);
export const getDraftsForLead = (id: string) => aiDrafts.filter((d) => d.potential_lead_id === id);

export const validationStatuses: ValidationStatus[] = [
  "Nuevo",
  "Pendiente de validar",
  "Validado",
  "No válido",
  "Duplicado",
  "Enriquecido",
  "Apto para investigación comercial",
  "No apto para campaña directa",
  "Pendiente de consentimiento",
  "Consentimiento obtenido",
  "Excluido",
  "Convertido en cliente",
];
