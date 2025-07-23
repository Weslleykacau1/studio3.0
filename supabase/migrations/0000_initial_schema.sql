-- Tabela de Influenciadores
CREATE TABLE influencers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    niche TEXT,
    personality TEXT,
    appearance TEXT,
    bio TEXT,
    unique_trait TEXT,
    negative_prompt TEXT,
    age TEXT,
    gender TEXT,
    accent TEXT,
    seed BIGINT,
    image_preview TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Cenas
CREATE TABLE scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    setting TEXT,
    action TEXT,
    dialogue TEXT,
    camera_angle TEXT,
    duration TEXT,
    video_format TEXT,
    product_name TEXT,
    product_brand TEXT,
    product_description TEXT,
    product_image_preview TEXT,
    product_image_type TEXT,
    is_partnership BOOLEAN DEFAULT FALSE,
    scenario_image_preview TEXT,
    scenario_image_type TEXT,
    allow_digital_text BOOLEAN DEFAULT FALSE,
    only_physical_text BOOLEAN DEFAULT FALSE,
    markdown_script TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ativar Row Level Security (RLS) para as tabelas
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela de INFLUENCERS
-- 1. Utilizadores podem ver os seus próprios influenciadores
CREATE POLICY "Allow users to view their own influencers"
ON influencers FOR SELECT
USING (auth.uid() = user_id);

-- 2. Utilizadores podem inserir os seus próprios influenciadores
CREATE POLICY "Allow users to insert their own influencers"
ON influencers FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Utilizadores podem atualizar os seus próprios influenciadores
CREATE POLICY "Allow users to update their own influencers"
ON influencers FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Utilizadores podem apagar os seus próprios influenciadores
CREATE POLICY "Allow users to delete their own influencers"
ON influencers FOR DELETE
USING (auth.uid() = user_id);

-- Políticas para a tabela de CENAS
-- 1. Utilizadores podem ver as suas próprias cenas
CREATE POLICY "Allow users to view their own scenes"
ON scenes FOR SELECT
USING (auth.uid() = user_id);

-- 2. Utilizadores podem inserir as suas próprias cenas
CREATE POLICY "Allow users to insert their own scenes"
ON scenes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Utilizadores podem atualizar as suas próprias cenas
CREATE POLICY "Allow users to update their own scenes"
ON scenes FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Utilizadores podem apagar as suas próprias cenas
CREATE POLICY "Allow users to delete their own scenes"
ON scenes FOR DELETE
USING (auth.uid() = user_id);
