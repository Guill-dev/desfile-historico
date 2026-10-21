-- ═══════════════════════════════════════════════════════════════════════════
--  ESTADÍSTICAS DEL SITIO — Desfile Histórico de Gualmatán
--  Pegar completo en Supabase → SQL Editor → Run. Se puede ejecutar más de una vez.
--
--  Qué hace:
--   1. Crea la tabla "eventos" (visitas, tiempo, toques, secciones, videos). Todo anónimo.
--   2. Crea la tabla "administradores": quién puede LEER las estadísticas.
--   3. Reglas de seguridad: cualquiera puede ENVIAR eventos (así se miden las visitas),
--      pero solo un administrador con sesión iniciada puede VERLOS.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Eventos ─────────────────────────────────────────────────────────────────
create table if not exists public.eventos (
  id          bigint generated always as identity primary key,
  recibido    timestamptz not null default now(),          -- cuándo llegó al servidor
  creado      timestamptz not null,                        -- cuándo pasó en el navegador
  tipo        text not null check (tipo in ('vista', 'tiempo', 'clic', 'seccion', 'media')),
  ruta        text not null check (char_length(ruta) <= 300),
  sesion      text not null check (char_length(sesion) <= 64),
  visitante   text not null check (char_length(visitante) <= 64),
  vista       text not null check (char_length(vista) <= 64),
  dispositivo text not null check (dispositivo in ('movil', 'tablet', 'escritorio')),
  datos       jsonb not null default '{}'::jsonb check (pg_column_size(datos) <= 2048)
);

-- El panel siempre pide "desde tal fecha": este índice lo hace rápido
create index if not exists eventos_creado on public.eventos (creado);

-- 2. Administradores ────────────────────────────────────────────────────────
create table if not exists public.administradores (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- ¿La persona con sesión iniciada es administradora? (la usa el panel y las reglas de abajo)
create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.administradores where user_id = auth.uid())
$$;

-- 3. Seguridad ──────────────────────────────────────────────────────────────
alter table public.eventos enable row level security;
alter table public.administradores enable row level security;

drop policy if exists "enviar eventos" on public.eventos;
create policy "enviar eventos" on public.eventos
  for insert to anon, authenticated
  with check (creado between now() - interval '1 day' and now() + interval '10 minutes');

drop policy if exists "leer eventos" on public.eventos;
create policy "leer eventos" on public.eventos
  for select to authenticated
  using (public.es_admin());

-- El público solo puede insertar (no leer, cambiar ni borrar). Con sesión se puede leer,
-- y la regla "leer eventos" deja ver filas solo a los administradores.
revoke all on public.eventos from anon, authenticated;
grant insert on public.eventos to anon, authenticated;
grant select on public.eventos to authenticated;

-- La lista de administradores no se lee ni se cambia desde el sitio (solo desde este editor)
revoke all on public.administradores from anon, authenticated;

revoke all on function public.es_admin() from public, anon;
grant execute on function public.es_admin() to authenticated;


-- ═══════════════════════════════════════════════════════════════════════════
--  DESPUÉS DE CREAR TU USUARIO (Authentication → Users → Add user):
--  cambia el correo y ejecuta solo esta línea para volverte administrador.
-- ═══════════════════════════════════════════════════════════════════════════
-- insert into public.administradores (user_id)
-- select id from auth.users where email = '[tu correo]'
-- on conflict do nothing;


-- ═══════════════════════════════════════════════════════════════════════════
--  OPCIONAL: borrar eventos de más de 2 años para que la base no crezca sin fin.
--  Ejecutarlo a mano de vez en cuando.
-- ═══════════════════════════════════════════════════════════════════════════
-- delete from public.eventos where creado < now() - interval '2 years';
