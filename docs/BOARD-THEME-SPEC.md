# Board themes: art brief for the artist (version 4, ten themes)

For MiniWord (13 x 13), Masterword (15 x 15) and Bigword (17 x 17). **One theme pack works for all three games.**
The target look is the "Bigword Theme Collection" picture: a painted board, a single striking **object** at the centre, and theme decoration framing the board, with the same painting continuing more quietly behind the rest of the screen.

Two templates come with this brief (in `docs\templates\`):
- `board-template.png` shows where the squares fall, the centre object limit and the clear centre.
- `background-template.png` shows the board area and the quiet zones.

Paint over a copy of each template, then delete the template layer before exporting.

---

## 1. How the screen is built

The artist paints **two pictures per theme**:
1. **Board picture**: the board surface, the centre object and the decoration around the edge. **No squares, no grid, no letters.**
2. **Background picture**: the same scene continuing around the board, calmer.

The game draws on top, so the artist does **not** paint:
- The faint grid lines.
- The premium squares (raised, with a soft shadow) and their white symbols.
- **The centre square with its star**, where the first word goes.
- The wooden tiles and rack, and the panels and buttons.

---

## 2. Board picture (`board.webp`)

| Item | Rule |
|---|---|
| Size | **1536 x 1536 px**, square. (1024 x 1024 is acceptable.) |
| Format | WebP, quality 80, **under 400 KB** |
| Middle (inner 70%) | **Pale, light and calm**: cream, parchment, sand, light grass or light sky, with very faint motifs at most. Letter tiles and coloured squares sit here. |
| Outer band and corners | The theme decoration: feathers, leaves, waves, stars, bunting... This can be rich and colourful, as in the collection picture. |
| Centre object | See section 3. |
| Edges | Paint edge to edge. The game adds a thin gold edge around the board. |
| Not allowed | Squares, grid, letters, numbers, text, logos, watermarks (export without any generator mark). |

---

## 3. The centre object (most important)

The centre object is what makes each theme recognisable. It must look like **an object sitting on the board**, not a picture in a circle.

| Rule | Why |
|---|---|
| **A free-standing object, no circle or disc behind it.** Its outline is the object itself (a mask, a wreath, a shell, a planet, a compass). Transparent-style edges blending into the board surface. | The circle in the first Carnival picture made it look like a sticker. |
| **No bigger than the pink circle on the template: 20% of the board width** (about 300 px on a 1536 board, about 3 squares). | Bigger art ends up underneath many premium squares and looks cluttered. |
| **The very centre must stay clear and light** (the green square on the template, about 8% of the width, roughly 120 px). | The game draws the centre star square there, and the first word goes across it. |
| **Symmetrical shapes, or shapes with an open middle, work best**: a wreath, a ring of feathers, a compass rose, a sunburst, a crown seen from the front, a flower with an open heart. | The centre star sits naturally inside or in front of it. |
| Soft glow or rays around it are welcome; keep them faint. | |

The game draws a pink square with a white star exactly in the centre, on top of the object. Picture the object as a frame for that star.

---

## 4. Background picture (`bg.webp`)

| Item | Rule |
|---|---|
| Size | **1080 x 2400 px**, portrait. (720 x 1600 is acceptable if kept to the same proportions.) |
| Format | WebP, quality 75 to 80, **under 300 KB** |
| Board area | **900 x 900 px at x = 90, y = 200** (scale these numbers if the picture is smaller). Paint it as a plain continuation: the board picture covers it. |
| Around the board | Continue the theme outwards, a little darker or softer than the board, so the board stands out. **No murky grey or brown ring.** Use the theme's own colour, for example deep plum for Carnival or deep navy for Space. |
| Top (y 0 to 170) | Quiet: smooth colour behind the title bar. |
| Lower part (y 1150 to 2400) | Quiet: smooth, low-contrast gradient behind the rack, scratch row and buttons. |
| Left and right edges | Fade to one plain colour (the "edge colour" in `pack.txt`). Phones crop the sides differently. |
| Not allowed | Text, logos, faces looking at the viewer, watermarks. |

---

## 5. The ten themes

For each theme: **board surface**, **outer decoration**, **centre object** (with its open centre), **square symbols** (optional files, see section 6) and **background**.

### 1. Football
- **Board surface:** a light, sunlit pitch: pale mown-grass stripes, very soft white pitch lines (a centre circle is fine if faint).
- **Outer decoration:** stadium lights glow, soft crowd bokeh, a hint of goal netting in two corners.
- **Centre object:** a classic football seen straight on, or a laurel wreath with the ball **below** the centre. Keep the centre square clear.
- **Symbols:** TW trophy, DW ball, TL boot, DL whistle.
- **Background:** deep green evening stadium, floodlight glow at the top, calm dark green below.
- **Sounds:** whistle, ball kick, crowd cheer for bingo.

### 2. Space
- **Board surface:** pale lavender or dusky blue with faint stars (keep light enough for the tiles).
- **Outer decoration:** nebula clouds, small planets and galaxies at the corners.
- **Centre object:** a ringed planet tilted so the ring circles the centre, the planet body behind; or a starburst ring.
- **Symbols:** TW rocket, DW ringed planet, TL shooting star, DL crescent moon.
- **Background:** deep navy and violet space, a few stars, smooth dark gradient below.
- **Sounds:** soft synth blips, a shimmer for bingo.

### 3. Christmas
- **Board surface:** warm cream paper with faint snowflakes.
- **Outer decoration:** pine branches, berries and small baubles in the corners.
- **Centre object:** **a wreath with a red bow**, open in the middle (the perfect example).
- **Symbols:** TW snowflake, DW bow, TL bell, DL holly leaf.
- **Background:** deep pine green with soft warm lights, snowy calm gradient below.
- **Sounds:** sleigh bells, music-box notes.

### 4. Ocean
- **Board surface:** pale aqua water with soft light ripples (caustics), very faint.
- **Outer decoration:** coral, seaweed and shells at the corners, light rays from the top.
- **Centre object:** a scallop shell or a ring of small starfish and shells around the centre.
- **Symbols:** TW coral branch, DW scallop shell, TL seahorse, DL starfish.
- **Background:** deep teal sea, rays of light at the top, calm deep blue below.
- **Sounds:** water drip, bubbles, a wave swell for bingo.

### 5. Carnival
- **Board surface:** cream with faint confetti.
- **Outer decoration:** peacock and coloured feathers in the corners (the current board's feathers are good).
- **Centre object:** a masquerade mask **without the circle behind it**, feathers fanning out symmetrically, the face slightly above the centre so the centre star sits at the nose bridge; or a ring of feathers.
- **Symbols:** TW feather headdress, DW mask, TL steelpan, DL feather plume.
- **Background:** deep plum and magenta, soft confetti, calm plum gradient below.
- **Sounds:** steelpan notes, soca shaker, cheer for bingo.

### 6. Autumn
- **Board surface:** warm parchment with faint leaf shadows.
- **Outer decoration:** maple and oak leaves in reds, oranges and golds at the corners.
- **Centre object:** a ring of autumn leaves, or a single large maple leaf with a pale heart.
- **Symbols:** TW maple leaf, DW acorn, TL pumpkin, DL mushroom.
- **Background:** deep burnt orange to brown-red, falling-leaf hints, calm warm gradient below.
- **Sounds:** leaf rustle, wooden knock, acoustic strum.

### 7. Tropical
- **Board surface:** light leafy green-cream with faint palm shadows.
- **Outer decoration:** monstera and palm leaves, hibiscus flowers at the corners.
- **Centre object:** a hibiscus flower with an open, pale centre, or a ring of tropical flowers.
- **Symbols:** TW hibiscus, DW palm tree, TL toucan, DL monstera leaf.
- **Background:** deep jungle green, warm light at the top, calm green gradient below.
- **Sounds:** wood knock, bird call, steel drum for bingo.

### 8. Classic Luxe
- **Board surface:** a dark board is allowed here (charcoal or deep walnut), as in the collection picture. Keep it even and fine-grained so the light tiles stand out.
- **Outer decoration:** thin gold filigree lines in the corners, very restrained.
- **Centre object:** a gold crown seen from the front, its band arching around the centre.
- **Symbols:** TW crown, DW fleur-de-lis, TL diamond, DL pearl.
- **Background:** near-black with warm gold glow at the top, calm dark gradient below.
- **Sounds:** soft piano notes, a crystal chime for bingo.

### 9. Vintage Travel
- **Board surface:** old map parchment with faint coastlines and route lines.
- **Outer decoration:** a compass corner, stamps and tickets in sepia at the edges.
- **Centre object:** **a compass rose**: naturally symmetrical, with the centre star at its hub.
- **Symbols:** TW compass, DW aeroplane, TL anchor, DL globe.
- **Background:** sepia and tan with soft map texture, calm brown gradient below.
- **Sounds:** paper rustle, stamp thump, a ship's bell for bingo.

### 10. Zen Garden
- **Board surface:** pale raked sand in concentric lines around the centre.
- **Outer decoration:** bamboo leaves in two corners, a few smooth stones at the edges.
- **Centre object:** stacked stones placed just **above** the centre, with sand ripples circling the centre square; or a ring of ripples.
- **Symbols:** TW lotus, DW bamboo leaf, TL stone stack, DL ripple circle.
- **Background:** soft sage and stone grey, calm gradient below.
- **Sounds:** wooden block, soft bell, a singing bowl for bingo, a water-garden music loop.

---

## 6. Files per theme

```
themes\<name>\
  board.webp      board picture (required)
  bg.webp         background picture (required)
  pack.txt        colours (required, section 7)
  tw.svg dw.svg tl.svg dl.svg   square symbols (optional)
  pick.mp3 drop.mp3 bad.mp3 play.mp3 bingo.mp3 win.mp3   sound effects (optional)
  loop.mp3        calm music, 60 to 120 s, seamless loop, under 1.5 MB (optional)
```

**Square symbols (optional):** solid white silhouettes on transparent, 128 x 128, filling about 65% of the canvas. Bold and simple, because they show about 18 px wide. No outlines-only shapes. Without these files, the standard symbols are used.

**Sounds (optional):** short, soft, silence trimmed from the start, MP3. Without these, the standard set is used.

---

## 7. `pack.txt`

```
name: Carnival
edge colour: #31193B           (colour the background fades to at its sides)
frame colours: #F2C14E #B8862B  (thin edge around the board: light and dark tone)
panel light: #FFF6EC            (panels in light mode: a tinted light tone, not pure white)
panel dark: #2E1838             (panels in dark mode)
text light: #3A1E3A
text dark: #F7E9F2
grid: #B88A86                   (grid line colour; shown faintly)
squares: TW #E23A4E, DW #F27DB2, TL #1F6FD6, DL #4FB3E6
```

Square colours keep their families: triple word **red**, double word **pink**, triple letter **dark blue**, double letter **light blue**. Shades may change to suit the painting.

---

## 8. Checklist before sending

1. Shrink the board picture to 360 x 360. Is the middle still pale and calm? Is the centre object recognisable?
2. Does the centre object stay inside the template's pink circle, with the green centre clear?
3. No circle or disc behind the centre object.
4. The background around the board is the theme's colour, not grey or brown.
5. Quiet zones are quiet (top band, lower part).
6. No text, logos or watermarks anywhere.
7. Sizes and file limits met.

**Order:** redo Carnival first with these rules. When it looks right in the game, do the others.
