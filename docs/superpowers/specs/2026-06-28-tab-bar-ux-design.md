# Items & Todos Tab Bar UX Design

**Date:** 2026-06-28  
**Status:** Implemented

## Summary

Improve mobile navigation for items and todos modules: bottom tab bar with home entry, safe-area-aware layout, FAB for new items, App Store-style search refocus, and item detail hero cost dashboard.

## Decisions

| Topic | Choice |
|-------|--------|
| New item entry | FAB (bottom-right), items list tab only |
| Tab icons | Semantic set (Package, Search, Settings, ListTodo, etc.) |
| Home entry | Rightmost tab → `/portal`, remove top BackToHomeButton |
| Search focus | First tap navigates; second tap on search tab focuses input |
| Detail cost UI | Hero card (name + status + 3 metrics), remove bottom section |
| Safe area | `viewport-fit=cover` + tab content h-14 + `pb-safe-bottom` below |

## Components

- `shared/components/AppTabBar.tsx` — reusable bottom tab bar with safe area
- `modules/items/context/items-search-focus.tsx` — search refocus registry
- `modules/items/components/ItemDetailHero.tsx` — detail hero dashboard

## Tab Configuration

**Items:** 物品 · 搜索 · 管理 · 主页  
**Todos:** 待办 · 时间轴 · 分配给我 · 清单 · 主页

## Layout

```
Tab bar total height = 3.5rem + safe-area-inset-bottom
FAB bottom = tab bar height + 0.75rem
Main padding-bottom accounts for tab bar (+ FAB when visible)
```
