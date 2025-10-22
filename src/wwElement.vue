<template>
  <div ref="mapContainer" class="leaflet-map-container" :style="containerStyle"></div>
</template>

<script>
export default {
  name: 'LeafletMap',
  props: {
    center: {
      type: Array,
      default: () => [51.505, -0.09], // [latitude, longitude]
    },
    zoom: {
      type: Number,
      default: 13,
    },
    markers: {
      type: Array,
      default: () => [],
      // Expected format: [{ lat: number, lng: number, popup?: string, icon?: string }]
    },
    height: {
      type: String,
      default: '400px',
    },
    width: {
      type: String,
      default: '100%',
    },
    tileLayer: {
      type: String,
      default: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    },
    attribution: {
      type: String,
      default: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    scrollWheelZoom: {
      type: Boolean,
      default: true,
    },
    dragging: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      map: null,
      markerInstances: [],
    };
  },
  computed: {
    containerStyle() {
      return {
        height: this.height,
        width: this.width,
      };
    },
  },
  mounted() {
    this.initMap();
  },
  beforeUnmount() {
    if (this.map) {
      this.map.remove();
    }
  },
  watch: {
    center: {
      handler(newCenter) {
        if (this.map) {
          this.map.setView(newCenter, this.zoom);
        }
      },
      deep: true,
    },
    zoom(newZoom) {
      if (this.map) {
        this.map.setZoom(newZoom);
      }
    },
    markers: {
      handler() {
        this.updateMarkers();
      },
      deep: true,
    },
  },
  methods: {
    async initMap() {
      // Load Leaflet CSS and JS if not already loaded
      await this.loadLeaflet();

      // Initialize the map
      this.map = L.map(this.$refs.mapContainer, {
        scrollWheelZoom: this.scrollWheelZoom,
        dragging: this.dragging,
      }).setView(this.center, this.zoom);

      // Add tile layer
      L.tileLayer(this.tileLayer, {
        attribution: this.attribution,
        maxZoom: 19,
      }).addTo(this.map);

      // Add markers
      this.updateMarkers();

      // Emit map ready event
      this.$emit('map-ready', this.map);
    },
    async loadLeaflet() {
      // Check if Leaflet is already loaded
      if (window.L) return;

      // Load Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);

      // Load Leaflet JS
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    },
    updateMarkers() {
      if (!this.map) return;

      // Remove existing markers
      this.markerInstances.forEach(marker => marker.remove());
      this.markerInstances = [];

      // Add new markers
      this.markers.forEach(markerData => {
        const marker = L.marker([markerData.lat, markerData.lng]);
        
        if (markerData.popup) {
          marker.bindPopup(markerData.popup);
        }
        
        marker.addTo(this.map);
        this.markerInstances.push(marker);

        // Emit marker click event
        marker.on('click', () => {
          this.$emit('marker-click', markerData);
        });
      });
    },
    // Public methods that can be called from outside
    flyTo(latlng, zoom) {
      if (this.map) {
        this.map.flyTo(latlng, zoom || this.zoom);
      }
    },
    addMarker(markerData) {
      const newMarkers = [...this.markers, markerData];
      this.$emit('update:markers', newMarkers);
    },
    removeMarker(index) {
      const newMarkers = this.markers.filter((_, i) => i !== index);
      this.$emit('update:markers', newMarkers);
    },
  },
};
</script>

<style scoped>
.leaflet-map-container {
  position: relative;
  z-index: 0;
}
</style>