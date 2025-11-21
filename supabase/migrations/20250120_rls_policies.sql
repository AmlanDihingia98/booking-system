-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- This file contains all security policies to control data access

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can view staff profiles (for booking appointments)
CREATE POLICY "Users can view staff profiles"
  ON profiles FOR SELECT
  USING (role = 'staff' OR role = 'admin');

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert profiles
CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- SERVICES POLICIES
-- ============================================================================

-- Everyone can view active services
CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  USING (is_active = true);

-- Staff and admins can view all services
CREATE POLICY "Staff can view all services"
  ON services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

-- Only admins can manage services
CREATE POLICY "Admins can insert services"
  ON services FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update services"
  ON services FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete services"
  ON services FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- STAFF_AVAILABILITY POLICIES
-- ============================================================================

-- Everyone can view availability (for booking)
CREATE POLICY "Anyone can view staff availability"
  ON staff_availability FOR SELECT
  USING (is_available = true);

-- Staff can manage their own availability
CREATE POLICY "Staff can view own availability"
  ON staff_availability FOR SELECT
  USING (
    staff_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Staff can insert own availability"
  ON staff_availability FOR INSERT
  WITH CHECK (
    staff_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Staff can update own availability"
  ON staff_availability FOR UPDATE
  USING (
    staff_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Staff can delete own availability"
  ON staff_availability FOR DELETE
  USING (
    staff_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

-- Admins can manage all availability
CREATE POLICY "Admins can manage all availability"
  ON staff_availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- APPOINTMENTS POLICIES
-- ============================================================================

-- Patients can view their own appointments
CREATE POLICY "Patients can view own appointments"
  ON appointments FOR SELECT
  USING (
    patient_id = auth.uid() OR
    staff_id = auth.uid()
  );

-- Patients can create appointments for themselves
CREATE POLICY "Patients can create own appointments"
  ON appointments FOR INSERT
  WITH CHECK (
    patient_id = auth.uid() AND
    is_staff_available(staff_id, appointment_date, start_time, end_time)
  );

-- Patients can update their own pending appointments
CREATE POLICY "Patients can update own pending appointments"
  ON appointments FOR UPDATE
  USING (
    patient_id = auth.uid() AND
    status = 'pending'
  )
  WITH CHECK (
    patient_id = auth.uid() AND
    is_staff_available(staff_id, appointment_date, start_time, end_time, id)
  );

-- Patients can cancel their own appointments
CREATE POLICY "Patients can cancel own appointments"
  ON appointments FOR UPDATE
  USING (
    patient_id = auth.uid() AND
    status IN ('pending', 'confirmed')
  )
  WITH CHECK (
    status = 'cancelled'
  );

-- Staff can view their assigned appointments
CREATE POLICY "Staff can view assigned appointments"
  ON appointments FOR SELECT
  USING (
    staff_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

-- Staff can update their assigned appointments
CREATE POLICY "Staff can update assigned appointments"
  ON appointments FOR UPDATE
  USING (
    staff_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

-- Admins can manage all appointments
CREATE POLICY "Admins can view all appointments"
  ON appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all appointments"
  ON appointments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete appointments"
  ON appointments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- PAYMENTS POLICIES
-- ============================================================================

-- Patients can view payments for their appointments
CREATE POLICY "Patients can view own payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = payments.appointment_id
        AND appointments.patient_id = auth.uid()
    )
  );

-- Staff can view payments for their appointments
CREATE POLICY "Staff can view assigned payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = payments.appointment_id
        AND appointments.staff_id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

-- Only admins and the system can create/update payments
CREATE POLICY "Admins can manage all payments"
  ON payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Service role can create/update payments (for Stripe webhooks)
CREATE POLICY "Service role can manage payments"
  ON payments FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
