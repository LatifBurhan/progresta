-- Add sample projects with multiple divisions

-- First, let's get some division IDs
-- Assuming we have divisions with these IDs (adjust as needed)

-- Insert sample projects
INSERT INTO projects (id, name, description, start_date, end_date, is_active, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Website Redesign & Marketing Campaign', 'Complete website overhaul with integrated marketing strategy', '2026-03-25', '2026-05-25', true, NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'Mobile App Development & Backend', 'Cross-platform mobile app with robust backend infrastructure', '2026-04-01', '2026-07-01', true, NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'Data Analytics Dashboard', 'Comprehensive analytics dashboard for business intelligence', '2026-03-20', '2026-06-20', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Now add multiple divisions to each project
-- Project 1: Website Redesign & Marketing Campaign (involves IT and Marketing divisions)
INSERT INTO project_divisions (id, project_id, division_id, created_at) 
SELECT 
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    d.id,
    NOW()
FROM divisions d 
WHERE d.name IN ('digital marketing', 'backend') -- Adjust division names as needed
ON CONFLICT (project_id, division_id) DO NOTHING;

-- Project 2: Mobile App Development & Backend (involves multiple tech divisions)
INSERT INTO project_divisions (id, project_id, division_id, created_at) 
SELECT 
    gen_random_uuid(),
    '22222222-2222-2222-2222-222222222222',
    d.id,
    NOW()
FROM divisions d 
WHERE d.name IN ('backend', 'digital marketing') -- Adjust division names as needed
ON CONFLICT (project_id, division_id) DO NOTHING;

-- Project 3: Data Analytics Dashboard (involves data and frontend divisions)
INSERT INTO project_divisions (id, project_id, division_id, created_at) 
SELECT 
    gen_random_uuid(),
    '33333333-3333-3333-3333-333333333333',
    d.id,
    NOW()
FROM divisions d 
WHERE d.name LIKE '%marketing%' OR d.name LIKE '%backend%' -- Adjust as needed
ON CONFLICT (project_id, division_id) DO NOTHING;