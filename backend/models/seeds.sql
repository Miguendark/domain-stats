-- Limpiar datos previos (Opcional, cuidado en producción)
-- TRUNCATE users, domains, stats, payments RESTART IDENTITY CASCADE;

-- 2. Usuarios de prueba (Password: 123456)
INSERT INTO users (name, email, password_hash, role)
VALUES 
('Admin', 'admin@domainstats.com', '$2a$10$76.2Xf1qMvG6N/K.Pz4.OeO0O6O6O6O6O6O6O6O6O6O6O6O6', 'admin'),
('Jose Miguel', 'jose@domainstats.com', '$2a$10$76.2Xf1qMvG6N/K.Pz4.OeO0O6O6O6O6O6O6O6O6O6O6O6O6', 'user')
ON CONFLICT (email) DO NOTHING;

-- 3. Dominios de prueba
INSERT INTO domains (user_id, domain_name)
VALUES 
((SELECT id FROM users WHERE email = 'admin@domainstats.com'), 'domainstats.com'),
((SELECT id FROM users WHERE email = 'jose@domainstats.com'), 'josemiguel.dev')
ON CONFLICT DO NOTHING;

-- 4. Estadísticas de prueba
INSERT INTO stats (domain_id, impressions, clicks, ctr, revenue, date)
VALUES
((SELECT id FROM domains WHERE domain_name = 'domainstats.com'), 1000, 120, 12.0, 45.50, CURRENT_DATE),
((SELECT id FROM domains WHERE domain_name = 'josemiguel.dev'), 500, 50, 10.0, 20.00, CURRENT_DATE)
ON CONFLICT (domain_id, date) DO NOTHING;

-- 5. Pagos de prueba
INSERT INTO payments (user_id, amount, status)
VALUES
((SELECT id FROM users WHERE email = 'jose@domainstats.com'), 15.00, 'completed'),
((SELECT id FROM users WHERE email = 'jose@domainstats.com'), 30.00, 'pending');
