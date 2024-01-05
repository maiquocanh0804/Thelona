import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import App from './page/App';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import {BrowserRouter as Router} from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { Provider } from 'react-redux';
import store from './redux/store';
import './css/App.css';
import './css/Home.css';
import './css/Product.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
const history = createBrowserHistory();
ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root')
);

