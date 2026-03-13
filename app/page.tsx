export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16">
        <div className="space-y-5">
          <p className="w-fit rounded-full border border-zinc-700 px-3 py-1 text-xs uppercase tracking-wider text-zinc-300">
            DocFlow Sign
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            Fluxo de documentos com assinatura externa, seguro e auditável.
          </h1>
          <p className="max-w-2xl text-zinc-300">
            Envie documentos, acompanhe eventos, receba versões assinadas e mantenha trilha completa de atividades.
          </p>
        </div>
        <div className="flex gap-4">
          <a href="/signup" className="rounded-md bg-white px-5 py-3 font-medium text-zinc-900">
            Criar conta
          </a>
          <a href="/login" className="rounded-md border border-zinc-600 px-5 py-3 font-medium">
            Entrar
          </a>
        </div>
      </main>
    </div>
  );
}
