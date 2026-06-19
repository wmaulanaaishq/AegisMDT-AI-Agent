import urllib.request
import re
try:
    req = urllib.request.Request('https://featherless.ai', headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req, timeout=5).read().decode('utf-8')
    matches = re.findall(r'src=["\']([^"\']*\.svg)["\']', html, re.IGNORECASE)
    for m in set(matches):
        print(m)
except Exception as e:
    print('Error:', e)
