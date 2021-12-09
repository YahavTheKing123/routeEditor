import React, { Component } from 'react';
import Select from 'react-select';

import zoomInIcon from './assets/plus.svg';
import zoomOutIcon from './assets/minus.svg';
import resetZoomIcon from './assets/center_focus_round_corners.svg';
import hidePointsIcon from './assets/visibility_off.svg';
import checkIcon from './assets/check.svg';
import undoIcon from './assets/undo.svg';
import fxIcon from './assets/fx.svg';
import directionDown from './assets/directionDown.svg';
import directionUp from'./assets/directionUp.svg';
import directionUpDown from'./assets/directionUpDown.svg';
import config from "./config";
import {navDirectionMapper, routeOptions} from "./RouteEditor";
import {EntitiesMngr} from '~/entities-client';

const icons = {
    back: directionDown,
    forward: directionUp,
    forwardBack: directionUpDown
}

export default class Footer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dropdownOptions: null,
        }
    }

    componentDidMount() {
        const {dropDownOptionsKeys, translator} = this.props;

        const dropdownOptions = Object.keys(dropDownOptionsKeys).map(key => ({
            label: translator.t(key),
            value: key
        }))

        this.setState({dropdownOptions}, this.disablePatrolOption);
    }

    componentDidUpdate(prevProps, prevState) {
        const {virtualPlayerToNavPlansMap, selectedDroneId} = this.props;

        if (prevProps.selectedDroneId !== selectedDroneId) {
            this.disablePatrolOption();
        }
    }

    disablePatrolOption() {
        const {selectedDroneId, virtualPlayerToNavPlansMap} = this.props;

        let isContainsPatrolNavPlan = false;
        if (selectedDroneId === config.ALL) {
            Object.keys(virtualPlayerToNavPlansMap).forEach(vp => virtualPlayerToNavPlansMap[vp].forEach(nav =>{
                if (nav.navPlanType === navDirectionMapper[routeOptions.patrol]) {
                    isContainsPatrolNavPlan = true;
                }
            }))
        } else {
            const navPlanArr = virtualPlayerToNavPlansMap[selectedDroneId];
            const navPlanPatrol =  navPlanArr.find(nav => nav.navPlanType === navDirectionMapper[routeOptions.patrol]);
            if (navPlanPatrol) {
                isContainsPatrolNavPlan = true;
            }
        }

        if (!isContainsPatrolNavPlan) {
            const dropdownOptions = [...this.state.dropdownOptions];
            dropdownOptions.forEach(item => {
                if (item.value === routeOptions.patrol) {
                    item.isDisabled = true;
                }
            })
            this.setState({dropdownOptions})
        }

    }

    resetZoom = () => {
        this.props.chartConainer.current.chartRef.current.resetZoom();
    }

    renderZoomButtons() {
        const hideChartPointsActiveClass = this.props.isHideChartPoints ? 'route-editor-footer-zoom-button-active' : '';

        return (
            <div className='route-editor-footer-zoom-wrapper'>
                <button className='route-editor-footer-zoom-button' onClick={this.resetZoom} title={this.props.translator.t('resetZoom')}>
                    <img className='route-editor-footer-reset-zoom-icon' src={resetZoomIcon}/>
                </button>
                <button className={`route-editor-footer-zoom-button ${hideChartPointsActiveClass}`} onClick={this.props.toggleHideChartPoints} title={this.props.translator.t('hideChartPoints')}>
                    <img className='route-editor-footer-hide-points-icon' src={hidePointsIcon}/>
                </button>
                {/*<button className='route-editor-footer-zoom-button' onClick={this.props.onClose}>
                    <img className='route-editor-footer-zoom-out-icon' src={zoomOutIcon}/>
                </button>
                <button className='route-editor-footer-zoom-button' onClick={this.props.onClose}>
                    <img className='route-editor-footer-zoom-in-icon' src={zoomInIcon}/>
                </button>*/}
            </div>
        )
    }

    getDropDownIcon() {

        const iconKey = this.props.selectedDropdownItem ? this.props.selectedDropdownItem : this.state.dropdownOptions[0].value;
        return <img src={icons[iconKey]} className='route-editor-footer-dropdown-icon-img'/>
    }

    renderDropDown() {
        if (!this.state.dropdownOptions) return null
        return (
            <div className='route-editor-footer-dropdown-wrapper'>
                {/*<span className='route-editor-footer-dropdown-icon'>{this.getDropDownIcon()}</span>*/}
                <span className='route-editor-footer-dropdown-content'>
                    <span className='route-editor-footer-dropdown-label'>{this.props.translator.t('route')}</span>
                    <Select
                        className={"Select__container"}
                        classNamePrefix="Select"
                        value={this.state.dropdownOptions.find(item => item.value === this.props.selectedDropdownItem)}
                        options={this.state.dropdownOptions}
                        isClearable={false}
                        placeholder=""
                        maxMenuHeight={'25rem'}
                        onChange={selectedItem => this.props.onDropDownSelect(selectedItem.value)}
                />
                </span>
            </div>
        )
    }

    renderRightButtons() {
        return (
            <div className='route-editor-footer-right-buttons'>
                {this.renderZoomButtons()}
                {this.renderDropDown()}
            </div>
        )
    }

    saveChanges = () => {
        const {newWaypointsHeight} = this.props.chartConainer.current;
        if (newWaypointsHeight && Object.keys(newWaypointsHeight).length > 0) {
            const promises = Object.keys(newWaypointsHeight).map(id => {
                return EntitiesMngr.updateEntity(id, {
                    heightAGL: newWaypointsHeight[id].newHeightAGL,
                    heightAMSL: newWaypointsHeight[id].newHeightAMSL,
                })
            })
            Promise.all(promises);
            this.props.updateChartChangesFlag(false);
        }
    }

    undoChanges = () => {

        if (this.props.chartConainer &&
            this.props.chartConainer.current) {

            this.props.updateChartChangesFlag(false);
            this.props.chartConainer.current.forceUpdate();
        }
    }

    renderLeftButtons() {
        const disableClass = this.props.isChartHasChanges ? '' : 'route-editor-footer-left-buttons-disable';
        const navPlanCmdDisabledClass = this.props.isNavPlanningCommandAvailable ? '' : 'plan-action-button-disable';
        return (
            <div className={`route-editor-footer-left-buttons`}>
                <button className={`route-editor-footer-action-button plan-action-button ${navPlanCmdDisabledClass}`} onClick={this.props.executeNavPlanningCommand} >
                    <img className='route-editor-footer-undo-icon' src={fxIcon} style={{height:'1.6rem', width:'1.6rem', marginInlineEnd: '0.5rem'}}/>
                    <span>{this.props.translator.t('plan')}</span>
                </button>
                {
                    this.props.selectedDroneId !== config.ALL &&
                    <div className={`route-editor-footer-action-buttons ${disableClass}`}>
                        <button className='route-editor-footer-action-button' onClick={this.undoChanges} title={this.props.translator.t('undo')}>
                            <img className='route-editor-footer-undo-icon' src={undoIcon}/>
                        </button>
                        <button className='route-editor-footer-action-button' onClick={this.saveChanges} title={this.props.translator.t('save')}>
                            <img className='route-editor-footer-check-icon' src={checkIcon}/>
                        </button>
                    </div>
                }
            </div>
        );
    }

    render() {
        return (
            <div className='route-editor-footer'>
                    {this.renderRightButtons()}
                    {this.renderLeftButtons()}
            </div>
        )
    }
}
