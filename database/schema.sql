-- Таблица учителей
CREATE TABLE IF NOT EXISTS teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица учеников
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица шаблонов расписания (циклическое расписание)
CREATE TABLE IF NOT EXISTS lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  time TIME NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица экземпляров занятий (конкретные занятия на конкретные даты)
CREATE TABLE IF NOT EXISTS lesson_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'paid', 'cancelled')),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lesson_id, date)
);

-- Создание индексов для производительности
CREATE INDEX IF NOT EXISTS idx_lesson_instances_date ON lesson_instances(date);
CREATE INDEX IF NOT EXISTS idx_lesson_instances_status ON lesson_instances(status);
CREATE INDEX IF NOT EXISTS idx_lesson_instances_teacher ON lesson_instances(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lesson_instances_student ON lesson_instances(student_id);
CREATE INDEX IF NOT EXISTS idx_lessons_day_of_week ON lessons(day_of_week);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_lesson_instances_updated_at ON lesson_instances;
CREATE TRIGGER update_lesson_instances_updated_at
BEFORE UPDATE ON lesson_instances
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Включение Row Level Security (RLS)
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_instances ENABLE ROW LEVEL SECURITY;

-- Политики безопасности (разрешаем все операции для анонимных пользователей)
-- ВАЖНО: В продакшене настройте правильные политики безопасности!

DROP POLICY IF EXISTS "Allow all operations on teachers" ON teachers;
CREATE POLICY "Allow all operations on teachers" ON teachers
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on students" ON students;
CREATE POLICY "Allow all operations on students" ON students
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on lessons" ON lessons;
CREATE POLICY "Allow all operations on lessons" ON lessons
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on lesson_instances" ON lesson_instances;
CREATE POLICY "Allow all operations on lesson_instances" ON lesson_instances
FOR ALL USING (true) WITH CHECK (true);
