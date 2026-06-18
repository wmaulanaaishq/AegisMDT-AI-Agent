import os
import glob

files = glob.glob('agents/*.py')
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    content = content.replace('\\"\\"\\"', '"""')
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print("Fixed files.")
