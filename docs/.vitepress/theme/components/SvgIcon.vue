<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: [String, Number], default: 24 },
  color: { type: String, default: 'currentColor' },
})

// SVG path data for each icon (Lucide-compatible, 24x24 viewBox, stroke-based)
const icons = {
  // Audience groups
  'school': 'M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z',
  'rocket': 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z',
  'briefcase': 'M20 7H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2',
  // Features
  'message-circle': 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  'map': 'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zm7-4v16m8-12v16',
  'clipboard-list': 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 2h6a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2zm-1 8h8m-8 4h8m-8 4h4',
  'play-circle': 'M22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0zm-10 4.5 7-4.5-7-4.5v9z',
  'bar-chart': 'M18 20V10m-6 10V4M6 20v-6',
  // Lock / check
  'lock': 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4',
  'check': 'M20 6 9 17l-5-5',
  'check-circle': 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3',
  // Other
  'lightbulb': 'M9 18h6m-3-9a3 3 0 0 0-3 3 5 5 0 0 0 1.47 3.47A3 3 0 0 1 11 18M15 12a3 3 0 0 0-3-3m3 3a3 3 0 0 1-1.47 2.47A3 3 0 0 0 13 18m3-6c0-1.66-1.34-3-3-3s-3 1.34-3 3',
  'target': 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-6a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  'settings': 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.5-1.5a8.5 8.5 0 0 1-.17 1.7l1.84 1.44a.44.44 0 0 1 .1.56l-1.74 3.01a.44.44 0 0 1-.54.19l-2.17-.87a8.7 8.7 0 0 1-1.47.85l-.33 2.3a.43.43 0 0 1-.43.37h-3.48a.43.43 0 0 1-.43-.37l-.33-2.3a8.7 8.7 0 0 1-1.47-.85l-2.17.87a.44.44 0 0 1-.54-.19L2.83 17.2a.44.44 0 0 1 .1-.56l1.84-1.44A8.5 8.5 0 0 1 4.5 13.5v-.5c0-.4.03-.8.17-1.7L2.83 9.86a.44.44 0 0 1-.1-.56l1.74-3a.44.44 0 0 1 .54-.2l2.17.88a8.7 8.7 0 0 1 1.47-.85l.33-2.3A.43.43 0 0 1 9.41 3.5h3.48a.43.43 0 0 1 .43.37l.33 2.3a8.7 8.7 0 0 1 1.47.85l2.17-.87a.44.44 0 0 1 .54.19l1.74 3a.44.44 0 0 1-.1.56l-1.84 1.44c.14.9.17 1.3.17 1.69v.42z',
  'cloud': 'M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z',
  'layers': 'M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  // Tech / appendix icons
  'monitor': 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 0v12m16-12v12M8 20h8',
  'tool': 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  'globe': 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  'cpu': 'M9 3H6a3 3 0 0 0-3 3v3m0 6v3a3 3 0 0 0 3 3h3m6 0h3a3 3 0 0 0 3-3v-3m0-6V6a3 3 0 0 0-3-3h-3M9 9h6v6H9V9zm-3-6v2m6-2v2m6-2v2m2 3h-2m2 6h-2m2 6h-2M6 21v-2m6 2v-2m6 2v-2M3 9H5m-2 6H5',
  'database': 'M12 2a9 3 0 0 0-9 3v14a9 3 0 0 0 18 0V5a9 3 0 0 0-9-3zm9 3v.01M3 5v.01M3 12h18m-18 7h18',
  'package': 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12',
  'robot': 'M12 2a2 2 0 0 1 2 2v1h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2V4a2 2 0 0 1 2-2zm-3 9a1 1 0 0 0 0 2 1 1 0 0 0 0-2zm6 0a1 1 0 0 0 0 2 1 1 0 0 0 0-2zm-3 5a4 4 0 0 0 3.46-2h-6.92A4 4 0 0 0 12 16z',
  'sparkles': 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364-.707-.707M6.343 6.343l-.707-.707m12.728 0-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z',
  'file': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 2v6h6',
  'map-pin': 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  // Arrow
  'arrow-right': 'M5 12h14m-7-7 7 7-7 7',
}
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    :stroke="color"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="svg-icon"
    aria-hidden="true"
  >
    <path v-if="icons[name]" :d="icons[name]" />
    <!-- fallback: circle -->
    <circle v-else cx="12" cy="12" r="10" />
  </svg>
</template>

<style scoped>
.svg-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>
