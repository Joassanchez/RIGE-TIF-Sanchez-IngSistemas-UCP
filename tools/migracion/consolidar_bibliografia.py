import re,pathlib,subprocess
docs={'AE1':'AE1_TIF-Sanchez_Joaquin_Sebastian-Ing_Sistemas-UCP__2_','Cap. IV':'Capitulo_IV','Cap. V':'Capitulo_V_-_AE2'}
entries=[]
for src,f in docs.items():
    md=subprocess.run(['pandoc',f'/mnt/user-data/uploads/{f}.docx','-t','gfm','--wrap=none'],capture_output=True,text=True).stdout
    i=md.index('BIBLIOGRAF'); seg=md[i:]
    j=[x for x in [seg.find('**ANEXO'),seg.find('## **ANEXO'),seg.find('Los anexos se numeran')] if x>0]
    seg=seg[:min(j)] if j else seg
    seg=re.sub(r'^>\s*$','',seg,flags=re.M)
    for para in re.split(r'\n\s*\n',seg)[1:]:
        p=re.sub(r'^>\s?','',para,flags=re.M).strip(); p=re.sub(r'\s*\n\s*',' ',p)
        if p and not p.startswith('#') and not p.startswith('**'): entries.append((src,p))
def norm(p):
    p=re.sub(r'[\\*]','',p.lower()); p=re.sub(r'\(\d{4}[^)]*\)','',p)
    return re.sub(r'[^a-z0-9]','',p)[:28]
seen={}
for src,p in entries:
    k=norm(p)
    if k in seen: seen[k][1].append(src)
    else: seen[k]=[p,[src]]
items=sorted(seen.values(),key=lambda x:norm(x[0]))
out=['# BIBLIOGRAFÍA','','<!-- Consolidada en la migración (AE1, Cap. IV, Cap. V). Se reemplaza por la generada desde referencias.bib cuando las citas pasen al formato [@clave]. -->','']
for p,_ in items: out+=[p,'']
pathlib.Path('informe/bibliografia.md').write_text('\n'.join(out))
rows=['# Registro de fuentes','','Una fila por fuente. El redactor solo cita fuentes de este registro; el verificador de fuentes valida las tres preguntas (guía del AE1, apartado 4.2). Estado: `verificada` · `discrepancia` · `no verificable` · `sin verificar`.','',
'| Clave | Referencia (APA) | Citada en | ¿Quién la produjo? | ¿Método y universo? | ¿Período de referencia? | Estado |','|---|---|---|---|---|---|---|']
used={}
for p,srcs in items:
    a=re.sub(r'[^a-z]','',re.sub(r'[\\*]','',p.split(',')[0].split('.')[0].split('(')[0].lower()))[:12] or 'fuente'
    if p.lower().startswith('ley'): a='ley'+re.search(r'(\d+\.\d+)',p).group(1).replace('.','')
    y=(re.search(r'\((\d{4})',p) or re.search(r'(\d{4})',p)); k=a+(y.group(1) if y else '')
    n=used.get(k,0); used[k]=n+1
    if n: k+=chr(97+n)
    rows.append(f'| {k} | {p.replace("|","/")} | {", ".join(dict.fromkeys(srcs))} | [DATO PENDIENTE] | [DATO PENDIENTE] | [DATO PENDIENTE] | sin verificar |')
pathlib.Path('01-relevamiento/fuentes.md').write_text('\n'.join(rows)+'\n')
print(len(entries),len(items)); print([ (r.split('|')[1].strip(), r.split('|')[3].strip()) for r in rows[6:]])
