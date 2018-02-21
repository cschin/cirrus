
import React, {Component} from 'react';
import axios from 'axios';
import "react-table/react-table.css";
import ReactTable from 'react-table';
import matchSorter from 'match-sorter'

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
	      defaultPageSize={20}
	      style={{ height: "700px" }}
              pivotBy={["id"]}
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

export default RuleStateTable;
