import React, {Component} from 'react';
import './RouteEditor.css';
import i18next from 'i18next';
import hebTranslation from './i18n/he-IL.json';
import engTranslation from './i18n/en-US.json';
import ausTranslation from './i18n/en-AU.json';
import {Globals, SubscriptionsHOC} from "@elbit/light-client-app";
import config from './config';
import {appConfig} from '~/app-config';
import closeIcon from './assets/close.svg';
import Footer from './Footer';
import Chart from './Chart';
import ParticipateList from './ParticipateList';
import Draggable from 'react-draggable';
import ldsh from 'lodash';

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

export const reactSelectMenuOptions = {
    open: 'open',
    close: 'close'
}

class RouteEditor extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedDroneId: config.ALL,
            arrowClickCounter: 0,
            selectedRouteDirection: routeOptions.forwardBack,
            isDataReady: false,
            isChartHasChanges: false,
            isNavPlanningCommandAvailable: false,
            isHideChartPoints: false,
            reactSelectMenuOption: reactSelectMenuOptions.close
        }
        this.chartContainerRef = React.createRef();
    }

    componentDidMount() {
        this.setSnames();
        this.initTranslation();
        this.setNavPlanningCommand();
    }

    onResize = e => {
        console.log(e);
    }

    setNavPlanningCommand() {
        const {additionalData} = this.props;

        const commnadSname = additionalData && additionalData.snames && additionalData.snames.updateNavPlansCommandSname;
        if (!commnadSname) return;

        this.navPlanningCommand = Globals.get().clientFacade.createCommand(commnadSname, {})
    }


    getNavPlanDirection(navPlanEnt) {
        let direction = routeOptions.forwardBack;

        if (config.partrolRouteTypes.includes(navPlanEnt.navPlanType)) {
            direction = routeOptions.patrol;
        } else if (navPlanEnt.direction === navDirectionMapper[routeOptions.forward]) {
            direction = routeOptions.forward;
        } else if (navPlanEnt.direction === navDirectionMapper[routeOptions.back]) {
            direction = routeOptions.back;
        }

        return direction;
    }

    setContextEntityInState() {
        // we can set here navPlan (back, forward or patrol), and / or player and / or vPlayer

        const {additionalData : {contextId = null}} = this.props;
        if (!contextId) return;

        const contextEntity = this.entsIdToEntsMap[contextId];

        switch (contextEntity.sname) {
            case this.navPlanSname: {
                //navPlan -> linkedPlayerOrDestinationPoint(playerId) -> player -> virtualPlayer
                const playerId = ldsh.get(contextEntity, 'linkedPlayerOrDestinationPoint._id');
                if (!playerId) return;
                const vPlayer = this.playerToVirtualPlayerMap[playerId];
                if (!vPlayer) return;

                this.setState({
                    selectedDroneId: vPlayer._id,
                    selectedRouteDirection: this.getNavPlanDirection(contextEntity)
                })

                break;
            }
            case this.playerSname: {
                const vPlayer = this.playerToVirtualPlayerMap[contextEntity._id];
                if (!vPlayer) return;

                this.setState({
                    selectedDroneId: vPlayer._id,
                })

                break;
            }
            case this.virtualPlayerSname: {
                this.setState({
                    selectedDroneId: contextEntity._id,
                })
                break;
            }

            default:
                break;
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.subscriptionResults !== this.props.subscriptionResults) {
            this.setData();
        }

        if (prevState.selectedDroneId !== this.state.selectedDroneId ||
            prevState.selectedRouteDirection !== this.state.selectedRouteDirection
        ) {
            this.updateChartChangesFlag(false);
        }

        if (!prevState.isDataReady && this.state.isDataReady) {
            this.setContextEntityInState()
        }
    }

    getSubscriptionResults = (subscriptionResults) => {
        if(subscriptionResults === undefined) {
            return null;
        }
        return Object.values(subscriptionResults.toJS());
    }

    setData = () => {
        const entities = this.getSubscriptionResults(this.props.subscriptionResults);
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
                'he-IL': hebTranslation,
                'en-AU': ausTranslation
            },
        }, (err, t) => {
            this.setState(({
                isTranslatorReady: true
            }))
        });
    }

    buildDataTree = entities => {

        // data will be arranged as follow:
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

            if (ent.sname === this.missionSname) {
                this.mission = ent;
                const isNavPlanningCommandAvailable = this.navPlanningCommand.isAvailable(Globals.get(), null,this.mission._id);
                if (this.state.isNavPlanningCommandAvailable !== isNavPlanningCommandAvailable) {
                    this.setState({isNavPlanningCommandAvailable})
                }
            }
        })

        for (const key in navPlansToWaypointsMap) {
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
                <span className='route-editor-header-label'>
                    {this.translator.t('sideCut')}
                    {this.mission ? <span className='route-editor-header-description'> - {this.mission.appX.base.dispName}</span> : null}
                </span>
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
                    chartConainer={this.chartContainerRef}
                />
    }

    updateChartChangesFlag = (isChartHasChanges) => {
        if (isChartHasChanges !== this.state.isChartHasChanges) {
            if (!isChartHasChanges) {
                this.chartContainerRef.current.newWaypointsHeight = {};
            }
            this.setState({isChartHasChanges});
        }
    }

    renderChart() {
        return <Chart
                    selectedDroneId={this.state.selectedDroneId}
                    entsIdToEntsMap={this.entsIdToEntsMap}
                    mission={this.mission}
                    navPlansToWaypointsMap={this.navPlansToWaypointsMap}
                    playerToVirtualPlayerMap={this.playerToVirtualPlayerMap}
                    virtualPlayerToNavPlansMap = {this.virtualPlayerToNavPlansMap}
                    virtualPlayerToColorMap = {this.virtualPlayerToColorMap}
                    selectedRouteDirection={this.state.selectedRouteDirection}
                    ref={this.chartContainerRef}
                    updateChartChangesFlag={this.updateChartChangesFlag}
                    isHideChartPoints={this.state.isHideChartPoints}
                    maxAmslAltitude={this.props.additionalData.maxAmslAltitude}
                />
    }

    onDropDownSelect = selectedRouteDirection => {
        this.setState({selectedRouteDirection})
    }

    onExecuteNavPlanningCommand = () => {
        if (!this.navPlanningCommand) return;

        const {selectedDroneId} = this.state;

        const params = {
            entityId: this.mission._id,
            playerId: ldsh.get(this.entsIdToEntsMap[selectedDroneId], 'autonomyBase.playerHolder.player._id'),
            virtualPlayerId: selectedDroneId
        }
        this.navPlanningCommand.setParams(params);
        this.navPlanningCommand.execute();
    }

    renderFooter() {
        return (
            <Footer
                selectedDroneId={this.state.selectedDroneId}
                virtualPlayerToNavPlansMap = {this.virtualPlayerToNavPlansMap}
                chartConainer={this.chartContainerRef}
                translator={this.translator}
                dropDownOptionsKeys={routeOptions}
                onDropDownSelect={this.onDropDownSelect}
                selectedDropdownItem={this.state.selectedRouteDirection}
                executeNavPlanningCommand={this.onExecuteNavPlanningCommand}
                isNavPlanningCommandAvailable={this.state.isNavPlanningCommandAvailable}
                refetchData={this.refetchChartData}
                isChartHasChanges={this.state.isChartHasChanges}
                updateChartChangesFlag={this.updateChartChangesFlag}
                isHideChartPoints={this.state.isHideChartPoints}
                toggleHideChartPoints={() => this.setState({isHideChartPoints: !this.state.isHideChartPoints})}
                handleMenuAction={actionType => this.setState({reactSelectMenuOption: actionType})}
            />
        );
    }

    render() {
        if (!this.state.isDataReady || !this.state.isTranslatorReady) return null;

        const reactSelectMenuOpenClass = this.state.reactSelectMenuOption === reactSelectMenuOptions.open ? 'react-select-menu-open' : '';

        return (
                <Draggable handle={'.route-editor-header'} bounds={'body'}>
                    <div className={`route-editor-wrapper ${reactSelectMenuOpenClass}`} onResize={this.onResize}>
                        {this.renderHeader()}
                        {this.renderParticipateList()}
                        {this.renderChart()}
                        {this.renderFooter()}
                    </div>
                </Draggable>
        )
    }
}
export default SubscriptionsHOC(RouteEditor)