import React from 'react';
import Rocket from '../../../assets/project-icons/the-rocket.svg';
import Airline from '../../../assets/project-icons/airline.svg';
import Badge from '../../../assets/project-icons/badge.svg';
import Bank from '../../../assets/project-icons/bank.svg';
import Book from '../../../assets/project-icons/book.svg';
import Chip from '../../../assets/project-icons/chip.svg';
import Factory from '../../../assets/project-icons/factory.svg';
import Finance from '../../../assets/project-icons/finance.svg';
import Government from '../../../assets/project-icons/government.svg';
import Hospital from '../../../assets/project-icons/hospital.svg';
import MegaPhone from '../../../assets/project-icons/megaphone.svg';
import Movies from '../../../assets/project-icons/movies.svg';
import Pills from '../../../assets/project-icons/pills.svg';
import Sales from '../../../assets/project-icons/sales.svg';
import Sports from '../../../assets/project-icons/sports.svg';
import './style.css';

let list = [
    { img: Rocket, text: 'Default' }, { img: Airline, text: 'Airlines' },
    { img: Badge, text: 'NGO' }, { img: Bank, text: 'Bank' }, { img: Book, text: 'Education' },
    { img: Chip, text: 'Technical' }, { img: Factory, text: 'Manufacturing' }, { img: Finance, text: 'Finance' },
    { img: Government, text: 'Government' }, { img: Hospital, text: 'Hospital' },
    { img: MegaPhone, text: 'Marketing' }, { img: Movies, text: 'Entertainment' }, { img: Pills, text: 'Pharmaceuticals' },
    { img: Sales, text: 'Sales' }, { img: Sports, text: 'Sports' }
];

export default ({ i, setI }) => {
    return <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
        {list.map((Item, k) => {
            return <div className={`icons ${i === k ? 'icons-a' : ''}`} key={k} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }} onClick={e => setI(k)}>
                <img src={Item.img} alt={Item.text} style={{ width: '36px' }} />
                <h6 style={{ fontSize: '10px', textAlign: 'center', marginTop: '8px', width: '50px', wordBreak: 'break-all' }}>{Item.text}</h6>
            </div>
        })}
    </div>
};