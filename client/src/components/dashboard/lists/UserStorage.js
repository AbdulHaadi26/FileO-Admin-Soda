import React from 'react';
import { Pie } from 'react-chartjs-2';

export default ({ storageAvailable, storageUploaded }) => {
    var data = { labels: ['Free Space', 'Used Space'], datasets: [{ data: [storageAvailable ? storageAvailable.toFixed(4) : 0, storageUploaded ? storageUploaded.toFixed(4) : 0], backgroundColor: ['#40739e', '#e1b12c'], hoverBackgroundColor: ['#487eb0', '#fbc531'] }] };
    return <div className="col-12 p-0" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="col-lg-8 col-12 p-0" style={{ marginTop: '30px', marginBottom: '30px' }}>
            <Pie data={data} />
        </div>
    </div>
}