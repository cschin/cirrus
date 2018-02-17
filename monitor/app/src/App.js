import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';
import "react-table/react-table.css";
import ReactTable from 'react-table';
import matchSorter from 'match-sorter'
import { PageHeader, Tabs, Tab } from 'react-bootstrap';


const columns = [{ Header: 'Rule ID', accessor: 'id', 
                   filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: ["id"] }), 
                   filterAll: true}, 
                 { Header: "State", accessor: "state", filterable: false }, 
                 { Header: 'Time Stamp', accessor: 'ts',filterable: false }]

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
          <div><ReactTable 
	      filterable
	      defaultFilterMethod={(filter, row) =>
		      row[filter.id].startsWith(filter.value) }
	      data={this.state.rule_state} 
	      columns={columns}
	      defaultPageSize={32}
	      style={{ height: "500px" }}
              pivotBy={["id"]}
              className="-striped -highlight" /></div>
          </Tab>
	  <Tab eventKey={2} title="Rules and Events">
	      Rules and Events
	  </Tab>
	  <Tab eventKey={3} title="Event Queue">
	      Event Queue
	  </Tab>
        </Tabs>
    </div>
    );
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
};




export default App;
