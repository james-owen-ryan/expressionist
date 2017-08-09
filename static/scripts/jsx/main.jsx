var React = require('react')
var ReactDOM = require('react-dom')
var Interface = require('./components/Interface.jsx');
import { Router, Route, browserHistory} from 'react-router'
ReactDOM.render((
  <Router history={browserHistory}>
      <Route path="/:nonterminalid/:ruleid" component={Interface}/>
      <Route path="/" component={Interface}/>
  </Router>
), document.getElementById("app"))
