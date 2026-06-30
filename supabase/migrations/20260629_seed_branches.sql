-- Seed initial branches
INSERT INTO branches (name, location)
VALUES ('Douala Branch', 'Douala, Littoral Region'),
    ('Yaounde Branch', 'Yaounde, Centre Region'),
    ('Bamenda Branch', 'Bamenda, North West Region'),
    ('Limbe Branch', 'Limbe, South West Region') ON CONFLICT DO NOTHING;