import {rgba} from './utils.js';

export class UI {
  constructor(canvas){
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.roi = null; this._drawing=false; this._points=[]; this.drift={vx:0,vy:0,mag:0};
    this.hud = document.getElementById('hud');
  }
  beginDrawROI(){ this._drawing=true; this._points=[]; this.roi=null; }
  cancelROI(){ this._drawing=false; this._points=[]; this.roi=null; }
  attachInteraction(){
    const cnv = this.canvas;
    const getRel = (e) => {
      const rect = cnv.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      return {x: Math.max(0,Math.min(1,x)), y: Math.max(0,Math.min(1,y))};
    };
    cnv.addEventListener('click', (e)=>{ if (!this._drawing) return; this._points.push(getRel(e)); });
    cnv.addEventListener('dblclick', (e)=>{ if (!this._drawing) return; if (this._points.length>=3){ this.roi = this._points.slice(); this._drawing=false; }});
  }
  showAlertHUD(last, drift){
    const dir = Math.atan2(drift.vy, drift.vx);
    const deg = Math.round(dir*180/Math.PI);
    const text = `ALLERTA • Ultimo punto (${Math.round(last.c.cx)}, ${Math.round(last.c.cy)}) • Deriva ≈ ${deg}°`;
    this.hud.textContent = text; this.hud.style.display='flex';
    clearTimeout(this._hudTO); this._hudTO = setTimeout(()=> this.hud.style.display='none', 6000);
  }
  draw(frameW, frameH, tracks, fps){
    const ctx = this.ctx;
    const w = this.canvas.width = this.canvas.clientWidth;
    const h = this.canvas.height = this.canvas.clientHeight;
    ctx.clearRect(0,0,w,h);

    if (this.roi && this.roi.length>=3){
      ctx.save();
      ctx.beginPath();
      const p0 = this.roi[0]; ctx.moveTo(p0.x*w, p0.y*h);
      for (let i=1;i<this.roi.length;i++){ const p = this.roi[i]; ctx.lineTo(p.x*w, p.y*h); }
      ctx.closePath();
      ctx.fillStyle = rgba(30,144,255,0.15); ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = rgba(30,144,255,0.9); ctx.stroke();
      ctx.restore();
    }

    for (const tr of tracks){
      const bb = tr.bbox; if (!bb) continue;
      const x = bb.x / frameW * w, y = bb.y / frameH * h;
      const wd = bb.w / frameW * w, ht = bb.h / frameH * h;
      let color = [46,213,115];
      if (tr.state==='PREALERT' || tr.state==='LOST_SHORT') color = [255,165,2];
      if (tr.state==='ALERT') color = [255,71,87];
      ctx.save();
      ctx.lineWidth = 2; ctx.strokeStyle = rgba(color[0],color[1],color[2],0.95);
      ctx.strokeRect(x,y,wd,ht);
      ctx.fillStyle = rgba(0,0,0,0.4);
      ctx.fillRect(x, y-36, 220, 34);
      ctx.fillStyle = rgba(255,255,255,0.95);
      ctx.font = "12px system-ui, -apple-system, sans-serif";
      ctx.fillText(`ID ${tr.id} • ${tr.state}`, x+4, y-20);
      ctx.fillText(`poseRisk: ${(tr.poseRisk||0).toFixed(2)}`, x+4, y-6);
      if (tr.history && tr.history.length>0){
        const last = tr.history[tr.history.length-1];
        ctx.beginPath(); ctx.arc(last.c.cx/frameW*w, last.c.cy/frameH*h, 4, 0, Math.PI*2);
        ctx.fillStyle = rgba(255,255,255,0.9); ctx.fill();
        const scale = 20;
        ctx.beginPath(); ctx.moveTo(last.c.cx/frameW*w, last.c.cy/frameH*h);
        ctx.lineTo(last.c.cx/frameW*w + this.drift.vx*scale, last.c.cy/frameH*h + this.drift.vy*scale);
        ctx.strokeStyle = rgba(255,255,255,0.7); ctx.stroke();
      }
      ctx.restore();
    }
  }
}
