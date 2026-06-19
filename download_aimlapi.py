import urllib.request
import re

try:
    req = urllib.request.Request('https://aimlapi.com/', headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req, timeout=5).read().decode('utf-8')
    match = re.search(r'src=["\']([^"\']*logo[^"\']*\.svg)["\']', html, re.IGNORECASE)
    if match:
        url = match.group(1)
        if url.startswith('/'): url = 'https://aimlapi.com' + url
        print('Found:', url)
        data = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})).read()
        with open('frontend/public/aimlapi.svg', 'wb') as f:
            f.write(data)
        print('Saved aimlapi.svg')
    else:
        print('No svg found. Downloading default Github Avatar')
        data = urllib.request.urlopen(urllib.request.Request('https://avatars.githubusercontent.com/aimlapi?s=200&v=4', headers={'User-Agent': 'Mozilla/5.0'})).read()
        with open('frontend/public/aimlapi.png', 'wb') as f:
            f.write(data)
        print('Saved aimlapi.png')
except Exception as e:
    print('Error:', e)
