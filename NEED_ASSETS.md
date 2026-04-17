# NEED_ASSETS.md

Assets needed for Steamheart. Each entry describes exactly what to generate.
All sprites should be ~128×128px, transparent background (PNG), steampunk aesthetic (brass, iron, copper tones).

---

## Parts (gameplay pieces the player places)

### `assets/parts/corner.png`
**What it is:** A corner gear — transmits rotation around a 90° bend.  
**Visual:** An L-shaped arrangement of two interlocking bevel gears (or a single mitre gear set), brass and iron. One gear on the horizontal arm, one on the vertical arm, meshed at the corner hub. The sprite should be oriented for rotation 0 (right + down arms active — i.e. gears on the right and bottom sides). The code rotates the sprite 90°/180°/270° for other orientations.  
**Notes:** Hub/pivot point is at the centre of the sprite. Arms extend toward right and down in the base sprite.  
**Size:** 128×128px, transparent background.

### `assets/parts/axle.png`
**What it is:** A horizontal drive shaft / axle.  
**Visual:** A thick cylindrical metal rod going left-to-right, brass/copper coloured, with iron flanges/collars at each end. Centre hub or coupler knob in the middle. Slightly worn/oily industrial look.  
**Notes:** The sprite is always drawn horizontal — the code rotates it 90° when the player places it vertically. So the sprite itself must be horizontal.  
**Size:** 128×128px, transparent background.

---

## UI / HUD

### `assets/ui/pressure-bar-bg.png`
**What it is:** Background frame for the pressure gauge bar.  
**Visual:** A horizontal steampunk gauge frame — brass riveted border, dark glass/iron interior (where the fill will go). No fill inside, just the empty container. ~400×24px or similar wide rectangle.  
**Size:** 420×28px, transparent background.

### `assets/ui/pressure-bar-fill.png`
**What it is:** The fill texture that slides inside the pressure bar.  
**Visual:** Glowing orange-to-red gradient texture, like hot steam or lava. Used as a repeating/clipped fill inside the gauge frame above.  
**Size:** 420×20px, no transparency needed (will be masked).

### `assets/ui/pressure-bar-needle.png` *(optional, alternative to fill)*  
**What it is:** A dial needle or indicator for pressure.  
**Visual:** Small brass arrow/needle pointing right, used on top of the gauge frame.  
**Size:** 32×32px, transparent background.

---

## Audio

### `assets/audio/place.mp3`
**What it is:** Sound when the player places a gear or axle on the grid.  
**Sound:** Short metallic click + gear tooth clunk. ~0.2–0.3 sec. No reverb tail.

### `assets/audio/success.mp3`
**What it is:** Sound when the machine activates successfully.  
**Sound:** Satisfying mechanical "chunk-whirr" — gears engaging, steam releasing. ~1.0–1.5 sec.

### `assets/audio/fail.mp3`
**What it is:** Sound when activation fails (bad chain or pressure overload).  
**Sound:** Grinding metal scrape or clunk + steam hiss dying. ~0.5–0.8 sec.

### `assets/audio/pressure-high.mp3`
**What it is:** Looping ambient sound for high pressure levels (plays when pressure > 70%).  
**Sound:** Rhythmic steam hissing + metal creaking under pressure. ~2–3 sec loop, seamless.

---

## Floor tiles

### `assets/floor/axle-tile.png`
**What it is:** Floor tile shown under a placed axle.  
**Visual:** Dark iron floor panel with a recessed groove/channel running left-to-right (a bearing rail), where the axle sits. Matches the style of `floor-001.png`.  
**Size:** 128×128px, transparent background.

### `assets/floor/preplaced-gear-tile.png`
**What it is:** Floor tile shown under a pre-placed (fixed) gear that the player cannot move.  
**Visual:** Same as a regular floor tile but with a subtle brass mounting ring/bolted plate, indicating the gear is bolted down. Slightly different tint from regular floor tiles to signal "this was here before you".  
**Size:** 128×128px, transparent background.
