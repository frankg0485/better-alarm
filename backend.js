import ytdl from 'react-native-ytdl';

export async function getSongURL(url) {
    const info = await ytdl.getInfo(url, { quality : 'highestaudio'});
    let audioFormats = await ytdl.filterFormats(info.formats, 'audio');
    audioFormats = await ytdl.filterFormats(audioFormats, format => format.container != 'webm');

    return audioFormats[0].url;
}