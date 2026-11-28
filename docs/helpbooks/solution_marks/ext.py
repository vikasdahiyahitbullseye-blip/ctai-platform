import json,sys
E=json.load(open('extra.json'))
def X(k,*ops): E[k]=[list(o) for o in ops]
def done(): json.dump(E,open('extra.json','w'),ensure_ascii=False,indent=0); print(len(E))
