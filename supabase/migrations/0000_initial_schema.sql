-- Create the influencers table
CREATE TABLE public.influencers (
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
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create the scenes table
CREATE TABLE public.scenes (
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
    is_partnership BOOLEAN DEFAULT false,
    scenario_image_preview TEXT,
    scenario_image_type TEXT,
    allow_digital_text BOOLEAN DEFAULT false,
    only_physical_text BOOLEAN DEFAULT false,
    markdown_script TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS) for the tables
ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenes ENABLE ROW LEVEL SECURITY;

-- Create policies for influencers table
CREATE POLICY "Users can view their own influencers."
    ON public.influencers FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own influencers."
    ON public.influencers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own influencers."
    ON public.influencers FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own influencers."
    ON public.influencers FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for scenes table
CREATE POLICY "Users can view their own scenes."
    ON public.scenes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scenes."
    ON public.scenes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scenes."
    ON public.scenes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scenes."
    ON public.scenes FOR DELETE
    USING (auth.uid() = user_id);
