import React, { Component } from 'react'
import { Scatter as Line, Chart } from 'react-chartjs-2';
import zoomPlugin from "chartjs-plugin-zoom";
import dragdataPlugin from "chartjs-plugin-dragdata";
import {getNavPlanImage, imagePointTypes, getPolylineHights} from "./chartUtils";
import {routeOptions, navDirectionMapper} from "./RouteEditor";
import config from "./config";
import {Globals} from "@elbit/light-client-app";
import {Enum} from '~/enums-client';
import {DisplayDataHandler} from '~/converter-mngr';
import ldsh from 'lodash';
import {LightMapInterface} from '~/map';

const {geo} = require('@elbit/js-geo');

export default class RouteChart extends Component {

    constructor(props) {
        super(props);
        this.setOptions();

        this.isDraggingPoint = false;
        this.chartRef = React.createRef();
        this.newWaypointsHeight = {};
        this.state = {
            navPlanPolylinePoints: null
        }
    }

    setOptions = () => {
        const gridFirstLineColor = '#7C838F';
        const gridLineColor = '#525761';

        this.options = {
            /*responsive: true,*/
            hover: {
                mode: 'dataset'
            },
            animation: {
                //duration: 0
            },
            datasets: {
                scatter: {
                    borderWidth: 2.5,
                    fill: false,
                    pointRadius: 10,
                    pointHitRadius: 15,
                    showLine: true
                }
            },
            layout: {
                padding: {
                    left: 20,
                    right: 20,
                    top: 20,
                    bottom: 10
                }
            },
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    //mode: 'nearest',
                    yAlign: 'bottom',
                    borderColor: '#bab4cab5',
                    borderWidth: 0.5,
                    textDirection: 'ltr',
                    displayColors: false,
                    filter: (tooltipItem, data) => {
                      return tooltipItem.dataset.identifier === config.dataSetDTMIdentifier ? false : true
                    },
                    callbacks: {
                        title: (tooltipItem, data) => {
                            return this.getTooltipTitle(tooltipItem,data)
                        },
                        label: (tooltipItem, data) => {
                            return  tooltipItem &&
                                    tooltipItem.parsed &&
                                    tooltipItem.parsed.y &&
                                    DisplayDataHandler.parse({type:Enum.fieldType.altitude , data: Math.round(tooltipItem.parsed.y) ,fieldMetadata: {hideLabel: false}}) + '\u0027' + ' AMSL';
                        },
                        labelTextColor: (context) => '#c2c5cb',
                    }
                },
                legend: {
                    display: false
                },
                zoom: {
                    limits: {
                        x: {min: 0, max: 'original'},
                        y: {min: 0, max: 'original'}
                        //y: {min: 0, max: this.props.maxAmslAltitude ? this.props.maxAmslAltitude * config.chartYaxisMaxFactor : 'original'}
                    },
                    zoom: {
                        wheel: {
                            enabled: true // SET SCROOL ZOOM TO TRUE
                        },
                        mode: "xy",
                        speed: 20
                    },
                    pan: {
                        enabled: true,
                        //mode: "xy",
                        mode: (event) => {
                            if (!this.isDraggingPoint) {
                                return 'xy'
                            } else return ''
                        },
                        /*rangeMin: {
                            y: 0,
                            x: 0
                        },
                        rangeMax: {
                            y: 10,
                        },*/
                        speed: 100
                    }
                },
                dragData: {
                    round: 1,
                    showTooltip: true,
                    onDragStart: (e, datasetIndex, index, value) => {
                        return this.onDragStart(e, datasetIndex, index, value);
                    },
                    onDrag: (e, datasetIndex, index, value) => {
                        this.onDrag(e, datasetIndex, index, value);
                    },
                    onDragEnd: (e, datasetIndex, index, value) => {
                        this.onDragEnd(e, datasetIndex, index, value);
                    },
                }
            },
            scales: {
                y: {
                    title: {
                        display: false,
                        text: 'meters',
                        align: 'start'
                    },
                    beginAtZero: true,
                    ticks: {
                        stepSize: 100,
                        callback: function(value, index) {
                            if (index === 0) {
                                return DisplayDataHandler.buildBtypeMembers({ field: { value: 0, type: Enum.fieldType.altitude } }).shortName;
                            }
                            const parsedValue = DisplayDataHandler.parse({type:Enum.fieldType.altitude , data: Math.round(value),  fieldMetadata: {hideLabel: false}});
                            return Math.round(parsedValue)
                        },
                        color: 'rgba(255,255,255,0.7)',
                        font: {
                            size: 12,
                            weight: 'lighter',
                        },
                    },
                    grid: {
                        drawBorder: false,
                        color: (ctx) => {
                            if (ctx.index === 0) return gridFirstLineColor;
                            return gridLineColor
                        },
                    },
                    suggestedMax: this.props.selectedDroneId !== config.ALL ? this.props.maxAmslAltitude * config.chartYaxisMaxFactor : 0
                },
                x: {
                    //offset: true,
                    beginAtZero: true,
                    max: (event) => {
                        let maxValue = 0;
                        event.chart.data.datasets.forEach(dataSet => {
                            if (!dataSet.data) return;
                            dataSet.data.forEach(point => {
                                if (point.x > maxValue) {
                                    maxValue = point.x;
                                }
                            })
                        })
                        return maxValue * config.chartXaxisMaxFactor;
                    },
                    ticks: {
                        callback: (value, index) => {
                            if (index === 0) {
                                return DisplayDataHandler.buildBtypeMembers({ field: { value: 0, type: Enum.fieldType.distance } }).shortName;
                            }
                            const parsedValue = DisplayDataHandler.parse({type:Enum.fieldType.distance , data: Math.round(value),  fieldMetadata: {hideLabel: false}});
                            return Math.round(parsedValue)
                        },
                        color: 'rgba(255,255,255,0.7)',
                        font: {
                            size: 12,
                            weight: 'lighter'
                        },
                    },
                    grid: {
                        color:  (ctx) => {
                            if (ctx.index === 0) return gridFirstLineColor;
                            return gridLineColor
                        },
                    }
                },
            },
        };
    }

    onDragStart = (e, datasetIndex, index, value) => {
        const {mission, selectedDroneId} = this.props;

        setTimeout(() => {
            this.selectOnMap(value.waypoint || value);
        }, 100)

        this.isDraggingPoint = true;
        if (selectedDroneId === config.ALL || value.isPlayer || value.isStartPoint || value.isEndPoint) {
            setTimeout(() => this.isDraggingPoint = false,0)
            return false
        };


        if (this.isPatrolWaypoint(value.waypoint)) {
            this.minLimitPoint = mission.heightAMSLConstraint && mission.heightAMSLConstraint.minHeight || 0;

        } else {
            const dtmDataSet = this.chartRef.current.data.datasets.find(ds => ds.identifier === config.dataSetDTMIdentifier);
            const dtmOnPoint =  dtmDataSet && dtmDataSet.data.find(point => Math.round(point.x) === Math.round(value.x));
            const offset = mission.heightOfSafetyAboveGround  || 0;
            this.minLimitPoint = (dtmOnPoint && dtmOnPoint.y || 0) + offset;
        }
    }

    onDrag = (e, datasetIndex, index, value) => {
        e.target.style.cursor = 'grabbing';
        
        if (value.y <= this.minLimitPoint) {
            this.chartRef.current.data.datasets[datasetIndex].data[index].y = this.minLimitPoint;
        } else if (value.y > this.props.maxAmslAltitude) {
            this.chartRef.current.data.datasets[datasetIndex].data[index].y = this.props.maxAmslAltitude;
        }
    }

    onDragEnd = (e, datasetIndex, index, value) => {
        e.target.style.cursor = 'default'
        this.isDraggingPoint = false;
        this.minLimitPoint = null;
        if (value.waypoint) {
            // we will save the AGL. calc by newAmsl - DTM

            const dtm = this.chartRef.current.data.datasets.find(ds => ds.identifier === config.dataSetDTMIdentifier)
            const dtmPoint = dtm.data.find(point => point.x === value.x);

            this.newWaypointsHeight[value.waypoint._id] = {
                newHeightAGL: Math.round(value.y - dtmPoint.y),
                newHeightAMSL: value.y,
                waypoint: value.waypoint
            };
            this.props.updateChartChangesFlag(true);
        }
    }

    getPlayerTooltipItem = item => {
        return 'Player ' + item.raw.playerDispName
    }

    getTooltipTitle = (tooltipItem, data) => {
        if (tooltipItem) {
            let title = '';
            tooltipItem.forEach((item, i) => {
                const itemTitle = ldsh.get(item, 'raw.isPlayer') ?  this.getPlayerTooltipItem(item) : ldsh.get(item, 'raw.waypoint.appX.base.dispName');
                if (i === 0) {
                    title = itemTitle;
                } else {
                    title += ', ' + itemTitle;
                }
            })
            return title;
        }
    }

    selectOnMap = ent => {
        LightMapInterface.indicateMapPosition({
            id: ent._id,
            hideIndication: false,
            isMultipleSelection: true,
            notNotifyMultiSelect: true
        });
    }

    isPatrolWaypoint = (waypoint) => {
        let isPatrolWP = false;
        if (waypoint && waypoint.navPlan) {
            const linkedNavPlan = this.props.entsIdToEntsMap[waypoint.navPlan._id];
            if (config.partrolRouteTypes.includes(linkedNavPlan.navPlanType)) {
                isPatrolWP = true;
            }
        }
        return isPatrolWP;
    }

    componentDidMount = () => {
        Chart.register(zoomPlugin);
        Chart.register(dragdataPlugin);
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        const {
            selectedDroneId,
            entsIdToEntsMap,
            mission,
            navPlansToWaypointsMap,
            playerToVirtualPlayerMap,
            virtualPlayerToNavPlansMap,
            selectedRouteDirection,
            isHideChartPoints,
            isChartLoading
        } = nextProps;

        if (this.props.selectedDroneId !==  selectedDroneId ||
            this.props.selectedRouteDirection !==  selectedRouteDirection) {
            this.newWaypointsHeight = {};
        }


        if ((this.props.selectedDroneId !==  selectedDroneId ||
            this.props.selectedRouteDirection !==  selectedRouteDirection ||
            this.props.entsIdToEntsMap !==  entsIdToEntsMap ||
            this.props.navPlansToWaypointsMap !==  navPlansToWaypointsMap ||
            this.props.playerToVirtualPlayerMap !==  playerToVirtualPlayerMap ||
            this.props.virtualPlayerToNavPlansMap !==  virtualPlayerToNavPlansMap ||
            this.props.isHideChartPoints !== isHideChartPoints ||
            this.props.isChartLoading != isChartLoading
            //this.props.mission !==  mission
        ) || this.state !== nextState) {
            return true;
        }
        return false
    }

    selectNavPlanOnMap() {
        const {selectedRouteDirection, selectedDroneId, virtualPlayerToNavPlansMap} = this.props;

        const navPlanArr = virtualPlayerToNavPlansMap[selectedDroneId] || [];
        if (selectedRouteDirection !== routeOptions.forwardBack) {
            const navPlan = this.getNavPlanByDirection(navPlanArr, selectedRouteDirection);
            navPlan && this.selectOnMap(navPlan);
        } else {
            Object.keys(routeOptions).forEach(option => {
                if (option !== routeOptions.forwardBack) {
                    const navPlan = this.getNavPlanByDirection(navPlanArr, option);
                    navPlan && this.selectOnMap(navPlan);
                }
            })
        }

    }

    componentDidUpdate(prevProps, prevState) {
        if (
            (prevProps.selectedDroneId !== this.props.selectedDroneId) ||
            (prevProps.selectedRouteDirection !== this.props.selectedRouteDirection)
        ) {
            this.chartRef.current && this.chartRef.current.resetZoom();
            this.setOptions();
            //get NavPlan DTM if needed
            if (this.props.selectedDroneId !== config.ALL) {
                this.setState({navPlanPolylinePoints: null}, () => this.getNavPlanDTMPoints());
                this.selectNavPlanOnMap();
            } else {
                this.setState({navPlanPolylinePoints: null});
            }
        }
    }

    async getNavPlanDTMPoints() {

        const {virtualPlayerToNavPlansMap, selectedRouteDirection, selectedDroneId} = this.props;
        const navPlanArr = virtualPlayerToNavPlansMap[selectedDroneId];

        let navPlanPolylinePoints = [];

        if (selectedRouteDirection !== routeOptions.forwardBack) {
            const navPlan = this.getNavPlanByDirection(navPlanArr, selectedRouteDirection);
            if (navPlan) {
                navPlanPolylinePoints = await Globals.g.map.getHeightsAlongLine(geo.serializer.deserializePosition(navPlan.appX.base.position, 0));
            }
        } else {
            if (!navPlanArr) return;
            const navPlanForward = navPlanArr.find(nav => nav.direction === navDirectionMapper[routeOptions.forward]);
            const navPlanPatrol =  navPlanArr.find(nav => config.partrolRouteTypes.includes(nav.navPlanType));
            const navPlanBack = navPlanArr.find(nav => nav.direction === navDirectionMapper[routeOptions.back]);

            const navPlanForwardPos = navPlanForward && navPlanForward.appX.base.position;
            const navPlanPatrolPos =  navPlanPatrol && navPlanPatrol.appX.base.position;
            const navPlanBackPos = navPlanBack && navPlanBack.appX.base.position;

            const navPlans = [];

            if (navPlanForwardPos) navPlans.push(Globals.g.map.getHeightsAlongLine(geo.serializer.deserializePosition(navPlanForwardPos, 0)));
            if (navPlanPatrolPos) navPlans.push(Globals.g.map.getHeightsAlongLine(geo.serializer.deserializePosition(navPlanPatrolPos, 0)));
            if (navPlanBackPos) navPlans.push(Globals.g.map.getHeightsAlongLine(geo.serializer.deserializePosition(navPlanBackPos, 0)));

            const response = await Promise.all(navPlans);
            navPlanPolylinePoints = response.reduce((previousValue, currentValue) => [...previousValue, ...currentValue],[])
        }


        this.setState({navPlanPolylinePoints});
    }

    getCoordinate(position) {
        const [x,y,z] = position.geometry.coordinates;
        return new geo.coordinate(x,y,z);
    }

    getNavPlanByDirection(navPlanArr, selectedRouteDirection) {
        if (selectedRouteDirection === routeOptions.patrol) {
            return navPlanArr.find(nav => config.partrolRouteTypes.includes(nav.navPlanType))
        }
        return navPlanArr.find(nav => nav.direction === navDirectionMapper[selectedRouteDirection])
    }

    markAndSortNavPlanPointsByType(waypoints, type) {
        return waypoints.map(wp => ({...wp, pointChartType: type})).sort((a,b) => a.index - b.index);
    }

    getNavPlanWaypoints(navPlanArr, selectedRouteDirection, navPlansToWaypointsMap) {
            const navPlanForward = navPlanArr.find(nav => nav.direction === navDirectionMapper[routeOptions.forward]);
            const navPlanPatrol =  navPlanArr.find(nav => config.partrolRouteTypes.includes(nav.navPlanType));
            const navPlanBack = navPlanArr.find(nav => nav.direction === navDirectionMapper[routeOptions.back]);

            const forwardPointsArr = navPlanForward && navPlanForward._id && navPlansToWaypointsMap[navPlanForward._id] || [];
            const patrolPointsArr = navPlanPatrol && navPlanPatrol._id && navPlansToWaypointsMap[navPlanPatrol._id] || [];
            const backPointsArr = navPlanBack && navPlanBack._id && navPlansToWaypointsMap[navPlanBack._id] || [];

            const sortedForwardPoints = this.markAndSortNavPlanPointsByType(forwardPointsArr, routeOptions.forward);
            const sortedPatrolPoints = this.markAndSortNavPlanPointsByType(patrolPointsArr, routeOptions.patrol);
            const sortedBackPoints = this.markAndSortNavPlanPointsByType(backPointsArr, routeOptions.back);

            return [
                ...sortedForwardPoints,
                ...sortedPatrolPoints,
                ...sortedBackPoints
            ]
    }

    getNavPlanLinkedPlayerPositionAndDispName(navPlanArr, selectedRouteDirection) {

        const res = {
            playerPosition: null,
            playerDispName: null,
            playerId: null
        }

        const direction = selectedRouteDirection === routeOptions.forwardBack ? routeOptions.forward : selectedRouteDirection;
        const navPlan = this.getNavPlanByDirection(navPlanArr, direction);

        if (navPlan && navPlan.linkedPlayerOrDestinationPoint && navPlan.linkedPlayerOrDestinationPoint._id) {
            const player = this.props.entsIdToEntsMap[navPlan.linkedPlayerOrDestinationPoint._id];
            if (player) {
                res.playerId = player._id;
                res.playerDispName = player.appX.base.dispName;
                res.playerPosition = geo.serializer.deserializePosition(player.appX.base.position, geo.returnTypeEnum.geoJson);
            }
        }

        return res;
    }

    getClosetsSegmentToPlayer = (playerPosition, prevPosition, position, i, vector, closetsSegmentToPlayer) => {

        if (playerPosition) {
            const vectorFromPrevWaypointToPlayer = geo.geometricCalculations.vectorFromTwoLocations(this.getCoordinate(prevPosition), this.getCoordinate(playerPosition));
            const vectorFromPlayerToCurrentWaypoint = geo.geometricCalculations.vectorFromTwoLocations(this.getCoordinate(playerPosition), this.getCoordinate(position));

            const diffFromSegment = (vectorFromPrevWaypointToPlayer.distance + vectorFromPlayerToCurrentWaypoint.distance) - vector.distance;

            if (closetsSegmentToPlayer.afterWaypoint == null) {
                closetsSegmentToPlayer.afterWaypoint = i -1;
                closetsSegmentToPlayer.diff = diffFromSegment;
                closetsSegmentToPlayer.vectorFromWaypointToPlayer = vectorFromPrevWaypointToPlayer;
                closetsSegmentToPlayer.vectorFromPlayerToWaypoint = vectorFromPlayerToCurrentWaypoint;
            } else if (diffFromSegment < closetsSegmentToPlayer.diff) {
                closetsSegmentToPlayer.afterWaypoint = i -1;
                closetsSegmentToPlayer.diff = diffFromSegment;
                closetsSegmentToPlayer.vectorFromWaypointToPlayer = vectorFromPrevWaypointToPlayer;
                closetsSegmentToPlayer.vectorFromPlayerToWaypoint = vectorFromPlayerToCurrentWaypoint;
            }
        }
    }

    getNavPlanDTMDataSet = () => {
        const {navPlanPolylinePoints} = this.state;
        let totalNavPlanLength = 0;

        const navPlanDTMPoints = navPlanPolylinePoints.map((point, i) => {

            if (i !== 0) {
                const vector = geo.geometricCalculations.vectorFromTwoLocations(
                    new geo.coordinate(navPlanPolylinePoints[i-1].x , navPlanPolylinePoints[i-1].y , navPlanPolylinePoints[i-1].z),
                    new geo.coordinate(point.x , point.y , point.z)
                );
                totalNavPlanLength += vector.distance;
            }

            const dtmChartPoint = {
                x: Math.round(totalNavPlanLength),
                y: point.z,
            }

            return dtmChartPoint;
        })

        const dataset = {
            identifier: config.dataSetDTMIdentifier,
            label: 'dtm',
            data: navPlanDTMPoints,
            borderColor: '#ff9c44',
            backgroundColor: '#8b572470',
            pointBorderColor: 'rgba(0,0,0,0)',
            pointBackgroundColor: 'rgba(0,0,0,0)',
            pointHoverBackgroundColor: 'rgba(0,0,0,0)',
            pointHoverBorderColor: 'rgba(0,0,0,0)',
            pointRadius: 0,
            pointHitRadius: 0,
            borderWidth: 1,
            fill: true,
            dragData: false,
            order: 2,
        }

        return dataset;
    }

    getBottomLimitPoint = (point, patrolStartX, patrolEndX) => {
        // if patrol waypoint then return mission.heightAMSLConstraint.minHeight  , else return mission mission.heightOfSafetyAboveGround
        const {mission} = this.props;
        if (!patrolStartX || !patrolEndX) return mission.heightOfSafetyAboveGround + point.y;

        return point.x >= patrolStartX && point.x <= patrolEndX ? mission.heightAMSLConstraint.minHeight : mission.heightOfSafetyAboveGround + point.y;

    }

    getPartolStartEndPoints = (navPlanDataSet) => {
        let patrolStartX = null, patrolEndX = null;

        navPlanDataSet && navPlanDataSet.data && navPlanDataSet.data.forEach(point => {
            if (point.waypoint && point.waypoint.pointChartType === routeOptions.patrol) {
                patrolEndX = point.x;
                if (point.waypoint.index === 0) {
                    patrolStartX = point.x;
                }
            }
        })

        return {patrolStartX, patrolEndX}
    }

    getNavPlanBottomLimitDataSet(navPlanDataSet, navPlanDTMDataSet) {

        const bottomLimitPoints = [];
        const {patrolStartX, patrolEndX} = this.getPartolStartEndPoints(navPlanDataSet);

        navPlanDTMDataSet && navPlanDTMDataSet.data && navPlanDTMDataSet.data.forEach(point => {
            const yLimit = this.getBottomLimitPoint(point, patrolStartX, patrolEndX)
            bottomLimitPoints.push({
                x: point.x,
                y: yLimit
            })
        })

        const dataset = {
            identifier: config.dataSetDTMIdentifier,
            label: 'bottomLimit',
            data: bottomLimitPoints,
            //borderColor: '#ff9c44',
            borderColor: '#e85454',
            backgroundColor: '#8b572470',
            pointBorderColor: 'rgba(0,0,0,0)',
            pointBackgroundColor: 'rgba(0,0,0,0)',
            pointHoverBackgroundColor: 'rgba(0,0,0,0)',
            pointHoverBorderColor: 'rgba(0,0,0,0)',
            pointRadius: 0,
            pointHitRadius: 0,
            //borderWidth: 2,
            //borderDash: [8,5],
            borderWidth: 3,
            borderDash: [1,6],
            borderCapStyle: 'round',
            dragData: false,
            order: 2,
        }

        return dataset;
    }

    getNavPlanUpperLimitDataSet(navPlanDataSet, navPlanDTMDataSet) {
        const {maxAmslAltitude} = this.props;
        let navPlanUpperLimitPoints = [];

        if (maxAmslAltitude) {
            const navPlanArr = navPlanDataSet.data || [];
            const dtmArr = navPlanDTMDataSet.data || [];

            navPlanUpperLimitPoints = [
                {
                    x: 0,
                    y: maxAmslAltitude
                },
                {
                    x: Math.max(dtmArr[dtmArr.length -1] && dtmArr[dtmArr.length -1].x || 0, navPlanArr[navPlanArr.length -1] && navPlanArr[navPlanArr.length -1].x || 0),
                    y: maxAmslAltitude
                }
            ]
        };

        const dataset = {
            identifier: config.dataSetDTMIdentifier,
            label: 'upperLimit',
            data: navPlanUpperLimitPoints,
            borderColor: '#F15858',
            backgroundColor: '#8b572470',
            pointBorderColor: 'rgba(0,0,0,0)',
            pointBackgroundColor: 'rgba(0,0,0,0)',
            pointHoverBackgroundColor: 'rgba(0,0,0,0)',
            pointHoverBorderColor: 'rgba(0,0,0,0)',
            pointRadius: 0,
            borderWidth: 3,
            borderDash: [1,6],
            borderCapStyle: 'round',
            dragData: false,
            order: 2,
        }

        return dataset;
    }

    getNavPlansWPCounts(sortedWaypoints) {
        return {
            [routeOptions.forward]: sortedWaypoints.filter(wp => wp.pointChartType === routeOptions.forward).length,
            [routeOptions.patrol]: sortedWaypoints.filter(wp => wp.pointChartType === routeOptions.patrol).length,
            [routeOptions.back]: sortedWaypoints.filter(wp => wp.pointChartType === routeOptions.back).length,
        }
    }

    getLatestWPHeightAMSL(waypoint) {
        const waypointChanges = this.newWaypointsHeight[waypoint._id];

        if (!waypointChanges) return waypoint.heightAMSL;
        if (waypointChanges.waypoint.appX.base.serverLut  ===  waypoint.appX.base.serverLut) return waypointChanges.newHeightAMSL;

        // waypoint.lut here must be bigger than the changed one. so remove the change and return the new one

        delete this.newWaypointsHeight[waypoint._id];
        return waypoint.heightAMSL;
    }

    isStartPoint(waypoint) {
        return waypoint.pointChartType === routeOptions.forward && waypoint.index === 0;
    }

    isEndPoint(waypoint, navPlansWPCounts) {
        return waypoint.pointChartType === routeOptions.back && waypoint.index === navPlansWPCounts[routeOptions.back] - 1;
    }

    isPatrolStartPoint(waypoint) {
        return waypoint.pointChartType === routeOptions.patrol && waypoint.index === 0;
    }

    isPatrolEndPoint(waypoint, navPlansWPCounts) {
        return waypoint.pointChartType === routeOptions.patrol && waypoint.index === navPlansWPCounts[routeOptions.patrol] - 1;
    }

    setPointTypeIconIndicator(chartPoint, waypoint, navPlansWPCounts) {

        if (this.isStartPoint(waypoint)) {
            chartPoint.isStartPoint = true;
        } else if (this.isEndPoint(waypoint, navPlansWPCounts)) {
            chartPoint.isEndPoint = true;
        } else if (this.isPatrolStartPoint(waypoint)){
            chartPoint.isStartPatrolPoint = true;
        } else if (this.isPatrolEndPoint(waypoint, navPlansWPCounts)) {
            chartPoint.isEndPatrolPoint = true;
        }
    }

    getNavPlanDataSet = vPlayerId => {

        const {virtualPlayerToNavPlansMap, navPlansToWaypointsMap, virtualPlayerToColorMap, selectedRouteDirection, isHideChartPoints} = this.props;

        const navPlanArr = virtualPlayerToNavPlansMap[vPlayerId] || [];
        const {playerPosition, playerDispName, playerId} = this.getNavPlanLinkedPlayerPositionAndDispName(navPlanArr, selectedRouteDirection);
        const sortedWaypoints = this.getNavPlanWaypoints(navPlanArr, selectedRouteDirection, navPlansToWaypointsMap) || [];
        const navPlansWPCounts = this.getNavPlansWPCounts(sortedWaypoints);

        let totalNavPlanLength = 0;
        let closetsSegmentToPlayer = {afterWaypoint: null, diff: null}
        const navPlanPoints = [];
        let navPointCount = 0;
        let playerDataSet = null;

        sortedWaypoints.forEach((waypoint, i) => {

            const position = geo.serializer.deserializePosition(waypoint.appX.base.position, geo.returnTypeEnum.geoJson);
            let vector = {};

            if (i !== 0) {
                const prevPosition = geo.serializer.deserializePosition(sortedWaypoints[i-1].appX.base.position, geo.returnTypeEnum.geoJson);
                vector = geo.geometricCalculations.vectorFromTwoLocations(this.getCoordinate(prevPosition), this.getCoordinate(position));

                this.getClosetsSegmentToPlayer(playerPosition, prevPosition, position, i, vector, closetsSegmentToPlayer);
            }

            if ([waypoint.pointChartType, routeOptions.forwardBack].includes(selectedRouteDirection)) {
                totalNavPlanLength += navPointCount === 0 ? 0 : vector.distance;

                const point = {
                    x: Math.round(totalNavPlanLength),
                    y: this.getLatestWPHeightAMSL(waypoint),
                    waypoint
                }

                this.setPointTypeIconIndicator(point, waypoint, navPlansWPCounts);

                navPlanPoints.push(point);
                navPointCount++;
            }
        })

        // set player point on the dataset
        if (playerPosition && closetsSegmentToPlayer.afterWaypoint) {
            const i = closetsSegmentToPlayer.afterWaypoint;
            if ([sortedWaypoints[i].pointChartType, routeOptions.forwardBack].includes(selectedRouteDirection)) {
                const j = navPlanPoints.findIndex(elem => elem.waypoint._id === sortedWaypoints[i]._id);

                const playerPoint = {
                    x: navPlanPoints[j].x +  closetsSegmentToPlayer.vectorFromWaypointToPlayer.distance,
                    y: playerPosition.geometry.coordinates[2],
                    isPlayer: true,
                    playerDispName,
                    _id: playerId
                }

                playerDataSet = {
                    label: `player ${vPlayerId}`,
                    order: 0,
                    data: [playerPoint],
                    pointRadius: 3,
                    pointStyle: function() {
                        return getNavPlanImage(imagePointTypes.drone, virtualPlayerToColorMap[vPlayerId])
                    }
                }
            }
        }

        const navPlanDataSet = {
            label: `data ${vPlayerId}`,
            order: 1,
            //clip: false,
            //clip: {left: 20, top: 0, right: 0, bottom: 0},
            data: navPlanPoints,
            borderColor: virtualPlayerToColorMap[vPlayerId],
            backgroundColor: virtualPlayerToColorMap[vPlayerId],
            pointRadius: isHideChartPoints ? 0 : 3,
            pointStyle: function(param) {
                if (isHideChartPoints) return false
                if (param.raw && param.raw.isStartPoint) {
                    return getNavPlanImage(imagePointTypes.start, virtualPlayerToColorMap[vPlayerId])
                } else if (param.raw && param.raw.isEndPoint) {
                    return getNavPlanImage(imagePointTypes.end, virtualPlayerToColorMap[vPlayerId])
                } else if (param.raw && param.raw.isStartPatrolPoint) {
                    return getNavPlanImage(imagePointTypes.patrolStart, virtualPlayerToColorMap[vPlayerId])
                } else if (param.raw && param.raw.isEndPatrolPoint) {
                    return getNavPlanImage(imagePointTypes.patrolEnd, virtualPlayerToColorMap[vPlayerId])
                } else if (param.raw && param.raw.isPlayer) {
                    return getNavPlanImage(imagePointTypes.drone, virtualPlayerToColorMap[vPlayerId])
                }
                return getNavPlanImage(imagePointTypes.regular, virtualPlayerToColorMap[vPlayerId])
            }
        }

        return {navPlanDataSet, playerDataSet};
    }

    pointBelowBottomLimit(point, navPlanBottomLimitDataSetMap) {
        let isPointBellowLimit = false;
        if (navPlanBottomLimitDataSetMap[point.raw.x] && point.raw.y < navPlanBottomLimitDataSetMap[point.raw.x]) {
            isPointBellowLimit = true;
        }

        return isPointBellowLimit;
    }   

    overrideNavPlanDataSetPointStyleForWarningPoint(navPlanDataSet, navPlanBottomLimitDataSet) {
        const {virtualPlayerToColorMap, isHideChartPoints, selectedDroneId: vPlayerId} = this.props;
        
        //for perfomance optimization go over the bottom limit dataset once and not each pointStyle callback execution
        const navPlanBottomLimitDataSetMap = navPlanBottomLimitDataSet && 
                                             navPlanBottomLimitDataSet.data && 
                                             navPlanBottomLimitDataSet.data.reduce((mapperObj, curr) => {
                                                mapperObj[curr.x] = curr.y;
                                                return mapperObj;
                                             },{});

        navPlanDataSet.pointStyle = param => {
            if (isHideChartPoints) return false;
            if (param.raw && param.raw.isStartPoint) {
                return getNavPlanImage(imagePointTypes.start, virtualPlayerToColorMap[vPlayerId])
            } else if (param.raw && param.raw.isEndPoint) {
                return getNavPlanImage(imagePointTypes.end, virtualPlayerToColorMap[vPlayerId])
            } else if (param.raw && param.raw.isStartPatrolPoint) {
                return getNavPlanImage(imagePointTypes.patrolStart, virtualPlayerToColorMap[vPlayerId])
            } else if (param.raw && param.raw.isEndPatrolPoint) {
                return getNavPlanImage(imagePointTypes.patrolEnd, virtualPlayerToColorMap[vPlayerId])
            } else if (param.raw && param.raw.isPlayer) {
                return getNavPlanImage(imagePointTypes.drone, virtualPlayerToColorMap[vPlayerId])
            }

            return this.pointBelowBottomLimit(param, navPlanBottomLimitDataSetMap) ? getNavPlanImage(imagePointTypes.regularWarning, virtualPlayerToColorMap[vPlayerId]) : getNavPlanImage(imagePointTypes.regular, virtualPlayerToColorMap[vPlayerId])
        }
    }

    getChartData = () => {
        let data = {};
        let datasets = [];
        const {selectedDroneId, virtualPlayerToNavPlansMap} = this.props;

        if (this.props.selectedDroneId === config.ALL) {
            Object.keys(virtualPlayerToNavPlansMap).forEach((vPlayerId) => {
                const {navPlanDataSet, playerDataSet}  = this.getNavPlanDataSet(vPlayerId)
                datasets.push(navPlanDataSet);
                if (playerDataSet) {
                    datasets.push(playerDataSet);
                }
            })
        } else {
            const {navPlanDataSet, playerDataSet} = this.getNavPlanDataSet(selectedDroneId)
            datasets.push(navPlanDataSet);
            if (playerDataSet) {
                datasets.push(playerDataSet);
            }
            const navPlanDTMDataSet = this.getNavPlanDTMDataSet();
            datasets.push(navPlanDTMDataSet);

            const navPlanBottomLimitDataSet = this.getNavPlanBottomLimitDataSet(navPlanDataSet, navPlanDTMDataSet)
            datasets.push(navPlanBottomLimitDataSet);
            datasets.push(this.getNavPlanUpperLimitDataSet(navPlanDataSet, navPlanDTMDataSet));

            this.overrideNavPlanDataSetPointStyleForWarningPoint(navPlanDataSet, navPlanBottomLimitDataSet);
        }

        data.datasets = datasets;
        return data;
    }

    renderLoader() {
        return (
            <div className='route-editor-chart-wrapper'>
                <div className='route-editor-loader-wrapper'>
                    <span className='route-editor-loader-icon'></span>
                </div>
            </div>
        )
    }

    render() {

        if (this.props.selectedDroneId !== config.ALL && !this.state.navPlanPolylinePoints) return this.renderLoader();

        const chartData = this.getChartData();
        const loaderClass = this.props.isChartLoading ? 'route-editor-chart-saving-loader' : ''

        return (
            <div className={`route-editor-chart-wrapper ${loaderClass}`}>
                    <Line
                        data={chartData}
                        options={this.options}
                        id='route-editor-canvas'
                        ref={this.chartRef}

                    />
            </div>
        )
    }
}