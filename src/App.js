import {Component} from "react";
import {RouteEditor} from './route-editor/src';

export default class App extends Component {


  state = {
    entities: null
  }

  async fetchData() {
    const response = await fetch('data/entities.json');
    const entities = await response.json();

    this.setState({
      entities
    })
  }

  componentDidMount() {
    this.fetchData();
  }


  render () {
    return (
      <>
        <div className='side-bar'></div>
        <RouteEditor entities={this.state.entities}/>
      </>
    )
  }
}
