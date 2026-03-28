-- Update user role to HRD
-- Ganti 'rhvn@gmail.com' dengan email user yang ingin diubah

UPDATE users 
SET role = 'HRD' 
WHERE email = 'rhvn@gmail.com';

-- Verify the update
SELECT id, name, email, role 
FROM users 
WHERE email = 'rhvn@gmail.com';
