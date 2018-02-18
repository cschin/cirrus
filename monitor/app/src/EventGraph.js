import React, {Component} from 'react';
import axios from 'axios';
import * as  dagre from "dagre";
import * as dagreD3  from "dagre-d3";
import * as d3 from "d3";
import './graph.css';

class EventGraph extends Component {
  constructor(){
    super();
    this.state = {
      rule_state: [],
      event_set: {}
    };
  }
  componentWillMount() {
      this.loadData()
  }
  loadData() {
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
      //console.log(JSON.stringify(self.state));
    })
    .catch(function (error) {
      console.log(error);
    });
  }


  componentDidUpdate() {
        var self = this;	  
	if (self.state.rule_state.length === 0  || Object.keys(self.state.event_set).length === 0) {
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


export default EventGraph;
