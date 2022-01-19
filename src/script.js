/** @type {HTMLCanvasElement} */
let CANVAS
/** @type {CanvasRenderingContext2D} */ 
let CTX 
let VIDEO, TRACKS, ID
const COLOR = [0, 60, 215]
const THRESHOLD = 60

function main() {   
    CANVAS = document.getElementById("canvas")
    CTX = CANVAS.getContext("2d")
    const startBT = document.getElementById("btn_start")
    const stopBT = document.getElementById("btn_stop")

    startBT.onclick = () => {
        navigator.mediaDevices.getUserMedia({video: true})
            .then( stream => {
                TRACKS = stream.getTracks()
                VIDEO = document.createElement("video")
                VIDEO.srcObject = stream
                VIDEO.play()
                VIDEO.onloadeddata = AnimateTorchEffect
            })
            .catch((err)=> {
                console.error(err)
                alert("Error: " + err)
            })
    }
    stopBT.onclick = () => {
        TRACKS.forEach(track => track.stop() )
        cancelAnimationFrame(ID)
        CTX.clearRect(0, 0, CANVAS.width, CANVAS.height)
    }
}

function AnimateTorchEffect() {
    CANVAS.width = VIDEO.videoWidth
    CANVAS.height = VIDEO.videoHeight

    CTX.drawImage(VIDEO, 0, 0, CANVAS.width, CANVAS.height)

    const locations = []
    const {data} = CTX.getImageData(0, 0, CANVAS.width, CANVAS.height)
    // console.log("First Pixel: ", data[0], data[1], data[2], data[3])

    for (let i = 0; i < data.length; i+=4) {
        const R = data[i]
        const G = data[i+1]
        const B = data[i+2]
        // const A = data[i+3]

        if(Distance([R,G,B], COLOR) < THRESHOLD) {
            const x = (i/4)%CANVAS.width
            const y = Math.floor( (i/4)/CANVAS.width )

            locations.push({x, y})
        }
    }
    // console.log(locations.length)

    if(locations.length > 0) {
        let centerX = 0, centerY = 0

        for (locs of locations) {
            centerX += locs.x
            centerY += locs.y
        }
        
        centerX /=locations.length
        centerY /=locations.length
        centerX+= Math.random() * centerX*0.08
        const rad = Math.sqrt(CANVAS.width**2 + CANVAS.height**2)

        const grad = CTX.createRadialGradient(
            centerX, centerY, 0, 
            centerX, centerY, rad*0.2
        )
        grad.addColorStop(0, "rgba(0, 0, 0, 0)")
        grad.addColorStop(1, "rgba(0, 0, 0, 0.8)")

        CTX.fillStyle = grad
        CTX.beginPath()
        CTX.arc(centerX, centerY, rad, 0, Math.PI*2)
        CTX.fill()
        // CTX.closePath()

    }else {
        CTX.fillStyle = "rgba(0, 0, 0, 0.8)"
        CTX.fillRect(0, 0, CANVAS.width, CANVAS.height)
    }

    ID = requestAnimationFrame(AnimateTorchEffect)
}

function Distance(v1, v2) {
    return Math.sqrt( 
        (v1[0]-v2[0])**2 + 
        (v1[1]-v2[1])**2 + 
        (v1[2]-v2[2])**2
    )
}