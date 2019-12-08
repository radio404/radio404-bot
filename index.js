require('dotenv').config();
const axios = require('axios');


let currentTrackId;

function UpdateCurrentTrack(){
    axios.get(process.env.RK_CURRENT_TRACK_URL)
        .then(response=>{
            let delay = 30000
            try {
                const data = response.data,
                    next_track = new Date(response.data.next_track),
                    next_track_delay = next_track.getTime() - Date.now();

                delay = Math.max(process.env.RK_TIMEOUT_MIN || 5000, next_track_delay + parseInt(process.env.RK_TIMEOUT_OFFSET || 10000));
                if (data.id !== currentTrackId) {
                    LogCurrentTrack(data)
                }
            }catch(err){
                console.log(err);
            }
            setTimeout(UpdateCurrentTrack,delay);
        })
}

async function getWpToken(){
    return await axios.post(process.env.WP_AUTH_URL,{
        'username':process.env.WP_USERNAME,
        'password':process.env.WP_PASSWORD
    },{
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }).then(response=>{
        const {token} = response.data;
        return token;
    });
}

async function LogCurrentTrack(data){
    const token = await getWpToken();
    //console.log(data);
    return await axios.post(process.env.WP_RK_LOG_TRACK_URL,data,{
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }).then(response=>{
        console.log(response.data);
    }).catch(err=>{
        console.log(`${err.message} -- ${process.env.WP_RK_LOG_TRACK_URL}`);
    })
}

UpdateCurrentTrack();
