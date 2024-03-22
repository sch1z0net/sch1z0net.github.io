
var Module_KISS = (() => {
  //var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  var _scriptDir = "./js/fft_libs/kiss/";

  if (typeof __filename !== 'undefined') _scriptDir ||= __filename;
  return (
function(moduleArg = {}) {

var k=moduleArg,aa,p;k.ready=new Promise((a,b)=>{aa=a;p=b});var ba=Object.assign({},k),ca="object"==typeof window,q="function"==typeof importScripts,da="object"==typeof process&&"object"==typeof process.versions&&"string"==typeof process.versions.node,v="",ea,x,fa;
if(da){var fs=require("fs"),ha=require("path");v=q?ha.dirname(v)+"/":__dirname+"/";ea=(a,b)=>{a=ia(a)?new URL(a):ha.normalize(a);return fs.readFileSync(a,b?void 0:"utf8")};fa=a=>{a=ea(a,!0);a.buffer||(a=new Uint8Array(a));return a};x=(a,b,c,d=!0)=>{a=ia(a)?new URL(a):ha.normalize(a);fs.readFile(a,d?void 0:"utf8",(e,h)=>{e?c(e):b(d?h.buffer:h)})};process.argv.slice(2)}else if(ca||q)q?v=self.location.href:"undefined"!=typeof document&&document.currentScript&&(v=document.currentScript.src),_scriptDir&&
(v=_scriptDir),v.startsWith("blob:")?v="":v=v.substr(0,v.replace(/[?#].*/,"").lastIndexOf("/")+1),ea=a=>{var b=new XMLHttpRequest;b.open("GET",a,!1);b.send(null);return b.responseText},q&&(fa=a=>{var b=new XMLHttpRequest;b.open("GET",a,!1);b.responseType="arraybuffer";b.send(null);return new Uint8Array(b.response)}),x=(a,b,c)=>{var d=new XMLHttpRequest;d.open("GET",a,!0);d.responseType="arraybuffer";d.onload=()=>{200==d.status||0==d.status&&d.response?b(d.response):c()};d.onerror=c;d.send(null)};
var ja=k.print||console.log.bind(console),y=k.printErr||console.error.bind(console);Object.assign(k,ba);ba=null;var B;k.wasmBinary&&(B=k.wasmBinary);"object"!=typeof WebAssembly&&ka("no native wasm support detected");var la,ma=!1,na,C,D,oa,E,F,pa,qa,ra=[],sa=[],ta=[];function ua(){var a=k.preRun.shift();ra.unshift(a)}var G=0,va=null,H=null;function ka(a){k.onAbort?.(a);a="Aborted("+a+")";y(a);ma=!0;a=new WebAssembly.RuntimeError(a+". Build with -sASSERTIONS for more info.");p(a);throw a;}
var wa=a=>a.startsWith("data:application/octet-stream;base64,"),ia=a=>a.startsWith("file://"),I;I="kiss_fft.wasm";if(!wa(I)){var xa=I;I=k.locateFile?k.locateFile(xa,v):v+xa}function ya(a){if(a==I&&B)return new Uint8Array(B);if(fa)return fa(a);throw"both async and sync fetching of the wasm failed";}
function za(a){if(!B&&(ca||q)){if("function"==typeof fetch&&!ia(a))return fetch(a,{credentials:"same-origin"}).then(b=>{if(!b.ok)throw`failed to load wasm binary file at '${a}'`;return b.arrayBuffer()}).catch(()=>ya(a));if(x)return new Promise((b,c)=>{x(a,d=>b(new Uint8Array(d)),c)})}return Promise.resolve().then(()=>ya(a))}function Aa(a,b,c){return za(a).then(d=>WebAssembly.instantiate(d,b)).then(c,d=>{y(`failed to asynchronously prepare wasm: ${d}`);ka(d)})}
function Da(a,b){var c=I;return B||"function"!=typeof WebAssembly.instantiateStreaming||wa(c)||ia(c)||da||"function"!=typeof fetch?Aa(c,a,b):fetch(c,{credentials:"same-origin"}).then(d=>WebAssembly.instantiateStreaming(d,a).then(b,function(e){y(`wasm streaming compile failed: ${e}`);y("falling back to ArrayBuffer instantiation");return Aa(c,a,b)}))}var Ea=a=>{for(;0<a.length;)a.shift()(k)};class Fa{constructor(a){this.D=a-24}}
var Ga=0,Ha=0,Ia,J=a=>{for(var b="";C[a];)b+=Ia[C[a++]];return b},K={},L={},Ja={},M,Ka=a=>{throw new M(a);},N,P=(a,b,c)=>{function d(f){f=c(f);if(f.length!==a.length)throw new N("Mismatched type converter count");for(var m=0;m<a.length;++m)O(a[m],f[m])}a.forEach(function(f){Ja[f]=b});var e=Array(b.length),h=[],g=0;b.forEach((f,m)=>{L.hasOwnProperty(f)?e[m]=L[f]:(h.push(f),K.hasOwnProperty(f)||(K[f]=[]),K[f].push(()=>{e[m]=L[f];++g;g===h.length&&d(e)}))});0===h.length&&d(e)};
function La(a,b,c={}){var d=b.name;if(!a)throw new M(`type "${d}" must have a positive integer typeid pointer`);if(L.hasOwnProperty(a)){if(c.da)return;throw new M(`Cannot register type '${d}' twice`);}L[a]=b;delete Ja[a];K.hasOwnProperty(a)&&(b=K[a],delete K[a],b.forEach(e=>e()))}function O(a,b,c={}){if(!("argPackAdvance"in b))throw new TypeError("registerType registeredInstance requires argPackAdvance");return La(a,b,c)}
var Ma=a=>{throw new M(a.A.F.C.name+" instance already deleted");},Na=!1,Oa=()=>{},Pa=(a,b,c)=>{if(b===c)return a;if(void 0===c.H)return null;a=Pa(a,b,c.H);return null===a?null:c.$(a)},Qa={},Q=[],Ra=()=>{for(;Q.length;){var a=Q.pop();a.A.N=!1;a["delete"]()}},R,S={},Sa=(a,b)=>{if(void 0===b)throw new M("ptr should not be undefined");for(;a.H;)b=a.R(b),a=a.H;return S[b]},Ta=(a,b)=>{if(!b.F||!b.D)throw new N("makeClassHandle requires ptr and ptrType");if(!!b.I!==!!b.G)throw new N("Both smartPtrType and smartPtr must be specified");
b.count={value:1};return T(Object.create(a,{A:{value:b,writable:!0}}))},T=a=>{if("undefined"===typeof FinalizationRegistry)return T=b=>b,a;Na=new FinalizationRegistry(b=>{b=b.A;--b.count.value;0===b.count.value&&(b.G?b.I.L(b.G):b.F.C.L(b.D))});T=b=>{var c=b.A;c.G&&Na.register(b,{A:c},b);return b};Oa=b=>{Na.unregister(b)};return T(a)};function Ua(){}
var Va=(a,b)=>Object.defineProperty(b,"name",{value:a}),Wa=(a,b,c)=>{if(void 0===a[b].K){var d=a[b];a[b]=function(...e){if(!a[b].K.hasOwnProperty(e.length))throw new M(`Function '${c}' called with an invalid number of arguments (${e.length}) - expects one of (${a[b].K})!`);return a[b].K[e.length].apply(this,e)};a[b].K=[];a[b].K[d.S]=d}},Xa=(a,b)=>{if(k.hasOwnProperty(a))throw new M(`Cannot register public name '${a}' twice`);k[a]=b},Ya=a=>{if(void 0===a)return"_unknown";a=a.replace(/[^a-zA-Z0-9_]/g,
"$");var b=a.charCodeAt(0);return 48<=b&&57>=b?`_${a}`:a};function Za(a,b,c,d,e,h,g,f){this.name=a;this.constructor=b;this.O=c;this.L=d;this.H=e;this.aa=h;this.R=g;this.$=f;this.fa=[]}var $a=(a,b,c)=>{for(;b!==c;){if(!b.R)throw new M(`Expected null or instance of ${c.name}, got an instance of ${b.name}`);a=b.R(a);b=b.H}return a};
function ab(a,b){if(null===b){if(this.V)throw new M(`null is not a valid ${this.name}`);return 0}if(!b.A)throw new M(`Cannot pass "${bb(b)}" as a ${this.name}`);if(!b.A.D)throw new M(`Cannot pass deleted object as a pointer of type ${this.name}`);return $a(b.A.D,b.A.F.C,this.C)}
function cb(a,b){if(null===b){if(this.V)throw new M(`null is not a valid ${this.name}`);if(this.U){var c=this.ga();null!==a&&a.push(this.L,c);return c}return 0}if(!b||!b.A)throw new M(`Cannot pass "${bb(b)}" as a ${this.name}`);if(!b.A.D)throw new M(`Cannot pass deleted object as a pointer of type ${this.name}`);if(!this.T&&b.A.F.T)throw new M(`Cannot convert argument of type ${b.A.I?b.A.I.name:b.A.F.name} to parameter type ${this.name}`);c=$a(b.A.D,b.A.F.C,this.C);if(this.U){if(void 0===b.A.G)throw new M("Passing raw pointer to smart pointer is illegal");
switch(this.ia){case 0:if(b.A.I===this)c=b.A.G;else throw new M(`Cannot convert argument of type ${b.A.I?b.A.I.name:b.A.F.name} to parameter type ${this.name}`);break;case 1:c=b.A.G;break;case 2:if(b.A.I===this)c=b.A.G;else{var d=b.clone();c=this.ha(c,db(()=>d["delete"]()));null!==a&&a.push(this.L,c)}break;default:throw new M("Unsupporting sharing policy");}}return c}
function eb(a,b){if(null===b){if(this.V)throw new M(`null is not a valid ${this.name}`);return 0}if(!b.A)throw new M(`Cannot pass "${bb(b)}" as a ${this.name}`);if(!b.A.D)throw new M(`Cannot pass deleted object as a pointer of type ${this.name}`);if(b.A.F.T)throw new M(`Cannot convert argument of type ${b.A.F.name} to parameter type ${this.name}`);return $a(b.A.D,b.A.F.C,this.C)}function fb(a){return this.fromWireType(F[a>>2])}
function gb(a,b,c,d,e,h,g,f,m,n,l){this.name=a;this.C=b;this.V=c;this.T=d;this.U=e;this.ea=h;this.ia=g;this.Y=f;this.ga=m;this.ha=n;this.L=l;e||void 0!==b.H?this.toWireType=cb:(this.toWireType=d?ab:eb,this.J=null)}
var hb=(a,b)=>{if(!k.hasOwnProperty(a))throw new N("Replacing nonexistent public symbol");k[a]=b;k[a].S=void 0},ib=[],kb,lb=a=>{var b=ib[a];b||(a>=ib.length&&(ib.length=a+1),ib[a]=b=kb.get(a));return b},mb=(a,b,c=[])=>a.includes("j")?(0,k["dynCall_"+a])(b,...c):lb(b)(...c),nb=(a,b)=>(...c)=>mb(a,b,c),U=(a,b)=>{a=J(a);var c=a.includes("j")?nb(a,b):lb(b);if("function"!=typeof c)throw new M(`unknown function pointer with signature ${a}: ${b}`);return c},ob,qb=a=>{a=pb(a);var b=J(a);V(a);return b},rb=
(a,b)=>{function c(h){e[h]||L[h]||(Ja[h]?Ja[h].forEach(c):(d.push(h),e[h]=!0))}var d=[],e={};b.forEach(c);throw new ob(`${a}: `+d.map(qb).join([", "]));},sb=(a,b)=>{for(var c=[],d=0;d<a;d++)c.push(F[b+4*d>>2]);return c},tb=a=>{for(;a.length;){var b=a.pop();a.pop()(b)}};function ub(a){for(var b=1;b<a.length;++b)if(null!==a[b]&&void 0===a[b].J)return!0;return!1}
function vb(a){var b=Function;if(!(b instanceof Function))throw new TypeError(`new_ called with constructor type ${typeof b} which is not a function`);var c=Va(b.name||"unknownFunctionName",function(){});c.prototype=b.prototype;c=new c;a=b.apply(c,a);return a instanceof Object?a:c}
function wb(a,b,c,d,e,h){var g=b.length;if(2>g)throw new M("argTypes array size mismatch! Must at least get return value and 'this' types!");var f=null!==b[1]&&null!==c,m=ub(b);c="void"!==b[0].name;d=[a,Ka,d,e,tb,b[0],b[1]];for(e=0;e<g-2;++e)d.push(b[e+2]);if(!m)for(e=f?1:2;e<b.length;++e)null!==b[e].J&&d.push(b[e].J);m=ub(b);e=b.length;var n="",l="";for(g=0;g<e-2;++g)n+=(0!==g?", ":"")+"arg"+g,l+=(0!==g?", ":"")+"arg"+g+"Wired";n=`\n        return function (${n}) {\n        if (arguments.length !== ${e-
2}) {\n          throwBindingError('function ' + humanName + ' called with ' + arguments.length + ' arguments, expected ${e-2}');\n        }`;m&&(n+="var destructors = [];\n");var r=m?"destructors":"null",t="humanName throwBindingError invoker fn runDestructors retType classParam".split(" ");f&&(n+="var thisWired = classParam['toWireType']("+r+", this);\n");for(g=0;g<e-2;++g)n+="var arg"+g+"Wired = argType"+g+"['toWireType']("+r+", arg"+g+");\n",t.push("argType"+g);f&&(l="thisWired"+(0<l.length?", ":
"")+l);n+=(c||h?"var rv = ":"")+"invoker(fn"+(0<l.length?", ":"")+l+");\n";if(m)n+="runDestructors(destructors);\n";else for(g=f?1:2;g<b.length;++g)h=1===g?"thisWired":"arg"+(g-2)+"Wired",null!==b[g].J&&(n+=`${h}_dtor(${h});\n`,t.push(`${h}_dtor`));c&&(n+="var ret = retType['fromWireType'](rv);\nreturn ret;\n");let [w,u]=[t,n+"}\n"];w.push(u);b=vb(w)(...d);return Va(a,b)}
for(var xb=a=>{a=a.trim();const b=a.indexOf("(");return-1!==b?a.substr(0,b):a},yb=[],Y=[],db=a=>{switch(a){case void 0:return 2;case null:return 4;case !0:return 6;case !1:return 8;default:const b=yb.pop()||Y.length;Y[b]=a;Y[b+1]=1;return b}},zb={name:"emscripten::val",fromWireType:a=>{if(!a)throw new M("Cannot use deleted val. handle = "+a);var b=Y[a];9<a&&0===--Y[a+1]&&(Y[a]=void 0,yb.push(a));return b},toWireType:(a,b)=>db(b),argPackAdvance:8,readValueFromPointer:fb,J:null},bb=a=>{if(null===a)return"null";
var b=typeof a;return"object"===b||"array"===b||"function"===b?a.toString():""+a},Ab=(a,b)=>{switch(b){case 4:return function(c){return this.fromWireType(pa[c>>2])};case 8:return function(c){return this.fromWireType(qa[c>>3])};default:throw new TypeError(`invalid float width (${b}): ${a}`);}},Bb=(a,b,c)=>{switch(b){case 1:return c?d=>na[d]:d=>C[d];case 2:return c?d=>D[d>>1]:d=>oa[d>>1];case 4:return c?d=>E[d>>2]:d=>F[d>>2];default:throw new TypeError(`invalid integer width (${b}): ${a}`);}},Cb="undefined"!=
typeof TextDecoder?new TextDecoder("utf8"):void 0,Db=(a,b,c)=>{var d=b+c;for(c=b;a[c]&&!(c>=d);)++c;if(16<c-b&&a.buffer&&Cb)return Cb.decode(a.subarray(b,c));for(d="";b<c;){var e=a[b++];if(e&128){var h=a[b++]&63;if(192==(e&224))d+=String.fromCharCode((e&31)<<6|h);else{var g=a[b++]&63;e=224==(e&240)?(e&15)<<12|h<<6|g:(e&7)<<18|h<<12|g<<6|a[b++]&63;65536>e?d+=String.fromCharCode(e):(e-=65536,d+=String.fromCharCode(55296|e>>10,56320|e&1023))}}else d+=String.fromCharCode(e)}return d},Eb="undefined"!=
typeof TextDecoder?new TextDecoder("utf-16le"):void 0,Fb=(a,b)=>{var c=a>>1;for(var d=c+b/2;!(c>=d)&&oa[c];)++c;c<<=1;if(32<c-a&&Eb)return Eb.decode(C.subarray(a,c));c="";for(d=0;!(d>=b/2);++d){var e=D[a+2*d>>1];if(0==e)break;c+=String.fromCharCode(e)}return c},Gb=(a,b,c)=>{c??=2147483647;if(2>c)return 0;c-=2;var d=b;c=c<2*a.length?c/2:a.length;for(var e=0;e<c;++e)D[b>>1]=a.charCodeAt(e),b+=2;D[b>>1]=0;return b-d},Hb=a=>2*a.length,Ib=(a,b)=>{for(var c=0,d="";!(c>=b/4);){var e=E[a+4*c>>2];if(0==e)break;
++c;65536<=e?(e-=65536,d+=String.fromCharCode(55296|e>>10,56320|e&1023)):d+=String.fromCharCode(e)}return d},Jb=(a,b,c)=>{c??=2147483647;if(4>c)return 0;var d=b;c=d+c-4;for(var e=0;e<a.length;++e){var h=a.charCodeAt(e);if(55296<=h&&57343>=h){var g=a.charCodeAt(++e);h=65536+((h&1023)<<10)|g&1023}E[b>>2]=h;b+=4;if(b+4>c)break}E[b>>2]=0;return b-d},Kb=a=>{for(var b=0,c=0;c<a.length;++c){var d=a.charCodeAt(c);55296<=d&&57343>=d&&++c;b+=4}return b},Lb=[null,[],[]],Mb=Array(256),Nb=0;256>Nb;++Nb)Mb[Nb]=
String.fromCharCode(Nb);Ia=Mb;M=k.BindingError=class extends Error{constructor(a){super(a);this.name="BindingError"}};N=k.InternalError=class extends Error{constructor(a){super(a);this.name="InternalError"}};
Object.assign(Ua.prototype,{isAliasOf:function(a){if(!(this instanceof Ua&&a instanceof Ua))return!1;var b=this.A.F.C,c=this.A.D;a.A=a.A;var d=a.A.F.C;for(a=a.A.D;b.H;)c=b.R(c),b=b.H;for(;d.H;)a=d.R(a),d=d.H;return b===d&&c===a},clone:function(){this.A.D||Ma(this);if(this.A.P)return this.A.count.value+=1,this;var a=T,b=Object,c=b.create,d=Object.getPrototypeOf(this),e=this.A;a=a(c.call(b,d,{A:{value:{count:e.count,N:e.N,P:e.P,D:e.D,F:e.F,G:e.G,I:e.I}}}));a.A.count.value+=1;a.A.N=!1;return a},["delete"](){this.A.D||
Ma(this);if(this.A.N&&!this.A.P)throw new M("Object already scheduled for deletion");Oa(this);var a=this.A;--a.count.value;0===a.count.value&&(a.G?a.I.L(a.G):a.F.C.L(a.D));this.A.P||(this.A.G=void 0,this.A.D=void 0)},isDeleted:function(){return!this.A.D},deleteLater:function(){this.A.D||Ma(this);if(this.A.N&&!this.A.P)throw new M("Object already scheduled for deletion");Q.push(this);1===Q.length&&R&&R(Ra);this.A.N=!0;return this}});k.getInheritedInstanceCount=()=>Object.keys(S).length;
k.getLiveInheritedInstances=()=>{var a=[],b;for(b in S)S.hasOwnProperty(b)&&a.push(S[b]);return a};k.flushPendingDeletes=Ra;k.setDelayFunction=a=>{R=a;Q.length&&R&&R(Ra)};
Object.assign(gb.prototype,{ba(a){this.Y&&(a=this.Y(a));return a},X(a){this.L?.(a)},argPackAdvance:8,readValueFromPointer:fb,fromWireType:function(a){function b(){return this.U?Ta(this.C.O,{F:this.ea,D:c,I:this,G:a}):Ta(this.C.O,{F:this,D:a})}var c=this.ba(a);if(!c)return this.X(a),null;var d=Sa(this.C,c);if(void 0!==d){if(0===d.A.count.value)return d.A.D=c,d.A.G=a,d.clone();d=d.clone();this.X(a);return d}d=this.C.aa(c);d=Qa[d];if(!d)return b.call(this);d=this.T?d.Z:d.pointerType;var e=Pa(c,this.C,
d.C);return null===e?b.call(this):this.U?Ta(d.C.O,{F:d,D:e,I:this,G:a}):Ta(d.C.O,{F:d,D:e})}});ob=k.UnboundTypeError=((a,b)=>{var c=Va(b,function(d){this.name=b;this.message=d;d=Error(d).stack;void 0!==d&&(this.stack=this.toString()+"\n"+d.replace(/^Error(:[^\n]*)?\n/,""))});c.prototype=Object.create(a.prototype);c.prototype.constructor=c;c.prototype.toString=function(){return void 0===this.message?this.name:`${this.name}: ${this.message}`};return c})(Error,"UnboundTypeError");
Y.push(0,1,void 0,1,null,1,!0,1,!1,1);k.count_emval_handles=()=>Y.length/2-5-yb.length;
var Pb={h:(a,b,c)=>{var d=new Fa(a);F[d.D+16>>2]=0;F[d.D+4>>2]=b;F[d.D+8>>2]=c;Ga=a;Ha++;throw Ga;},o:()=>{},l:(a,b,c,d)=>{b=J(b);O(a,{name:b,fromWireType:function(e){return!!e},toWireType:function(e,h){return h?c:d},argPackAdvance:8,readValueFromPointer:function(e){return this.fromWireType(C[e])},J:null})},k:(a,b,c,d,e,h,g,f,m,n,l,r,t)=>{l=J(l);h=U(e,h);f&&=U(g,f);n&&=U(m,n);t=U(r,t);var w=Ya(l);Xa(w,function(){rb(`Cannot construct ${l} due to unbound types`,[d])});P([a,b,c],d?[d]:[],u=>{u=u[0];
if(d){var z=u.C;var W=z.O}else W=Ua.prototype;u=Va(l,function(...Ba){if(Object.getPrototypeOf(this)!==Ca)throw new M("Use 'new' to construct "+l);if(void 0===A.M)throw new M(l+" has no accessible constructor");var jb=A.M[Ba.length];if(void 0===jb)throw new M(`Tried to invoke ctor of ${l} with invalid number of parameters (${Ba.length}) - expected (${Object.keys(A.M).toString()}) parameters instead!`);return jb.apply(this,Ba)});var Ca=Object.create(W,{constructor:{value:u}});u.prototype=Ca;var A=new Za(l,
u,Ca,t,z,h,f,n);if(A.H){var X;(X=A.H).W??(X.W=[]);A.H.W.push(A)}z=new gb(l,A,!0,!1,!1);X=new gb(l+"*",A,!1,!1,!1);W=new gb(l+" const*",A,!1,!0,!1);Qa[a]={pointerType:X,Z:W};hb(w,u);return[z,X,W]})},i:(a,b,c,d,e,h)=>{var g=sb(b,c);e=U(d,e);P([],[a],f=>{f=f[0];var m=`constructor ${f.name}`;void 0===f.C.M&&(f.C.M=[]);if(void 0!==f.C.M[b-1])throw new M(`Cannot register multiple constructors with identical number of parameters (${b-1}) for class '${f.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
f.C.M[b-1]=()=>{rb(`Cannot construct ${f.name} due to unbound types`,g)};P([],g,n=>{n.splice(1,0,null);f.C.M[b-1]=wb(m,n,null,e,h);return[]});return[]})},c:(a,b,c,d,e,h,g,f,m)=>{var n=sb(c,d);b=J(b);b=xb(b);h=U(e,h);P([],[a],l=>{function r(){rb(`Cannot call ${t} due to unbound types`,n)}l=l[0];var t=`${l.name}.${b}`;b.startsWith("@@")&&(b=Symbol[b.substring(2)]);f&&l.C.fa.push(b);var w=l.C.O,u=w[b];void 0===u||void 0===u.K&&u.className!==l.name&&u.S===c-2?(r.S=c-2,r.className=l.name,w[b]=r):(Wa(w,
b,t),w[b].K[c-2]=r);P([],n,z=>{z=wb(t,z,l,h,g,m);void 0===w[b].K?(z.S=c-2,w[b]=z):w[b].K[c-2]=z;return[]});return[]})},t:a=>O(a,zb),g:(a,b,c)=>{b=J(b);O(a,{name:b,fromWireType:d=>d,toWireType:(d,e)=>e,argPackAdvance:8,readValueFromPointer:Ab(b,c),J:null})},b:(a,b,c,d,e)=>{b=J(b);-1===e&&(e=4294967295);e=f=>f;if(0===d){var h=32-8*c;e=f=>f<<h>>>h}var g=b.includes("unsigned")?function(f,m){return m>>>0}:function(f,m){return m};O(a,{name:b,fromWireType:e,toWireType:g,argPackAdvance:8,readValueFromPointer:Bb(b,
c,0!==d),J:null})},a:(a,b,c)=>{function d(h){return new e(na.buffer,F[h+4>>2],F[h>>2])}var e=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array][b];c=J(c);O(a,{name:c,fromWireType:d,argPackAdvance:8,readValueFromPointer:d},{da:!0})},f:(a,b)=>{b=J(b);var c="std::string"===b;O(a,{name:b,fromWireType:function(d){var e=F[d>>2],h=d+4;if(c)for(var g=h,f=0;f<=e;++f){var m=h+f;if(f==e||0==C[m]){g=g?Db(C,g,m-g):"";if(void 0===n)var n=g;else n+=String.fromCharCode(0),
n+=g;g=m+1}}else{n=Array(e);for(f=0;f<e;++f)n[f]=String.fromCharCode(C[h+f]);n=n.join("")}V(d);return n},toWireType:function(d,e){e instanceof ArrayBuffer&&(e=new Uint8Array(e));var h,g="string"==typeof e;if(!(g||e instanceof Uint8Array||e instanceof Uint8ClampedArray||e instanceof Int8Array))throw new M("Cannot pass non-string to std::string");var f;if(c&&g)for(h=f=0;h<e.length;++h){var m=e.charCodeAt(h);127>=m?f++:2047>=m?f+=2:55296<=m&&57343>=m?(f+=4,++h):f+=3}else f=e.length;h=f;f=Ob(4+h+1);m=
f+4;F[f>>2]=h;if(c&&g){if(g=m,m=h+1,h=C,0<m){m=g+m-1;for(var n=0;n<e.length;++n){var l=e.charCodeAt(n);if(55296<=l&&57343>=l){var r=e.charCodeAt(++n);l=65536+((l&1023)<<10)|r&1023}if(127>=l){if(g>=m)break;h[g++]=l}else{if(2047>=l){if(g+1>=m)break;h[g++]=192|l>>6}else{if(65535>=l){if(g+2>=m)break;h[g++]=224|l>>12}else{if(g+3>=m)break;h[g++]=240|l>>18;h[g++]=128|l>>12&63}h[g++]=128|l>>6&63}h[g++]=128|l&63}}h[g]=0}}else if(g)for(g=0;g<h;++g){n=e.charCodeAt(g);if(255<n)throw V(m),new M("String has UTF-16 code units that do not fit in 8 bits");
C[m+g]=n}else for(g=0;g<h;++g)C[m+g]=e[g];null!==d&&d.push(V,f);return f},argPackAdvance:8,readValueFromPointer:fb,J(d){V(d)}})},d:(a,b,c)=>{c=J(c);if(2===b){var d=Fb;var e=Gb;var h=Hb;var g=f=>oa[f>>1]}else 4===b&&(d=Ib,e=Jb,h=Kb,g=f=>F[f>>2]);O(a,{name:c,fromWireType:f=>{for(var m=F[f>>2],n,l=f+4,r=0;r<=m;++r){var t=f+4+r*b;if(r==m||0==g(t))l=d(l,t-l),void 0===n?n=l:(n+=String.fromCharCode(0),n+=l),l=t+b}V(f);return n},toWireType:(f,m)=>{if("string"!=typeof m)throw new M(`Cannot pass non-string to C++ string type ${c}`);
var n=h(m),l=Ob(4+n+b);F[l>>2]=n/b;e(m,l+4,n+b);null!==f&&f.push(V,l);return l},argPackAdvance:8,readValueFromPointer:fb,J(f){V(f)}})},m:(a,b)=>{b=J(b);O(a,{ja:!0,name:b,argPackAdvance:0,fromWireType:()=>{},toWireType:()=>{}})},e:(a,b)=>{var c=L[a];if(void 0===c)throw a=`${"_emval_take_value"} has unknown type ${qb(a)}`,new M(a);a=c;a=a.readValueFromPointer(b);return db(a)},p:()=>{ka("")},s:(a,b,c)=>C.copyWithin(a,b,b+c),q:()=>{ka("OOM")},r:()=>52,n:function(){return 70},j:(a,b,c,d)=>{for(var e=0,
h=0;h<c;h++){var g=F[b>>2],f=F[b+4>>2];b+=8;for(var m=0;m<f;m++){var n=C[g+m],l=Lb[a];0===n||10===n?((1===a?ja:y)(Db(l,0)),l.length=0):l.push(n)}e+=f}F[d>>2]=e;return 0}},Z=function(){function a(c){Z=c.exports;la=Z.u;c=la.buffer;k.HEAP8=na=new Int8Array(c);k.HEAP16=D=new Int16Array(c);k.HEAPU8=C=new Uint8Array(c);k.HEAPU16=oa=new Uint16Array(c);k.HEAP32=E=new Int32Array(c);k.HEAPU32=F=new Uint32Array(c);k.HEAPF32=pa=new Float32Array(c);k.HEAPF64=qa=new Float64Array(c);kb=Z.y;sa.unshift(Z.v);G--;k.monitorRunDependencies?.(G);
0==G&&(null!==va&&(clearInterval(va),va=null),H&&(c=H,H=null,c()));return Z}var b={a:Pb};G++;k.monitorRunDependencies?.(G);if(k.instantiateWasm)try{return k.instantiateWasm(b,a)}catch(c){y(`Module.instantiateWasm callback failed with error: ${c}`),p(c)}Da(b,function(c){a(c.instance)}).catch(p);return{}}(),Ob=a=>(Ob=Z.w)(a),V=a=>(V=Z.x)(a),pb=a=>(pb=Z.z)(a);k.dynCall_jiji=(a,b,c,d,e)=>(k.dynCall_jiji=Z.B)(a,b,c,d,e);var Qb;H=function Rb(){Qb||Sb();Qb||(H=Rb)};
function Sb(){function a(){if(!Qb&&(Qb=!0,k.calledRun=!0,!ma)){Ea(sa);aa(k);if(k.onRuntimeInitialized)k.onRuntimeInitialized();if(k.postRun)for("function"==typeof k.postRun&&(k.postRun=[k.postRun]);k.postRun.length;){var b=k.postRun.shift();ta.unshift(b)}Ea(ta)}}if(!(0<G)){if(k.preRun)for("function"==typeof k.preRun&&(k.preRun=[k.preRun]);k.preRun.length;)ua();Ea(ra);0<G||(k.setStatus?(k.setStatus("Running..."),setTimeout(function(){setTimeout(function(){k.setStatus("")},1);a()},1)):a())}}
if(k.preInit)for("function"==typeof k.preInit&&(k.preInit=[k.preInit]);0<k.preInit.length;)k.preInit.pop()();Sb();


  return moduleArg.ready
}
);
})();
if (typeof exports === 'object' && typeof module === 'object')
  module.exports = Module_KISS;
else if (typeof define === 'function' && define['amd'])
  define([], () => Module_KISS);

export default Module_KISS;
