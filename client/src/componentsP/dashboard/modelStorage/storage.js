import React from 'react';
import { Pie } from 'react-chartjs-2';

export default ({ data_uploaded, combined_plan }) => {
    let data = { labels: ['Free Space', 'Used Space'], datasets: [{ data: [combined_plan ? combined_plan.toFixed(4) : 0, data_uploaded ? data_uploaded.toFixed(4) : 0], backgroundColor: ['#40739e', '#e1b12c'], hoverBackgroundColor: ['#487eb0', '#fbc531'] }] };
    return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={{ marginTop: '30px', marginBottom: '30px', width: '100%' }}>
            <Pie data={data} />
        </div>
    </div>
}