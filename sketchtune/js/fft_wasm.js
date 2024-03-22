
var Module_OINK = (() => {
  //var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  //var _scriptDir = "https://cdn.jsdelivr.net/gh/sch1z0net/oink@v0.1.3-alpha/";
  var _scriptDir = "./js/";
  return (
function(moduleArg = {}) {

var b=moduleArg,m,p;b.ready=new Promise((a,c)=>{m=a;p=c});var u=Object.assign({},b),w="object"==typeof window,x="function"==typeof importScripts,y="object"==typeof process&&"object"==typeof process.versions&&"string"==typeof process.versions.node,z="",A,B,C;
if(y){var fs=require("fs"),D=require("path");z=x?D.dirname(z)+"/":__dirname+"/";A=(a,c)=>{a=E(a)?new URL(a):D.normalize(a);return fs.readFileSync(a,c?void 0:"utf8")};C=a=>{a=A(a,!0);a.buffer||(a=new Uint8Array(a));return a};B=(a,c,d,e=!0)=>{a=E(a)?new URL(a):D.normalize(a);fs.readFile(a,e?void 0:"utf8",(r,q)=>{r?d(r):c(e?q.buffer:q)})};process.argv.slice(2)}else if(w||x)x?z=self.location.href:"undefined"!=typeof document&&document.currentScript&&(z=document.currentScript.src),_scriptDir&&(z=_scriptDir),
z.startsWith("blob:")?z="":z=z.substr(0,z.replace(/[?#].*/,"").lastIndexOf("/")+1),A=a=>{var c=new XMLHttpRequest;c.open("GET",a,!1);c.send(null);return c.responseText},x&&(C=a=>{var c=new XMLHttpRequest;c.open("GET",a,!1);c.responseType="arraybuffer";c.send(null);return new Uint8Array(c.response)}),B=(a,c,d)=>{var e=new XMLHttpRequest;e.open("GET",a,!0);e.responseType="arraybuffer";e.onload=()=>{200==e.status||0==e.status&&e.response?c(e.response):d()};e.onerror=d;e.send(null)};b.print||console.log.bind(console);
var G=b.printErr||console.error.bind(console);Object.assign(b,u);u=null;var H;b.wasmBinary&&(H=b.wasmBinary);"object"!=typeof WebAssembly&&I("no native wasm support detected");var J,K=!1,L,M,N=[],O=[],P=[];function aa(){var a=b.preRun.shift();N.unshift(a)}var Q=0,R=null,S=null;function I(a){b.onAbort?.(a);a="Aborted("+a+")";G(a);K=!0;a=new WebAssembly.RuntimeError(a+". Build with -sASSERTIONS for more info.");p(a);throw a;}
var T=a=>a.startsWith("data:application/octet-stream;base64,"),E=a=>a.startsWith("file://"),U;U="fft_wasm.wasm";if(!T(U)){var V=U;U=b.locateFile?b.locateFile(V,z):z+V}function ba(a){if(a==U&&H)return new Uint8Array(H);if(C)return C(a);throw"both async and sync fetching of the wasm failed";}
function ca(a){if(!H&&(w||x)){if("function"==typeof fetch&&!E(a))return fetch(a,{credentials:"same-origin"}).then(c=>{if(!c.ok)throw`failed to load wasm binary file at '${a}'`;return c.arrayBuffer()}).catch(()=>ba(a));if(B)return new Promise((c,d)=>{B(a,e=>c(new Uint8Array(e)),d)})}return Promise.resolve().then(()=>ba(a))}function ea(a,c,d){return ca(a).then(e=>WebAssembly.instantiate(e,c)).then(d,e=>{G(`failed to asynchronously prepare wasm: ${e}`);I(e)})}
function fa(a,c){var d=U;return H||"function"!=typeof WebAssembly.instantiateStreaming||T(d)||E(d)||y||"function"!=typeof fetch?ea(d,a,c):fetch(d,{credentials:"same-origin"}).then(e=>WebAssembly.instantiateStreaming(e,a).then(c,function(r){G(`wasm streaming compile failed: ${r}`);G("falling back to ArrayBuffer instantiation");return ea(d,a,c)}))}
var W=a=>{for(;0<a.length;)a.shift()(b)},ha="undefined"!=typeof TextDecoder?new TextDecoder("utf8"):void 0,ka=(a,c,d,e)=>{var r={string:f=>{var l=0;if(null!==f&&void 0!==f&&0!==f){for(var g=l=0;g<f.length;++g){var k=f.charCodeAt(g);127>=k?l++:2047>=k?l+=2:55296<=k&&57343>=k?(l+=4,++g):l+=3}var h=l+1;g=l=X(h);k=M;if(0<h){h=g+h-1;for(var t=0;t<f.length;++t){var n=f.charCodeAt(t);if(55296<=n&&57343>=n){var ma=f.charCodeAt(++t);n=65536+((n&1023)<<10)|ma&1023}if(127>=n){if(g>=h)break;k[g++]=n}else{if(2047>=
n){if(g+1>=h)break;k[g++]=192|n>>6}else{if(65535>=n){if(g+2>=h)break;k[g++]=224|n>>12}else{if(g+3>=h)break;k[g++]=240|n>>18;k[g++]=128|n>>12&63}k[g++]=128|n>>6&63}k[g++]=128|n&63}}k[g]=0}}return l},array:f=>{var l=X(f.length);L.set(f,l);return l}};a=b["_"+a];var q=[],F=0;if(e)for(var v=0;v<e.length;v++){var da=r[d[v]];da?(0===F&&(F=ia()),q[v]=da(e[v])):q[v]=e[v]}d=a(...q);return d=function(f){0!==F&&ja(F);if("string"===c)if(f){for(var l=M,g=f+NaN,k=f;l[k]&&!(k>=g);)++k;if(16<k-f&&l.buffer&&ha)f=ha.decode(l.subarray(f,
k));else{for(g="";f<k;){var h=l[f++];if(h&128){var t=l[f++]&63;if(192==(h&224))g+=String.fromCharCode((h&31)<<6|t);else{var n=l[f++]&63;h=224==(h&240)?(h&15)<<12|t<<6|n:(h&7)<<18|t<<12|n<<6|l[f++]&63;65536>h?g+=String.fromCharCode(h):(h-=65536,g+=String.fromCharCode(55296|h>>10,56320|h&1023))}}else g+=String.fromCharCode(h)}f=g}}else f="";else f="boolean"===c?!!f:f;return f}(d)},la={a:()=>{I("OOM")}},Y=function(){function a(d){Y=d.exports;J=Y.b;d=J.buffer;b.HEAP8=L=new Int8Array(d);b.HEAP16=new Int16Array(d);
b.HEAPU8=M=new Uint8Array(d);b.HEAPU16=new Uint16Array(d);b.HEAP32=new Int32Array(d);b.HEAPU32=new Uint32Array(d);b.HEAPF32=new Float32Array(d);b.HEAPF64=new Float64Array(d);O.unshift(Y.c);Q--;b.monitorRunDependencies?.(Q);0==Q&&(null!==R&&(clearInterval(R),R=null),S&&(d=S,S=null,d()));return Y}var c={a:la};Q++;b.monitorRunDependencies?.(Q);if(b.instantiateWasm)try{return b.instantiateWasm(c,a)}catch(d){G(`Module.instantiateWasm callback failed with error: ${d}`),p(d)}fa(c,function(d){a(d.instance)}).catch(p);
return{}}();b._getOut2048Ptr=()=>(b._getOut2048Ptr=Y.d)();b._fftReal2048=(a,c)=>(b._fftReal2048=Y.e)(a,c);b._getOut1024Ptr=()=>(b._getOut1024Ptr=Y.f)();b._fftReal1024=(a,c)=>(b._fftReal1024=Y.g)(a,c);b._getOut512Ptr=()=>(b._getOut512Ptr=Y.h)();b._fftReal512=(a,c)=>(b._fftReal512=Y.i)(a,c);b._getOut256Ptr=()=>(b._getOut256Ptr=Y.j)();b._fftReal256=(a,c)=>(b._fftReal256=Y.k)(a,c);b._getOut128Ptr=()=>(b._getOut128Ptr=Y.l)();b._fftReal128=(a,c)=>(b._fftReal128=Y.m)(a,c);b._malloc=a=>(b._malloc=Y.o)(a);
b._free=a=>(b._free=Y.p)(a);var ia=()=>(ia=Y.q)(),ja=a=>(ja=Y.r)(a),X=a=>(X=Y.s)(a);b.ccall=ka;b.cwrap=(a,c,d,e)=>{var r=!d||d.every(q=>"number"===q||"boolean"===q);return"string"!==c&&r&&!e?b["_"+a]:(...q)=>ka(a,c,d,q,e)};var Z;S=function na(){Z||oa();Z||(S=na)};
function oa(){function a(){if(!Z&&(Z=!0,b.calledRun=!0,!K)){W(O);m(b);if(b.onRuntimeInitialized)b.onRuntimeInitialized();if(b.postRun)for("function"==typeof b.postRun&&(b.postRun=[b.postRun]);b.postRun.length;){var c=b.postRun.shift();P.unshift(c)}W(P)}}if(!(0<Q)){if(b.preRun)for("function"==typeof b.preRun&&(b.preRun=[b.preRun]);b.preRun.length;)aa();W(N);0<Q||(b.setStatus?(b.setStatus("Running..."),setTimeout(function(){setTimeout(function(){b.setStatus("")},1);a()},1)):a())}}
if(b.preInit)for("function"==typeof b.preInit&&(b.preInit=[b.preInit]);0<b.preInit.length;)b.preInit.pop()();oa();


  return moduleArg.ready
}
);
})();
if (typeof exports === 'object' && typeof module === 'object')
  module.exports = Module;
else if (typeof define === 'function' && define['amd'])
  define([], () => Module);

module.exports = Module_OINK;
