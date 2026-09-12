import { getProductVisual } from '../lib/productVisual';

function Pot({ smile = false, color = '#ca805d', rim = '#df9c77' }) {
  return <g className="illustrated-pot">
    <path d="M102 197h96l-12 65q-36 16-72 0Z" fill={color} />
    <path d="M110 202h17l8 65-19-5Z" fill="#fff" opacity=".12" />
    <rect x="95" y="189" width="110" height="17" rx="6" fill={rim} />
    <path d="M112 255q38 13 76 0" stroke="#8f4b37" strokeWidth="2" opacity=".2" fill="none" />
    {smile && <g fill="#644d37"><ellipse cx="135" cy="226" rx="3" ry="4" /><ellipse cx="165" cy="226" rx="3" ry="4" /><path d="M145 231q5 7 10 0" fill="none" stroke="#644d37" strokeWidth="2.5" strokeLinecap="round" /><ellipse cx="127" cy="234" rx="6" ry="3" fill="#eea694" /><ellipse cx="173" cy="234" rx="6" ry="3" fill="#eea694" /></g>}
  </g>;
}

function MonsteraLeaf({ x, y, angle, scale = 1, color = '#497854' }) {
  return <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
    <path d="M0 0C-51-3-67-49-44-63-23-76-6-60 0-43 6-60 23-76 44-63 67-49 51-3 0 0Z" fill={color} />
    <path d="M0-2V-47M0-13l-21-15M0-25l-25-17M0-13l21-15M0-25l25-17" fill="none" stroke="#b3c789" strokeWidth="1.8" opacity=".6" strokeLinecap="round" />
    <g fill="#e3ead2"><ellipse cx="-29" cy="-34" rx="3.2" ry="10" transform="rotate(-45 -29 -34)" /><ellipse cx="29" cy="-34" rx="3.2" ry="10" transform="rotate(45 29 -34)" /><ellipse cx="-18" cy="-49" rx="3" ry="6" transform="rotate(-25 -18 -49)" /><ellipse cx="18" cy="-49" rx="3" ry="6" transform="rotate(25 18 -49)" /></g>
  </g>;
}

export default function ProductArt({ product, smile = false, className = '' }) {
  const visual = getProductVisual(product);
  if (visual.type === 'emoji') return <span role="img" aria-label={visual.label} className={`matched-emoji ${className}`}>{visual.emoji}</span>;
  return <svg className={`botanical-art ${className}`} viewBox="0 0 300 300" role="img" aria-label={`Minh họa ${product.name || visual.label}`}>
    <ellipse cx="150" cy="276" rx="68" ry="9" fill="#365a34" opacity=".11" />
    <g className="plant-foliage">
      {visual.type === 'vine' && <>
        <path d="M149 198q-11-81-36-88-30-7-43 15t-6 76q4 30 22 41m66-44q8-115 37-105t29 71q-3 40-15 61" stroke="#628344" strokeWidth="4" fill="none" strokeLinecap="round" />
        {[[110,126,-40],[145,162,35],[182,125,30],[208,155,65],[64,161,-55],[70,205,-25],[206,202,40]].map(([x,y,angle],index) => <g key={index} transform={`translate(${x} ${y}) rotate(${angle})`}><path d="M0 22Q-37-3-24-21-9-35 0-15 12-36 25-22 40-3 0 22Z" fill={index % 2 ? '#8fa460' : '#557d4e'} /><path d="M0 20V-15M0 5l-12-12M0-1l11-10" stroke="#d1dba0" strokeWidth="1.5" fill="none" opacity=".65" /></g>)}
      </>}
      {visual.type === 'bunny' && <>
        <ellipse cx="149" cy="161" rx="33" ry="44" fill="#739557" />
        <ellipse cx="120" cy="101" rx="22" ry="42" transform="rotate(-24 120 101)" fill="#88a669" />
        <ellipse cx="177" cy="94" rx="21" ry="45" transform="rotate(20 177 94)" fill="#789f60" />
        {[[113,80],[125,95],[121,114],[174,71],[177,90],[175,110],[135,146],[155,147],[145,166],[164,171],[137,185]].map(([x,y],index) => <g key={index} stroke="#e2dda1" strokeWidth="2" strokeLinecap="round"><path d={`M${x-2} ${y}h4m-2-2v4`} /></g>)}
      </>}
      {visual.type === 'monstera' && <>
        <path d="M151 197q0-75 2-112M147 196q-3-43-43-68M155 195q6-48 45-63" fill="none" stroke="#567747" strokeWidth="5" strokeLinecap="round" />
        <MonsteraLeaf x={153} y={103} angle={8} scale={.97} color="#315d40" />
        <MonsteraLeaf x={113} y={143} angle={-44} scale={.91} />
        <MonsteraLeaf x={193} y={147} angle={46} scale={.87} color="#789859" />
        <MonsteraLeaf x={146} y={177} angle={-12} scale={.55} color="#91a765" />
      </>}
      {visual.type === 'snake' && <g stroke="#afbd68" strokeWidth="4">
        <path d="M130 201Q89 127 106 63q38 47 38 138Z" fill="#648653" /><path d="M143 201Q123 93 152 24q24 84 10 177Z" fill="#365f42" /><path d="M165 201q-2-101 38-140 8 85-21 140Z" fill="#52774a" />
        <path d="m143 68 15 7m-17 14 19 8m-20 15 21 8m-20 18 20 7m-17 16 17 8m-49-64 14 3m-9 16 15 2m42-11 17-2m-21 26 16-3m-19 25 13-2" stroke="#a9c183" strokeWidth="3" opacity=".7" />
      </g>}
      {visual.type === 'cactus' && <>
        <path d="M129 199V96q0-26 22-26t22 26v103" fill="#658c59" />
        <path d="M132 159H110q-20 0-20-20v-23q0-17 14-17t14 17v13h14M170 147h22q21 0 21-20V99q0-17-14-17t-14 17v20h-15" fill="#80a268" />
        <path d="M150 88v101m-45-76v24m94-40v29" stroke="#bdd18d" strokeWidth="3" strokeLinecap="round" />
        {[110,133,156,179].map((y) => <g key={y} stroke="#d5ddaa" strokeWidth="2"><path d={`M134 ${y}l-7-4m40 4 7-4`} /></g>)}
        <g fill="#ebb5b0"><ellipse cx="154" cy="67" rx="9" ry="16" /><ellipse cx="154" cy="67" rx="9" ry="16" transform="rotate(65 154 67)" /><ellipse cx="154" cy="67" rx="9" ry="16" transform="rotate(-65 154 67)" /><circle cx="154" cy="67" r="6" fill="#f3d07c" /></g>
      </>}
      {visual.type === 'succulent' && <g transform="translate(150 155)">
        {[0,45,90,135,180,225,270,315].map((angle, i) => <path key={angle} d="M0 25Q-44-8 0-83 44-8 0 25Z" transform={`rotate(${angle}) scale(1 .86)`} fill={i % 2 ? '#8cac7e' : '#a9bf97'} stroke="#d6dfb5" strokeWidth="2" />)}
        {[22,94,166,238,310].map((angle) => <path key={angle} d="M0 12Q-30-9 0-54 30-9 0 12Z" transform={`rotate(${angle})`} fill="#719b76" stroke="#bed2ac" strokeWidth="2" />)}
        <path d="M0 8Q-20-5 0-31 20-5 0 8Z" fill="#d1dcb3" />
      </g>}
      {visual.type === 'flower' && <>
        <path d="M150 197V102m0 65q-40-2-35-31 33 2 35 31m0-21q38-1 34-29-29 1-34 29" fill="#85a46c" stroke="#638854" strokeWidth="3" />
        <g transform="translate(150 95)" fill="#f5d9a1">{[0,60,120,180,240,300].map((angle) => <ellipse key={angle} cy="-25" rx="14" ry="24" transform={`rotate(${angle})`} />)}<circle r="18" fill="#d5a74f" /></g>
      </>}
    </g>
    {visual.type === 'pot' ? <g><ellipse cx="150" cy="155" rx="61" ry="14" fill="#b97857" /><path d="M89 155h122l-16 107q-45 15-90 0Z" fill="#ce906a" /><path d="M108 178q42 15 84 0m-80 24q38 15 76 0m-72 24q34 14 68 0" fill="none" stroke="#edc5a2" strokeWidth="5" /><ellipse cx="150" cy="155" rx="56" ry="10" fill="#725541" /></g> : <Pot smile={smile} color={visual.type === 'snake' ? '#ddc491' : undefined} rim={visual.type === 'snake' ? '#ecdbb5' : undefined} />}
  </svg>;
}
