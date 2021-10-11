import React, { Component } from 'react';
import zoomInIcon from './assets/plus.svg';
import zoomOutIcon from './assets/minus.svg';
import checkIcon from './assets/check.svg';
import undoIcon from './assets/undo.svg';
import fxIcon from './assets/fx.svg';
import directionDown from './assets/directionDown.svg';
import directionUp from './assets/directionUp.svg';

export default class Footer extends Component {

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
        return <img src={directionUp} className='route-editor-footer-dropdown-icon-img'/>
    }

    renderDropDown() {
        return (
            <div className='route-editor-footer-dropdown-wrapper'>
                <span className='route-editor-footer-dropdown-icon'>{this.getDropDownIcon()}</span>
                <span className='route-editor-footer-dropdown-content'>
                    <span className='route-editor-footer-dropdown-label'>{'נתיב:'}</span>
                    <div>dropDown</div>
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
                    <span>תכנן</span>
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
