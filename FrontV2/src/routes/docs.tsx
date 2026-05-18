import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ChevronRight, Hash, FileText, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentación — SourceFlow" },
      {
        name: "description",
        content:
          "Estándar de Aceptación de Proyectos (EAP) y Manifiesto de Entrega: los dos instrumentos que todo proyecto debe cumplir.",
      },
    ],
  }),
  component: DocsPage,
});

const tree = [
  {
    section: "EAP — Estándar de Aceptación",
    items: [
      { id: "eap-objetivo", title: "Objetivo" },
      { id: "eap-minimo-tecnico", title: "Mínimo técnico: código y estructura" },
      { id: "eap-persistencia", title: "Persistencia y modelado de datos" },
      { id: "eap-funcionalidad", title: "Funcionalidad y pruebas" },
      { id: "eap-modelado-dominio", title: "Requisitos del modelado del dominio" },
      { id: "eap-arquitectura", title: "Requisitos de arquitectura" },
      { id: "eap-propiedad", title: "Propiedad intelectual y licenciamiento" },
    ],
  },
  {
    section: "Manifiesto de Entrega",
    items: [
      { id: "man-descripcion", title: "Descripción general" },
      { id: "man-stack", title: "Stack tecnológico" },
      { id: "man-configuracion", title: "Configuración del entorno" },
      { id: "man-arquitectura", title: "Arquitectura y flujo" },
      { id: "man-pruebas", title: "Pruebas (Testing)" },
      { id: "man-deuda", title: "Deuda técnica y continuidad" },
      { id: "man-licencia", title: "Licencia" },
    ],
  },
];

function DocsPage() {
  const [active, setActive] = useState("eap-objetivo");

  const currentSection = tree.find((s) =>
    s.items.some((it) => it.id === active),
  );
  const currentItem = tree
    .flatMap((s) => s.items)
    .find((it) => it.id === active);

  return (
    <AppShell
      breadcrumb={<span className="font-medium text-foreground">Documentación</span>}
    >
      <div className="flex">
        {/* Side nav */}
        <aside className="hidden w-72 shrink-0 border-r border-border bg-surface-muted/40 lg:block">
          <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto px-4 py-6">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Buscar en docs…"
                className="h-8 w-full rounded-md border border-border bg-surface pl-8 pr-2 text-xs"
              />
            </div>
            <nav className="space-y-5 text-sm">
              {tree.map((s) => (
                <div key={s.section}>
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {s.section}
                  </div>
                  <ul className="space-y-0.5">
                    {s.items.map((it) => (
                      <li key={it.id}>
                        <button
                          onClick={() => setActive(it.id)}
                          className={cn(
                            "flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-[13px] transition-colors",
                            active === it.id
                              ? "bg-accent-green/10 font-medium text-accent-green-deep"
                              : "text-muted-foreground hover:bg-muted",
                          )}
                        >
                          <FileText className="h-3 w-3 shrink-0" />
                          {it.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1">
          <div className="mx-auto max-w-3xl px-6 py-12 lg:px-10">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{currentSection?.section.split("—")[0].trim()}</span>
              <ChevronRight className="h-3 w-3" />
              <span>{currentItem?.title}</span>
            </div>
            <article className="prose-doc mt-3">
              {active === "eap-objetivo" && <EapObjetivo />}
              {active === "eap-minimo-tecnico" && <EapMinimoTecnico />}
              {active === "eap-persistencia" && <EapPersistencia />}
              {active === "eap-funcionalidad" && <EapFuncionalidad />}
              {active === "eap-modelado-dominio" && <EapModelado />}
              {active === "eap-arquitectura" && <EapArquitectura />}
              {active === "eap-propiedad" && <EapPropiedad />}
              {active === "man-descripcion" && <ManDescripcion />}
              {active === "man-stack" && <ManStack />}
              {active === "man-configuracion" && <ManConfiguracion />}
              {active === "man-arquitectura" && <ManArquitectura />}
              {active === "man-pruebas" && <ManPruebas />}
              {active === "man-deuda" && <ManDeuda />}
              {active === "man-licencia" && <ManLicencia />}
            </article>
          </div>
        </div>

        {/* TOC */}
        <aside className="hidden w-56 shrink-0 border-l border-border xl:block">
          <div className="sticky top-14 px-5 py-12">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Secciones
            </div>
            <ul className="mt-3 space-y-1.5 text-xs">
              {tree.map((s) => (
                <li key={s.section}>
                  <span className="font-semibold text-foreground text-[10px] uppercase tracking-wider">
                    {s.section.split("—")[0].trim()}
                  </span>
                  <ul className="mt-1 space-y-1 pl-2">
                    {s.items.map((it) => (
                      <li key={it.id}>
                        <button
                          onClick={() => setActive(it.id)}
                          className={cn(
                            "text-left",
                            active === it.id
                              ? "text-accent-green-deep font-medium"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {it.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

/* ── EAP Sections ── */

function SectionH1({ children }: { children: React.ReactNode }) {
  return <h1>{children}</h1>;
}

function Req({
  children,
  met,
}: {
  children: React.ReactNode;
  met?: boolean;
}) {
  return (
    <li className="flex items-start gap-2">
      {met !== undefined ? (
        met ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-green" />
        ) : (
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent-amber" />
        )
      ) : (
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-green" />
      )}
      <span>{children}</span>
    </li>
  );
}

function EapObjetivo() {
  return (
    <>
      <SectionH1>Estándar de Aceptación de Proyectos (EAP)</SectionH1>
      <h2 id="eap-objetivo">
        <Hash className="mr-1 inline h-4 w-4 text-muted-foreground" />
        Objetivo
      </h2>
      <p>
        Establecer los requisitos técnicos y documentales que un proyecto
        integrador debe cumplir para garantizar su <strong>preservación,
        ejecución y evolución</strong> por parte de futuros equipos de
        desarrollo.
      </p>
      <blockquote>
        Un proyecto que cumple el EAP puede ser retomado por cualquier equipo
        sin necesidad de "empezar de cero".
      </blockquote>
    </>
  );
}

function EapMinimoTecnico() {
  return (
    <>
      <SectionH1>Mínimo técnico: código y estructura</SectionH1>
      <p>
        Para ser aceptado, el repositorio debe contar con los siguientes
        requisitos:
      </p>
      <ul className="!list-none !ml-0 space-y-2">
        <Req>
          <strong>Gestor de Dependencias:</strong> El proyecto no debe incluir
          librerías descargadas manualmente. Debe usar archivos de gestión
          (ej: <code>package.json</code>, <code>requirements.txt</code>,{" "}
          <code>pom.xml</code>, <code>go.mod</code>).
        </Req>
        <Req>
          <strong>Separación de Configuración:</strong> Las credenciales
          (claves de API, accesos a DB) no deben estar en el código. Se exige
          un archivo <code>.env.example</code>.
        </Req>
        <Req>
          <strong>Estructura de Carpetas Estándar:</strong> El código fuente
          debe estar organizado (ej: carpeta <code>/src</code> para código,{" "}
          <code>/docs</code> para documentación, <code>/tests</code> para
          pruebas).
        </Req>
        <Req>
          <strong>Código Limpio:</strong> No debe haber código innecesario
          comentado (código "muerto"). Los nombres de variables/funciones
          deben ser descriptivos.
        </Req>
      </ul>
      <h3>Estructura esperada</h3>
      <pre>{`/proyecto
├─ .env.example        ← variables de entorno
├─ README.md           ← basado en Manifiesto de Entrega
├─ docs/               ← documentación markdown
├─ src/                ← código fuente
└─ tests/              ← pruebas automatizadas`}</pre>
    </>
  );
}

function EapPersistencia() {
  return (
    <>
      <SectionH1>Persistencia y Modelado de Datos</SectionH1>
      <h2 id="eap-persistencia-arq">
        <Hash className="mr-1 inline h-4 w-4 text-muted-foreground" />
        Arquitectura y estructura de datos
      </h2>
      <ul className="!list-none !ml-0 space-y-2">
        <Req>
          <strong>Normalización y consistencia:</strong> Las tablas deben
          estar diseñadas siguiendo, al menos, la Tercera Forma Normal (3NF).
          Los tipos de datos deben ser consistentes.
        </Req>
        <Req>
          <strong>Integridad referencial:</strong> Es obligatorio el uso de
          Claves Primarias (PK) únicas y Claves Foráneas (FK) debidamente
          relacionadas.
        </Req>
      </ul>

      <h2>Operaciones y rendimiento</h2>
      <ul className="!list-none !ml-0 space-y-2">
        <Req>
          <strong>Implementación de CRUD:</strong> Operaciones completas de
          Creación, Lectura, Actualización y Eliminación validadas, sin datos
          huérfanos.
        </Req>
        <Req>
          <strong>Optimización mediante índices:</strong> Índices en columnas
          de consulta frecuente para garantizar tiempos de respuesta óptimos.
        </Req>
      </ul>

      <h3>Niveles avanzados</h3>
      <ul className="!list-none !ml-0 space-y-2">
        <Req>
          <strong>Transacciones (ACID):</strong> Para procesos multi-paso
          (ej. registro de venta), usar transacciones con <strong>Rollback</strong>{" "}
          en caso de error.
        </Req>
        <Req>
          <strong>Control de acceso basado en roles (RBAC):</strong> Permisos
          diferenciados (ej. Admin, Editor, Lector).
        </Req>
        <Req>
          <strong>Trazabilidad y logs (auditoría):</strong> Tablas de
          auditoría que registren quién hizo qué y cuándo.
        </Req>
      </ul>
    </>
  );
}

function EapFuncionalidad() {
  return (
    <>
      <SectionH1>Funcionalidad y Pruebas</SectionH1>
      <ul className="!list-none !ml-0 space-y-2">
        <Req>
          <strong>Compilación/Ejecución exitosa:</strong> El proyecto debe
          ejecutar su función principal sin errores fatales en un entorno
          limpio.
        </Req>
        <Req>
          <strong>Cobertura de pruebas unitarias:</strong> Mínimo 70% del
          código fuente. Se prioriza la lógica de negocio y controladores.
        </Req>
        <Req>
          <strong>Pruebas de aceptación:</strong> Documento o sección con
          escenarios de prueba (Historias de Usuario) verificados con éxito.
        </Req>
        <Req>
          <strong>Análisis de código estático:</strong> Procesado por
          herramienta como SonarQube, ESLint o Pylint. Sin "Code Smells"
          críticos ni vulnerabilidades evidentes.
        </Req>
        <Req>
          <strong>Deuda técnica:</strong> Estimada en menos de 2 días
          (16 horas de trabajo). Esto asegura que el equipo receptor no
          pierda semanas "limpiando" antes de programar.
        </Req>
      </ul>
    </>
  );
}

function EapModelado() {
  return (
    <>
      <SectionH1>Requisitos del Modelado del Dominio</SectionH1>
      <p>
        Antes de avanzar al desarrollo completo, el proyecto debe incluir
        herramientas de diseño que expliquen el dominio del problema:
      </p>
      <ul className="!list-none !ml-0 space-y-2">
        <Req>
          <strong>Modelo de dominio:</strong> Diagrama que represente las
          entidades y sus relaciones para identificar las entidades centrales.
        </Req>
        <Req>
          <strong>Diagrama de clases:</strong> Debe explicar el dominio con
          un patrón de diseño seleccionado acorde a las necesidades.
        </Req>
        <Req>
          <strong>Diagrama de componentes:</strong> Muestra cómo se divide el
          sistema en módulos o servicios — estructura a nivel modular.
        </Req>
        <Req>
          <strong>Diagrama de procesos:</strong> Muestra y explica los flujos
          principales del sistema para comprender las reglas de negocio.
        </Req>
      </ul>
    </>
  );
}

function EapArquitectura() {
  return (
    <>
      <SectionH1>Requisitos de Arquitectura</SectionH1>
      <p>
        En la etapa de arquitectura se debe presentar una propuesta clara del
        sistema, basándose en estilos y patrones como:
      </p>
      <ul>
        <li>Arquitectura en capas</li>
        <li>Microservicios</li>
        <li>Hexagonal</li>
        <li>Otros patrones justificados por el contexto del proyecto</li>
      </ul>
    </>
  );
}

function EapPropiedad() {
  return (
    <>
      <SectionH1>Propiedad Intelectual y Licenciamiento</SectionH1>
      <ul className="!list-none !ml-0 space-y-2">
        <Req>
          <strong>Declaración de autoría:</strong> Listado de integrantes y
          su rol en el proyecto.
        </Req>
        <Req>
          <strong>Licencia de uso:</strong> Todo proyecto debe adjuntar un
          archivo <code>LICENSE</code> (ej: MIT o Creative Commons) que
          autorice a la institución y a otros estudiantes a darle continuidad.
        </Req>
      </ul>
    </>
  );
}

/* ── Manifiesto Sections ── */

function ManDescripcion() {
  return (
    <>
      <SectionH1>Manifiesto de Entrega</SectionH1>
      <h2 id="man-descripcion">
        <Hash className="mr-1 inline h-4 w-4 text-muted-foreground" />
        Descripción general
      </h2>
      <p>
        El Manifiesto de Entrega es el documento que acompaña la entrega
        final del proyecto y sirve como guía para que el siguiente equipo
        pueda retomarlo. Debe incluir:
      </p>
      <ul className="!list-none !ml-0 space-y-2">
        <Req>
          <strong>Problema:</strong> ¿Qué necesidad detectaron?
        </Req>
        <Req>
          <strong>Solución:</strong> ¿Cómo la resuelve este software?
        </Req>
        <Req>
          <strong>Impacto:</strong> ¿Quiénes son los usuarios finales?
        </Req>
      </ul>
      <p>
        Adicionalmente se registran el estado del proyecto (Funcional, En
        Desarrollo o Prototipo Inicial), los autores y el tutor/profesor.
      </p>
    </>
  );
}

function ManStack() {
  return (
    <>
      <SectionH1>Stack Tecnológico</SectionH1>
      <p>El manifiesto debe declarar explícitamente:</p>
      <pre>{`- Lenguaje:          ej. Python 3.9+
- Frameworks:        ej. Django 4.0, React 18
- Base de Datos:     ej. PostgreSQL, MongoDB
- Otras herramientas: ej. Docker, AWS, Firebase`}</pre>
    </>
  );
}

function ManConfiguracion() {
  return (
    <>
      <SectionH1>Configuración del Entorno</SectionH1>
      <p>
        Pasos numerados para ejecutar el proyecto desde cero en una máquina
        local:
      </p>
      <h3>1. Requisitos previos</h3>
      <ul>
        <li>Tener instalado el runtime necesario (ej: Node.js v16)</li>
        <li>Tener instalado el gestor de contenedores (ej: Docker Desktop)</li>
      </ul>
      <h3>2. Instalación y ejecución</h3>
      <pre>{`# 1. Clonar el repositorio
git clone [url-del-repo]

# 2. Instalar dependencias
cd proyecto && npm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Correr el proyecto
npm run dev`}</pre>
    </>
  );
}

function ManArquitectura() {
  return (
    <>
      <SectionH1>Arquitectura y Flujo</SectionH1>
      <ul className="!list-none !ml-0 space-y-2">
        <Req>
          <strong>Ubicación de archivos clave:</strong> Explicar brevemente
          qué hay en las carpetas principales (<code>/src</code>,{" "}
          <code>/tests</code>, <code>/docs</code>).
        </Req>
        <Req>
          <strong>Diagrama:</strong> Insertar el diagrama de componentes o
          flujo del sistema.
        </Req>
      </ul>
    </>
  );
}

function ManPruebas() {
  return (
    <>
      <SectionH1>Pruebas (Testing)</SectionH1>
      <ul className="!list-none !ml-0 space-y-2">
        <Req>
          <strong>Comando para ejecutar tests:</strong> ej.{" "}
          <code>npm test</code>
        </Req>
        <Req>
          <strong>Cobertura:</strong> Indicar si hay tests unitarios, de
          integración o manuales, y el porcentaje de cobertura alcanzado.
        </Req>
      </ul>
    </>
  );
}

function ManDeuda() {
  return (
    <>
      <SectionH1>Deuda Técnica y Continuidad</SectionH1>
      <blockquote>
        Sin plan de continuidad, un proyecto entregado se vuelve un proyecto
        abandonado al siguiente semestre.
      </blockquote>
      <ul className="!list-none !ml-0 space-y-2">
        <Req>
          <strong>Pendientes:</strong> ¿Qué funcionalidades faltan por
          implementar?
        </Req>
        <Req>
          <strong>Bugs conocidos:</strong> ¿Hay algo que falle bajo ciertas
          condiciones?
        </Req>
        <Req>
          <strong>Sugerencia de mejora:</strong> Si tuvieras más tiempo,
          ¿qué arquitectura o tecnología cambiarías?
        </Req>
      </ul>
    </>
  );
}

function ManLicencia() {
  return (
    <>
      <SectionH1>Licencia</SectionH1>
      <p>
        El proyecto se entrega bajo la licencia declarada (ej. MIT, Apache
        2.0 o Institucional), permitiendo su uso y modificación para fines
        académicos.
      </p>
    </>
  );
}
