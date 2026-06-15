-- V2__seed_default_categories.sql
-- Default expense categories (user_id NULL = system-wide defaults)
INSERT INTO categories (id, user_id, name, icon, color, type, is_default) VALUES
    (gen_random_uuid(), NULL, 'Food & Dining',      'utensils',      '#FF6B6B', 'EXPENSE', true),
    (gen_random_uuid(), NULL, 'Transportation',     'car',           '#4ECDC4', 'EXPENSE', true),
    (gen_random_uuid(), NULL, 'Shopping',           'shopping-bag',  '#45B7D1', 'EXPENSE', true),
    (gen_random_uuid(), NULL, 'Housing',            'home',          '#96CEB4', 'EXPENSE', true),
    (gen_random_uuid(), NULL, 'Entertainment',      'film',          '#FFEAA7', 'EXPENSE', true),
    (gen_random_uuid(), NULL, 'Healthcare',         'heart',         '#DDA0DD', 'EXPENSE', true),
    (gen_random_uuid(), NULL, 'Education',          'book',          '#98D8C8', 'EXPENSE', true),
    (gen_random_uuid(), NULL, 'Travel',             'plane',         '#F7DC6F', 'EXPENSE', true),
    (gen_random_uuid(), NULL, 'Utilities',          'zap',           '#BB8FCE', 'EXPENSE', true),
    (gen_random_uuid(), NULL, 'Personal Care',      'user',          '#85C1E9', 'EXPENSE', true),
    -- Income categories
    (gen_random_uuid(), NULL, 'Salary',             'briefcase',     '#58D68D', 'INCOME',  true),
    (gen_random_uuid(), NULL, 'Freelance',          'laptop',        '#52BE80', 'INCOME',  true),
    (gen_random_uuid(), NULL, 'Investment',         'trending-up',   '#27AE60', 'INCOME',  true),
    (gen_random_uuid(), NULL, 'Gift',               'gift',          '#A9DFBF', 'INCOME',  true),
    (gen_random_uuid(), NULL, 'Other Income',       'plus-circle',   '#82E0AA', 'INCOME',  true),
    (gen_random_uuid(), NULL, 'Other Expense',      'minus-circle',  '#F1948A', 'EXPENSE', true);
