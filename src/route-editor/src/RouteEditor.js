import React, {Component} from 'react';
import './RouteEditor.css';
import closeIcon from './assets/close.svg';
import chevronIcon from './assets/chevron.svg';
import Footer from './Footer';
import Chart from './Chart';

const MOVMENT_FACTOR = 8 + 0.7; // button width + margin left
const MAX_DRONES_IN_LIST = 5;

export const dronesColor = {
    0: '#43BEF4',
    1: '#43F47D',
    2: '#B959F4',
    3: '#F49459',
    4: '#F459A2'
}

const arrowButtons = {
    right: 'right',
    left: 'left'
}

export default class RouteEditor extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            selectedDroneId: null,
            arrowClickCounter: 0
        }

    }
    
    getComponentData() {
        return this.props.entities;
    }

    renderHeader() {
        return (
            <div className='route-editor-header'>
                <span className='route-editor-header-label'>חתך צד</span>
                <button className='route-editor-header-close-button' onClick={this.props.onClose}>
                    <img className='route-editor-header-close-icon' src={closeIcon}/>
                </button>
            </div>
        )
    }

    getSelectedDroneClass = id => {
        return id === this.state.selectedDroneId ? 'participates-button-selected' : '';
    }

    onArrowButtonClick(arrow) {
        let {arrowClickCounter} = this.state;        
        const data = this.getComponentData();

        switch (arrow) {
            case arrowButtons.right:
                if (arrowClickCounter === 0) return;
                arrowClickCounter--;
                break;
            case arrowButtons.left:
                if (data.length > MAX_DRONES_IN_LIST && data.length - MAX_DRONES_IN_LIST >= arrowClickCounter) {                    
                    arrowClickCounter++
                };
                break;
            default:
                break;                
        }

        this.setState({arrowClickCounter})
    }

    renderParticipateList(data) {
        return (
            <div className='route-editor-participate-list-wrapper'>
                <div className='route-editor-participate-list-content'>
                    <button className='route-editor-participate-list-right-arrrow-button' onClick={this.onArrowButtonClick.bind(this, arrowButtons.right)}>
                        <img className='route-editor-participate-list-right-arrrow-icon' src={chevronIcon}/>
                    </button>
                    <button className='route-editor-participate-list-left-arrrow-button' onClick={this.onArrowButtonClick.bind(this, arrowButtons.left)}>
                        <img className='route-editor-participate-list-left-arrrow-icon' src={chevronIcon}/>
                    </button>
                    <div className='route-editor-participates-buttons'>
                        <div className='route-editor-participates-buttons-wrapper' style={{transform: `translateX(${this.state.arrowClickCounter * MOVMENT_FACTOR}rem)`}}>
                            <button className={`route-editor-participates-button all-participates-button ${this.getSelectedDroneClass('all')}`} onClick={() => this.setState({selectedDroneId: 'all'})}>{'הכל'}</button>
                            {
                                data.map((drone, i) => {
                                    return (
                                        <button className={`route-editor-participates-button  ${this.getSelectedDroneClass(drone._id)}`} 
                                                onClick={() => this.setState({selectedDroneId: drone._id})}
                                                title={drone.appX.base.dispName}>
                                            <span className='route-editor-participates-button-color-point' style={{backgroundColor: dronesColor[i]}}></span>
                                            <span className='route-editor-participates-button-label'>{drone.appX.base.dispName}</span>
                                        </button>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    renderChart() {
        return <Chart/>
    }

    renderFooter() {
        return (
            <Footer/>
        );
    }
    
    render() {
        const data = this.getComponentData();
        if (!data) return null;

        return (
            <div className='route-editor-wrapper'>
                {this.renderHeader()}
                {this.renderParticipateList(data)}
                {this.renderChart()}
                {this.renderFooter()}
            </div>
        )
    }
}