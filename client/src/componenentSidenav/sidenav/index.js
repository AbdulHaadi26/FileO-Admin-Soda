import React, { useState } from 'react';
import Chat from '../../assetsFreenav/chat.svg';
import Call from '../../assetsFreenav/phone-call.svg';
import Rocket from '../../assetsFreenav/rocket.svg';
import './style.css';

const Sidenav = () => {
    const [type, setType] = useState('');

    return <div className="right-nav">
        <div className="active" onClick={e => setType('Chat')}>
            <img src={Chat} alt="Chat"></img>
        </div>
        <div className="active" onClick={e => setType('Call')}>
            <img src={Call} alt="Call"></img>
        </div>
        <div className="active"  onClick={e => setType('Rocket')}>
            <img src={Rocket} alt="Rocket"></img>
        </div>
    </div>
};

export default Sidenav;