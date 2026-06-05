-- =====================================================
--  WAYGO — Migration: Landmarks + Chat Messages
--  Run this AFTER the main schema
-- =====================================================

-- =====================================================
--  LANDMARKS TABLE
-- =====================================================
create table if not exists public.landmarks (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  name_bg        text,
  description    text,
  description_bg text,
  category       text not null,
  lat            double precision not null,
  lng            double precision not null,
  image_url      text,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

alter table landmarks enable row level security;
create policy "Landmarks are publicly viewable" on landmarks
  for select using (true);

-- =====================================================
--  MESSAGES TABLE (real-time chat)
-- =====================================================
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid not null references profiles(id) on delete cascade,
  receiver_id uuid not null references profiles(id) on delete cascade,
  content     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_messages_sender   on messages (sender_id);
create index idx_messages_receiver on messages (receiver_id);
create index idx_messages_conv     on messages (sender_id, receiver_id, created_at);

alter table messages enable row level security;
create policy "Users can view their messages" on messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users can send messages" on messages
  for insert with check (auth.uid() = sender_id);
create policy "Users can mark own messages read" on messages
  for update using (auth.uid() = receiver_id);

-- Enable realtime for messages
alter publication supabase_realtime add table messages;

-- =====================================================
--  SEED LANDMARKS (Plovdiv)
-- =====================================================
insert into public.landmarks (name, name_bg, description, description_bg, category, lat, lng, image_url) values
  ('Ancient Theatre of Philippopolis',
   'Античен театър на Филипопол',
   'A magnificent Roman amphitheatre from the 2nd century AD, discovered in the 1970s. It seats up to 7,000 spectators and still hosts performances today.',
   'Величествен римски амфитеатър от 2 век сл.н.е., открит през 70-те години на миналия век. Побира до 7 000 зрители и все още домакинства представления.',
   'cultural', 42.1468, 24.7506, NULL),

  ('Nebet Tepe',
   'Небет тепе',
   'One of Plovdiv''s seven hills and the oldest inhabited site, dating back to 6000 BC. Offers stunning panoramic views of the city.',
   'Едно от седемте пловдивски хълмове и най-старото обитавано място, датиращо от 6000 г. пр.н.е. Предлага спираща дъха панорамна гледка към града.',
   'cultural', 42.1488, 24.7495, NULL),

  ('Dzhumaya Mosque',
   'Джумая джамия',
   'An Ottoman mosque built in the 14th century, one of the oldest in Europe. Features stunning frescoes and a large prayer hall.',
   'Османска джамия, построена през 14 век, една от най-старите в Европа. Характеризира се с впечатляващи стенописи и голяма молитвена зала.',
   'cultural', 42.1475, 24.7518, NULL),

  ('Plovdiv Old Town (Architectural Reserve)',
   'Старинен Пловдив (Архитектурен резерват)',
   'A charming historic district with cobblestone streets, Bulgarian Revival houses, art galleries, and museums. A must-visit for culture lovers.',
   'Очарователен исторически квартал с калдъръмени улици, възрожденски къщи, художествени галерии и музеи. Задължително посещение за любителите на културата.',
   'cultural', 42.1460, 24.7520, NULL),

  ('Plovdiv Ethnographic Museum',
   'Етнографски музей - Пловдив',
   'Housed in a stunning Revival-period mansion, this museum showcases Bulgarian traditional costumes, crafts, and everyday life from the 19th century.',
   'Разположен в красива възрожденска къща, музеят представя български носии, занаяти и бит от 19 век.',
   'museum', 42.1465, 24.7510, NULL),

  ('Kapana Creative District',
   'Капана - творчески квартал',
   'The bohemian heart of Plovdiv — a maze of narrow streets filled with galleries, craft shops, street art, cozy cafes, and bars.',
   'Бохемското сърце на Пловдив — лабиринт от тесни улички, изпълнени с галерии, занаятчийски магазини, улично изкуство, уютни кафета и барове.',
   'cultural', 42.1440, 24.7480, NULL),

  ('Plovdiv Central Square',
   'Централен площад - Пловдив',
   'The main city square featuring the iconic 19th-century Clock Tower, fountains, and the City Hall building.',
   'Главният градски площад с емблематичната Часовникова кула от 19 век, фонтани и сградата на Общината.',
   'cultural', 42.1450, 24.7525, NULL),

  ('Plovdiv Roman Stadium',
   'Римски стадион на Пловдив',
   'A 2nd-century Roman stadium discovered beneath the main shopping street. Could seat 30,000 spectators for athletic events.',
   'Римски стадион от 2 век, открит под главната търговска улица. Побирал е 30 000 зрители за спортни събития.',
   'cultural', 42.1470, 24.7515, NULL),

  ('Alyosha Monument',
   'Паметник на Альоша',
   'A towering 11.5m Soviet soldier statue on Bunarjik Hill, offering panoramic views of Plovdiv. One of the city''s most recognizable landmarks.',
   '11.5-метрова статуя на съветски войник на хълма Бунарджик, предлагаща панорамна гледка към Пловдив. Един от най-разпознаваемите символи на града.',
   'cultural', 42.1360, 24.7420, NULL),

  ('Plovdiv City Garden',
   'Градска градина - Пловдив',
   'The oldest public garden in Plovdiv, located in the city center. Features shady walkways, monuments, and a picturesque fountain.',
   'Най-старата обществена градина в Пловдив, разположена в центъра на града. Предлага сенчести алеи, паметници и живописен фонтан.',
   'park', 42.1440, 24.7540, NULL),

  ('Tsar Simeon Garden',
   'Цар Симеонова градина',
   'The main city garden opened in 1892 with a large fountain, playgrounds, and the Singing Fountains show in summer.',
   'Главната градска градина, открита през 1892 г. с голям фонтан, детски площадки и шоуто на Пеещите фонтани през лятото.',
   'park', 42.1410, 24.7550, NULL);
