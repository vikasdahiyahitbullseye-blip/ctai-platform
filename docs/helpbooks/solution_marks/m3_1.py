from draw import *
C=3
mark(C,"1-1",[("box",2,5,49,95,"blue"),("box",51,5,98,95,"green")],"SIX and TEN use all six tiles")
mark(C,"1-2",[("box",3,3,73,26,"red"),("box",3,27,73,50,"blue"),("box",3,28,25,97,"green"),("box",76,28,98,97,"orange")],"ONE, TWO across; TEN, SIX down")
mark(C,"1-3",[("text",29,35,"TWO"),("text",45,12,"THREE"),("text",64,25,"FOUR"),("text",83,35,"SIX")],"A = TWO, B = THREE, C = FOUR, D = SIX")
mark(C,"1-4",[("box",57,2,78,45,"green"),("box",77,2,99,45,"green"),("box",1,2,17,45,"green")],"■ = T, ◆ = W, ★ = O: TWO")
mark(C,"1-5",[("box",53,48,73,82,"green"),("tick",63,25)],"T = ■, E = ▲, N = ●")
mark(C,"1-6",[("box",82,28,97,97,"red"),("text",10,25,"FOUR"),("text",35,25,"FIVE"),("text",62,25,"NINE"),("text",88,10,"THREE")],"THREE has 5 letters; the others have 4")
mark(C,"1-10",[("cross",40,30),("cross",77,30)],"Take away the red T and O: F, I, V, E")
mark(C,"1-12",[("box",8,8,45,94,"red"),("box",37,8,75,94,"blue"),("box",67,8,93,94,"green")],"THREE, EIGHT, TWO")
mark(C,"1-19",[("ring",5,55,5,"blue"),("ring",16,55,5,"blue"),("ring",27,55,5,"blue"),("ring",61,58,5,"green"),("ring",72,55,5,"orange")],"S, V, E (circles), N (triangle), E (square)")
mark(C,"1-20",[("cross",10,15),("cross",44,15),("cross",76,15),("tick",27,15),("tick",60,15),("tick",92,15)],"Cross out S, I, X: T, E, N are left")
mark(C,"1-21",[("cross",23,15),("cross",55,15),("cross",86,15),("tick",8,15),("tick",39,15),("tick",70,15)],"Cross out O, N, E: T, W, O are left")
save()
