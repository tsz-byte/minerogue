# MineRogue — Stable Polish Plan (v0.9)

**Goal:** Reach a polished, complete, playable state before any major feature additions.

## Critical (Must Fix)

### 1. Item Textures ✅ IN PROGRESS
- Generate procedural 16x16 textures for ALL items in the item atlas
- Each item type gets a unique recognizable shape + color
- Tools: blade/head shape + handle
- Armor: helmet/chest/leg/boot silhouettes  
- Food: distinctive shapes (apple circle, bread loaf, steak rectangle)
- Materials: colored shapes (ingot, gem, dust)
- Potions: bottle shape with colored liquid

### 2. Mob Models ✅ IN PROGRESS
- Replace box-only mobs with proper multi-part models
- Chicken: small body, tiny wings, beak, legs
- Slime: translucent cube with face, bouncy animation
- Spider: wide flat body, 8 legs
- Skeleton: thin bones, skull head
- All mobs: unique UV textures per part

### 3. Block Breaking Animation
- Minecraft-style crack overlay (10 stages)
- Wireframe box at mining position with crack density
- Progressive opacity as block health decreases

### 4. Hit Animation
- Screen flash on hit
- Knockback visual
- Red vignette on low health

### 5. Held Item Position
- Move held items up relative to hand
- Items should appear ON TOP of hand, not inside it

## Important (Should Fix)

### 6. More Crafting Recipes
- All tool tiers craftable
- All armor tiers craftable
- Utility items (bucket, compass, clock, etc.)
- Building blocks (stairs, slabs, walls)

### 7. Item Functionality
- All tools have correct mining speeds
- All weapons have correct damage
- All armor has correct defense
- All food restores correct hunger
- All potions apply correct effects

### 8. Lighting Shaders
- Ambient occlusion on block faces
- Smooth lighting gradient
- Water reflections/transparency
- Sky gradient with stars

## Polish (Nice to Have)

### 9. QoL
- Shift-click to move items between inventory/crafting
- Auto-sort inventory
- Item comparison tooltips
- Hotbar number indicators
- Death screen shows cause

### 10. Visual Polish
- Particle effects on block break
- Item pickup animation
- Mob death animation
- Weather effects (rain, snow)
