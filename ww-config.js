export default {
  editor: {
    label: {
      en: 'Leaflet Map',
    },
    icon: 'fontawesome/solid/map-marked-alt',
    customStylePropertiesOrder: ['height', 'width'],
    bubble: {
      icon: 'fontawesome/solid/map-marked-alt',
    },
  },
  properties: {
    center: {
      label: {
        en: 'Center Coordinates',
      },
      type: 'Array',
      defaultValue: [51.505, -0.09],
      bindable: true,
      section: 'settings',
    },
    zoom: {
      label: {
        en: 'Zoom Level',
      },
      type: 'Number',
      defaultValue: 13,
      bindable: true,
      section: 'settings',
    },
    markers: {
      label: {
        en: 'Markers',
      },
      type: 'Array',
      defaultValue: [],
      bindable: true,
      section: 'settings',
    },
    height: {
      label: {
        en: 'Height',
      },
      type: 'Length',
      defaultValue: '400px',
      bindable: true,
      section: 'settings',
    },
    width: {
      label: {
        en: 'Width',
      },
      type: 'Length',
      defaultValue: '100%',
      bindable: true,
      section: 'settings',
    },
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
        en: 'Dragging',
      },
      type: 'OnOff',
      defaultValue: true,
      bindable: true,
      section: 'settings',
    },
  },
};