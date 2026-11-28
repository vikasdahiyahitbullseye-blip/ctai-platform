from draw import *
C=8
T={
"1-15":"n = 5: bottom = 125 + 5 = 130",
"1-16":"top = 6: bottom = 216 − 36 = 180",
"1-P1":"3 2 3 2 / 1 1 1 1 / 2 3 2 3 → shaded: 3, 3, 3",
"1-P2":"shaded boxes hold 3, 2, 2 → 2",
"2-9":"243 + 4096 + 49 = 4388",
"2-10":"81 + 36 + 16807 = 16924",
"2-P1":"A 4 H / 3 M 2 → ? = M",
"2-P2":"5 A 4 / H 3 E → ? = 4",
"3-13":"2346, 2348, 3469 → 3 passwords",
"3-14":"124, 125, 126, 127, 129 → 5 passwords",
"3-15":"4 swaps put every block in order",
"3-16":"5 swaps put every block in order",
"4-3":"3 × 10 = 30 rectangles",
"4-4":"15 + 8 + 3 = 26 squares",
"4-5":"6 + 6 = 12 quadrilaterals",
"4-6":"choose 2 of 4 = 6 trapeziums",
"4-7":"9 + 8 = 17 quadrilaterals",
"4-8":"5 + 10 + 5 = 20 quadrilaterals",
"4-P1":"3 presses switch every light OFF",
"4-P2":"3 presses switch every light OFF",
"6-P1":"16 × 9 ÷ 2 = 72 ways",
"6-P2":"120 − 42 = 78 ways",
}
for k,b in T.items(): mark(C,k,[("text",50,99,b)],b)
save()
