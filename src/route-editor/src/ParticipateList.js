import React, {Component} from "react";
import chevronIcon from './assets/chevron.svg';
const MOVMENT_FACTOR = 8 + 0.7; // button width + margin left
const MAX_DRONES_IN_LIST = 5;

const arrowButtons = {
    right: 'right',
    left: 'left'
}

export default class ParticipateList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            arrowClickCounter: 0,
        }
    }

    onArrowButtonClick(arrow) {
        let {arrowClickCounter} = this.state;
        const playersCount = Object.keys(this.props.virtualPlayerToNavPlansMap).length;

        switch (arrow) {
            case arrowButtons.right:
                if (arrowClickCounter === 0) return;
                arrowClickCounter--;
                break;
            case arrowButtons.left:
                if (playersCount > MAX_DRONES_IN_LIST && playersCount - MAX_DRONES_IN_LIST >= arrowClickCounter) {
                    arrowClickCounter++
                };
                break;
            default:
                break;
        }

        this.setState({arrowClickCounter})
    }

    render() {
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
                        <button className={`route-editor-participates-button all-participates-button ${this.props.getSelectedDroneClass('all')}`} onClick={() => this.props.selectDrone('all')}>
                            {this.props.translator.t('all')}
                        </button>
                        {
                            Object.keys(this.props.virtualPlayerToNavPlansMap).map((vPlayerId, i) => {
                                return (
                                    <button className={`route-editor-participates-button ${this.props.getSelectedDroneClass(vPlayerId)}`}
                                            onClick={() => this.props.selectDrone(vPlayerId)}
                                            title={this.props.entsIdToEntsMap[vPlayerId].appX.base.dispName}>
                                        <span className='route-editor-participates-button-color-point' style={{backgroundColor: this.props.virtualPlayerToColorMap[vPlayerId]}}></span>
                                        <span className='route-editor-participates-button-label'>{this.props.entsIdToEntsMap[vPlayerId].appX.base.dispName}</span>
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

}

