-- Supabase (PostgreSQL) 数据库初始化/更新脚本
-- 用于同步 viral_scripts 表结构以匹配应用中的简化版 ViralScript 接口 (5个字段)

-- 1. 如果表不存在则创建
CREATE TABLE IF NOT EXISTS public.viral_scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'Untitled',
    content TEXT NOT NULL DEFAULT '',
    category TEXT DEFAULT '', -- 用于存储“开头”或分类
    likes_count INTEGER DEFAULT 0,
    collects_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 为现有表添加缺失的字段 (如果表已存在)
DO $$ 
BEGIN 
    -- 添加 category 字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='viral_scripts' AND column_name='category') THEN
        ALTER TABLE public.viral_scripts ADD COLUMN category TEXT DEFAULT '';
    END IF;

    -- 添加 likes_count 字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='viral_scripts' AND column_name='likes_count') THEN
        ALTER TABLE public.viral_scripts ADD COLUMN likes_count INTEGER DEFAULT 0;
    END IF;

    -- 添加 collects_count 字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='viral_scripts' AND column_name='collects_count') THEN
        ALTER TABLE public.viral_scripts ADD COLUMN collects_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 3. 设置 RLS (Row Level Security) 策略
ALTER TABLE public.viral_scripts ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取
DROP POLICY IF EXISTS "Allow public read access" ON public.viral_scripts;
CREATE POLICY "Allow public read access" ON public.viral_scripts
    FOR SELECT USING (true);

-- 允许所有人插入 (简化模式)
DROP POLICY IF EXISTS "Allow public insert access" ON public.viral_scripts;
CREATE POLICY "Allow public insert access" ON public.viral_scripts
    FOR INSERT WITH CHECK (true);

-- 允许所有人更新 (简化模式)
DROP POLICY IF EXISTS "Allow public update access" ON public.viral_scripts;
CREATE POLICY "Allow public update access" ON public.viral_scripts
    FOR UPDATE USING (true);

-- 4. 创建自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_viral_scripts_updated_at ON public.viral_scripts;
CREATE TRIGGER update_viral_scripts_updated_at
    BEFORE UPDATE ON public.viral_scripts
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- 5. 创建 posts 表 (用于保存同步后的内容)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'Untitled',
    content TEXT NOT NULL DEFAULT '',
    category TEXT DEFAULT '',
    likes_count INTEGER DEFAULT 0,
    collects_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. 为 posts 表设置 RLS 策略
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.posts;
CREATE POLICY "Allow public read access" ON public.posts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access" ON public.posts;
CREATE POLICY "Allow public insert access" ON public.posts
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access" ON public.posts;
CREATE POLICY "Allow public update access" ON public.posts
    FOR UPDATE USING (true);

-- 7. 为 posts 表创建自动更新 updated_at 的触发器
DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
