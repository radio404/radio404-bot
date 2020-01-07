require('dotenv').config();
const axios = require('axios');
const DEFAULT_UPDATE_DELAY = process.env.DEFAULT_UPDATE_DELAY || 30000;

let currentTrackId;

function Log(message){
    const date = new Date();
    console.log(`${date.toISOString()} | ${message}`);
}

function UpdateCurrentTrack(){
    return axios.get(process.env.RK_CURRENT_TRACK_URL)
        .then(response=>{
            let delay = DEFAULT_UPDATE_DELAY
            try {
                const data = response.data,
                    next_track = new Date(response.data.next_track),
                    next_track_delay = next_track.getTime() - Date.now();

                delay = Math.max(process.env.RK_TIMEOUT_MIN || 5000, next_track_delay + parseInt(process.env.RK_TIMEOUT_OFFSET || 10000));
                if (data.id !== currentTrackId) {
                    currentTrackId = data.id;
                    LogCurrentTrack(data)
                }
            }catch(err){
                Log(`Fail to log current track. ${err.message}`);
            }
            setTimeout(UpdateCurrentTrack,delay);
        }).catch(err=>{
            Log(`Fail to get current track info. ${err.message}`);
            setTimeout(UpdateCurrentTrack,DEFAULT_UPDATE_DELAY);
        })
}

async function LogCurrentTrack(data){
    data.passphrase = process.env.WP_RK_LOG_TRACK_PASSPHRASE;
    return await axios.post(process.env.WP_RK_LOG_TRACK_URL,data,{
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }).then(response=>{
        Log(`Log current track success. ${data.id} >> ${data.title} >> ${data.artist}`);
        return true;
    }).catch(err=>{
        Log(`Fail to log current track. ${err.message}`);
        return false;
    })
}

UpdateCurrentTrack();
Log('Service started.');
