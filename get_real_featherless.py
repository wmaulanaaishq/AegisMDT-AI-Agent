import urllib.request
import re

req = urllib.request.Request('https://featherless.ai', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, timeout=5).read().decode('utf-8')

# Search for the navbar brand logo
match = re.search(r'<a[^>]*w-nav-brand[^>]*>.*?src=[\"\']([^\"\']*\.svg)[\"\']', html, re.IGNORECASE | re.DOTALL)
if match:
    url = match.group(1)
    if url.startswith('/'): url = 'https://featherless.ai' + url
    print('Found brand logo:', url)
    data = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})).read()
    with open('frontend/public/featherless.svg', 'wb') as f:
        f.write(data)
    print('Saved to featherless.svg')
else:
    print('Could not find brand logo.')
