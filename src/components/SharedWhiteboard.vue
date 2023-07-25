<template>
  <div style="overflow: hidden; width: 100vw; height: 100vh;">
    <div :style="{ width: canvasSize + 'px', height: canvasSize + 'px', position: 'relative' }">
      <canvas
        ref="canvas"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        v-on:touchstart.prevent.stop="onTouchStart"
        v-on:touchmove.prevent.stop="onTouchMove"
        v-on:touchend="onTouchEnd"
        @contextmenu.prevent="startPanning"
        :style="{ cursor: eraser ? 'default' : 'crosshair', touchAction: 'none', transform: `translate(${offsetX}px, ${offsetY}px)` }"
      ></canvas>
    </div>

    <div class="toolbar" id="toolbar">
      <button
        v-for="size in [1, 2, 5, 10, 20]"
        :key="size"
        @click="penSize = size"
        :class="{ active: !eraser && penSize === size }"
      >
        {{ size }}
      </button>
      <button @click="eraser = !eraser" :class="{ active: eraser }">Eraser</button>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client';

export default {
  data() {
    return {
      socket: null,
      canvas: null,
      context: null,
      drawing: false,
      penSize: 1,
      eraser: false,
      initialLoad: true,
      lastX: 0,
      lastY: 0,
      offsetX: 0,
      offsetY: 0,
      startOffsetX: 0,
      startOffsetY: 0,
      panning: false,
      touchStartDistance: 0,
      touchStartOffsetX: 0,
      touchStartOffsetY: 0,
      canvasSize: window.innerWidth < 768 ? 2000 : 4000, // Adjust the canvas size for mobile devices
    };
  },
  methods: {
    getMousePos(e) {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
      const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    startDrawing(e) {
      if (e.touches && e.touches.length === 2) {
        this.startPanning(e);
        return;
      }

      if (e.button === 2 || this.panning) return;
      this.drawing = true;
      const { x, y } = this.getMousePos(e);
      this.lastX = x;
      this.lastY = y;
      this.drawLine(x, y, x, y, this.penSize, true, this.eraser);
    },
    draw(e) {
      if (!this.drawing) return;
      const { x, y } = this.getMousePos(e);
      this.drawLine(this.lastX, this.lastY, x, y, this.penSize, true, this.eraser);
      this.lastX = x;
      this.lastY = y;
    },
    stopDrawing() {
      this.drawing = false;
      this.panning = false;
    },
    drawLine(startX, startY, endX, endY, penSize, emit = true, isEraser = false) {
      this.context.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
      this.context.lineWidth = penSize;
      this.context.lineCap = 'round';
      this.context.beginPath();
      this.context.moveTo(startX, startY);
      this.context.lineTo(endX, endY);
      this.context.stroke();
      this.context.closePath();

      if (!emit) {
        return;
      }

      this.socket.emit('draw', {
        startX,
        startY,
        endX,
        endY,
        penSize,
        isEraser,
      });
    },
    startPanning(e) {
      if ((e.touches && e.touches.length === 2) || e.button === 2) {
        this.panning = true;
        this.drawing = false;
        if (e.touches && e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          this.touchStartDistance = Math.sqrt(dx * dx + dy * dy);
          this.touchStartOffsetX = this.offsetX;
          this.touchStartOffsetY = this.offsetY;
        } else {
          this.startOffsetX = this.offsetX;
          this.startOffsetY = this.offsetY;
          this.lastX = e.touches ? (e.touches[0].clientX + e.touches[1].clientX) / 2 : e.clientX;
          this.lastY = e.touches ? (e.touches[0].clientY + e.touches[1].clientY) / 2 : e.clientY;
        }
      }
    },
    pan(e) {
      if (!this.panning || (e.touches && e.touches.length < 2)) return;
      const x = e.touches ? (e.touches[0].clientX + e.touches[1].clientX) / 2 : e.clientX;
      const y = e.touches ? (e.touches[0].clientY + e.touches[1].clientY) / 2 : e.clientY;
      const offsetX = this.startOffsetX + (x - this.lastX);
      const offsetY = this.startOffsetY + (y - this.lastY);
      const maxOffsetX = Math.max(0, this.canvasSize - window.innerWidth);
      const maxOffsetY = Math.max(0, this.canvasSize - window.innerHeight);
      this.offsetX = Math.min(0, Math.min(maxOffsetX, offsetX));
      this.offsetY = Math.min(0, Math.min(maxOffsetY, offsetY));
    },
    onTouchStart(e) {
      if (e.touches.length === 2) {
        this.startPanning(e);
      } else {
        this.startDrawing(e);
      }
    },
    onTouchMove(e) {
      if (e.touches.length === 2) {
        this.pan(e);
      } else {
        this.draw(e);
      }
    },
    onTouchEnd() {
      this.stopDrawing();
    },
  },
  mounted() {
    this.socket = io('https://doodle-api.barkle.chat');
    this.socket.on('draw', (data) => {
      this.drawLine(data.startX, data.startY, data.endX, data.endY, data.penSize, false, data.isEraser);
    });

    if (this.initialLoad) {
      this.socket.on('load', (data) => {
        for (const line of data) {
          this.drawLine(line.startX, line.startY, line.endX, line.endY, line.penSize, false, line.isEraser);
        }
        this.initialLoad = false;
      });
      this.socket.emit('load');
    }

    this.canvas = this.$refs.canvas;
    this.context = this.canvas.getContext('2d');
    this.canvas.width = this.canvasSize;
    this.canvas.height = this.canvasSize;

    window.addEventListener('resize', () => {
      this.canvasSize = window.innerWidth < 768 ? 2000 : 4000;
      this.canvas.width = this.canvasSize;
      this.canvas.height = this.canvasSize;
    });

    // Remove the previous event listener to avoid duplicate touchmove events
    this.canvas.removeEventListener('touchmove', this.onTouchMove);
    this.canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
  },
};
</script>

<style scoped>
canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  
}
.toolbar {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 2;
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
button {
  border: none;
  padding: 10px;
  border-radius: 5px;
  background: #ddd;
  font-size: 1rem;
}
button.active {
  background-color: #bbb;
}
</style>
