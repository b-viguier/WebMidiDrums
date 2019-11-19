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
        midiOutput: null
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
                    console.log(event.data);
                    if(event.data[0] == 153 && event.data[1] == 46) {
                        event.data[1] = 44;
                    }

                    var message = [];

                    event.data.slice(1).forEach(function(item){

                        var parsed = Math.floor(item); // mandatory because of "null"

                        if (parsed >= 0 && parsed <= 255) {
                            message.push(parsed);
                        } else {
                            throw new RangeError("WTF??");
                        }

                    });
                    this.midiOutput.send(event.data[0], message);
                });
            }
        }
    }
});