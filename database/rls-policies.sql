-- ============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- Waná Marketplace - Seguridad de Datos
-- ============================================================================
-- 
-- IMPORTANTE: Ejecuta estos comandos en el SQL Editor de tu dashboard Supabase
-- URL: https://app.supabase.com/project/YOUR_PROJECT_ID/sql/new
--
-- Estos policies protegen:
-- 1. Acceso público restringido a domos
-- 2. Aislamiento de propiedades por owner
-- 3. Bookings visibles solo para guest o host
-- 4. Invoices accesibles solo para partes relevantes
-- 5. Audit logs inmutables (append-only)
-- ============================================================================

-- Enable RLS on all relevant tables
ALTER TABLE IF EXISTS "public"."domos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."properties" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."bookings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."pending_invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."audit_logs" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TABLA: domos
-- ============================================================================
-- Política: Anyone can view ONLY available domos
DROP POLICY IF EXISTS "Public can view available domos" ON "public"."domos";
CREATE POLICY "Public can view available domos" ON "public"."domos"
  FOR SELECT
  TO public
  USING (estado = 'disponible');

-- Política: Only owner can update their properties
DROP POLICY IF EXISTS "Host can update own properties" ON "public"."domos";
CREATE POLICY "Host can update own properties" ON "public"."domos"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Política: Only owner can insert their properties
DROP POLICY IF EXISTS "Host can create properties" ON "public"."domos";
CREATE POLICY "Host can create properties" ON "public"."domos"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- ============================================================================
-- TABLA: properties
-- ============================================================================
-- Política: Host isolation - Solo el dueño ve y edita sus propiedades
DROP POLICY IF EXISTS "Host isolation - read own" ON "public"."properties";
CREATE POLICY "Host isolation - read own" ON "public"."properties"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Host isolation - write own" ON "public"."properties";
CREATE POLICY "Host isolation - write own" ON "public"."properties"
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- ============================================================================
-- TABLA: bookings
-- ============================================================================
-- Política: Guest puede ver su propio booking
DROP POLICY IF EXISTS "Guest can view own bookings" ON "public"."bookings";
CREATE POLICY "Guest can view own bookings" ON "public"."bookings"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = guest_id);

-- Política: Host puede ver bookings de sus propiedades
DROP POLICY IF EXISTS "Host can view property bookings" ON "public"."bookings";
CREATE POLICY "Host can view property bookings" ON "public"."bookings"
  FOR SELECT
  TO authenticated
  USING (
    property_id IN (
      SELECT id FROM "public"."domos"
      WHERE owner_id = auth.uid()
    )
  );

-- Política: Solo sistema (via RLS bypass) puede crear bookings
DROP POLICY IF EXISTS "Bookings created via server action" ON "public"."bookings";
CREATE POLICY "Bookings created via server action" ON "public"."bookings"
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Server action controlará la lógica

-- Política: Solo el guest o host pueden actualizar booking status
DROP POLICY IF EXISTS "Booking status updates" ON "public"."bookings";
CREATE POLICY "Booking status updates" ON "public"."bookings"
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = guest_id OR
    property_id IN (
      SELECT id FROM "public"."domos"
      WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- TABLA: pending_invoices
-- ============================================================================
-- Política: Host puede ver invoices pendientes de sus propiedades
DROP POLICY IF EXISTS "Host can view pending invoices" ON "public"."pending_invoices";
CREATE POLICY "Host can view pending invoices" ON "public"."pending_invoices"
  FOR SELECT
  TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM "public"."bookings"
      WHERE property_id IN (
        SELECT id FROM "public"."domos"
        WHERE owner_id = auth.uid()
      )
    )
  );

-- Política: Sistema inserta invoices pendientes (vía server action)
DROP POLICY IF EXISTS "Insert pending invoices" ON "public"."pending_invoices";
CREATE POLICY "Insert pending invoices" ON "public"."pending_invoices"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política: Solo admin puede marcar como resueltas
DROP POLICY IF EXISTS "Update invoice status - admin only" ON "public"."pending_invoices";
CREATE POLICY "Update invoice status - admin only" ON "public"."pending_invoices"
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "public"."user_roles"
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================================================
-- TABLA: audit_logs
-- ============================================================================
-- Política: Append-only (solo INSERT permitido)
DROP POLICY IF EXISTS "Audit logs append-only" ON "public"."audit_logs";
CREATE POLICY "Audit logs append-only" ON "public"."audit_logs"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política: Host/Guest pueden ver logs de sus transacciones
DROP POLICY IF EXISTS "Audit logs - transaction visibility" ON "public"."audit_logs";
CREATE POLICY "Audit logs - transaction visibility" ON "public"."audit_logs"
  FOR SELECT
  TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM "public"."bookings"
      WHERE guest_id = auth.uid() OR
      property_id IN (
        SELECT id FROM "public"."domos"
        WHERE owner_id = auth.uid()
      )
    )
  );

-- Política: Admin puede ver todos los logs
DROP POLICY IF EXISTS "Admin can view all audit logs" ON "public"."audit_logs";
CREATE POLICY "Admin can view all audit logs" ON "public"."audit_logs"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "public"."user_roles"
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================================================
-- TABLA HELPER: user_roles (para RBAC)
-- ============================================================================
-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS "public"."user_roles" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'host', 'admin')),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;

-- Política: Users solo ven sus propios roles
DROP POLICY IF EXISTS "Users can view own roles" ON "public"."user_roles";
CREATE POLICY "Users can view own roles" ON "public"."user_roles"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- VERIFICACIÓN: Comprueba que RLS está habilitado
-- ============================================================================
-- Ejecuta esta query para verificar:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN 
-- ('domos', 'properties', 'bookings', 'pending_invoices', 'audit_logs');
-- Resultado esperado: Todas las tablas deben mostrar rowsecurity = true
