import { tsThisType } from "@babel/types";
import {Component} from "react";
import {RouteEditor} from './route-editor/src';

export default class App extends Component {


  state = {
    entities: null,
    subscriptionResults: null
  }

  async fetchData() {
    const response = await fetch('data/entities.json');
    const entities = await response.json();

    this.setState({
      subscriptionResults:{
        toJS() {
          return entities
        }
      }
    })
  }

  componentDidMount() {
    setTimeout(() => this.fetchData(),500)    
  }

  subscriptionResults = {
    toJS() {
      return {subscriptionResults: this.state.entities}
    }
  }

  render () {
    return (
      <>
        <div className='side-bar'></div>
        <RouteEditor 
          subscriptionResults={this.state.subscriptionResults}
          additionalData={{snames: {updateNavPlansCommandSname: 'dummyCommand'}}}
          entities={this.state.entities}/>
      </>
    )
  }
}
