// Contrast check for app.css text tokens (OKLCH → WCAG ratio). Values mirror app.css; update both.
// node scripts/contrast.mjs
function oklch2rgb(L,C,h){const a=C*Math.cos(h*Math.PI/180),b=C*Math.sin(h*Math.PI/180);
const l_=L+0.3963377774*a+0.2158037573*b,m_=L-0.1055613458*a-0.0638541728*b,s_=L-0.0894841775*a-1.2914855480*b;
const l=l_**3,m=m_**3,s=s_**3;
let r=4.0767416621*l-3.3077115913*m+0.2309699292*s,g=-1.2684380046*l+2.6097574011*m-0.3413193965*s,bb=-0.0041960863*l-0.7034186147*m+1.7076147010*s;
return [r,g,bb].map(x=>Math.min(1,Math.max(0,x)));}
const lum=([r,g,b])=>0.2126*r+0.7152*g+0.0722*b; // linear already
const cr=(a,b)=>{const A=lum(oklch2rgb(...a)),B=lum(oklch2rgb(...b));return ((Math.max(A,B)+.05)/(Math.min(A,B)+.05)).toFixed(2)};
const night=[0.145,0.014,292], surf=[0.175,0.016,292], warm=[0.975,0.008,75], warmSurf=[0.955,0.011,72];
const dark={fg:[0.94,0.012,75],muted:[0.74,0.02,285],faint:[0.6,0.02,285],primary:[0.7,0.19,300],ember:[0.76,0.165,55],online:[0.79,0.17,152],deploying:[0.83,0.15,85],standby:[0.7,0.045,250],advisory:[0.7,0.19,38],offline:[0.6,0.012,285],config:[0.68,0.15,268],claude:[0.67,0.2,28],primFg:[0.16,0.02,292]};
const light={fg:[0.24,0.02,50],muted:[0.45,0.02,50],faint:[0.51,0.02,50],primary:[0.52,0.22,300],ember:[0.56,0.18,45],online:[0.5,0.14,152],deploying:[0.52,0.12,70],standby:[0.5,0.05,250],advisory:[0.53,0.19,35],offline:[0.5,0.012,50],config:[0.5,0.17,268],claude:[0.55,0.21,27],primFg:[0.985,0.005,75]};
console.log('DARK on night / on surface');for(const[k,v]of Object.entries(dark))console.log(k.padEnd(10),cr(v,night),cr(v,surf));
console.log('primary-fg on primary', cr(dark.primFg,dark.primary));
console.log('LIGHT on warm / on surface');for(const[k,v]of Object.entries(light))console.log(k.padEnd(10),cr(v,warm),cr(v,warmSurf));
console.log('primary-fg on primary', cr(light.primFg,light.primary));
