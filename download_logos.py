import urllib.request
import re
import os

def download(url, filename):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        data = urllib.request.urlopen(req, timeout=5).read()
        with open('frontend/public/' + filename, 'wb') as f:
            f.write(data)
        print(f'Downloaded {filename} from {url}')
        return True
    except Exception as e:
        print(f'Failed {filename}: {e}')
        return False

# 1. Band Protocol
download('https://cryptologos.cc/logos/band-protocol-band-logo.svg', 'band.svg')

# 2. ChromaDB
download('https://mintlify.s3-us-west-1.amazonaws.com/chroma/logo/dark.svg', 'chroma.svg')

# 3. Featherless AI
try:
    req = urllib.request.Request('https://featherless.ai', headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req, timeout=5).read().decode('utf-8')
    match = re.search(r'src=["\']([^"\']*logo[^"\']*\.svg)["\']', html, re.IGNORECASE)
    if match:
        url = match.group(1)
        if url.startswith('/'): url = 'https://featherless.ai' + url
        download(url, 'featherless.svg')
    else:
        # fallback
        download('https://raw.githubusercontent.com/lobehub/lobe-icons/master/packages/static-svg/icons/featherless-color.svg', 'featherless.svg')
except:
    pass

# 4. lablab.ai
try:
    req = urllib.request.Request('https://lablab.ai', headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req, timeout=5).read().decode('utf-8')
    match = re.search(r'src=["\']([^"\']*logo[^"\']*\.svg)["\']', html, re.IGNORECASE)
    if match:
        url = match.group(1)
        if url.startswith('/'): url = 'https://lablab.ai' + url
        elif url.startswith('_next'): url = 'https://lablab.ai/' + url
        download(url, 'lablab.svg')
except Exception as e:
    # 403 Forbidden mostly, try alternative
    download('https://cdn.worldvectorlogo.com/logos/lablab-ai.svg', 'lablab.svg')
