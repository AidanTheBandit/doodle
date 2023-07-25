<template>
  <div>
    <div class="toolbar" id="toolbar">
      <button
        v-for="size in [1, 2, 5, 10, 20]"
        :key="size"
        @click="penSize = size"
        :class="{ active: !eraser && penSize === size }"
        class="pen-size-btn"
      >
        {{ size }}
      </button>
      <button
        @click="eraser = !eraser"
        :class="{ active: eraser }"
        class="eraser-btn"
      >
        Eraser
      </button>
    </div>
    <canvas
      ref="canvas"
      @mousedown="startDrawing"
      @mousemove="draw"
      @mouseup="stopDrawing"
    ></canvas>
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
      startX: 0,
      startY: 0,
      eraser: false,
      initialLoad: true
    };
  },
  methods: {
    startDrawing(e) {
      this.drawing = true;
      this.startX = e.clientX;
      this.startY = e.clientY - 30;
    },
    draw(e) {
      if (!this.drawing) return;
      const endX = e.clientX;
      const endY = e.clientY - 30;
      this.drawLine(this.startX, this.startY, endX, endY, this.penSize, true, this.eraser);
      this.startX = endX;
      this.startY = endY;
    },
    stopDrawing() {
      if (!this.drawing) return;
      this.drawing = false;
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
        startX: startX,
        startY: startY,
        endX: endX,
        endY: endY,
        penSize: penSize,
        isEraser: isEraser
      });
    }
  },
  mounted() {
    this.socket = io('https://doodle-api.barkle.chat');
    this.socket.on('draw', (data) => {
      this.drawLine(data.startX, data.startY, data.endX, data.endY, data.penSize, false, data.isEraser);
    });
    if (this.initialLoad) {
      this.socket.on('load', (data) => {
        for (let line of data) {
          this.drawLine(line.startX, line.startY, line.endX, line.endY, line.penSize, false, line.isEraser);
        }
        this.initialLoad = false;
      });
      this.socket.emit('load');
    }
    this.canvas = this.$refs.canvas;
    this.context = this.canvas.getContext('2d');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    });
  }
};
</script>

<style scoped>
#toolbar {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  padding: 10px;
  background-color: #f1f1f1;
}

.pen-size-btn {
  cursor: pointer;
  border: none;
  background-color: transparent;
  color: #333;
  font-size: 16px;
  padding: 8px 12px;
  margin-right: 10px;
  border-radius: 8px;
}

.pen-size-btn.active {
  background-color: #3490dc;
  color: #fff;
}

.eraser-btn {
  cursor: pointer;
  border: none;
  background-color: transparent;
  color: #333;
  font-size: 16px;
  padding: 8px 12px;
  border-radius: 8px;
}

.eraser-btn.active {
  background-color: #3490dc;
  color: #fff;
}

canvas {
  position: absolute;
  top: 40px;
  left: 0;
  border: 1px solid #ccc;
}
</style>
