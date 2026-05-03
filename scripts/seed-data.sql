INSERT INTO users (name, email, wallet_balance)
VALUES
('Amit Sharma', 'amit.sharma@example.com', 500000.00),
('Neha Verma', 'neha.verma@example.com', 300000.00),
('Rahul Singh', 'rahul.singh@example.com', 150000.00)
ON CONFLICT (email) DO NOTHING;