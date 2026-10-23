from rdkit import Chem
from rdkit.Chem import AllChem
from rdkit.Chem.Draw import rdMolDraw2D
import re, sys
M = {
 'caffeine': 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
 'theanine': 'CCNC(=O)CC[C@@H](C(=O)O)N',
 'egcg': 'C1[C@H]([C@H](OC2=CC(=CC(=C21)O)O)C3=CC(=C(C(=C3)O)O)O)OC(=O)C4=CC(=C(C(=C4)O)O)O',
}
for k, s in M.items():
    m = Chem.MolFromSmiles(s); AllChem.Compute2DCoords(m)
    d = rdMolDraw2D.MolDraw2DSVG(560, 420)
    o = d.drawOptions(); o.clearBackground = False; o.bondLineWidth = 1.6; o.useBWAtomPalette(); o.padding = 0.08; o.fixedFontSize = 15; o.fontFile = ''
    d.DrawMolecule(m); d.FinishDrawing(); svg = d.GetDrawingText()
    svg = re.sub(r'<\?xml[^>]*>\s*', '', svg).replace('#000000', 'currentColor').replace('#FFFFFF','none')
    svg = re.sub(r"width='\d+px' height='\d+px'", "width='100%' height='100%' role='img'", svg)
    open(f'src/data/mol-{k}.svg', 'w').write(svg); print(k, len(svg))
