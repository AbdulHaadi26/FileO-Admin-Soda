import React from 'react';
import T1 from '../../../assets/note-icons/t1.svg';
import T2 from '../../../assets/note-icons/t2.svg';
import T3 from '../../../assets/note-icons/t6.svg';
import T4 from '../../../assets/note-icons/t4.svg';
import T5 from '../../../assets/note-icons/t5.svg';
import N1 from '../../../assets/note-icons/n1.svg';
import N2 from '../../../assets/note-icons/n2.svg';
import N3 from '../../../assets/note-icons/n3.svg';
import N4 from '../../../assets/note-icons/n4.svg';
import N5 from '../../../assets/note-icons/n5.svg';
import N6 from '../../../assets/note-icons/n6.svg';
import N7 from '../../../assets/note-icons/n7.svg';
import N8 from '../../../assets/note-icons/n8.svg';
import N9 from '../../../assets/note-icons/n9.svg';
import './style.css';

let listN = [N1, N2, N3, N4, N5, N6, N7, N8, N9];

let listT = [T1, T2, T3, T4, T5];

export default ({ i, setI, isTask }) => {
    return <div style={{ width: '100%', display: 'flex', flexDirection: 'row',  flexWrap: 'wrap', marginBottom: '20px' }}>
        {isTask ? listT.map((Item, k) => {
            return <div className={`icons ${i === k ? 'icons-a' : ''}`} key={k} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }} onClick={e => setI(k)}>
                <img src={Item} alt={'Task'} style={{ width: '36px' }} />
            </div>
        }) : listN.map((Item, k) => {
            return <div className={`icons ${i === k ? 'icons-a' : ''}`} key={k} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }} onClick={e => setI(k)}>
                <img src={Item} alt={'Note'} style={{ width: '36px', height:'36px' }} />
            </div>
        })}
    </div>
};