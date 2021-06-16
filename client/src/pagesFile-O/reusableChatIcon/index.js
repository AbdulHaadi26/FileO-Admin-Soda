import React from 'react';
import Whatsapp from '../../assetsFile-O/whatsapp.svg';
import './style.css';

export default () => {
    return <div className="whatsapp-chat">
        <img src={Whatsapp} onClick={e => window.open(`https://api.whatsapp.com/send?phone=+923475592033`)} alt="Whatsapp" style={{ width: '24px', height: '24px' }} />
    </div>

};