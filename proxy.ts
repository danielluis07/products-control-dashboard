import { NextRequest, NextResponse } from "next/server";
import { getCookieCache } from "better-auth/cookies";

const LOGIN_ROUTE = "/login";
const DASHBOARD_ROOT = "/dashboard";
const ADMIN_ROOT = "/dashboard/admin";
const MANAGER_ROOT = "/dashboard/manager";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await getCookieCache(request);

  const role = session?.user.role;

  // 2. Lógica para a página de LOGIN (/login)
  if (pathname.startsWith(LOGIN_ROUTE)) {
    // Se o usuário já está logado, redirecione-o para o dashboard
    if (session) {
      const redirectUrl = role === "admin" ? ADMIN_ROOT : MANAGER_ROOT;
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    // Se não está logado, permita o acesso à página de login
    return NextResponse.next();
  }

  // 3. Lógica para rotas PROTEGIDAS

  // 3.1. Se NÃO HÁ SESSÃO, redirecione para o login
  // Como o matcher só roda em /dashboard/*, qualquer rota aqui é protegida
  if (!session) {
    // Adiciona a URL de callback para redirecionar o usuário de volta
    // após o login
    const searchParams = new URLSearchParams();
    searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(
      new URL(`${LOGIN_ROUTE}?${searchParams.toString()}`, request.url)
    );
  }

  // 3.2. Se HÁ SESSÃO, verifique as permissões (AUTORIZAÇÃO)

  // Acessando a raiz do dashboard (/dashboard)
  if (pathname === DASHBOARD_ROOT) {
    // Redireciona com base na função do usuário
    const redirectUrl = role === "admin" ? ADMIN_ROOT : MANAGER_ROOT;
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Acessando rotas de Admin (/dashboard/admin/*)
  if (pathname.startsWith(ADMIN_ROOT)) {
    if (role !== "admin") {
      // Se não for admin, chuta ele para o dashboard de manager
      return NextResponse.redirect(new URL(MANAGER_ROOT, request.url));
    }
  }

  // Acessando rotas de Manager
  if (pathname.startsWith(MANAGER_ROOT)) {
    if (role !== "manager") {
      // Se não for manager (ex: um admin), chuta ele para o dashboard de admin
      return NextResponse.redirect(new URL(ADMIN_ROOT, request.url));
    }
  }

  // 4. Se passou em todas as checagens, permita o acesso
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
