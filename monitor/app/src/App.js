import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';
import "react-table/react-table.css";
import ReactTable from 'react-table';
import matchSorter from 'match-sorter'
import { PageHeader, Tabs, Tab } from 'react-bootstrap';


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
                                            "triggering": Object.values(response.data[x]["payload"])[0]["triggering"]}) )
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
        </Tabs>
    </div>
    );
  }
};




export default App;
