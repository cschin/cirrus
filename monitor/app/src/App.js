import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';
import "react-table/react-table.css";
import ReactTable from 'react-table';
import matchSorter from 'match-sorter'
import { PageHeader, Tabs, Tab } from 'react-bootstrap';
import * as  dagre from "dagre";
import  * as dagreD3  from "dagre-d3";
import * as d3 from "d3";
import './graph.css';


class RuleStateTable extends Component {
  constructor(){
    super();
    this.state = {
      rule_state: []
    };
  }
  render() {
    return (
          <div><ReactTable 
	      filterable
	      defaultFilterMethod={(filter, row) =>
		      row[filter.id].startsWith(filter.value) }
	      data={this.state.rule_state} 
	      columns={ [ { Header: 'Rule ID', accessor: 'id', 
                            filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: ["id"] }), 
                            filterAll: true}, 
                          { Header: "State", accessor: "state", filterable: false }, 
                          { Header: 'Time Stamp', accessor: 'ts',filterable: false } ] }
	      defaultPageSize={32}
	      style={{ height: "500px" }}
              pivotBy={["id"]}
              className="-striped -highlight" /></div>
	   )
  }
  componentWillMount() {
    var self = this;	  
    axios.get('http://'+process.env.REACT_APP_APP_BACKEND_BASEURL+'/q/queue:rule_state')
    .then(function (response) {
      self.setState({
        rule_state: Array.from( response.data, x => ({ "id": Object.keys(x["payload"])[0],
                                                       "ts": new Date(Object.values(x["payload"])[0]["ts"] * 1000).toLocaleString(),
                                                       "state": Object.values(x["payload"])[0]["state"]	}) )
      });
    })
    .catch(function (error) {
      console.log(error);
    });
  }
}

class RuleEventTable extends Component {
  constructor(){
    super();
    this.state = {
      rule_state: []
    };
  }
  render() {
    return (
          <div><ReactTable 
	      filterable
	      defaultFilterMethod={(filter, row) =>
		      row[filter.id].startsWith(filter.value) }
	      data={this.state.rule_state} 
	      columns={ [ { Header: 'Rule ID', accessor: 'id', 
                            filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: ["id"] }), 
                            filterAll: true}, 
	                  { Header: 'Task Type', accessor: 'task_type' },
                          { Header: "Triggered By", accessor: "triggeredby"}, 
                          { Header: 'Triggering', accessor: 'triggering'} ] }
	      defaultPageSize={32}
	      style={{ height: "500px" }}
              className="-striped -highlight" /></div>
	   )
  }
  componentWillMount() {
    var self = this;	  
    axios.get('http://'+process.env.REACT_APP_APP_BACKEND_BASEURL+'/q/rule')
    .then(function (response) {
      self.setState({
        rule_state: Array.from( Object.keys(response.data), 
				    x => ({ "id": x,
		                            "triggeredby": Object.keys(response.data[x]["payload"])[0],
                                            "triggering": Object.values(response.data[x]["payload"])[0]["triggering"],
				            "task_type": Object.values(response.data[x]["payload"])[0]["activity"]["task_type"] }) )
      });
    })
    .catch(function (error) {
      console.log(error);
    });
  }
}

class EventQueueTable extends Component {
  constructor(){
    super();
    this.state = {
      rule_state: []
    };
  }
  render() {
    return (
          <div><ReactTable 
	      filterable
	      defaultFilterMethod={(filter, row) =>
		      row[filter.id].startsWith(filter.value) }
	      data={this.state.rule_state} 
	      columns={ [ { Header: 'Time Stamp', accessor: 'ts', filterable: false},
                          { Header: "Event ID", accessor: "id"  }, 
                          { Header: 'Action', accessor: 'action'},
	                  { Header: 'force', accessor: 'force' }] }
	      defaultPageSize={32}
	      style={{ height: "500px" }}
              className="-striped -highlight" /></div>
	   )
  }
  componentWillMount() {
    var self = this;	  
    axios.get('http://'+process.env.REACT_APP_APP_BACKEND_BASEURL+'/q/queue:event')
    .then(function (response) {
      self.setState({
        rule_state: Array.from( response.data, x => ({ "id": Object.keys(x["payload"])[0],
                                                       "ts": new Date(x["ts"] * 1000).toLocaleString(),
                                                       "action": Object.values(x["payload"])[0]["action"],
                                                       "force": Object.values(x["payload"])[0]["force"]}) )
      });
    })
    .catch(function (error) {
      console.log(error);
    });
  }
}

class EventGraph extends Component {
  constructor(){
    super();
    this.state = {
      rule_state: [],
      event_set: {}
    };
  }
  componentWillMount() {
    var self = this;	  

    axios.get('http://'+process.env.REACT_APP_APP_BACKEND_BASEURL+'/q/rule')
    .then(function (response) {
      self.setState({
        rule_state: Array.from( Object.keys(response.data), 
				    x => ({ "id": x,
		                            "triggeredby": Object.keys(response.data[x]["payload"])[0],
                                            "triggering": Object.values(response.data[x]["payload"])[0]["triggering"],
				            "task_type": Object.values(response.data[x]["payload"])[0]["activity"]["task_type"] }) )
      });
    })
    .catch(function (error) {
      console.log(error);
    });

    axios.get('http://'+process.env.REACT_APP_APP_BACKEND_BASEURL+'/q/event_set')
    .then(function (response) {
      var event_set_ = {};
      for (var es in response.data) {
	  event_set_[es] = response.data[es]["payload"];
      }
      self.setState({
	  event_set: event_set_
      });
      console.log(JSON.stringify(self.state));
    })
    .catch(function (error) {
      console.log(error);
    });
  }


  componentDidUpdate() {
        var self = this;	  
	if (self.state.rule_state.length == 0  || Object.keys(self.state.event_set).length ==0) {
	    return;
	}
	var g = new dagreD3.graphlib.Graph()
	  .setGraph({})
	  .setDefaultEdgeLabel(function() { return {}; });
	g.graph().rankdir = "LR";
	
	let set = new Set();
	Object.values(self.state.event_set).forEach(x => x.forEach(y => set.add(y)))
	set.forEach( function(v) { g.setNode(v, {label: v}) } );	
	g.nodes().forEach( function(v) {
	  var node = g.node(v);
	  // Round the corners of the nodes
	  node.rx = node.ry = 5;
	});

	// Set up edges, no special attributes.
	this.state.rule_state.forEach( function(v) { 
	    var a = self.state.event_set[v["triggeredby"]];
	    var b = self.state.event_set[v["triggering"]];
	    for ( var i = 0; i < a.length; i++ ) {
	        for ( var j = 0; j < b.length; j++ ) {
                    var e1 = a[i];
		    var e2 = b[j];
		    g.setEdge( e1, e2, {label:v["id"]} )
		}
	    }	
	});

	// Create the renderer
	var render = new dagreD3.render();

	// Set up an SVG group so that we can translate the final graph.
	var svg = d3.select("svg"),
	    svgGroup = svg.append("g");

	// Run the renderer. This is what draws the final graph.
	render(d3.select("svg g"), g);

	// Center the graph
	var xCenterOffset = (svg.attr("width") - g.graph().width) / 2;
	//svgGroup.attr("transform", "translate(" + xCenterOffset + ", 20)");
	svg.attr("height", g.graph().height + 40);
	svg.attr("width", g.graph().width +  80);
  }
  render() {
	
    return (
        <div> <br/><svg></svg> </div>
	   )
  }
}


class App extends Component {
  constructor(){
    super();
    this.state = {
      rule_state: []
    };
  }
  render() {
    return (
      <div>
        <PageHeader>
         Cirrus Monitor <small> </small>
	</PageHeader>
	<Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
	  <Tab eventKey={1} title="Rule States">
	      <RuleStateTable/>
          </Tab>
	  <Tab eventKey={2} title="Rules and Events">
	      <RuleEventTable/>
	  </Tab>
	  <Tab eventKey={3} title="Event Queue">
	      <EventQueueTable/>
	  </Tab>
	  <Tab eventKey={4} title="Event Graph">
	      <EventGraph/>
	  </Tab>
        </Tabs>
    </div>
    );
  }
};




export default App;
