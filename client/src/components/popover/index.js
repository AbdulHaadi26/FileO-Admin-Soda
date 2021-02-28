import React from 'react';
import './style.css';

export default ({ sty, url, text }) => <div className="fa-L" style={sty}>
    <span className="pop-up"> {text} {url && <span>For more details click <a href={url} rel="noopener noreferrer" target="_blank">here</a></span>} </span>
</div>