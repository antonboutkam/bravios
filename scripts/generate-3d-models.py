"""Rebuild the original Bravios low-poly models (no external packages).
Coordinates: metres, Y up, facing +Z. Animation nodes are named explicitly.
Existing portraits are references only; no image files are modified.
"""
import json, math, struct
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1] / 'public_html/gameplay'

class Model:
    def __init__(self):
        self.bin = bytearray()
        self.doc = dict(asset=dict(version='2.0', generator='Bravios model workshop'), scene=0,
                        scenes=[dict(nodes=[0])], nodes=[dict(name='Character', children=[])],
                        meshes=[], materials=[], bufferViews=[], accessors=[])
        self.cache = {}
    def accessor(self, values, components, kind, indices=False):
        while len(self.bin) % 4: self.bin.append(0)
        start = len(self.bin)
        self.bin.extend(struct.pack('<' + ('H' if indices else 'f') * len(values), *values))
        view = len(self.doc['bufferViews'])
        self.doc['bufferViews'].append(dict(buffer=0, byteOffset=start, byteLength=len(self.bin)-start))
        a = dict(bufferView=view, componentType=5123 if indices else 5126, count=len(values)//components, type=kind)
        if not indices:
            a['min'] = [min(values[i::components]) for i in range(components)]
            a['max'] = [max(values[i::components]) for i in range(components)]
        self.doc['accessors'].append(a)
        return len(self.doc['accessors'])-1
    def sphere(self, color):
        if color in self.cache: return self.cache[color]
        pos, normals, indices = [], [], []
        rows, cols = 10, 16
        for j in range(rows+1):
            a = math.pi*j/rows
            for i in range(cols+1):
                b = 2*math.pi*i/cols
                v = (math.sin(a)*math.cos(b), math.cos(a), math.sin(a)*math.sin(b))
                pos.extend(v); normals.extend(v)
        for j in range(rows):
            for i in range(cols):
                a = j*(cols+1)+i; b = a+cols+1
                indices.extend([a,a+1,b,b,a+1,b+1])
        material = len(self.doc['materials'])
        rgb = [int(color[i:i+2],16)/255 for i in (1,3,5)]
        # glTF base colours use linear space.
        rgb = [((v+.055)/1.055)**2.4 if v>.04045 else v/12.92 for v in rgb]
        self.doc['materials'].append(dict(name=color, pbrMetallicRoughness=dict(baseColorFactor=rgb+[1], metallicFactor=0, roughnessFactor=.8)))
        mesh = len(self.doc['meshes'])
        self.doc['meshes'].append(dict(primitives=[dict(attributes=dict(POSITION=self.accessor(pos,3,'VEC3'), NORMAL=self.accessor(normals,3,'VEC3')), indices=self.accessor(indices,1,'SCALAR',True), material=material)]))
        self.cache[color] = mesh
        return mesh
    def group(self,name,position,parent=0):
        index=len(self.doc['nodes']); self.doc['nodes'].append(dict(name=name,translation=position,children=[]))
        self.doc['nodes'][parent]['children'].append(index)
        return index
    def part(self,name,position,scale,color,parent=0,tilt=0):
        i=self.group(name,position,parent)
        self.doc['nodes'][i].update(mesh=self.sphere(color),scale=scale)
        if tilt: self.doc['nodes'][i]['rotation']=[0,0,math.sin(tilt/2),math.cos(tilt/2)]
        return i
    def animate(self,limbs):
        times=self.accessor([0,.18,.36,.54,.72],1,'SCALAR')
        samplers=[]; channels=[]
        for node,sign in limbs:
            values=[]
            for angle in [0,.65*sign,0,-.65*sign,0]: values += [math.sin(angle/2),0,0,math.cos(angle/2)]
            samplers.append(dict(input=times,output=self.accessor(values,4,'VEC4'),interpolation='LINEAR'))
            channels.append(dict(sampler=len(samplers)-1,target=dict(node=node,path='rotation')))
        self.doc['animations']=[dict(name='run',samplers=samplers,channels=channels)]
    def save(self,path):
        self.doc['buffers']=[dict(byteLength=len(self.bin))]
        data=json.dumps(self.doc,separators=(',',':')).encode()
        data += b' ' * (-len(data)%4)
        self.bin += b'\0' * (-len(self.bin)%4)
        result=struct.pack('<III',0x46546c67,2,12+8+len(data)+8+len(self.bin))
        result+=struct.pack('<II',len(data),0x4e4f534a)+data+struct.pack('<II',len(self.bin),0x004e4942)+self.bin
        path.parent.mkdir(parents=True,exist_ok=True); path.write_bytes(result)

for hero in ['boaz','ravi']:
    m=Model(); skin='#ffc58b'; hair='#efb83a'; brown='#87502f'; dark='#303648'
    shirt='#2879d7' if hero=='boaz' else '#f8e4b1'; scarf='#1760be' if hero=='boaz' else '#e4452d'
    shorts=dark if hero=='boaz' else '#747b45'
    m.part('Body',[0,.83,0],[.29,.32,.18],shirt)
    m.part('Belt',[0,.62,.015],[.30,.06,.20],brown)
    m.part('Buckle',[.08,.62,.21],[.07,.065,.025],'#f5c343')
    m.part('Scarf',[0,1.035,.02],[.27,.085,.22],scarf)
    m.part('Scarf-tail',[.3,.96,-.12],[.22,.07,.10],scarf,tilt=.5)
    m.part('Backpack',[0,.85,-.22],[.23,.25,.12],brown)
    m.part('Head',[0,1.30,.025],[.35,.34,.29],skin)
    m.part('Hair',[0,1.47,-.025],[.36,.23,.29],hair)
    for x,tilt in [(-.23,-.5),(-.10,-.4),(.06,-.3),(.22,-.5)]:
        m.part('Fringe',[x,1.48,.235],[.105,.185,.08],hair,tilt=tilt)
    for x in [-.34,.34]:m.part('Ear',[x,1.29,0],[.075,.12,.07],skin)
    for x in [-.125,.125]:
        m.part('Eye-white',[x,1.31,.273],[.087,.108,.027],'#fffbea')
        m.part('Eye-blue',[x,1.31,.298],[.049,.071,.016],'#2482c8')
        m.part('Eye-pupil',[x,1.31,.31],[.026,.052,.009],'#172938')
        m.part('Eye-shine',[x-.012,1.34,.32],[.013,.018,.006],'#ffffff')
        m.part('Brow',[x,1.435,.27],[.08,.018,.022],'#97632c',tilt=-x)
    m.part('Nose',[0,1.24,.30],[.055,.05,.045],'#f1a26b')
    m.part('Smile',[0,1.15,.287],[.095,.035,.015],'#783d2f')
    m.part('Teeth',[0,1.164,.302],[.069,.012,.008],'#fffbea')
    limbs=[]
    for side in [-1,1]:
        leg=m.group('Leg-left' if side<0 else 'Leg-right',[side*.145,.60,0]);limbs.append((leg,side))
        m.part('Shorts',[0,-.08,0],[.135,.16,.16],shorts,leg)
        m.part('Shin',[0,-.27,0],[.085,.16,.085],skin,leg)
        m.part('Boot',[0,-.46,.06],[.13,.14,.19],brown,leg)
        m.part('Sole',[0,-.55,.065],[.14,.045,.20],'#503d31',leg)
        arm=m.group('Arm-left' if side<0 else 'Arm-right',[side*.30,.99,0]);limbs.append((arm,-side))
        m.part('Sleeve',[side*.025,-.065,0],[.10,.135,.115],shirt,arm)
        m.part('Arm',[side*.035,-.20,0],[.075,.13,.075],skin,arm)
        m.part('Glove',[side*.04,-.32,.015],[.095,.095,.095],skin,arm)
    m.part('Badge',[0,.95,.206],[.072,.072,.028],'#f6c747')
    m.animate(limbs);m.save(ROOT/'characters'/hero/'3d/model.glb')

m=Model()
m.part('Body',[0,.40,0],[.39,.38,.31],'#bd7445')
m.part('Cap',[0,.65,0],[.51,.25,.38],'#9a522f')
for x in [-.15,.15]:
    m.part('Eye',[x,.46,.285],[.09,.12,.035],'#fffbea')
    m.part('Pupil',[x,.445,.322],[.035,.069,.013],'#292d38')
    m.part('Brow',[x,.59,.31],[.13,.03,.04],'#482d27',tilt=x*2)
legs=[]
for side in [-1,1]:
    leg=m.group('Foot-left' if side<0 else 'Foot-right',[side*.23,.1,0]);legs.append((leg,side))
    m.part('Shoe',[0,0,.09],[.20,.10,.25],'#51372c',leg)
m.animate(legs);m.save(ROOT/'enemies/game/walker/3d/model.glb')
print('Boaz, Ravi en de wandelvijand: 3 originele GLB-modellen gemaakt.')
