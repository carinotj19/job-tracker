import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import router from './router'
import App from './App.vue'

// PrimeVue Components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Textarea from 'primevue/textarea'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Chart from 'primevue/chart'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import AutoComplete from 'primevue/autocomplete'

// PrimeVue Styles
import 'primevue/resources/themes/lara-light-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'

// Custom styles
import './style.css'

const app = createApp(App)
const pinia = createPinia()

// Use plugins
app.use(pinia)
app.use(router)
app.use(PrimeVue)

// Register PrimeVue components
app.component('Button', Button)
app.component('InputText', InputText)
app.component('Dropdown', Dropdown)
app.component('Calendar', Calendar)
app.component('Textarea', Textarea)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Chart', Chart)
app.component('Tag', Tag)
app.component('Dialog', Dialog)
app.component('AutoComplete', AutoComplete)

// Register Service Worker for offline support
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(reg => console.log('SW registered:', reg.scope))
        .catch(err => console.error('SW registration failed:', err));
    });
  }

app.mount('#app') 