"""Optional: bakes everything into ONE html file (../malik-barbers.html). Run: python3 build-single-file.py"""
import base64
b=lambda f:"data:%s;base64,%s"%("video/mp4" if f.endswith("mp4") else "image/jpeg",base64.b64encode(open(f,'rb').read()).decode())
emb="window.EMBED={"+",".join('%s:"%s"'%(k,b(f)) for k,f in [("desktop","desktop.mp4"),("mobile","mobile.mp4"),("desktopPoster","desktop-poster.jpg"),("mobilePoster","mobile-poster.jpg")])+"};"
h=open('index.html').read().replace('<link rel="stylesheet" href="style.css">','<style>'+open('style.css').read()+'</style>')
h=h.replace('<script src="config.js"></script>','<script>'+emb+'</script><script>'+open('config.js').read()+'</script>')
for f in ('main','fx','fx2'): h=h.replace('<script src="%s.js"></script>'%f,'<script>'+open('%s.js'%f).read()+'</script>')
open('../malik-barbers.html','w').write(h)
