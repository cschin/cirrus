import React, {Component} from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { PageHeader, Tabs, Tab } from 'react-bootstrap';
import RuleLatestStateTable from "./RuleLatestStateTable.js";
import RuleStateTable from "./RuleStateTable.js";
import RuleEventTable from "./RuleEventTable.js";
import EventQueueTable from "./EventQueueTable.js";
import EventGraph from "./EventGraph.js";


class App extends Component {
  constructor(props, context){
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
    this.state = {
      key: 1,
    };
  }
  handleSelect(key) {
    // alert(`selected ${key}`);
    this.setState({ key });
    this.refs["tab"+key].loadData();
  }
  render() {
    return (
      <div>
        <PageHeader align="center">
         Cirrus Monitor <small> </small>
	</PageHeader>
	<Tabs 
	   activeKey={this.state.key}
	   onSelect={this.handleSelect}
	   id="monitor-tab">
	  <Tab eventKey={1} title="Rule Latest States">
	      <RuleLatestStateTable ref="tab1"/>
	  </Tab>
	  <Tab eventKey={2} title="Rule States">
	      <RuleStateTable ref="tab2"/>
          </Tab>
	  <Tab eventKey={3} title="Event Queue">
	      <EventQueueTable ref="tab3"/>
	  </Tab>
	  <Tab eventKey={4} title="Rules and Events">
	      <RuleEventTable ref="tab4"/>
	  </Tab>
	  <Tab eventKey={5} title="Event Graph">
	      <EventGraph ref="tab5"/>
	  </Tab>
        </Tabs>
    </div>
    );
  }
};


export default App;
