import sys,glob
from PIL import Image
d=sys.argv[1]; fs=sorted(glob.glob(d+'/*_[abc].jpg')); keys=sys.argv[3:] 
if keys: fs=[f for f in fs if f.split('/')[-1][:2] in keys]
rows=(len(fs)+2)//3; S=Image.new('RGB',(3*640,rows*360),'#000')
for i,f in enumerate(fs): S.paste(Image.open(f).resize((640,360)),((i%3)*640,(i//3)*360))
S.save(sys.argv[2],quality=85)
