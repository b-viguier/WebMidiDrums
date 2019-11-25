Object.defineProperty(Vue.prototype, 'WebMidi', { value: WebMidi });

var app = new Vue({
    el: '#webmididrums',
    props: {
    },
    data:  {
        errorMessage: null,
        selectedMidiInputId: null,
        midiInput: null,
        selectedMidiOutputId: null,
        midiOutput: null,
        hiHatClosed: true
    },
    created: function () {

        WebMidi.enable((errorMessage) => {

            if (errorMessage) {
                this.errorMessage = '' + errorMessage;
                console.log(errorMessage);
                return;
            }

            if(WebMidi.inputs.length) {
                this.selectedMidiInputId = WebMidi.inputs[0].id;
            }
            if(WebMidi.outputs.length) {
                this.selectedMidiOutputId = WebMidi.outputs[0].id;
            }
        });
    },
    watch: {
        selectedMidiInputId(newMidiInputId) {
            if(this.midiInput) {
                this.midiInput.removeListener();
            }
            this.midiInput = WebMidi.getInputById(newMidiInputId);
            this.updateForwarding();
        },
        selectedMidiOutputId(newMidiOutputId) {
            this.midiOutput = WebMidi.getOutputById(newMidiOutputId);
            this.updateForwarding();
        }
    },
    computed: {
    },
    methods: {
        updateForwarding() {
            if(this.midiInput && this.midiOutput) {
                this.midiInput.removeListener();
                this.midiInput.addListener('midimessage', 'all', (event) => {
                    // Note On / Channel 10
                    if(event.data[0] !== 153) {
                        return;
                    }

                    switch(event.data[1]) {
                        case 36:    // Bass Drum
                            break;
                        case 38:    // Snare
                            this.$refs.redPadAnim.beginElement();
                            break;
                        case 46:    // HiHat
                            if(this.hiHatClosed) {
                                event.data[1] = 44;
                            }
                            break;
                        case 48:    // Tom1
                            this.$refs.bluePadAnim.beginElement();
                            break;
                        case 45:    // Tom2
                            this.$refs.greenPadAnim.beginElement();
                            break;
                        case 49:    // Cymbal
                            break;
                    }

                    this.midiOutput.send(event.data[0], Array.from(event.data.slice(1)));
                });
            }
        }
    }
});