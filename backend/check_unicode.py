import unicodedata

words = [
    'Manzana', 'Ni\u00f1o', 'Ni\u00f1a', 'Adi\u00f3s', 'Ma\u00f1ana', 'Men\u00fa',
    'Bol\u00edgrafo', 'Autob\u00fas', 'Avi\u00f3n', 'C\u00f3mo', 'est\u00e1s',
    'Cu\u00e1nto', 'D\u00eda', 'A\u00f1o', 'S\u00ed', '\u00c9l', 'Qu\u00e9', 'D\u00f3nde', 'Est\u00e1'
]

mismatches = 0
for w in words:
    nfc = unicodedata.normalize('NFC', w)
    nfd = unicodedata.normalize('NFD', w)
    if nfc != nfd:
        mismatches += 1
        print(f"MISMATCH: word='{w}', NFC_len={len(nfc)}, NFD_len={len(nfd)}, equal={nfc==nfd}")

print(f"\nTotal words with NFC != NFD: {mismatches} out of {len(words)}")
print("\nConclusion: If the DB stores one form and the browser sends another, comparisons will FAIL.")
