import React from 'react';
import { Pie } from 'react-chartjs-2';
const dF = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
const mT = { marginTop: '50px' };
export default ({ data }) => <div className="col-12 p-0" style={dF}>
    <div className="col-lg-8 col-12 p-0" style={mT}>
        < Pie data={data} />
    </div>
</div>
