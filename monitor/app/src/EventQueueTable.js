
import React, {Component} from 'react';
import axios from 'axios';
import "react-table/react-table.css";
import ReactTable from 'react-table';
import matchSorter from 'match-sorter'

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
                          { Header: "Event ID", accessor: "id", 
                            filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: ["id"] }),
			    filterAll: true}, 
                          { Header: 'Action', accessor: 'action'},
	                  { Header: 'force', accessor: 'force' }] }
	      defaultPageSize={20}
	      style={{ height: "700px" }}
              className="-striped -highlight" /></div>
	   )
  }

  componentWillMount() {
      this.loadData();	  
  }

  loadData() {
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

export default EventQueueTable;
