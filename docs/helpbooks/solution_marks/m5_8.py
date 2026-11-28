from draw import *
C=5
mark(C,"8-P1",[("text",50,1,"one side: Books, Electronics, Sweet"),("text",50,99,"other side: Bakery, Toy, Dairy")],"Bakery and Toy")
mark(C,"8-P2",[("text",50,1,"one side: Phone, Book, Shoe"),("text",50,99,"other side: Fruit, Pizza, Cloth")],"Pizza and Fruit")
mark(C,"10-3",[("path",[(47,8),(50,92)],"green"),("path",[(93,38),(13,65)],"green"),("path",[(5,38),(86,65)],"green"),("path",[(79,92),(26,23)],"green"),("path",[(22,92),(70,23)],"green"),("text",50,99,"5 lines of symmetry")],"5 lines of symmetry")
mark(C,"10-4",[("path",[(55,15),(55,94)],"green"),("path",[(19,54),(93,54)],"green"),("text",50,99,"2 lines: the diagonals")],"2 lines of symmetry")
for k,o in [("10-7","b"),("10-8","c"),("10-13","d"),("10-14","b"),("10-17","c"),("10-18","d")]:
    mark(C,k,opt(o,50,99),f"Option {o}")
mark(C,"10-P1",[("box",18,31,98,42,"green"),("text",50,99,"both at floor 7 after 4 s")],"Floor 7")
mark(C,"10-P2",[("box",18,69,98,79,"green"),("text",50,99,"both at floor 3 after 5 s")],"Floor 3")
mark(C,"11-5",[("text",50,99,"12 whole + 12 halves (= 6) = 18 square units")],"18 square units")
mark(C,"11-6",[("text",50,99,"11 whole + 8 halves (= 4) = 15 square units")],"15 square units")
mark(C,"11-11",[("text",50,99,"16 − 2 + 4 = 18: increases by 2")],"Increases by 2 units")
mark(C,"11-12",[("text",50,99,"12 − 2 + 2 = 12: no change")],"Stays the same")
mark(C,"12-17",[("text",50,99,"box 1 + 13 × 3 = 40;  40 = 4 × 10 → Yellow")],"Yellow")
mark(C,"12-18",[("text",50,99,"box 1 + 17 × 2 = 35;  35 = 5 × 7 → Pink")],"Pink")
mark(C,"12-P1",[("text",50,99,"after the move: A 1,  B 5,  C 0")],"Column B")
mark(C,"12-P2",[("text",50,99,"after the move: A 1, B 5, C 6, D 0")],"Column C")
save()
