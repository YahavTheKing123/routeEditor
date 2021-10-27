import React, { Component } from 'react'
import { Line, Chart } from 'react-chartjs-2';
import zoomPlugin from "chartjs-plugin-zoom";
import dragdataPlugin from "chartjs-plugin-dragdata";
import point from './assets/point-no-shadow.svg';

const img = new Image();
img.src = point

const data = {
    labels: ['1', '2', '3', '4', '5', '6'],
    datasets: [
      {
        label: '# of Votes',        
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 2.5,
        fill: false,
        borderColor: '#43BEF4',
        backgroundColor: 'red',
        pointStyle: img,
        pointRadius: 10,
      },
    ],
  };
  
  const options = {
    /*responsive: true,*/
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
              speed: 100
            },
            pan: {
              enabled: false,
              mode: "xy",
              speed: 100
            }
        },
        dragData: {
            round: 1,
            showTooltip: true,
            onDragStart: function(e, datasetIndex, index, value) {
              // console.log(e)
            },
            onDrag: function(e, datasetIndex, index, value) {              
              e.target.style.cursor = 'grabbing'
              // console.log(e, datasetIndex, index, value)
            },
            onDragEnd: function(e, datasetIndex, index, value) {
              e.target.style.cursor = 'default' 
              // console.log(datasetIndex, index, value)
            },
        }      
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'rgba(255,255,255,0.7)',
          font: {
            size: 12,
            weight: 'lighter',            
          },
        },
        grid: {
          drawBorder: false,       
          color: function (ctx) {            
            if (ctx.index === 0) return '#7C838F';
            return '#525761'
          },             
        }
      },
      x: {
        beginAtZero: true,
        ticks: {
          color: 'rgba(255,255,255,0.7)',
          font: {
            size: 12,
            weight: 'lighter'
          },
        },
        grid: {            
            color: function (ctx) {
              if (ctx.index === 0) return '#7C838F';
              return '#525761'
            }, 
        }
      },
    },   
  };
    
export default class RouteChart extends Component {

    componentDidMount = () => {

      Chart.register(zoomPlugin);
      Chart.register(dragdataPlugin);
    //   Chart.register({
    //     id: 'dropShadow',
    //     afterDraw: function (chart, easing) {
    //       console.log(chart);          
    //       let originial = this;
    //       const { ctx } = chart;
    //       let originalStroke = ctx.stroke;
    //       ctx.stroke = function () {
    //         ctx.save();
    //         ctx.shadowColor = '#012633';
    //         ctx.shadowBlur = 3;
    //         ctx.shadowOffsetX = 0;
    //         ctx.shadowOffsetY = 0;
    //         originalStroke.apply(this, arguments)
    //         ctx.restore();
    //       }
    //     }
    //   });
      /*Chart.register({
        id: 'drawMaxHeightLine',
        afterDraw: (chart) => {
            // eslint-disable-next-line no-underscore-dangle
            if (chart.tooltip._active && chart.tooltip._active.length) {
              // find coordinates of tooltip
              const activePoint = chart.tooltip._active[0];
              const { ctx } = chart;
              const { x } = activePoint.element;
              const topY = chart.scales.y.top;
              const bottomY = chart.scales.y.bottom;
    
              // draw vertical line
              ctx.save();
              ctx.beginPath();
              ctx.moveTo(x, topY);
              ctx.lineTo(x, bottomY);
              ctx.lineWidth = 1;
              ctx.strokeStyle = '#1C2128';
              ctx.stroke();
              ctx.restore();
            }
          },
      })*/
    //   Chart.helpers.extend(Chart.elements.Line.prototype, {
    //     draw () {
          
      
    //           console.log(this)
      
    //       const { ctx } = this._chart
      
    //       const originalStroke = ctx.stroke
      
    //       ctx.stroke = function () {
    //         ctx.save()
    //         ctx.shadowColor = 'red'
    //         ctx.shadowBlur = 0
    //         ctx.shadowOffsetX = 0
    //         ctx.shadowOffsetY = 8
    //         originalStroke.apply(this, arguments)
    //         ctx.restore()
    //       }
          
    //       Chart.elements.Line.prototype.draw.apply(this, arguments)
          
    //       ctx.stroke = originalStroke;
    //     }
    //   })
      
      /*Chart.defaults.ShadowLine = Chart.defaults.line
      Chart.controllers.ShadowLine = Chart.controllers.line.extend({
        datasetElementType: ShadowLineElement
      })
      const a = Chart
      debugger
    let draw = Chart.controllers.line.prototype.draw;   
    Chart.controllers.line.prototype.draw = function() {
      draw.apply(this, arguments);
      let ctx = this.chart.chart.ctx;
      let _stroke = ctx.stroke;
      ctx.stroke = function() {
          ctx.save();
          ctx.shadowColor = '#6ece87';
          ctx.shadowBlur = 5;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 4;
          _stroke.apply(this, arguments);
          ctx.restore();
      };
    };*/
      
    }

    render() {
        return (
            <div className='route-editor-chart-wrapper'>                
                    <Line data={data} options={options} id='route-editor-canvas'/>
            </div>
        )
    }
}
