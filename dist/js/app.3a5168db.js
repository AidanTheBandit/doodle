(function(){"use strict";var t={5389:function(t,e,n){var i=n(9242),s=n(3396);const o={id:"app"};function a(t,e,n,i,a,r){const h=(0,s.up)("SharedWhiteboard");return(0,s.wg)(),(0,s.iD)("div",o,[(0,s.Wm)(h)])}var r=n(7139);const h={style:{overflow:"hidden",width:"100vw",height:"100vh"}},c={class:"toolbar",id:"toolbar"},u=["onClick"];function l(t,e,n,o,a,l){return(0,s.wg)(),(0,s.iD)("div",h,[(0,s._)("div",{style:(0,r.j5)({width:a.canvasSize+"px",height:a.canvasSize+"px",position:"relative"})},[(0,s._)("canvas",{ref:"canvas",onMousedown:e[0]||(e[0]=(...t)=>l.startDrawing&&l.startDrawing(...t)),onMousemove:e[1]||(e[1]=(...t)=>l.draw&&l.draw(...t)),onMouseup:e[2]||(e[2]=(...t)=>l.stopDrawing&&l.stopDrawing(...t)),onMouseleave:e[3]||(e[3]=(...t)=>l.stopDrawing&&l.stopDrawing(...t)),onTouchstart:e[4]||(e[4]=(0,i.iM)(((...t)=>l.onTouchStart&&l.onTouchStart(...t)),["prevent","stop"])),onTouchmove:e[5]||(e[5]=(0,i.iM)(((...t)=>l.onTouchMove&&l.onTouchMove(...t)),["prevent","stop"])),onTouchend:e[6]||(e[6]=(...t)=>l.onTouchEnd&&l.onTouchEnd(...t)),onContextmenu:e[7]||(e[7]=(0,i.iM)(((...t)=>l.startPanning&&l.startPanning(...t)),["prevent"])),style:(0,r.j5)({cursor:a.eraser?"default":"crosshair",touchAction:"none",transform:`translate(${a.offsetX}px, ${a.offsetY}px)`})},null,36)],4),(0,s._)("div",c,[((0,s.wg)(),(0,s.iD)(s.HY,null,(0,s.Ko)([1,2,5,10,20],(t=>(0,s._)("button",{key:t,onClick:e=>a.penSize=t,class:(0,r.C_)({active:!a.eraser&&a.penSize===t})},(0,r.zw)(t),11,u))),64)),(0,s._)("button",{onClick:e[8]||(e[8]=t=>a.eraser=!a.eraser),class:(0,r.C_)({active:a.eraser})},"Eraser",2)])])}var f=n(7851),d={data(){return{socket:null,canvas:null,context:null,drawing:!1,penSize:1,eraser:!1,initialLoad:!0,lastX:0,lastY:0,offsetX:0,offsetY:0,startOffsetX:0,startOffsetY:0,panning:!1,touchStartDistance:0,touchStartOffsetX:0,touchStartOffsetY:0,canvasSize:window.innerWidth<768?2e3:4e3}},methods:{getMousePos(t){const e=this.canvas.getBoundingClientRect(),n=t.type.startsWith("touch")?t.touches[0].clientX:t.clientX,i=t.type.startsWith("touch")?t.touches[0].clientY:t.clientY;return{x:n-e.left,y:i-e.top}},startDrawing(t){if(t.touches&&2===t.touches.length)return void this.startPanning(t);if(2===t.button||this.panning)return;this.drawing=!0;const{x:e,y:n}=this.getMousePos(t);this.lastX=e,this.lastY=n,this.drawLine(e,n,e,n,this.penSize,!0,this.eraser)},draw(t){if(!this.drawing)return;const{x:e,y:n}=this.getMousePos(t);this.drawLine(this.lastX,this.lastY,e,n,this.penSize,!0,this.eraser),this.lastX=e,this.lastY=n},stopDrawing(){this.drawing=!1,this.panning=!1},drawLine(t,e,n,i,s,o=!0,a=!1){this.context.globalCompositeOperation=a?"destination-out":"source-over",this.context.lineWidth=s,this.context.lineCap="round",this.context.beginPath(),this.context.moveTo(t,e),this.context.lineTo(n,i),this.context.stroke(),this.context.closePath(),o&&this.socket.emit("draw",{startX:t,startY:e,endX:n,endY:i,penSize:s,isEraser:a})},startPanning(t){if(t.touches&&2===t.touches.length||2===t.button)if(this.panning=!0,this.drawing=!1,t.touches&&2===t.touches.length){const e=t.touches[0].clientX-t.touches[1].clientX,n=t.touches[0].clientY-t.touches[1].clientY;this.touchStartDistance=Math.sqrt(e*e+n*n),this.touchStartOffsetX=this.offsetX,this.touchStartOffsetY=this.offsetY}else this.startOffsetX=this.offsetX,this.startOffsetY=this.offsetY,this.lastX=t.touches?(t.touches[0].clientX+t.touches[1].clientX)/2:t.clientX,this.lastY=t.touches?(t.touches[0].clientY+t.touches[1].clientY)/2:t.clientY},pan(t){if(!this.panning||t.touches&&t.touches.length<2)return;const e=t.touches?(t.touches[0].clientX+t.touches[1].clientX)/2:t.clientX,n=t.touches?(t.touches[0].clientY+t.touches[1].clientY)/2:t.clientY,i=this.startOffsetX+(e-this.lastX),s=this.startOffsetY+(n-this.lastY),o=Math.max(0,this.canvasSize-window.innerWidth),a=Math.max(0,this.canvasSize-window.innerHeight);this.offsetX=Math.min(0,Math.min(o,i)),this.offsetY=Math.min(0,Math.min(a,s))},onTouchStart(t){2===t.touches.length?this.startPanning(t):this.startDrawing(t)},onTouchMove(t){2===t.touches.length?this.pan(t):this.draw(t)},onTouchEnd(){this.stopDrawing()}},mounted(){this.socket=(0,f.ZP)("https://doodle-api.barkle.chat"),this.socket.on("draw",(t=>{this.drawLine(t.startX,t.startY,t.endX,t.endY,t.penSize,!1,t.isEraser)})),this.initialLoad&&(this.socket.on("load",(t=>{for(const e of t)this.drawLine(e.startX,e.startY,e.endX,e.endY,e.penSize,!1,e.isEraser);this.initialLoad=!1})),this.socket.emit("load")),this.canvas=this.$refs.canvas,this.context=this.canvas.getContext("2d"),this.canvas.width=this.canvasSize,this.canvas.height=this.canvasSize,window.addEventListener("resize",(()=>{this.canvasSize=window.innerWidth<768?2e3:4e3,this.canvas.width=this.canvasSize,this.canvas.height=this.canvasSize})),this.canvas.removeEventListener("touchmove",this.onTouchMove),this.canvas.addEventListener("touchmove",this.onTouchMove,{passive:!1})}},v=n(89);const p=(0,v.Z)(d,[["render",l],["__scopeId","data-v-9e2b37ba"]]);var g=p,w={components:{SharedWhiteboard:g}};const S=(0,v.Z)(w,[["render",a]]);var Y=S;(0,i.ri)(Y).mount("#app")}},e={};function n(i){var s=e[i];if(void 0!==s)return s.exports;var o=e[i]={exports:{}};return t[i].call(o.exports,o,o.exports,n),o.exports}n.m=t,function(){var t=[];n.O=function(e,i,s,o){if(!i){var a=1/0;for(u=0;u<t.length;u++){i=t[u][0],s=t[u][1],o=t[u][2];for(var r=!0,h=0;h<i.length;h++)(!1&o||a>=o)&&Object.keys(n.O).every((function(t){return n.O[t](i[h])}))?i.splice(h--,1):(r=!1,o<a&&(a=o));if(r){t.splice(u--,1);var c=s();void 0!==c&&(e=c)}}return e}o=o||0;for(var u=t.length;u>0&&t[u-1][2]>o;u--)t[u]=t[u-1];t[u]=[i,s,o]}}(),function(){n.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return n.d(e,{a:e}),e}}(),function(){n.d=function(t,e){for(var i in e)n.o(e,i)&&!n.o(t,i)&&Object.defineProperty(t,i,{enumerable:!0,get:e[i]})}}(),function(){n.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"===typeof window)return window}}()}(),function(){n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)}}(),function(){n.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}}(),function(){var t={143:0};n.O.j=function(e){return 0===t[e]};var e=function(e,i){var s,o,a=i[0],r=i[1],h=i[2],c=0;if(a.some((function(e){return 0!==t[e]}))){for(s in r)n.o(r,s)&&(n.m[s]=r[s]);if(h)var u=h(n)}for(e&&e(i);c<a.length;c++)o=a[c],n.o(t,o)&&t[o]&&t[o][0](),t[o]=0;return n.O(u)},i=self["webpackChunkdoodle"]=self["webpackChunkdoodle"]||[];i.forEach(e.bind(null,0)),i.push=e.bind(null,i.push.bind(i))}();var i=n.O(void 0,[998],(function(){return n(5389)}));i=n.O(i)})();
//# sourceMappingURL=app.3a5168db.js.map