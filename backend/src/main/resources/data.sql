-- 1. USUARIOS (Password: admin123)
INSERT IGNORE INTO users (id, email, password, username, role)
VALUES (1, 'admin@devtest.com', '$2a$10$4ruqE8FlnERNCuIW/6pI6.1rlZmJiG/plwFwif5KPGxjwbM9Sm6je', 'Administrador', 'ROLE_ADMIN');

INSERT IGNORE INTO users (id, email, password, username, role)
VALUES (2, 'candidato@devtest.com', '$2a$10$4ruqE8FlnERNCuIW/6pI6.1rlZmJiG/plwFwif5KPGxjwbM9Sm6je', 'Candidato Pruebas', 'ROLE_CANDIDATE');

-- 2. EVALUACIONES
INSERT IGNORE INTO assessments (id, name, description, time_limit_minutes, question_count, is_active)
VALUES (1, 'Java Core Assessment', 'Evaluación técnica de Java.', 60, 2, 1);

-- 3. PREGUNTAS
INSERT IGNORE INTO questions (id, assessment_id, title, description, allowed_languages, score)
VALUES (1, 1, 'Suma Básica', 'Suma de 2 números', 'JAVA,PYTHON,JAVASCRIPT', 100);

INSERT IGNORE INTO questions (id, assessment_id, title, description, allowed_languages, score)
VALUES (2, 1, 'El Mayor del Arreglo', 'Número mayor', 'JAVA,PYTHON,JAVASCRIPT', 100);

-- 4. CASOS DE PRUEBA
INSERT IGNORE INTO test_cases (id, question_id, input_data, expected_output, is_hidden)
VALUES (1, 1, '3 5', '8', 0);
INSERT IGNORE INTO test_cases (id, question_id, input_data, expected_output, is_hidden)
VALUES (2, 1, '-2 7', '5', 1);
INSERT IGNORE INTO test_cases (id, question_id, input_data, expected_output, is_hidden)
VALUES (3, 2, '3,5,1,8', '8', 0);
INSERT IGNORE INTO test_cases (id, question_id, input_data, expected_output, is_hidden)
VALUES (4, 2, '-5,-1,-10', '-1', 1);