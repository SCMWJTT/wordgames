# Board themes: art brief for the artist (version 3)

For MiniWord (13 x 13), Masterword (15 x 15) and Bigword (17 x 17). **One theme pack works for all three games.**
This replaces the earlier theme briefs (ART-SPEC v1 theme parts and THEME-ART-SPEC v2).

The look we want is the one in the "Bigword theme collection" mock-ups: a painted board with a large centre picture and theme art radiating outwards, with the same painting continuing, quieter, behind the rest of the screen.

---

## 1. How the screen is built

```
 ┌───────────────────────────┐
 │ A  Title bar              │  ← sits on the background (quiet zone)
 │ ┌───────────────────────┐ │
 │ │                       │ │
 │ │  B  Board picture      │ │  ← your painting, the game draws squares and tiles on top
 │ │                       │ │
 │ └───────────────────────┘ │
 │ C  Information bar        │
 │ D  Tile rack (wooden)     │  ← quiet zone: lower third
 │ E  Scratch row            │
 │ F  Buttons                │
 └───────────────────────────┘
      Background picture (behind everything, continues the board painting)
```

**What the artist paints:** two pictures per theme.
1. **Board picture**: the board surface with the theme art and the big centre picture. **No squares, no grid, no letters.**
2. **Background picture**: the same scene continuing around the board, calmer and darker or softer.

**What the game draws on top, so the artist does NOT paint it:**
- The grid lines (very faint).
- The premium squares (triple word red, double word pink, triple letter dark blue, double letter light blue), each with a white symbol, solid and slightly raised.
- The wooden letter tiles and the wooden rack (the same in every theme).
- The title bar, information bar, scratch row and buttons, in soft panels tinted to match the theme.

Why the squares are separate: the same painting must work on three board sizes, stay sharp when the player zooms in, and line up exactly on every phone. Painted-in squares cannot do that.

---

## 2. Board picture: `board.webp`

| Item | Rule |
|---|---|
| Size | **2048 x 2048 px**, exactly square |
| Format | WebP (quality 80 to 85) or PNG, under **600 KB** |
| Edges | The painting fills the whole square edge to edge. The game adds a thin gold edge around it. |
| Centre picture | The theme's hero image (mask, crown, shell, ball, star...) in the exact centre. Keep it **within a circle about 400 px across** (about 20% of the width). It covers the centre square and a little around it. |
| Around the centre | Soft rays, glow or pattern radiating out from the centre picture. |
| Middle area | Light and calm: **most of the board must stay pale**, because letter tiles (light wood with dark letters) and coloured squares sit on it. Think of a cream or light surface with soft, low-contrast motifs. |
| Outer ring | The theme's decoration can be stronger towards the edges (feathers, leaves, waves, confetti), as in the mock-ups. |
| Not allowed | Squares, grid lines, letters, numbers, text, logos, watermarks. |

**Check before sending:** shrink the picture to 360 x 360 px (phone size). The middle should still look calm and light, and the centre picture should still be recognisable.

**Light and dark:** one board picture serves both. (The game only changes the panels and text for dark mode.)

---

## 3. Background picture: `bg.webp`

| Item | Rule |
|---|---|
| Size | **1440 x 3200 px**, portrait |
| Format | WebP (quality 75 to 85), under **500 KB** |
| Board area | A square of **1240 x 1240 px at x = 100, y = 280** (from the top-left corner). The game lines this square up exactly behind the board. Paint it as a soft, plain continuation (the board picture covers it). |
| Around the board | Continue the board's scene outwards, softer and slightly darker or more muted, so the board stands out. |
| Top band (y = 0 to 260) | **Quiet zone** behind the title bar: smooth colour, very little detail. |
| Lower part (y = 1600 to 3200) | **Quiet zone** behind the rack, scratch row and buttons: smooth, low contrast, little detail. A gentle gradient is ideal. |
| Edges | Phones are different shapes, so the picture is cropped differently on each. Keep anything important away from the outer 120 px. The left and right edges should fade to one plain colour (name it in `pack.txt` as the "edge" colour); on wide screens the game fills beyond the picture with that colour. |
| Not allowed | Text, letters, numbers, logos, watermarks, faces looking at the viewer. |

---

## 4. Colours to send (in `pack.txt`)

The game uses these to tint the squares and panels so they belong to the painting.

```
name: Carnival
edge colour: #3C1A4C          (colour the background fades to at its left and right edges)
frame colours: #F2C14E #B8862B (thin edge around the board: light and dark of one colour, often gold)
panel light: #FFF6EC           (panels in light mode: a tinted light tone, not pure white)
panel dark: #2E1838            (panels in dark mode)
text light: #3A1E3A            (text on light panels)
text dark: #F7E9F2             (text on dark panels)
grid: #B88A86                  (grid line colour; the game shows it faintly)
squares: TW #E23A4E, DW #F27DB2, TL #1F6FD6, DL #4FB3E6
```

Square colours stay in their families in every theme: triple word **red**, double word **pink**, triple letter **dark blue**, double letter **light blue**. The shade can change to suit the painting.

---

## 5. Optional extras (only after the first theme works)

| File | What it is |
|---|---|
| `tw.svg` `dw.svg` `tl.svg` `dl.svg` | Theme symbols for the premium squares: solid white silhouettes, 128 x 128, bold and simple (they show about 18 px wide). Without these, the standard symbols are used. |
| `loop.mp3` | Calm background music, 60 to 120 seconds, loops without a seam, under 1.5 MB. |
| `pick.mp3` `drop.mp3` `bad.mp3` `play.mp3` `bingo.mp3` `win.mp3` | Theme sound effects (short, soft, trimmed silence). Without these, the standard set is used. |

---

## 6. Avoiding a harsh look

The test build showed panels looking stark against busy art. To prevent it:
- **Keep the quiet zones quiet** (section 3). The rack, buttons and scratch row sit there.
- **Busy detail belongs around the board's edges and centre,** not behind the panels.
- **Avoid pure black and pure white** in the background; mid and soft tones blend with the tinted panels.
- **Contrast check:** the board's light middle must make the wooden tiles and dark letters easy to read.

---

## 7. Delivery

One folder per theme, named in lowercase (`carnival`), containing:

```
board.webp
bg.webp
pack.txt
(optional) tw.svg dw.svg tl.svg dl.svg loop.mp3 and sound effects
```

Put the folder in the repo under `themes\` and tell me (or send the zip). I write the `theme.json`, line everything up and check it on all three board sizes.

**Start with one theme (Carnival).** Once it looks right in the game, the other themes follow the same rules.
