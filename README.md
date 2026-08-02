# Idea Navigator

Actúa como un arquitecto de producto, diseñador UX/UI senior y desarrollador full stack experto en SaaS B2B, prospección comercial, validación de ideas de negocio, recuperación lícita de leads, IA generativa, CRM, RGPD, LSSI-CE y automatización comercial.

 

Quiero construir el primer módulo de una aplicación de marketing llamada MarketingHub AI.

 

Este primer módulo se llamará:

 

“Módulo de Exploración de Viabilidad y Prospección Inicial”

 

Objetivo del módulo:

Permitir que un usuario introduzca una idea de negocio, producto o servicio, y que la aplicación le ayude a evaluar su viabilidad comercial inicial, identificar segmentos de mercado potenciales y generar un primer listado de clientes potenciales con datos públicos, corporativos, trazables y obtenidos de forma lícita.

 

MUY IMPORTANTE:

La aplicación no debe estar diseñada para hacer spam, scraping indiscriminado, recopilación masiva de datos personales sin base jurídica, ni envío de comunicaciones comerciales no autorizadas.

 

El módulo debe recuperar únicamente información empresarial, corporativa o pública permitida, siempre registrando la fuente, la fecha de obtención, el tipo de dato, el nivel de confianza y el estado de validación legal. Si un contacto no tiene consentimiento o base válida para comunicaciones comerciales, debe marcararse como “No apto para campaña directa” hasta que se valide legalmente.

 

La primera versión puede trabajar con datos simulados y conectores mock, pero debe quedar preparada para conectarse posteriormente con APIs de búsqueda empresarial, fuentes públicas autorizadas, bases de datos internas, Firecrawl, Apify, Google Custom Search, LinkedIn Sales Navigator, proveedores de enriquecimiento de leads, CRM y Supabase.

 

Construye una primera versión funcional, navegable y visualmente profesional en Lovable.

 

--------------------------------------------------

1. FUNCIONALIDAD PRINCIPAL

--------------------------------------------------

 

El usuario debe poder crear una nueva exploración de viabilidad introduciendo:

 

- Nombre de la idea de negocio.

- Descripción del producto o servicio.

- Problema que resuelve.

- Tipo de cliente objetivo.

- Sector o sectores objetivo.

- País o zona geográfica.

- Tamaño de empresa objetivo.

- Cargo o perfil de contacto deseado.

- Palabras clave.

- Palabras excluidas.

- Idioma.

- Canal comercial previsto: email, WhatsApp, llamada, LinkedIn, otro.

- Nivel de madurez de la idea: idea inicial, producto definido, MVP, producto en mercado.

- Objetivo comercial: validar interés, captar leads, vender, generar reuniones, analizar mercado.

- Restricciones legales o comerciales.

- Competidores conocidos, si existen.

 

La aplicación debe procesar esta información y generar:

 

- Diagnóstico inicial de viabilidad.

- Segmentos de clientes recomendados.

- Perfil de cliente ideal, ICP.

- Sectores prioritarios.

- Tipos de empresa objetivo.

- Roles o cargos recomendados.

- Mensajes comerciales preliminares.

- Riesgos comerciales.

- Riesgos legales.

- Recomendaciones de siguiente paso.

- Primer listado de clientes potenciales.

 

--------------------------------------------------

2. PANTALLAS DEL MÓDULO

--------------------------------------------------

 

Crear las siguientes pantallas:

 

1. Dashboard del módulo

2. Nueva exploración de idea

3. Resultado de análisis de viabilidad

4. Segmentos recomendados

5. Clientes potenciales encontrados

6. Detalle de cliente potencial

7. Validación de datos y fuentes

8. Revisión legal y consentimiento

9. Exportación de leads

10. Configuración de fuentes de datos

 

--------------------------------------------------

3. DASHBOARD DEL MÓDULO

--------------------------------------------------

 

El dashboard debe mostrar:

 

- Número de ideas exploradas.

- Exploraciones en curso.

- Exploraciones finalizadas.

- Leads potenciales identificados.

- Leads validados.

- Leads pendientes de validar.

- Leads no aptos para campaña directa.

- Sectores con mayor potencial.

- Países o zonas con mayor potencial.

- Últimas exploraciones realizadas.

- Alertas legales.

- Alertas de datos incompletos.

- Alertas de contactos sin fuente trazable.

 

Incluir gráficos sencillos:

 

- Leads por sector.

- Leads por estado.

- Leads por país.

- Viabilidad media por idea.

- Distribución por tamaño de empresa.

 

--------------------------------------------------

4. FORMULARIO DE NUEVA EXPLORACIÓN

--------------------------------------------------

 

Crear un formulario guiado tipo wizard con estos pasos:

 

Paso 1: Descripción de la idea

- Nombre de la idea.

- Descripción.

- Problema que resuelve.

- Beneficio principal.

- Diferencial frente a alternativas.

 

Paso 2: Cliente objetivo

- Tipo de cliente.

- Sector.

- País.

- Tamaño de empresa.

- Cargo objetivo.

- Nivel de decisión del contacto.

- Necesidad esperada.

 

Paso 3: Criterios de búsqueda

- Palabras clave.

- Palabras excluidas.

- Ubicación.

- Fuentes preferidas.

- Número máximo de resultados.

- Nivel mínimo de confianza.

- Idioma.

 

Paso 4: Restricciones

- Excluir empresas competidoras.

- Excluir empresas ya contactadas.

- Excluir empresas sin web.

- Excluir contactos sin fuente.

- Excluir contactos personales no corporativos.

- Excluir datos sin trazabilidad.

 

Paso 5: Lanzar análisis

- Botón “Analizar viabilidad”.

- Botón “Buscar clientes potenciales”.

- Botón “Guardar como borrador”.

 

--------------------------------------------------

5. ANÁLISIS DE VIABILIDAD CON IA

--------------------------------------------------

 

La IA debe generar un diagnóstico estructurado con:

 

- Resumen ejecutivo de la idea.

- Nivel estimado de claridad de la propuesta.

- Nivel estimado de encaje mercado-producto.

- Segmentos más prometedores.

- Hipótesis comerciales a validar.

- Principales barreras de entrada.

- Argumentos de venta iniciales.

- Objeciones previsibles.

- Recomendaciones de posicionamiento.

- Canales recomendados.

- Recomendación sobre si seguir, ajustar o descartar la idea.

 

Mostrar una puntuación visual de viabilidad:

 

- Viabilidad comercial: 0 a 100.

- Claridad de propuesta: 0 a 100.

- Facilidad de identificación de clientes: 0 a 100.

- Riesgo legal/comercial: bajo, medio o alto.

- Potencial inicial: bajo, medio o alto.

 

Importante:

La puntuación debe mostrarse como una estimación orientativa, no como una verdad absoluta.

 

--------------------------------------------------

6. IDENTIFICACIÓN DE CLIENTES POTENCIALES

--------------------------------------------------

 

La aplicación debe generar un primer listado de clientes potenciales.

 

Cada lead debe tener:

 

- Nombre de empresa.

- Nombre comercial.

- Sector.

- Subsector.

- País.

- Provincia o ciudad.

- Web corporativa.

- LinkedIn corporativo, si está disponible.

- Descripción breve de la empresa.

- Motivo por el que puede encajar con la idea.

- Necesidad probable detectada.

- Tamaño estimado de empresa.

- Tipo de cliente.

- Nivel de encaje: alto, medio, bajo.

- Score de oportunidad: 0 a 100.

- Fuente del dato.

- URL de origen.

- Fecha de obtención.

- Estado de validación.

- Estado legal.

- Observaciones.

 

Si existen contactos corporativos válidos y trazables, incluir:

 

- Nombre del contacto, solo si procede de fuente lícita.

- Cargo.

- Email corporativo, solo si es corporativo y trazable.

- Teléfono corporativo, si está disponible y permitido.

- Perfil profesional público, si existe.

- Fuente del contacto.

- Nivel de confianza.

- Estado de consentimiento.

- Apto para contacto directo: sí/no/pendiente.

- Motivo de la decisión.

 

No incluir:

- Correos personales.

- Teléfonos personales no corporativos.

- Datos sensibles.

- Datos inferidos sin fuente.

- Datos de menores.

- Datos obtenidos sin trazabilidad.

- Información que no pueda justificarse.

 

--------------------------------------------------

7. ESTADOS DE LOS LEADS

--------------------------------------------------

 

Cada lead debe poder estar en uno de estos estados:

 

- Nuevo.

- Pendiente de validar.

- Validado.

- No válido.

- Duplicado.

- Enriquecido.

- Apto para investigación comercial.

- No apto para campaña directa.

- Pendiente de consentimiento.

- Consentimiento obtenido.

- Excluido.

- Convertido en cliente.

 

El usuario debe poder cambiar el estado manualmente.

 

--------------------------------------------------

8. VALIDACIÓN LEGAL Y DE CONSENTIMIENTO

--------------------------------------------------

 

Crear un bloque visible en cada lead llamado “Validación legal”.

 

Debe mostrar:

 

- Origen del dato.

- Tipo de fuente.

- Fecha de recuperación.

- Finalidad prevista.

- Base jurídica propuesta.

- Requiere consentimiento: sí/no/pendiente.

- Consentimiento disponible: sí/no.

- Apto para campaña email: sí/no/pendiente.

- Apto para campaña WhatsApp: sí/no/pendiente.

- Apto para contacto comercial inicial: sí/no/pendiente.

- Riesgo legal: bajo/medio/alto.

- Recomendación.

 

Reglas obligatorias:

 

- Si no hay consentimiento para email marketing, marcar como “No apto para campaña email directa”.

- Si no hay opt-in específico para WhatsApp, marcar como “No apto para WhatsApp marketing”.

- Si el dato no tiene fuente, marcar como “No válido”.

- Si la fuente no es clara, marcar como “Pendiente de validación”.

- Si el contacto es personal y no corporativo, marcar como “No apto”.

- Si el cliente solicita baja en el futuro, bloquear cualquier campaña posterior.

- La aplicación debe permitir preparar acciones de contacto legítimo o solicitud de consentimiento, pero no lanzar campañas comerciales no autorizadas.

 

--------------------------------------------------

9. RECUPERACIÓN DE DATOS

--------------------------------------------------

 

Preparar el módulo para funcionar con tres modos:

 

Modo 1: Datos simulados

- Para probar la aplicación sin APIs reales.

- Generar empresas ficticias.

- Generar contactos ficticios.

- Etiquetar claramente como “datos demo”.

 

Modo 2: Carga manual

- Permitir importar o introducir empresas manualmente.

- Permitir pegar una lista de URLs.

- Permitir subir CSV en futuras versiones.

 

Modo 3: Conectores externos futuros

Preparar estructura para integrar:

- Firecrawl para extracción controlada de información web.

- Apify para actores de búsqueda o enriquecimiento.

- APIs públicas.

- CRM.

- Supabase.

- Email validation provider.

- LinkedIn o Sales Navigator si se dispone de acceso autorizado.

- Buscadores empresariales autorizados.

- Bases de datos internas.

 

Si se usa Firecrawl o Apify en el futuro:

- Respetar robots.txt.

- Respetar términos de uso.

- Limitar frecuencia.

- Registrar fuente.

- No extraer datos personales sensibles.

- No extraer datos sin finalidad legítima.

- No generar contactos sin trazabilidad.

 

--------------------------------------------------

10. VISTA DE CLIENTES POTENCIALES

--------------------------------------------------

 

Crear una tabla avanzada con:

 

Columnas:

- Empresa.

- Sector.

- País.

- Web.

- Contacto.

- Cargo.

- Email corporativo.

- Nivel de encaje.

- Score.

- Estado.

- Estado legal.

- Fuente.

- Fecha.

- Acciones.

 

Filtros:

- Sector.

- País.

- Tamaño.

- Score mínimo.

- Estado.

- Consentimiento.

- Apto para contacto.

- Fuente.

- Riesgo legal.

- Producto o idea asociada.

 

Acciones:

- Ver detalle.

- Validar lead.

- Marcar no válido.

- Enriquecer datos.

- Añadir nota.

- Marcar como apto.

- Marcar como no apto.

- Convertir en cliente.

- Exportar.

- Enviar a campaña futura.

- Solicitar revisión legal.

 

--------------------------------------------------

11. DETALLE DEL LEAD

--------------------------------------------------

 

Crear una pantalla de detalle con pestañas:

 

Pestaña 1: Resumen

- Datos principales.

- Score.

- Motivo de encaje.

- Recomendación.

 

Pestaña 2: Datos de contacto

- Contactos disponibles.

- Fuentes.

- Nivel de confianza.

- Estado de validación.

 

Pestaña 3: Análisis IA

- Por qué encaja.

- Necesidad probable.

- Mensaje comercial sugerido.

- Objeciones previsibles.

- Próxima acción recomendada.

 

Pestaña 4: Cumplimiento

- Consentimiento.

- Base jurídica.

- Riesgo.

- Evidencias.

- Bloqueos.

 

Pestaña 5: Historial

- Cambios de estado.

- Validaciones.

- Ediciones.

- Exportaciones.

- Acciones realizadas.

 

--------------------------------------------------

12. MENSAJES PRELIMINARES

--------------------------------------------------

 

El módulo debe poder generar un primer mensaje comercial sugerido para cada lead, pero solo como borrador.

 

Tipos de mensaje:

 

- Email inicial de exploración.

- Mensaje de LinkedIn.

- Guion de llamada.

- Mensaje de solicitud de consentimiento.

- Mensaje de presentación de producto.

- Mensaje de validación de interés.

 

Reglas:

 

- El mensaje debe quedar siempre en estado “borrador”.

- No debe enviarse automáticamente.

- Debe ser revisado por un usuario.

- Debe respetar consentimiento y canal.

- Debe incluir advertencia si no está permitido usarlo para campaña directa.

- No debe inventar información del cliente.

- Debe usar solo datos disponibles y trazables.

 

--------------------------------------------------

13. MODELO DE DATOS

--------------------------------------------------

 

Crear las siguientes tablas en Supabase o modelo equivalente:

 

business_ideas

- id

- name

- description

- problem_solved

- target_customer

- sector

- geography

- maturity_level

- objective

- created_at

- updated_at

- created_by

 

viability_analyses

- id

- business_idea_id

- executive_summary

- viability_score

- product_market_fit_score

- clarity_score

- lead_identification_score

- legal_risk_level

- commercial_risk_level

- recommendation

- ai_model

- prompt_version

- created_at

 

lead_searches

- id

- business_idea_id

- search_keywords

- excluded_keywords

- geography

- sector

- max_results

- source_mode

- status

- created_at

 

potential_leads

- id

- business_idea_id

- company_name

- commercial_name

- sector

- subsector

- country

- city

- website

- linkedin_url

- company_description

- fit_reason

- detected_need

- company_size

- fit_level

- opportunity_score

- source_name

- source_url

- source_type

- retrieved_at

- validation_status

- legal_status

- consent_status

- email_marketing_allowed

- whatsapp_marketing_allowed

- contact_allowed

- risk_level

- notes

- created_at

- updated_at

 

lead_contacts

- id

- potential_lead_id

- contact_name

- job_title

- corporate_email

- corporate_phone

- whatsapp_number

- profile_url

- source_url

- source_type

- confidence_level

- consent_status

- legal_status

- created_at

- updated_at

 

lead_validation_logs

- id

- potential_lead_id

- action

- previous_status

- new_status

- user_id

- notes

- created_at

 

ai_generated_drafts

- id

- potential_lead_id

- business_idea_id

- channel

- message_type

- draft_text

- status

- risk_warning

- prompt_version

- ai_model

- created_at

 

data_sources

- id

- name

- type

- enabled

- requires_api_key

- usage_policy

- created_at

 

--------------------------------------------------

14. ROLES

--------------------------------------------------

 

Crear roles básicos:

 

Administrador:

- Puede configurar fuentes, revisar todo y exportar.

 

Marketing:

- Puede crear ideas, lanzar exploraciones y generar leads.

 

Comercial:

- Puede revisar leads, editar datos y generar mensajes borrador.

 

Legal/Compliance:

- Puede revisar consentimiento, riesgo legal y bloquear leads.

 

Solo lectura:

- Puede consultar resultados.

 

--------------------------------------------------

15. UX/UI

--------------------------------------------------

 

Diseñar una interfaz moderna tipo SaaS B2B:

 

- Menú lateral.

- Dashboard con KPIs.

- Formularios tipo wizard.

- Tablas filtrables.

- Estados con badges de colores.

- Panel de detalle.

- Vista de análisis IA.

- Alertas legales visibles.

- Botones claros.

- Diseño responsive.

- Estilo profesional, limpio y ejecutivo.

 

Estados visuales:

- Verde: validado/apto.

- Amarillo: pendiente.

- Rojo: bloqueado/no apto.

- Azul: en análisis.

- Gris: demo/sin validar.

 

--------------------------------------------------

16. FLUJO PRINCIPAL

--------------------------------------------------

 

Implementar este flujo:

 

1. Usuario crea una nueva idea de negocio.

2. Usuario completa criterios de mercado objetivo.

3. La aplicación genera análisis de viabilidad.

4. La aplicación propone segmentos de clientes.

5. La aplicación genera o simula un primer listado de leads.

6. La IA justifica por qué cada lead puede encajar.

7. La aplicación valida fuentes y trazabilidad.

8. La aplicación marca si el lead es apto o no para contacto directo.

9. Usuario revisa y valida manualmente.

10. Usuario puede exportar leads validados o enviarlos a una campaña futura.

11. La aplicación puede generar mensajes preliminares en borrador.

 

--------------------------------------------------

17. DATOS DE EJEMPLO

--------------------------------------------------

 

Crear datos ficticios para probar el módulo:

 

- 3 ideas de negocio.

- 5 análisis de viabilidad.

- 30 leads potenciales ficticios.

- 15 contactos ficticios corporativos.

- 5 leads no aptos por falta de consentimiento.

- 5 leads pendientes de validación.

- 5 leads validados.

- 5 borradores de mensajes.

- Varias fuentes demo.

 

Todos los datos deben estar claramente marcados como ficticios.

 

--------------------------------------------------

18. RESULTADO ESPERADO

--------------------------------------------------

 

Genera una primera versión funcional del módulo “Exploración de Viabilidad y Prospección Inicial”.

 

Debe ser posible:

 

- Crear una idea de negocio.

- Analizar su viabilidad inicial.

- Identificar segmentos objetivo.

- Visualizar clientes potenciales.

- Ver detalle de cada lead.

- Consultar fuentes y trazabilidad.

- Marcar estados de validación.

- Revisar cumplimiento legal básico.

- Generar mensajes preliminares en borrador.

- Filtrar leads por sector, país, score, estado y riesgo.

- Exportar o preparar leads para campañas futuras.

- Trabajar con datos demo si no hay integraciones reales.

 

Prioriza una versión clara, usable y navegable, aunque las integraciones reales se dejen simuladas.

Versión más corta si Lovable se bloquea

Construye un primer módulo para una aplicación SaaS de marketing llamada MarketingHub AI.

 

El módulo se llamará “Exploración de Viabilidad y Prospección Inicial”.

 

Debe permitir introducir una idea de negocio, producto o servicio, analizar su viabilidad comercial inicial con IA, identificar segmentos de mercado objetivo y generar un primer listado de clientes potenciales con información empresarial trazable.

 

La app debe incluir:

 

1. Dashboard del módulo.

2. Formulario para crear una idea de negocio.

3. Análisis IA de viabilidad.

4. Segmentos recomendados.

5. Tabla de clientes potenciales.

6. Detalle de lead.

7. Validación de fuentes.

8. Estado legal y consentimiento.

9. Generación de mensajes preliminares en borrador.

10. Exportación de leads validados.

 

Cada lead debe incluir empresa, sector, país, web, descripción, motivo de encaje, score de oportunidad, fuente, URL de origen, fecha de recuperación, estado de validación, estado legal y consentimiento.

 

Si hay contacto corporativo disponible, incluir nombre, cargo, email corporativo, teléfono corporativo, fuente, nivel de confianza y estado de consentimiento.

 

No debe permitir spam, scraping indiscriminado ni uso de datos personales sin trazabilidad. Si el lead no tiene consentimiento o base válida, debe marcarse como “No apto para campaña directa”.

 

Preparar la arquitectura para futuras integraciones con Supabase, Firecrawl, Apify, CRM, proveedores de enriquecimiento de leads y modelos IA. Si no hay APIs reales, usar datos demo claramente ficticios.

 

Crear una interfaz moderna tipo SaaS B2B con menú lateral, KPIs, tablas filtrables, formularios tipo wizard, badges de estado, alertas legales y paneles de detalle.

Mi recomendación: pega primero la versión corta en Lovable para que cree la estructura base. Después añade el prompt largo módulo por módulo, empezando por el formulario de idea, la tabla de leads y el detalle de lead.

 

La aplicación no incluirá los prompt de búsqueda para la ia dentro del código, sino que los almacenará en base de datos para lo cual considerará las siguientes instrucciones:

 

 

 

COMO GESTIONAR LOS PROMPT

Si esta aplicación va a evolucionar hacia campañas inteligentes, agentes y múltiples modelos IA, los prompts deben gestionarse como un activo corporativo, igual que gestionas código fuente, APIs o modelos de datos.

De hecho, en la documentación interna sobre gobierno de agentes se menciona la necesidad de disponer de una fuente única, trazable y auditada de configuraciones, instrucciones y metadatos asociados a los agentes IA, incluyendo controles de gobierno y versionado. [Indra - BB...ra el SDLC | PDF], [ANTIGUA_Go...entes_BBVA | PowerPoint]

Arquitectura recomendada

No almacenes prompts dentro del código:

❌ Mala práctica

const prompt = </span><br></div><div><span attribution="{&quot;id&quot;:&quot;E64C3D4F-5E12-4514-AD9B-893A6FAFD00C&quot;,&quot;name&quot;:&quot;Copilot&quot;,&quot;oid&quot;:&quot;E64C3D4F-5E12-4514-AD9B-893A6FAFD00C&quot;,&quot;timestamp&quot;:1785700800000,&quot;dataSource&quot;:0}">Genera un email comercial...</span><br></div><div><span attribution="{&quot;id&quot;:&quot;E64C3D4F-5E12-4514-AD9B-893A6FAFD00C&quot;,&quot;name&quot;:&quot;Copilot&quot;,&quot;oid&quot;:&quot;E64C3D4F-5E12-4514-AD9B-893A6FAFD00C&quot;,&quot;timestamp&quot;:1785700800000,&quot;dataSource&quot;:0}">;

✅ Buena práctica

Base de Datos

↓

Catálogo de Prompts

↓

Motor IA

↓

LLM

Modelo de datos

Crearía una tabla:

ai_prompts

Campos

Campo

Descripción

id

Identificador

nombre

Nombre funcional

categoria

Marketing, ventas, soporte

tipo

Email, WhatsApp, respuesta

version

Versión del prompt

sistema

System Prompt

plantilla

Prompt base

variables

Variables permitidas

modelo

GPT-5, Claude, etc.

estado

Borrador, producción

owner

Responsable

fecha_creacion

Auditoría

fecha_actualizacion

Auditoría

Ejemplo real

Registro

{

"nombre": "Email_Captacion_Banca",

"version": "1.0",

"tipo": "email",

"estado": "produccion"

}

System Prompt

Eres un experto en ventas consultivas.

No inventes información.

Utiliza un tono ejecutivo.

Template Prompt

Genera un email para:

 

Empresa: {{empresa}}

Sector: {{sector}}

Cargo: {{cargo}}

 

Producto:

{{producto}}

 

Objetivo:

{{objetivo}}

Versionado

Uno de los problemas más habituales es no saber:

¿Cuál es el prompt que produjo este mensaje?

Por ello cada modificación debe crear una nueva versión.

Los enfoques modernos de Prompt Management recomiendan tratar los prompts como elementos versionados con histórico completo, rollback y trazabilidad. [agenta.ai], [braintrust.dev], [mlflow.org]

Ejemplo:

Email_Captacion_Banca

 

v1.0

v1.1

v1.2

v2.0

Tabla de versiones

prompt_versions

Campo

Descripción

id

Identificador

prompt_id

Prompt

version

Número versión

cambios

Qué se modificó

autor

Usuario

fecha

Timestamp

activo

Sí/No

Variables parametrizadas

Nunca generar prompts concatenando texto.

Utiliza placeholders.

{{empresa}}

 

{{sector}}

 

{{producto}}

 

{{objetivo}}

Luego:

prompt =

template

.replace("{{empresa}}", cliente.nombre)

.replace("{{sector}}", cliente.sector)

Biblioteca de prompts

Organizar por categorías.

Marketing

├── Captación

├── Reenganche

├── Upselling

 

Email

├── Primer contacto

├── Seguimiento

├── Cierre

 

WhatsApp

├── Presentación

├── Recordatorio

├── Reactivación

 

Respuestas

├── Objeción precio

├── Solicitud reunión

├── Baja

Prompts compuestos

No utilizar un único prompt gigante.

Agente campaña

Define estrategia

Agente personalización

Adapta al cliente

Agente compliance

Valida consentimiento

Agente calidad

Evalúa el resultado

Este enfoque encaja con los modelos agénticos descritos en documentación interna, donde distintos agentes colaboran y un supervisor gobierna el proceso. [Catalogo_A...Activos_IA | Excel], [Resultado...Oferta_v2 | PowerPoint]

Evaluación automática

Añade una tabla:

prompt_evaluations

Ejemplo:

{

"prompt": "Email_Captacion_Banca",

"version": "1.2",

"score": 91,

"conversion_rate": 14.3

}

Medir:

Aperturas.

Respuestas.

Conversión.

Calidad percibida.

Coste IA.

A/B Testing

La aplicación debería soportar:

Versión A

Versión B

Versión C

Ejemplo:

A

Enfoque tecnológico

B

Enfoque de negocio

C

Enfoque ahorro costes

La campaña selecciona automáticamente el mejor resultado.

Gobierno de prompts

Añadir una pantalla específica:

Administración IA

Con:

Catálogo de prompts.

Versiones.

Histórico.

Comparativa.

KPIs.

A/B tests.

Modelos utilizados.

Costes.

Auditoría.

La documentación de gobierno de agentes destaca precisamente la importancia de catálogos, metadatos, trazabilidad, clasificación y auditoría de activos IA. [Indra - BB...ra el SDLC | PDF], [ANTIGUA_Go...entes_BBVA | PowerPoint]

Diseño que te recomiendo para MarketingHub AI

PROMPTS

│

├── Marketing

│ ├── Email Captación

│ ├── Email Seguimiento

│ ├── Email Reactivación

│

├── WhatsApp

│ ├── Presentación

│ ├── Recordatorio

│ ├── Reactivación

│

├── Respuestas

│ ├── Solicita información

│ ├── Objeción precio

│ ├── Agenda reunión

│ ├── Baja

│

├── Compliance

│ ├── Validación RGPD

│ └── Revisión WhatsApp

│

└── Evaluación

├── Scoring calidad

└── Scoring personalización

Con esta arquitectura podrás gestionar cientos de prompts, múltiples modelos (GPT, Claude, Gemini, etc.), agentes especializados y campañas complejas sin tener que modificar código cada vez que marketing quiera cambiar el tono o el contenido de una campaña.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0ce03e18-6c87-4f82-b3a6-298ee886b2c1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
