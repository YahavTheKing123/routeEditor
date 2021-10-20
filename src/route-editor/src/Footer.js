import React, { Component } from 'react';
import Select from 'react-select';

import zoomInIcon from './assets/plus.svg';
import zoomOutIcon from './assets/minus.svg';
import checkIcon from './assets/check.svg';
import undoIcon from './assets/undo.svg';
import fxIcon from './assets/fx.svg';
import directionDown from './assets/directionDown.svg';
import directionUp from'./assets/directionUp.svg';
import directionUpDown from'./assets/directionUpDown.svg';

const icons = { 
    back: directionDown,
    forward: directionUp,
    forwardBack: directionUpDown
}

export default class Footer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dropdownOptions: null
        } 
    }

    componentDidMount() {
        const {dropDownOptionsKeys, translator} = this.props;

        const dropdownOptions = Object.keys(dropDownOptionsKeys).map(key => ({
            label: translator.t(key),
            value: key
        }))
        
        this.setState({
            dropdownOptions
        })
    }

    renderZoomButtons() {
        return (
            <div className='route-editor-footer-zoom-wrapper'>
                <button className='route-editor-footer-zoom-button' onClick={this.props.onClose}>
                    <img className='route-editor-footer-zoom-out-icon' src={zoomOutIcon}/>
                </button>
                <button className='route-editor-footer-zoom-button' onClick={this.props.onClose}>
                    <img className='route-editor-footer-zoom-in-icon' src={zoomInIcon}/>
                </button>
            </div>
        )
    }
    
    getDropDownIcon() {

        const iconKey = this.props.selectedDropdownItem ? this.props.selectedDropdownItem.value : this.state.dropdownOptions[0].value;
        return <img src={icons[iconKey]} className='route-editor-footer-dropdown-icon-img'/>
    }
    
    renderDropDown() {
        if (!this.state.dropdownOptions) return null
        return (
            <div className='route-editor-footer-dropdown-wrapper'>
                <span className='route-editor-footer-dropdown-icon'>{this.getDropDownIcon()}</span>
                <span className='route-editor-footer-dropdown-content'>
                    <span className='route-editor-footer-dropdown-label'>{this.props.translator.t('route')}</span>
                    <Select
                        className={"Select__container"}
                        classNamePrefix="Select"
                        value={this.props.selectedDropdownItem || this.state.dropdownOptions[0]}
                        options={this.state.dropdownOptions}
                        isClearable={false}                        
                        placeholder=""
                        maxMenuHeight={'25rem'}
                        onChange={selectedItem => this.props.onDropDownSelect(selectedItem)}
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

    renderLeftButtons() {
        return (
            <div className='route-editor-footer-left-buttons'>
                <button className='route-editor-footer-action-button plan-action-button' onClick={this.props.onClose}>
                    <img className='route-editor-footer-undo-icon' src={fxIcon} style={{height:'1.6rem', width:'1.6rem', marginLeft: '0.5rem'}}/>
                    <span>{this.props.translator.t('plan')}</span>
                </button>                
                <button className='route-editor-footer-action-button' onClick={this.props.onClose}>
                    <img className='route-editor-footer-undo-icon' src={undoIcon}/>
                </button>   
                <button className='route-editor-footer-action-button' onClick={this.props.onClose}>
                    <img className='route-editor-footer-check-icon' src={checkIcon}/>
                </button>
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
