import React, {Component} from 'react';
import './RouteEditor.css';
import i18next from 'i18next';
import hebTranslation from './i18n/he-IL.json';
import engTranslation from './i18n/en-US.json';
import {SubscriptionsHOC} from "@elbit/light-client-app";
import config from './config';
import {appConfig} from '~/app-config';

import closeIcon from './assets/close.svg';
import Footer from './Footer';
import Chart from './Chart';
import ParticipateList from './ParticipateList';

export const routeOptions = {
    forward: 'forward',
    back: 'back',
    patrol: 'patrol',
    forwardBack: 'forwardBack'
}

export const navDirectionMapper = {
    forward: 1,
    back: 2,
    patrol: 3
}

class RouteEditor extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedDroneId: config.ALL,
            arrowClickCounter: 0,
            selectedRouteDirection: routeOptions.forward,
            isDataReady: false
        }
    }

    componentDidMount() {
        this.setSnames();
        this.initTranslation();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.subscriptionResults !== this.props.subscriptionResults) {
            this.setData();
        }
    }

    getSubscriptionResults = (subscriptionResults) => {
        if(subscriptionResults === undefined) {
            return null;
        }
        return Object.values(subscriptionResults.toJS());
    }

    setData = (subscriptionResults = this.props.subscriptionResults) => {
        const entities = this.getSubscriptionResults(subscriptionResults);
        if (!entities) {
            return null;
        }

        this.buildDataTree(entities);
    }

    setSnames() {
        const {mission, navPlan, player, virtualPlayer, waypoint} = this.props.additionalData.snames || {};

        this.missionSname = mission || config.snames.missionSname;
        this.navPlanSname = navPlan || config.snames.navPlanSname;
        this.playerSname = player || config.snames.playerSname;
        this.virtualPlayerSname = virtualPlayer || config.snames.virtualPlayerSname;
        this.waypointSname = waypoint || config.snames.waypointSname;
    }

    initTranslation = () => {

        let lng = 'he-IL';
        if (appConfig && appConfig.getValueKey('language')) {
            lng = appConfig.getValueKey('language');
        }

        this.translator = i18next.createInstance({
            interpolation: {escapeValue: false},
            lng,
            resources: {
                'en-US': engTranslation,
                'he-IL': hebTranslation
            },
        }, (err, t) => {
            this.setState(({
                isTranslatorReady: true
            }))
        });

    }

    buildDataTree = entities => {

        // data will be arragened as follow:
        // waypoints -> navPlanId -> navPlan -> linkedPlayerOrDestinationPoint(playerId) -> player -> virtualPlayer

        const entsIdToEntsMap = {}; //all entites as map for better perfomance when building the data stucture
        const navPlansToWaypointsMap = {};
        const playerToVirtualPlayerMap = {};
        const virtualPlayerToNavPlansMap = {};
        const virtualPlayerToColorMap = {};

        entities.forEach(ent => {
            entsIdToEntsMap[ent._id] = ent;

            if (ent.sname === this.waypointSname && ent.navPlan && ent.navPlan._id) {
                if (navPlansToWaypointsMap[ent.navPlan._id]) {
                    navPlansToWaypointsMap[ent.navPlan._id].push(ent);
                } else {
                    navPlansToWaypointsMap[ent.navPlan._id] = [ent];
                }
            }

            if (ent.sname === this.virtualPlayerSname &&
                ent.autonomyBase &&
                ent.autonomyBase.playerHolder &&
                ent.autonomyBase.playerHolder.player &&
                ent.autonomyBase.playerHolder.player._id) {
                playerToVirtualPlayerMap[ent.autonomyBase.playerHolder.player._id] = ent;
            }

        })

        for (key in navPlansToWaypointsMap) {
            const navPlan = entsIdToEntsMap[key];
            if (navPlan && navPlan.linkedPlayerOrDestinationPoint && navPlan.linkedPlayerOrDestinationPoint._id) {
                const vPlayerId = playerToVirtualPlayerMap[navPlan.linkedPlayerOrDestinationPoint._id]._id;
                if (virtualPlayerToNavPlansMap[vPlayerId]) {
                    virtualPlayerToNavPlansMap[vPlayerId].push(navPlan)
                } else {
                    virtualPlayerToNavPlansMap[vPlayerId] = [navPlan]
                }
            }
        }

        //set player color
        Object.keys(virtualPlayerToNavPlansMap).map((vPlayerId, index) => {
            virtualPlayerToColorMap[vPlayerId] =  config.dronesColor[index];
        })

        this.entsIdToEntsMap = entsIdToEntsMap;
        this.navPlansToWaypointsMap = navPlansToWaypointsMap;
        this.playerToVirtualPlayerMap = playerToVirtualPlayerMap;
        this.virtualPlayerToNavPlansMap = virtualPlayerToNavPlansMap;
        this.virtualPlayerToColorMap = virtualPlayerToColorMap;

        this.setState({isDataReady: true});
    }


    renderHeader() {
        return (
            <div className='route-editor-header'>
                <span className='route-editor-header-label'>{this.translator.t('sideCut')}</span>
                <button className='route-editor-header-close-button' onClick={() => this.props.layoutAPI.removeContent({contentId: this.props.id})}>
                    <img className='route-editor-header-close-icon' src={closeIcon}/>
                </button>
            </div>
        )
    }

    getSelectedDroneClass = id => {
        return id === this.state.selectedDroneId ? 'participates-button-selected' : '';
    }


     renderParticipateList() {
        return <ParticipateList
                    translator={this.translator}
                    virtualPlayerToNavPlansMap={this.virtualPlayerToNavPlansMap}
                    getSelectedDroneClass={this.getSelectedDroneClass}
                    selectDrone={vPlayerId => this.setState({selectedDroneId: vPlayerId})}
                    selectedDroneId={this.state.selectedDroneId}
                    virtualPlayerToColorMap = {this.virtualPlayerToColorMap}
                    entsIdToEntsMap={this.entsIdToEntsMap}
                />
    }

    renderChart() {
        return <Chart
                    selectedDroneId={this.state.selectedDroneId}
                    entsIdToEntsMap={this.entsIdToEntsMap}
                    navPlansToWaypointsMap={this.navPlansToWaypointsMap}
                    playerToVirtualPlayerMap={this.playerToVirtualPlayerMap}
                    virtualPlayerToNavPlansMap = {this.virtualPlayerToNavPlansMap}
                    virtualPlayerToColorMap = {this.virtualPlayerToColorMap}
                    selectedRouteDirection={this.state.selectedRouteDirection}
                    setChartInstance={getChartInstance => this.getChartInstance = getChartInstance}
                />
    }

    onDropDownSelect = selectedRouteDirection => {
        this.setState({selectedRouteDirection})
    }

    renderFooter() {
        return (
            <Footer
                translator={this.translator}
                dropDownOptionsKeys={routeOptions}
                onDropDownSelect={this.onDropDownSelect}
                selectedDropdownItem={this.state.selectedRouteDirection}
            />
        );
    }

    render() {
        if (!this.state.isDataReady || !this.state.isTranslatorReady) return null;

        return (
            <div className='route-editor-wrapper'>
                {this.renderHeader()}
                {this.renderParticipateList()}
                {this.renderChart()}
                {this.renderFooter()}
            </div>
        )
    }
}
export default SubscriptionsHOC(RouteEditor)