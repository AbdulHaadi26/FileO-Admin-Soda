import React from 'react';
import { Pie } from 'react-chartjs-2';
const dF = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
const dS = { marginTop: '12px' };

let colors = ['#40739e', '#e1b12c', '#CB4335', '#28B463'];
let hover = ['#487eb0', '#fbc531', '#E74C3C', '#2ECC71'];

export default ({ options, count }) => {
    let labels = [], dataIn = [], backgroundColor = [], hoverBg = [];
    let total = 0;

    count.map(i => {
        total = total + i;
        return i;
    });

    options.map((i, k) => {
        if (i && k <= 3) {
            let per = ((count[k] * 100) / total).toFixed(2)
            labels.push(i);
            dataIn.push(per);
            backgroundColor.push(colors[k])
            hoverBg.push(hover[k])
        }
        return i;
    });

    var data = {
        labels: labels,
        datasets: [{ data: dataIn, backgroundColor: backgroundColor, hoverBackgroundColor: hoverBg }],
    };

    return labels.length && dataIn.length && backgroundColor.length && hoverBg && total ? <div className="col-12 p-0" style={dF}>
        <div className="col-lg-6 col-12 p-0" style={dS}>
            <Pie data={data} />
        </div>
    </div> : <></>
};