import React from 'react';
import { Pie } from 'react-chartjs-2';
const mT = { width:'80%', marginTop:'30px' };
export default ({ data }) =>  <div style={mT}>
        < Pie data={data} />
    </div>
