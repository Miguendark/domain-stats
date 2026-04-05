-- DomainStats Schema --

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'dueño' CHECK (rol IN ('admin', 'dueño', 'usuario_subdominio')),
    estado VARCHAR(20) DEFAULT 'pendiente_pago', -- pendiente_pago, activo, suspendido
    api_client_id TEXT,
    api_client_secret TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Dominios
CREATE TABLE IF NOT EXISTS domains (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) UNIQUE NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Tabla de Subdominios
CREATE TABLE IF NOT EXISTS subdomains (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    domain_id INT REFERENCES domains(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL, -- Usuario asignado al subdominio
    UNIQUE (nombre, domain_id)
);

-- 4. Tabla de Estadísticas
CREATE TABLE IF NOT EXISTS stats (
    id SERIAL PRIMARY KEY,
    impresiones INT DEFAULT 0,
    clics INT DEFAULT 0,
    ctr DECIMAL(5,2) DEFAULT 0,
    ecpm DECIMAL(10,2) DEFAULT 0,
    ingresos DECIMAL(15,2) DEFAULT 0,
    fecha DATE DEFAULT CURRENT_DATE,
    subdomain_id INT REFERENCES subdomains(id) ON DELETE CASCADE,
    UNIQUE (subdomain_id, fecha) -- Evita duplicados para el mismo día y subdominio
);

-- 5. Tabla de Pagos
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(50) CHECK (plan IN ('basico', 'pro', 'premium')),
    monto DECIMAL(10,2),
    stripe_session_id VARCHAR(255),
    estado VARCHAR(20) DEFAULT 'pendiente',
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabla de Suscripciones
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'activo', -- activo, expirado, advertencia
    plan VARCHAR(50)
);
