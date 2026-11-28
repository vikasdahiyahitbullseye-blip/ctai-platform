from draw import *
C=7
T={
"4-3":("in − out = demand at each city","S → B = 500"),
"4-4":("start with S → A = 500","A → B = 200"),
"4-15":("Q + R = 10 + 2P = 30 → P = 10, Q = 14, R = 16","14 × 16 − 10 = 214"),
"4-16":("Q + R = 6 + 2P = 22 → P = 8, Q = 10, R = 12","10 × 12 − 8 = 112"),
"4-P2":(None,"8 1 7 / 4 9 2 / 6 3 5 → ? = 7"),
"5-11":(None,"choose 2 of 4 (6) × 2 of 5 (10) = 60"),
"5-12":(None,"choose 2 of 3 (3) × 2 of 6 (15) = 45"),
"5-17":(None,"AC points NE, PC points SE → 90°"),
"5-18":(None,"6 m West + 6 m North from P reaches C"),
"5-19":(None,"RO || QC and OQ || RC → ROQC"),
"5-20":(None,"ZV || YM and VY || ZM → ZVYM"),
"5-P1":(None,"A = 7,  B = 3,  C = 4"),
"5-P2":(None,"A = 5,  B = 6,  C = 2"),
"6-A1":(None,"O holes under P and G → OFF"),
"6-A2":(None,"O holes under Y and B → OFF"),
"6-1":(None,"9835 → 9 + 8 + 3 + 5 = 25"),
"6-2":(None,"8985 → 8 + 9 + 8 + 5 = 30"),
"6-5":(None,"8 4 3 / 1 9 5 / 6 2 7 → A = 3, B = 9"),
"6-6":(None,"5 9 1 / 3 4 8 / 7 2 6 → A = 2, B = 3"),
"6-7":(None,"7 = 1+2+3+1 and 5 = 1+2+1+1 → 2 cells"),
"6-8":(None,"3 cells equal the sum of the others"),
"6-15":(None,"white boxes add up to 8"),
"6-16":(None,"white boxes add up to 12"),
"6-P1":(None,"switches 1, 2, 5, 6 → 4 presses"),
"6-P2":(None,"even bulbs 2 presses + odd bulbs 3 = 5"),
"7-13":(None,"4 + 4 = 8 right-angled triangles"),
"7-14":(None,"all 16 triangles have a right angle"),
"7-15":(None,"choose 2 of 5 lines = 10"),
"7-16":(None,"choose 2 of 7 lines = 21"),
"7-P2":(None,"8 circles always make 3 in a line → 7"),
"8-17":(None,"4 fractions are correct"),
"8-18":(None,"3 fractions are correct"),
"8-P1":(None,"4 wrong squares ÷ 2 = 2 swaps"),
"8-P2":(None,"6 wrong squares ÷ 2 = 3 swaps"),
}
for k,(a,b) in T.items():
    ops=[("text",50,99,b)]
    if a: ops.append(("text",50,1,a))
    mark(C,k,ops,b)
save()
