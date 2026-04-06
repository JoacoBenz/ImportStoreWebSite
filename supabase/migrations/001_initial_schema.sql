-- Tabla de categorías
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Categorías iniciales
INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('Auriculares', 'auriculares', '🎧', 1),
  ('Cargadores', 'cargadores', '🔌', 2),
  ('Cables', 'cables', '🔗', 3),
  ('Fundas', 'fundas', '📱', 4),
  ('Accesorios', 'accesorios', '⌚', 5),
  ('Otros', 'otros', '📦', 99);

-- Tabla de productos
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  price_usd DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de configuración (singleton)
CREATE TABLE config (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  exchange_rate DECIMAL(10,2) NOT NULL DEFAULT 1000.00,
  profit_margin DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  whatsapp_number TEXT,
  store_name TEXT DEFAULT 'Import Store Argentina',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insertar config inicial
INSERT INTO config (exchange_rate, profit_margin, whatsapp_number, store_name)
VALUES (1200.00, 1.00, '+5491100000000', 'Import Store Argentina');

-- Tabla de historial de cargas de stock
CREATE TABLE stock_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  raw_message TEXT NOT NULL,
  parsed_products JSONB NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('replace', 'add')),
  products_created INTEGER DEFAULT 0,
  products_updated INTEGER DEFAULT 0,
  products_deactivated INTEGER DEFAULT 0,
  source TEXT NOT NULL CHECK (source IN ('whatsapp', 'admin_panel')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de estado de conversación para WhatsApp
CREATE TABLE conversation_state (
  phone_number TEXT PRIMARY KEY,
  state JSONB NOT NULL DEFAULT '{"step": "idle"}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('spanish', name));
CREATE INDEX idx_stock_history_created ON stock_history(created_at DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER config_updated_at
  BEFORE UPDATE ON config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER conversation_state_updated_at
  BEFORE UPDATE ON conversation_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_state ENABLE ROW LEVEL SECURITY;

-- Políticas: lectura pública para productos activos, escritura solo autenticados
CREATE POLICY "Productos activos visibles para todos" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin puede hacer todo con productos" ON products
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Config lectura pública" ON config
  FOR SELECT USING (true);

CREATE POLICY "Admin puede editar config" ON config
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Categorías visibles para todos" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Admin puede editar categorías" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin puede ver historial" ON stock_history
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Conversation state acceso servicio" ON conversation_state
  FOR ALL USING (true);
