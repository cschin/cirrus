import React, {Component} from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { PageHeader, Tabs, Tab } from 'react-bootstrap';
import RuleStateTable from "./RuleStateTable.js";
import RuleEventTable from "./RuleEventTable.js";
import EventQueueTable from "./EventQueueTable.js";
import EventGraph from "./EventGraph.js";


class App extends Component {
  constructor(){
    super();
  }
  render() {
    return (
      <div>
        <PageHeader align="center">
         Cirrus Monitor <small> </small>
	</PageHeader>
	<Tabs defaultActiveKey={1} id="uncontrolled-tab-example" align="right">
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
