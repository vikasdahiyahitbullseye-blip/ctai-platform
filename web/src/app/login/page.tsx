import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-2xl text-white" aria-hidden>◎</div>
          <h1 className="text-2xl font-bold">Hitbullseye CT &amp; AI</h1>
          <p className="mt-1 text-sm text-muted">Computational Thinking &amp; AI · CBSE Classes 3–8</p>
        </div>
        <LoginForm />
        <div className="mt-6 rounded-2xl border border-line bg-surface p-4 text-sm">
          <div className="mb-2 font-semibold">Demo accounts (password: demo123)</div>
          <ul className="space-y-1 text-ink-2">
            <li><code className="font-mono">teacher</code> — teacher for Class 3-A and 6-A</li>
            <li><code className="font-mono">student3</code> — Class 3 student</li>
            <li><code className="font-mono">student6</code> — Class 6 student</li>
            <li><code className="font-mono">admin</code> — school admin</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
