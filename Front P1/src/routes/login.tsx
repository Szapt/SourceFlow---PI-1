import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { auth } from "../services/auth/firebaseConfig";
import { GitBranch, Github, ShieldCheck, Users, BookOpen } from "lucide-react";
import { useState } from "react";
import { GithubAuthProvider, signInWithPopup } from "firebase/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — SourceFlow" },
      {
        name: "description",
        content:
          "Accede a SourceFlow con tu cuenta institucional de GitHub para continuar proyectos académicos.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [, setTokens] = useState<any>(null);

  const handleLogin = () => {
    navigate({ to: "/" });
  };

  const signInWithGitHub = async () => {
    setLoading(true);
    const provider = new GithubAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Autenticación Github: ", result.user);
      const { accessToken, refreshToken } = (result.user as any).stsTokenManager;
      setTokens({
        accessToken,
        refreshToken,
        userRole: "USER",
      });
      navigate({ to: "/" });
    } catch (error) {
      console.error("Error al conectar con GitHub.", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // TODO: Implementar lógica de login con email/password hacia tu API
      console.log("Login manual:", { email, password });
      handleLogin();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Correo o contraseña incorrectos."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left — branding */}
      <aside className="relative hidden overflow-hidden border-r border-border bg-[var(--gradient-hero)] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-green-deep text-white">
              <GitBranch className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">SourceFlow</div>
              <div className="text-[10px] text-muted-foreground">
                Repositorio académico
              </div>
            </div>
          </Link>
        </div>

        <div className="relative max-w-md">
          <p className="font-serif text-4xl leading-tight tracking-tight text-foreground">
            Proyectos que continúan,
            <br />
            <span className="text-accent-green-deep">conocimiento que perdura.</span>
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Inicia sesión con tu cuenta de GitHub para acceder al repositorio
            académico de Ingeniería de Sistemas.
          </p>

          <ul className="mt-8 space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <BookOpen className="mt-0.5 h-4 w-4 text-accent-green-deep" />
              <span className="text-muted-foreground">
                Consulta el EAP y el Manifiesto de Entrega.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Users className="mt-0.5 h-4 w-4 text-accent-green-deep" />
              <span className="text-muted-foreground">
                Conecta con equipos de PI1, PI2 e Independientes.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-accent-green-deep" />
              <span className="text-muted-foreground">
                Tus permisos se sincronizan con tu cuenta institucional.
              </span>
            </li>
          </ul>
        </div>

        <div className="relative text-[11px] font-mono text-muted-foreground">
          © {new Date().getFullYear()} SourceFlow · Facultad de Ingeniería de Sistemas
        </div>
      </aside>

      {/* Right — login form */}
      <main className="flex flex-col items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground lg:hidden"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-green-deep text-white">
              <GitBranch className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold">SourceFlow</span>
          </Link>

          <h1 className="font-serif text-3xl tracking-tight">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Usa tu cuenta de GitHub para continuar. Te crearemos un perfil
            académico vinculado a tus proyectos.
          </p>

          {error && (
            <p className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </p>
          )}

          <button
            type="button"
            id="btn-github-login"
            onClick={signInWithGitHub}
            disabled={loading}
            className="mt-8 inline-flex w-full items-center justify-center gap-2.5 rounded-md bg-[oklch(0.18_0.01_250)] px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Github className="h-4 w-4" />
            {loading ? "Cargando…" : "Continuar con GitHub"}
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              o con correo institucional
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form
            className="space-y-3"
            onSubmit={handleEmailLogin}
          >
            <label className="block">
              <span className="text-xs font-medium text-foreground">
                Correo institucional
              </span>
              <input
                id="input-email"
                type="email"
                placeholder="usuario@universidad.edu.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none focus:border-accent-green-deep focus:ring-2 focus:ring-accent-green-soft"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-foreground">
                Contraseña
              </span>
              <input
                id="input-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none focus:border-accent-green-deep focus:ring-2 focus:ring-accent-green-soft"
              />
            </label>
            <button
              id="btn-email-login"
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-md bg-accent-green-deep text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Cargando…" : "Iniciar sesión"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <a href="#" className="font-medium text-accent-green-deep hover:underline">
              Solicita acceso
            </a>
          </p>

          <p className="mt-8 text-center text-[10px] leading-relaxed text-muted-foreground">
            Al continuar aceptas las políticas de uso académico y el código de
            ética de la facultad.
          </p>
        </div>
      </main>
    </div>
  );
}