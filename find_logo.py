import urllib.request
try:
    req = urllib.request.Request('https://lablab.ai', headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req, timeout=5).read().decode('utf-8')
    for line in html.split('<'):
        if 'logo' in line and 'src=' in line:
            src = line.split('src=')[1].split(' ')[0]
            for c in ['"', "'", "/", ">"]:
                src = src.replace(c, "")
            print(src)
except Exception as e:
    print(e)
