from draw import *
C=4
B={"a":(1,25),"b":(27,52),"c":(54,79),"d":(81,99)}
def opt(k,y0,y1): x0,x1=B[k]; return [("box",x0,y0,x1,y1,"green"),("tick",x1-3,y0+2)]
mark(C,"2-1",[("text",50,99,"no flower after grey: 4, 7, 10  →  10 − 3 = 7")],"7 flowers")
mark(C,"2-2",[("text",50,99,"after grey: 3, 6, 8  →  3 shells")],"3 shells")
mark(C,"2-3",[("text",50,99,"S-A-C-E,  S-A-D-E,  S-B-D-E  = 3")],"3 paths")
mark(C,"2-4",[("text",50,99,"via D: SADE, SBDE;  via F: SBFE, SCFE  = 4")],"4 paths")
mark(C,"2-5",[("text",50,99,"turns:  A = 1,  B = 3,  C = 2")],"A takes the fewest turns")
mark(C,"2-6",[("ring",10,13,5,"green"),("ring",51,13,5,"green"),("ring",51,59,5,"blue"),("text",10,1,"right 1"),("text",58,1,"right 2"),("text",60,72,"left")],"2 right turns")
mark(C,"2-7",opt("d",72,99)+[("text",50,99,"gap: down 2, then right 2")],"Piece d")
mark(C,"2-8",opt("c",72,99)+[("text",50,99,"gap: up 1, then right 2")],"Piece c")
mark(C,"2-11",opt("d",68,98),"Picture d is the top view")
mark(C,"2-12",opt("a",66,98),"Picture a is the top view")
mark(C,"2-15",opt("b",55,88),"Tower b matches from the front")
mark(C,"2-16",opt("c",55,92),"Tower c matches from the right")
mark(C,"2-17",[("path",[(80,50),(70,50)],"red"),("text",88,70,"faces ←"),("ring",60,38,10,"red"),("text",50,99,"Fox is nearer the boy: behind the Cat")],"Behind")
mark(C,"2-18",[("text",13,70,"faces →"),("ring",57,37,10,"red"),("text",50,99,"top of page = her left: Hen is left of Goat")],"Left")
mark(C,"2-19",opt("a",60,98),"Figure a is the top view")
mark(C,"2-20",opt("d",60,98),"Figure d is the front view")
save()
