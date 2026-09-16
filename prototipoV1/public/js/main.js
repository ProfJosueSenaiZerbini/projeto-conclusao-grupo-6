import '../css/style.css';
import { PrototypeController } from '../../controllers/prototypeController.js';

const theme = localStorage.getItem('cypher-prototype-theme') || 'light';
document.documentElement.dataset.theme = theme;

new PrototypeController(document.querySelector('#app'));
