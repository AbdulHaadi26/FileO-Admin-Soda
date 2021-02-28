import PDF from '../../assets/static/pdf.svg';
import WORD from '../../assets/static/word.svg';
import EXCEL from '../../assets/static/excel.svg';
import VIDEO from '../../assets/static/video.svg';
import PP from '../../assets/static/powerpoint.svg';
import IMAGE from '../../assets/static/image.svg';
import AUDIO from '../../assets/static/audio.svg';
import WARNING from '../../assets/static/warning.svg';

export default type => {
    switch (type) {
        case 'pdf': return PDF;
        case 'word': return WORD;
        case 'excel': return EXCEL;
        case 'video': return VIDEO;
        case 'power point': return PP;
        case 'image': return IMAGE;
        case 'audio': return AUDIO;
        default: return WARNING;
    }
}

export const finalizeType = type => {
    switch (type) {
        case 'pdf': return 'pdf';
        case 'docx': case 'doc': case 'docm': return 'word';
        case 'xls': case 'xlsm': case 'xlsx': return 'excel';
        case 'mp4': case 'MP4': return 'video';
        case 'mp3': case 'MP3': return 'audio';
        case 'ppt': case 'pptx': case 'pptm': return 'power point';
        case 'gif': case 'png': case 'jpg': case 'jpeg': case 'svg': return 'image';
        default: return 'others';
    }
}

export const returnSelectT = () => ['All', 'Pdf', 'Word', 'Excel', 'Power Point', 'Video', 'Image', 'Audio'];