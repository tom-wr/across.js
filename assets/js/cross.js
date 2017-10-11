
import 'bootstrap-sass';
import '../css/main.scss';
import '../css/across.scss'

import $ from 'jquery';
import Across from './across/across';


$(document).ready(function() {
    let across = new Across($('#cross'), {
    });
});

