-- Inserimento Nazione
INSERT INTO nation (id, name) VALUES (1, 'Italia') ON CONFLICT DO NOTHING;

-- Inserimento Regioni (Esempio)
INSERT INTO region (id, name, nation_id) VALUES (1, 'Lazio', 1) ON CONFLICT DO NOTHING;
INSERT INTO region (id, name, nation_id) VALUES (2, 'Lombardia', 1) ON CONFLICT DO NOTHING;

-- Inserimento Città (Esempio)
INSERT INTO city (id, name, region_id) VALUES (1, 'Roma', 1) ON CONFLICT DO NOTHING;
INSERT INTO city (id, name, region_id) VALUES (2, 'Milano', 2) ON CONFLICT DO NOTHING;