import sys
from fontTools.ttLib import TTFont, newTable
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
def convert(src, dst):
    font = TTFont(src)
    gs = font.getGlyphSet(); glyf = {}
    for name in font.getGlyphOrder():
        pen = TTGlyphPen(gs); gs[name].draw(Cu2QuPen(pen, 1.0, reverse_direction=True)); glyf[name] = pen.glyph()
    font["loca"] = newTable("loca"); font["glyf"] = g = newTable("glyf"); g.glyphOrder = font.getGlyphOrder(); g.glyphs = glyf
    del font["CFF "]
    if "VORG" in font: del font["VORG"]
    font["maxp"].tableVersion = 0x00010000
    for a in ("maxZones","maxTwilightPoints","maxStorage","maxFunctionDefs","maxInstructionDefs","maxStackElements","maxSizeOfInstructions","maxComponentElements"): setattr(font["maxp"], a, 0)
    font["maxp"].maxZones = 1
    font["post"].formatType = 2.0
    font["post"].extraNames = []
    font["post"].mapping = {}
    font["head"].glyphDataFormat = 0
    font.sfntVersion = "\x00\x01\x00\x00"
    font.save(dst)
import os
os.makedirs("fonts", exist_ok=True)
for n in ["Inter-Regular","Inter-Medium","Inter-SemiBold","Inter-Bold","Inter-Italic"]:
    convert(f"/usr/share/fonts/opentype/inter/{n}.otf", f"fonts/{n}.ttf")
for n in ["InterDisplay-Bold","InterDisplay-ExtraBold"]:
    convert(f"/usr/share/fonts/opentype/inter/{n}.otf", f"fonts/{n}.ttf")
print("ok")
