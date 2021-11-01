import React, { Component } from 'react'
import {dronesColor} from './RouteEditor';
import { Scatter as Line, Chart } from 'react-chartjs-2';
import zoomPlugin from "chartjs-plugin-zoom";
import dragdataPlugin from "chartjs-plugin-dragdata";
//import point from './assets/point-no-shadow.svg';

const img = new Image();
img.src = `data:image/svg+xml;utf8,<svg width="20px" height="21px" viewBox="0 0 20 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">    
<g id="Route-Editor" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
    <g id="0" transform="translate(-1688.000000, -208.000000)">
        <g id="Point-for-graph-No-Shadow" transform="translate(1688.000000, 208.169678)">
            <path d="M9.8630137,1.23287671 C14.6293067,1.23287671 18.4931507,5.09672065 18.4931507,9.8630137 C18.4931507,14.6293067 14.6293067,18.4931507 9.8630137,18.4931507 C5.09672065,18.4931507 1.23287671,14.6293067 1.23287671,9.8630137 C1.23287671,5.09672065 5.09672065,1.23287671 9.8630137,1.23287671 Z" id="Path" fill="rgba(0,0,0,0.5)"/>
            <path fill="%2343BEF4" d="M10,0 C15.5228475,0 20,4.4771525 20,10 C20,15.5228475 15.5228475,20 10,20 C4.4771525,20 0,15.5228475 0,10 C0,4.4771525 4.4771525,0 10,0 Z M10,1.36986301 C5.23370695,1.36986301 1.36986301,5.23370695 1.36986301,10 C1.36986301,14.766293 5.23370695,18.630137 10,18.630137 C14.766293,18.630137 18.630137,14.766293 18.630137,10 C18.630137,5.23370695 14.766293,1.36986301 10,1.36986301 Z M10,7.80821918 C11.2104871,7.80821918 12.1917808,8.78951288 12.1917808,10 C12.1917808,11.2104871 11.2104871,12.1917808 10,12.1917808 C8.78951288,12.1917808 7.80821918,11.2104871 7.80821918,10 C7.80821918,8.78951288 8.78951288,7.80821918 10,7.80821918 Z" id="Shape"/>
        </g>
    </g>
</g>
</svg>`;

function getImageSrc(color) {
  const escapedColor = encodeURIComponent(color);
  return `data:image/svg+xml;utf8,<svg width="20px" height="21px" viewBox="0 0 20 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">    
  <g id="Route-Editor" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g id="0" transform="translate(-1688.000000, -208.000000)">
          <g id="Point-for-graph-No-Shadow" transform="translate(1688.000000, 208.169678)">
              <path d="M9.8630137,1.23287671 C14.6293067,1.23287671 18.4931507,5.09672065 18.4931507,9.8630137 C18.4931507,14.6293067 14.6293067,18.4931507 9.8630137,18.4931507 C5.09672065,18.4931507 1.23287671,14.6293067 1.23287671,9.8630137 C1.23287671,5.09672065 5.09672065,1.23287671 9.8630137,1.23287671 Z" id="Path" fill="rgba(0,0,0,0.5)"/>
              <path fill="${escapedColor}" d="M10,0 C15.5228475,0 20,4.4771525 20,10 C20,15.5228475 15.5228475,20 10,20 C4.4771525,20 0,15.5228475 0,10 C0,4.4771525 4.4771525,0 10,0 Z M10,1.36986301 C5.23370695,1.36986301 1.36986301,5.23370695 1.36986301,10 C1.36986301,14.766293 5.23370695,18.630137 10,18.630137 C14.766293,18.630137 18.630137,14.766293 18.630137,10 C18.630137,5.23370695 14.766293,1.36986301 10,1.36986301 Z M10,7.80821918 C11.2104871,7.80821918 12.1917808,8.78951288 12.1917808,10 C12.1917808,11.2104871 11.2104871,12.1917808 10,12.1917808 C8.78951288,12.1917808 7.80821918,11.2104871 7.80821918,10 C7.80821918,8.78951288 8.78951288,7.80821918 10,7.80821918 Z" id="Shape"/>
          </g>
      </g>
  </g>
  </svg>`;
}

function getImage(id) {  
  img.src = getImageSrc(dronesColor[id]);
  return img
}

/*img.src = point;*/

const data = {
    //labels: ['1', '2', '3', '4', '5', '6'],
    datasets: [
      {
        label: '# of Votes',
        data: [{x: 0, y: 90}, {x: 5, y: 120}, {x: 10, y: 120}, {x: 15, y: 120}, {x: 20, y: 120}, {x: 25, y: 120}, {x: 30, y: 120}],
        borderColor: '#43BEF4',
        backgroundColor: '#43BEF4',
        pointStyle: img,
      },
      {
        label: '# of Votes',
        data: [{x: 0, y: 30}, {x: 5, y: 95}, {x: 10, y: 59}, {x: 15, y: 44}, {x: 20, y: 150}, {x: 25, y: 130}, {x: 30, y: 88}],
        borderColor: 'pink',
        backgroundColor: 'pink',
        pointStyle: function(param) {
          return getImage(2)
        },
      },
    ],    
  };
  
  const options = {
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
      const a = Chart;
    }

    render() {
        return (
            <div className='route-editor-chart-wrapper'>                
                    <Line data={data} options={options} id='route-editor-canvas'/>
            </div>
        )
    }
}
