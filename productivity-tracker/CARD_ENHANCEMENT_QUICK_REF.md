# Quick Reference: Applying Card Enhancements to Other Components

## Components That Can Be Enhanced

Based on code analysis, the following components contain cards that can benefit from the enhancement system:

### High Priority
1. **TaskManager.tsx** - Task cards, project cards
2. **Stats.tsx** - Stat display cards  
3. **ReadingSystem.tsx** - Book cards, reading progress cards
4. **MeditationSystem.tsx** - Meditation session cards
5. **SectionView.tsx** - Section content cards
6. **WorkoutCategories.tsx** - Category selection cards

### Medium Priority
7. **Profile.tsx** - Profile info cards
8. **NotesReflection.tsx** - Note cards
9. **FocusPlanner.tsx** - Planning cards
10. **Scratchpad.tsx** - Scratch note cards

### Components Already Using Custom Themes
- **AI Components** (AIDashboard, AINotebook, etc.) - Already use `ai-theme.css`
- **Learning Section** - Has custom styling

## Quick Conversion Guide

### Find and Replace Pattern

**Old Pattern:**
```tsx
className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
```

**New Pattern (Choose Based on Content):**
```tsx
className="enhanced-card card-glow-[COLOR] card-animate-fade"
```

### Common Replacements

| Old Classes | New Classes | Use Case |
|------------|-------------|----------|
| `bg-white rounded-2xl p-6 shadow-sm border border-gray-100` | `enhanced-card card-glow-accent` | General cards |
| `bg-white rounded-xl p-4 shadow-sm border border-gray-100` | `enhanced-card-mini card-glow-accent` | Compact cards |
| `bg-white p-5 rounded-2xl shadow-sm border border-gray-100` | `enhanced-card card-glow-blue` | Info/stat cards |
| `bg-gray-50 rounded-xl p-4` | `enhanced-card-mini card-glow-accent` | Subtle cards |

### Step-by-Step for Each Component

#### For TaskManager.tsx:

**Current task card:**
```tsx
className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
```

**Enhanced version:**
```tsx
className="enhanced-card-mini card-glow-blue card-interactive card-animate-fade flex items-center gap-3"
```

#### For Stats.tsx:

**Current stat card:**
```tsx
className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2"
```

**Enhanced version:**
```tsx
className="enhanced-card card-glow-green card-animate-scale flex flex-col gap-2"
```

#### For Reading System:

**Current book card:**
```tsx
className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
```

**Enhanced version:**
```tsx
className="enhanced-card-mini card-glow-yellow card-interactive card-animate-slide"
```

## Color Selection Guide

Choose glow colors based on content type:

- **Orange** (`card-glow-orange`) - Urgent tasks, priorities, workouts
- **Yellow** (`card-glow-yellow`) - Notes, highlights, books
- **Blue** (`card-glow-blue`) - Information, careers, learning
- **Purple** (`card-glow-purple`) - Meditation, AI, creativity
- **Green** (`card-glow-green`) - Health, success, growth stats
- **Red** (`card-glow-red`) - Warnings, important alerts
- **Accent** (`card-glow-accent`) - General purpose, theme-aligned

## Adding Animations

### For Lists of Cards:
```tsx
{items.map((item, index) => (
    <div 
        key={item.id}
        className={`enhanced-card card-glow-blue card-animate-fade card-animate-stagger-${Math.min(index + 1, 6)}`}
    >
        {/* Content */}
    </div>
))}
```

### For Individual Cards:
```tsx
<div className="enhanced-card card-glow-orange card-animate-scale">
    {/* Content */}
</div>
```

## Preserving Existing Styles

If you need to keep some existing Tailwind classes:

```tsx
<div className="enhanced-card card-glow-blue flex items-center gap-4 hover:scale-105">
    {/* The enhanced-card provides base styles */}
    {/* Additional Tailwind classes work alongside */}
</div>
```

## Testing Checklist

After applying enhancements to a component:

- [ ] Card is visible and distinct from background
- [ ] Hover effect works smoothly
- [ ] Animation plays on mount (if added)
- [ ] Glow color matches content type
- [ ] Works in dark mode
- [ ] No layout breaking
- [ ] Performance is smooth

## Common Issues & Solutions

### Issue: Card too small after applying enhanced-card
**Solution:** Use `enhanced-card-mini` instead, or add custom padding:
```tsx
className="enhanced-card card-glow-blue p-4"
```

### Issue: Border radius too large/small
**Solution:** Override with inline style:
```tsx
className="enhanced-card card-glow-orange"
style={{ borderRadius: '1rem' }}
```

### Issue: Animation conflicts with existing animation
**Solution:** Remove the animation class or use only the glow:
```tsx
className="enhanced-card card-glow-blue" // No animation class
```

### Issue: Need different padding
**Solution:** Enhanced cards respect Tailwind padding overrides:
```tsx
className="enhanced-card card-glow-purple p-8"
```

## Example: Fully Enhanced Task Card

**Before:**
```tsx
<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items- center gap-3">
    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
        <Check className="w-4 h-4 text-blue-600" />
    </div>
    <div className="flex-1">
        <h3 className="font-bold text-gray-900">Task Title</h3>
        <p className="text-sm text-gray-500">Due today</p>
    </div>
</div>
```

**After:**
```tsx
<div className="enhanced-card-mini card-glow-blue card-interactive card-animate-fade flex items-center gap-3">
    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
        <Check className="w-4 h-4 text-blue-600" />
    </div>
    <div className="flex-1">
        <h3 className="font-bold">Task Title</h3>
        <p className="text-sm text-gray-500">Due today</p>
    </div>
</div>
```

**What changed:**
- ✅ Removed manual background, border, shadow, rounded classes
- ✅ Added `enhanced-card-mini` for base elevation
- ✅ Added `card-glow-blue` for appropriate glow color
- ✅ Added `card-interactive` for cursor pointer
- ✅ Added `card-animate-fade` for smooth entrance
- ✅ Kept `flex items-center gap-3` for layout
- ✅ Removed redundant `text-gray-900` (inherited from card)

## Batch Update Script (Optional)

For large components, you can use this regex pattern in VSCode:

**Find:**
```
className="bg-white rounded-\[?[^\]]+\]? p-\d+ shadow-sm border border-gray-100
```

**Replace with:**
```
className="enhanced-card card-glow-accent
```

Then manually adjust colors and animations as needed.

---

**Remember:** The card enhancement system is already imported globally. You just need to add the classes!
