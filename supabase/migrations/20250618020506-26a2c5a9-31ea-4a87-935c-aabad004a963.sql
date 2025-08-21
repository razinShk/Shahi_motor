
-- Create spare parts inventory table
CREATE TABLE public.spare_parts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  part_name TEXT NOT NULL,
  part_type TEXT NOT NULL,
  brand TEXT NOT NULL,
  part_number TEXT NOT NULL UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  quantity_in_stock INTEGER NOT NULL DEFAULT 0,
  reorder_threshold INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  registration_number TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales table
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sale items table (junction table for sales and spare parts)
CREATE TABLE public.sale_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
  spare_part_id UUID REFERENCES public.spare_parts(id) ON DELETE RESTRICT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service types table
CREATE TABLE public.service_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  estimated_duration_hours INTEGER,
  base_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  service_type_id UUID REFERENCES public.service_types(id) ON DELETE RESTRICT NOT NULL,
  service_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mileage INTEGER,
  labor_charges DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  next_service_date DATE,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service parts table (junction table for services and spare parts used)
CREATE TABLE public.service_parts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  spare_part_id UUID REFERENCES public.spare_parts(id) ON DELETE RESTRICT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert sample service types
INSERT INTO public.service_types (name, description, estimated_duration_hours, base_price) VALUES
('Regular Service', 'Basic maintenance and inspection', 2, 75.00),
('Oil Change', 'Engine oil and filter replacement', 1, 45.00),
('Brake Service', 'Brake system inspection and maintenance', 3, 120.00),
('Transmission Service', 'Transmission fluid and filter service', 2, 95.00),
('Engine Diagnostic', 'Computer diagnostic and troubleshooting', 1, 85.00),
('AC Service', 'Air conditioning system service', 2, 90.00),
('Wheel Alignment', 'Wheel alignment and balancing', 1, 65.00),
('Full Service', 'Comprehensive vehicle inspection and maintenance', 4, 150.00);

-- Insert sample spare parts
INSERT INTO public.spare_parts (part_name, part_type, brand, part_number, price, quantity_in_stock, reorder_threshold) VALUES
('Brake Pads', 'Brakes', 'Bosch', 'BP-001', 45.99, 25, 10),
('Oil Filter', 'Engine', 'Mann', 'OF-002', 12.99, 8, 15),
('Air Filter', 'Engine', 'K&N', 'AF-003', 28.50, 15, 8),
('Spark Plugs', 'Engine', 'NGK', 'SP-004', 8.99, 3, 12),
('Brake Fluid', 'Fluids', 'Castrol', 'BF-005', 15.99, 5, 10),
('Engine Oil', 'Fluids', 'Mobil 1', 'EO-006', 8.99, 20, 15),
('Transmission Fluid', 'Fluids', 'Valvoline', 'TF-007', 22.99, 12, 8),
('Coolant', 'Fluids', 'Prestone', 'CL-008', 18.50, 18, 10);

-- Enable Row Level Security
ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_parts ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can restrict these later when auth is implemented)
CREATE POLICY "Allow all operations on spare_parts" ON public.spare_parts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on vehicles" ON public.vehicles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on sales" ON public.sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on sale_items" ON public.sale_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on service_types" ON public.service_types FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on services" ON public.services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on service_parts" ON public.service_parts FOR ALL USING (true) WITH CHECK (true);

-- Create function to update spare parts stock after sale
CREATE OR REPLACE FUNCTION update_spare_parts_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrease stock when sale item is inserted
  IF TG_OP = 'INSERT' THEN
    UPDATE public.spare_parts 
    SET quantity_in_stock = quantity_in_stock - NEW.quantity,
        updated_at = now()
    WHERE id = NEW.spare_part_id;
    RETURN NEW;
  END IF;
  
  -- Increase stock when sale item is deleted (return/refund)
  IF TG_OP = 'DELETE' THEN
    UPDATE public.spare_parts 
    SET quantity_in_stock = quantity_in_stock + OLD.quantity,
        updated_at = now()
    WHERE id = OLD.spare_part_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to update spare parts stock after service
CREATE OR REPLACE FUNCTION update_spare_parts_stock_service()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrease stock when service part is used
  IF TG_OP = 'INSERT' THEN
    UPDATE public.spare_parts 
    SET quantity_in_stock = quantity_in_stock - NEW.quantity,
        updated_at = now()
    WHERE id = NEW.spare_part_id;
    RETURN NEW;
  END IF;
  
  -- Increase stock when service part is removed
  IF TG_OP = 'DELETE' THEN
    UPDATE public.spare_parts 
    SET quantity_in_stock = quantity_in_stock + OLD.quantity,
        updated_at = now()
    WHERE id = OLD.spare_part_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_stock_on_sale
  AFTER INSERT OR DELETE ON public.sale_items
  FOR EACH ROW EXECUTE FUNCTION update_spare_parts_stock();

CREATE TRIGGER trigger_update_stock_on_service
  AFTER INSERT OR DELETE ON public.service_parts
  FOR EACH ROW EXECUTE FUNCTION update_spare_parts_stock_service();

-- Create function to calculate sale total
CREATE OR REPLACE FUNCTION calculate_sale_total()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the total amount in sales table
  UPDATE public.sales 
  SET total_amount = (
    SELECT COALESCE(SUM(subtotal), 0) 
    FROM public.sale_items 
    WHERE sale_id = COALESCE(NEW.sale_id, OLD.sale_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.sale_id, OLD.sale_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate service total
CREATE OR REPLACE FUNCTION calculate_service_total()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the total cost in services table
  UPDATE public.services 
  SET total_cost = labor_charges + (
    SELECT COALESCE(SUM(subtotal), 0) 
    FROM public.service_parts 
    WHERE service_id = COALESCE(NEW.service_id, OLD.service_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.service_id, OLD.service_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for total calculations
CREATE TRIGGER trigger_calculate_sale_total
  AFTER INSERT OR UPDATE OR DELETE ON public.sale_items
  FOR EACH ROW EXECUTE FUNCTION calculate_sale_total();

CREATE TRIGGER trigger_calculate_service_total
  AFTER INSERT OR UPDATE OR DELETE ON public.service_parts
  FOR EACH ROW EXECUTE FUNCTION calculate_service_total();

CREATE TRIGGER trigger_calculate_service_total_on_labor
  AFTER UPDATE OF labor_charges ON public.services
  FOR EACH ROW EXECUTE FUNCTION calculate_service_total();
