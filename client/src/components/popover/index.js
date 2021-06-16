import React from 'react';
import { docsUrl } from '../../utils/api';
import './style.css';

export default ({ sty, url, text,z }) => <div className="fa-L" style={sty}>
    <span className={`pop-up ${z ? 'z-ult' : ''}`}> {text} {url && <span>For more details click <a href={`${docsUrl}${url}`} rel="noopener noreferrer" target="_blank">here</a></span>} </span>
</div>