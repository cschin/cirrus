
import React, {Component} from 'react';
import axios from 'axios';
import "react-table/react-table.css";
import ReactTable from 'react-table';
import matchSorter from 'match-sorter'

class RuleLatestStateTable extends Component {
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
                          { Header: "Latest State", accessor: "state" }, 
                          { Header: 'Time Stamp', accessor: 'ts',filterable: false } ] }
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
    axios.get('http://'+process.env.REACT_APP_APP_BACKEND_BASEURL+'/q/queue:rule_state')
    .then(function (response) {
      let last_state = {};
      response.data.forEach( function(x) { 
			         last_state[x["rule"]] = [] } );
      response.data.forEach( function(x) {
			         last_state[x["rule"]].push( [ x["ts"], 
			                                       x["payload"]["state"],
			                                       x["rule"] ] ) } );
      response.data.forEach( function(x) { 
		                 last_state[x["rule"]].sort(function(a, b){return b[0]-a[0]});} );
      self.setState({
        rule_state: Array.from( Object.values(last_state), x => ({ "id": x[0][2],
                                                                   "ts": new Date(x[0][0] * 1000).toLocaleString(),
                                                                   "state": x[0][1] }) )
      });
    })
    .catch(function (error) {
      console.log(error);
    });
  }
}

export default RuleLatestStateTable;
