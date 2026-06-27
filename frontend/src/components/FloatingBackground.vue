<template>
  <div class="floating-bg" aria-hidden="true">
    <div class="food" aria-hidden="true">🥗</div>
    <div class="food" aria-hidden="true">🍎</div>
    <div class="food" aria-hidden="true">🥑</div>
    <div class="food" aria-hidden="true">📦</div>
    <div class="food" aria-hidden="true">🎟️</div>
  </div>
</template>

<style scoped>
.floating-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: -1;
}

.food {
  position: absolute;
  font-size: clamp(40px, 8vw, 80px);
  opacity: 0.05;
  animation: float 12s infinite ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  .food {
    animation: none;
  }
}

.food:nth-child(1) {
  top: 10%;
  left: 10%;
}

.food:nth-child(2) {
  top: 25%;
  right: 15%;
}

.food:nth-child(3) {
  bottom: 20%;
  left: 15%;
}

.food:nth-child(4) {
  bottom: 10%;
  right: 10%;
}

.food:nth-child(5) {
  top: 60%;
  left: 50%;
}

@keyframes float {
  50% {
    transform: translateY(-25px) rotate(5deg);
  }
}
</style>
