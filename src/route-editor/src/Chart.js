import React, { Component } from 'react'
import { Scatter as Line, Chart } from 'react-chartjs-2';
import zoomPlugin from "chartjs-plugin-zoom";
import dragdataPlugin from "chartjs-plugin-dragdata";
import {getNavPlanImage, imagePointTypes, getPolylineHights} from "./chartUtils";
import {routeOptions, navDirectionMapper} from "./RouteEditor";
import config from "./config";
import {Globals} from "@elbit/light-client-app";

const {geo} = require('@elbit/js-geo');

export default class RouteChart extends Component {

    constructor(props) {
        super(props);
        this.setOptions();

        this.isDraggingPoint = false;
        this.chartRef = React.createRef();
        this.state = {
            navPlanPolylinePoints: null
        }
    }

    setOptions = () => {
        const gridFirstLineColor = '#7C838F';
        const gridLineColor = '#525761';

        this.options = {
            /*responsive: true,*/
            datasets: {
                scatter: {
                    borderWidth: 2.5,
                    fill: false,
                    pointRadius: 10,
                    pointHitRadius: 20,
                    showLine: true
                }
            },
            layout: {
                padding: {
                    left: 20,
                    right: 10,
                    top: 20,
                    bottom: 10
                }
            },
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                zoom: {
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
                        rangeMin: {
                            y: 0,
                            x: 0
                        },
                        rangeMax: {
                            y: 10,
                        },
                        speed: 100
                    }
                },
                dragData: {
                    round: 1,
                    showTooltip: true,
                    onDragStart: (e, datasetIndex, index, value) => {
                        this.isDraggingPoint = true;
                        if (this.props.selectedDroneId === config.ALL || value.isPlayer) return false
                    },
                    onDrag: (e, datasetIndex, index, value) => {
                        e.target.style.cursor = 'grabbing'
                        //return this.onDragHandler(e, datasetIndex, index, value);
                        return false
                    },
                    onDragEnd: (e, datasetIndex, index, value) => {
                        e.target.style.cursor = 'default'
                        this.isDraggingPoint = false;
                    },
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return Math.round(value)
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
                    }
                },
                x: {
                    offset: false,
                    beginAtZero: true,
                    /*max: (event) => {
                        let maxValue = 0;
                        event.chart.data.datasets.forEach(dataSet => {
                            dataSet.data.forEach(point => {
                                if (point.x > maxValue) {
                                    maxValue = point.x;
                                }
                            })
                        })
                        console.log(maxValue)
                        return maxValue;
                    },*/
                    ticks: {
                        callback: (value) => {
                            return Math.round(value)
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

    componentDidMount = () => {
        this.props.setChartInstance(this.getChart)
        Chart.register(zoomPlugin);
        Chart.register(dragdataPlugin);
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            (prevProps.selectedDroneId !== this.props.selectedDroneId) ||
            (prevProps.selectedRouteDirection !== this.props.selectedRouteDirection)
        ) {
            this.chartRef.current && this.chartRef.current.resetZoom();

            //get NavPlan DTM if needed
            if (
                this.props.selectedDroneId !== config.ALL
            ) {
                this.setState({navPlanPolylinePoints: null}, () => this.getNavPlanDTMPoints())
            }
        }
    }

    onDragHandler(e, datasetIndex, index, value) {
        if (this.props.selectedDroneId === config.ALL) return false;

    }

    async getNavPlanDTMPoints() {

        const {virtualPlayerToNavPlansMap, navPlansToWaypointsMap, selectedRouteDirection, selectedDroneId} = this.props;
        const navPlanArr = virtualPlayerToNavPlansMap[selectedDroneId];

        const navPlan = this.getNavPlanByDirection(navPlanArr, selectedRouteDirection);
        const navPlanPolylinePoints = await Globals.g.map.getHeightsAlongLine(geo.serializer.deserializePosition(navPlan.appX.base.position, 0));
        this.setState({
            navPlanPolylinePoints
        })
    }

    getChart = () => {
        return this.chartRef;
    }

    getCoordinate(position) {
        const [x,y,z] = position.geometry.coordinates;
        return new geo.coordinate(x,y,z);
    }

    getNavPlanByDirection(navPlanArr, selectedRouteDirection) {
        if (selectedRouteDirection === routeOptions.patrol) {
            return navPlanArr.find(nav => nav.direction === navDirectionMapper[selectedRouteDirection])
        }
        return navPlanArr.find(nav => nav.direction === navDirectionMapper[selectedRouteDirection])
    }

    getNavPlanWaypoints(navPlanArr, selectedRouteDirection, navPlansToWaypointsMap) {
        if (selectedRouteDirection === routeOptions.forwardBack) {

            const navPlanForward = navPlanArr.find(nav => nav.direction === navDirectionMapper[routeOptions.forward]);
            const navPlanPatrol =  navPlanArr.find(nav => nav.navPlanType === navDirectionMapper[routeOptions.patrol]);
            const navPlanBack = navPlanArr.find(nav => nav.direction === navDirectionMapper[routeOptions.back]);

            const forwardPointsArr = navPlanForward && navPlanForward._id && navPlansToWaypointsMap[navPlanForward._id] || [];
            const patrolPointsArr = navPlanPatrol && navPlanPatrol._id && navPlansToWaypointsMap[navPlanPatrol._id] || [];
            const backPointsArr = navPlanBack && navPlanBack._id && navPlansToWaypointsMap[navPlanBack._id] || [];

            const sortedForwardPoints = forwardPointsArr.sort((a,b) => a.index - b.index);
            const sortedPatrolPoints = patrolPointsArr.sort((a,b) => a.index - b.index);
            const sortedBackPoints = backPointsArr.sort((a,b) => a.index - b.index);

            return [
                ...sortedForwardPoints,
                ...sortedPatrolPoints,
                ...sortedBackPoints
            ]
        } else {
            // here we cover also the navPlanType === patrol since its has default navPlanDirection
            const navPlan = this.getNavPlanByDirection(navPlanArr, selectedRouteDirection);
            return navPlan && navPlan._id ? navPlansToWaypointsMap[navPlan._id].sort((a,b) => a.index - b.index) : []
        }
    }

    getNavPlanLinkedPlayerPosition(navPlanArr, selectedRouteDirection) {
        const direction = selectedRouteDirection === routeOptions.forwardBack ? routeOptions.forward : selectedRouteDirection;
        const navPlan = this.getNavPlanByDirection(navPlanArr, direction);

        if (navPlan && navPlan.linkedPlayerOrDestinationPoint && navPlan.linkedPlayerOrDestinationPoint._id) {
            const player = this.props.entsIdToEntsMap[navPlan.linkedPlayerOrDestinationPoint._id];
            if (player) {
                return geo.serializer.deserializePosition(player.appX.base.position, geo.returnTypeEnum.geoJson);
            }
        }

        return null;
    }

    getClosetsSegmentToPlayer = (playerPosition, prevPosition, position, i, vector) => {

        let closetsSegmentToPlayer = {afterWaypoint: null, diff: null}
        if (playerPosition) {
            const vectorFromPrevWaypointToPlayer = geo.geometricCalculations.vectorFromTwoLocations(this.getCoordinate(prevPosition), this.getCoordinate(playerPosition));
            const vectorFromPlayerToCurrentWaypoint = geo.geometricCalculations.vectorFromTwoLocations(this.getCoordinate(playerPosition), this.getCoordinate(position));

            const diffFromSegment = (vectorFromPrevWaypointToPlayer.distance + vectorFromPlayerToCurrentWaypoint.distance) - vector.distance;
            if (closetsSegmentToPlayer.afterWaypoint == null) {
                closetsSegmentToPlayer.afterWaypoint = i -1;
                closetsSegmentToPlayer.diff = diffFromSegment;
            } else if (diffFromSegment < closetsSegmentToPlayer.diff) {
                closetsSegmentToPlayer.afterWaypoint = i -1;
                closetsSegmentToPlayer.diff = diffFromSegment;
            }
        }
        return closetsSegmentToPlayer;
    }

    getNavPlanDTMDataSet = () => {
        const {navPlanPolylinePoints} = this.state;
        let totalNavPlanLength = 0;

        const navPlanDTMPoints = navPlanPolylinePoints.map((point, i) => {

            if (i !== 0) {
                const vector = geo.geometricCalculations.vectorFromTwoLocations(
                    new geo.coordinate(navPlanPolylinePoints[i-1].x / 100000, navPlanPolylinePoints[i-1].y / 100000, navPlanPolylinePoints[i-1].z),
                    new geo.coordinate(point.x / 100000, point.y / 100000, point.z / 100000)
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
            label: '',
            data: navPlanDTMPoints,
            borderColor: '#ff9c44',
            backgroundColor: '#8b572470',
            pointRadius: 0,
            fill: true,
            dragData: false
        }

        return dataset;
    }

    getNavPlanDataSet = vPlayerId => {

        const {virtualPlayerToNavPlansMap, navPlansToWaypointsMap, virtualPlayerToColorMap, selectedRouteDirection} = this.props;

        const navPlanArr = virtualPlayerToNavPlansMap[vPlayerId];

        const sortedWaypoints = this.getNavPlanWaypoints(navPlanArr, selectedRouteDirection, navPlansToWaypointsMap) || [];
        let totalNavPlanLength = 0;

        let closetsSegmentToPlayer = null
        const playerPosition = this.getNavPlanLinkedPlayerPosition(navPlanArr, selectedRouteDirection);

        const navPlanPoints = sortedWaypoints.map((waypoint, i) => {
            const position = geo.serializer.deserializePosition(waypoint.appX.base.position, geo.returnTypeEnum.geoJson);

            if (i !== 0) {
                const prevPosition = geo.serializer.deserializePosition(sortedWaypoints[i-1].appX.base.position, geo.returnTypeEnum.geoJson);
                const vector = geo.geometricCalculations.vectorFromTwoLocations(this.getCoordinate(prevPosition), this.getCoordinate(position));

                closetsSegmentToPlayer = this.getClosetsSegmentToPlayer(playerPosition, prevPosition, position, i, vector);
                totalNavPlanLength += vector.distance;
            }

            const point = {
                x: Math.round(totalNavPlanLength),
                y: waypoint.heightAMSL,
                waypoint
            }

            if (i === 0) {
                point.isFirst = true;
            } else if (i === sortedWaypoints.length -1) {
                point.isLast = true;
            }
            return point;
        })

        if (playerPosition && closetsSegmentToPlayer.afterWaypoint) {
            const i = closetsSegmentToPlayer.afterWaypoint;
            const playerPoint = {
                x: (navPlanPoints[i].x + navPlanPoints[i+1].x) / 2,
                y: (navPlanPoints[i].y + navPlanPoints[i+1].y) / 2,
                isPlayer: true
            }

            navPlanPoints.splice(i +1, 0,playerPoint);
        }

        const dataset = {
            label: '',
            data: navPlanPoints,
            borderColor: virtualPlayerToColorMap[vPlayerId],
            backgroundColor: virtualPlayerToColorMap[vPlayerId],
            pointStyle: function(param) {
                if (param.raw && param.raw.isFirst) {
                    return getNavPlanImage(imagePointTypes.start, virtualPlayerToColorMap[vPlayerId])
                } else if (param.raw && param.raw.isLast) {
                    return getNavPlanImage(imagePointTypes.end, virtualPlayerToColorMap[vPlayerId])
                } else if (param.raw && param.raw.isPlayer) {
                    return getNavPlanImage(imagePointTypes.drone, virtualPlayerToColorMap[vPlayerId])
                }
                return getNavPlanImage(imagePointTypes.regular, virtualPlayerToColorMap[vPlayerId])
            }
        }
        return dataset;
    }

    getChartData = () => {
        let data = {};
        let datasets = [];
        const {selectedDroneId, virtualPlayerToNavPlansMap} = this.props;

        if (this.props.selectedDroneId === config.ALL) {
            Object.keys(virtualPlayerToNavPlansMap).forEach((vPlayerId) => {
                datasets.push(this.getNavPlanDataSet(vPlayerId));
            })
        } else {
            datasets.push(this.getNavPlanDataSet(selectedDroneId));
            datasets.push(this.getNavPlanDTMDataSet(selectedDroneId));
        }

        data.datasets = datasets;
        return data;
    }

    render() {

        if (this.props.selectedDroneId !== config.ALL && !this.state.navPlanPolylinePoints) return null;
        const chartData = this.getChartData();

        return (
            <div className='route-editor-chart-wrapper'>
                    <Line
                        data={chartData}
                        options={this.options}
                        id='route-editor-canvas'
                        ref={this.chartRef}
                        redraw
                    />
            </div>
        )
    }
}