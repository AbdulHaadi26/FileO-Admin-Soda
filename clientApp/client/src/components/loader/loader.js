import React from 'react';
import './style.css';

export default () => <div className="lo-w">
    <div className="bs">
        {[0, 1, 2, 3].map(i => <div className="b" key={i}>{['a', 'b', 'c', 'd'].map(j => <div key={j + i} />)}</div>)}
    </div>
</div>