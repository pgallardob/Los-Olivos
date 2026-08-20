-- ============================================================
-- Tabla: avisos
-- Almacena los avisos publicados desde el formulario web.
-- Render.com tiene filesystem efímero, por eso usamos Supabase.
-- ============================================================

CREATE TABLE IF NOT EXISTS avisos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Habilitar Row Level Security
ALTER TABLE avisos ENABLE ROW LEVEL SECURITY;

-- Política: permitir lectura pública (los avisos se muestran en la web)
CREATE POLICY "avisos_select_public" ON avisos
  FOR SELECT USING (true);

-- Política: permitir inserción solo con service_role (backend)
-- El service_role bypassa RLS automáticamente, no necesita política explícita

-- Índice para ordenar por fecha de creación
CREATE INDEX IF NOT EXISTS idx_avisos_created_at ON avisos (created_at DESC);

-- Comentario
COMMENT ON TABLE avisos IS 'Avisos públicos de Comercializadora Los Olivos';
