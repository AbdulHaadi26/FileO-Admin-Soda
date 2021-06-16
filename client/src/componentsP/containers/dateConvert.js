export default date => {
    //var serverDate = date;
    //var dt = new Date(Date.parse(serverDate));
    //var hours = dt.getHours();
    //var minutes = dt.getMinutes();
    //var ampm = hours >= 12 ? 'pm' : 'am';
    //hours = hours % 12;
    //hours = hours ? hours : 12;
    //minutes = minutes < 10 ? '0' + minutes : minutes;
    //var checkDate = new Date(Date.now());
    //checkDate.setDate(checkDate.getDate() - 1);
    var strTime = `${date.slice(0, 10)}`;
    return strTime;
}