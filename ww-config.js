export default {
  editor: {
    label: {
      en: 'Route Map',
    },
    icon: 'fontawesome/solid/route',
    // Define which properties should appear in the style panel
    customStylePropertiesOrder: [
      ['height', 'width'],
    ],
    // Define the style properties themselves
    customSettingsPropertiesOrder: [
      ['stops'],
      ['routingService', 'routingApiKey'],
      ['routeColor', 'routeWeight', 'markerColor'],
      ['truckMPG', 'fuelPricePerGallon', 'includeTolls', 'tollsApiKey'],
      ['truckProfile', 'truckWeight', 'truckHeight', 'truckWidth', 'truckLength'],
      ['avoidTolls', 'avoidHighways'],
      ['autoFit', 'boundsPadding', 'singleStopZoom', 'scrollWheelZoom', 'dragging', 'zoomControl'],
      ['tileLayer', 'attribution'],
    ],
  },
  properties: {
    stops: {
      label: {
        en: 'Stops Data',
      },
      type: 'Query',
      defaultValue: [],
      bindable: true,
      section: 'settings',
    },

    // Routing Service Settings
    routingService: {
      label: {
        en: 'Routing Service',
      },
      type: 'TextSelect',
      options: {
        options: [
          { value: 'osrm', label: 'OSRM (Free, No API Key)' },
          { value: 'mapbox', label: 'Mapbox (Requires API Key)' },
          { value: 'openroute', label: 'OpenRouteService (Requires API Key)' },
          { value: 'here', label: 'HERE (Requires API Key)' },
        ],
      },
      defaultValue: 'osrm',
      bindable: true,
      section: 'settings',
    },
    routingApiKey: {
      label: {
        en: 'Routing API Key',
      },
      type: 'Text',
      defaultValue: '',
      bindable: true,
      section: 'settings',
      options: {
        placeholder: 'Required for Mapbox/OpenRouteService/HERE',
      },
    },

    // Route Appearance
    routeColor: {
      label: {
        en: 'Route Color',
      },
      type: 'Color',
      defaultValue: '#3388ff',
      bindable: true,
      section: 'settings',
    },
    routeWeight: {
      label: {
        en: 'Route Line Weight',
      },
      type: 'Number',
      defaultValue: 4,
      bindable: true,
      section: 'settings',
    },
    markerColor: {
      label: {
        en: 'Default Marker Color',
      },
      type: 'Color',
      defaultValue: '#3388ff',
      bindable: true,
      section: 'settings',
    },

    // Truck Cost Calculations
    truckMPG: {
      label: {
        en: 'Truck MPG (Fuel Efficiency)',
      },
      type: 'Number',
      defaultValue: 6.5,
      bindable: true,
      section: 'settings',
      options: {
        min: 1,
        max: 15,
        step: 0.1,
      },
    },
    fuelPricePerGallon: {
      label: {
        en: 'Fuel Price per Gallon ($)',
      },
      type: 'Number',
      defaultValue: 3.50,
      bindable: true,
      section: 'settings',
      options: {
        min: 0,
        step: 0.01,
      },
    },
    includeTolls: {
      label: {
        en: 'Include Toll Estimates',
      },
      type: 'OnOff',
      defaultValue: true,
      bindable: true,
      section: 'settings',
    },
    tollsApiKey: {
      label: {
        en: 'Tolls API Key (Optional)',
      },
      type: 'Text',
      defaultValue: '',
      bindable: true,
      section: 'settings',
      options: {
        placeholder: 'For accurate toll data',
      },
    },

    // Truck Specifications
    truckProfile: {
      label: {
        en: 'Truck Profile',
      },
      type: 'TextSelect',
      options: {
        options: [
          { value: 'truck', label: 'Heavy Truck (HGV)' },
          { value: 'semi', label: 'Semi Truck' },
          { value: 'straight_truck', label: 'Straight Truck' },
        ],
      },
      defaultValue: 'truck',
      bindable: true,
      section: 'settings',
    },
    truckWeight: {
      label: {
        en: 'Truck Weight (lbs)',
      },
      type: 'Number',
      defaultValue: 40000,
      bindable: true,
      section: 'settings',
      options: {
        min: 0,
        step: 1000,
      },
    },
    truckHeight: {
      label: {
        en: 'Truck Height (feet)',
      },
      type: 'Number',
      defaultValue: 13.5,
      bindable: true,
      section: 'settings',
      options: {
        min: 0,
        step: 0.5,
      },
    },
    truckWidth: {
      label: {
        en: 'Truck Width (feet)',
      },
      type: 'Number',
      defaultValue: 8.5,
      bindable: true,
      section: 'settings',
      options: {
        min: 0,
        step: 0.5,
      },
    },
    truckLength: {
      label: {
        en: 'Truck Length (feet)',
      },
      type: 'Number',
      defaultValue: 53,
      bindable: true,
      section: 'settings',
      options: {
        min: 0,
        step: 1,
      },
    },

    // Route Preferences
    avoidTolls: {
      label: {
        en: 'Avoid Toll Roads',
      },
      type: 'OnOff',
      defaultValue: false,
      bindable: true,
      section: 'settings',
    },
    avoidHighways: {
      label: {
        en: 'Avoid Highways',
      },
      type: 'OnOff',
      defaultValue: false,
      bindable: true,
      section: 'settings',
    },

    // Map Controls
    showDebugPanel: {
      label: {
        en: 'Show Debug Panel',
      },
      type: 'OnOff',
      defaultValue: false,
      bindable: true,
      section: 'settings',
    },
    autoFit: {
      label: {
        en: 'Auto Fit Bounds',
      },
      type: 'OnOff',
      defaultValue: true,
      bindable: true,
      section: 'settings',
    },
    boundsPadding: {
      label: {
        en: 'Bounds Padding',
      },
      type: 'Number',
      defaultValue: 50,
      bindable: true,
      section: 'settings',
    },
    singleStopZoom: {
      label: {
        en: 'Single Stop Zoom Level',
      },
      type: 'Number',
      defaultValue: 13,
      bindable: true,
      section: 'settings',
    },
    scrollWheelZoom: {
      label: {
        en: 'Scroll Wheel Zoom',
      },
      type: 'OnOff',
      defaultValue: true,
      bindable: true,
      section: 'settings',
    },
    dragging: {
      label: {
        en: 'Enable Dragging',
      },
      type: 'OnOff',
      defaultValue: true,
      bindable: true,
      section: 'settings',
    },
    zoomControl: {
      label: {
        en: 'Show Zoom Controls',
      },
      type: 'OnOff',
      defaultValue: true,
      bindable: true,
      section: 'settings',
    },

    // Map Tiles
    tileLayer: {
      label: {
        en: 'Tile Layer URL',
      },
      type: 'Text',
      defaultValue: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      bindable: true,
      section: 'settings',
    },
    attribution: {
      label: {
        en: 'Attribution',
      },
      type: 'Text',
      defaultValue: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      bindable: true,
      section: 'settings',
    },
  },
};