-- 计量单位支持停用（管理页与待办提醒/重复逻辑一致）
ALTER TABLE public.units
  ADD COLUMN IF NOT EXISTS is_disabled boolean NOT NULL DEFAULT false;
