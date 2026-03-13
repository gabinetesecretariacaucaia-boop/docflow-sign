import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export async function Header() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="font-semibold">
          DocFlow Sign
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/dashboard" className="text-sm text-zinc-600 hover:text-zinc-900">
            Dashboard
          </Link>
          <Link href="/documentos/novo" className="text-sm text-zinc-600 hover:text-zinc-900">
            Novo envio
          </Link>
          <Link href="/atividades" className="text-sm text-zinc-600 hover:text-zinc-900">
            Atividades
          </Link>
          {data.user ? (
            <form action="/api/auth/signout" method="post">
              <Button variant="outline" size="sm" type="submit">
                Sair
              </Button>
            </form>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
