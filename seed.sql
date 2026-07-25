-- Clean up existing data for users 1 and 2 (except users themselves)
DELETE FROM transactions WHERE user_id IN (1, 2);
DELETE FROM budgets WHERE user_id IN (1, 2);
DELETE FROM goals WHERE user_id IN (1, 2);
DELETE FROM bills WHERE user_id IN (1, 2);
DELETE FROM categories WHERE user_id IN (1, 2);
DELETE FROM wallets WHERE user_id IN (1, 2);

-- Insert Wallets for User 2 (khoint)
INSERT INTO wallets (user_id, name, balance, type) VALUES
(2, 'Cash', 1500.00, 'CASH'),
(2, 'Techcombank', 12500.50, 'BANK_ACCOUNT'),
(2, 'Credit Card (VP)', -350.00, 'CREDIT_CARD');

-- Insert Categories for User 2
INSERT INTO categories (user_id, name, type, icon, color, is_default) VALUES
(2, 'Food & Dining', 'EXPENSE', 'F', '#EF4444', false),
(2, 'Shopping', 'EXPENSE', 'S', '#3B82F6', false),
(2, 'Housing', 'EXPENSE', 'H', '#8B5CF6', false),
(2, 'Transportation', 'EXPENSE', 'T', '#F59E0B', false),
(2, 'Salary', 'INCOME', 'S', '#10B981', false),
(2, 'Investment', 'INCOME', 'I', '#059669', false),
(2, 'Freelance', 'INCOME', 'F', '#34D399', false);

-- Insert Budgets for User 2
INSERT INTO budgets (user_id, category_id, name, amount, period) 
SELECT 2, id, 'Food Budget', 1000.00, 'MONTHLY' FROM categories WHERE name = 'Food & Dining' AND user_id = 2;

INSERT INTO budgets (user_id, category_id, name, amount, period) 
SELECT 2, id, 'Shopping Budget', 500.00, 'MONTHLY' FROM categories WHERE name = 'Shopping' AND user_id = 2;

-- Insert Goals for User 2
INSERT INTO goals (user_id, name, target_amount, current_amount, target_date, color) VALUES
(2, 'Buy a new car', 25000.00, 5000.00, CURRENT_DATE + INTERVAL '1 year', '#3B82F6'),
(2, 'Summer Vacation', 3000.00, 1500.00, CURRENT_DATE + INTERVAL '3 months', '#F59E0B'),
(2, 'Emergency Fund', 10000.00, 8500.00, CURRENT_DATE + INTERVAL '6 months', '#10B981');

-- Insert Bills for User 2
INSERT INTO bills (user_id, name, amount, due_date, frequency, is_paid) VALUES
(2, 'Electricity', 150.00, CURRENT_DATE + INTERVAL '5 days', 'MONTHLY', false),
(2, 'Internet', 50.00, CURRENT_DATE - INTERVAL '2 days', 'MONTHLY', true),
(2, 'Netflix', 15.00, CURRENT_DATE + INTERVAL '10 days', 'MONTHLY', false),
(2, 'Gym Membership', 40.00, CURRENT_DATE + INTERVAL '15 days', 'MONTHLY', false);

-- Insert Transactions for User 2 (Mixed dates for chart data)
-- Let's use DO block or just explicit inserts
INSERT INTO transactions (user_id, wallet_id, category_id, amount, note, transaction_date)
SELECT 2, w.id, c.id, 3500.00, 'Monthly Salary', CURRENT_DATE - INTERVAL '5 days'
FROM wallets w, categories c WHERE w.name = 'Techcombank' AND c.name = 'Salary' AND w.user_id = 2 AND c.user_id = 2;

INSERT INTO transactions (user_id, wallet_id, category_id, amount, note, transaction_date)
SELECT 2, w.id, c.id, 800.00, 'Freelance project', CURRENT_DATE - INTERVAL '15 days'
FROM wallets w, categories c WHERE w.name = 'Techcombank' AND c.name = 'Freelance' AND w.user_id = 2 AND c.user_id = 2;

INSERT INTO transactions (user_id, wallet_id, category_id, amount, note, transaction_date)
SELECT 2, w.id, c.id, 45.50, 'Dinner with friends', CURRENT_DATE - INTERVAL '2 days'
FROM wallets w, categories c WHERE w.name = 'Credit Card (VP)' AND c.name = 'Food & Dining' AND w.user_id = 2 AND c.user_id = 2;

INSERT INTO transactions (user_id, wallet_id, category_id, amount, note, transaction_date)
SELECT 2, w.id, c.id, 120.00, 'Groceries', CURRENT_DATE - INTERVAL '4 days'
FROM wallets w, categories c WHERE w.name = 'Techcombank' AND c.name = 'Food & Dining' AND w.user_id = 2 AND c.user_id = 2;

INSERT INTO transactions (user_id, wallet_id, category_id, amount, note, transaction_date)
SELECT 2, w.id, c.id, 85.00, 'New Shoes', CURRENT_DATE - INTERVAL '10 days'
FROM wallets w, categories c WHERE w.name = 'Credit Card (VP)' AND c.name = 'Shopping' AND w.user_id = 2 AND c.user_id = 2;

INSERT INTO transactions (user_id, wallet_id, category_id, amount, note, transaction_date)
SELECT 2, w.id, c.id, 25.00, 'Uber to work', CURRENT_DATE - INTERVAL '1 day'
FROM wallets w, categories c WHERE w.name = 'Cash' AND c.name = 'Transportation' AND w.user_id = 2 AND c.user_id = 2;

INSERT INTO transactions (user_id, wallet_id, category_id, amount, note, transaction_date)
SELECT 2, w.id, c.id, 1500.00, 'Rent', CURRENT_DATE - INTERVAL '20 days'
FROM wallets w, categories c WHERE w.name = 'Techcombank' AND c.name = 'Housing' AND w.user_id = 2 AND c.user_id = 2;

-- Previous month transactions for charts
INSERT INTO transactions (user_id, wallet_id, category_id, amount, note, transaction_date)
SELECT 2, w.id, c.id, 3500.00, 'Salary', CURRENT_DATE - INTERVAL '35 days'
FROM wallets w, categories c WHERE w.name = 'Techcombank' AND c.name = 'Salary' AND w.user_id = 2 AND c.user_id = 2;

INSERT INTO transactions (user_id, wallet_id, category_id, amount, note, transaction_date)
SELECT 2, w.id, c.id, 1200.00, 'Rent', CURRENT_DATE - INTERVAL '50 days'
FROM wallets w, categories c WHERE w.name = 'Techcombank' AND c.name = 'Housing' AND w.user_id = 2 AND c.user_id = 2;

INSERT INTO transactions (user_id, wallet_id, category_id, amount, note, transaction_date)
SELECT 2, w.id, c.id, 450.00, 'Groceries', CURRENT_DATE - INTERVAL '40 days'
FROM wallets w, categories c WHERE w.name = 'Credit Card (VP)' AND c.name = 'Food & Dining' AND w.user_id = 2 AND c.user_id = 2;

-- Repeat exactly the same for Admin (User 1) so it works whoever they login as
INSERT INTO wallets (user_id, name, balance, type) VALUES
(1, 'Cash', 500.00, 'CASH'),
(1, 'Vietcombank', 8500.50, 'BANK_ACCOUNT');

INSERT INTO categories (user_id, name, type, icon, color, is_default) VALUES
(1, 'Food & Dining', 'EXPENSE', 'F', '#EF4444', false),
(1, 'Shopping', 'EXPENSE', 'S', '#3B82F6', false),
(1, 'Housing', 'EXPENSE', 'H', '#8B5CF6', false),
(1, 'Transportation', 'EXPENSE', 'T', '#F59E0B', false),
(1, 'Salary', 'INCOME', 'S', '#10B981', false);

INSERT INTO budgets (user_id, category_id, name, amount, period) 
SELECT 1, id, 'Food Budget', 800.00, 'MONTHLY' FROM categories WHERE name = 'Food & Dining' AND user_id = 1;

INSERT INTO goals (user_id, name, target_amount, current_amount, target_date, color) VALUES
(1, 'New Laptop', 2000.00, 1500.00, CURRENT_DATE + INTERVAL '2 months', '#3B82F6');

INSERT INTO bills (user_id, name, amount, due_date, frequency, is_paid) VALUES
(1, 'Electricity', 100.00, CURRENT_DATE + INTERVAL '5 days', 'MONTHLY', false);

INSERT INTO transactions (user_id, wallet_id, category_id, amount, note, transaction_date)
SELECT 1, w.id, c.id, 3000.00, 'Salary', CURRENT_DATE - INTERVAL '5 days'
FROM wallets w, categories c WHERE w.name = 'Vietcombank' AND c.name = 'Salary' AND w.user_id = 1 AND c.user_id = 1;

INSERT INTO transactions (user_id, wallet_id, category_id, amount, note, transaction_date)
SELECT 1, w.id, c.id, 50.00, 'Lunch', CURRENT_DATE - INTERVAL '2 days'
FROM wallets w, categories c WHERE w.name = 'Cash' AND c.name = 'Food & Dining' AND w.user_id = 1 AND c.user_id = 1;
