from draw import *
C=4
X1=[13,38,63,88]; Y1=[18,52,85]
L=[(0,0),(1,0),(0,1),(2,1),(0,2),(2,2),(3,2)]
mark(C,"5-1",[("ring",X1[i],Y1[j],10,"green") for i,j in L]+[("text",50,99,"less than 4 of 8 parts: 7 jars")],"7 jars are less than half full")
X2=[10,30,50,70,90]
H=[(1,0),(2,0),(3,0),(4,0),(1,1),(2,1),(3,1)]
mark(C,"5-2",[("ring",X2[i],[25,75][j],9,"green") for i,j in H]+[("text",50,99,"4 or more of 8 parts: 7 glasses")],"7 glasses are half full or more")
mark(C,"5-3",[("text",50,1,"2 whole + 3 halves"),("text",50,99,"7 halves of 18 halves = 7/18")],"Count in half-squares")
mark(C,"5-4",[("text",50,1,"3 whole + 2 halves"),("text",50,99,"8 halves of 16 halves = 8/16")],"Count in half-squares")
mark(C,"5-11",opt("d",20,98,col="red")+[("text",50,99,"a, b, c: 3 of 8 eaten; d: 5 of 8")],"Pizza d")
mark(C,"5-12",opt("a",10,98,col="red")+[("text",50,99,"3/6, 4/8, 5/10 are halves; a is 2/5")],"Bar a")
mark(C,"5-15",[("text",50,99,"red sides / all sides:  4 red of 6 → 4/6"),("ring",87,55,9,"green")],"4/6")
mark(C,"5-16",[("text",50,99,"red sides / all sides:  5 red of 6 → 5/6"),("ring",86,55,9,"green")],"5/6")
mark(C,"5-20",opt("d",78,99)+[("text",50,1,"sides = shaded parts + 2:  4 + 2 = 6")],"Option d: hexagon")
save()
