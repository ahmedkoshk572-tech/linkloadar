from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
ASSETS.mkdir(parents=True, exist_ok=True)

size = 1024
icon = Image.new("RGBA", (size, size), (8, 8, 15, 255))
draw = ImageDraw.Draw(icon)

# Soft brand glow behind the mark.
draw.rounded_rectangle((150, 150, 874, 874), radius=215, fill=(30, 20, 78, 255))
draw.rounded_rectangle((190, 190, 834, 834), radius=190, fill=(112, 76, 255, 255))
draw.rounded_rectangle((220, 220, 804, 804), radius=164, fill=(91, 60, 222, 255))

# LinkLoad play mark.
triangle = [(405, 334), (405, 690), (697, 512)]
draw.polygon(triangle, fill=(255, 255, 255, 255))

# Small link accent to match the product symbol while keeping the icon legible.
draw.arc((292, 292, 520, 520), 205, 345, fill=(215, 205, 255, 230), width=18)
draw.arc((504, 504, 732, 732), 25, 165, fill=(215, 205, 255, 230), width=18)

icon.save(ASSETS / "icon.png", "PNG", optimize=True)

# Adaptive foreground: transparent canvas with the mark kept in the safe center zone.
foreground = Image.new("RGBA", (size, size), (0, 0, 0, 0))
fg = ImageDraw.Draw(foreground)
fg.rounded_rectangle((205, 205, 819, 819), radius=180, fill=(112, 76, 255, 255))
fg.rounded_rectangle((240, 240, 784, 784), radius=152, fill=(91, 60, 222, 255))
fg.polygon(triangle, fill=(255, 255, 255, 255))
fg.arc((304, 304, 496, 496), 205, 345, fill=(215, 205, 255, 230), width=16)
fg.arc((528, 528, 720, 720), 25, 165, fill=(215, 205, 255, 230), width=16)
foreground.save(ASSETS / "icon-foreground.png", "PNG", optimize=True)
