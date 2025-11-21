-- Create enum types
CREATE TYPE user_role AS ENUM ('patient', 'staff', 'admin');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- Extends auth.users with additional profile information
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role DEFAULT 'patient' NOT NULL,
  avatar_url TEXT,
  date_of_birth DATE,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- SERVICES TABLE
-- ============================================================================
-- Services offered by the clinic (e.g., consultation, massage therapy)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  currency TEXT DEFAULT 'USD' NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- STAFF_AVAILABILITY TABLE
-- ============================================================================
-- Defines when staff members are available for appointments
CREATE TABLE staff_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week day_of_week NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT unique_staff_day UNIQUE (staff_id, day_of_week, start_time)
);

-- ============================================================================
-- APPOINTMENTS TABLE
-- ============================================================================
-- Stores all appointment bookings
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status appointment_status DEFAULT 'pending' NOT NULL,
  patient_notes TEXT,
  staff_notes TEXT,
  cancellation_reason TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_appointment_time CHECK (end_time > start_time),
  CONSTRAINT no_past_appointments CHECK (appointment_date >= CURRENT_DATE)
);

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================
-- Tracks payment information for appointments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'USD' NOT NULL,
  status payment_status DEFAULT 'pending' NOT NULL,
  payment_method TEXT,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_amount DECIMAL(10, 2) CHECK (refund_amount >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Performance optimization indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

CREATE INDEX idx_services_active ON services(is_active);

CREATE INDEX idx_staff_availability_staff_id ON staff_availability(staff_id);
CREATE INDEX idx_staff_availability_day ON staff_availability(day_of_week);

CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_staff_id ON appointments(staff_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date_status ON appointments(appointment_date, status);

CREATE INDEX idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_availability_updated_at BEFORE UPDATE ON staff_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PROFILE AUTO-CREATION TRIGGER
-- ============================================================================
-- Automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- BUSINESS LOGIC FUNCTIONS
-- ============================================================================

-- Check if a staff member is available at a specific date/time
CREATE OR REPLACE FUNCTION is_staff_available(
  p_staff_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_appointment_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_day_of_week day_of_week;
  v_has_availability BOOLEAN;
  v_has_conflict BOOLEAN;
BEGIN
  -- Get day of week
  v_day_of_week := CASE EXTRACT(DOW FROM p_date)
    WHEN 0 THEN 'sunday'
    WHEN 1 THEN 'monday'
    WHEN 2 THEN 'tuesday'
    WHEN 3 THEN 'wednesday'
    WHEN 4 THEN 'thursday'
    WHEN 5 THEN 'friday'
    WHEN 6 THEN 'saturday'
  END;

  -- Check if staff has availability for this day/time
  SELECT EXISTS(
    SELECT 1 FROM staff_availability
    WHERE staff_id = p_staff_id
      AND day_of_week = v_day_of_week
      AND is_available = true
      AND start_time <= p_start_time
      AND end_time >= p_end_time
  ) INTO v_has_availability;

  IF NOT v_has_availability THEN
    RETURN FALSE;
  END IF;

  -- Check for conflicting appointments
  SELECT EXISTS(
    SELECT 1 FROM appointments
    WHERE staff_id = p_staff_id
      AND appointment_date = p_date
      AND status NOT IN ('cancelled', 'no_show')
      AND (id IS DISTINCT FROM p_exclude_appointment_id)
      AND (
        (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
      )
  ) INTO v_has_conflict;

  RETURN NOT v_has_conflict;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED DATA (Optional - for development)
-- ============================================================================

-- Insert sample services
INSERT INTO services (name, description, duration_minutes, price) VALUES
  ('Initial Consultation', 'Comprehensive assessment and treatment plan', 60, 120.00),
  ('Follow-up Session', 'Standard physiotherapy treatment session', 45, 90.00),
  ('Sports Injury Treatment', 'Specialized treatment for sports-related injuries', 60, 110.00),
  ('Manual Therapy', 'Hands-on therapeutic techniques', 30, 70.00),
  ('Rehabilitation Session', 'Post-surgery or injury rehabilitation', 60, 100.00);
