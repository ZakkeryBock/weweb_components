<template>
<div class="leaflet-map-wrapper">
<div v-if="showDebug" class="debug-panel">
<button @click="showDebug = false" class="close-debug">×</button>
<p><strong>Map Status:</strong></p>
<p>Loaded: {{ leafletLoaded ? '✓' : '✗' }}</p>
<p>Map: {{ map ? '✓' : '✗' }}</p>
<p>Stops: {{ stops.length }}</p>
<p>Has Route: {{ hasRoute ? '✓' : '✗' }}</p>
<p>Service: {{ routingService }}</p>
<p v-if="routingWarning" style="color: orange;"><strong>⚠️ {{ routingWarning }}</strong></p>
<p v-if="isLoadingRoute">Loading route...</p>
<p v-if="routeError" style="color: red;">{{ routeError }}</p>
<p v-if="routeData">
<strong>Distance:</strong> {{ routeData.distance }} mi<br>
<strong>Duration:</strong> {{ routeData.duration }}<br>
<strong>Fuel Cost:</strong> ${{ routeData.fuelCost }}<br>
<strong>Fuel Used:</strong> {{ routeData.fuelUsed }} gal<br>
<strong>Toll Cost:</strong> ${{ routeData.tollCost }}
</p>
</div>

<div v-if="isLoadingRoute" class="loading-overlay">
<div class="loading-spinner">Loading route...</div>
</div>

<div ref="mapContainer" class="leaflet-map-container" :style="containerStyle"></div>
</div>
</template>

<script>
export default {
props: {
content: { 
type: Object, 
required: true 
},
uid: { 
type: String, 
required: true 
}
},
emits: ['trigger-event'],
setup(props) {
// Expose all internal variables using wwLib.wwVariable.useComponentVariable
const { value: distance, setValue: setDistance } = wwLib.wwVariable.useComponentVariable({
uid: props.uid,
name: 'distance',
type: 'number',
defaultValue: 0
});

const { value: duration, setValue: setDuration } = wwLib.wwVariable.useComponentVariable({
uid: props.uid,
name: 'duration',
type: 'number',
defaultValue: 0
});

const { value: fuelCost, setValue: setFuelCost } = wwLib.wwVariable.useComponentVariable({
uid: props.uid,
name: 'fuelCost',
type: 'number',
defaultValue: 0
});

const { value: tollCost, setValue: setTollCost } = wwLib.wwVariable.useComponentVariable({
uid: props.uid,
name: 'tollCost',
type: 'number',
defaultValue: 0
});

const { value: totalCost, setValue: setTotalCost } = wwLib.wwVariable.useComponentVariable({
uid: props.uid,
name: 'totalCost',
type: 'number',
defaultValue: 0
});

const { value: fuelUsed, setValue: setFuelUsed } = wwLib.wwVariable.useComponentVariable({
uid: props.uid,
name: 'fuelUsed',
type: 'number',
defaultValue: 0
});

return {
distance,
setDistance,
duration,
setDuration,
fuelCost,
setFuelCost,
tollCost,
setTollCost,
totalCost,
setTotalCost,
fuelUsed,
setFuelUsed
};
},
data() {
return {
map: null,
markerInstances: [],
routePolyline: null,
routeData: null,
leafletLoaded: false,
showDebug: true,
isLoadingRoute: false,
routeError: null,
routingWarning: null
}
},
computed: {
containerStyle() {
return {
height: this.content.height || '400px',
width: this.content.width || '100%'
}
},
stops() {
return this.content.stops || []
},
hasRoute() {
return this.stops.length > 1
},
routeColor() {
return this.content.routeColor || '#3388ff'
},
routeWeight() {
return this.content.routeWeight || 4
},
markerColor() {
return this.content.markerColor || 'blue'
},
autoFit() {
return this.content.autoFit !== false
},
routingService() {
return this.content.routingService || 'osrm'
},
routingApiKey() {
return this.content.routingApiKey || ''
},
truckMPG() {
return this.content.truckMPG || 6.5
},
fuelPricePerGallon() {
return this.content.fuelPricePerGallon || 3.50
},
tollsApiKey() {
return this.content.tollsApiKey || ''
},
includeTolls() {
return this.content.includeTolls !== false
},
truckProfile() {
return this.content.truckProfile || 'truck'
},
truckWeight() {
return this.content.truckWeight || 40000
},
truckHeight() {
return this.content.truckHeight || 13.5
},
truckWidth() {
return this.content.truckWidth || 8.5
},
truckLength() {
return this.content.truckLength || 53
},
avoidTolls() {
return this.content.avoidTolls === true
},
avoidHighways() {
return this.content.avoidHighways === true
}
},
mounted() {
console.log('Map component mounted')
this.$nextTick(() => {
setTimeout(() => {
this.initMap()
}, 100)
})
},
beforeUnmount() {
if (this.map) {
this.map.remove()
}
},
watch: {
stops: {
handler(newStops) {
console.log('Stops updated:', newStops)
this.updateMapView()
},
deep: true
},
routeColor() {
this.updateRoute()
},
routeWeight() {
this.updateRoute()
},
routingService() {
this.updateMapView()
},
truckMPG() {
this.recalculateCosts()
},
fuelPricePerGallon() {
this.recalculateCosts()
},
avoidTolls() {
this.updateMapView()
},
avoidHighways() {
this.updateMapView()
},
truckWeight() {
this.updateMapView()
},
truckHeight() {
this.updateMapView()
},
truckWidth() {
this.updateMapView()
},
truckLength() {
this.updateMapView()
},
truckProfile() {
this.updateMapView()
}
},
methods: {
async initMap() {
try {
await this.loadLeaflet()

if (!this.$refs.mapContainer) {
console.error('Map container not found')
return
}

const defaultCenter = [39.8283, -98.5795]
const defaultZoom = 4

this.map = window.L.map(this.$refs.mapContainer, {
scrollWheelZoom: this.content.scrollWheelZoom !== false,
dragging: this.content.dragging !== false,
zoomControl: this.content.zoomControl !== false
}).setView(defaultCenter, defaultZoom)

const tileLayer = this.content.tileLayer || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const attribution = this.content.attribution || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

window.L.tileLayer(tileLayer, {
attribution: attribution,
maxZoom: 19
}).addTo(this.map)

setTimeout(() => {
if (this.map) {
this.map.invalidateSize()
this.updateMapView()
}
}, 100)

console.log('Map initialized successfully')

} catch (error) {
console.error('Map initialization error:', error)
}
},

async loadLeaflet() {
if (this.leafletLoaded || window.L) {
this.leafletLoaded = true
return
}

const link = document.createElement('link')
link.rel = 'stylesheet'
link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
link.crossOrigin = ''
document.head.appendChild(link)

return new Promise((resolve, reject) => {
const script = document.createElement('script')
script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
script.crossOrigin = ''
script.onload = () => {
this.leafletLoaded = true
resolve()
}
script.onerror = reject
document.head.appendChild(script)
})
},

async updateMapView() {
if (!this.map || this.stops.length === 0) return

this.clearMap()
this.addMarkers()

if (this.hasRoute) {
await this.fetchAndDrawRoute()
}

if (this.autoFit) {
this.fitBounds()
} else if (this.stops.length === 1) {
this.flyToStop(this.stops[0])
}
},

clearMap() {
this.markerInstances.forEach(marker => marker.remove())
this.markerInstances = []

if (this.routePolyline) {
this.routePolyline.remove()
this.routePolyline = null
}

this.routeData = null
this.routeError = null
this.routingWarning = null
},

addMarkers() {
this.stops.forEach((stop, index) => {
if (!stop.lat || !stop.lng) return

const markerHtml = this.createMarkerHtml(index + 1, stop)

const icon = window.L.divIcon({
className: 'custom-marker',
html: markerHtml,
iconSize: [30, 40],
iconAnchor: [15, 40],
popupAnchor: [0, -40]
})

const marker = window.L.marker([stop.lat, stop.lng], { icon })

const popupContent = this.createPopupContent(stop, index + 1)
if (popupContent) {
marker.bindPopup(popupContent)
}

marker.addTo(this.map)
this.markerInstances.push(marker)
})
},

createMarkerHtml(number, stop) {
const isFirst = number === 1
const isLast = number === this.stops.length

let bgColor = stop.markerColor || '#3388ff'
if (isFirst) bgColor = stop.markerColor || '#28a745'
if (isLast && this.stops.length > 1) bgColor = stop.markerColor || '#dc3545'

return `
<div style="width: 30px; height: 40px; position: relative;">
<div style="width: 30px; height: 30px; background: ${bgColor}; border: 3px solid white; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>
<div style="position: absolute; top: 5px; left: 50%; transform: translateX(-50%) rotate(45deg); color: white; font-weight: bold; font-size: 14px; text-align: center; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">${number}</div>
</div>
`
},

createPopupContent(stop, number) {
let content = `<div style="min-width: 150px;">`
content += `<strong>Stop ${number}</strong><br>`

if (stop.label) {
content += `${stop.label}<br>`
}
if (stop.address) {
content += `<small>${stop.address}</small><br>`
}
if (stop.notes) {
content += `<div style="margin-top: 5px; font-style: italic;">${stop.notes}</div>`
}
if (stop.eta) {
content += `<div style="margin-top: 5px;"><strong>ETA:</strong> ${stop.eta}</div>`
}

content += `</div>`
return content
},

checkRoutingServiceCapabilities() {
const warnings = []
const hasAvoidOptions = this.avoidTolls || this.avoidHighways
const hasTruckOptions = this.truckWeight > 0 || this.truckHeight > 0 || this.truckWidth > 0 || this.truckLength > 0

if (this.routingService === 'osrm') {
if (hasAvoidOptions) {
warnings.push('OSRM does not support avoid options. Use Mapbox or OpenRouteService.')
}
if (hasTruckOptions) {
warnings.push('OSRM does not support truck restrictions. Use OpenRouteService.')
}
}

if (this.routingService === 'mapbox') {
if (hasTruckOptions) {
warnings.push('Mapbox does not fully support truck restrictions. Use OpenRouteService for truck routing.')
}
}

if (warnings.length > 0) {
this.routingWarning = warnings.join(' ')
console.warn('Routing service limitations:', warnings)
} else {
this.routingWarning = null
}
},

async fetchAndDrawRoute() {
if (this.stops.length < 2) return

const validStops = this.stops.filter(stop => stop.lat && stop.lng)
if (validStops.length < 2) return

// Check if routing service supports requested features
this.checkRoutingServiceCapabilities()

this.isLoadingRoute = true
this.routeError = null

try {
let routeGeometry, distance, duration, tollCost = 0

if (this.routingService === 'osrm') {
const result = await this.fetchOSRMRoute(validStops)
routeGeometry = result.routeGeometry
distance = result.distance
duration = result.duration
} else if (this.routingService === 'mapbox') {
const result = await this.fetchMapboxRoute(validStops)
routeGeometry = result.routeGeometry
distance = result.distance
duration = result.duration
tollCost = result.tollCost
} else if (this.routingService === 'openroute') {
const result = await this.fetchOpenRouteRoute(validStops)
routeGeometry = result.routeGeometry
distance = result.distance
duration = result.duration
}

if (routeGeometry && routeGeometry.length > 0) {
this.routePolyline = window.L.polyline(routeGeometry, {
color: this.routeColor,
weight: this.routeWeight,
opacity: 0.7,
smoothFactor: 1
}).addTo(this.map)

const fuelUsed = distance / this.truckMPG
const fuelCost = fuelUsed * this.fuelPricePerGallon

if (tollCost === 0 && this.includeTolls && !this.avoidTolls) {
tollCost = this.estimateTollCost(distance)
}

this.routeData = {
distance: distance.toFixed(1),
distanceMiles: parseFloat(distance.toFixed(1)),
duration: this.formatDuration(duration),
durationMinutes: Math.round(duration / 60),
durationSeconds: duration,
fuelUsed: fuelUsed.toFixed(1),
fuelUsedGallons: parseFloat(fuelUsed.toFixed(1)),
fuelCost: fuelCost.toFixed(2),
fuelCostAmount: parseFloat(fuelCost.toFixed(2)),
tollCost: tollCost.toFixed(2),
tollCostAmount: parseFloat(tollCost.toFixed(2)),
totalCost: (fuelCost + tollCost).toFixed(2),
totalCostAmount: parseFloat((fuelCost + tollCost).toFixed(2)),
geometry: routeGeometry,
stops: validStops.length
}

// Update the exposed variables using the setter functions from setup
this.setDistance(this.routeData.distanceMiles);
this.setDuration(this.routeData.durationMinutes);
this.setFuelCost(this.routeData.fuelCostAmount);
this.setTollCost(this.routeData.tollCostAmount);
this.setTotalCost(this.routeData.totalCostAmount);
this.setFuelUsed(this.routeData.fuelUsedGallons);

console.log('Route data calculated:', this.routeData)
console.log('Variables updated - Distance:', this.distance, 'Duration:', this.duration)
}

} catch (error) {
console.error('Route fetch error:', error)
this.routeError = error.message || 'Failed to fetch route'
this.addStraightLineRoute(validStops)
} finally {
this.isLoadingRoute = false
}
},

async fetchOSRMRoute(stops) {
// OSRM does not support avoid options or truck restrictions
// This is the basic free routing service
const coordinates = stops.map(s => `${s.lng},${s.lat}`).join(';')
const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`

console.log('OSRM URL:', url)

const response = await fetch(url)
if (!response.ok) {
throw new Error(`OSRM error: ${response.status}`)
}

const data = await response.json()

if (!data.routes || data.routes.length === 0) {
throw new Error('No route found')
}

const route = data.routes[0]
const routeGeometry = route.geometry.coordinates.map(coord => [coord[1], coord[0]])
const distance = route.distance / 1609.34
const duration = route.duration

return { routeGeometry, distance, duration }
},

async fetchMapboxRoute(stops) {
if (!this.routingApiKey) {
throw new Error('Mapbox API key required')
}

const coordinates = stops.map(s => `${s.lng},${s.lat}`).join(';')

// Build exclude parameter
let excludeParams = []
if (this.avoidTolls) excludeParams.push('toll')
if (this.avoidHighways) excludeParams.push('motorway')
const excludeString = excludeParams.length > 0 ? `&exclude=${excludeParams.join(',')}` : ''

let url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?`
url += `geometries=geojson&overview=full`
url += excludeString
url += `&access_token=${this.routingApiKey}`

console.log('Mapbox URL:', url)
console.log('Mapbox avoid options:', { avoidTolls: this.avoidTolls, avoidHighways: this.avoidHighways })

const response = await fetch(url)
if (!response.ok) {
const errorText = await response.text()
console.error('Mapbox error response:', errorText)
throw new Error(`Mapbox error: ${response.status}`)
}

const data = await response.json()

if (!data.routes || data.routes.length === 0) {
throw new Error('No route found')
}

const route = data.routes[0]
const routeGeometry = route.geometry.coordinates.map(coord => [coord[1], coord[0]])
const distance = route.distance / 1609.34
const duration = route.duration

let tollCost = 0
if (route.legs) {
route.legs.forEach(leg => {
if (leg.toll_costs) {
leg.toll_costs.forEach(toll => {
tollCost += toll.cost || 0
})
}
})
}

console.log('Mapbox route distance:', distance, 'duration:', duration)

return { routeGeometry, distance, duration, tollCost }
},

async fetchOpenRouteRoute(stops) {
if (!this.routingApiKey) {
throw new Error('OpenRouteService API key required')
}

const coordinates = stops.map(s => [s.lng, s.lat])
const profile = this.truckProfile === 'truck' ? 'driving-hgv' : 'driving-car'
const url = `https://api.openrouteservice.org/v2/directions/${profile}/geojson`

const body = {
coordinates: coordinates,
options: {
vehicle_type: 'hgv'
}
}

// Add truck restrictions if any are set
const hasRestrictions = this.truckWeight > 0 || this.truckHeight > 0 || this.truckWidth > 0 || this.truckLength > 0
if (hasRestrictions) {
body.options.profile_params = {
restrictions: {}
}
if (this.truckWeight > 0) {
body.options.profile_params.restrictions.weight = this.truckWeight / 2204.62 // Convert lbs to metric tons
}
if (this.truckHeight > 0) {
body.options.profile_params.restrictions.height = this.truckHeight * 0.3048 // Convert feet to meters
}
if (this.truckWidth > 0) {
body.options.profile_params.restrictions.width = this.truckWidth * 0.3048 // Convert feet to meters
}
if (this.truckLength > 0) {
body.options.profile_params.restrictions.length = this.truckLength * 0.3048 // Convert feet to meters
}
}

// Add avoid features
let avoidFeatures = []
if (this.avoidTolls) avoidFeatures.push('tollways')
if (this.avoidHighways) avoidFeatures.push('highways')
if (avoidFeatures.length > 0) {
body.options.avoid_features = avoidFeatures
}

console.log('OpenRouteService request:', {
url,
profile,
avoidFeatures,
restrictions: body.options.profile_params?.restrictions
})
console.log('OpenRouteService body:', JSON.stringify(body, null, 2))

const response = await fetch(url, {
method: 'POST',
headers: {
'Authorization': this.routingApiKey,
'Content-Type': 'application/json'
},
body: JSON.stringify(body)
})

if (!response.ok) {
const errorText = await response.text()
console.error('OpenRouteService error response:', errorText)
throw new Error(`OpenRouteService error: ${response.status}`)
}

const data = await response.json()

if (!data.features || data.features.length === 0) {
throw new Error('No route found')
}

const route = data.features[0]
const routeGeometry = route.geometry.coordinates.map(coord => [coord[1], coord[0]])
const distance = route.properties.segments[0].distance / 1609.34
const duration = route.properties.segments[0].duration

console.log('OpenRouteService route distance:', distance, 'duration:', duration)

return { routeGeometry, distance, duration }
},

estimateTollCost(distanceMiles) {
const avgTollRatePerMile = 0.20
const estimatedTollMiles = distanceMiles * 0.3
return estimatedTollMiles * avgTollRatePerMile
},

recalculateCosts() {
if (!this.routeData) return

const distance = this.routeData.distanceMiles
const fuelUsed = distance / this.truckMPG
const fuelCost = fuelUsed * this.fuelPricePerGallon

this.routeData.fuelUsed = fuelUsed.toFixed(1)
this.routeData.fuelUsedGallons = parseFloat(fuelUsed.toFixed(1))
this.routeData.fuelCost = fuelCost.toFixed(2)
this.routeData.fuelCostAmount = parseFloat(fuelCost.toFixed(2))
this.routeData.totalCost = (fuelCost + this.routeData.tollCostAmount).toFixed(2)
this.routeData.totalCostAmount = parseFloat((fuelCost + this.routeData.tollCostAmount).toFixed(2))

// Update the exposed variables
this.setFuelCost(this.routeData.fuelCostAmount);
this.setTotalCost(this.routeData.totalCostAmount);
this.setFuelUsed(this.routeData.fuelUsedGallons);
},

addStraightLineRoute(stops) {
const latlngs = stops.map(stop => [stop.lat, stop.lng])

this.routePolyline = window.L.polyline(latlngs, {
color: this.routeColor,
weight: this.routeWeight,
opacity: 0.7,
dashArray: '10, 10',
smoothFactor: 1
}).addTo(this.map)
},

updateRoute() {
if (this.routePolyline && this.hasRoute) {
this.routePolyline.setStyle({
color: this.routeColor,
weight: this.routeWeight
})
}
},

formatDuration(seconds) {
const hours = Math.floor(seconds / 3600)
const minutes = Math.floor((seconds % 3600) / 60)

if (hours > 0) {
return `${hours}h ${minutes}m`
}
return `${minutes}m`
},

fitBounds() {
if (this.stops.length === 0) return

const bounds = window.L.latLngBounds(
this.stops
.filter(stop => stop.lat && stop.lng)
.map(stop => [stop.lat, stop.lng])
)

const padding = this.content.boundsPadding || 50
this.map.fitBounds(bounds, { padding: [padding, padding] })
},

flyToStop(stop) {
if (!stop.lat || !stop.lng) return

const zoom = this.content.singleStopZoom || 13
this.map.flyTo([stop.lat, stop.lng], zoom, {
duration: 1
})
}
}
}
</script>

<style scoped>
.leaflet-map-wrapper {
position: relative;
width: 100%;
height: 100%;
}

.debug-panel {
position: absolute;
top: 10px;
right: 10px;
background: white;
padding: 10px 15px;
border-radius: 4px;
box-shadow: 0 2px 8px rgba(0,0,0,0.2);
z-index: 1000;
font-size: 12px;
min-width: 150px;
max-width: 250px;
}

.debug-panel p {
margin: 3px 0;
}

.close-debug {
position: absolute;
top: 5px;
right: 5px;
background: none;
border: none;
font-size: 20px;
cursor: pointer;
color: #999;
}

.close-debug:hover {
color: #333;
}

.loading-overlay {
position: absolute;
top: 0;
left: 0;
right: 0;
bottom: 0;
background: rgba(255, 255, 255, 0.8);
display: flex;
align-items: center;
justify-content: center;
z-index: 999;
}

.loading-spinner {
background: #3388ff;
color: white;
padding: 15px 25px;
border-radius: 4px;
font-weight: bold;
box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.leaflet-map-container {
position: relative;
z-index: 0;
}

:deep(.leaflet-control-attribution) {
font-size: 9px !important;
line-height: 1.2 !important;
padding: 2px 6px !important;
background: rgba(255, 255, 255, 0.8) !important;
max-height: 18px !important;
white-space: nowrap !important;
overflow: hidden !important;
display: flex !important;
align-items: center !important;
}

:deep(.leaflet-control-attribution a) {
font-size: 9px !important;
white-space: nowrap !important;
}

:deep(.leaflet-control-attribution img) {
display: inline-block !important;
vertical-align: middle !important;
margin: 0 2px !important;
}

:deep(.custom-marker) {
background: none;
border: none;
}

:deep(.leaflet-popup-content-wrapper) {
border-radius: 4px;
}

:deep(.leaflet-popup-content) {
margin: 10px;
}
</style>