
import React, {Component} from 'react';
import axios from 'axios';
import "react-table/react-table.css";
import ReactTable from 'react-table';
import matchSorter from 'match-sorter'

class RuleEventTable extends Component {
  constructor(){
    super();
    this.state = {
      rule: []
    };
  }
  render() {
    return (
          <div><ReactTable 
	      filterable
	      defaultFilterMethod={(filter, row) =>
		      row[filter.id].startsWith(filter.value) }
	      data={this.state.rule} 
	      columns={ [ { Header: 'Rule ID', accessor: 'id', 
                            filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: ["id"] }), 
                            filterAll: true}, 
	                  { Header: 'Task Type', accessor: 'task_type' },
                          { Header: "Triggered By", accessor: "triggeredby"}, 
                          { Header: 'Triggering', accessor: 'triggering'} ] }
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
    axios.get('http://'+process.env.REACT_APP_APP_BACKEND_BASEURL+'/q/rule')
    .then(function (response) {
      self.setState({
        rule: Array.from( response.data, 
                          x => ({ "id": x["rule"],
		                  "triggeredby": Object.keys(x["payload"])[0],
                                  "triggering": Object.values(x["payload"])[0]["triggering"],
                                  "task_type": Object.values(x["payload"])[0]["activity"]["task_type"] }) )
      });
    })
    .catch(function (error) {
      console.log(error);
    });
  }
}

export default RuleEventTable;
