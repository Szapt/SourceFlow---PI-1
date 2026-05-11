/**
 * Neon (PostgreSQL) client — stub.
 *
 * Para conectar Neon real:
 *   1. Crear la base en https://console.neon.tech
 *   2. Pedir al usuario que añada el secreto VITE_NEON_API_URL apuntando
 *      a un endpoint serverless propio que ejecute SQL contra Neon
 *      (no se debe llamar a Neon directo desde el cliente con la
 *      connection string — eso filtra credenciales).
 *   3. Reemplazar las funciones de abajo para hacer fetch a ese endpoint.
 *
 * Mientras tanto: persistencia en localStorage para que el flujo UI funcione.
 *
 * Esquema de la tabla (crear en Neon cuando esté listo):
 *
 *   create type document_type as enum ('eap', 'manifiesto');
 *
 *   create table project_documents (
 *     id          uuid primary key default gen_random_uuid(),
 *     project_id  text not null,
 *     type        document_type not null,
 *     file_name   text not null,
 *     file_url    text not null,
 *     uploaded_at timestamptz not null default now(),
 *     unique (project_id, type)
 *   );
 */

export type DocumentType = "eap" | "manifiesto";

export interface ProjectDocument {
  id: string;
  project_id: string;
  type: DocumentType;
  file_name: string;
  file_url: string; // data URL (stub) o URL pública (Neon real)
  uploaded_at: string; // ISO
}

const KEY = "sourceflow.project_documents.v1";

function readAll(): ProjectDocument[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeAll(docs: ProjectDocument[]) {
  localStorage.setItem(KEY, JSON.stringify(docs));
}

export const projectDocuments = {
  list(projectId: string): ProjectDocument[] {
    return readAll().filter((d) => d.project_id === projectId);
  },
  get(projectId: string, type: DocumentType): ProjectDocument | undefined {
    return readAll().find((d) => d.project_id === projectId && d.type === type);
  },
  upsert(input: Omit<ProjectDocument, "id" | "uploaded_at">): ProjectDocument {
    const all = readAll();
    const idx = all.findIndex(
      (d) => d.project_id === input.project_id && d.type === input.type,
    );
    const doc: ProjectDocument = {
      ...input,
      id:
        idx >= 0
          ? all[idx].id
          : (crypto.randomUUID?.() ?? `doc_${Date.now()}_${Math.random()}`),
      uploaded_at: new Date().toISOString(),
    };
    if (idx >= 0) all[idx] = doc;
    else all.push(doc);
    writeAll(all);
    return doc;
  },
  remove(projectId: string, type: DocumentType) {
    writeAll(
      readAll().filter(
        (d) => !(d.project_id === projectId && d.type === type),
      ),
    );
  },
};
