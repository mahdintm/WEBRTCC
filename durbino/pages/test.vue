<template>
  <div>
    <div v-for="(participant, index) in participants" :key="index">
      <video
        ref="videoElement"
        :srcObject="participant.stream"
        autoplay
      ></video>
    </div>
    <button @click="toggleScreenSharing">
      {{ isScreenSharing ? 'Stop screen sharing' : 'Start screen sharing' }}
    </button>
    <button @click="toggleAdvancedSettings">
      {{
        showAdvancedSettings
          ? 'Hide advanced settings'
          : 'Show advanced settings'
      }}
    </button>
    <div v-if="showAdvancedSettings">
      <h4>Camera settings:</h4>
      <label>
        Resolution:
        <select v-model="cameraResolution">
          <option v-for="resolution in availableCameraResolutions">
            {{ resolution.width }}x{{ resolution.height }}
          </option>
        </select>
      </label>
      <label>
        Frame rate:
        <select v-model="cameraFrameRate">
          <option v-for="frameRate in availableCameraFrameRates">
            {{ frameRate }} fps
          </option>
        </select>
      </label>
      <h4>Audio settings:</h4>
      <label>
        Volume:
        <input type="range" v-model="audioVolume" min="0" max="1" step="0.1" />
      </label>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      participants: [],
      isScreenSharing: false,
      showAdvancedSettings: false,
      cameraResolution: null,
      cameraFrameRate: null,
      availableCameraResolutions: [],
      availableCameraFrameRates: [],
      audioVolume: 1,
    }
  },

  mounted() {
    this.initMediaStream()
  },

  beforeDestroy() {
    this.stopMediaStream()
  },

  methods: {
    async initMediaStream() {
      try {
        const constraints = {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 30 },
          },
          audio: true,
        }
        this.stream = await navigator.mediaDevices.getUserMedia(constraints)
        this.$refs.localVideo.srcObject = this.stream

        // Get available camera resolutions and frame rates
        const videoTrack = this.stream.getVideoTracks()[0]
        const capabilities = videoTrack.getCapabilities()
        this.availableCameraResolutions = capabilities.width.map(
          (width, index) => ({
            width,
            height: capabilities.height[index],
          })
        )
        this.cameraResolution = `${constraints.video.width.ideal}x${constraints.video.height.ideal}`
        this.availableCameraFrameRates = capabilities.frameRate
        this.cameraFrameRate = constraints.video.frameRate.ideal
      } catch (error) {
        console.error(`Error initializing media stream: ${error}`)
      }
    },

    stopMediaStream() {
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop())
      }
    },

    async addParticipant(participantId, offer) {
      const peerConnection = new RTCPeerConnection()
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.sendIceCandidate(participantId, event.candidate)
        }
      }
      peerConnection.ontrack = (event) => {
        const participant = this.participants.find(
          (p) => p.id === participantId
        )
        participant.stream = event.streams[0]
      }

      await peerConnection.setRemoteDescription(offer)
      const answer = await peerConnection.createAnswer()
      //   await peerConnection.setLocal
      await peerConnection.setLocalDescription(answer)

      this.sendAnswer(participantId, answer)

      const stream = this.stream.clone()
      stream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, stream))

      this.participants.push({ id: participantId, peerConnection, stream })
    },

    async handleOffer(participantId, offer) {
      try {
        const peerConnection = new RTCPeerConnection()
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            this.sendIceCandidate(participantId, event.candidate)
          }
        }
        peerConnection.ontrack = (event) => {
          const participant = this.participants.find(
            (p) => p.id === participantId
          )
          participant.stream = event.streams[0]
        }

        const stream = this.stream.clone()
        stream
          .getTracks()
          .forEach((track) => peerConnection.addTrack(track, stream))

        await peerConnection.setRemoteDescription(offer)

        const answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)

        this.sendAnswer(participantId, answer)

        this.participants.push({ id: participantId, peerConnection, stream })
      } catch (error) {
        console.error(`Error handling offer: ${error}`)
      }
    },

    async handleAnswer(participantId, answer) {
      try {
        const participant = this.participants.find(
          (p) => p.id === participantId
        )
        await participant.peerConnection.setRemoteDescription(answer)
      } catch (error) {
        console.error(`Error handling answer: ${error}`)
      }
    },

    async handleIceCandidate(participantId, iceCandidate) {
      try {
        const participant = this.participants.find(
          (p) => p.id === participantId
        )
        await participant.peerConnection.addIceCandidate(iceCandidate)
      } catch (error) {
        console.error(`Error handling ICE candidate: ${error}`)
      }
    },

    sendOffer(participantId, offer) {
      // Send offer to server or peer
    },

    sendAnswer(participantId, answer) {
      // Send answer to server or peer
    },

    sendIceCandidate(participantId, iceCandidate) {
      // Send ICE candidate to server or peer
    },

    toggleScreenSharing() {
      if (this.isScreenSharing) {
        this.stopScreenSharing()
      } else {
        this.startScreenSharing()
      }
      this.isScreenSharing = !this.isScreenSharing
    },

    async startScreenSharing() {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })
        screenStream.getTracks().forEach((track) => {
          this.participants.forEach((participant) =>
            participant.peerConnection.addTrack(track, screenStream)
          )
        })
      } catch (error) {
        console.error(`Error starting screen sharing: ${error}`)
      }
    },

    stopScreenSharing() {
      const screenTracks = this.participants[0].stream
        .getTracks()
        .filter((track) => track.kind === 'video' && track.label === 'screen')
      screenTracks.forEach((track) => {
        this.participants.forEach((participant) => {
          const sender = participant.peerConnection
            .getSenders()
            .find((s) => s.track === track)
          if (sender) {
            participant.peerConnection.removeTrack(sender)
          }
        })
        track.stop()
      })
    },

    toggleAdvancedSettings() {
      this.showAdvancedSettings = !this.showAdvancedSettings
    },
  },
}
</script>
